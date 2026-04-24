-- 0005_match_rpc.sql · match_jobs_for_worker RPC (ADR-004)
-- · 1차 필터: status='open', 자격증 조건 충족, 동일 시군구 (dong_code 5자리 접두), 워커 기존 shift 와 시간 겹치지 않음
-- · 점수는 Deno 에지에서 재랭킹 (wage 0.5 · distance 0.3 · mentor_tag 0.2)
-- · LLM 미사용 (시니어 UX 레이턴시)

create or replace function public.match_jobs_for_worker(
  p_worker_id uuid,
  p_limit int default 20
)
returns table (
  id uuid,
  title text,
  dong_code char(10),
  shift_start_at timestamptz,
  shift_end_at timestamptz,
  hourly_wage_krw int,
  required_cert_codes text[],
  preferred_mentor_tags text[],
  headcount int,
  wage_score numeric,
  distance_score numeric,
  mentor_tag_score numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with w as (
    select
      home_dong_code,
      cert_codes,
      mentor_tags
    from public.workers
    where id = p_worker_id
    limit 1
  ),
  candidate as (
    select j.*
    from public.jobs j, w
    where j.status = 'open'
      and j.shift_start_at > now()
      -- 자격증: 워커가 가진 cert 가 job 요구사항을 포함 (빈 배열이면 통과)
      and (j.required_cert_codes <@ coalesce(w.cert_codes, '{}'::text[]))
      -- 지역: 동일 시군구 (dong_code 앞 5자리)
      and (
        w.home_dong_code is null
        or left(j.dong_code, 5) = left(w.home_dong_code, 5)
      )
      -- 이미 매칭된 공고의 시간과 겹치지 않음 (취소되지 않은 매칭)
      and not exists (
        select 1
        from public.matches m
        join public.jobs mj on mj.id = m.job_id
        where m.worker_id = p_worker_id
          and m.cancelled_at is null
          and tstzrange(mj.shift_start_at, mj.shift_end_at, '[)')
              && tstzrange(j.shift_start_at, j.shift_end_at, '[)')
      )
  )
  select
    c.id,
    c.title,
    c.dong_code,
    c.shift_start_at,
    c.shift_end_at,
    c.hourly_wage_krw,
    c.required_cert_codes,
    c.preferred_mentor_tags,
    c.headcount,
    -- wage_score: (시급 - 최저임금) / 5000 을 [0,1] 클램프
    least(1.0, greatest(0.0, (c.hourly_wage_krw - 10030)::numeric / 5000))::numeric as wage_score,
    -- distance_score: 동일 dong 1.0, 동일 sigungu 0.5
    case
      when w.home_dong_code = c.dong_code then 1.0
      when w.home_dong_code is not null and left(w.home_dong_code, 5) = left(c.dong_code, 5) then 0.5
      else 0.0
    end::numeric as distance_score,
    -- mentor_tag_score: 교집합 개수 / 3 (최대 1.0)
    least(
      1.0,
      coalesce(
        array_length(
          array(select unnest(c.preferred_mentor_tags) intersect select unnest(w.mentor_tags)),
          1
        ),
        0
      )::numeric / 3
    )::numeric as mentor_tag_score
  from candidate c, w
  order by c.shift_start_at asc
  limit p_limit;
$$;

comment on function public.match_jobs_for_worker is
  'ADR-004 매칭 1차 필터 + 점수. LLM 미사용. 2차 재랭킹은 Deno 에지에서 가중합.';

grant execute on function public.match_jobs_for_worker(uuid, int) to authenticated;
