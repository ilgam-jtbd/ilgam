-- pgTAP · shifts·payments RLS 정책 검증
-- 워커는 본인 shifts/payments 읽기만, 고용주는 자기 shifts 전체 접근

begin;
select plan(12);

-- ── 픽스처 ─────────────────────────────────────────────────
insert into auth.users (id, email) values
  ('wk300000-0000-0000-0000-000000000001', 'worker3@test.com'),
  ('wk400000-0000-0000-0000-000000000002', 'worker4@test.com'),
  ('ea300000-0000-0000-0000-000000000003', 'employer3@test.com');

insert into public.profiles (id, display_name, phone_e164) values
  ('wk300000-0000-0000-0000-000000000001', '워커3', '+821033330001'),
  ('wk400000-0000-0000-0000-000000000002', '워커4', '+821033330002'),
  ('ea300000-0000-0000-0000-000000000003', '구인자3', '+821033330003');

insert into public.workers (id, profile_id) values
  ('wk300000-wwww-0000-0000-000000000001', 'wk300000-0000-0000-0000-000000000001'),
  ('wk400000-wwww-0000-0000-000000000002', 'wk400000-0000-0000-0000-000000000002');

insert into public.employers (id, profile_id, biz_name, biz_reg_no, approved) values
  ('ea300000-eeee-0000-0000-000000000003', 'ea300000-0000-0000-0000-000000000003', 'C사', '1122334455', true);

insert into public.jobs (id, employer_id, title, dong_code, shift_start_at, shift_end_at, hourly_wage_krw, status) values
  ('jc300000-0000-0000-0000-000000000001', 'ea300000-eeee-0000-0000-000000000003', 'C사 공고', '1150010100',
   now() + interval '1 day', now() + interval '1 day 4 hours', 12000, 'open');

insert into public.matches (id, job_id, worker_id, employer_id, status) values
  ('mc300000-0000-0000-0000-000000000001', 'jc300000-0000-0000-0000-000000000001',
   'wk300000-wwww-0000-0000-000000000001', 'ea300000-eeee-0000-0000-000000000003', 'confirmed'),
  ('mc400000-0000-0000-0000-000000000002', 'jc300000-0000-0000-0000-000000000001',
   'wk400000-wwww-0000-0000-000000000002', 'ea300000-eeee-0000-0000-000000000003', 'confirmed');

insert into public.shifts (id, match_id, job_id, worker_id, employer_id, status) values
  ('sh300000-0000-0000-0000-000000000001', 'mc300000-0000-0000-0000-000000000001',
   'jc300000-0000-0000-0000-000000000001',
   'wk300000-wwww-0000-0000-000000000001', 'ea300000-eeee-0000-0000-000000000003', 'pending'),
  ('sh400000-0000-0000-0000-000000000002', 'mc400000-0000-0000-0000-000000000002',
   'jc300000-0000-0000-0000-000000000001',
   'wk400000-wwww-0000-0000-000000000002', 'ea300000-eeee-0000-0000-000000000003', 'pending');

insert into public.payments (id, shift_id, worker_id, employer_id, gross_amount_krw, platform_fee_rate, platform_fee_krw, worker_net_krw, status) values
  ('py300000-0000-0000-0000-000000000001', 'sh300000-0000-0000-0000-000000000001',
   'wk300000-wwww-0000-0000-000000000001', 'ea300000-eeee-0000-0000-000000000003',
   48000, 0.15, 7200, 40800, 'pending'),
  ('py400000-0000-0000-0000-000000000002', 'sh400000-0000-0000-0000-000000000002',
   'wk400000-wwww-0000-0000-000000000002', 'ea300000-eeee-0000-0000-000000000003',
   36000, 0.15, 5400, 30600, 'pending');

-- ── Test 1-3: service_role은 shifts·payments 전체 접근 ──────
set local role service_role;

select is(
  (select count(*)::int from public.shifts),
  2,
  'service_role은 모든 shifts를 볼 수 있다'
);

select is(
  (select count(*)::int from public.payments),
  2,
  'service_role은 모든 payments를 볼 수 있다'
);

-- ── Test 3-5: 워커3는 본인 shift만 조회 ─────────────────
set local role authenticated;
set local request.jwt.claims = '{"sub":"wk300000-0000-0000-0000-000000000001","role":"authenticated"}';

select is(
  (select count(*)::int from public.shifts),
  1,
  '워커3는 자신의 shift 1건만 볼 수 있다'
);

select is(
  (select count(*)::int from public.shifts where id = 'sh400000-0000-0000-0000-000000000002'),
  0,
  '워커3는 워커4의 shift를 볼 수 없다'
);

select is(
  (select status from public.shifts where id = 'sh300000-0000-0000-0000-000000000001'),
  'pending',
  '워커3의 shift 상태 정확'
);

-- ── Test 6-7: 워커3는 본인 payment만 조회 ────────────────
select is(
  (select count(*)::int from public.payments),
  1,
  '워커3는 자신의 payment 1건만 볼 수 있다'
);

select is(
  (select count(*)::int from public.payments where id = 'py400000-0000-0000-0000-000000000002'),
  0,
  '워커3는 워커4의 payment를 볼 수 없다'
);

-- ── Test 8-10: 워커4 전환 ─────────────────────────────────
set local request.jwt.claims = '{"sub":"wk400000-0000-0000-0000-000000000002","role":"authenticated"}';

select is(
  (select count(*)::int from public.shifts),
  1,
  '워커4는 자신의 shift 1건만 볼 수 있다'
);

select is(
  (select count(*)::int from public.payments),
  1,
  '워커4는 자신의 payment 1건만 볼 수 있다'
);

-- ── Test 11-12: 구인자3는 자신 공고의 shifts·payments 조회 ──
set local request.jwt.claims = '{"sub":"ea300000-0000-0000-0000-000000000003","role":"authenticated"}';

select is(
  (select count(*)::int from public.shifts),
  2,
  '구인자3는 자신 공고의 모든 shifts(2건)를 볼 수 있다'
);

select is(
  (select count(*)::int from public.payments),
  2,
  '구인자3는 자신 공고의 모든 payments(2건)를 볼 수 있다'
);

select * from finish();
rollback;
