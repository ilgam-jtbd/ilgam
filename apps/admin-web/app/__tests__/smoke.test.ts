import { describe, expect, it } from "vitest";
import { colors, touch, typography } from "@ilgam/design-tokens";
import { JobCreateSchema, TABLES } from "@ilgam/core";

describe("workspace resolution", () => {
  it("@ilgam/design-tokens · @ilgam/core 심볼이 admin-web에서 해석된다", () => {
    expect(typeof colors.navy[700]).toBe("string");
    expect(typeof TABLES.jobs).toBe("string");
    expect(typeof JobCreateSchema.parse).toBe("function");
  });
});

describe("시니어 UX 베이스라인 (ADR-003 · 디자인 토큰 불변성)", () => {
  it("최소 터치 타겟 48dp", () => {
    expect(touch.minTargetSize).toBe(48);
  });

  it("기본 폰트 18pt", () => {
    expect(typography.baseSize).toBe(18);
  });

  it("navy[700] 브랜드 프라이머리 = #1A2C4E", () => {
    expect(colors.navy[700]).toBe("#1A2C4E");
  });
});
