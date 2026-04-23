-- 0002_rls.sql · RLS 정책 (ADR-005 3축)

alter table public.profiles          enable row level security;
alter table public.workers           enable row level security;
alter table public.employers         enable row level security;
alter table public.employer_members  enable row level security;
alter table public.jobs              enable row level security;
alter table public.job_applications  enable row level security;
alter table public.matches           enable row level security;
alter table public.shifts            enable row level security;
alter table public.payments          enable row level security;
alter table public.notifications     enable row level security;
alter table public.cx_tickets        enable row level security;
alter table public.reviews           enable row level security;

-- profiles: 본인만 읽고 수정
create policy profiles_self_read on public.profiles
  for select using (id = auth.uid() or app.is_platform_admin());
create policy profiles_self_write on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- workers: 본인 또는 admin
create policy workers_self on public.workers
  for select using (profile_id = auth.uid() or app.is_platform_admin());
create policy workers_self_write on public.workers
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- employers: 멤버만 읽기·수정
create policy employers_member on public.employers
  for select using (id in (select app.current_employer_ids()) or app.is_platform_admin());
create policy employers_member_write on public.employers
  for update using (id in (select app.current_employer_ids()))
  with check (id in (select app.current_employer_ids()));

-- employer_members: 본인 포함 멤버만
create policy emp_members_self on public.employer_members
  for select using (profile_id = auth.uid() or employer_id in (select app.current_employer_ids()));

-- jobs: 공개(open)는 모두 읽기, 수정은 고용주만
create policy jobs_public_read on public.jobs
  for select using (status = 'open' or employer_id in (select app.current_employer_ids()) or app.is_platform_admin());
create policy jobs_employer_write on public.jobs
  for all using (employer_id in (select app.current_employer_ids()))
  with check (employer_id in (select app.current_employer_ids()));

-- job_applications: 워커는 본인 건, 고용주는 본인 공고 건
create policy apps_worker on public.job_applications
  for select using (worker_id in (select id from public.workers where profile_id = auth.uid()));
create policy apps_employer on public.job_applications
  for select using (job_id in (
    select id from public.jobs where employer_id in (select app.current_employer_ids())
  ));
create policy apps_worker_insert on public.job_applications
  for insert with check (worker_id in (select id from public.workers where profile_id = auth.uid()));

-- matches / shifts: 워커 본인 + 고용주 멤버
create policy matches_worker on public.matches
  for select using (worker_id in (select id from public.workers where profile_id = auth.uid()));
create policy matches_employer on public.matches
  for all using (employer_id in (select app.current_employer_ids()))
  with check (employer_id in (select app.current_employer_ids()));

create policy shifts_worker on public.shifts
  for select using (worker_id in (select id from public.workers where profile_id = auth.uid()));
create policy shifts_worker_clock on public.shifts
  for update using (worker_id in (select id from public.workers where profile_id = auth.uid()))
  with check (worker_id in (select id from public.workers where profile_id = auth.uid()));
create policy shifts_employer on public.shifts
  for all using (employer_id in (select app.current_employer_ids()))
  with check (employer_id in (select app.current_employer_ids()));

-- payments: 워커는 본인 수령분 읽기만, 고용주는 본인 지급분 전체
create policy payments_worker_read on public.payments
  for select using (worker_id in (select id from public.workers where profile_id = auth.uid()));
create policy payments_employer_read on public.payments
  for select using (employer_id in (select app.current_employer_ids()));

-- notifications: 본인 기록만
create policy notif_self on public.notifications
  for select using (profile_id = auth.uid() or app.is_platform_admin());

-- cx_tickets: 본인 티켓
create policy cx_self on public.cx_tickets
  for select using (profile_id = auth.uid() or app.is_platform_admin());

-- reviews: shift 당사자만
create policy reviews_readers on public.reviews
  for select using (
    shift_id in (
      select id from public.shifts
      where worker_id in (select id from public.workers where profile_id = auth.uid())
         or employer_id in (select app.current_employer_ids())
    )
  );
