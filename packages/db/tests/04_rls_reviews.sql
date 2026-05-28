-- pgTAP · reviews RLS 정책 검증
-- reviews_readers: shift 당사자(워커 본인 + 고용주 멤버)만 select 허용
-- insert 정책 없음 → authenticated 유저의 insert는 RLS에 의해 차단됨

begin;
select plan(10);

-- ── 픽스처 ─────────────────────────────────────────────────
insert into auth.users (id, email) values
  ('rv100000-0000-0000-0000-000000000001', 'rv_worker_a@test.com'),
  ('rv100000-0000-0000-0000-000000000002', 'rv_worker_b@test.com'),
  ('rv100000-0000-0000-0000-000000000003', 'rv_employer@test.com');

insert into public.profiles (id, display_name, phone_e164, role) values
  ('rv100000-0000-0000-0000-000000000001', 'RV워커A', '+821077770001', 'worker'),
  ('rv100000-0000-0000-0000-000000000002', 'RV워커B', '+821077770002', 'worker'),
  ('rv100000-0000-0000-0000-000000000003', 'RV구인자', '+821077770003', 'employer');

insert into public.workers (id, profile_id) values
  ('rv100000-wwww-0000-0000-000000000001', 'rv100000-0000-0000-0000-000000000001'),
  ('rv100000-wwww-0000-0000-000000000002', 'rv100000-0000-0000-0000-000000000002');

insert into public.employers (
  id, biz_name,
  biz_reg_number_encrypted, biz_reg_number_hash,
  contact_name, contact_phone_e164, approved_at
) values (
  'rv100000-eeee-0000-0000-000000000003',
  'RV테스트사',
  decode('00', 'hex'),
  decode('00', 'hex'),
  'RV구인자', '+821077770003', now()
);

insert into public.employer_members (employer_id, profile_id, role) values
  ('rv100000-eeee-0000-0000-000000000003', 'rv100000-0000-0000-0000-000000000003', 'owner');

-- regions 참조 데이터 (dong_code 외래 키 필요)
insert into public.regions (dong_code, sido, sigungu, dong)
  values ('1150010100', '서울특별시', '강남구', '역삼동')
  on conflict (dong_code) do nothing;

insert into public.jobs (
  id, employer_id, title, dong_code,
  shift_start_at, shift_end_at, hourly_wage_krw, status
) values (
  'rv100000-jjjj-0000-0000-000000000001',
  'rv100000-eeee-0000-0000-000000000003',
  'RV테스트 공고', '1150010100',
  now() + interval '1 day', now() + interval '1 day 4 hours',
  12000, 'open'
);

insert into public.matches (id, job_id, worker_id, employer_id) values
  ('rv100000-mmmm-0000-0000-000000000001',
   'rv100000-jjjj-0000-0000-000000000001',
   'rv100000-wwww-0000-0000-000000000001',
   'rv100000-eeee-0000-0000-000000000003');

insert into public.shifts (
  id, match_id, job_id, worker_id, employer_id, status
) values (
  'rv100000-ssss-0000-0000-000000000001',
  'rv100000-mmmm-0000-0000-000000000001',
  'rv100000-jjjj-0000-0000-000000000001',
  'rv100000-wwww-0000-0000-000000000001',
  'rv100000-eeee-0000-0000-000000000003',
  'pending'
);

-- service_role로 리뷰 삽입 (RLS 우회)
set local role service_role;

insert into public.reviews (id, shift_id, author_role, rating) values
  ('rv100000-rrrr-0000-0000-000000000001',
   'rv100000-ssss-0000-0000-000000000001',
   'employer', 4),
  ('rv100000-rrrr-0000-0000-000000000002',
   'rv100000-ssss-0000-0000-000000000001',
   'worker', 5);

-- ── Test 1: service_role은 모든 리뷰를 볼 수 있다 ────────────
select is(
  (select count(*)::int from public.reviews
   where shift_id = 'rv100000-ssss-0000-0000-000000000001'),
  2,
  'service_role은 픽스처 reviews 2건을 볼 수 있다'
);

-- ── Test 2: 워커A는 본인 shift의 리뷰를 볼 수 있다 ──────────
set local role authenticated;
set local request.jwt.claims = '{"sub":"rv100000-0000-0000-0000-000000000001","role":"authenticated"}';

select is(
  (select count(*)::int from public.reviews
   where shift_id = 'rv100000-ssss-0000-0000-000000000001'),
  2,
  '워커A는 자신의 shift에 달린 reviews 2건을 볼 수 있다'
);

-- ── Test 3: 워커A는 본인 shift의 employer 리뷰 내용을 확인 ───
select is(
  (select rating from public.reviews
   where shift_id = 'rv100000-ssss-0000-0000-000000000001'
     and author_role = 'employer'),
  4,
  '워커A는 자신의 shift employer 리뷰 rating을 정확히 읽는다'
);

-- ── Test 4: 워커B는 워커A의 shift 리뷰를 볼 수 없다 ─────────
set local request.jwt.claims = '{"sub":"rv100000-0000-0000-0000-000000000002","role":"authenticated"}';

select is(
  (select count(*)::int from public.reviews
   where shift_id = 'rv100000-ssss-0000-0000-000000000001'),
  0,
  '워커B는 워커A의 shift reviews를 볼 수 없다'
);

-- ── Test 5: 고용주는 자신 공고의 shifts 리뷰를 볼 수 있다 ────
set local request.jwt.claims = '{"sub":"rv100000-0000-0000-0000-000000000003","role":"authenticated"}';

select is(
  (select count(*)::int from public.reviews
   where shift_id = 'rv100000-ssss-0000-0000-000000000001'),
  2,
  '고용주는 자신 공고 shift의 reviews 2건을 볼 수 있다'
);

-- ── Test 6: 익명(anon) 역할은 reviews를 볼 수 없다 ──────────
set local role anon;

select is(
  (select count(*)::int from public.reviews
   where shift_id = 'rv100000-ssss-0000-0000-000000000001'),
  0,
  '익명 역할은 reviews를 볼 수 없다'
);

-- ── Test 7: insert 정책 없음 → 워커A의 insert는 RLS 차단 ─────
-- reviews에 select 전용 RLS 정책만 존재(reviews_readers),
-- insert 정책이 없으므로 authenticated 유저의 insert는 차단됨
set local role authenticated;
set local request.jwt.claims = '{"sub":"rv100000-0000-0000-0000-000000000001","role":"authenticated"}';

select throws_ok(
  $$insert into public.reviews (shift_id, author_role, rating)
    values ('rv100000-ssss-0000-0000-000000000001', 'worker', 3)$$,
  '42501',
  null,
  '워커A의 reviews insert는 RLS 정책 부재로 차단된다 (no insert policy)'
);

-- ── Test 8: 워커B의 insert 시도도 차단됨 ─────────────────────
set local request.jwt.claims = '{"sub":"rv100000-0000-0000-0000-000000000002","role":"authenticated"}';

select throws_ok(
  $$insert into public.reviews (shift_id, author_role, rating)
    values ('rv100000-ssss-0000-0000-000000000001', 'worker', 1)$$,
  '42501',
  null,
  '워커B도 다른 워커 shift에 reviews insert 불가 (RLS 차단)'
);

-- ── Test 9: 고용주의 insert 시도도 차단됨 ────────────────────
set local request.jwt.claims = '{"sub":"rv100000-0000-0000-0000-000000000003","role":"authenticated"}';

select throws_ok(
  $$insert into public.reviews (shift_id, author_role, rating)
    values ('rv100000-ssss-0000-0000-000000000001', 'employer', 2)$$,
  '42501',
  null,
  '고용주도 reviews insert 불가 (insert RLS 정책 없음)'
);

-- ── Test 10: service_role은 insert 가능 ──────────────────────
set local role service_role;

select lives_ok(
  $$insert into public.reviews (shift_id, author_role, rating)
    values ('rv100000-ssss-0000-0000-000000000001', 'employer', 3)
    on conflict (shift_id, author_role) do update set rating = excluded.rating$$,
  'service_role은 reviews upsert 가능'
);

select * from finish();
rollback;
