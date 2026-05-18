"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EXPERTS } from "@/lib/data";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Tool {
  id: string;
  name: string;
  tagline: string;
  category: "ai" | "saas" | "analytics" | "security" | "hr";
  logo: string;
  logoColor: string;
  discount: number;        // %
  originalPrice: string;  // monthly
  discountedPrice: string;
  couponCode: string;
  features: string[];
  badge?: "인기" | "신규" | "한정";
  usersCount: string;
}

interface ExpertLecture {
  expertId: string;
  title: string;
  duration: string;
  format: "온라인" | "오프라인" | "하이브리드";
  price: string;
  originalPrice: string;
  nextDate: string;
  seats: number;
  seatsLeft: number;
  tags: string[];
  featured?: boolean;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const TOOLS: Tool[] = [
  {
    id: "t1",
    name: "Notion AI",
    tagline: "기업 문서·지식 관리의 표준",
    category: "saas",
    logo: "N",
    logoColor: "#000000",
    discount: 30,
    originalPrice: "₩19,000/월",
    discountedPrice: "₩13,300/월",
    couponCode: "ILGAM30",
    features: ["AI 문서 작성", "팀 위키", "프로젝트 DB", "무제한 블록"],
    badge: "인기",
    usersCount: "1,200+",
  },
  {
    id: "t2",
    name: "Slack",
    tagline: "원격 협업 커뮤니케이션 허브",
    category: "saas",
    logo: "S",
    logoColor: "#4A154B",
    discount: 25,
    originalPrice: "₩11,000/월",
    discountedPrice: "₩8,250/월",
    couponCode: "ILGAM25",
    features: ["무제한 메시지", "90일 메시지 보관", "앱 통합 10개+", "허들 미팅"],
    badge: "인기",
    usersCount: "890+",
  },
  {
    id: "t3",
    name: "Claude for Work",
    tagline: "시니어 전문가 보고서·분석 AI",
    category: "ai",
    logo: "C",
    logoColor: "#D4A27F",
    discount: 40,
    originalPrice: "₩28,000/월",
    discountedPrice: "₩16,800/월",
    couponCode: "ILGAM40",
    features: ["200K 컨텍스트", "문서 분석", "보고서 초안", "API 접근"],
    badge: "신규",
    usersCount: "320+",
  },
  {
    id: "t4",
    name: "Figma",
    tagline: "전문가 산출물 시각화 툴",
    category: "saas",
    logo: "F",
    logoColor: "#F24E1E",
    discount: 20,
    originalPrice: "₩17,000/월",
    discountedPrice: "₩13,600/월",
    couponCode: "ILGAM20",
    features: ["무제한 파일", "프로토타입", "Dev 모드", "AI 디자인"],
    usersCount: "450+",
  },
  {
    id: "t5",
    name: "Zoom",
    tagline: "비대면 자문 화상 미팅",
    category: "saas",
    logo: "Z",
    logoColor: "#2D8CFF",
    discount: 35,
    originalPrice: "₩22,000/월",
    discountedPrice: "₩14,300/월",
    couponCode: "ILGAM35",
    features: ["300인 회의", "클라우드 녹화", "AI 요약", "화이트보드"],
    badge: "인기",
    usersCount: "2,100+",
  },
  {
    id: "t6",
    name: "Gamma AI",
    tagline: "AI 프레젠테이션 자동 생성",
    category: "ai",
    logo: "G",
    logoColor: "#7C3AED",
    discount: 45,
    originalPrice: "₩18,000/월",
    discountedPrice: "₩9,900/월",
    couponCode: "ILGAM45",
    features: ["AI 슬라이드 생성", "IR 템플릿", "협업 편집", "PDF 내보내기"],
    badge: "한정",
    usersCount: "180+",
  },
  {
    id: "t7",
    name: "Airtable",
    tagline: "전문가 프로젝트 데이터 관리",
    category: "analytics",
    logo: "A",
    logoColor: "#18BFFF",
    discount: 25,
    originalPrice: "₩24,000/월",
    discountedPrice: "₩18,000/월",
    couponCode: "ILGAM25",
    features: ["무제한 레코드", "자동화 워크플로", "뷰 맞춤화", "API 연동"],
    usersCount: "560+",
  },
  {
    id: "t8",
    name: "DocuSign",
    tagline: "전문가 계약서 전자 서명",
    category: "security",
    logo: "D",
    logoColor: "#FFCC00",
    discount: 30,
    originalPrice: "₩25,000/월",
    discountedPrice: "₩17,500/월",
    couponCode: "ILGAM30",
    features: ["전자서명 무제한", "NDA 템플릿", "감사 로그", "법적 효력"],
    badge: "신규",
    usersCount: "290+",
  },
];

const LECTURES: ExpertLecture[] = [
  {
    expertId: "e1",
    title: "조선·플랜트 EPC 계약 협상 실전 마스터클래스",
    duration: "8시간 (4주 × 2시간)",
    format: "온라인",
    price: "₩890,000",
    originalPrice: "₩1,200,000",
    nextDate: "2026-06-07",
    seats: 20,
    seatsLeft: 5,
    tags: ["EPC", "수주협상", "선박", "중동영업"],
    featured: true,
  },
  {
    expertId: "e2",
    title: "AI 프로덕트 전략: GPT 시대 B2B SaaS 생존법",
    duration: "6시간 (3주 × 2시간)",
    format: "하이브리드",
    price: "₩650,000",
    originalPrice: "₩850,000",
    nextDate: "2026-06-14",
    seats: 30,
    seatsLeft: 12,
    tags: ["AI전략", "B2BSaaS", "GPT", "프로덕트"],
  },
  {
    expertId: "e4",
    title: "코스닥 상장 완전정복: IPO 전략부터 IR까지",
    duration: "10시간 (5주 × 2시간)",
    format: "온라인",
    price: "₩1,200,000",
    originalPrice: "₩1,500,000",
    nextDate: "2026-06-21",
    seats: 15,
    seatsLeft: 3,
    tags: ["IPO", "코스닥", "IR전략", "투자유치"],
    featured: true,
  },
  {
    expertId: "e6",
    title: "기업 AI 전환 로드맵: CTO가 직접 알려주는 실행 전략",
    duration: "4시간 (2주 × 2시간)",
    format: "온라인",
    price: "₩450,000",
    originalPrice: "₩600,000",
    nextDate: "2026-06-28",
    seats: 50,
    seatsLeft: 28,
    tags: ["AI전환", "DX", "기술전략", "CTO"],
  },
];

const CATEGORIES = [
  { key: "all", label: "전체" },
  { key: "ai", label: "AI 툴" },
  { key: "saas", label: "SaaS" },
  { key: "analytics", label: "분석·DB" },
  { key: "security", label: "보안·계약" },
  { key: "hr", label: "HR·채용" },
];

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function getExpert(id: string) {
  return EXPERTS.find((e) => e.id === id)!;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
}

// ─── Tool Card ────────────────────────────────────────────────────────────────

function ToolCard({ tool }: { tool: Tool }) {
  const [copied, setCopied] = useState(false);

  function copyCoupon() {
    navigator.clipboard.writeText(tool.couponCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      variants={fadeInUp}
      className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-200 flex flex-col gap-4 relative overflow-hidden"
    >
      {tool.badge && (
        <span
          className={`absolute top-4 right-4 text-xs font-bold px-2 py-0.5 rounded-full ${
            tool.badge === "인기"
              ? "bg-indigo-100 text-indigo-700"
              : tool.badge === "신규"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {tool.badge}
        </span>
      )}

      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
          style={{ backgroundColor: tool.logoColor }}
        >
          {tool.logo}
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{tool.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{tool.tagline}</p>
        </div>
      </div>

      <ul className="space-y-1.5">
        {tool.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
            <svg className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-4 border-t border-slate-100">
        <div className="flex items-end justify-between mb-3">
          <div>
            <span className="text-xs text-slate-400 line-through">{tool.originalPrice}</span>
            <div className="text-lg font-bold text-slate-900">{tool.discountedPrice}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-indigo-600">{tool.discount}%</div>
            <div className="text-xs text-slate-500">할인</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={copyCoupon}
            className="flex-1 text-sm font-mono font-semibold px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-center"
          >
            {copied ? "✓ 복사됨" : tool.couponCode}
          </button>
          <button className="flex-1 text-sm font-semibold px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-center">
            쿠폰 받기
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-2 text-center">
          일감 회원 {tool.usersCount}명 이용 중
        </p>
      </div>
    </motion.div>
  );
}

// ─── Lecture Card ─────────────────────────────────────────────────────────────

function LectureCard({ lecture }: { lecture: ExpertLecture }) {
  const expert = getExpert(lecture.expertId);
  const fillRatio = 1 - lecture.seatsLeft / lecture.seats;
  const isAlmostFull = lecture.seatsLeft <= 5;

  return (
    <motion.div
      variants={fadeInUp}
      className={`bg-white rounded-2xl border p-6 flex flex-col gap-4 hover:shadow-lg transition-all duration-200 ${
        lecture.featured
          ? "border-indigo-300 ring-1 ring-indigo-100"
          : "border-slate-200"
      }`}
    >
      {lecture.featured && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full w-fit">
          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          추천 강의
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold flex-shrink-0">
          {expert.name.slice(0, 2)}
        </div>
        <div>
          <p className="text-xs text-indigo-600 font-medium">{expert.name}</p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{expert.title}</p>
        </div>
      </div>

      <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2">{lecture.title}</h3>

      <div className="flex flex-wrap gap-1.5">
        {lecture.tags.map((tag) => (
          <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
            #{tag}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-slate-400">형식</p>
          <p className="font-medium text-slate-700 mt-0.5">{lecture.format}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">총 시간</p>
          <p className="font-medium text-slate-700 mt-0.5">{lecture.duration}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">다음 기수</p>
          <p className="font-medium text-slate-700 mt-0.5">{formatDate(lecture.nextDate)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">잔여석</p>
          <p className={`font-medium mt-0.5 ${isAlmostFull ? "text-red-600" : "text-slate-700"}`}>
            {lecture.seatsLeft}석 남음
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isAlmostFull ? "bg-red-500" : "bg-indigo-500"}`}
            style={{ width: `${Math.round(fillRatio * 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 text-right">
          {lecture.seats - lecture.seatsLeft}/{lecture.seats}명 신청
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-end justify-between mb-3">
          <div>
            <span className="text-xs text-slate-400 line-through">{lecture.originalPrice}</span>
            <div className="text-xl font-bold text-slate-900">{lecture.price}</div>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            일감 회원 할인 적용
          </span>
        </div>
        <button className="w-full text-sm font-semibold py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
          강의 신청하기
        </button>
      </div>
    </motion.div>
  );
}

// ─── Revenue Banner ───────────────────────────────────────────────────────────

function RevenueBanner() {
  return (
    <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
      <div>
        <h3 className="text-xl font-bold mb-2">파트너 툴 등록 · 광고 문의</h3>
        <p className="text-slate-300 text-sm max-w-lg">
          일감 전문가 네트워크에 귀사의 SaaS / AI 툴을 노출하세요.
          2,400+ 시니어 전문가와 850+ 기업 바이어에게 직접 도달합니다.
          CPL · 쿠폰 수익쉐어 · 스폰서십 패키지 제공.
        </p>
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          {["CPL 과금 모델", "전용 쿠폰 발급", "전문가 뉴스레터 노출", "대시보드 분석 제공"].map((item) => (
            <span key={item} className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>
      <button className="flex-shrink-0 px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-indigo-50 transition-colors whitespace-nowrap">
        파트너십 문의하기
      </button>
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  const stats = [
    { label: "파트너 툴", value: "24개" },
    { label: "평균 할인율", value: "32%" },
    { label: "이용 회원", value: "4,800+" },
    { label: "누적 절감액", value: "₩2.1억+" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-indigo-50 rounded-2xl p-6">
      {stats.map((s) => (
        <div key={s.label} className="text-center">
          <div className="text-2xl font-black text-indigo-700">{s.value}</div>
          <div className="text-xs text-slate-500 mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"tools" | "lectures">("tools");

  const filteredTools =
    activeCategory === "all"
      ? TOOLS
      : TOOLS.filter((t) => t.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              일감 멤버 전용 혜택
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl font-black text-white mb-4">
              툴 & 혜택
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-slate-400 text-lg max-w-2xl mx-auto">
              검증된 B2B SaaS · AI 툴 할인 쿠폰과 시니어 전문가의 심화 강의를
              <br className="hidden md:block" /> 일감 멤버에게만 제공합니다.
            </motion.p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatsBar />
        </motion.div>

        {/* Tab Switch */}
        <div className="flex gap-1 bg-slate-200 rounded-xl p-1 w-fit mt-10 mb-8">
          {(["tools", "lectures"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab === "tools" ? "🛠 SaaS · AI 툴 쿠폰" : "🎓 전문가 강의"}
            </button>
          ))}
        </div>

        {activeTab === "tools" && (
          <>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat.key
                      ? "bg-indigo-600 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <motion.div
              key={activeCategory}
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </motion.div>
          </>
        )}

        {activeTab === "lectures" && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                일감 전문가가 직접 진행하는 심화 강의 · 마스터클래스
              </p>
              <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2.5 py-1 rounded-full">
                일감 회원 최대 30% 할인
              </span>
            </div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {LECTURES.map((lecture, i) => (
                <LectureCard key={i} lecture={lecture} />
              ))}
            </motion.div>
          </>
        )}

        {/* Partner Banner */}
        <div className="mt-16">
          <RevenueBanner />
        </div>
      </div>
    </div>
  );
}
