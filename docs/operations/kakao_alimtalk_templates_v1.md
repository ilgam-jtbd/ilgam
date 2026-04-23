# 일감(ILGAM) 카카오 알림톡 템플릿 6종 — Bizppurio 사전심사 제출안

작성일: 2026-04-23 | 작성: CX 엔지니어링 | 발신 채널: @일감ILGAM | 폴백: SMS (LMS 불가, 90byte 이내)

## 공통 규약

- 변수 네이밍: snake_case 통일 (영문)
- 시니어 가독성: 문장당 최대 25자, 숫자는 아라비아 숫자 + 단위 병기
- 존댓말 종결어미 `-습니다 / -십시오` 통일
- 모든 템플릿에 채널 추가 버튼 1개 공통 배치

---

## 템플릿 1 · 매칭 확정 알림 (ILGAM_M001)

| 항목 | 값 |
|---|---|
| 카테고리 | 예약 |
| 유형 | 정보성 |
| 대상 | 워커 |
| 트리거 | 구인자 승인 완료 시 즉시 |

**변수** (8개)
- `#{worker_name}` 김영수 · 10자
- `#{job_title}` 편의점 야간 보조 · 30자
- `#{work_date}` 2026년 4월 25일(토) · 20자
- `#{work_time}` 22:00 ~ 익일 06:00 · 20자
- `#{work_address}` 서울 강서구 화곡로 123 · 40자
- `#{employer_name}` GS25 화곡점 · 20자
- `#{hourly_wage}` 11,500 · 8자
- `#{job_detail_url}` https://ilgam.kr/j/A1B2 · 50자

**본문**
```
[일감] 근무 매칭이 확정되었습니다.

#{worker_name}님, 신청하신 근무가 확정되었습니다.

- 근무명: #{job_title}
- 근무일: #{work_date}
- 근무시간: #{work_time}
- 근무지: #{work_address}
- 구인자: #{employer_name}
- 시급: #{hourly_wage}원

근무 시작 1시간 전 출근 안내를 다시 보내드립니다.
상세 내용은 아래 버튼에서 확인하십시오.
```

**버튼** (3)
1. 근무 상세 보기 · WL · `#{job_detail_url}`
2. 채널 추가 · AC · @일감ILGAM
3. 문의하기 · WL · https://ilgam.kr/cx

**SMS 폴백** (87byte)
```
[일감] 매칭 확정. #{work_date} #{work_time} #{work_address}. 상세는 앱 확인. 취소는 채널톡.
```

**심사 리스크 회피**: "시급" 노출은 확정 건 거래조건 고지(거래 카테고리 필수 요소). 변수 8개는 10개 한도 내.

---

## 템플릿 2 · 출근 리마인더 (ILGAM_M002)

| 항목 | 값 |
|---|---|
| 카테고리 | 예약 |
| 유형 | 정보성 |
| 대상 | 워커 |
| 트리거 | 근무 시작 T-60분 |

**변수** (7개)
- `#{worker_name}`, `#{work_start_time}`, `#{work_address}`, `#{employer_contact_name}`, `#{employer_phone}`, `#{checkin_url}`, `#{map_url}`

**본문**
```
[일감] 근무 시작 1시간 전입니다.

#{worker_name}님, 오늘 #{work_start_time}부터 근무가 시작됩니다.

- 근무지: #{work_address}
- 현장 담당자: #{employer_contact_name} (#{employer_phone})

도착하시면 아래 출근 체크 버튼을 눌러 주십시오.
지각이 예상되는 경우 현장 담당자에게 먼저 연락해 주십시오.
```

**버튼** (4): 출근 체크 WL · 길찾기 WL · 현장 담당자 연결 (tel) · 채널 추가 AC

**SMS 폴백** (84byte)
```
[일감] #{work_start_time} 근무 시작. #{work_address}. 지각 시 현장에 먼저 연락 부탁드립니다.
```

**심사 리스크 회피**: tel 스킴은 Bizppurio 허용 유형(DS). 담당자 전화는 거래 이행 필수 고지.

---

## 템플릿 3 · 급여 정산 완료 (ILGAM_M003)

| 항목 | 값 |
|---|---|
| 카테고리 | 거래 |
| 유형 | 정보성 |
| 대상 | 워커 |
| 트리거 | 정산 송금 webhook 성공 |

**변수** (9개)
- `#{worker_name}`, `#{job_title}`, `#{work_date}`, `#{gross_amount}`, `#{deduction_amount}`, `#{net_amount}`, `#{bank_name}`, `#{account_masked}`, `#{payslip_url}`

**본문**
```
[일감] 급여 정산이 완료되었습니다.

#{worker_name}님, 근무하신 건의 급여가 입금되었습니다.

- 근무명: #{job_title}
- 근무일: #{work_date}
- 지급 총액: #{gross_amount}원
- 공제액: #{deduction_amount}원
- 실수령액: #{net_amount}원
- 입금 계좌: #{bank_name} #{account_masked}

급여명세서는 아래 버튼에서 확인하실 수 있습니다.
입금이 확인되지 않을 경우 고객센터로 문의해 주십시오.
```

**버튼** (3): 급여명세서 보기 · 문의하기 · 채널 추가

**SMS 폴백** (89byte)
```
[일감] 급여 #{net_amount}원 입금 완료. #{bank_name} #{account_masked}. 명세서는 앱에서 확인.
```

**심사 리스크 회피**: 정산 결과 사후 통지 = 거래 카테고리 대표 사례. 계좌 마스킹으로 개인정보 보호.

---

## 템플릿 4 · 공고 지원자 도착 (ILGAM_M004)

| 항목 | 값 |
|---|---|
| 카테고리 | 신청 |
| 유형 | 정보성 |
| 대상 | 구인자 |
| 트리거 | 워커 지원 버튼 |

**변수** (7개): `#{employer_name}`, `#{job_title}`, `#{applicant_count}`, `#{latest_applicant_name}`, `#{latest_applicant_age}`, `#{applicant_review_url}`, `#{auto_close_time}`

**본문**
```
[일감] 공고에 지원자가 도착했습니다.

#{employer_name} 담당자님, 등록하신 공고에 새로운 지원자가 도착했습니다.

- 공고명: #{job_title}
- 현재 지원자 수: #{applicant_count}명
- 최근 지원자: #{latest_applicant_name}님 (#{latest_applicant_age}세)

지원자 프로필 확인 후 승인 또는 반려해 주십시오.
공고는 #{auto_close_time}에 자동 마감됩니다.
```

**버튼** (3): 지원자 검토 · 공고 관리 · 채널 추가

**SMS 폴백** (88byte)
```
[일감] #{job_title} 신규 지원자 도착. 총 #{applicant_count}명. 자동 마감 #{auto_close_time}.
```

**심사 리스크 회피**: 연령 표기는 매칭 적합성 사전 확인 + 본인 동의 공개 항목. 자동 마감은 시스템 정책 사실 고지.

---

## 템플릿 5 · 근무 승인 요청 (ILGAM_M005)

| 항목 | 값 |
|---|---|
| 카테고리 | 거래 |
| 유형 | 정보성 |
| 대상 | 구인자 |
| 트리거 | 워커 퇴근 체크 T+0 |

**변수** (8개): `#{employer_name}`, `#{worker_name}`, `#{job_title}`, `#{checkin_time}`, `#{checkout_time}`, `#{total_hours}`, `#{approve_deadline}`, `#{approve_url}`

**본문**
```
[일감] 근무 완료 승인을 요청드립니다.

#{employer_name} 담당자님, 아래 근무 건의 승인을 요청드립니다.

- 워커: #{worker_name}님
- 공고명: #{job_title}
- 출근 시각: #{checkin_time}
- 퇴근 시각: #{checkout_time}
- 총 근무시간: #{total_hours}

#{approve_deadline}까지 승인이 없으면 자동 승인 처리되며, 이후 급여 정산이 진행됩니다.
이의가 있으실 경우 기한 내 반려 및 사유 입력을 부탁드립니다.
```

**버튼** (4): 근무 승인하기 · 반려 및 사유 입력 · 문의하기 · 채널 추가

**SMS 폴백** (88byte)
```
[일감] #{worker_name} 근무 승인 요청. #{total_hours}. #{approve_deadline} 내 미처리 시 자동 승인.
```

**심사 리스크 회피**: 자동 승인은 근로기준법·정산 프로세스상 사실 고지. 반려 옵션으로 구인자 권리 보장.

---

## 템플릿 6 · CX 문의 처리 완료 (ILGAM_M006)

| 항목 | 값 |
|---|---|
| 카테고리 | 고객응대 |
| 유형 | 정보성 |
| 대상 | 워커·구인자 공통 |
| 트리거 | 채널톡 티켓 resolved |

**변수** (7개): `#{user_name}`, `#{ticket_id}`, `#{inquiry_category}`, `#{submitted_at}`, `#{resolved_at}`, `#{resolution_summary}`, `#{ticket_url}`

**본문**
```
[일감] 문의가 처리 완료되었습니다.

#{user_name}님, 접수하신 문의의 처리가 완료되었습니다.

- 접수번호: #{ticket_id}
- 문의 유형: #{inquiry_category}
- 접수 시각: #{submitted_at}
- 처리 시각: #{resolved_at}
- 처리 결과: #{resolution_summary}

처리 내용에 이의가 있으실 경우 채널톡으로 재문의해 주십시오.
상담 이력은 아래 버튼에서 확인하실 수 있습니다.
```

**버튼** (3): 상담 이력 보기 · 채널톡 재문의 · 채널 추가

**SMS 폴백** (83byte)
```
[일감] 문의 #{ticket_id} 처리 완료. 상세는 앱 확인. 재문의는 채널톡.
```

**심사 리스크 회피**: `resolution_summary` 자유 텍스트는 서버측 화이트리스트(쿠폰·할인 키워드 차단) + 상담원 승인 후 송출. 전화 미운영은 설계 의도(정책 메모).

---

## 제출 전 체크리스트

| 항목 | M001 | M002 | M003 | M004 | M005 | M006 |
|---|---|---|---|---|---|---|
| 정보성 분류 | O | O | O | O | O | O |
| 변수 10개 이하 | 8 | 7 | 9 | 7 | 8 | 7 |
| 본문 1,000자 이내 | O | O | O | O | O | O |
| 버튼 5개 이하 | 3 | 4 | 3 | 3 | 4 | 3 |
| 이모지·특수문자 | 없음 | 없음 | 없음 | 없음 | 없음 | 없음 |
| 시니어 존댓말 | O | O | O | O | O | O |
| SMS 폴백 90byte | 87 | 84 | 89 | 88 | 88 | 83 |
| 채널 추가 버튼 | O | O | O | O | O | O |

## 공통 유의사항

- 발신 프로파일: `@일감ILGAM` · 검색 허용 · 친구 수 제한 해제
- 발송 시간대: M002는 근무 시각 기반 예외, 그 외 야간 발송(21:00~08:00) 회피. M003·M005는 영업시간 09:00~20:00 큐잉
- 웹링크는 HTTPS, `ilgam.kr` 루트 도메인 통일 · 단축URL 금지 (Bizppurio 반려 사유)
- 변수 치환 실패 시 발송 차단 (게이트웨이 레벨 검증 필수)
