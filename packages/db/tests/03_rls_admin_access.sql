-- 03_rls_admin_access.sql · RLS 관리자 축 + 헬퍼 함수 검증 (ADR-005/009)
-- 6 assert: app.* 헬퍼 함수 + platform_admins/operator_actions RLS + 관리자 USING 참조

begin;
select plan(6);

-- ── app.* 헬퍼 함수 존재 ─────────────────────────────────
select ok(
  exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'app' and p.proname = 'is_platform_admin'
  ),
  'app.is_platform_admin() 함수 존재'
);
select ok(
  exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'app' and p.proname = 'is_super_admin'
  ),
  'app.is_super_admin() 함수 존재 (ADR-009)'
);
select ok(
  exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'app' and p.proname = 'current_employer_ids'
  ),
  'app.current_employer_ids() 함수 존재'
);

-- ── platform_admins / operator_actions RLS ──────────────
select ok(
  (select relrowsecurity from pg_class where oid = 'public.platform_admins'::regclass),
  'platform_admins: RLS 활성'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.operator_actions'::regclass),
  'operator_actions: RLS 활성'
);

-- ── 관리자 접근 USING 조항이 profiles 정책에 반영됨 ──────
select ok(
  exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='profiles'
      and policyname='profiles_self_read'
      and qual like '%is_platform_admin%'
  ),
  'profiles_self_read: USING 조항에 is_platform_admin() 포함 (관리자 읽기 허용)'
);

select * from finish();
rollback;
