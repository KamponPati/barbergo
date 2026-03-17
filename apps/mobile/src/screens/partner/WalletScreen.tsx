import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getPartnerWallet, withdrawPartnerWallet } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { ErrorBanner } from "../../components/ErrorBanner";
import { palette, radius, space, type, weight } from "../../theme";

export function WalletScreen() {
  const { token } = useAuthStore();
  const [wallet, setWallet]         = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount]             = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError]     = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!token) return;
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const data = await getPartnerWallet(token);
      setWallet(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "โหลดกระเป๋าไม่สำเร็จ");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const balance  = (wallet as any)?.balance ?? 0;
  const pending  = (wallet as any)?.pending ?? 0;
  const totalEarned = (wallet as any)?.total_earned ?? 0;

  const handleWithdraw = async () => {
    const amt = parseInt(amount, 10);
    if (isNaN(amt) || amt <= 0) {
      setWithdrawError("กรุณาระบุจำนวนที่ถูกต้อง");
      return;
    }
    if (amt > balance) {
      setWithdrawError(`ยอดคงเหลือไม่พอ (มี ${balance.toLocaleString()} ฿)`);
      return;
    }
    setWithdrawError(null);
    setWithdrawLoading(true);
    try {
      await withdrawPartnerWallet(token!);
      setWithdrawOpen(false);
      setAmount("");
      load();
      Alert.alert("ถอนเงินสำเร็จ 💰", `${amt.toLocaleString()} ฿ กำลังโอนเข้าบัญชีของคุณ`);
    } catch (e) {
      setWithdrawError(e instanceof Error ? e.message : "ถอนเงินไม่สำเร็จ");
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Mock transactions
  const transactions = [
    { id: "tx_001", label: "Classic Cut",   net: 270,  date: "18 ก.พ." },
    { id: "tx_002", label: "Fade & Taper",  net: 320,  date: "17 ก.พ." },
    { id: "tx_003", label: "Beard Trim",    net: 180,  date: "16 ก.พ." },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={palette.brand} />}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <Text style={styles.title}>กระเป๋าเงิน</Text>
        </View>

        {error && <ErrorBanner message={error} onRetry={load} />}

        {/* Balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>ยอดคงเหลือ</Text>
          <Text style={styles.balanceAmount}>{balance.toLocaleString()} ฿</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>รอรับ</Text>
              <Text style={styles.balanceStatValue}>{pending.toLocaleString()} ฿</Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>รายได้ทั้งหมด</Text>
              <Text style={styles.balanceStatValue}>{totalEarned.toLocaleString()} ฿</Text>
            </View>
          </View>
          <Button
            label="ถอนเงิน"
            onPress={() => { setWithdrawOpen(true); setWithdrawError(null); setAmount(""); }}
            disabled={balance <= 0}
            fullWidth
          />
        </View>

        {/* Transaction history */}
        <Text style={styles.sectionTitle}>ประวัติรายรับ</Text>
        {transactions.length === 0 ? (
          <EmptyState emoji="📊" title="ยังไม่มีรายการ" subtitle="รายรับจากงานจะปรากฏที่นี่" />
        ) : (
          <View style={styles.txList}>
            {transactions.map((tx) => (
              <View key={tx.id} style={styles.txRow}>
                <View style={styles.txInfo}>
                  <Text style={styles.txLabel}>{tx.label}</Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
                <Text style={styles.txAmount}>+{tx.net.toLocaleString()} ฿</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Withdraw sheet */}
      <Modal visible={withdrawOpen} transparent animationType="slide" onRequestClose={() => setWithdrawOpen(false)}>
        <Pressable style={sheetStyles.backdrop} onPress={() => setWithdrawOpen(false)} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={sheetStyles.sheet}>
            <View style={sheetStyles.handle} />
            <Text style={sheetStyles.title}>ถอนเงิน</Text>
            <Text style={sheetStyles.available}>ยอดที่ถอนได้: {balance.toLocaleString()} ฿</Text>

            <Text style={sheetStyles.label}>จำนวนที่ต้องการถอน (฿)</Text>
            <TextInput
              style={sheetStyles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="เช่น 500"
              placeholderTextColor={palette.subtle}
              keyboardType="numeric"
            />

            {withdrawError && <ErrorBanner message={withdrawError} />}
            <Button label="ยืนยันถอนเงิน" onPress={handleWithdraw} loading={withdrawLoading} fullWidth />
            <Button label="ยกเลิก" variant="ghost" onPress={() => setWithdrawOpen(false)} fullWidth />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: palette.bg },
  scroll: { paddingBottom: 32 },
  header: { paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.sm },
  title:  { fontSize: type.xl, fontWeight: weight.black, color: palette.ink },

  balanceCard: {
    backgroundColor: palette.brand, margin: space.lg,
    borderRadius: 20, padding: space.xl, gap: space.md,
  },
  balanceLabel:  { fontSize: type.sm, color: "rgba(255,255,255,0.8)" },
  balanceAmount: { fontSize: 44, fontWeight: weight.black, color: "#fff" },
  balanceRow:    { flexDirection: "row", alignItems: "center", marginBottom: space.sm },
  balanceStat:   { flex: 1, gap: 2 },
  balanceStatLabel: { fontSize: type.xs, color: "rgba(255,255,255,0.7)" },
  balanceStatValue: { fontSize: type.md, fontWeight: weight.bold, color: "#fff" },
  balanceDivider:   { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.3)", marginHorizontal: space.md },

  sectionTitle: { fontSize: type.md, fontWeight: weight.bold, color: palette.ink, paddingHorizontal: space.lg, marginBottom: space.sm },
  txList:  { paddingHorizontal: space.lg, gap: space.sm },
  txRow:   {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: palette.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: palette.line, padding: space.md,
  },
  txInfo:   { gap: 2 },
  txLabel:  { fontSize: type.base, fontWeight: weight.semi, color: palette.ink },
  txDate:   { fontSize: type.xs, color: palette.muted },
  txAmount: { fontSize: type.md, fontWeight: weight.bold, color: palette.success },
});

const sheetStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.4)" },
  sheet: {
    backgroundColor: palette.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: space.xl, paddingBottom: 36, gap: space.md,
  },
  handle:    { width: 40, height: 4, borderRadius: 2, backgroundColor: palette.line, alignSelf: "center", marginBottom: space.sm },
  title:     { fontSize: type.xl, fontWeight: weight.black, color: palette.ink },
  available: { fontSize: type.sm, color: palette.muted },
  label:     { fontSize: type.sm, fontWeight: weight.semi, color: palette.body },
  input: {
    borderWidth: 1, borderColor: palette.line, borderRadius: 12,
    paddingHorizontal: space.md, paddingVertical: 12,
    fontSize: type.lg, fontWeight: weight.bold, color: palette.ink,
  },
});
