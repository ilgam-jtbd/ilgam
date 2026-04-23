import { Tabs } from "expo-router";
import { colors } from "@ilgam/design-tokens";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.navy[700],
        tabBarLabelStyle: { fontSize: 14 },
      }}
    >
      <Tabs.Screen name="jobs" options={{ title: "오늘 일감" }} />
      <Tabs.Screen name="mine" options={{ title: "내 근무" }} />
      <Tabs.Screen name="support" options={{ title: "문의" }} />
    </Tabs>
  );
}
