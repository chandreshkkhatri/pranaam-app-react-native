import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { View, Text, TextInput, Pressable, Alert } from "react-native";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert("Error", error.message);
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
        onPress={handleLogin}
        style={{ backgroundColor: "orange", padding: 12 }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Login</Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate("Signup")}
        style={{ marginTop: 12 }}
      >
        <Text style={{ textAlign: "center" }}>
          Don't have an account? Sign up
        </Text>
      </Pressable>
    </View>
  );
}
