-- pgTAP · admin / private 부정 경로 (ADR-009, iter10)
-- 단일 plan + savepoint. has_table_privilege 는 Supabase 부모 role 상속 때문에 사용 불가 →
-- RLS+SELECT count=0 패턴으로만 검증 (실 부정 효과 측정).

begin;
select plan(2);

-- ───────────────────────────────────────────────────────────
-- (1) 비-admin worker → platform_admins SELECT 차단 (RLS)
-- ───────────────────────────────────────────────────────────

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
  '(1) 일반 워커는 platform_admins 행을 SELECT 할 수 없다 (RLS)'
);
reset role;


-- ───────────────────────────────────────────────────────────
-- (2) authenticated worker → private.workers_tax_identity 직접 SELECT 시 throws 검증
-- ───────────────────────────────────────────────────────────

insert into auth.users (id, email) values
  ('cccc1111-1111-4111-8111-cccc11111111', 'w2@test');
insert into public.profiles (id, role) values
  ('cccc1111-1111-4111-8111-cccc11111111', 'worker');
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"cccc1111-1111-4111-8111-cccc11111111","role":"authenticated"}';
select throws_ok(
  $$ select worker_id from private.workers_tax_identity limit 1 $$,
  null, null,
  '(2) authenticated 워커는 private.workers_tax_identity SELECT 차단 (PII)'
);
reset role;


select * from finish();
rollback;
