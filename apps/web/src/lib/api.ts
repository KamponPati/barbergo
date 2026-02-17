import type { Booking, Shop, UserRole } from "./types";

const runtimeApiBase =
  typeof window !== "undefined"
    ? `${window.location.origin}/api/v1`
    : "http://localhost:3000/api/v1";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? runtimeApiBase;

type HttpMethod = "GET" | "POST" | "PUT";

type RequestOptions = {
  method?: HttpMethod;
  token?: string;
  body?: unknown;
};

async function request<T>(path: string, options?: RequestOptions): Promise<T> {
  const method = options?.method ?? "GET";
  const needsIdempotency = method === "POST" || method === "PUT";
  const idempotencyKey = needsIdempotency
    ? `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    : undefined;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...(options?.token ? { authorization: `Bearer ${options.token}` } : {}),
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {})
    },
    body: options?.body ? JSON.stringify(options.body) : undefined
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }

  return (await res.json()) as T;
}

export async function login(role: UserRole): Promise<{ access_token: string }> {
  const userId = role === "admin" ? "admin_1" : role === "partner" ? "partner_1" : "cust_1";
  return request("/auth/login", {
    method: "POST",
    body: { user_id: userId, role }
  });
}

export async function getNearbyShops(): Promise<{ data: Shop[] }> {
  return request("/discovery/nearby?sort=rating_desc");
}

export async function getAvailability(shopId: string, serviceId: string, branchId = "branch_1"): Promise<{ slots: string[] }> {
  return request(
    `/discovery/shops/${shopId}/availability?branch_id=${branchId}&service_id=${serviceId}&date=2026-02-20`
  );
}

export async function quoteBooking(
  token: string,
  shopId: string,
  serviceId: string
): Promise<{ subtotal: number; discount: number; total: number }> {
  return request("/customer/bookings/quote", {
    method: "POST",
    token,
    body: {
      customer_id: "cust_1",
      shop_id: shopId,
      service_id: serviceId,
      promo_code: "PROMO10"
    }
  });
}

export async function checkoutBooking(params: {
  token: string;
  shopId: string;
  serviceId: string;
  slot: string;
}): Promise<{ booking: Booking }> {
  return request("/customer/bookings/checkout", {
    method: "POST",
    token: params.token,
    body: {
      customer_id: "cust_1",
      shop_id: params.shopId,
      branch_id: "branch_1",
      service_id: params.serviceId,
      slot_at: params.slot,
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

export async function confirmPartnerBooking(token: string, bookingId: string): Promise<unknown> {
  return request(`/partner/bookings/${bookingId}/confirm`, { method: "POST", token });
}

export async function startPartnerBooking(token: string, bookingId: string): Promise<unknown> {
  return request(`/partner/bookings/${bookingId}/start`, { method: "POST", token });
}

export async function completePartnerBooking(token: string, bookingId: string): Promise<unknown> {
  return request(`/partner/bookings/${bookingId}/complete`, { method: "POST", token });
}

export async function getScaleGateEval(token: string): Promise<unknown> {
  return request("/admin/scale/zone-gates/evaluate", { token });
}

export async function getUnitEconomics(token: string): Promise<unknown> {
  return request("/admin/scale/unit-economics", { token });
}

export async function getAdvancedAnalytics(token: string): Promise<unknown> {
  return request("/admin/analytics/advanced", { token });
}

export async function estimateDynamicPricing(token: string): Promise<unknown> {
  return request("/admin/scale/dynamic-pricing/estimate", {
    method: "POST",
    token,
    body: {
      zone_id: "central-a",
      base_price: 500,
      hour: 19,
      demand_supply_ratio: 1.25
    }
  });
}

export async function getAdminOverview(token: string): Promise<unknown> {
  return request("/admin/analytics/overview", { token });
}

export async function getAdminAlerts(token: string): Promise<unknown> {
  return request("/admin/alerts", { token });
}

export async function getAdminDisputes(token: string): Promise<unknown> {
  return request("/admin/disputes", { token });
}

export async function resolveAdminDispute(token: string, disputeId: string, action: "refund" | "reject", note: string): Promise<unknown> {
  return request(`/admin/disputes/${disputeId}/resolve`, {
    method: "POST",
    token,
    body: { action, note }
  });
}

export async function getAdminPolicy(token: string): Promise<unknown> {
  return request("/admin/policy", { token });
}

export async function updateAdminPolicy(
  token: string,
  payload: {
    commission_rate?: number;
    cancellation_fee_rate?: number;
    pricing_multiplier?: number;
    promo_enabled?: boolean;
  }
): Promise<unknown> {
  return request("/admin/policy", {
    method: "PUT",
    token,
    body: payload
  });
}

export async function setAdminPartnerVerification(
  token: string,
  partnerId: string,
  action: "approve" | "reject"
): Promise<unknown> {
  return request(`/admin/partners/${partnerId}/verification`, {
    method: "POST",
    token,
    body: { action }
  });
}

export async function getAdminReconciliation(token: string, date: string): Promise<unknown> {
  return request(`/admin/reconciliation/daily?date=${encodeURIComponent(date)}`, { token });
}

export type MeProfileResponse = {
  user_id: string;
  role: UserRole;
  display_name: string;
  status: "active" | "disabled";
  locale: string;
  time_zone: string;
};

export type MeSettingsResponse = {
  locale: string;
  time_zone: string;
  email_alerts: boolean;
  push_alerts: boolean;
  compact_mode: boolean;
};

export async function getMyProfile(token: string): Promise<MeProfileResponse> {
  return request("/auth/me/profile", { token });
}

export async function getMySettings(token: string): Promise<MeSettingsResponse> {
  return request("/auth/me/settings", { token });
}

export async function updateMySettings(
  token: string,
  input: Partial<MeSettingsResponse>
): Promise<MeSettingsResponse> {
  return request("/auth/me/settings", {
    method: "PUT",
    token,
    body: input
  });
}
