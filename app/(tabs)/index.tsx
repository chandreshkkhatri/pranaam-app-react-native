import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  Pressable,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
  StatusBar,
} from "react-native";
import * as Contacts from "expo-contacts";
import { COLORS, GLOBAL, SIZES } from "../../constants/Styles";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिं" },
];

type Recipient = {
  id: string;
  name: string;
  number: string;
  lastUsedAt?: number;
};

export default function TabOneScreen() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [deviceContacts, setDeviceContacts] = useState<Contacts.Contact[]>([]);
  const [query, setQuery] = useState("");
  const [searchDropdownVisible, setSearchDropdownVisible] = useState(false);

  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          language.code === "hi" ? "अनुमति आवश्यक" : "Permission required",
          language.code === "hi"
            ? "संपर्क चुनने के लिए अनुमति दें।"
            : "Contact permission is needed to pick recipients."
        );
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });

      setDeviceContacts(data.filter((c) => c.name && c.phoneNumbers?.length));
    })();
  }, [language.code]);

  const filteredContacts = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    const results: { id: string; name: string; number: string }[] = [];

    deviceContacts.forEach((contact, contactIndex) => {
      if (!contact.id || !contact.name) return;

      contact.phoneNumbers?.forEach((phone, phoneIndex) => {
        if (!phone.number) return;

        const nameMatch = contact.name.toLowerCase().includes(lowerQuery);
        const numberMatch = phone.number
          .replace(/\s+/g, "")
          .includes(lowerQuery);

        if (nameMatch || numberMatch) {
          results.push({
            id: `${contact.id}_${contactIndex}_${phoneIndex}`, // 🔥 guaranteed unique
            name: contact.name,
            number: phone.number,
          });
        }
      });
    });

    return results;
  }, [deviceContacts, query]);

  const addRecipient = useCallback(
    (contact: { id: string; name: string; number: string }) => {
      setRecipients((prev) => {
        if (prev.some((r) => r.id === contact.id)) return prev;
        return [
          ...prev,
          { id: contact.id, name: contact.name, number: contact.number },
        ];
      });
      setQuery("");
      setSearchDropdownVisible(false);
      Keyboard.dismiss();
    },
    []
  );

  const toggleRecipientSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const removeRecipient = useCallback((id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const sendPranaam = useCallback(() => {
    if (selectedIds.size === 0) return;

    setRecipients((prev) =>
      prev
        .map((r) =>
          selectedIds.has(r.id) ? { ...r, lastUsedAt: Date.now() } : r
        )
        .sort((a, b) => (b.lastUsedAt ?? 0) - (a.lastUsedAt ?? 0))
    );
    Alert.alert("जय श्री राम 🙏", "Greeting sent!");
    setSelectedIds(new Set());
  }, [selectedIds]);

  const inviteOthers = useCallback(async () => {
    try {
      await Share.share({
        message:
          "Join me on Pranaam – send respectful greetings with a tap! https://pranaam.app",
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  /* ──────────────────────────────── UI ───────────────────────────────── */

  return (
    <SafeAreaView
      style={[
        GLOBAL.screen,
        styles.safeArea,
        {
          paddingTop:
            Platform.OS === "android"
              ? (StatusBar.currentHeight || 0) + SIZES.padding
              : SIZES.padding,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        {/* ── Search bar + Lang selector ── */}
        <View style={styles.searchRowContainer}>
          <TextInput
            placeholder={
              language.code === "hi"
                ? "संपर्क खोजें…"
                : "Search contacts to add…"
            }
            placeholderTextColor={COLORS.saffronLight}
            style={styles.search}
            value={query}
            onFocus={() => setSearchDropdownVisible(true)}
            onChangeText={(text) => {
              setQuery(text);
              if (text.length === 0) setSearchDropdownVisible(false);
              else setSearchDropdownVisible(true);
            }}
            autoCorrect={false}
            autoCapitalize="none"
          />
          <Pressable
            style={styles.langBtn}
            onPress={() => setLangMenuOpen((o) => !o)}
          >
            <Text style={styles.langBtnText}>{language.label}</Text>
          </Pressable>
        </View>

        {/* ── Floating Dropdown ── */}
        {searchDropdownVisible && query.length > 0 && (
          <View style={styles.dropdownAbsoluteContainer}>
            <FlatList
              data={filteredContacts.slice(0, 20)}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  style={styles.dropdownRow}
                  onPress={() => addRecipient(item)}
                >
                  <View>
                    <Text style={styles.dropdownText}>{item.name}</Text>
                    <Text style={styles.dropdownSubText}>{item.number}</Text>
                  </View>
                  <Text style={styles.addTag}>ADD</Text>
                </Pressable>
              )}
            />
          </View>
        )}

        {/* ── Recipients List ── */}
        <Text style={GLOBAL.title}>My Recipients</Text>
        <FlatList
          data={recipients}
          keyExtractor={(item) => item.id}
          style={styles.recipientList}
          getItemLayout={(_, index) => ({
            length: SIZES.recipientRow,
            offset: SIZES.recipientRow * index,
            index,
          })}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.row,
                selectedIds.has(item.id) && styles.rowSelected,
              ]}
              onPress={() => toggleRecipientSelection(item.id)}
            >
              <View>
                <Text style={styles.rowText}>{item.name}</Text>
                <Text style={styles.rowSubText}>{item.number}</Text>
              </View>
              <Pressable
                onPress={() => removeRecipient(item.id)}
                style={styles.removeButton}
              >
                <Text style={styles.removeText}>✖️</Text>
              </Pressable>
            </Pressable>
          )}
          ListEmptyComponent={() => (
            <Text style={{ color: COLORS.white, opacity: 0.7 }}>
              {language.code === "hi"
                ? "कोई प्राप्तकर्ता नहीं"
                : "No recipients yet"}
            </Text>
          )}
        />

        {/* ── Invite + Pranaam buttons ── */}
        <View style={styles.bottomGroup}>
          <Pressable style={styles.inviteBtn} onPress={inviteOthers}>
            <Text style={styles.inviteText}>
              {language.code === "hi" ? "इनवाइट भेजें" : "Invite friends"}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.sendButton,
              selectedIds.size === 0 && { opacity: 0.5 },
            ]}
            disabled={selectedIds.size === 0}
            onPress={sendPranaam}
          >
            <Text style={styles.sendText}>जय श्री राम</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  /* Language selector */
  langWrap: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 99,
  },
  langBtn: {
    width: SIZES.langBtn,
    height: SIZES.langBtn,
    borderRadius: SIZES.langBtn / 2,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.23,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  langBtnText: { color: COLORS.saffron, fontWeight: "700" },
  langMenu: {
    marginTop: 6,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.23,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  langMenuItem: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  langMenuText: { color: COLORS.textDark },

  addTag: { color: COLORS.saffron, fontWeight: "700" },

  searchRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    marginBottom: 10,
  },

  /* Search bar */
  search: {
    flex: 1,
    height: 42,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    color: COLORS.textDark,
  },

  /* Floating dropdown container */
  dropdownAbsoluteContainer: {
    position: "absolute",
    top: 70, // adjust based on your design
    left: SIZES.padding,
    right: SIZES.padding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    maxHeight: 250,
    zIndex: 100,
  },

  /* Each dropdown item */
  dropdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.saffronLight,
  },

  dropdownText: {
    color: COLORS.textDark,
    fontSize: 16,
  },

  /* Number text under name */
  dropdownSubText: {
    color: COLORS.saffron,
    fontSize: 12,
    marginTop: 2,
  },

  recipientList: {
    maxHeight: SIZES.recipientRow * 6,
    marginBottom: 16,
  },

  /* Single row */
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: SIZES.recipientRow,
    backgroundColor: COLORS.white,
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderRadius: SIZES.radius,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },

  /* Selected highlight */
  rowSelected: {
    backgroundColor: COLORS.saffronLight,
  },

  /* Name text in row */
  rowText: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: "600",
  },

  /* Number text in row */
  rowSubText: {
    color: COLORS.saffron,
    fontSize: 12,
    marginTop: 2,
  },
  removeButton: {
    marginLeft: 12,
    padding: 6,
  },

  removeText: {
    fontSize: 18,
  },
  bottomGroup: {
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 12,
  },

  inviteBtn: {
    alignSelf: "center",
    marginVertical: 6,
  },

  inviteText: {
    color: COLORS.white,
    textDecorationLine: "underline",
  },

  sendButton: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 320,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    marginTop: 6,
  },

  sendText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.saffron,
    letterSpacing: 0.5,
  },
});
