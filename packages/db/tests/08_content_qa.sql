-- pgTAP · 컨텐츠 QA 파이프라인 (ADR-010, 0006_pivot_to_free_model)
-- 4 케이스: (1) consulting 카테고리 시급 면제 (2) 워커 RLS qa_status='approved' 강제
--          (3) content_reports INSERT → jobs.qa_status='flagged' 자동 (4) 운영자 audit trail
-- pg_prove single-plan-per-file 패턴 (savepoint 미사용 — pgTAP counter rollback 회피)

begin;
select plan(4);

-- ───────────────────────────────────────────────────────────
-- (1) consulting 카테고리는 시급 200K 가능 (ADR-010 시급 외삽 면제)
--     check 제약이 consulting + 시급 200K 조합 허용하는지 검증
-- ───────────────────────────────────────────────────────────
insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-c0c0c0c0c0c0', 'consulting@test');
insert into public.profiles (id, role) values
  ('11111111-1111-4111-8111-c0c0c0c0c0c0', 'employer');
insert into public.employers (id, biz_name, biz_reg_number_encrypted, biz_reg_number_hash, contact_name, contact_phone_e164)
  values ('22222222-2222-4222-8222-c0c0c0c0c0c0', 'AI Startup', '\x00', '\x01', 'CEO', '+8210');
insert into public.regions (dong_code, sido, sigungu, dong) values ('1168010100','S','강남구','역삼동');

insert into public.jobs (id, employer_id, title, description, dong_code, shift_start_at, shift_end_at, hourly_wage_krw, category)
  values (
    'aaaaaaaa-1111-4aaa-8aaa-c0c0c0c0c0c0',
    '22222222-2222-4222-8222-c0c0c0c0c0c0',
    'AI 스타트업 시니어 기술자문',
    '시리즈 A 스타트업 ML/플랫폼 자문 월 4회',
    '1168010100',
    now() + interval '7 days',
    now() + interval '7 days 4 hours',
    200000,  -- ₩200K, 일반 카테고리는 외삽 룰 flagged
    'consulting'
  );

select results_eq(
  $$ select category from public.jobs where id = 'aaaaaaaa-1111-4aaa-8aaa-c0c0c0c0c0c0' $$,
  $$ values ('consulting'::text) $$,
  '(1) consulting 카테고리 + 시급 200K 정상 INSERT 허용 (DB check 제약)'
);

-- ───────────────────────────────────────────────────────────
-- (2) 워커 RLS: qa_status='pending' 공고는 SELECT 0 rows
-- ───────────────────────────────────────────────────────────
insert into auth.users (id, email) values
  ('33333333-3333-4333-8333-c0c0c0c0c0c0', 'worker@test');
insert into public.profiles (id, role) values
  ('33333333-3333-4333-8333-c0c0c0c0c0c0', 'worker');
insert into public.workers (id, profile_id) values
  ('44444444-4444-4444-8444-c0c0c0c0c0c0', '33333333-3333-4333-8333-c0c0c0c0c0c0');

-- jobs 행은 default qa_status='pending'으로 INSERT (위 case 1 의 행)
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"33333333-3333-4333-8333-c0c0c0c0c0c0","role":"authenticated"}';

select results_eq(
  $$ select count(*)::bigint from public.jobs where id = 'aaaaaaaa-1111-4aaa-8aaa-c0c0c0c0c0c0' $$,
  $$ values (0::bigint) $$,
  '(2) qa_status=pending 공고는 워커 SELECT 차단 (RLS jobs_select)'
);
reset role;

-- ───────────────────────────────────────────────────────────
-- (3) content_reports INSERT → 트리거가 jobs.qa_status='flagged'로 변경
-- ───────────────────────────────────────────────────────────
-- 먼저 approved 상태로 만들기
update public.jobs set qa_status = 'approved'
  where id = 'aaaaaaaa-1111-4aaa-8aaa-c0c0c0c0c0c0';

insert into auth.users (id, email) values
  ('55555555-5555-4555-8555-c0c0c0c0c0c0', 'reporter@test');
insert into public.profiles (id, role) values
  ('55555555-5555-4555-8555-c0c0c0c0c0c0', 'worker');

insert into public.content_reports (job_id, reporter_profile_id, reporter_role, category, description)
  values (
    'aaaaaaaa-1111-4aaa-8aaa-c0c0c0c0c0c0',
    '55555555-5555-4555-8555-c0c0c0c0c0c0',
    'worker',
    'wage_unpaid',
    '시급 미지급 의심'
  );

select results_eq(
  $$ select qa_status from public.jobs where id = 'aaaaaaaa-1111-4aaa-8aaa-c0c0c0c0c0c0' $$,
  $$ values ('flagged'::text) $$,
  '(3) content_reports INSERT 시 jobs.qa_status 자동 flagged (trg_report_shadow_hide)'
);

-- ───────────────────────────────────────────────────────────
-- (4) 운영자 결정 후 audit trail: jobs.qa_classifier='operator' + qa_reviewed_by 기록
-- ───────────────────────────────────────────────────────────
insert into auth.users (id, email) values
  ('66666666-6666-4666-8666-c0c0c0c0c0c0', 'op@test');
insert into public.profiles (id, role) values
  ('66666666-6666-4666-8666-c0c0c0c0c0c0', 'admin');
insert into public.platform_admins (profile_id, active, role, mfa_enrolled, last_mfa_at)
  values ('66666666-6666-4666-8666-c0c0c0c0c0c0', true, 'operator', true, now());

-- 운영자 직접 갱신 (Server Action decideQa 시뮬레이션)
update public.jobs set
  qa_status = 'approved',
  qa_classifier = 'operator',
  qa_reviewed_by = '66666666-6666-4666-8666-c0c0c0c0c0c0',
  qa_reviewed_at = now(),
  qa_reason = 'manual_review_passed'
  where id = 'aaaaaaaa-1111-4aaa-8aaa-c0c0c0c0c0c0';

select results_eq(
  $$
    select qa_classifier::text || '|' || (qa_reviewed_by is not null)::text
      from public.jobs where id = 'aaaaaaaa-1111-4aaa-8aaa-c0c0c0c0c0c0'
  $$,
  $$ values ('operator|true'::text) $$,
  '(4) 운영자 결정 후 jobs.qa_classifier=operator + qa_reviewed_by 기록 (audit trail)'
);

select * from finish();
rollback;
