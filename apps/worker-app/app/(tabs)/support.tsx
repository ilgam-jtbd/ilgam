// 워커 앱 — 내 지원 현황 탭
// job_applications 목록 조회: 대기·수락·반려·취소 상태별 확인
// 시간: KST(Asia/Seoul) 기준

import { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, StyleSheet,
} from "react-native";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
);

interface ApplicationRecord {
  id: string;
  status: string;
  created_at: string;
  jobs: {
    title: string;
    shift_start_at: string;
    shift_end_at: string;
    hourly_wage_krw: number;
    employers: { biz_name: string } | null;
  } | null;
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "검토 중",  color: "#c9a84c", bg: "rgba(201,168,76,0.12)" },
  accepted:  { label: "수락 ✓",   color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  rejected:  { label: "반려",     color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  withdrawn: { label: "취소",     color: "#718096", bg: "rgba(113,128,150,0.12)" },
  // 구 상태값 호환
  applied:   { label: "검토 중",  color: "#c9a84c", bg: "rgba(201,168,76,0.12)" },
  selected:  { label: "수락 ✓",   color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  cancelled: { label: "취소",     color: "#718096", bg: "rgba(113,128,150,0.12)" },
};

function fmtKST(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

function fmtKSTDateShort(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric", day: "numeric",
  });
}

export default function SupportScreen() {
  const [apps, setApps] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workerId, setWorkerId] = useState<string | null>(null);

  const loadApps = useCallback(async (wid: string) => {
    const { data } = await supabase
      .from("job_applications")
      .select(`
        id, status, created_at,
        jobs (
          title, shift_start_at, shift_end_at, hourly_wage_krw,
          employers ( biz_name )
        )
      `)
      .eq("worker_id", wid)
      .order("created_at", { ascending: false })
      .limit(50);

    setApps((data ?? []) as unknown as ApplicationRecord[]);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: worker } = await supabase
        .from("workers").select("id").eq("profile_id", user.id).single();

      if (worker?.id) {
        setWorkerId(worker.id);
        await loadApps(worker.id);
      }
      setLoading(false);
    })();
  }, [loadApps]);

  const onRefresh = useCallback(async () => {
    if (!workerId) return;
    setRefreshing(true);
    await loadApps(workerId);
    setRefreshing(false);
  }, [workerId, loadApps]);

  async function handleWithdraw(appId: string, jobTitle: string) {
    Alert.alert(
      "지원 취소",
      `${jobTitle} 지원을 취소하시겠습니까?`,
      [
        { text: "아니오", style: "cancel" },
        {
          text: "취소",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("job_applications")
              .update({ status: "withdrawn" })
              .eq("id", appId);
            if (error) Alert.alert("오류", error.message);
            else if (workerId) await loadApps(workerId);
          },
        },
      ],
    );
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#c9a84c" size="large" /></View>;
  }

  const pending = apps.filter((a) => ["pending", "applied"].includes(a.status));
  const accepted = apps.filter((a) => ["accepted", "selected"].includes(a.status));

  return (
    <View style={styles.container}>
      <FlatList
        data={apps}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c9a84c" />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.headerLabel}>MY APPLICATIONS</Text>
              <Text style={styles.headerTitle}>내 지원 현황</Text>
            </View>

            {/* 요약 */}
            <View style={styles.summaryRow}>
              {[
                { label: "검토 중", value: pending.length, color: "#c9a84c" },
                { label: "수락",   value: accepted.length, color: "#4ade80" },
                { label: "전체",   value: apps.length, color: "#2dd4bf" },
              ].map(({ label, value, color }) => (
                <View key={label} style={[styles.summaryCard, { borderTopColor: color }]}>
                  <Text style={[styles.summaryValue, { color }]}>{value}</Text>
                  <Text style={styles.summaryLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>지원 내역이 없습니다</Text>
            <Text style={styles.emptySub}>일감 탭에서 공고에 지원해 보세요.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const job = item.jobs;
          const st = STATUS_CFG[item.status] ?? { label: item.status, color: "#718096", bg: "#f7f5f0" };
          const canWithdraw = ["pending", "applied"].includes(item.status);

          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.badge, { backgroundColor: st.bg }]}>
                  <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
                </View>
                <Text style={styles.dateText}>{fmtKST(item.created_at)} 지원</Text>
              </View>

              <Text style={styles.jobTitle}>{job?.title ?? "—"}</Text>

              {job && (
                <>
                  <Text style={styles.meta}>
                    {job.employers?.biz_name ?? ""} · {fmtKSTDateShort(job.shift_start_at)}
                  </Text>
                  <Text style={styles.wage}>
                    시급 <Text style={styles.wageAmt}>{job.hourly_wage_krw.toLocaleString()}원</Text>
                  </Text>
                </>
              )}

              {/* 수락된 경우 알림톡 안내 */}
              {["accepted", "selected"].includes(item.status) && (
                <View style={styles.acceptedBanner}>
                  <Text style={styles.acceptedText}>매칭 확정! 알림톡으로 상세 내용을 확인해 주세요.</Text>
                </View>
              )}

              {/* 취소 버튼 */}
              {canWithdraw && (
                <TouchableOpacity
                  style={styles.withdrawBtn}
                  onPress={() => handleWithdraw(item.id, job?.title ?? "해당 공고")}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel="지원 취소"
                >
                  <Text style={styles.withdrawText}>지원 취소</Text>
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
  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 18 },
  summaryCard: {
    flex: 1, backgroundColor: "#fff", borderRadius: 10, padding: 12,
    borderTopWidth: 3, borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center",
  },
  summaryValue: { fontSize: 22, fontWeight: "700", marginBottom: 2 },
  summaryLabel: { fontSize: 11, color: "#718096" },
  emptyCard: {
    backgroundColor: "#fff", borderRadius: 12, padding: 32, alignItems: "center",
    borderWidth: 1, borderColor: "#e2e8f0", marginTop: 20,
  },
  emptyTitle: { fontSize: 17, fontWeight: "600", color: "#0d1b2a", marginBottom: 8, textAlign: "center" },
  emptySub: { fontSize: 14, color: "#718096", textAlign: "center" },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: "#e2e8f0", borderLeftWidth: 3, borderLeftColor: "#c9a84c",
  },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontFamily: "DM Mono", fontSize: 9, letterSpacing: 1, fontWeight: "600" },
  dateText: { fontSize: 11, color: "#718096" },
  jobTitle: { fontSize: 16, fontWeight: "600", color: "#0d1b2a", marginBottom: 4 },
  meta: { fontSize: 13, color: "#718096", marginBottom: 2 },
  wage: { fontSize: 13, color: "#718096", marginBottom: 12 },
  wageAmt: { fontWeight: "700", color: "#0d1b2a", fontSize: 14 },
  acceptedBanner: {
    backgroundColor: "rgba(74,222,128,0.12)", borderRadius: 8, padding: 10, marginBottom: 8,
  },
  acceptedText: { fontSize: 13, color: "#166534", fontWeight: "500" },
  withdrawBtn: {
    borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8,
    paddingVertical: 8, alignItems: "center",
  },
  withdrawText: { fontSize: 13, color: "#718096" },
});
