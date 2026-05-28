"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EXPERTS } from "@/lib/data";
import type { Expert } from "@/lib/types";

// ─── Nav ─────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-white/[0.06] backdrop-blur-md"
      style={{ backgroundColor: "rgba(6,13,24,0.9)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <a href="/" className="font-bold text-xl tracking-tight text-white">
          VE<span style={{ color: "#c9a84c" }}>LOR</span>
        </a>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <a
            href="/marketplace"
            className="px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            전문가 찾기
          </a>
          <a
            href="/post-project"
            className="px-3 py-1.5 rounded-lg font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#4f46e5" }}
          >
            프로젝트 올리기
          </a>
        </nav>
      </div>
    </header>
  );
}

// ─── YouTube Card ─────────────────────────────────────────────────────────────
function YouTubeCard({ expert }: { expert: Expert }) {
  if (!expert.youtube) return null;
  const yt = expert.youtube;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.07)] overflow-hidden"
    >
      {/* Thumbnail placeholder */}
      <div
        className="relative h-44 flex items-center justify-center"
        style={{ backgroundColor: yt.thumbnailColor }}
      >
        {/* Play button */}
        <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        {/* Latest video title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white text-xs font-medium line-clamp-2">{yt.latestVideo}</p>
        </div>
        {/* YouTube badge */}
        <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
          </svg>
          YouTube
        </div>
      </div>

      {/* Channel info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">{yt.channelName}</h4>
            <p className="text-slate-500 text-xs mt-0.5">구독자 {yt.subscribers} · 영상 {yt.videoCount}개</p>
          </div>
          <a
            href={yt.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
            </svg>
            구독하기
          </a>
        </div>
        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 line-clamp-2">
          최신 영상: {yt.latestVideo}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400 tracking-tight">
      {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
    </span>
  );
}

// ─── Expert Profile Page ──────────────────────────────────────────────────────
export default function ExpertProfilePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "reviews" | "portfolio">("overview");
  const [selectedExpert, setSelectedExpert] = useState<Expert>(EXPERTS[0]!);

  const TABS = [
    { key: "overview", label: "프로필" },
    { key: "reviews", label: `리뷰 (${selectedExpert.reviewCount})` },
    { key: "portfolio", label: "포트폴리오" },
  ] as const;

  const MOCK_REVIEWS = [
    {
      id: 1,
      company: "STX조선해양",
      reviewer: "김민수 상무",
      rating: 5,
      date: "2026-05-10",
      text: "선박 수주 협상에서 실제 현장 경험을 바탕으로 핵심 포인트를 짚어주셔서 큰 도움이 됐습니다. 단 하루의 자문으로 협상 전략이 완전히 달라졌습니다.",
      project: "중동 LNG 선박 수주 협상 자문",
    },
    {
      id: 2,
      company: "한화오션",
      reviewer: "이정훈 이사",
      rating: 5,
      date: "2026-04-22",
      text: "32년 경험에서 나오는 통찰이 교과서와는 차원이 달랐습니다. 특히 선주사 관계 관리 부분에서 실전 조언이 매우 유용했습니다.",
      project: "유럽 선주사 관계 전략 수립",
    },
    {
      id: 3,
      company: "삼성중공업",
      reviewer: "박지훈 부장",
      rating: 5,
      date: "2026-03-15",
      text: "EPC 계약 검토에서 우리 팀이 놓친 리스크 3가지를 짚어주셨습니다. 그 덕분에 계약 협상에서 유리한 조건을 얻을 수 있었습니다.",
      project: "EPC 계약 리스크 검토",
    },
  ];

  const PORTFOLIO = [
    { title: "카타르 에너지 LNG선 20척 수주 협상", year: "2024", value: "12억 달러", outcome: "계약 성사" },
    { title: "유럽 선주사 EPC 계약 리스크 자문", year: "2023", value: "3.2억 달러", outcome: "리스크 3건 제거" },
    { title: "사우디 아람코 해양 플랜트 입찰", year: "2023", value: "8억 달러", outcome: "1위 협상 마감" },
    { title: "그리스 선주사 벌크선 프레임워크 협약", year: "2022", value: "5억 달러", outcome: "5년 장기계약 체결" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Expert selector (for demo) */}
        <div className="mb-6 flex flex-wrap gap-2">
          {EXPERTS.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelectedExpert(e)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedExpert.id === e.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
              }`}
            >
              {e.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── LEFT: Profile card + YouTube + Request ── */}
          <div className="space-y-4">
            {/* Profile Card */}
            <motion.div
              key={selectedExpert.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.07)] p-6"
            >
              {/* Avatar */}
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold mb-3">
                  {selectedExpert.avatar.slice(0, 2)}
                </div>
                {selectedExpert.badge && (
                  <span className={`mb-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedExpert.badge === "TOP" ? "bg-indigo-100 text-indigo-700" :
                    selectedExpert.badge === "VERIFIED" ? "bg-emerald-100 text-emerald-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {selectedExpert.badge === "TOP" ? "🏆 TOP 전문가" :
                     selectedExpert.badge === "VERIFIED" ? "✓ 검증됨" : "NEW"}
                  </span>
                )}
                <h2 className="text-xl font-bold text-slate-900">{selectedExpert.name}</h2>
                <p className="text-sm text-slate-600 mt-1">{selectedExpert.title}</p>
                <p className="text-xs text-indigo-600 font-medium mt-0.5">{selectedExpert.company}</p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-y border-slate-100">
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900">{selectedExpert.yearsExp}년</div>
                  <div className="text-[10px] text-slate-500 font-mono">경력</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900">{selectedExpert.rating}</div>
                  <div className="text-[10px] text-slate-500 font-mono">평점</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900">{selectedExpert.completedProjects}</div>
                  <div className="text-[10px] text-slate-500 font-mono">완료</div>
                </div>
              </div>

              {/* Rate */}
              <div className="flex items-center justify-between mb-4 bg-amber-50 rounded-xl px-4 py-3">
                <span className="text-xs text-slate-500">시간당</span>
                <span className="text-lg font-bold text-amber-700">₩{selectedExpert.hourlyRate}만</span>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-2 h-2 rounded-full ${selectedExpert.available ? "bg-emerald-500" : "bg-slate-300"}`} />
                <span className="text-sm text-slate-600">
                  {selectedExpert.available ? "즉시 가능" : `${selectedExpert.availableFrom} 이후 가능`}
                </span>
                <span className="ml-auto text-xs text-slate-400">응답 {selectedExpert.responseTime}</span>
              </div>

              {/* Location */}
              <div className="text-xs text-slate-500 mb-5 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {selectedExpert.location}
              </div>

              {/* CTA */}
              <button className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors mb-2">
                자문 요청하기
              </button>
              <button className="w-full border border-slate-200 text-slate-600 font-medium py-3 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-colors text-sm">
                메시지 보내기
              </button>
            </motion.div>

            {/* YouTube Card */}
            <YouTubeCard expert={selectedExpert} />

            {/* Skills */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.07)] p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">전문 스킬</h3>
              <div className="flex flex-wrap gap-2">
                {selectedExpert.skills.map((s) => (
                  <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Tabs content ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tab bar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.07)] p-1 flex gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                    activeTab === tab.key
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Bio */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.07)] p-6">
                  <h3 className="font-semibold text-slate-900 mb-3">자기소개</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{selectedExpert.bio}</p>
                </div>

                {/* Industries */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.07)] p-6">
                  <h3 className="font-semibold text-slate-900 mb-3">주요 산업</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExpert.industries.map((ind) => (
                      <span key={ind} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg font-medium">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>

                {/* YouTube insights if available */}
                {selectedExpert.youtube && (
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                      </svg>
                      <h3 className="font-semibold text-slate-900">YouTube 전문가 채널</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-white rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-red-600">{selectedExpert.youtube.subscribers}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">구독자</div>
                      </div>
                      <div className="bg-white rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-slate-900">{selectedExpert.youtube.videoCount}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">영상</div>
                      </div>
                      <div className="bg-white rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-indigo-600">전문가</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">검증됨</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mb-3">
                      {selectedExpert.name} 전문가는 YouTube를 통해 전문 지식을 공유하고 있습니다.
                      채널을 통해 전문성과 커뮤니케이션 스타일을 미리 확인하세요.
                    </p>
                    <a
                      href={selectedExpert.youtube.channelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-red-600 font-semibold hover:text-red-700"
                    >
                      채널 방문하기 →
                    </a>
                  </div>
                )}
              </motion.div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === "reviews" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Rating summary */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.07)] p-6">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-slate-900">{selectedExpert.rating}</div>
                      <Stars rating={selectedExpert.rating} />
                      <div className="text-xs text-slate-500 mt-1">{selectedExpert.reviewCount}건</div>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const pct = star === 5 ? 88 : star === 4 ? 10 : star === 3 ? 2 : 0;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 w-4">{star}</span>
                            <span className="text-amber-400 text-xs">★</span>
                            <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                              <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-slate-400 w-8">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Review cards */}
                {MOCK_REVIEWS.map((r) => (
                  <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.07)] p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{r.reviewer}</div>
                        <div className="text-xs text-slate-500">{r.company} · {r.project}</div>
                      </div>
                      <div className="text-right">
                        <Stars rating={r.rating} />
                        <div className="text-xs text-slate-400 mt-0.5">{r.date}</div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                  </div>
                ))}
              </motion.div>
            )}

            {/* PORTFOLIO TAB */}
            {activeTab === "portfolio" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {PORTFOLIO.map((p, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.07)] p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <span className="text-indigo-600 font-bold text-sm">{String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">{p.title}</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg font-mono">{p.year}</span>
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs rounded-lg font-semibold">{p.value}</span>
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-lg font-medium">✓ {p.outcome}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
