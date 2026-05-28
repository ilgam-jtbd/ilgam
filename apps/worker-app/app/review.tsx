// 워커 앱 — 근무 후 구인자 평가 화면
// Route params: shiftId, jobTitle, employerId

import { useState } from "react";
import {
  View, Text, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet, Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
);

const STARS = [1, 2, 3, 4, 5];
const STAR_LABELS: Record<number, string> = {
  1: "많이 아쉬웠어요",
  2: "조금 아쉬웠어요",
  3: "보통이에요",
  4: "좋았어요",
  5: "아주 좋았어요!",
};

export default function ReviewScreen() {
  const { shiftId, jobTitle } = useLocalSearchParams<{
    shiftId: string;
    jobTitle: string;
  }>();

  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (rating === 0) {
      Alert.alert("별점 선택", "별점을 선택해 주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        shift_id: shiftId,
        author_role: "worker",
        rating,
      });
      if (error) throw error;
      setDone(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.";
      Alert.alert("오류", msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <View style={styles.doneContainer}>
        <View style={styles.doneIcon}>
          <Text style={styles.doneCheck}>✓</Text>
        </View>
        <Text style={styles.doneTitle}>리뷰가 등록됐습니다</Text>
        <Text style={styles.doneSub}>소중한 피드백 감사합니다 😊</Text>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="내 근무로 돌아가기"
        >
          <Text style={styles.doneBtnText}>내 근무로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>REVIEW</Text>
        <Text style={styles.headerTitle}>이번 근무 어떠셨나요?</Text>
        <Text style={styles.headerSub}>{jobTitle ?? "근무"}</Text>
      </View>

      {/* 별점 */}
      <View style={styles.starsContainer}>
        {STARS.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setRating(s)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${s}점`}
          >
            <Text style={[styles.star, s <= rating && styles.starActive]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      {rating > 0 && (
        <Text style={styles.ratingLabel}>{STAR_LABELS[rating]}</Text>
      )}

      <TouchableOpacity
        style={[styles.submitBtn, (submitting || rating === 0) && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={submitting || rating === 0}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="리뷰 등록하기"
      >
        {submitting
          ? <ActivityIndicator color="#0d1b2a" />
          : <Text style={styles.submitBtnText}>리뷰 등록하기</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipBtn}
        onPress={() => router.back()}
        disabled={submitting}
        accessibilityRole="button"
        accessibilityLabel="건너뛰기"
      >
        <Text style={styles.skipText}>건너뛰기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "#f7f5f0", padding: 28,
    paddingTop: Platform.OS === "ios" ? 64 : 44, alignItems: "center",
  },
  header: { alignItems: "center", marginBottom: 48 },
  headerLabel: { fontFamily: "DM Mono", fontSize: 10, color: "#2dd4bf", letterSpacing: 2.5, marginBottom: 8 },
  headerTitle: { fontSize: 26, fontWeight: "700", color: "#0d1b2a", textAlign: "center", marginBottom: 8 },
  headerSub: { fontSize: 15, color: "#718096", textAlign: "center" },
  starsContainer: { flexDirection: "row", gap: 12, marginBottom: 16 },
  star: { fontSize: 48, color: "#e2e8f0" },
  starActive: { color: "#c9a84c" },
  ratingLabel: {
    fontSize: 15, color: "#4a5568", marginBottom: 48,
    fontWeight: "500", textAlign: "center",
  },
  submitBtn: {
    width: "100%", backgroundColor: "#c9a84c", borderRadius: 14,
    paddingVertical: 20, alignItems: "center", minHeight: 64, marginBottom: 12,
  },
  submitBtnDisabled: { opacity: 0.45 },
  submitBtnText: { fontSize: 18, fontWeight: "700", color: "#0d1b2a", letterSpacing: 0.3 },
  skipBtn: {
    paddingVertical: 16, width: "100%", alignItems: "center",
    borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12,
  },
  skipText: { fontSize: 16, color: "#718096" },
  doneContainer: {
    flex: 1, backgroundColor: "#f7f5f0",
    alignItems: "center", justifyContent: "center", padding: 32,
  },
  doneIcon: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(201,168,76,0.15)",
    alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  doneCheck: { fontSize: 36, fontWeight: "700", color: "#c9a84c" },
  doneTitle: { fontSize: 24, fontWeight: "700", color: "#0d1b2a", marginBottom: 10 },
  doneSub: { fontSize: 15, color: "#718096", textAlign: "center", marginBottom: 40 },
  doneBtn: {
    backgroundColor: "#0d1b2a", borderRadius: 12,
    paddingVertical: 18, paddingHorizontal: 40,
  },
  doneBtnText: { fontSize: 16, fontWeight: "700", color: "#c9a84c" },
});
