# ADR-011 · 광고 + 자문 멤버십 부가 매출 (v1.1 — Phase 2 인플렉션)

- **상태**: Accepted (Deferred · v1.1)
- **일자**: 2026-04-28 (v1 04-24 / v1.1 04-28 자문 멤버십 추가 + 메인 매출 재정의)
- **활성화 시점**: M18+ (트리거 조건 §참조)
- **의사결정자**: 김연재(PO) · CPO · 전략팀장
- **참여 에이전트**: Backend, DB, Product

## v1 → v1.1 핵심 변경

ADR-002 v2.2와 정합:
- **메인 매출 = 10% 수수료 (M6+, ADR-002 v2.2 Phase 1)**. 광고/자문은 M18~M30 인플렉션 **부가** 매출.
- 광고 슬롯 3종 + **자문 매칭 멤버십** (욜드 트랙) 추가 = 4종 부가 라인
- Kill switch reverse 패턴 유지. M18 트리거는 활성화 *시점*, 코드는 dormant.

## 배경

ADR-002 v2 피벗으로 Phase 1(M0~M18)은 양측 무료. **수익 모델은 광고 (Phase 2 M18+)**. 광고 시스템을 M18에 처음부터 만들기 시작하면 (a) 6개월 lag (b) 시장 압박 시점에 안정화 부족 → **현재 코드를 architecturally ready 상태로 미리 준비**.

원칙: **Kill switch reverse**. 모든 광고 코드 경로가 환경 변수 또는 DB 플래그(`ad_slots.active=false`) 뒤에 격리됨. M18에 단순 토글 ON으로 활성화. 까지는 dormant.

## M18 트리거 조건 (3 AND)

모두 충족 시 활성화 검토 회의:

1. **MAU ≥ 50,000**
2. **월 검증 공고 (MAVJ) ≥ 5,000**
3. **NPS ≥ +30**

추가 정성 조건:
- 운영자 QA 큐 적체가 안정 (분당 throughput 5~10건 유지)
- 광고주 inbound 문의 월 5건 이상
- 회계·세무 파트너 광고 매출 처리 준비 완료

## 부가 매출 라인 4종 (v1.1)

### 1. 상단 노출 (CPC, 워커 앱)
- 워커 일감 리스트 최상단에 "[광고]" 칩과 함께 1~2건 노출
- 클릭당 과금 (CPC), 워커 위치·카테고리 타겟팅
- 단가: ₩200~500/클릭 (M18 시점 시장가 재산정)
- 슬롯: `ad_slots.slot_type='top_banner'`

### 2. B2B Premium (월정액 + 우선 매칭)
- 구인자가 월 ₩30~50만 구독 시:
  - 공고 발행 우선순위 ↑ (동일 카테고리·지역에서 워커 리스트 상단)
  - QA 자동 통과 (사전 신뢰도 검증된 광고주만)
  - 분석 대시보드 액세스 (응답률·매칭 시간 등)
- 슬롯: `ad_slots.slot_type='b2b_premium'`
- 대상: 대형 3PL, 프랜차이즈 본사, 중견기업 자문 의뢰처

### 3. 익명 데이터 인사이트 (월정액)
- 시니어 노동시장 동향 리포트 구독 (지역별 공급/수요·시급 분포·자격 트렌드)
- **개인정보 절대 미포함**, 통계만
- 단가: 월 ₩100만 (정부 연구기관·구청·HR 컨설팅 회사)
- 슬롯: `ad_slots.slot_type='data_insights'`

### 4. 자문 매칭 멤버십 (월정액 · v1.1 신규)
- **욜드(50~64세) 자문 트랙** 전용 구독. 스타트업·중견기업이 자문 풀(전직 임원·CEO·전문가)에 우선 매칭.
- 단가: ₩50~200만/월 (시드~시리즈A는 ₩50만, 매출 50~500억 중견기업은 ₩100~200만)
- 가치: (a) 검증된 욜드 풀 우선 노출 (b) 멤버십 내 무제한 자문 매칭 (c) 분기별 자문 활동 리포트
- 슬롯: `ad_slots.slot_type='advisory_membership'` (M6 직전 0007 마이그레이션에서 추가)
- **이는 ADR-002 v2.2 §5중 해자 #5 (YOLD 자문 트랙)와 직결**. 자문 매칭이 매출화되는 유일한 경로.

## 코드 구조 (사전 준비)

### DB 마이그레이션
```
packages/db/migrations/0006_pivot_to_free_model.sql
  - 신규 테이블 ad_slots, ad_payments (이 ADR-011 dormant 영역)
  - 둘 다 비어있고 ad_slots.active=false 기본
```

### Core 인터페이스
```
packages/core/src/ads.ts (신규)
  export type AdSlotType = 'top_banner' | 'b2b_premium' | 'data_insights';
  export interface AdSlot { ... }
  export interface AdPayment { ... }
  // 함수 시그니처만, 구현은 M18에 추가
```

### Admin Web 화면 (dormant)
```
apps/admin-web/app/(internal)/ads/
  layout.tsx — "M18 활성화 예정" placeholder
  page.tsx — 빈 페이지 + 트리거 조건 표시
```

### Edge Function (placeholder)
```
supabase/functions/payment-settle/
  → 정산 흐름 폐기 (ADR-004 v2)
  → 광고 결제 webhook 수신용으로 재구조화 (placeholder)
  → M18 활성화 시 PortOne 광고 결제 webhook 처리
```

## RLS 정책 (광고)

- `ad_slots`: 운영자만 RW (super_admin)
- `ad_payments`: 운영자 R, 시스템 RW (Edge Function)
- 광고주 자신의 구매 이력: `(internal)/ads`에서 super_admin이 대리 조회 (M18 초기), M19+ 광고주 셀프 대시보드

## 활성화 체크리스트 (M18 시점)

1. 트리거 3 AND 조건 검증 (월간 PO 미팅에서 확인)
2. `ad_slots.active=true`로 토글 (super_admin SQL)
3. PortOne 광고 결제 webhook 라우트 활성
4. 광고주 5명 베타 매칭 (대형 3PL 2 + 프랜차이즈 2 + 정부 1)
5. NPS 모니터링 — 광고 도입 후 −5 이내 유지가 목표 (시니어 신뢰 자산 보호)
6. 첫 매출 vs 인프라+운영 BEP 도달 90일 이내 목표

## 위험 및 회피

| 위험 | 회피책 |
|---|---|
| 광고 도입으로 시니어 신뢰 자산 훼손 | "[광고]" 칩 명확 표기, B2B Premium은 QA 통과 광고주만, NPS −5 모니터 |
| 광고주 발신 사기 공고 (역설적) | B2B Premium도 ADR-010 QA 파이프라인 통과 필수, 자동 통과는 "사전 신뢰도 검증" 후만 |
| 광고 매출 < 인프라 고정비 | M18 트리거 조건이 보수적 (MAU 5만 + MAVJ 5천) → 산술적으로 BEP 통과 가능 |
| 데이터 인사이트 PII 누출 | 차등 프라이버시 또는 k-익명성 적용, 출시 전 보안 감사 |

## 변경 이력

### v1 → v1.1 (2026-04-28) — 단계화 정합 + 자문 멤버십 추가

| 변경 | v1 | v1.1 |
|---|---|---|
| 메인 매출 | 광고 (Phase 2 M18+ 단독) | **10% 수수료 (M6+) + 광고/자문 부가 (M18+)** |
| 슬롯 종류 | 3종 (top_banner/b2b_premium/data_insights) | **4종 (+ advisory_membership 욜드 자문)** |
| BEP | 광고 매출 50만+ (불확실) | M22 월 ₩3억 (수수료 우선) |
| 단가 | b2b_premium ₩30~50만 | + advisory_membership ₩50~200만 |

ADR-002 v2.2와 정합. M18 활성화 시 v2로 갱신 예정.

### v1 (2026-04-24)
ADR-002 v2 피벗 동시 결정. 광고 슬롯 3종, M18 트리거.
