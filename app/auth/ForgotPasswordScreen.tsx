"use client";

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  /* ── validation ── */
  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError("Email is required");
      return false;
    }
    if (!re.test(value)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  /* ── request reset link ── */
  async function handleReset() {
    if (!validateEmail(email)) return;
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "pranaam://reset", // deep-link after user sets new pwd
      });

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert(
          "Email sent",
          "Check your inbox for a link to reset your password."
        );
        router.back();
      }
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>प्रणाम</Text>
            </View>
            <Text style={styles.welcomeText}>Forgot Password</Text>
            <Text style={styles.subtitleText}>Enter your registered email</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View
                style={[
                  styles.inputWrapper,
                  emailError ? styles.inputError : null,
                ]}
              >
                <Feather
                  name="mail"
                  size={18}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (emailError) validateEmail(t);
                  }}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  importantForAutofill="yes"
                  style={styles.input}
                  placeholderTextColor="#999"
                  onBlur={() => validateEmail(email)}
                />
              </View>
              {emailError && <Text style={styles.errorText}>{emailError}</Text>}
            </View>

            <TouchableOpacity
              onPress={handleReset}
              style={styles.loginButton}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              style={{ alignSelf: "center" }}
            >
              <Text style={styles.signupLinkText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* === reused styles from LoginScreen === */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  keyboardAvoidingView: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 40 },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF9933",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoText: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitleText: { fontSize: 16, color: "#666" },

  form: { width: "100%" },
  inputContainer: { marginBottom: 20 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    height: 50,
    paddingHorizontal: 12,
  },
  inputError: { borderColor: "#FF3B30" },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: "100%", fontSize: 16, color: "#333" },
  errorText: { color: "#FF3B30", fontSize: 12, marginTop: 4, marginLeft: 4 },

  loginButton: {
    backgroundColor: "#FF9933",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  signupLinkText: { color: "#FF9933", fontSize: 14, fontWeight: "600" },
});
