import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Location from "expo-location";
import { getNearbyShops } from "../lib/api";
import type { Shop } from "../lib/types";
import { useAuthStore } from "../store/authStore";
import { ShopCard, type ShopCardData } from "../components/ShopCard";
import { ShopCardSkeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { ErrorBanner } from "../components/ErrorBanner";
import { palette, space, type, weight } from "../theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CustomerStackParamList } from "../navigation/CustomerNavigator";

type Props = NativeStackScreenProps<CustomerStackParamList, "HomeMain">;

const STYLES = [
  { id: "classic", emoji: "💈", label: "Classic" },
  { id: "fade",    emoji: "✂️", label: "Fade" },
  { id: "modern",  emoji: "💫", label: "Modern" },
  { id: "beard",   emoji: "🧔", label: "Beard" },
];

function toShopCard(shop: Shop, distanceKm?: number): ShopCardData {
  return {
    id:           shop.id,
    name:         shop.name,
    rating:       shop.rating,
    distanceKm,
    serviceCount: shop.services?.length,
    isAsap:       distanceKm !== undefined && distanceKm < 2,
  };
}

export function HomeScreen({ navigation }: Props) {
  const token = useAuthStore((s) => s.token);
  const [shops, setShops]         = useState<Shop[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [locationKm, setLocationKm] = useState<Map<string, number>>(new Map());
  const [asapOnly, setAsapOnly]   = useState(false);

  const loadShops = useCallback(async (isRefresh = false) => {
    if (!token) return;
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);

      // Request location (best-effort)
      const { status } = await Location.requestForegroundPermissionsAsync();
      let userCoords: { latitude: number; longitude: number } | null = null;
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        userCoords = loc.coords;
      }

      const data = await getNearbyShops();
      setShops(data.data);

      // Compute mock distances if we have GPS
      if (userCoords) {
        const km = new Map<string, number>();
        data.data.forEach((shop, i) => {
          km.set(shop.id, parseFloat((0.3 + i * 0.4).toFixed(1)));
        });
        setLocationKm(km);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "โหลดร้านไม่สำเร็จ");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { loadShops(); }, [loadShops]);

  const filtered = shops.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (asapOnly) {
      const km = locationKm.get(s.id);
      // ASAP = within 2 km (≤ 15 min wait estimate)
      if (km === undefined || km > 2) return false;
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>สวัสดี 👋</Text>
          <Text style={styles.headline}>ค้นหาร้านตัดผม</Text>
        </View>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadShops(true)} tintColor={palette.brand} />}
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
      >
        {/* Lookbook styles */}
        <View style={styles.lookbook}>
          <Text style={styles.sectionLabel}>Style Lookbook</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.styleRow}>
            {STYLES.map((s) => (
              <Pressable
                key={s.id}
                style={[styles.styleChip, selectedStyle === s.id && styles.styleChipActive]}
                onPress={() => setSelectedStyle(selectedStyle === s.id ? null : s.id)}
                accessibilityRole="button"
                accessibilityLabel={s.label}
                accessibilityState={{ selected: selectedStyle === s.id }}
              >
                <Text style={styles.styleEmoji}>{s.emoji}</Text>
                <Text style={[styles.styleLabel, selectedStyle === s.id && styles.styleLabelActive]}>{s.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Search bar + ASAP filter (sticky) */}
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.search}
            value={search}
            onChangeText={setSearch}
            placeholder="ค้นหาร้าน..."
            placeholderTextColor={palette.subtle}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          <Pressable
            style={[styles.asapBtn, asapOnly && styles.asapBtnActive]}
            onPress={() => setAsapOnly((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel="กรองร้าน ASAP"
            accessibilityState={{ selected: asapOnly }}
          >
            <Text style={[styles.asapBtnText, asapOnly && styles.asapBtnTextActive]}>
              ⚡ ASAP
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {error && <ErrorBanner message={error} onRetry={() => loadShops()} />}

          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <ShopCardSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <EmptyState
              emoji="🔍"
              title="ไม่พบร้าน"
              subtitle="ลองค้นหาด้วยคำอื่น หรือดูร้านทั้งหมด"
              actionLabel="ล้างค้นหา"
              onAction={() => setSearch("")}
            />
          ) : (
            filtered.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={toShopCard(shop, locationKm.get(shop.id))}
                onPress={() => navigation.navigate("ShopDetail", { shopId: shop.id, shopName: shop.name })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.md,
  },
  greeting: {
    fontSize: type.sm,
    color: palette.muted,
  },
  headline: {
    fontSize: type.xl,
    fontWeight: weight.black,
    color: palette.ink,
  },
  lookbook: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    gap: space.sm,
  },
  sectionLabel: {
    fontSize: type.sm,
    fontWeight: weight.semi,
    color: palette.muted,
  },
  styleRow: {
    gap: space.sm,
    paddingRight: space.lg,
  },
  styleChip: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.card,
    minWidth: 72,
  },
  styleChipActive: {
    borderColor: palette.brand,
    backgroundColor: palette.brandLight,
  },
  styleEmoji: {
    fontSize: 24,
  },
  styleLabel: {
    fontSize: type.xs,
    fontWeight: weight.medium,
    color: palette.muted,
  },
  styleLabelActive: {
    color: palette.brand,
    fontWeight: weight.bold,
  },
  searchWrap: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    backgroundColor: palette.bg,
    flexDirection: "row",
    gap: space.sm,
    alignItems: "center",
  },
  search: {
    flex: 1,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 12,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    fontSize: type.base,
    color: palette.ink,
  },
  asapBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
  },
  asapBtnActive: {
    backgroundColor: "#fef9c3",
    borderColor: "#f59e0b",
  },
  asapBtnText: {
    fontSize: type.xs,
    fontWeight: weight.bold,
    color: palette.muted,
  },
  asapBtnTextActive: {
    color: "#b45309",
  },
  content: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: 32,
  },
});
