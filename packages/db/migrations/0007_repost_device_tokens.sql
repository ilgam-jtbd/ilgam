-- Migration 0007 — repost_job RPC + device_tokens 테이블
-- 1. repost_job: 기존 공고를 복제해 새 날짜로 재게시 (PRD M1)
-- 2. device_tokens: 워커 앱 푸시 알림 토큰 저장

-- ─── repost_job RPC ──────────────────────────────────────
create or replace function public.repost_job(
  p_job_id        uuid,
  p_shift_start_at timestamptz,
  p_shift_end_at  timestamptz
) returns uuid language plpgsql security definer as $$
declare
  v_old public.jobs;
  v_new_id uuid := gen_random_uuid();
begin
  select * into v_old from public.jobs where id = p_job_id;
  if not found then
    raise exception 'job not found';
  end if;

  -- 구인자 소유권 확인 (employer_members 경유)
  if not exists (
    select 1 from public.employer_members em
    where em.employer_id = v_old.employer_id
      and em.profile_id  = auth.uid()
  ) then
    raise exception 'forbidden: caller is not a member of this employer';
  end if;

  -- 원본 공고를 복제 (시간만 교체, status = open)
  insert into public.jobs (
    id, employer_id, title, description, dong_code,
    shift_start_at, shift_end_at, hourly_wage_krw,
    required_cert_codes, preferred_mentor_tags,
    headcount, vertical, status
  )
  select
    v_new_id,
    v_old.employer_id, v_old.title, v_old.description, v_old.dong_code,
    p_shift_start_at, p_shift_end_at, v_old.hourly_wage_krw,
    v_old.required_cert_codes, v_old.preferred_mentor_tags,
    v_old.headcount, v_old.vertical, 'open';

  return v_new_id;
end;
$$;

grant execute on function public.repost_job(uuid, timestamptz, timestamptz)
  to authenticated;

-- ─── device_tokens ───────────────────────────────────────
create table if not exists public.device_tokens (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  token       text not null,
  platform    text not null check (platform in ('ios','android','web')),
  updated_at  timestamptz default now(),
  unique (profile_id, token)
);

create index if not exists idx_device_tokens_profile
  on public.device_tokens (profile_id);

alter table public.device_tokens enable row level security;

create policy dt_self on public.device_tokens
  for all using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

grant select, insert, update, delete on public.device_tokens to authenticated;
