# Pivot Impact Matrix — Free Model + 컨텐츠 QA + 욜드족 자문

**일자**: 2026-04-24 (피벗 결정), 2026-04-28 (욜드족 트랙 추가)
**의사결정자**: 김연재(PO) · CPO · 전략팀장
**구현 리드**: Claude Code (자율 모드)

## 피벗 핵심 5건

1. **수수료 양측 0%** (Phase 1 M0~M18)
2. **컨텐츠 QA 시스템** = 새 핵심 차별화
3. **수익화 deferred to M18+** (광고 모델, architecturally ready)
4. **PortOne** 광고 결제 용도로만 보존 (정산 흐름 폐기)
5. **NSM 변경**: 월 완료 매칭 → MAVJ × MAU × TrustScore
6. **욜드족 자문 트랙 추가** (2026-04-28): consulting 카테고리, 65~75세 대기업 출신

## 영향 매트릭스 (영역 × 변경)

| 영역 | 이전 (v1) | 이후 (v2/v2.1) | 영향 파일 |
|---|---|---|---|
| **NSM** | 월 완료 매칭 (1-factor) | MAVJ × MAU × TrustScore (3-factor) | ADR-002 v2, PRD |
| **수수료** | 구인자 15% → 20% 계단식 | **양측 0%** Phase 1 / 광고 Phase 2 | ADR-002 v2, README, PRD |
| **정산 흐름** | PortOne 에스크로 → 워커 송금 | **직거래** (구인자→워커 직접). PortOne dormant | ADR-004 v2, payment-settle Edge |
| **법적 지위** | 통신판매중개업 + PG 회피(에스크로) | 통신판매중개업만. 자금 미개입 | security.md |
| **DB 스키마** | payments + platform_fees_daily 활성 | DROP fees / payments → ad_payments dormant + jobs.qa_* + content_reports + ad_slots | 0006 migration |
| **`(internal)` 우선순위** | employers / reports / payments / workers / dashboard / audit | **qa(P0) / reports(P0) / employers / workers / dashboard / audit / ads(dormant)** | ADR-009 v2, layout |
| **워커 세그먼트** | 베이비부머 2차 + 70대 (2 트랙) | + **욜드족 65-75세 대기업 출신** (3 트랙) | ADR-002 v2.1, PRD, README |
| **JobCategory** | logistics / food / cleaning / retail / care / agriculture | + **consulting** (자문·멘토링) | core/types.ts, schemas, 0006 |
| **시급 정상 범위** | ₩10,030~15,000 | + **₩50,000~300,000** (consulting) | ADR-010, qa-classifier |
| **Claude API 주 용도** | CX 트리아지 | **컨텐츠 QA 분류** + CX 트리아지 | ADR-004 v2, ADR-010, qa-classifier 신규 |
| **알림 템플릿** | 매칭 + 출근 + 정산 (3종) | + qa_pending/approved/rejected/flagged_report (4종 추가) | ADR-004 v2, notify |
| **운영자 첫 화면** | dashboard | **(internal)/qa** (분당 5~10건 처리량) | ADR-009 v2, layout |
| **안전망** | RLS 24 케이스 + PortOne 금액 검증 | + 4-Tier QA + 외부 신고 24h SLA + content_reports 트리거 | ADR-010, 0006 |
| **인프라 비용** | 매월 42~50만 (수수료 매출 5,000만+ 가정 BEP) | 매월 ~41만 + Claude QA 7만 = ~48만 (매출 0, Phase 2 광고 BEP) | ADR-004 v2 |
| **법적 광고 검토** | — | Phase 2 도래 시 부가세·세금계산서·데이터 PII·광고 표시 의무 (검토 중 마커) | security.md |

## 후속 PR (M2 정리)

- `payments` 테이블 archive 후 DROP (현재는 새 코드 미참조 상태로 공존)
- `payments_daily` materialized view 이미 DROP 완료 (0006)
- shifts 정산 트리거 별도 마이그 검토 (현재 트리거 자체가 없으므로 보류)
- `consulting` 카테고리 사기 패턴 별도 룰셋 (운영 1개월 데이터 축적 후)

## 광고 활성화 체크리스트 (M18+, ADR-011)

1. 트리거 3 AND 검증 (월간 PO 미팅)
2. ad_slots.active=true 토글 (super_admin SQL)
3. PORTONE_WEBHOOK_SECRET 설정
4. payment-settle Edge Function 광고 결제 webhook 활성 (이미 placeholder 있음)
5. 첫 광고주 5명 베타 (대형 3PL 2 + 프랜차이즈 2 + 정부 1)
6. NPS −5 이내 모니터 (시니어 신뢰 자산 보호)

## 산출 파일 트리

```
docs/decisions/
  ADR-002 v2.1     (NSM + 수수료 + 욜드족·자문)
  ADR-004 v2       (정산 폐기 + 직거래 + 광고 결제)
  ADR-005 v2       (스키마 단순화)
  ADR-009 v2       (QA P0 + payments 폐기)
  ADR-010 NEW      (컨텐츠 QA 4-Tier 파이프라인)
  ADR-011 NEW      (광고 플랫폼 dormant)

docs/operations/
  qa_classifier_prompt.md   (Claude Haiku 시스템 프롬프트 + few-shot 5건)

docs/architecture/
  security.md              (Phase 2 광고 검토 중 마커)

docs/product/
  PRD.md                    (v3.0 피벗 반영)

docs/meetings/
  2026-04-24_pivot-impact-matrix.md  (이 문서)

packages/db/migrations/
  0006_pivot_to_free_model.sql

packages/db/tests/
  08_content_qa.sql         (4 케이스 pgTAP)

packages/core/src/
  types.ts                  (consulting + qa_* + ContentReport)
  schemas.ts                (JobCategoryEnum + ContentReportSchema)
  ads.ts                    (ADR-011 dormant 인터페이스)

supabase/functions/
  qa-classifier/index.ts    (4-Tier QA)
  payment-settle/index.ts   (광고 결제 placeholder)

apps/admin-web/app/internal/
  qa/{page,actions}.tsx     (P0 QA 큐)
  ads/{layout,page}.tsx     (dormant)
  layout.tsx                (nav 재정렬)

apps/worker-app/lib/
  mockJobs.ts               (qa_status='approved' 추가)
```

## 검증 게이트

- ✅ typecheck + lint: green (admin-web + worker-app + core)
- ✅ 0006 마이그 SQL 문법 OK (staging 적용 후 production CPO 승인 필요)
- ✅ qa-classifier Edge Function: deno 타입 체크 (CI advisory)
- ⏳ pgTAP `08_content_qa.sql` 4 케이스 (이 PR에서 추가)
- ⏳ Claude Haiku API 실 호출 테스트 (자격증명 도착 후)
- ⏳ staging Supabase 적용 + RLS 검증 (자격증명 도착 후)
