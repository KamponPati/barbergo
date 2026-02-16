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

export async function getShopDetail(shopId: string): Promise<Shop> {
  return request(`/discovery/shops/${shopId}`);
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

export async function postServiceFeedback(token: string, bookingId: string): Promise<void> {
  await request(`/customer/bookings/${bookingId}/post-service`, {
    method: "POST",
    token,
    body: {
      customer_id: "cust_1",
      rating: 5,
      review: "Great service from mobile app",
      tip_amount: 50,
      rebook_requested: true
    }
  });
}

export async function createDispute(token: string, bookingId: string): Promise<void> {
  await request("/disputes", {
    method: "POST",
    token,
    body: {
      booking_id: bookingId,
      customer_id: "cust_1",
      reason: "quality_issue",
      details: "Created from mobile app",
      evidence: ["mobile_screenshot_ref"]
    }
  });
}

export async function getPartnerQueue(token: string): Promise<{ data: Booking[] }> {
  return request("/partner/bookings/incoming/partner_1", { token });
}

export async function transitionPartnerBooking(
  token: string,
  bookingId: string,
  action: "confirm" | "start" | "complete" | "reject" | "reschedule"
): Promise<void> {
  await request(`/partner/bookings/${bookingId}/${action}`, { method: "POST", token });
}

export async function partnerOnboarding(token: string): Promise<{ partner_id: string }> {
  return request("/partner/onboarding", {
    method: "POST",
    token,
    body: {
      legal_name: "BarberGo Partner Demo Co., Ltd.",
      tax_id: "0105559999999",
      contact_name: "Mobile Partner",
      contact_phone: "0899999999"
    }
  });
}

export async function getPartnerOnboardingStatus(token: string, partnerId: string): Promise<unknown> {
  return request(`/partner/onboarding/${partnerId}/status`, { token });
}

export async function createPartnerBranch(token: string): Promise<unknown> {
  return request("/partner/branches", {
    method: "POST",
    token,
    body: {
      partner_id: "partner_1",
      shop_id: "shop_1",
      name: "Mobile Branch",
      zone: "central",
      lat: 13.75,
      lng: 100.5,
      open_hours: "10:00-20:00",
      capacity: 2
    }
  });
}

export async function createPartnerService(token: string): Promise<unknown> {
  return request("/partner/services", {
    method: "POST",
    token,
    body: {
      partner_id: "partner_1",
      shop_id: "shop_1",
      name: "Mobile Styling",
      duration_minutes: 40,
      price: 390,
      mode: "in_shop"
    }
  });
}

export async function createPartnerStaff(token: string): Promise<unknown> {
  return request("/partner/staff", {
    method: "POST",
    token,
    body: {
      partner_id: "partner_1",
      shop_id: "shop_1",
      name: "Mobile Stylist",
      skills: ["Haircut", "Styling"],
      shift_slots: []
    }
  });
}

export async function getPartnerWallet(token: string): Promise<unknown> {
  return request("/partner/wallet/partner_1", { token });
}

export async function withdrawPartnerWallet(token: string): Promise<unknown> {
  return request("/partner/wallet/partner_1/withdraw", {
    method: "POST",
    token,
    body: {
      amount: 200
    }
  });
}

export async function registerMobileDeviceToken(params: {
  token: string;
  role: Role;
  userId: string;
  deviceToken: string;
}): Promise<void> {
  await request("/platform/devices/register", {
    method: "POST",
    token: params.token,
    body: {
      role: params.role,
      user_id: params.userId,
      device_token: params.deviceToken,
      platform: "expo"
    }
  });
}

export async function getAdminSnapshot(token: string): Promise<Record<string, unknown>> {
  const [zone, economics, advanced] = await Promise.all([
    request("/admin/scale/zone-gates/evaluate", { token }),
    request("/admin/scale/unit-economics", { token }),
    request("/admin/analytics/advanced", { token })
  ]);
  return { zone, economics, advanced };
}
