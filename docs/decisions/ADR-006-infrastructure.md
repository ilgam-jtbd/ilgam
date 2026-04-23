# ADR-006 · 인프라 · 배포 · 모니터링 · CI/CD

- **상태**: Accepted
- **일자**: 2026-04-23
- **참여 에이전트**: Infra, Backend

## Next.js 호스팅

**M1~M6: Vercel Pro** (월 $20/멤버 ≈ 3만원). ECS 직접 운영은 1~3인 팀 SRE 부담 과다. App Runner 한국 레이턴시 이점 소멸. Cloudflare Pages + Workers는 App Router 호환성 검증 부담.

**6개월 후 AWS Seoul 이전 시나리오**: Next.js는 상태 거의 미보유(모든 상태 Supabase) → 이전 비용 약 200~300만원(엔지니어 2주). Vercel 락인 리스크 낮음.

## Supabase 리전 · 백업

- 리전: **ap-northeast-2 (서울)** — 도쿄 대비 국내 DB 레이턴시 15~30ms 단축, 알림톡·PortOne 동일 권역, 공공 MOU 데이터 거주 선제 대응
- Pro 기본 PITR 7일 → M1~M4 충분
- M5부터 PITR 14일 애드온(월 $100 ≈ 14만원)
- 매일 `pg_dump` → S3 Seoul 교차 백업(월 1만원) — 공급자 락인 분산

## 모바일 배포

**Expo EAS Submit** (Production $19/월 ≈ 2.7만원) 기본 채택.

**심사 리스크 3가지**:
- 접근성(큰 글씨·고대비) 미흡 리젝
- "스팟 알바" 노동 중개 소명 요구(Apple 4.7)
- 위치권한 사유 불충분

**완화**: EAS OTA Update로 UI 수정 3~7일 내 심사 없이 배포. 초기 2회 심사 여유 일정 반영.

## 비밀 관리 (SSOT = 1Password Business)

- 1Password = 프로덕션 시크릿 단일 진실 원천 (월 $7.99/인)
- Vercel env = Next.js 런타임
- Supabase Vault = DB 함수 내부 호출 키
- Expo EAS Secrets = 모바일 빌드 타임
- GitHub Actions Secrets = CI 배포

중복은 동일 비밀이 두 런타임에서 필요한 경우만 허용. 1Password 태그(`runtime:vercel`, `runtime:eas`)로 추적. 회전 분기 1회, 이탈자 24시간 내 전면 회전.

## 모니터링 (월 상한 15만원)

- **Sentry Team** (web+RN+Edge 통합, 월 $26 ≈ 3.7만원) — 필수
- **Supabase Logs** — Pro 포함
- **PostHog Cloud** — 100만 이벤트/월 무료, 초과 $50 상한
- **Uptime Kuma** — $5 VPS 셀프호스팅, 알림톡·PortOne 외부 API 1분 간격 감시

초과 시 PostHog 이벤트 샘플링 우선 조정.

## CI 파이프라인

- GitHub Actions + Turborepo remote cache (Vercel 무료 tier)
- `turbo run build --filter=...[origin/main]` 로 affected만
- 필수 3단계 (lint·typecheck·test) 5분 SLA
- 선택 2단계 (Playwright E2E · EAS preview build)
- 무료 2,000분/월 M4까지 충분
