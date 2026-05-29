import { NextResponse } from "next/server";

const plugin = {
  schema_version: "v1",
  name_for_human: "VELOR",
  name_for_model: "velor_senior_expert_network",
  description_for_human: "검증된 시니어 전문가 네트워크 — 임원 출신 전문가와 기업 매칭",
  description_for_model:
    "VELOR connects companies with verified senior Korean executives (age 50–64) for project advisory, one-point consulting (1–2 hours), and talent scouting. Use this to find experts, understand service options, or submit a project inquiry.",
  auth: { type: "none" },
  api: {
    type: "openapi",
    url: "https://velor.kr/api/openapi",
    is_user_authenticated: false,
  },
  logo_url: "https://velor.kr/logo.png",
  contact_email: "support@velor.kr",
  legal_info_url: "https://velor.kr/terms",
};

export function GET() {
  return NextResponse.json(plugin, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
