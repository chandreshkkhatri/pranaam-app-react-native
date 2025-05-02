// app/auth/PhoneOtpScreen.tsx
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

export default function PhoneOtpScreen() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [tokenError, setTokenError] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePhone = (value: string) => {
    if (!/^\+\d{10,15}$/.test(value)) {
      setPhoneError("Enter phone in E.164 (e.g. +919876543210)");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const validateToken = (value: string) => {
    if (value.length !== 6) {
      setTokenError("Code must be 6 digits");
      return false;
    }
    setTokenError("");
    return true;
  };

  async function sendOtp() {
    if (!validatePhone(phone)) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);

    if (error) {
      Alert.alert("Error sending OTP", error.message);
    } else {
      setStep("verify");
    }
  }

  async function verifyOtp() {
    if (!validateToken(token)) return;
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });
    setLoading(false);

    if (error) {
      Alert.alert("Verification failed", error.message);
    } else {
      router.replace("/(tabs)");
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
            <Text style={styles.welcomeText}>
              {step === "request" ? "Verify Your Phone" : "Enter OTP"}
            </Text>
            <Text style={styles.subtitleText}>
              {step === "request"
                ? "We’ll text you a 6-digit code"
                : `Code sent to ${phone}`}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {step === "request" ? (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    phoneError ? styles.inputError : null,
                  ]}
                >
                  <Feather
                    name="phone"
                    size={18}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={phone}
                    onChangeText={(t) => {
                      setPhone(t);
                      if (phoneError) validatePhone(t);
                    }}
                    placeholder="+911234567890"
                    keyboardType="phone-pad"
                    style={styles.input}
                    placeholderTextColor="#999"
                    onBlur={() => validatePhone(phone)}
                  />
                </View>
                {phoneError ? (
                  <Text style={styles.errorText}>{phoneError}</Text>
                ) : null}

                <TouchableOpacity
                  onPress={sendOtp}
                  style={styles.loginButton}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.loginButtonText}>Send OTP</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>6-Digit Code</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    tokenError ? styles.inputError : null,
                  ]}
                >
                  <Feather
                    name="key"
                    size={18}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={token}
                    onChangeText={(t) => {
                      setToken(t);
                      if (tokenError) validateToken(t);
                    }}
                    placeholder="123456"
                    keyboardType="number-pad"
                    style={styles.input}
                    placeholderTextColor="#999"
                    onBlur={() => validateToken(token)}
                  />
                </View>
                {tokenError ? (
                  <Text style={styles.errorText}>{tokenError}</Text>
                ) : null}

                <TouchableOpacity
                  onPress={verifyOtp}
                  style={styles.loginButton}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.loginButtonText}>Verify & Sign In</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
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
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: "#666",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 24,
  },
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
  inputError: {
    borderColor: "#FF3B30",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#333",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
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
    marginTop: 16,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
