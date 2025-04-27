import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router"; // ← import this
import { supabase } from "../../lib/supabase"; // adjust path

export default function SignupScreen() {
  const router = useRouter(); // ← get the router
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert("Error", error.message);
    else {
      Alert.alert("Success", "Check your email for confirmation.");
      router.replace("/auth/LoginScreen"); // ← send them back to login
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <Text>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{ borderWidth: 1, marginBottom: 12 }}
      />

      <Text>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 12 }}
      />

      <Pressable
        onPress={handleSignup}
        style={{ backgroundColor: "green", padding: 12 }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Sign Up</Text>
      </Pressable>

      <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
        <Text style={{ textAlign: "center" }}>
          Already have an account? Login
        </Text>
      </Pressable>
    </View>
  );
}
