// @ilgam/core 스키마 단위 테스트 (QA 에이전트 요청)
// 매칭·알림·결제 핵심 경계값 검증

import { describe, it, expect } from "vitest";
import { JobCreateSchema, WorkerPreferencesSchema, ClockInSchema, PhoneE164 } from "./schemas";

describe("PhoneE164", () => {
  it("올바른 한국 번호 통과", () => {
    expect(PhoneE164.safeParse("+821012345678").success).toBe(true);   // 010-xxxx-xxxx
    expect(PhoneE164.safeParse("+821112345678").success).toBe(true);   // 011-xxxx-xxxx
  });
  it("형식 오류 거부", () => {
    expect(PhoneE164.safeParse("010-1234-5678").success).toBe(false);
    expect(PhoneE164.safeParse("+1234567890").success).toBe(false);
    expect(PhoneE164.safeParse("").success).toBe(false);
  });
});

describe("JobCreateSchema", () => {
  const valid = {
    title: "강서 물류 피킹",
    dong_code: "1150010100",
    shift_start_at: "2026-05-10T09:00:00.000Z",
    shift_end_at: "2026-05-10T13:00:00.000Z",
    hourly_wage_krw: 12000,
  };

  it("유효한 공고 통과", () => {
    expect(JobCreateSchema.safeParse(valid).success).toBe(true);
  });

  it("2026 최저임금(10,030원) 미만 거부", () => {
    const r = JobCreateSchema.safeParse({ ...valid, hourly_wage_krw: 10029 });
    expect(r.success).toBe(false);
  });

  it("제목 1자 거부", () => {
    const r = JobCreateSchema.safeParse({ ...valid, title: "X" });
    expect(r.success).toBe(false);
  });

  it("dong_code 10자리 아니면 거부", () => {
    const r = JobCreateSchema.safeParse({ ...valid, dong_code: "12345" });
    expect(r.success).toBe(false);
  });

  it("headcount 기본값 1", () => {
    const r = JobCreateSchema.safeParse(valid);
    expect(r.success && r.data.headcount).toBe(1);
  });
});

describe("WorkerPreferencesSchema", () => {
  const valid = {
    home_dong_code: "1150010100",
    cert_codes: [],
    mentor_tags: [],
    preferred_weekdays: [1, 3, 5],
    preferred_verticals: ["logistics"],
  };

  it("유효한 선호 설정 통과", () => {
    expect(WorkerPreferencesSchema.safeParse(valid).success).toBe(true);
  });

  it("잘못된 버티컬 거부", () => {
    const r = WorkerPreferencesSchema.safeParse({ ...valid, preferred_verticals: ["invalid"] });
    expect(r.success).toBe(false);
  });

  it("요일 범위(0~6) 초과 거부", () => {
    const r = WorkerPreferencesSchema.safeParse({ ...valid, preferred_weekdays: [7] });
    expect(r.success).toBe(false);
  });
});

describe("ClockInSchema", () => {
  const valid = {
    shift_id: "00000000-0000-0000-0000-000000000001",
    lat: 37.5665,
    lng: 126.9780,
    selfie_storage_path: "workers/abc/selfie.jpg",
  };

  it("유효한 출근 체크 통과", () => {
    expect(ClockInSchema.safeParse(valid).success).toBe(true);
  });

  it("위도 범위 초과 거부", () => {
    expect(ClockInSchema.safeParse({ ...valid, lat: 91 }).success).toBe(false);
    expect(ClockInSchema.safeParse({ ...valid, lat: -91 }).success).toBe(false);
  });

  it("selfie_path 빈 문자열 거부", () => {
    expect(ClockInSchema.safeParse({ ...valid, selfie_storage_path: "" }).success).toBe(false);
  });
});
