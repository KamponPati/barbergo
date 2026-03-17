import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/authStore";
import { LoginScreen }        from "../screens/LoginScreen";
import { CustomerNavigator }  from "./CustomerNavigator";
import { PartnerNavigator }   from "./PartnerNavigator";
import { palette } from "../theme";

export type RootStackParamList = {
  Login:    undefined;
  Customer: undefined;
  Partner:  undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { token, role, hydrated, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Wait for SecureStore hydration
  if (!hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: palette.bg }}>
        <ActivityIndicator size="large" color={palette.brand} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
      {!token ? (
        // Auth stack
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : role === "partner" ? (
        // Partner app
        <Stack.Screen name="Partner" component={PartnerNavigator} />
      ) : (
        // Customer app (default for customer role)
        <Stack.Screen name="Customer" component={CustomerNavigator} />
      )}
    </Stack.Navigator>
  );
}
