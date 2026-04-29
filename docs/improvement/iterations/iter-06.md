# iter 06 — Korean 1자 칩 (이모지 폐기) + 접근성 라벨

**시각**: 2026-04-27 17:08–17:25 KST · **에이전트**: 직접 적용 (UX iter01 P0 권고)

## 변경

| 파일 | 변경 |
|---|---|
| `packages/core/src/types.ts` | `JOB_CATEGORY_LETTER` 신규 (물/식/청/유/돌/농), `JOB_CATEGORY_EMOJI` @deprecated 보존 |
| `apps/worker-app/app/(tabs)/jobs.tsx` | 카테고리 칩 라벨 `이모지` → `[한글 1자]` |
| `apps/worker-app/app/job/[id].tsx` | 동일 + `accessibilityLabel={JOB_CATEGORY_LABEL[...]}` |
| `apps/worker-app/app/matches/[id].tsx` | 동일 + accessibilityLabel |
| `apps/worker-app/app/profile.tsx` | Chip emoji prop = `[한글 1자]` |

## 결정 근거

- **OS·폰트별 렌더 차이 제거**: 📦🍽️🧹는 안드로이드/iOS Pretendard에서 색·획·정렬 다름. 한글 1자는 동일 폰트 일관 렌더.
- **스크린리더 일관성**: TalkBack은 "📦"를 "package", VoiceOver는 "box" 등 발음 다름. `accessibilityLabel`로 한국어 전체 라벨 명시.
- **시니어 인지부하**: 70대 사용자가 "📦이 뭐지" → "물 = 물류" 즉시 이해.
- **DESIGN.md 준수**: Components > Chip 정의에 따라 색상 토큰 + 한글 라벨로 일관.

## 미적용 (이월)

- 와이어프레임 `_tokens.css` 동기 → iter 09 (ADR 인덱스 + 동기)
- 카드 메타의 🕐📍 (시간/장소 이모지)도 이번에 동시 처리하면 좋았으나 budget 초과 → iter 07 또는 09

## 검증

- typecheck + lint: green (worker-app + core)
- 시각: 칩이 `[물] 물류·배송` 형태로 표시 (라벨 중복은 의도 — 1자만으로는 신규 사용자에게 불충분)
