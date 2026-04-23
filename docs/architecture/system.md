# 시스템 아키텍처

## 토폴로지

```
┌────────────────────────────────────────────────────────────┐
│                         Users                              │
│  ┌──────────────┐           ┌────────────────────────┐    │
│  │ Senior Worker│           │  Employer / Admin       │    │
│  │  (Expo RN)   │           │  (Next.js 14 Web)       │    │
│  └──────┬───────┘           └───────────┬─────────────┘    │
└─────────┼──────────────────────────────┼──────────────────┘
          │                              │
          │ HTTPS / JWT                  │ HTTPS / JWT + SSR
          │                              │
          ▼                              ▼
    ┌──────────────────────────────────────────────┐
    │           Next.js API Route (tRPC)            │
    │   · 결제/정산 · Claude 호출 · 어드민 전용     │
    └────────┬─────────────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────────────┐
    │        Supabase (ap-northeast-2 · Seoul)      │
    │  ┌───────────┐ ┌──────────┐ ┌──────────────┐│
    │  │ Postgres  │ │ Auth     │ │ Realtime CDC ││
    │  │ + PostGIS │ │ (JWT)    │ │              ││
    │  └───────────┘ └──────────┘ └──────────────┘│
    │  ┌───────────────────────────────────────┐  │
    │  │  Edge Functions (Deno)                │  │
    │  │  · match-engine                       │  │
    │  │  · notify-dispatch (알림톡→SMS)       │  │
    │  │  · payment-settle (PortOne 웹훅)      │  │
    │  │  · cx-triage (Claude intent)          │  │
    │  └───────────────────────────────────────┘  │
    │  ┌──────────────┐  ┌─────────────────────┐  │
    │  │ Storage      │  │ pg-boss 큐           │  │
    │  │ (셀카·영수증)│  │ (Postgres 기반)      │  │
    │  └──────────────┘  └─────────────────────┘  │
    └──────────────────────────────────────────────┘
                       │
                       ▼
    ┌───────────────────────────────────────────────┐
    │            External APIs                      │
    │  · PortOne (결제·에스크로·송금)               │
    │  · Bizppurio (카카오 알림톡)                  │
    │  · Aligo/LG U+ (SMS 폴백)                     │
    │  · Channel.io (CX 티켓)                       │
    │  · Anthropic Claude (공고 요약·CX 트리아지)   │
    │  · PASS/NICE (본인확인)                       │
    └───────────────────────────────────────────────┘
```

## 주요 시퀀스

### 1. 시니어 워커 온보딩 (3탭)
1. 알림톡/SMS 링크 → `/auth/magic` → Supabase magic-link JWT 발급
2. 동·요일·업종 태그 선택 → `rpc: upsert_worker_preferences`
3. 피드 렌더 (RPC 1차 필터 + 2차 랭킹, 10~50ms)

### 2. 매칭 확정
1. 워커 "지원하기" 탭 → `rpc: apply_to_job` (중복 방지 + 공고 상태 체크)
2. 구인자 Realtime CDC 알림 수신
3. 구인자 "수락" 탭 → `rpc: confirm_match`
4. `notifyAdapter.send()` → 알림톡(1순위) / SMS(폴백)

### 3. 당일 정산
1. 출근 → GPS + 셀카 업로드 → `shifts.clock_in_at` 기록
2. 퇴근 → `shifts.clock_out_at` + `worked_minutes` GENERATED
3. 구인자 승인 (15분 무응답 자동 승인)
4. 트리거 → `payments_pending` 삽입
5. `pg_cron` → Edge Function `payment-settle` → PortOne 송금 API
6. 완료 알림톡

### 4. CX 처리
1. 알림톡/SMS → 채널톡 인입
2. webhook → Edge Function `cx-triage` → Claude intent 분류
3. confidence ≥ 0.85 자동답변 / 미만 상담원 이관
4. 3회 재질문 또는 "방문" 발화 → 동네지사 카드

## 데이터 거주 · 백업

- Primary: Supabase ap-northeast-2
- 교차 백업: AWS S3 Seoul (매일 `pg_dump` GitHub Actions)
- PITR: Pro 7일 → M5부터 14일

## 장애 대응

- 알림톡 장애 → SMS 자동 폴백 (8초 이내)
- PortOne 장애 → Uptime Kuma 1분 감지 → 슬랙 P0 + 당일 지급 수동 모드
- Supabase 장애 → Vercel 정적 공지 페이지 (읽기 전용 안내)
- Sentry 에러 증가 임계 → 자동 배포 게이트 중단
