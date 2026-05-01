// Edge Function: clock — 출퇴근 체크
// POST /functions/v1/clock
// body: { action: "in" | "out", match_id: string, lat: number, lng: number, selfie_storage_path?: string }
//
// 처리 흐름:
//   clock_in  → shifts 레코드 생성 (status: clocked_in)
//   clock_out → shifts 레코드 업데이트 (status: clocked_out) + 급여 계산 → payments 생성
//
// GPS 반경 검증: match.job.lat/lng 에서 500m 이내만 허용
// selfie_storage_path: Supabase Storage 업로드 후 path 전달

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MAX_DISTANCE_M = 500;
const PLATFORM_FEE_RATE = 0.10; // 10%

interface ClockBody {
  action: "in" | "out";
  match_id: string;
  lat: number;
  lng: number;
  selfie_storage_path?: string;
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // JWT 검증 — Supabase가 Authorization 헤더 자동 검증 후 user 주입
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const supabaseUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authErr } = await supabaseUser.auth.getUser();
  if (authErr || !user) return json({ error: "Unauthorized" }, 401);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  let body: ClockBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { action, match_id, lat, lng, selfie_storage_path } = body;
  if (!action || !match_id || lat == null || lng == null) {
    return json({ error: "action, match_id, lat, lng are required" }, 400);
  }
  if (action !== "in" && action !== "out") {
    return json({ error: "action must be 'in' or 'out'" }, 400);
  }

  // 매칭 조회 + 소유권 확인
  const { data: match, error: matchErr } = await supabase
    .from("matches")
    .select(`
      id, worker_id, job_id,
      workers ( profile_id ),
      jobs ( title, lat, lng, hourly_wage_krw, shift_start_at, shift_end_at )
    `)
    .eq("id", match_id)
    .single();

  if (matchErr || !match) return json({ error: "Match not found" }, 404);

  const profileId = (match.workers as { profile_id: string } | null)?.profile_id;
  if (profileId !== user.id) return json({ error: "Forbidden" }, 403);

  const job = match.jobs as {
    title: string; lat: number | null; lng: number | null;
    hourly_wage_krw: number; shift_start_at: string; shift_end_at: string;
  } | null;

  // GPS 거리 검증 (job에 좌표가 있을 때만)
  if (job?.lat != null && job?.lng != null) {
    const dist = haversineMeters(lat, lng, job.lat, job.lng);
    if (dist > MAX_DISTANCE_M) {
      return json({ error: `현장과의 거리가 너무 멉니다 (${Math.round(dist)}m). ${MAX_DISTANCE_M}m 이내에서 체크해 주세요.` }, 422);
    }
  }

  if (action === "in") {
    // 중복 출근 방지
    const { data: existing } = await supabase
      .from("shifts")
      .select("id")
      .eq("match_id", match_id)
      .single();

    if (existing) return json({ error: "이미 출근 체크된 매칭입니다." }, 409);

    const { data: shift, error: insErr } = await supabase
      .from("shifts")
      .insert({
        match_id,
        clock_in_at: new Date().toISOString(),
        status: "clocked_in",
        selfie_in_path: selfie_storage_path ?? null,
        clock_in_lat: lat,
        clock_in_lng: lng,
      })
      .select("id")
      .single();

    if (insErr) return json({ error: insErr.message }, 500);
    return json({ ok: true, shift_id: shift.id, action: "in" });
  }

  // action === "out"
  const { data: shift, error: shiftErr } = await supabase
    .from("shifts")
    .select("id, clock_in_at, status")
    .eq("match_id", match_id)
    .single();

  if (shiftErr || !shift) return json({ error: "출근 기록이 없습니다." }, 404);
  if (shift.status === "clocked_out") return json({ error: "이미 퇴근 체크된 근무입니다." }, 409);

  const clockOutAt = new Date().toISOString();

  const { error: updErr } = await supabase
    .from("shifts")
    .update({
      clock_out_at: clockOutAt,
      status: "clocked_out",
      selfie_out_path: selfie_storage_path ?? null,
      clock_out_lat: lat,
      clock_out_lng: lng,
    })
    .eq("id", shift.id);

  if (updErr) return json({ error: updErr.message }, 500);

  // 급여 계산
  if (job && shift.clock_in_at) {
    const workedMs = new Date(clockOutAt).getTime() - new Date(shift.clock_in_at).getTime();
    const workedHours = workedMs / 3600000;
    const grossAmt = Math.floor(workedHours * job.hourly_wage_krw);
    const feeAmt = Math.floor(grossAmt * PLATFORM_FEE_RATE);
    const payoutAmt = grossAmt - feeAmt;

    await supabase.from("payments").insert({
      shift_id: shift.id,
      gross_amount_krw: grossAmt,
      platform_fee_krw: feeAmt,
      worker_payout_krw: payoutAmt,
      status: "pending",
    });
  }

  return json({ ok: true, shift_id: shift.id, action: "out" });
});
