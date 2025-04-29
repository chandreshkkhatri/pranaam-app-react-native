import React from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { COLORS } from "../../constants/Styles";

export default function TabTwoScreen() {
  async function handleLogout() {
    // tiny defer lets React finish the press ripple before navigating away
    setTimeout(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) console.error("Logout error:", error.message);
    }, 0);
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* brand badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>प्रणाम</Text>
      </View>

      {/* coming-soon card */}
      <View style={styles.card}>
        <Feather name="compass" size={36} color={COLORS.saffron} />
        <Text style={styles.cardTitle}>Explore</Text>
        <Text style={styles.cardText}>
          More features will land here soon — stay tuned!
        </Text>
      </View>

      {/* logout */}
      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </SafeAreaView>
  );
}

/* uses same palette & rounded corners as the auth screens */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  /* brand circle */
  badge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.saffron,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: { color: "#fff", fontSize: 28, fontWeight: "bold" },

  /* placeholder card */
  card: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },

  /* logout */
  logoutBtn: {
    marginTop: 40,
    backgroundColor: COLORS.saffron,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
