# ILGAM 출시 전 종합 점검 (2026-04-28)

**범위**: 하네스 엔지니어링 적용 / 경쟁사 5축 비교 / 오픈 시점 연구
**결과**: 출시 시점 권고 = **2026-11 베타** (현 ADR-002 v2.2 가정 2026-10에서 **+1개월 늦춤**)

---

## 1. 결정적 발견 — 타이미·급구 동맹 (위험 ↑)

[AIM Group](https://aimgroup.com/2025/07/16/japan-based-timee-makes-first-overseas-investment-in-korea-based-jobs-app-gubgoo/) 보도: **2025년 7월, Timee(일본 도쿄증시 상장, MAU 1,000만+)가 한국 급구(니더) 운영사에 투자.** 타이미의 첫 해외 투자이자 첫 해외 진출. 투자 금액 비공개.

| 의미 | 영향 |
|---|---|
| 타이미 = 일본 시니어 65+ **51,000명 가입자**(2024.3 기준) 운영 노하우 보유 | 급구가 시니어 버티컬 진입 시 학습 곡선 거의 없음 |
| 급구 = 한국 1위 단기 알바 (2024 중개 335만 건) + 인지도 + 사업주 풀 | ILGAM의 "공급 측 락인 9~12개월" 진입 창문 단축 가능성 |
| 타이미 한국 직접 진출 vs 급구 통한 간접 진출 | 후자가 ILGAM에 더 위험 (급구 브랜드 + 타이미 자본·UX) |

**ILGAM 대응 전제**:
1. **시니어 전담**이 마지막 차별화 — 급구·타이미가 시니어 버티컬 선언 전에 KORDI MOU·공공 채널 락인 필수
2. 일반 시급(₩10,030) 시장은 절대 못 이김 — **YOLD 자문 트랙(₩50K~300K)**이 진정한 차별화
3. **오픈 시점 = KORDI 12월 노인일자리 모집 직전**에 인지도 확보 (M0~M5 = 11/2026~3/2027)

---

## 2. 경쟁사 5축 비교

| 축 | 급구 (니더) | 타이미 (한국 진출 가능) | 당근알바 | **ILGAM v3.1** |
|---|---|---|---|---|
| **인구·연령** | 전 연령, 시니어 비율 추정 ~10% | 일본 65+ 51K (2024.3) | 동네 기반, 시니어 비율 미공개 | **시니어 전담 (50~79)** |
| **수수료** | 구인자 17% (추정) | 일본 30%, 한국은 미정 | 무료 + 광고 | **단계화** (M0~M5 0% → M6 10% 인력사무소 표준) |
| **매칭·UX** | 검색 + 추천, 청년 UI | 검색 + 즉시 매칭, 청년 UI | 동네 검색, 청년 UI | **시니어 UX** (18pt/48dp/AAA, 검색 없이 3태그) |
| **신원·검증** | 기본 인증, QA 자동화 약함 | 일본 노하우 (워커 평점·블랙리스트) | 동네 신뢰 의존 | **4-Tier 컨텐츠 QA** (Tier 1 자동 + Tier 2 Claude + Tier 3 운영자 + Tier 4 신고 24h SLA) |
| **공공·B2B** | 쿠팡·IKEA·BGF·GS·롯데 파트너 | 일본 후생노동성 협력 | 동네 광고주만 | **KORDI MOU + B2B 자문 멤버십** (M18+) |

**ILGAM 이길 수 있는 영역**:
1. **시니어 UX 베이스라인** — 급구·타이미 모두 청년 UI 그대로. 토스 시니어 리서치(60+ 60~70% 이탈)는 그들에게도 동일 적용.
2. **KORDI MOU 채널** — 산하 1,500개소 시니어클럽 신뢰 자산. 외국계(타이미·니더 자본)는 진입 정치적 비용 ↑.
3. **YOLD 자문 트랙** — 급구·타이미 둘 다 시도 안 함. 청년 모델로 자문 매칭 못 함 (멘토십 신뢰 자산 부족).

**ILGAM 못 이기는 영역 (정직 인정)**:
1. **일반 단기 알바 매칭 속도** — 급구는 이미 사업주 풀 + 매칭 알고리즘 7년 운영. 정면 경쟁 회피 → "검증된 시니어"로 차별화.
2. **자본력** — 타이미 시총 1,380억 엔. 자본 정면승부 불가능. → 정부과제 + TIPS + 공공 MOU로 비대칭 자원 확보.

**시나리오 — "급구가 시니어 버티컬 선언하면?"** 대응 3건:
1. KORDI MOU 본 체결을 **M5 이전 강제 완료** (먼저 잡으면 외국계 자본의 진입 비용 ↑)
2. YOLD 자문 트랙 PR — 급구·타이미는 카피 못 함 (자문 풀 신뢰 자산 = 욜드 본인 네트워크에서만 자라남)
3. 동네지사 3곳 (강서·송파·성북) **오프라인 거점** 락인 — 디지털 only 경쟁사 카피 불가능

**시나리오 — "타이미가 한국 직접 진출하면?"** 대응 3건:
1. 급구 통한 간접 진출 패턴 유지 가정 → ILGAM은 시니어 단독 점유 시간 확보
2. 직접 진출 시 — 일본 시니어 노하우 단순 카피는 한국 인구·복지·세제 차이로 1년 이상 학습 필요
3. ESG·사회적 가치 프레임 (정부 보조금·공공 채널) → 외국계는 정치적 진입 비용 ↑

---

## 3. 오픈 시점 권고 — **2026년 11월 1일** Phase 0 베타 시작

### 핵심 캘린더 정렬

| 일자 | 사건 | ILGAM 대응 |
|---|---|---|
| **2026-11-01** | **Phase 0 베타 시작 (M0)** | 강서·송파·성북 3구 운영자 1명, 워커 100명 모집 시작 |
| 2026-11-28~12-26 | 한국노인인력개발원 **2027 노인일자리 모집** | KORDI MOU 본 체결 + 공동 모집 채널 노출 — **이 시기에 인지도 최대 확보** |
| 2026-12 (성탄·연말) | 식당·물류 단기 인력 수요 ↑ + 시니어 보너스 알바 | 매칭 데이터 축적 (M2 목표 1,000건+) |
| 2027-01-02 | 새해 = 시니어 재취업 의사 고점 | "올해도 일을 한다" 캠페인 |
| 2027-02 (설) | 명절 단기 일자리 + 자녀 만남에서 입소문 | 워커 5,000명 목표 (M5 게이트) |
| **2027-04** | **M6 — 법인 설립 + 10% 수수료 도입** | 인력사무소 표준 채택 PR |
| 2027-05 (어버이날) | 시니어 노출 최대 PR 시즌 | KORDI 공동 캠페인 |

### 왜 11월 1일인가 (10월 1일 대비 +1개월)

1. **KORDI 노인일자리 모집 시작(11/28)과 거의 동시** — 시니어 인지도 마케팅 비용을 KORDI 자체 채널이 흡수
2. **운영자 학습 시간** — 10월 시작 시 KORDI 모집 전에 운영자 QA 큐 분당 5~10건 처리 숙련 도달 어려움
3. **자본 효율** — 11월 시작 시 1차 사용자 모집과 KORDI 본 체결이 같은 분기 → 마케팅 비용 25~35% 절감 (추정)
4. **타이미·급구 동맹 동향 모니터** — 7~10월 4개월간 동맹 시니어 버티컬 진출 신호 모니터 후 대응 결정

### 너무 빨리 출시할 때 비용 (2026-09~10 시작 시)

- KORDI 모집 시즌(11/28) 전 **2~3개월 인지도 운영비** ≈ ₩3~5천만 추가 (블렌디드 CAC × 워커 1,000명)
- 운영자 QA 큐 미숙으로 사기 공고 노출 시 **신뢰 자산 1년치 손상** — 회복 불가능
- 사업주 풀 미확보 상태에서 워커만 들어오면 **양면시장 점화 실패** (D7 < 20% 위험)

### 너무 늦추면 (2027-01 이후 시작 시)

- KORDI 2027 모집 시즌 종료(12/26) 후 → **공동 채널 노출 기회 1년 미룸**
- 타이미·급구 동맹의 시니어 버티컬 선언 시점에 ILGAM 미진입 → **진입 창문 9~12개월 단축**
- 정부과제(2027 상반기 마감) 신청 시 트랙 레코드 부족

---

## 4. 하네스 엔지니어링 적용 (Anthropic 최신 가이드)

[Anthropic — Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) + [Building agents with Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk) + [Awesome harness engineering](https://github.com/ai-boost/awesome-harness-engineering) 검토.

### ILGAM 현 상태 점검

| 영역 | 현 상태 | 권고 |
|---|---|---|
| **Subagent 분리** | 운영자 QA 큐(Tier 3)는 사람 / Claude Haiku Tier 2 단일 모델 | M6 이후 매칭 추천 보조 subagent (worker fit 평가) 추가 검토 |
| **Context reset** | Edge Function 단일 호출 = 짧은 컨텍스트 / 운영자 큐는 stateful | OK — 장기 실행 에이전트 패턴 불필요 |
| **Tool permissions (MCP)** | qa-classifier가 ANTHROPIC API 직접 호출 (REST) | M3 이후 Claude Managed Agents (2026-04 베타) 검토 — 컨텍스트 영속화 불필요하나 권한·로그 통합 가능 |
| **State persistence** | jobs.qa_status + operator_actions 영구 기록 | OK — DB가 단일 진실원 |
| **Sandbox isolation** | Edge Function = Deno isolate / Server Actions = Node | OK — Anthropic 권고 isolation 패턴 충족 |
| **Initializer prompt** | docs/operations/qa_classifier_prompt.md 1차 정의 + few-shot 5건 | M3 이후 운영자 override 데이터로 프롬프트 자동 개선 루프 — operator_actions 분기 추출 → 프롬프트 v2 fine-tune |

### 적용 결과

ILGAM 아키텍처는 [Anthropic harness 가이드](https://www.anthropic.com/engineering/harness-design-long-running-apps) "isolation over constraints" 원칙에 부합. Edge Function 단일 호출 + DB 영속 + Server Action 권한 가드 = **장기 실행 에이전트 안티패턴 회피**. **신규 권고 1건**: M3 이후 Claude Managed Agents 베타 검토(권한·로그 통합 + 향후 매칭 추천 subagent 확장 시 일관 인프라 확보).

---

## 5. 종합 권고 — 출시 직전 9건

| # | 영역 | 조치 | 시한 |
|---|---|---|---|
| 1 | **출시 시점** | Phase 0 베타 = **2026-11-01** (10/1 대비 +1개월) | 즉시 ADR-002 v2.2 갱신 |
| 2 | KORDI MOU | **M5(2027-02) 이전 본 체결 강제** — 타이미·급구 동맹 진입 차단 | 2026-12 협상 시작 |
| 3 | 자문 트랙 | YOLD 30명 사전 풀(친분·소개) M0~M2 확보 | 2026-09 시작 |
| 4 | 동네지사 | 강서·송파·성북 3곳 **임대 계약 M0 직전** | 2026-10 |
| 5 | 컨텐츠 QA | 운영자 1명 QA 분당 5~10건 숙련 — 베타 전 200건 시뮬레이션 | M0-1 (2026-10) |
| 6 | 사기 모니터 | content_qa_rules 초기 50건 (성인·도박·MLM·고액일당) 시드 | M0-2 (2026-09) |
| 7 | 정부과제 | 2027 상반기 마감 신청 — Phase 0 데이터 6주분 필수 | M5 (2027-02) |
| 8 | 하네스 업그레이드 | Claude Managed Agents 베타 검토 — M3 이후 권한 통합 | M3 (2027-01) |
| 9 | 경쟁 모니터 | 타이미·급구 동맹의 시니어 버티컬 선언 신호 — 월간 PR/공시 watch | 영구 |

---

## 출처

- [AIM Group — Japan-based Timee makes first overseas investment in Korea-based jobs app Gubgoo](https://aimgroup.com/2025/07/16/japan-based-timee-makes-first-overseas-investment-in-korea-based-jobs-app-gubgoo/)
- [TipRanks — Timee Inc. Expands Through Strategic Acquisition and Investment](https://www.tipranks.com/news/company-announcements/timee-inc-expands-through-strategic-acquisition-and-investment)
- [korea.kr — 단기 알바 구인구직 플랫폼 '급구' 공공데이터 활용 우수사례](https://www.korea.kr/multi/visualNewsView.do?newsId=148900465)
- [정부24 — 2026년 노인일자리 및 사회활동 지원사업 참여자 모집](https://www.gov.kr/portal/locgovNews/4563606)
- [보건복지부 — 노인이 행복한 진짜 대한민국, 노인일자리 사업](https://www.mohw.go.kr/board.es?mid=a10503000000&bid=0027&list_no=1488037)
- [한국노인인력개발원 — 노인일자리정보시스템](https://www.seniwork.or.kr/)
- [Anthropic — Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Anthropic — Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [Anthropic — Building agents with the Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Awesome harness engineering — GitHub](https://github.com/ai-boost/awesome-harness-engineering)
- [HumanLayer — Skill Issue: Harness Engineering for Coding Agents](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents)
- [Crunchbase — Timee company profile](https://www.crunchbase.com/organization/taimee)
- [PitchBook — Timee 2026 Company Profile](https://pitchbook.com/profiles/company/231846-13)
