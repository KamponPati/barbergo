import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getCustomerHistory, postServiceFeedback } from "../lib/api";
import { subscribeToBookingEvents, type BookingEvent, type BookingEventPayload } from "../lib/socket";
import type { Booking } from "../lib/types";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { ErrorBanner } from "../components/ErrorBanner";
import { palette, radius, space, type, weight } from "../theme";

const STEPS: { key: string; label: string; emoji: string; statuses: string[] }[] = [
  { key: "confirmed",  label: "ยืนยันแล้ว",    emoji: "✅", statuses: ["confirmed", "authorized"] },
  { key: "on_the_way", label: "กำลังเดินทาง",  emoji: "🚗", statuses: [] },
  { key: "started",   label: "กำลังบริการ",    emoji: "✂️", statuses: ["started"] },
  { key: "completed", label: "เสร็จสิ้น",      emoji: "🎉", statuses: ["completed"] },
];

const ACTIVE_STATUSES = new Set(["authorized", "confirmed", "started"]);

function getStepIndex(status: string): number {
  if (status === "completed") return 3;
  if (status === "started")   return 2;
  if (status === "confirmed" || status === "authorized") return 0;
  return 0;
}

interface ReviewSheetProps {
  booking: Booking;
  token: string;
  onClose: () => void;
  onSubmit: () => void;
}

function ReviewSheet({ booking, token, onClose, onSubmit }: ReviewSheetProps) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]    = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      await postServiceFeedback(token, booking.id);
      onSubmit();
      Alert.alert("ขอบคุณ! 😊", "รีวิวของคุณถูกส่งแล้ว");
    } catch (e) {
      setError(e instanceof Error ? e.message : "ส่งรีวิวไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={reviewStyles.backdrop} onPress={onClose} />
      <View style={reviewStyles.sheet}>
        <View style={reviewStyles.handle} />
        <Text style={reviewStyles.title}>รีวิวการบริการ 🎉</Text>
        <Text style={reviewStyles.subtitle}>บอกเราว่าเป็นยังไงบ้าง?</Text>

        {/* Star rating */}
        <View style={reviewStyles.stars}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Pressable key={s} onPress={() => setRating(s)} accessibilityRole="button" accessibilityLabel={`${s} ดาว`}>
              <Text style={[reviewStyles.star, s <= rating && reviewStyles.starActive]}>{s <= rating ? "★" : "☆"}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={reviewStyles.input}
          value={review}
          onChangeText={setReview}
          placeholder="บอกเล่าประสบการณ์... (ไม่บังคับ)"
          placeholderTextColor={palette.subtle}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {error && <ErrorBanner message={error} />}
        <Button label="ส่งรีวิว" onPress={submit} loading={loading} fullWidth />
        <Button label="ข้ามไปก่อน" variant="ghost" onPress={onClose} fullWidth />
      </View>
    </Modal>
  );
}

export function TrackingScreen() {
  const { token } = useAuthStore();
  const [bookings, setBookings]       = useState<Booking[]>([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [reviewOpen, setReviewOpen]   = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

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

  // Find active booking (most recent non-cancelled/non-completed... or most recent completed)
  const activeBooking = bookings.find((b) => ACTIVE_STATUSES.has(b.status))
    ?? bookings.find((b) => b.status === "completed");

  // WebSocket: subscribe to live booking events when there is an active booking
  useEffect(() => {
    if (!token || !activeBooking || !ACTIVE_STATUSES.has(activeBooking.status)) return;

    const unsubscribe = subscribeToBookingEvents(
      token,
      activeBooking.id,
      (_event: BookingEvent, _payload: BookingEventPayload) => {
        // Refresh booking list to reflect new status
        load();
      }
    );
    return unsubscribe;
  }, [token, activeBooking?.id, activeBooking?.status, load]);

  const stepIndex = activeBooking ? getStepIndex(activeBooking.status) : 0;
  const pct = activeBooking ? (stepIndex / (STEPS.length - 1)) * 100 : 0;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: pct,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [pct, progressAnim]);

  const barberName = "ช่างโอ้"; // In production this comes from booking details

  if (!loading && !activeBooking) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>ติดตามการบริการ</Text>
        </View>
        <EmptyState
          emoji="📍"
          title="ไม่มีการจองที่ใช้งานอยู่"
          subtitle="เมื่อคุณมีการจองที่ยืนยันแล้ว สถานะจะปรากฏที่นี่"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={palette.brand} />}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <Text style={styles.title}>ติดตามการบริการ</Text>
        </View>

        {error && <ErrorBanner message={error} onRetry={load} />}

        {loading ? (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>กำลังโหลด...</Text>
          </View>
        ) : activeBooking ? (
          <>
            {/* Barber card */}
            <View style={styles.barberCard}>
              <Text style={styles.barberEmoji}>✂️</Text>
              <View style={styles.barberInfo}>
                <Text style={styles.barberName}>{barberName}</Text>
                <Text style={styles.barberMeta}>
                  #{activeBooking.id.slice(-8).toUpperCase()} · {activeBooking.amount.toLocaleString()} ฿
                </Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{STATUS_LABEL[activeBooking.status] ?? activeBooking.status}</Text>
              </View>
            </View>

            {/* 4-Step Progress */}
            <View style={styles.stepsCard}>
              <Text style={styles.stepsTitle}>ขั้นตอนการบริการ</Text>
              <View style={styles.stepsRow}>
                {STEPS.map((step, i) => {
                  const isDone   = i < stepIndex;
                  const isActive = i === stepIndex;
                  return (
                    <View key={step.key} style={styles.stepWrap}>
                      <View style={[styles.stepDot, isDone && styles.stepDotDone, isActive && styles.stepDotActive]}>
                        <Text style={styles.stepEmoji}>{step.emoji}</Text>
                      </View>
                      <Text style={[styles.stepLabel, (isDone || isActive) && styles.stepLabelActive]}>
                        {step.label}
                      </Text>
                      {i < STEPS.length - 1 && (
                        <View style={[styles.stepLine, isDone && styles.stepLineDone]} />
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Progress bar */}
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    { width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }) },
                  ]}
                />
              </View>
            </View>

            {/* ETA / info */}
            {activeBooking.status !== "completed" && (
              <View style={styles.etaCard}>
                <Text style={styles.etaText}>⏱ ประมาณ 15 นาที</Text>
                <Text style={styles.etaSubtext}>เวลาอาจเปลี่ยนแปลงตามสภาพจราจร</Text>
              </View>
            )}

            {/* Action buttons */}
            {activeBooking.status !== "completed" ? (
              <View style={styles.actions}>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => Linking.openURL("tel:0812345678")}
                  accessibilityRole="button"
                  accessibilityLabel="โทรหาช่าง"
                >
                  <Text style={styles.actionIcon}>📞</Text>
                  <Text style={styles.actionLabel}>โทร</Text>
                </Pressable>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => Alert.alert("แชท", "ระบบแชทจะพร้อมเร็วๆ นี้")}
                  accessibilityRole="button"
                  accessibilityLabel="ส่งข้อความ"
                >
                  <Text style={styles.actionIcon}>💬</Text>
                  <Text style={styles.actionLabel}>แชท</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionBtn, styles.actionBtnSOS]}
                  onPress={() => Linking.openURL("tel:1669")}
                  accessibilityRole="button"
                  accessibilityLabel="ฉุกเฉิน"
                >
                  <Text style={styles.actionIcon}>🚨</Text>
                  <Text style={[styles.actionLabel, { color: palette.danger }]}>SOS</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.completedActions}>
                <Button
                  label="รีวิวการบริการ ⭐"
                  onPress={() => setReviewOpen(true)}
                  fullWidth
                />
                <Button
                  label="จองอีกครั้ง"
                  variant="secondary"
                  onPress={() => {}}
                  fullWidth
                />
              </View>
            )}
          </>
        ) : null}
      </ScrollView>

      {reviewOpen && activeBooking && token && (
        <ReviewSheet
          booking={activeBooking}
          token={token}
          onClose={() => setReviewOpen(false)}
          onSubmit={() => { setReviewOpen(false); load(); }}
        />
      )}
    </SafeAreaView>
  );
}

const STATUS_LABEL: Record<string, string> = {
  authorized: "รออนุมัติ",
  confirmed:  "ยืนยันแล้ว",
  started:    "กำลังบริการ",
  completed:  "เสร็จสิ้น",
};

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: palette.bg },
  scroll:  { paddingBottom: 32 },
  header:  { paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.sm },
  title:   { fontSize: type.xl, fontWeight: weight.black, color: palette.ink },

  loadingCard: { margin: space.lg, padding: space.xl, backgroundColor: palette.card, borderRadius: radius.lg, alignItems: "center" },
  loadingText: { color: palette.muted },

  barberCard: {
    flexDirection: "row", alignItems: "center", gap: space.md,
    margin: space.lg, marginTop: 0,
    backgroundColor: palette.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: palette.line, padding: space.md,
  },
  barberEmoji: { fontSize: 40 },
  barberInfo:  { flex: 1, gap: 2 },
  barberName:  { fontSize: type.md, fontWeight: weight.bold, color: palette.ink },
  barberMeta:  { fontSize: type.xs, color: palette.muted, fontFamily: "monospace" },
  statusPill:  {
    backgroundColor: palette.brandLight, borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  statusText:  { fontSize: type.xs, fontWeight: weight.bold, color: palette.brand },

  stepsCard: {
    marginHorizontal: space.lg, backgroundColor: palette.card,
    borderRadius: radius.lg, borderWidth: 1, borderColor: palette.line,
    padding: space.lg, gap: space.md,
  },
  stepsTitle: { fontSize: type.base, fontWeight: weight.bold, color: palette.ink },
  stepsRow:   { flexDirection: "row", justifyContent: "space-between" },
  stepWrap:   { alignItems: "center", flex: 1, position: "relative" },
  stepDot: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: palette.line, justifyContent: "center", alignItems: "center",
    marginBottom: 4,
  },
  stepDotActive: { backgroundColor: palette.brandLight, borderWidth: 2, borderColor: palette.brand },
  stepDotDone:   { backgroundColor: palette.brand },
  stepEmoji:     { fontSize: 20 },
  stepLabel:     { fontSize: 9, color: palette.subtle, textAlign: "center" },
  stepLabelActive: { color: palette.brand, fontWeight: weight.bold },
  stepLine: {
    position: "absolute", top: 22, left: "60%", right: "-40%",
    height: 2, backgroundColor: palette.line,
  },
  stepLineDone: { backgroundColor: palette.brand },

  progressTrack: { height: 6, backgroundColor: palette.line, borderRadius: 3, overflow: "hidden" },
  progressBar:   { height: 6, backgroundColor: palette.brand, borderRadius: 3 },

  etaCard: {
    marginHorizontal: space.lg, marginTop: space.md,
    backgroundColor: "#eff6ff", borderRadius: radius.md,
    padding: space.md, gap: 2,
  },
  etaText:    { fontSize: type.base, fontWeight: weight.semi, color: palette.brand },
  etaSubtext: { fontSize: type.xs, color: palette.muted },

  actions: {
    flexDirection: "row", justifyContent: "center", gap: space.lg,
    marginTop: space.xl, marginHorizontal: space.lg,
  },
  actionBtn: {
    flex: 1, alignItems: "center", gap: 4,
    backgroundColor: palette.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: palette.line, paddingVertical: space.md,
  },
  actionBtnSOS: { borderColor: "#fee2e2", backgroundColor: "#fff5f5" },
  actionIcon:   { fontSize: 28 },
  actionLabel:  { fontSize: type.xs, fontWeight: weight.semi, color: palette.muted },

  completedActions: {
    marginTop: space.xl, marginHorizontal: space.lg, gap: space.sm,
  },
});

const reviewStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.4)" },
  sheet: {
    backgroundColor: palette.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: space.xl, paddingBottom: 36, gap: space.md,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: palette.line, alignSelf: "center", marginBottom: space.sm,
  },
  title:    { fontSize: type.xl, fontWeight: weight.black, color: palette.ink },
  subtitle: { fontSize: type.sm, color: palette.muted, marginTop: -space.sm },
  stars:    { flexDirection: "row", gap: space.sm, justifyContent: "center", paddingVertical: space.sm },
  star:     { fontSize: 36, color: palette.line },
  starActive: { color: palette.gold },
  input: {
    borderWidth: 1, borderColor: palette.line, borderRadius: 12,
    padding: space.md, fontSize: type.base, color: palette.ink,
    minHeight: 80, backgroundColor: palette.bg,
  },
});
