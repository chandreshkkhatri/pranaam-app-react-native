import { Feather } from "@expo/vector-icons";
import { Pressable, View, Text, StyleSheet } from "react-native";

import { COLORS } from "../constants/Styles";

type Props = {
  disabled: boolean;
  selectedCount: number;
  languageCode: "en" | "hi";
  onInvite: () => void;
  onSend: () => void;
};

export default function BottomActions({
  disabled,
  selectedCount,
  languageCode,
  onInvite: inviteOthers,
  onSend: sendPranaam,
}: Props) {
  return (
    <View style={styles.bottomActions}>
      <Pressable style={styles.inviteButton} onPress={inviteOthers}>
        <Feather name="share-2" size={16} color="#fff" />
        <Text style={styles.inviteButtonText}>
          {languageCode === "hi"
            ? "दोस्तों को आमंत्रित करें"
            : "Invite Friends"}
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.pranaamButton,
          disabled && styles.disabledButton,
        ]}
        disabled={disabled}
        onPress={sendPranaam}
      >
        <Text style={styles.pranaamButtonText}>जय श्री राम 🙏</Text>
        <Text style={styles.pranaamButtonSubtext}>
          {languageCode === "hi"
            ? `${selectedCount} लोगों को भेजें`
            : `Send to ${selectedCount} ${
                selectedCount === 1 ? "person" : "people"
              }`}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomActions: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    paddingVertical: 8,
    marginBottom: 12,
  },
  inviteButtonText: {
    color: COLORS.saffron,
    fontWeight: "500",
    marginLeft: 8,
  },
  pranaamButton: {
    backgroundColor: COLORS.saffron,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.6,
  },
  pranaamButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  pranaamButtonSubtext: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginTop: 4,
  },
});
