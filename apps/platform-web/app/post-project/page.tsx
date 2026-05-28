"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { EXPERTS } from "@/lib/data";
import { INDUSTRY_LABELS } from "@/lib/types";

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <a href="/" className="font-bold text-xl tracking-tight text-indigo-600">
          VELOR
        </a>
        <nav className="flex items-center gap-1 text-sm font-medium text-slate-600">
          <a
            href="/marketplace"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            전문가 찾기
          </a>
          <a
            href="/post-project"
            className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold"
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

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: "프로젝트 정보" },
  { num: 2, label: "전문가 요건" },
  { num: 3, label: "예산 & 일정" },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, idx) => {
        const done = current > step.num;
        const active = current === step.num;
        return (
          <div key={step.num} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-200 ${
                  done
                    ? "bg-indigo-600 text-white"
                    : active
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? "✓" : step.num}
              </div>
              <span
                className={`text-xs font-medium whitespace-nowrap transition-colors ${
                  active ? "text-indigo-700" : done ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 mb-5 rounded-full transition-colors duration-300 ${
                  current > step.num ? "bg-indigo-500" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Project type options ─────────────────────────────────────────────────────

const PROJECT_TYPES = [
  { key: "video", label: "화상 자문", icon: "🎥", desc: "화상 미팅으로 자문" },
  { key: "onsite", label: "현장 미팅", icon: "🏢", desc: "직접 방문 미팅" },
  { key: "review", label: "문서 검토", icon: "📄", desc: "서류·계약서 검토" },
  { key: "project", label: "프로젝트 참여", icon: "🚀", desc: "단기 프로젝트 참여" },
] as const;

type ProjectTypeKey = (typeof PROJECT_TYPES)[number]["key"];

// ─── Location options ──────────────────────────────────────────────────────────

const LOCATION_OPTIONS = [
  { key: "remote", label: "비대면" },
  { key: "seoul", label: "대면·서울" },
  { key: "nationwide", label: "대면·전국" },
] as const;

type LocationKey = (typeof LOCATION_OPTIONS)[number]["key"];

// ─── Budget options ────────────────────────────────────────────────────────────

const BUDGET_OPTIONS = [
  { key: "under100", label: "100만원 이하", sub: "단기 자문·검토" },
  { key: "100to500", label: "100~500만원", sub: "프로젝트 자문" },
  { key: "500to1000", label: "500만~1천만원", sub: "심층 컨설팅" },
  { key: "over1000", label: "1천만원 이상", sub: "장기 파트너십" },
] as const;

type BudgetKey = (typeof BUDGET_OPTIONS)[number]["key"];

// ─── Skill chips ───────────────────────────────────────────────────────────────

const ALL_SKILLS = Array.from(
  new Set(
    EXPERTS.flatMap((e) => e.skills)
  )
);

// ─── AI Preview Panel ──────────────────────────────────────────────────────────

interface PreviewPanelProps {
  step: number;
  industry: string;
  projectType: ProjectTypeKey | "";
  selectedSkills: string[];
  budget: BudgetKey | "";
  urgent: boolean;
}

function MatchBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-600">{label}</span>
        <span className="text-xs font-semibold text-slate-800">{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function BlurredExpertCard({ expert, rank }: { expert: (typeof EXPERTS)[0]; rank: number }) {
  const initials = expert.avatar.slice(0, 2);
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 relative overflow-hidden">
      {/* Rank badge */}
      <span className="absolute top-2 right-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-100">
        #{rank}
      </span>
      <div className="w-9 h-9 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-600 font-semibold text-sm shrink-0 filter blur-[2px] select-none">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="h-2.5 w-20 bg-slate-300 rounded-full mb-1.5 filter blur-[3px]" />
        <div className="h-2 w-28 bg-slate-200 rounded-full filter blur-[2px]" />
        <div className="flex items-center gap-1 mt-1.5">
          <span className="text-amber-400 text-[10px]">★★★★★</span>
          <span className="text-[10px] text-slate-400">({expert.reviewCount}건)</span>
        </div>
      </div>
    </div>
  );
}

function AIPreviewPanel({
  step,
  industry,
  projectType,
  selectedSkills,
  budget: _budget,
  urgent,
}: PreviewPanelProps) {
  const filled = (industry ? 1 : 0) + (projectType ? 1 : 0) + (selectedSkills.length > 0 ? 1 : 0);
  const skillMatch = Math.min(95, 55 + filled * 12 + (urgent ? 5 : 0));
  const industryFit = industry ? 82 : 30;
  const availability = 78;

  const previewExperts = EXPERTS.filter((e) =>
    industry ? e.industries.includes(industry) : true
  ).slice(0, 3);

  const fallbackExperts = EXPERTS.slice(0, 3);
  const displayExperts = previewExperts.length >= 3 ? previewExperts : fallbackExperts;

  return (
    <div className="space-y-4">
      {/* Heading */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          AI 매칭 미리보기
        </p>
        <h3 className="text-base font-bold text-slate-900">AI가 찾은 전문가 예상</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          프로젝트 정보를 입력할수록 매칭 정확도가 높아집니다
        </p>
      </div>

      {/* Matching score bars */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">매칭 정확도</p>
        <MatchBar label="스킬 매칭" pct={skillMatch} color="bg-indigo-500" />
        <MatchBar label="산업 적합도" pct={industryFit} color="bg-emerald-500" />
        <MatchBar label="즉시 가용 여부" pct={availability} color="bg-amber-400" />
      </div>

      {/* Blurred expert previews */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">예상 매칭 전문가</p>
        {displayExperts.map((e, i) => (
          <BlurredExpertCard key={e.id} expert={e} rank={i + 1} />
        ))}
      </div>

      {/* CTA */}
      <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-4 text-center">
        <p className="text-sm font-semibold text-indigo-800 mb-1">
          프로젝트 등록 후 즉시 연결됩니다
        </p>
        <p className="text-xs text-indigo-600">
          평균 응답 시간 <span className="font-bold">2.3시간</span> 이내
        </p>
        {urgent && (
          <span className="inline-block mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
            긴급 매칭 활성화
          </span>
        )}
      </div>

      {/* Step progress hint */}
      <div className="flex gap-1.5">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              step >= s ? "bg-indigo-500" : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p className="text-[11px] text-slate-400 text-center -mt-2">
        {step === 1 ? "1/3 완료" : step === 2 ? "2/3 완료" : "3/3 — 제출 준비 완료"}
      </p>
    </div>
  );
}

// ─── Step 1 ────────────────────────────────────────────────────────────────────

interface Step1Props {
  companyName: string;
  onCompanyName: (v: string) => void;
  contactName: string;
  onContactName: (v: string) => void;
  contactEmail: string;
  onContactEmail: (v: string) => void;
  contactPhone: string;
  onContactPhone: (v: string) => void;
  title: string;
  onTitle: (v: string) => void;
  industry: string;
  onIndustry: (v: string) => void;
  projectType: ProjectTypeKey | "";
  onProjectType: (v: ProjectTypeKey) => void;
  description: string;
  onDescription: (v: string) => void;
  nda: boolean;
  onNda: (v: boolean) => void;
  onNext: () => void;
}

function Step1Form({
  companyName, onCompanyName,
  contactName, onContactName,
  contactEmail, onContactEmail,
  contactPhone, onContactPhone,
  title, onTitle,
  industry, onIndustry,
  projectType, onProjectType,
  description, onDescription,
  nda, onNda,
  onNext,
}: Step1Props) {
  const descLen = description.length;
  const canNext = companyName.trim().length >= 2 && title.trim().length >= 5 && industry && projectType && descLen >= 100;

  return (
    <div className="space-y-6">
      {/* Company info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            기업명 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => onCompanyName(e.target.value)}
            placeholder="예: STX조선해양"
            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 placeholder:text-slate-400 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            담당자명
          </label>
          <input
            type="text"
            value={contactName}
            onChange={(e) => onContactName(e.target.value)}
            placeholder="홍길동 부장"
            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 placeholder:text-slate-400 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            이메일
          </label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => onContactEmail(e.target.value)}
            placeholder="hong@company.com"
            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 placeholder:text-slate-400 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            연락처
          </label>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => onContactPhone(e.target.value)}
            placeholder="010-0000-0000"
            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 placeholder:text-slate-400 transition"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100" />

      {/* Project title */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          프로젝트 제목 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitle(e.target.value)}
          placeholder="예: 중동 LNG 수주 협상 기술 자문"
          className="w-full px-4 py-3 text-base border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 placeholder:text-slate-400 transition"
        />
      </div>

      {/* Industry selector */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          산업 분야 <span className="text-red-400">*</span>
        </label>
        <select
          value={industry}
          onChange={(e) => onIndustry(e.target.value)}
          className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 text-slate-700 transition appearance-none cursor-pointer"
        >
          <option value="">산업 분야를 선택하세요</option>
          {Object.entries(INDUSTRY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Project type card selectors */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          프로젝트 유형 <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PROJECT_TYPES.map((pt) => {
            const active = projectType === pt.key;
            return (
              <button
                key={pt.key}
                type="button"
                onClick={() => onProjectType(pt.key)}
                className={`flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 transition-all duration-150 text-center ${
                  active
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-slate-50"
                }`}
              >
                <span className="text-2xl">{pt.icon}</span>
                <span className="text-xs font-semibold leading-tight">{pt.label}</span>
                <span className="text-[11px] text-slate-400 leading-tight">{pt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          프로젝트 설명 <span className="text-red-400">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescription(e.target.value)}
          rows={5}
          placeholder="프로젝트 배경, 목표, 필요한 전문성을 구체적으로 설명해주세요. (최소 100자)"
          className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 placeholder:text-slate-400 transition resize-none"
        />
        <div className="flex justify-between items-center mt-1">
          <p className={`text-xs ${descLen < 100 ? "text-red-400" : "text-emerald-600"}`}>
            {descLen < 100 ? `${100 - descLen}자 더 입력하세요` : "충분합니다"}
          </p>
          <p className="text-xs text-slate-400">{descLen}자</p>
        </div>
      </div>

      {/* NDA */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={nda}
          onChange={(e) => onNda(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded accent-indigo-600 cursor-pointer shrink-0"
        />
        <div>
          <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
            NDA (비밀 유지 계약) 필요
          </span>
          <p className="text-xs text-slate-400 mt-0.5">
            전문가 선정 전 NDA 서명을 먼저 진행합니다
          </p>
        </div>
      </label>

      {/* Next button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="w-full py-3 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] transition-all duration-150 shadow-sm"
        >
          다음 단계 — 전문가 요건 →
        </button>
        {!canNext && (
          <p className="text-xs text-slate-400 text-center mt-2">
            모든 필수 항목을 입력하고 설명을 100자 이상 작성해주세요
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Step 2 ────────────────────────────────────────────────────────────────────

interface Step2Props {
  selectedSkills: string[];
  onToggleSkill: (s: string) => void;
  minYears: number;
  onMinYears: (v: number) => void;
  location: LocationKey | "";
  onLocation: (v: LocationKey) => void;
  urgent: boolean;
  onUrgent: (v: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

function Step2Form({
  selectedSkills, onToggleSkill,
  minYears, onMinYears,
  location, onLocation,
  urgent, onUrgent,
  onNext, onBack,
}: Step2Props) {
  return (
    <div className="space-y-6">
      {/* Required skills */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          필요 스킬 선택{" "}
          {selectedSkills.length > 0 && (
            <span className="ml-1 text-xs font-normal text-indigo-600">
              {selectedSkills.length}개 선택됨
            </span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {ALL_SKILLS.map((skill) => {
            const active = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => onToggleSkill(skill)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all duration-150 ${
                  active
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimum experience slider */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          최소 경력 요건
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min={5}
            max={30}
            step={1}
            value={minYears}
            onChange={(e) => onMinYears(Number(e.target.value))}
            className="w-full h-1.5 accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>5년</span>
            <span className="font-semibold text-indigo-600 font-mono">{minYears}년 이상</span>
            <span>30년</span>
          </div>
        </div>
      </div>

      {/* Location preference */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          위치 선호
        </label>
        <div className="flex gap-2 flex-wrap">
          {LOCATION_OPTIONS.map((opt) => {
            const active = location === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => onLocation(opt.key)}
                className={`text-sm px-4 py-2 rounded-xl border-2 font-medium transition-all duration-150 ${
                  active
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Urgency toggle */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <button
            role="switch"
            aria-checked={urgent}
            type="button"
            onClick={() => onUrgent(!urgent)}
            className={`relative shrink-0 mt-0.5 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              urgent ? "bg-amber-500" : "bg-slate-200"
            }`}
            style={{ width: "40px", height: "22px" }}
          >
            <span
              className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200 ${
                urgent ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
          <div>
            <span className="text-sm font-semibold text-amber-800">
              긴급 매칭 필요 (+30% 수수료)
            </span>
            <p className="text-xs text-amber-600 mt-0.5">
              24시간 내 전문가 연결을 보장합니다. 일반 매칭 대비 수수료 30%가 추가됩니다.
            </p>
          </div>
        </label>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          ← 이전
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-[2] py-3 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.99] transition-all duration-150 shadow-sm"
        >
          다음 단계 — 예산 & 일정 →
        </button>
      </div>
    </div>
  );
}

// ─── Step 3 ────────────────────────────────────────────────────────────────────

interface Step3Props {
  budget: BudgetKey | "";
  onBudget: (v: BudgetKey) => void;
  durationValue: string;
  onDurationValue: (v: string) => void;
  durationUnit: string;
  onDurationUnit: (v: string) => void;
  startDate: string;
  onStartDate: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
  submitError: string;
}

function Step3Form({
  budget, onBudget,
  durationValue, onDurationValue,
  durationUnit, onDurationUnit,
  startDate, onStartDate,
  onSubmit, onBack,
  submitting, submitError,
}: Step3Props) {
  const canSubmit = budget && durationValue && startDate && !submitting;

  return (
    <div className="space-y-6">
      {/* Budget cards */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          예산 범위 <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {BUDGET_OPTIONS.map((opt) => {
            const active = budget === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => onBudget(opt.key)}
                className={`flex flex-col gap-0.5 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                  active
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                }`}
              >
                <span className={`text-sm font-bold ${active ? "text-indigo-700" : "text-slate-800"}`}>
                  {opt.label}
                </span>
                <span className="text-xs text-slate-400">{opt.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          예상 기간 <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            value={durationValue}
            onChange={(e) => onDurationValue(e.target.value)}
            placeholder="기간"
            className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 placeholder:text-slate-400 transition"
          />
          <select
            value={durationUnit}
            onChange={(e) => onDurationUnit(e.target.value)}
            className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 text-slate-700 transition cursor-pointer"
          >
            <option value="일">일</option>
            <option value="주">주</option>
            <option value="월">월</option>
          </select>
        </div>
      </div>

      {/* Start date */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          시작 희망일 <span className="text-red-400">*</span>
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDate(e.target.value)}
          min="2026-05-18"
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 text-slate-700 transition"
        />
      </div>

      {/* Error message */}
      {submitError && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
          {submitError}
        </div>
      )}

      {/* Navigation + Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="flex-1 py-3 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          ← 이전
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex-[2] py-3 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] transition-all duration-150 shadow-sm"
        >
          {submitting ? "제출 중…" : "AI 매칭 시작하기 →"}
        </button>
      </div>
    </div>
  );
}

// ─── Success overlay ───────────────────────────────────────────────────────────

function SuccessOverlay({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-3xl mb-4">
        🎉
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">프로젝트가 등록되었습니다!</h2>
      <p className="text-sm text-slate-500 mb-6">
        AI 매칭이 시작됩니다. 평균 <span className="font-semibold text-indigo-600">2.3시간</span> 이내에
        전문가를 연결해드립니다.
      </p>
      <div className="flex gap-3">
        <a
          href="/marketplace"
          className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          전문가 둘러보기
        </a>
        <button
          type="button"
          onClick={onReset}
          className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          새 프로젝트 등록
        </button>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const BUDGET_KRW: Record<string, number> = {
  under100: 100,
  "100to500": 300,
  "500to1000": 750,
  over1000: 1500,
};

export default function PostProjectPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Step 1 — contact + project info
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [title, setTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [projectType, setProjectType] = useState<ProjectTypeKey | "">("");
  const [description, setDescription] = useState("");
  const [nda, setNda] = useState(false);

  // Step 2
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minYears, setMinYears] = useState(10);
  const [location, setLocation] = useState<LocationKey | "">("");
  const [urgent, setUrgent] = useState(false);

  // Step 3
  const [budget, setBudget] = useState<BudgetKey | "">("");
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("주");
  const [startDate, setStartDate] = useState("");

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      const { error } = await supabase.from("b2b_inquiries").insert({
        company_name: companyName.trim(),
        contact_name: contactName.trim() || null,
        contact_email: contactEmail.trim() || null,
        contact_phone: contactPhone.trim() || null,
        industry: industry || null,
        project_title: title.trim(),
        description: description.trim(),
        budget_krw: budget ? (BUDGET_KRW[budget] ?? null) : null,
        duration: durationValue ? `${durationValue}${durationUnit}` : null,
        skills: selectedSkills,
        urgent,
        nda_required: nda,
        status: "new",
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setStep(1);
    setSubmitted(false);
    setSubmitError("");
    setCompanyName("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setTitle("");
    setIndustry("");
    setProjectType("");
    setDescription("");
    setNda(false);
    setSelectedSkills([]);
    setMinYears(10);
    setLocation("");
    setUrgent(false);
    setBudget("");
    setDurationValue("");
    setDurationUnit("주");
    setStartDate("");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />

      {/* Page header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-slate-900">프로젝트 올리기</h1>
          <p className="text-slate-500 mt-1 text-sm">
            프로젝트 정보를 입력하면 AI가 최적의 시니어 전문가를 찾아드립니다.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">
          {/* Main form — 2/3 */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.07)] p-6 sm:p-8">
              {submitted ? (
                <SuccessOverlay onReset={handleReset} />
              ) : (
                <>
                  <StepIndicator current={step} />

                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Step1Form
                          companyName={companyName}
                          onCompanyName={setCompanyName}
                          contactName={contactName}
                          onContactName={setContactName}
                          contactEmail={contactEmail}
                          onContactEmail={setContactEmail}
                          contactPhone={contactPhone}
                          onContactPhone={setContactPhone}
                          title={title}
                          onTitle={setTitle}
                          industry={industry}
                          onIndustry={setIndustry}
                          projectType={projectType}
                          onProjectType={setProjectType}
                          description={description}
                          onDescription={setDescription}
                          nda={nda}
                          onNda={setNda}
                          onNext={() => setStep(2)}
                        />
                      </motion.div>
                    )}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Step2Form
                          selectedSkills={selectedSkills}
                          onToggleSkill={toggleSkill}
                          minYears={minYears}
                          onMinYears={setMinYears}
                          location={location}
                          onLocation={setLocation}
                          urgent={urgent}
                          onUrgent={setUrgent}
                          onNext={() => setStep(3)}
                          onBack={() => setStep(1)}
                        />
                      </motion.div>
                    )}
                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Step3Form
                          budget={budget}
                          onBudget={setBudget}
                          durationValue={durationValue}
                          onDurationValue={setDurationValue}
                          durationUnit={durationUnit}
                          onDurationUnit={setDurationUnit}
                          startDate={startDate}
                          onStartDate={setStartDate}
                          onSubmit={handleSubmit}
                          onBack={() => setStep(2)}
                          submitting={submitting}
                          submitError={submitError}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>

          {/* AI Preview panel — 1/3, sticky */}
          <div className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-20">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.07)] p-5">
              <AIPreviewPanel
                step={step}
                industry={industry}
                projectType={projectType}
                selectedSkills={selectedSkills}
                budget={budget}
                urgent={urgent}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
