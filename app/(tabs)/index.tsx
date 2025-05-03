"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  View,
  Platform,
  StatusBar,
} from "react-native";

import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../constants/Styles";
import SearchContacts, { Recipient } from "../../components/SearchContacts";
import useContacts from "../../hooks/useContacts";
import RecipientList from "../../components/RecipientList";
import BottomActions from "../../components/BottomActions";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिं" },
];

export default function TabOneScreen() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const { session, loading } = useAuth();
  const { deviceContacts, registered } = useContacts(
    language.code as "en" | "hi"
  );

  const addRecipient = useCallback(
    (contact: Recipient) => {
      if (!contact.registered) {
        Alert.alert(
          language.code === "hi"
            ? "यह संपर्क अभी तक Pranaam पर नहीं है"
            : "This contact isn’t on Pranaam yet"
        );
        return;
      }

      setRecipients((prev) => {
        if (prev.some((r) => r.id === contact.id)) return prev;
        return [...prev, { ...contact }];
      });
    },
    [language.code]
  );

  // Toggle selection of a recipient
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

  // Remove a recipient from the list
  const removeRecipient = useCallback((id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  // Send Pranaam to selected recipients
  const sendPranaam = useCallback(async () => {
    const payload = Array.from(selectedIds)
      .map((id) => recipients.find((r) => r.id === id))
      .filter((r): r is Recipient => !!r)
      .map((r) => ({
        sender: session!.user.id,
        recipient: r.id,
        title: "जय श्री राम 🙏",
        body: "You have received a Pranaam!",
      }));
    const { error } = await supabase.from("notifications").insert(payload);
    console.log("Sending Pranaam", payload);
    if (error) {
      console.error("Failed to send notification:", error.message);
      Alert.alert("Error", "Failed to send Pranaam. Try again!");
      return;
    }

    Alert.alert(
      language.code === "hi" ? "भेजा गया!" : "Sent!",
      language.code === "hi"
        ? "आपका प्रणाम भेज दिया गया है।"
        : "Your Pranaam has been sent."
    );
  }, [selectedIds, session?.user.id, language.code]);

  // Invite others to the app
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

  // Toggle language
  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev.code === "en" ? LANGUAGES[1] : LANGUAGES[0]));
    setLangMenuOpen(false);
  }, []);

  if (loading || !session) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {language.code === "hi" ? "प्रणाम" : "Pranaam"}
        </Text>
        <Pressable style={styles.langButton} onPress={toggleLanguage}>
          <Text style={styles.langButtonText}>{language.label}</Text>
        </Pressable>
      </View>
      <SearchContacts
        deviceContacts={deviceContacts}
        registered={registered}
        language={language}
        onAdd={addRecipient}
      />
      {/* Recipients Section */}
      <View style={styles.recipientsSection}>
        <Text style={styles.sectionTitle}>
          {language.code === "hi" ? "मेरे प्राप्तकर्ता" : "My Recipients"}
          {recipients.length > 0 && (
            <Text style={styles.recipientCount}> ({recipients.length})</Text>
          )}
        </Text>

        <RecipientList
          recipients={recipients}
          selectedIds={selectedIds}
          languageCode={language.code as "en" | "hi"}
          onToggle={toggleRecipientSelection}
          onRemove={removeRecipient}
        />
      </View>
      <BottomActions
        disabled={selectedIds.size === 0}
        selectedCount={selectedIds.size}
        languageCode={language.code as "en" | "hi"}
        onInvite={inviteOthers}
        onSend={sendPranaam}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
    paddingBottom: 12,
    backgroundColor: COLORS.saffron,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  langButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  langButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  recipientsSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  recipientCount: {
    fontWeight: "400",
    color: "#666",
  },
  recipientList: {
    flex: 1,
  },
});
