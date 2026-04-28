# ADR-010 · 컨텐츠 QA 파이프라인

- **상태**: Accepted
- **일자**: 2026-04-24 / 욜드족·자문 카테고리 통합 2026-04-28
- **의사결정자**: 김연재(PO) · CPO · 전략팀장
- **참여 에이전트**: Backend, QA, CX, DB

## 배경

ADR-002 v2 피벗으로 **컨텐츠 QA = 핵심 차별화**가 됨. 알바천국·당근알바 대비 결정적 우위는 (a) 시니어 친화 UX (b) 공공 MOU (c) **검증된 공고만 노출**. 검증되지 않은 공고가 워커 앱에 노출되는 순간 차별화는 0.

진정한 위험 범주:
1. **성인·도박** — 시니어 노린 유사한 사기 공고
2. **MLM·다단계** — "고수익 보장", "재택가능 부업" 위장
3. **개인정보 사기** — 채용 빙자 신분증/계좌 요구
4. **고액일당 사기** — 비정상 시급(시간당 5만+) 미끼 후 보증금 요구
5. **불법** — 무허가 운영, 미성년 고용, 위험 작업

운영자 1명이 분당 5~10건 처리 = 일 4,000~8,000건이 한계. 자동화 + Claude API + 운영자 검토의 **4-tier 파이프라인** 필수.

## 4-Tier QA 구조

### Tier 1 — 자동 (Postgres + 정규식)
공고 INSERT/UPDATE 트리거 또는 Edge Function 진입 시 실행:

| 검사 | 패턴 | 결과 |
|---|---|---|
| 키워드 블랙리스트 | `content_qa_rules` (성인·도박·MLM·다단계·고액일당) `pattern_block` | `qa_status='rejected'`, `qa_classifier='auto'`, `qa_reason='blacklist:<rule_id>'` |
| URL 차단 | `content_qa_rules` `url_block` (외부 링크 도메인) | 동일 |
| 시급 외삽 | `hourly_wage_krw > 100000` AND **`category != 'consulting'`** | `qa_status='flagged'`, 운영자 큐 (자문 카테고리는 면제) |
| 근무시간 비합리 | `(shift_end - shift_start) < 30분` OR `> 12시간` | `qa_status='flagged'` |

비용: 0원 (DB 처리). 처리량: 무제한.

### Tier 2 — 반자동 (Claude API)
Tier 1 통과한 공고만 Claude에 전송:

- 시스템 프롬프트: `docs/operations/qa_classifier_prompt.md`
- 입력: 공고 제목, 설명, 시급, 시간, 카테고리
- 출력: `{ verdict: approved|rejected|flagged, confidence: 0.0~1.0, reason: text, category: text }`

| confidence | 행동 | qa_classifier |
|---|---|---|
| ≥ 0.85 | 자동 적용 (verdict 그대로) | `claude` |
| 0.60 ~ 0.85 | `qa_status='flagged'`, 운영자 큐로 | `claude` |
| < 0.60 | `qa_status='rejected'`, `qa_reason='low_confidence_<verdict>'` | `claude` |

비용: 월 1만건 × $0.005 = $50 ≈ 7만원. ADR-004 v2 §비용표 반영.

### Tier 3 — 수동 (운영자 검토 큐)
`qa_status='flagged'` 공고가 `(internal)/qa` 화면에 시간순으로 표시. 운영자가:
- 승인 → `qa_status='approved'`, `qa_classifier='operator'`, `qa_reviewed_by`/`_at` 기록
- 반려 → `qa_status='rejected'`, 사유 필수 입력
- 영구 차단 룰 추가 (super_admin만): 새 패턴을 `content_qa_rules`에 INSERT

처리 목표: **분당 5~10건 = 시간당 300~600건**. ADR-002 v2 집착 지표.

### Tier 4 — 외부 신고
워커·구인자·시민이 `(internal)/reports` 또는 워커 앱에서 신고 → `content_reports` INSERT:
- **즉시 shadow hide**: `jobs.qa_status='flagged'` + `content_reports.shadow_hidden_at=now()`
- 운영자 24시간 내 판정 (SLA, ADR-007/008 연계)
- 판정: 신고 인정 시 `rejected`, 무근거 시 `approved` 복원

## 자문(consulting) 카테고리 — 욜드족 공고 특수 처리

**문제**: 대기업 출신 욜드족(65~75세 액티브 시니어, "Young Old")의 자문/멘토링 공고는 **시간당 5만~30만원이 정상 시장가**. Tier 1 시급 외삽 룰(100K 초과 flag)이 false-positive 폭주.

**해결**:
- `JobCategory` enum에 `consulting` 추가 (packages/core/src/types.ts)
- Tier 1 시급 외삽 룰에 `category != 'consulting'` 가드 (위 표 참조)
- Tier 2 Claude 프롬프트에 자문 카테고리 인식 + "전직 임원·CEO·전문가 멘토링" 정상 패턴 학습
- `(internal)/qa` UI에서 자문 카테고리 공고는 `[자문]` 칩으로 시각 구분

**검증**: 자문 공고 시급 분포 통계 분기별 모니터링. 만약 자문 카테고리에서 사기 공고가 들어오면 별도 룰 추가 (예: "재능기부" 키워드는 0원 또는 1만원 이하만 허용).

## DB 스키마 (ADR-005 v2 §0006 마이그레이션)

```sql
alter table public.jobs add column qa_status text not null default 'pending'
  check (qa_status in ('pending','approved','rejected','flagged'));
alter table public.jobs add column qa_reason text;
alter table public.jobs add column qa_classifier text
  check (qa_classifier in ('auto','claude','operator','report'));
alter table public.jobs add column qa_reviewed_by uuid references public.profiles(id);
alter table public.jobs add column qa_reviewed_at timestamptz;
alter table public.jobs add column qa_confidence numeric(4,3);

create table public.content_qa_rules (...);  -- 자동 룰 관리
create table public.content_reports (...);   -- 외부 신고
```

`category` 컬럼은 기존 ADR-005 §JOB_CATEGORY enum에 `consulting` 추가로 처리 (별도 alter 불필요 — Postgres text + check 제약 갱신).

## RLS 정책

- 워커 앱: `qa_status='approved'`만 SELECT (ADR-005 v2)
- anon (마케팅): 동일
- 구인자(자기 공고): status 무관 SELECT (자기가 올린 공고는 항상 보여야 함)
- 운영자: `app.is_platform_admin()` 모든 status SELECT/UPDATE
- 외부 신고 INSERT: authenticated 모두 (워커/구인자/시민)

## pgTAP 4 케이스

`packages/db/tests/08_content_qa.sql`:

1. **자동 통과**: 정상 공고 (시급 12,000, 카테고리 logistics) INSERT → `qa_status` 그대로 'pending' (Tier 1 통과, Tier 2는 Edge Function 책임이라 unit test에서 'pending')
2. **자동 반려**: 키워드 블랙리스트 공고 ("바카라 콜센터") INSERT → 트리거가 `qa_status='rejected'`로 자동 변경 ※구현은 Edge Function이지만 룰 테이블 검증
3. **시급 외삽 flag (consulting 면제)**: 시급 200,000원 + category='consulting' INSERT → `qa_status='pending'` (자문은 면제)
4. **신고 격리**: `content_reports` INSERT → 트리거가 `jobs.qa_status='flagged'` 자동 전환 + `shadow_hidden_at` 기록

## Claude API 비용 추정 (재확인)

월 1만 신규 공고 가정 × $0.005/call ≈ **$50/월 ≈ 7만원**. ADR-004 v2 §비용표에 반영.

Claude Haiku 사용 (Sonnet 대비 1/12 비용, 분류 정확도 0.90+ 측정 후 결정). M3 임계 (월 10만건) 도달 시 자체 fine-tuned 모델 검토.

## 운영자 학습 데이터 축적

`(internal)/qa`에서 운영자가 내린 모든 결정은 `operator_actions`에 기록. 분기별 추출:
- Tier 2 confidence vs 운영자 최종 판정 비교 → Claude 프롬프트 개선
- 자주 반려되는 패턴 → `content_qa_rules` 자동 추천 (super_admin 검토 후 활성)

## 재평가 트리거

- Claude API 비용 월 30만원 초과 → 자체 임베딩 모델 검토
- 운영자 큐 적체 24h 초과 3일 연속 → 운영자 1명 추가 또는 Tier 1 룰 강화
- 자문 카테고리 사기 공고 적발 1건 이상 → 별도 자문 전용 룰셋 추가
