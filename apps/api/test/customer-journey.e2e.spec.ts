import { MvpCoreService } from "../src/common/services/mvp-core.service";

describe("Customer booking journey e2e", () => {
  it("covers search -> detail -> availability -> quote -> checkout -> partner confirm -> complete -> history", () => {
    const service = new MvpCoreService();

    const search = service.listShops({
      q: "downtown",
      sort: "rating_desc"
    });
    expect(search.data.length).toBeGreaterThan(0);

    const shopId = search.data[0].id;
    const detail = service.getShopDetail(shopId);
    expect(detail.shop.services.length).toBeGreaterThan(0);

    const availability = service.getAvailability({
      shop_id: shopId,
      branch_id: detail.branches[0].id,
      service_id: detail.shop.services[0].id,
      date: "2026-02-15"
    });

    const quote = service.quoteBooking({
      customer_id: "cust_1",
      shop_id: shopId,
      service_id: detail.shop.services[0].id,
      promo_code: "PROMO10"
    });
    expect(quote.total).toBeGreaterThan(0);

    const checkout = service.checkoutBooking({
      customer_id: "cust_1",
      shop_id: shopId,
      branch_id: detail.branches[0].id,
      service_id: detail.shop.services[0].id,
      slot_at: availability.slots[0],
      payment_method: "card"
    });

    service.confirmBooking(checkout.booking.id);
    service.startBooking(checkout.booking.id);
    const completed = service.completeBooking(checkout.booking.id);

    expect(completed.status).toBe("completed");

    const history = service.listCustomerBookings("cust_1");
    expect(history.data.some((entry) => entry.id === checkout.booking.id)).toBe(true);
  });
});
