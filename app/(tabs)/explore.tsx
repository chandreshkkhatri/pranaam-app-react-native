import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, GLOBAL, SIZES } from "../../constants/Styles";
import { supabase } from "../../lib/supabase";

export default function TabTwoScreen() {
  const [count, setCount] = useState(0);

  async function handleLogout() {
    setTimeout(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error.message);
      } else {
        console.log("Logged out");
      }
    }, 0); // small delay to let React finish render
  }

  return (
    <View style={[GLOBAL.screen, styles.centered]}>
      <Text style={styles.infoText}>More features coming soon…</Text>

      <Pressable
        onPress={handleLogout}
        style={{
          marginTop: 24,
          padding: 10,
          backgroundColor: "#FF6F00",
          borderRadius: 8,
          alignSelf: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    color: COLORS.white,
    fontSize: 16,
    textAlign: "center",
  },
});
