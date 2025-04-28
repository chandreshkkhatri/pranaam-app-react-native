import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { supabase } from "../lib/supabase";

export async function registerPushToken(userId: string) {
  if (!Constants.isDevice) return;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // upsert keeps one row per token/user
  await supabase.from("device_tokens")
    .upsert({ user_id: userId, expo_token: token });
}
