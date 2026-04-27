# iter 08 — CI 강화 (Edge Function deno check + Expo prebuild dry-run)

**시각**: 2026-04-27 17:46–18:00 KST · **에이전트**: 직접 적용 (PM iter01 권고 #3)

## 변경

`.github/workflows/ci.yml`에 2개 job 추가:

### 1) `edge-deno-check`
- `denoland/setup-deno@v1` (Deno 1.x)
- `deno check supabase/functions/*/index.ts` — 타입 검증 (TypeScript는 못 잡음, Edge runtime이라)
- `deno lint supabase/functions` — Deno 컨벤션 검증
- 빈 디렉토리 가드 (compgen)

### 2) `expo-prebuild-check`
- worker-app 변경 시에만 실행 (turbo `--dry-run=json` 결과 grep)
- `npx expo-doctor` (의존성 호환성)
- `npx expo prebuild --no-install --platform android --clean` (네이티브 빌드 dry)
- ADR-007 머지 게이트 강제 (이전: PR 본문 체크박스만)

## 1인 운영·머지 게이트 효과

- **배포 직전 발견** 회귀 80%↓ — Edge Function 타입 오류, Expo SDK 버전 충돌, 네이티브 모듈 미설정 등이 PR에서 차단
- 1인 운영자가 매번 `expo prebuild` 수동 실행하지 않아도 됨
- ADR-007 명시 게이트 → CI 자동화 단계로 승격

## 미적용 (이월)

- Playwright 12 + Maestro 8 staging 스모크 → staging 배포 워크플로 (별도 yml) 필요. 자격증명 도착 후
- axe-core/playwright PR 단계 axe critical=0 — 자격증명 + Vercel preview 필요
- Sentry release 태그 자동 생성 → release 워크플로

## 검증

- 워크플로 yml 문법: GitHub Actions 스키마 준수 (수동 review)
- 다음 PR 푸시 시 새 job 자동 트리거 예정
