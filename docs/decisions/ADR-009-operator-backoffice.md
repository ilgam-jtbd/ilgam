# ADR-009 · 플랫폼 운영자 백오피스

- **상태**: Accepted
- **일자**: 2026-04-23
- **의사결정자**: 김연재(PO) · CPO · 전략팀장
- **참여 에이전트**: Frontend, Backend, DB, Infra, QA, CX

## 배경

ADR-001~008은 구인자 어드민(`apps/admin-web`)과 시니어 워커 앱(`apps/worker-app`) 두 표면만 다뤘다. 그러나 MVP 론칭에 필수인 아래 6개 운영 작업은 현재 Supabase Studio 수동 SQL로만 가능하다:

1. 구인자 승인·반려 (`employers.approved_at` 수동 타임스탬프)
2. 신고 티켓 3트랙 처리 (ADR-008 가짜공고·급여미지급·개인정보요구) — 현재 `cx_tickets`·`jobs` SQL 직접 수정
3. 결제 분쟁 수동 개입 (환불·재송금·에스크로 정지) — `payments.status` 직접 전환
4. 워커 ban/unban — 감사 추적 없이 로우 수정
5. NSM(월 완료 매칭·D7 리텐션·CAC·GMV) 일별 추적 — 쿼리 파편화
6. `audit_log` 검색 — 개인정보보호법 제29조 감사 대응 미준비

Studio 수동 SQL은 (a) RLS 우회 권한이 필요해 감사 추적이 약하고, (b) CPO·전략팀장(주 10~15h 비개발 인력)이 다룰 수 없으며, (c) ADR-008의 SLA(P0 15분 · 개인정보 2시간 등)를 구조적으로 달성 불가. MVP 론칭 = 백오피스 6스크린 작동 = 운영 SLA 성립.

## 결정

**`apps/admin-web` 단일 Next.js 앱 내 `app/(internal)/*` 라우트 그룹으로 통합한다.**

- **별도 앱 ×**: 조직 규모(개발 실질 1명)에서 두 번째 Next.js/배포 파이프라인 운영 불가. 도메인 분리(`ops.ilgam.kr`)는 Vercel 프로젝트 분할 없이 미들웨어 + 리버스 프록시로 M4 이후 재검토.
- **RBAC**: 기존 `public.platform_admins` 테이블 + `app.is_platform_admin()` 재사용(ADR-005). 역할 세분화는 `platform_admins.role` 컬럼(`super_admin` / `operator`)로 미니멈 분할, `role` 컬럼은 `0004_operator_scope.sql`에서 `check (role in ('super_admin','operator'))`로 추가.
- **인증 강화**: Supabase Auth `mfa_enroll` 강제(TOTP) + 선택적 IP allowlist(정부과제·공공 MOU 감사 요건 도래 시 스위치 온). MFA 미등록 운영자는 `/internal` 진입 차단 후 `/internal/mfa-setup`으로 강제 유도.
- **MVP 스코프 6 스크린만**. Nice-to-have는 아래 별도 섹션으로 연기 — 운영자가 "못 하는 일" 리스트를 명시해 Studio 접근 권한을 공식 폐쇄할 수 있는 기준선을 확보.

## MVP 6 스크린

| # | 경로 | 핵심 작업 | 대응 ADR |
|---|---|---|---|
| 1 | `(internal)/employers` | 구인자 승인/반려 큐. `approved_at`·`suspended_at` 토글, 반려 사유 필수 입력 | ADR-005 employers |
| 2 | `(internal)/reports` | 신고 티켓 3트랙: 가짜공고(공고 shadow hide) · 급여미지급(사업주 신규 게시 차단) · 개인정보요구(우선순위 상향) | ADR-008 "악성·사기 신고 처리 (3트랙 격리)" |
| 3 | `(internal)/payments` | 결제 분쟁 수동 개입: 환불 트리거(PortOne 부분/전액) · 재송금 재시도 · 에스크로 정지 플래그 | ADR-004 결제 흐름 + 보안.md "결제 보안" |
| 4 | `(internal)/workers` | 워커 ban/unban. ban 사유·만료일 필수, `operator_actions` + `audit_log` 이중 기록 | ADR-005 soft delete |
| 5 | `(internal)` (홈) | 일별 NSM: 월 완료 매칭 · D7 리텐션 · 블렌디드 CAC · GMV. 카드 3~4개 + 14일 스파크라인 | ADR-002 NSM · PRD 지표표 |
| 6 | `(internal)/audit` | `audit_log` + `operator_actions` 통합 검색. 필터: 액터·테이블·기간·대상 ID | 개인정보보호법 제29조 |

데이터 액세스는 **전부 Next.js Server Component + Supabase SSR 클라이언트**로 고정 (RSC). 클라이언트에서 `service_role` 키 절대 노출 금지. 6번(감사 검색)은 `app.log_admin_access()` 우회 SECURITY DEFINER RPC를 통해 `private.*`까지 조회 가능, 다만 매 조회가 `operator_actions`에 역기록됨.

## 보안 경계 4개

| # | 경계 | 구현 | 실패 시 |
|---|---|---|---|
| 1 | **네트워크/전송** | TLS 1.2+ · HSTS · `platform_admins.allowed_ip_cidrs[]` 비어 있으면 전체 허용, 값 있으면 미스매치 403 | `/internal` 진입 불가, `operator_actions`에 시도 IP 기록 |
| 2 | **인증(Authentication)** | Supabase Auth + 강제 MFA(TOTP). `platform_admins.mfa_enrolled=true` 미충족 시 `/internal/mfa-setup` 강제 리디렉트 | 일반 로그인은 되지만 내부 경로 전부 차단 |
| 3 | **인가(Authorization)** | `app.is_platform_admin()` + `role in ('super_admin','operator')` · 라우트별 role 가드(`super_admin` 전용은 audit 검색·ban 승인) | 동일 JWT로도 화면 자체가 404 처리 |
| 4 | **감사(Audit)** | 쓰기 액션은 `operator_actions` 필수 삽입, `private.*` 읽기는 `app.log_admin_access()` 래퍼 통과 | 기록 실패 시 트랜잭션 롤백 (BEGIN/COMMIT 블록 안에서 기록이 원자적으로 묶임) |

IP allowlist는 **선택적 스위치**: 기본 off(소규모 팀 원격근무 친화), 공공 MOU·정부과제 감사 트리거 시 CIDR 1~2개로 제한. 값 비어 있음 = 체크 pass로 취급.

## 역할·권한 매트릭스

| 화면/액션 | `super_admin` | `operator` | 워커·구인자(참고) |
|---|---|---|---|
| `/internal` 홈 NSM | R | R | — |
| 구인자 승인/반려 | RW | RW | — |
| 구인자 영구 차단(suspend) | RW | R | — |
| 신고 티켓 종결 | RW | RW | — |
| 신고자·피신고자 직접 메시지 | RW | R | — |
| 결제 환불(부분) | RW | RW | — |
| 결제 환불(전액) · 에스크로 정지 | RW | R | — |
| 워커 ban (≤30일) | RW | RW | — |
| 워커 ban (영구) · unban | RW | R | — |
| `audit_log` 검색 | RW | — | — |
| `operator_actions` 전체 조회 | RW | 본인 것만 R | — |
| `platform_admins` 관리(초대·회수) | RW | — | — |
| 수수료율 변경 | — (Nice-to-have 연기) | — | — |

**원칙**: 되돌리기 어려운 액션(영구 차단·전액 환불·에스크로 정지·영구 ban)은 `super_admin` 전용. `operator`는 일상 운영의 되돌릴 수 있는 범위만 수행. `super_admin`은 2인 이상(김연재 + 1명), `operator`는 CX·전략 현직 중 검증된 인원 2~3명 규모로 상한.

## 2FA 요구사항

- **TOTP 필수**. Supabase Auth `mfa.enroll({ factorType: 'totp' })` + Authenticator 앱(Google Authenticator·1Password). SMS 2FA는 금지 — SIM swap 공격 + `SMS_PROVIDER=aligo` 발신번호 체인 노출 리스크.
- **세션 TTL**: Supabase 기본 JWT 30일 → 운영자 세션은 `platform_admins.last_mfa_at`을 별도 체크해 **4시간 초과 시 재인증 요구**. 구현은 `middleware.ts`에서 `last_mfa_at` + `now() - interval '4 hours'` 비교.
- **회수 경로**: MFA 디바이스 분실 시 `super_admin` 2명의 승인으로 `mfa_enrolled=false` 리셋(수동 SQL이 아닌 `/internal/admins` Nice-to-have). M1 동안은 Supabase Dashboard 수동 reset 허용 + `operator_actions`에 사유 기록.
- **Recovery code**: Supabase `mfa.challenge` recovery 대안 미지원(2026-04 기준) → M2에 TOTP 백업 코드 수동 발급 절차 문서화.

## `operator_actions` vs `audit_log` 분리 근거

| 차원 | `audit_log` | `operator_actions` |
|---|---|---|
| 기록 주체 | 시스템(트리거·RPC 자동) | 운영자 명시적 액션 |
| 기록 시점 | 데이터 변이 발생 후(after) | 의도 선언 + 실행 전후 모두 |
| 스키마 | 파티션(월) · 범용 `payload jsonb` | 고정 컬럼 + `metadata jsonb`, FK `platform_admins` |
| 보존 | 5년(회계·감사) | 3년(운영 책임 추적) |
| 검색 | 감사 대응(느려도 됨) | 대시보드 실시간 필터 |
| RLS | `is_platform_admin()` 전원 R | 본인 R · `super_admin` 전체 R |

둘을 합치지 않는 이유: `audit_log`는 `profile_id=NULL`(시스템 주체) 행이 대다수라 "운영자가 누른 버튼" 필터 성능이 급격히 나빠진다. 분리하면 운영자 책임 추적·법적 감사 대응·분쟁 시 증거 제출 각각의 요건이 독립적으로 진화 가능.

**이중 기록 규칙**: 운영자 액션이 `private.*` 또는 RLS 우회를 수반하면 `operator_actions` + `audit_log` 양쪽에 기록(후자는 `app.log_admin_access()` 경유). 동일 트랜잭션에서 양쪽 INSERT 실패 시 전체 롤백.

## Nice-to-have (연기)

MVP 밖 — M2~M3 재심의.

1. **수수료율 동적 조정 UI**: ADR-002 계단식 15→17→20% 전환. 현재는 DB `payments.platform_fee_rate` 기본값 수동 변경 + 배포 게이트로 충분. 런타임 변경을 UI로 열면 실수 폭파 반경 큼 → feature flag 인프라부터 갖춘 뒤.
2. **알림톡 템플릿 on-the-fly 편집**: Bizppurio 사전심사 2~3주 리드타임이 있어 UI에서 즉시 반영 불가. 템플릿 버전 관리 + draft/submit/approved 상태기계 + 사전심사 워크플로를 별도 설계해야 함.
3. **세무 리포트 CSV 배치**: 원천징수·월별 정산 CSV는 `pg_cron` + Storage 업로드로 우선 자동화, UI는 후순위. 세무 파트너 확정 후 포맷 확정.
4. **동네지사 슬롯 관리 UI**: ADR-008 handoff에서 지사 태블릿 채널톡 팀 인박스 + 알림톡 슬롯 예약으로 우선 커버. 지사 3곳 확정(Action Item #6) 이후에 재설계.

## 재평가 트리거

- 운영자 3명 초과 → `role` 세분화(예: `support_viewer`, `finance_reviewer`)
- 월 신고 티켓 300건 초과 → 티켓 자동 배정·에스컬레이션 규칙 엔진 필요
- 정부과제·공공 감사 실제 수감 → IP allowlist 강제 on + audit 보존 5→10년 연장 검토
- Nice-to-have 중 2개 이상이 CX·전략팀장 주간 요청에 반복 등장 → 별도 ADR

## 결과

- Studio 수동 SQL 운영 0건(MVP 론칭 게이트)
- ADR-007 P0 SLA(15분) · 개인정보 SLA(2시간) 구조적 달성 가능
- CPO·전략팀장 주 10~15h 가용 인력이 운영에 직접 접근 가능(개발자 병목 해제)
- 감사·법적 증거 요청 시 `operator_actions` + `audit_log` 양축 추출 즉답 가능
