-- pgTAP · 어드민 RLS 정책 검증
-- service_role은 모든 테이블에 제한 없이 접근 가능
-- authenticated 일반 유저는 자신 데이터만 접근

begin;
select plan(8);

-- ── 픽스처 ─────────────────────────────────────────────────
insert into auth.users (id, email) values
  ('adm00000-0000-0000-0000-000000000001', 'admin@ilgam.kr'),
  ('wk100000-0000-0000-0000-000000000001', 'worker1@test.com'),
  ('wk200000-0000-0000-0000-000000000002', 'worker2@test.com');

insert into public.profiles (id, display_name, phone_e164) values
  ('adm00000-0000-0000-0000-000000000001', '관리자',    '+821099999999'),
  ('wk100000-0000-0000-0000-000000000001', '워커1',     '+821011110001'),
  ('wk200000-0000-0000-0000-000000000002', '워커2',     '+821011110002');

insert into public.workers (id, profile_id) values
  ('wk100000-wwww-0000-0000-000000000001', 'wk100000-0000-0000-0000-000000000001'),
  ('wk200000-wwww-0000-0000-000000000002', 'wk200000-0000-0000-0000-000000000002');

-- ── Test 1-2: service_role은 RLS 우회 ────────────────────
set local role service_role;

select is(
  (select count(*)::int from public.profiles),
  3,
  'service_role은 모든 프로파일을 볼 수 있다'
);

select is(
  (select count(*)::int from public.workers),
  2,
  'service_role은 모든 워커를 볼 수 있다'
);

-- ── Test 3-5: 워커는 본인 프로파일만 볼 수 있다 ─────────
set local role authenticated;
set local request.jwt.claims = '{"sub":"wk100000-0000-0000-0000-000000000001","role":"authenticated"}';

select is(
  (select count(*)::int from public.profiles where id = auth.uid()),
  1,
  '워커1은 자신의 프로파일 1건을 볼 수 있다'
);

select is(
  (select count(*)::int from public.profiles where id != auth.uid()),
  0,
  '워커1은 다른 사람의 프로파일을 볼 수 없다'
);

select is(
  (select display_name from public.profiles where id = auth.uid()),
  '워커1',
  '워커1 본인 프로파일 display_name 정확'
);

-- ── Test 6-7: 워커는 본인 worker 레코드만 접근 가능 ──────
select is(
  (select count(*)::int from public.workers where profile_id = auth.uid()),
  1,
  '워커1은 자신의 workers 레코드 1건을 볼 수 있다'
);

select is(
  (select count(*)::int from public.workers where profile_id != auth.uid()),
  0,
  '워커1은 다른 워커 레코드를 볼 수 없다'
);

-- ── Test 8: 워커는 자신의 프로파일을 수정할 수 있다 ─────
select lives_ok(
  $$update public.profiles set display_name = '워커1수정' where id = 'wk100000-0000-0000-0000-000000000001'$$,
  '워커는 자신의 프로파일을 수정할 수 있다'
);

select * from finish();
rollback;
