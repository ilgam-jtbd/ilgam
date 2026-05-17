-- pgTAP · 워커 본인만 자신의 profiles·workers 읽기 검증
-- set local role authenticated + JWT claims 방식으로 RLS 검증

begin;
select plan(10);

-- ── 픽스처 ─────────────────────────────────────────────────
insert into auth.users (id, email) values
  ('wa100000-0000-0000-0000-000000000001', 'worker_a@test.com'),
  ('wb100000-0000-0000-0000-000000000002', 'worker_b@test.com');

insert into public.profiles (id, display_name, phone_e164, role) values
  ('wa100000-0000-0000-0000-000000000001', '워커A', '+821011110001', 'worker'),
  ('wb100000-0000-0000-0000-000000000002', '워커B', '+821011110002', 'worker');

insert into public.workers (id, profile_id) values
  ('wa100000-wwww-0000-0000-000000000001', 'wa100000-0000-0000-0000-000000000001'),
  ('wb100000-wwww-0000-0000-000000000002', 'wb100000-0000-0000-0000-000000000002');

-- ── Test 1-3: service_role은 모든 profiles·workers 접근 ────
set local role service_role;

select is(
  (select count(*)::int from public.profiles
   where id in ('wa100000-0000-0000-0000-000000000001','wb100000-0000-0000-0000-000000000002')),
  2,
  'service_role은 픽스처 profiles 2건을 볼 수 있다'
);

select is(
  (select count(*)::int from public.workers
   where id in ('wa100000-wwww-0000-0000-000000000001','wb100000-wwww-0000-0000-000000000002')),
  2,
  'service_role은 픽스처 workers 2건을 볼 수 있다'
);

-- ── Test 3-6: 워커A는 본인 profile·worker만 조회 ────────────
set local role authenticated;
set local request.jwt.claims = '{"sub":"wa100000-0000-0000-0000-000000000001","role":"authenticated"}';

select is(
  (select count(*)::int from public.profiles
   where id in ('wa100000-0000-0000-0000-000000000001','wb100000-0000-0000-0000-000000000002')),
  1,
  '워커A는 자신의 profile만 볼 수 있다'
);

select is(
  (select display_name from public.profiles where id = 'wa100000-0000-0000-0000-000000000001'),
  '워커A',
  '워커A의 display_name 정확'
);

select is(
  (select count(*)::int from public.profiles where id = 'wb100000-0000-0000-0000-000000000002'),
  0,
  '워커A는 워커B의 profile을 볼 수 없다'
);

select is(
  (select count(*)::int from public.workers
   where id in ('wa100000-wwww-0000-0000-000000000001','wb100000-wwww-0000-0000-000000000002')),
  1,
  '워커A는 자신의 workers 레코드만 볼 수 있다'
);

-- ── Test 7-10: 워커B 전환 ────────────────────────────────────
set local request.jwt.claims = '{"sub":"wb100000-0000-0000-0000-000000000002","role":"authenticated"}';

select is(
  (select count(*)::int from public.profiles where id = 'wa100000-0000-0000-0000-000000000001'),
  0,
  '워커B는 워커A의 profile을 볼 수 없다'
);

select is(
  (select count(*)::int from public.profiles where id = 'wb100000-0000-0000-0000-000000000002'),
  1,
  '워커B는 자신의 profile을 볼 수 있다'
);

select is(
  (select count(*)::int from public.workers where profile_id = 'wa100000-0000-0000-0000-000000000001'),
  0,
  '워커B는 워커A의 workers 레코드를 볼 수 없다'
);

select is(
  (select count(*)::int from public.workers where profile_id = 'wb100000-0000-0000-0000-000000000002'),
  1,
  '워커B는 자신의 workers 레코드를 볼 수 있다'
);

select * from finish();
rollback;
