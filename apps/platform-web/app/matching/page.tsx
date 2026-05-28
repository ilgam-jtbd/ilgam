"use client";

import { motion } from "framer-motion";
import { CheckCircle, ChevronRight, Shield } from "lucide-react";
import { EXPERTS } from "@/lib/data";
import type { Expert } from "@/lib/types";

const MATCHED_EXPERT_IDS = ["e1", "e2", "e4", "e6"];

const matchedExperts: Expert[] = MATCHED_EXPERT_IDS
  .map((id) => EXPERTS.find((e) => e.id === id))
  .filter((e): e is Expert => e !== undefined);

interface MatchDetails {
  score: number;
  reasons: string[];
  industryFit: number;
  skillMatch: number;
  availability: number;
}

const MATCH_DETAILS: Record<string, MatchDetails> = {
  e1: {
    score: 97,
    reasons: ["LNG 수주 경험 32년", "중동 선주사 협상 경험 보유", "현재 가용 상태"],
    industryFit: 99,
    skillMatch: 97,
    availability: 100,
  },
  e2: {
    score: 84,
    reasons: ["제품·기술 자문 18년 경력", "스타트업 BD 전략 전문", "현재 가용 상태"],
    industryFit: 76,
    skillMatch: 82,
    availability: 100,
  },
  e4: {
    score: 88,
    reasons: ["IB 본부장 출신 재무 전문", "선박 금융 딜 경험 다수", "현재 가용 상태"],
    industryFit: 83,
    skillMatch: 88,
    availability: 100,
  },
  e6: {
    score: 91,
    reasons: ["AI·기술전략 28년 경력", "대형 기술 협상 자문 경험", "현재 가용 상태"],
    industryFit: 87,
    skillMatch: 93,
    availability: 100,
  },
};

const RANK_LABELS: Record<number, string> = { 0: "#1", 1: "#2", 2: "#3", 3: "#4" };

const RANK_COLORS = [
  "bg-amber-400 text-white",
  "bg-slate-400 text-white",
  "bg-amber-700 text-white",
  "bg-slate-300 text-slate-700",
];

const AI_CRITERIA = [
  { label: "산업 경험", pct: 95 },
  { label: "기술 스택 일치", pct: 91 },
  { label: "프로젝트 유형 경험", pct: 88 },
  { label: "가용성", pct: 100 },
  { label: "평판 점수", pct: 97 },
];

function SkillBar({ label, pct, delay }: { label: string; pct: number; delay: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-slate-500 text-xs">{label}</span>
        <span className="text-slate-700 text-xs font-semibold">{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-indigo-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay }}
        />
      </div>
    </div>
  );
}

export default function MatchingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          >
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900">AI 매칭이 완료됐습니다</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">중동 LNG 선박 수주 협상 기술 자문</p>
          <p className="text-slate-400 text-sm mt-2">4명의 전문가를 추천합니다</p>
        </motion.div>

        <div className="grid grid-cols-3 gap-6">

          {/* Left: Expert Cards */}
          <div className="col-span-2 space-y-4">
            {matchedExperts.map((expert, i) => {
              const details = MATCH_DETAILS[expert.id] as MatchDetails;
              return (
                <motion.div
                  key={expert.id}
                  className="rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.07)] bg-white p-5"
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.2 + i * 0.1 }}
                >
                  <div className="flex gap-4">
                    {/* Rank + Avatar */}
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${RANK_COLORS[i]}`}>
                        {RANK_LABELS[i]}
                      </span>
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-700 text-sm font-bold">{expert.name.slice(0, 1)}</span>
                      </div>
                    </div>

                    {/* Center: Info + Reasons */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900">{expert.name}</h3>
                        {expert.badge && (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            expert.badge === "TOP"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}>
                            {expert.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5 leading-snug">{expert.title}</p>
                      <ul className="mt-2 space-y-1">
                        {details.reasons.map((r, ri) => (
                          <li key={ri} className="flex items-center gap-1.5 text-xs text-slate-600">
                            <span className="text-emerald-500 font-bold text-[10px]">✓</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                      {/* Skill bars */}
                      <div className="mt-3 space-y-1.5">
                        <SkillBar label="산업 적합도" pct={details.industryFit} delay={0.4 + i * 0.1} />
                        <SkillBar label="스킬 일치도" pct={details.skillMatch} delay={0.5 + i * 0.1} />
                        <SkillBar label="가용성" pct={details.availability} delay={0.6 + i * 0.1} />
                      </div>
                    </div>

                    {/* Right: Score + Rate + CTA */}
                    <div className="flex flex-col items-center gap-2 flex-shrink-0 w-24">
                      <div className="flex flex-col items-center">
                        <motion.span
                          className="text-3xl font-black text-indigo-600"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                        >
                          {details.score}%
                        </motion.span>
                        <span className="text-slate-400 text-[10px]">매칭 점수</span>
                      </div>
                      <p className="text-slate-700 text-xs font-semibold">₩{expert.hourlyRate}만/시간</p>
                      <div className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        expert.available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${expert.available ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {expert.available ? "가용" : "미가용"}
                      </div>
                      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors mt-1">
                        자문 요청
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right: AI Criteria Panel */}
          <div className="col-span-1">
            <motion.div
              className="rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.07)] bg-white p-5 sticky top-6"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[10px] font-bold">AI</span>
                </div>
                <h2 className="text-sm font-bold text-slate-900">AI 매칭 기준</h2>
              </div>
              <div className="space-y-3">
                {AI_CRITERIA.map((c, i) => (
                  <SkillBar key={i} label={c.label} pct={c.pct} delay={0.5 + i * 0.08} />
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  2,400개 이상의 전문가 프로필과 업계 데이터를 분석해 최적의 매칭을 제공합니다.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-2xl transition-colors shadow-md">
            <Shield className="w-4 h-4" />
            NDA 자동 체결 후 연락 시작
          </button>
          <button className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 font-medium px-5 py-3 rounded-2xl border border-slate-200 hover:border-indigo-200 bg-white transition-colors">
            다른 전문가 탐색
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
