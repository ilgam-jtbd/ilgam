# iter 03 — pgTAP 부정 케이스 + DESIGN.md 단일 정본

**시각**: 2026-04-27 16:05–16:30 KST · **에이전트**: Backend/QA + 디자인 시스템 아키텍트 2개 병렬

## 산출물

| 파일 | 출처 | 내용 |
|---|---|---|
| `packages/db/tests/06_rls_negative.sql` | Backend/QA | 5개 cross-tenant 부정 케이스 (worker A→B matches SELECT 차단, employer X→Y jobs UPDATE 차단, anon→employers 차단, non-admin→operator_actions INSERT 차단, worker→matches UPDATE 차단) |
| `docs/design/DESIGN.md` | 디자인 아키텍트 | Google DESIGN.md 8섹션 포맷 단일 정본. YAML 토큰 + Markdown 본문. Navy 채택 / 18pt 유지 / 라운드 6·10·16 단일화 결정 명시 |

## 핵심 의사결정 (DESIGN.md)

- **Navy 정본** (와이어프레임 Indigo 폐기): ADR-003 명시 + 70대 잔상 피드백
- **18pt 베이스 유지** (와이어프레임 20pt 후보): 모바일 420px 컨테이너 1스크롤 회귀 방지
- **라운드 6/10/16/full** 통일 (와이어프레임 14/24 폐기): 위계 혼란 방지
- **70대 35% 도달 시 baseSize 20pt 토글** 옵션 ADR-003에 추가 트리거 명시 (장기 옵션)

## 1인 운영 효과

- pgTAP 부정 5건 = RLS 회귀 자동 감지 (CI에서 항상 실행)
- DESIGN.md = 디자인-개발 핸드오프 제로화. 토큰 충돌 발생 시 본 문서가 결정 근거.
- 와이어프레임 → 코드 정렬: 후속 화면 작업이 단일 토큰만 참조

## 미적용 (이월)

- DESIGN.md → tokens 자동 생성 CLI (rubric.im 권장 lint/diff/export) → iter 09 후보
- 와이어프레임 HTML 파일들의 _tokens.css 정리 → iter 06 후보 (Korean 칩 작업과 함께)
- pgTAP 케이스 6 (정산 분쟁 분기 보호) → iter 06 후보

## 다음 iter (04)

- `withOperatorAction` HOF 추출 + `getServerSupabase` factory 일원화 (iter02 FE #1·2 이월)
- 또는 Demo Mode 토글 (자격증명 없이 Vercel preview 배포 가능)
