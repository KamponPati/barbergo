import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { palette, space, type, weight } from "../theme";
import { Button } from "./Button";

interface EmptyStateProps {
  emoji?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ emoji = "📭", title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} size="sm" style={{ marginTop: space.md }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: space.xxl,
    gap: space.sm,
  },
  emoji: {
    fontSize: 48,
    marginBottom: space.sm,
  },
  title: {
    fontSize: type.md,
    fontWeight: weight.bold,
    color: palette.ink,
    textAlign: "center",
  },
  subtitle: {
    fontSize: type.sm,
    color: palette.muted,
    textAlign: "center",
    lineHeight: 20,
  },
});
