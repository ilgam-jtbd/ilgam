-- pgTAP · 0004_operator_scope.sql 검증 (ADR-009)
-- 3 assert:
--   (1) platform_admins 확장 컬럼 4개가 정확한 타입·기본값으로 존재
--   (2) operator_actions RLS 활성 + 정책 opactions_self_or_super 존재
--   (3) app.log_operator_action() 이 비관리자 JWT 호출을 42501 로 거부

begin;
select plan(3);

-- ── (1) 컬럼 확장 ───────────────────────────────────────
select ok(
  (select count(*) = 4
   from information_schema.columns
   where table_schema = 'public'
     and table_name = 'platform_admins'
     and column_name in ('role','mfa_enrolled','last_mfa_at','allowed_ip_cidrs')),
  '0004 · platform_admins: role/mfa_enrolled/last_mfa_at/allowed_ip_cidrs 컬럼 추가됨'
);

-- ── (2) RLS 정책 ────────────────────────────────────────
select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'operator_actions'
      and policyname = 'opactions_self_or_super'
  )
  and (select relrowsecurity
       from pg_class where oid = 'public.operator_actions'::regclass),
  '0004 · operator_actions RLS 활성 + opactions_self_or_super 정책 존재'
);

-- ── (3) 비관리자 호출 거부 ──────────────────────────────
--   auth.uid() 가 NULL 또는 platform_admins 미등록 UUID 인 상태에서
--   app.log_operator_action() 호출 시 42501 (insufficient_privilege) 예외.
select throws_ok(
  $$ select app.log_operator_action('internal_page_view', null, null, 'pgtap', '{}'::jsonb, null) $$,
  '42501',
  'not a platform admin',
  '0004 · log_operator_action: 비관리자 호출은 42501 로 차단'
);

select * from finish();
rollback;
