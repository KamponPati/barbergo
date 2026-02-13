import { MvpCoreService } from "../src/common/services/mvp-core.service";

describe("App bootstrap", () => {
  it("keeps analytics endpoint contract stable", () => {
    const service = new MvpCoreService();
    const analytics = service.getAnalyticsOverview();

    expect(analytics).toEqual(
      expect.objectContaining({
        total_bookings: expect.any(Number),
        completed_bookings: expect.any(Number),
        cancellation_rate: expect.any(Number)
      })
    );
  });
});
