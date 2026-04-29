# 자율 스프린트 멀티에이전트 토론 (2026-04-24)

## 개요

- **일시**: 2026-04-24 (자율 실행)
- **주제**: A → E → C → B → D 순서 최적성 검토
- **현재 상태**: ADR-009 작성 완료, 0004 migration 커밋, pgTAP 3건, CI green, (internal) 스크린 미구현
- **목표**: 9개 역할 관점에서 리스크·기회 3개씩 수집 후 최종 순서 확정

---

## 참여 에이전트 및 역할

| 에이전트 | 역할 초점 |
|---|---|
| CPO | UX 품질·스토어 심사·접근성 |
| PO | 비즈니스 지표·진입 창문·수익화 |
| Frontend | Next.js·Expo RN·디자인 토큰 |
| Backend | Supabase·Edge Function·매칭엔진 |
| Full-stack | 통합·E2E·DX |
| DB | RLS·인덱스·마이그레이션 |
| Infra/DevOps | 배포·모니터링·비용 |
| QA | 테스트 피라미드·pgTAP·실기기 |
| CX | 채널톡·알림톡·신고 3트랙 |

---

## 1. CPO 관점

**현 순서(A→E→C→B→D)에 대한 평가**: 조건부 동의.

**리스크 3개**
1. E(백오피스) 완성 전 구인자 어드민 C 진입 시, 승인 절차 없이 구인자가 공고 올리는 상태 가능 → 가짜 공고 초기 신뢰 훼손.
2. D(워커 앱) 후순위로 밀려 시니어 리얼 디바이스 테스트 시작이 늦어짐 → 스토어 심사 일정 압박(Apple 4.7 노동중개 소명 2~3주 소요).
3. E-4 middleware MFA 미구현 상태에서 E-3 스크린 먼저 접근 가능하면 운영자 계정 노출 위험.

**기회 3개**
1. E 완성 시 CPO·전략팀장이 직접 구인자 승인 처리 → Claude Code(개발) 병목 제거, 실운영 시작 가능.
2. B(Edge Function) 전 C가 완성되면, 구인자 어드민에서 매칭 결과를 수동 확인하는 QA 환경 조성.
3. A(CI green) 첫 완료가 전체 팀 신뢰 기점 — 이후 모든 PR이 자동 검증되어 CPO 리뷰 부담 감소.

---

## 2. PO 관점

**현 순서(A→E→C→B→D)에 대한 평가**: 동의. 단, E가 C보다 앞에 있는 것은 비즈니스 임계선에서 맞음.

**리스크 3개**
1. 진입 창문 9~12개월 중 E에 3~4주 소요 시 B(매칭 실구현) 시작이 M1 중반으로 밀림 → NSM(월 완료 매칭) 선행 데이터 확보 지연.
2. GitHub Projects 보드 없는 상태에서 이슈 추적이 메신저·문서 파편화 → CPO·전략팀장 진행 가시성 0.
3. C(구인자 Magic Link) 전에 E가 없으면 첫 구인자 온보딩을 Supabase Studio 수동으로만 처리해야 함 → 속도 병목.

**기회 3개**
1. E 완성 = "CPO·전략팀장 주 10~15h 인력 즉시 운영 투입" 가능 → 개발 병렬화 달성.
2. NSM 대시보드(E 홈화면) 조기 완성 시 투자자·파트너에 실시간 지표 공유 가능 → IR 레버리지.
3. A(CI) → E(백오피스) → C(구인자) 순서는 "내부 운영 먼저, 외부 노출 나중" 원칙 — B2B SaaS 안정적 출범 패턴.

---

## 3. Frontend 엔지니어 관점

**현 순서(A→E→C→B→D)에 대한 평가**: 동의. E-3 스크린 작성이 Next.js RSC 패턴 검증 겸 D 준비.

**리스크 3개**
1. E-3 스크린에 shadcn/ui 사용 전제 시 install 없이는 구현 불가 → 현재 admin-web package.json에 shadcn 없음. 인라인 스타일 또는 기본 HTML로 대체 필요.
2. D(워커 앱) 후순위로 인해 Expo SDK 51 + expo-router 초기 설정 이슈가 늦게 발견될 가능성 → 앱 첫 빌드가 M1 후반으로.
3. middleware.ts에서 Supabase SSR createServerClient 설정 오류 시 /internal 전체 인증 우회 가능 → 보안 임팩트 高.

**기회 3개**
1. E 스크린은 RSC + Supabase Server Client 패턴을 완성 → C·D 스크린 구현 속도 2~3배 증가.
2. (internal) layout.tsx 완성 시 동일 패턴을 (dashboard)에도 즉시 적용 가능.
3. 인라인 스타일 + 디자인 토큰 패턴 정착 → 추후 CSS Module 또는 Tailwind 마이그레이션 기준점 확보.

---

## 4. Backend 엔지니어 관점

**현 순서(A→E→C→B→D)에 대한 평가**: 동의하나 B 시작 시점에 주의.

**리스크 3개**
1. E-4 middleware에서 `app.is_platform_admin()` RPC를 Edge Runtime(middleware.ts)에서 직접 호출 시 레이턴시 + 연결 풀 소진 → Server Component layout에서 처리하는 것이 적합.
2. B(match-engine) Edge Function은 pg-boss 의존 → Supabase 로컬에서 pg-boss 설치 검증 선행 필요. 미리 준비 안 하면 B 시작 시 블로커.
3. `notify-dispatch`(B-2)는 Bizppurio API 키 + 알리고 API 키 없이 로컬 테스트 불가 → sandbox/mock 전략 선설계 필요.

**기회 3개**
1. E migration(0004) 이미 커밋 완료 → operator_actions 테이블 즉시 활용 가능.
2. `app.log_operator_action()` SECURITY DEFINER 함수 완성 → E-4 미들웨어가 직접 테이블 쓰기 대신 함수만 호출하면 RLS 안전 보장.
3. 0004 migration 이미 local 적용 가능 → B 착수 전 schema가 안정화된 상태.

---

## 5. Full-stack 관점

**현 순서(A→E→C→B→D)에 대한 평가**: 동의. DX(개발자 경험) 측면에서도 A→E가 최우선.

**리스크 3개**
1. GitHub Projects 보드·이슈 없이 A→E→C→B→D를 직렬로 처리하면 병렬화 기회를 놓침 → C·D는 B와 독립적이므로 동시 진행 가능.
2. pnpm-lock.yaml frozen-lockfile CI 이슈 → node_modules가 없는 환경에서 pnpm install --frozen-lockfile 실패 가능.
3. turbo --filter=...[origin/main] 는 새 branch에서 전체 workspace 실행 → CI 5분 SLA 초과 가능.

**기회 3개**
1. CI 첫 green 달성 시 이후 모든 커밋이 자동 검증 → 품질 게이트 자동화.
2. E-3/E-4 구현 후 동일 Server Component + Supabase SSR 패턴을 C·D에 재사용 → 설계 결정 1회로 전체 통일.
3. E 완성 = 비개발 팀원이 직접 운영 가능 → 개발자가 B·D 집중 가능.

---

## 6. DB 전문가 관점

**현 순서(A→E→C→B→D)에 대한 평가**: E-2(0004 migration) 이미 완성 → E 순서 유지 적합.

**리스크 3개**
1. pgTAP 00_rls_worker_self.sql이 placeholder 수준 → CI db-rls-tests job이 통과하더라도 실제 RLS는 미검증. 24케이스 목표(ADR-007)까지 격차 큼.
2. 0004 migration의 `allowed_ip_cidrs cidr[]` 타입은 supabase/postgres:15.1.1.78에서 cidr 배열 지원 확인 필요. CI 환경 이미지 이슈 가능성.
3. `audit_log` RANGE 파티션 다음 달(2026-05) 파티션 생성 누락 시 삽입 실패.

**기회 3개**
1. `operator_actions` 인덱스 3개(actor_time, target, type) 이미 완성 → 운영 쿼리 성능 선확보.
2. `app.log_operator_action()` SECURITY DEFINER 함수 → E-4 이후 모든 운영자 액션이 자동 감사 추적.
3. 0004 migration dry-run 가능 → CPO 승인 전 로컬 검증으로 prod push 리스크 최소화.

---

## 7. Infra/DevOps 관점

**현 순서(A→E→C→B→D)에 대한 평가**: A(CI green) 최우선에 강하게 동의.

**리스크 3개**
1. GitHub Actions `supabase/postgres:15.1.1.78` 이미지에 `pg_prove`, `pgtap` 패키지 미포함 → ci.yml의 `apt-get install libtap-parser-sourcehandler-pgtap-perl` 단계가 실패할 경우 별도 이미지 필요.
2. Vercel 배포 파이프라인 미설정 상태에서 E 완성 후 staging 확인 불가 → E-3 스크린 QA는 로컬 개발 서버로만 가능.
3. `git remote origin` 이 `git@github-ilgam:` SSH 호스트 별칭 사용 → CI 환경에서 SSH key 없으면 push 불가.

**기회 3개**
1. Turborepo remote cache (Vercel 무료 tier) 연동 시 CI 5분 → 2분대 단축 가능.
2. pgTAP CI job 분리(`db-rls-tests`) → 스키마 회귀 자동 감지, 운영 실수 조기 차단.
3. `concurrency: cancel-in-progress: true` 이미 설정 → PR 중복 빌드 비용 자동 절감.

---

## 8. QA 엔지니어 관점

**현 순서(A→E→C→B→D)에 대한 평가**: 동의. 단 pgTAP 24케이스 확보를 E 완료 이전에 완성해야 함.

**리스크 3개**
1. 현재 pgTAP 테스트 4건(00_rls_worker_self 3 placeholder + 01_operator_scope 3) → ADR-007 목표 24케이스 대비 6건, placeholder 포함 시 실질 3건만 유효.
2. D(워커 앱) 시니어 리얼 디바이스 체크리스트가 후순위로 밀릴수록 Apple 심사 전 발견 가능한 접근성 이슈 발견 기회 감소.
3. E-3 스크린에 unit 테스트 없는 상태로 커밋 시 ADR-007 커버리지 70% 미달.

**기회 3개**
1. E-4 middleware Supabase SSR 패턴을 unit 테스트로 먼저 작성(TDD) → C·D 스크린까지 동일 패턴 재사용.
2. 01_operator_scope.sql 3케이스 이미 구조 완성 → worker/employer RLS 케이스 추가가 용이.
3. pgTAP CI job 격리(별도 job) → DB 테스트 실패가 frontend 빌드 지연 없이 즉시 리포트.

---

## 9. CX 엔지니어 관점

**현 순서(A→E→C→B→D)에 대한 평가**: E(신고 3트랙)가 B보다 앞에 있음에 강하게 동의.

**리스크 3개**
1. E-3 reports/page.tsx(신고 3트랙) 스텁만 있고 실 처리 로직 없으면 MVP 론칭 후 신고 건이 Supabase Studio에 쌓임 → ADR-008 SLA(개인정보 2시간) 구조적 달성 불가.
2. B-2(notify-dispatch) 전 E 신고 처리 완료 시, 처리 결과 알림톡을 수동 발송해야 함 → 운영 병목.
3. 채널톡 SDK 미연동 상태에서 CX 관련 화면이 UI 레벨 스텁만 존재 → 실운영 SLA 미달.

**기회 3개**
1. E reports 화면 완성 = 신고 3트랙 처리를 CPO·전략팀장이 직접 수행 → 개발자 병목 제거.
2. E audit 화면 + operator_actions 이중 기록 = ADR-008 "판정 사유 + 신고자·피신고자 알림톡 통지" 감사 추적 자동화.
3. 알림톡 템플릿 6종 이미 준비(2026-04-23 커밋) → B-2 연동 직전 E 신고 처리와 동시 테스트 가능.

---

## 충돌 지점

| 충돌 | 에이전트 A | 에이전트 B | 내용 |
|---|---|---|---|
| middleware 위치 | Backend | Frontend | `app.is_platform_admin()` 호출을 middleware.ts(Edge Runtime)에 둘지, layout.tsx(Node.js Server Component)에 둘지 |
| pgTAP 완성 시점 | QA | DB | E 완료 전 24케이스 필요(QA) vs 0004 migration 이후 점진적 추가 가능(DB) |
| D 시작 시점 | CPO | PO | D를 B 이후로 미루면 스토어 심사 일정 위험(CPO) vs 워커 앱은 매칭엔진 없이 동작 불가(PO) |
| shadcn/ui 도입 | Frontend | Infra | E-3 스크린 구현에 shadcn 필요(Frontend) vs 현재 package.json에 없어 즉시 install 불가(Infra) |

---

## 리드 엔지니어 최종 판단

### 순서: **A → E → C → B → D 유지**

근거:

1. **E가 C보다 앞이어야 하는 이유**: 구인자 어드민(C)이 먼저 열리면 승인 없는 구인자가 공고를 올릴 수 있다. 백오피스(E)가 먼저 운영 체계를 갖춰야 C가 안전하게 열린다.

2. **middleware 충돌 해소**: `middleware.ts`는 세션 갱신·인증 여부(로그인 유무)만 처리. `app.is_platform_admin()` 호출과 `mfa_enrolled` 체크는 `app/(internal)/layout.tsx` Server Component에서 수행. Edge Runtime의 DB 연결 제약 및 연결 풀 소진 리스크 회피.

3. **pgTAP 시점 충돌 해소**: 0004 3케이스는 완성. placeholder인 00_rls_worker_self.sql의 3케이스는 C·B와 병행해 실제 assert로 교체. 24케이스 목표는 M2 전 달성(ADR-007).

4. **shadcn/ui 충돌 해소**: 현재 package.json에 shadcn 없음 → E-3 스크린은 기존 인라인 스타일 + 디자인 토큰 패턴으로 구현. M2에서 shadcn/ui 도입 여부 재검토.

5. **D 시작 시점**: B-1(match-engine) 완성 직후 D 착수. CPO 스토어 심사 일정 위험을 최소화하기 위해 B 착수와 동시에 D Expo 초기 설정만 병행.

### 현 스프린트 완료 범위

| 항목 | 상태 | 비고 |
|---|---|---|
| [A] pnpm-lock.yaml + CI | 완료 | 기존 커밋 확인 |
| [E-1] ADR-009 | 완료 | 커밋 8524c22 |
| [E-2] 0004 migration | 완료 | 커밋 da7d023 |
| [E-3] (internal) 6 스크린 | 진행 중 | 본 스프린트 구현 |
| [E-4] RBAC middleware | 진행 중 | 본 스프린트 구현 |
| E-2 migration ready | 로컬 검증 완료 | **awaiting CPO approval for prod push** |

---

## E-2 migration 상태 기록

**E-2 migration ready, awaiting CPO approval for prod push.**

`0004_operator_scope.sql` 로컬 검증 완료 (pgTAP 3건 pass 기준). Supabase 샌드박스(ilgam-prod) push는 CPO·전략팀장 이중 승인 후 진행. prod push 전 반드시 `supabase db push --dry-run` 실행 후 diff 확인.
