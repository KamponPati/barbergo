import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, type ViewStyle } from "react-native";
import { palette, radius } from "../theme";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
  rounded?: boolean;
}

export function Skeleton({ width = "100%", height = 16, style, rounded = false }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        { width: width as number, height, opacity },
        rounded && styles.rounded,
        style,
      ]}
    />
  );
}

export function ShopCardSkeleton() {
  return (
    <View style={styles.cardSkeleton}>
      <View style={styles.accentSkeleton} />
      <View style={styles.bodySkeleton}>
        <Skeleton height={16} width="70%" />
        <Skeleton height={12} width="50%" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: palette.line,
    borderRadius: radius.sm,
  },
  rounded: {
    borderRadius: radius.full,
  },
  cardSkeleton: {
    flexDirection: "row",
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.line,
    overflow: "hidden",
    marginBottom: 8,
    height: 72,
  },
  accentSkeleton: {
    width: 4,
    backgroundColor: palette.line,
  },
  bodySkeleton: {
    flex: 1,
    padding: 12,
    gap: 8,
    justifyContent: "center",
  },
});
