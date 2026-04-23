# 기여 가이드

## 브랜치
- `main` — 프로덕션. 직접 push 금지.
- `develop` — 스테이징 배포 타겟.
- `feat/<scope>-<summary>` · `fix/<scope>-<summary>` · `chore/<summary>`

## 커밋 컨벤션 (Conventional Commits)
- `feat(scope): ...` · `fix(scope): ...` · `docs(scope): ...` · `chore(scope): ...`
- scope 예시: `web`, `app`, `db`, `infra`, `cx`, `adr`

## PR 체크리스트
- [ ] `pnpm lint` 통과
- [ ] `pnpm typecheck` 통과
- [ ] `pnpm test` 통과
- [ ] 관련 ADR 링크 (구조 변경 시)
- [ ] 개인정보·결제 관련 변경 시 `docs/architecture/security.md` 갱신
- [ ] 스크린샷 또는 영상 (UX 변경 시)

## 리뷰 게이트
- **merge-to-main**: lint·typecheck·test·pgTAP RLS 전량 green + Expo prebuild 성공
- **staging deploy**: Playwright 웹 스모크 12 + Maestro 앱 스모크 8 + PortOne 샌드박스 결제/환불
- **production deploy**: staging 24시간 체류 + 실기기 결제 1건 + Axe 치명 0건 + 롤백 리허설

자세한 내용은 [docs/decisions/ADR-007-qa-strategy.md](docs/decisions/ADR-007-qa-strategy.md) 참조.
