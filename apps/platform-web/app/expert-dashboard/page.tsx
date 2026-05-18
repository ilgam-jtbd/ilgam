"use client";

import { motion } from "framer-motion";
import { Bell, LayoutDashboard, Briefcase, FolderOpen, DollarSign, User, Calendar, MessageSquare, Star, TrendingUp, Clock, ChevronRight } from "lucide-react";
import { PROJECTS } from "@/lib/data";

const NAV_ITEMS = [
  { label: "대시보드", icon: LayoutDashboard, active: true },
  { label: "추천 프로젝트", icon: Briefcase },
  { label: "내 프로젝트", icon: FolderOpen },
  { label: "수익 관리", icon: DollarSign },
  { label: "내 프로필", icon: User },
  { label: "일정", icon: Calendar },
  { label: "메시지", icon: MessageSquare },
];

const EARNINGS_DATA = [
  { month: "12월", value: 8.2, label: "8.2M" },
  { month: "1월", value: 9.5, label: "9.5M" },
  { month: "2월", value: 11.2, label: "11.2M" },
  { month: "3월", value: 10.8, label: "10.8M" },
  { month: "4월", value: 12.4, label: "12.4M" },
  { month: "5월", value: 11.9, label: "11.9M" },
];

const MAX_EARNINGS = 14;

const CALENDAR_EVENTS = [
  { day: "월", dayNum: 18, time: "14:00", title: "STX조선해양 화상 자문", color: "bg-indigo-500" },
  { day: "화", dayNum: 19, time: null, title: null, color: null },
  { day: "수", dayNum: 20, time: "10:00", title: "핀테크 IR 검토", color: "bg-emerald-500" },
  { day: "목", dayNum: 21, time: null, title: null, color: null },
  { day: "금", dayNum: 22, time: "09:00", title: "AI 스타트업 전략 미팅", color: "bg-violet-500" },
  { day: "토", dayNum: 23, time: null, title: null, color: null },
  { day: "일", dayNum: 24, time: null, title: null, color: null },
];

const ACTIVITY = [
  {
    icon: "💬",
    text: "STX조선해양이 후속 자문을 요청했습니다",
    time: "1시간 전",
    type: "request",
  },
  {
    icon: "💰",
    text: "새 결제가 완료됐습니다 ₩2,800,000",
    time: "어제",
    type: "payment",
  },
  {
    icon: "👁",
    text: "코스맥스바이오가 프로필을 조회했습니다",
    time: "2일 전",
    type: "view",
  },
];

export default function ExpertDashboardPage() {
  const recommendedProjects = PROJECTS.slice(0, 3);

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
          <p className="text-slate-500 text-xs mt-1">Expert Portal</p>
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

        {/* Profile footer */}
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">박수</span>
            </div>
            <div>
              <p className="text-white text-xs font-medium">박수연</p>
              <p className="text-slate-500 text-xs">前 카카오 CPO</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">안녕하세요, 박수연 전문가님 👋</h1>
            <p className="text-slate-500 text-sm mt-0.5">2026년 5월 18일 월요일 · KST</p>
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
            {/* 이번 달 수익 */}
            <div className="rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.07)] bg-white p-6">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">이번 달 수익</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">₩12,400,000</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 text-xs font-medium">+23% vs 지난달</span>
              </div>
            </div>

            {/* 진행 중 프로젝트 */}
            <div className="rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.07)] bg-white p-6">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">진행 중 프로젝트</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">3건</p>
              <p className="text-slate-400 text-xs mt-1">1건 검토 대기중</p>
            </div>

            {/* 평균 평점 */}
            <div className="rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.07)] bg-white p-6">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">평균 평점</p>
              <div className="flex items-baseline gap-1 mt-2">
                <p className="text-2xl font-bold text-slate-900">4.95</p>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <p className="text-slate-400 text-xs mt-1">61건 리뷰</p>
            </div>

            {/* 응답률 */}
            <div className="rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.07)] bg-white p-6">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">응답률</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">98%</p>
              <p className="text-slate-400 text-xs mt-1">평균 응답 1시간</p>
            </div>
          </motion.div>

          {/* Calendar + Activity */}
          <div className="grid grid-cols-3 gap-4">
            {/* Weekly Calendar */}
            <motion.div
              className="col-span-2 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.07)] bg-white p-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">이번 주 일정</h2>
                <span className="text-slate-400 text-xs">5월 18일 — 24일</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {CALENDAR_EVENTS.map((ev) => (
                  <div key={ev.day} className="flex flex-col items-center gap-1.5">
                    <span className="text-slate-400 text-xs font-medium">{ev.day}</span>
                    <span className={`text-sm font-semibold ${ev.day === "월" ? "text-indigo-600" : "text-slate-700"}`}>
                      {ev.dayNum}
                    </span>
                    {ev.title ? (
                      <div className={`w-full rounded-lg p-1.5 text-center ${ev.color}`}>
                        <p className="text-white text-[10px] font-medium leading-tight">{ev.time}</p>
                        <p className="text-white text-[9px] leading-tight mt-0.5 line-clamp-2">{ev.title}</p>
                      </div>
                    ) : (
                      <div className="w-full h-14 rounded-lg bg-slate-50 border border-dashed border-slate-200" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              className="rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.07)] bg-white p-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <h2 className="font-semibold text-slate-900 mb-4">최근 활동</h2>
              <div className="space-y-4">
                {ACTIVITY.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-slate-700 text-xs font-medium leading-snug">{item.text}</p>
                      <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Earnings Chart + Recommended Projects */}
          <div className="grid grid-cols-5 gap-4">
            {/* Earnings Chart */}
            <motion.div
              className="col-span-2 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.07)] bg-white p-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">수익 추이</h2>
                <span className="text-slate-400 text-xs">최근 6개월</span>
              </div>
              <div className="flex items-end gap-2 h-32">
                {EARNINGS_DATA.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-slate-400 text-[9px]">{d.label}</span>
                    <motion.div
                      className="w-full rounded-t-md bg-indigo-500"
                      style={{ height: `${(d.value / MAX_EARNINGS) * 96}px` }}
                      initial={{ scaleY: 0, originY: 1 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.06 }}
                    />
                    <span className="text-slate-500 text-[10px]">{d.month}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 text-xs">6개월 합계</span>
                <span className="text-slate-900 text-sm font-bold">₩64,000,000</span>
              </div>
            </motion.div>

            {/* Recommended Projects */}
            <motion.div
              className="col-span-3 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.07)] bg-white p-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">추천 프로젝트</h2>
                <button className="text-indigo-600 text-xs font-medium flex items-center gap-1 hover:text-indigo-700">
                  전체 보기 <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-3">
                {recommendedProjects.map((project, i) => {
                  const scores = [94, 89, 82];
                  return (
                    <div key={project.id} className="border border-slate-100 rounded-xl p-4 hover:border-indigo-200 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-slate-900 truncate">{project.title}</h3>
                            {project.urgent && (
                              <span className="flex-shrink-0 text-[10px] font-semibold bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">긴급</span>
                            )}
                          </div>
                          <p className="text-slate-500 text-xs mt-0.5">{project.company} · {project.duration} · {project.budget}</p>
                          {/* Match score bar */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] text-slate-500">적합도</span>
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-indigo-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${scores[i]}%` }}
                                transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                              />
                            </div>
                            <span className="text-[10px] font-semibold text-indigo-600">{scores[i]}%</span>
                          </div>
                        </div>
                        <button className="ml-3 flex-shrink-0 bg-indigo-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
                          지원하기
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
