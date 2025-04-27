import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, GLOBAL, SIZES } from "../../constants/Styles";

export default function TabTwoScreen() {
  const [count, setCount] = useState(0);
  return (
    <View style={[GLOBAL.screen, styles.centered]}>
      <Text style={styles.infoText}>More features coming soon…</Text>
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
