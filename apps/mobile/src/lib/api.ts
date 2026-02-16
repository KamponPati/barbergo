import type { Booking, Role, Shop } from "./types";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://172.23.11.144:3000/api/v1";

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

export async function login(role: Role): Promise<string> {
  const userId = role === "admin" ? "admin_1" : role === "partner" ? "partner_1" : "cust_1";
  const data = await request<{ access_token: string }>("/auth/login", {
    method: "POST",
    body: { user_id: userId, role }
  });
  return data.access_token;
}

export async function getNearbyShops(): Promise<{ data: Shop[] }> {
  return request("/discovery/nearby?sort=rating_desc");
}

export async function getAvailability(params: {
  shopId: string;
  branchId: string;
  serviceId: string;
}): Promise<{ slots: string[] }> {
  return request(
    `/discovery/shops/${params.shopId}/availability?branch_id=${params.branchId}&service_id=${params.serviceId}&date=2026-02-20`
  );
}

export async function quoteBooking(token: string, shopId: string, serviceId: string): Promise<{ subtotal: number; total: number }> {
  return request("/customer/bookings/quote", {
    method: "POST",
    token,
    body: {
      customer_id: "cust_1",
      shop_id: shopId,
      service_id: serviceId
    }
  });
}

export async function checkoutBooking(params: {
  token: string;
  shopId: string;
  branchId: string;
  serviceId: string;
  slotAt: string;
}): Promise<void> {
  await request("/customer/bookings/checkout", {
    method: "POST",
    token: params.token,
    body: {
      customer_id: "cust_1",
      shop_id: params.shopId,
      branch_id: params.branchId,
      service_id: params.serviceId,
      slot_at: params.slotAt,
      payment_method: "card"
    }
  });
}

export async function getCustomerHistory(token: string): Promise<{ data: Booking[] }> {
  return request("/customer/bookings/cust_1", { token });
}

export async function getPartnerQueue(token: string): Promise<{ data: Booking[] }> {
  return request("/partner/bookings/incoming/partner_1", { token });
}

export async function transitionPartnerBooking(
  token: string,
  bookingId: string,
  action: "confirm" | "start" | "complete"
): Promise<void> {
  await request(`/partner/bookings/${bookingId}/${action}`, { method: "POST", token });
}

export async function getAdminSnapshot(token: string): Promise<Record<string, unknown>> {
  const [zone, economics, advanced] = await Promise.all([
    request("/admin/scale/zone-gates/evaluate", { token }),
    request("/admin/scale/unit-economics", { token }),
    request("/admin/analytics/advanced", { token })
  ]);
  return { zone, economics, advanced };
}
