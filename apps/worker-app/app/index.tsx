// 워커 앱 — 로그인 (Supabase OTP SMS)
// 3단계: 1) 전화번호 입력  2) 6자리 OTP 입력  3) 로그인 완료 → 온보딩 or 탭
// 시니어 UX: 큰 글씨(20pt+), 단일 CTA, OTP 자동 분리 표시

import { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet, KeyboardAvoidingView,
  Platform, Pressable,
} from "react-native";
import { createClient } from "@supabase/supabase-js";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
);

async function registerPushToken(profileId: string) {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;
  const { data: token } = await Notifications.getExpoPushTokenAsync();
  if (!token) return;
  const platform = Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "web";
  await supabase.from("device_tokens").upsert(
    { profile_id: profileId, token, platform, updated_at: new Date().toISOString() },
    { onConflict: "profile_id,token" },
  );
}

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  return digits.startsWith("0") ? `+82${digits.slice(1)}` : `+82${digits}`;
}

type Screen = "phone" | "otp";

export default function LandingScreen() {
  const [screen, setScreen]   = useState<Screen>("phone");
  const [phone, setPhone]     = useState("");
  const [e164, setE164]       = useState("");
  const [otp, setOtp]         = useState("");
  const [loading, setLoading] = useState(false);
  const otpRef = useRef<TextInput>(null);

  async function handleSendOtp() {
    const normalized = normalizePhone(phone);
    if (!/^\+82[0-9]{9,10}$/.test(normalized)) {
      Alert.alert("알림", "올바른 휴대폰 번호를 입력해 주세요.\n예) 010-1234-5678");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: normalized,
      options: { channel: "sms" },
    });
    setLoading(false);
    if (error) { Alert.alert("오류", error.message); return; }
    setE164(normalized);
    setOtp("");
    setScreen("otp");
    setTimeout(() => otpRef.current?.focus(), 300);
  }

  async function handleVerifyOtp() {
    if (otp.length !== 6) {
      Alert.alert("알림", "6자리 인증번호를 입력해 주세요.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: e164,
      token: otp,
      type: "sms",
    });
    setLoading(false);
    if (error) { Alert.alert("오류", error.message); return; }

    // 온보딩 여부 확인 (worker_preferences 존재하면 바로 탭으로)
    const user = data.user;
    if (!user) { router.replace("/(tabs)/jobs"); return; }

    const { data: worker } = await supabase
      .from("workers").select("id").eq("profile_id", user.id).single();

    if (!worker) { router.replace("/(tabs)/jobs"); return; }

    const { data: prefs } = await supabase
      .from("worker_preferences").select("worker_id").eq("worker_id", worker.id).single();

    // 푸시 토큰 등록 (fire-and-forget)
    registerPushToken(user.id).catch(() => {});

    if (prefs) {
      router.replace("/(tabs)/jobs");
    } else {
      router.replace("/onboarding");
    }
  }

  if (screen === "otp") {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.label}>인증번호 입력</Text>
          <Text style={styles.title}>문자를{"\n"}확인해 주세요</Text>
          <Text style={styles.sub}>
            {e164.replace(/(\+82)(\d{2})(\d{4})(\d{4})/, "0$2-$3-$4")}
            {"\n"}으로 6자리 인증번호를 보냈습니다
          </Text>
        </View>

        <View style={styles.form}>
          {/* OTP 입력 — 숨겨진 TextInput + 표시 셀 */}
          <Text style={styles.inputLabel}>인증번호 6자리</Text>
          <Pressable onPress={() => otpRef.current?.focus()}>
            <View style={styles.otpRow}>
              {Array.from({ length: 6 }).map((_, i) => (
                <View
                  key={i}
                  style={[styles.otpCell, otp.length === i && styles.otpCellActive]}
                >
                  <Text style={styles.otpChar}>{otp[i] ?? ""}</Text>
                </View>
              ))}
            </View>
          </Pressable>
          <TextInput
            ref={otpRef}
            style={styles.hiddenInput}
            value={otp}
            onChangeText={(t) => setOtp(t.replace(/\D/g, "").slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            accessibilityLabel="인증번호 입력"
          />

          <TouchableOpacity
            style={[styles.cta, (loading || otp.length !== 6) && styles.ctaLoading]}
            onPress={handleVerifyOtp}
            disabled={loading || otp.length !== 6}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="인증하기"
          >
            {loading
              ? <ActivityIndicator color="#0d1b2a" />
              : <Text style={styles.ctaText}>인증하기</Text>}
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.notice}>문자가 오지 않나요? </Text>
            <TouchableOpacity onPress={() => setScreen("phone")}>
              <Text style={styles.resendLink}>번호 다시 입력</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.resendBtn}
            onPress={handleSendOtp}
            disabled={loading}
          >
            <Text style={styles.resendBtnText}>인증번호 재발송</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.label}>SENIOR SPOTWORK</Text>
        <Text style={styles.title}>일감</Text>
        <Text style={styles.sub}>
          오늘 할 수 있는 일감을{"\n"}빠르게 찾아드립니다
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.inputLabel}>휴대폰 번호</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="010-0000-0000"
          placeholderTextColor="#4a6080"
          keyboardType="phone-pad"
          maxLength={13}
          accessibilityLabel="휴대폰 번호 입력"
        />
        <TouchableOpacity
          style={[styles.cta, (loading || phone.length < 10) && styles.ctaLoading]}
          onPress={handleSendOtp}
          disabled={loading || phone.length < 10}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="인증번호 받기"
        >
          {loading
            ? <ActivityIndicator color="#0d1b2a" />
            : <Text style={styles.ctaText}>인증번호 받기</Text>}
        </TouchableOpacity>
        <Text style={styles.notice}>가입 없이 첫 문자로 바로 시작됩니다</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1b2a", justifyContent: "space-between", padding: 28 },
  header: { marginTop: 60 },
  label: { fontFamily: "DM Mono", fontSize: 10, letterSpacing: 2.5, color: "#2dd4bf", marginBottom: 8 },
  title: { fontSize: 48, fontWeight: "700", color: "#c9a84c", marginBottom: 12, letterSpacing: -1 },
  sub: { fontSize: 17, color: "rgba(255,255,255,0.65)", lineHeight: 27 },
  form: { marginBottom: 40 },
  inputLabel: { fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 8, fontWeight: "500" },
  input: {
    backgroundColor: "#1a2f45", color: "#ffffff", borderRadius: 10,
    paddingHorizontal: 18, paddingVertical: 16, fontSize: 22, letterSpacing: 2,
    marginBottom: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", minHeight: 56,
  },
  hiddenInput: { position: "absolute", opacity: 0, height: 0, width: 0 },
  otpRow: { flexDirection: "row", gap: 10, marginBottom: 20, justifyContent: "center" },
  otpCell: {
    width: 46, height: 60, borderRadius: 10, backgroundColor: "#1a2f45",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  otpCellActive: { borderColor: "#c9a84c", borderWidth: 2 },
  otpChar: { fontSize: 26, fontWeight: "700", color: "#ffffff" },
  cta: {
    backgroundColor: "#c9a84c", borderRadius: 12, paddingVertical: 18,
    alignItems: "center", minHeight: 56, justifyContent: "center", marginBottom: 14,
  },
  ctaLoading: { backgroundColor: "rgba(201,168,76,0.35)" },
  ctaText: { fontSize: 18, fontWeight: "700", color: "#0d1b2a", letterSpacing: 0.3 },
  notice: { fontSize: 13, color: "#718096", textAlign: "center" },
  resendRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  resendLink: { fontSize: 13, color: "#2dd4bf", textDecorationLine: "underline" },
  resendBtn: {
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", borderRadius: 10,
    paddingVertical: 12, alignItems: "center",
  },
  resendBtnText: { color: "rgba(255,255,255,0.6)", fontSize: 14 },
});
