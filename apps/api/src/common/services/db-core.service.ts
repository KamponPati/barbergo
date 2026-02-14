import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  BookingStatus,
  DisputeStatus,
  PartnerVerificationStatus,
  PaymentStatus,
  Prisma,
  ServiceMode,
  UserRole,
  UserStatus,
  WithdrawalStatus
} from "@prisma/client";
import { randomUUID } from "node:crypto";
import { PrismaService } from "./prisma.service";

type SearchFilters = {
  zone?: string;
  min_rating?: number;
  service_mode?: "in_shop" | "delivery";
  q?: string;
  lat?: number;
  lng?: number;
  sort?: "rating_desc" | "rating_asc" | "price_asc" | "price_desc" | "nearest";
};

type ApiBranch = {
  id: string;
  shop_id: string;
  name: string;
  zone: string;
  lat: number;
  lng: number;
  open_hours: string;
  capacity: number;
};

type ApiService = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  mode: "in_shop" | "delivery";
};

type ApiStaff = {
  id: string;
  name: string;
  skills: string[];
  shift_slots: string[];
};

type ApiShop = {
  id: string;
  partner_id: string;
  name: string;
  rating: number;
  branch_ids: string[];
  services: ApiService[];
  staff: ApiStaff[];
};

type ApiBooking = {
  id: string;
  customer_id: string;
  partner_id: string;
  shop_id: string;
  branch_id: string;
  service_id: string;
  slot_at: string;
  status: BookingStatus;
  amount: number;
  quote_amount: number;
  created_at: string;
  updated_at: string;
  payment_id?: string;
  cancel_reason?: string;
};

type ApiPayment = {
  id: string;
  booking_id: string;
  status: PaymentStatus;
  amount: number;
  provider_ref?: string | null;
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
export class DbCoreService {
  // Keep policy values explicit and centralized (later: move to DB-backed policy engine).
  private readonly commissionRate = 0.2;
  private readonly pricingMultiplier = 1;
  private readonly promoEnabled = true;

  constructor(private readonly prisma: PrismaService) {}

  private nextId(prefix: string): string {
    return `${prefix}_${randomUUID()}`;
  }

  private toApiBranch(row: {
    id: string;
    shopId: string;
    name: string;
    zone: string;
    lat: number;
    lng: number;
    openHours: string;
    capacity: number;
  }): ApiBranch {
    return {
      id: row.id,
      shop_id: row.shopId,
      name: row.name,
      zone: row.zone,
      lat: row.lat,
      lng: row.lng,
      open_hours: row.openHours,
      capacity: row.capacity
    };
  }

  private toApiService(row: {
    id: string;
    name: string;
    durationMinutes: number;
    price: number;
    mode: ServiceMode;
  }): ApiService {
    return {
      id: row.id,
      name: row.name,
      duration_minutes: row.durationMinutes,
      price: row.price,
      mode: row.mode
    };
  }

  private toApiStaff(row: { id: string; name: string; skills: Array<{ skill: string }> }): ApiStaff {
    return {
      id: row.id,
      name: row.name,
      skills: row.skills.map((s) => s.skill),
      shift_slots: []
    };
  }

  private toApiBooking(row: {
    id: string;
    customerId: string;
    partnerId: string;
    shopId: string;
    branchId: string;
    serviceId: string;
    slotAt: Date;
    status: BookingStatus;
    amount: number;
    quoteAmount: number;
    cancelReason: string | null;
    createdAt: Date;
    updatedAt: Date;
    payment?: { id: string } | null;
  }): ApiBooking {
    return {
      id: row.id,
      customer_id: row.customerId,
      partner_id: row.partnerId,
      shop_id: row.shopId,
      branch_id: row.branchId,
      service_id: row.serviceId,
      slot_at: row.slotAt.toISOString(),
      status: row.status,
      amount: row.amount,
      quote_amount: row.quoteAmount,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
      payment_id: row.payment?.id,
      cancel_reason: row.cancelReason ?? undefined
    };
  }

  private minPrice(services: ApiService[]): number {
    return Math.min(...services.map((s) => s.price));
  }

  private distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
    // Haversine (good enough for small datasets; Phase 6 can move to PostGIS for scale).
    const R = 6371000;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const x =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    return R * c;
  }

  private assertTransition(from: BookingStatus, to: BookingStatus): void {
    const allowed = TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
      throw new BadRequestException({
        code: "BOOKING_INVALID_TRANSITION",
        message: `cannot transition from ${from} to ${to}`
      });
    }
  }

  private toVerificationStatus(status: PartnerVerificationStatus): PartnerProfile["verification_status"] {
    if (status === PartnerVerificationStatus.approved) return "approved";
    if (status === PartnerVerificationStatus.rejected) return "rejected";
    return "pending";
  }

  private async transitionBooking(bookingId: string, to: BookingStatus, type: string): Promise<void> {
    const current = await this.prisma.booking.findUnique({ where: { id: bookingId }, select: { status: true } });
    if (!current) {
      throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "booking not found" });
    }

    this.assertTransition(current.status, to);

    await this.prisma.$transaction([
      this.prisma.booking.update({ where: { id: bookingId }, data: { status: to } }),
      this.prisma.bookingEvent.create({
        data: {
          bookingId,
          type,
          statusFrom: current.status,
          statusTo: to
        }
      })
    ]);
  }

  private async mustPartnerOwnShop(partnerId: string, shopId: string): Promise<void> {
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId }, select: { partnerId: true } });
    if (!shop) {
      throw new NotFoundException({ code: "SHOP_NOT_FOUND", message: "shop not found" });
    }
    if (shop.partnerId !== partnerId) {
      throw new BadRequestException({ code: "PARTNER_FORBIDDEN", message: "cannot edit another partner shop" });
    }
  }

  private async mustGetBookingForPartner(bookingId: string, partnerId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true, reservation: true }
    });
    if (!booking) {
      throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "booking not found" });
    }
    if (booking.partnerId !== partnerId) {
      throw new BadRequestException({ code: "PARTNER_FORBIDDEN", message: "cannot access another partner booking" });
    }
    return booking;
  }

  private async mustGetBookingForCustomer(bookingId: string, customerId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true, reservation: true }
    });
    if (!booking) {
      throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "booking not found" });
    }
    if (booking.customerId !== customerId) {
      throw new BadRequestException({ code: "CUSTOMER_FORBIDDEN", message: "cannot access another customer booking" });
    }
    return booking;
  }

  async submitPartnerOnboarding(params: { partner_name: string }): Promise<PartnerProfile> {
    const id = this.nextId("partner");
    await this.prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id,
          role: UserRole.partner,
          status: UserStatus.active
        }
      });
      await tx.partner.create({
        data: {
          id,
          userId: id,
          name: params.partner_name,
          verificationStatus: PartnerVerificationStatus.pending
        }
      });
    });

    return {
      id,
      name: params.partner_name,
      verification_status: "pending",
      documents: []
    };
  }

  async uploadPartnerDocument(params: { partner_id: string; type: string; url: string }): Promise<PartnerProfile> {
    const partner = await this.prisma.partner.findUnique({
      where: { id: params.partner_id },
      include: { documents: { orderBy: { createdAt: "desc" } } }
    });
    if (!partner) {
      throw new NotFoundException({ code: "PARTNER_NOT_FOUND", message: "partner not found" });
    }

    await this.prisma.partnerDocument.create({
      data: {
        id: this.nextId("doc"),
        partnerId: partner.id,
        type: params.type,
        // For now we store the provided URL as objectKey. Later: parse / store full S3 metadata.
        objectKey: params.url
      }
    });

    const refreshed = await this.prisma.partner.findUnique({
      where: { id: partner.id },
      include: { documents: { orderBy: { createdAt: "desc" } } }
    });
    if (!refreshed) {
      throw new NotFoundException({ code: "PARTNER_NOT_FOUND", message: "partner not found" });
    }

    return {
      id: refreshed.id,
      name: refreshed.name,
      verification_status: this.toVerificationStatus(refreshed.verificationStatus),
      documents: refreshed.documents.map((d) => ({
        id: d.id,
        type: d.type,
        url: d.objectKey,
        uploaded_at: d.createdAt.toISOString()
      }))
    };
  }

  async getPartnerVerificationStatus(partnerId: string): Promise<{ partner_id: string; status: string; documents: number }> {
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
      include: { _count: { select: { documents: true } } }
    });
    if (!partner) {
      throw new NotFoundException({ code: "PARTNER_NOT_FOUND", message: "partner not found" });
    }
    return {
      partner_id: partner.id,
      status: this.toVerificationStatus(partner.verificationStatus),
      documents: partner._count.documents
    };
  }

  async upsertBranch(params: {
    partner_id: string;
    branch_id?: string;
    shop_id: string;
    name: string;
    zone: string;
    open_hours: string;
    capacity: number;
    lat: number;
    lng: number;
  }): Promise<ApiBranch> {
    await this.mustPartnerOwnShop(params.partner_id, params.shop_id);

    const branchId = params.branch_id ?? this.nextId("branch");
    const row = await this.prisma.branch.upsert({
      where: { id: branchId },
      update: {
        shopId: params.shop_id,
        name: params.name,
        zone: params.zone,
        openHours: params.open_hours,
        capacity: params.capacity,
        lat: params.lat,
        lng: params.lng
      },
      create: {
        id: branchId,
        shopId: params.shop_id,
        name: params.name,
        zone: params.zone,
        openHours: params.open_hours,
        capacity: params.capacity,
        lat: params.lat,
        lng: params.lng
      }
    });

    return this.toApiBranch(row);
  }

  async upsertService(params: {
    partner_id: string;
    shop_id: string;
    service_id?: string;
    name: string;
    price: number;
    duration_minutes: number;
    mode: "in_shop" | "delivery";
  }): Promise<ApiService> {
    await this.mustPartnerOwnShop(params.partner_id, params.shop_id);

    const serviceId = params.service_id ?? this.nextId("svc");
    const row = await this.prisma.service.upsert({
      where: { id: serviceId },
      update: {
        shopId: params.shop_id,
        name: params.name,
        price: params.price,
        durationMinutes: params.duration_minutes,
        mode: params.mode === "delivery" ? ServiceMode.delivery : ServiceMode.in_shop
      },
      create: {
        id: serviceId,
        shopId: params.shop_id,
        name: params.name,
        price: params.price,
        durationMinutes: params.duration_minutes,
        mode: params.mode === "delivery" ? ServiceMode.delivery : ServiceMode.in_shop
      }
    });

    return this.toApiService(row);
  }

  async upsertStaff(params: {
    partner_id: string;
    shop_id: string;
    staff_id?: string;
    name: string;
    skills: string[];
    shift_slots: string[];
  }): Promise<ApiStaff> {
    await this.mustPartnerOwnShop(params.partner_id, params.shop_id);

    const staffId = params.staff_id ?? this.nextId("staff");
    const row = await this.prisma.$transaction(async (tx) => {
      const staff = await tx.staff.upsert({
        where: { id: staffId },
        update: { shopId: params.shop_id, name: params.name },
        create: { id: staffId, shopId: params.shop_id, name: params.name }
      });

      await tx.staffSkill.deleteMany({ where: { staffId: staff.id } });
      if (params.skills.length > 0) {
        await tx.staffSkill.createMany({
          data: params.skills.map((skill) => ({ id: randomUUID(), staffId: staff.id, skill }))
        });
      }

      return tx.staff.findUnique({ where: { id: staff.id }, include: { skills: true } });
    });

    if (!row) {
      throw new NotFoundException({ code: "STAFF_NOT_FOUND", message: "staff not found" });
    }
    return this.toApiStaff(row);
  }

  async createDispute(params: {
    booking_id: string;
    created_by: string;
    reason: string;
    evidence_note: string;
  }): Promise<DisputeRecord> {
    const booking = await this.mustGetBookingForCustomer(params.booking_id, params.created_by);

    this.assertTransition(booking.status, BookingStatus.disputed);

    const disputeId = this.nextId("disp");
    const dispute = await this.prisma.$transaction(async (tx) => {
      const created = await tx.dispute.create({
        data: {
          id: disputeId,
          bookingId: booking.id,
          openedBy: params.created_by,
          reason: params.reason,
          status: DisputeStatus.opened,
          evidence: { timeline: [{ at: new Date().toISOString(), note: params.evidence_note }] }
        }
      });
      await tx.booking.update({ where: { id: booking.id }, data: { status: BookingStatus.disputed } });
      await tx.bookingEvent.create({
        data: {
          bookingId: booking.id,
          type: "booking.disputed",
          statusFrom: booking.status,
          statusTo: BookingStatus.disputed,
          message: params.reason
        }
      });
      return created;
    });

    return {
      id: dispute.id,
      booking_id: dispute.bookingId,
      created_by: dispute.openedBy,
      status: "open",
      reason: dispute.reason,
      evidence_timeline: [{ at: new Date().toISOString(), note: params.evidence_note }]
    };
  }

  async adminSetPartnerVerification(params: { partner_id: string; action: "approve" | "reject" }): Promise<PartnerProfile> {
    const partner = await this.prisma.partner.update({
      where: { id: params.partner_id },
      data: {
        verificationStatus:
          params.action === "approve" ? PartnerVerificationStatus.approved : PartnerVerificationStatus.rejected
      },
      include: { documents: { orderBy: { createdAt: "desc" } } }
    });

    return {
      id: partner.id,
      name: partner.name,
      verification_status: this.toVerificationStatus(partner.verificationStatus),
      documents: partner.documents.map((d) => ({
        id: d.id,
        type: d.type,
        url: d.objectKey,
        uploaded_at: d.createdAt.toISOString()
      }))
    };
  }

  async listDisputes(): Promise<{ data: DisputeRecord[] }> {
    const rows = await this.prisma.dispute.findMany({ orderBy: { createdAt: "desc" } });
    return {
      data: rows.map((row) => {
        const evidence = row.evidence as unknown;
        const timeline =
          typeof evidence === "object" && evidence !== null && Array.isArray((evidence as any).timeline)
            ? ((evidence as any).timeline as Array<{ at: string; note: string }>)
            : [];
        return {
          id: row.id,
          booking_id: row.bookingId,
          created_by: row.openedBy,
          status: row.status === DisputeStatus.resolved ? "resolved" : "open",
          reason: row.reason,
          evidence_timeline: timeline
        };
      })
    };
  }

  async resolveDispute(params: { dispute_id: string; action: string; note: string }): Promise<DisputeRecord> {
    const dispute = await this.prisma.dispute.findUnique({ where: { id: params.dispute_id } });
    if (!dispute) {
      throw new NotFoundException({ code: "DISPUTE_NOT_FOUND", message: "dispute not found" });
    }

    const existingEvidence = dispute.evidence as unknown;
    const existingTimeline =
      typeof existingEvidence === "object" && existingEvidence !== null && Array.isArray((existingEvidence as any).timeline)
        ? ((existingEvidence as any).timeline as Array<{ at: string; note: string }>)
        : [];

    const updatedTimeline = [...existingTimeline, { at: new Date().toISOString(), note: params.note }];

    const updated = await this.prisma.dispute.update({
      where: { id: dispute.id },
      data: {
        status: DisputeStatus.resolved,
        evidence: {
          timeline: updatedTimeline,
          resolution_action: params.action
        } as any
      }
    });

    return {
      id: updated.id,
      booking_id: updated.bookingId,
      created_by: updated.openedBy,
      status: "resolved",
      reason: updated.reason,
      evidence_timeline: updatedTimeline,
      resolution_action: params.action
    };
  }

  async getDailyReconciliationSummary(date: string): Promise<{
    date: string;
    bookings: { by_status: Record<string, number>; total: number; gross_amount: number };
    payments: { by_status: Record<string, number>; total: number; gross_amount: number; mismatches: Array<{ booking_id: string; issue: string }> };
    ledger: { credits: number; debits: number; net: number };
  }> {
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);
    if (Number.isNaN(dayStart.getTime()) || Number.isNaN(dayEnd.getTime())) {
      throw new BadRequestException({ code: "INVALID_DATE", message: "date must be YYYY-MM-DD" });
    }

    const bookings = await this.prisma.booking.findMany({
      where: { createdAt: { gte: dayStart, lte: dayEnd } },
      include: { payment: true }
    });

    const bookingByStatus: Record<string, number> = {};
    let bookingGross = 0;
    for (const b of bookings) {
      bookingByStatus[b.status] = (bookingByStatus[b.status] ?? 0) + 1;
      bookingGross += b.amount;
    }

    const paymentByStatus: Record<string, number> = {};
    let paymentGross = 0;
    const mismatches: Array<{ booking_id: string; issue: string }> = [];
    for (const b of bookings) {
      const p = b.payment;
      if (!p) {
        mismatches.push({ booking_id: b.id, issue: "missing_payment" });
        continue;
      }

      paymentByStatus[p.status] = (paymentByStatus[p.status] ?? 0) + 1;
      paymentGross += p.amount;

      if (b.status === BookingStatus.completed && p.status !== PaymentStatus.captured) {
        mismatches.push({ booking_id: b.id, issue: `completed_but_payment_${p.status}` });
      }
      if (b.status === BookingStatus.cancelled && p.status !== PaymentStatus.refunded) {
        mismatches.push({ booking_id: b.id, issue: `cancelled_but_payment_${p.status}` });
      }
    }

    const ledgerRows = await this.prisma.ledgerEntry.findMany({
      where: { createdAt: { gte: dayStart, lte: dayEnd } }
    });

    let credits = 0;
    let debits = 0;
    for (const row of ledgerRows) {
      if (row.direction === "credit") credits += row.amount;
      else debits += row.amount;
    }

    return {
      date,
      bookings: { by_status: bookingByStatus, total: bookings.length, gross_amount: bookingGross },
      payments: { by_status: paymentByStatus, total: Object.values(paymentByStatus).reduce((a, b) => a + b, 0), gross_amount: paymentGross, mismatches },
      ledger: { credits, debits, net: credits - debits }
    };
  }


  async listShops(filters: SearchFilters): Promise<{ data: Array<ApiShop & { branches: ApiBranch[] }> }> {
    const where: Prisma.ShopWhereInput = {};
    if (filters.q) {
      where.OR = [{ name: { contains: filters.q, mode: "insensitive" } }];
    }

    const shops = await this.prisma.shop.findMany({
      where,
      include: {
        branches: true,
        services: true,
        staff: { include: { skills: true } }
      }
    });

    const rows = shops
      .map((shop) => {
        const branches = shop.branches.map((b) => this.toApiBranch(b));
        const services = shop.services.map((s) => this.toApiService(s));
        const staff = shop.staff.map((st) => this.toApiStaff(st));
        const apiShop: ApiShop & { branches: ApiBranch[] } = {
          id: shop.id,
          partner_id: shop.partnerId,
          name: shop.name,
          rating: shop.rating,
          branch_ids: branches.map((b) => b.id),
          services,
          staff,
          branches
        };
        return apiShop;
      })
      .filter((shop) => {
        if (filters.zone && !shop.branches.some((b) => b.zone === filters.zone)) {
          return false;
        }
        if (filters.min_rating && shop.rating < filters.min_rating) {
          return false;
        }
        if (filters.service_mode && !shop.services.some((s) => s.mode === filters.service_mode)) {
          return false;
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
    } else if (filters.sort === "nearest" && typeof filters.lat === "number" && typeof filters.lng === "number") {
      const origin = { lat: filters.lat, lng: filters.lng };
      const minDist = (shop: (ApiShop & { branches: ApiBranch[] }) & { services: ApiService[] }) =>
        Math.min(...shop.branches.map((br) => this.distanceMeters(origin, { lat: br.lat, lng: br.lng })));
      sorted.sort((a, b) => minDist(a) - minDist(b));
    }

    return { data: sorted };
  }

  async getShopDetail(shopId: string): Promise<{ shop: ApiShop; branches: ApiBranch[] }> {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        branches: true,
        services: true,
        staff: { include: { skills: true } }
      }
    });
    if (!shop) {
      throw new NotFoundException({ code: "SHOP_NOT_FOUND", message: "shop not found" });
    }

    const branches = shop.branches.map((b) => this.toApiBranch(b));
    const services = shop.services.map((s) => this.toApiService(s));
    const staff = shop.staff.map((st) => this.toApiStaff(st));

    return {
      shop: {
        id: shop.id,
        partner_id: shop.partnerId,
        name: shop.name,
        rating: shop.rating,
        branch_ids: branches.map((b) => b.id),
        services,
        staff
      },
      branches
    };
  }

  async getAvailability(params: {
    shop_id: string;
    branch_id: string;
    service_id: string;
    date: string;
  }): Promise<{ slots: string[] }> {
    // validate shop/branch/service linkage and existence
    const shop = await this.prisma.shop.findUnique({
      where: { id: params.shop_id },
      include: { services: true }
    });
    if (!shop) {
      throw new NotFoundException({ code: "SHOP_NOT_FOUND", message: "shop not found" });
    }

    const branch = await this.prisma.branch.findUnique({ where: { id: params.branch_id } });
    if (!branch) {
      throw new NotFoundException({ code: "BRANCH_NOT_FOUND", message: "branch not found" });
    }
    if (branch.shopId !== shop.id) {
      throw new BadRequestException({ code: "SHOP_BRANCH_MISMATCH", message: "branch does not belong to shop" });
    }

    const service = shop.services.find((s) => s.id === params.service_id);
    if (!service) {
      throw new NotFoundException({ code: "SERVICE_NOT_FOUND", message: "service not found" });
    }

    const starts = [9, 10, 11, 13, 14, 15, 16, 17];
    const slots = starts.map((hour) => new Date(`${params.date}T${String(hour).padStart(2, "0")}:00:00.000Z`));

    const dayStart = new Date(`${params.date}T00:00:00.000Z`);
    const dayEnd = new Date(`${params.date}T23:59:59.999Z`);
    const reserved = await this.prisma.slotReservation.findMany({
      where: {
        branchId: params.branch_id,
        slotAt: { gte: dayStart, lte: dayEnd }
      },
      select: { slotAt: true }
    });
    const reservedSet = new Set(reserved.map((r) => r.slotAt.toISOString()));

    return { slots: slots.map((d) => d.toISOString()).filter((iso) => !reservedSet.has(iso)) };
  }

  async quoteBooking(params: {
    customer_id: string;
    shop_id: string;
    service_id: string;
    promo_code?: string;
  }): Promise<{ subtotal: number; discount: number; total: number }> {
    const service = await this.prisma.service.findUnique({ where: { id: params.service_id } });
    if (!service) {
      throw new NotFoundException({ code: "SERVICE_NOT_FOUND", message: "service not found" });
    }
    if (service.shopId !== params.shop_id) {
      throw new BadRequestException({ code: "SHOP_SERVICE_MISMATCH", message: "service does not belong to shop" });
    }

    const subtotal = Math.round(service.price * this.pricingMultiplier);
    const discount = params.promo_code && this.promoEnabled ? Math.round(subtotal * 0.1) : 0;
    return { subtotal, discount, total: subtotal - discount };
  }

  async checkoutBooking(params: {
    customer_id: string;
    shop_id: string;
    branch_id: string;
    service_id: string;
    slot_at: string;
    payment_method: string;
  }): Promise<{ booking: ApiBooking; payment: ApiPayment }> {
    const slotAt = new Date(params.slot_at);
    if (Number.isNaN(slotAt.getTime())) {
      throw new BadRequestException({ code: "INVALID_SLOT_AT", message: "slot_at must be ISO date" });
    }

    const quote = await this.quoteBooking({
      customer_id: params.customer_id,
      shop_id: params.shop_id,
      service_id: params.service_id
    });

    // Validate identities exist (so later we can enforce real auth).
    const [customer, shop, branch, service] = await Promise.all([
      this.prisma.customer.findUnique({ where: { id: params.customer_id } }),
      this.prisma.shop.findUnique({ where: { id: params.shop_id } }),
      this.prisma.branch.findUnique({ where: { id: params.branch_id } }),
      this.prisma.service.findUnique({ where: { id: params.service_id } })
    ]);
    if (!customer) {
      throw new NotFoundException({ code: "CUSTOMER_NOT_FOUND", message: "customer not found" });
    }
    if (!shop) {
      throw new NotFoundException({ code: "SHOP_NOT_FOUND", message: "shop not found" });
    }
    if (!branch) {
      throw new NotFoundException({ code: "BRANCH_NOT_FOUND", message: "branch not found" });
    }
    if (!service) {
      throw new NotFoundException({ code: "SERVICE_NOT_FOUND", message: "service not found" });
    }
    if (branch.shopId !== shop.id) {
      throw new BadRequestException({ code: "SHOP_BRANCH_MISMATCH", message: "branch does not belong to shop" });
    }
    if (service.shopId !== shop.id) {
      throw new BadRequestException({ code: "SHOP_SERVICE_MISMATCH", message: "service does not belong to shop" });
    }

    const bookingId = this.nextId("book");
    const paymentId = this.nextId("pay");
    const reservationId = this.nextId("lock");

    try {
      const booking = await this.prisma.$transaction(async (tx) => {
        await tx.booking.create({
          data: {
            id: bookingId,
            customerId: customer.id,
            partnerId: shop.partnerId,
            shopId: shop.id,
            branchId: branch.id,
            serviceId: service.id,
            slotAt,
            status: BookingStatus.requested,
            amount: quote.total,
            quoteAmount: quote.total
          }
        });

        await tx.slotReservation.create({
          data: {
            id: reservationId,
            branchId: branch.id,
            slotAt,
            bookingId
          }
        });

        await tx.bookingEvent.create({
          data: { bookingId, type: "booking.created", statusFrom: null, statusTo: BookingStatus.requested }
        });

        // requested -> quoted -> authorized
        await tx.booking.update({ where: { id: bookingId }, data: { status: BookingStatus.quoted } });
        await tx.bookingEvent.create({
          data: {
            bookingId,
            type: "booking.quoted",
            statusFrom: BookingStatus.requested,
            statusTo: BookingStatus.quoted
          }
        });

        await tx.payment.create({
          data: {
            id: paymentId,
            bookingId,
            status: PaymentStatus.authorized,
            amount: quote.total
          }
        });

        await tx.booking.update({ where: { id: bookingId }, data: { status: BookingStatus.authorized } });
        await tx.bookingEvent.create({
          data: {
            bookingId,
            type: "payment.authorized",
            statusFrom: BookingStatus.quoted,
            statusTo: BookingStatus.authorized
          }
        });

        return tx.booking.findUnique({
          where: { id: bookingId },
          include: { payment: { select: { id: true } } }
        });
      });

      if (!booking) {
        throw new BadRequestException({ code: "BOOKING_CREATE_FAILED", message: "booking create failed" });
      }

      return {
        booking: this.toApiBooking(booking),
        payment: {
          id: paymentId,
          booking_id: bookingId,
          status: PaymentStatus.authorized,
          amount: quote.total,
          provider_ref: null
        }
      };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        // likely slot reservation unique conflict
        throw new BadRequestException({ code: "SLOT_CONFLICT", message: "slot already reserved" });
      }
      throw err;
    }
  }

  async listCustomerBookings(customerId: string): Promise<{ data: ApiBooking[] }> {
    const rows = await this.prisma.booking.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: { payment: { select: { id: true } } }
    });
    return { data: rows.map((b) => this.toApiBooking(b)) };
  }

  async getBookingDetail(
    bookingId: string
  ): Promise<{ booking: ApiBooking; payment?: ApiPayment; dispute?: DisputeRecord; review?: { rating: number; review?: string } }> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true, dispute: true, review: true }
    });
    if (!booking) {
      throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "booking not found" });
    }
    return {
      booking: this.toApiBooking(booking),
      payment: booking.payment
        ? {
            id: booking.payment.id,
            booking_id: booking.id,
            status: booking.payment.status,
            amount: booking.payment.amount,
            provider_ref: booking.payment.providerRef
          }
        : undefined
      ,
      dispute: booking.dispute
        ? {
            id: booking.dispute.id,
            booking_id: booking.dispute.bookingId,
            created_by: booking.dispute.openedBy,
            status: booking.dispute.status === DisputeStatus.resolved ? "resolved" : "open",
            reason: booking.dispute.reason,
            evidence_timeline: []
          }
        : undefined,
      review: booking.review
        ? {
            rating: booking.review.rating,
            review: booking.review.comment ?? undefined
          }
        : undefined
    };
  }

  async getBookingDetailForCustomer(
    bookingId: string,
    customerId: string
  ): Promise<{ booking: ApiBooking; payment?: ApiPayment; dispute?: DisputeRecord; review?: { rating: number; review?: string } }> {
    await this.mustGetBookingForCustomer(bookingId, customerId);
    return await this.getBookingDetail(bookingId);
  }

  async listIncomingQueue(partnerId: string): Promise<{ data: ApiBooking[] }> {
    const rows = await this.prisma.booking.findMany({
      where: { partnerId, status: BookingStatus.authorized },
      orderBy: { createdAt: "asc" },
      include: { payment: { select: { id: true } } }
    });
    return { data: rows.map((b) => this.toApiBooking(b)) };
  }

  async confirmBooking(bookingId: string, partnerId: string): Promise<ApiBooking> {
    await this.mustGetBookingForPartner(bookingId, partnerId);
    await this.transitionBooking(bookingId, BookingStatus.confirmed, "booking.confirmed");
    const row = await this.prisma.booking.findUnique({ where: { id: bookingId }, include: { payment: { select: { id: true } } } });
    if (!row) throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "booking not found" });
    return this.toApiBooking(row);
  }

  async rejectBooking(params: { booking_id: string; partner_id: string; reason: string }): Promise<ApiBooking> {
    const booking = await this.mustGetBookingForPartner(params.booking_id, params.partner_id);

    this.assertTransition(booking.status, BookingStatus.cancelled);

    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.cancelled, cancelReason: `partner_reject:${params.reason}` }
      });
      await tx.bookingEvent.create({
        data: {
          bookingId: booking.id,
          type: "booking.rejected",
          statusFrom: booking.status,
          statusTo: BookingStatus.cancelled,
          message: params.reason
        }
      });
      if (booking.reservation) {
        await tx.slotReservation.delete({ where: { bookingId: booking.id } });
      }
      if (booking.payment && booking.payment.status !== PaymentStatus.refunded) {
        await tx.payment.update({ where: { id: booking.payment.id }, data: { status: PaymentStatus.refunded } });
      }
    });

    const latest = await this.prisma.booking.findUnique({ where: { id: booking.id }, include: { payment: { select: { id: true } } } });
    if (!latest) throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "booking not found" });
    return this.toApiBooking(latest);
  }

  async rescheduleBooking(params: { booking_id: string; partner_id: string; new_slot_at: string }): Promise<ApiBooking> {
    const newSlotAt = new Date(params.new_slot_at);
    if (Number.isNaN(newSlotAt.getTime())) {
      throw new BadRequestException({ code: "INVALID_SLOT_AT", message: "new_slot_at must be ISO date" });
    }

    const booking = await this.mustGetBookingForPartner(params.booking_id, params.partner_id);
    if (!booking.reservation) {
      throw new BadRequestException({ code: "RESERVATION_NOT_FOUND", message: "no reservation to reschedule" });
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        // Update booking slot + reservation slot atomically.
        await tx.booking.update({ where: { id: booking.id }, data: { slotAt: newSlotAt } });
        await tx.slotReservation.update({
          where: { bookingId: booking.id },
          data: { slotAt: newSlotAt }
        });
        await tx.bookingEvent.create({
          data: {
            bookingId: booking.id,
            type: "booking.rescheduled",
            message: params.new_slot_at
          }
        });
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new BadRequestException({ code: "SLOT_CONFLICT", message: "slot already reserved" });
      }
      throw err;
    }

    const latest = await this.prisma.booking.findUnique({ where: { id: booking.id }, include: { payment: { select: { id: true } } } });
    if (!latest) throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "booking not found" });
    return this.toApiBooking(latest);
  }

  async startBooking(bookingId: string, partnerId: string): Promise<ApiBooking> {
    await this.mustGetBookingForPartner(bookingId, partnerId);
    await this.transitionBooking(bookingId, BookingStatus.started, "booking.started");
    const row = await this.prisma.booking.findUnique({ where: { id: bookingId }, include: { payment: { select: { id: true } } } });
    if (!row) throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "booking not found" });
    return this.toApiBooking(row);
  }

  async completeBooking(bookingId: string, partnerId: string): Promise<ApiBooking> {
    await this.mustGetBookingForPartner(bookingId, partnerId);
    await this.transitionBooking(bookingId, BookingStatus.completed, "booking.completed");

    // capture payment + settle ledger
    await this.capturePayment({ booking_id: bookingId });
    await this.postSettlement(bookingId);

    const row = await this.prisma.booking.findUnique({ where: { id: bookingId }, include: { payment: { select: { id: true } } } });
    if (!row) throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "booking not found" });
    return this.toApiBooking(row);
  }

  async cancelBooking(params: {
    booking_id: string;
    customer_id: string;
    reason: string;
  }): Promise<{ booking: ApiBooking; refunded: boolean }> {
    const booking = await this.mustGetBookingForCustomer(params.booking_id, params.customer_id);

    this.assertTransition(booking.status, BookingStatus.cancelled);

    const refunded = booking.payment?.status !== PaymentStatus.refunded;
    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.cancelled, cancelReason: params.reason }
      });
      await tx.bookingEvent.create({
        data: { bookingId: booking.id, type: "booking.cancelled", statusFrom: booking.status, statusTo: BookingStatus.cancelled }
      });
      if (booking.reservation) {
        await tx.slotReservation.delete({ where: { bookingId: booking.id } });
      }
      if (booking.payment && booking.payment.status !== PaymentStatus.refunded) {
        await tx.payment.update({ where: { id: booking.payment.id }, data: { status: PaymentStatus.refunded } });
      }
    });

    const latest = await this.prisma.booking.findUnique({ where: { id: booking.id }, include: { payment: { select: { id: true } } } });
    if (!latest) throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "booking not found" });
    return { booking: this.toApiBooking(latest), refunded };
  }

  async getWalletSummary(partnerId: string): Promise<{ balance: number; ledger: Array<{ id: string; partner_id: string; booking_id: string; amount: number; direction: string; reason: string; created_at: string }>; withdrawals: Array<{ id: string; partner_id: string; amount: number; status: string; created_at: string }> }> {
    const [ledgerRows, withdrawalRows] = await Promise.all([
      this.prisma.ledgerEntry.findMany({ where: { partnerId }, orderBy: { createdAt: "desc" } }),
      this.prisma.withdrawal.findMany({ where: { partnerId }, orderBy: { createdAt: "desc" } })
    ]);

    const balance = ledgerRows.reduce((acc, row) => acc + (row.direction === "credit" ? row.amount : -row.amount), 0);

    return {
      balance,
      ledger: ledgerRows.map((row) => ({
        id: row.id,
        partner_id: row.partnerId,
        booking_id: row.bookingId ?? "-",
        amount: row.amount,
        direction: row.direction,
        reason: row.reason,
        created_at: row.createdAt.toISOString()
      })),
      withdrawals: withdrawalRows.map((row) => ({
        id: row.id,
        partner_id: row.partnerId,
        amount: row.amount,
        status: row.status,
        created_at: row.createdAt.toISOString()
      }))
    };
  }

  async requestWithdrawal(partnerId: string, amount: number): Promise<{ id: string; partner_id: string; amount: number; status: string; created_at: string }> {
    if (amount <= 0) {
      throw new BadRequestException({ code: "WITHDRAWAL_INVALID", message: "invalid withdrawal amount" });
    }

    const summary = await this.getWalletSummary(partnerId);
    if (amount > summary.balance) {
      throw new BadRequestException({ code: "WITHDRAWAL_INVALID", message: "invalid withdrawal amount" });
    }

    const withdrawalId = this.nextId("wd");
    await this.prisma.$transaction(async (tx) => {
      await tx.withdrawal.create({
        data: {
          id: withdrawalId,
          partnerId,
          amount,
          status: WithdrawalStatus.requested
        }
      });
      await tx.ledgerEntry.create({
        data: {
          id: this.nextId("ledger"),
          partnerId,
          bookingId: null,
          direction: "debit",
          amount,
          reason: "withdrawal"
        }
      });
    });

    return {
      id: withdrawalId,
      partner_id: partnerId,
      amount,
      status: WithdrawalStatus.requested,
      created_at: new Date().toISOString()
    };
  }

  async getNotificationFeed(audience: "customer" | "partner" | "admin"): Promise<{ data: NotificationEvent[] }> {
    // Minimal DB-backed feed: surface latest booking events as "notifications".
    const rows = await this.prisma.bookingEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 100
    });
    return {
      data: rows.map((row) => ({
        id: row.id,
        event_name: row.type,
        booking_id: row.bookingId,
        audience,
        message: row.message ?? row.type,
        created_at: row.createdAt.toISOString()
      }))
    };
  }

  async getBookingTimeline(bookingId: string): Promise<{ data: NotificationEvent[] }> {
    const rows = await this.prisma.bookingEvent.findMany({
      where: { bookingId },
      orderBy: { createdAt: "asc" }
    });
    return {
      data: rows.map((row) => ({
        id: row.id,
        event_name: row.type,
        booking_id: row.bookingId,
        audience: "customer",
        message: row.message ?? row.type,
        created_at: row.createdAt.toISOString()
      }))
    };
  }

  async postServiceAction(params: {
    customer_id: string;
    booking_id: string;
    rating?: number;
    review?: string;
    tip_amount?: number;
    rebook_slot_at?: string;
    dispute_reason?: string;
  }): Promise<{ accepted: boolean; created_dispute_id?: string; rebook_booking_id?: string }> {
    const booking = await this.mustGetBookingForCustomer(params.booking_id, params.customer_id);

    if (params.dispute_reason) {
      // Create dispute and move booking into disputed.
      this.assertTransition(booking.status, BookingStatus.disputed);
      const disputeId = this.nextId("disp");
      await this.prisma.$transaction(async (tx) => {
        await tx.dispute.upsert({
          where: { bookingId: booking.id },
          update: {
            reason: params.dispute_reason ?? "unspecified",
            openedBy: booking.customerId,
            status: DisputeStatus.opened
          },
          create: {
            id: disputeId,
            bookingId: booking.id,
            openedBy: booking.customerId,
            reason: params.dispute_reason ?? "unspecified",
            evidence: { note: "Customer opened dispute from post-service flow" }
          }
        });
        await tx.booking.update({ where: { id: booking.id }, data: { status: BookingStatus.disputed } });
        await tx.bookingEvent.create({
          data: {
            bookingId: booking.id,
            type: "booking.disputed",
            statusFrom: booking.status,
            statusTo: BookingStatus.disputed
          }
        });
      });

      return { accepted: true, created_dispute_id: disputeId };
    }

    if (typeof params.rating === "number") {
      const rating = Math.round(params.rating);
      if (rating < 1 || rating > 5) {
        throw new BadRequestException({ code: "REVIEW_INVALID_RATING", message: "rating must be 1..5" });
      }

      await this.prisma.review.upsert({
        where: { bookingId: booking.id },
        update: { rating, comment: params.review ?? null, shopId: booking.shopId, customerId: booking.customerId },
        create: {
          id: this.nextId("rev"),
          bookingId: booking.id,
          shopId: booking.shopId,
          customerId: booking.customerId,
          rating,
          comment: params.review ?? null
        }
      });
    }

    if (params.rebook_slot_at) {
      const copy = await this.checkoutBooking({
        customer_id: booking.customerId,
        shop_id: booking.shopId,
        branch_id: booking.branchId,
        service_id: booking.serviceId,
        slot_at: params.rebook_slot_at,
        payment_method: "card"
      });
      return { accepted: true, rebook_booking_id: copy.booking.id };
    }

    // tip_amount is currently ignored at DB layer (will be part of payments/ledger later).
    return { accepted: true };
  }

  async authorizePayment(params: {
    booking_id: string;
    amount: number;
    payment_method: string;
    provider_ref?: string;
  }): Promise<ApiPayment> {
    const existing = await this.prisma.payment.findUnique({ where: { bookingId: params.booking_id } });
    if (existing) {
      return {
        id: existing.id,
        booking_id: existing.bookingId,
        status: existing.status,
        amount: existing.amount,
        provider_ref: existing.providerRef
      };
    }

    const created = await this.prisma.payment.create({
      data: {
        id: this.nextId("pay"),
        bookingId: params.booking_id,
        status: PaymentStatus.authorized,
        amount: params.amount,
        providerRef: params.provider_ref ?? `${params.payment_method}_${Date.now()}`
      }
    });

    return {
      id: created.id,
      booking_id: created.bookingId,
      status: created.status,
      amount: created.amount,
      provider_ref: created.providerRef
    };
  }

  async getPaymentByBookingId(bookingId: string): Promise<ApiPayment | null> {
    const payment = await this.prisma.payment.findUnique({ where: { bookingId } });
    if (!payment) return null;
    return {
      id: payment.id,
      booking_id: payment.bookingId,
      status: payment.status,
      amount: payment.amount,
      provider_ref: payment.providerRef
    };
  }

  async capturePayment(params: { booking_id: string }): Promise<ApiPayment> {
    const payment = await this.prisma.payment.findUnique({ where: { bookingId: params.booking_id } });
    if (!payment) {
      throw new BadRequestException({ code: "PAYMENT_NOT_FOUND", message: "no payment to capture" });
    }
    const updated = await this.prisma.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.captured } });
    return {
      id: updated.id,
      booking_id: updated.bookingId,
      status: updated.status,
      amount: updated.amount,
      provider_ref: updated.providerRef
    };
  }

  async refundPayment(params: { booking_id: string; reason: string }): Promise<ApiPayment> {
    const payment = await this.prisma.payment.findUnique({ where: { bookingId: params.booking_id } });
    if (!payment) {
      throw new BadRequestException({ code: "PAYMENT_NOT_FOUND", message: "no payment to refund" });
    }
    const updated = await this.prisma.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.refunded } });
    return {
      id: updated.id,
      booking_id: updated.bookingId,
      status: updated.status,
      amount: updated.amount,
      provider_ref: updated.providerRef
    };
  }

  private async postSettlement(bookingId: string): Promise<void> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, partnerId: true, amount: true }
    });
    if (!booking) return;

    const partnerPayout = Math.round(booking.amount * (1 - this.commissionRate));
    // Partner wallet should reflect partner payout only.
    // Platform commission should be tracked separately (Phase 6: economics ledger).
    await this.prisma.ledgerEntry.create({
      data: {
        id: this.nextId("ledger"),
        partnerId: booking.partnerId,
        bookingId: booking.id,
        direction: "credit",
        amount: partnerPayout,
        reason: "booking_settlement"
      }
    });
  }
}
