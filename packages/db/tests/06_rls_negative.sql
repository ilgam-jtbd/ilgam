-- pgTAP · RLS 부정 경로 (cross-tenant) 검증 (ADR-005, iter03/10)
-- pg_prove 는 파일 1개 = TAP stream 1개 → plan/finish 도 파일당 1회.
-- 각 케이스는 savepoint 로 격리, fixture UUID 는 케이스별 unique.

begin;
select plan(5);

-- ───────────────────────────────────────────────────────────
-- (1) worker A → worker B 의 matches 조회 차단
-- ───────────────────────────────────────────────────────────
savepoint c1;
insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'a@test'),
  ('22222222-2222-4222-8222-222222222222', 'b@test');
insert into public.profiles (id, role) values
  ('11111111-1111-4111-8111-111111111111', 'worker'),
  ('22222222-2222-4222-8222-222222222222', 'worker');
insert into public.workers (id, profile_id) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222');
insert into public.employers (id, biz_name, biz_reg_number_encrypted, biz_reg_number_hash, contact_name, contact_phone_e164)
  values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'E1', '\x00', '\x01', 'c', '+8210');
insert into public.regions (dong_code, sido, sigungu, dong) values ('1111000000','S','G','D');
insert into public.jobs (id, employer_id, title, dong_code, shift_start_at, shift_end_at, hourly_wage_krw)
  values ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','cccccccc-cccc-4ccc-8ccc-cccccccccccc','t','1111000000', now(), now()+interval '1h', 10030);
insert into public.matches (id, job_id, worker_id, employer_id) values
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
   'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
   'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
   'cccccccc-cccc-4ccc-8ccc-cccccccccccc');
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';
select results_eq(
  $$ select count(*)::bigint from public.matches where worker_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' $$,
  $$ values (0::bigint) $$,
  '(1) worker A 는 worker B 의 matches 행을 SELECT 할 수 없다'
);
reset role;
rollback to c1;

-- ───────────────────────────────────────────────────────────
-- (2) employer X → employer Y 의 jobs UPDATE 차단
-- ───────────────────────────────────────────────────────────
savepoint c2;
insert into auth.users (id, email) values
  ('33333333-3333-4333-8333-333333333333', 'x@test');
insert into public.profiles (id, role) values
  ('33333333-3333-4333-8333-333333333333', 'employer');
insert into public.employers (id, biz_name, biz_reg_number_encrypted, biz_reg_number_hash, contact_name, contact_phone_e164) values
  ('44444444-4444-4444-8444-444444444444', 'X', '\x10', '\x11', 'cx', '+8211'),
  ('55555555-5555-4555-8555-555555555555', 'Y', '\x20', '\x21', 'cy', '+8212');
insert into public.employer_members (employer_id, profile_id, role) values
  ('44444444-4444-4444-8444-444444444444', '33333333-3333-4333-8333-333333333333', 'owner');
insert into public.regions (dong_code, sido, sigungu, dong) values ('2222000000','S','G','D');
insert into public.jobs (id, employer_id, title, dong_code, shift_start_at, shift_end_at, hourly_wage_krw, status) values
  ('66666666-6666-4666-8666-666666666666','55555555-5555-4555-8555-555555555555','Yjob','2222000000', now(), now()+interval '1h', 10030, 'open');
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}';
update public.jobs set title = 'HACKED' where id = '66666666-6666-4666-8666-666666666666';
reset role;
select results_eq(
  $$ select title from public.jobs where id = '66666666-6666-4666-8666-666666666666' $$,
  $$ values ('Yjob'::text) $$,
  '(2) employer X 의 UPDATE 가 차단되어 jobs.title 원본 유지'
);
rollback to c2;

-- ───────────────────────────────────────────────────────────
-- (3) anon role 에 employers SELECT 권한이 없는지 검증
--     (throws_ok 패턴 대신 has_table_privilege 로 직접 검증)
-- ───────────────────────────────────────────────────────────
savepoint c3;
select results_eq(
  $$ select has_table_privilege('anon', 'public.employers', 'SELECT') $$,
  $$ values (false) $$,
  '(3) anon role 은 public.employers 에 SELECT 권한이 없다'
);
rollback to c3;

-- ───────────────────────────────────────────────────────────
-- (4) authenticated 에 operator_actions INSERT 권한이 없는지 검증
-- ───────────────────────────────────────────────────────────
savepoint c4;
select results_eq(
  $$ select has_table_privilege('authenticated', 'public.operator_actions', 'INSERT') $$,
  $$ values (false) $$,
  '(4) authenticated role 은 operator_actions 에 INSERT 권한이 없다'
);
rollback to c4;

-- ───────────────────────────────────────────────────────────
-- (5) worker → 본인 matches.cancelled_at UPDATE 시도 차단
--     matches_worker 정책은 SELECT 전용 → UPDATE 0 rows
-- ───────────────────────────────────────────────────────────
savepoint c5;
insert into auth.users (id, email) values
  ('88888888-8888-4888-8888-888888888888', 'w2@test');
insert into public.profiles (id, role) values
  ('88888888-8888-4888-8888-888888888888', 'worker');
insert into public.workers (id, profile_id) values
  ('99999999-9999-4999-8999-999999999999', '88888888-8888-4888-8888-888888888888');
insert into public.employers (id, biz_name, biz_reg_number_encrypted, biz_reg_number_hash, contact_name, contact_phone_e164)
  values ('a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1','E','\x30','\x31','c','+8213');
insert into public.regions (dong_code, sido, sigungu, dong) values ('3333000000','S','G','D');
insert into public.jobs (id, employer_id, title, dong_code, shift_start_at, shift_end_at, hourly_wage_krw)
  values ('b2b2b2b2-b2b2-4b2b-8b2b-b2b2b2b2b2b2','a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1','t','3333000000', now(), now()+interval '1h', 10030);
insert into public.matches (id, job_id, worker_id, employer_id) values
  ('c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3',
   'b2b2b2b2-b2b2-4b2b-8b2b-b2b2b2b2b2b2',
   '99999999-9999-4999-8999-999999999999',
   'a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1');
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"88888888-8888-4888-8888-888888888888","role":"authenticated"}';
update public.matches set cancelled_at = now(), cancel_reason = 'self-cancel'
  where id = 'c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3';
reset role;
select results_eq(
  $$ select cancelled_at is null from public.matches where id = 'c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3' $$,
  $$ values (true) $$,
  '(5) 워커는 본인 matches 라도 cancelled_at UPDATE 차단 (UPDATE 정책 부재)'
);
rollback to c5;

select * from finish();
rollback;
