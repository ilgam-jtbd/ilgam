-- 0005_match_trigger.sql
-- job_applications.status = 'accepted' 시 matches 자동 생성
-- ADR-004: 매칭 확정 → notify-dispatch ILGAM_M001 발송 트리거

-- ─── job_applications status 컬럼 추가 (0001에 없었음) ────
alter table public.job_applications
  add column if not exists status text not null default 'pending'
    check (status in ('pending','accepted','rejected','withdrawn'));

-- ─── matches 테이블 보완: employer_id 컬럼 ─────────────────
alter table public.matches
  add column if not exists employer_id uuid references public.employers(id);

-- ─── 수락 시 matches 자동 생성 함수 ──────────────────────────
create or replace function private.create_match_on_accept()
  returns trigger language plpgsql security definer as $$
declare
  v_employer_id uuid;
begin
  -- accepted 로 변경될 때만 실행
  if new.status <> 'accepted' or old.status = 'accepted' then
    return new;
  end if;

  -- jobs 에서 employer_id 조회
  select employer_id into v_employer_id
  from public.jobs where id = new.job_id;

  -- matches 생성 (중복 방지: ON CONFLICT DO NOTHING)
  insert into public.matches (worker_id, job_id, employer_id)
  values (new.worker_id, new.job_id, v_employer_id)
  on conflict (worker_id, job_id) do nothing;

  -- 알림톡 발송은 notify-dispatch Edge Function 이 matches INSERT 트리거로 처리
  return new;
end
$$;

drop trigger if exists trg_accept_create_match on public.job_applications;
create trigger trg_accept_create_match
  after update of status on public.job_applications
  for each row execute function private.create_match_on_accept();

-- ─── matches 유니크 제약 (worker + job 중복 방지) ────────────
alter table public.matches
  drop constraint if exists matches_worker_job_unique;
alter table public.matches
  add constraint matches_worker_job_unique unique (worker_id, job_id);

-- ─── 알림톡 발송 트리거 (matches INSERT → pg_net 으로 Edge Function 호출) ─
-- Supabase pg_net 확장 필요: CREATE EXTENSION IF NOT EXISTS pg_net;
create or replace function private.notify_match_confirmed()
  returns trigger language plpgsql security definer as $$
declare
  v_phone    text;
  v_name     text;
  v_job_title text;
  v_start    text;
  v_end      text;
  v_address  text;
  v_wage     int;
  v_biz_name text;
begin
  -- 워커 프로필 조회
  select p.phone_e164, p.display_name
    into v_phone, v_name
  from public.workers w join public.profiles p on p.id = w.profile_id
  where w.id = new.worker_id;

  -- 공고 정보 조회
  select j.title, j.shift_start_at::text, j.shift_end_at::text,
         r.sigungu || ' ' || r.dong, j.hourly_wage_krw, e.biz_name
    into v_job_title, v_start, v_end, v_address, v_wage, v_biz_name
  from public.jobs j
    left join public.regions r on r.dong_code = j.dong_code
    left join public.employers e on e.id = j.employer_id
  where j.id = new.job_id;

  -- notify-dispatch Edge Function 비동기 호출 (pg_net)
  perform net.http_post(
    url    := current_setting('app.edge_function_url') || '/notify-dispatch',
    body   := json_build_object(
      'templateId', 'ILGAM_M001',
      'userId',     (select profile_id from public.workers where id = new.worker_id),
      'phoneE164',  v_phone,
      'variables',  json_build_object(
        'worker_name',    coalesce(v_name, '고객'),
        'job_title',      coalesce(v_job_title, ''),
        'work_date',      coalesce(v_start, ''),
        'work_time',      coalesce(v_start || ' ~ ' || v_end, ''),
        'work_address',   coalesce(v_address, ''),
        'employer_name',  coalesce(v_biz_name, ''),
        'hourly_wage',    coalesce(v_wage::text, ''),
        'job_detail_url', 'https://ilgam.kr/j/' || new.job_id
      )
    )::text,
    headers := '{"Content-Type":"application/json","Authorization":"Bearer ' ||
               current_setting('app.service_role_key') || '"}'::jsonb
  );

  return new;
end
$$;

drop trigger if exists trg_notify_match on public.matches;
create trigger trg_notify_match
  after insert on public.matches
  for each row execute function private.notify_match_confirmed();

-- ─── RLS: job_applications status 업데이트 권한 ─────────────
-- 구인자 멤버만 accepted/rejected 업데이트 가능
create policy if not exists apps_employer_update on public.job_applications
  for update using (
    job_id in (
      select id from public.jobs
      where employer_id in (select app.current_employer_ids())
    )
  )
  with check (status in ('accepted','rejected'));

-- 워커 본인은 withdrawn 만 가능
create policy if not exists apps_worker_withdraw on public.job_applications
  for update using (
    worker_id in (select id from public.workers where profile_id = auth.uid())
  )
  with check (status = 'withdrawn');
