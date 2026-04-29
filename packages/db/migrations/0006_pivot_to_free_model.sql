-- 0006_pivot_to_free_model.sql · 무료 모델 + 컨텐츠 QA + 광고 dormant
-- ADR-002 v2 / ADR-004 v2 / ADR-005 v2 / ADR-010 / ADR-011 · 2026-04-24~28
--
-- 변경 5축:
-- (1) jobs 에 QA 컬럼 + JobCategory 'consulting' 허용
-- (2) content_qa_rules · content_reports 신설
-- (3) ad_slots · ad_payments 신설 (M18 dormant)
-- (4) 정산 흐름 폐기: platform_fees_daily DROP, payments → 폐기 예정 (M2 정리 PR)
-- (5) RLS 갱신: 워커/anon SELECT는 qa_status='approved' 강제 + helper 추가

-- ─── (1) jobs · QA 컬럼 + consulting 카테고리 ────────────
alter table public.jobs
  add column if not exists qa_status text not null default 'pending'
    check (qa_status in ('pending','approved','rejected','flagged'));
alter table public.jobs add column if not exists qa_reason text;
alter table public.jobs add column if not exists qa_classifier text
  check (qa_classifier in ('auto','claude','operator','report'));
alter table public.jobs add column if not exists qa_reviewed_by uuid references public.profiles(id);
alter table public.jobs add column if not exists qa_reviewed_at timestamptz;
alter table public.jobs add column if not exists qa_confidence numeric(4,3);

comment on column public.jobs.qa_status is
  'pending: 자동 룰 미통과 / approved: 노출 / rejected: 차단 / flagged: 운영자 검토 큐 (ADR-010)';
comment on column public.jobs.qa_classifier is
  '자동(auto), Claude(claude), 운영자(operator), 외부 신고(report)';
comment on column public.jobs.qa_confidence is
  'Tier 2 Claude API 신뢰도 (0.0~1.0). Tier 1 자동 결정 시 NULL';

-- 인덱스 강화
drop index if exists idx_jobs_match;
create index idx_jobs_match on public.jobs
  (qa_status, status, dong_code, shift_start_at)
  where qa_status = 'approved' and status = 'open' and shift_start_at > now();
create index if not exists idx_jobs_qa_pending on public.jobs (qa_status, created_at)
  where qa_status in ('pending','flagged');

-- jobs.category 컬럼 추가 (없으면) + consulting 허용
-- 기존 packages/core/src/types.ts JobCategory enum에 정의된 6종 + consulting 추가됨
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='jobs' and column_name='category') then
    alter table public.jobs add column category text
      check (category in ('logistics','food','cleaning','retail','care','agriculture','consulting'));
  else
    -- check 제약 갱신: consulting 추가
    alter table public.jobs drop constraint if exists jobs_category_check;
    alter table public.jobs add constraint jobs_category_check
      check (category is null or category in ('logistics','food','cleaning','retail','care','agriculture','consulting'));
  end if;
end$$;

comment on column public.jobs.category is
  'logistics·food·cleaning·retail·care·agriculture·consulting (욜드족 자문, ADR-002 v2.1)';

-- ─── (2) content_qa_rules · content_reports ─────────────
create table if not exists public.content_qa_rules (
  id uuid primary key default gen_random_uuid(),
  rule_type text not null check (rule_type in ('keyword_block','url_block','wage_outlier','pattern_block')),
  pattern text not null,
  category text,  -- 성인·도박·MLM·다단계·사기·불법
  active boolean not null default true,
  notes text,
  created_at timestamptz default now(),
  created_by uuid references public.profiles(id)
);
create index if not exists idx_qa_rules_active on public.content_qa_rules (rule_type, active);

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  reporter_profile_id uuid references public.profiles(id),
  reporter_role text not null check (reporter_role in ('worker','employer','operator','external')),
  category text not null,
  description text,
  status text not null default 'open'
    check (status in ('open','resolved','dismissed')),
  shadow_hidden_at timestamptz,
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id),
  resolution text,
  created_at timestamptz default now()
);
create index if not exists idx_reports_status on public.content_reports (status, created_at desc);
create index if not exists idx_reports_job on public.content_reports (job_id);

-- ─── (3) ad_slots · ad_payments (M18 dormant) ───────────
create table if not exists public.ad_slots (
  id uuid primary key default gen_random_uuid(),
  slot_type text not null check (slot_type in ('top_banner','category_premium','b2b_premium','data_insights')),
  active boolean not null default false,  -- M18 활성화 게이트
  rate_krw integer,
  rate_unit text check (rate_unit in ('per_click','per_month','per_quarter')),
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.ad_payments (
  id uuid primary key default gen_random_uuid(),
  advertiser_employer_id uuid references public.employers(id),
  slot_id uuid not null references public.ad_slots(id),
  amount_krw integer not null check (amount_krw >= 0),
  status text not null default 'pending'
    check (status in ('pending','authorized','paid','failed','refunded')),
  portone_imp_uid text unique,
  portone_txid text,
  period_start date,
  period_end date,
  created_at timestamptz default now()
);

comment on table public.ad_slots is
  'M18 dormant. ADR-011. active=false 기본. 트리거 도달 시 super_admin이 토글.';

-- ─── (4) 정산 흐름 폐기 ──────────────────────────────────
drop materialized view if exists public.platform_fees_daily;
-- public.payments 테이블은 즉시 drop 하지 않음 (M2 정리 PR에서 archive 후 drop).
-- 새 코드는 public.payments 를 참조하지 않는다 (ADR-005 v2).

-- ─── (5) RLS 갱신 ───────────────────────────────────────
-- 새 테이블 RLS 활성
alter table public.content_qa_rules enable row level security;
alter table public.content_reports enable row level security;
alter table public.ad_slots enable row level security;
alter table public.ad_payments enable row level security;

-- helper: qa_status='approved' 검사
create or replace function app.is_qa_approved(p_job_id uuid)
returns boolean
language sql stable as $$
  select exists (
    select 1 from public.jobs
    where id = p_job_id and qa_status = 'approved'
  );
$$;

-- workers: jobs SELECT 시 qa_status='approved' OR 본인 employer 소유 공고
drop policy if exists jobs_anyone_open on public.jobs;
drop policy if exists jobs_worker_open on public.jobs;
drop policy if exists jobs_select on public.jobs;
create policy jobs_select on public.jobs
  for select
  using (
    qa_status = 'approved'
    or employer_id in (select app.current_employer_ids())
    or app.is_platform_admin()
  );

-- content_qa_rules: 운영자 전용
create policy qa_rules_admin on public.content_qa_rules
  for all using (app.is_platform_admin());

-- content_reports: 운영자 R/W, authenticated INSERT 가능 (자기 신고)
create policy reports_admin on public.content_reports
  for all using (app.is_platform_admin());
create policy reports_self_insert on public.content_reports
  for insert with check (
    reporter_profile_id = auth.uid()
    or reporter_role = 'external'
  );
create policy reports_self_select on public.content_reports
  for select using (reporter_profile_id = auth.uid());

-- ad_slots / ad_payments: super_admin만
create policy ads_super_admin on public.ad_slots
  for all using (app.is_platform_admin());
create policy ad_payments_super_admin on public.ad_payments
  for all using (app.is_platform_admin());

-- ─── (6) 자동 트리거 ────────────────────────────────────
-- content_reports INSERT 시 jobs.qa_status='flagged' + shadow_hidden_at 자동 설정
create or replace function app.fn_report_shadow_hide()
returns trigger
language plpgsql security definer
set search_path = public, app
as $$
begin
  update public.jobs
    set qa_status = 'flagged',
        qa_classifier = 'report',
        qa_reason = coalesce(new.category, 'reported')
    where id = new.job_id and qa_status = 'approved';
  new.shadow_hidden_at := now();
  return new;
end;
$$;

drop trigger if exists trg_report_shadow_hide on public.content_reports;
create trigger trg_report_shadow_hide
  before insert on public.content_reports
  for each row execute function app.fn_report_shadow_hide();

-- ─── (7) 권한 부여 ──────────────────────────────────────
grant select on public.content_qa_rules to authenticated;
grant select, insert on public.content_reports to authenticated;
grant select on public.ad_slots to anon, authenticated;
grant select on public.ad_payments to authenticated;

-- ─── (8) operator_actions 새 action_type 4개 ──────────
-- (체크 제약으로 정의되어 있지 않으므로 코드 측에서 사용. ADR-009 매트릭스에만 명시)
-- qa_decision: 운영자가 (internal)/qa 에서 승인/반려 결정
-- qa_rule_create: 운영자가 새 자동 룰 추가
-- report_resolve: 운영자가 신고 처리 (shadow hide → resolved)
-- ad_slot_toggle: super_admin이 광고 슬롯 활성/비활성
