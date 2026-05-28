// 워커 앱 — 출퇴근 체크 화면
// expo-router 파라미터: matchId, jobTitle, shiftStatus
// GPS는 React Native 내장 navigator.geolocation 사용 (권한 요청 포함)

import { useState } from "react";
import {
  View, Text, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet, Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type ClockStatus = "idle" | "locating" | "clocking" | "done" | "error";

function getActionLabel(status: string, clockStatus: ClockStatus): string {
  if (clockStatus === "locating") return "위치 확인 중…";
  if (clockStatus === "clocking") return "처리 중…";
  return status === "clocked_in" ? "퇴근 체크하기" : "출근 체크하기";
}

async function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("이 기기에서 위치 서비스를 지원하지 않습니다."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        if (err.code === 1) reject(new Error("위치 권한이 거부됐습니다. 설정에서 허용해 주세요."));
        else if (err.code === 2) reject(new Error("위치를 가져올 수 없습니다. 잠시 후 다시 시도해 주세요."));
        else reject(new Error("위치 확인 시간이 초과됐습니다."));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
}

export default function ClockScreen() {
  const { matchId, jobTitle, shiftStatus } = useLocalSearchParams<{
    matchId: string;
    jobTitle: string;
    shiftStatus: string;
  }>();

  const [status, setStatus] = useState<ClockStatus>("idle");
  const [resultMsg, setResultMsg] = useState("");

  const action = shiftStatus === "clocked_in" ? "out" : "in";
  const actionLabel = action === "in" ? "출근" : "퇴근";
  const accentColor = action === "in" ? "#c9a84c" : "#2dd4bf";

  async function handleClock() {
    if (status !== "idle" && status !== "error") return;
    setStatus("locating");

    let lat: number;
    let lng: number;
    try {
      ({ lat, lng } = await getCurrentPosition());
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "위치 확인에 실패했습니다.";
      Alert.alert("위치 오류", msg);
      setStatus("error");
      return;
    }

    setStatus("clocking");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("로그인이 필요합니다.");

      const res = await fetch(`${SUPABASE_URL}/functions/v1/clock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action, match_id: matchId, lat, lng }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? `오류 ${res.status}`);
      }

      setStatus("done");
      setResultMsg(`${actionLabel} 체크가 완료됐습니다.`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "처리 중 오류가 발생했습니다.";
      Alert.alert("오류", msg);
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <View style={styles.doneContainer}>
        <View style={[styles.doneIcon, { backgroundColor: `${accentColor}20` }]}>
          <Text style={[styles.doneCheck, { color: accentColor }]}>✓</Text>
        </View>
        <Text style={styles.doneTitle}>{actionLabel} 체크 완료</Text>
        <Text style={styles.doneSub}>{resultMsg}</Text>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="근무 내역으로 돌아가기"
        >
          <Text style={styles.doneBtnText}>근무 내역으로</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const busy = status === "locating" || status === "clocking";

  return (
    <View style={styles.container}>
      {/* 작업 헤더 */}
      <View style={[styles.actionHeader, { borderBottomColor: accentColor }]}>
        <Text style={[styles.actionType, { color: accentColor }]}>
          {actionLabel.toUpperCase()} CHECK
        </Text>
        <Text style={styles.jobTitle}>{jobTitle ?? "—"}</Text>
      </View>

      {/* 안내 */}
      <View style={styles.guide}>
        <Text style={styles.guideTitle}>체크 전 확인하세요</Text>
        {action === "in" ? (
          <>
            <Text style={styles.guideItem}>• 현재 근무지에 도착해야 합니다</Text>
            <Text style={styles.guideItem}>• 현장에서 500m 이내만 인정됩니다</Text>
            <Text style={styles.guideItem}>• GPS 정확도를 위해 실외에서 체크하세요</Text>
          </>
        ) : (
          <>
            <Text style={styles.guideItem}>• 근무를 마치고 현장에서 퇴근 체크하세요</Text>
            <Text style={styles.guideItem}>• 실제 근무 시간 기반으로 급여가 계산됩니다</Text>
            <Text style={styles.guideItem}>• 현장 500m 이내에서 체크해야 합니다</Text>
          </>
        )}
      </View>

      {/* 상태 표시 */}
      {busy && (
        <View style={styles.progressCard}>
          <ActivityIndicator color={accentColor} size="small" style={{ marginRight: 10 }} />
          <Text style={styles.progressText}>
            {status === "locating" ? "GPS 위치 확인 중…" : "서버에 전송 중…"}
          </Text>
        </View>
      )}

      {/* 체크 버튼 */}
      <TouchableOpacity
        style={[styles.clockBtn, { backgroundColor: accentColor }, busy && styles.clockBtnBusy]}
        onPress={handleClock}
        disabled={busy}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${actionLabel} 체크하기`}
      >
        {busy
          ? <ActivityIndicator color="#0d1b2a" />
          : <Text style={styles.clockBtnText}>
              {getActionLabel(shiftStatus ?? "", status)}
            </Text>
        }
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => router.back()}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="취소"
      >
        <Text style={styles.cancelText}>취소</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "#f7f5f0", padding: 24, paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  actionHeader: {
    borderBottomWidth: 2, paddingBottom: 16, marginBottom: 28,
  },
  actionType: {
    fontFamily: "DM Mono", fontSize: 11, letterSpacing: 2.5, marginBottom: 6,
  },
  jobTitle: {
    fontSize: 22, fontWeight: "700", color: "#0d1b2a", lineHeight: 30,
  },
  guide: {
    backgroundColor: "#ffffff", borderRadius: 12, padding: 18,
    borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 24,
  },
  guideTitle: {
    fontSize: 13, fontWeight: "600", color: "#0d1b2a", marginBottom: 10,
  },
  guideItem: {
    fontSize: 14, color: "#4a5568", marginBottom: 6, lineHeight: 20,
  },
  progressCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 16,
  },
  progressText: { fontSize: 14, color: "#4a5568" },
  clockBtn: {
    borderRadius: 14, paddingVertical: 20,
    alignItems: "center", justifyContent: "center",
    minHeight: 64, marginBottom: 14,
  },
  clockBtnBusy: { opacity: 0.6 },
  clockBtnText: { fontSize: 18, fontWeight: "700", color: "#0d1b2a", letterSpacing: 0.3 },
  cancelBtn: {
    borderRadius: 12, paddingVertical: 16,
    alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0",
  },
  cancelText: { fontSize: 16, color: "#718096" },
  doneContainer: {
    flex: 1, backgroundColor: "#f7f5f0",
    alignItems: "center", justifyContent: "center", padding: 32,
  },
  doneIcon: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  doneCheck: { fontSize: 36, fontWeight: "700" },
  doneTitle: { fontSize: 24, fontWeight: "700", color: "#0d1b2a", marginBottom: 10 },
  doneSub: { fontSize: 15, color: "#718096", textAlign: "center", marginBottom: 40, lineHeight: 22 },
  doneBtn: {
    backgroundColor: "#0d1b2a", borderRadius: 12,
    paddingVertical: 18, paddingHorizontal: 40,
  },
  doneBtnText: { fontSize: 16, fontWeight: "700", color: "#c9a84c" },
});
