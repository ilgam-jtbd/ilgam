"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Props {
  shiftId: string;
  approvedAt: string | null;
}

export function ShiftApproveButton({ shiftId, approvedAt }: Props) {
  const [done, setDone] = useState(!!approvedAt);
  const [loading, setLoading] = useState(false);

  if (done) {
    return (
      <span style={{ fontSize: "0.72rem", color: "#4ade80", fontFamily: "var(--font-dm-mono), monospace" }}>
        ✓ 승인됨
      </span>
    );
  }

  async function handleApprove() {
    setLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { error } = await supabase
      .from("shifts")
      .update({ employer_approved_at: new Date().toISOString() })
      .eq("id", shiftId);
    setLoading(false);
    if (!error) setDone(true);
  }

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      style={{
        padding: "4px 12px", borderRadius: "6px", border: "1px solid #c9a84c",
        background: loading ? "#e2e8f0" : "rgba(201,168,76,0.08)",
        color: loading ? "#718096" : "#92400e",
        fontSize: "0.72rem", fontFamily: "var(--font-dm-mono), monospace",
        cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.05em",
      }}
    >
      {loading ? "…" : "승인"}
    </button>
  );
}
