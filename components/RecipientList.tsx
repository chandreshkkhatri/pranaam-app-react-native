import { FlatList, Pressable, Text, View, StyleSheet } from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { COLORS } from "../constants/Styles";

/* ---------- types that already exist ---------- */
export type Recipient = {
  id: string;
  name: string;
  number: string;
  registered?: boolean;
};

type Props = {
  recipients: Recipient[];
  selectedIds: Set<string>;
  languageCode: "en" | "hi";
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
};

/* --------------- RecipientList --------------- */
export default function RecipientList({
  recipients,
  selectedIds,
  languageCode,
  onToggle,
  onRemove,
}: Props) {
  return (
    <FlatList
      data={recipients}
      keyExtractor={(item) => item.id}
      style={styles.recipientList}
      contentContainerStyle={
        recipients.length === 0 ? styles.emptyListContainer : undefined
      }
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => {
        const selected = selectedIds.has(item.id);
        return (
          <Pressable
            style={[styles.recipientItem, selected && styles.selectedRecipient]}
            onPress={() => onToggle(item.id)}
          >
            {/* Left side: avatar + text */}
            <View style={styles.recipientInfo}>
              <View
                style={[
                  styles.recipientAvatar,
                  selected && styles.selectedAvatar,
                ]}
              >
                {selected ? (
                  <MaterialIcons name="check" size={16} color="#fff" />
                ) : (
                  <Text style={styles.avatarText}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View>
                <Text style={styles.recipientName}>{item.name}</Text>
                <Text style={styles.recipientNumber}>{item.number}</Text>
              </View>
            </View>

            {/* Right-side remove “x” */}
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onRemove(item.id);
              }}
              style={styles.removeButton}
            >
              <Feather name="x" size={16} color="#999" />
            </Pressable>
          </Pressable>
        );
      }}
      ListEmptyComponent={() => (
        <View style={styles.emptyState}>
          <MaterialIcons name="people-outline" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>
            {languageCode === "hi"
              ? "कोई प्राप्तकर्ता नहीं जोड़ा गया"
              : "No recipients added yet"}
          </Text>
          <Text style={styles.emptyStateSubtext}>
            {languageCode === "hi"
              ? "ऊपर संपर्क खोजें और जोड़ें"
              : "Search and add contacts above"}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  recipientList: {
    flex: 1,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  recipientItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedRecipient: {
    backgroundColor: "#FFF8E1",
    borderColor: COLORS.saffron,
    borderWidth: 1,
  },
  recipientInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  recipientAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectedAvatar: {
    backgroundColor: COLORS.saffron,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  recipientName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  recipientNumber: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
    textAlign: "center",
  },
});
