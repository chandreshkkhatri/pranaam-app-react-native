import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Platform } from "react-native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import Constants from "expo-constants";

import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider, useAuth } from "../context/AuthContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
export async function registerForPushNotificationsAsync() {
  try {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    console.log("Existing Notification Status:", existingStatus);

    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log("Requested Notification Status:", status);
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    console.log("Expo Push Token Data:", tokenData);
    const token = tokenData.data;
    return token;
  } catch (error) {
    console.error("Error in registering for push notifications:", error);
  }
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    async function prepareNotifications() {
      const expoPushToken = await registerForPushNotificationsAsync();
      console.log("Registered Push Token:", expoPushToken);
    }

    prepareNotifications();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <InnerLayout />
    </AuthProvider>
  );
}

function InnerLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { session, loading } = useAuth(); // ← NEW

  useEffect(() => {
    if (loading) return; // still restoring; stay on splash

    if (session) {
      router.replace("/(tabs)"); // user already logged-in
    } else {
      router.replace("/auth/PhoneOtpScreen"); // no session → auth flow
    }
  }, [loading, session]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      ({ notification }) => {
        console.log("Tapped Notification:", notification.request.content);

        // optionally, navigate somewhere
        // router.push("/(tabs)/index");
        // or router.push("/some-custom-screen");
      }
    );

    return () => subscription.remove(); // clean up when unmount
  }, []);

  if (loading) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/LoginScreen" />
        <Stack.Screen name="auth/SignUpScreen" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
