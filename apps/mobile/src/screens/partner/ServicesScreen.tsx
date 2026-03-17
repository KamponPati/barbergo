import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { createPartnerService, createPartnerStaff } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/Button";
import { Badge } from "../../components/Badge";
import { EmptyState } from "../../components/EmptyState";
import { ErrorBanner } from "../../components/ErrorBanner";
import { palette, radius, space, type, weight } from "../../theme";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  mode: "in_shop" | "delivery" | "both";
  active: boolean;
}

interface Staff {
  id: string;
  name: string;
  skills: string[];
  rating: number;
  jobsCompleted: number;
}

const MOCK_SERVICES: Service[] = [
  { id: "svc_1", name: "Classic Cut",    price: 300, duration: 30, mode: "both",     active: true  },
  { id: "svc_2", name: "Fade & Taper",   price: 350, duration: 45, mode: "in_shop",  active: true  },
  { id: "svc_3", name: "Beard Trim",     price: 200, duration: 20, mode: "both",     active: true  },
  { id: "svc_4", name: "Color & Style",  price: 800, duration: 90, mode: "in_shop",  active: false },
];

const MOCK_STAFF: Staff[] = [
  { id: "stf_1", name: "น้องแมว",  skills: ["Haircut", "Styling"],        rating: 4.9, jobsCompleted: 128 },
  { id: "stf_2", name: "พี่ต้น",   skills: ["Fade", "Beard"],             rating: 4.7, jobsCompleted: 95  },
  { id: "stf_3", name: "เอ็ม",    skills: ["Color", "Haircut", "Styling"], rating: 4.8, jobsCompleted: 212 },
];

const MODE_LABELS: Record<string, string> = {
  in_shop:  "ในร้าน",
  delivery: "บริการนอกสถานที่",
  both:     "ทั้งสองแบบ",
};

export function ServicesScreen() {
  const { token } = useAuthStore();

  const [tab, setTab]               = useState<"services" | "staff">("services");
  const [services, setServices]     = useState<Service[]>(MOCK_SERVICES);
  const [staff, setStaff]           = useState<Staff[]>(MOCK_STAFF);
  const [sheetOpen, setSheetOpen]   = useState(false);
  const [editItem, setEditItem]     = useState<Service | null>(null);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // Form state
  const [formName, setFormName]         = useState("");
  const [formPrice, setFormPrice]       = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [formMode, setFormMode]         = useState<Service["mode"]>("both");

  const openAdd = () => {
    setEditItem(null);
    setFormName(""); setFormPrice(""); setFormDuration(""); setFormMode("both");
    setError(null);
    setSheetOpen(true);
  };

  const openEdit = (svc: Service) => {
    setEditItem(svc);
    setFormName(svc.name);
    setFormPrice(String(svc.price));
    setFormDuration(String(svc.duration));
    setFormMode(svc.mode);
    setError(null);
    setSheetOpen(true);
  };

  const handleSave = async () => {
    const price    = parseInt(formPrice, 10);
    const duration = parseInt(formDuration, 10);
    if (!formName.trim())     { setError("กรุณาระบุชื่อบริการ"); return; }
    if (isNaN(price)    || price <= 0)    { setError("กรุณาระบุราคาที่ถูกต้อง"); return; }
    if (isNaN(duration) || duration <= 0) { setError("กรุณาระบุเวลาที่ถูกต้อง"); return; }

    setSaving(true);
    setError(null);
    try {
      if (editItem) {
        setServices((prev) => prev.map((s) =>
          s.id === editItem.id ? { ...s, name: formName, price, duration, mode: formMode } : s
        ));
      } else {
        await createPartnerService(token!);
        const newId = `svc_${Date.now()}`;
        setServices((prev) => [...prev, {
          id: newId, name: formName, price, duration, mode: formMode, active: true,
        }]);
      }
      setSheetOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = (svcId: string) => {
    setServices((prev) => prev.map((s) =>
      s.id === svcId ? { ...s, active: !s.active } : s
    ));
  };

  const handleAddStaff = async () => {
    if (!token) return;
    try {
      await createPartnerStaff(token);
      Alert.alert("เพิ่มพนักงานสำเร็จ 🎉", "พนักงานใหม่ถูกเพิ่มเข้าระบบแล้ว");
    } catch (e) {
      Alert.alert("ผิดพลาด", e instanceof Error ? e.message : "เพิ่มพนักงานไม่สำเร็จ");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>บริการ & พนักงาน</Text>
        <Button
          label={tab === "services" ? "+ เพิ่มบริการ" : "+ เพิ่มพนักงาน"}
          size="sm"
          onPress={tab === "services" ? openAdd : handleAddStaff}
        />
      </View>

      {/* Tab selector */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tabBtn, tab === "services" && styles.tabBtnActive]}
          onPress={() => setTab("services")}
        >
          <Text style={[styles.tabLabel, tab === "services" && styles.tabLabelActive]}>
            ✂️ บริการ ({services.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, tab === "staff" && styles.tabBtnActive]}
          onPress={() => setTab("staff")}
        >
          <Text style={[styles.tabLabel, tab === "staff" && styles.tabLabelActive]}>
            👤 พนักงาน ({staff.length})
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {tab === "services" ? (
          services.length === 0 ? (
            <EmptyState emoji="✂️" title="ยังไม่มีบริการ" subtitle="กดปุ่ม + เพิ่มบริการใหม่" />
          ) : (
            <View style={styles.list}>
              {services.map((svc) => (
                <View key={svc.id} style={[styles.card, !svc.active && styles.cardInactive]}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardInfo}>
                      <Text style={[styles.cardName, !svc.active && styles.cardNameDim]}>{svc.name}</Text>
                      <Text style={styles.cardMeta}>
                        {svc.duration} นาที · {MODE_LABELS[svc.mode]}
                      </Text>
                    </View>
                    <View style={styles.cardRight}>
                      <Text style={styles.cardPrice}>{svc.price.toLocaleString()} ฿</Text>
                      <Switch
                        value={svc.active}
                        onValueChange={() => toggleActive(svc.id)}
                        trackColor={{ false: palette.line, true: palette.brand }}
                        thumbColor="#fff"
                      />
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <Badge label={svc.active ? "เปิดใช้" : "ปิดใช้"} variant={svc.active ? "success" : "neutral"} />
                    <TouchableOpacity onPress={() => openEdit(svc)} style={styles.editBtn}>
                      <Text style={styles.editBtnText}>แก้ไข</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )
        ) : (
          staff.length === 0 ? (
            <EmptyState emoji="👤" title="ยังไม่มีพนักงาน" subtitle="กดปุ่ม + เพิ่มพนักงาน" />
          ) : (
            <View style={styles.list}>
              {staff.map((s) => (
                <View key={s.id} style={styles.card}>
                  <View style={styles.staffRow}>
                    <View style={styles.staffAvatar}>
                      <Text style={styles.staffAvatarText}>{s.name[0]}</Text>
                    </View>
                    <View style={styles.staffInfo}>
                      <Text style={styles.cardName}>{s.name}</Text>
                      <Text style={styles.cardMeta}>{s.skills.join(" · ")}</Text>
                    </View>
                    <View style={styles.staffStats}>
                      <Text style={styles.staffRating}>⭐ {s.rating}</Text>
                      <Text style={styles.staffJobs}>{s.jobsCompleted} งาน</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )
        )}
      </ScrollView>

      {/* Add/Edit Service Sheet */}
      <Modal visible={sheetOpen} transparent animationType="slide" onRequestClose={() => setSheetOpen(false)}>
        <Pressable style={sheetStyles.backdrop} onPress={() => setSheetOpen(false)} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={sheetStyles.sheet}>
            <View style={sheetStyles.handle} />
            <Text style={sheetStyles.title}>{editItem ? "แก้ไขบริการ" : "เพิ่มบริการใหม่"}</Text>

            <View style={sheetStyles.field}>
              <Text style={sheetStyles.label}>ชื่อบริการ</Text>
              <TextInput
                style={sheetStyles.input}
                value={formName}
                onChangeText={setFormName}
                placeholder="เช่น Classic Cut"
                placeholderTextColor={palette.subtle}
              />
            </View>

            <View style={sheetStyles.row}>
              <View style={[sheetStyles.field, { flex: 1 }]}>
                <Text style={sheetStyles.label}>ราคา (฿)</Text>
                <TextInput
                  style={sheetStyles.input}
                  value={formPrice}
                  onChangeText={setFormPrice}
                  placeholder="300"
                  placeholderTextColor={palette.subtle}
                  keyboardType="numeric"
                />
              </View>
              <View style={[sheetStyles.field, { flex: 1 }]}>
                <Text style={sheetStyles.label}>เวลา (นาที)</Text>
                <TextInput
                  style={sheetStyles.input}
                  value={formDuration}
                  onChangeText={setFormDuration}
                  placeholder="30"
                  placeholderTextColor={palette.subtle}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={sheetStyles.field}>
              <Text style={sheetStyles.label}>รูปแบบบริการ</Text>
              <View style={sheetStyles.modeRow}>
                {(["both", "in_shop", "delivery"] as const).map((m) => (
                  <Pressable
                    key={m}
                    style={[sheetStyles.modeBtn, formMode === m && sheetStyles.modeBtnActive]}
                    onPress={() => setFormMode(m)}
                  >
                    <Text style={[sheetStyles.modeBtnText, formMode === m && sheetStyles.modeBtnTextActive]}>
                      {MODE_LABELS[m]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {error && <ErrorBanner message={error} />}
            <Button label={editItem ? "บันทึกการแก้ไข" : "เพิ่มบริการ"} onPress={handleSave} loading={saving} fullWidth />
            <Button label="ยกเลิก" variant="ghost" onPress={() => setSheetOpen(false)} fullWidth />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: palette.bg },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.sm,
  },
  title: { fontSize: type.xl, fontWeight: weight.black, color: palette.ink },

  tabs:       { flexDirection: "row", paddingHorizontal: space.lg, gap: space.sm, marginBottom: space.md },
  tabBtn:     {
    flex: 1, paddingVertical: 10, alignItems: "center",
    borderRadius: radius.lg, backgroundColor: palette.card,
    borderWidth: 1, borderColor: palette.line,
  },
  tabBtnActive: { backgroundColor: palette.brandLight, borderColor: palette.brand },
  tabLabel:     { fontSize: type.sm, fontWeight: weight.semi, color: palette.muted },
  tabLabelActive: { color: palette.brand, fontWeight: weight.bold },

  scroll: { paddingHorizontal: space.lg, paddingBottom: 32 },
  list:   { gap: space.sm },

  card: {
    backgroundColor: palette.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: palette.line,
    padding: space.md, gap: space.sm,
  },
  cardInactive: { opacity: 0.55 },
  cardTop:  { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardInfo: { flex: 1, gap: 2 },
  cardRight:{ alignItems: "flex-end", gap: 4 },
  cardName: { fontSize: type.base, fontWeight: weight.bold, color: palette.ink },
  cardNameDim: { color: palette.muted },
  cardMeta: { fontSize: type.xs, color: palette.muted },
  cardPrice:{ fontSize: type.md, fontWeight: weight.black, color: palette.brand },
  cardActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  editBtn:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: palette.brandLight },
  editBtnText: { fontSize: type.xs, fontWeight: weight.bold, color: palette.brand },

  staffRow:       { flexDirection: "row", alignItems: "center", gap: space.md },
  staffAvatar:    { width: 44, height: 44, borderRadius: 22, backgroundColor: palette.brand, justifyContent: "center", alignItems: "center" },
  staffAvatarText:{ fontSize: type.lg, fontWeight: weight.black, color: "#fff" },
  staffInfo:      { flex: 1, gap: 2 },
  staffStats:     { alignItems: "flex-end", gap: 2 },
  staffRating:    { fontSize: type.sm, fontWeight: weight.bold, color: palette.ink },
  staffJobs:      { fontSize: type.xs, color: palette.muted },
});

const sheetStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.4)" },
  sheet: {
    backgroundColor: palette.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: space.xl, paddingBottom: 36, gap: space.md,
  },
  handle:    { width: 40, height: 4, borderRadius: 2, backgroundColor: palette.line, alignSelf: "center", marginBottom: space.sm },
  title:     { fontSize: type.xl, fontWeight: weight.black, color: palette.ink },
  field:     { gap: 6 },
  row:       { flexDirection: "row", gap: space.md },
  label:     { fontSize: type.sm, fontWeight: weight.semi, color: palette.body },
  input: {
    borderWidth: 1, borderColor: palette.line, borderRadius: 12,
    paddingHorizontal: space.md, paddingVertical: 10,
    fontSize: type.base, color: palette.ink,
  },
  modeRow:        { flexDirection: "row", gap: space.sm },
  modeBtn:        { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.bg, alignItems: "center" },
  modeBtnActive:  { backgroundColor: palette.brandLight, borderColor: palette.brand },
  modeBtnText:    { fontSize: type.xs, fontWeight: weight.semi, color: palette.muted },
  modeBtnTextActive: { color: palette.brand, fontWeight: weight.bold },
});
