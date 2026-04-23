import { View, Text } from "react-native";
import { colors, typography, spacing } from "@ilgam/design-tokens";

export default function MineScreen() {
  return (
    <View style={{ flex: 1, padding: spacing.lg, backgroundColor: colors.white }}>
      <Text style={{ fontSize: typography.sizes.xl, color: colors.navy[800] }}>
        내 근무 내역
      </Text>
      <Text style={{ color: colors.gray[600], marginTop: spacing.md }}>
        근무 후 당일 입금 내역이 여기에 표시됩니다.
      </Text>
    </View>
  );
}
