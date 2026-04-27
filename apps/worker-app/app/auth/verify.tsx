// 워커 OTP 검증 — 6자리 인증번호 입력
// ADR-003: 시니어 친화 — 큰 숫자 입력 박스, 재발송 30s 카운트다운

import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { colors, typography, spacing, radius, touch } from "@ilgam/design-tokens";
import { sendOtp, verifyOtp } from "../../lib/auth";

const RESEND_COOLDOWN_S = 30;

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone: string }>();
  const phone = params.phone ?? "";

  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_COOLDOWN_S);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const canVerify = code.length === 6 && !verifying;

  const handleVerify = async () => {
    if (!canVerify) return;
    setVerifying(true);
    try {
      await verifyOtp(phone, code);
      // 인증 성공: 탭으로 복귀 (스택 정리)
      router.replace("/(tabs)/jobs");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "인증번호가 올바르지 않습니다.";
      Alert.alert("인증 실패", msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0) return;
    try {
      await sendOtp(phone);
      setResendIn(RESEND_COOLDOWN_S);
      Alert.alert("재발송", "인증번호가 다시 전송되었습니다.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "재발송에 실패했습니다.";
      Alert.alert("발송 실패", msg);
    }
  };

  // 010-1234-5678 형식으로 표시
  const displayPhone = phone.startsWith("+82")
    ? `0${phone.slice(3, 5)}-${phone.slice(5, 9)}-${phone.slice(9)}`
    : phone;

  return (
    <>
      <Stack.Screen options={{ title: "인증번호 입력", headerBackTitle: "뒤로" }} />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.white }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: spacing.xl,
            justifyContent: "space-between",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <Text
              style={{
                fontSize: typography.sizes.xl,
                color: colors.navy[800],
                fontWeight: "700",
                marginTop: spacing.lg,
                marginBottom: spacing.sm,
              }}
            >
              인증번호 6자리
            </Text>
            <Text
              style={{
                fontSize: typography.sizes.base,
                color: colors.gray[700],
                lineHeight: 26,
                marginBottom: spacing.xxxl,
              }}
            >
              <Text style={{ fontWeight: "700", color: colors.navy[700] }}>{displayPhone}</Text>
              {"\n"}
              번호로 보낸 6자리 숫자를 입력해주세요.
            </Text>

            <TextInput
              accessibilityLabel="인증번호 6자리 입력"
              value={code}
              onChangeText={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              placeholderTextColor={colors.gray[300]}
              keyboardType="number-pad"
              autoComplete="sms-otp"
              textContentType="oneTimeCode"
              maxLength={6}
              style={{
                minHeight: touch.buttonHeight + 8,
                borderWidth: 1.5,
                borderColor: code.length === 6 ? colors.navy[600] : colors.gray[300],
                borderRadius: radius.md,
                paddingHorizontal: spacing.lg,
                fontSize: 28,
                letterSpacing: 8,
                textAlign: "center",
                color: colors.navy[800],
                backgroundColor: colors.white,
                fontWeight: "700",
              }}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                resendIn > 0 ? `${resendIn}초 후 재발송` : "인증번호 다시 받기"
              }
              accessibilityState={{ disabled: resendIn > 0 }}
              onPress={handleResend}
              hitSlop={12}
              style={{
                marginTop: spacing.lg,
                paddingVertical: spacing.md,
                alignItems: "center",
                minHeight: touch.minTargetSize,
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: typography.sizes.sm,
                  color: resendIn > 0 ? colors.gray[500] : colors.navy[600],
                  fontWeight: "600",
                  textDecorationLine: resendIn > 0 ? "none" : "underline",
                }}
              >
                {resendIn > 0 ? `${resendIn}초 후 다시 받기` : "인증번호 다시 받기"}
              </Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="확인"
            accessibilityState={{ disabled: !canVerify }}
            disabled={!canVerify}
            onPress={handleVerify}
            style={{
              minHeight: touch.buttonHeight,
              backgroundColor: canVerify ? colors.navy[700] : colors.gray[300],
              borderRadius: radius.md,
              alignItems: "center",
              justifyContent: "center",
              marginTop: spacing.xxl,
            }}
          >
            {verifying ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text
                style={{
                  fontSize: typography.sizes.md,
                  color: colors.white,
                  fontWeight: "700",
                }}
              >
                확인
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
