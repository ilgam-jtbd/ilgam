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
