-- pgTAP · 구인자(employer) RLS 정책 검증
-- 구인자는 자신의 jobs/job_applications만 접근 가능
-- 실행 방법: supabase test db (pgTAP 확장 필요)

begin;
select plan(12);

-- ── 픽스처 ─────────────────────────────────────────────────
-- 프로파일 2개 (구인자 A, 구인자 B)
insert into auth.users (id, email) values
  ('ea000000-0000-0000-0000-000000000001', 'employer_a@test.com'),
  ('eb000000-0000-0000-0000-000000000002', 'employer_b@test.com');

insert into public.profiles (id, display_name, phone_e164) values
  ('ea000000-0000-0000-0000-000000000001', '테스트구인자A', '+821011111111'),
  ('eb000000-0000-0000-0000-000000000002', '테스트구인자B', '+821022222222');

insert into public.employers (id, profile_id, biz_name, biz_reg_no, approved) values
  ('ea000000-eeee-0000-0000-000000000001', 'ea000000-0000-0000-0000-000000000001', 'A사', '1234567890', true),
  ('eb000000-eeee-0000-0000-000000000002', 'eb000000-0000-0000-0000-000000000002', 'B사', '0987654321', true);

-- 공고 2개 (A사, B사)
insert into public.jobs (id, employer_id, title, dong_code, shift_start_at, shift_end_at, hourly_wage_krw, status) values
  ('ja000000-0000-0000-0000-000000000001', 'ea000000-eeee-0000-0000-000000000001', 'A사 공고', '1150010100', now() + interval '1 day', now() + interval '1 day 4 hours', 12000, 'open'),
  ('jb000000-0000-0000-0000-000000000002', 'eb000000-eeee-0000-0000-000000000002', 'B사 공고', '1150010100', now() + interval '1 day', now() + interval '1 day 4 hours', 13000, 'open');

-- ── Test 1-3: 구인자 A는 자신의 공고를 볼 수 있다 ──────────
set local role authenticated;
set local request.jwt.claims = '{"sub":"ea000000-0000-0000-0000-000000000001","role":"authenticated"}';

select is(
  (select count(*)::int from public.jobs where employer_id = 'ea000000-eeee-0000-0000-000000000001'),
  1,
  '구인자 A는 자신의 공고 1건을 볼 수 있다'
);

select is(
  (select count(*)::int from public.jobs where employer_id = 'eb000000-eeee-0000-0000-000000000002'),
  0,
  '구인자 A는 B사 공고를 볼 수 없다 (RLS)'
);

select is(
  (select count(*)::int from public.jobs),
  1,
  '구인자 A 세션: 전체 jobs 조회 결과는 본인 공고만 1건'
);

-- ── Test 4-6: 구인자 B 전환 ──────────────────────────────
set local request.jwt.claims = '{"sub":"eb000000-0000-0000-0000-000000000002","role":"authenticated"}';

select is(
  (select count(*)::int from public.jobs where employer_id = 'eb000000-eeee-0000-0000-000000000002'),
  1,
  '구인자 B는 자신의 공고 1건을 볼 수 있다'
);

select is(
  (select count(*)::int from public.jobs where employer_id = 'ea000000-eeee-0000-0000-000000000001'),
  0,
  '구인자 B는 A사 공고를 볼 수 없다 (RLS)'
);

select is(
  (select count(*)::int from public.jobs),
  1,
  '구인자 B 세션: 전체 jobs 조회 결과는 본인 공고만 1건'
);

-- ── Test 7-9: job_applications RLS ───────────────────────
-- 워커 1명 추가
insert into auth.users (id, email) values ('wk000000-0000-0000-0000-000000000001', 'worker@test.com');
insert into public.profiles (id, display_name, phone_e164) values ('wk000000-0000-0000-0000-000000000001', '테스트워커', '+821033333333');
insert into public.workers (id, profile_id) values ('wk000000-wwww-0000-0000-000000000001', 'wk000000-0000-0000-0000-000000000001');

-- A사 공고에 지원
insert into public.job_applications (id, job_id, worker_id, status) values
  ('app00000-0000-0000-0000-000000000001', 'ja000000-0000-0000-0000-000000000001', 'wk000000-wwww-0000-0000-000000000001', 'pending');

-- A사 구인자: 자신의 공고 지원자 조회
set local request.jwt.claims = '{"sub":"ea000000-0000-0000-0000-000000000001","role":"authenticated"}';

select is(
  (select count(*)::int from public.job_applications),
  1,
  '구인자 A는 자신의 공고 지원자를 볼 수 있다'
);

-- B사 구인자: A사 공고 지원자 조회 불가
set local request.jwt.claims = '{"sub":"eb000000-0000-0000-0000-000000000002","role":"authenticated"}';

select is(
  (select count(*)::int from public.job_applications),
  0,
  '구인자 B는 A사 공고 지원자를 볼 수 없다 (RLS)'
);

-- 구인자 A: 지원자 수락 가능
set local request.jwt.claims = '{"sub":"ea000000-0000-0000-0000-000000000001","role":"authenticated"}';

select lives_ok(
  $$update public.job_applications set status = 'accepted' where id = 'app00000-0000-0000-0000-000000000001'$$,
  '구인자 A는 자신의 공고 지원자를 accepted로 수락할 수 있다'
);

-- ── Test 10-12: 지원자 수락 → matches 자동 생성 ──────────
select is(
  (select count(*)::int from public.matches where job_id = 'ja000000-0000-0000-0000-000000000001'),
  1,
  'accepted 수락 시 matches 레코드가 자동 생성된다'
);

select is(
  (select employer_id from public.matches where job_id = 'ja000000-0000-0000-0000-000000000001'),
  'ea000000-eeee-0000-0000-000000000001',
  'matches.employer_id가 올바르게 설정된다'
);

-- 워커는 자신을 rejected로 변경 불가 (withdrawn만 가능)
set local request.jwt.claims = '{"sub":"wk000000-0000-0000-0000-000000000001","role":"authenticated"}';

select throws_ok(
  $$update public.job_applications set status = 'rejected' where id = 'app00000-0000-0000-0000-000000000001'$$,
  '42501',
  null,
  '워커는 지원 상태를 rejected로 바꿀 수 없다 (RLS check)'
);

select * from finish();
rollback;
