-- 02_rls_employer_scope.sql · RLS 고용주 축 검증 (ADR-005)
-- 8 assert: employers/employer_members/jobs/matches/shifts/payments 고용주 정책

begin;
select plan(8);

-- ── RLS 활성 여부 ────────────────────────────────────────
select ok(
  (select relrowsecurity from pg_class where oid = 'public.employers'::regclass),
  'employers: RLS 활성'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.employer_members'::regclass),
  'employer_members: RLS 활성'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.jobs'::regclass),
  'jobs: RLS 활성'
);

-- ── 고용주 축 정책 존재 ──────────────────────────────────
select ok(
  exists (select 1 from pg_policies
          where schemaname='public' and tablename='jobs'
            and policyname='jobs_public_read'),
  'jobs_public_read 정책 존재 (open 공고 공개 읽기)'
);
select ok(
  exists (select 1 from pg_policies
          where schemaname='public' and tablename='jobs'
            and policyname='jobs_employer_write'),
  'jobs_employer_write 정책 존재 (고용주 쓰기 권한)'
);
select ok(
  exists (select 1 from pg_policies
          where schemaname='public' and tablename='matches'
            and policyname='matches_employer'),
  'matches_employer 정책 존재'
);
select ok(
  exists (select 1 from pg_policies
          where schemaname='public' and tablename='shifts'
            and policyname='shifts_employer'),
  'shifts_employer 정책 존재'
);
select ok(
  exists (select 1 from pg_policies
          where schemaname='public' and tablename='payments'
            and policyname='payments_employer_read'),
  'payments_employer_read 정책 존재'
);

select * from finish();
rollback;
