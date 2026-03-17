import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { palette, radius, space, type, weight } from "../theme";
import { Badge } from "./Badge";

export interface ShopCardData {
  id: string;
  name: string;
  rating: number;
  distanceKm?: number;
  waitMinutes?: number;
  isAsap?: boolean;
  serviceCount?: number;
  zone?: string;
}

interface ShopCardProps {
  shop: ShopCardData;
  onPress: () => void;
}

export function ShopCard({ shop, onPress }: ShopCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`ร้าน ${shop.name}`}
    >
      {/* Left accent */}
      <View style={styles.accent} />

      <View style={styles.body}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>{shop.name}</Text>
          {shop.isAsap && <Badge label="ASAP" variant="success" />}
        </View>

        {/* Meta row */}
        <View style={styles.metaRow}>
          <Text style={styles.ratingText}>★ {shop.rating.toFixed(1)}</Text>
          {shop.distanceKm !== undefined && (
            <Text style={styles.metaText}>• {shop.distanceKm < 1 ? `${(shop.distanceKm * 1000).toFixed(0)} ม.` : `${shop.distanceKm.toFixed(1)} กม.`}</Text>
          )}
          {shop.waitMinutes !== undefined && (
            <Text style={styles.metaText}>• รอ {shop.waitMinutes} นาที</Text>
          )}
          {shop.zone && (
            <Text style={styles.metaText}>• {shop.zone}</Text>
          )}
        </View>

        {/* Service count */}
        {shop.serviceCount !== undefined && (
          <Text style={styles.caption}>{shop.serviceCount} บริการ</Text>
        )}
      </View>

      {/* Arrow */}
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.line,
    overflow: "hidden",
    marginBottom: space.sm,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  accent: {
    width: 4,
    alignSelf: "stretch",
    backgroundColor: palette.brand,
  },
  body: {
    flex: 1,
    padding: space.md,
    gap: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  name: {
    flex: 1,
    fontSize: type.base,
    fontWeight: weight.bold,
    color: palette.ink,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  ratingText: {
    fontSize: type.sm,
    color: palette.warning,
    fontWeight: weight.semi,
  },
  metaText: {
    fontSize: type.sm,
    color: palette.muted,
  },
  caption: {
    fontSize: type.xs,
    color: palette.subtle,
  },
  arrow: {
    fontSize: 20,
    color: palette.subtle,
    paddingRight: space.md,
  },
});
