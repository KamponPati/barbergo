import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/Button";
import { ErrorBanner } from "../components/ErrorBanner";
import { palette, space, type, weight } from "../theme";

export function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (role: "customer" | "partner") => {
    setError(null);
    setLoading(true);
    try {
      await login(role);
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo area */}
          <View style={styles.hero}>
            <Text style={styles.logo}>✂️</Text>
            <Text style={styles.appName}>BarberGo</Text>
            <Text style={styles.tagline}>จองร้านตัดผม ง่าย ไว ทุกที่</Text>
          </View>

          {/* Role selector */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>เข้าสู่ระบบ</Text>
            <Text style={styles.cardSubtitle}>เลือกบทบาทของคุณเพื่อเริ่มใช้งาน</Text>

            {error && <ErrorBanner message={error} onRetry={() => setError(null)} />}

            <View style={styles.roleRow}>
              <View style={styles.roleCard}>
                <Text style={styles.roleIcon}>👤</Text>
                <Text style={styles.roleLabel}>ลูกค้า</Text>
                <Text style={styles.roleDesc}>ค้นหาและจองร้านตัดผม</Text>
                <Button
                  label="เข้าสู่ระบบ"
                  onPress={() => handleLogin("customer")}
                  loading={loading}
                  fullWidth
                  size="sm"
                />
              </View>

              <View style={styles.roleCard}>
                <Text style={styles.roleIcon}>💈</Text>
                <Text style={styles.roleLabel}>พาร์ทเนอร์</Text>
                <Text style={styles.roleDesc}>จัดการร้านและรับงาน</Text>
                <Button
                  label="เข้าสู่ระบบ"
                  onPress={() => handleLogin("partner")}
                  loading={loading}
                  fullWidth
                  size="sm"
                  variant="secondary"
                />
              </View>
            </View>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            BarberGo v0.1.0 · Powered by BarberGo Platform
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.brand,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: space.lg,
    gap: space.xl,
  },
  hero: {
    alignItems: "center",
    gap: space.sm,
    paddingVertical: space.xxl,
  },
  logo: {
    fontSize: 64,
  },
  appName: {
    fontSize: type.xxl,
    fontWeight: weight.black,
    color: "#fff",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: type.base,
    color: "rgba(255,255,255,0.8)",
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: 24,
    padding: space.xl,
    gap: space.lg,
  },
  cardTitle: {
    fontSize: type.xl,
    fontWeight: weight.black,
    color: palette.ink,
  },
  cardSubtitle: {
    fontSize: type.sm,
    color: palette.muted,
    marginTop: -space.sm,
  },
  roleRow: {
    flexDirection: "row",
    gap: space.md,
  },
  roleCard: {
    flex: 1,
    alignItems: "center",
    gap: space.sm,
    padding: space.md,
    backgroundColor: palette.bg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.line,
  },
  roleIcon: {
    fontSize: 36,
  },
  roleLabel: {
    fontSize: type.base,
    fontWeight: weight.bold,
    color: palette.ink,
  },
  roleDesc: {
    fontSize: type.xs,
    color: palette.muted,
    textAlign: "center",
    lineHeight: 16,
  },
  footer: {
    textAlign: "center",
    fontSize: type.xs,
    color: "rgba(255,255,255,0.6)",
    paddingBottom: space.lg,
  },
});
