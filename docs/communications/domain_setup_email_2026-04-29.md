# 도메인 연결 자가발신 이메일

**용도**: 김연재(yjkim@aboutfishing.kr) → ilgam.jtbd@gmail.com 백업
**제목**: [ILGAM] 도메인 연결 가이드 + 배포 자동화 (ADR-013) · 2026-04-29

## 본문

```
일감(ILGAM) 도메인 연결 + 배포 자동화 패키지 자가발신 백업.

[1] GitHub commit 완료 (자율 진행)
- docs/runbook/domain_setup.md (가이드 5단계)
- docs/runbook/secrets.md (14종 인벤토리)
- docs/decisions/ADR-013-deployment-automation.md
- .github/workflows/deploy.yml
- scripts/deploy_edge_functions.sh + verify_deployment.sh
- apps/admin-web/app/api/healthz/route.ts + vercel.json
- supabase/functions/healthz/index.ts

[2] 김연재님 30분 직접 작업 (결제·OAuth 필요)
A. 도메인 등록 (가비아·후이즈·Cloudflare Registrar)
B. Vercel 가입 (GitHub OAuth) → ilgam-jtbd/ilgam import → apps/admin-web
C. Cloudflare 가입 → DNS 영역 생성
D. Supabase Production 생성 (ap-northeast-2) → 마이그 push
E. 시크릿 14종 등록
F. Cloudflare DNS A·CNAME 추가 → SSL Full Strict
G. healthz 검증

[3] 자동화 가동
- 도메인 + 시크릿 등록 후 첫 push → deploy.yml 자동
- bash scripts/verify_deployment.sh ilgam.kr 사후 검증
- bash scripts/deploy_edge_functions.sh <project-ref> Edge Function 일괄

[4] 결제 (직접 입력)
- 도메인 1~3만/년
- Vercel Hobby (무료) → Pro $20/월 (M3+)
- Supabase Free → Pro $25/월 (M3+)
- Cloudflare Free
- 초기 0원 (M0~M2) → 월 약 7만원 (M3+)

[5] 링크
- GitHub: https://github.com/ilgam-jtbd/ilgam
- 가이드: github.com/ilgam-jtbd/ilgam/blob/main/docs/runbook/domain_setup.md
- ADR-013: github.com/ilgam-jtbd/ilgam/blob/main/docs/decisions/ADR-013-deployment-automation.md

자동화 코드·문서 main 브랜치 push 완료. 외출 복귀 후 본 메일 확인 + Vercel·Cloudflare·Supabase 가입.

--
자가발신 백업. Claude (Cowork) · 2026-04-29
```
