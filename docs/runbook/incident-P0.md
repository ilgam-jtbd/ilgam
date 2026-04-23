# P0 인시던트 런북

## 정의
- 결제 오류 · 개인정보 노출 · 전체 로그인 불가 · 워커 당일급여 미지급

## 감지
- Sentry "issue.alert" → Slack #alerts
- Uptime Kuma 다운 3회 연속
- 채널톡 신규 P0 태그 신고

## 15분 내
1. 온콜이 Slack `/incident declare P0 "<summary>"` 실행
2. 영향 범위 확인 (DB 쿼리 + Sentry)
3. 토큰·세션 회전 필요 여부 판단
4. 유저 영향 있을 시 채널톡·알림톡 공지 초안

## 4시간 내
1. 핫픽스 브랜치 PR (CI 게이트 건너뛰기 권한 온콜에게만)
2. staging 통과 후 production 긴급 배포
3. 알림톡 해결 공지

## 48시간 내
1. 포스트모템 문서 `docs/meetings/postmortem-YYYY-MM-DD.md`
2. 팀 리뷰 회의
3. ADR 갱신 필요 시 PR

## 개인정보 유출 시 추가
- KISA 24시간 내 신고
- 유출 사용자 개별 통지 (서면 포함)
- 외부 법률 파트너 연락
