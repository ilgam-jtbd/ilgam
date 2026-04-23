import { View, Text, FlatList } from "react-native";
import { colors, typography, spacing } from "@ilgam/design-tokens";

const mockJobs = [
  { id: "1", title: "강서 물류센터 피킹 보조", wage: 12500, hours: "09:00~13:00" },
  { id: "2", title: "송파 베이커리 오전 프렙", wage: 11500, hours: "07:00~11:00" },
];

export default function JobsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.gray[50], padding: spacing.lg }}>
      <Text style={{ fontSize: typography.sizes.xl, color: colors.navy[800], marginBottom: spacing.md }}>
        오늘 할 수 있는 일감
      </Text>
      <FlatList
        data={mockJobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: colors.white,
              padding: spacing.lg,
              borderRadius: 10,
              marginBottom: spacing.md,
            }}
            accessible
            accessibilityLabel={`${item.title}, 시급 ${item.wage}원, 시간 ${item.hours}`}
          >
            <Text style={{ fontSize: typography.sizes.lg, color: colors.gray[900] }}>
              {item.title}
            </Text>
            <Text style={{ fontSize: typography.sizes.base, color: colors.gray[700], marginTop: spacing.sm }}>
              시급 {item.wage.toLocaleString()}원 · {item.hours}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
