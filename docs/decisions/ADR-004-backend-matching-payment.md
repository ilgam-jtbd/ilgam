# ADR-004 · 매칭 엔진 · 결제(직거래) · 알림 · API 계약 (v2 — Free Model)

- **상태**: Accepted (v2)
- **일자**: 2026-04-24 (v1 2026-04-23 — 변경 이력 §참조)
- **참여 에이전트**: Backend, CX, DB

## 매칭 엔진 (M1~M3) — 유지

**Postgres RPC(pl/pgSQL) + Edge Function 하이브리드.**

- 1차 필터(지역 반경·시급·시간대 overlap·차단 목록·`qa_status='approved'`) = PostGIS `ST_DWithin` + 인덱스 RPC 10~50ms
- 2차 랭킹(거리·시급·평점·노쇼율 가중합) = pl/pgSQL
- **Claude API**는 Edge Function(Deno)에서만:
  - **컨텐츠 QA 분류 (Tier 2, ADR-010)** — 신규 핵심 용도
  - 공고 요약·금칙어 검사·CS 트리아지
  - 건당 $0.003~0.01
- 매칭 랭킹에 LLM 미사용 (레이턴시 1.5~3초 · 비용 부적합)
- M3 임계: 워커 1,500명·일 매칭 800건 초과 시 Python worker(임베딩 유사도) 분리 검토

## 정산 모델 — 직거래 (피벗)

**흐름** (단순화):

1. 구인자 ↔ 워커 매칭 확정 (`matches`)
2. 워커 출근 GPS+셀카 인증 (`shifts.clock_in_*`)
3. 워커 퇴근 인증 (`shifts.clock_out_*`)
4. 구인자 승인 (`shifts.employer_approved_at`) — **여기서 종료**
5. 임금 지급은 **구인자가 워커에게 직접** (계좌 이체·현금). 플랫폼 미개입.
6. 분쟁 시: 워커·구인자가 채널톡으로 신고 → `cx_tickets` → 운영자 `(internal)/reports`에서 수동 개입 (미지급 신고 시 구인자 신규 게시 차단 등)

**법적 지위**: **통신판매중개업 신고**(자본금 요건 없음) 그대로. 플랫폼이 자금 흐름에 개입하지 않으므로 전자금융거래법 우려 자체가 사라짐.

**PortOne 용도 재정의** (Phase 1):
- **분쟁 환불 보증** (옵션): 구인자가 사전에 PortOne 에스크로 예치 시 워커 미지급 보호. M2 이후 옵트인 기능으로 도입 검토.
- **광고 결제** (Phase 2 M18+): ADR-011에 따라 광고주 결제 webhook용. 코드 placeholder 유지.

## 알림 어댑터 `notifyAdapter.send()` — 유지

- 시그니처: `send({templateId, channel, payload, userId})`
- 카카오 알림톡(Bizppurio) → 실패 시 SMS(알리고/LG U+) 폴백
- pg-boss 큐 + 지수 백오프 15s/1m/5m/15m
- **신규 템플릿** (피벗): `qa_pending`, `qa_approved`, `qa_rejected`, `qa_flagged_report` (ADR-010 연계)
- 매칭 확정·QA 결과 통보 등 critical은 우선순위 큐 분리

## Realtime vs 폴링 — 유지

- 구인자 앱: Supabase Realtime (지원·출근인증)
- 시니어 워커 앱: 15초 폴링 + Push Notification 기본
- 매칭 수락 화면 등 단기 포그라운드만 Realtime 한시 구독

## API 계약 — 유지

Supabase RPC 직통 + tRPC 얇은 레이어. 결제·정산 흐름 폐기로 **tRPC 보호 엔드포인트가 줄어듬** (Claude API + 광고 결제 placeholder만).

## 비용 · 손익 (M3 워커 1,500명 가정 — 무료 모델 재산정)

**가정**: MAU 1,050명(70%), 월 검증 공고 1,500건+ (피벗 NSM 베이스), Claude QA 호출 월 1만건 가정

| 항목 | 월 비용(원) | 비고 |
|---|---|---|
| Supabase Pro $25 + 사용량 $80~150 | ~23만 | 동일 |
| Vercel Pro | ~3만 | 동일 |
| 알림톡 8~12원 × 평균 4회/MAU × 1,050 | ~4만 | QA 통보 추가로 약간 증가 |
| SMS 폴백 22원 × 5% | ~3천 | 동일 |
| Claude API (QA 분류) 1만건 × $0.005 | ~7만 | **신규 핵심 비용** (ADR-010) |
| Claude API (CX 트리아지) 일 200콜 × $0.005 | ~4만 | 동일 |
| PortOne 수수료 | **0원** | 정산 흐름 폐기 (광고 도입 시 재산정) |
| **순 인프라 고정비** | **~41만** | 이전 42~50만 대비 유사, 단 수수료 매출 0 |

**Phase 1 매출**: 0원 (의도적). 운영 자본은 (a) Pre-Seed/Seed 자본 (b) 공공과제 보조금에 의존.
**Phase 2 BEP** (광고 도입): 월 광고 매출 50만+ (인프라 고정비 + 운영 인건비 ~150만 커버).

## 변경 이력

### v1 → v2 (2026-04-24)

| 변경 | v1 | v2 |
|---|---|---|
| 정산 흐름 | 구인자 선결제 → PortOne 에스크로 → 워커 송금 | 직거래 (구인자 → 워커 직접). 플랫폼 미개입 |
| 수수료율 | 18% (구인자) | 0% (양측) |
| PortOne 용도 | 에스크로 송금 매월 GMV 2.86억 가정 | 분쟁 환불 보증(옵션) + 광고 결제(Phase 2) |
| Claude API 주 용도 | CS 트리아지 | **컨텐츠 QA 분류 (신규)** + CS 트리아지 |
| 알림 템플릿 | 매칭 + 출근 + 정산 | + QA 결과 통보 4종 |
| 손익 BEP | 월 GMV 3,000만 (수수료 540만) | Phase 1 BEP 무관, Phase 2 광고 50만+ |
| 법적 지위 | 통신판매중개업 + 전자금융거래법 회피(에스크로) | 통신판매중개업만 (자금 흐름 미개입) |

피벗 사유: ADR-002 v2와 정합. 자세한 영향: `docs/meetings/2026-04-24_pivot-impact-matrix.md`.
