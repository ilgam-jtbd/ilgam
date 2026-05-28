# velor.kr 도메인 연결 가이드

## 1. Vercel에서 도메인 추가 (먼저)

Vercel 대시보드 → platform-web 프로젝트 → Settings → Domains

```
velor.kr        추가
www.velor.kr    추가
```

추가 후 Vercel이 표시하는 DNS 값을 확인한다.  
일반적으로 아래 두 레코드가 필요하다:

| 타입 | 이름 | 값 |
|---|---|---|
| A | @ (루트) | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

## 2. Gabia DNS 설정

**로그인:** https://my.gabia.com → 구글 로그인 (ilgam.jtbd@gmail.com)

**경로:** 서비스 관리 → 도메인 관리 → velor.kr → DNS 설정

### 추가할 레코드

| 타입 | 호스트명 | 값/목적지 | TTL |
|---|---|---|---|
| A | @ | `76.76.21.21` | 300 |
| CNAME | www | `cname.vercel-dns.com` | 300 |

> 기존에 다른 A 레코드가 있다면 삭제하고 위 값으로 교체.

### 이메일 MX 레코드 (선택 — Google Workspace 사용 시)

| 타입 | 호스트명 | 값 | 우선순위 |
|---|---|---|---|
| MX | @ | `aspmx.l.google.com` | 1 |
| MX | @ | `alt1.aspmx.l.google.com` | 5 |
| MX | @ | `alt2.aspmx.l.google.com` | 10 |

> support@velor.kr, recruit@velor.kr 사용을 위해 필요.

## 3. 전파 확인

DNS 변경 후 5~30분 소요. 확인 명령:

```bash
dig A velor.kr +short
# 기대값: 76.76.21.21

dig CNAME www.velor.kr +short
# 기대값: cname.vercel-dns.com.
```

또는 온라인 도구: https://dnschecker.org/#A/velor.kr

## 4. Vercel SSL 자동 발급

DNS 전파 완료 → Vercel 대시보드에서 자동으로 Let's Encrypt SSL 발급.  
보통 5분 이내. Domains 탭에서 초록색 체크 확인.

## 5. 최종 검증

```bash
bash scripts/verify_deployment.sh velor.kr
```

출력 예상:
```
[1/5] DNS A record        [OK] 76.76.21.21
[2/5] SSL certificate     [OK]
[3/5] HTTP 200            [OK] 200
[4/5] /api/healthz        [OK] {"ok":true,"app":"platform-web",...}
[5/5] Supabase REST       [OK] 200
모든 검증 PASS
```
