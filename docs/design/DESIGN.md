# DESIGN.md — ILGAM Senior Spot-Work Platform

```yaml
overview:
  product: ILGAM (일감)
  audience: 50-79세 시니어 워커 + 구인자(소상공인)
  baseline: ADR-003 (18pt base / 48dp tap / WCAG AAA 7:1)
  source_of_truth: packages/design-tokens/src/index.ts
  philosophy: navy 신뢰 + gray 차분 + 한 손 조작 안전존
colors:
  primary:
    navy:
      900: "#0B1736"
      800: "#142548"
      700: "#1A2C4E"   # ADR-003 명시 브랜드 코어
      600: "#223A65"
      500: "#2F4D82"
      400: "#456AA3"
      300: "#6E8CB8"
      200: "#A0B5D2"
      100: "#D4DEEC"
      50:  "#EEF2F9"
  neutral:
    gray:
      900: "#0F1417"
      800: "#1C2328"
      700: "#2E3740"
      600: "#4A5560"
      500: "#6B7681"
      400: "#98A1AA"
      300: "#C3CAD1"
      200: "#DFE4E8"
      100: "#EEF1F3"
      50:  "#F7F8FA"
  semantic:
    danger:  "#C0392B"
    warning: "#D98E00"
    success: "#1E7A3D"
    info:    "#1F5EA8"
  surface:
    white: "#FFFFFF"
    black: "#000000"
typography:
  family: "Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  baseSize: 18
  ratio: 1.2
  lineHeight: 1.5
  minContrastRatio: 7
  sizes:
    xs:  14
    sm:  16
    base: 18
    md:  20
    lg:  24
    xl:  30
    xxl: 36
  weights: { regular: 400, medium: 500, bold: 700 }
layout:
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 }
  touch:
    minTargetSize: 48
    buttonHeight: 56
    bottomSafeZoneHeight: 80
  container:
    mobileMaxWidth: 420
    pagePaddingX: 16
elevation:
  sm: "0 1px 2px rgba(10,23,54,0.06)"
  md: "0 4px 8px rgba(10,23,54,0.08)"
  lg: "0 12px 24px rgba(10,23,54,0.12)"
shapes:
  borderRadius: { sm: 6, md: 10, lg: 16, full: 9999 }
motion:
  undoTimeoutMs: 2000
  pollIntervalMs: 15000
components:
  Button: { primary, secondary, ghost, destructive }
  Card:   { default, interactive, summary }
  Input:  { text, otp, search, select }
  Tab:    { bottomTab, segmented }
  Badge:  { sameday, senior, first, status }
  Chip:   { filter, choice }
  Toast:  { info, undo, error }
```

## Overview

일감(ILGAM)은 50~79세 시니어가 주 사용자인 스폿워크 플랫폼이다. 디자인 시스템의 단일 정본은 `packages/design-tokens/src/index.ts`이며 본 문서는 그 토큰을 사람이 읽을 수 있게 해설하고, 와이어프레임(`07_Wireframes/_tokens.css`)과의 차이를 정리해 한 방향으로 수렴시킨다. 의사결정 우선순위는 ADR-003 → 코드 토큰 → 와이어프레임이다. 와이어프레임의 Indigo/20pt/24px 라운드는 시니어 친화 의도였으나 ADR-003이 navy/18pt/16px를 명시했으므로 코드 토큰을 정본으로 채택한다.

설계 철학은 세 가지다. 첫째, **신뢰 가능한 차분함** — 시니어 사용자는 화려한 컬러보다 관공서·은행에 가까운 navy 톤을 신뢰한다. 둘째, **한 손 조작 보장** — 모든 1차 CTA는 화면 하단 80dp 안전존 안에 둔다. 셋째, **미스탭 회복** — 손떨림·노안에 의한 오탭은 즉시 2초 Undo 토스트로 되돌릴 수 있어야 한다(ADR-003 §시니어 UX 우선순위 2).

## Colors

**Primary는 navy**. 코어 브랜드 색은 `navy.700 = #1A2C4E`로 ADR-003에 직접 인용된 값이다. 와이어프레임의 Indigo(`#6366F1`)는 채도가 높아 70대 사용자가 흰 배경 위에서 잔상을 호소한 사용성 테스트 피드백이 있어 폐기한다. 보조 강조가 필요한 자리(예: same-day 뱃지)는 `warning #D98E00`, 시니어 전용 라벨은 `success #1E7A3D`로 매핑한다.

대비 규칙은 WCAG AAA 7:1을 기본으로 한다. 본문 텍스트는 `gray.900`을 `white` 또는 `gray.50` 위에 사용한다. `gray.500` 이하 톤을 본문에 쓰지 말고, 보조 메타정보(시간/거리)에만 `gray.600` 이상을 허용한다. Primary 버튼 라벨은 항상 `white` on `navy.700` 조합으로 고정한다.

시맨틱 컬러는 단일 hex(스케일 없음)를 의도적으로 유지한다. 시니어 사용자에게 "위험은 빨강 하나"가 학습 비용이 가장 낮다는 ADR-008 CX 데이터에 근거한다.

## Typography

**기본 18pt**를 유지한다. ADR-003이 명시한 값이며 시스템 폰트 200% 확대 시 레이아웃 붕괴가 없도록 모든 컴포넌트가 이 크기에서 검증되었다. 와이어프레임의 20pt 옵션은 검토했으나 (a) Pretendard 18pt는 한글 자소 분리가 명확하고, (b) 20pt 적용 시 모바일 420px 컨테이너 안에 핵심 정보가 1스크롤에 들어가지 않는 회귀가 발생하여 채택하지 않는다.

다만 70대(75~79세) 비율이 운영 6개월 내 35%를 넘으면 ADR-003에 "userPreference 기반 baseSize 20pt 토글" 옵션을 추가하는 재평가 트리거를 둔다. 토큰은 그때까지 18pt 단일 정본으로 유지한다.

타이포 스케일은 `xs(14) / sm(16) / base(18) / md(20) / lg(24) / xl(30) / xxl(36)`이다. 본문은 `base`, 카드 제목은 `md`, 페이지 헤더는 `lg`, 랜딩 히어로만 `xl`/`xxl`을 허용한다. `xs`는 캡션·타임스탬프 한정이며 인터랙티브 요소(버튼·링크)에는 절대 쓰지 않는다. line-height는 1.5 고정 — 와이어프레임의 1.85는 시니어 모드 의도였으나 카드 안에서 두 줄 텍스트가 다음 카드와 시각적으로 붙는 회귀가 있어 거부한다.

## Layout

**Spacing은 4의 배수 8단계**: `xs(4) / sm(8) / md(12) / lg(16) / xl(24) / xxl(32) / xxxl(48)`. 카드 내부 패딩은 `lg(16)` 또는 `xl(24)`, 카드 간 간격은 `md(12)`, 섹션 간 간격은 `xxl(32)`이 표준이다.

**Touch**: 모든 인터랙티브 요소의 최소 히트 영역은 48dp(`touch.minTargetSize`)다. 버튼 높이는 56dp(`touch.buttonHeight`)로 살짝 더 크게 잡아 시각적 무게를 준다. 화면 하단 80dp(`touch.bottomSafeZoneHeight`)는 1차 CTA 전용이며, 광고/배너/2차 액션을 이 영역에 두지 않는다.

**Container**: 모바일 콘텐츠 최대 너비는 420px(시니어 한손 그립 영역). 태블릿/웹은 768px / 1080px 브레이크포인트에서 사이드 마진 자동 확장. 페이지 좌우 패딩은 16px 고정.

## Elevation

`shadow.sm/md/lg` 3단계만 정의한다. navy 기반 알파 블렌딩으로 그림자가 회색이 아닌 미세한 푸른빛을 띄며 브랜드 일관성을 보강한다.

- **sm** `0 1px 2px rgba(10,23,54,0.06)` — 카드 기본
- **md** `0 4px 8px rgba(10,23,54,0.08)` — hover/press, 모달 트리거
- **lg** `0 12px 24px rgba(10,23,54,0.12)` — 모달, 바텀시트, 토스트

다크모드 elevation은 M2까지 보류한다(시니어 사용자 대다수가 라이트모드 선호, ADR-008 CX 텔레메트리).

## Shapes

`borderRadius`: **sm 6 / md 10 / lg 16 / full 9999**. 와이어프레임의 14/24px는 시각적 부드러움 의도였으나, (a) 16px 카드와 24px 카드가 한 화면에 섞일 때 시니어 사용자가 위계 구분에 혼란을 보고하였고, (b) `lg = 16`이 Material 권장(Senior tier)과 가장 가깝기에 16px로 통일한다.

- **sm 6** — 인풋, 작은 칩, 인라인 뱃지
- **md 10** — 보조 버튼, 작은 카드, 토스트
- **lg 16** — 1차 CTA 버튼, 일감 카드, 모달
- **full 9999** — 아바타, 상태 배지(원형)

## Components

**Button**
- `primary` — `navy.700` 배경, `white` 라벨, `radius.lg(16)`, `height 56`, 100% 너비. 화면당 1개 원칙.
- `secondary` — `white` 배경, `gray.300` 2px 보더, `gray.900` 라벨.
- `ghost` — 배경/보더 없음. 카드 내부 보조 액션 한정.
- `destructive` — `danger` 배경. 사용 직전 confirm 모달 또는 2초 Undo 토스트와 반드시 페어링.

**Card**
- 기본 `radius.lg(16)`, `shadow.sm`, 패딩 `xl(24)`. 일감 카드는 우상단 `Badge` 슬롯 고정, 좌하단 시급/거리 메타 슬롯 고정 — 정보 위치 일관성이 시니어 학습 곡선을 줄인다.

**Input**
- 높이 56, `radius.sm(6)`, `gray.300` 보더, focus 시 `navy.500` 2px ring.
- OTP는 6자리 분리 박스, 자릿수 사이 `spacing.sm(8)`, 자동 포커스 이동 + 붙여넣기 한 번에 분배.

**Tab**
- 하단 5탭 그리드 고정. active는 `navy.700` 텍스트 + `navy.50` 아이콘 배경.
- 상단 segmented는 필터/정렬 등 보조 분기 한정.

**Badge / Chip**
- Badge는 정보(상태) 표기 — `same-day(warning)`, `senior(success)`, `first(info)` 매핑.
- Chip은 액션(필터 토글) — selected 시 `navy.50` 배경 + `navy.700` 텍스트 + `navy.500` 보더.

**Toast**
- Undo 토스트 2초(`motion.undoTimeoutMs`) 고정. 화면 하단 안전존 위에 띄우며 1차 CTA를 가리지 않는다.

## Do's and Don'ts

- **DO** — 모든 1차 CTA를 화면 하단 80dp 안전존 안에 두고 한 손으로 닿게 한다.
- **DO** — 본문 텍스트는 18pt 이상, 인터랙티브 라벨은 16pt 이상을 사용한다.
- **DO** — 파괴적 액션은 `destructive` 버튼 + 2초 Undo 토스트를 항상 페어링한다.
- **DO** — `navy.700`을 브랜드 코어로 유지하고 강조가 필요할 때 `warning`/`success` 단일 hex를 사용한다.
- **DO** — 시맨틱 의미는 색 단독이 아니라 아이콘·라벨과 함께 전달한다(노안 대응).

- **DON'T** — Indigo(`#6366F1`)·기타 보라/파랑 계열을 도입해 navy와 섞지 않는다. 코어 브랜드 약화.
- **DON'T** — 본문 폰트를 14pt 이하로 내리지 않는다. `xs(14)`는 캡션·타임스탬프 한정.
- **DON'T** — 라운드 14/20/24px 같은 비표준 값을 도입하지 않는다. 6/10/16/9999만.
- **DON'T** — 1차 CTA 위/옆에 광고·2차 액션·닫기 버튼을 배치해 미스탭 위험을 만들지 않는다.
- **DON'T** — line-height 1.85 같은 와이어프레임 잔재를 카드 내부에 적용하지 않는다(다음 카드와 붙음).
- **DON'T** — 시맨틱 컬러에 스케일(50~900)을 임의로 추가하지 않는다. 단일 hex 유지가 원칙.
