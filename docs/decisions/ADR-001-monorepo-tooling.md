# ADR-001 · 모노레포 도구 선택

- **상태**: Accepted
- **일자**: 2026-04-23
- **의사결정자**: 김연재(PO) · CPO · Claude Code(FE/BE/Infra 합의)
- **참여 에이전트**: Frontend, Backend, Infra

## 배경

일감은 Next.js 기반 구인자 어드민(웹)과 Expo RN 기반 시니어 워커 앱(모바일)을 단일 리포지토리에서 운영한다. 공유 타입·Zod 스키마·Supabase 클라이언트·디자인 토큰이 존재하므로 monorepo가 필요하다. 팀 규모는 1~3명(CPO·전략팀장은 현직 주 10~15h · Claude Code)이며 향후 12개월간 동일 수준을 유지한다.

## 결정

**Turborepo + pnpm workspaces** 채택. Nx는 과잉(generator·plugin 학습 비용, 1~2명 팀 부채), pnpm workspaces only는 CI 캐시 제어가 약해 빌드 시간이 선형 증가. Turborepo + pnpm 조합은 affected workspace만 빌드하고 원격 캐시를 Vercel 무료 티어로 즉시 활용 가능.

## 구조

```
apps/
  admin-web/          @ilgam/admin-web   Next.js 14 App Router
  worker-app/         @ilgam/worker-app  Expo SDK 51
packages/
  core/               @ilgam/core        타입·Zod·Supabase 클라이언트·API 훅
  db/                 @ilgam/db          마이그레이션·시드·pgTAP 테스트
  design-tokens/      @ilgam/design-tokens  navy/gray 팔레트·a11y 토큰
supabase/
  functions/          Edge Functions (Deno)
```

## 공유 전략

- **UI 컴포넌트**는 공유하지 않음(웹=shadcn/ui, 모바일=React Native Paper)
- **로직·스키마·API 호출 훅**만 `packages/core`에서 공유
- Tamagui는 과잉(Frontend ADR 입력), Solito는 부분 도입을 M2에 재검토

## 원격 캐시

- M1~M3: Vercel Remote Cache 무료 티어(팀당 무제한)
- Vercel 이탈 시 self-hosted `turborepo-remote-cache` + Cloudflare R2 월 5천원 대안 준비

## 재평가 트리거

- 개발자 5명 초과
- 앱 3개 이상 추가 (구인자 모바일 앱 등)
- Nx의 generator·plugin 이점이 러닝커브를 상쇄하는 시점

## 결과

- 초기 CI 시간 5분 이내(필수 게이트 lint·typecheck·test)
- 단일 `pnpm install` 로 전 패키지 설치
- Turbo `--filter=...[origin/main]` 로 변경 영역만 실행
