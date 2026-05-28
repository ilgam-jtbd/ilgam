import { NextResponse } from "next/server";

export const runtime = "edge";

export function GET() {
  return NextResponse.json({
    ok: true,
    app: "platform-web",
    ts: new Date().toISOString(),
    supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  });
}
