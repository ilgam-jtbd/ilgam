// 구인자 셀프 온보딩 — 사업자 등록 신청 (공개 페이지, 대시보드 외부)
// employer_applications INSERT → 어드민 검토 후 approve_employer RPC

import { EmployerSignupForm } from "./EmployerSignupForm";

export default function EmployerSignupPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0d1b2a", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: "520px" }}>
        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.62rem", letterSpacing: "0.2em", color: "#2dd4bf", marginBottom: "0.6rem" }}>
            ILGAM · 구인자 신청
          </div>
          <h1 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: "2rem", color: "#c9a84c", marginBottom: "0.5rem" }}>
            일감에 공고를 올리세요
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.9rem", lineHeight: "1.6" }}>
            사업자 정보를 입력하면 1영업일 이내 승인해 드립니다.<br />
            승인 후 즉시 공고 등록 및 워커 매칭이 가능합니다.
          </p>
        </div>

        <EmployerSignupForm />

        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", marginTop: "1.5rem" }}>
          문의: recruit@ilgam.kr
        </p>
      </div>
    </div>
  );
}
