// 워커 앱 — 오늘 일감 탭
// match-engine Edge Function 호출 → 결과 렌더 → 원탭 지원 (PRD M1)
// 클라이언트 사이드 업종 필터 + 시급 정렬

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
} from "react-native";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface MatchedJob {
  job_id: string;
  title: string;
  dong_code: string;
  shift_start_at: string;
  shift_end_at: string;
  hourly_wage_krw: number;
  headcount: number;
  vertical: string | null;
  score: number;
}

const KST_TZ = "Asia/Seoul";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: KST_TZ, hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const kstStr = d.toLocaleString("ko-KR", { timeZone: KST_TZ });
  const kstDate = new Date(kstStr);
  const m = d.toLocaleString("ko-KR", { timeZone: KST_TZ, month: "numeric" });
  const day = d.toLocaleString("ko-KR", { timeZone: KST_TZ, day: "numeric" });
  return `${m}/${day}(${days[kstDate.getDay()]})`;
}

function formatKRW(n: number) {
  return n.toLocaleString();
}

const VERTICAL_LABEL: Record<string, string> = {
  logistics: "물류·배송",
  retail:    "유통·매장",
  fnb:       "식음료",
};

type SortMode = "score" | "wage";

async function fetchMatchedJobs(workerId: string): Promise<MatchedJob[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const res = await fetch(`${SUPABASE_URL}/functions/v1/match-engine`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ worker_id: workerId, limit: 20 }),
  });

  if (!res.ok) return [];
  const json = await res.json();
  return json.jobs ?? [];
}

async function applyToJob(workerId: string, jobId: string): Promise<boolean> {
  const { error } = await supabase.from("job_applications").insert({
    worker_id: workerId,
    job_id: jobId,
  });
  return !error;
}

export default function JobsScreen() {
  const [jobs, setJobs] = useState<MatchedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [filterVertical, setFilterVertical] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("score");

  const loadJobs = useCallback(async (wid: string) => {
    const result = await fetchMatchedJobs(wid);
    setJobs(result);
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
        await loadJobs(worker.id);
      }
      setLoading(false);
    })();
  }, [loadJobs]);

  const onRefresh = useCallback(async () => {
    if (!workerId) return;
    setRefreshing(true);
    await loadJobs(workerId);
    setRefreshing(false);
  }, [workerId, loadJobs]);

  const handleApply = useCallback(
    async (job: MatchedJob) => {
      if (!workerId) return;
      setApplying(job.job_id);
      const ok = await applyToJob(workerId, job.job_id);
      setApplying(null);

      if (ok) {
        setJobs((prev) => prev.filter((j) => j.job_id !== job.job_id));
        Alert.alert(
          "지원 완료",
          `${job.title}에 지원했습니다.\n확정 시 알림톡으로 안내드립니다.`,
        );
      } else {
        Alert.alert("오류", "지원 처리 중 문제가 발생했습니다. 다시 시도해 주세요.");
      }
    },
    [workerId],
  );

  const availableVerticals = useMemo(() => {
    const vs = new Set(jobs.map((j) => j.vertical).filter(Boolean) as string[]);
    return Array.from(vs);
  }, [jobs]);

  const displayedJobs = useMemo(() => {
    let list = filterVertical
      ? jobs.filter((j) => j.vertical === filterVertical)
      : jobs;
    if (sortMode === "wage") {
      list = [...list].sort((a, b) => b.hourly_wage_krw - a.hourly_wage_krw);
    }
    return list;
  }, [jobs, filterVertical, sortMode]);

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
        data={displayedJobs}
        keyExtractor={(item) => item.job_id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#c9a84c"
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerLabel}>TODAY'S JOBS</Text>
            <Text style={styles.headerTitle}>오늘 할 수 있는 일자리</Text>
            {jobs.length > 0 && (
              <Text style={styles.headerSub}>
                맞춤 공고 {jobs.length}건 — 거리·시급·요일 기준
              </Text>
            )}

            {/* 필터 + 정렬 */}
            {jobs.length > 0 && (
              <View style={styles.filterRow}>
                {/* 업종 필터 */}
                <TouchableOpacity
                  style={[styles.filterChip, filterVertical === null && styles.filterChipActive]}
                  onPress={() => setFilterVertical(null)}
                  accessibilityRole="button"
                  accessibilityLabel="전체"
                >
                  <Text style={[styles.filterChipText, filterVertical === null && styles.filterChipTextActive]}>전체</Text>
                </TouchableOpacity>
                {availableVerticals.map((v) => (
                  <TouchableOpacity
                    key={v}
                    style={[styles.filterChip, filterVertical === v && styles.filterChipActive]}
                    onPress={() => setFilterVertical(filterVertical === v ? null : v)}
                    accessibilityRole="button"
                    accessibilityLabel={VERTICAL_LABEL[v] ?? v}
                  >
                    <Text style={[styles.filterChipText, filterVertical === v && styles.filterChipTextActive]}>
                      {VERTICAL_LABEL[v] ?? v}
                    </Text>
                  </TouchableOpacity>
                ))}

                {/* 구분선 */}
                <View style={styles.filterDivider} />

                {/* 정렬 토글 */}
                <TouchableOpacity
                  style={styles.sortBtn}
                  onPress={() => setSortMode((m) => m === "score" ? "wage" : "score")}
                  accessibilityRole="button"
                  accessibilityLabel={sortMode === "score" ? "시급순으로 정렬" : "추천순으로 정렬"}
                >
                  <Text style={styles.sortBtnText}>
                    {sortMode === "score" ? "추천순 ↕" : "시급순 ↕"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>현재 맞는 공고가 없습니다</Text>
            <Text style={styles.emptySub}>
              선호 동네·요일·업종을 설정하면 더 많은 공고가 보입니다.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={styles.card}
            accessible
            accessibilityLabel={`${item.title}, 시급 ${formatKRW(item.hourly_wage_krw)}원, ${formatDate(item.shift_start_at)} ${formatTime(item.shift_start_at)}부터`}
          >
            {/* 버티컬 태그 */}
            <View style={styles.cardTop}>
              {item.vertical && (
                <View style={styles.verticalBadge}>
                  <Text style={styles.verticalText}>
                    {item.vertical.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            {/* 제목 */}
            <Text style={styles.jobTitle}>{item.title}</Text>

            {/* 날짜·시간·시급 */}
            <Text style={styles.jobMeta}>
              {formatDate(item.shift_start_at)}{" "}
              {formatTime(item.shift_start_at)}~{formatTime(item.shift_end_at)}
            </Text>
            <Text style={styles.jobWage}>
              시급{" "}
              <Text style={styles.jobWageAmt}>
                {formatKRW(item.hourly_wage_krw)}원
              </Text>
            </Text>

            {/* 원탭 지원 */}
            <TouchableOpacity
              style={[
                styles.applyBtn,
                applying === item.job_id && styles.applyBtnLoading,
              ]}
              onPress={() => handleApply(item)}
              disabled={applying === item.job_id}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`${item.title} 지원하기`}
            >
              <Text style={styles.applyBtnText}>
                {applying === item.job_id ? "지원 중..." : "이 일 할래요"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f5f0",
  },
  center: {
    flex: 1,
    backgroundColor: "#f7f5f0",
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  headerLabel: {
    fontFamily: "DM Mono",
    fontSize: 10,
    letterSpacing: 2.5,
    color: "#2dd4bf",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0d1b2a",
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 13,
    color: "#718096",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderLeftWidth: 3,
    borderLeftColor: "#c9a84c",
  },
  cardTop: {
    flexDirection: "row",
    marginBottom: 8,
  },
  verticalBadge: {
    backgroundColor: "rgba(45,212,191,0.12)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  verticalText: {
    fontFamily: "DM Mono",
    fontSize: 9,
    color: "#0f766e",
    letterSpacing: 1,
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0d1b2a",
    marginBottom: 6,
    lineHeight: 23,
  },
  jobMeta: {
    fontSize: 14,
    color: "#4a5568",
    marginBottom: 2,
  },
  jobWage: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 16,
  },
  jobWageAmt: {
    fontWeight: "700",
    color: "#0d1b2a",
    fontSize: 16,
  },
  applyBtn: {
    backgroundColor: "#c9a84c",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  applyBtnLoading: {
    backgroundColor: "#e2e8f0",
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0d1b2a",
    letterSpacing: 0.3,
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginTop: 24,
  },
  filterRow: {
    flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12, alignItems: "center",
  },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#fff",
  },
  filterChipActive: {
    backgroundColor: "#0d1b2a", borderColor: "#0d1b2a",
  },
  filterChipText: {
    fontSize: 12, color: "#718096", fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#c9a84c",
  },
  filterDivider: {
    width: 1, height: 20, backgroundColor: "#e2e8f0", marginHorizontal: 2,
  },
  sortBtn: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: "rgba(45,212,191,0.3)", backgroundColor: "rgba(45,212,191,0.06)",
  },
  sortBtnText: {
    fontSize: 12, color: "#0f766e", fontFamily: "DM Mono",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0d1b2a",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySub: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
    lineHeight: 21,
  },
});
