import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getPartnerQueue, transitionPartnerBooking } from "../../lib/api";
import type { Booking } from "../../lib/types";
import { useAuthStore } from "../../store/authStore";
import { Badge } from "../../components/Badge";
import { EmptyState } from "../../components/EmptyState";
import { ErrorBanner } from "../../components/ErrorBanner";
import { Skeleton } from "../../components/Skeleton";
import { palette, radius, space, type, weight } from "../../theme";

type Action = "confirm" | "start" | "complete" | "reject" | "no_show";

const STATUS_CONFIG: Record<string, { label: string; variant: "primary" | "success" | "warning" | "danger" | "neutral" }> = {
  authorized: { label: "รออนุมัติ",   variant: "warning" },
  confirmed:  { label: "ยืนยันแล้ว",  variant: "primary" },
  started:    { label: "กำลังบริการ", variant: "primary" },
  completed:  { label: "เสร็จแล้ว",   variant: "success" },
  cancelled:  { label: "ยกเลิก",      variant: "danger"  },
};

const AVAILABLE_ACTIONS: Record<string, Action[]> = {
  authorized: ["confirm", "reject"],
  confirmed:  ["start", "reject", "no_show"],
  started:    ["complete"],
};

const ACTION_LABEL: Record<Action, string> = {
  confirm:  "✓ ยืนยัน",
  start:    "▶ เริ่มงาน",
  complete: "✅ เสร็จ",
  reject:   "✕ ปฏิเสธ",
  no_show:  "🚫 ไม่มาตามนัด",
};

function CountdownTimer({ slotAt }: { slotAt: string }) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const target = new Date(slotAt).getTime();
    const tick = () => {
      const now = Date.now();
      setDiff(Math.max(0, Math.floor((target - now) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [slotAt]);

  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return (
    <Text style={timerStyles.text}>
      {h > 0 ? `${h}:` : ""}{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </Text>
  );
}

interface JobCardProps {
  booking: Booking;
  onAction: (b: Booking, action: Action) => void;
  loading: boolean;
}

function JobCard({ booking, onAction, loading }: JobCardProps) {
  const cfg      = STATUS_CONFIG[booking.status] ?? { label: booking.status, variant: "neutral" as const };
  const actions  = AVAILABLE_ACTIONS[booking.status] ?? [];
  const slotDate = new Date(booking.slot_at);
  const dateStr  = slotDate.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  const timeStr  = slotDate.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  const isActive = booking.status === "started";

  return (
    <View style={[cardStyles.card, isActive && cardStyles.cardActive]}>
      {isActive && <View style={cardStyles.activePulse} />}

      <View style={cardStyles.header}>
        <View style={cardStyles.idRow}>
          <Text style={cardStyles.id}>#{booking.id.slice(-8).toUpperCase()}</Text>
          <Badge label={cfg.label} variant={cfg.variant} />
        </View>
        <Text style={cardStyles.amount}>{booking.amount.toLocaleString()} ฿</Text>
      </View>

      <View style={cardStyles.info}>
        <Text style={cardStyles.slotText}>📅 {dateStr} เวลา {timeStr}</Text>
        {booking.status === "confirmed" && (
          <View style={cardStyles.timerRow}>
            <Text style={cardStyles.timerLabel}>เริ่มใน </Text>
            <CountdownTimer slotAt={booking.slot_at} />
          </View>
        )}
      </View>

      {actions.length > 0 && (
        <View style={cardStyles.actions}>
          {actions.map((act) => (
            <TouchableOpacity
              key={act}
              style={[
                cardStyles.actionBtn,
                act === "reject"   && cardStyles.actionBtnReject,
                act === "no_show"  && cardStyles.actionBtnReject,
                act === "complete" && cardStyles.actionBtnComplete,
              ]}
              onPress={() => onAction(booking, act)}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={ACTION_LABEL[act]}
            >
              <Text style={[
                cardStyles.actionText,
                act === "reject"   && cardStyles.actionTextReject,
                act === "no_show"  && cardStyles.actionTextReject,
                act === "complete" && cardStyles.actionTextComplete,
              ]}>
                {ACTION_LABEL[act]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export function JobsScreen() {
  const { token } = useAuthStore();
  const [bookings, setBookings]     = useState<Booking[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!token) return;
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const data = await getPartnerQueue(token);
      setBookings(data.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "โหลดคิวไม่สำเร็จ");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (booking: Booking, action: Action) => {
    if (!token) return;
    if (action === "reject") {
      Alert.alert("ปฏิเสธงาน?", "ลูกค้าจะได้รับการคืนเงิน", [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ปฏิเสธ", style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              await transitionPartnerBooking(token, booking.id, "reject");
              load();
            } catch (e) {
              Alert.alert("ผิดพลาด", e instanceof Error ? e.message : "ปฏิเสธไม่สำเร็จ");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]);
      return;
    }

    if (action === "no_show") {
      Alert.alert(
        "รายงาน No-Show?",
        "ลูกค้าไม่มาตามนัด — การจองจะถูกยกเลิกและลูกค้าจะได้รับแจ้ง",
        [
          { text: "ยกเลิก", style: "cancel" },
          {
            text: "ยืนยัน", style: "destructive",
            onPress: async () => {
              setActionLoading(true);
              try {
                await transitionPartnerBooking(token, booking.id, "reject");
                load();
                Alert.alert("บันทึกแล้ว", "รายงาน no-show สำเร็จ");
              } catch (e) {
                Alert.alert("ผิดพลาด", e instanceof Error ? e.message : "ดำเนินการไม่สำเร็จ");
              } finally {
                setActionLoading(false);
              }
            },
          },
        ]
      );
      return;
    }

    setActionLoading(true);
    try {
      await transitionPartnerBooking(token, booking.id, action);
      load();
      if (action === "complete") {
        Alert.alert("เสร็จสิ้น! 🎉", "งานเสร็จแล้ว รายได้จะเข้ากระเป๋าเงินของคุณ");
      }
    } catch (e) {
      Alert.alert("ผิดพลาด", e instanceof Error ? e.message : "ดำเนินการไม่สำเร็จ");
    } finally {
      setActionLoading(false);
    }
  };

  const active   = bookings.filter((b) => b.status === "started");
  const incoming = bookings.filter((b) => b.status === "authorized" || b.status === "confirmed");
  const done     = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  const renderSection = (title: string, items: Booking[]) => {
    if (items.length === 0) return null;
    return (
      <>
        <Text style={styles.sectionTitle}>{title} ({items.length})</Text>
        {items.map((b) => (
          <JobCard key={b.id} booking={b} onAction={handleAction} loading={actionLoading} />
        ))}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>คิวงาน</Text>
        <TouchableOpacity onPress={() => load()} accessibilityRole="button" accessibilityLabel="รีเฟรช">
          <Text style={styles.refresh}>↻ รีเฟรช</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={palette.brand} />}
        contentContainerStyle={styles.list}
      >
        {error && <ErrorBanner message={error} onRetry={load} />}

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={{ gap: 8, marginBottom: 12 }}>
              <Skeleton height={16} width="60%" />
              <Skeleton height={12} width="40%" />
              <Skeleton height={36} />
            </View>
          ))
        ) : bookings.length === 0 ? (
          <EmptyState emoji="📋" title="ไม่มีงานในคิว" subtitle="เมื่อลูกค้าจอง งานจะปรากฏที่นี่" />
        ) : (
          <>
            {renderSection("🔴 กำลังทำงาน", active)}
            {renderSection("🟡 งานที่เข้ามา", incoming)}
            {renderSection("✅ เสร็จแล้ว", done)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: palette.bg },
  header:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.sm },
  title:        { fontSize: type.xl, fontWeight: weight.black, color: palette.ink },
  refresh:      { fontSize: type.sm, color: palette.brand, fontWeight: weight.semi },
  list:         { paddingHorizontal: space.lg, paddingBottom: 32, gap: space.sm },
  sectionTitle: { fontSize: type.md, fontWeight: weight.bold, color: palette.muted, marginTop: space.md },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: palette.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: palette.line, padding: space.md, gap: space.sm,
    overflow: "hidden",
  },
  cardActive:  { borderColor: palette.brand, borderWidth: 2 },
  activePulse: { position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: palette.brand },
  header:  { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  idRow:   { flexDirection: "row", gap: space.sm, alignItems: "center" },
  id:      { fontSize: type.sm, fontWeight: weight.bold, color: palette.ink, fontFamily: "monospace" },
  amount:  { fontSize: type.md, fontWeight: weight.black, color: palette.brand },
  info:    { gap: 4 },
  slotText: { fontSize: type.sm, color: palette.muted },
  timerRow: { flexDirection: "row", alignItems: "center" },
  timerLabel: { fontSize: type.sm, color: palette.muted },
  actions: { flexDirection: "row", gap: space.sm, flexWrap: "wrap" },
  actionBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: radius.full, backgroundColor: palette.brandLight,
    borderWidth: 1, borderColor: palette.brand,
  },
  actionBtnReject:   { backgroundColor: "#fff5f5", borderColor: palette.danger },
  actionBtnComplete: { backgroundColor: "#f0fdf4", borderColor: palette.success },
  actionText:        { fontSize: type.sm, fontWeight: weight.bold, color: palette.brand },
  actionTextReject:  { color: palette.danger },
  actionTextComplete:{ color: palette.success },
});

const timerStyles = StyleSheet.create({
  text: { fontSize: type.md, fontWeight: weight.black, color: palette.brand, fontFamily: "monospace" },
});
