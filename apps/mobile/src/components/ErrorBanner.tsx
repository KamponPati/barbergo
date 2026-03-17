import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { palette, radius, space, type, weight } from "../theme";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message} numberOfLines={2}>{message}</Text>
      {onRetry && (
        <Pressable onPress={onRetry} accessibilityRole="button" accessibilityLabel="ลองใหม่">
          <Text style={styles.retry}>ลองใหม่</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderRadius: radius.md,
    padding: space.md,
    marginHorizontal: space.lg,
    marginVertical: space.sm,
    gap: space.sm,
  },
  icon: {
    fontSize: 16,
  },
  message: {
    flex: 1,
    fontSize: type.sm,
    color: palette.danger,
    lineHeight: 18,
  },
  retry: {
    fontSize: type.sm,
    fontWeight: weight.bold,
    color: palette.danger,
    textDecorationLine: "underline",
  },
});
