import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your Supabase URL and ANON key
const SUPABASE_URL = "https://smqzszdpgdbfirxmhdyo.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtcXpzemRwZ2RiZmlyeG1oZHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3NjQ2OTMsImV4cCI6MjA2MTM0MDY5M30.2SMvGV5t9HNLbvV0dNuEm_uDcfU4P9n0CUST2UOMQK4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    detectSessionInUrl: false,
  }
});
