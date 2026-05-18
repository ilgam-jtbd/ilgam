"use client";
// Updates job status to 'cancelled' — for admin use only
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function CloseJobButton({ jobId }: { jobId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleClose() {
    if (!confirm("이 공고를 마감하시겠습니까?")) return;
    setLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { error } = await supabase
      .from("jobs")
      .update({ status: "cancelled" })
      .eq("id", jobId);
    setLoading(false);
    if (!error) setDone(true);
  }

  if (done) {
    return (
      <span style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.68rem", color: "#991b1b" }}>
        공고 마감됨
      </span>
    );
  }

  return (
    <button
      onClick={handleClose}
      disabled={loading}
      style={{
        padding: "0.4rem 0.8rem", borderRadius: "8px",
        border: "1px solid rgba(248,113,113,0.4)",
        background: "rgba(248,113,113,0.07)",
        color: "#991b1b",
        fontFamily: "var(--font-dm-mono), monospace",
        fontSize: "0.68rem", cursor: loading ? "not-allowed" : "pointer",
        letterSpacing: "0.05em",
      }}
    >
      {loading ? "…" : "공고 마감"}
    </button>
  );
}
