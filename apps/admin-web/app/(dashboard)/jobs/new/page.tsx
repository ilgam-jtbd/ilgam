// 어드민 — 새 공고 등록 페이지
import { JobCreateForm } from "./JobCreateForm";

export default function NewJobPage() {
  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#2dd4bf", marginBottom: "0.4rem" }}>
          Jobs · 새 공고
        </div>
        <h1 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: "1.8rem", color: "#0d1b2a" }}>
          공고 등록
        </h1>
      </div>
      <JobCreateForm />
    </div>
  );
}
