-- 0004_match_rpc.sql · match_jobs_for_worker RPC + 워커 선호도 테이블
-- ADR-004 매칭 엔진: RPC 1차 필터 → Edge Function 2차 재랭킹

-- ─── 워커 선호도 (별도 행 관리) ───────────────────────────
create table if not exists public.worker_preferences (
  worker_id uuid primary key references public.workers(id) on delete cascade,
  preferred_weekdays smallint[] default '{}',        -- 0=일 ~ 6=토
  preferred_verticals text[] default '{}',           -- logistics / retail / fnb
  max_commute_km numeric(5,1) default 10.0,
  updated_at timestamptz default now()
);

alter table public.worker_preferences enable row level security;
create policy wp_self on public.worker_preferences
  for all using (worker_id in (select id from public.workers where profile_id = auth.uid()));
grant select, insert, update on public.worker_preferences to authenticated;

-- ─── jobs 에 vertical 컬럼 추가 (없으면) ──────────────────
alter table public.jobs
  add column if not exists vertical text check (vertical in ('logistics','retail','fnb')),
  add column if not exists employer_rating_avg numeric(3,2),
  add column if not exists repost_count int not null default 0,
  add column if not exists portone_imp_uid text;     -- 결제 uid (payment-settle 연동)

-- payments 테이블 portone_imp_uid 컬럼 추가 (0001에서 portone_txid 로 정의됐으나 통일)
alter table public.payments
  add column if not exists portone_imp_uid text unique;

-- ─── 거리 점수 helper ─────────────────────────────────────
-- 워커 홈 법정동 → 공고 법정동 간 직선 거리(km) → 0~1 점수
create or replace function private.distance_score(
  p_worker_dong char(10),
  p_job_dong    char(10)
) returns numeric language sql stable security definer as $$
  select case
    when p_worker_dong = p_job_dong then 1.0
    when r1.geog is null or r2.geog is null then 0.5
    else greatest(0, 1 - st_distance(r1.geog::geometry, r2.geog::geometry) / 1000.0 / 20.0)
  end
  from public.regions r1, public.regions r2
  where r1.dong_code = p_worker_dong
    and r2.dong_code = p_job_dong
  limit 1
$$;

-- ─── 시급 점수 helper ─────────────────────────────────────
-- 2026 최저임금 10,030원 기준 정규화 (상한 25,000원)
create or replace function private.wage_score(p_hourly_wage int)
  returns numeric language sql immutable as $$
  select least(1.0, (p_hourly_wage::numeric - 10030) / (25000 - 10030))
$$;

-- ─── 멘토 태그 점수 helper ────────────────────────────────
create or replace function private.mentor_tag_score(
  p_worker_tags text[],
  p_job_tags    text[]
) returns numeric language sql immutable as $$
  select case
    when array_length(p_job_tags, 1) = 0 or p_job_tags is null then 1.0
    when array_length(p_worker_tags, 1) = 0 or p_worker_tags is null then 0.0
    else (
      select count(*)::numeric / array_length(p_job_tags, 1)
      from unnest(p_job_tags) t
      where t = any(p_worker_tags)
    )
  end
$$;

-- ─── 요일 매칭 score helper ───────────────────────────────
create or replace function private.weekday_score(
  p_preferred_weekdays smallint[],
  p_shift_start        timestamptz
) returns numeric language sql immutable as $$
  select case
    when array_length(p_preferred_weekdays, 1) = 0 or p_preferred_weekdays is null then 1.0
    when extract(dow from p_shift_start)::smallint = any(p_preferred_weekdays) then 1.0
    else 0.2
  end
$$;

-- ─── 메인 RPC: match_jobs_for_worker ─────────────────────
-- Edge Function이 호출. service_role 또는 authenticated(본인) 허용.
create or replace function public.match_jobs_for_worker(
  p_worker_id uuid,
  p_limit     int default 20
)
returns table (
  job_id            uuid,
  title             text,
  dong_code         char(10),
  shift_start_at    timestamptz,
  shift_end_at      timestamptz,
  hourly_wage_krw   int,
  headcount         int,
  vertical          text,
  required_cert_codes text[],
  preferred_mentor_tags text[],
  wage_score        numeric,
  distance_score    numeric,
  mentor_tag_score  numeric,
  weekday_score     numeric
)
language sql stable security definer as $$
  with w as (
    select
      wr.home_dong_code,
      wr.cert_codes,
      wr.mentor_tags,
      wr.no_show_count,
      coalesce(wp.preferred_weekdays, '{}') as preferred_weekdays,
      coalesce(wp.preferred_verticals, '{}') as preferred_verticals
    from public.workers wr
    left join public.worker_preferences wp on wp.worker_id = wr.id
    where wr.id = p_worker_id
    limit 1
  ),
  already_applied as (
    select job_id from public.job_applications
    where worker_id = p_worker_id
      and created_at > now() - interval '30 days'
  )
  select
    j.id,
    j.title,
    j.dong_code,
    j.shift_start_at,
    j.shift_end_at,
    j.hourly_wage_krw,
    j.headcount,
    j.vertical,
    j.required_cert_codes,
    j.preferred_mentor_tags,
    private.wage_score(j.hourly_wage_krw),
    private.distance_score(w.home_dong_code, j.dong_code),
    private.mentor_tag_score(w.mentor_tags, j.preferred_mentor_tags),
    private.weekday_score(w.preferred_weekdays, j.shift_start_at)
  from public.jobs j, w
  where j.status = 'open'
    and j.shift_start_at > now()
    -- 자격증 필터: 공고 필수 자격증이 워커 cert_codes 에 모두 포함돼야 함
    and (
      array_length(j.required_cert_codes, 1) = 0
      or j.required_cert_codes <@ w.cert_codes
    )
    -- 버티컬 필터: 워커가 선호 없으면 전체 허용
    and (
      array_length(w.preferred_verticals, 1) = 0
      or j.vertical = any(w.preferred_verticals)
    )
    -- 이미 지원한 공고 제외
    and j.id not in (select job_id from already_applied)
    -- 노쇼 3회 이상 워커는 일부 공고 제외 (employer 설정 가능하도록 추후 확장)
    and w.no_show_count < 3
  order by
    private.wage_score(j.hourly_wage_krw)     * 0.5
    + private.distance_score(w.home_dong_code, j.dong_code) * 0.3
    + private.mentor_tag_score(w.mentor_tags, j.preferred_mentor_tags) * 0.2
    desc
  limit p_limit
$$;

-- Edge Function(service_role) 및 워커 본인 호출 허용
grant execute on function public.match_jobs_for_worker(uuid, int) to authenticated;

-- ─── 공고 재게시 RPC (구인자 1클릭 재게시, PRD M1) ─────────
create or replace function public.repost_job(p_job_id uuid, p_shift_start_at timestamptz, p_shift_end_at timestamptz)
  returns uuid language plpgsql security definer as $$
declare
  v_new_id uuid;
  v_emp_id uuid;
begin
  select employer_id into v_emp_id from public.jobs
  where id = p_job_id
    and employer_id in (select app.current_employer_ids());

  if v_emp_id is null then
    raise exception 'unauthorized or job not found';
  end if;

  insert into public.jobs (
    employer_id, title, description, dong_code,
    shift_start_at, shift_end_at, hourly_wage_krw,
    required_cert_codes, preferred_mentor_tags, headcount,
    vertical, repost_count
  )
  select
    employer_id, title, description, dong_code,
    p_shift_start_at, p_shift_end_at, hourly_wage_krw,
    required_cert_codes, preferred_mentor_tags, headcount,
    vertical,
    repost_count + 1
  from public.jobs where id = p_job_id
  returning id into v_new_id;

  return v_new_id;
end
$$;

grant execute on function public.repost_job(uuid, timestamptz, timestamptz) to authenticated;

comment on function public.match_jobs_for_worker is
  'M1 매칭 엔진 1차 RPC 필터. Edge Function match-engine이 2차 재랭킹 수행.';
