// 일감 디자인 토큰 · navy/gray 팔레트 · 시니어 UX 베이스라인
// 사용자 선호: 이모지 없음, 전문 문서 톤

export const colors = {
  // Navy — primary brand
  navy: {
    900: "#0B1736",
    800: "#142548",
    700: "#1A2C4E",
    600: "#223A65",
    500: "#2F4D82",
    400: "#456AA3",
    300: "#6E8CB8",
    200: "#A0B5D2",
    100: "#D4DEEC",
    50:  "#EEF2F9",
  },
  // Gray — neutral scale
  gray: {
    900: "#0F1417",
    800: "#1C2328",
    700: "#2E3740",
    600: "#4A5560",
    500: "#6B7681",
    400: "#98A1AA",
    300: "#C3CAD1",
    200: "#DFE4E8",
    100: "#EEF1F3",
    50:  "#F7F8FA",
  },
  // Semantic
  danger: "#C0392B",
  warning: "#D98E00",
  success: "#1E7A3D",
  info: "#1F5EA8",
  white: "#FFFFFF",
  black: "#000000",
} as const;

// 시니어 UX 베이스라인 (ADR-003)
export const typography = {
  // 기본 18pt · 200% 시스템 스케일 대응
  baseSize: 18,
  ratio: 1.2,
  sizes: {
    xs: 14,
    sm: 16,
    base: 18,
    md: 20,
    lg: 24,
    xl: 30,
    xxl: 36,
  },
  weights: {
    regular: 400,
    medium: 500,
    bold: 700,
  },
  lineHeight: 1.5,
  // WCAG AAA 대비 7:1 기본
  minContrastRatio: 7,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const touch = {
  // 최소 터치 타겟 48dp
  minTargetSize: 48,
  // 버튼 높이
  buttonHeight: 56,
  // 상단 접근 CTA 배치 금지 (한 손 조작)
  bottomSafeZoneHeight: 80,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999,
} as const;

export const shadow = {
  sm: "0 1px 2px rgba(10,23,54,0.06)",
  md: "0 4px 8px rgba(10,23,54,0.08)",
  lg: "0 12px 24px rgba(10,23,54,0.12)",
} as const;

export const motion = {
  // 2초 Undo 토스트 · 미스탭 복구 레일 (ADR-003)
  undoTimeoutMs: 2000,
  // 폴링 간격 (ADR-004)
  pollIntervalMs: 15000,
} as const;

export type ColorTokens = typeof colors;
export type TypographyTokens = typeof typography;
