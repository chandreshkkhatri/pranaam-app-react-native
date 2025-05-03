import { useState, useMemo, useCallback } from "react";
import {
  View,
  TextInput,
  FlatList,
  Pressable,
  Text,
  Keyboard,
  StyleSheet,
  Share,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { E164Number, parsePhoneNumber } from "libphonenumber-js/min";

import { COLORS } from "../constants/Styles";
import { normalise } from "../utils/phone";

/* --------------------------------- types --------------------------------- */
type Registered = { id: string; phone: string };

export type Recipient = {
  id: string;
  auth_id?: string;
  name: string;
  number: string;
  registered?: boolean;
};

type Props = {
  deviceContacts: Contacts.Contact[];
  registered: Map<string, Registered>;
  language: { code: string; label: string };
  onAdd: (contact: Recipient) => void;
};

/* ---------------------------- SearchContacts ----------------------------- */
export default function SearchContacts({
  deviceContacts,
  registered,
  language,
  onAdd,
}: Props) {
  const [query, setQuery] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);

  /* ---------- contact filtering (was in TabOne) ---------- */
  const filteredContacts = useMemo<Recipient[]>(() => {
    const q = query.toLowerCase().replace(/\s+/g, "");
    if (!q) return [];

    const results: Recipient[] = [];
    const seen = new Set<string>();

    deviceContacts.forEach((c) => {
      if (!c.name) return;

      c.phoneNumbers?.forEach((p) => {
        if (!p.number) return;

        let phoneE164: string | null = null;
        try {
          phoneE164 = parsePhoneNumber(p.number, "IN")?.number ?? null;
        } catch {
          /* ignore */
        }
        if (!phoneE164) return;

        const match = c.name.toLowerCase().includes(q) || phoneE164.includes(q);
        if (!match) return;

        const reg = registered.get(normalise(phoneE164));
        const key = reg ? reg.id : `local_${phoneE164}`;
        if (seen.has(key)) return;
        seen.add(key);

        results.push({
          id: key,
          name: c.name!,
          number: phoneE164,
          registered: !!reg,
        });
      });
    });

    return results;
  }, [deviceContacts, query, registered]);

  /* --------------------- helper when user taps a row --------------------- */
  const selectContact = useCallback(
    (item: Recipient) => {
      onAdd(item); // delegate to parent
      setQuery("");
      setDropdownVisible(false);
      Keyboard.dismiss();
    },
    [onAdd]
  );

  /* ------------------------------- render ------------------------------- */
  return (
    <View style={styles.searchContainer}>
      {/* search bar */}
      <View style={styles.searchBar}>
        <Feather
          name="search"
          size={18}
          color={COLORS.saffron}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder={
            language.code === "hi" ? "संपर्क खोजें…" : "Search contacts..."
          }
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={query}
          onFocus={() => setDropdownVisible(true)}
          onChangeText={(t) => {
            setQuery(t);
            setDropdownVisible(t.length > 0);
          }}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => {
              setQuery("");
              setDropdownVisible(false);
            }}
            style={styles.clearButton}
          >
            <Feather name="x" size={18} color="#999" />
          </Pressable>
        )}
      </View>

      {/* dropdown */}
      {dropdownVisible && query.length > 0 && (
        <View style={styles.dropdownContainer}>
          <FlatList
            data={filteredContacts.slice(0, 20)}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.dropdownItem,
                  !item.registered && { opacity: 0.5 },
                ]}
                onPress={() => selectContact(item)}
              >
                <View style={styles.contactInfo}>
                  <View style={styles.contactAvatar}>
                    <Text style={styles.avatarText}>
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.contactName}>{item.name}</Text>
                    <Text style={styles.contactNumber}>{item.number}</Text>
                  </View>
                </View>
                {item.registered ? (
                  <View style={styles.addButton}>
                    <Feather name="check" size={16} color="#fff" />
                  </View>
                ) : (
                  <Pressable
                    style={styles.invitePill} // tiny rounded pill
                    onPress={() =>
                      Share.share({
                        message: `I’m on Pranaam! Join me: https://pranaam.app`,
                      })
                    }
                  >
                    <Text style={styles.invitePillText}>
                      {language.code === "hi" ? "आमंत्रित करें" : "Invite"}
                    </Text>
                  </Pressable>
                )}
              </Pressable>
            )}
            ListEmptyComponent={() => (
              <Text style={styles.emptySearchText}>
                {language.code === "hi"
                  ? "कोई परिणाम नहीं मिला"
                  : "No results found"}
              </Text>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 4,
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  contactName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  contactNumber: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.saffron,
    justifyContent: "center",
    alignItems: "center",
  },
  emptySearchText: {
    textAlign: "center",
    padding: 16,
    color: "#999",
  },
  invitePill: {
    backgroundColor: COLORS.saffron,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  invitePillText: { color: "#fff", fontSize: 12, fontWeight: "600" },
});
