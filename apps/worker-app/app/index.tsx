// 워커 앱 — 랜딩 / 로그인 (Supabase OTP SMS 매직링크)
// 시니어 UX: 큰 글씨(20pt+), 단일 CTA, 전화번호 1단계

import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet, KeyboardAvoidingView, Platform,
} from "react-native";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL  ?? "",
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
);

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  return digits.startsWith("0") ? `+82${digits.slice(1)}` : `+82${digits}`;
}

export default function LandingScreen() {
  const [phone, setPhone]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  async function handleSendLink() {
    const e164 = normalizePhone(phone);
    if (!/^\+82[0-9]{9,10}$/.test(e164)) {
      Alert.alert("알림", "올바른 휴대폰 번호를 입력해 주세요.\n예) 010-1234-5678");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: e164,
      options: { channel: "sms" },
    });
    setLoading(false);
    if (error) Alert.alert("오류", error.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <View style={styles.center}>
        <Text style={styles.sentTitle}>문자를 확인해 주세요</Text>
        <Text style={styles.sentSub}>
          입력하신 번호로 로그인 링크를 보냈습니다.{"\n"}
          링크를 누르면 자동으로 로그인됩니다.
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => setSent(false)}>
          <Text style={styles.retryText}>번호 다시 입력</Text>
        </TouchableOpacity>
      </View>
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
          placeholderTextColor="#a0aec0"
          keyboardType="phone-pad"
          maxLength={13}
          accessibilityLabel="휴대폰 번호 입력"
        />
        <TouchableOpacity
          style={[styles.cta, loading && styles.ctaLoading]}
          onPress={handleSendLink}
          disabled={loading}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="로그인 문자 받기"
        >
          {loading
            ? <ActivityIndicator color="#0d1b2a" />
            : <Text style={styles.ctaText}>로그인 문자 받기</Text>}
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
  title: { fontSize: 52, fontWeight: "700", color: "#c9a84c", marginBottom: 12, letterSpacing: -1 },
  sub: { fontSize: 18, color: "rgba(255,255,255,0.7)", lineHeight: 28 },
  form: { marginBottom: 40 },
  inputLabel: { fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 8, fontWeight: "500" },
  input: {
    backgroundColor: "#1a2f45", color: "#ffffff", borderRadius: 10,
    paddingHorizontal: 18, paddingVertical: 16, fontSize: 20, letterSpacing: 1,
    marginBottom: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", minHeight: 56,
  },
  cta: {
    backgroundColor: "#c9a84c", borderRadius: 12, paddingVertical: 18,
    alignItems: "center", minHeight: 56, justifyContent: "center", marginBottom: 14,
  },
  ctaLoading: { backgroundColor: "#e2e8f0" },
  ctaText: { fontSize: 18, fontWeight: "700", color: "#0d1b2a", letterSpacing: 0.3 },
  notice: { fontSize: 13, color: "#718096", textAlign: "center" },
  center: { flex: 1, backgroundColor: "#0d1b2a", alignItems: "center", justifyContent: "center", padding: 28 },
  sentTitle: { fontSize: 24, fontWeight: "700", color: "#ffffff", marginBottom: 12, textAlign: "center" },
  sentSub: { fontSize: 16, color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 26, marginBottom: 32 },
  retryBtn: { borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingVertical: 14, paddingHorizontal: 32 },
  retryText: { color: "#ffffff", fontSize: 16, fontWeight: "500" },
});
