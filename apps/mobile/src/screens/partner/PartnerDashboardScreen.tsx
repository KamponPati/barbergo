import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/Button";
import { palette, space, type, weight } from "../../theme";

export function PartnerDashboardScreen() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>แดชบอร์ด</Text>
        <Button label="ออกจากระบบ" variant="ghost" size="sm" onPress={logout} />
      </View>
      <View style={styles.body}>
        <Text style={styles.coming}>🏗 Phase 14 — ระบบพาร์ทเนอร์กำลังมา</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: palette.bg },
  header:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.md },
  title:   { fontSize: type.xl, fontWeight: weight.black, color: palette.ink },
  body:    { flex: 1, justifyContent: "center", alignItems: "center", padding: space.xxl },
  coming:  { fontSize: type.md, color: palette.muted, textAlign: "center" },
});
