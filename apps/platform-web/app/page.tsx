"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { EXPERTS, STATS, COMPANIES } from "@/lib/data";

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── Inline SVG Icons ────────────────────────────────────────────────────────

function IconForm() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 8h10M7 12h10M7 16h6" />
    </svg>
  );
}

function IconBrain() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2C7 2 5 4 5 6.5c0 .8.2 1.6.6 2.2C4 9.3 3 10.8 3 12.5 3 15 5 17 7.5 17H9v2.5a2.5 2.5 0 005 0V17h1.5C18 17 20 15 20 12.5c0-1.7-1-3.2-2.6-3.8.4-.6.6-1.4.6-2.2C18 4 16 2 13.5 2c-1.1 0-2.1.4-2.9 1.1A4.4 4.4 0 009.5 2z" />
    </svg>
  );
}

function IconRocket() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function IconShip() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M19.38 20A11.6 11.6 0 0021 14l-9-4-9 4c0 2.2.5 4 1.62 6" />
      <path d="M12 10V2" />
      <path d="M8 6l4-4 4 4" />
    </svg>
  );
}

function IconFactory() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20a2 2 0 002 2h16a2 2 0 002-2V8l-7 5V8l-7 5V4a2 2 0 00-2-2H4a2 2 0 00-2 2v16z" />
      <path d="M17 18h1" /><path d="M12 18h1" /><path d="M7 18h1" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconLightbulb() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 006 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" /><path d="M10 22h4" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

function IconTrendUp() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function IconZap() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  );
}

function IconStar({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconQuote() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
    </svg>
  );
}

// ─── Helper: initials from Korean name ───────────────────────────────────────

function getInitials(name: string): string {
  return name.slice(0, 2);
}

// ─── Navigation ──────────────────────────────────────────────────────────────

function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className={`text-xl font-bold tracking-tight ${scrolled ? "text-slate-900" : "text-white"}`}>
              ILGAM
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 ml-0.5 mb-2" />
            </span>
            <span className={`font-mono text-xs hidden sm:inline ${scrolled ? "text-slate-400" : "text-slate-400"}`}>
              Senior Expert
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {[
              { label: "전문가 찾기", href: "/marketplace" },
              { label: "프로젝트 올리기", href: "/post-project" },
              { label: "툴·혜택", href: "/tools" },
              { label: "가격", href: "#pricing" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-indigo-500 ${
                  scrolled ? "text-slate-600" : "text-slate-300"
                }`}
              >
                {item.label}
                {item.label === "툴·혜택" && (
                  <span className="ml-1 text-xs bg-amber-400 text-slate-900 font-bold px-1.5 py-0.5 rounded-full">NEW</span>
                )}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                scrolled
                  ? "text-slate-700 hover:text-indigo-600 hover:bg-indigo-50"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              로그인
            </button>
            <button className="text-sm font-semibold px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
              무료로 시작하기
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="메뉴 열기"
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200/20 bg-white/95 backdrop-blur-md rounded-b-xl pb-4">
            <div className="flex flex-col gap-1 pt-3 px-2">
              {[
                { label: "전문가 찾기", href: "/marketplace" },
                { label: "프로젝트 올리기", href: "/post-project" },
                { label: "툴·혜택 🎁", href: "/tools" },
                { label: "가격", href: "#pricing" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <div className="flex gap-2 mt-3 px-2">
                <button className="flex-1 text-sm font-medium px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:border-indigo-300 transition-colors">
                  로그인
                </button>
                <button className="flex-1 text-sm font-semibold px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                  무료로 시작하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection() {
  const featuredExperts = EXPERTS.slice(0, 3);

  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)" }}
    >
      {/* Background decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #4f46e5 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #c9a84c 0%, transparent 70%)" }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            {/* Eyebrow badge */}
            <motion.div variants={fadeInUp}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border"
                style={{ background: "rgba(79,70,229,0.15)", borderColor: "rgba(79,70,229,0.4)", color: "#a5b4fc" }}>
                🚀 {STATS.experts} 검증된 시니어 전문가
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight"
            >
              필요한 순간,
              <br />
              <span className="gradient-text">검증된 시니어</span>
              <br />
              전문가
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-lg"
            >
              정규직 채용 없이도 전 임원급 전문성을 당일 확보하세요.
              <br />
              조선·제조·IT·헬스케어·금융 산업별 최고 전문가 네트워크.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition-all hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5">
                전문가 찾기 →
              </button>
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-all hover:-translate-y-0.5">
                전문가로 참여하기
              </button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10"
            >
              {[
                { value: STATS.experts, label: "검증 전문가" },
                { value: STATS.companies, label: "파트너 기업" },
                { value: STATS.avgResponseTime, label: "평균 응답" },
                { value: STATS.successRate, label: "매칭 성공률" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center sm:text-left">
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Floating expert cards */}
          <div className="hidden lg:block relative h-[480px]">
            {featuredExperts.map((expert, i) => (
              <motion.div
                key={expert.id}
                initial={{ opacity: 0, x: 40, y: i * 10 }}
                animate={{ opacity: 1, x: 0, y: i * 10 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.6, ease: "easeOut" }}
                className={`absolute w-64 rounded-2xl p-4 border cursor-pointer transition-all hover:-translate-y-1`}
                style={{
                  top: i === 0 ? "20px" : i === 1 ? "160px" : "300px",
                  right: i === 1 ? "0" : "40px",
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(16px)",
                  borderColor: "rgba(255,255,255,0.12)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {getInitials(expert.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-semibold">{expert.name}</span>
                      {expert.badge && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                          style={{ background: expert.badge === "TOP" ? "rgba(201,168,76,0.2)" : "rgba(79,70,229,0.2)", color: expert.badge === "TOP" ? "#c9a84c" : "#a5b4fc" }}>
                          {expert.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5 truncate">{expert.title.split("/")[0].trim()}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="text-yellow-400"><IconStar filled /></span>
                      <span className="text-white text-xs font-medium">{expert.rating}</span>
                      <span className="text-slate-500 text-xs">({expert.reviewCount})</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {expert.skills.slice(0, 2).map((skill) => (
                    <span key={skill} className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(79,70,229,0.2)", color: "#a5b4fc" }}>
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                  <span className="text-slate-400 text-xs">시간당</span>
                  <span className="text-white text-sm font-bold">{expert.hourlyRate}만원</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12">
          <path d="M0 60L1440 60L1440 0C1200 50 960 60 720 40C480 20 240 50 0 0L0 60Z" fill="#f8fafc" />
        </svg>
      </div>
    </section>
  );
}

// ─── Logos Section ────────────────────────────────────────────────────────────

function LogosSection() {
  return (
    <section className="bg-slate-50 py-14 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center font-mono text-xs text-slate-400 tracking-widest uppercase mb-8"
        >
          신뢰받는 파트너사
        </motion.p>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-8 sm:gap-12"
        >
          {COMPANIES.map((company) => (
            <motion.div
              key={company.id}
              variants={fadeInUp}
              className="text-slate-400 font-semibold text-base sm:text-lg tracking-tight hover:text-slate-600 transition-colors cursor-default select-none"
            >
              {company.name}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: <IconForm />,
      title: "프로젝트 등록",
      description: "필요한 전문성, 기간, 예산을 입력하세요. 5분이면 충분합니다.",
      detail: "NDA 보호 하에 프로젝트 내용을 등록하면 AI가 즉시 분석을 시작합니다.",
    },
    {
      number: "02",
      icon: <IconBrain />,
      title: "AI 전문가 매칭",
      description: "ILGAM AI가 2,400+ 전문가 중 최적 후보를 평균 2.3시간 내 추천합니다.",
      detail: "산업 경력, 스킬셋, 가용성, 과거 프로젝트 성과를 종합 분석합니다.",
    },
    {
      number: "03",
      icon: <IconRocket />,
      title: "즉시 시작",
      description: "전문가 프로필 검토 후 수락 한 번으로 프로젝트를 즉시 시작하세요.",
      detail: "계약서, 결제, 커뮤니케이션 채널 모두 플랫폼 내에서 자동 처리됩니다.",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-mono text-xs text-indigo-600 tracking-widest uppercase mb-3">프로세스</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            3단계로 끝나는
            <br />
            전문가 매칭
          </h2>
          <p className="text-slate-500 mt-4 text-base max-w-xl mx-auto">
            복잡한 채용 과정 없이, 필요한 전문성을 당일에 확보하세요.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              variants={fadeInUp}
              className="relative group"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-8 h-px bg-gradient-to-r from-indigo-200 to-transparent z-10" style={{ width: "calc(100% - 80px)", left: "calc(50% + 40px)" }} />
              )}
              <div className="rounded-2xl p-6 border border-slate-100 hover:border-indigo-200 hover:shadow-card-hover transition-all bg-white">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                    {step.icon}
                  </div>
                  <span className="font-mono text-3xl font-bold text-slate-100 mt-1">{step.number}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-3">{step.description}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{step.detail}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Industry Categories ──────────────────────────────────────────────────────

function IndustriesSection() {
  const industries = [
    { icon: <IconShip />, label: "조선·해양", count: "184명", color: "from-blue-50 to-indigo-50", accent: "text-blue-600" },
    { icon: <IconFactory />, label: "제조·플랜트", count: "312명", color: "from-orange-50 to-amber-50", accent: "text-orange-600" },
    { icon: <IconCode />, label: "IT·AI", count: "521명", color: "from-violet-50 to-purple-50", accent: "text-violet-600" },
    { icon: <IconLightbulb />, label: "스타트업", count: "278명", color: "from-yellow-50 to-lime-50", accent: "text-yellow-700" },
    { icon: <IconHeart />, label: "헬스케어", count: "193명", color: "from-rose-50 to-pink-50", accent: "text-rose-600" },
    { icon: <IconTrendUp />, label: "금융·투자", count: "247명", color: "from-emerald-50 to-teal-50", accent: "text-emerald-600" },
    { icon: <IconZap />, label: "에너지", count: "136명", color: "from-amber-50 to-orange-50", accent: "text-amber-700" },
    { icon: <IconBuilding />, label: "중견기업", count: "389명", color: "from-slate-50 to-gray-50", accent: "text-slate-600" },
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="font-mono text-xs text-indigo-600 tracking-widest uppercase mb-3">산업 분야</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            모든 산업의 최고 전문가
          </h2>
          <p className="text-slate-500 mt-4 text-base max-w-xl mx-auto">
            전 임원, 은퇴 전문가, 산업 스페셜리스트 — 어느 분야든 검증된 인재가 준비되어 있습니다.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {industries.map(({ icon, label, count, color, accent }) => (
            <motion.div
              key={label}
              variants={fadeInUp}
              className={`group rounded-2xl p-5 bg-gradient-to-br ${color} border border-transparent hover:border-indigo-300 hover:shadow-card-hover cursor-pointer transition-all`}
            >
              <div className={`${accent} mb-3 group-hover:scale-110 transition-transform inline-block`}>
                {icon}
              </div>
              <div className="font-semibold text-slate-800 text-sm mb-1">{label}</div>
              <div className="text-slate-400 text-xs">{count} 전문가</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Featured Experts ─────────────────────────────────────────────────────────

function ExpertCard({ expert }: { expert: (typeof EXPERTS)[number] }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="bg-white rounded-2xl shadow-card hover:shadow-card-hover border border-slate-100 hover:border-indigo-200 transition-all group p-6 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {getInitials(expert.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-900 text-base">{expert.name}</h3>
            {expert.badge && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={
                  expert.badge === "TOP"
                    ? { background: "rgba(201,168,76,0.12)", color: "#b8860b" }
                    : { background: "#eef2ff", color: "#4f46e5" }
                }
              >
                {expert.badge}
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{expert.title}</p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1.5 mb-4">
        <div className="flex text-yellow-400">
          {[1, 2, 3, 4, 5].map((s) => (
            <IconStar key={s} filled={s <= Math.round(expert.rating)} />
          ))}
        </div>
        <span className="text-sm font-semibold text-slate-700">{expert.rating}</span>
        <span className="text-slate-400 text-xs">({expert.reviewCount}건)</span>
        <span className="ml-auto text-xs text-slate-400">{expert.location}</span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {expert.skills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
        <div>
          <span className="text-lg font-bold text-slate-900">{expert.hourlyRate}만원</span>
          <span className="text-slate-400 text-xs">/시간</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${expert.available ? "bg-emerald-400" : "bg-slate-300"}`} />
            <span className="text-xs text-slate-500">{expert.available ? "즉시 가능" : expert.availableFrom ?? "미정"}</span>
          </div>
          <button className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">
            자세히 보기
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function FeaturedExpertsSection() {
  const featured = EXPERTS.slice(0, 3);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12"
        >
          <div>
            <p className="font-mono text-xs text-indigo-600 tracking-widest uppercase mb-3">추천 전문가</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              오늘 만날 수 있는
              <br />
              최고의 전문가
            </h2>
          </div>
          <button className="self-start sm:self-auto text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
            전체 보기 →
          </button>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {featured.map((expert) => (
            <ExpertCard key={expert.id} expert={expert} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Why ILGAM ────────────────────────────────────────────────────────────────

function WhyIlgamSection() {
  const comparisons = [
    {
      category: "vs 정규직 채용",
      highlight: "고정비 68% 절감",
      icon: "💼",
      rows: [
        { feature: "시작 시간", ilgam: "당일~3일", other: "3~6개월" },
        { feature: "비용 구조", ilgam: "성과 기반 단기", other: "연봉+복지+퇴직금" },
        { feature: "전문성 깊이", ilgam: "전직 임원급", other: "채용 가능 수준" },
        { feature: "해고 리스크", ilgam: "없음", other: "높음" },
      ],
      color: "from-indigo-600 to-violet-600",
    },
    {
      category: "vs 대형 컨설팅",
      highlight: "당일 매칭, 1/5 비용",
      icon: "🏢",
      rows: [
        { feature: "매칭 시간", ilgam: "평균 2.3시간", other: "2~4주 제안서" },
        { feature: "비용 수준", ilgam: "시장 직거래가", other: "고가 컨설팅 수수료" },
        { feature: "전문가 이력", ilgam: "현업 실무 20년+", other: "팀 파견" },
        { feature: "NDA 보호", ilgam: "플랫폼 자동화", other: "별도 협상" },
      ],
      color: "from-emerald-600 to-teal-600",
    },
    {
      category: "vs 일반 프리랜서",
      highlight: "20년+ 경력 검증",
      icon: "👤",
      rows: [
        { feature: "경력 검증", ilgam: "ILGAM 3단계 인증", other: "자기 신고" },
        { feature: "임원급 경험", ilgam: "전직 C-레벨·본부장", other: "보장 없음" },
        { feature: "분쟁 해결", ilgam: "플랫폼 에스크로", other: "개인 간 분쟁" },
        { feature: "재이용률", ilgam: "87%", other: "개인 편차 큼" },
      ],
      color: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="font-mono text-xs text-indigo-600 tracking-widest uppercase mb-3">왜 ILGAM인가</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            다른 선택지와 비교해보세요
          </h2>
          <p className="text-slate-500 mt-4 text-base max-w-xl mx-auto">
            정규직, 컨설팅 펌, 일반 프리랜서 — 세 가지 대안 모두와 비교했을 때 ILGAM이 압도적입니다.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {comparisons.map(({ category, highlight, icon, rows, color }) => (
            <motion.div
              key={category}
              variants={fadeInUp}
              className="rounded-2xl overflow-hidden bg-white shadow-card border border-slate-100"
            >
              {/* Card header */}
              <div className={`bg-gradient-to-r ${color} p-5 text-white`}>
                <div className="text-2xl mb-2">{icon}</div>
                <div className="text-sm font-medium opacity-80">{category}</div>
                <div className="text-xl font-bold mt-1">{highlight}</div>
              </div>

              {/* Comparison rows */}
              <div className="p-5">
                <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-slate-400 mb-3 pb-2 border-b border-slate-100">
                  <span>항목</span>
                  <span className="text-indigo-600">ILGAM</span>
                  <span>대안</span>
                </div>
                {rows.map(({ feature, ilgam, other }) => (
                  <div key={feature} className="grid grid-cols-3 gap-2 py-2 border-b border-slate-50 text-xs">
                    <span className="text-slate-500">{feature}</span>
                    <span className="text-slate-900 font-semibold flex items-center gap-1">
                      <span className="text-emerald-500 flex-shrink-0"><IconCheck /></span>
                      {ilgam}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <span className="text-slate-300 flex-shrink-0"><IconX /></span>
                      {other}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "중동 LNG 수주 협상에 1주일 남짓 자문이 필요했는데, ILGAM에서 전직 현대중공업 부사장급 전문가를 4시간 만에 연결해줬습니다. 협상 전략 하나로 계약 단가를 8% 높일 수 있었어요. 솔직히 이런 퀄리티는 기대하지 않았습니다.",
      author: "박준형",
      title: "구매기획팀장",
      company: "STX조선해양",
      metric: "계약 단가 8% 상승",
      initials: "박준",
    },
    {
      quote:
        "Series A 투자를 준비하면서 IR 자료를 수십 번 고쳤는데 결정적인 피드백을 못 받았어요. 카카오 전 CPO에게 하루 자문을 받은 후 투자자 피드백이 완전히 달라졌고, 결국 목표의 130%로 라운드를 마감했습니다. 비용 대비 ROI가 역대 최고입니다.",
      author: "이수민",
      title: "대표이사",
      company: "메디컬AI 스타트업",
      metric: "IR 목표 130% 달성",
      initials: "이수",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="font-mono text-xs text-indigo-600 tracking-widest uppercase mb-3">고객 후기</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            실제 결과로 증명합니다
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6"
        >
          {testimonials.map(({ quote, author, title, company, metric, initials }) => (
            <motion.div
              key={author}
              variants={fadeInUp}
              className="rounded-2xl p-8 bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:shadow-card-hover transition-all"
            >
              {/* Quote icon */}
              <div className="text-indigo-200 mb-4">
                <IconQuote />
              </div>

              {/* Quote text */}
              <blockquote className="text-slate-700 text-base leading-relaxed mb-6">
                &ldquo;{quote}&rdquo;
              </blockquote>

              {/* Metric badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-5">
                <span className="text-indigo-400"><IconTrendUp /></span>
                {metric}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                  {initials}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{author}</div>
                  <div className="text-slate-400 text-xs">{title} · {company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function PricingSection() {
  const tiers = [
    {
      name: "스타터",
      price: "무료",
      priceDetail: "건별 수수료 15%",
      description: "처음 시작하는 기업을 위한 플랜",
      features: [
        "프로젝트 무제한 등록",
        "AI 매칭 기본 추천",
        "전문가 프로필 열람",
        "플랫폼 에스크로 결제",
        "이메일 지원",
      ],
      cta: "무료로 시작하기",
      highlight: false,
      badge: null,
    },
    {
      name: "프로",
      price: "₩299,000",
      priceDetail: "/월 · 수수료 8%",
      description: "빠른 매칭과 우선 지원이 필요한 팀",
      features: [
        "모든 스타터 기능",
        "수수료 8% (15% 대비 절반)",
        "우선 매칭 (응답 1시간 보장)",
        "전문가 직접 메시지",
        "전담 매니저 (주 1회)",
        "SLA 99% 업타임",
      ],
      cta: "프로 시작하기",
      highlight: true,
      badge: "가장 인기",
    },
    {
      name: "엔터프라이즈",
      price: "문의",
      priceDetail: "맞춤 수수료",
      description: "대규모 프로젝트 운영 기업 전용",
      features: [
        "모든 프로 기능",
        "전담 어카운트 매니저",
        "커스텀 SLA 계약",
        "온프레미스 NDA 프로세스",
        "전문가 풀 화이트라벨",
        "API 연동 지원",
      ],
      cta: "영업팀 문의",
      highlight: false,
      badge: null,
    },
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="font-mono text-xs text-indigo-600 tracking-widest uppercase mb-3">가격 플랜</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            투명한 가격, 숨겨진 비용 없음
          </h2>
          <p className="text-slate-500 mt-4 text-base max-w-xl mx-auto">
            Phase 0 검증 기간 동안 모든 플랜을 특가로 제공합니다.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 items-stretch"
        >
          {tiers.map(({ name, price, priceDetail, description, features, cta, highlight, badge }) => (
            <motion.div
              key={name}
              variants={fadeInUp}
              className={`relative rounded-2xl p-8 flex flex-col transition-all ${
                highlight
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 ring-2 ring-indigo-500 scale-105"
                  : "bg-white text-slate-900 border border-slate-200 hover:border-indigo-200 hover:shadow-card-hover"
              }`}
            >
              {badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gold text-slate-900"
                    style={{ backgroundColor: "#c9a84c" }}>
                    {badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`font-bold text-lg mb-1 ${highlight ? "text-white" : "text-slate-900"}`}>{name}</h3>
                <p className={`text-sm ${highlight ? "text-indigo-200" : "text-slate-500"}`}>{description}</p>
              </div>

              <div className="mb-8">
                <span className={`text-4xl font-bold ${highlight ? "text-white" : "text-slate-900"}`}>{price}</span>
                <span className={`text-sm ml-1 ${highlight ? "text-indigo-200" : "text-slate-400"}`}>{priceDetail}</span>
              </div>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm">
                    <span className={highlight ? "text-indigo-300" : "text-indigo-600"}>
                      <IconCheck />
                    </span>
                    <span className={highlight ? "text-indigo-100" : "text-slate-600"}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  highlight
                    ? "bg-white text-indigo-600 hover:bg-indigo-50"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {cta}
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const links = {
    서비스: ["전문가 찾기", "프로젝트 올리기", "AI 매칭", "가격 플랜"],
    회사: ["ILGAM 소개", "팀", "채용", "블로그"],
    지원: ["고객센터", "이용 가이드", "API 문서", "문의하기"],
  };

  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-xl font-bold text-white">
                ILGAM
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 ml-0.5 mb-1.5" />
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              검증된 시니어 전문가를<br />
              필요한 순간에.
            </p>
            <p className="font-mono text-xs text-slate-600">Senior Expert Spot Work</p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-sm font-semibold text-slate-300 mb-4">{section}</h4>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            © 2026 ILGAM. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <a href="#" className="hover:text-slate-400 transition-colors">개인정보처리방침</a>
            <a href="#" className="hover:text-slate-400 transition-colors">이용약관</a>
            <span
              className="px-2 py-0.5 rounded font-mono font-medium"
              style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c" }}
            >
              v3.2
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <LogosSection />
      <HowItWorksSection />
      <IndustriesSection />
      <FeaturedExpertsSection />
      <WhyIlgamSection />
      <TestimonialsSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
