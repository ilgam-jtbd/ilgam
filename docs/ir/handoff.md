# IR v3.1 Pivot Handoff (2026-04-28)

ILGAM IR Pitch Deck v3.1 산출물 인덱스 + 코드베이스 정합 매핑.

## Cowork 산출 (외부 경로)

`C:\Users\USER\Desktop\yjkim\ILGAM\ILGAM_MVP_Build\09_IR_Pitch_Deck\`

| 파일 | 용도 | 비고 |
|---|---|---|
| `ILGAM_IR_Deck_v3_1_Pivot.pptx` | 17 슬라이드 IR 덱 | 법인 + 10% + TIPS 추가 |
| `ILGAM_Executive_Summary_v3_1.docx` | 1페이지 요약 | 5중 해자 + Phase 0/1/2 |
| `ILGAM_Financial_Model_v3_1.xlsx` | 7시트 재무 모델 | Seed ₩3억 → TIPS ₩10억 → Pre-A ₩10~15억 |
| `ILGAM_Competitive_Map_v3_1.png` | 경쟁 매트릭스 | 인력사무소 디지털화 + 시니어 단독 점유 Blue Ocean |
| `_BUILDER_v3_1_pivot.py` | 빌더 스크립트 | pptx + docx + xlsx + png 자동 생성 |

## 핵심 결정 5건 (v3.0 → v3.1)

1. **수수료 단계화** — v3.0 "양측 0% M18까지" → v3.1 **"Phase 0 무료 5개월 → M6 법인 설립 + 10% 인력사무소 표준"**
2. **메인 매출 라인** — v3.0 광고 → v3.1 **10% 수수료 (M6+)** · 광고/자문은 M18~M30 부가
3. **자문 매칭 멤버십** 신설 (ADR-011 v1.1) — 욜드 트랙 ₩50~200만/월
4. **시장 포지셔닝** — "시니어 전담" → **"인력사무소 디지털화 + 시니어 단독 점유 Blue Ocean"**
5. **자금 트랙** — Pre-Seed/Seed → **Seed ₩3억 + 정부과제 ₩5천만 + TIPS ₩10억 + Pre-A ₩10~15억**

## 코드베이스 정합 매핑

| 영역 | 파일 | v3.1 반영 |
|---|---|---|
| ADR 결정 | `docs/decisions/ADR-002 v2.2` | 5중 해자 + Phase 0/1/2 + 실패 신호 (M5 게이트 + M11 평가) |
| ADR 결정 | `docs/decisions/ADR-004 v2.1` | Phase 0 직거래 → Phase 1 PortOne 에스크로 + 10% 부활 |
| ADR 결정 | `docs/decisions/ADR-011 v1.1` | 부가 매출 4종 (+ advisory_membership) |
| ADR 결정 | `docs/decisions/ADR-010` | 컨텐츠 QA 4-Tier (변경 없음, v3.0 유지) |
| 데이터 | `packages/db/migrations/0006_pivot_to_free_model.sql` | jobs.qa_* + content_qa_rules + content_reports + ad_slots/payments (현재 dormant) |
| 데이터 | (M6 직전 신규) `0007_commission_revival.sql` | 10% 수수료 정산 흐름 부활. payments 테이블 재활성 또는 신규 commission_payments 테이블 |
| 데이터 | (M18 직전 신규) `0008_advisory_membership.sql` | ad_slots에 advisory_membership 슬롯 타입 추가 |
| Edge | `supabase/functions/payment-settle` | M6 활성화 (현재 PORTONE_WEBHOOK_SECRET 미설정 시 503 dormant) |
| Edge | `supabase/functions/qa-classifier` | 활성, 컨텐츠 QA 4-Tier |
| 코드 | `packages/core/src/{types,schemas,ads}.ts` | JobCategory consulting + Job qa_* + AdSlotType (4종) |
| 코드 | `apps/admin-web/app/internal/qa` | P0 컨텐츠 QA 큐 |
| 코드 | `apps/admin-web/app/internal/ads` | dormant placeholder, M18 활성 |
| PRD | `docs/product/PRD.md` | v3.1 — 5중 해자 + 단계화 + Blue Ocean |
| README | `README.md` | v3.1 — 인력사무소 디지털화 + 1,200만 욜드 + 3 Phase |

## M0~M30 마일스톤 (IR v3.1 Roadmap 슬라이드)

| 단계 | 시점 | 마일스톤 |
|---|---|---|
| Phase 0 | M0~M5 (2026.10~2027.02) | 무료 검증 · 워커 5,000 · MVP 부평·강서 · MOU 본 체결 추진 |
| **법인 설립** | **M6 (2027.04)** | **★ 법인 + 10% 수수료 도입 (인력사무소 표준)** |
| Phase 1 | M7~M12 | KORDI MOU 본 체결 · 욜드 자문 트랙 출시 · 워커 50K |
| Phase 2 진입 | M13~M18 | 수도권 확장 · 광고 + 자문 멤버십 추가 · MAU 15만 |
| BEP | M19~M22 | 월 ₩3억 도달 · TIPS ₩10억 진입 |
| 안정 | M23~M30 | 전국 확장 · 4중 매출 정착 · MAU 80만 · 월 ₩9.6억 |

## 단계별 매출 (Unit Economics)

| 단계 | 시점 | MAU | ARPU(월) | 월매출 | 비고 |
|---|---|---|---|---|---|
| Phase 0 | M0~M5 | 0 → 5K | ₩0 | ₩0 | 무료 검증 |
| 법인 | M6 | 10K | ~₩600 | ~₩600만 | 10% 수수료 도입 |
| 확장 | M12 | 50K | ~₩800 | ~₩4,000만 | GMV ₩4억 × 10% |
| 광고+자문 | M18 | 150K | ~₩900 | ~₩1.35억 | 멤버십 추가 |
| BEP | M22 | 300K | ~₩1,000 | ~₩3억 | 손익분기 |
| 수익 | M30 | 800K | ~₩1,200 | ~₩9.6억 | 흑자 안정 |

가정: CPC ₩250 · 전환율 0.5% · 노출 비율 5% (보수)

## Go-to-Market 4채널

| 채널 | 비중 | 메모 |
|---|---|---|
| 한국노인인력개발원 KORDI MOU | 45% | 산하 50+재단·구청 통합 |
| 동네지사 | 20% | 강서·송파·성북 3개소 · 디지털 실패 시 폴백 |
| 알림톡 + SMS | 20% | 카카오 우선 · SMS 폴백 · 90초 온보딩 |
| 지인추천 + ESG 캠페인 | 15% | 욜드 자문 트랙 입소문 + 기업 ESG 협찬 |

## 5중 해자 (v3.1 핵심)

| # | 해자 | 출처 |
|---|---|---|
| ① | **단계화 수수료** | 검증 5M 양측 0% → 법인 후 10% (인력사무소 표준) |
| ② | 시니어 UX | ADR-003 (18pt / 48dp / WCAG AAA) |
| ③ | 공공 MOU | KORDI·50플러스·구청 (당근·Indeed 미보유) |
| ④ | 컨텐츠 QA | ADR-010 4-Tier (자동 + Claude + 운영자 + 신고) |
| ⑤ | **YOLD 자문 트랙** | 대기업·중견·스타트업 출신 50~64세 멘토링·자문 (consulting 카테고리) |

## 검증 게이트

- ✅ ADR 11개 (001~011) v3.1 정합
- ✅ 0006 마이그 SQL 문법 OK (M6 직전 0007 추가 예정)
- ✅ qa-classifier Edge Function 활성
- ✅ payment-settle dormant (M6 활성화)
- ✅ /internal/qa P0 화면
- ✅ /internal/ads dormant placeholder
- ⏳ M5 게이트 평가 (워커 5K + 검증 공고 5K + MOU 본 체결)
- ⏳ M6 0007_commission_revival 마이그레이션 작성 (5개월 후)
- ⏳ TIPS 신청서 (Seed 후, M9~M11 추진)

## 후속 PR 큐

| PR | 시점 | 내용 |
|---|---|---|
| 0007_commission_revival | M5 직전 (2027.02) | payments 테이블 재활성 또는 commission_payments 신규 + 10% 수수료 정산 트리거 |
| 0008_advisory_membership | M17 직전 | ad_slots `advisory_membership` 슬롯 타입 추가 + ADR-011 v1.1 활성 |
| Edge: payment-settle 활성 | M6 | PORTONE_WEBHOOK_SECRET 설정 + 정산 흐름 분기 |
| /internal/dashboard MAVJ | M3 | NSM 3-factor 시각화 (현재 stub) |

## 원칙

- **기존 ADR archive 안 함** — 변경 이력 섹션에 v1→v2→v2.1→v2.2 diff 명시
- **Cowork 산출 외부 보존** — `09_IR_Pitch_Deck/` 디렉토리는 코드베이스 외부 (Drive 백업으로 동기)
- **Drive 백업** — `I:\내 드라이브\ilgam\backup_2026-04-27\Desktop_yjkim_ILGAM\` 에 자동 동기 (cowork 산출 포함)
