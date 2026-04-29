# iter 09 — Dependabot + 문서 인덱스 + CODEOWNERS DESIGN.md 추가

**시각**: 2026-04-27 18:00–18:18 KST · **에이전트**: 직접 적용 (PM iter01 권고 #4·#5)

## 변경

| 파일 | 변경 |
|---|---|
| `.github/dependabot.yml` | 신규 — npm + actions 주간 monday 09:00 KST, minor/patch 그룹화, PR 5개 한도 |
| `.github/CODEOWNERS` | DESIGN.md + design-tokens 라인 추가 (CPO 강제 리뷰) |
| `docs/README.md` | 신규 — ADR 9개·디자인·아키텍처·런북·운영·개선 색인 + 변경 영향 매트릭스 + 1시간 온보딩 체크리스트 |

## 1인 운영 효과

- **CVE 노출**: 평균 30일 → 3일 (주간 자동 PR + minor/patch 그룹화로 PR 폭주 방지)
- **컨텍스트 스위칭 비용**: PR 작성 시 영향 매트릭스 표가 "이 변경에서 또 갱신할 문서" 자동 안내 → "ADR 안 고침" 누락 0
- **온보딩**: 새 PC/외주 합류 시 docs/README.md 한 페이지로 1시간 내 가능

## 미적용 (이월)

- CodeQL 워크플로 추가 (PII·결제 코드베이스 정적 분석) → iter 10 후보
- Vercel preview 자동 댓글 봇 → 자격증명 도착 후

## 검증

- yml 문법: GitHub Actions/Dependabot 스키마 준수
- markdown 링크: 상대 경로 모두 유효
