export interface ExpertYouTube {
  channelUrl: string;
  channelName: string;
  subscribers: string;       // e.g. "12.4만"
  videoCount: number;
  latestVideo: string;       // title
  thumbnailColor: string;    // CSS color for placeholder
}

export interface Expert {
  id: string;
  name: string;
  title: string;
  company: string;           // current or last company
  industries: string[];
  skills: string[];
  yearsExp: number;
  rating: number;
  reviewCount: number;
  hourlyRate: number;        // KRW 만원
  projectRate?: number;      // KRW 만원/project
  available: boolean;
  availableFrom?: string;
  location: string;
  avatar: string;            // initials fallback
  bio: string;
  completedProjects: number;
  badge?: "TOP" | "NEW" | "VERIFIED";
  responseTime: string;      // e.g. "2h"
  youtube?: ExpertYouTube;   // optional YouTube presence
}

export interface Project {
  id: string;
  title: string;
  company: string;
  industry: string;
  type: "advisory" | "review" | "onsite" | "project";
  duration: string;
  budget: string;
  urgent: boolean;
  ndaRequired: boolean;
  postedAt: string;
  status: "open" | "matched" | "in_progress" | "completed";
  skills: string[];
  description: string;
  matchedExperts?: number;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  logo: string;
}

export type Industry =
  | "manufacturing"
  | "shipbuilding"
  | "it"
  | "startup"
  | "healthcare"
  | "finance"
  | "energy"
  | "retail"
  | "government"
  | "other";

export const INDUSTRY_LABELS: Record<string, string> = {
  manufacturing: "제조·플랜트",
  shipbuilding:  "조선·해양",
  it:            "IT·테크",
  startup:       "스타트업",
  healthcare:    "헬스케어",
  finance:       "금융·투자",
  energy:        "에너지",
  retail:        "유통·리테일",
  government:    "공공·정부",
  other:         "기타",
};

export const EXPERTISE_LABELS: Record<string, string> = {
  strategy:    "전략·경영",
  sales:       "영업·BD",
  finance:     "재무·투자",
  legal:       "법무·계약",
  tech:        "기술·R&D",
  hr:          "인사·조직",
  marketing:   "마케팅",
  operations:  "운영·물류",
  regulatory:  "인허가·규제",
  global:      "해외사업",
};

export type ServiceType = "project" | "onepoint" | "scout";

export interface ServiceOption {
  type: ServiceType;
  label: string;
  description: string;
  priceFrom: string;
  duration: string;
  badge?: string;
}

export const SERVICE_OPTIONS: ServiceOption[] = [
  {
    type: "project",
    label: "프로젝트 자문",
    description: "1주~3개월 단기 전문가 계약",
    priceFrom: "200만원~",
    duration: "1주~3개월",
  },
  {
    type: "onepoint",
    label: "원포인트 자문",
    description: "1~2시간 화상 긴급 자문",
    priceFrom: "30만원~/시간",
    duration: "1~2시간",
    badge: "빠른 연결",
  },
  {
    type: "scout",
    label: "인재추천 · 스카웃",
    description: "임원급 전문가 채용 추천",
    priceFrom: "성공 수수료",
    duration: "3일 내 후보 제안",
    badge: "신규",
  },
];
