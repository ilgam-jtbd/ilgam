-- 0001_initial.sql · 일감(ILGAM) 기본 스키마
-- 2026-04-23 · ADR-005 기준

-- ─── 확장 ────────────────────────────────────────────────
create extension if not exists "pgcrypto";
create extension if not exists "postgis";
create extension if not exists "pg_cron";
create extension if not exists "pg_net";

-- ─── 스키마 분리 ─────────────────────────────────────────
create schema if not exists private;
create schema if not exists app;

-- ─── 지역 (법정동) ───────────────────────────────────────
create table public.regions (
  dong_code char(10) primary key,
  sido text not null,
  sigungu text not null,
  dong text not null,
  geog geography(MultiPolygon, 4326)
);
create index idx_regions_geog on public.regions using gist (geog);

-- ─── profiles (auth.users 확장) ──────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone_e164 text unique,
  role text not null default 'worker'
    check (role in ('worker','employer','admin')),
  kakao_user_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── workers (시니어) ────────────────────────────────────
create table public.workers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete set null,
  ci_token text,
  di_token text,
  birth_ymd char(8),
  gender_code char(1) check (gender_code in ('M','F')),
  home_dong_code char(10) references public.regions(dong_code),
  cert_codes text[] default '{}',
  mentor_tags text[] default '{}',
  no_show_count int not null default 0,
  rating_avg numeric(3,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_workers_home on public.workers (home_dong_code);
create index idx_workers_certs_gin on public.workers using gin (cert_codes);
create index idx_workers_mentor_tags_gin on public.workers using gin (mentor_tags);

-- ─── private.workers_tax_identity (민감 PII 분리) ────────
create table private.workers_tax_identity (
  worker_id uuid primary key references public.workers(id) on delete restrict,
  rrn_encrypted bytea not null,
  rrn_hash bytea not null,
  bank_account_encrypted bytea not null,
  bank_code text not null,
  created_at timestamptz default now(),
  accessed_at timestamptz,
  access_reason text
);
revoke all on private.workers_tax_identity from anon, authenticated;

-- ─── employers ───────────────────────────────────────────
create table public.employers (
  id uuid primary key default gen_random_uuid(),
  biz_name text not null,
  biz_reg_number_encrypted bytea not null,
  biz_reg_number_hash bytea not null unique,
  contact_name text not null,
  contact_phone_e164 text not null,
  biz_type text,
  billing_email text,
  approved_at timestamptz,
  suspended_at timestamptz,
  created_at timestamptz default now()
);

create table public.employer_members (
  employer_id uuid not null references public.employers(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  granted_at timestamptz default now(),
  revoked_at timestamptz,
  primary key (employer_id, profile_id)
);

create table public.platform_admins (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- ─── jobs (공고) ─────────────────────────────────────────
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employers(id) on delete restrict,
  title text not null,
  description text,
  dong_code char(10) not null references public.regions(dong_code),
  location_geog geography(Point, 4326),
  shift_start_at timestamptz not null,
  shift_end_at timestamptz not null,
  hourly_wage_krw integer not null check (hourly_wage_krw >= 10030),
  required_cert_codes text[] default '{}',
  preferred_mentor_tags text[] default '{}',
  headcount int not null default 1 check (headcount > 0),
  status text not null default 'open'
    check (status in ('open','matched','in_progress','completed','cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_jobs_match on public.jobs
  (status, dong_code, shift_start_at)
  where status = 'open';
create index idx_jobs_required_certs_gin
  on public.jobs using gin (required_cert_codes);
create index idx_jobs_geog on public.jobs using gist (location_geog);

-- ─── 지원 · 매칭 · shifts ─────────────────────────────────
create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete cascade,
  status text not null default 'applied'
    check (status in ('applied','cancelled','selected','rejected')),
  created_at timestamptz default now(),
  unique (job_id, worker_id)
);
create index idx_apps_job on public.job_applications (job_id, status);
create index idx_apps_worker on public.job_applications (worker_id, created_at desc);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id),
  worker_id uuid not null references public.workers(id),
  employer_id uuid not null references public.employers(id),
  confirmed_at timestamptz not null default now(),
  cancelled_at timestamptz,
  cancel_reason text,
  unique (job_id, worker_id)
);

create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id),
  job_id uuid not null references public.jobs(id),
  worker_id uuid not null references public.workers(id),
  employer_id uuid not null references public.employers(id),
  clock_in_at timestamptz,
  clock_in_geog geography(Point, 4326),
  clock_in_selfie_path text,
  clock_out_at timestamptz,
  clock_out_geog geography(Point, 4326),
  worked_minutes integer generated always as (
    case when clock_out_at is not null and clock_in_at is not null
    then (extract(epoch from (clock_out_at - clock_in_at))::int / 60)
    else null end
  ) stored,
  employer_approved_at timestamptz,
  dispute_status text default 'none'
    check (dispute_status in ('none','raised','resolved')),
  created_at timestamptz default now()
);
create index idx_shifts_worker_date on public.shifts (worker_id, clock_in_at desc);
create index idx_shifts_employer_date on public.shifts (employer_id, clock_in_at desc);

-- ─── 결제 · 수수료 ───────────────────────────────────────
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null unique references public.shifts(id),
  worker_id uuid not null references public.workers(id),
  employer_id uuid not null references public.employers(id),
  gross_amount_krw integer not null check (gross_amount_krw > 0),
  platform_fee_rate numeric(5,4) not null default 0.15,
  platform_fee_krw integer not null,
  worker_net_krw integer not null check (worker_net_krw > 0),
  portone_imp_uid text unique,
  portone_txid text,
  status text not null default 'pending'
    check (status in ('pending','authorized','paid','failed','refunded')),
  expected_settle_at timestamptz,
  settled_at timestamptz,
  created_at timestamptz default now()
);
create index idx_payments_status on public.payments (status, created_at desc);

create table public.platform_fees_daily (
  day date primary key,
  gmv_krw bigint not null default 0,
  fee_krw bigint not null default 0,
  updated_at timestamptz default now()
);

-- ─── 알림 ────────────────────────────────────────────────
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id),
  template_id text not null,
  channel text not null check (channel in ('alimtalk','sms','push')),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued'
    check (status in ('queued','sending','sent','failed','fallback')),
  provider_msg_id text,
  error_code text,
  sent_at timestamptz,
  created_at timestamptz default now()
);
create index idx_notif_profile on public.notifications (profile_id, created_at desc);

-- ─── CX ──────────────────────────────────────────────────
create table public.cx_tickets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id),
  channel text not null check (channel in ('channeltalk','sms','kakao','inapp')),
  intent text,
  intent_confidence numeric(4,3),
  ai_answered boolean not null default false,
  escalated_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz default now()
);

-- ─── 리뷰 ────────────────────────────────────────────────
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null references public.shifts(id),
  author_role text not null check (author_role in ('worker','employer')),
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  unique (shift_id, author_role)
);

-- ─── 감사 ────────────────────────────────────────────────
create table public.audit_log (
  id bigserial,
  occurred_at timestamptz not null default now(),
  actor_profile_id uuid,
  action text not null,
  target_table text,
  target_id uuid,
  reason text,
  payload jsonb,
  primary key (id, occurred_at)
) partition by range (occurred_at);

create table public.audit_log_2026_04 partition of public.audit_log
  for values from ('2026-04-01') to ('2026-05-01');
create table public.audit_log_2026_05 partition of public.audit_log
  for values from ('2026-05-01') to ('2026-06-01');

-- ─── helper 함수 (ADR-005) ────────────────────────────────
create or replace function app.current_employer_ids()
  returns setof uuid language sql stable security definer as $$
  select employer_id from public.employer_members
  where profile_id = auth.uid() and revoked_at is null
$$;

create or replace function app.is_platform_admin()
  returns boolean language sql stable security definer as $$
  select exists (select 1 from public.platform_admins
                 where profile_id = auth.uid() and active)
$$;

create or replace function app.log_admin_access(
  p_target_table text, p_target_id uuid, p_reason text default null
) returns uuid language plpgsql security definer as $$
declare v_id bigint;
begin
  insert into public.audit_log
    (actor_profile_id, action, target_table, target_id, reason)
  values
    (auth.uid(), 'admin_access', p_target_table, p_target_id, p_reason)
  returning id into v_id;
  return gen_random_uuid();
end
$$;
