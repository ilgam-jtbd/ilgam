import { describe, expect, it } from "vitest";
import {
  JobCreateSchema,
  NOTIFY_TEMPLATES,
  TABLES,
  isFallbackNeeded,
} from "../index";

describe("JobCreateSchema — 최저임금 가드", () => {
  const base = {
    title: "오전 피킹 보조",
    dong_code: "1174010100",
    shift_start_at: "2026-05-01T09:00:00.000Z",
    shift_end_at: "2026-05-01T13:00:00.000Z",
    required_cert_codes: [],
    preferred_mentor_tags: [],
    headcount: 1,
  };

  it("시급 10030원 미만은 거부 (2026 최저임금)", () => {
    const r = JobCreateSchema.safeParse({ ...base, hourly_wage_krw: 10029 });
    expect(r.success).toBe(false);
  });

  it("시급 10030원은 허용 (경계값)", () => {
    const r = JobCreateSchema.safeParse({ ...base, hourly_wage_krw: 10030 });
    expect(r.success).toBe(true);
  });
});

describe("notify fallback — Bizppurio 응답 코드", () => {
  it("R001·R002·T001 은 SMS 폴백 대상", () => {
    expect(isFallbackNeeded("R001")).toBe(true);
    expect(isFallbackNeeded("R002")).toBe(true);
    expect(isFallbackNeeded("T001")).toBe(true);
  });

  it("알 수 없는 코드·undefined 는 폴백 없음", () => {
    expect(isFallbackNeeded(undefined)).toBe(false);
    expect(isFallbackNeeded("X999")).toBe(false);
  });
});

describe("공유 상수 불변성", () => {
  it("NOTIFY_TEMPLATES 6종이 ILGAM_M001~M006 매핑", () => {
    expect(Object.keys(NOTIFY_TEMPLATES)).toHaveLength(6);
    expect(NOTIFY_TEMPLATES.workerMatchConfirmed).toBe("ILGAM_M001");
    expect(NOTIFY_TEMPLATES.cxResolved).toBe("ILGAM_M006");
  });

  it("TABLES 맵이 핵심 13 테이블 포함", () => {
    expect(TABLES.jobs).toBe("jobs");
    expect(TABLES.shifts).toBe("shifts");
    expect(TABLES.payments).toBe("payments");
  });
});
