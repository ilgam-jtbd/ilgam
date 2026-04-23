# 보안 · 개인정보 · 법적 준수

## 법적 지위

- **통신판매중개업 신고** (전자상거래법, 자본금 요건 없음)
- 전자금융거래법상 PG업 등록 회피 → PortOne 에스크로 활용
- 노무 중개가 아닌 "정보 제공 + 매칭 중개"로 법적 프레이밍

## 개인정보 분류

| 등급 | 항목 | 저장 | 암호화 |
|---|---|---|---|
| 가명정보 | `ci_token`, `di_token`, `birth_ymd`, `gender_code` | `public.workers` | 앱 레벨 |
| PII | 이름·전화·주소 | `public.profiles`, `public.workers` | TLS + at-rest |
| 민감 PII | 주민번호·계좌·사업자번호 | `private.workers_tax_identity` | pgcrypto + Vault 키 |
| 금융정보 | 카드번호·CVC | **저장 금지** | PortOne 토큰만 |

## 접근 통제

- Supabase RLS 기본 deny, 명시 허용만
- service_role 키는 서버 사이드 전용, CI 저장 금지 (1Password → 런타임 주입)
- 어드민 `private.*` 접근 시 `audit_log` 선기록 트리거
- 분기 1회 접근권 회수 + 이탈자 24시간 회전

## 암호화

- in-transit: TLS 1.2+ (HSTS 1년 · includeSubDomains)
- at-rest: Supabase 플랫폼 AES-256
- 컬럼 암호화: `pgcrypto pgp_sym_encrypt` + Vault 키 런타임 주입
- 애플리케이션 로그에 PII 절대 기록 금지 (Sentry scrubber 활성)

## 파기 의무 vs 감사 보존 충돌 해결

- PII: 탈퇴·목적 달성 즉시 `NULL` 또는 삭제
- 거래기록: `worker_id`를 익명 UUID(`00000000-...`)로 치환, 5년 보존
- `audit_log`: 파기 일시·사유·집행자 기록 (파티션, 월 단위)

## 결제 보안

- PortOne webhook 서명 검증 (`x-portone-signature`)
- 금액 불일치 자동 환불 차단 + P0 슬랙 알림
- `imp_uid` 멱등성 제약 (`unique index`)
- 정산 금액 DB = PortOne 응답 이중 대조

## 침해사고 대응

1. P0 감지 → 15분 내 온콜 → 영향 범위 격리 (토큰 회전·세션 무효화)
2. 4시간 내 해결 또는 유저 공지
3. KISA 24시간 내 신고 (개인정보 유출 시)
4. 포스트모템 48시간 내 공개 (팀 내부 + 해당 사용자)
