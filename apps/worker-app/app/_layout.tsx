import { useEffect } from "react";
import { Platform } from "react-native";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerPushToken() {
  if (Platform.OS === "web") return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return;

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;
  const platform = Platform.OS === "ios" ? "ios" : "android";

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();
  if (!profile) return;

  await supabase.from("device_tokens").upsert(
    { profile_id: user.id, token, platform, updated_at: new Date().toISOString() },
    { onConflict: "profile_id,token" },
  );
}

export default function RootLayout() {
  useEffect(() => {
    registerPushToken().catch((e) => console.warn("push token registration failed", e));

    // Check existing session — redirect logged-in users past the login screen
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from("workers").select("id").eq("profile_id", session.user.id).single()
          .then(({ data: worker }) => {
            if (!worker) { router.replace("/"); return; }
            supabase.from("worker_preferences").select("worker_id").eq("worker_id", worker.id).single()
              .then(({ data: prefs }) => {
                router.replace(prefs ? "/(tabs)/jobs" : "/onboarding");
              });
          });
      }
    });

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, string> | undefined;
      if (data?.screen === "mine") router.push("/(tabs)/mine");
      else if (data?.screen === "jobs") router.push("/(tabs)/jobs");
    });
    return () => sub.remove();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerTitleStyle: { fontSize: 20 } }} />
    </>
  );
}
