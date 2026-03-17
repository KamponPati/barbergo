import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { palette, radius, type, weight } from "../theme";

type BadgeVariant = "primary" | "success" | "warning" | "danger" | "neutral";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const config: Record<BadgeVariant, { bg: string; color: string }> = {
  primary: { bg: palette.brandLight, color: palette.brand },
  success: { bg: "#dcfce7", color: palette.success },
  warning: { bg: "#fef3c7", color: palette.warning },
  danger:  { bg: "#fee2e2", color: palette.danger },
  neutral: { bg: "#f1f5f9", color: palette.muted },
};

export function Badge({ label, variant = "neutral" }: BadgeProps) {
  const { bg, color } = config[variant];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: type.xs,
    fontWeight: weight.bold,
  },
});
