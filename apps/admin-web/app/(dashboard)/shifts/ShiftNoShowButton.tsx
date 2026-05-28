"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Props {
  shiftId: string;
}

export function ShiftNoShowButton({ shiftId }: Props) {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  if (done) {
    return (
      <span style={{ fontSize: "0.72rem", color: "#f87171", fontFamily: "var(--font-dm-mono), monospace" }}>
        노쇼 처리됨
      </span>
    );
  }

  async function handleNoShow() {
    if (!confirm("해당 근무를 노쇼 처리하시겠습니까?")) return;
    setLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { error } = await supabase
      .from("shifts")
      .update({ status: "no_show" })
      .eq("id", shiftId)
      .in("status", ["pending", "clocked_in"]);
    setLoading(false);
    if (!error) setDone(true);
  }

  return (
    <button
      onClick={handleNoShow}
      disabled={loading}
      style={{
        padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(248,113,113,0.4)",
        background: loading ? "#e2e8f0" : "rgba(248,113,113,0.07)",
        color: loading ? "#718096" : "#991b1b",
        fontSize: "0.72rem", fontFamily: "var(--font-dm-mono), monospace",
        cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.05em",
      }}
    >
      {loading ? "…" : "노쇼"}
    </button>
  );
}
