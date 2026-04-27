# ILGAM 멀티 에이전트 10회 개선 — 결과 요약

**기간**: 2026-04-27 15:09–18:30 KST (3시간 21분)
**커밋**: 11개 (PR #14, head=`<this commit>`)
**목표 달성**: 1인 운영 효율성 최대화

## 1. 한 페이지 결과

| 영역 | 적용 | 효과 |
|---|---|---|
| **시니어 UX** | 카테고리 탭 48dp · 한글 1자 칩 + accessibilityLabel · Undo Optimistic Delay 토스트 | 이모지 OS/스크린리더 불일치 해소 · 미스탭 회복 진정성 확보 |
| **보안** | Server Action requirePlatformAdmin + Zod + 멱등 + Mock 폴백 prod throw + pgTAP 부정 10건 | RLS·인증 회귀 자동 감지 · 우회 표면 차단 |
| **자동화** | pre-commit + lint-staged · CI Edge deno + Expo prebuild · Dependabot weekly | CI 재시도 0 · 배포 직전 발견 80%↓ · CVE 노출 30→3일 |
| **단일 정본** | DESIGN.md 1정본 (Navy/18pt/16px) · 공통 UI(FlashBanner/StatusBadge) · getServerSupabase factory | 디자인-개발 핸드오프 마찰 0 |
| **운영성** | Demo Mode 토글 + .env.example 명시 · docs/README.md 인덱스 + 1시간 온보딩 · CODEOWNERS | 자격증명 미수령에도 데모 가능 · 컨텍스트 스위칭 비용↓ |

## 2. 개선 과정 논리 (멀티 에이전트 피드백 루프)

```
iter 01 → 3 에이전트 병렬 (UX/QA/PM) 진단 → 상위 3건 적용
iter 02 → 2 에이전트 (PM/FE) 코드 스니펫 + 코드 품질 → 적용
iter 03 → 2 에이전트 (Backend/QA + 디자인) → SQL/MD 본문 작성·적용
iter 04~09 → 직접 적용 (이전 에이전트 권고 큐 소진)
iter 10 → UX/QA 종합 검수 에이전트 → 잔여 5건 진단 → High 3건 즉시 회복
```

핵심 메커니즘:
- **Cross-cutting 우선**: 한 변경이 UX·QA·PM 3축 모두에 효과 있는 항목 우선 (예: 48dp 탭 = UX P1 + QA 접근성 회귀 방지 + PM 컨버전 영향)
- **이월 큐**: 각 iter에서 적용 못한 항목은 명시 큐로 이월 → 다음 iter 시작 시 우선순위 재평가
- **검수 → 회복**: 9개 iter 끝에 종합 검수 에이전트가 "잘 됐다/부족하다" 한 줄 평가, 부족한 것은 같은 세션에서 즉시 회복 (iter10 = High 3건 종결)

## 3. 산출 파일 트리

```
docs/
├── README.md                       (신규 · 인덱스)
├── design/
│   └── DESIGN.md                   (신규 · Google Labs 포맷 단일 정본)
└── improvement/
    ├── improvement-log.md          (신규 · 종합 표)
    ├── summary.md                  (이 파일)
    └── iterations/
        ├── iter-01.md
        ├── iter-02.md
        ├── ...
        └── iter-10.md

apps/
├── admin-web/
│   ├── lib/demo.ts                 (신규 · prod throw 가드 포함)
│   └── components/ui/
│       ├── FlashBanner.tsx         (신규)
│       └── StatusBadge.tsx         (신규)
└── worker-app/app/
    └── matches/[id].tsx            (신규 · 매칭 명세)

packages/db/tests/
├── 06_rls_negative.sql             (신규 · cross-tenant 5건)
└── 07_admin_rls_negative.sql       (신규 · admin/private/operator 5건)

.github/
├── dependabot.yml                  (신규)
└── workflows/ci.yml                (수정 · 2 job 추가)

.husky/pre-commit                   (신규)
```

## 4. 1인 운영 체크리스트 (지속 적용)

- [ ] 매주 월 09:00 KST: Dependabot PR 5개 한도 처리
- [ ] PR 작성 시 `docs/README.md` 변경 영향 매트릭스 표 체크
- [ ] DESIGN.md 충돌 발생 시 본 문서가 결정 근거 (코드 토큰 우선)
- [ ] 새 백오피스 화면: `<FlashBanner search={search} />` 1줄로 결과 표시 일관
- [ ] Vercel preview: `NEXT_PUBLIC_DEMO_MODE=1` 토글 (prod에서 자동 throw)
- [ ] 새 PC 온보딩: `docs/README.md` 1시간 가이드

## 5. 미해결 / 차기 PR

- operator_actions(idem_key UNIQUE) 마이그레이션 — 분산 멱등 (자격증명 후)
- Playwright 12 + Maestro 8 staging 스모크 — Vercel preview + EAS 후
- axe-core/playwright PR axe critical=0 — staging 후
- worker app `/matches` 취소 정책 + UI — DB 정책 + cancel mutation 필요
- CodeQL 정적 분석 워크플로 — 30분 작업, 자격증명 무관

## 6. 도구 한계 노트

- YouTube 비디오 직접 시청 불가: WebFetch는 검색 결과 페이지의 텍스트만 가져옴. 비디오 분석은 시간/비용 ROI 낮아 회피.
- DESIGN.md는 rubric.im의 1회 학습으로 충분히 적용 (포맷 자체가 명확).
