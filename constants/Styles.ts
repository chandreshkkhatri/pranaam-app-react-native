// constants/Styles.ts
import { StyleSheet } from "react-native";

export const COLORS = {
  saffron: "#FF6F00",
  saffronLight: "#FFA040",
  white: "#FFFFFF",
  textDark: "#1E1E1E",
};

export const SIZES = {
  padding: 16,
  radius: 12,
  recipientRow: 64,
  langBtn: 32,
};

export const GLOBAL = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.saffron,
    paddingHorizontal: SIZES.padding,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 8,
  },
});
