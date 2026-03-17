import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps, type ViewStyle } from "react-native";
import { appStyles, palette, radius, type, weight } from "../theme";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

interface ButtonProps extends Omit<PressableProps, "style"> {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    size === "sm" && styles.sm,
    variant === "primary" && styles.primary,
    variant === "secondary" && styles.secondary,
    variant === "ghost" && styles.ghost,
    variant === "danger" && styles.danger,
    fullWidth && styles.fullWidth,
    isDisabled && appStyles.btnDisabled,
    style,
  ];

  const textStyle = [
    styles.text,
    size === "sm" && styles.textSm,
    variant === "secondary" && styles.textSecondary,
    variant === "ghost" && styles.textGhost,
  ];

  return (
    <Pressable
      style={({ pressed }) => [...containerStyle, pressed && styles.pressed]}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" || variant === "danger" ? "#fff" : palette.brand}
        />
      ) : (
        <Text style={textStyle}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 36,
  },
  primary: {
    backgroundColor: palette.brand,
  },
  secondary: {
    backgroundColor: palette.brandLight,
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: palette.line,
  },
  danger: {
    backgroundColor: palette.danger,
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    color: "#fff",
    fontWeight: weight.bold,
    fontSize: type.base,
  },
  textSm: {
    fontSize: type.sm,
  },
  textSecondary: {
    color: palette.brand,
  },
  textGhost: {
    color: palette.ink,
    fontWeight: weight.semi,
  },
});
