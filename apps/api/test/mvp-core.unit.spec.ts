import { BadRequestException } from "@nestjs/common";
import { MvpCoreService } from "../src/common/services/mvp-core.service";

describe("MvpCoreService unit", () => {
  let service: MvpCoreService;

  beforeEach(() => {
    service = new MvpCoreService();
  });

  it("enforces booking state machine transitions", () => {
    const checkout = service.checkoutBooking({
      customer_id: "cust_1",
      shop_id: "shop_1",
      branch_id: "branch_1",
      service_id: "svc_1",
      slot_at: "2026-02-14T09:00:00.000Z",
      payment_method: "card"
    });

    expect(checkout.booking.status).toBe("authorized");

    service.confirmBooking(checkout.booking.id);
    service.startBooking(checkout.booking.id);
    const completed = service.completeBooking(checkout.booking.id);

    expect(completed.status).toBe("completed");

    expect(() => service.startBooking(checkout.booking.id)).toThrow(BadRequestException);
  });

  it("prevents slot conflict transactionally", () => {
    service.checkoutBooking({
      customer_id: "cust_1",
      shop_id: "shop_1",
      branch_id: "branch_1",
      service_id: "svc_1",
      slot_at: "2026-02-14T10:00:00.000Z",
      payment_method: "card"
    });

    expect(() =>
      service.checkoutBooking({
        customer_id: "cust_2",
        shop_id: "shop_1",
        branch_id: "branch_1",
        service_id: "svc_1",
        slot_at: "2026-02-14T10:00:00.000Z",
        payment_method: "card"
      })
    ).toThrow(BadRequestException);
  });

  it("supports payment authorize/capture/refund lifecycle", () => {
    const checkout = service.checkoutBooking({
      customer_id: "cust_1",
      shop_id: "shop_1",
      branch_id: "branch_1",
      service_id: "svc_1",
      slot_at: "2026-02-14T11:00:00.000Z",
      payment_method: "card"
    });

    service.confirmBooking(checkout.booking.id);
    service.startBooking(checkout.booking.id);
    service.completeBooking(checkout.booking.id);

    const refunded = service.refundPayment({
      booking_id: checkout.booking.id,
      reason: "quality issue"
    });

    expect(refunded.status).toBe("refunded");
  });
});
