import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { cancelBooking, createDispute, getCustomerHistory } from "../lib/api";
import type { Booking } from "../lib/types";
import { useAuthStore } from "../store/authStore";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { ErrorBanner } from "../components/ErrorBanner";
import { Skeleton } from "../components/Skeleton";
import { palette, radius, space, type, weight } from "../theme";

type TabKey = "upcoming" | "past";

const STATUS_CONFIG: Record<string, { label: string; variant: "primary" | "success" | "warning" | "danger" | "neutral" }> = {
  requested:  { label: "รอดำเนินการ", variant: "warning" },
  quoted:     { label: "มีใบเสนอ",    variant: "warning" },
  authorized: { label: "รออนุมัติ",   variant: "primary" },
  confirmed:  { label: "ยืนยันแล้ว",  variant: "primary" },
  started:    { label: "กำลังบริการ", variant: "primary" },
  completed:  { label: "เสร็จแล้ว",   variant: "success" },
  cancelled:  { label: "ยกเลิก",      variant: "danger"  },
  disputed:   { label: "ร้องเรียน",   variant: "danger"  },
};

const UPCOMING_STATUSES = new Set(["requested", "quoted", "authorized", "confirmed", "started"]);
const CANCELLABLE       = new Set(["requested", "quoted", "authorized", "confirmed"]);
const DISPUTABLE        = new Set(["completed", "started"]);

const CANCEL_REASONS = [
  "เปลี่ยนแผน",
  "ฉุกเฉิน",
  "ร้านไม่ว่าง",
  "ระยะทางไกลเกิน",
  "อื่นๆ",
];

interface ActionSheetProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}
function ActionSheet({ title, children, onClose }: ActionSheetProps) {
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={sheetStyles.backdrop} onPress={onClose} />
      <View style={sheetStyles.sheet}>
        <View style={sheetStyles.handle} />
        <Text style={sheetStyles.title}>{title}</Text>
        {children}
      </View>
    </Modal>
  );
}

interface BookingCardProps {
  booking: Booking;
  onCancel: (b: Booking) => void;
  onDispute: (b: Booking) => void;
}
function BookingCard({ booking, onCancel, onDispute }: BookingCardProps) {
  const cfg     = STATUS_CONFIG[booking.status] ?? { label: booking.status, variant: "neutral" as const };
  const slotDate = new Date(booking.slot_at);
  const dateStr  = slotDate.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
  const timeStr  = slotDate.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  const canCancel  = CANCELLABLE.has(booking.status);
  const canDispute = DISPUTABLE.has(booking.status);

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.top}>
        <View style={cardStyles.leftInfo}>
          <Text style={cardStyles.bookingId}>#{booking.id.slice(-8).toUpperCase()}</Text>
          <Text style={cardStyles.dateTime}>{dateStr} เวลา {timeStr}</Text>
        </View>
        <Badge label={cfg.label} variant={cfg.variant} />
      </View>

      <View style={cardStyles.bottom}>
        <Text style={cardStyles.amount}>{booking.amount.toLocaleString()} ฿</Text>
        <View style={cardStyles.actions}>
          {canDispute && (
            <TouchableOpacity
              style={[cardStyles.actionBtn, cardStyles.disputeBtn]}
              onPress={() => onDispute(booking)}
              accessibilityRole="button"
              accessibilityLabel="ร้องเรียน"
            >
              <Text style={cardStyles.disputeText}>⚠️ ร้องเรียน</Text>
            </TouchableOpacity>
          )}
          {canCancel && (
            <TouchableOpacity
              style={[cardStyles.actionBtn, cardStyles.cancelBtn]}
              onPress={() => onCancel(booking)}
              accessibilityRole="button"
              accessibilityLabel="ยกเลิก"
            >
              <Text style={cardStyles.cancelText}>✕ ยกเลิก</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

export function BookingsScreen() {
  const { token } = useAuthStore();
  const [bookings, setBookings]       = useState<Booking[]>([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [tab, setTab]                 = useState<TabKey>("upcoming");

  // Cancel sheet
  const [cancelTarget, setCancelTarget]   = useState<Booking | null>(null);
  const [cancelReason, setCancelReason]   = useState(CANCEL_REASONS[0]);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError]     = useState<string | null>(null);

  // Dispute sheet
  const [disputeTarget, setDisputeTarget]   = useState<Booking | null>(null);
  const [disputeReason, setDisputeReason]   = useState("");
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [disputeError, setDisputeError]     = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!token) return;
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const data = await getCustomerHistory(token);
      setBookings(data.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "โหลดไม่สำเร็จ");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async () => {
    if (!token || !cancelTarget) return;
    setCancelError(null);
    setCancelLoading(true);
    try {
      await cancelBooking(token, cancelTarget.id, cancelReason);
      setCancelTarget(null);
      load();
      Alert.alert("ยกเลิกสำเร็จ", "การจองถูกยกเลิกแล้ว");
    } catch (e) {
      setCancelError(e instanceof Error ? e.message : "ยกเลิกไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleDispute = async () => {
    if (!token || !disputeTarget) return;
    if (!disputeReason.trim()) {
      setDisputeError("กรุณาระบุเหตุผล");
      return;
    }
    setDisputeError(null);
    setDisputeLoading(true);
    try {
      await createDispute(token, disputeTarget.id);
      setDisputeTarget(null);
      setDisputeReason("");
      load();
      Alert.alert("ร้องเรียนสำเร็จ", "ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง");
    } catch (e) {
      setDisputeError(e instanceof Error ? e.message : "ร้องเรียนไม่สำเร็จ");
    } finally {
      setDisputeLoading(false);
    }
  };

  const upcoming = bookings.filter((b) => UPCOMING_STATUSES.has(b.status));
  const past     = bookings.filter((b) => !UPCOMING_STATUSES.has(b.status));
  const visible  = tab === "upcoming" ? upcoming : past;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>การจองของฉัน</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(["upcoming", "past"] as TabKey[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => setTab(t)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t }}
          >
            <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
              {t === "upcoming" ? `กำลังมา (${upcoming.length})` : `ประวัติ (${past.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={palette.brand} />}
        contentContainerStyle={styles.list}
      >
        {error && <ErrorBanner message={error} onRetry={load} />}

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={{ gap: 8, marginBottom: 12 }}>
              <Skeleton height={16} width="55%" />
              <Skeleton height={12} width="35%" />
            </View>
          ))
        ) : visible.length === 0 ? (
          <EmptyState
            emoji={tab === "upcoming" ? "📅" : "📋"}
            title={tab === "upcoming" ? "ยังไม่มีการจอง" : "ยังไม่มีประวัติ"}
            subtitle={tab === "upcoming" ? "จองคิวร้านตัดผมในหน้าแรกได้เลย" : "ประวัติจะปรากฏที่นี่"}
          />
        ) : (
          visible.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onCancel={(booking) => { setCancelTarget(booking); setCancelError(null); setCancelReason(CANCEL_REASONS[0]); }}
              onDispute={(booking) => { setDisputeTarget(booking); setDisputeError(null); setDisputeReason(""); }}
            />
          ))
        )}
      </ScrollView>

      {/* Cancel sheet */}
      {cancelTarget && (
        <ActionSheet title="ยกเลิกการจอง" onClose={() => setCancelTarget(null)}>
          <Text style={sheetStyles.bookingRef}>#{cancelTarget.id.slice(-8).toUpperCase()}</Text>
          <Text style={sheetStyles.note}>⚠️ ค่าธรรมเนียมยกเลิกอาจถูกหัก ตามนโยบาย</Text>

          <Text style={sheetStyles.label}>เหตุผลในการยกเลิก</Text>
          {CANCEL_REASONS.map((r) => (
            <Pressable
              key={r}
              style={[sheetStyles.reasonChip, cancelReason === r && sheetStyles.reasonChipActive]}
              onPress={() => setCancelReason(r)}
              accessibilityRole="radio"
              accessibilityState={{ checked: cancelReason === r }}
            >
              <Text style={[sheetStyles.reasonText, cancelReason === r && sheetStyles.reasonTextActive]}>{r}</Text>
            </Pressable>
          ))}

          {cancelError && <ErrorBanner message={cancelError} />}
          <Button label="ยืนยันยกเลิก" variant="danger" onPress={handleCancel} loading={cancelLoading} fullWidth />
          <Button label="ไม่ยกเลิก" variant="ghost" onPress={() => setCancelTarget(null)} fullWidth />
        </ActionSheet>
      )}

      {/* Dispute sheet */}
      {disputeTarget && (
        <ActionSheet title="ร้องเรียนการบริการ" onClose={() => setDisputeTarget(null)}>
          <Text style={sheetStyles.bookingRef}>#{disputeTarget.id.slice(-8).toUpperCase()}</Text>
          <Text style={sheetStyles.label}>อธิบายปัญหา *</Text>
          <TextInput
            style={sheetStyles.textInput}
            value={disputeReason}
            onChangeText={setDisputeReason}
            placeholder="เช่น บริการไม่ตรงที่จอง, ช่างไม่มา..."
            placeholderTextColor={palette.subtle}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {disputeError && <ErrorBanner message={disputeError} />}
          <Button label="ส่งเรื่องร้องเรียน" onPress={handleDispute} loading={disputeLoading} fullWidth />
          <Button label="ยกเลิก" variant="ghost" onPress={() => setDisputeTarget(null)} fullWidth />
        </ActionSheet>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: palette.bg },
  header: { paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.md },
  title:  { fontSize: type.xl, fontWeight: weight.black, color: palette.ink },
  tabs:   { flexDirection: "row", paddingHorizontal: space.lg, marginBottom: space.md, gap: space.sm },
  tabBtn: {
    paddingHorizontal: space.lg, paddingVertical: 8,
    borderRadius: radius.full, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.card,
  },
  tabBtnActive:  { backgroundColor: palette.brand, borderColor: palette.brand },
  tabLabel:      { fontSize: type.sm, fontWeight: weight.semi, color: palette.muted },
  tabLabelActive: { color: "#fff" },
  list:   { paddingHorizontal: space.lg, paddingBottom: 32, gap: space.sm },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: palette.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: palette.line,
    padding: space.md, gap: space.sm,
  },
  top:       { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  leftInfo:  { gap: 3 },
  bookingId: { fontSize: type.sm, fontWeight: weight.bold, color: palette.ink, fontFamily: "monospace" },
  dateTime:  { fontSize: type.xs, color: palette.muted },
  bottom:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  amount:    { fontSize: type.base, fontWeight: weight.bold, color: palette.brand },
  actions:   { flexDirection: "row", gap: space.sm },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1 },
  cancelBtn:   { borderColor: palette.danger, backgroundColor: "#fff5f5" },
  cancelText:  { fontSize: type.xs, fontWeight: weight.bold, color: palette.danger },
  disputeBtn:  { borderColor: palette.warning, backgroundColor: "#fffbeb" },
  disputeText: { fontSize: type.xs, fontWeight: weight.bold, color: palette.warning },
});

const sheetStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.4)" },
  sheet: {
    backgroundColor: palette.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: space.xl, paddingBottom: 36, gap: space.md,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: palette.line, alignSelf: "center", marginBottom: space.sm },
  title:      { fontSize: type.xl, fontWeight: weight.black, color: palette.ink },
  bookingRef: { fontSize: type.sm, color: palette.muted, fontFamily: "monospace" },
  note:       { fontSize: type.sm, color: palette.warning, backgroundColor: "#fef3c7", padding: 10, borderRadius: 10 },
  label:      { fontSize: type.sm, fontWeight: weight.semi, color: palette.body },
  reasonChip: {
    paddingHorizontal: space.md, paddingVertical: 10,
    borderRadius: radius.md, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.bg,
  },
  reasonChipActive: { borderColor: palette.brand, backgroundColor: palette.brandLight },
  reasonText:       { fontSize: type.sm, color: palette.body },
  reasonTextActive: { color: palette.brand, fontWeight: weight.semi },
  textInput: {
    borderWidth: 1, borderColor: palette.line, borderRadius: 12,
    padding: space.md, fontSize: type.base, color: palette.ink,
    minHeight: 100, backgroundColor: palette.bg,
  },
});
