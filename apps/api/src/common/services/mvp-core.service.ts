import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

export type BookingStatus =
  | "requested"
  | "quoted"
  | "authorized"
  | "confirmed"
  | "started"
  | "completed"
  | "cancelled"
  | "disputed";

type ServiceMode = "in_shop" | "delivery";

type ShopService = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  mode: ServiceMode;
};

type StaffMember = {
  id: string;
  name: string;
  skills: string[];
  shift_slots: string[];
};

type Branch = {
  id: string;
  shop_id: string;
  name: string;
  zone: string;
  lat: number;
  lng: number;
  open_hours: string;
  capacity: number;
};

type Shop = {
  id: string;
  partner_id: string;
  name: string;
  rating: number;
  branch_ids: string[];
  services: ShopService[];
  staff: StaffMember[];
};

type PaymentStatus = "authorized" | "captured" | "refunded";

type PaymentRecord = {
  id: string;
  booking_id: string;
  amount: number;
  status: PaymentStatus;
  provider_ref: string;
  created_at: string;
  captured_at?: string;
  refunded_at?: string;
};

type WalletEntry = {
  id: string;
  partner_id: string;
  booking_id: string;
  amount: number;
  direction: "credit" | "debit";
  reason: "settlement" | "withdrawal" | "refund_adjustment";
  created_at: string;
};

type WithdrawalRequest = {
  id: string;
  partner_id: string;
  amount: number;
  status: "requested" | "approved" | "rejected";
  created_at: string;
};

type PartnerProfile = {
  id: string;
  name: string;
  verification_status: "pending" | "approved" | "rejected";
  documents: { id: string; type: string; url: string; uploaded_at: string }[];
};

type DisputeRecord = {
  id: string;
  booking_id: string;
  created_by: string;
  status: "open" | "resolved";
  reason: string;
  evidence_timeline: { at: string; note: string }[];
  resolution_action?: string;
};

type NotificationEvent = {
  id: string;
  event_name: string;
  booking_id?: string;
  audience: "customer" | "partner" | "admin";
  message: string;
  created_at: string;
};

type Booking = {
  id: string;
  customer_id: string;
  partner_id: string;
  shop_id: string;
  branch_id: string;
  service_id: string;
  staff_id?: string;
  slot_at: string;
  status: BookingStatus;
  amount: number;
  quote_amount: number;
  payment_id?: string;
  created_at: string;
  updated_at: string;
  cancel_reason?: string;
};

type PolicyConfig = {
  commission_rate: number;
  cancellation_fee_rate: number;
  pricing_multiplier: number;
  promo_enabled: boolean;
};

type SearchFilters = {
  zone?: string;
  min_rating?: number;
  service_mode?: ServiceMode;
  q?: string;
  sort?: "rating_desc" | "rating_asc" | "price_asc" | "price_desc";
};

type ZoneKpiSnapshot = {
  zone_id: string;
  completion_rate: number;
  complaint_rate: number;
  refund_rate: number;
  confirm_time_avg_min: number;
  repeat_rate: number;
};

type CoverageGateConfig = {
  thresholds: {
    min_completion_rate: number;
    max_complaint_rate: number;
    max_refund_rate: number;
    max_confirm_time_avg_min: number;
    min_repeat_rate: number;
  };
  zones: Array<{
    zone_id: string;
    status: "approved_for_expansion" | "hold";
    current_coverage_level: string;
    target_coverage_level: string;
    hold_reason?: string;
  }>;
};

type DeliveryReadinessConfig = {
  requirements: string[];
  zones: Array<{
    zone_id: string;
    delivery_mode: boolean;
    readiness_score: number;
    decision: "pending" | "approved" | "blocked";
  }>;
};

type DynamicPricingConfig = {
  default_multiplier: number;
  caps: {
    max_multiplier: number;
    min_multiplier: number;
  };
  rules: Array<{
    rule_id: string;
    zone_id: string;
    hour_start: number;
    hour_end: number;
    demand_supply_ratio_gte?: number;
    demand_supply_ratio_lte?: number;
    multiplier: number;
  }>;
};

type RankingConfig = {
  variants: Record<
    string,
    {
      rating_weight: number;
      distance_weight: number;
      price_weight: number;
      repeat_weight: number;
    }
  >;
  experiment: {
    name: string;
    traffic_split: Record<string, number>;
    success_metric: string;
    guardrail_metrics: string[];
  };
};

type GrowthModuleStatus = "planned" | "pilot" | "active" | "paused";

type GrowthModulesConfig = {
  modules: Record<
    string,
    {
      status: GrowthModuleStatus;
      pilot_zones: string[];
    }
  >;
};

type PayoutGovernanceConfig = {
  risk_profiles: Record<
    "low" | "medium" | "high",
    {
      holdback_rate: number;
      payout_cycle_days: number;
    }
  >;
};

type DisputeAutomationConfig = {
  abuse_threshold_per_30d: number;
  actions: string[];
};

type UnitEconomicsEntry = {
  date: string;
  zone_id: string;
  gross_revenue: number;
  discount_amount: number;
  payment_fee: number;
  partner_payout: number;
  support_cost: number;
  refund_amount: number;
  bookings: number;
};

const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  requested: ["quoted", "cancelled"],
  quoted: ["authorized", "cancelled"],
  authorized: ["confirmed", "cancelled"],
  confirmed: ["started", "cancelled", "disputed"],
  started: ["completed", "disputed"],
  completed: ["disputed"],
  cancelled: [],
  disputed: ["completed"]
};

@Injectable()
export class MvpCoreService {
  private idCounter = 1;

  private readonly shops = new Map<string, Shop>();
  private readonly branches = new Map<string, Branch>();
  private readonly bookings = new Map<string, Booking>();
  private readonly payments = new Map<string, PaymentRecord>();
  private readonly walletEntries: WalletEntry[] = [];
  private readonly withdrawals: WithdrawalRequest[] = [];
  private readonly partners = new Map<string, PartnerProfile>();
  private readonly disputes = new Map<string, DisputeRecord>();
  private readonly notifications: NotificationEvent[] = [];
  private readonly slotLocks = new Map<string, string>();
  private readonly userRoles = new Map<string, string>();
  private readonly rolePermissions = new Map<string, string[]>();
  private readonly zoneKpiSnapshots: ZoneKpiSnapshot[] = [];
  private readonly unitEconomicsEntries: UnitEconomicsEntry[] = [];

  private coverageGates: CoverageGateConfig = {
    thresholds: {
      min_completion_rate: 0.92,
      max_complaint_rate: 0.03,
      max_refund_rate: 0.02,
      max_confirm_time_avg_min: 10,
      min_repeat_rate: 0.25
    },
    zones: [
      {
        zone_id: "central-a",
        status: "approved_for_expansion",
        current_coverage_level: "L1",
        target_coverage_level: "L2"
      },
      {
        zone_id: "west-b",
        status: "hold",
        current_coverage_level: "L1",
        target_coverage_level: "L2",
        hold_reason: "on_time_start_rate_below_threshold"
      }
    ]
  };

  private deliveryReadiness: DeliveryReadinessConfig = {
    requirements: [
      "partner_delivery_training_completed",
      "delivery_sla_simulation_passed",
      "dispute_resolution_capacity_ready",
      "zone_completion_rate_meets_gate",
      "zone_refund_rate_meets_gate"
    ],
    zones: [
      { zone_id: "central-a", delivery_mode: false, readiness_score: 0.84, decision: "pending" },
      { zone_id: "west-b", delivery_mode: false, readiness_score: 0.62, decision: "blocked" }
    ]
  };

  private dynamicPricing: DynamicPricingConfig = {
    default_multiplier: 1,
    caps: {
      max_multiplier: 1.35,
      min_multiplier: 0.85
    },
    rules: [
      {
        rule_id: "peak-hours-central",
        zone_id: "central-a",
        hour_start: 18,
        hour_end: 21,
        demand_supply_ratio_gte: 1.2,
        multiplier: 1.15
      },
      {
        rule_id: "offpeak-west",
        zone_id: "west-b",
        hour_start: 10,
        hour_end: 13,
        demand_supply_ratio_lte: 0.8,
        multiplier: 0.92
      }
    ]
  };

  private rankingConfig: RankingConfig = {
    variants: {
      control: { rating_weight: 0.45, distance_weight: 0.25, price_weight: 0.2, repeat_weight: 0.1 },
      candidate_a: { rating_weight: 0.35, distance_weight: 0.2, price_weight: 0.2, repeat_weight: 0.25 }
    },
    experiment: {
      name: "ranking-weight-expansion-v1",
      traffic_split: { control: 50, candidate_a: 50 },
      success_metric: "booking_conversion_rate",
      guardrail_metrics: ["complaint_rate", "refund_rate"]
    }
  };

  private growthModules: GrowthModulesConfig = {
    modules: {
      loyalty: { status: "planned", pilot_zones: ["central-a"] },
      referral: { status: "planned", pilot_zones: ["central-a"] },
      promo_expansion: { status: "planned", pilot_zones: ["central-a", "west-b"] }
    }
  };

  private payoutGovernance: PayoutGovernanceConfig = {
    risk_profiles: {
      low: { holdback_rate: 0.02, payout_cycle_days: 3 },
      medium: { holdback_rate: 0.05, payout_cycle_days: 7 },
      high: { holdback_rate: 0.1, payout_cycle_days: 14 }
    }
  };

  private disputeAutomation: DisputeAutomationConfig = {
    abuse_threshold_per_30d: 3,
    actions: ["warning", "temporary_suspension", "delisting_review"]
  };

  private policy: PolicyConfig = {
    commission_rate: 0.2,
    cancellation_fee_rate: 0.1,
    pricing_multiplier: 1,
    promo_enabled: true
  };

  constructor() {
    this.seed();
  }

  private nextId(prefix: string): string {
    this.idCounter += 1;
    return `${prefix}_${this.idCounter}`;
  }

  private nowIso(): string {
    return new Date().toISOString();
  }

  private seed(): void {
    this.rolePermissions.set("admin", ["audit:read", "kyc:write", "policy:write", "dispute:resolve"]);
    this.rolePermissions.set("partner", ["booking:manage", "wallet:read"]);
    this.rolePermissions.set("customer", ["booking:create", "booking:cancel", "dispute:create"]);

    this.userRoles.set("admin_1", "admin");
    this.userRoles.set("partner_1", "partner");
    this.userRoles.set("cust_1", "customer");

    this.partners.set("partner_1", {
      id: "partner_1",
      name: "Downtown Grooming Co.",
      verification_status: "pending",
      documents: []
    });

    const shopA: Shop = {
      id: "shop_1",
      partner_id: "partner_1",
      name: "Downtown Grooming Co.",
      rating: 4.8,
      branch_ids: ["branch_1"],
      services: [
        { id: "svc_1", name: "Haircut", duration_minutes: 45, price: 350, mode: "in_shop" },
        { id: "svc_2", name: "Beard Trim", duration_minutes: 30, price: 250, mode: "in_shop" }
      ],
      staff: [
        { id: "staff_1", name: "Narin", skills: ["Haircut", "Fade"], shift_slots: [] },
        { id: "staff_2", name: "Korn", skills: ["Beard", "Styling"], shift_slots: [] }
      ]
    };

    const shopB: Shop = {
      id: "shop_2",
      partner_id: "partner_1",
      name: "Riverside Barber Lab",
      rating: 4.5,
      branch_ids: ["branch_2"],
      services: [
        { id: "svc_3", name: "Full Grooming", duration_minutes: 60, price: 550, mode: "in_shop" },
        { id: "svc_4", name: "Home Visit Haircut", duration_minutes: 50, price: 700, mode: "delivery" }
      ],
      staff: [{ id: "staff_3", name: "Mek", skills: ["Haircut", "Color"], shift_slots: [] }]
    };

    const branchA: Branch = {
      id: "branch_1",
      shop_id: "shop_1",
      name: "Downtown Branch",
      zone: "central",
      lat: 13.7563,
      lng: 100.5018,
      open_hours: "09:00-20:00",
      capacity: 3
    };

    const branchB: Branch = {
      id: "branch_2",
      shop_id: "shop_2",
      name: "Riverside Branch",
      zone: "west",
      lat: 13.74,
      lng: 100.48,
      open_hours: "10:00-21:00",
      capacity: 2
    };

    this.shops.set(shopA.id, shopA);
    this.shops.set(shopB.id, shopB);
    this.branches.set(branchA.id, branchA);
    this.branches.set(branchB.id, branchB);

    this.zoneKpiSnapshots.push(
      {
        zone_id: "central-a",
        completion_rate: 0.94,
        complaint_rate: 0.02,
        refund_rate: 0.01,
        confirm_time_avg_min: 8.6,
        repeat_rate: 0.29
      },
      {
        zone_id: "west-b",
        completion_rate: 0.88,
        complaint_rate: 0.04,
        refund_rate: 0.03,
        confirm_time_avg_min: 11.4,
        repeat_rate: 0.21
      }
    );

    this.unitEconomicsEntries.push(
      {
        date: "2026-02-11",
        zone_id: "central-a",
        gross_revenue: 42000,
        discount_amount: 3200,
        payment_fee: 1260,
        partner_payout: 29400,
        support_cost: 1700,
        refund_amount: 400,
        bookings: 120
      },
      {
        date: "2026-02-12",
        zone_id: "central-a",
        gross_revenue: 43800,
        discount_amount: 3500,
        payment_fee: 1314,
        partner_payout: 30660,
        support_cost: 1800,
        refund_amount: 350,
        bookings: 124
      },
      {
        date: "2026-02-13",
        zone_id: "central-a",
        gross_revenue: 45200,
        discount_amount: 3600,
        payment_fee: 1356,
        partner_payout: 31640,
        support_cost: 1900,
        refund_amount: 380,
        bookings: 129
      },
      {
        date: "2026-02-11",
        zone_id: "west-b",
        gross_revenue: 23000,
        discount_amount: 2500,
        payment_fee: 690,
        partner_payout: 16100,
        support_cost: 1450,
        refund_amount: 700,
        bookings: 76
      },
      {
        date: "2026-02-12",
        zone_id: "west-b",
        gross_revenue: 22800,
        discount_amount: 2600,
        payment_fee: 684,
        partner_payout: 15960,
        support_cost: 1550,
        refund_amount: 740,
        bookings: 74
      },
      {
        date: "2026-02-13",
        zone_id: "west-b",
        gross_revenue: 23600,
        discount_amount: 2550,
        payment_fee: 708,
        partner_payout: 16520,
        support_cost: 1520,
        refund_amount: 690,
        bookings: 78
      }
    );
  }

  listShops(filters: SearchFilters): { data: Array<Shop & { branches: Branch[] }> } {
    const rows = Array.from(this.shops.values())
      .map((shop) => ({
        ...shop,
        branches: shop.branch_ids.map((branchId) => this.branches.get(branchId)).filter((v): v is Branch => Boolean(v))
      }))
      .filter((shop) => {
        if (filters.zone && !shop.branches.some((branch) => branch.zone === filters.zone)) {
          return false;
        }
        if (filters.min_rating && shop.rating < filters.min_rating) {
          return false;
        }
        if (filters.service_mode && !shop.services.some((service) => service.mode === filters.service_mode)) {
          return false;
        }
        if (filters.q) {
          const text = `${shop.name} ${shop.services.map((service) => service.name).join(" ")}`.toLowerCase();
          if (!text.includes(filters.q.toLowerCase())) {
            return false;
          }
        }
        return true;
      });

    const sorted = [...rows];
    if (filters.sort === "rating_desc") {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (filters.sort === "rating_asc") {
      sorted.sort((a, b) => a.rating - b.rating);
    } else if (filters.sort === "price_asc") {
      sorted.sort((a, b) => this.minPrice(a.services) - this.minPrice(b.services));
    } else if (filters.sort === "price_desc") {
      sorted.sort((a, b) => this.minPrice(b.services) - this.minPrice(a.services));
    }

    return { data: sorted };
  }

  private minPrice(services: ShopService[]): number {
    return Math.min(...services.map((service) => service.price));
  }

  getShopDetail(shopId: string): { shop: Shop; branches: Branch[] } {
    const shop = this.shops.get(shopId);
    if (!shop) {
      throw new NotFoundException({ code: "SHOP_NOT_FOUND", message: "shop not found" });
    }

    return {
      shop,
      branches: shop.branch_ids.map((branchId) => this.mustGetBranch(branchId))
    };
  }

  getAvailability(params: { shop_id: string; branch_id: string; service_id: string; date: string }): { slots: string[] } {
    const shop = this.mustGetShop(params.shop_id);
    this.mustGetBranch(params.branch_id);

    const service = shop.services.find((item) => item.id === params.service_id);
    if (!service) {
      throw new NotFoundException({ code: "SERVICE_NOT_FOUND", message: "service not found" });
    }

    const starts = [9, 10, 11, 13, 14, 15, 16, 17];
    const slots = starts
      .map((hour) => `${params.date}T${String(hour).padStart(2, "0")}:00:00.000Z`)
      .filter((slot) => !this.slotLocks.has(this.slotKey(params.branch_id, slot)));

    return { slots };
  }

  quoteBooking(params: {
    customer_id: string;
    shop_id: string;
    service_id: string;
    promo_code?: string;
  }): { subtotal: number; discount: number; total: number } {
    const shop = this.mustGetShop(params.shop_id);
    const service = shop.services.find((item) => item.id === params.service_id);
    if (!service) {
      throw new NotFoundException({ code: "SERVICE_NOT_FOUND", message: "service not found" });
    }

    const subtotal = Math.round(service.price * this.policy.pricing_multiplier);
    const discount = params.promo_code && this.policy.promo_enabled ? Math.round(subtotal * 0.1) : 0;
    return {
      subtotal,
      discount,
      total: subtotal - discount
    };
  }

  checkoutBooking(params: {
    customer_id: string;
    shop_id: string;
    branch_id: string;
    service_id: string;
    slot_at: string;
    payment_method: string;
  }): { booking: Booking; payment: PaymentRecord } {
    const shop = this.mustGetShop(params.shop_id);
    const branch = this.mustGetBranch(params.branch_id);

    if (!shop.branch_ids.includes(branch.id)) {
      throw new BadRequestException({ code: "SHOP_BRANCH_MISMATCH", message: "branch does not belong to shop" });
    }

    const quote = this.quoteBooking({
      customer_id: params.customer_id,
      shop_id: params.shop_id,
      service_id: params.service_id
    });

    const slotKey = this.slotKey(params.branch_id, params.slot_at);
    if (this.slotLocks.has(slotKey)) {
      throw new BadRequestException({ code: "SLOT_CONFLICT", message: "slot already reserved" });
    }

    const booking: Booking = {
      id: this.nextId("book"),
      customer_id: params.customer_id,
      partner_id: shop.partner_id,
      shop_id: params.shop_id,
      branch_id: params.branch_id,
      service_id: params.service_id,
      slot_at: params.slot_at,
      status: "requested",
      amount: quote.total,
      quote_amount: quote.total,
      created_at: this.nowIso(),
      updated_at: this.nowIso()
    };

    this.bookings.set(booking.id, booking);
    this.slotLocks.set(slotKey, booking.id);
    this.transitionBooking(booking.id, "quoted");

    const payment = this.authorizePayment({
      booking_id: booking.id,
      amount: quote.total,
      payment_method: params.payment_method
    });

    this.transitionBooking(booking.id, "authorized");
    this.emitBookingNotifications("booking.created", booking.id);

    return {
      booking: this.mustGetBooking(booking.id),
      payment
    };
  }

  listCustomerBookings(customerId: string): { data: Booking[] } {
    return {
      data: Array.from(this.bookings.values()).filter((booking) => booking.customer_id === customerId)
    };
  }

  getBookingDetail(bookingId: string): { booking: Booking; payment?: PaymentRecord; dispute?: DisputeRecord } {
    const booking = this.mustGetBooking(bookingId);
    const payment = booking.payment_id ? this.payments.get(booking.payment_id) : undefined;
    const dispute = Array.from(this.disputes.values()).find((entry) => entry.booking_id === booking.id);
    return { booking, payment, dispute };
  }

  cancelBooking(params: { booking_id: string; reason: string }): { booking: Booking; refunded: boolean } {
    const booking = this.mustGetBooking(params.booking_id);
    this.transitionBooking(booking.id, "cancelled");

    booking.cancel_reason = params.reason;
    const lockKey = this.slotKey(booking.branch_id, booking.slot_at);
    this.slotLocks.delete(lockKey);

    let refunded = false;
    if (booking.payment_id) {
      const payment = this.payments.get(booking.payment_id);
      if (payment && payment.status !== "refunded") {
        this.refundPayment({ booking_id: booking.id, reason: params.reason });
        refunded = true;
      }
    }

    this.emitBookingNotifications("booking.cancelled", booking.id);
    return { booking: this.mustGetBooking(booking.id), refunded };
  }

  postServiceAction(params: {
    booking_id: string;
    rating?: number;
    review?: string;
    tip_amount?: number;
    rebook_slot_at?: string;
    dispute_reason?: string;
  }): {
    accepted: boolean;
    created_dispute_id?: string;
    rebook_booking_id?: string;
  } {
    const booking = this.mustGetBooking(params.booking_id);

    if (params.dispute_reason) {
      const dispute = this.createDispute({
        booking_id: booking.id,
        created_by: booking.customer_id,
        reason: params.dispute_reason,
        evidence_note: "Customer opened dispute from post-service flow"
      });
      this.transitionBooking(booking.id, "disputed");
      this.emitBookingNotifications("booking.disputed", booking.id);
      return { accepted: true, created_dispute_id: dispute.id };
    }

    if (params.rebook_slot_at) {
      const copy = this.checkoutBooking({
        customer_id: booking.customer_id,
        shop_id: booking.shop_id,
        branch_id: booking.branch_id,
        service_id: booking.service_id,
        slot_at: params.rebook_slot_at,
        payment_method: "card"
      });
      return { accepted: true, rebook_booking_id: copy.booking.id };
    }

    return { accepted: true };
  }

  submitPartnerOnboarding(params: { partner_name: string }): PartnerProfile {
    const partner: PartnerProfile = {
      id: this.nextId("partner"),
      name: params.partner_name,
      verification_status: "pending",
      documents: []
    };

    this.partners.set(partner.id, partner);
    this.userRoles.set(partner.id, "partner");
    return partner;
  }

  uploadPartnerDocument(params: { partner_id: string; type: string; url: string }): PartnerProfile {
    const partner = this.mustGetPartner(params.partner_id);
    partner.documents.push({
      id: this.nextId("doc"),
      type: params.type,
      url: params.url,
      uploaded_at: this.nowIso()
    });
    return partner;
  }

  getPartnerVerificationStatus(partnerId: string): { partner_id: string; status: string; documents: number } {
    const partner = this.mustGetPartner(partnerId);
    return {
      partner_id: partner.id,
      status: partner.verification_status,
      documents: partner.documents.length
    };
  }

  upsertBranch(params: {
    partner_id: string;
    branch_id?: string;
    shop_id: string;
    name: string;
    zone: string;
    open_hours: string;
    capacity: number;
    lat: number;
    lng: number;
  }): Branch {
    const shop = this.mustGetShop(params.shop_id);
    if (shop.partner_id !== params.partner_id) {
      throw new BadRequestException({ code: "PARTNER_FORBIDDEN", message: "cannot edit another partner shop" });
    }

    if (params.branch_id && this.branches.has(params.branch_id)) {
      const branch = this.mustGetBranch(params.branch_id);
      branch.name = params.name;
      branch.zone = params.zone;
      branch.open_hours = params.open_hours;
      branch.capacity = params.capacity;
      branch.lat = params.lat;
      branch.lng = params.lng;
      return branch;
    }

    const branch: Branch = {
      id: this.nextId("branch"),
      shop_id: params.shop_id,
      name: params.name,
      zone: params.zone,
      open_hours: params.open_hours,
      capacity: params.capacity,
      lat: params.lat,
      lng: params.lng
    };

    this.branches.set(branch.id, branch);
    shop.branch_ids.push(branch.id);
    return branch;
  }

  upsertService(params: {
    partner_id: string;
    shop_id: string;
    service_id?: string;
    name: string;
    price: number;
    duration_minutes: number;
    mode: ServiceMode;
  }): ShopService {
    const shop = this.mustGetShop(params.shop_id);
    if (shop.partner_id !== params.partner_id) {
      throw new BadRequestException({ code: "PARTNER_FORBIDDEN", message: "cannot edit another partner shop" });
    }

    if (params.service_id) {
      const current = shop.services.find((item) => item.id === params.service_id);
      if (!current) {
        throw new NotFoundException({ code: "SERVICE_NOT_FOUND", message: "service not found" });
      }
      current.name = params.name;
      current.price = params.price;
      current.duration_minutes = params.duration_minutes;
      current.mode = params.mode;
      return current;
    }

    const created: ShopService = {
      id: this.nextId("svc"),
      name: params.name,
      price: params.price,
      duration_minutes: params.duration_minutes,
      mode: params.mode
    };
    shop.services.push(created);
    return created;
  }

  upsertStaff(params: {
    partner_id: string;
    shop_id: string;
    staff_id?: string;
    name: string;
    skills: string[];
    shift_slots: string[];
  }): StaffMember {
    const shop = this.mustGetShop(params.shop_id);
    if (shop.partner_id !== params.partner_id) {
      throw new BadRequestException({ code: "PARTNER_FORBIDDEN", message: "cannot edit another partner shop" });
    }

    if (params.staff_id) {
      const current = shop.staff.find((item) => item.id === params.staff_id);
      if (!current) {
        throw new NotFoundException({ code: "STAFF_NOT_FOUND", message: "staff not found" });
      }
      current.name = params.name;
      current.skills = params.skills;
      current.shift_slots = params.shift_slots;
      return current;
    }

    const created: StaffMember = {
      id: this.nextId("staff"),
      name: params.name,
      skills: params.skills,
      shift_slots: params.shift_slots
    };
    shop.staff.push(created);
    return created;
  }

  listIncomingQueue(partnerId: string): { data: Booking[] } {
    return {
      data: Array.from(this.bookings.values()).filter(
        (booking) => booking.partner_id === partnerId && booking.status === "authorized"
      )
    };
  }

  confirmBooking(bookingId: string): Booking {
    const booking = this.mustGetBooking(bookingId);
    this.transitionBooking(booking.id, "confirmed");
    this.emitBookingNotifications("booking.confirmed", booking.id);
    return this.mustGetBooking(booking.id);
  }

  rejectBooking(params: { booking_id: string; reason: string }): Booking {
    const booking = this.mustGetBooking(params.booking_id);
    this.transitionBooking(booking.id, "cancelled");
    booking.cancel_reason = `partner_reject:${params.reason}`;
    this.slotLocks.delete(this.slotKey(booking.branch_id, booking.slot_at));
    this.refundPayment({ booking_id: booking.id, reason: params.reason });
    this.emitBookingNotifications("booking.cancelled", booking.id);
    return this.mustGetBooking(booking.id);
  }

  rescheduleBooking(params: { booking_id: string; new_slot_at: string }): Booking {
    const booking = this.mustGetBooking(params.booking_id);
    const newSlotKey = this.slotKey(booking.branch_id, params.new_slot_at);
    if (this.slotLocks.has(newSlotKey)) {
      throw new BadRequestException({ code: "SLOT_CONFLICT", message: "slot already reserved" });
    }

    this.slotLocks.delete(this.slotKey(booking.branch_id, booking.slot_at));
    booking.slot_at = params.new_slot_at;
    booking.updated_at = this.nowIso();
    this.slotLocks.set(newSlotKey, booking.id);
    this.emitBookingNotifications("booking.rescheduled", booking.id);
    return booking;
  }

  startBooking(bookingId: string): Booking {
    const booking = this.mustGetBooking(bookingId);
    this.transitionBooking(booking.id, "started");
    this.emitBookingNotifications("booking.started", booking.id);
    return this.mustGetBooking(booking.id);
  }

  completeBooking(bookingId: string): Booking {
    const booking = this.mustGetBooking(bookingId);
    this.transitionBooking(booking.id, "completed");
    this.capturePayment({ booking_id: booking.id });
    this.postSettlement(booking.id);
    this.emitBookingNotifications("booking.completed", booking.id);
    return this.mustGetBooking(booking.id);
  }

  markException(bookingId: string, note: string): { booking: Booking; note: string } {
    const booking = this.mustGetBooking(bookingId);
    this.emitAdminAlert(`Exception on ${booking.id}: ${note}`, booking.id);
    return { booking, note };
  }

  getWalletSummary(partnerId: string): {
    balance: number;
    ledger: WalletEntry[];
    withdrawals: WithdrawalRequest[];
  } {
    const ledger = this.walletEntries.filter((entry) => entry.partner_id === partnerId);
    const balance = ledger.reduce((acc, entry) => acc + (entry.direction === "credit" ? entry.amount : -entry.amount), 0);
    return {
      balance,
      ledger,
      withdrawals: this.withdrawals.filter((entry) => entry.partner_id === partnerId)
    };
  }

  requestWithdrawal(partnerId: string, amount: number): WithdrawalRequest {
    const summary = this.getWalletSummary(partnerId);
    if (amount <= 0 || amount > summary.balance) {
      throw new BadRequestException({ code: "WITHDRAWAL_INVALID", message: "invalid withdrawal amount" });
    }

    const request: WithdrawalRequest = {
      id: this.nextId("wd"),
      partner_id: partnerId,
      amount,
      status: "requested",
      created_at: this.nowIso()
    };
    this.withdrawals.push(request);

    this.walletEntries.push({
      id: this.nextId("ledger"),
      partner_id: partnerId,
      booking_id: "-",
      amount,
      direction: "debit",
      reason: "withdrawal",
      created_at: this.nowIso()
    });

    return request;
  }

  adminSetPartnerVerification(params: { partner_id: string; action: "approve" | "reject" }): PartnerProfile {
    const partner = this.mustGetPartner(params.partner_id);
    partner.verification_status = params.action === "approve" ? "approved" : "rejected";
    return partner;
  }

  createDispute(params: {
    booking_id: string;
    created_by: string;
    reason: string;
    evidence_note: string;
  }): DisputeRecord {
    this.mustGetBooking(params.booking_id);

    const dispute: DisputeRecord = {
      id: this.nextId("dispute"),
      booking_id: params.booking_id,
      created_by: params.created_by,
      status: "open",
      reason: params.reason,
      evidence_timeline: [{ at: this.nowIso(), note: params.evidence_note }]
    };

    this.disputes.set(dispute.id, dispute);
    this.emitAdminAlert(`New dispute ${dispute.id}`, params.booking_id);
    return dispute;
  }

  listDisputes(): { data: DisputeRecord[] } {
    return { data: Array.from(this.disputes.values()) };
  }

  resolveDispute(params: { dispute_id: string; action: string; note: string }): DisputeRecord {
    const dispute = this.disputes.get(params.dispute_id);
    if (!dispute) {
      throw new NotFoundException({ code: "DISPUTE_NOT_FOUND", message: "dispute not found" });
    }

    dispute.status = "resolved";
    dispute.resolution_action = params.action;
    dispute.evidence_timeline.push({ at: this.nowIso(), note: params.note });
    return dispute;
  }

  getPolicy(): PolicyConfig {
    return this.policy;
  }

  setPolicy(nextPolicy: Partial<PolicyConfig>): PolicyConfig {
    this.policy = {
      ...this.policy,
      ...nextPolicy
    };
    return this.policy;
  }

  getRolePermissionMatrix(): { roles: Record<string, string[]> } {
    return {
      roles: Object.fromEntries(this.rolePermissions.entries())
    };
  }

  setRolePermissions(role: string, permissions: string[]): { role: string; permissions: string[] } {
    this.rolePermissions.set(role, permissions);
    return { role, permissions };
  }

  getAnalyticsOverview(): {
    total_bookings: number;
    completed_bookings: number;
    cancelled_bookings: number;
    dispute_open_count: number;
    completion_rate: number;
    cancellation_rate: number;
    avg_ticket: number;
  } {
    const bookings = Array.from(this.bookings.values());
    const completed = bookings.filter((booking) => booking.status === "completed");
    const cancelled = bookings.filter((booking) => booking.status === "cancelled");

    return {
      total_bookings: bookings.length,
      completed_bookings: completed.length,
      cancelled_bookings: cancelled.length,
      dispute_open_count: Array.from(this.disputes.values()).filter((entry) => entry.status === "open").length,
      completion_rate: bookings.length > 0 ? completed.length / bookings.length : 0,
      cancellation_rate: bookings.length > 0 ? cancelled.length / bookings.length : 0,
      avg_ticket: completed.length > 0 ? completed.reduce((acc, booking) => acc + booking.amount, 0) / completed.length : 0
    };
  }

  getCoverageGates(): CoverageGateConfig {
    return this.coverageGates;
  }

  getZoneKpiSnapshots(): { data: ZoneKpiSnapshot[] } {
    return { data: this.zoneKpiSnapshots };
  }

  setCoverageZoneStatus(params: {
    zone_id: string;
    status: "approved_for_expansion" | "hold";
    hold_reason?: string;
  }): CoverageGateConfig {
    const zone = this.coverageGates.zones.find((entry) => entry.zone_id === params.zone_id);
    if (!zone) {
      throw new NotFoundException({ code: "ZONE_NOT_FOUND", message: "zone not found" });
    }
    zone.status = params.status;
    zone.hold_reason = params.status === "hold" ? params.hold_reason ?? "manual_hold" : undefined;
    return this.coverageGates;
  }

  evaluateZoneGates(): {
    data: Array<ZoneKpiSnapshot & { decision: "approved" | "hold"; reasons: string[] }>;
  } {
    const t = this.coverageGates.thresholds;
    return {
      data: this.zoneKpiSnapshots.map((snapshot) => {
        const reasons: string[] = [];
        if (snapshot.completion_rate < t.min_completion_rate) reasons.push("completion_rate");
        if (snapshot.complaint_rate > t.max_complaint_rate) reasons.push("complaint_rate");
        if (snapshot.refund_rate > t.max_refund_rate) reasons.push("refund_rate");
        if (snapshot.confirm_time_avg_min > t.max_confirm_time_avg_min) reasons.push("confirm_time_avg_min");
        if (snapshot.repeat_rate < t.min_repeat_rate) reasons.push("repeat_rate");
        return {
          ...snapshot,
          decision: reasons.length > 0 ? "hold" : "approved",
          reasons
        };
      })
    };
  }

  getDeliveryReadiness(): DeliveryReadinessConfig {
    return this.deliveryReadiness;
  }

  setDeliveryMode(params: { zone_id: string; enabled: boolean; decision: "approved" | "blocked" | "pending" }): {
    zone_id: string;
    delivery_mode: boolean;
    decision: "approved" | "blocked" | "pending";
  } {
    const zone = this.deliveryReadiness.zones.find((entry) => entry.zone_id === params.zone_id);
    if (!zone) {
      throw new NotFoundException({ code: "ZONE_NOT_FOUND", message: "zone not found" });
    }
    zone.delivery_mode = params.enabled;
    zone.decision = params.decision;
    return {
      zone_id: zone.zone_id,
      delivery_mode: zone.delivery_mode,
      decision: zone.decision
    };
  }

  getDynamicPricingConfig(): DynamicPricingConfig {
    return this.dynamicPricing;
  }

  estimateDynamicPrice(params: {
    zone_id: string;
    base_price: number;
    hour: number;
    demand_supply_ratio: number;
  }): {
    base_price: number;
    multiplier: number;
    final_price: number;
    matched_rule_id?: string;
  } {
    let multiplier = this.dynamicPricing.default_multiplier;
    let matchedRuleId: string | undefined;

    for (const rule of this.dynamicPricing.rules) {
      if (rule.zone_id !== params.zone_id) {
        continue;
      }
      if (params.hour < rule.hour_start || params.hour > rule.hour_end) {
        continue;
      }
      if (rule.demand_supply_ratio_gte !== undefined && params.demand_supply_ratio < rule.demand_supply_ratio_gte) {
        continue;
      }
      if (rule.demand_supply_ratio_lte !== undefined && params.demand_supply_ratio > rule.demand_supply_ratio_lte) {
        continue;
      }
      multiplier = rule.multiplier;
      matchedRuleId = rule.rule_id;
      break;
    }

    multiplier = Math.max(this.dynamicPricing.caps.min_multiplier, Math.min(this.dynamicPricing.caps.max_multiplier, multiplier));
    return {
      base_price: params.base_price,
      multiplier,
      final_price: Math.round(params.base_price * multiplier),
      matched_rule_id: matchedRuleId
    };
  }

  getRankingConfig(): RankingConfig {
    return this.rankingConfig;
  }

  updateRankingVariant(
    variant: string,
    weights: { rating_weight: number; distance_weight: number; price_weight: number; repeat_weight: number }
  ): RankingConfig {
    const total = weights.rating_weight + weights.distance_weight + weights.price_weight + weights.repeat_weight;
    if (Math.abs(total - 1) > 0.001) {
      throw new BadRequestException({ code: "RANKING_WEIGHT_INVALID", message: "weights must sum to 1" });
    }
    this.rankingConfig.variants[variant] = weights;
    return this.rankingConfig;
  }

  getGrowthModules(): GrowthModulesConfig {
    return this.growthModules;
  }

  updateGrowthModule(params: { module: string; status: GrowthModuleStatus; pilot_zones: string[] }): GrowthModulesConfig {
    this.growthModules.modules[params.module] = {
      status: params.status,
      pilot_zones: params.pilot_zones
    };
    return this.growthModules;
  }

  getPayoutGovernance(): PayoutGovernanceConfig {
    return this.payoutGovernance;
  }

  evaluatePayoutRisk(params: {
    dispute_rate: number;
    refund_rate: number;
    cancellation_rate: number;
    chargeback_rate: number;
  }): {
    risk_profile: "low" | "medium" | "high";
    holdback_rate: number;
    payout_cycle_days: number;
  } {
    const riskScore =
      params.dispute_rate * 0.35 + params.refund_rate * 0.3 + params.cancellation_rate * 0.2 + params.chargeback_rate * 0.15;

    let profile: "low" | "medium" | "high" = "low";
    if (riskScore >= 0.08) {
      profile = "high";
    } else if (riskScore >= 0.04) {
      profile = "medium";
    }

    return {
      risk_profile: profile,
      ...this.payoutGovernance.risk_profiles[profile]
    };
  }

  getDisputeAutomationConfig(): DisputeAutomationConfig {
    return this.disputeAutomation;
  }

  triageDispute(params: {
    dispute_type: string;
    amount: number;
    evidence_score: number;
    evidence_count: number;
    abuse_count_30d: number;
  }): {
    action: string;
    escalation_required: boolean;
  } {
    if (params.evidence_count === 0) {
      return { action: "request_more_evidence", escalation_required: false };
    }
    if (params.dispute_type === "no_show" && params.amount <= 300 && params.evidence_score >= 0.8) {
      return { action: "auto_refund", escalation_required: false };
    }
    if (params.abuse_count_30d >= this.disputeAutomation.abuse_threshold_per_30d) {
      return { action: "temporary_suspension", escalation_required: true };
    }
    return { action: "manual_review", escalation_required: true };
  }

  getAdvancedAnalytics(): {
    retention: { repeat_customer_rate: number };
    partner_quality_tiers: Array<{ partner_id: string; completion_rate: number; refund_rate: number; tier: string }>;
  } {
    const bookings = Array.from(this.bookings.values());
    const customerCounts = new Map<string, number>();
    for (const booking of bookings) {
      customerCounts.set(booking.customer_id, (customerCounts.get(booking.customer_id) ?? 0) + 1);
    }
    const repeatCustomers = Array.from(customerCounts.values()).filter((count) => count > 1).length;
    const repeatCustomerRate = customerCounts.size > 0 ? repeatCustomers / customerCounts.size : 0;

    const byPartner = new Map<string, Booking[]>();
    for (const booking of bookings) {
      const current = byPartner.get(booking.partner_id) ?? [];
      current.push(booking);
      byPartner.set(booking.partner_id, current);
    }

    const partnerQualityTiers = Array.from(byPartner.entries()).map(([partnerId, partnerBookings]) => {
      const completed = partnerBookings.filter((entry) => entry.status === "completed").length;
      const refunded = partnerBookings.filter((entry) => {
        if (!entry.payment_id) return false;
        return this.payments.get(entry.payment_id)?.status === "refunded";
      }).length;
      const completionRate = partnerBookings.length > 0 ? completed / partnerBookings.length : 0;
      const refundRate = partnerBookings.length > 0 ? refunded / partnerBookings.length : 0;

      let tier = "bronze";
      if (completionRate >= 0.92 && refundRate <= 0.02) tier = "gold";
      else if (completionRate >= 0.85 && refundRate <= 0.04) tier = "silver";

      return {
        partner_id: partnerId,
        completion_rate: completionRate,
        refund_rate: refundRate,
        tier
      };
    });

    return {
      retention: { repeat_customer_rate: repeatCustomerRate },
      partner_quality_tiers: partnerQualityTiers
    };
  }

  getUnitEconomicsTrend(): {
    data: Array<{
      zone_id: string;
      gross_revenue: number;
      partner_payout: number;
      contribution_margin_value: number;
      bookings: number;
      take_rate: number;
      contribution_per_booking: number;
    }>;
  } {
    const grouped = new Map<
      string,
      {
        gross_revenue: number;
        discount_amount: number;
        payment_fee: number;
        partner_payout: number;
        support_cost: number;
        refund_amount: number;
        bookings: number;
      }
    >();

    for (const row of this.unitEconomicsEntries) {
      const current = grouped.get(row.zone_id) ?? {
        gross_revenue: 0,
        discount_amount: 0,
        payment_fee: 0,
        partner_payout: 0,
        support_cost: 0,
        refund_amount: 0,
        bookings: 0
      };
      current.gross_revenue += row.gross_revenue;
      current.discount_amount += row.discount_amount;
      current.payment_fee += row.payment_fee;
      current.partner_payout += row.partner_payout;
      current.support_cost += row.support_cost;
      current.refund_amount += row.refund_amount;
      current.bookings += row.bookings;
      grouped.set(row.zone_id, current);
    }

    return {
      data: Array.from(grouped.entries()).map(([zoneId, row]) => {
        const contributionMarginValue =
          row.gross_revenue -
          row.discount_amount -
          row.payment_fee -
          row.partner_payout -
          row.support_cost -
          row.refund_amount;
        return {
          zone_id: zoneId,
          gross_revenue: row.gross_revenue,
          partner_payout: row.partner_payout,
          contribution_margin_value: contributionMarginValue,
          bookings: row.bookings,
          take_rate: row.gross_revenue > 0 ? (row.gross_revenue - row.partner_payout) / row.gross_revenue : 0,
          contribution_per_booking: row.bookings > 0 ? contributionMarginValue / row.bookings : 0
        };
      })
    };
  }

  getNotificationFeed(audience: "customer" | "partner" | "admin"): { data: NotificationEvent[] } {
    return {
      data: this.notifications.filter((entry) => entry.audience === audience)
    };
  }

  getBookingTimeline(bookingId: string): { data: NotificationEvent[] } {
    return {
      data: this.notifications.filter((entry) => entry.booking_id === bookingId)
    };
  }

  authorizePayment(params: {
    booking_id: string;
    amount: number;
    payment_method: string;
    provider_ref?: string;
  }): PaymentRecord {
    const booking = this.mustGetBooking(params.booking_id);
    const payment: PaymentRecord = {
      id: this.nextId("pay"),
      booking_id: booking.id,
      amount: params.amount,
      status: "authorized",
      provider_ref: params.provider_ref ?? `${params.payment_method}_${Date.now()}`,
      created_at: this.nowIso()
    };

    this.payments.set(payment.id, payment);
    booking.payment_id = payment.id;
    return payment;
  }

  getPaymentByBookingId(bookingId: string): PaymentRecord | null {
    const booking = this.mustGetBooking(bookingId);
    if (!booking.payment_id) {
      return null;
    }
    return this.payments.get(booking.payment_id) ?? null;
  }

  capturePayment(params: { booking_id: string }): PaymentRecord {
    const booking = this.mustGetBooking(params.booking_id);
    if (!booking.payment_id) {
      throw new BadRequestException({ code: "PAYMENT_NOT_FOUND", message: "no payment to capture" });
    }

    const payment = this.mustGetPayment(booking.payment_id);
    if (payment.status === "captured") {
      return payment;
    }
    if (payment.status === "refunded") {
      throw new BadRequestException({ code: "PAYMENT_ALREADY_REFUNDED", message: "cannot capture refunded payment" });
    }

    payment.status = "captured";
    payment.captured_at = this.nowIso();
    return payment;
  }

  refundPayment(params: { booking_id: string; reason: string }): PaymentRecord {
    const booking = this.mustGetBooking(params.booking_id);
    if (!booking.payment_id) {
      throw new BadRequestException({ code: "PAYMENT_NOT_FOUND", message: "no payment to refund" });
    }

    const payment = this.mustGetPayment(booking.payment_id);
    if (payment.status === "refunded") {
      return payment;
    }

    payment.status = "refunded";
    payment.refunded_at = this.nowIso();

    this.walletEntries.push({
      id: this.nextId("ledger"),
      partner_id: booking.partner_id,
      booking_id: booking.id,
      amount: payment.amount,
      direction: "debit",
      reason: "refund_adjustment",
      created_at: this.nowIso()
    });

    this.emitAdminAlert(`Refund issued for ${booking.id}: ${params.reason}`, booking.id);
    return payment;
  }

  transitionBooking(bookingId: string, next: BookingStatus): Booking {
    const booking = this.mustGetBooking(bookingId);
    const allowed = TRANSITIONS[booking.status] ?? [];
    if (!allowed.includes(next)) {
      throw new BadRequestException({
        code: "BOOKING_INVALID_TRANSITION",
        message: `cannot transition from ${booking.status} to ${next}`
      });
    }

    booking.status = next;
    booking.updated_at = this.nowIso();
    return booking;
  }

  getBookingStateMachineRules(): Record<BookingStatus, BookingStatus[]> {
    return TRANSITIONS;
  }

  private postSettlement(bookingId: string): void {
    const booking = this.mustGetBooking(bookingId);
    const partnerCredit = Math.round(booking.amount * (1 - this.policy.commission_rate));

    this.walletEntries.push({
      id: this.nextId("ledger"),
      partner_id: booking.partner_id,
      booking_id: booking.id,
      amount: partnerCredit,
      direction: "credit",
      reason: "settlement",
      created_at: this.nowIso()
    });
  }

  private emitBookingNotifications(eventName: string, bookingId: string): void {
    this.notifications.push({
      id: this.nextId("notif"),
      event_name: eventName,
      booking_id: bookingId,
      audience: "customer",
      message: `${eventName} for booking ${bookingId}`,
      created_at: this.nowIso()
    });

    this.notifications.push({
      id: this.nextId("notif"),
      event_name: eventName,
      booking_id: bookingId,
      audience: "partner",
      message: `${eventName} for booking ${bookingId}`,
      created_at: this.nowIso()
    });

    this.notifications.push({
      id: this.nextId("notif"),
      event_name: eventName,
      booking_id: bookingId,
      audience: "admin",
      message: `${eventName} for booking ${bookingId}`,
      created_at: this.nowIso()
    });
  }

  private emitAdminAlert(message: string, bookingId?: string): void {
    this.notifications.push({
      id: this.nextId("notif"),
      event_name: "admin.alert",
      booking_id: bookingId,
      audience: "admin",
      message,
      created_at: this.nowIso()
    });
  }

  private slotKey(branchId: string, slotAt: string): string {
    return `${branchId}:${slotAt}`;
  }

  private mustGetBooking(bookingId: string): Booking {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "booking not found" });
    }
    return booking;
  }

  private mustGetShop(shopId: string): Shop {
    const shop = this.shops.get(shopId);
    if (!shop) {
      throw new NotFoundException({ code: "SHOP_NOT_FOUND", message: "shop not found" });
    }
    return shop;
  }

  private mustGetBranch(branchId: string): Branch {
    const branch = this.branches.get(branchId);
    if (!branch) {
      throw new NotFoundException({ code: "BRANCH_NOT_FOUND", message: "branch not found" });
    }
    return branch;
  }

  private mustGetPartner(partnerId: string): PartnerProfile {
    const partner = this.partners.get(partnerId);
    if (!partner) {
      throw new NotFoundException({ code: "PARTNER_NOT_FOUND", message: "partner not found" });
    }
    return partner;
  }

  private mustGetPayment(paymentId: string): PaymentRecord {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new NotFoundException({ code: "PAYMENT_NOT_FOUND", message: "payment not found" });
    }
    return payment;
  }
}
