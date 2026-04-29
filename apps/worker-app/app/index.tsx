import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { colors, typography, touch, spacing } from "@ilgam/design-tokens";
import { useSession } from "../lib/auth";

export default function LandingScreen() {
  const { isAuthenticated } = useSession();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.white,
        padding: spacing.xl,
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: typography.sizes.xxl,
          fontWeight: "700",
          color: colors.navy[700],
          marginBottom: spacing.lg,
        }}
      >
        일감
      </Text>
      <Text
        style={{
          fontSize: typography.sizes.md,
          color: colors.gray[700],
          marginBottom: spacing.xxxl,
          lineHeight: typography.sizes.md * typography.lineHeight,
        }}
      >
        은퇴 이후에도 원하는 날, 원하는 시간에 일합니다.
      </Text>

      <Link href="/(tabs)/jobs" asChild>
        <Pressable
          style={{
            backgroundColor: colors.navy[700],
            height: touch.buttonHeight,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
          accessibilityRole="button"
          accessibilityLabel="오늘 할 일감 보기"
        >
          <Text
            style={{
              color: colors.white,
              fontSize: typography.sizes.lg,
              fontWeight: "600",
            }}
          >
            오늘 할 일감 보기
          </Text>
        </Pressable>
      </Link>

      {!isAuthenticated && (
        <Link href="/auth/login" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="휴대폰 번호로 로그인"
            style={{
              marginTop: spacing.md,
              height: touch.buttonHeight,
              borderRadius: 10,
              borderWidth: 1.5,
              borderColor: colors.navy[700],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: colors.navy[700],
                fontSize: typography.sizes.md,
                fontWeight: "700",
              }}
            >
              휴대폰 번호로 로그인
            </Text>
          </Pressable>
        </Link>
      )}
    </View>
  );
}
