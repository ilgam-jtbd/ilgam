// 워커 로그인 — 전화번호 입력 → OTP 발송
// ADR-003: 18pt 기본 / 48dp 터치 / WCAG AAA / 시니어 친화

import { useState } from "react";
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
import { Stack, useRouter } from "expo-router";
import { colors, typography, spacing, radius, touch } from "@ilgam/design-tokens";
import { normalizeKrPhone, sendOtp } from "../../lib/auth";

export default function LoginScreen() {
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const [sending, setSending] = useState(false);

  const normalized = normalizeKrPhone(raw);
  const canSend = Boolean(normalized) && !sending;

  const handleSend = async () => {
    if (!normalized) {
      Alert.alert("전화번호 확인", "010 으로 시작하는 휴대폰 번호를 입력해주세요.");
      return;
    }
    setSending(true);
    try {
      await sendOtp(normalized);
      router.push({ pathname: "/auth/verify", params: { phone: normalized } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "인증번호 발송 중 오류가 발생했습니다.";
      Alert.alert("발송 실패", msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "로그인", headerBackTitle: "뒤로" }} />
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
              휴대폰 번호로 로그인
            </Text>
            <Text
              style={{
                fontSize: typography.sizes.base,
                color: colors.gray[700],
                lineHeight: 26,
                marginBottom: spacing.xxxl,
              }}
            >
              인증번호 6자리를 문자로 보내드립니다.{"\n"}
              비밀번호는 따로 만들지 않아도 됩니다.
            </Text>

            <Text
              style={{
                fontSize: typography.sizes.sm,
                color: colors.gray[600],
                fontWeight: "600",
                marginBottom: spacing.sm,
              }}
            >
              휴대폰 번호
            </Text>
            <TextInput
              accessibilityLabel="휴대폰 번호 입력"
              value={raw}
              onChangeText={setRaw}
              placeholder="010-1234-5678"
              placeholderTextColor={colors.gray[400]}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              maxLength={15}
              style={{
                minHeight: touch.buttonHeight,
                borderWidth: 1.5,
                borderColor: normalized ? colors.navy[600] : colors.gray[300],
                borderRadius: radius.md,
                paddingHorizontal: spacing.lg,
                fontSize: typography.sizes.lg,
                color: colors.navy[800],
                backgroundColor: colors.white,
              }}
            />
            <Text
              style={{
                fontSize: typography.sizes.xs,
                color: colors.gray[500],
                marginTop: spacing.xs,
                lineHeight: 20,
              }}
            >
              번호 인증 후, 일감 지원·근무 확정 알림이 이 번호로 전송됩니다.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="인증번호 받기"
            accessibilityState={{ disabled: !canSend }}
            disabled={!canSend}
            onPress={handleSend}
            style={{
              minHeight: touch.buttonHeight,
              backgroundColor: canSend ? colors.navy[700] : colors.gray[300],
              borderRadius: radius.md,
              alignItems: "center",
              justifyContent: "center",
              marginTop: spacing.xxl,
            }}
          >
            {sending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text
                style={{
                  fontSize: typography.sizes.md,
                  color: colors.white,
                  fontWeight: "700",
                }}
              >
                인증번호 받기
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
