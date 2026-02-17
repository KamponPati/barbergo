import { AuthController } from "../src/modules/auth/auth.controller";

describe("AuthController profile/settings", () => {
  it("delegates profile read to db core service", async () => {
    const authService = {} as any;
    const dbCoreService = {
      getUserProfile: jest.fn().mockResolvedValue({
        user_id: "cust_1",
        role: "customer",
        display_name: "Demo Customer",
        status: "active",
        locale: "th-TH",
        time_zone: "Asia/Bangkok"
      })
    } as any;
    const controller = new AuthController(authService, dbCoreService);

    const result = await controller.meProfile({ user_id: "cust_1", role: "customer" });
    expect(dbCoreService.getUserProfile).toHaveBeenCalledWith("cust_1");
    expect(result.display_name).toBe("Demo Customer");
  });

  it("delegates settings read and write to db core service", async () => {
    const authService = {} as any;
    const dbCoreService = {
      getUserSettings: jest.fn().mockResolvedValue({
        locale: "th-TH",
        time_zone: "Asia/Bangkok",
        email_alerts: true,
        push_alerts: true,
        compact_mode: false
      }),
      updateUserSettings: jest.fn().mockResolvedValue({
        locale: "en-US",
        time_zone: "UTC",
        email_alerts: false,
        push_alerts: true,
        compact_mode: true
      })
    } as any;
    const controller = new AuthController(authService, dbCoreService);

    const current = await controller.meSettings({ user_id: "partner_1", role: "partner" });
    expect(dbCoreService.getUserSettings).toHaveBeenCalledWith("partner_1");
    expect(current.locale).toBe("th-TH");

    const updated = await controller.updateMeSettings(
      { user_id: "partner_1", role: "partner" },
      {
        locale: "en-US",
        time_zone: "UTC",
        email_alerts: false,
        push_alerts: true,
        compact_mode: true
      }
    );
    expect(dbCoreService.updateUserSettings).toHaveBeenCalledWith("partner_1", {
      locale: "en-US",
      time_zone: "UTC",
      email_alerts: false,
      push_alerts: true,
      compact_mode: true
    });
    expect(updated.compact_mode).toBe(true);
  });
});
