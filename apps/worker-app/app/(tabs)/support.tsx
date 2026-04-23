import { View, Text, Pressable } from "react-native";
import { colors, typography, spacing, touch } from "@ilgam/design-tokens";

export default function SupportScreen() {
  return (
    <View style={{ flex: 1, padding: spacing.lg, backgroundColor: colors.white }}>
      <Text style={{ fontSize: typography.sizes.xl, color: colors.navy[800] }}>
        문의하기
      </Text>
      <Text style={{ color: colors.gray[700], marginTop: spacing.md, fontSize: typography.sizes.base }}>
        채널톡 상담원이 실시간으로 답변합니다. 전화 문의는 운영하지 않습니다.
      </Text>
      <Pressable
        style={{
          backgroundColor: colors.navy[700],
          height: touch.buttonHeight,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          marginTop: spacing.xl,
        }}
        accessibilityRole="button"
        accessibilityLabel="채널톡 상담 열기"
      >
        <Text style={{ color: colors.white, fontSize: typography.sizes.lg }}>
          채널톡 상담 열기
        </Text>
      </Pressable>
    </View>
  );
}
