import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { palette, radius, type, weight } from "../theme";

const TAB_LABELS: Record<string, string> = {
  Home:     "หน้าแรก",
  Delivery: "เดลิเวอรี่",
  Bookings: "การจอง",
  Tracking: "ติดตาม",
  Rewards:  "รางวัล",
};

const TAB_ICONS: Record<string, { default: string; active: string }> = {
  Home:     { default: "🏠", active: "🏠" },
  Delivery: { default: "🚗", active: "🚗" },
  Bookings: { default: "📅", active: "📅" },
  Tracking: { default: "📍", active: "📍" },
  Rewards:  { default: "⭐", active: "⭐" },
};

export function CustomerBottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const label = TAB_LABELS[route.name] ?? route.name;
        const icon = TAB_ICONS[route.name] ?? { default: "●", active: "●" };

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            style={styles.tab}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            accessibilityState={{ selected: isFocused }}
          >
            {isFocused && <View style={styles.indicator} />}
            <Text style={[styles.icon, isFocused && styles.iconActive]}>
              {isFocused ? icon.active : icon.default}
            </Text>
            <Text
              style={[styles.label, isFocused && styles.labelActive]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
  icon: {
    fontSize: 20,
    opacity: 0.55,
  },
  iconActive: {
    opacity: 1,
  },
  label: {
    fontSize: type.xs,
    fontWeight: weight.medium,
    color: palette.subtle,
  },
  labelActive: {
    color: palette.brand,
    fontWeight: weight.bold,
  },
});
