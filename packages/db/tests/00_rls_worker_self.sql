-- 00_rls_worker_self.sql · RLS 워커 자기본위 축 검증 (ADR-005)
-- 6 assert: workers/shifts/payments 3테이블의 RLS 활성 + 정책 존재

begin;
select plan(6);

-- ── RLS 활성 여부 (pg_class.relrowsecurity) ──────────────
select ok(
  (select relrowsecurity from pg_class where oid = 'public.workers'::regclass),
  'workers: RLS 활성'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.shifts'::regclass),
  'shifts: RLS 활성'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.payments'::regclass),
  'payments: RLS 활성'
);

-- ── 워커 본인 축 정책 존재 ───────────────────────────────
select ok(
  exists (select 1 from pg_policies
          where schemaname='public' and tablename='workers'
            and policyname='workers_self'),
  'workers_self 정책 존재'
);
select ok(
  exists (select 1 from pg_policies
          where schemaname='public' and tablename='shifts'
            and policyname='shifts_worker'),
  'shifts_worker 정책 존재'
);
select ok(
  exists (select 1 from pg_policies
          where schemaname='public' and tablename='payments'
            and policyname='payments_worker_read'),
  'payments_worker_read 정책 존재'
);

select * from finish();
rollback;
