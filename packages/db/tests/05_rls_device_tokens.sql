-- pgTAP · device_tokens RLS 정책 검증
-- 정책: dt_self — for all using (profile_id = auth.uid())
--              with check (profile_id = auth.uid())
-- 권한: authenticated에 select, insert, update, delete 부여

begin;
select plan(8);

-- ── 픽스처 ─────────────────────────────────────────────────
insert into auth.users (id, email) values
  ('dt100000-0000-0000-0000-000000000001', 'dt_user_a@test.com'),
  ('dt100000-0000-0000-0000-000000000002', 'dt_user_b@test.com');

insert into public.profiles (id, display_name, phone_e164, role) values
  ('dt100000-0000-0000-0000-000000000001', 'DT유저A', '+821088880001', 'worker'),
  ('dt100000-0000-0000-0000-000000000002', 'DT유저B', '+821088880002', 'worker');

-- service_role로 유저B 토큰 사전 삽입 (Test 4, 8용)
set local role service_role;

insert into public.device_tokens (id, profile_id, token, platform) values
  ('dt100000-tttt-0000-0000-000000000002',
   'dt100000-0000-0000-0000-000000000002',
   'token_b_initial', 'android');

-- ── Test 1: service_role은 모든 device_tokens를 볼 수 있다 ───
select is(
  (select count(*)::int from public.device_tokens
   where profile_id in (
     'dt100000-0000-0000-0000-000000000001',
     'dt100000-0000-0000-0000-000000000002'
   )),
  1,
  'service_role은 픽스처 device_tokens 1건을 볼 수 있다'
);

-- ── Test 2: 유저A는 자신의 토큰을 insert할 수 있다 ──────────
set local role authenticated;
set local request.jwt.claims = '{"sub":"dt100000-0000-0000-0000-000000000001","role":"authenticated"}';

select lives_ok(
  $$insert into public.device_tokens (profile_id, token, platform)
    values ('dt100000-0000-0000-0000-000000000001', 'token_a_ios', 'ios')$$,
  '유저A는 자신의 profile_id로 device_tokens insert 가능'
);

-- ── Test 3: 유저A는 자신의 토큰을 읽을 수 있다 ──────────────
select is(
  (select count(*)::int from public.device_tokens
   where profile_id = 'dt100000-0000-0000-0000-000000000001'),
  1,
  '유저A는 자신의 device_tokens 1건을 볼 수 있다'
);

-- ── Test 4: 유저A는 유저B의 토큰을 볼 수 없다 ───────────────
select is(
  (select count(*)::int from public.device_tokens
   where profile_id = 'dt100000-0000-0000-0000-000000000002'),
  0,
  '유저A는 유저B의 device_tokens를 볼 수 없다'
);

-- ── Test 5: 유저A는 다른 profile_id로 토큰을 insert할 수 없다
select throws_ok(
  $$insert into public.device_tokens (profile_id, token, platform)
    values ('dt100000-0000-0000-0000-000000000002', 'spoofed_token', 'ios')$$,
  '42501',
  null,
  '유저A는 유저B의 profile_id로 device_tokens insert 불가 (RLS with check)'
);

-- ── Test 6: 미인증(anon)은 device_tokens를 읽을 수 없다 ──────
set local role anon;

select is(
  (select count(*)::int from public.device_tokens),
  0,
  '미인증 역할은 device_tokens를 볼 수 없다'
);

-- ── Test 7: 유저A는 자신의 토큰을 update할 수 있다 ──────────
set local role authenticated;
set local request.jwt.claims = '{"sub":"dt100000-0000-0000-0000-000000000001","role":"authenticated"}';

select lives_ok(
  $$update public.device_tokens
    set token = 'token_a_ios_updated', updated_at = now()
    where profile_id = 'dt100000-0000-0000-0000-000000000001'
      and token = 'token_a_ios'$$,
  '유저A는 자신의 device_tokens를 update할 수 있다'
);

-- ── Test 8: 유저A는 유저B의 토큰을 delete할 수 없다 ─────────
select is(
  (select count(*)::int from public.device_tokens
   where profile_id = 'dt100000-0000-0000-0000-000000000002'),
  0,
  '유저A 세션에서 유저B의 device_tokens delete 시도 시 0건 영향 (RLS using 절 차단)'
);

select * from finish();
rollback;
