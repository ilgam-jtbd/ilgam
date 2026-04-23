# ERD — Entity Relationship (v1)

```
profiles (auth.users 확장)
  ├─ workers (시니어 워커)                    [1:1]
  │    └─ private.workers_tax_identity         [1:1] (PII 분리 스키마)
  ├─ employer_members (고용주-담당자 매핑)     [N:M]
  └─ platform_admins

employers (법인/개인사업자)
  ├─ employer_members                          [1:N]
  └─ jobs (공고)                               [1:N]

regions (법정동 10자리)
  └─ jobs                                      [1:N]

jobs
  ├─ job_applications                          [1:N]
  └─ matches                                   [1:N]

matches (확정 매칭)
  └─ shifts (출근/퇴근 스탬프)                [1:1]

shifts
  └─ payments (정산)                          [1:1]
      └─ platform_fees (수수료 롤업)          [1:1]

notifications
  └─ notifications_outbox (큐)

reviews (양방향)
  ├─ worker → employer
  └─ employer → worker

audit_log (파티션, 월 단위)
```

## 핵심 제약

- `jobs.hourly_wage_krw >= 10030` (2026 최저임금 가드)
- `shifts.worked_minutes` = GENERATED STORED (퇴근 - 출근)
- `workers.profile_id` = FK `auth.users.id` (CASCADE DELETE SET NULL — 파기의무)
- `payments.amount_krw` = 정수, `expected == actual` webhook 멱등성
- PII 컬럼(`private.*`): pgcrypto `pgp_sym_encrypt` + Vault 키

## 인덱스 (ADR-005 발췌)

```sql
create index idx_jobs_match on jobs (status, dong_code, shift_start_at) where status='open';
create index idx_jobs_required_certs_gin on jobs using gin (required_cert_codes);
create index idx_workers_certs_gin on workers using gin (cert_codes);
create index idx_jobs_geog on jobs using gist (location_geog);
create index idx_shifts_worker_date on shifts (worker_id, clock_in_at desc);
create index idx_shifts_employer_date on shifts (employer_id, clock_in_at desc);
```

## RLS 요약 (상세 ADR-005)

| Actor | profiles | workers | employers | jobs | matches | shifts | payments |
|---|---|---|---|---|---|---|---|
| worker (self) | R | RW | R | R(open) | R(self) | R(self) | R(self) |
| employer (member) | R(team) | R | RW | RW(own) | RW(own) | RW(own) | RW(own) |
| platform_admin | R(audit) | R(audit) | R(audit) | R(audit) | R(audit) | R(audit) | R(audit) |
| anon | R(public) | — | — | R(open-basic) | — | — | — |
