"use client";

import { motion } from "framer-motion";
import {
  Bell,
  LayoutDashboard,
  FolderOpen,
  Search,
  CreditCard,
  Users,
  BarChart2,
  Settings,
  Heart,
  MessageCircle,
  CheckCircle,
  RotateCcw,
  XCircle,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { EXPERTS } from "@/lib/data";

const NAV_ITEMS = [
  { label: "대시보드", icon: LayoutDashboard, active: true },
  { label: "프로젝트 관리", icon: FolderOpen },
  { label: "전문가 탐색", icon: Search },
  { label: "계약·결제", icon: CreditCard },
  { label: "팀 관리", icon: Users },
  { label: "분석", icon: BarChart2 },
  { label: "설정", icon: Settings },
];

const PROJECTS_TABLE = [
  {
    name: "LNG 수주 협상 자문",
    expert: "김재원",
    status: "진행중",
    statusColor: "emerald",
    startDate: "05-15",
    budget: "500만원",
    actions: ["메시지", "완료"],
  },
  {
    name: "IPO 전략 검토",
    expert: "최동훈",
    status: "검토중",
    statusColor: "amber",
    startDate: "05-20",
    budget: "300만원",
    actions: ["메시지"],
  },
  {
    name: "중국 시장 진출 전략",
    expert: "정민아",
    status: "매칭중",
    statusColor: "blue",
    startDate: "미정",
    budget: "800만원",
    actions: ["취소"],
  },
  {
    name: "AI CTO 자문",
    expert: "강병철",
    status: "완료",
    statusColor: "slate",
    startDate: "05-10",
    budget: "350만원",
    actions: ["재의뢰"],
  },
];

const STATUS_STYLES: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-blue-700",
  slate: "bg-slate-100 text-slate-600",
};

const ACTION_STYLES: Record<string, string> = {
  "메시지": "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
  "완료": "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  "취소": "bg-red-50 text-red-600 hover:bg-red-100",
  "재의뢰": "bg-slate-100 text-slate-700 hover:bg-slate-200",
};

const DONUT_SEGMENTS = [
  { label: "기술·R&D", pct: 35, color: "bg-indigo-500" },
  { label: "전략·경영", pct: 28, color: "bg-violet-500" },
  { label: "재무·투자", pct: 22, color: "bg-amber-400" },
  { label: "기타", pct: 15, color: "bg-slate-300" },
];

const MONTHLY_SPEND = [
  { month: "2월", value: 42 },
  { month: "3월", value: 65 },
  { month: "4월", value: 58 },
  { month: "5월", value: 84 },
];

export default function CompanyDashboardPage() {
  const shortlistExperts = EXPERTS.slice(0, 3);

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">IL</span>
            </div>
            <span className="text-white font-semibold text-sm tracking-wide">ILGAM</span>
          </div>
          <p className="text-slate-500 text-xs mt-1">Company Portal</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                item.active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Quick Actions Panel */}
        <div className="px-4 py-4 border-t border-slate-800 space-y-2">
          <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 transition-colors text-white text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            긴급 전문가 요청
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-colors text-white text-xs font-semibold">
            <Plus className="w-3.5 h-3.5 flex-shrink-0" />
            프로젝트 올리기
          </button>
          <p className="text-slate-500 text-[10px] text-center pt-1">
            즐겨찾기 전문가 <span className="text-amber-400 font-semibold">3명</span>
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg">
              <span className="text-sm font-bold tracking-tight">STX조선해양</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-slate-500 text-sm">담당자: 이재철 이사</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-slate-50 transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        <div className="px-8 py-6 space-y-6">
          {/* KPI Cards */}
          <motion.div
            className="grid grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.07)] bg-white p-6">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">진행 중 프로젝트</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">5건</p>
              <p className="text-slate-400 text-xs mt-1">2건 검토 필요</p>
            </div>
            <div className="rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.07)] bg-white p-6">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">이번 분기 절감액</p>
              <p className="text-2xl font-bold text-emerald-600 mt-2">₩84,000,000</p>
              <p className="text-slate-400 text-xs mt-1">정규직 채용 대비</p>
            </div>
            <div className="rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.07)] bg-white p-6">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">활용한 전문가</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">12명</p>
              <p className="text-slate-400 text-xs mt-1">이번 분기 누적</p>
            </div>
            <div className="rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.07)] bg-white p-6">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">평균 매칭 시간</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">1.8시간</p>
              <p className="text-slate-400 text-xs mt-1">업계 평균 대비 −68%</p>
            </div>
          </motion.div>

          {/* Projects Table */}
          <motion.div
            className="rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.07)] bg-white overflow-hidden"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">진행 중인 프로젝트</h2>
              <button className="text-indigo-600 text-xs font-medium hover:text-indigo-700 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> 새 프로젝트
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["프로젝트명", "전문가", "상태", "시작일", "예산", "액션"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {PROJECTS_TABLE.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-900">{row.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-700 text-[10px] font-semibold">
                            {row.expert.slice(0, 1)}
                          </span>
                        </div>
                        <span className="text-sm text-slate-700">{row.expert}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[row.statusColor]}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{row.startDate}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-900">{row.budget}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {row.actions.map((action) => (
                          <button
                            key={action}
                            className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${ACTION_STYLES[action]}`}
                          >
                            {action === "메시지" && <MessageCircle className="w-3 h-3 inline mr-1" />}
                            {action === "완료" && <CheckCircle className="w-3 h-3 inline mr-1" />}
                            {action === "재의뢰" && <RotateCcw className="w-3 h-3 inline mr-1" />}
                            {action === "취소" && <XCircle className="w-3 h-3 inline mr-1" />}
                            {action}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Expert Shortlist + Analytics */}
          <div className="grid grid-cols-5 gap-4">
            {/* Expert Shortlist */}
            <motion.div
              className="col-span-3 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.07)] bg-white p-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h2 className="font-semibold text-slate-900 mb-4">즐겨찾기 전문가</h2>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {shortlistExperts.map((expert) => (
                  <div
                    key={expert.id}
                    className="flex-shrink-0 w-44 border border-slate-100 rounded-xl p-4 hover:border-indigo-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-700 text-sm font-semibold">{expert.name.slice(0, 1)}</span>
                      </div>
                      <button className="text-slate-300 hover:text-red-400 transition-colors">
                        <Heart className="w-4 h-4 fill-red-400 text-red-400" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mt-2">{expert.name}</p>
                    <p className="text-slate-500 text-[11px] leading-snug mt-0.5 line-clamp-2">{expert.title}</p>
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-amber-400 text-xs">★</span>
                      <span className="text-xs font-medium text-slate-700">{expert.rating}</span>
                    </div>
                    <p className="text-indigo-600 text-xs font-semibold mt-1">₩{expert.hourlyRate}만/시간</p>
                    <div className={`mt-2 inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      expert.available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${expert.available ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {expert.available ? "가용" : "미가용"}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Spend Analytics */}
            <motion.div
              className="col-span-2 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.07)] bg-white p-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <h2 className="font-semibold text-slate-900 mb-4">지출 분석</h2>

              {/* Donut Chart (CSS) */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    {(() => {
                      let offset = 0;
                      return DONUT_SEGMENTS.map((seg, i) => {
                        const circumference = 2 * Math.PI * 14;
                        const dash = (seg.pct / 100) * circumference;
                        const gap = circumference - dash;
                        const el = (
                          <circle
                            key={i}
                            cx="18" cy="18" r="14"
                            fill="none"
                            strokeWidth="5"
                            stroke={["#6366f1", "#8b5cf6", "#fbbf24", "#cbd5e1"][i]}
                            strokeDasharray={`${dash} ${gap}`}
                            strokeDashoffset={-offset * circumference / 100}
                          />
                        );
                        offset += seg.pct;
                        return el;
                      });
                    })()}
                  </svg>
                </div>
                <div className="space-y-1.5">
                  {DONUT_SEGMENTS.map((seg, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${seg.color}`} />
                      <span className="text-slate-600 text-[11px]">{seg.label}</span>
                      <span className="text-slate-900 text-[11px] font-semibold ml-auto">{seg.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly spend mini bars */}
              <div className="border-t border-slate-100 pt-3">
                <p className="text-slate-500 text-xs mb-2">월별 지출 (백만원)</p>
                <div className="flex items-end gap-1.5 h-14">
                  {MONTHLY_SPEND.map((d) => (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        className="w-full bg-indigo-400 rounded-t"
                        style={{ height: `${(d.value / 100) * 48}px` }}
                        initial={{ scaleY: 0, originY: 1 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      />
                      <span className="text-slate-500 text-[9px]">{d.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
