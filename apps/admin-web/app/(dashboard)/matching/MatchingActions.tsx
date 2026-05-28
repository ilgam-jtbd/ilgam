"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  new:        { label: "신규",   color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  reviewing:  { label: "검토중", color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  matched:    { label: "매칭됨", color: "#c9a84c", bg: "rgba(201,168,76,0.12)" },
  contracted: { label: "계약완료", color: "#2dd4bf", bg: "rgba(45,212,191,0.1)" },
  completed:  { label: "완료",   color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  closed:     { label: "종료",   color: "#718096", bg: "rgba(113,128,150,0.1)" },
};

const STATUS_ORDER = ["new", "reviewing", "matched", "contracted", "completed", "closed"] as const;

// ─── Status Badge ─────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG["new"];
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: "999px",
      fontSize: "0.68rem", fontFamily: "var(--font-dm-mono), monospace",
      letterSpacing: "0.08em", fontWeight: 600,
      color: cfg.color, background: cfg.bg,
    }}>
      {cfg.label}
    </span>
  );
}

// ─── Status Updater ───────────────────────────────────────────────────────────

export function StatusSelect({ inquiryId, current }: { inquiryId: string; current: string }) {
  const [status, setStatus] = useState(current);
  const [loading, setLoading] = useState(false);

  async function handleChange(next: string) {
    setLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { error } = await supabase
      .from("b2b_inquiries")
      .update({ status: next })
      .eq("id", inquiryId);
    setLoading(false);
    if (!error) setStatus(next);
  }

  const cfg = STATUS_CFG[status] ?? STATUS_CFG["new"];
  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      style={{
        padding: "3px 8px", borderRadius: "6px",
        border: `1px solid ${cfg.color}`,
        background: cfg.bg, color: cfg.color,
        fontSize: "0.68rem", fontFamily: "var(--font-dm-mono), monospace",
        cursor: "pointer", outline: "none",
      }}
    >
      {STATUS_ORDER.map((s) => (
        <option key={s} value={s}>{STATUS_CFG[s].label}</option>
      ))}
    </select>
  );
}

// ─── Contract Amount Updater ──────────────────────────────────────────────────

export function ContractAmountInput({ inquiryId, current }: { inquiryId: string; current: number | null }) {
  const [value, setValue] = useState(current?.toString() ?? "");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 0) return;
    setLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { error } = await supabase
      .from("b2b_inquiries")
      .update({ contract_amount_krw: n })
      .eq("id", inquiryId);
    setLoading(false);
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <input
        type="number"
        value={value}
        onChange={(e) => { setValue(e.target.value); setSaved(false); }}
        placeholder="계약금(만원)"
        style={{
          width: "90px", padding: "3px 8px", borderRadius: "6px",
          border: "1px solid rgba(201,168,76,0.4)", background: "rgba(201,168,76,0.05)",
          color: "#c9a84c", fontSize: "0.72rem",
          fontFamily: "var(--font-dm-mono), monospace", outline: "none",
        }}
      />
      <button
        onClick={handleSave}
        disabled={loading}
        style={{
          padding: "3px 8px", borderRadius: "6px",
          border: "1px solid rgba(201,168,76,0.4)",
          background: saved ? "rgba(74,222,128,0.1)" : "rgba(201,168,76,0.08)",
          color: saved ? "#4ade80" : "#c9a84c",
          fontSize: "0.68rem", fontFamily: "var(--font-dm-mono), monospace",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "…" : saved ? "✓" : "저장"}
      </button>
    </div>
  );
}

// ─── Assign Expert Panel ──────────────────────────────────────────────────────

interface Assignment { id: string; expert_name: string; expert_title: string | null; note: string | null; }

export function AssignExpertPanel({
  inquiryId,
  initial,
}: {
  inquiryId: string;
  initial: Assignment[];
}) {
  const [assignments, setAssignments] = useState<Assignment[]>(initial);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAssign() {
    if (!name.trim()) return;
    setLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data, error } = await supabase
      .from("b2b_assignments")
      .insert({ inquiry_id: inquiryId, expert_name: name.trim(), expert_title: title.trim() || null, note: note.trim() || null })
      .select()
      .single();
    setLoading(false);
    if (!error && data) {
      setAssignments((prev) => [...prev, data as Assignment]);
      setName(""); setTitle(""); setNote(""); setOpen(false);
    }
  }

  async function handleRemove(id: string) {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { error } = await supabase.from("b2b_assignments").delete().eq("id", id);
    if (!error) setAssignments((prev) => prev.filter((a) => a.id !== id));
  }

  const inputStyle = {
    width: "100%", padding: "5px 10px", borderRadius: "6px",
    border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)",
    color: "#e2e8f0", fontSize: "0.75rem", outline: "none",
    fontFamily: "inherit",
  };

  return (
    <div>
      {assignments.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "6px" }}>
          {assignments.map((a) => (
            <div key={a.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "4px 10px", borderRadius: "6px",
              background: "rgba(45,212,191,0.08)", border: "1px solid rgba(45,212,191,0.2)",
            }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#2dd4bf", fontWeight: 600 }}>{a.expert_name}</span>
                {a.expert_title && (
                  <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", marginLeft: "6px" }}>{a.expert_title}</span>
                )}
              </div>
              <button
                onClick={() => handleRemove(a.id)}
                style={{ color: "#f87171", background: "none", border: "none", cursor: "pointer", fontSize: "0.7rem" }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {open ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <input placeholder="전문가 이름 *" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          <input placeholder="직함 (선택)" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
          <input placeholder="메모 (선택)" value={note} onChange={(e) => setNote(e.target.value)} style={inputStyle} />
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={handleAssign}
              disabled={loading || !name.trim()}
              style={{
                flex: 1, padding: "5px", borderRadius: "6px",
                border: "1px solid #2dd4bf", background: "rgba(45,212,191,0.1)",
                color: "#2dd4bf", fontSize: "0.72rem", cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "…" : "배정"}
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{
                padding: "5px 10px", borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.1)", background: "none",
                color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", cursor: "pointer",
              }}
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: "4px 12px", borderRadius: "6px",
            border: "1px dashed rgba(45,212,191,0.4)", background: "none",
            color: "rgba(45,212,191,0.7)", fontSize: "0.68rem",
            fontFamily: "var(--font-dm-mono), monospace", cursor: "pointer",
          }}
        >
          + 전문가 배정
        </button>
      )}
    </div>
  );
}

// ─── Admin Notes ──────────────────────────────────────────────────────────────

export function AdminNotesInput({ inquiryId, current }: { inquiryId: string; current: string | null }) {
  const [value, setValue] = useState(current ?? "");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { error } = await supabase
      .from("b2b_inquiries")
      .update({ admin_notes: value || null })
      .eq("id", inquiryId);
    setLoading(false);
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <textarea
        value={value}
        onChange={(e) => { setValue(e.target.value); setSaved(false); }}
        placeholder="내부 메모…"
        rows={2}
        style={{
          width: "100%", padding: "6px 10px", borderRadius: "6px",
          border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)",
          color: "rgba(255,255,255,0.6)", fontSize: "0.72rem", resize: "none",
          fontFamily: "inherit", outline: "none",
        }}
      />
      <button
        onClick={handleSave}
        disabled={loading}
        style={{
          alignSelf: "flex-end", padding: "3px 10px", borderRadius: "6px",
          border: "1px solid rgba(255,255,255,0.1)",
          background: saved ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.04)",
          color: saved ? "#4ade80" : "rgba(255,255,255,0.5)",
          fontSize: "0.68rem", fontFamily: "var(--font-dm-mono), monospace",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "…" : saved ? "✓ 저장됨" : "메모 저장"}
      </button>
    </div>
  );
}
