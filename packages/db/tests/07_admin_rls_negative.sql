-- pgTAP · admin / operator_actions / private.* RLS 부정 경로 검증 (ADR-009, iter10)
-- 5 케이스 · 각 begin/rollback 격리. 운영자 백오피스 보안 회귀 사각지대 차단.

-- ───────────────────────────────────────────────────────────
-- (1) 비-admin worker → platform_admins SELECT 차단
-- ───────────────────────────────────────────────────────────
begin;
select plan(1);

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

select * from finish();
rollback;

-- ───────────────────────────────────────────────────────────
-- (2) 비활성(active=false) admin → operator_actions INSERT 차단
-- ───────────────────────────────────────────────────────────
begin;
select plan(1);

insert into auth.users (id, email) values
  ('bbbb1111-1111-4111-8111-bbbb11111111', 'inactive@test');
insert into public.profiles (id, role) values
  ('bbbb1111-1111-4111-8111-bbbb11111111', 'admin');
insert into public.platform_admins (profile_id, active, role, mfa_enrolled, last_mfa_at) values
  ('bbbb1111-1111-4111-8111-bbbb11111111', false, 'operator', true, now());

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"bbbb1111-1111-4111-8111-bbbb11111111","role":"authenticated"}';

-- operator_actions 는 authenticated 에 INSERT grant 없음 + active 가드 어차피 통과 못 함
select throws_ok(
  $$ insert into public.operator_actions (actor_id, action_type)
     values ('bbbb1111-1111-4111-8111-bbbb11111111','employer_approve') $$,
  '42501',
  null,
  '(2) 비활성 admin은 operator_actions 직접 INSERT 불가 (permission denied)'
);

select * from finish();
rollback;

-- ───────────────────────────────────────────────────────────
-- (3) anon → operator_actions SELECT 차단
-- ───────────────────────────────────────────────────────────
begin;
select plan(1);

set local role anon;
set local "request.jwt.claims" = '{"role":"anon"}';

select throws_ok(
  $$ select id from public.operator_actions limit 1 $$,
  '42501',
  null,
  '(3) anon은 operator_actions를 SELECT 할 수 없다'
);

select * from finish();
rollback;

-- ───────────────────────────────────────────────────────────
-- (4) authenticated 워커 → private.workers_tax_identity SELECT 완전 차단
-- ───────────────────────────────────────────────────────────
begin;
select plan(1);

insert into auth.users (id, email) values
  ('cccc1111-1111-4111-8111-cccc11111111', 'w2@test');
insert into public.profiles (id, role) values
  ('cccc1111-1111-4111-8111-cccc11111111', 'worker');

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"cccc1111-1111-4111-8111-cccc11111111","role":"authenticated"}';

-- private 스키마는 anon/authenticated 에 모든 권한 revoke (ADR-005)
select throws_ok(
  $$ select worker_id from private.workers_tax_identity limit 1 $$,
  '42501',
  null,
  '(4) authenticated 워커는 private.workers_tax_identity SELECT 차단 (PII)'
);

select * from finish();
rollback;

-- ───────────────────────────────────────────────────────────
-- (5) 비-admin worker → app.log_operator_action() RPC 호출 시도 차단
--      함수는 SECURITY DEFINER 이지만 grant 가 없으므로 호출 자체 불가
-- ───────────────────────────────────────────────────────────
begin;
select plan(1);

insert into auth.users (id, email) values
  ('dddd1111-1111-4111-8111-dddd11111111', 'w3@test');
insert into public.profiles (id, role) values
  ('dddd1111-1111-4111-8111-dddd11111111', 'worker');
insert into public.workers (id, profile_id) values
  ('dddd2222-2222-4222-8222-dddd22222222', 'dddd1111-1111-4111-8111-dddd11111111');

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"dddd1111-1111-4111-8111-dddd11111111","role":"authenticated"}';

-- app schema 의 log_operator_action 은 admin-only 호출. 일반 워커가 직접 호출 시 grant 부재 또는 함수 내부 admin 검증 실패.
-- 정확한 SQLSTATE 는 함수 정의에 따라 다를 수 있어 throws 만 확인 (any error).
select throws_ok(
  $$ select app.log_operator_action(
       'employer_approve','employers',
       '00000000-0000-4000-8000-000000000000'::uuid,'forced','{}'::jsonb
     ) $$,
  null, null,
  '(5) 일반 워커는 app.log_operator_action 직접 호출 차단'
);

select * from finish();
rollback;
