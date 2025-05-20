import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

let storage: any;

if (Platform.OS === "web") {
  // Use localStorage only if available (browser), else fallback to no-op storage
  const hasLocalStorage =
    typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  if (hasLocalStorage) {
    storage = {
      getItem: (key: string) =>
        Promise.resolve(window.localStorage.getItem(key)),
      setItem: (key: string, value: string) =>
        Promise.resolve(window.localStorage.setItem(key, value)),
      removeItem: (key: string) =>
        Promise.resolve(window.localStorage.removeItem(key)),
    };
  } else {
    // No-op storage for SSR/Node
    storage = {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
    };
  }
} else {
  // Native: use AsyncStorage
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  storage = require("@react-native-async-storage/async-storage").default;
}

const EXPO_PUBLIC_SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const EXPO_PUBLIC_SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(
  EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
