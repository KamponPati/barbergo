import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

type Role = "customer" | "partner" | "admin";

type Shop = {
  id: string;
  name: string;
  rating: number;
  services: Array<{ id: string; name: string; price: number }>;
  branches?: Array<{ id: string; name: string }>;
};

type Booking = {
  id: string;
  status: string;
  amount: number;
  slot_at: string;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://172.23.11.144:3000/api/v1";

async function request<T>(
  path: string,
  options?: { method?: "GET" | "POST"; token?: string; body?: unknown }
): Promise<T> {
  const method = options?.method ?? "GET";
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(options?.token ? { authorization: `Bearer ${options.token}` } : {}),
      ...(method !== "GET"
        ? { "Idempotency-Key": `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }
        : {})
    },
    body: options?.body ? JSON.stringify(options.body) : undefined
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return (await res.json()) as T;
}

async function login(role: Role): Promise<string> {
  const userId = role === "admin" ? "admin_1" : role === "partner" ? "partner_1" : "cust_1";
  const data = await request<{ access_token: string }>("/auth/login", {
    method: "POST",
    body: { user_id: userId, role }
  });
  return data.access_token;
}

function ActionButton({
  label,
  onPress,
  disabled
}: {
  label: string;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
}): React.ReactElement {
  return (
    <Pressable onPress={() => void onPress()} disabled={disabled} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, disabled && styles.buttonDisabled]}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }): React.ReactElement {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function App(): React.ReactElement {
  const [role, setRole] = useState<Role>("customer");
  const [token, setToken] = useState("");
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

  async function doLogin(nextRole: Role): Promise<void> {
    setError("");
    try {
      setStatus(`Signing in as ${nextRole}...`);
      const nextToken = await login(nextRole);
      setRole(nextRole);
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
      const data = await request<{ data: Shop[] }>("/discovery/nearby?sort=rating_desc");
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
      const data = await request<{ slots: string[] }>(
        `/discovery/shops/${selectedShopId}/availability?branch_id=${selectedBranchId}&service_id=${selectedServiceId}&date=2026-02-20`
      );
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
      const quote = await request<{ subtotal: number; total: number }>("/customer/bookings/quote", {
        method: "POST",
        token,
        body: {
          customer_id: "cust_1",
          shop_id: selectedShopId,
          service_id: selectedServiceId
        }
      });
      const slot = slots[0] ?? "2026-02-20T10:00:00.000Z";
      await request("/customer/bookings/checkout", {
        method: "POST",
        token,
        body: {
          customer_id: "cust_1",
          shop_id: selectedShopId,
          branch_id: selectedBranchId,
          service_id: selectedServiceId,
          slot_at: slot,
          payment_method: "card"
        }
      });
      setStatus(`Checkout complete (${quote.total} THB)`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Checkout failed");
    }
  }

  async function loadCustomerHistory(): Promise<void> {
    if (!token) return;
    setError("");
    try {
      const data = await request<{ data: Booking[] }>("/customer/bookings/cust_1", { token });
      setHistory(data.data);
      setStatus(`Loaded ${data.data.length} bookings`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load history failed");
    }
  }

  async function loadPartnerQueue(): Promise<void> {
    if (!token) return;
    setError("");
    try {
      const data = await request<{ data: Booking[] }>("/partner/bookings/incoming/partner_1", { token });
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
      await request(`/partner/bookings/${firstId}/${action}`, { method: "POST", token });
      setStatus(`${action} succeeded for ${firstId}`);
      await loadPartnerQueue();
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus(`${action} failed`);
    }
  }

  async function loadAdminSnapshot(): Promise<void> {
    if (!token) return;
    setError("");
    try {
      const [zone, economics, advanced] = await Promise.all([
        request("/admin/scale/zone-gates/evaluate", { token }),
        request("/admin/scale/unit-economics", { token }),
        request("/admin/analytics/advanced", { token })
      ]);
      setAdminSnapshot({ zone, economics, advanced });
      setStatus("Admin snapshot loaded");
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Admin load failed");
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>BarberGo Mobile</Text>
        <Text style={styles.title}>Phase 8 App Shell</Text>
        <Text style={styles.subtitle}>API: {API_BASE_URL}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session</Text>
          <View style={styles.row}>
            <ActionButton label="Customer" onPress={() => doLogin("customer")} />
            <ActionButton label="Partner" onPress={() => doLogin("partner")} />
            <ActionButton label="Admin" onPress={() => doLogin("admin")} />
          </View>
          <Text style={styles.meta}>Role: {role}</Text>
          <Text style={styles.meta}>Token: {token ? `${token.slice(0, 24)}...` : "-"}</Text>
          <Text style={styles.meta}>Status: {status}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <View style={styles.statsGrid}>
          <StatTile label="Shops" value={shops.length} />
          <StatTile label="Slots" value={slots.length} />
          <StatTile label="History" value={history.length} />
          <StatTile label="Queue" value={queue.length} />
        </View>

        {role === "customer" ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Mobile Core</Text>
            <TextInput
              style={styles.input}
              value={search}
              onChangeText={setSearch}
              placeholder="Search shops"
              placeholderTextColor="#64748b"
            />
            <View style={styles.pillRow}>
              {filteredShops.slice(0, 8).map((shop) => (
                <Pressable
                  key={shop.id}
                  style={[styles.pill, shop.id === selectedShopId && styles.pillActive]}
                  onPress={() => setSelectedShopId(shop.id)}
                >
                  <Text style={styles.pillText}>{shop.name}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.row}>
              <ActionButton label="Load Shops" onPress={loadShops} />
              <ActionButton label="Availability" onPress={loadAvailability} disabled={!selectedShopId} />
              <ActionButton label="Quote + Checkout" onPress={quoteAndCheckout} disabled={!selectedShopId} />
              <ActionButton label="History" onPress={loadCustomerHistory} />
            </View>
            {history.slice(0, 5).map((booking) => (
              <View key={booking.id} style={styles.card}>
                <Text style={styles.cardTitle}>{booking.id}</Text>
                <Text style={styles.cardMeta}>{booking.status}</Text>
                <Text style={styles.cardMeta}>{booking.amount} THB</Text>
              </View>
            ))}
          </View>
        ) : null}

        {role === "partner" ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Partner Mobile Core</Text>
            <View style={styles.row}>
              <ActionButton label="Load Queue" onPress={loadPartnerQueue} />
              <ActionButton label="Confirm First" onPress={() => transitionFirst("confirm")} disabled={queue.length === 0} />
              <ActionButton label="Start First" onPress={() => transitionFirst("start")} disabled={queue.length === 0} />
              <ActionButton label="Complete First" onPress={() => transitionFirst("complete")} disabled={queue.length === 0} />
            </View>
            {queue.slice(0, 6).map((booking) => (
              <View key={booking.id} style={styles.card}>
                <Text style={styles.cardTitle}>{booking.id}</Text>
                <Text style={styles.cardMeta}>Status: {booking.status}</Text>
                <Text style={styles.cardMeta}>Slot: {booking.slot_at}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {role === "admin" ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Mobile Core</Text>
            <View style={styles.row}>
              <ActionButton label="Load Snapshot" onPress={loadAdminSnapshot} />
            </View>
            <View style={styles.codeWrap}>
              <Text style={styles.code}>{JSON.stringify(adminSnapshot ?? { empty: true }, null, 2)}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },
  container: {
    padding: 14,
    gap: 12
  },
  eyebrow: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#0f766e",
    fontWeight: "700"
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a"
  },
  subtitle: {
    color: "#475569"
  },
  section: {
    backgroundColor: "#ffffff",
    borderColor: "#cbd5e1",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a"
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  button: {
    backgroundColor: "#0f766e",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  buttonPressed: {
    opacity: 0.85
  },
  buttonDisabled: {
    opacity: 0.45
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700"
  },
  meta: {
    color: "#334155",
    fontSize: 12
  },
  error: {
    color: "#b91c1c",
    fontSize: 12
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  statTile: {
    flexGrow: 1,
    minWidth: "45%",
    backgroundColor: "#ffffff",
    borderColor: "#cbd5e1",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10
  },
  statLabel: {
    color: "#64748b",
    fontSize: 12
  },
  statValue: {
    color: "#0f172a",
    fontWeight: "800",
    marginTop: 4
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#0f172a"
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  pill: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#ffffff"
  },
  pillActive: {
    borderColor: "#0f766e",
    backgroundColor: "#ecfeff"
  },
  pillText: {
    color: "#0f172a",
    fontSize: 12
  },
  card: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#ffffff"
  },
  cardTitle: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 13
  },
  cardMeta: {
    color: "#334155",
    fontSize: 12
  },
  codeWrap: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 10
  },
  code: {
    color: "#e2e8f0",
    fontSize: 11,
    fontFamily: "monospace"
  }
});
