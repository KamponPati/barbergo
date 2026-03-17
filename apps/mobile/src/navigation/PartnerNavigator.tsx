import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { PartnerDashboardScreen }  from "../screens/partner/DashboardScreen";
import { JobsScreen }              from "../screens/partner/JobsScreen";
import { ServicesScreen }          from "../screens/partner/ServicesScreen";
import { ScheduleScreen }          from "../screens/partner/ScheduleScreen";
import { WalletScreen }            from "../screens/partner/WalletScreen";
import { OnboardingScreen }        from "../screens/partner/OnboardingScreen";
import { palette, radius, type, weight } from "../theme";

// ─── Param Lists ──────────────────────────────────────────────────────────────
export type PartnerTabParamList = {
  Dashboard: undefined;
  Jobs:      undefined;
  Services:  undefined;
  Schedule:  undefined;
  Wallet:    undefined;
};

export type PartnerStackParamList = {
  PartnerTabs:  undefined;
  Onboarding:   undefined;
};

// ─── Navigators ───────────────────────────────────────────────────────────────
const Tab   = createBottomTabNavigator<PartnerTabParamList>();
const Stack = createNativeStackNavigator<PartnerStackParamList>();

// ─── Tab labels & icons ────────────────────────────────────────────────────────
const TAB_LABELS: Record<string, string> = {
  Dashboard: "หน้าหลัก",
  Jobs:      "งาน",
  Services:  "บริการ",
  Schedule:  "ตาราง",
  Wallet:    "กระเป๋า",
};

const TAB_ICONS: Record<string, string> = {
  Dashboard: "📊",
  Jobs:      "📋",
  Services:  "✂️",
  Schedule:  "📅",
  Wallet:    "💰",
};

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function PartnerTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={tabStyles.container}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const label     = TAB_LABELS[route.name] ?? route.name;
        const icon      = TAB_ICONS[route.name]  ?? "●";

        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable
            key={route.key}
            style={tabStyles.tab}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
          >
            {isFocused && <View style={tabStyles.indicator} />}
            <Text style={[tabStyles.icon, isFocused && tabStyles.iconActive]}>{icon}</Text>
            <Text style={[tabStyles.label, isFocused && tabStyles.labelActive]} numberOfLines={1}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Tab Navigator ────────────────────────────────────────────────────────────
function PartnerTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <PartnerTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={PartnerDashboardScreen} />
      <Tab.Screen name="Jobs"      component={JobsScreen} />
      <Tab.Screen name="Services"  component={ServicesScreen} />
      <Tab.Screen name="Schedule"  component={ScheduleScreen} />
      <Tab.Screen name="Wallet"    component={WalletScreen} />
    </Tab.Navigator>
  );
}

// ─── Root Partner Stack ───────────────────────────────────────────────────────
export function PartnerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PartnerTabs"  component={PartnerTabs} />
      <Stack.Screen name="Onboarding"   component={OnboardingScreen} options={{ presentation: "modal" }} />
    </Stack.Navigator>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const tabStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: palette.card,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingTop: 6,
    minHeight: 56,
    position: "relative",
  },
  indicator: {
    position: "absolute",
    top: 0,
    width: 28,
    height: 3,
    backgroundColor: palette.brand,
    borderRadius: radius.full,
  },
  icon:        { fontSize: 20, opacity: 0.55 },
  iconActive:  { opacity: 1 },
  label:       { fontSize: type.xs, fontWeight: weight.medium, color: palette.subtle },
  labelActive: { color: palette.brand, fontWeight: weight.bold },
});
