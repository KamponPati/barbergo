import React, { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, type NavigationContainerRef } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "./src/navigation/RootNavigator";
import {
  registerForPushNotificationsAsync,
  subscribeToForegroundNotifications,
  subscribeToNotificationResponse,
} from "./src/lib/notifications";
import { useAuthStore } from "./src/store/authStore";
import { registerMobileDeviceToken } from "./src/lib/api";
import type { RootStackParamList } from "./src/navigation/RootNavigator";

export default function App() {
  const { token, role, userId } = useAuthStore();
  const navRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Register push token after login
  useEffect(() => {
    if (!token || !role || !userId) return;
    registerForPushNotificationsAsync().then((deviceToken) => {
      if (!deviceToken) return;
      registerMobileDeviceToken({ token, role, userId, deviceToken }).catch(() => {});
    });
  }, [token, role, userId]);

  // Foreground notification handler
  useEffect(() => {
    const unsub = subscribeToForegroundNotifications((_bookingId) => {
      if (role === "partner") {
        // Navigate partner to Jobs tab
        navRef.current?.navigate("Partner" as never);
      } else {
        // Navigate customer to Bookings tab
        navRef.current?.navigate("Customer" as never);
      }
    });
    return unsub;
  }, [role]);

  // Background / killed → tap to navigate
  useEffect(() => {
    const unsub = subscribeToNotificationResponse((_bookingId) => {
      if (role === "partner") {
        navRef.current?.navigate("Partner" as never);
      } else {
        navRef.current?.navigate("Customer" as never);
      }
    });
    return unsub;
  }, [role]);

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navRef}>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
