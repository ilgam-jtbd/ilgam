import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerTitleStyle: { fontSize: 20 } }} />
    </QueryClientProvider>
  );
}
