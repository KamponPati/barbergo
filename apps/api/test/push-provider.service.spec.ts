import { PushProviderService } from "../src/common/services/push-provider.service";

describe("PushProviderService", () => {
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

  it("returns simulated success when provider URLs are not configured", async () => {
    delete process.env.PUSH_PROVIDER_URL;
    delete process.env.PUSH_PROVIDER_FALLBACK_URL;
    const service = new PushProviderService();

    const res = await service.sendNotification({
      audience: "customer",
      event_name: "booking.created",
      payload: { booking_id: "book_1" }
    });

    expect(res.delivered).toBe(true);
    expect(res.provider).toBe("simulated");
  });

  it("uses fallback push provider when primary fails", async () => {
    process.env.PUSH_PROVIDER_URL = "https://primary.push";
    process.env.PUSH_PROVIDER_FALLBACK_URL = "https://fallback.push";
    process.env.PUSH_PROVIDER_MAX_RETRIES = "0";
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "error"
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => "ok"
      }) as typeof fetch;

    const service = new PushProviderService();
    const res = await service.sendNotification({
      audience: "partner",
      event_name: "booking.confirmed",
      payload: { booking_id: "book_2" }
    });

    expect(res.delivered).toBe(true);
    expect(res.provider).toBe("https://fallback.push");
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe("https://primary.push/push/send");
    expect((global.fetch as jest.Mock).mock.calls[1][0]).toBe("https://fallback.push/push/send");
  });
});
