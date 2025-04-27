import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { View, Text, TextInput, Pressable, Alert } from "react-native";

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) Alert.alert("Error", error.message);
    else Alert.alert("Success", "Check your email to confirm signup!");
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

      <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
        <Text style={{ textAlign: "center" }}>
          Already have an account? Login
        </Text>
      </Pressable>
    </View>
  );
}
