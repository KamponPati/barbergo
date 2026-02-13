import type { Booking, Shop, UserRole } from "./types";

const runtimeApiBase =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3000/api/v1`
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

export async function getAvailability(shopId: string, serviceId: string): Promise<{ slots: string[] }> {
  return request(
    `/discovery/shops/${shopId}/availability?branch_id=branch_1&service_id=${serviceId}&date=2026-02-20`
  );
}

export async function quoteBooking(shopId: string, serviceId: string): Promise<{ subtotal: number; discount: number; total: number }> {
  return request("/customer/bookings/quote", {
    method: "POST",
    body: {
      customer_id: "cust_1",
      shop_id: shopId,
      service_id: serviceId,
      promo_code: "PROMO10"
    }
  });
}

export async function checkoutBooking(params: {
  shopId: string;
  serviceId: string;
  slot: string;
}): Promise<{ booking: Booking }> {
  return request("/customer/bookings/checkout", {
    method: "POST",
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

export async function getCustomerHistory(): Promise<{ data: Booking[] }> {
  return request("/customer/bookings/cust_1");
}

export async function getPartnerQueue(): Promise<{ data: Booking[] }> {
  return request("/partner/bookings/incoming/partner_1");
}

export async function confirmPartnerBooking(bookingId: string): Promise<unknown> {
  return request(`/partner/bookings/${bookingId}/confirm`, { method: "POST" });
}

export async function startPartnerBooking(bookingId: string): Promise<unknown> {
  return request(`/partner/bookings/${bookingId}/start`, { method: "POST" });
}

export async function completePartnerBooking(bookingId: string): Promise<unknown> {
  return request(`/partner/bookings/${bookingId}/complete`, { method: "POST" });
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
