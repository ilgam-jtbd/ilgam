-- 04_pii_schema_isolation.sql · private 스키마 격리 + API 노출 차단 (ADR-005)
-- 4 assert: private.workers_tax_identity 가 anon/authenticated 에 노출되지 않음

begin;
select plan(4);

-- ── private 스키마 존재 ──────────────────────────────────
select ok(
  exists (select 1 from information_schema.schemata where schema_name = 'private'),
  'private 스키마 존재'
);

-- ── 민감 PII 테이블 존재 ────────────────────────────────
select ok(
  exists (
    select 1 from information_schema.tables
    where table_schema = 'private' and table_name = 'workers_tax_identity'
  ),
  'private.workers_tax_identity 테이블 존재 (RRN·계좌 암호화 보관)'
);

-- ── anon 은 private.workers_tax_identity 접근 권한 0건 ──
select ok(
  not exists (
    select 1 from information_schema.role_table_grants
    where grantee = 'anon'
      and table_schema = 'private'
      and table_name = 'workers_tax_identity'
  ),
  'anon: private.workers_tax_identity 접근 권한 없음 (revoke 완료)'
);

-- ── authenticated 은 private.workers_tax_identity 접근 권한 0건 ──
select ok(
  not exists (
    select 1 from information_schema.role_table_grants
    where grantee = 'authenticated'
      and table_schema = 'private'
      and table_name = 'workers_tax_identity'
  ),
  'authenticated: private.workers_tax_identity 접근 권한 없음 (revoke 완료)'
);

select * from finish();
rollback;
