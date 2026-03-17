import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { checkoutBooking, getAvailability, quoteBooking } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/Button";
import { ErrorBanner } from "../components/ErrorBanner";
import { Skeleton } from "../components/Skeleton";
import { palette, radius, space, type, weight } from "../theme";
import type { CustomerStackParamList } from "../navigation/CustomerNavigator";

type Props = NativeStackScreenProps<CustomerStackParamList, "BookingFlow">;

const DAYS_AHEAD = 7;

function buildDates(): Date[] {
  return Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + 1 + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function fmtDay(d: Date) {
  return d.toLocaleDateString("th-TH", { weekday: "short" });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

function fmtSlot(iso: string) {
  return new Date(iso).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

export function BookingFlowScreen({ route, navigation }: Props) {
  const { shopId, shopName, serviceId, serviceName, servicePrice } = route.params;
  const { token } = useAuthStore();

  const dates = buildDates();
  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);
  const [slots, setSlots]               = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError]     = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [quote, setQuote]               = useState<{ subtotal: number; total: number } | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError]     = useState<string | null>(null);

  const loadSlots = useCallback(async (date: Date) => {
    setSlotsLoading(true);
    setSlotsError(null);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const av = await getAvailability({
        shopId,
        branchId: "branch_1",
        serviceId,
        date: isoDate(date),
      });
      setSlots(av.slots);
    } catch (e) {
      setSlotsError(e instanceof Error ? e.message : "โหลด slot ไม่สำเร็จ");
    } finally {
      setSlotsLoading(false);
    }
  }, [shopId, serviceId]);

  useEffect(() => { loadSlots(selectedDate); }, [loadSlots, selectedDate]);

  const handleSelectDate = (d: Date) => {
    setSelectedDate(d);
  };

  const handleSelectSlot = async (slot: string) => {
    setSelectedSlot(slot);
    if (!token) return;
    setQuoteLoading(true);
    try {
      const q = await quoteBooking(token, shopId, serviceId);
      setQuote(q);
      setConfirmVisible(true);
    } catch {
      // Fall back to price from props
      setQuote({ subtotal: servicePrice, total: servicePrice });
      setConfirmVisible(true);
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleConfirmBook = async () => {
    if (!token || !selectedSlot) return;
    setBookingError(null);
    setBookingLoading(true);
    try {
      await checkoutBooking({
        token,
        shopId,
        branchId: "branch_1",
        serviceId,
        slotAt: selectedSlot,
      });
      setConfirmVisible(false);
      Alert.alert(
        "จองสำเร็จ! 🎉",
        `${serviceName}\n${shopName}\n${new Date(selectedSlot).toLocaleString("th-TH")}`,
        [
          { text: "ดูการจอง", onPress: () => { navigation.navigate("BookingsTab" as never); } },
          { text: "กลับหน้าแรก", style: "cancel", onPress: () => navigation.popToTop() },
        ]
      );
    } catch (e) {
      setBookingError(e instanceof Error ? e.message : "จองไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Service summary */}
        <View style={styles.serviceCard}>
          <Text style={styles.serviceName}>{serviceName}</Text>
          <Text style={styles.shopName}>{shopName}</Text>
          <Text style={styles.price}>{servicePrice.toLocaleString()} ฿</Text>
        </View>

        {/* Date picker */}
        <Text style={styles.sectionTitle}>เลือกวัน</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesRow}>
          {dates.map((d) => {
            const active = isoDate(d) === isoDate(selectedDate);
            return (
              <Pressable
                key={isoDate(d)}
                style={[styles.dateChip, active && styles.dateChipActive]}
                onPress={() => handleSelectDate(d)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.dateDay, active && styles.dateDayActive]}>{fmtDay(d)}</Text>
                <Text style={[styles.dateNum, active && styles.dateNumActive]}>{fmtDate(d)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Slot grid */}
        <Text style={styles.sectionTitle}>เลือกเวลา</Text>
        {slotsError && <ErrorBanner message={slotsError} onRetry={() => loadSlots(selectedDate)} />}

        {slotsLoading ? (
          <View style={styles.slotGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={40} width={78} rounded />
            ))}
          </View>
        ) : slots.length === 0 && !slotsError ? (
          <View style={styles.noSlots}>
            <Text style={styles.noSlotsText}>ไม่มีช่วงเวลาว่างในวันนี้</Text>
            <Text style={styles.noSlotsHint}>ลองเลือกวันอื่น</Text>
          </View>
        ) : (
          <View style={styles.slotGrid}>
            {slots.map((slot) => {
              const isSelected = slot === selectedSlot;
              return (
                <Pressable
                  key={slot}
                  style={[styles.slotChip, isSelected && styles.slotChipActive]}
                  onPress={() => handleSelectSlot(slot)}
                  disabled={quoteLoading}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[styles.slotText, isSelected && styles.slotTextActive]}>
                    {fmtSlot(slot)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {quoteLoading && (
          <View style={styles.quoteLoading}>
            <Text style={styles.quoteLoadingText}>กำลังคำนวณราคา...</Text>
          </View>
        )}
      </ScrollView>

      {/* Confirm Modal */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setConfirmVisible(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          <Text style={styles.sheetTitle}>ยืนยันการจอง</Text>

          <View style={styles.summaryCard}>
            <SummaryRow label="บริการ"  value={serviceName} />
            <SummaryRow label="ร้าน"    value={shopName} />
            <SummaryRow label="วัน"     value={selectedSlot ? new Date(selectedSlot).toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long" }) : ""} />
            <SummaryRow label="เวลา"    value={selectedSlot ? fmtSlot(selectedSlot) : ""} />
            <View style={styles.divider} />
            <SummaryRow label="ยอดรวม" value={`${(quote?.total ?? servicePrice).toLocaleString()} ฿`} bold />
            <SummaryRow label="ชำระ"   value="บัตรเครดิต / เดบิต" />
          </View>

          {bookingError && <ErrorBanner message={bookingError} />}

          <Button label="ยืนยันจอง" onPress={handleConfirmBook} loading={bookingLoading} fullWidth />
          <Button label="เลือกเวลาอื่น" variant="ghost" onPress={() => setConfirmVisible(false)} fullWidth />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={[rowStyles.value, bold && rowStyles.bold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: palette.bg },
  scroll:  { padding: space.lg, gap: space.lg, paddingBottom: 40 },

  serviceCard: {
    backgroundColor: palette.brand,
    borderRadius: 20,
    padding: space.xl,
    gap: 4,
  },
  serviceName: { fontSize: type.xl, fontWeight: weight.black, color: "#fff" },
  shopName:    { fontSize: type.sm, color: "rgba(255,255,255,0.8)" },
  price:       { fontSize: type.lg, fontWeight: weight.bold, color: "#fff", marginTop: 4 },

  sectionTitle: { fontSize: type.md, fontWeight: weight.bold, color: palette.ink },

  datesRow: { gap: space.sm, paddingRight: space.lg },
  dateChip: {
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.card,
    minWidth: 68,
  },
  dateChipActive: { borderColor: palette.brand, backgroundColor: palette.brandLight },
  dateDay:        { fontSize: type.xs, color: palette.muted },
  dateDayActive:  { color: palette.brand },
  dateNum:        { fontSize: type.sm, fontWeight: weight.bold, color: palette.ink, marginTop: 2 },
  dateNumActive:  { color: palette.brand },

  slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  slotChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.card,
    minWidth: 80,
    alignItems: "center",
  },
  slotChipActive: { borderColor: palette.brand, backgroundColor: palette.brand },
  slotText:       { fontSize: type.sm, fontWeight: weight.semi, color: palette.ink },
  slotTextActive: { color: "#fff" },

  noSlots:     { alignItems: "center", paddingVertical: 24, gap: 4 },
  noSlotsText: { fontSize: type.base, fontWeight: weight.semi, color: palette.muted },
  noSlotsHint: { fontSize: type.sm, color: palette.subtle },

  quoteLoading:     { alignItems: "center", paddingVertical: 12 },
  quoteLoadingText: { fontSize: type.sm, color: palette.muted },

  // Modal / bottom sheet
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.4)",
  },
  sheet: {
    backgroundColor: palette.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: space.xl,
    paddingBottom: 36,
    gap: space.md,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.line,
    alignSelf: "center",
    marginBottom: space.sm,
  },
  sheetTitle: { fontSize: type.xl, fontWeight: weight.black, color: palette.ink },
  summaryCard: {
    backgroundColor: palette.bg,
    borderRadius: 14,
    padding: space.md,
    gap: space.sm,
  },
  divider: { height: 1, backgroundColor: palette.line },
});

const rowStyles = StyleSheet.create({
  row:   { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  label: { fontSize: type.sm, color: palette.muted, flex: 1 },
  value: { fontSize: type.sm, color: palette.ink, flex: 2, textAlign: "right" },
  bold:  { fontWeight: weight.bold, fontSize: type.base, color: palette.brand },
});
