import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#c9a84c",
        tabBarInactiveTintColor: "#718096",
        tabBarStyle: {
          backgroundColor: "#0d1b2a",
          borderTopColor: "rgba(255,255,255,0.06)",
          height: 64,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerStyle: { backgroundColor: "#0d1b2a" },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen name="jobs"    options={{ title: "오늘 일자리" }} />
      <Tabs.Screen name="mine"    options={{ title: "내 근무" }} />
      <Tabs.Screen name="support" options={{ title: "지원 현황" }} />
      <Tabs.Screen name="profile" options={{ title: "내 정보" }} />
    </Tabs>
  );
}
