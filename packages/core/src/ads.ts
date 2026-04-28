// 광고 플랫폼 인터페이스 (ADR-011 · M18+ dormant)
// 활성화 조건: MAU >= 50K + MAVJ >= 5K + NPS >= +30
// 코드는 architecturally ready. ad_slots.active=false 기본값으로 inactive.

export type AdSlotType =
  | "top_banner" // CPC, 워커 앱 상단 (광고 칩 명확 표시)
  | "category_premium" // 카테고리별 우선 노출
  | "b2b_premium" // 월정액 + 우선 매칭 (욜드족 자문 풀 핵심)
  | "data_insights"; // 시니어 노동시장 통계 구독

export type AdRateUnit = "per_click" | "per_month" | "per_quarter";

export interface AdSlot {
  id: string;
  slot_type: AdSlotType;
  active: boolean; // M18 게이트
  rate_krw: number | null;
  rate_unit: AdRateUnit | null;
  notes: string | null;
  created_at: string;
}

export type AdPaymentStatus = "pending" | "authorized" | "paid" | "failed" | "refunded";

export interface AdPayment {
  id: string;
  advertiser_employer_id: string | null;
  slot_id: string;
  amount_krw: number;
  status: AdPaymentStatus;
  portone_imp_uid: string | null;
  portone_txid: string | null;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}

/**
 * 광고 모드 활성화 검사 (M18 트리거)
 * 호출 시점: 광고 슬롯 노출 직전, 광고주 결제 시도 전.
 * 구현은 M18에 추가. 현재는 항상 false 반환.
 */
export function isAdSystemActive(): boolean {
  // M18 활성화 시점: 환경 변수 + ad_slots.active 토글 확인.
  // 현재 dormant — kill switch reverse 패턴.
  return false;
}
