"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Props {
  applicationId: string;
}

export function EmployerApprovalActions({ applicationId }: Props) {
  const [state, setState] = useState<"idle" | "approving" | "rejecting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  async function handleApprove() {
    setState("approving");
    setError(null);
    const { error: rpcErr } = await supabase.rpc("approve_employer", {
      p_application_id: applicationId,
      p_approved: true,
    });
    if (rpcErr) { setError(rpcErr.message); setState("idle"); return; }
    setState("done");
  }

  async function handleReject() {
    const reason = window.prompt("반려 사유를 입력해 주세요.");
    if (reason === null) return;
    setState("rejecting");
    setError(null);
    const { error: rpcErr } = await supabase.rpc("approve_employer", {
      p_application_id: applicationId,
      p_approved: false,
      p_reject_reason: reason || "사유 없음",
    });
    if (rpcErr) { setError(rpcErr.message); setState("idle"); return; }
    setState("done");
  }

  if (state === "done") {
    return (
      <span style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.72rem", color: "#4ade80" }}>
        처리 완료
      </span>
    );
  }

  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <button
        onClick={handleApprove}
        disabled={state !== "idle"}
        style={{
          background: state === "approving" ? "#e2e8f0" : "#4ade80",
          color: "#0d1b2a", border: "none", borderRadius: "8px",
          padding: "6px 14px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
        }}
      >
        {state === "approving" ? "승인 중…" : "승인"}
      </button>
      <button
        onClick={handleReject}
        disabled={state !== "idle"}
        style={{
          background: state === "rejecting" ? "#e2e8f0" : "#fee2e2",
          color: "#991b1b", border: "1px solid #fca5a5", borderRadius: "8px",
          padding: "6px 14px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
        }}
      >
        {state === "rejecting" ? "반려 중…" : "반려"}
      </button>
      {error && (
        <span style={{ fontSize: "0.72rem", color: "#f87171" }}>{error}</span>
      )}
    </div>
  );
}
