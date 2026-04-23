## 무엇 / 왜
<!-- 한 문단, 배경과 결과 -->

## 관련
- Issue:
- ADR:

## 검증
- [ ] `pnpm lint` · `pnpm typecheck` · `pnpm test` 로컬 통과
- [ ] pgTAP RLS 테스트 (DB 변경 시)
- [ ] Playwright/Maestro E2E 영향 범위 점검

## UX 영향
<!-- 시니어 유저 접근성·복구 가능성·전화 의존도 체크. 스크린샷 첨부 -->

## 보안·개인정보
- [ ] PII 컬럼 접근 변경 없음 또는 ADR-005 준수
- [ ] 비밀값 환경변수화 (코드 하드코딩 금지)
