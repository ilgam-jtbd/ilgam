import { NextResponse } from "next/server";

const spec = {
  openapi: "3.0.3",
  info: {
    title: "VELOR API",
    description:
      "VELOR — 검증된 시니어 전문가 네트워크. API for discovering experts and submitting project inquiries.",
    version: "1.0.0",
    contact: { email: "support@velor.kr" },
  },
  servers: [{ url: "https://velor.kr", description: "Production" }],
  paths: {
    "/api/healthz": {
      get: {
        summary: "Health check",
        operationId: "healthz",
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean", example: true },
                    app: { type: "string", example: "platform-web" },
                    ts: { type: "string", format: "date-time" },
                    supabase: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/post-project": {
      get: {
        summary: "Project inquiry form",
        description:
          "Multi-step form for companies to submit a B2B project inquiry. Connects to b2b_inquiries table.",
        operationId: "postProjectPage",
        responses: {
          "200": { description: "HTML page with project inquiry form" },
        },
      },
    },
    "/marketplace": {
      get: {
        summary: "Browse senior experts",
        description:
          "Browse and filter 2,400+ verified senior experts by industry, skill, and availability.",
        operationId: "marketplace",
        parameters: [
          {
            name: "industry",
            in: "query",
            schema: { type: "string" },
            description: "Filter by industry (e.g. 제조, 금융, IT)",
          },
          {
            name: "skill",
            in: "query",
            schema: { type: "string" },
            description: "Filter by skill keyword",
          },
        ],
        responses: {
          "200": { description: "HTML page listing matching experts" },
        },
      },
    },
  },
  components: {
    schemas: {
      ProjectInquiry: {
        type: "object",
        required: ["company_name", "project_title", "description"],
        properties: {
          company_name: { type: "string", description: "Company name" },
          contact_name: { type: "string" },
          contact_email: { type: "string", format: "email" },
          contact_phone: { type: "string" },
          industry: { type: "string" },
          project_title: { type: "string" },
          description: { type: "string" },
          budget_krw: {
            type: "integer",
            description: "Budget in KRW (millions)",
          },
          duration: {
            type: "string",
            description: "e.g. '3개월', '6주'",
          },
          skills: {
            type: "array",
            items: { type: "string" },
          },
          urgent: { type: "boolean", default: false },
          nda_required: { type: "boolean", default: false },
        },
      },
    },
  },
};

export function GET() {
  return NextResponse.json(spec, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
