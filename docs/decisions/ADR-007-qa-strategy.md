# ADR-007 · QA 전략 · 테스트 피라미드 · 릴리스 게이트

- **상태**: Accepted
- **일자**: 2026-04-23
- **참여 에이전트**: QA, Frontend, Backend

## 테스트 피라미드

- **Unit**: Vitest(Next.js/TS 유틸·Server Actions), Jest(RN 로직)
- **Component**: React Testing Library
- **E2E 웹**: Playwright
- **E2E 모바일**: Maestro (Detox 불채택 — 네이티브 빌드·Expo prebuild CI 유지비 1~3명 팀 부적합. Maestro YAML flow는 CPO도 작성 가능)

## 투자 비율

- M1 (베타): Unit 60 / Component 30 / E2E 10
- M2 (정식): 50 / 30 / 20 (결제·RLS 크리티컬 패스 E2E 확장)
- M3 (스케일): 40 / 30 / 30

## 시니어 리얼 디바이스 체크리스트

- Galaxy A 시리즈 (Android 11~14) 2대
- iPhone SE/12 (iOS 16~17) 2대
- 저사양: RAM 3GB · 저장공간 85%
- 네트워크: 3G 스로틀링 400kbps · 패킷 로스 10%
- 음성: TalkBack · VoiceOver 일감 카드 완독, 시스템 글씨 200% 레이아웃 무붕괴
- 한 손 조작: CTA 하단 48dp 이상
- 옥외 시인성: WCAG AAA 7:1 · 1000lux 실측
- 월 1회 경로당 현장 세션 영상 녹화

## Payment 테스트

**자동화 가능**: payload 서명 검증 · webhook 멱등성(`imp_uid` 중복 1건 반영) · 금액 비교(`expected_amount == paid_amount`, KRW 정수)

**수동 필수**: 실카드 1만원 최소결제 · 당일정산 리허설(수요일 15시 컷오프 전후 2건씩) · PG 장애 fallback UX · 영수증 알림톡 수신

금액 불일치 → 자동 환불 차단 + 슬랙 P0 알림.

## RLS · 개인정보 테스트

**pgTAP 우선**. `supabase-test-helpers`는 JWT claim 시뮬레이션 얕음.

역할 3종 (senior, employer, admin) × CRUD 4종 × 소유/타인 2종 = **24케이스 SQL 레벨 assert**. `set local request.jwt.claims` 로 타인 `senior_id` 위장 → `profiles`·`job_applications`·`payments` SELECT 0행 검증. service_role 우회 경로 별도 표시.

CI: 매 PR마다 `supabase db reset` + `pg_prove`. M2 커버리지 100%.

## 릴리스 게이트 3단계

### merge-to-main
- ESLint · TypeScript strict 0 error
- Vitest · Jest unit 통과
- 변경 파일 커버리지 ≥ 70%
- pgTAP RLS 전량 green
- Expo prebuild 성공
- CPO 또는 개발자 1명 승인

### staging deploy
- Playwright 웹 스모크 12 시나리오
- Maestro 앱 스모크 8 flow
- PortOne 샌드박스 결제·환불 2종
- 알림톡 발송 mock 검증
- Supabase migration dry-run
- Sentry 신규 에러 0건

### production deploy
- staging 24시간 체류
- 실기기 결제 1건 성공
- Axe 접근성 치명 0건
- 롤백 스크립트 리허설
- 채널톡 공지 초안

## 버그 트리아지 · SLO

채널톡 인입 버그 자동 분류(severity·module·reporter_age). 전화 대체 불가 → "다시 채널톡으로" 템플릿 고정.

| Priority | 정의 | 응답 SLO | 해결 SLO |
|---|---|---|---|
| P0 | 결제 오류 · 개인정보 노출 · 전체 로그인 불가 | 15분 | 4시간 |
| P1 | 지원하기 · 정산 부분 실패 | 1시간 | 24시간 |
| P2 | UI 깨짐 · 간헐 알림톡 누락 | 1영업일 | 1주 |
| P3 | 개선 제안 · 저빈도 | 3영업일 | 백로그 |

**시니어 리포트는 한 단계 상향** (P2→P1). 주 1회 트리아지 회의 + SLO 위반 포스트모템.
