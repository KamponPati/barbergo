import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, DisputeStatus, PaymentStatus, Prisma, ServiceMode } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { PrismaService } from "./prisma.service";

type SearchFilters = {
  zone?: string;
  min_rating?: number;
  service_mode?: "in_shop" | "delivery";
  q?: string;
  sort?: "rating_desc" | "rating_asc" | "price_asc" | "price_desc";
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

  private assertTransition(from: BookingStatus, to: BookingStatus): void {
    const allowed = TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
      throw new BadRequestException({
        code: "BOOKING_INVALID_TRANSITION",
        message: `cannot transition from ${from} to ${to}`
      });
    }
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

  async getBookingDetail(bookingId: string): Promise<{ booking: ApiBooking; payment?: ApiPayment }> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true }
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
    };
  }

  async listIncomingQueue(partnerId: string): Promise<{ data: ApiBooking[] }> {
    const rows = await this.prisma.booking.findMany({
      where: { partnerId, status: BookingStatus.authorized },
      orderBy: { createdAt: "asc" },
      include: { payment: { select: { id: true } } }
    });
    return { data: rows.map((b) => this.toApiBooking(b)) };
  }

  async confirmBooking(bookingId: string): Promise<ApiBooking> {
    await this.transitionBooking(bookingId, BookingStatus.confirmed, "booking.confirmed");
    const row = await this.prisma.booking.findUnique({ where: { id: bookingId }, include: { payment: { select: { id: true } } } });
    if (!row) throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "booking not found" });
    return this.toApiBooking(row);
  }

  async startBooking(bookingId: string): Promise<ApiBooking> {
    await this.transitionBooking(bookingId, BookingStatus.started, "booking.started");
    const row = await this.prisma.booking.findUnique({ where: { id: bookingId }, include: { payment: { select: { id: true } } } });
    if (!row) throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "booking not found" });
    return this.toApiBooking(row);
  }

  async completeBooking(bookingId: string): Promise<ApiBooking> {
    await this.transitionBooking(bookingId, BookingStatus.completed, "booking.completed");

    // capture payment + settle ledger
    await this.capturePayment({ booking_id: bookingId });
    await this.postSettlement(bookingId);

    const row = await this.prisma.booking.findUnique({ where: { id: bookingId }, include: { payment: { select: { id: true } } } });
    if (!row) throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "booking not found" });
    return this.toApiBooking(row);
  }

  async cancelBooking(params: { booking_id: string; reason: string }): Promise<{ booking: ApiBooking; refunded: boolean }> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: params.booking_id },
      include: { payment: true, reservation: true }
    });
    if (!booking) {
      throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "booking not found" });
    }

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

  async postServiceAction(params: {
    booking_id: string;
    rating?: number;
    review?: string;
    tip_amount?: number;
    rebook_slot_at?: string;
    dispute_reason?: string;
  }): Promise<{ accepted: boolean; created_dispute_id?: string; rebook_booking_id?: string }> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: params.booking_id },
      include: { review: true, dispute: true }
    });
    if (!booking) {
      throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "booking not found" });
    }

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
        providerRef: params.provider_ref
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
    await this.prisma.ledgerEntry.createMany({
      data: [
        {
          id: this.nextId("ledger"),
          partnerId: booking.partnerId,
          bookingId: booking.id,
          direction: "credit",
          amount: partnerPayout,
          reason: "booking_settlement"
        },
        {
          id: this.nextId("ledger"),
          partnerId: booking.partnerId,
          bookingId: booking.id,
          direction: "debit",
          amount: booking.amount - partnerPayout,
          reason: "commission"
        }
      ]
    });
  }
}
