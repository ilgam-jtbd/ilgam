"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EXPERTS } from "@/lib/data";
import { INDUSTRY_LABELS, EXPERTISE_LABELS } from "@/lib/types";
import type { Expert } from "@/lib/types";

// ─── Nav ────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] backdrop-blur-md"
      style={{ backgroundColor: "rgba(6,13,24,0.9)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <a href="/" className="font-bold text-xl tracking-tight text-white">
          VE<span style={{ color: "#c9a84c" }}>LOR</span>
        </a>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <a
            href="/marketplace"
            className="px-3 py-1.5 rounded-lg font-semibold text-white"
            style={{ backgroundColor: "#4f46e5" }}
          >
            전문가 찾기
          </a>
          <a
            href="/post-project"
            className="px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            프로젝트 올리기
          </a>
          <a
            href="/login"
            className="ml-2 px-4 py-1.5 rounded-lg border border-white/[0.12] text-white/70 hover:border-white/30 hover:text-white transition-colors"
          >
            로그인
          </a>
        </nav>
      </div>
    </header>
  );
}

// ─── Badge accent config ─────────────────────────────────────────────────────

const BADGE_CONFIG = {
  TOP:      { borderColor: "#c9a84c", bg: "#c9a84c",  text: "#060d18",  label: "TOP"    },
  VERIFIED: { borderColor: "#2dd4bf", bg: "#2dd4bf",  text: "#060d18",  label: "검증됨" },
  NEW:      { borderColor: "#4f46e5", bg: "#4f46e5",  text: "#ffffff",  label: "NEW"    },
} as const;

// ─── Expert Card ─────────────────────────────────────────────────────────────

function ExpertCard({ expert }: { expert: Expert }) {
  const cfg = expert.badge ? BADGE_CONFIG[expert.badge] : null;
  const initials = expert.avatar.slice(0, 2);
  const shownSkills = expert.skills.slice(0, 3);
  const extraSkills = expert.skills.length - 3;
  const stars = Math.round(expert.rating);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22 }}
      className="flex flex-col overflow-hidden rounded-2xl transition-all duration-200 group"
      style={{
        backgroundColor: "rgba(255,255,255,0.04)",
        border: `1px solid rgba(255,255,255,0.08)`,
        borderLeft: cfg ? `4px solid ${cfg.borderColor}` : "4px solid rgba(255,255,255,0.08)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = cfg
          ? `0 0 24px ${cfg.borderColor}30, 0 4px 12px rgba(0,0,0,0.4)`
          : "0 0 24px rgba(79,70,229,0.2), 0 4px 12px rgba(0,0,0,0.4)";
        (e.currentTarget as HTMLDivElement).style.borderColor = cfg ? `${cfg.borderColor}60` : "rgba(79,70,229,0.3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-base select-none"
              style={{ backgroundColor: "#4f46e5" }}
            >
              {initials}
            </div>
            {cfg && (
              <span
                className="absolute -bottom-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                style={{ backgroundColor: cfg.bg, color: cfg.text }}
              >
                {cfg.label}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white text-[15px] leading-tight">{expert.name}</p>
            <p className="text-xs text-white/50 mt-0.5 leading-snug line-clamp-2">{expert.title}</p>
            <p className="text-xs mt-0.5" style={{ color: "#c9a84c" }}>{expert.company}</p>
          </div>
        </div>

        {/* YouTube badge */}
        {expert.youtube && (
          <div
            className="inline-flex items-center gap-1.5 self-start px-2 py-1 rounded-full text-[11px] font-semibold"
            style={{ backgroundColor: "rgba(45,212,191,0.12)", color: "#2dd4bf", border: "1px solid rgba(45,212,191,0.2)" }}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
            </svg>
            유튜브 {expert.youtube.subscribers}명
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <span className="text-amber-400 text-sm tracking-tighter">
            {"★".repeat(stars)}{"☆".repeat(5 - stars)}
          </span>
          <span className="text-sm font-semibold text-white">{expert.rating}</span>
          <span className="text-xs text-white/40">({expert.reviewCount}건)</span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5">
          {shownSkills.map((skill) => (
            <span
              key={skill}
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: "rgba(79,70,229,0.15)",
                color: "#a5b4fc",
                border: "1px solid rgba(79,70,229,0.25)",
              }}
            >
              {skill}
            </span>
          ))}
          {extraSkills > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white/40"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
              +{extraSkills}
            </span>
          )}
        </div>

        {/* Experience */}
        <div className="text-xs text-white/40">
          <span className="font-mono font-medium text-white/80 text-sm">{expert.yearsExp}년</span>
          {" "}경력
          <span className="ml-3">응답 ~{expert.responseTime}</span>
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-5 py-3.5 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.02)" }}
      >
        <div>
          <span className="text-[13px] font-semibold" style={{ color: "#c9a84c" }}>
            {expert.hourlyRate}만원
          </span>
          <span className="text-xs text-white/40 ml-1">/시간</span>
          {expert.available ? (
            <span
              className="ml-2 text-[11px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: "rgba(45,212,191,0.12)", color: "#2dd4bf", border: "1px solid rgba(45,212,191,0.2)" }}
            >
              지금 가능
            </span>
          ) : (
            <span className="ml-2 text-[11px] font-medium px-1.5 py-0.5 rounded-full text-white/40"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
              {expert.availableFrom ? `${expert.availableFrom}~` : "협의"}
            </span>
          )}
        </div>
        <button
          className="text-xs font-semibold px-3.5 py-1.5 rounded-lg text-white transition-all duration-150 hover:opacity-90 active:scale-95"
          style={{ backgroundColor: "#4f46e5" }}
        >
          자문 요청
        </button>
      </div>
    </motion.div>
  );
}

// ─── Sort types ───────────────────────────────────────────────────────────────

type SortKey = "추천순" | "평점순" | "경력순" | "가격순";

const SORT_OPTIONS: SortKey[] = ["추천순", "평점순", "경력순", "가격순"];

function sortExperts(experts: Expert[], key: SortKey): Expert[] {
  const copy = [...experts];
  if (key === "평점순") return copy.sort((a, b) => b.rating - a.rating);
  if (key === "경력순") return copy.sort((a, b) => b.yearsExp - a.yearsExp);
  if (key === "가격순") return copy.sort((a, b) => a.hourlyRate - b.hourlyRate);
  // 추천순: TOP > VERIFIED > NEW > rest, then by rating
  const rank = { TOP: 0, VERIFIED: 1, NEW: 2, undefined: 3 } as Record<string, number>;
  return copy.sort((a, b) => {
    const ra = rank[a.badge ?? "undefined"] ?? 3;
    const rb = rank[b.badge ?? "undefined"] ?? 3;
    return ra !== rb ? ra - rb : b.rating - a.rating;
  });
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  search: string;
  onSearch: (v: string) => void;
  selectedIndustries: string[];
  onToggleIndustry: (k: string) => void;
  selectedExpertise: string[];
  onToggleExpertise: (k: string) => void;
  availableOnly: boolean;
  onAvailableOnly: (v: boolean) => void;
  priceMax: number;
  onPriceMax: (v: number) => void;
  onReset: () => void;
}

function Sidebar({
  search, onSearch,
  selectedIndustries, onToggleIndustry,
  selectedExpertise, onToggleExpertise,
  availableOnly, onAvailableOnly,
  priceMax, onPriceMax,
  onReset,
}: SidebarProps) {
  return (
    <aside className="w-full space-y-4">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none">
          🔍
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="전문가 이름, 기술, 직함 검색"
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 placeholder:text-white/30 transition text-white"
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.borderColor = "rgba(79,70,229,0.5)";
            (e.target as HTMLInputElement).style.boxShadow = "0 0 0 2px rgba(79,70,229,0.2)";
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)";
            (e.target as HTMLInputElement).style.boxShadow = "none";
          }}
        />
      </div>

      {/* Industry filter */}
      <FilterSection title="산업 분야">
        {Object.entries(INDUSTRY_LABELS).map(([key, label]) => (
          <CheckRow
            key={key}
            label={label}
            checked={selectedIndustries.includes(key)}
            onChange={() => onToggleIndustry(key)}
          />
        ))}
      </FilterSection>

      {/* Expertise filter */}
      <FilterSection title="전문 분야">
        {Object.entries(EXPERTISE_LABELS).map(([key, label]) => (
          <CheckRow
            key={key}
            label={label}
            checked={selectedExpertise.includes(key)}
            onChange={() => onToggleExpertise(key)}
          />
        ))}
      </FilterSection>

      {/* Availability toggle */}
      <FilterSection title="가용 여부">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <button
            role="switch"
            aria-checked={availableOnly}
            onClick={() => onAvailableOnly(!availableOnly)}
            className="relative rounded-full transition-colors duration-200 focus:outline-none"
            style={{
              width: "40px",
              height: "22px",
              backgroundColor: availableOnly ? "#4f46e5" : "rgba(255,255,255,0.1)",
            }}
          >
            <span
              className="absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200"
              style={{ transform: availableOnly ? "translateX(20px)" : "translateX(2px)" }}
            />
          </button>
          <span className="text-sm text-white/70">지금 가능한 전문가만</span>
        </label>
      </FilterSection>

      {/* Price range slider */}
      <FilterSection title="프로젝트 예산 (만원)">
        <div className="space-y-2">
          <input
            type="range"
            min={50}
            max={500}
            step={10}
            value={priceMax}
            onChange={(e) => onPriceMax(Number(e.target.value))}
            className="w-full h-1.5 cursor-pointer"
            style={{ accentColor: "#4f46e5" }}
          />
          <div className="flex justify-between text-xs text-white/40">
            <span>50만원</span>
            <span className="font-semibold" style={{ color: "#c9a84c" }}>{priceMax}만원</span>
            <span>500만원</span>
          </div>
        </div>
      </FilterSection>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full py-2 text-sm rounded-xl text-white/50 hover:text-white/80 transition-colors"
        style={{ border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.02)" }}
      >
        필터 초기화
      </button>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-4 space-y-2"
      style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">{title}</p>
      {children}
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-3.5 h-3.5 rounded cursor-pointer"
        style={{ accentColor: "#4f46e5" }}
      />
      <span
        className={`text-sm transition-colors ${
          checked ? "font-medium" : "text-white/50 group-hover:text-white/80"
        }`}
        style={checked ? { color: "#a5b4fc" } : undefined}
      >
        {label}
      </span>
    </label>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 6;

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [priceMax, setPriceMax] = useState(500);
  const [sortKey, setSortKey] = useState<SortKey>("추천순");
  const [page, setPage] = useState(1);

  function toggleIndustry(k: string) {
    setSelectedIndustries((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );
    setPage(1);
  }
  function toggleExpertise(k: string) {
    setSelectedExpertise((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );
    setPage(1);
  }
  function resetFilters() {
    setSearch("");
    setSelectedIndustries([]);
    setSelectedExpertise([]);
    setAvailableOnly(false);
    setPriceMax(500);
    setSortKey("추천순");
    setPage(1);
  }

  const filtered = useMemo(() => {
    let list = EXPERTS;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.name.includes(q) ||
          e.title.toLowerCase().includes(q) ||
          e.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (selectedIndustries.length) {
      list = list.filter((e) =>
        e.industries.some((ind) => selectedIndustries.includes(ind))
      );
    }
    if (availableOnly) {
      list = list.filter((e) => e.available);
    }
    if (priceMax < 500) {
      // hourlyRate is per hour in 만원; treat project budget as hourlyRate * ~10h estimate
      list = list.filter((e) => e.hourlyRate <= priceMax / 10);
    }

    return sortExperts(list, sortKey);
  }, [search, selectedIndustries, availableOnly, priceMax, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageExperts = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#060d18" }}>
      <Nav />

      {/* Page header — dark gradient */}
      <div style={{ background: "linear-gradient(135deg, #060d18 0%, #0d1b2a 40%, #0f0c29 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Premium label */}
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: "rgba(201,168,76,0.12)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)" }}>
            <span>✦</span> 검증된 C-레벨 시니어 전문가 네트워크
          </div>
          <h1 className="text-3xl font-black text-white mb-3">
            검증된 전문가를{" "}
            <span style={{ color: "#c9a84c" }}>찾으세요</span>
          </h1>
          <p className="text-white/50 text-sm max-w-xl">
            평균 경력 24년, 검증된 C-레벨 시니어 전문가와 바로 연결됩니다. 평균 응답 시간 2.3시간.
          </p>

          {/* Hero search bar */}
          <div className="mt-6 relative max-w-xl">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="직함, 기술, 산업으로 검색..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none transition"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "rgba(79,70,229,0.6)";
                (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(79,70,229,0.15)";
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.12)";
                (e.target as HTMLInputElement).style.boxShadow = "none";
              }}
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6 items-start">
          {/* Sidebar — 1/4 */}
          <div className="hidden lg:block w-64 shrink-0 sticky top-20">
            <Sidebar
              search={search}
              onSearch={(v) => { setSearch(v); setPage(1); }}
              selectedIndustries={selectedIndustries}
              onToggleIndustry={toggleIndustry}
              selectedExpertise={selectedExpertise}
              onToggleExpertise={toggleExpertise}
              availableOnly={availableOnly}
              onAvailableOnly={(v) => { setAvailableOnly(v); setPage(1); }}
              priceMax={priceMax}
              onPriceMax={(v) => { setPriceMax(v); setPage(1); }}
              onReset={resetFilters}
            />
          </div>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Sort bar — dark glass pills */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <p className="text-sm text-white/50">
                전체{" "}
                <span className="font-semibold text-white">{filtered.length}명</span>
              </p>
              <div className="flex items-center gap-1.5">
                {SORT_OPTIONS.map((k) => (
                  <button
                    key={k}
                    onClick={() => { setSortKey(k); setPage(1); }}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                    style={
                      sortKey === k
                        ? { backgroundColor: "#4f46e5", color: "#fff" }
                        : {
                            backgroundColor: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.6)",
                          }
                    }
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {pageExperts.length > 0 ? (
                  pageExperts.map((expert) => (
                    <ExpertCard key={expert.id} expert={expert} />
                  ))
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-16 text-center text-white/30"
                  >
                    <p className="text-4xl mb-3">🔍</p>
                    <p className="text-base font-medium">검색 결과가 없습니다</p>
                    <p className="text-sm mt-1">필터를 조정해보세요</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  이전
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className="w-8 h-8 text-sm rounded-lg font-medium transition-colors"
                    style={
                      n === currentPage
                        ? { backgroundColor: "#4f46e5", color: "#fff" }
                        : {
                            backgroundColor: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.5)",
                          }
                    }
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  다음
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
