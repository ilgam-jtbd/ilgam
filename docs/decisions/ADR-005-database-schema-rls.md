# ADR-005 · DB 스키마 · RLS · PII 저장 (v2 — Free Model)

- **상태**: Accepted (v2)
- **일자**: 2026-04-24 (v1 2026-04-23 — 변경 이력 §참조)
- **참여 에이전트**: DB, Backend, QA

## PII 저장 원칙 — 유지

**주민번호 원칙 미저장**. 본인확인(PASS/NICE) 시 CI/DI 토큰 + 생년월일·성별 4자리만 `workers.ci_token`, `workers.birth_ymd` 보관. 세금계산서·원천징수 불가피 시 `private.workers_tax_identity` (Vault 키 + `pgp_sym_encrypt`).

**피벗 영향 (낮음)**: 정산 흐름 폐기로 원천징수 불가피성 자체가 줄어듬. 단, 광고 매출 도래 시 광고주 측 세무 분리 별도 설계 필요.

## RLS 정책 3대 축 — 유지 + 추가 1축

```sql
-- helper 함수 (기존)
create or replace function app.current_employer_ids() ...
create or replace function app.is_platform_admin() ...

-- 신규 (피벗) — 워커가 보는 공고는 qa_status='approved' 한정
create or replace function app.is_qa_approved(p_job_id uuid)
  returns boolean language sql stable as $$
  select exists (select 1 from public.jobs
                 where id = p_job_id and qa_status = 'approved') $$;
```

- **워커**: 본인 `profile_id = auth.uid()` 행만 + **`jobs` SELECT 시 `qa_status='approved'` 강제**
- **고용주**: `employer_id IN app.current_employer_ids()` (자기 공고는 status 무관 SELECT)
- **어드민**: `app.log_admin_access()` + SECURITY DEFINER 우회
- **anon (마케팅 페이지)**: `qa_status='approved'`만 SELECT (랜딩 통계 카드 안전 노출)

## 인덱스 전략 — 보강

```sql
create index idx_jobs_match on public.jobs
  (qa_status, status, dong_code, shift_start_at)  -- qa_status 추가
  where qa_status = 'approved' and status = 'open' and shift_start_at > now();

create index idx_jobs_qa_pending on public.jobs (qa_status, created_at)
  where qa_status in ('pending', 'flagged');  -- 운영자 큐 빠른 조회

create index idx_jobs_required_certs_gin on public.jobs using gin (required_cert_codes);
create index idx_workers_certs_gin on public.workers using gin (cert_codes);
create index idx_jobs_geog on public.jobs using gist (location_geog);
```

## Soft vs Hard Delete — 단순화

**분리 원칙** (피벗):
- PII (이메일·주민번호·연락처·계좌): 탈퇴 시 즉시 하드 삭제 또는 `NULL`
- 거래기록 (`shifts`·`matches`): `worker_id`를 영구 익명 UUID(`00000000-...`)로 치환 → 감사 추적성만
- **`payments` 폐기** → `ad_payments` (M18+ 광고 결제만, 기본 비어있음)
- `audit_log` 파티션 테이블 — 동일

## 정산·수수료 롤업 — 폐기

**삭제됨**:
- `payments_pending` / `payments_settled` 흐름 → 직거래로 대체
- `platform_fees_daily` materialized view → 폐기 (수수료 0%)
- `pg_cron` PortOne 송금 훅 → 폐기

**대체** (Phase 2 dormant):
- `ad_slots`, `ad_payments` (ADR-011) — M18 트리거 시 활성

## 핵심 스키마 변경 (피벗)

`packages/db/migrations/0006_pivot_to_free_model.sql` 적용:

```sql
-- jobs 에 QA 컬럼
alter table public.jobs add column qa_status text not null default 'pending'
  check (qa_status in ('pending','approved','rejected','flagged'));
alter table public.jobs add column qa_reason text;
alter table public.jobs add column qa_classifier text
  check (qa_classifier in ('auto','claude','operator','report'));
alter table public.jobs add column qa_reviewed_by uuid references public.profiles(id);
alter table public.jobs add column qa_reviewed_at timestamptz;
alter table public.jobs add column qa_confidence numeric(4,3);

-- 신규 테이블
create table public.content_qa_rules (
  id uuid primary key default gen_random_uuid(),
  rule_type text not null check (rule_type in ('keyword_block','url_block','wage_outlier','pattern_block')),
  pattern text not null,
  category text,  -- 성인·도박·MLM·사기·불법 등
  active boolean not null default true,
  created_at timestamptz default now(),
  created_by uuid references public.profiles(id)
);

create table public.content_reports (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id),
  reporter_profile_id uuid references public.profiles(id),
  reporter_role text not null check (reporter_role in ('worker','employer','operator','external')),
  category text not null,
  description text,
  status text not null default 'open'
    check (status in ('open','resolved','dismissed')),
  shadow_hidden_at timestamptz,  -- 즉시 숨김
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id),
  resolution text,
  created_at timestamptz default now()
);

-- 광고 (M18 dormant)
create table public.ad_slots (
  id uuid primary key default gen_random_uuid(),
  slot_type text not null check (slot_type in ('top_banner','category_premium','b2b_premium','data_insights')),
  active boolean not null default false,  -- M18 활성화 게이트
  ...
);

create table public.ad_payments (
  ...  -- payments 의 광고 전용 후속
);

-- 폐기
drop table if exists public.platform_fees_daily;
-- payments 는 즉시 drop 하지 않고 ad_payments 와 공존, M2 정리 PR 에서 drop
```

## RLS 테스트 (ADR-007 연계)

기존 24케이스 + **신규**:
- QA 정책 4 케이스 (자동 통과 / 자동 반려 / 수동 승인 / 신고 격리) — ADR-010 §pgTAP
- 워커 SELECT 가 `qa_status='approved'` 만 반환하는지 cross-tenant 검증

## 변경 이력

### v1 → v2 (2026-04-24)

| 변경 | v1 | v2 |
|---|---|---|
| `payments` 테이블 | 활성 (정산 흐름) | 폐기 → `ad_payments` (M18 dormant) |
| `platform_fees_daily` | materialized view 활성 | 폐기 |
| `shifts` 정산 트리거 | 출근/퇴근 → payments_pending insert | DROP (출퇴근 인증만 유지) |
| `jobs` 컬럼 | 기본 12개 | + qa_status, qa_reason, qa_classifier, qa_reviewed_by, qa_reviewed_at, qa_confidence |
| 신규 테이블 | — | `content_qa_rules`, `content_reports`, `ad_slots`, `ad_payments` |
| RLS 워커 SELECT | `status='open'` | + `qa_status='approved'` 강제 |
| RLS anon | jobs `status='open'` | + `qa_status='approved'` |

피벗 사유: ADR-002/004 v2와 정합. 광고 모델은 M18 트리거 활성화(ADR-011).
