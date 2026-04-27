-- pgTAP · admin / operator_actions / private.* RLS 부정 경로 검증 (ADR-009, iter10)
-- pg_prove: 파일당 plan() 1회 + savepoint 격리.

begin;
select plan(5);

-- ───────────────────────────────────────────────────────────
-- (1) 비-admin worker → platform_admins SELECT 차단
-- ───────────────────────────────────────────────────────────
savepoint c1;
insert into auth.users (id, email) values
  ('aaaa1111-1111-4111-8111-aaaa11111111', 'w@test'),
  ('aaaa2222-2222-4222-8222-aaaa22222222', 'a@test');
insert into public.profiles (id, role) values
  ('aaaa1111-1111-4111-8111-aaaa11111111', 'worker'),
  ('aaaa2222-2222-4222-8222-aaaa22222222', 'admin');
insert into public.platform_admins (profile_id, active, role, mfa_enrolled, last_mfa_at) values
  ('aaaa2222-2222-4222-8222-aaaa22222222', true, 'operator', true, now());
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"aaaa1111-1111-4111-8111-aaaa11111111","role":"authenticated"}';
select results_eq(
  $$ select count(*)::bigint from public.platform_admins $$,
  $$ values (0::bigint) $$,
  '(1) 일반 워커는 platform_admins 행을 SELECT 할 수 없다 (RLS or grant)'
);
reset role;
rollback to c1;

-- ───────────────────────────────────────────────────────────
-- (2) authenticated 에 operator_actions INSERT 권한 부재 검증
-- ───────────────────────────────────────────────────────────
savepoint c2;
select results_eq(
  $$ select has_table_privilege('authenticated', 'public.operator_actions', 'INSERT') $$,
  $$ values (false) $$,
  '(2) authenticated role 은 operator_actions INSERT 권한 없음 (admin 우회 차단)'
);
rollback to c2;

-- ───────────────────────────────────────────────────────────
-- (3) anon 에 operator_actions SELECT 권한이 없는지 검증
-- ───────────────────────────────────────────────────────────
savepoint c3;
select results_eq(
  $$ select has_table_privilege('anon', 'public.operator_actions', 'SELECT') $$,
  $$ values (false) $$,
  '(3) anon role 은 operator_actions 에 SELECT 권한 없음'
);
rollback to c3;

-- ───────────────────────────────────────────────────────────
-- (4) authenticated 에 private.workers_tax_identity 권한 부재 (PII 격리)
-- ───────────────────────────────────────────────────────────
savepoint c4;
select results_eq(
  $$
    select has_table_privilege('authenticated', 'private.workers_tax_identity', 'SELECT')
        or has_table_privilege('anon', 'private.workers_tax_identity', 'SELECT')
  $$,
  $$ values (false) $$,
  '(4) authenticated/anon 둘 다 private.workers_tax_identity SELECT 차단 (PII)'
);
rollback to c4;

-- ───────────────────────────────────────────────────────────
-- (5) authenticated 에 app.log_operator_action EXECUTE 권한 부재
--     (admin 만 호출 가능. 함수 grant 검증)
-- ───────────────────────────────────────────────────────────
savepoint c5;
-- 4-bis 가 plan 카운트 5에 포함됨 → 5번째 테스트는 (4) 의 두 번째가 아닌 별도 케이스
-- 실제 plan(5): (1) (2) (3) (4) (5)
-- (4) 안의 4-bis 를 제거하고 (5) 를 함수 권한 검증으로
select results_eq(
  $$ select has_function_privilege('authenticated', 'app.log_operator_action(text,text,uuid,text,jsonb)', 'EXECUTE') $$,
  $$ values (false) $$,
  '(5) authenticated role 은 app.log_operator_action EXECUTE 권한 없음 (admin only)'
);
rollback to c5;

select * from finish();
rollback;
