"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EXPERTS } from "@/lib/data";
import { INDUSTRY_LABELS, EXPERTISE_LABELS } from "@/lib/types";
import type { Expert } from "@/lib/types";

// ─── Nav ────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <a href="/" className="font-bold text-xl tracking-tight text-indigo-600">
          ILGAM
        </a>
        <nav className="flex items-center gap-1 text-sm font-medium text-slate-600">
          <a
            href="/marketplace"
            className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold"
          >
            전문가 찾기
          </a>
          <a
            href="/post-project"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            프로젝트 올리기
          </a>
          <a
            href="/login"
            className="ml-2 px-4 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
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
  TOP:      { border: "border-l-indigo-500",  bg: "bg-indigo-600",  text: "text-white",        label: "TOP"      },
  VERIFIED: { border: "border-l-emerald-500", bg: "bg-emerald-500", text: "text-white",         label: "검증됨"   },
  NEW:      { border: "border-l-blue-400",    bg: "bg-blue-500",    text: "text-white",         label: "NEW"      },
} as const;

// ─── Expert Card ─────────────────────────────────────────────────────────────

function ExpertCard({ expert }: { expert: Expert }) {
  const cfg = expert.badge ? BADGE_CONFIG[expert.badge] : null;
  const initials = expert.avatar
    .split("")
    .slice(0, 2)
    .join("");

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
      className={`bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.07)] border border-slate-100 border-l-4 ${
        cfg ? cfg.border : "border-l-slate-200"
      } flex flex-col overflow-hidden hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow duration-200`}
    >
      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-base select-none">
              {initials}
            </div>
            {cfg && (
              <span
                className={`absolute -bottom-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text} leading-none`}
              >
                {cfg.label}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900 text-[15px] leading-tight">{expert.name}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">{expert.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{expert.company}</p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <span className="text-amber-400 text-sm tracking-tighter">
            {"★".repeat(stars)}{"☆".repeat(5 - stars)}
          </span>
          <span className="text-sm font-semibold text-slate-800">{expert.rating}</span>
          <span className="text-xs text-slate-400">({expert.reviewCount}건)</span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5">
          {shownSkills.map((skill) => (
            <span
              key={skill}
              className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium border border-indigo-100"
            >
              {skill}
            </span>
          ))}
          {extraSkills > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
              +{extraSkills}
            </span>
          )}
        </div>

        {/* Experience */}
        <div className="text-xs text-slate-500">
          <span className="font-mono font-medium text-slate-700 text-sm">{expert.yearsExp}년</span>
          {" "}경력
          <span className="ml-3 text-slate-400">응답 ~{expert.responseTime}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-slate-50 bg-slate-50/60 flex items-center justify-between">
        <div>
          <span className="text-[13px] font-semibold text-amber-600">
            {expert.hourlyRate}만원
          </span>
          <span className="text-xs text-slate-400 ml-1">/시간</span>
          {expert.available ? (
            <span className="ml-2 text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              지금 가능
            </span>
          ) : (
            <span className="ml-2 text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
              {expert.availableFrom ? `${expert.availableFrom}~` : "협의"}
            </span>
          )}
        </div>
        <button className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all duration-150">
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
    <aside className="w-full space-y-6">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
          🔍
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="전문가 이름, 기술, 직함 검색"
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 placeholder:text-slate-400 transition"
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
            className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              availableOnly ? "bg-indigo-600" : "bg-slate-200"
            }`}
            style={{ height: "22px" }}
          >
            <span
              className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200 ${
                availableOnly ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className="text-sm text-slate-700">지금 가능한 전문가만</span>
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
            className="w-full h-1.5 accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>50만원</span>
            <span className="font-semibold text-indigo-600">{priceMax}만원</span>
            <span>500만원</span>
          </div>
        </div>
      </FilterSection>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full py-2 text-sm text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-700 transition-colors"
      >
        필터 초기화
      </button>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4 space-y-2">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{title}</p>
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
        className="w-3.5 h-3.5 rounded accent-indigo-600 cursor-pointer"
      />
      <span
        className={`text-sm transition-colors ${
          checked ? "text-indigo-700 font-medium" : "text-slate-600 group-hover:text-slate-900"
        }`}
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
    <div className="min-h-screen bg-slate-50">
      <Nav />

      {/* Page header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-slate-900">시니어 전문가 찾기</h1>
          <p className="text-slate-500 mt-1 text-sm">
            검증된 C-레벨 시니어 전문가와 바로 연결되세요. 평균 경력 24년, 응답 시간 2.3시간.
          </p>
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
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <p className="text-sm text-slate-600">
                전체{" "}
                <span className="font-semibold text-slate-900">{filtered.length}명</span>
              </p>
              <div className="flex items-center gap-1.5">
                {SORT_OPTIONS.map((k) => (
                  <button
                    key={k}
                    onClick={() => { setSortKey(k); setPage(1); }}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      sortKey === k
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                    }`}
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
                    className="col-span-full py-16 text-center text-slate-400"
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
                  className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  이전
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 text-sm rounded-lg font-medium transition-colors ${
                      n === currentPage
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
