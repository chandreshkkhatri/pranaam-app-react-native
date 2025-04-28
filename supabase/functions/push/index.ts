// supabase/functions/push/index.ts
import { serve } from "https://deno.land/std@0.177.1/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Expo } from "npm:expo-server-sdk";

// 1. env
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const expo = new Expo({ accessToken: Deno.env.get("EXPO_ACCESS_TOKEN")! });

serve(async (req) => {
  const payload = await req.json();   // record that triggered webhook
  const { recipient, title, body } = payload.record;

  // 2. fetch all Expo tokens for the recipient
  const { data: tokens } = await supabase
    .from("device_tokens")
    .select("expo_token")
    .eq("user_id", recipient);

  if (!tokens?.length) return new Response("no tokens", { status: 204 });

  // 3. build Expo messages
  const messages = tokens.map(({ expo_token }) => ({
    to: expo_token,
    sound: "default",
    title,
    body,
  }));

  // 4. chunk & send
  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    await expo.sendPushNotificationsAsync(chunk);
  }

  return new Response("ok");
});
