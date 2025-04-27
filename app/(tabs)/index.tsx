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
  lastUsedAt?: number; // epoch ms
};

export default function TabOneScreen() {
  /* ──────────────────────────────── state ─────────────────────────────── */
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [deviceContacts, setDeviceContacts] = useState<Contacts.Contact[]>([]);
  const [query, setQuery] = useState("");

  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  /* ────────────────────── permission + contacts cache ─────────────────── */
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
        fields: [Contacts.Fields.Name],
        pageSize: 200,
      });
      setDeviceContacts(data.filter((c) => !!c.id && !!c.name));
    })();
  }, [language.code]);

  /* ───────────────────────────── helpers ──────────────────────────────── */
  const filteredContacts = useMemo(
    () =>
      deviceContacts.filter((c) =>
        c.name?.toLowerCase().includes(query.toLowerCase())
      ),
    [deviceContacts, query]
  );

  const addRecipient = useCallback((contact: Contacts.Contact) => {
    if (!contact.id || !contact.name) return;
    const id = contact.id as string;
    const name = contact.name as string;
    setRecipients((prev): Recipient[] => {
      if (prev.some((r) => r.id === id)) return prev;
      return [...prev, { id, name }];
    });
    setQuery("");
    Keyboard.dismiss();
  }, []);

  const removeRecipient = useCallback((id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const sendPranaam = useCallback(() => {
    if (!selectedId) return;
    setRecipients((prev) =>
      prev
        .map((r) =>
          r.id === selectedId ? { ...r, lastUsedAt: Date.now() } : r
        )
        .sort((a, b) => (b.lastUsedAt ?? 0) - (a.lastUsedAt ?? 0))
    );
    Alert.alert("जय श्री राम 🙏", "Greeting sent!");
  }, [selectedId]);

  const inviteOthers = useCallback(async () => {
    try {
      await Share.share({
        message:
          "Join me on Pranaam – send respectful greetings with a tap! https://pranaam.app", // hypothetical link
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  /* ──────────────────────────── renderers ─────────────────────────────── */
  const renderRecipient = ({ item }: { item: Recipient }) => (
    <Pressable
      onPress={() => setSelectedId(item.id)}
      onLongPress={() => removeRecipient(item.id)}
      style={[styles.row, item.id === selectedId && styles.rowSelected]}
    >
      <Text style={styles.rowText}>{item.name}</Text>
    </Pressable>
  );

  /* ─────────────────────────────── UI ─────────────────────────────────── */
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
      {/* ── Language selector ─────────────────────────────────────────── */}
      <View style={styles.langWrap} pointerEvents="box-none">
        <Pressable
          style={styles.langBtn}
          onPress={() => setLangMenuOpen((o) => !o)}
        >
          <Text style={styles.langBtnText}>{language.label}</Text>
        </Pressable>
        {langMenuOpen && (
          <View style={styles.langMenu}>
            {LANGUAGES.map((lng) => (
              <Pressable
                key={lng.code}
                style={styles.langMenuItem}
                onPress={() => {
                  setLanguage(lng);
                  setLangMenuOpen(false);
                }}
              >
                <Text style={styles.langMenuText}>{lng.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* ── Search bar ─────────────────────────────────────────────────── */}
      <TextInput
        placeholder={
          language.code === "hi" ? "संपर्क खोजें…" : "Search contacts to add…"
        }
        placeholderTextColor={COLORS.saffronLight}
        style={styles.search}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        autoCapitalize="none"
      />

      {/* ── Search results drop-down ────────────────────────────────────── */}
      {query.length > 0 && (
        <FlatList
          data={filteredContacts.slice(0, 8)}
          keyExtractor={(c) => c.id!}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              style={styles.searchRow}
              onPress={() => addRecipient(item)}
            >
              <Text style={styles.searchText}>{item.name}</Text>
              <Text style={styles.addTag}>ADD</Text>
            </Pressable>
          )}
        />
      )}

      {/* ── Recipient list ──────────────────────────────────────────────── */}
      <Text style={GLOBAL.title}>My Recipients</Text>
      <FlatList
        data={recipients}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipient}
        style={styles.recipientList}
        getItemLayout={(_, index) => ({
          length: SIZES.recipientRow,
          offset: SIZES.recipientRow * index,
          index,
        })}
        ListEmptyComponent={() => (
          <Text style={{ color: COLORS.white, opacity: 0.7 }}>
            {language.code === "hi"
              ? "कोई प्राप्तकर्ता नहीं"
              : "No recipients yet"}
          </Text>
        )}
      />

      {/* ── Invite button ──────────────────────────────────────────────── */}
      <Pressable style={styles.inviteBtn} onPress={inviteOthers}>
        <Text style={styles.inviteText}>
          {language.code === "hi" ? "इनवाइट भेजें" : "Invite friends"}
        </Text>
      </Pressable>

      {/* ── Big send button ─────────────────────────────────────────────── */}
      <Pressable
        style={[styles.sendButton, !selectedId && { opacity: 0.5 }]}
        disabled={!selectedId}
        onPress={sendPranaam}
      >
        <Text style={styles.sendText}>जय श्री राम</Text>
      </Pressable>
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

  /* Search bar */
  search: {
    marginTop: 60, // below Lang button safely
    height: 42,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    color: COLORS.textDark,
    marginBottom: 10,
  },
  searchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomColor: COLORS.saffronLight,
    borderBottomWidth: 0.5,
  },
  searchText: { color: COLORS.textDark },
  addTag: { color: COLORS.saffron, fontWeight: "700" },

  /* Recipient list */
  recipientList: {
    maxHeight: SIZES.recipientRow * 4,
    marginBottom: 16,
  },
  row: {
    height: SIZES.recipientRow,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: SIZES.radius,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  rowSelected: {
    backgroundColor: COLORS.saffronLight,
  },
  rowText: { color: COLORS.textDark, fontSize: 16 },

  /* Invite button */
  inviteBtn: {
    alignSelf: "center",
    marginVertical: 6,
  },
  inviteText: {
    color: COLORS.white,
    textDecorationLine: "underline",
  },

  /* Send button */
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
    marginTop: "auto",
    marginBottom: 12,
  },
  sendText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.saffron,
    letterSpacing: 0.5,
  },
});
