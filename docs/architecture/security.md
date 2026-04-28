# 보안 · 개인정보 · 법적 준수

## 법적 지위 (v2 — Free Model Pivot, ADR-002 v2)

- **통신판매중개업 신고** (전자상거래법, 자본금 요건 없음) — 유지
- **직거래 모델** (Phase 1 M0~M18): 워커 ↔ 구인자 직접 송금. **플랫폼 자금 미개입 → 전자금융거래법 우려 자체 소멸**.
- 노무 중개가 아닌 "정보 제공 + 매칭 중개"로 법적 프레이밍 — 유지

### Phase 2 광고 모델 (M18+, ADR-011) — **검토 중**

- 광고 매출 도래 시 다음 영역 추가 검토 필요:
  - **부가세 신고**: 광고주 결제 = 광고 서비스 매출 → 부가세 10% 분리 처리
  - **광고주 세금계산서**: B2B Premium 월정액 구독 시 자동 발급 워크플로 (전략팀장 + 세무 파트너)
  - **데이터 인사이트 상품**: PII 절대 미포함 검증 (차등 프라이버시 또는 k-익명성), 출시 전 보안 감사
  - **광고 표시 의무**: 표시광고법 제3조에 따라 "[광고]" 명시 라벨 (워커 앱 UI 강제)
- M18 트리거 도달 직전(M16~M17) 전략팀장이 본 섹션을 **확정 결정**으로 갱신.

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
