import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getNearbyShops } from "../lib/api";
import type { Shop } from "../lib/types";
import { useAuthStore } from "../store/authStore";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { ErrorBanner } from "../components/ErrorBanner";
import { ShopCardSkeleton } from "../components/Skeleton";
import { palette, radius, space, type, weight } from "../theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CustomerStackParamList } from "../navigation/CustomerNavigator";

// Barber data is derived from shops — each shop becomes a "barber" for delivery
interface Barber {
  id:       string;
  name:     string;
  specialty: string;
  rating:   number;
  etaMin:   number;
  status:   "ready" | "busy";
  emoji:    string;
  bio:      string;
  equipment: string[];
  shopId:   string;
  shopName: string;
  serviceId: string;
  servicePrice: number;
}

const SPECIALTIES = ["Classic Cut", "Fade & Taper", "Beard Trim", "Modern Style", "Kids Cut"];
const EMOJIS      = ["👨‍🦱", "👨‍🦳", "🧔", "👨‍🦲", "👱"];
const BIOS = [
  "ช่างมืออาชีพประสบการณ์ 8 ปี เชี่ยวชาญ Fade และ Classic",
  "รักความสะอาด เน้นรายละเอียด ลูกค้าพึงพอใจ 100%",
  "ผ่านการอบรมจากสถาบันชั้นนำ ถนัด Modern Style",
  "ช่างหนุ่มไฟแรง เทคนิคใหม่ ไม่เคย out of style",
  "ตัดผมเด็กเชี่ยวชาญ ไม่กลัวเด็กดิ้น มือเบา รวดเร็ว",
];
const EQUIPMENT_SETS = [
  ["Andis Clippers", "Wahl Trimmers", "Straight Razor", "Hair Dryer"],
  ["Oster Clippers", "Scissors Set", "Beard Comb", "Spray Bottle"],
  ["Babyliss Clippers", "Thinning Scissors", "Hot Towel", "Pomade"],
];

function shopToBarber(shop: Shop, idx: number): Barber {
  const svc = shop.services[0];
  return {
    id:           shop.id,
    name:         `ช่าง${shop.name.split(" ")[0] ?? shop.name}`,
    specialty:    SPECIALTIES[idx % SPECIALTIES.length],
    rating:       shop.rating,
    etaMin:       10 + idx * 5,
    status:       idx % 3 === 0 ? "busy" : "ready",
    emoji:        EMOJIS[idx % EMOJIS.length],
    bio:          BIOS[idx % BIOS.length],
    equipment:    EQUIPMENT_SETS[idx % EQUIPMENT_SETS.length],
    shopId:       shop.id,
    shopName:     shop.name,
    serviceId:    svc?.id ?? "",
    servicePrice: svc?.price ?? 300,
  };
}

interface ProfileSheetProps {
  barber: Barber;
  onClose: () => void;
  onBook: () => void;
}

function ProfileSheet({ barber, onClose, onBook }: ProfileSheetProps) {
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.profileHeader}>
          <Text style={styles.profileEmoji}>{barber.emoji}</Text>
          <View style={styles.profileMeta}>
            <Text style={styles.profileName}>{barber.name}</Text>
            <Text style={styles.profileSpecialty}>{barber.specialty}</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
              <Badge label={`★ ${barber.rating.toFixed(1)}`} variant="warning" />
              <Badge label={barber.status === "ready" ? "พร้อมรับงาน" : "กำลังยุ่ง"} variant={barber.status === "ready" ? "success" : "neutral"} />
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>เกี่ยวกับช่าง</Text>
        <Text style={styles.bio}>{barber.bio}</Text>

        <Text style={styles.sectionTitle}>อุปกรณ์ที่ใช้</Text>
        <View style={styles.equipList}>
          {barber.equipment.map((e) => (
            <View key={e} style={styles.equipChip}>
              <Text style={styles.equipText}>✓ {e}</Text>
            </View>
          ))}
        </View>

        <View style={styles.etaRow}>
          <Text style={styles.etaIcon}>⏱</Text>
          <Text style={styles.etaText}>ETA ถึงบ้านคุณ ~{barber.etaMin} นาที</Text>
        </View>

        <Button
          label={barber.status === "ready" ? "จองเลย" : "ช่างไม่ว่าง"}
          onPress={onBook}
          disabled={barber.status === "busy"}
          fullWidth
        />
        <Button label="ปิด" variant="ghost" onPress={onClose} fullWidth />
      </View>
    </Modal>
  );
}

export function DeliveryScreen({ navigation }: { navigation: any }) {
  const token = useAuthStore((s) => s.token);
  const [barbers, setBarbers]         = useState<Barber[]>([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [selected, setSelected]       = useState<Barber | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const data = await getNearbyShops();
      setBarbers(data.data.map((s, i) => shopToBarber(s, i)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleBook = (barber: Barber) => {
    setSelected(null);
    navigation.navigate("Home", {
      screen: "BookingFlow",
      params: {
        shopId:       barber.shopId,
        shopName:     barber.shopName,
        serviceId:    barber.serviceId,
        serviceName:  barber.specialty,
        servicePrice: barber.servicePrice,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>บริการเดลิเวอรี่</Text>
        <Text style={styles.subtitle}>ช่างตัดผมมาหาคุณถึงที่</Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={palette.brand} />}
        contentContainerStyle={styles.list}
      >
        {error && <ErrorBanner message={error} onRetry={load} />}

        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <ShopCardSkeleton key={i} />)
        ) : barbers.length === 0 ? (
          <EmptyState emoji="🚗" title="ไม่พบช่างในพื้นที่" subtitle="ลองใหม่อีกครั้ง หรือค้นหาร้านในหน้าแรก" />
        ) : (
          barbers.map((barber) => (
            <Pressable
              key={barber.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => setSelected(barber)}
              accessibilityRole="button"
              accessibilityLabel={`ช่าง ${barber.name}`}
            >
              {/* Accent */}
              <View style={[styles.accent, barber.status === "busy" && styles.accentBusy]} />

              {/* Portrait */}
              <View style={styles.portrait}>
                <Text style={styles.portraitEmoji}>{barber.emoji}</Text>
              </View>

              {/* Info */}
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{barber.name}</Text>
                  <Badge
                    label={barber.status === "ready" ? "ว่าง" : "ยุ่ง"}
                    variant={barber.status === "ready" ? "success" : "neutral"}
                  />
                </View>
                <Text style={styles.specialty}>{barber.specialty}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.rating}>★ {barber.rating.toFixed(1)}</Text>
                  <Text style={styles.eta}>• ETA {barber.etaMin} นาที</Text>
                </View>
              </View>

              {/* Arrow */}
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          ))
        )}
      </ScrollView>

      {selected && (
        <ProfileSheet
          barber={selected}
          onClose={() => setSelected(null)}
          onBook={() => handleBook(selected)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: palette.bg },
  header:  { paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.sm, gap: 2 },
  title:   { fontSize: type.xl, fontWeight: weight.black, color: palette.ink },
  subtitle: { fontSize: type.sm, color: palette.muted },
  list:    { paddingHorizontal: space.lg, paddingBottom: 32, gap: space.sm, paddingTop: space.sm },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.line,
    overflow: "hidden",
  },
  cardPressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  accent:      { width: 4, alignSelf: "stretch", backgroundColor: palette.brand },
  accentBusy:  { backgroundColor: palette.subtle },

  portrait:      { width: 60, height: 60, justifyContent: "center", alignItems: "center", margin: space.sm },
  portraitEmoji: { fontSize: 36 },

  info:      { flex: 1, paddingVertical: space.md, gap: 3 },
  nameRow:   { flexDirection: "row", alignItems: "center", gap: space.sm },
  name:      { fontSize: type.base, fontWeight: weight.bold, color: palette.ink },
  specialty: { fontSize: type.sm, color: palette.muted },
  metaRow:   { flexDirection: "row", gap: 4 },
  rating:    { fontSize: type.xs, color: palette.warning, fontWeight: weight.semi },
  eta:       { fontSize: type.xs, color: palette.muted },
  arrow:     { fontSize: 20, color: palette.subtle, paddingRight: space.md },

  // Modal / sheet
  backdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.4)" },
  sheet: {
    backgroundColor: palette.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: space.xl,
    paddingBottom: 36,
    gap: space.md,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: palette.line, alignSelf: "center", marginBottom: space.sm,
  },
  profileHeader: { flexDirection: "row", gap: space.md, alignItems: "center" },
  profileEmoji:  { fontSize: 56 },
  profileMeta:   { flex: 1, gap: 2 },
  profileName:   { fontSize: type.xl, fontWeight: weight.black, color: palette.ink },
  profileSpecialty: { fontSize: type.sm, color: palette.muted },
  sectionTitle:  { fontSize: type.md, fontWeight: weight.bold, color: palette.ink },
  bio:           { fontSize: type.base, color: palette.body, lineHeight: 22 },
  equipList:     { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  equipChip:     {
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: palette.brandLight, borderRadius: radius.full,
  },
  equipText: { fontSize: type.xs, color: palette.brand, fontWeight: weight.semi },
  etaRow:    { flexDirection: "row", gap: space.sm, alignItems: "center", backgroundColor: palette.bg, padding: space.md, borderRadius: 12 },
  etaIcon:   { fontSize: 18 },
  etaText:   { fontSize: type.sm, color: palette.body, fontWeight: weight.semi },
});
