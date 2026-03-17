import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getPartnerOnboardingStatus, partnerOnboarding } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { usePartnerStore } from "../../store/partnerStore";
import { Button } from "../../components/Button";
import { ErrorBanner } from "../../components/ErrorBanner";
import { palette, radius, space, type, weight } from "../../theme";

type Step = "shop" | "documents" | "bank" | "review" | "done";

const STEPS: { key: Step; label: string; icon: string }[] = [
  { key: "shop",      label: "ข้อมูลร้าน",   icon: "🏪" },
  { key: "documents", label: "เอกสาร",       icon: "📄" },
  { key: "bank",      label: "บัญชีธนาคาร", icon: "🏦" },
  { key: "review",    label: "ตรวจสอบ",      icon: "✅" },
];

const STEP_ORDER: Step[] = ["shop", "documents", "bank", "review", "done"];

function StepIndicator({ current }: { current: Step }) {
  const idx = STEP_ORDER.indexOf(current);
  return (
    <View style={stepStyles.container}>
      {STEPS.map((s, i) => {
        const done    = i < idx;
        const active  = s.key === current;
        return (
          <React.Fragment key={s.key}>
            <View style={stepStyles.step}>
              <View style={[stepStyles.circle, done && stepStyles.circleDone, active && stepStyles.circleActive]}>
                <Text style={[stepStyles.circleText, (done || active) && stepStyles.circleTextActive]}>
                  {done ? "✓" : String(i + 1)}
                </Text>
              </View>
              <Text style={[stepStyles.label, active && stepStyles.labelActive]} numberOfLines={1}>{s.label}</Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[stepStyles.line, done && stepStyles.lineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

type KycStatus = "pending" | "approved" | "rejected" | null;

function KycStatusBanner({ status, reason, onResubmit }: { status: KycStatus; reason?: string; onResubmit: () => void }) {
  if (!status || status === "approved") return null;

  const isPending  = status === "pending";
  const isRejected = status === "rejected";

  return (
    <View style={[kycBannerStyles.box, isRejected && kycBannerStyles.boxRejected]}>
      <Text style={kycBannerStyles.icon}>{isPending ? "⏳" : "❌"}</Text>
      <View style={kycBannerStyles.info}>
        <Text style={kycBannerStyles.title}>
          {isPending ? "อยู่ระหว่างการตรวจสอบ KYC" : "KYC ถูกปฏิเสธ"}
        </Text>
        {reason ? <Text style={kycBannerStyles.reason}>เหตุผล: {reason}</Text> : null}
        {isRejected && (
          <Pressable onPress={onResubmit} style={kycBannerStyles.resubmitBtn}>
            <Text style={kycBannerStyles.resubmitText}>ส่งเอกสารใหม่</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function OnboardingScreen({ navigation }: { navigation?: any }) {
  const { token } = useAuthStore();
  const { partnerId } = usePartnerStore();
  const [step, setStep]   = useState<Step>("shop");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // KYC status polling
  const [kycStatus, setKycStatus]   = useState<KycStatus>(null);
  const [kycReason, setKycReason]   = useState<string | undefined>(undefined);
  const [kycLoading, setKycLoading] = useState(false);

  const fetchKycStatus = useCallback(async () => {
    if (!token || !partnerId) return;
    setKycLoading(true);
    try {
      const res = await getPartnerOnboardingStatus(token, partnerId);
      setKycStatus(res.verification_status);
      setKycReason(res.rejection_reason);
    } catch {
      // silently ignore — KYC status is supplemental
    } finally {
      setKycLoading(false);
    }
  }, [token, partnerId]);

  useEffect(() => { fetchKycStatus(); }, [fetchKycStatus]);

  // Step 1 — Shop info
  const [shopName,    setShopName]    = useState("");
  const [shopPhone,   setShopPhone]   = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [shopZone,    setShopZone]    = useState("");

  // Step 2 — Documents (uri = local file selected by user)
  const [idUri,  setIdUri]  = useState<string | null>(null);
  const [bizUri, setBizUri] = useState<string | null>(null);

  // Step 3 — Bank
  const [bankName,    setBankName]    = useState("");
  const [accountNo,   setAccountNo]   = useState("");
  const [accountName, setAccountName] = useState("");

  const currentIdx = STEP_ORDER.indexOf(step);

  const goNext = () => {
    setError(null);
    if (step === "shop") {
      if (!shopName.trim())    { setError("กรุณาระบุชื่อร้าน"); return; }
      if (!shopPhone.trim())   { setError("กรุณาระบุเบอร์โทร"); return; }
      if (!shopAddress.trim()) { setError("กรุณาระบุที่อยู่"); return; }
      setStep("documents");
    } else if (step === "documents") {
      if (!idUri)  { setError("กรุณาอัปโหลดบัตรประชาชน"); return; }
      if (!bizUri) { setError("กรุณาอัปโหลดใบอนุญาตธุรกิจ"); return; }
      setStep("bank");
    } else if (step === "bank") {
      if (!bankName.trim())    { setError("กรุณาระบุชื่อธนาคาร"); return; }
      if (!accountNo.trim())   { setError("กรุณาระบุเลขบัญชี"); return; }
      if (!accountName.trim()) { setError("กรุณาระบุชื่อบัญชี"); return; }
      setStep("review");
    }
  };

  const goBack = () => {
    setError(null);
    const prev = STEP_ORDER[currentIdx - 1];
    if (prev && prev !== "done") setStep(prev);
  };

  const handleSubmit = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await partnerOnboarding(token);
      setKycStatus("pending");
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "ส่งข้อมูลไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const handleResubmit = () => {
    setIdUri(null);
    setBizUri(null);
    setKycStatus(null);
    setStep("documents");
  };

  if (step === "done") {
    const isApproved = kycStatus === "approved";
    const isRejected = kycStatus === "rejected";
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneContainer}>
          <Text style={styles.doneEmoji}>{isApproved ? "🎊" : isRejected ? "😢" : "🎉"}</Text>
          <Text style={styles.doneTitle}>
            {isApproved ? "อนุมัติแล้ว!" : isRejected ? "ถูกปฏิเสธ" : "ส่งข้อมูลสำเร็จแล้ว!"}
          </Text>
          <Text style={styles.doneSub}>
            {isApproved
              ? "บัญชีของคุณได้รับการอนุมัติแล้ว พร้อมรับงานได้เลย!"
              : isRejected
              ? `เอกสารไม่ผ่านการตรวจสอบ${kycReason ? `\nเหตุผล: ${kycReason}` : ""}`
              : "ทีมงานจะตรวจสอบเอกสารของคุณภายใน 1-3 วันทำการ\nคุณจะได้รับการแจ้งเตือนเมื่ออนุมัติ"}
          </Text>

          {!isApproved && !isRejected && (
            <View style={styles.doneStatus}>
              <Text style={styles.doneStatusIcon}>⏳</Text>
              <Text style={styles.doneStatusText}>รอการตรวจสอบ KYC</Text>
            </View>
          )}

          {isRejected && (
            <Button label="ส่งเอกสารใหม่" onPress={handleResubmit} fullWidth />
          )}

          {navigation && (
            <Button
              label="กลับหน้าหลัก"
              variant={isRejected ? "ghost" : "primary"}
              onPress={() => navigation.navigate("Dashboard")}
              fullWidth
            />
          )}

          {!isApproved && !isRejected && (
            <Pressable onPress={fetchKycStatus} style={styles.refreshStatus}>
              <Text style={styles.refreshStatusText}>🔄 รีเฟรชสถานะ</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>BarberGo Partner</Text>
          <Text style={styles.title}>สมัครเป็นพาร์ทเนอร์</Text>
        </View>

        <KycStatusBanner status={kycStatus} reason={kycReason} onResubmit={handleResubmit} />

        {/* Step indicator */}
        <StepIndicator current={step} />

        <ScrollView contentContainerStyle={styles.scroll}>
          {error && <ErrorBanner message={error} />}

          {step === "shop" && (
            <View style={styles.form}>
              <Text style={styles.stepTitle}>🏪 ข้อมูลร้าน</Text>
              <Text style={styles.stepSub}>กรอกข้อมูลร้านของคุณ</Text>

              <View style={styles.field}>
                <Text style={styles.label}>ชื่อร้าน *</Text>
                <TextInput
                  style={styles.input}
                  value={shopName}
                  onChangeText={setShopName}
                  placeholder="เช่น BarberShop Premium"
                  placeholderTextColor={palette.subtle}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>เบอร์โทร *</Text>
                <TextInput
                  style={styles.input}
                  value={shopPhone}
                  onChangeText={setShopPhone}
                  placeholder="0812345678"
                  placeholderTextColor={palette.subtle}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>ที่อยู่ร้าน *</Text>
                <TextInput
                  style={[styles.input, styles.inputMulti]}
                  value={shopAddress}
                  onChangeText={setShopAddress}
                  placeholder="เลขที่ ถนน แขวง เขต กรุงเทพฯ"
                  placeholderTextColor={palette.subtle}
                  multiline
                  numberOfLines={3}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>โซน</Text>
                <View style={styles.zoneRow}>
                  {["central", "north", "south", "east", "west"].map((z) => (
                    <Pressable
                      key={z}
                      style={[styles.zoneChip, shopZone === z && styles.zoneChipActive]}
                      onPress={() => setShopZone(z)}
                    >
                      <Text style={[styles.zoneChipText, shopZone === z && styles.zoneChipTextActive]}>
                        {z}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          )}

          {step === "documents" && (
            <View style={styles.form}>
              <Text style={styles.stepTitle}>📄 เอกสารยืนยันตัวตน</Text>
              <Text style={styles.stepSub}>อัปโหลดเอกสารเพื่อยืนยัน KYC</Text>

              <DocUploadRow
                icon="🪪"
                title="บัตรประชาชน"
                subtitle="ด้านหน้าและด้านหลัง"
                uri={idUri}
                onUpload={() => pickImage(setIdUri)}
              />
              <DocUploadRow
                icon="📋"
                title="ใบอนุญาตประกอบธุรกิจ"
                subtitle="ใบทะเบียนพาณิชย์ หรือ DBD"
                uri={bizUri}
                onUpload={() => pickImage(setBizUri)}
              />

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  📌 เอกสารทั้งหมดจะถูกเข้ารหัสและเก็บอย่างปลอดภัย
                  ใช้เพื่อการยืนยันตัวตนเท่านั้น
                </Text>
              </View>
            </View>
          )}

          {step === "bank" && (
            <View style={styles.form}>
              <Text style={styles.stepTitle}>🏦 บัญชีธนาคาร</Text>
              <Text style={styles.stepSub}>บัญชีสำหรับรับการโอนเงิน</Text>

              <View style={styles.field}>
                <Text style={styles.label}>ธนาคาร *</Text>
                <View style={styles.bankRow}>
                  {["กสิกรไทย", "กรุงเทพ", "ไทยพาณิชย์", "กรุงไทย"].map((b) => (
                    <Pressable
                      key={b}
                      style={[styles.bankChip, bankName === b && styles.bankChipActive]}
                      onPress={() => setBankName(b)}
                    >
                      <Text style={[styles.bankChipText, bankName === b && styles.bankChipTextActive]}>{b}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>เลขบัญชี *</Text>
                <TextInput
                  style={styles.input}
                  value={accountNo}
                  onChangeText={setAccountNo}
                  placeholder="000-0-00000-0"
                  placeholderTextColor={palette.subtle}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>ชื่อบัญชี *</Text>
                <TextInput
                  style={styles.input}
                  value={accountName}
                  onChangeText={setAccountName}
                  placeholder="ชื่อ-นามสกุล ตามสมุดบัญชี"
                  placeholderTextColor={palette.subtle}
                />
              </View>
            </View>
          )}

          {step === "review" && (
            <View style={styles.form}>
              <Text style={styles.stepTitle}>✅ ตรวจสอบข้อมูล</Text>
              <Text style={styles.stepSub}>กรุณาตรวจสอบก่อนส่ง</Text>

              <ReviewRow icon="🏪" label="ชื่อร้าน"       value={shopName} />
              <ReviewRow icon="📞" label="เบอร์โทร"        value={shopPhone} />
              <ReviewRow icon="📍" label="ที่อยู่"         value={shopAddress} />
              {shopZone ? <ReviewRow icon="🗺" label="โซน" value={shopZone} /> : null}
              <ReviewRow icon="🪪" label="บัตรประชาชน"   value={idUri  ? "อัปโหลดแล้ว ✓" : "ยังไม่อัปโหลด"} />
              <ReviewRow icon="📋" label="ใบอนุญาต"       value={bizUri ? "อัปโหลดแล้ว ✓" : "ยังไม่อัปโหลด"} />
              <ReviewRow icon="🏦" label="ธนาคาร"          value={bankName} />
              <ReviewRow icon="💳" label="เลขบัญชี"        value={accountNo} />
              <ReviewRow icon="👤" label="ชื่อบัญชี"       value={accountName} />

              <View style={styles.termsBox}>
                <Text style={styles.termsText}>
                  การกด "ส่งใบสมัคร" ถือว่าคุณยอมรับ{" "}
                  <Text style={styles.termsLink}>ข้อกำหนดการให้บริการ</Text>
                  {" "}และ{" "}
                  <Text style={styles.termsLink}>นโยบายความเป็นส่วนตัว</Text>
                  {" "}ของ BarberGo
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom nav */}
        <View style={styles.bottomNav}>
          {currentIdx > 0 && (
            <Button label="ย้อนกลับ" variant="ghost" onPress={goBack} style={{ flex: 1 }} />
          )}
          {step !== "review" ? (
            <Button label="ถัดไป →" onPress={goNext} style={{ flex: 2 }} />
          ) : (
            <Button label="ส่งใบสมัคร" onPress={handleSubmit} loading={saving} style={{ flex: 2 }} />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

async function pickImage(setUri: (uri: string) => void) {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("ต้องการสิทธิ์", "กรุณาอนุญาตให้แอปเข้าถึงรูปภาพในการตั้งค่า");
    return;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
    allowsEditing: true,
    aspect: [4, 3],
  });
  if (!result.canceled && result.assets[0]) {
    setUri(result.assets[0].uri);
  }
}

function DocUploadRow({
  icon, title, subtitle, uri, onUpload,
}: {
  icon: string; title: string; subtitle: string; uri: string | null; onUpload: () => void;
}) {
  return (
    <View style={docStyles.row}>
      <Text style={docStyles.icon}>{icon}</Text>
      <View style={docStyles.info}>
        <Text style={docStyles.title}>{title}</Text>
        <Text style={docStyles.subtitle}>{subtitle}</Text>
      </View>
      {uri ? (
        <Pressable onPress={onUpload} style={docStyles.thumbWrap}>
          <Image source={{ uri }} style={docStyles.thumb} />
          <View style={docStyles.thumbOverlay}>
            <Text style={docStyles.thumbCheck}>✓</Text>
          </View>
        </Pressable>
      ) : (
        <Pressable style={docStyles.btn} onPress={onUpload}>
          <Text style={docStyles.btnText}>อัปโหลด</Text>
        </Pressable>
      )}
    </View>
  );
}

function ReviewRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={reviewStyles.row}>
      <Text style={reviewStyles.icon}>{icon}</Text>
      <Text style={reviewStyles.label}>{label}</Text>
      <Text style={reviewStyles.value} numberOfLines={1}>{value || "—"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: palette.bg },
  header: { paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.sm },
  eyebrow:{ fontSize: type.xs, color: palette.brand, fontWeight: weight.bold, textTransform: "uppercase", letterSpacing: 1 },
  title:  { fontSize: type.xl, fontWeight: weight.black, color: palette.ink },

  scroll: { paddingHorizontal: space.lg, paddingBottom: 16 },
  form:   { gap: space.md },
  stepTitle: { fontSize: type.lg, fontWeight: weight.black, color: palette.ink },
  stepSub:   { fontSize: type.sm, color: palette.muted, marginTop: -8 },

  field:       { gap: 6 },
  label:       { fontSize: type.sm, fontWeight: weight.semi, color: palette.body },
  input: {
    borderWidth: 1, borderColor: palette.line, borderRadius: 12,
    paddingHorizontal: space.md, paddingVertical: 12,
    fontSize: type.base, color: palette.ink,
    backgroundColor: palette.card,
  },
  inputMulti:  { minHeight: 80, textAlignVertical: "top" },

  zoneRow:         { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  zoneChip:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.card },
  zoneChipActive:  { backgroundColor: palette.brandLight, borderColor: palette.brand },
  zoneChipText:    { fontSize: type.xs, fontWeight: weight.semi, color: palette.muted },
  zoneChipTextActive: { color: palette.brand, fontWeight: weight.bold },

  bankRow:        { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  bankChip:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.lg, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.card },
  bankChipActive: { backgroundColor: palette.brandLight, borderColor: palette.brand },
  bankChipText:   { fontSize: type.sm, color: palette.muted, fontWeight: weight.semi },
  bankChipTextActive: { color: palette.brand, fontWeight: weight.bold },

  infoBox:  { backgroundColor: "#eff6ff", borderRadius: 12, padding: space.md, borderWidth: 1, borderColor: "#bfdbfe" },
  infoText: { fontSize: type.xs, color: "#1d4ed8", lineHeight: 18 },

  termsBox:  { backgroundColor: palette.card, borderRadius: 12, padding: space.md, borderWidth: 1, borderColor: palette.line },
  termsText: { fontSize: type.xs, color: palette.muted, lineHeight: 18 },
  termsLink: { color: palette.brand, fontWeight: weight.semi },

  bottomNav: { flexDirection: "row", gap: space.md, padding: space.lg, paddingTop: space.sm, borderTopWidth: 1, borderTopColor: palette.line, backgroundColor: palette.card },

  doneContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: space.xl, gap: space.lg },
  doneEmoji:     { fontSize: 64 },
  doneTitle:     { fontSize: type.xxl, fontWeight: weight.black, color: palette.ink, textAlign: "center" },
  doneSub:       { fontSize: type.base, color: palette.muted, textAlign: "center", lineHeight: 24 },
  doneStatus: {
    flexDirection: "row", alignItems: "center", gap: space.sm,
    backgroundColor: "#fef3c7", borderRadius: 12,
    paddingHorizontal: space.lg, paddingVertical: space.md,
    borderWidth: 1, borderColor: "#fde68a",
  },
  doneStatusIcon: { fontSize: 20 },
  doneStatusText: { fontSize: type.base, fontWeight: weight.bold, color: "#92400e" },
  refreshStatus:     { paddingVertical: space.sm },
  refreshStatusText: { fontSize: type.sm, color: palette.brand, fontWeight: weight.semi },
});

const kycBannerStyles = StyleSheet.create({
  box: {
    flexDirection: "row", alignItems: "flex-start", gap: space.md,
    marginHorizontal: space.lg, marginBottom: space.sm,
    backgroundColor: "#fef3c7", borderRadius: 14,
    padding: space.md, borderWidth: 1, borderColor: "#fde68a",
  },
  boxRejected: { backgroundColor: "#fee2e2", borderColor: "#fca5a5" },
  icon:        { fontSize: 24, marginTop: 2 },
  info:        { flex: 1, gap: 6 },
  title:       { fontSize: type.base, fontWeight: weight.bold, color: palette.ink },
  reason:      { fontSize: type.xs, color: palette.muted },
  resubmitBtn: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, backgroundColor: palette.brand, borderRadius: 8 },
  resubmitText:{ fontSize: type.xs, fontWeight: weight.bold, color: "#fff" },
});

const stepStyles = StyleSheet.create({
  container:     { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: space.lg, paddingVertical: space.md },
  step:          { alignItems: "center", gap: 4, flex: 1 },
  circle:        { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: palette.line, backgroundColor: palette.card, justifyContent: "center", alignItems: "center" },
  circleDone:    { backgroundColor: palette.success, borderColor: palette.success },
  circleActive:  { backgroundColor: palette.brand, borderColor: palette.brand },
  circleText:    { fontSize: 11, fontWeight: weight.bold, color: palette.muted },
  circleTextActive: { color: "#fff" },
  label:         { fontSize: 9, color: palette.muted, textAlign: "center" },
  labelActive:   { color: palette.brand, fontWeight: weight.bold },
  line:          { flex: 1, height: 2, backgroundColor: palette.line, marginTop: 14 },
  lineDone:      { backgroundColor: palette.success },
});

const docStyles = StyleSheet.create({
  row:      { flexDirection: "row", alignItems: "center", gap: space.md, backgroundColor: palette.card, borderRadius: radius.lg, borderWidth: 1, borderColor: palette.line, padding: space.md },
  icon:     { fontSize: 28 },
  info:     { flex: 1, gap: 2 },
  title:    { fontSize: type.base, fontWeight: weight.bold, color: palette.ink },
  subtitle: { fontSize: type.xs, color: palette.muted },
  btn:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: palette.brandLight, borderWidth: 1, borderColor: palette.brand },
  btnText:      { fontSize: type.xs, fontWeight: weight.bold, color: palette.brand },
  thumbWrap:    { width: 56, height: 56, borderRadius: 8, overflow: "hidden", position: "relative" },
  thumb:        { width: 56, height: 56 },
  thumbOverlay: { position: "absolute", inset: 0, backgroundColor: "rgba(22,163,74,0.55)", justifyContent: "center", alignItems: "center" },
  thumbCheck:   { fontSize: 22, color: "#fff", fontWeight: weight.black },
});

const reviewStyles = StyleSheet.create({
  row:   { flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: palette.line },
  icon:  { fontSize: 18, width: 24, textAlign: "center" },
  label: { fontSize: type.sm, color: palette.muted, width: 90 },
  value: { flex: 1, fontSize: type.sm, fontWeight: weight.semi, color: palette.ink, textAlign: "right" },
});
