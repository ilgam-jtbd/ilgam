// 내 근무 탭 — 시니어 UX: 당일 입금 카드 + 월 누적 · 최근 근무 이력
// ADR-003: 18pt 기본 · 48dp 터치 · WCAG AAA 7:1 · 하단 안전존 CTA
// 실 구현 시 supabase-js로 shifts + payments join 쿼리로 교체 (ADR-004)

import {
  View,
  Text,
  ScrollView,
  Pressable,
  SectionList,
} from "react-native";
import { colors, typography, spacing, radius, touch } from "@ilgam/design-tokens";
import { useRouter } from "expo-router";

// ─── 샘플 이력 (실연동 시 RPC `worker_shift_history`로 교체) ──────────────
type HistoryRow = {
  id: string;
  job_title: string;
  employer_name: string;
  worked_on: string; // yyyy-mm-dd
  worked_minutes: number;
  gross_krw: number;
  net_krw: number;
  status: "settled" | "pending" | "disputed";
  settled_at: string | null;
};

const MOCK_HISTORY: HistoryRow[] = [
  {
    id: "sh-2026-0423",
    job_title: "강서 쿠팡 물류센터 피킹 보조",
    employer_name: "쿠팡풀필먼트서비스",
    worked_on: "2026-04-23",
    worked_minutes: 240,
    gross_krw: 48000,
    net_krw: 46080,
    status: "settled",
    settled_at: "2026-04-23T18:02:11+09:00",
  },
  {
    id: "sh-2026-0421",
    job_title: "송파 베이커리 오전 프렙 보조",
    employer_name: "파리바게뜨 방이점",
    worked_on: "2026-04-21",
    worked_minutes: 240,
    gross_krw: 48000,
    net_krw: 46080,
    status: "settled",
    settled_at: "2026-04-21T12:47:03+09:00",
  },
  {
    id: "sh-2026-0418",
    job_title: "강남 오피스 청소",
    employer_name: "삼성SDS 빌딩",
    worked_on: "2026-04-18",
    worked_minutes: 180,
    gross_krw: 36000,
    net_krw: 34560,
    status: "settled",
    settled_at: "2026-04-18T11:15:22+09:00",
  },
  {
    id: "sh-2026-0415",
    job_title: "요양원 식사 보조",
    employer_name: "실버그린 요양원",
    worked_on: "2026-04-15",
    worked_minutes: 300,
    gross_krw: 60000,
    net_krw: 57600,
    status: "settled",
    settled_at: "2026-04-15T20:31:09+09:00",
  },
];

// 이번 달 집계 (실연동 시 view or RPC)
const MONTH_SUMMARY = {
  month_label: "2026년 4월",
  total_shifts: 8,
  total_minutes: 2040,
  total_net_krw: 384480,
};

// ─── 포매터 ────────────────────────────────────────────────────────────────
function formatKrw(n: number): string {
  return `${n.toLocaleString("ko-KR")}원`;
}
function formatHours(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}
function formatDate(ymd: string): string {
  const [, mm, dd] = ymd.split("-");
  return `${Number(mm)}월 ${Number(dd)}일`;
}

// ─── 상태 배지 ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: HistoryRow["status"] }) {
  const map = {
    settled: { label: "입금 완료", bg: "#E6F4EC", fg: colors.success },
    pending: { label: "승인 대기", bg: "#FFF4E0", fg: colors.warning },
    disputed: { label: "이의 제기", bg: "#FDECEA", fg: colors.danger },
  } as const;
  const s = map[status];
  return (
    <View
      style={{
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: radius.sm,
        backgroundColor: s.bg,
      }}
    >
      <Text style={{ fontSize: typography.sizes.xs, color: s.fg, fontWeight: "700" }}>
        {s.label}
      </Text>
    </View>
  );
}

// ─── 이력 카드 ─────────────────────────────────────────────────────────────
function HistoryCard({ row }: { row: HistoryRow }) {
  return (
    <View
      accessibilityRole="summary"
      style={{
        backgroundColor: colors.white,
        borderRadius: radius.md,
        padding: spacing.lg,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.gray[200],
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: spacing.sm,
        }}
      >
        <Text
          style={{
            fontSize: typography.sizes.sm,
            color: colors.gray[600],
            fontWeight: "600",
          }}
        >
          {formatDate(row.worked_on)}
        </Text>
        <StatusBadge status={row.status} />
      </View>

      <Text
        style={{
          fontSize: typography.sizes.base,
          color: colors.navy[800],
          fontWeight: "700",
          marginBottom: 2,
        }}
        numberOfLines={2}
      >
        {row.job_title}
      </Text>
      <Text
        style={{
          fontSize: typography.sizes.sm,
          color: colors.gray[600],
          marginBottom: spacing.md,
        }}
      >
        {row.employer_name} · {formatHours(row.worked_minutes)}
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderTopWidth: 1,
          borderTopColor: colors.gray[100],
          paddingTop: spacing.md,
        }}
      >
        <View>
          <Text style={{ fontSize: typography.sizes.xs, color: colors.gray[500] }}>
            실수령액
          </Text>
          <Text
            style={{
              fontSize: typography.sizes.lg,
              color: colors.navy[800],
              fontWeight: "700",
            }}
          >
            {formatKrw(row.net_krw)}
          </Text>
        </View>
        <Text style={{ fontSize: typography.sizes.xs, color: colors.gray[400] }}>
          (세전 {formatKrw(row.gross_krw)})
        </Text>
      </View>
    </View>
  );
}

// ─── 메인 스크린 ──────────────────────────────────────────────────────────
export default function MineScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.gray[50] }}
      contentContainerStyle={{ paddingVertical: spacing.lg, paddingBottom: touch.bottomSafeZoneHeight }}
    >
      {/* 월 누적 카드 */}
      <View
        style={{
          marginHorizontal: spacing.lg,
          marginBottom: spacing.lg,
          padding: spacing.xl,
          borderRadius: radius.lg,
          backgroundColor: colors.navy[800],
        }}
      >
        <Text
          style={{
            fontSize: typography.sizes.sm,
            color: colors.navy[200],
            marginBottom: spacing.xs,
          }}
        >
          {MONTH_SUMMARY.month_label} 누적
        </Text>
        <Text
          style={{
            fontSize: typography.sizes.xxl,
            color: colors.white,
            fontWeight: "700",
            letterSpacing: -0.5,
          }}
        >
          {formatKrw(MONTH_SUMMARY.total_net_krw)}
        </Text>
        <View
          style={{
            flexDirection: "row",
            marginTop: spacing.lg,
            borderTopWidth: 1,
            borderTopColor: colors.navy[600],
            paddingTop: spacing.md,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: typography.sizes.xs, color: colors.navy[200] }}>
              근무 횟수
            </Text>
            <Text
              style={{
                fontSize: typography.sizes.md,
                color: colors.white,
                fontWeight: "600",
                marginTop: 2,
              }}
            >
              {MONTH_SUMMARY.total_shifts}회
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: typography.sizes.xs, color: colors.navy[200] }}>
              총 근무 시간
            </Text>
            <Text
              style={{
                fontSize: typography.sizes.md,
                color: colors.white,
                fontWeight: "600",
                marginTop: 2,
              }}
            >
              {formatHours(MONTH_SUMMARY.total_minutes)}
            </Text>
          </View>
        </View>
      </View>

      {/* 섹션 헤더 */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginHorizontal: spacing.lg,
          marginBottom: spacing.md,
        }}
      >
        <Text
          style={{
            fontSize: typography.sizes.md,
            color: colors.navy[800],
            fontWeight: "700",
          }}
        >
          최근 근무 이력
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="내 프로필 열기"
          hitSlop={12}
          onPress={() => router.push("/profile")}
          style={{
            minHeight: touch.minTargetSize,
            justifyContent: "center",
            paddingHorizontal: spacing.md,
          }}
        >
          <Text
            style={{
              fontSize: typography.sizes.sm,
              color: colors.navy[600],
              fontWeight: "600",
            }}
          >
            프로필 →
          </Text>
        </Pressable>
      </View>

      {/* 이력 카드 리스트 */}
      {MOCK_HISTORY.map((row) => (
        <HistoryCard key={row.id} row={row} />
      ))}

      {/* 하단 안내 */}
      <Text
        style={{
          fontSize: typography.sizes.xs,
          color: colors.gray[500],
          textAlign: "center",
          marginTop: spacing.lg,
          marginHorizontal: spacing.xl,
          lineHeight: 20,
        }}
      >
        근무 완료 후 고용주 승인이 끝나면{"\n"}
        평균 1시간 내에 등록된 계좌로 입금됩니다.
      </Text>
    </ScrollView>
  );
}
