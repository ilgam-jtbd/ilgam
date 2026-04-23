# ADR-005 · DB 스키마 · RLS · PII 저장

- **상태**: Accepted
- **일자**: 2026-04-23
- **참여 에이전트**: DB, Backend, QA

## PII 저장 원칙

**주민번호 원칙 미저장**. 본인확인(PASS/NICE) 시 CI/DI 토큰과 생년월일·성별 4자리만 `workers.ci_token`, `workers.birth_ymd` 보관. 세금계산서·원천징수 불가피 시 **별도 스키마 `private.workers_tax_identity`** 로 분리, Supabase Vault 키로 `pgp_sym_encrypt` — DB 관리자도 평문 접근 불가. 계좌·사업자번호는 컬럼 단위 암호화 + 마스킹(뒤 4자리만 표시).

**법적 근거**: 개인정보보호법 제29조 안전성 조치 + 신용정보법 제19조 기술적 보호조치 동시 충족.

## RLS 정책 3대 축

```sql
-- helper 함수
create or replace function app.current_employer_ids()
  returns setof uuid language sql stable security definer as $$
  select employer_id from public.employer_members
  where profile_id = auth.uid() and revoked_at is null $$;

create or replace function app.is_platform_admin()
  returns boolean language sql stable security definer as $$
  select exists (select 1 from public.platform_admins
                 where profile_id = auth.uid() and active) $$;
```

정책 함수는 `stable` + `SECURITY DEFINER`. `USING` / `WITH CHECK` 양쪽 동일 조건.

- **워커**: 본인 `profile_id = auth.uid()` 행만
- **고용주**: `employer_id IN app.current_employer_ids()`
- **어드민**: `app.log_admin_access()` 선기록 후 SECURITY DEFINER 함수 우회 조회

## 인덱스 전략

```sql
-- 워커 → 공고 탐색 (빈번)
create index idx_jobs_match on public.jobs
  (status, dong_code, shift_start_at)
  where status = 'open' and shift_start_at > now();

-- 자격증 멀티밸류
create index idx_jobs_required_certs_gin on public.jobs using gin (required_cert_codes);
create index idx_workers_certs_gin on public.workers using gin (cert_codes);

-- 지오 (반경 검색용, M1 옵션)
create index idx_jobs_geog on public.jobs using gist (location_geog);
```

동(洞) 단위(`dong_code` 10자리)가 1차 필터, PostGIS는 반경 쿼리에만. BRIN=시계열, GIN=태그, B-tree 복합=쿼리 패턴.

## Soft vs Hard Delete — 감사 vs 파기의무

**분리 원칙**:
- PII (이메일·주민번호·연락처·계좌): 탈퇴 시 즉시 하드 삭제 또는 `NULL`
- 거래기록 (`shifts`·`payments`·`matches`): `worker_id`를 영구 익명 UUID(`00000000-...`)로 치환 → 감사 추적성만 남김
- `audit_log` 파티션 테이블에 파기 일시·사유 기록

정부과제 감사(5년 보존) + 개인정보보호법 제21조(파기 의무) 동시 충족.

## 마이그레이션 전략

- Supabase CLI (`supabase migration new`) 기반
- 순번: `YYYYMMDDHHMMSS_description.sql`
- 브랜치 충돌 방지: 머지 직전 rebase + rename
- 구조: `packages/db/migrations/` · `packages/db/seeds/{dev,staging}/`
- 스테이징 = 프로덕션 익명화 스냅샷 주 1회 복제
- 프로덕션 배포 = GitHub Actions → `supabase db push --linked` + 선백업·후마이그레이션
- RLS·정책은 별도 마이그레이션 파일

## 정산·수수료 롤업 아키텍처

**3-티어 하이브리드**:
1. `shifts` 완료 트리거 → `payments_pending` 즉시 삽입 (실시간 정산 큐)
2. `platform_fees_daily` materialized view → `REFRESH MATERIALIZED VIEW CONCURRENTLY` 정각 단위 롤업
3. 일 1회 배치 → `payments_settled` · 회계 장부 · 세무 리포트 정합성 확정

- 워커 앱 UI = (1) 읽기
- 관리자 대시보드 = (2)
- 국세청·감사 대응 = (3)
- Supabase `pg_cron` + `pg_net`로 PortOne 송금 훅을 큐에서 디스패치

## 핵심 스키마 (발췌)

전체는 `packages/db/migrations/0001_initial.sql` 참조.

```sql
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employers(id),
  title text not null,
  dong_code char(10) not null references public.regions(dong_code),
  location_geog geography(Point, 4326),
  shift_start_at timestamptz not null,
  shift_end_at timestamptz not null,
  hourly_wage_krw integer not null check (hourly_wage_krw >= 10030), -- 2026 최저임금 가드
  required_cert_codes text[] default '{}',
  preferred_mentor_tags text[] default '{}',
  status text not null default 'open'
    check (status in ('open','matched','in_progress','completed','cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## RLS 테스트 (ADR-007 연계)

pgTAP 사용. 사용자 역할 3종 × CRUD 4종 × 소유/타인 2종 = 24케이스 SQL 레벨 assert. 커버리지 M2 100%.
