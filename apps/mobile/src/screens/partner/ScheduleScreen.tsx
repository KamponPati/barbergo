import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import type { Booking } from "../../lib/types";
import { Badge } from "../../components/Badge";
import { EmptyState } from "../../components/EmptyState";
import { palette, radius, space, type, weight } from "../../theme";

interface DaySchedule {
  key: string;
  label: string;
  shortLabel: string;
  open: boolean;
  openTime: string;
  closeTime: string;
}

const INIT_SCHEDULE: DaySchedule[] = [
  { key: "mon", label: "วันจันทร์",    shortLabel: "จ", open: true,  openTime: "10:00", closeTime: "20:00" },
  { key: "tue", label: "วันอังคาร",   shortLabel: "อ", open: true,  openTime: "10:00", closeTime: "20:00" },
  { key: "wed", label: "วันพุธ",      shortLabel: "พ", open: true,  openTime: "10:00", closeTime: "20:00" },
  { key: "thu", label: "วันพฤหัส",   shortLabel: "พฤ", open: true,  openTime: "10:00", closeTime: "20:00" },
  { key: "fri", label: "วันศุกร์",    shortLabel: "ศ", open: true,  openTime: "10:00", closeTime: "21:00" },
  { key: "sat", label: "วันเสาร์",    shortLabel: "ส", open: true,  openTime: "09:00", closeTime: "21:00" },
  { key: "sun", label: "วันอาทิตย์",  shortLabel: "อา", open: false, openTime: "10:00", closeTime: "18:00" },
];

// Mock upcoming bookings for this week
const UPCOMING: Array<Booking & { customerName: string; serviceName: string }> = [
  {
    id: "bk_001abc", status: "confirmed", amount: 300,
    slot_at: "2026-02-19T10:00:00.000Z",
    customerName: "คุณธนา", serviceName: "Classic Cut",
  } as any,
  {
    id: "bk_002def", status: "authorized", amount: 350,
    slot_at: "2026-02-19T14:30:00.000Z",
    customerName: "คุณมินา", serviceName: "Fade & Taper",
  } as any,
  {
    id: "bk_003ghi", status: "confirmed", amount: 200,
    slot_at: "2026-02-20T11:00:00.000Z",
    customerName: "คุณปาล์ม", serviceName: "Beard Trim",
  } as any,
  {
    id: "bk_004jkl", status: "confirmed", amount: 800,
    slot_at: "2026-02-21T15:00:00.000Z",
    customerName: "คุณอาย", serviceName: "Color & Style",
  } as any,
];

const STATUS_BADGE: Record<string, { label: string; variant: "primary" | "warning" | "success" | "neutral" }> = {
  authorized: { label: "รออนุมัติ", variant: "warning" },
  confirmed:  { label: "ยืนยันแล้ว", variant: "primary" },
};

function groupByDate(bookings: typeof UPCOMING) {
  const map: Record<string, typeof UPCOMING> = {};
  for (const b of bookings) {
    const dateKey = new Date(b.slot_at).toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "short" });
    if (!map[dateKey]) map[dateKey] = [];
    map[dateKey].push(b);
  }
  return Object.entries(map);
}

export function ScheduleScreen() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(INIT_SCHEDULE);

  const toggleDay = (key: string) => {
    setSchedule((prev) =>
      prev.map((d) => d.key === key ? { ...d, open: !d.open } : d)
    );
  };

  const openCount  = schedule.filter((d) => d.open).length;
  const groups     = groupByDate(UPCOMING);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ตารางงาน</Text>
        </View>

        {/* Weekly open/close summary dots */}
        <View style={styles.weekRow}>
          {schedule.map((day) => (
            <View key={day.key} style={styles.weekDot}>
              <View style={[styles.dot, day.open ? styles.dotOpen : styles.dotClosed]} />
              <Text style={styles.dotLabel}>{day.shortLabel}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.weekSummary}>เปิดทำการ {openCount} วัน / สัปดาห์</Text>

        {/* Schedule grid */}
        <Text style={styles.sectionTitle}>วันและเวลาทำการ</Text>
        <View style={styles.scheduleList}>
          {schedule.map((day) => (
            <View key={day.key} style={styles.dayRow}>
              <View style={styles.dayInfo}>
                <Text style={[styles.dayName, !day.open && styles.dayNameClosed]}>{day.label}</Text>
                {day.open ? (
                  <Text style={styles.dayHours}>{day.openTime} – {day.closeTime}</Text>
                ) : (
                  <Text style={styles.dayClosedLabel}>วันหยุด</Text>
                )}
              </View>
              <Switch
                value={day.open}
                onValueChange={() => toggleDay(day.key)}
                trackColor={{ false: palette.line, true: palette.brand }}
                thumbColor="#fff"
                accessibilityLabel={`toggle ${day.label}`}
              />
            </View>
          ))}
        </View>

        {/* Upcoming bookings timeline */}
        <Text style={styles.sectionTitle}>การจองที่กำลังมา</Text>
        {UPCOMING.length === 0 ? (
          <EmptyState emoji="📅" title="ไม่มีการจองในสัปดาห์นี้" subtitle="เมื่อลูกค้าจองจะปรากฏที่นี่" />
        ) : (
          <View style={styles.timeline}>
            {groups.map(([dateStr, bookings]) => (
              <View key={dateStr} style={styles.timeGroup}>
                <View style={styles.dateHeader}>
                  <View style={styles.dateLine} />
                  <Text style={styles.dateLabel}>{dateStr}</Text>
                  <View style={styles.dateLine} />
                </View>
                {bookings.map((b, idx) => {
                  const timeStr = new Date(b.slot_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
                  const cfg = STATUS_BADGE[b.status] ?? { label: b.status, variant: "neutral" as const };
                  return (
                    <View key={b.id} style={styles.timelineRow}>
                      <View style={styles.timelineDot}>
                        <View style={styles.timelineDotInner} />
                        {idx < bookings.length - 1 && <View style={styles.timelineLine} />}
                      </View>
                      <View style={styles.timelineCard}>
                        <View style={styles.timelineCardTop}>
                          <Text style={styles.timelineTime}>{timeStr}</Text>
                          <Badge label={cfg.label} variant={cfg.variant} />
                        </View>
                        <Text style={styles.timelineCustomer}>{(b as any).customerName}</Text>
                        <Text style={styles.timelineService}>{(b as any).serviceName} · {b.amount.toLocaleString()} ฿</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
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
  header: { paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.sm },
  title:  { fontSize: type.xl, fontWeight: weight.black, color: palette.ink },

  weekRow:     { flexDirection: "row", justifyContent: "center", gap: space.md, paddingHorizontal: space.lg, marginBottom: 6 },
  weekDot:     { alignItems: "center", gap: 4 },
  dot:         { width: 12, height: 12, borderRadius: 6 },
  dotOpen:     { backgroundColor: palette.success },
  dotClosed:   { backgroundColor: palette.line },
  dotLabel:    { fontSize: 10, color: palette.muted },
  weekSummary: { textAlign: "center", fontSize: type.xs, color: palette.muted, marginBottom: space.lg },

  sectionTitle: { fontSize: type.md, fontWeight: weight.bold, color: palette.ink, paddingHorizontal: space.lg, marginBottom: space.sm },

  scheduleList: { paddingHorizontal: space.lg, gap: 2, marginBottom: space.lg },
  dayRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: palette.card, borderRadius: radius.md,
    borderWidth: 1, borderColor: palette.line,
    paddingHorizontal: space.md, paddingVertical: 10,
  },
  dayInfo:        { gap: 2 },
  dayName:        { fontSize: type.base, fontWeight: weight.semi, color: palette.ink },
  dayNameClosed:  { color: palette.muted },
  dayHours:       { fontSize: type.xs, color: palette.brand, fontWeight: weight.semi },
  dayClosedLabel: { fontSize: type.xs, color: palette.danger },

  timeline:  { paddingHorizontal: space.lg, gap: space.md },
  timeGroup: { gap: space.sm },

  dateHeader: { flexDirection: "row", alignItems: "center", gap: space.sm, marginBottom: 4 },
  dateLine:   { flex: 1, height: 1, backgroundColor: palette.line },
  dateLabel:  { fontSize: type.xs, color: palette.muted, fontWeight: weight.semi },

  timelineRow:  { flexDirection: "row", gap: space.md },
  timelineDot:  { width: 16, alignItems: "center", marginTop: 4 },
  timelineDotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: palette.brand, borderWidth: 2, borderColor: palette.brandLight },
  timelineLine: { flex: 1, width: 2, backgroundColor: palette.brandLight, marginTop: 2 },

  timelineCard: {
    flex: 1, backgroundColor: palette.card,
    borderRadius: radius.lg, borderWidth: 1, borderColor: palette.line,
    padding: space.md, gap: 4, marginBottom: space.sm,
  },
  timelineCardTop:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  timelineTime:     { fontSize: type.sm, fontWeight: weight.black, color: palette.ink, fontFamily: "monospace" },
  timelineCustomer: { fontSize: type.base, fontWeight: weight.bold, color: palette.ink },
  timelineService:  { fontSize: type.xs, color: palette.muted },
});
