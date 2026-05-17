// 워커 앱 — 내 근무 내역 탭
// 최근 30일 shifts + payments 조회 (당일 입금 확인 포함)

import { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, StyleSheet,
} from "react-native";
import { createClient } from "@supabase/supabase-js";
import { router } from "expo-router";

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
);

interface ShiftRecord {
  id: string;
  match_id: string;
  clock_in_at: string | null;
  clock_out_at: string | null;
  status: string;
  matches: {
    jobs: {
      title: string;
      shift_start_at: string;
      hourly_wage_krw: number;
    } | null;
    payments: { gross_amount_krw: number; status: string }[];
  } | null;
  // 리뷰 작성 여부: worker가 이미 리뷰를 남겼는지 확인
  reviews?: { id: string; author_role: string }[];
}

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  pending:     { label: "대기",   color: "#718096" },
  clocked_in:  { label: "근무 중", color: "#2dd4bf" },
  clocked_out: { label: "완료",   color: "#4ade80" },
  no_show:     { label: "노쇼",   color: "#f87171" },
};

const PAY_CFG: Record<string, { label: string; color: string }> = {
  pending:  { label: "입금 대기", color: "#718096" },
  paid:     { label: "입금 완료", color: "#4ade80" },
  failed:   { label: "입금 실패", color: "#f87171" },
};

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

function calcHours(start: string | null, end: string | null): string {
  if (!start || !end) return "";
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / 3600000;
  return `${diff.toFixed(1)}h`;
}

export default function MineScreen() {
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);
  const [workerId, setWorkerId] = useState<string | null>(null);

  const loadShifts = useCallback(async (wid: string) => {
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data } = await supabase
      .from("shifts")
      .select(`
        id, match_id, clock_in_at, clock_out_at, status,
        matches (
          jobs ( title, shift_start_at, hourly_wage_krw ),
          payments ( gross_amount_krw, status )
        ),
        reviews ( id, author_role )
      `)
      .eq("matches.worker_id", wid)
      .gte("created_at", since30d)
      .order("created_at", { ascending: false })
      .limit(50);

    const rows = (data ?? []) as unknown as ShiftRecord[];
    setShifts(rows);

    const total = rows.reduce((sum, r) => {
      const pay = r.matches?.payments?.find((p) => p.status === "paid");
      return sum + (pay?.gross_amount_krw ?? 0);
    }, 0);
    setTotalPaid(total);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: worker } = await supabase
        .from("workers")
        .select("id")
        .eq("profile_id", user.id)
        .single();

      if (worker?.id) {
        setWorkerId(worker.id);
        await loadShifts(worker.id);
      }
      setLoading(false);
    })();
  }, [loadShifts]);

  const onRefresh = useCallback(async () => {
    if (!workerId) return;
    setRefreshing(true);
    await loadShifts(workerId);
    setRefreshing(false);
  }, [workerId, loadShifts]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#c9a84c" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={shifts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c9a84c" />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.headerLabel}>MY WORK · 최근 30일</Text>
              <Text style={styles.headerTitle}>내 근무 내역</Text>
            </View>
            {/* 수입 요약 배너 */}
            <View style={styles.earningBanner}>
              <Text style={styles.earningLabel}>30일 총 수입</Text>
              <Text style={styles.earningAmt}>
                {totalPaid > 0 ? `${totalPaid.toLocaleString()}원` : "—"}
              </Text>
              <Text style={styles.earningNote}>입금 완료 기준</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>근무 내역이 없습니다</Text>
            <Text style={styles.emptySub}>
              일감 탭에서 공고에 지원하고{"\n"}매칭이 확정되면 여기에 표시됩니다.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const job = item.matches?.jobs;
          const pay = item.matches?.payments?.[0];
          const shiftSt = STATUS_CFG[item.status] ?? { label: item.status, color: "#718096" };
          const hasWorkerReview = item.reviews?.some((r) => r.author_role === "worker");
          const paySt = pay ? (PAY_CFG[pay.status] ?? { label: pay.status, color: "#718096" }) : null;

          return (
            <View style={styles.card}>
              {/* 상태 뱃지 행 */}
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: `${shiftSt.color}20` }]}>
                  <Text style={[styles.badgeText, { color: shiftSt.color }]}>{shiftSt.label}</Text>
                </View>
                {paySt && (
                  <View style={[styles.badge, { backgroundColor: `${paySt.color}20` }]}>
                    <Text style={[styles.badgeText, { color: paySt.color }]}>{paySt.label}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.jobTitle}>{job?.title ?? "—"}</Text>

              {/* 출퇴근 시각 */}
              <View style={styles.timeRow}>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeLabel}>출근</Text>
                  <Text style={styles.timeValue}>{fmt(item.clock_in_at)}</Text>
                </View>
                <View style={styles.timeDivider} />
                <View style={styles.timeBlock}>
                  <Text style={styles.timeLabel}>퇴근</Text>
                  <Text style={styles.timeValue}>{fmt(item.clock_out_at)}</Text>
                </View>
                {item.clock_in_at && item.clock_out_at && (
                  <>
                    <View style={styles.timeDivider} />
                    <View style={styles.timeBlock}>
                      <Text style={styles.timeLabel}>실 근무</Text>
                      <Text style={[styles.timeValue, { color: "#c9a84c" }]}>
                        {calcHours(item.clock_in_at, item.clock_out_at)}
                      </Text>
                    </View>
                  </>
                )}
              </View>

              {/* 시급 + 입금액 */}
              {job && (
                <View style={styles.wageRow}>
                  <Text style={styles.wageLabel}>시급</Text>
                  <Text style={styles.wageValue}>{job.hourly_wage_krw.toLocaleString()}원</Text>
                  {pay?.status === "paid" && (
                    <>
                      <Text style={[styles.wageLabel, { marginLeft: 16 }]}>입금</Text>
                      <Text style={[styles.wageValue, { color: "#4ade80" }]}>
                        {pay.gross_amount_krw.toLocaleString()}원
                      </Text>
                    </>
                  )}
                </View>
              )}

              {/* 리뷰 버튼: 완료된 근무, 아직 리뷰 안 남긴 경우 */}
              {item.status === "clocked_out" && !hasWorkerReview && (
                <TouchableOpacity
                  style={styles.reviewBtn}
                  onPress={() =>
                    router.push({
                      pathname: "/review",
                      params: { shiftId: item.id, jobTitle: job?.title ?? "근무" },
                    })
                  }
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="리뷰 남기기"
                >
                  <Text style={styles.reviewBtnText}>★ 리뷰 남기기</Text>
                </TouchableOpacity>
              )}

              {/* 출퇴근 체크 버튼 */}
              {(item.status === "pending" || item.status === "clocked_in") && (
                <TouchableOpacity
                  style={[
                    styles.clockBtn,
                    item.status === "clocked_in" && styles.clockBtnOut,
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/clock",
                      params: {
                        matchId: item.match_id,
                        jobTitle: job?.title ?? "근무",
                        shiftStatus: item.status,
                      },
                    })
                  }
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={item.status === "clocked_in" ? "퇴근 체크" : "출근 체크"}
                >
                  <Text style={styles.clockBtnText}>
                    {item.status === "clocked_in" ? "퇴근 체크하기" : "출근 체크하기"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f5f0" },
  center: { flex: 1, backgroundColor: "#f7f5f0", alignItems: "center", justifyContent: "center" },
  list: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 14 },
  headerLabel: { fontFamily: "DM Mono", fontSize: 10, letterSpacing: 2.5, color: "#2dd4bf", marginBottom: 4 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#0d1b2a" },
  earningBanner: {
    backgroundColor: "#0d1b2a", borderRadius: 12, padding: 18, marginBottom: 18,
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  earningLabel: { fontFamily: "DM Mono", fontSize: 10, color: "#2dd4bf", letterSpacing: 2, flex: 1 },
  earningAmt: { fontSize: 20, fontWeight: "700", color: "#c9a84c" },
  earningNote: { fontSize: 11, color: "rgba(255,255,255,0.4)" },
  emptyCard: {
    backgroundColor: "#fff", borderRadius: 12, padding: 32, alignItems: "center",
    borderWidth: 1, borderColor: "#e2e8f0", marginTop: 20,
  },
  emptyTitle: { fontSize: 17, fontWeight: "600", color: "#0d1b2a", marginBottom: 8, textAlign: "center" },
  emptySub: { fontSize: 14, color: "#718096", textAlign: "center", lineHeight: 21 },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: "#e2e8f0", borderLeftWidth: 3, borderLeftColor: "#c9a84c",
  },
  badgeRow: { flexDirection: "row", gap: 6, marginBottom: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText: { fontFamily: "DM Mono", fontSize: 9, letterSpacing: 1 },
  jobTitle: { fontSize: 16, fontWeight: "600", color: "#0d1b2a", marginBottom: 12 },
  timeRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  timeBlock: { flex: 1 },
  timeLabel: { fontSize: 11, color: "#718096", marginBottom: 2, fontFamily: "DM Mono" },
  timeValue: { fontSize: 13, color: "#0d1b2a", fontWeight: "600" },
  timeDivider: { width: 1, height: 28, backgroundColor: "#e2e8f0", marginHorizontal: 8 },
  wageRow: { flexDirection: "row", alignItems: "center", gap: 4, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 10 },
  wageLabel: { fontSize: 12, color: "#718096" },
  wageValue: { fontSize: 14, fontWeight: "700", color: "#0d1b2a" },
  clockBtn: {
    marginTop: 12, backgroundColor: "#c9a84c", borderRadius: 10,
    paddingVertical: 12, alignItems: "center", minHeight: 48,
  },
  clockBtnOut: { backgroundColor: "#2dd4bf" },
  clockBtnText: { fontSize: 15, fontWeight: "700", color: "#0d1b2a" },
  reviewBtn: {
    marginTop: 10, borderWidth: 1, borderColor: "rgba(201,168,76,0.35)",
    borderRadius: 10, paddingVertical: 10, alignItems: "center",
    backgroundColor: "rgba(201,168,76,0.06)",
  },
  reviewBtnText: { fontSize: 14, fontWeight: "600", color: "#c9a84c" },
});
