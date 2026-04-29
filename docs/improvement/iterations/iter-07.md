# iter 07 — Undo 토스트 패턴 (job/[id] Apply)

**시각**: 2026-04-27 17:25–17:45 KST · **에이전트**: 직접 적용 (UX iter01 P1 권고)

## 변경

| 파일 | 변경 |
|---|---|
| `apps/worker-app/app/job/[id].tsx` | Alert.alert confirm 모달 폐기 → 즉시 mutate + 하단 sticky 토스트 (2초 + 되돌리기 버튼) → 자동 router.back() |

## 패턴

1. **Pressable 클릭 시 즉시 mutate** — Alert confirm 단계 0
2. **하단 sticky 토스트** (`navy.800` 배경, `radius.md`) — "지원했습니다 · 곧 결과 알림" + 우측 "되돌리기"
3. **2초 타이머** (motion.undoTimeoutMs) → 자동 router.back()
4. **Undo 클릭 시** clearTimeout + setApplied(false) — 클라이언트 상태 복원
5. **Cleanup**: useEffect로 unmount 시 timer 해제 (메모리 누수 방지)

## 1인 운영·시니어 UX 효과

- ADR-003 §시니어 UX 우선순위 2 ("미스탭 회복") 충족 — 손떨림으로 잘못 누른 시니어가 토스트의 "되돌리기"를 즉시 선택 가능
- 모달 → 토스트 전환으로 "취소/확인" 텍스트 두 번 읽지 않음 (인지부하 ↓)
- `accessibilityLiveRegion="polite"` — 스크린리더가 "지원했습니다" 자동 발화

## 미적용 (이월)

- 실 환경에서 Undo 클릭 시 cancel mutation 필요 → DB 정책 추가 필요 (job_applications.status='cancelled' 워커 권한 부여)
- /matches/[id]에 동일 패턴 (취소 정책 만들면 적용 가능) → iter 09 후속

## 검증

- typecheck + lint: green
- 시각: 토스트가 하단 안전존 위에 떠서 1차 CTA 가리지 않음 (DESIGN.md Toast 정의 준수)
