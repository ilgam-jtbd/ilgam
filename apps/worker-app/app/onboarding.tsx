// 워커 앱 — 온보딩 선호 설정 (로그인 직후 1회)
// 3단계: 1) 동네 선택  2) 선호 요일  3) 업종 선택
// 완료 시 worker_preferences upsert → (tabs)/jobs 탭으로 이동

import { useState } from "react";
import {
  View, Text, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, Alert, StyleSheet,
} from "react-native";
import { createClient } from "@supabase/supabase-js";
import { router } from "expo-router";

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
);

const WEEKDAYS = [
  { value: 0, label: "일" },
  { value: 1, label: "월" },
  { value: 2, label: "화" },
  { value: 3, label: "수" },
  { value: 4, label: "목" },
  { value: 5, label: "금" },
  { value: 6, label: "토" },
];

const VERTICALS = [
  { value: "logistics", label: "물류·배송", emoji: "📦" },
  { value: "retail",    label: "유통·매장", emoji: "🛒" },
  { value: "fnb",       label: "식음료",    emoji: "🍽️" },
];

const TOTAL_STEPS = 3;

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [dongCode, setDongCode] = useState("");
  const [dongQuery, setDongQuery] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedVerticals, setSelectedVerticals] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function toggleDay(v: number) {
    setSelectedDays((prev) =>
      prev.includes(v) ? prev.filter((d) => d !== v) : [...prev, v],
    );
  }

  function toggleVertical(v: string) {
    setSelectedVerticals((prev) =>
      prev.includes(v) ? prev.filter((d) => d !== v) : [...prev, v],
    );
  }

  async function handleFinish() {
    if (!dongCode) {
      Alert.alert("알림", "동네 코드를 입력해 주세요.");
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      const { data: worker } = await supabase
        .from("workers")
        .select("id")
        .eq("profile_id", user.id)
        .single();

      if (!worker?.id) throw new Error("워커 프로필이 없습니다.");

      const { error } = await supabase.from("worker_preferences").upsert({
        worker_id: worker.id,
        home_dong_code: dongCode,
        preferred_weekdays: selectedDays,
        preferred_verticals: selectedVerticals,
        cert_codes: [],
        mentor_tags: [],
      }, { onConflict: "worker_id" });

      if (error) throw error;

      router.replace("/(tabs)/jobs");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.";
      Alert.alert("오류", msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* 진행 바 */}
      <View style={styles.progressBar}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View
            key={i}
            style={[styles.progressSegment, i < step && styles.progressSegmentActive]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>STEP {step} / {TOTAL_STEPS}</Text>

        {/* ── Step 1: 동네 ── */}
        {step === 1 && (
          <View>
            <Text style={styles.title}>주로 일하고 싶은{"\n"}동네를 알려주세요</Text>
            <Text style={styles.sub}>가까운 곳의 일감을 우선으로 보여드립니다</Text>
            <Text style={styles.inputLabel}>법정동 코드 (10자리)</Text>
            <TextInput
              style={styles.input}
              value={dongQuery}
              onChangeText={(t) => {
                setDongQuery(t);
                const clean = t.replace(/\D/g, "").slice(0, 10);
                if (clean.length === 10) setDongCode(clean);
                else setDongCode("");
              }}
              placeholder="예) 1150010100 (강서구 화곡1동)"
              placeholderTextColor="#4a6080"
              keyboardType="numeric"
              maxLength={10}
              accessibilityLabel="법정동 코드 입력"
            />
            <Text style={styles.hint}>
              법정동 코드는 행정안전부 코드 체계를 따릅니다.{"\n"}
              예: 서울 강서구 화곡1동 = 1150010100
            </Text>
          </View>
        )}

        {/* ── Step 2: 요일 ── */}
        {step === 2 && (
          <View>
            <Text style={styles.title}>선호하는 근무 요일을{"\n"}선택해 주세요</Text>
            <Text style={styles.sub}>복수 선택 가능합니다 (선택 안 해도 됩니다)</Text>
            <View style={styles.chipRow}>
              {WEEKDAYS.map((d) => {
                const active = selectedDays.includes(d.value);
                return (
                  <TouchableOpacity
                    key={d.value}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleDay(d.value)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: active }}
                    accessibilityLabel={`${d.label}요일`}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Step 3: 업종 ── */}
        {step === 3 && (
          <View>
            <Text style={styles.title}>어떤 업종이{"\n"}편하세요?</Text>
            <Text style={styles.sub}>복수 선택 가능합니다 (선택 안 해도 됩니다)</Text>
            <View style={styles.verticalList}>
              {VERTICALS.map((v) => {
                const active = selectedVerticals.includes(v.value);
                return (
                  <TouchableOpacity
                    key={v.value}
                    style={[styles.verticalCard, active && styles.verticalCardActive]}
                    onPress={() => toggleVertical(v.value)}
                    activeOpacity={0.75}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: active }}
                    accessibilityLabel={v.label}
                  >
                    <Text style={styles.verticalEmoji}>{v.emoji}</Text>
                    <Text style={[styles.verticalLabel, active && styles.verticalLabelActive]}>
                      {v.label}
                    </Text>
                    {active && (
                      <View style={styles.checkMark}>
                        <Text style={{ color: "#0d1b2a", fontSize: 12, fontWeight: "700" }}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setStep((s) => s - 1)}
            accessibilityRole="button"
            accessibilityLabel="이전 단계"
          >
            <Text style={styles.backText}>이전</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, saving && styles.nextBtnLoading]}
          onPress={step < TOTAL_STEPS ? () => setStep((s) => s + 1) : handleFinish}
          disabled={saving || (step === 1 && !dongCode)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={step < TOTAL_STEPS ? "다음 단계" : "완료"}
        >
          {saving
            ? <ActivityIndicator color="#0d1b2a" />
            : <Text style={styles.nextText}>{step < TOTAL_STEPS ? "다음" : "완료, 일감 보러 가기"}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1b2a" },
  progressBar: { flexDirection: "row", gap: 4, padding: 20, paddingBottom: 8, paddingTop: 52 },
  progressSegment: { flex: 1, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.15)" },
  progressSegmentActive: { backgroundColor: "#c9a84c" },
  content: { padding: 24, paddingBottom: 120 },
  stepLabel: { fontFamily: "DM Mono", fontSize: 10, color: "#2dd4bf", letterSpacing: 2.5, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: "700", color: "#ffffff", lineHeight: 38, marginBottom: 8 },
  sub: { fontSize: 15, color: "rgba(255,255,255,0.55)", marginBottom: 28, lineHeight: 22 },
  inputLabel: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 8, fontWeight: "500" },
  input: {
    backgroundColor: "#1a2f45", color: "#ffffff", borderRadius: 10,
    paddingHorizontal: 18, paddingVertical: 16, fontSize: 20, letterSpacing: 2,
    marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", minHeight: 56,
  },
  hint: { fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 18 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    width: 52, height: 52, borderRadius: 26, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center",
  },
  chipActive: { backgroundColor: "#c9a84c", borderColor: "#c9a84c" },
  chipText: { fontSize: 16, fontWeight: "600", color: "rgba(255,255,255,0.7)" },
  chipTextActive: { color: "#0d1b2a" },
  verticalList: { gap: 12 },
  verticalCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#1a2f45", borderRadius: 14, padding: 18,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", minHeight: 72,
  },
  verticalCardActive: { borderColor: "#c9a84c", backgroundColor: "#1f3650" },
  verticalEmoji: { fontSize: 28 },
  verticalLabel: { fontSize: 17, color: "rgba(255,255,255,0.8)", fontWeight: "500", flex: 1 },
  verticalLabelActive: { color: "#ffffff", fontWeight: "700" },
  checkMark: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: "#c9a84c",
    alignItems: "center", justifyContent: "center",
  },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 36,
    backgroundColor: "#0d1b2a", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)",
    flexDirection: "row", gap: 10,
  },
  backBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 18, alignItems: "center",
    justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", minHeight: 56,
  },
  backText: { fontSize: 16, color: "rgba(255,255,255,0.7)", fontWeight: "500" },
  nextBtn: {
    flex: 3, backgroundColor: "#c9a84c", borderRadius: 12, paddingVertical: 18,
    alignItems: "center", justifyContent: "center", minHeight: 56,
  },
  nextBtnLoading: { backgroundColor: "#e2e8f0" },
  nextText: { fontSize: 17, fontWeight: "700", color: "#0d1b2a", letterSpacing: 0.2 },
});
