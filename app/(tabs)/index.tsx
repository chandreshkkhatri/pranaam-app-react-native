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
import { useRouter } from "expo-router";
import * as Contacts from "expo-contacts";
import { Feather, MaterialIcons } from "@expo/vector-icons";

import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../constants/Styles";

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

  const { session, loading } = useAuth();
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    if (!loading && !session) {
      router.replace("/auth/LoginScreen");
    }
  }, [loading, session]);

  // Contact permissions and loading
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

  // Filter contacts based on search query
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
            id: `${contact.id}_${contactIndex}_${phoneIndex}`,
            name: contact.name,
            number: phone.number,
          });
        }
      });
    });

    return results;
  }, [deviceContacts, query]);

  // Add a recipient from search results
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

    const { error } = await supabase.from("notifications").insert(
      Array.from(selectedIds).map((recipientId) => ({
        sender: session?.user.id,
        recipient: recipientId,
        title: "जय श्री राम 🙏",
        body: "You have received a Pranaam!",
      }))
    );

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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
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
            onFocus={() => setSearchDropdownVisible(true)}
            onChangeText={(text) => {
              setQuery(text);
              if (text.length === 0) setSearchDropdownVisible(false);
              else setSearchDropdownVisible(true);
            }}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => {
                setQuery("");
                setSearchDropdownVisible(false);
              }}
              style={styles.clearButton}
            >
              <Feather name="x" size={18} color="#999" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Search Results Dropdown */}
      {searchDropdownVisible && query.length > 0 && (
        <View style={styles.dropdownContainer}>
          <FlatList
            data={filteredContacts.slice(0, 20)}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                style={styles.dropdownItem}
                onPress={() => addRecipient(item)}
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
                <View style={styles.addButton}>
                  <Feather name="plus" size={16} color="#fff" />
                </View>
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

      {/* Recipients Section */}
      <View style={styles.recipientsSection}>
        <Text style={styles.sectionTitle}>
          {language.code === "hi" ? "मेरे प्राप्तकर्ता" : "My Recipients"}
          {recipients.length > 0 && (
            <Text style={styles.recipientCount}> ({recipients.length})</Text>
          )}
        </Text>

        <FlatList
          data={recipients}
          keyExtractor={(item) => item.id}
          style={styles.recipientList}
          contentContainerStyle={
            recipients.length === 0 ? styles.emptyListContainer : null
          }
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.recipientItem,
                selectedIds.has(item.id) && styles.selectedRecipient,
              ]}
              onPress={() => toggleRecipientSelection(item.id)}
            >
              <View style={styles.recipientInfo}>
                <View
                  style={[
                    styles.recipientAvatar,
                    selectedIds.has(item.id) && styles.selectedAvatar,
                  ]}
                >
                  {selectedIds.has(item.id) ? (
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
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  removeRecipient(item.id);
                }}
                style={styles.removeButton}
              >
                <Feather name="x" size={16} color="#999" />
              </Pressable>
            </Pressable>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <MaterialIcons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>
                {language.code === "hi"
                  ? "कोई प्राप्तकर्ता नहीं जोड़ा गया"
                  : "No recipients added yet"}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {language.code === "hi"
                  ? "ऊपर संपर्क खोजें और जोड़ें"
                  : "Search and add contacts above"}
              </Text>
            </View>
          )}
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
