"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Props {
  applicationId: string;
  workerId: string;
  jobId: string;
  workerPhone: string;
  jobTitle: string;
  shiftStartAt: string;
}

function fmtKSTDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric", day: "numeric",
  });
}

function fmtKSTTime(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

export default function ApplicantActions({
  applicationId, workerId, workerPhone, jobTitle, shiftStartAt,
}: Props) {
  const [status, setStatus] = useState<"idle" | "accepting" | "rejecting" | "done">("idle");
  const [result, setResult] = useState<"accepted" | "rejected" | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  async function accept() {
    setStatus("accepting");

    const { error } = await supabase
      .from("job_applications")
      .update({ status: "accepted" })
      .eq("id", applicationId);

    if (!error && workerPhone) {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      // Fire-and-forget: 알림톡 발송 실패가 승인 UX를 막으면 안 됨
      fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-dispatch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          templateId: "ILGAM_M001",
          userId: workerId,
          phoneE164: workerPhone,
          variables: {
            work_date: fmtKSTDate(shiftStartAt),
            work_time: fmtKSTTime(shiftStartAt),
            work_address: jobTitle,
          },
        }),
      }).catch((e) => console.warn("notify-dispatch failed", e));
    }

    if (!error) setResult("accepted");
    setStatus("done");
  }

  async function reject() {
    setStatus("rejecting");
    const { error } = await supabase
      .from("job_applications")
      .update({ status: "rejected" })
      .eq("id", applicationId);
    if (!error) setResult("rejected");
    setStatus("done");
  }

  if (status === "done") {
    return (
      <span style={{
        fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.68rem",
        color: result === "accepted" ? "#0f766e" : "#991b1b",
        background: result === "accepted" ? "rgba(45,212,191,0.12)" : "rgba(248,113,113,0.12)",
        borderRadius: "8px", padding: "0.35rem 0.8rem",
      }}>
        {result === "accepted" ? "승인 완료" : "반려 완료"}
      </span>
    );
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <button
        onClick={accept}
        disabled={status !== "idle"}
        style={{
          background: "rgba(201,168,76,0.12)", color: "#92400e",
          border: "1px solid rgba(201,168,76,0.3)", borderRadius: "8px",
          padding: "0.4rem 0.9rem", fontFamily: "var(--font-dm-mono), monospace",
          fontSize: "0.68rem", cursor: status !== "idle" ? "not-allowed" : "pointer",
          minWidth: "60px",
        }}
      >
        {status === "accepting" ? "..." : "승인"}
      </button>
      <button
        onClick={reject}
        disabled={status !== "idle"}
        style={{
          background: "rgba(248,113,113,0.08)", color: "#991b1b",
          border: "1px solid rgba(248,113,113,0.2)", borderRadius: "8px",
          padding: "0.4rem 0.9rem", fontFamily: "var(--font-dm-mono), monospace",
          fontSize: "0.68rem", cursor: status !== "idle" ? "not-allowed" : "pointer",
          minWidth: "60px",
        }}
      >
        {status === "rejecting" ? "..." : "반려"}
      </button>
    </div>
  );
}
