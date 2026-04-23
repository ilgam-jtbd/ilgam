import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { colors, typography, touch, spacing } from "@ilgam/design-tokens";

export default function LandingScreen() {
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
    </View>
  );
}
