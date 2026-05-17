"use client";

// 구인자 셀프 온보딩 폼
// employer_applications 테이블에 INSERT

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const BIZ_TYPES = ["제조업", "도소매업", "음식점업", "운수·물류업", "건설업", "서비스업", "기타"];

type Step = "form" | "done";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_SIZE_MB = 5;

export function EmployerSignupForm() {
  const [step, setStep] = useState<Step>("form");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
    biz_name: "",
    biz_reg_no: "",
    contact_name: "",
    contact_phone: "",
    biz_type: "",
  });

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleDocChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) { setDocFile(null); return; }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("PDF, JPG, PNG 파일만 업로드 가능합니다.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`파일 크기는 ${MAX_SIZE_MB}MB 이하여야 합니다.`);
      e.target.value = "";
      return;
    }
    setError(null);
    setDocFile(file);
  }

  function normalizePhone(input: string): string {
    const digits = input.replace(/\D/g, "");
    return digits.startsWith("0") ? `+82${digits.slice(1)}` : `+82${digits}`;
  }

  function validate(): string | null {
    if (!form.email.includes("@")) return "올바른 이메일 주소를 입력해 주세요.";
    if (form.password.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
    if (form.biz_name.length < 2) return "사업체명을 입력해 주세요.";
    if (!/^\d{10}$/.test(form.biz_reg_no.replace(/-/g, ""))) return "사업자등록번호는 10자리 숫자입니다.";
    if (form.contact_name.length < 2) return "담당자 이름을 입력해 주세요.";
    const e164 = normalizePhone(form.contact_phone);
    if (!/^\+82[0-9]{9,10}$/.test(e164)) return "올바른 연락처를 입력해 주세요.";
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

    // 1) 이메일 회원가입 또는 기존 계정으로 로그인
    const { data: signData, error: signErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signErr && signErr.message !== "User already registered") {
      setError(signErr.message);
      setSaving(false);
      return;
    }

    // 기존 계정인 경우 로그인
    let userId = signData?.user?.id;
    if (!userId) {
      const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (loginErr) { setError(loginErr.message); setSaving(false); return; }
      userId = loginData.user?.id;
    }

    if (!userId) { setError("인증 오류가 발생했습니다."); setSaving(false); return; }

    // 2) 사업자등록증 파일 업로드 (있을 경우)
    let bizRegDocPath: string | null = null;
    if (docFile) {
      const ext = docFile.name.split(".").pop() ?? "pdf";
      const storagePath = `${userId}/biz_reg.${ext}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("employer-docs")
        .upload(storagePath, docFile, { upsert: true });
      if (uploadErr) {
        setError(`파일 업로드 실패: ${uploadErr.message}`);
        setSaving(false);
        return;
      }
      bizRegDocPath = uploadData.path;
    }

    // 3) employer_applications INSERT
    const e164 = normalizePhone(form.contact_phone);
    const { error: appErr } = await supabase.from("employer_applications").insert({
      profile_id: userId,
      biz_name: form.biz_name,
      biz_reg_no: form.biz_reg_no.replace(/-/g, ""),
      contact_name: form.contact_name,
      contact_phone_e164: e164,
      biz_type: form.biz_type || null,
      biz_reg_doc_path: bizRegDocPath,
      status: "pending",
    });

    setSaving(false);
    if (appErr) { setError(appErr.message); return; }
    setStep("done");
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)", background: "#1a2f45",
    color: "#ffffff", fontSize: "1rem", boxSizing: "border-box", outline: "none",
  };
  const lbl: React.CSSProperties = {
    display: "block", fontSize: "0.75rem", color: "rgba(255,255,255,0.6)",
    marginBottom: "6px", fontFamily: "var(--font-dm-mono), monospace", letterSpacing: "0.08em",
  };
  const fld: React.CSSProperties = { marginBottom: "1.1rem" };

  if (step === "done") {
    return (
      <div style={{ background: "#1a2f45", borderRadius: "16px", padding: "2.5rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✓</div>
        <h2 style={{ color: "#4ade80", fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.8rem" }}>
          신청이 완료되었습니다
        </h2>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", lineHeight: "1.7" }}>
          1영업일 이내에 검토 후 이메일로 안내드립니다.<br />
          승인 완료 시 공고 등록 및 워커 매칭이 가능합니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: "#1a2f45", borderRadius: "16px", padding: "2rem" }}>
      <div style={{ marginBottom: "1.5rem", paddingBottom: "1.2rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ ...lbl, fontSize: "0.65rem", color: "#2dd4bf", letterSpacing: "0.15em" }}>ACCOUNT</div>
        <div style={fld}>
          <label style={lbl}>이메일 *</label>
          <input style={inp} type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
            placeholder="company@example.com" required />
        </div>
        <div style={fld}>
          <label style={lbl}>비밀번호 * (8자 이상)</label>
          <input style={inp} type="password" value={form.password} onChange={(e) => set("password", e.target.value)}
            placeholder="••••••••" required minLength={8} />
        </div>
      </div>

      <div>
        <div style={{ ...lbl, fontSize: "0.65rem", color: "#2dd4bf", letterSpacing: "0.15em", marginBottom: "1rem" }}>BUSINESS INFO</div>
        <div style={fld}>
          <label style={lbl}>사업체명 *</label>
          <input style={inp} value={form.biz_name} onChange={(e) => set("biz_name", e.target.value)}
            placeholder="예) (주)일감물류" required />
        </div>
        <div style={fld}>
          <label style={lbl}>사업자등록번호 * (10자리)</label>
          <input style={inp} value={form.biz_reg_no}
            onChange={(e) => set("biz_reg_no", e.target.value.replace(/[^0-9-]/g, "").slice(0, 12))}
            placeholder="000-00-00000" inputMode="numeric" required />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
          <div style={fld}>
            <label style={lbl}>담당자 이름 *</label>
            <input style={inp} value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)}
              placeholder="홍길동" required />
          </div>
          <div style={fld}>
            <label style={lbl}>연락처 *</label>
            <input style={inp} value={form.contact_phone}
              onChange={(e) => set("contact_phone", e.target.value)}
              placeholder="010-0000-0000" inputMode="tel" required />
          </div>
        </div>
        <div style={fld}>
          <label style={lbl}>업종</label>
          <select style={{ ...inp, cursor: "pointer" }} value={form.biz_type} onChange={(e) => set("biz_type", e.target.value)}>
            <option value="">선택 안 함</option>
            {BIZ_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={fld}>
          <label style={lbl}>사업자등록증 (PDF·JPG·PNG, 최대 5MB)</label>
          <label style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "#0d1b2a", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "10px",
            padding: "14px 16px", cursor: "pointer",
          }}>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: "none" }}
              onChange={handleDocChange}
            />
            <span style={{ fontSize: "1.2rem" }}>📄</span>
            <span style={{ fontSize: "0.85rem", color: docFile ? "#4ade80" : "rgba(255,255,255,0.5)" }}>
              {docFile ? docFile.name : "파일 선택 (선택 사항)"}
            </span>
          </label>
          {docFile && (
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: "4px", marginLeft: "4px" }}>
              {(docFile.size / 1024).toFixed(0)} KB
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(248,113,113,0.15)", borderRadius: "8px", padding: "10px 14px", marginBottom: "1rem", fontSize: "0.85rem", color: "#fca5a5" }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        style={{
          width: "100%", background: saving ? "rgba(201,168,76,0.35)" : "#c9a84c",
          color: "#0d1b2a", border: "none", borderRadius: "12px",
          padding: "16px", fontSize: "1rem", fontWeight: 700, cursor: "pointer",
          marginTop: "0.5rem",
        }}
      >
        {saving ? "신청 중…" : "구인자 신청하기"}
      </button>
    </form>
  );
}
