import React, { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { getPartnerQueue, getPartnerWallet } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { usePartnerStore, hydratePartnerOnline } from "../../store/partnerStore";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { ErrorBanner } from "../../components/ErrorBanner";
import { palette, space, type, weight } from "../../theme";

interface StatCard {
  label: string;
  value: string;
  icon: string;
  sub?: string;
}

function Stat({ label, value, icon, sub }: StatCard) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

export function PartnerDashboardScreen({ navigation }: { navigation: any }) {
  const { token, logout } = useAuthStore();
  const { isOnline, toggleOnline } = usePartnerStore();
  const [queueCount, setQueueCount]   = useState(0);
  const [walletData, setWalletData]   = useState<any>(null);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // Mock KYC status — in production comes from partner profile API
  const kycStatus: "pending" | "approved" | "rejected" = "approved";

  const load = useCallback(async (isRefresh = false) => {
    if (!token) return;
    try {
      isRefresh && setRefreshing(true);
      setError(null);
      const [queue, wallet] = await Promise.all([
        getPartnerQueue(token),
        getPartnerWallet(token),
      ]);
      setQueueCount(queue.data.length);
      setWalletData(wallet);
    } catch (e) {
      setError(e instanceof Error ? e.message : "โหลดไม่สำเร็จ");
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    hydratePartnerOnline();
    load();
  }, [load]);

  const todayRevenue = walletData
    ? `${((walletData as any).balance ?? 0).toLocaleString()} ฿`
    : "— ฿";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={palette.brand} />}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>BarberGo Partner</Text>
            <Text style={styles.title}>แดชบอร์ด</Text>
          </View>
          <Button label="ออก" variant="ghost" size="sm" onPress={logout} />
        </View>

        {/* KYC banner */}
        {kycStatus !== "approved" && (
          <Pressable
            style={[styles.kycBanner, kycStatus === "rejected" && styles.kycBannerRejected]}
            onPress={() => navigation.navigate("Onboarding")}
            accessibilityRole="button"
          >
            <Text style={styles.kycIcon}>{kycStatus === "pending" ? "⏳" : "❌"}</Text>
            <View style={styles.kycInfo}>
              <Text style={styles.kycTitle}>
                {kycStatus === "pending" ? "รอการอนุมัติ KYC" : "KYC ถูกปฏิเสธ"}
              </Text>
              <Text style={styles.kycSub}>
                {kycStatus === "pending" ? "เอกสารอยู่ระหว่างตรวจสอบ" : "กดเพื่อส่งเอกสารใหม่"}
              </Text>
            </View>
            <Text style={styles.kycArrow}>›</Text>
          </Pressable>
        )}

        {/* Online toggle */}
        <View style={styles.onlineCard}>
          <View>
            <Text style={styles.onlineLabel}>สถานะรับงาน</Text>
            <Text style={[styles.onlineStatus, isOnline && styles.onlineStatusActive]}>
              {isOnline ? "🟢 พร้อมรับงาน" : "🔴 ปิดรับงาน"}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={() => toggleOnline()}
            trackColor={{ false: palette.line, true: palette.brand }}
            thumbColor="#fff"
            accessibilityLabel="toggle online status"
          />
        </View>

        {error && <ErrorBanner message={error} onRetry={load} />}

        {/* KPI grid */}
        <View style={styles.statsGrid}>
          <Stat icon="💼" label="งานในคิว"    value={`${queueCount}`}    sub="รอดำเนินการ" />
          <Stat icon="💰" label="รายได้วันนี้" value={todayRevenue}       sub="หลังหักค่าธรรมเนียม" />
          <Stat icon="⭐" label="คะแนนเฉลี่ย" value="4.8"                sub="จาก 5.0" />
          <Stat icon="✅" label="อัตราสำเร็จ"  value="96%"               sub="ใน 30 วัน" />
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>ดำเนินการ</Text>
        <View style={styles.quickActions}>
          <Pressable style={styles.qaBtn} onPress={() => navigation.navigate("Jobs")} accessibilityRole="button">
            <Text style={styles.qaIcon}>📋</Text>
            <Text style={styles.qaLabel}>คิวงาน</Text>
            {queueCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{queueCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable style={styles.qaBtn} onPress={() => navigation.navigate("Wallet")} accessibilityRole="button">
            <Text style={styles.qaIcon}>💳</Text>
            <Text style={styles.qaLabel}>ถอนเงิน</Text>
          </Pressable>
          <Pressable style={styles.qaBtn} onPress={() => navigation.navigate("Services")} accessibilityRole="button">
            <Text style={styles.qaIcon}>✂️</Text>
            <Text style={styles.qaLabel}>บริการ</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: palette.bg },
  scroll: { paddingBottom: 32 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.sm,
  },
  eyebrow: { fontSize: type.xs, color: palette.brand, fontWeight: weight.bold, textTransform: "uppercase", letterSpacing: 1 },
  title:   { fontSize: type.xl, fontWeight: weight.black, color: palette.ink },

  kycBanner: {
    flexDirection: "row", alignItems: "center", gap: space.md,
    marginHorizontal: space.lg, marginBottom: space.sm,
    backgroundColor: "#fef3c7", borderRadius: 14, padding: space.md,
    borderWidth: 1, borderColor: "#fde68a",
  },
  kycBannerRejected: { backgroundColor: "#fee2e2", borderColor: "#fca5a5" },
  kycIcon:  { fontSize: 24 },
  kycInfo:  { flex: 1, gap: 2 },
  kycTitle: { fontSize: type.base, fontWeight: weight.bold, color: palette.ink },
  kycSub:   { fontSize: type.xs, color: palette.muted },
  kycArrow: { fontSize: 20, color: palette.subtle },

  onlineCard: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginHorizontal: space.lg, marginBottom: space.md,
    backgroundColor: palette.card, borderRadius: 16,
    borderWidth: 1, borderColor: palette.line, padding: space.md,
  },
  onlineLabel:       { fontSize: type.xs, color: palette.muted },
  onlineStatus:      { fontSize: type.md, fontWeight: weight.bold, color: palette.subtle, marginTop: 2 },
  onlineStatusActive:{ color: palette.success },

  statsGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: space.sm,
    paddingHorizontal: space.lg, marginBottom: space.md,
  },
  stat: {
    flex: 1, minWidth: "45%", backgroundColor: palette.card,
    borderRadius: 14, borderWidth: 1, borderColor: palette.line,
    padding: space.md, gap: 2, alignItems: "flex-start",
  },
  statIcon:  { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: type.xl, fontWeight: weight.black, color: palette.ink },
  statLabel: { fontSize: type.xs, color: palette.muted },
  statSub:   { fontSize: 10, color: palette.subtle },

  sectionTitle: { fontSize: type.md, fontWeight: weight.bold, color: palette.ink, paddingHorizontal: space.lg, marginBottom: space.sm },

  quickActions: { flexDirection: "row", paddingHorizontal: space.lg, gap: space.sm },
  qaBtn: {
    flex: 1, alignItems: "center", gap: 6,
    backgroundColor: palette.card, borderRadius: 14,
    borderWidth: 1, borderColor: palette.line, padding: space.md,
    position: "relative",
  },
  qaIcon:  { fontSize: 28 },
  qaLabel: { fontSize: type.xs, fontWeight: weight.semi, color: palette.muted },
  badge:   {
    position: "absolute", top: 6, right: 6,
    backgroundColor: palette.danger, borderRadius: 99,
    minWidth: 18, height: 18, justifyContent: "center", alignItems: "center", paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, color: "#fff", fontWeight: weight.bold },
});
