"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from "framer-motion";
import { EXPERTS } from "@/lib/data";

// ─── CRO: Scroll Progress Bar ─────────────────────────────────────────────────

function ScrollProgressBar() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      setPct((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-transparent">
      <motion.div
        className="h-full"
        style={{
          width: `${pct}%`,
          background: "linear-gradient(90deg, #4f46e5, #c9a84c)",
        }}
      />
    </div>
  );
}

// ─── CRO: Promo Banner ────────────────────────────────────────────────────────

function PromoBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      data-qa="promo-banner"
      style={{ background: "linear-gradient(90deg,#92400e,#c9a84c,#92400e)" }}
      className="relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3 text-sm font-semibold text-amber-950">
        <span className="text-base">🎁</span>
        <span>첫 프로젝트 매칭 수수료 면제 — 2026.06.30까지 한정</span>
        <a href="/post-project" data-qa="promo-cta" className="underline underline-offset-2 hover:no-underline">
          지금 시작하기 →
        </a>
        <button
          onClick={onDismiss}
          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="배너 닫기"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}

// ─── CRO: Social Proof Toast ──────────────────────────────────────────────────

const SOCIAL_PROOFS = [
  { company: "STX조선해양", action: "프로젝트를 방금 등록했습니다", time: "2분 전", icon: "🏢" },
  { company: "메디컬AI 스타트업", action: "전문가 매칭에 성공했습니다", time: "8분 전", icon: "✅" },
  { company: "현대중공업 담당자", action: "전문가를 검색 중입니다", time: "방금", icon: "🔍" },
  { company: "핀테크 스타트업 CTO", action: "원포인트 자문을 예약했습니다", time: "15분 전", icon: "⚡" },
  { company: "코스맥스바이오", action: "FDA 자문 전문가를 찾았습니다", time: "31분 전", icon: "🎯" },
];

function SocialProofToast() {
  const [visible, setVisible] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(show);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % SOCIAL_PROOFS.length);
        setVisible(true);
      }, 600);
    }, 5000);
    return () => clearInterval(cycle);
  }, [visible]);

  const proof = SOCIAL_PROOFS[idx]!;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={idx}
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          data-qa="social-proof-toast"
          className="fixed bottom-6 left-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl max-w-xs"
          style={{
            background: "rgba(13,27,42,0.97)",
            border: "1px solid rgba(201,168,76,0.3)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span className="text-xl flex-shrink-0">{proof.icon}</span>
          <div>
            <p className="text-xs font-semibold text-white leading-tight">
              <span style={{ color: "#c9a84c" }}>{proof.company}</span>
            </p>
            <p className="text-xs text-white/60 mt-0.5">{proof.action}</p>
          </div>
          <span className="text-[10px] text-white/30 ml-auto flex-shrink-0">{proof.time}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 20 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) motionVal.set(target);
  }, [inView, target, motionVal]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => {
      setDisplay(Math.round(v).toLocaleString("ko-KR"));
    });
    return unsub;
  }, [spring]);

  return <span ref={ref}>{display}{suffix}</span>;
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav({ scrolled }: { scrolled: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      data-qa="main-nav"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/[0.06] backdrop-blur-xl"
          : ""
      }`}
      style={{ backgroundColor: scrolled ? "rgba(6,13,24,0.95)" : "transparent" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2" data-qa="nav-logo">
          <span className="text-xl font-black tracking-tight text-white">
            VE<span style={{ color: "#c9a84c" }}>LOR</span>
          </span>
          <span className="hidden sm:block text-[10px] font-mono text-white/30 uppercase tracking-widest mt-0.5">
            Expert Network
          </span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "전문가 찾기", href: "/marketplace" },
            { label: "원포인트 자문", href: "/post-project", badge: "NEW" },
            { label: "인재추천", href: "/post-project", badge: "NEW" },
            { label: "툴·혜택", href: "/tools" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              data-qa={`nav-${item.label.replace(/\s/g, "-")}`}
              className="px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors relative"
            >
              {item.label}
              {item.badge && (
                <span
                  className="absolute -top-1 -right-1 text-[9px] font-bold px-1 rounded-sm"
                  style={{ background: "#c9a84c", color: "#0a0a0a" }}
                >
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            data-qa="nav-login"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            로그인
          </button>
          <a
            href="/post-project"
            data-qa="nav-cta"
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg,#4f46e5,#6d28d9)" }}
          >
            무료 상담
          </a>
        </div>

        <button
          className="md:hidden p-2 text-white/60 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="메뉴"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden border-t border-white/[0.06] pb-4"
            style={{ background: "rgba(6,13,24,0.98)" }}
          >
            <div className="px-4 pt-3 space-y-1">
              {["전문가 찾기", "원포인트 자문", "인재추천", "툴·혜택"].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  {label}
                </a>
              ))}
              <div className="flex gap-2 pt-2">
                <button className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-white/[0.12] text-white/60">
                  로그인
                </button>
                <a
                  href="/post-project"
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white text-center"
                  style={{ background: "#4f46e5" }}
                >
                  무료 상담
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─── Trust Bar (VWO A/B target) ───────────────────────────────────────────────

function TrustBar() {
  const items = [
    { icon: "🔒", text: "NDA 보호 계약", qa: "trust-nda" },
    { icon: "↩️", text: "30일 성과 보장", qa: "trust-guarantee" },
    { icon: "⚡", text: "평균 2.3시간 응답", qa: "trust-response" },
    { icon: "✅", text: "97% 고객 만족", qa: "trust-satisfaction" },
    { icon: "🏆", text: "검증된 임원 출신", qa: "trust-verified" },
  ];
  return (
    <div
      data-qa="trust-bar"
      className="border-y border-white/[0.06]"
      style={{ background: "rgba(255,255,255,0.02)" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-6 flex-wrap">
        {items.map((item) => (
          <div key={item.qa} data-qa={item.qa} className="flex items-center gap-2 text-sm text-white/50">
            <span>{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Hero Expert Card ─────────────────────────────────────────────────────────

function HeroExpertCard({ expert, delay, offset }: {
  expert: (typeof EXPERTS)[0];
  delay: number;
  offset: { x: number; y: number; rotate: number };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 + offset.y, x: offset.x, rotate: offset.rotate }}
      animate={{ opacity: 1, y: offset.y, x: offset.x, rotate: offset.rotate }}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="absolute rounded-2xl p-4 w-56 shadow-2xl"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#4f46e5,#6d28d9)", color: "#fff" }}
        >
          {expert.name.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-white truncate">{expert.name}</div>
          <div className="text-[10px] text-white/40 truncate">{expert.company}</div>
        </div>
        {expert.badge && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
            style={expert.badge === "TOP"
              ? { background: "rgba(201,168,76,0.2)", color: "#c9a84c" }
              : { background: "rgba(79,70,229,0.2)", color: "#a5b4fc" }}
          >
            {expert.badge}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-amber-400 text-xs">★</span>
          <span className="text-xs font-semibold text-white">{expert.rating}</span>
          <span className="text-[10px] text-white/30">({expert.reviewCount})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-white/40">가용</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────

interface ServiceCardProps {
  icon: string;
  title: string;
  sub: string;
  features: string[];
  price: string;
  cta: string;
  badge?: string;
  accent: string;
  qa: string;
  delay: number;
}

function ServiceCard({ icon, title, sub, features, price, cta, badge, accent, qa, delay }: ServiceCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      data-qa={qa}
      className="group relative rounded-2xl p-6 flex flex-col gap-4 cursor-pointer transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid rgba(255,255,255,0.07)`,
      }}
      whileHover={{
        boxShadow: `0 0 0 1px ${accent}40, 0 20px 60px ${accent}15`,
        borderColor: `${accent}40`,
      }}
    >
      {badge && (
        <span
          className="absolute top-4 right-4 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${accent}20`, color: accent }}
        >
          {badge}
        </span>
      )}

      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}
      >
        {icon}
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-sm text-white/50 leading-relaxed">{sub}</p>
      </div>

      <ul className="space-y-2 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-white/60">
            <span style={{ color: accent }} className="text-xs">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <div className="pt-4 border-t border-white/[0.06]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-white/30">시작 가격</span>
          <span className="font-bold" style={{ color: accent }}>{price}</span>
        </div>
        <a
          href="/post-project"
          data-qa={`${qa}-cta`}
          className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
          style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}30` }}
        >
          {cta}
        </a>
      </div>
    </motion.div>
  );
}

// ─── Stats Section ────────────────────────────────────────────────────────────

function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const stats = [
    { value: 2400, suffix: "+", label: "검증된 전문가", sub: "임원 출신 평균 경력 24년" },
    { value: 850, suffix: "+", label: "파트너 기업", sub: "대기업·중견·스타트업" },
    { value: 97, suffix: "%", label: "매칭 성공률", sub: "첫 자문 내 해결" },
    { value: 23, suffix: "h", label: "평균 응답 시간", sub: "긴급 매칭 당일 가능" },
  ];

  return (
    <div
      ref={ref}
      data-qa="stats-section"
      className="grid grid-cols-2 lg:grid-cols-4 gap-px"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="px-8 py-10 text-center"
          style={{ background: "#060d18" }}
        >
          <div
            className="text-4xl font-black mb-1"
            style={{ color: i % 2 === 0 ? "#c9a84c" : "#2dd4bf" }}
          >
            {inView ? <AnimatedNumber target={s.value} suffix={s.suffix} /> : `0${s.suffix}`}
          </div>
          <div className="text-sm font-semibold text-white/80 mb-1">{s.label}</div>
          <div className="text-xs text-white/30">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Expert Card ──────────────────────────────────────────────────────────────

function ExpertShowcaseCard({ expert, delay }: { expert: (typeof EXPERTS)[0]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      data-qa="expert-card"
      className="relative group rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 cursor-pointer"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{
        y: -4,
        boxShadow: "0 20px 60px rgba(79,70,229,0.15)",
        borderColor: "rgba(79,70,229,0.4)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff" }}
        >
          {expert.name.slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{expert.name}</span>
            {expert.badge && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                style={
                  expert.badge === "TOP"
                    ? { background: "rgba(201,168,76,0.2)", color: "#c9a84c" }
                    : { background: "rgba(79,70,229,0.2)", color: "#a5b4fc" }
                }
              >
                {expert.badge}
              </span>
            )}
          </div>
          <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{expert.title}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <span className="text-amber-400">★</span>
          <span className="font-semibold text-white">{expert.rating}</span>
          <span className="text-white/30">({expert.reviewCount}건)</span>
        </div>
        <div className="text-white/30">{expert.yearsExp}년 경력</div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {expert.skills.slice(0, 3).map((s) => (
          <span
            key={s}
            className="text-[11px] px-2 py-0.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
          >
            {s}
          </span>
        ))}
      </div>

      {expert.youtube && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: "rgba(255,0,0,0.06)", border: "1px solid rgba(255,0,0,0.12)" }}
        >
          <span className="text-red-500 text-xs font-bold">▶</span>
          <span className="text-xs text-white/50">유튜브 {expert.youtube.subscribers} 구독자</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
        <span className="text-sm font-bold" style={{ color: "#c9a84c" }}>
          {expert.hourlyRate}만원/시간
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-white/40">가용 가능</span>
        </div>
      </div>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(6,13,24,0.85)", backdropFilter: "blur(4px)" }}
          >
            <a
              href="/marketplace"
              data-qa="expert-card-hover-cta"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "#4f46e5" }}
            >
              프로필 보기 →
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Case Study Card ──────────────────────────────────────────────────────────

function CaseStudyCard({
  company, tag, metric, metricLabel, desc, duration, delay,
}: {
  company: string; tag: string; metric: string; metricLabel: string;
  desc: string; duration: string; delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-start justify-between">
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: "rgba(79,70,229,0.15)", color: "#a5b4fc" }}
        >
          {tag}
        </span>
        <span className="text-xs text-white/30">{duration}</span>
      </div>

      <div>
        <div className="text-2xl font-black" style={{ color: "#2dd4bf" }}>{metric}</div>
        <div className="text-xs text-white/40 mt-0.5">{metricLabel}</div>
      </div>

      <p className="text-sm text-white/60 leading-relaxed flex-1">{desc}</p>

      <div
        className="text-sm font-semibold"
        style={{ color: "rgba(201,168,76,0.8)" }}
      >
        {company}
      </div>
    </motion.div>
  );
}

// ─── Testimonial ──────────────────────────────────────────────────────────────

function TestimonialCard({
  quote, author, role, company, delay,
}: {
  quote: string; author: string; role: string; company: string; delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      data-qa="testimonial"
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ color: "#c9a84c", fontSize: "2rem", lineHeight: 1, opacity: 0.5 }}>&ldquo;</div>
      <p className="text-sm text-white/70 leading-relaxed flex-1 -mt-3">{quote}</p>
      <div>
        <div className="font-semibold text-white text-sm">{author}</div>
        <div className="text-xs text-white/40 mt-0.5">{role} · {company}</div>
      </div>
    </motion.div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="text-center mb-12"
    >
      <span
        className="inline-block text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest"
        style={{ background: "rgba(79,70,229,0.15)", color: "#818cf8" }}
      >
        {eyebrow}
      </span>
      <h2 className="text-3xl md:text-4xl font-black text-white mb-4">{title}</h2>
      {sub && <p className="text-white/50 text-base max-w-xl mx-auto leading-relaxed">{sub}</p>}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VelorLandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const SERVICES = [
    {
      icon: "🚀",
      title: "프로젝트 자문",
      sub: "1주~3개월 단기 계약으로 검증된 임원 출신 전문가의 집중 자문을 받으세요.",
      features: ["NDA 보호 계약 포함", "AI 매칭 보장", "성과 기반 정산"],
      price: "200만원~",
      cta: "프로젝트 올리기",
      accent: "#818cf8",
      qa: "service-project",
      delay: 0,
    },
    {
      icon: "⚡",
      title: "원포인트 자문",
      sub: "중요한 의사결정 앞에서 수십 년 경험자의 판단을 1~2시간 안에 빌리세요.",
      features: ["당일 예약 가능", "화상 미팅 1~2시간", "핵심 요약 보고서"],
      price: "30만원~/시간",
      cta: "바로 예약하기",
      badge: "가장 빠른 방법",
      accent: "#c9a84c",
      qa: "service-onepoint",
      delay: 0.1,
    },
    {
      icon: "🎯",
      title: "인재추천 · 스카웃",
      sub: "임원급 인재가 필요한 기업에 검증된 전문가 풀에서 3일 내 후보를 추천합니다.",
      features: ["경력 25년+ 후보 제안", "레퍼런스 체크 포함", "성공 수수료 방식"],
      price: "성공 수수료",
      cta: "인재 추천 요청",
      badge: "신규 출시",
      accent: "#2dd4bf",
      qa: "service-scout",
      delay: 0.2,
    },
  ];

  const heroExperts = EXPERTS.slice(0, 3);

  return (
    <div className="min-h-screen" style={{ background: "#060d18" }}>
      <ScrollProgressBar />
      <SocialProofToast />

      <AnimatePresence>
        {showBanner && <PromoBanner onDismiss={() => setShowBanner(false)} />}
      </AnimatePresence>

      <Nav scrolled={scrolled} />

      {/* ── HERO ── */}
      <section
        data-qa="hero-section"
        className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-16"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(79,70,229,0.18) 0%, transparent 70%)",
        }}
      >
        {/* Grid bg */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{ background: "rgba(79,70,229,0.15)", border: "1px solid rgba(79,70,229,0.3)", color: "#818cf8" }}
                data-qa="hero-eyebrow"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                대한민국 No.1 시니어 전문가 네트워크
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6"
                data-qa="hero-headline"
              >
                임원 출신 전문가의
                <br />
                경험을{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg,#c9a84c,#f59e0b)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  지금 바로
                </span>
                <br />
                빌려드립니다
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-white/55 text-lg leading-relaxed mb-8 max-w-lg"
                data-qa="hero-sub"
              >
                2,400명의 검증된 시니어 전문가와 850개 기업을 연결하는 플랫폼.
                평균 <strong className="text-white/80">2.3시간</strong> 내 전문가 매칭 보장.
              </motion.p>

              {/* Active users indicator — CRO */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 mb-8"
                data-qa="active-users"
              >
                <div className="flex -space-x-1.5">
                  {["#4f46e5", "#7c3aed", "#c9a84c"].map((c, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ borderColor: "#060d18", background: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/40">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  지금 <span className="text-white/70 font-semibold">43명</span>이 전문가를 검색 중
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-3"
                data-qa="hero-ctas"
              >
                <a
                  href="/post-project"
                  data-qa="hero-cta-primary"
                  className="relative inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-base font-bold text-white transition-all duration-200 hover:scale-[1.03] hover:opacity-95 shadow-lg group"
                  style={{ background: "linear-gradient(135deg,#4f46e5,#6d28d9)" }}
                >
                  <motion.span
                    className="absolute inset-0 rounded-xl"
                    animate={{ boxShadow: ["0 0 0 0 rgba(79,70,229,0.4)", "0 0 0 12px rgba(79,70,229,0)", "0 0 0 0 rgba(79,70,229,0)"] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                  프로젝트 의뢰하기
                  <svg className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <a
                  href="/marketplace"
                  data-qa="hero-cta-secondary"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-base font-semibold text-white/70 hover:text-white transition-all duration-200 hover:bg-white/[0.06]"
                  style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  전문가 둘러보기
                </a>
              </motion.div>
            </div>

            {/* Right — floating expert cards */}
            <div className="hidden lg:block relative h-96">
              {heroExperts.map((expert, i) => {
                const offsets = [
                  { x: 0, y: -20, rotate: -3 },
                  { x: 80, y: 60, rotate: 2 },
                  { x: -30, y: 120, rotate: -1 },
                ];
                return (
                  <HeroExpertCard
                    key={expert.id}
                    expert={expert}
                    delay={0.4 + i * 0.15}
                    offset={offsets[i] ?? { x: 0, y: 0, rotate: 0 }}
                  />
                );
              })}
              {/* Glow */}
              <div
                className="absolute inset-0 -z-10 rounded-full blur-[80px] opacity-20"
                style={{ background: "radial-gradient(circle, #4f46e5, transparent)" }}
              />
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <TrustBar />
      </section>

      {/* ── STATS ── */}
      <StatsSection />

      {/* ── SERVICES ── */}
      <section className="py-24 px-4" data-qa="services-section">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="서비스"
            title="필요한 방식으로 연결합니다"
            sub="빠른 원포인트 자문부터 장기 프로젝트, 인재추천까지 — 기업의 모든 전문가 수요를 해결합니다."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <ServiceCard key={s.qa} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        className="py-24 px-4"
        style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        data-qa="how-it-works"
      >
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            eyebrow="이용 방법"
            title="3단계, 2.3시간이면 충분합니다"
          />
          <div className="grid md:grid-cols-3 gap-8 relative">
            {[
              { num: "01", title: "요청서 작성", desc: "3분 안에 프로젝트 개요와 필요 역량을 입력합니다. AI가 즉시 분석을 시작합니다.", icon: "📝", qa: "step-1" },
              { num: "02", title: "AI 매칭", desc: "산업·경력·가용성을 기반으로 최적의 전문가 상위 3명을 추천합니다.", icon: "🤖", qa: "step-2" },
              { num: "03", title: "바로 시작", desc: "계약부터 화상 미팅 예약, 정산까지 플랫폼 내에서 원스톱 처리됩니다.", icon: "✅", qa: "step-3" },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                data-qa={step.qa}
                className="relative text-center"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                  style={{ background: "rgba(79,70,229,0.12)", border: "1px solid rgba(79,70,229,0.25)" }}
                >
                  {step.icon}
                </div>
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black font-mono"
                  style={{ color: "rgba(201,168,76,0.5)" }}
                >
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>

                {i < 2 && (
                  <div
                    className="hidden md:block absolute top-7 left-[calc(100%-16px)] w-8 h-px"
                    style={{ background: "linear-gradient(90deg,rgba(79,70,229,0.4),transparent)" }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXPERT SHOWCASE ── */}
      <section className="py-24 px-4" data-qa="expert-showcase">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="전문가 풀"
            title="이런 분들이 기다립니다"
            sub="각 산업 최전선에서 수십 년을 보낸 임원 출신 전문가들이 지금 바로 연결 가능합니다."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {EXPERTS.slice(0, 3).map((expert, i) => (
              <ExpertShowcaseCard key={expert.id} expert={expert} delay={i * 0.1} />
            ))}
          </div>
          <div className="text-center">
            <a
              href="/marketplace"
              data-qa="showcase-see-all"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white/70 hover:text-white transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}
            >
              전체 전문가 보기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── CASE STUDIES ── */}
      <section
        className="py-24 px-4"
        style={{ background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.05)" }}
        data-qa="case-studies"
      >
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="성공 사례"
            title="실제 결과로 증명합니다"
          />
          <div className="grid md:grid-cols-3 gap-5">
            <CaseStudyCard
              company="STX조선해양"
              tag="조선·해양"
              metric="수주 성사"
              metricLabel="48시간 내 전문가 연결"
              desc="카타르 에너지사와의 LNG 선박 수주 협상에서 전문가 자문 1건으로 핵심 리스크를 제거하고 계약을 성사시켰습니다."
              duration="2주 프로젝트"
              delay={0}
            />
            <CaseStudyCard
              company="메디컬AI 스타트업"
              tag="헬스케어·AI"
              metric="80억 유치"
              metricLabel="Series A 투자 유치"
              desc="3주간의 IR 코칭으로 글로벌 VC 피칭 전략을 재설계했습니다. 피칭 후 2주 만에 투자 계약을 마무리했습니다."
              duration="3주 자문"
              delay={0.1}
            />
            <CaseStudyCard
              company="한화솔루션 중국법인"
              tag="제조·에너지"
              metric="3개월 절감"
              metricLabel="현지 규제 리스크 사전 차단"
              desc="중국 JV 설립 과정의 규제 리스크를 원포인트 자문 2회로 사전 파악했습니다. 설립 기간을 3개월 단축했습니다."
              duration="원포인트 × 2"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-4" data-qa="testimonials">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="고객 후기"
            title="직접 사용한 담당자들의 이야기"
          />
          <div className="grid md:grid-cols-3 gap-5">
            <TestimonialCard
              quote="기존 컨설팅 펌 대비 비용은 68% 절감됐는데 속도와 전문성은 오히려 더 높았습니다. 48시간 내 연결이 된다는 게 믿기지 않았습니다."
              author="이상훈"
              role="사업개발 부장"
              company="STX조선해양"
              delay={0}
            />
            <TestimonialCard
              quote="FDA 허가 전략을 하루 만에 방향을 잡을 수 있었습니다. 실제 규제 현장 경험이 있는 분과 직접 대화하는 게 이렇게 다를 줄 몰랐습니다."
              author="박지현"
              role="대표이사"
              company="메디컬AI 스타트업"
              delay={0.1}
            />
            <TestimonialCard
              quote="Series B 투자 IR 전에 전직 IB본부장에게 피칭 코칭을 받았습니다. 실제 투자자 시각의 피드백이 결정적이었습니다."
              author="김태민"
              role="CEO"
              company="핀테크 스타트업"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section
        className="py-24 px-4"
        style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)" }}
        data-qa="pricing"
      >
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            eyebrow="요금제"
            title="투명한 가격 구조"
            sub="숨겨진 비용 없이 필요한 만큼만 사용하세요."
          />
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: "무료 탐색",
                price: "₩0",
                period: "영구 무료",
                features: ["전문가 프로필 열람", "AI 매칭 미리보기", "프로젝트 접수"],
                cta: "무료로 시작",
                highlight: false,
              },
              {
                name: "원포인트 자문",
                price: "₩30만~",
                period: "1~2시간",
                features: ["당일 예약 가능", "화상 미팅", "요약 보고서", "NDA 포함"],
                cta: "예약하기",
                highlight: true,
              },
              {
                name: "프로젝트 자문",
                price: "10%",
                period: "성공 수수료",
                features: ["AI 매칭", "계약 관리", "정산 처리", "고객 지원"],
                cta: "프로젝트 올리기",
                highlight: false,
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.1 }}
                data-qa={`pricing-${plan.name.replace(/\s/g, "-")}`}
                className="rounded-2xl p-6 flex flex-col gap-4"
                style={{
                  background: plan.highlight ? "rgba(79,70,229,0.1)" : "rgba(255,255,255,0.025)",
                  border: plan.highlight ? "1px solid rgba(79,70,229,0.4)" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {plan.highlight && (
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full w-fit"
                    style={{ background: "rgba(79,70,229,0.2)", color: "#818cf8" }}
                  >
                    가장 인기
                  </span>
                )}
                <div>
                  <div className="text-sm font-semibold text-white/60 mb-1">{plan.name}</div>
                  <div className="text-3xl font-black text-white">{plan.price}</div>
                  <div className="text-xs text-white/30 mt-0.5">{plan.period}</div>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                      <span style={{ color: "#2dd4bf" }} className="text-xs flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="/post-project"
                  data-qa={`pricing-cta-${i}`}
                  className="block text-center py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={
                    plan.highlight
                      ? { background: "#4f46e5", color: "#fff" }
                      : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }
                  }
                >
                  {plan.cta}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section
        data-qa="final-cta"
        className="py-24 px-4 text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(79,70,229,0.15) 0%, rgba(109,40,217,0.1) 50%, rgba(6,13,24,0) 100%)",
          borderTop: "1px solid rgba(79,70,229,0.15)",
        }}
      >
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 50%, #4f46e5 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "#c9a84c" }}
            >
              🎁 첫 매칭 수수료 면제 — 2026.06.30까지
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-white/50 text-lg mb-10">
              3분이면 충분합니다. 오늘 프로젝트를 올리면
              <br className="hidden md:block" /> 내일 전문가가 연락드립니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/post-project"
                data-qa="final-cta-primary"
                className="relative inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-bold text-white shadow-xl transition-all duration-200 hover:scale-[1.03]"
                style={{ background: "linear-gradient(135deg,#4f46e5,#6d28d9)" }}
              >
                <motion.span
                  className="absolute inset-0 rounded-xl"
                  animate={{ boxShadow: ["0 0 0 0 rgba(79,70,229,0.5)", "0 0 0 16px rgba(79,70,229,0)", "0 0 0 0 rgba(79,70,229,0)"] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
                무료로 프로젝트 올리기
              </a>
              <a
                href="/marketplace"
                data-qa="final-cta-secondary"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-semibold text-white/70 hover:text-white transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)" }}
              >
                전문가로 등록하기
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        data-qa="footer"
        className="border-t py-12 px-4"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "#040a12" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="text-xl font-black text-white mb-2">
                VE<span style={{ color: "#c9a84c" }}>LOR</span>
              </div>
              <p className="text-xs text-white/30 leading-relaxed">
                대한민국 시니어 전문가 네트워크.<br />
                임원 출신 경험을 필요한 순간에.
              </p>
            </div>
            {[
              { title: "서비스", links: ["전문가 찾기", "프로젝트 올리기", "원포인트 자문", "인재추천"] },
              { title: "전문가", links: ["전문가 등록", "대시보드", "수익 구조", "FAQ"] },
              { title: "회사", links: ["소개", "블로그", "채용", "문의"] },
            ].map((col) => (
              <div key={col.title}>
                <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">{col.title}</div>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div
            className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <p className="text-xs text-white/20">© 2026 VELOR Inc. All rights reserved.</p>
            <div className="flex gap-4 text-xs text-white/20">
              {["이용약관", "개인정보처리방침", "사업자정보"].map((l) => (
                <a key={l} href="#" className="hover:text-white/40 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
