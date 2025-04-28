import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router"; // ← import this
import { supabase } from "../../lib/supabase"; // adjust path

export default function LoginScreen() {
  const router = useRouter(); // ← get the router
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) Alert.alert("Error", error.message);
    else router.replace("/(tabs)"); // ← on success, go to your tabs
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <Text>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email" // 🔥
        textContentType="emailAddress" // 🔥
        importantForAutofill="yes"
        style={{ borderWidth: 1, marginBottom: 12 }}
      />

      <Text>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
        importantForAutofill="yes"
        style={{ borderWidth: 1, marginBottom: 12 }}
      />

      <Pressable
        onPress={handleLogin}
        style={{ backgroundColor: "orange", padding: 12 }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Login</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/auth/SignUpScreen")}
        style={{ marginTop: 12 }}
      >
        <Text style={{ textAlign: "center" }}>
          Don't have an account? Sign up
        </Text>
      </Pressable>
    </View>
  );
}
