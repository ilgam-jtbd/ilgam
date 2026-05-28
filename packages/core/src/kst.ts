// KST(Asia/Seoul) 시간 유틸리티
// 이후 모든 시간 표시는 KST 기준으로 통일 (UTC+9)

const KST_LOCALE = "ko-KR";
const KST_TZ = "Asia/Seoul";

/** ISO 문자열 → KST 날짜+시간 (예: 5/10 09:00) */
export function fmtKST(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(KST_LOCALE, {
    timeZone: KST_TZ,
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** ISO 문자열 → KST 날짜만 (예: 2026/05/10) */
export function fmtKSTDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(KST_LOCALE, {
    timeZone: KST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/** ISO 문자열 → KST 시간만 (예: 09:00) */
export function fmtKSTTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(KST_LOCALE, {
    timeZone: KST_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** ISO 문자열 → KST 요일 포함 날짜 (예: 5/10(일)) */
export function fmtKSTDateWeekday(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const m = d.toLocaleString(KST_LOCALE, { timeZone: KST_TZ, month: "numeric" });
  const day = d.toLocaleString(KST_LOCALE, { timeZone: KST_TZ, day: "numeric" });
  const wd = days[new Date(d.toLocaleString(KST_LOCALE, { timeZone: KST_TZ })).getDay()];
  return `${m}/${day}(${wd})`;
}

/** 두 ISO 문자열 간 실 근무 시간 (예: 4.0h) */
export function calcWorkedHours(start: string | null, end: string | null): string {
  if (!start || !end) return "—";
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / 3600000;
  return `${diff.toFixed(1)}h`;
}

/** 현재 KST ISO 문자열 */
export function nowKST(): string {
  return new Date().toLocaleString(KST_LOCALE, { timeZone: KST_TZ });
}
