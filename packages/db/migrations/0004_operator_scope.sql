-- 0004_operator_scope.sql · 플랫폼 운영자 백오피스 스키마 확장
-- ADR-009 기준 · 2026-04-23
--
-- 변경 3축:
-- (1) platform_admins 에 role · MFA · IP allowlist 컬럼 추가
-- (2) operator_actions 신설 (운영자 의도 있는 조작 이력)
-- (3) helper 함수 (app.is_super_admin, app.log_operator_action) + RLS

-- ─── (1) platform_admins 확장 ────────────────────────────
alter table public.platform_admins
  add column if not exists role text not null default 'operator'
    check (role in ('super_admin','operator')),
  add column if not exists mfa_enrolled boolean not null default false,
  add column if not exists last_mfa_at timestamptz,
  add column if not exists allowed_ip_cidrs cidr[] not null default '{}';

comment on column public.platform_admins.role is
  'super_admin: audit 검색·영구 차단·환불 전액·platform_admins 관리. operator: 일상 운영 (ADR-009 매트릭스)';
comment on column public.platform_admins.mfa_enrolled is
  'TOTP 등록 여부. false 이면 /internal 진입 차단 → /internal/mfa-setup 강제 리디렉트';
comment on column public.platform_admins.last_mfa_at is
  'MFA 최근 통과 시각. middleware 에서 now() - 4h 초과 시 재인증 요구';
comment on column public.platform_admins.allowed_ip_cidrs is
  '값 비어 있으면 전체 허용, 값 있으면 미스매치 403. 공공 MOU·감사 트리거 시 on';

create index if not exists idx_platform_admins_role
  on public.platform_admins (role) where active;

-- ─── (2) operator_actions — 명시적 운영자 액션 ──────────
--
-- audit_log 과 분리 이유:
-- · audit_log: 시스템 트리거·RPC 자동 기록, profile_id=NULL 다수, 파티션(월)
-- · operator_actions: 운영자 의도 명시, 고정 컬럼, 본인·super_admin만 조회
create table if not exists public.operator_actions (
  id bigserial primary key,
  actor_id uuid not null references public.platform_admins(profile_id) on delete restrict,
  action_type text not null check (action_type in (
    -- 구인자
    'employer_approve','employer_reject','employer_suspend',
    -- 신고 3트랙
    'report_resolve','report_shadow_hide','report_block_employer',
    -- 결제 분쟁
    'payment_refund_partial','payment_refund_full','payment_escrow_hold',
    -- 워커 ban
    'worker_ban','worker_unban',
    -- 감사·관리
    'audit_search','internal_page_view',
    'admin_invite','admin_revoke','admin_mfa_reset'
  )),
  target_table text,
  target_id uuid,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  source_ip inet,
  created_at timestamptz not null default now()
);

create index idx_opactions_actor_time
  on public.operator_actions (actor_id, created_at desc);
create index idx_opactions_target
  on public.operator_actions (target_table, target_id, created_at desc);
create index idx_opactions_type
  on public.operator_actions (action_type, created_at desc);

comment on table public.operator_actions is
  '운영자 백오피스 액션 이력 (ADR-009). 보존 3년. 쓰기는 service_role 또는 app.log_operator_action() 경유.';

-- ─── (3) helper 함수 ────────────────────────────────────
create or replace function app.current_admin_role()
  returns text language sql stable security definer as $$
  select role from public.platform_admins
  where profile_id = auth.uid() and active
  limit 1
$$;

create or replace function app.is_super_admin()
  returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.platform_admins
    where profile_id = auth.uid()
      and active
      and role = 'super_admin'
  )
$$;

create or replace function app.log_operator_action(
  p_action_type text,
  p_target_table text default null,
  p_target_id uuid default null,
  p_reason text default null,
  p_metadata jsonb default '{}'::jsonb,
  p_source_ip inet default null
) returns bigint
language plpgsql
security definer
set search_path = public, app
as $$
declare v_id bigint;
begin
  if not exists (
    select 1 from public.platform_admins
    where profile_id = auth.uid() and active
  ) then
    raise exception 'not a platform admin' using errcode = '42501';
  end if;

  insert into public.operator_actions
    (actor_id, action_type, target_table, target_id, reason, metadata, source_ip)
  values
    (auth.uid(), p_action_type, p_target_table, p_target_id, p_reason, p_metadata, p_source_ip)
  returning id into v_id;
  return v_id;
end
$$;

comment on function app.log_operator_action is
  '운영자 액션 1건 기록. 호출자가 platform_admins.active=true 인지 확인 후 삽입. 비관리자 호출 시 42501 예외.';

-- ─── RLS ─────────────────────────────────────────────────
alter table public.operator_actions enable row level security;

-- SELECT: 본인 action + super_admin 전체
create policy opactions_self_or_super on public.operator_actions
  for select using (
    actor_id = auth.uid()
    or app.is_super_admin()
  );

-- INSERT/UPDATE/DELETE: authenticated 에 grant 하지 않음 → service_role 및
-- SECURITY DEFINER 함수(app.log_operator_action) 만 쓰기 가능. 기본 deny.

-- platform_admins 본체: 방어심층 (defense-in-depth) — 0001 에서 누락된 RLS 보강
-- SELECT 는 본인 record + super_admin 전체. 쓰기는 service_role 전용.
alter table public.platform_admins enable row level security;

create policy platform_admins_self_or_super on public.platform_admins
  for select using (
    profile_id = auth.uid()
    or app.is_super_admin()
  );

-- ─── Grants (0003_api_exposure.sql 스타일) ──────────────
grant select on public.operator_actions to authenticated;
grant usage, select on sequence public.operator_actions_id_seq to authenticated;
grant select on public.platform_admins to authenticated;
grant execute on function app.current_admin_role() to authenticated;
grant execute on function app.is_super_admin() to authenticated;
grant execute on function app.log_operator_action(text, text, uuid, text, jsonb, inet) to authenticated;
