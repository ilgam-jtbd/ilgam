import type { NotifyRequest, NotifyResult } from "./types";

// notifyAdapter: 알림톡 → 실패 시 SMS 폴백 (ADR-004)
// 실제 구현은 Edge Function `notify-dispatch` 가 담당.
// 이 모듈은 서버 사이드 호출자를 위한 타입 + 헬퍼.

export function buildAlimtalkPayload(req: NotifyRequest) {
  return {
    template_id: req.templateId,
    recipient_user_id: req.userId,
    variables: req.payload,
  };
}

export function isFallbackNeeded(errorCode: string | undefined): boolean {
  if (!errorCode) return false;
  // Bizppurio 응답 코드 기준 (예시):
  // - R001: 친구톡 차단
  // - R002: 수신 거부
  // - T001: 타임아웃
  return ["R001", "R002", "T001"].includes(errorCode);
}

export const NOTIFY_TEMPLATES = {
  workerMatchConfirmed: "ILGAM_M001",
  workerClockInReminder: "ILGAM_M002",
  workerPaymentSent: "ILGAM_M003",
  employerApplicationReceived: "ILGAM_M004",
  employerShiftApprovalNeeded: "ILGAM_M005",
  cxResolved: "ILGAM_M006",
} as const;

export type NotifyTemplateKey = keyof typeof NOTIFY_TEMPLATES;
export type { NotifyRequest, NotifyResult };
