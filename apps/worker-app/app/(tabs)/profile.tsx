// 워커 앱 — 내 프로필 탭
// 이름·전화·평점·노쇼 수 + 로그아웃

import { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet, ScrollView,
} from "react-native";
import { createClient } from "@supabase/supabase-js";
import { router } from "expo-router";

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
);

interface WorkerProfile {
  display_name: string | null;
  phone_e164: string | null;
  rating_avg: number | null;
  no_show_count: number;
  created_at: string;
  preferred_weekdays: number[] | null;
  preferred_verticals: string[] | null;
  cert_codes: string[] | null;
}

const WEEKDAY_LABEL = ["일", "월", "화", "수", "목", "금", "토"];
const VERTICAL_LABEL: Record<string, string> = {
  logistics: "물류·배송",
  retail: "유통·매장",
  fnb: "식음료",
};
const CERT_LABEL: Record<string, string> = {
  FOOD_HYGIENE: "식품위생교육",
  COOK_BASIC:   "한식조리기능사",
  FORKLIFT:     "지게차 운전기능사",
  DRIVING_1T:   "1톤 화물 운전",
  SECURITY:     "경비원 교육이수",
  ELDER_CARE:   "요양보호사",
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [{ data: p }, { data: w }] = await Promise.all([
        supabase.from("profiles").select("display_name, phone_e164, created_at").eq("id", user.id).single(),
        supabase.from("workers").select("id, rating_avg, no_show_count").eq("profile_id", user.id).single(),
      ]);

      if (!w?.id) { setLoading(false); return; }

      const { data: prefs } = await supabase
        .from("worker_preferences")
        .select("preferred_weekdays, preferred_verticals, cert_codes")
        .eq("worker_id", w.id)
        .single();

      setProfile({
        display_name: p?.display_name ?? null,
        phone_e164: p?.phone_e164 ?? null,
        rating_avg: w?.rating_avg ?? null,
        no_show_count: w?.no_show_count ?? 0,
        created_at: p?.created_at ?? "",
        preferred_weekdays: prefs?.preferred_weekdays ?? null,
        preferred_verticals: prefs?.preferred_verticals ?? null,
        cert_codes: prefs?.cert_codes ?? null,
      });
      setLoading(false);
    })();
  }, []);

  async function handleLogout() {
    Alert.alert("로그아웃", "로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/");
        },
      },
    ]);
  }

  async function handleEditPrefs() {
    router.push("/onboarding");
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#c9a84c" size="large" /></View>;
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>프로필을 불러올 수 없습니다.</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const joinYear = profile.created_at
    ? new Date(profile.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long" })
    : "";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 헤더 카드 */}
      <View style={styles.avatarCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile.display_name?.[0] ?? "?"}
          </Text>
        </View>
        <Text style={styles.name}>{profile.display_name ?? "이름 미설정"}</Text>
        <Text style={styles.phone}>{profile.phone_e164 ?? ""}</Text>
        <Text style={styles.joinDate}>{joinYear} 가입</Text>

        {/* 평점·노쇼 */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {profile.rating_avg != null ? profile.rating_avg.toFixed(1) : "—"}
            </Text>
            <Text style={styles.statLabel}>평점</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, profile.no_show_count > 0 && { color: "#f87171" }]}>
              {profile.no_show_count}
            </Text>
            <Text style={styles.statLabel}>노쇼 횟수</Text>
          </View>
        </View>
      </View>

      {/* 선호 설정 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>선호 설정</Text>
          <TouchableOpacity onPress={handleEditPrefs}>
            <Text style={styles.editLink}>수정</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.prefRow}>
          <Text style={styles.prefLabel}>선호 요일</Text>
          <View style={styles.chipRow}>
            {profile.preferred_weekdays && profile.preferred_weekdays.length > 0
              ? profile.preferred_weekdays.sort().map((d) => (
                  <View key={d} style={styles.chip}>
                    <Text style={styles.chipText}>{WEEKDAY_LABEL[d]}</Text>
                  </View>
                ))
              : <Text style={styles.prefEmpty}>미설정</Text>}
          </View>
        </View>

        <View style={styles.prefRow}>
          <Text style={styles.prefLabel}>선호 업종</Text>
          <View style={styles.chipRow}>
            {profile.preferred_verticals && profile.preferred_verticals.length > 0
              ? profile.preferred_verticals.map((v) => (
                  <View key={v} style={styles.chip}>
                    <Text style={styles.chipText}>{VERTICAL_LABEL[v] ?? v}</Text>
                  </View>
                ))
              : <Text style={styles.prefEmpty}>미설정</Text>}
          </View>
        </View>

        <View style={styles.prefRow}>
          <Text style={styles.prefLabel}>보유 자격증</Text>
          <View style={styles.chipRow}>
            {profile.cert_codes && profile.cert_codes.length > 0
              ? profile.cert_codes.map((c) => (
                  <View key={c} style={styles.chip}>
                    <Text style={styles.chipText}>{CERT_LABEL[c] ?? c}</Text>
                  </View>
                ))
              : <Text style={styles.prefEmpty}>미등록</Text>}
          </View>
        </View>
      </View>

      {/* 로그아웃 */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>

      <Text style={styles.version}>VELOR v0.1 · 문의: support@velor.kr · JTBD</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f5f0" },
  content: { padding: 16, paddingBottom: 48 },
  center: { flex: 1, backgroundColor: "#f7f5f0", alignItems: "center", justifyContent: "center" },
  errorText: { fontSize: 16, color: "#718096", marginBottom: 20 },
  avatarCard: {
    backgroundColor: "#0d1b2a", borderRadius: 16, padding: 24,
    alignItems: "center", marginBottom: 16,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: "#c9a84c",
    alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  avatarText: { fontSize: 30, fontWeight: "700", color: "#0d1b2a" },
  name: { fontSize: 22, fontWeight: "700", color: "#ffffff", marginBottom: 4 },
  phone: { fontSize: 14, color: "rgba(255,255,255,0.55)", marginBottom: 4 },
  joinDate: { fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 },
  statsRow: { flexDirection: "row", alignItems: "center", width: "100%" },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "700", color: "#c9a84c" },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.1)" },
  section: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: "#0d1b2a" },
  editLink: { fontSize: 13, color: "#2dd4bf", fontWeight: "500" },
  prefRow: { marginBottom: 12 },
  prefLabel: { fontSize: 12, color: "#718096", marginBottom: 6, fontFamily: "DM Mono" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { backgroundColor: "rgba(201,168,76,0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  chipText: { fontSize: 13, color: "#92400e", fontWeight: "500" },
  prefEmpty: { fontSize: 13, color: "#a0aec0" },
  logoutBtn: {
    borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12,
    paddingVertical: 16, alignItems: "center", marginBottom: 12,
    backgroundColor: "#fff",
  },
  logoutText: { fontSize: 15, color: "#f87171", fontWeight: "600" },
  version: { fontSize: 11, color: "#a0aec0", textAlign: "center" },
});
