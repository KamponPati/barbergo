import React, { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { getAvailability, getShopDetail } from "../lib/api";
import type { Shop } from "../lib/types";
import { useAuthStore } from "../store/authStore";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ErrorBanner } from "../components/ErrorBanner";
import { Skeleton } from "../components/Skeleton";
import { palette, radius, space, type, weight } from "../theme";
import type { CustomerStackParamList } from "../navigation/CustomerNavigator";

type Props = NativeStackScreenProps<CustomerStackParamList, "ShopDetail">;

// Mock staff derived from shop (in production comes from /discovery/shops/:id/staff)
interface StaffMember {
  id:        string;
  name:      string;
  specialty: string;
  rating:    number;
  emoji:     string;
}

const STAFF_POOL: StaffMember[] = [
  { id: "s1", name: "น้องแมว",  specialty: "Fade & Classic",   rating: 4.9, emoji: "💈" },
  { id: "s2", name: "พี่ต้น",   specialty: "Beard & Grooming", rating: 4.7, emoji: "✂️" },
  { id: "s3", name: "เอ็ม",     specialty: "Color & Style",    rating: 4.8, emoji: "🎨" },
];

export function ShopDetailScreen({ route, navigation }: Props) {
  const { shopId, shopName } = route.params;
  const token = useAuthStore((s) => s.token);
  const [shop, setShop]             = useState<Shop | null>(null);
  const [slots, setSlots]           = useState<string[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const detail = await getShopDetail(shopId);
      setShop(detail);

      // Load availability for first service + branch
      if (detail.services[0] && detail.branches?.[0]) {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        const dateStr = date.toISOString().slice(0, 10);
        const av = await getAvailability({
          shopId,
          branchId: detail.branches[0].id,
          serviceId: detail.services[0].id,
          date: dateStr,
        });
        setSlots(av.slots);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "โหลดรายละเอียดไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => { load(); }, [load]);

  // Derive staff from shop (deterministic from shop id)
  const staff = shop
    ? STAFF_POOL.slice(0, 2 + (shop.id.charCodeAt(shop.id.length - 1) % 2))
    : [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {error && <ErrorBanner message={error} onRetry={load} />}

        {loading ? (
          <View style={{ gap: 12 }}>
            <Skeleton height={24} width="60%" />
            <Skeleton height={14} width="40%" />
            <Skeleton height={80} />
            <Skeleton height={120} />
          </View>
        ) : shop ? (
          <>
            {/* Shop header */}
            <View style={styles.shopHeader}>
              <Text style={styles.shopName}>{shop.name}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.rating}>★ {shop.rating.toFixed(1)}</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.metaText}>{shop.services.length} บริการ</Text>
              </View>
            </View>

            {/* Staff section */}
            <Text style={styles.sectionTitle}>เลือกช่าง</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.staffRow}>
              {/* "Any" option */}
              <Pressable
                style={[styles.staffCard, selectedStaff === null && styles.staffCardActive]}
                onPress={() => setSelectedStaff(null)}
                accessibilityRole="button"
                accessibilityLabel="ช่างใดก็ได้"
                accessibilityState={{ selected: selectedStaff === null }}
              >
                <Text style={styles.staffEmoji}>🎲</Text>
                <Text style={[styles.staffName, selectedStaff === null && styles.staffNameActive]}>ใดก็ได้</Text>
                <Text style={styles.staffSpec}>ระบบเลือกให้</Text>
              </Pressable>

              {staff.map((s) => (
                <Pressable
                  key={s.id}
                  style={[styles.staffCard, selectedStaff?.id === s.id && styles.staffCardActive]}
                  onPress={() => setSelectedStaff(s)}
                  accessibilityRole="button"
                  accessibilityLabel={s.name}
                  accessibilityState={{ selected: selectedStaff?.id === s.id }}
                >
                  <Text style={styles.staffEmoji}>{s.emoji}</Text>
                  <Text style={[styles.staffName, selectedStaff?.id === s.id && styles.staffNameActive]}>
                    {s.name}
                  </Text>
                  <Text style={styles.staffSpec}>{s.specialty}</Text>
                  <Text style={styles.staffRating}>⭐ {s.rating}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Services */}
            <Text style={styles.sectionTitle}>บริการ</Text>
            {shop.services.map((svc) => (
              <Card key={svc.id} style={styles.serviceCard}>
                <View style={styles.serviceRow}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{svc.name}</Text>
                    <Text style={styles.servicePrice}>{svc.price.toLocaleString()} ฿</Text>
                    {selectedStaff && (
                      <Text style={styles.serviceStaff}>ช่าง: {selectedStaff.name}</Text>
                    )}
                  </View>
                  <Button
                    label="จอง"
                    size="sm"
                    onPress={() => navigation.navigate("BookingFlow", {
                      shopId,
                      shopName: shop.name,
                      serviceId: svc.id,
                      serviceName: svc.name,
                      servicePrice: svc.price,
                    })}
                  />
                </View>
              </Card>
            ))}

            {/* Available slots */}
            {slots.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>เวลาว่าง (วันพรุ่งนี้)</Text>
                <View style={styles.slotsGrid}>
                  {slots.slice(0, 8).map((slot) => {
                    const t = new Date(slot).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <Pressable key={slot} style={styles.slot} accessibilityRole="button">
                        <Text style={styles.slotText}>{t}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: palette.bg },
  scroll: { padding: space.lg, gap: space.lg },

  shopHeader: { gap: 4 },
  shopName:   { fontSize: type.xl, fontWeight: weight.black, color: palette.ink },
  metaRow:    { flexDirection: "row", gap: space.sm, alignItems: "center" },
  rating:     { fontSize: type.sm, color: palette.warning, fontWeight: weight.semi },
  metaDot:    { fontSize: type.sm, color: palette.subtle },
  metaText:   { fontSize: type.sm, color: palette.muted },

  sectionTitle: { fontSize: type.md, fontWeight: weight.bold, color: palette.ink },

  staffRow:       { gap: space.sm, paddingRight: space.sm },
  staffCard:      {
    width: 96, alignItems: "center", gap: 4,
    backgroundColor: palette.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: palette.line,
    paddingVertical: space.md, paddingHorizontal: space.sm,
  },
  staffCardActive: { borderColor: palette.brand, backgroundColor: palette.brandLight },
  staffEmoji:      { fontSize: 28 },
  staffName:       { fontSize: type.xs, fontWeight: weight.bold, color: palette.ink, textAlign: "center" },
  staffNameActive: { color: palette.brand },
  staffSpec:       { fontSize: 9, color: palette.muted, textAlign: "center" },
  staffRating:     { fontSize: 9, color: palette.warning, fontWeight: weight.semi },

  serviceCard:   { padding: 0, overflow: "hidden" },
  serviceRow:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: space.md },
  serviceInfo:   { flex: 1, gap: 2 },
  serviceName:   { fontSize: type.base, fontWeight: weight.semi, color: palette.ink },
  servicePrice:  { fontSize: type.sm, color: palette.brand, fontWeight: weight.bold },
  serviceStaff:  { fontSize: type.xs, color: palette.muted },

  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  slot: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.brand,
    backgroundColor: palette.brandLight,
  },
  slotText: { fontSize: type.sm, color: palette.brand, fontWeight: weight.semi },
});
