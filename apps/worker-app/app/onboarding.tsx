// 워커 앱 — 온보딩 선호 설정 (로그인 직후 1회)
// 4단계: 1) 동네 선택  2) 선호 요일  3) 업종 선택  4) 자격증
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

// 주요 취업지역 법정동 코드 빠른 선택
const POPULAR_DONGS = [
  { code: "1150010100", name: "서울 강서구 화곡1동" },
  { code: "1153010100", name: "서울 구로구 구로동" },
  { code: "1154510100", name: "서울 금천구 가산동" },
  { code: "1156010100", name: "서울 영등포구 여의도동" },
  { code: "1162010100", name: "서울 관악구 봉천동" },
  { code: "1174010100", name: "서울 강동구 천호동" },
  { code: "4113510700", name: "경기 성남시 분당구" },
  { code: "4115010100", name: "경기 수원시 팔달구" },
  { code: "4128110100", name: "경기 고양시 덕양구" },
  { code: "4146310100", name: "경기 화성시 병점동" },
];

const CERT_OPTIONS = [
  { value: "FOOD_HYGIENE", label: "식품위생교육", emoji: "🍱" },
  { value: "COOK_BASIC",   label: "한식조리기능사", emoji: "👨‍🍳" },
  { value: "FORKLIFT",     label: "지게차 운전기능사", emoji: "🏗️" },
  { value: "DRIVING_1T",   label: "1톤 화물 운전", emoji: "🚛" },
  { value: "SECURITY",     label: "경비원 교육이수", emoji: "🛡️" },
  { value: "ELDER_CARE",   label: "요양보호사", emoji: "🤝" },
];

const TOTAL_STEPS = 4;

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [dongCode, setDongCode] = useState("");
  const [dongQuery, setDongQuery] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedVerticals, setSelectedVerticals] = useState<string[]>([]);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
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

  function toggleCert(v: string) {
    setSelectedCerts((prev) =>
      prev.includes(v) ? prev.filter((d) => d !== v) : [...prev, v],
    );
  }

  function selectDong(code: string, name: string) {
    setDongCode(code);
    setDongQuery(name);
  }

  async function handleFinish() {
    if (!dongCode) {
      Alert.alert("알림", "동네를 선택해 주세요.");
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
        cert_codes: selectedCerts,
        mentor_tags: [],
      }, { onConflict: "worker_id" });

      if (error) throw error;

      // workers 테이블에도 cert_codes 동기화
      await supabase
        .from("workers")
        .update({ cert_codes: selectedCerts })
        .eq("id", worker.id);

      router.replace("/(tabs)/jobs");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.";
      Alert.alert("오류", msg);
    } finally {
      setSaving(false);
    }
  }

  const filteredDongs = dongQuery.length >= 2 && !dongCode
    ? POPULAR_DONGS.filter((d) => d.name.includes(dongQuery))
    : [];

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
            <Text style={styles.sub}>가까운 곳의 일자리를 우선으로 보여드립니다</Text>

            <Text style={styles.inputLabel}>동네 이름으로 검색</Text>
            <TextInput
              style={styles.input}
              value={dongQuery}
              onChangeText={(t) => {
                setDongQuery(t);
                setDongCode("");
                const clean = t.replace(/\D/g, "");
                if (clean.length === 10) setDongCode(clean);
              }}
              placeholder="예) 화곡, 구로, 수원…"
              placeholderTextColor="#4a6080"
              accessibilityLabel="동네 검색"
            />

            {/* 검색 결과 */}
            {filteredDongs.length > 0 && (
              <View style={styles.suggestionBox}>
                {filteredDongs.map((d) => (
                  <TouchableOpacity
                    key={d.code}
                    style={styles.suggestionItem}
                    onPress={() => selectDong(d.code, d.name)}
                    accessibilityRole="button"
                    accessibilityLabel={d.name}
                  >
                    <Text style={styles.suggestionText}>{d.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 선택됐을 때 표시 */}
            {dongCode !== "" && (
              <View style={styles.selectedDong}>
                <Text style={styles.selectedDongText}>✓ {dongQuery || dongCode}</Text>
              </View>
            )}

            {/* 빠른 선택 */}
            {!dongCode && (
              <>
                <Text style={styles.popularLabel}>주요 취업지역 바로 선택</Text>
                <View style={styles.popularGrid}>
                  {POPULAR_DONGS.slice(0, 6).map((d) => (
                    <TouchableOpacity
                      key={d.code}
                      style={styles.popularChip}
                      onPress={() => selectDong(d.code, d.name)}
                      accessibilityRole="button"
                      accessibilityLabel={d.name}
                    >
                      <Text style={styles.popularChipText} numberOfLines={2}>{d.name.replace("서울 ", "").replace("경기 ", "")}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
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

        {/* ── Step 4: 자격증 ── */}
        {step === 4 && (
          <View>
            <Text style={styles.title}>보유하신 자격증이{"\n"}있으신가요?</Text>
            <Text style={styles.sub}>자격증이 있으면 맞는 일자리를 더 많이 받을 수 있어요 (선택 안 해도 됩니다)</Text>
            <View style={styles.certGrid}>
              {CERT_OPTIONS.map((c) => {
                const active = selectedCerts.includes(c.value);
                return (
                  <TouchableOpacity
                    key={c.value}
                    style={[styles.certCard, active && styles.certCardActive]}
                    onPress={() => toggleCert(c.value)}
                    activeOpacity={0.75}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: active }}
                    accessibilityLabel={c.label}
                  >
                    <Text style={styles.certEmoji}>{c.emoji}</Text>
                    <Text style={[styles.certLabel, active && styles.certLabelActive]} numberOfLines={2}>
                      {c.label}
                    </Text>
                    {active && (
                      <View style={styles.certCheck}>
                        <Text style={{ color: "#0d1b2a", fontSize: 10, fontWeight: "700" }}>✓</Text>
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
    paddingHorizontal: 18, paddingVertical: 16, fontSize: 17,
    marginBottom: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", minHeight: 56,
  },
  suggestionBox: {
    backgroundColor: "#1a2f45", borderRadius: 10, borderWidth: 1,
    borderColor: "rgba(201,168,76,0.3)", marginBottom: 12, overflow: "hidden",
  },
  suggestionItem: {
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)",
  },
  suggestionText: { fontSize: 15, color: "#ffffff" },
  selectedDong: {
    backgroundColor: "rgba(201,168,76,0.15)", borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: "rgba(201,168,76,0.4)", marginBottom: 16,
  },
  selectedDongText: { color: "#c9a84c", fontSize: 15, fontWeight: "600" },
  popularLabel: { fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 10, marginTop: 4 },
  popularGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  popularChip: {
    backgroundColor: "#1a2f45", borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", width: "47%",
  },
  popularChipText: { color: "rgba(255,255,255,0.8)", fontSize: 13, lineHeight: 18 },
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
  certGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  certCard: {
    width: "47%", backgroundColor: "#1a2f45", borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", alignItems: "center",
    minHeight: 90, justifyContent: "center", position: "relative",
  },
  certCardActive: { borderColor: "#c9a84c", backgroundColor: "#1f3650" },
  certEmoji: { fontSize: 26, marginBottom: 6 },
  certLabel: { fontSize: 13, color: "rgba(255,255,255,0.75)", textAlign: "center", lineHeight: 18 },
  certLabelActive: { color: "#ffffff", fontWeight: "600" },
  certCheck: {
    position: "absolute", top: 8, right: 8,
    width: 18, height: 18, borderRadius: 9, backgroundColor: "#c9a84c",
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
