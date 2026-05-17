"use client";

// 어드민 — 공고 등록 폼 (클라이언트 컴포넌트)
// 구인자 멤버가 자신의 employer_id로 공고 등록

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

const VERTICALS = [
  { value: "logistics", label: "물류·배송" },
  { value: "retail",    label: "유통·매장" },
  { value: "fnb",       label: "식음료" },
];

const CERT_OPTIONS = [
  { value: "FOOD_HYGIENE", label: "식품위생교육" },
  { value: "COOK_BASIC",   label: "한식조리기능사" },
  { value: "FORKLIFT",     label: "지게차 운전기능사" },
  { value: "DRIVING_1T",   label: "1톤 화물 운전" },
  { value: "SECURITY",     label: "경비원 교육이수" },
  { value: "ELDER_CARE",   label: "요양보호사" },
];

const MIN_WAGE = 10030; // 2026 최저임금

export function JobCreateForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    dong_code: "",
    shift_start_at: "",
    shift_end_at: "",
    hourly_wage_krw: String(MIN_WAGE),
    headcount: "1",
    vertical: "",
  });
  const [requiredCerts, setRequiredCerts] = useState<string[]>([]);

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCert(v: string) {
    setRequiredCerts((prev) =>
      prev.includes(v) ? prev.filter((c) => c !== v) : [...prev, v],
    );
  }

  function validate(): string | null {
    if (form.title.length < 2) return "공고 제목은 2자 이상 입력해 주세요.";
    if (form.dong_code.length !== 10) return "법정동 코드는 10자리입니다.";
    if (!form.shift_start_at || !form.shift_end_at) return "근무 시작·종료 시각을 입력해 주세요.";
    if (new Date(form.shift_end_at) <= new Date(form.shift_start_at)) return "종료 시각이 시작 시각보다 늦어야 합니다.";
    const wage = Number(form.hourly_wage_krw);
    if (isNaN(wage) || wage < MIN_WAGE) return `시급은 최저임금(${MIN_WAGE.toLocaleString()}원) 이상이어야 합니다.`;
    const hc = Number(form.headcount);
    if (isNaN(hc) || hc < 1) return "모집 인원은 1명 이상입니다.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setSaving(true);
    setError(null);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // 현재 사용자의 employer_id 조회
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("로그인이 필요합니다."); setSaving(false); return; }

    const { data: member } = await supabase
      .from("employer_members")
      .select("employer_id")
      .eq("profile_id", user.id)
      .eq("role", "owner")
      .single();

    if (!member?.employer_id) {
      setError("등록된 구인자 계정이 없습니다. 먼저 구인자 심사를 받아주세요.");
      setSaving(false);
      return;
    }

    const { error: insErr } = await supabase.from("jobs").insert({
      employer_id: member.employer_id,
      title: form.title,
      description: form.description || null,
      dong_code: form.dong_code,
      shift_start_at: new Date(form.shift_start_at).toISOString(),
      shift_end_at: new Date(form.shift_end_at).toISOString(),
      hourly_wage_krw: Number(form.hourly_wage_krw),
      headcount: Number(form.headcount),
      vertical: form.vertical || null,
      required_cert_codes: requiredCerts,
      status: "open",
    });

    setSaving(false);
    if (insErr) { setError(insErr.message); return; }
    router.push("/jobs");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: "8px",
    border: "1px solid #e2e8f0", fontSize: "0.9rem",
    color: "#0d1b2a", background: "#fff", boxSizing: "border-box",
    outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.65rem",
    color: "#718096", letterSpacing: "0.1em", textTransform: "uppercase",
    display: "block", marginBottom: "6px",
  };
  const fieldStyle: React.CSSProperties = { marginBottom: "1.2rem" };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "640px" }}>
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "2rem", marginBottom: "1.5rem" }}>

        <div style={fieldStyle}>
          <label style={labelStyle}>공고 제목 *</label>
          <input style={inputStyle} value={form.title} onChange={(e) => set("title", e.target.value)}
            placeholder="예) 강서 물류센터 피킹·패킹" required />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>상세 설명</label>
          <textarea style={{ ...inputStyle, height: "80px", resize: "vertical" }}
            value={form.description} onChange={(e) => set("description", e.target.value)}
            placeholder="업무 내용, 주의사항 등" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>법정동 코드 (10자리) *</label>
            <input style={inputStyle} value={form.dong_code}
              onChange={(e) => set("dong_code", e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="1150010100" maxLength={10} inputMode="numeric" required />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>업종</label>
            <select style={inputStyle} value={form.vertical} onChange={(e) => set("vertical", e.target.value)}>
              <option value="">선택 안 함</option>
              {VERTICALS.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>필수 자격증 (선택) — 해당 자격 보유 워커만 매칭</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
            {CERT_OPTIONS.map((c) => {
              const active = requiredCerts.includes(c.value);
              return (
                <label
                  key={c.value}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "6px 12px", borderRadius: "20px", cursor: "pointer",
                    border: `1px solid ${active ? "#c9a84c" : "#e2e8f0"}`,
                    background: active ? "rgba(201,168,76,0.1)" : "#fff",
                    fontSize: "0.8rem", color: active ? "#92400e" : "#4a5568",
                    fontWeight: active ? 600 : 400, transition: "all 0.15s",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleCert(c.value)}
                    style={{ display: "none" }}
                  />
                  {active ? "✓ " : ""}{c.label}
                </label>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>근무 시작 (KST) *</label>
            <input style={inputStyle} type="datetime-local" value={form.shift_start_at}
              onChange={(e) => set("shift_start_at", e.target.value)} required />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>근무 종료 (KST) *</label>
            <input style={inputStyle} type="datetime-local" value={form.shift_end_at}
              onChange={(e) => set("shift_end_at", e.target.value)} required />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>시급 (원) * — 최저 {MIN_WAGE.toLocaleString()}원</label>
            <input style={inputStyle} type="number" value={form.hourly_wage_krw}
              onChange={(e) => set("hourly_wage_krw", e.target.value)}
              min={MIN_WAGE} step={100} required />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>모집 인원 *</label>
            <input style={inputStyle} type="number" value={form.headcount}
              onChange={(e) => set("headcount", e.target.value)} min={1} max={50} required />
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", borderRadius: "8px", padding: "12px 16px", marginBottom: "1rem", fontSize: "0.875rem", color: "#991b1b" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "12px" }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            flex: 1, background: saving ? "#e2e8f0" : "#c9a84c",
            color: "#0d1b2a", border: "none", borderRadius: "10px",
            padding: "14px", fontSize: "1rem", fontWeight: 700, cursor: "pointer",
          }}
        >
          {saving ? "등록 중…" : "공고 등록"}
        </button>
        <a href="/jobs" style={{
          flex: 1, background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: "10px", padding: "14px", fontSize: "1rem",
          textAlign: "center", textDecoration: "none", color: "#718096",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          취소
        </a>
      </div>
    </form>
  );
}
