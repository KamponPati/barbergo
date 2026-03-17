import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getCustomerHistory, getPartnerWallet } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import { Badge } from "../components/Badge";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { palette, space, type, weight } from "../theme";

const PERKS = [
  { icon: "🎁", label: "ส่วนลด 10%",       desc: "ใช้ได้ทุกร้านในเครือ" },
  { icon: "⚡", label: "Priority Booking", desc: "ข้ามคิวได้ 1 ครั้ง/เดือน" },
  { icon: "✂️", label: "ตัดฟรี 1 ครั้ง",   desc: "เมื่อสะสมครบ 500 คะแนน" },
];

// Mock favourite barbers derived from booking history
const FAVE_BARBERS = [
  { emoji: "👨‍🦱", name: "ช่างโอ้",    specialty: "Fade & Taper", visits: 4 },
  { emoji: "🧔",   name: "ช่างสมชาย", specialty: "Classic Cut",   visits: 2 },
];

type Tier = "bronze" | "silver" | "gold";
function getTier(pts: number): Tier {
  if (pts >= 500) return "gold";
  if (pts >= 200) return "silver";
  return "bronze";
}
function nextTierPts(tier: Tier): number {
  if (tier === "bronze") return 200;
  if (tier === "silver") return 500;
  return 1000;
}
const TIER_EMOJI: Record<Tier, string> = { bronze: "🥉", silver: "🥈", gold: "🏆" };
const TIER_LABEL: Record<Tier, string> = { bronze: "Bronze", silver: "Silver", gold: "Gold" };

export function RewardsScreen() {
  const { token } = useAuthStore();
  const [completedCount, setCompletedCount] = useState(0);
  const [walletBalance, setWalletBalance]   = useState<number | null>(null);
  const [refreshing, setRefreshing]         = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Derive points from completed bookings (10 pts per booking as mock)
  const points = completedCount * 40 + 120; // base 120
  const tier   = getTier(points);
  const next   = nextTierPts(tier);
  const pct    = Math.min((points / next) * 100, 100);

  const load = useCallback(async (isRefresh = false) => {
    if (!token) return;
    try {
      isRefresh && setRefreshing(true);
      const [history] = await Promise.all([
        import("../lib/api").then((m) => m.getCustomerHistory(token)),
      ]);
      const done = history.data.filter((b) => b.status === "completed").length;
      setCompletedCount(done);
    } catch { /* non-critical */ } finally {
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: pct,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [pct, progressAnim]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={palette.brand} />}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>รางวัลของฉัน</Text>
          <Badge label={TIER_LABEL[tier]} variant={tier === "gold" ? "warning" : "neutral"} />
        </View>

        {/* Hero points card */}
        <View style={styles.hero}>
          <Text style={styles.tierEmoji}>{TIER_EMOJI[tier]}</Text>
          <Text style={styles.pts}>{points.toLocaleString()}</Text>
          <Text style={styles.ptsLabel}>คะแนนสะสม</Text>

          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressBar,
                { width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }) },
              ]}
            />
          </View>
          <Text style={styles.nextLabel}>
            อีก {Math.max(0, next - points).toLocaleString()} คะแนน → {tier === "bronze" ? "Silver 🥈" : tier === "silver" ? "Gold 🏆" : "Max ✨"}
          </Text>
        </View>

        {/* Wallet */}
        <Text style={styles.sectionTitle}>กระเป๋าเงิน</Text>
        <Card style={styles.walletCard}>
          <View style={styles.walletRow}>
            <View>
              <Text style={styles.walletLabel}>ยอดคงเหลือ</Text>
              <Text style={styles.walletAmount}>
                {walletBalance !== null ? `${walletBalance.toLocaleString()} ฿` : "฿ — "}
              </Text>
            </View>
            <View style={styles.savedCards}>
              <Text style={styles.savedCardsLabel}>บัตรที่บันทึก</Text>
              <View style={styles.cardChip}>
                <Text style={styles.cardChipText}>💳 •••• 4242</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Perks */}
        <Text style={styles.sectionTitle}>สิทธิพิเศษของคุณ</Text>
        <View style={styles.perks}>
          {PERKS.map((p) => (
            <View key={p.label} style={styles.perkRow}>
              <Text style={styles.perkIcon}>{p.icon}</Text>
              <View style={styles.perkInfo}>
                <Text style={styles.perkLabel}>{p.label}</Text>
                <Text style={styles.perkDesc}>{p.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Favourite barbers */}
        <Text style={styles.sectionTitle}>ช่างที่ชอบ</Text>
        {FAVE_BARBERS.length === 0 ? (
          <EmptyState emoji="✂️" title="ยังไม่มีช่างที่ชอบ" subtitle="จองและรีวิวเพื่อบันทึกช่างที่ชื่นชอบ" />
        ) : (
          <View style={styles.faveList}>
            {FAVE_BARBERS.map((b) => (
              <Card key={b.name} style={styles.faveCard}>
                <Text style={styles.faveEmoji}>{b.emoji}</Text>
                <View style={styles.faveInfo}>
                  <Text style={styles.faveName}>{b.name}</Text>
                  <Text style={styles.faveSpecialty}>{b.specialty}</Text>
                  <Text style={styles.faveVisits}>มาแล้ว {b.visits} ครั้ง</Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: palette.bg },
  scroll: { paddingBottom: 32 },

  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.sm,
  },
  title:  { fontSize: type.xl, fontWeight: weight.black, color: palette.ink },

  hero: {
    backgroundColor: palette.brand, margin: space.lg,
    borderRadius: 20, padding: space.xl,
    alignItems: "center", gap: space.sm,
  },
  tierEmoji: { fontSize: 48 },
  pts:       { fontSize: 44, fontWeight: weight.black, color: "#fff" },
  ptsLabel:  { fontSize: type.sm, color: "rgba(255,255,255,0.8)" },
  progressTrack: {
    width: "100%", height: 8,
    backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 99,
    marginTop: space.sm, overflow: "hidden",
  },
  progressBar: { height: 8, backgroundColor: "#fff", borderRadius: 99 },
  nextLabel:   { fontSize: type.xs, color: "rgba(255,255,255,0.75)" },

  sectionTitle: {
    fontSize: type.md, fontWeight: weight.bold, color: palette.ink,
    paddingHorizontal: space.lg, marginBottom: space.sm,
  },

  walletCard: { marginHorizontal: space.lg },
  walletRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  walletLabel: { fontSize: type.xs, color: palette.muted },
  walletAmount: { fontSize: type.xl, fontWeight: weight.black, color: palette.ink, marginTop: 2 },
  savedCards:   { alignItems: "flex-end", gap: 4 },
  savedCardsLabel: { fontSize: type.xs, color: palette.muted },
  cardChip:     { backgroundColor: palette.brandLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  cardChipText: { fontSize: type.xs, color: palette.brand, fontWeight: weight.semi },

  perks:   { paddingHorizontal: space.lg, gap: space.sm },
  perkRow: {
    flexDirection: "row", alignItems: "center", gap: space.md,
    backgroundColor: palette.card, borderRadius: 14,
    borderWidth: 1, borderColor: palette.line, padding: space.md,
  },
  perkIcon:  { fontSize: 28 },
  perkInfo:  { flex: 1, gap: 2 },
  perkLabel: { fontSize: type.base, fontWeight: weight.semi, color: palette.ink },
  perkDesc:  { fontSize: type.xs, color: palette.muted },

  faveList: { paddingHorizontal: space.lg, gap: space.sm },
  faveCard: { flexDirection: "row", alignItems: "center", gap: space.md },
  faveEmoji: { fontSize: 36 },
  faveInfo:  { flex: 1, gap: 2 },
  faveName:  { fontSize: type.base, fontWeight: weight.semi, color: palette.ink },
  faveSpecialty: { fontSize: type.xs, color: palette.muted },
  faveVisits: { fontSize: type.xs, color: palette.brand, fontWeight: weight.semi },
});
