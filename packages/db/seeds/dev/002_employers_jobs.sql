-- 002_employers_jobs.sql · 데모용 고용주 + 공고 시드
-- 2026-04-24 · 배포 직후 admin-web 첫 방문 시 비어있지 않도록

-- ─── 고용주 3건 ─────────────────────────────────────────────
-- biz_reg_number_encrypted/hash 는 데모용 더미 (pgp_sym_encrypt 은 앱 레이어에서)
insert into public.employers
  (id, biz_name, biz_reg_number_encrypted, biz_reg_number_hash,
   contact_name, contact_phone_e164, biz_type, billing_email, approved_at)
values
  ('11111111-1111-1111-1111-111111111111',
   '강서 쿠팡 물류센터',
   decode('00', 'hex'), decode('01' || repeat('0', 62), 'hex'),
   '김유통', '+821012340001', 'logistics', 'biz01@example.com', now()),
  ('22222222-2222-2222-2222-222222222222',
   '송파 방이 베이커리',
   decode('00', 'hex'), decode('02' || repeat('0', 62), 'hex'),
   '박제과', '+821012340002', 'fnb', 'biz02@example.com', now()),
  ('33333333-3333-3333-3333-333333333333',
   '마포 합정 국밥',
   decode('00', 'hex'), decode('03' || repeat('0', 62), 'hex'),
   '이서빙', '+821012340003', 'fnb', 'biz03@example.com', now())
on conflict (id) do nothing;

-- ─── 공고 6건 (2026-04-25 ~ 04-27 분산) ────────────────────
-- dong_code 는 001_regions.sql 과 매칭
insert into public.jobs
  (id, employer_id, title, description, dong_code,
   shift_start_at, shift_end_at, hourly_wage_krw,
   required_cert_codes, preferred_mentor_tags, headcount, status)
values
  ('aaaa0001-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111',
   '강서 쿠팡 피킹 보조',
   '지게차 불필요 · 가벼운 물품 분류 · 서서 작업',
   '1150010400',
   '2026-04-25 09:00+09', '2026-04-25 13:00+09',
   12000, '{}', '{logistics}', 3, 'open'),

  ('aaaa0002-0000-0000-0000-000000000002',
   '11111111-1111-1111-1111-111111111111',
   '강서 쿠팡 오후 택배 분류',
   '상자 무게순 분류 · 체력 보통 수준',
   '1150010100',
   '2026-04-25 14:00+09', '2026-04-25 18:00+09',
   12500, '{}', '{logistics}', 2, 'open'),

  ('bbbb0001-0000-0000-0000-000000000001',
   '22222222-2222-2222-2222-222222222222',
   '송파 방이 베이커리 오전 프렙',
   '빵 성형 보조 · 앉아서 작업 가능 · 경험 무관',
   '1171010300',
   '2026-04-26 06:00+09', '2026-04-26 10:00+09',
   12000, '{}', '{fnb}', 1, 'open'),

  ('bbbb0002-0000-0000-0000-000000000002',
   '22222222-2222-2222-2222-222222222222',
   '송파 방이 베이커리 주말 포장',
   '완제품 포장 · 앉아서 작업',
   '1171010300',
   '2026-04-27 09:00+09', '2026-04-27 13:00+09',
   11500, '{}', '{fnb}', 2, 'open'),

  ('cccc0001-0000-0000-0000-000000000001',
   '33333333-3333-3333-3333-333333333333',
   '마포 합정 국밥집 점심 서빙',
   '주문 접수 · 상차림 · 퇴식 보조',
   '1150010500',
   '2026-04-25 10:30+09', '2026-04-25 14:30+09',
   11500, '{}', '{fnb}', 2, 'open'),

  ('cccc0002-0000-0000-0000-000000000002',
   '33333333-3333-3333-3333-333333333333',
   '마포 합정 국밥집 저녁 서빙',
   '주문 접수 · 계산 보조 · 고령자 우대',
   '1150010500',
   '2026-04-26 17:00+09', '2026-04-26 21:00+09',
   12000, '{}', '{fnb}', 2, 'open')
on conflict (id) do nothing;

-- ─── 확인용 카운트 ─────────────────────────────────────────
do $$
declare
  v_employers int;
  v_jobs int;
begin
  select count(*) into v_employers from public.employers;
  select count(*) into v_jobs from public.jobs where status = 'open';
  raise notice '[seed] employers=% open_jobs=%', v_employers, v_jobs;
end $$;
