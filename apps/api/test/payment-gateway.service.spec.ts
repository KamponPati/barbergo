import { PaymentGatewayService } from "../src/common/services/payment-gateway.service";

describe("PaymentGatewayService", () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("returns simulated response when provider URLs are not configured", async () => {
    delete process.env.PAYMENT_PROVIDER_URL;
    delete process.env.PAYMENT_PROVIDER_FALLBACK_URL;
    const service = new PaymentGatewayService();

    const res = await service.authorize({
      booking_id: "book_1",
      amount: 350,
      payment_method: "card"
    });

    expect(res.status).toBe("authorized");
    expect(res.provider_ref.startsWith("sim_")).toBe(true);
  });

  it("uses fallback provider when primary fails", async () => {
    process.env.PAYMENT_PROVIDER_URL = "https://primary.pay";
    process.env.PAYMENT_PROVIDER_FALLBACK_URL = "https://fallback.pay";
    process.env.PAYMENT_PROVIDER_MAX_RETRIES = "0";
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ error: "down" })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ provider_ref: "ext_123" })
      }) as typeof fetch;

    const service = new PaymentGatewayService();
    const res = await service.authorize({
      booking_id: "book_2",
      amount: 550,
      payment_method: "card"
    });

    expect(res.provider_ref).toBe("ext_123");
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe("https://primary.pay/payments/authorize");
    expect((global.fetch as jest.Mock).mock.calls[1][0]).toBe("https://fallback.pay/payments/authorize");
  });
});
