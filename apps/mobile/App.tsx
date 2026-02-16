import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { Linking, SafeAreaView, ScrollView, Text, View } from "react-native";
import { ActionButton } from "./src/components/ActionButton";
import { StatTile } from "./src/components/StatTile";
import {
  API_BASE_URL,
  createDispute,
  createPartnerBranch,
  createPartnerService,
  createPartnerStaff,
  checkoutBooking,
  getAdminSnapshot,
  getAvailability,
  getCustomerHistory,
  getNearbyShops,
  getPartnerOnboardingStatus,
  getPartnerQueue,
  getPartnerWallet,
  getShopDetail,
  login,
  partnerOnboarding,
  postServiceFeedback,
  quoteBooking,
  registerMobileDeviceToken,
  transitionPartnerBooking
  ,
  withdrawPartnerWallet
} from "./src/lib/api";
import { parseRoleFromUrl } from "./src/lib/deeplink";
import { registerForPushNotificationsAsync } from "./src/lib/notifications";
import type { Booking, Role, Shop } from "./src/lib/types";
import { AdminScreen } from "./src/screens/AdminScreen";
import { CustomerScreen } from "./src/screens/CustomerScreen";
import { PartnerScreen } from "./src/screens/PartnerScreen";
import { appStyles } from "./src/theme";

type MobileTab = "customer" | "partner" | "admin";

export default function App(): React.ReactElement {
  const [tab, setTab] = useState<MobileTab>("customer");
  const [role, setRole] = useState<Role>("customer");
  const [token, setToken] = useState("");
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState("");
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [history, setHistory] = useState<Booking[]>([]);
  const [queue, setQueue] = useState<Booking[]>([]);
  const [activePartnerBookingId, setActivePartnerBookingId] = useState("");
  const [adminSnapshot, setAdminSnapshot] = useState<Record<string, unknown> | null>(null);
  const [adminDisputes, setAdminDisputes] = useState<unknown>(null);
  const [adminPolicy, setAdminPolicy] = useState<unknown>(null);
  const [walletSummary, setWalletSummary] = useState<unknown>(null);
  const [onboardingStatus, setOnboardingStatus] = useState<unknown>(null);
  const [partnerOnboardingId, setPartnerOnboardingId] = useState("partner_1");
  const [search, setSearch] = useState("");

  const selectedShop = shops.find((shop) => shop.id === selectedShopId) ?? null;
  const selectedServiceId = selectedShop?.services[0]?.id ?? "svc_1";
  const selectedBranchId = selectedShop?.branches?.[0]?.id ?? "branch_1";

  const filteredShops = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return shops;
    return shops.filter((shop) => shop.name.toLowerCase().includes(q));
  }, [search, shops]);

  function toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  async function findAvailabilityWithinDays(days: number): Promise<{ date: string; slots: string[] }> {
    for (let offset = 1; offset <= days; offset += 1) {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      const date = toIsoDate(d);
      const data = await getAvailability({
        shopId: selectedShopId,
        branchId: selectedBranchId,
        serviceId: selectedServiceId,
        date
      });
      if (data.slots.length > 0) {
        return { date, slots: data.slots };
      }
    }
    return { date: "", slots: [] };
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then((value) => {
      setPushToken(value);
    });
  }, []);

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (!url) return;
      const parsed = parseRoleFromUrl(url);
      if (parsed) {
        setTab(parsed);
      }
    });
    const subscription = Linking.addEventListener("url", ({ url }) => {
      const parsed = parseRoleFromUrl(url);
      if (parsed) {
        setTab(parsed);
      }
    });
    return () => subscription.remove();
  }, []);

  async function doLogin(nextRole: Role): Promise<void> {
    setError("");
    try {
      setStatus(`Signing in as ${nextRole}...`);
      const nextToken = await login(nextRole);
      setRole(nextRole);
      setTab(nextRole);
      setToken(nextToken);
      if (pushToken) {
        const userId = nextRole === "admin" ? "admin_1" : nextRole === "partner" ? "partner_1" : "cust_1";
        await registerMobileDeviceToken({ token: nextToken, role: nextRole, userId, deviceToken: pushToken });
      }
      setStatus(`Logged in as ${nextRole}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Login failed");
    }
  }

  async function loadShops(): Promise<void> {
    if (!token) return;
    setError("");
    try {
      const data = await getNearbyShops();
      setShops(data.data);
      setSelectedShopId(data.data[0]?.id ?? "");
      setStatus(`Loaded ${data.data.length} shops`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load shops failed");
    }
  }

  async function loadAvailability(): Promise<void> {
    if (!token || !selectedShopId) return;
    setError("");
    try {
      const found = await findAvailabilityWithinDays(7);
      setSlots(found.slots);
      if (found.slots.length > 0) {
        setStatus(`Loaded ${found.slots.length} slots on ${found.date}`);
      } else {
        setStatus("Loaded 0 slots for next 7 days");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load availability failed");
    }
  }

  async function loadShopDetail(): Promise<void> {
    if (!token || !selectedShopId) return;
    setError("");
    try {
      const data = await getShopDetail(selectedShopId);
      setStatus(`Loaded detail for ${data.name}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load shop detail failed");
    }
  }

  async function quoteAndCheckout(): Promise<void> {
    if (!token || !selectedShopId) return;
    setError("");
    try {
      const quote = await quoteBooking(token, selectedShopId, selectedServiceId);
      const found = await findAvailabilityWithinDays(7);
      setSlots(found.slots);
      const slot = found.slots[0];
      if (!slot) {
        setStatus("No slot available in next 7 days. Please retry later.");
        return;
      }
      await checkoutBooking({
        token,
        shopId: selectedShopId,
        branchId: selectedBranchId,
        serviceId: selectedServiceId,
        slotAt: slot
      });
      setStatus(`Checkout complete (${quote.total} THB) at ${slot}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      if (message.includes("SLOT_CONFLICT")) {
        try {
          const refreshedAvailability = await findAvailabilityWithinDays(7);
          setSlots(refreshedAvailability.slots);
          setStatus(
            refreshedAvailability.slots.length > 0
              ? "Selected slot was taken. Slots refreshed, please retry checkout."
              : "Selected slot was taken and no slots remain in next 7 days."
          );
          return;
        } catch {
          setStatus("Slot conflict and refresh failed. Please load availability again.");
          return;
        }
      }
      setStatus("Checkout failed");
    }
  }

  async function loadHistory(): Promise<void> {
    if (!token) return;
    setError("");
    try {
      const data = await getCustomerHistory(token);
      setHistory(data.data);
      setStatus(`Loaded ${data.data.length} bookings`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load history failed");
    }
  }

  async function submitPostService(): Promise<void> {
    if (!token || history.length === 0) return;
    setError("");
    try {
      await postServiceFeedback(token, history[0].id);
      setStatus(`Post-service submitted for ${history[0].id}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Post-service failed");
    }
  }

  async function submitDispute(): Promise<void> {
    if (!token) return;
    setError("");
    try {
      let latestHistory = history;
      if (latestHistory.length === 0) {
        const historyResult = await getCustomerHistory(token);
        latestHistory = historyResult.data;
        setHistory(historyResult.data);
      }

      const disputable = latestHistory.find(
        (booking) => booking.status === "completed" || booking.status === "started" || booking.status === "confirmed"
      );
      if (!disputable) {
        setStatus("No completed/started/confirmed booking available for dispute.");
        return;
      }

      await createDispute(token, disputable.id);
      setStatus(`Dispute created for ${disputable.id}`);
      await loadHistory();
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus(`Create dispute failed: ${message}`);
    }
  }

  async function loadQueue(): Promise<void> {
    if (!token) return;
    setError("");
    try {
      const data = await getPartnerQueue(token);
      setQueue(data.data);
      if (!activePartnerBookingId && data.data.length > 0) {
        setActivePartnerBookingId(data.data[0].id);
      }
      if (data.data.length === 0 && activePartnerBookingId) {
        setActivePartnerBookingId("");
      }
      setStatus(`Loaded ${data.data.length} incoming bookings`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load queue failed");
    }
  }

  async function transitionFirst(action: "confirm" | "start" | "complete"): Promise<void> {
    if (!token) return;
    setError("");
    try {
      let bookingId = "";
      if (action === "confirm") {
        bookingId = queue.find((booking) => booking.status === "authorized")?.id ?? "";
        if (!bookingId) {
          setStatus("No authorized booking to confirm.");
          return;
        }
      } else {
        bookingId = activePartnerBookingId;
        if (!bookingId) {
          setStatus("No active booking. Please confirm one booking first.");
          return;
        }
      }

      await transitionPartnerBooking(token, bookingId, action);
      if (action === "confirm") {
        setActivePartnerBookingId(bookingId);
      }
      if (action === "complete") {
        setActivePartnerBookingId("");
      }
      setStatus(`${action} succeeded for ${bookingId}`);
      await loadQueue();
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      if (
        action === "start" &&
        message.includes("BOOKING_INVALID_TRANSITION") &&
        message.includes("authorized to started")
      ) {
        try {
          await transitionPartnerBooking(token, bookingId, "confirm");
          await transitionPartnerBooking(token, bookingId, "start");
          setActivePartnerBookingId(bookingId);
          setStatus(`start succeeded for ${bookingId} (auto-confirmed first)`);
          await loadQueue();
          return;
        } catch (nested) {
          const nestedMessage = nested instanceof Error ? nested.message : "unknown error";
          setError(nestedMessage);
          setStatus(`start failed after auto-confirm: ${nestedMessage}`);
          return;
        }
      }
      setError(message);
      setStatus(`${action} failed: ${message}`);
    }
  }

  async function startOnboarding(): Promise<void> {
    if (!token) return;
    setError("");
    try {
      const data = await partnerOnboarding(token);
      setPartnerOnboardingId(data.partner_id);
      setStatus(`Partner onboarding started: ${data.partner_id}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Start onboarding failed");
    }
  }

  async function loadOnboardingStatus(): Promise<void> {
    if (!token) return;
    setError("");
    try {
      const data = await getPartnerOnboardingStatus(token, partnerOnboardingId);
      setOnboardingStatus(data);
      setStatus("Onboarding status loaded");
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load onboarding status failed");
    }
  }

  async function createBranch(): Promise<void> {
    if (!token) return;
    setError("");
    try {
      await createPartnerBranch(token);
      setStatus("Partner branch created");
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Create branch failed");
    }
  }

  async function createService(): Promise<void> {
    if (!token) return;
    setError("");
    try {
      await createPartnerService(token);
      setStatus("Partner service created");
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Create service failed");
    }
  }

  async function createStaff(): Promise<void> {
    if (!token) return;
    setError("");
    try {
      await createPartnerStaff(token);
      setStatus("Partner staff created");
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Create staff failed");
    }
  }

  async function loadWallet(): Promise<void> {
    if (!token) return;
    setError("");
    try {
      const data = await getPartnerWallet(token);
      setWalletSummary(data);
      setStatus("Wallet loaded");
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load wallet failed");
    }
  }

  async function withdrawWallet(): Promise<void> {
    if (!token) return;
    setError("");
    try {
      await withdrawPartnerWallet(token);
      setStatus("Withdraw requested");
      await loadWallet();
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Withdraw failed");
    }
  }

  async function loadSnapshot(): Promise<void> {
    if (!token) return;
    setError("");
    try {
      const data = await getAdminSnapshot(token);
      setAdminSnapshot(data);
      setStatus("Admin snapshot loaded");
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Admin load failed");
    }
  }

  async function loadDisputes(): Promise<void> {
    if (!token) return;
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/disputes`, {
        headers: { authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAdminDisputes(data);
      setStatus("Admin disputes loaded");
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load disputes failed");
    }
  }

  async function loadPolicy(): Promise<void> {
    if (!token) return;
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/policy`, {
        headers: { authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAdminPolicy(data);
      setStatus("Admin policy loaded");
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load policy failed");
    }
  }

  return (
    <SafeAreaView style={appStyles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={appStyles.container}>
        <Text style={appStyles.eyebrow}>BarberGo Mobile</Text>
        <Text style={appStyles.title}>Phase 8 App Shell</Text>
        <Text style={appStyles.subtitle}>API: {API_BASE_URL}</Text>
        <Text style={appStyles.subtitle}>Push Token: {pushToken ? `${pushToken.slice(0, 30)}...` : "not granted"}</Text>

        <View style={appStyles.section}>
          <Text style={appStyles.sectionTitle}>Session + Navigation</Text>
          <View style={appStyles.row}>
            <ActionButton label="Login Customer" onPress={() => doLogin("customer")} />
            <ActionButton label="Login Partner" onPress={() => doLogin("partner")} />
            <ActionButton label="Login Admin" onPress={() => doLogin("admin")} />
          </View>
          <View style={appStyles.row}>
            <ActionButton label="Customer Tab" onPress={() => setTab("customer")} />
            <ActionButton label="Partner Tab" onPress={() => setTab("partner")} />
            <ActionButton label="Admin Tab" onPress={() => setTab("admin")} />
          </View>
          <Text style={appStyles.meta}>Role: {role}</Text>
          <Text style={appStyles.meta}>Tab: {tab}</Text>
          <Text style={appStyles.meta}>Token: {token ? `${token.slice(0, 24)}...` : "-"}</Text>
          <Text style={appStyles.meta}>Deep Link Example: barbergo://partner</Text>
          <Text style={appStyles.meta}>Status: {status}</Text>
          {error ? <Text style={appStyles.error}>{error}</Text> : null}
        </View>

        <View style={appStyles.statsGrid}>
          <StatTile label="Shops" value={shops.length} />
          <StatTile label="Slots" value={slots.length} />
          <StatTile label="History" value={history.length} />
          <StatTile label="Queue" value={queue.length} />
          <StatTile label="Active booking" value={activePartnerBookingId || "-"} />
        </View>

        {tab === "customer" ? (
          <CustomerScreen
            search={search}
            setSearch={setSearch}
            filteredShops={filteredShops}
            selectedShopId={selectedShopId}
            setSelectedShopId={setSelectedShopId}
            history={history}
            onLoadShops={loadShops}
            onLoadDetail={loadShopDetail}
            onLoadAvailability={loadAvailability}
            onQuoteCheckout={quoteAndCheckout}
            onLoadHistory={loadHistory}
            onPostService={submitPostService}
            onCreateDispute={submitDispute}
          />
        ) : null}

        {tab === "partner" ? (
          <PartnerScreen
            queue={queue}
            onLoadQueue={loadQueue}
            onConfirmFirst={() => transitionFirst("confirm")}
            onStartFirst={() => transitionFirst("start")}
            onCompleteFirst={() => transitionFirst("complete")}
            onboardingStatus={onboardingStatus}
            walletSummary={walletSummary}
            onStartOnboarding={startOnboarding}
            onLoadOnboardingStatus={loadOnboardingStatus}
            onCreateBranch={createBranch}
            onCreateService={createService}
            onCreateStaff={createStaff}
            onLoadWallet={loadWallet}
            onWithdraw={withdrawWallet}
          />
        ) : null}

        {tab === "admin" ? (
          <AdminScreen
            snapshot={adminSnapshot}
            disputes={adminDisputes}
            policy={adminPolicy}
            onLoadSnapshot={loadSnapshot}
            onLoadDisputes={loadDisputes}
            onLoadPolicy={loadPolicy}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
