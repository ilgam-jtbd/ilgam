// 일감 디자인 토큰 — YJKim Design System v1.0 (2026.04)
// 팔레트: navy + gold + teal + cream | 폰트: DM Serif Display + DM Mono + Pretendard
// 시니어 UX 베이스라인: 18pt 기본, 48dp 터치, WCAG AAA

export const colors = {
  // Navy — primary brand (헤더·주 배경)
  navy: {
    DEFAULT: "#0d1b2a",
    mid:     "#1a2f45",
    lt:      "#243b55",
    // 레거시 스케일 (기존 컴포넌트 호환)
    900: "#0B1736",
    800: "#0d1b2a",
    700: "#1a2f45",
    600: "#243b55",
    500: "#2F4D82",
    400: "#456AA3",
    300: "#6E8CB8",
    200: "#A0B5D2",
    100: "#D4DEEC",
    50:  "#EEF2F9",
  },
  // Gold — 핵심 액센트·CTA·강조
  gold: {
    DEFAULT: "#c9a84c",
    light:   "rgba(201,168,76,0.15)",
    border:  "rgba(201,168,76,0.3)",
  },
  // Teal — 라벨·서브 액센트·모노
  teal: {
    DEFAULT: "#2dd4bf",
    light:   "rgba(45,212,191,0.15)",
  },
  // Gray — neutral scale
  gray: {
    dk:  "#4a5568",
    md:  "#718096",
    lt:  "#e2e8f0",
    DEFAULT: "#718096",
    900: "#0F1417",
    800: "#1C2328",
    700: "#4a5568",
    600: "#4A5560",
    500: "#718096",
    400: "#98A1AA",
    300: "#C3CAD1",
    200: "#e2e8f0",
    100: "#EEF1F3",
    50:  "#F7F8FA",
  },
  // Background
  cream: "#f7f5f0",
  // Semantic
  danger:  "#C0392B",
  warning: "#D98E00",
  success: "#1E7A3D",
  info:    "#1F5EA8",
  rose:    "#f87171",
  violet:  "#a78bfa",
  sky:     "#38bdf8",
  green:   "#4ade80",
  white:   "#ffffff",
  black:   "#000000",
} as const;

// 시니어 UX 베이스라인 (ADR-003)
// 폰트: DM Serif Display (display) · DM Mono (레이블/코드/숫자) · Pretendard (본문)
export const typography = {
  fonts: {
    display: "'DM Serif Display', serif",
    mono:    "'DM Mono', monospace",
    body:    "'Pretendard', -apple-system, sans-serif",
  },
  baseSize: 18,
  ratio: 1.2,
  // 숫자 단위 (React Native dp, CSS px 공통)
  sizes: {
    xs:   14,
    sm:   16,
    base: 18,
    md:   20,
    lg:   24,
    xl:   30,
    xxl:  36,
  },
  // CSS rem 단위 (web 전용 — DM Mono 레이블·섹션 타이틀 등)
  cssSizes: {
    label:   "0.62rem",
    mono:    "0.72rem",
    caption: "0.82rem",
    body:    "1rem",
    subhead: "1.2rem",
    title:   "1.5rem",
    display: "2rem",
    hero:    "clamp(1.8rem, 6vw, 3rem)",
  },
  weights: {
    light:   300,
    regular: 400,
    medium:  500,
    semibold: 600,
    bold:    700,
  },
  lineHeight: 1.65,
  letterSpacing: {
    label: "0.18em",   // DM Mono UPPERCASE 레이블
    mono:  "0.1em",
  },
  minContrastRatio: 7, // WCAG AAA
} as const;

export const spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  xxxl: 48,
  // CSS 단위 (web)
  css: {
    xs:   "0.3rem",
    sm:   "0.5rem",
    md:   "0.8rem",
    lg:   "1.2rem",
    xl:   "2rem",
    xxl:  "2.5rem",
    xxxl: "3rem",
  },
} as const;

export const touch = {
  minTargetSize:      48,  // dp
  buttonHeight:       56,  // dp
  bottomSafeZoneHeight: 80,
} as const;

export const radius = {
  sm:    "4px",
  md:    "8px",
  lg:    "12px",
  badge: "20px",
  full:  "9999px",
  // React Native
  rn: { sm: 4, md: 8, lg: 12, badge: 20 },
} as const;

export const shadow = {
  sm: "0 1px 2px rgba(13,27,42,0.06)",
  md: "0 4px 8px rgba(13,27,42,0.08)",
  lg: "0 8px 24px rgba(13,27,42,0.12)",  // max per design system
} as const;

export const border = {
  light: "1px solid rgba(13,27,42,0.08)",
  dark:  "1px solid rgba(255,255,255,0.06)",
  gray:  "1px solid #e2e8f0",
  gold:  "1px solid rgba(201,168,76,0.3)",
} as const;

export const motion = {
  undoTimeoutMs:  2000,
  pollIntervalMs: 15000,
} as const;

export type ColorTokens     = typeof colors;
export type TypographyTokens = typeof typography;
