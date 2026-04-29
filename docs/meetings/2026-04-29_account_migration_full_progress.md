# 일감(ILGAM) 전체 진행 로그 — ilgam.jtbd 계정 마이그레이션

**기록일**: 2026-04-29
**공식 계정**: ilgam.jtbd@gmail.com
**조직 ID**: 4c512e56-8814-4ce2-9d9d-7249c875e54c

본 문서는 2026-04-23 ~ 2026-04-29 7일간의 전 작업을 ilgam.jtbd 계정·조직 권위 하에 영구 보관한다.

## 1. 인프라 구축 완료

| 영역 | 상태 | 권위 자료 |
|---|---|---|
| GitHub 리포 | ilgam-jtbd/ilgam · main 7 commits | github.com/ilgam-jtbd/ilgam |
| Supabase (검증) | ilgam-prod ap-northeast-2 izeotpefhddrrwodgpry · 마이그 3건 적용 | docs/architecture/system.md |
| 로컬 개발환경 | Node 24 · pnpm 9.12 · Claude Code 2.1.118 (Opus 4.7) | scripts/install_local.md |
| Drive Desktop | I:\내 드라이브\ilgam Mirror 동기화 | reports/ |
| GitHub Actions Secrets | 4건 (Supabase 키 전체) | docs/runbook/secrets.md |
| Production 도메인 | Phase 0 M0(2026.10) 베타 배포 시 ilgam.kr 연결 예정 | docs/runbook/domain_setup.md |

## 2. 전략·문서 산출물 (총 32건)

### 2.1 ADR 9건
ADR-001 모노레포 · ADR-002 NSM/MVP · ADR-003 Frontend · ADR-004 Backend · ADR-005 DB/RLS · ADR-006 Infra · ADR-007 QA · ADR-008 CX · ADR-013 Deployment Automation

### 2.2 제품·아키텍처 문서 6건
PRD · system · ERD · security · P0 runbook · 킥오프 회의록

### 2.3 전략 문서 (피벗 v3.0/v3.1) 4건
PIVOT_DECISION_2026-04-24 · YOLD_ADVISORY_SEGMENT · RISK_ASSESSMENT_FREE_MODEL · 피벗 핸드오프

### 2.4 대외 문서 3건
KORDI MOU v1 + v2 · 알림톡 6종 · 도메인 연결 가이드

### 2.5 IR 자료 3건 (2026-04-29 작성)
ILGAM_IR_Pitch_2026-04-29.pptx (12슬라이드, 420KB)
ILGAM_BusinessPlan_2026-04-29.docx (14섹션, 52KB, 김연재 특허 5건 포함)
ILGAM_Service_Screens_2026-04-29.html (7화면, 33KB)

### 2.6 자동화 자산 7건
deploy.yml workflow · deploy_edge_functions.sh · verify_deployment.sh · healthz API + Edge Function · vercel.json · setup_claude_code.bat/ps1 · install_gdrive.bat/ps1

### 2.7 리서치 1건
KB경영연구소 스폿워크 산업 보고서 2025.06 정리

## 3. 메모리 권위 파일 (Claude 세션 영구 컨텍스트)

| 파일 | 역할 |
|---|---|
| project_ilgam_account_migration.md | **신규 — 본 마이그레이션 권위** |
| project_ilgam_strategy_pivot_2026-04-24.md | v3.0 + v3.1 단계화 모델 MASTER |
| project_ilgam_revenue_model.md | Phase 0·1·2 수익 모델 |
| project_ilgam_yold_advisory.md | YOLD 5중 해자 |
| project_ilgam_brand.md | 앰버 #F59E0B 브랜드 |
| project_ilgam_team_roles.md | 김연재 직함 정책 |
| project_ilgam_support_channels.md | 채널톡·알림톡 정책 |
| project_ilgam_ir_deck.md | IR 덱 v3_3 base |
| project_ilgam_artifacts_location.md | C:\Users\USER\Desktop\yjkim\ILGAM\Artifacts |
| project_ilgam_timing_window.md | 9~12개월 진입 창문 |
| project_ilgam_future_ideas.md | 향후 고려 아이디어 |
| competitor_gubgoo_needer.md | 급구·니더 팩트시트 |
| competitor_senior_job_landscape.md | 경쟁 지형 v3 (당근알바 위협도 최상) |
| benchmark_timee_japan.md | 타이미 벤치마크 |
| market_spotwork_kb_report_2025.md | KB 보고서 시장 데이터 |

## 4. 김연재 특허 5건 (DOCX·PPTX 인용 완료)

| 등록/출원 | 번호 | 일감 적용 |
|---|---|---|
| 등록 | 10-2947624 | 컨텐츠 QA 4-tier + 시니어 신뢰 매칭 |
| 출원 | 10-2026-0056440 | 동네지사·지인 추천 가중치 |
| 출원 | 10-2026-0056441 | 욜드 자문 매칭 + 기여자 수익 분배 |
| 출원 | 10-2026-0056442 | 시급·위치·시간대 매칭 정확도 |
| 출원 | 10-2026-0056443 | 시니어 음성·챗봇 매칭 |
| 상표 | 12건+ | 어바웃피싱 외 등록 |

## 5. 단계화 자금 로드맵 (v3.1)

| Phase | 시점 | 구조 | 자금 |
|---|---|---|---|
| 0 검증 | 2026.10~2027.02 (5개월) | 양측 무료 MVP | Seed ₩2~3억 + 정부과제 ₩5천만 |
| 1 법인 | 2027.04~ | 법인 설립 + 인력사무소 표준 10% 수수료 (구인자 부담) | TIPS ₩10억 (2년 이내) |
| 2 광고 | 2027 하반기~ | 10% + 광고·자문 멤버십 부가 | Pre-A ₩10~15억 가능성 |

## 6. 5중 차별화 해자

1. 시니어 전담 UX (48dp·18pt·WCAG AAA)
2. 한국노인인력개발원 공공 MOU (수행기관 1,500개소)
3. 컨텐츠 QA 4-tier (자동·Claude API·운영자·외부 신고)
4. 동네지사 거점 (강서·송파·성북)
5. YOLD Expert Advisory (자문 가능 욜드 60만 풀)

## 7. 김연재 복귀 후 작업 (외출 중 자율 진행 영역 외)

도메인 연결 패키지 가이드(`docs/runbook/domain_setup.md`)에 따라 30분 직접:

A. 도메인 등록 (가비아 ilgam.kr · 신용카드 직접 입력)
B. Vercel 가입 · GitHub OAuth · ilgam-jtbd/ilgam import
C. Cloudflare 가입 · DNS 영역 생성 · 가비아 네임서버 변경
D. Supabase Production 생성 (ap-northeast-2) · 마이그 push · Edge Function 배포
E. 시크릿 14종 등록 (Vercel 6 · GitHub Actions 6 · Supabase Vault 5)
F. Cloudflare DNS A·CNAME 추가 · SSL Full strict
G. healthz 검증 (`bash scripts/verify_deployment.sh ilgam.kr`)

이후 모든 배포는 `git push origin main` 만으로 진행 (`.github/workflows/deploy.yml` 자동).

## 8. Git 커밋 히스토리

```
761cb72 feat(infra): 도메인 연결 + 배포 자동화 패키지 (ADR-013)
a57e252 feat(strategy): 2026-04-24 피벗 통합 운영 — 무료 + YOLD + KORDI MOU v2
ad0fdd6 docs: KB경영연구소 스폿워크 산업 보고서 2025.06 반영
f51a0ca fix(docs): 이메일 yjkim@aboutfishing.kr → ilgam.jtbd@gmail.com
00d24e1 feat(db): 0003 API exposure policies + env template
72e1d31 docs: 알림톡 템플릿 6종 + KORDI MOU v1
bcb1154 feat: 일감(ILGAM) 초기 스캐폴딩 + ADR 8건 (v0.1.0)
```

## 9. 백업 4중화

1. **GitHub** ilgam-jtbd/ilgam main 브랜치
2. **Google Drive** I:\내 드라이브\ilgam (Mirror 동기화)
3. **로컬 ILGAM 폴더** C:\Users\USER\Desktop\yjkim\ILGAM\ILGAM (Drive sync 원본)
4. **GitHub bundle** (1회성 시점 스냅샷, ilgam-v0.1.x.bundle)

## 10. 다음 세션 시작점

복귀 후 본 Cowork 창 또는 새 세션에서:

```
docs/meetings/2026-04-29_account_migration_full_progress.md 읽고
ilgam.jtbd@gmail.com 조직 4c512e56-8814-4ce2-9d9d-7249c875e54c 권위 하에
다음 작업 우선순위 점검. 도메인 등록·Vercel·Cloudflare·Supabase 가입 진행 상태 알려줘.
```

---
**기록**: Claude (Cowork) · 2026-04-29 · 권한 위임 자율 진행
