import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { Linking, SafeAreaView, ScrollView, Text, View } from "react-native";
import { ActionButton } from "./src/components/ActionButton";
import { StatTile } from "./src/components/StatTile";
import {
  API_BASE_URL,
  checkoutBooking,
  getAdminSnapshot,
  getAvailability,
  getCustomerHistory,
  getNearbyShops,
  getPartnerQueue,
  login,
  quoteBooking,
  transitionPartnerBooking
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
  const [adminSnapshot, setAdminSnapshot] = useState<Record<string, unknown> | null>(null);
  const [search, setSearch] = useState("");

  const selectedShop = shops.find((shop) => shop.id === selectedShopId) ?? null;
  const selectedServiceId = selectedShop?.services[0]?.id ?? "svc_1";
  const selectedBranchId = selectedShop?.branches?.[0]?.id ?? "branch_1";

  const filteredShops = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return shops;
    return shops.filter((shop) => shop.name.toLowerCase().includes(q));
  }, [search, shops]);

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
      const data = await getAvailability({
        shopId: selectedShopId,
        branchId: selectedBranchId,
        serviceId: selectedServiceId
      });
      setSlots(data.slots);
      setStatus(`Loaded ${data.slots.length} slots`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load availability failed");
    }
  }

  async function quoteAndCheckout(): Promise<void> {
    if (!token || !selectedShopId) return;
    setError("");
    try {
      const quote = await quoteBooking(token, selectedShopId, selectedServiceId);
      const slot = slots[0] ?? "2026-02-20T10:00:00.000Z";
      await checkoutBooking({
        token,
        shopId: selectedShopId,
        branchId: selectedBranchId,
        serviceId: selectedServiceId,
        slotAt: slot
      });
      setStatus(`Checkout complete (${quote.total} THB)`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
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

  async function loadQueue(): Promise<void> {
    if (!token) return;
    setError("");
    try {
      const data = await getPartnerQueue(token);
      setQueue(data.data);
      setStatus(`Loaded ${data.data.length} incoming bookings`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load queue failed");
    }
  }

  async function transitionFirst(action: "confirm" | "start" | "complete"): Promise<void> {
    if (!token || queue.length === 0) return;
    setError("");
    try {
      const firstId = queue[0].id;
      await transitionPartnerBooking(token, firstId, action);
      setStatus(`${action} succeeded for ${firstId}`);
      await loadQueue();
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus(`${action} failed`);
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
            onLoadAvailability={loadAvailability}
            onQuoteCheckout={quoteAndCheckout}
            onLoadHistory={loadHistory}
          />
        ) : null}

        {tab === "partner" ? (
          <PartnerScreen
            queue={queue}
            onLoadQueue={loadQueue}
            onConfirmFirst={() => transitionFirst("confirm")}
            onStartFirst={() => transitionFirst("start")}
            onCompleteFirst={() => transitionFirst("complete")}
          />
        ) : null}

        {tab === "admin" ? <AdminScreen snapshot={adminSnapshot} onLoadSnapshot={loadSnapshot} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}
