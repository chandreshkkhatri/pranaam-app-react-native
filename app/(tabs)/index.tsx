"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { E164Number, parsePhoneNumber } from "libphonenumber-js/min";

import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../constants/Styles";
import SearchContacts, { Recipient } from "../../components/SearchContacts";
import useContacts from "../../hooks/useContacts";
import RecipientList from "../../components/RecipientList";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिं" },
];

type Registered = { id: string; phone: string; auth_id: string };

export default function TabOneScreen() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // const [deviceContacts, setDeviceContacts] = useState<Contacts.Contact[]>([]);
  // const [registered, setRegistered] = useState<Map<string, Registered>>(
  //   new Map()
  // );
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
    if (selectedIds.size === 0) return;

    const payload = Array.from(selectedIds)
      .map((id) => recipients.find((r) => r.id === id))
      .filter((r): r is Recipient => !!r && !!r.auth_id)
      .map((r) => ({
        sender: session!.user.id,
        recipient: r.auth_id,
        title: "जय श्री राम 🙏",
        body: "You have received a Pranaam!",
      }));
    const { error } = await supabase.from("notifications").insert(payload);

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

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Pressable style={styles.inviteButton} onPress={inviteOthers}>
          <Feather name="share-2" size={16} color="#fff" />
          <Text style={styles.inviteButtonText}>
            {language.code === "hi"
              ? "दोस्तों को आमंत्रित करें"
              : "Invite Friends"}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.pranaamButton,
            selectedIds.size === 0 && styles.disabledButton,
          ]}
          disabled={selectedIds.size === 0}
          onPress={sendPranaam}
        >
          <Text style={styles.pranaamButtonText}>जय श्री राम 🙏</Text>
          <Text style={styles.pranaamButtonSubtext}>
            {language.code === "hi"
              ? `${selectedIds.size} लोगों को भेजें`
              : `Send to ${selectedIds.size} ${
                  selectedIds.size === 1 ? "person" : "people"
                }`}
          </Text>
        </Pressable>
      </View>
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
