"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function RepostButton({ jobId }: { jobId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRepost() {
    setLoading(true);
    setError(null);

    // 재게시: 다음 근무일 같은 시간 (7일 후)
    const startAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const endAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString();

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { error: rpcErr } = await supabase.rpc("repost_job", {
      p_job_id: jobId,
      p_shift_start_at: startAt,
      p_shift_end_at: endAt,
    });

    setLoading(false);
    if (rpcErr) {
      setError(rpcErr.message);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.68rem",
          color: "#0f766e",
          background: "rgba(45,212,191,0.12)",
          borderRadius: "8px",
          padding: "0.4rem 0.8rem",
        }}
      >
        재게시 완료 — 7일 후 공고가 열립니다
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleRepost}
        disabled={loading}
        style={{
          background: loading ? "#e2e8f0" : "rgba(201,168,76,0.12)",
          color: loading ? "#718096" : "#92400e",
          border: "1px solid rgba(201,168,76,0.3)",
          borderRadius: "8px",
          padding: "0.4rem 0.9rem",
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.68rem",
          letterSpacing: "0.08em",
          cursor: loading ? "not-allowed" : "pointer",
          width: "100%",
        }}
      >
        {loading ? "처리 중..." : "다시 올리기"}
      </button>
      {error && (
        <div
          style={{
            marginTop: "0.3rem",
            fontSize: "0.68rem",
            color: "#991b1b",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
