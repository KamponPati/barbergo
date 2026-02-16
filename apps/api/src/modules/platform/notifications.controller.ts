import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { DbCoreService } from "../../common/services/db-core.service";

@Controller("platform")
export class PlatformNotificationsController {
  constructor(private readonly dbCoreService: DbCoreService) {}
  private readonly deviceRegistry = new Map<string, { role: string; user_id: string; platform: string; updated_at: string }>();

  @Get("notifications/:audience")
  notifications(@Param("audience") audience: "customer" | "partner" | "admin") {
    return this.dbCoreService.getNotificationFeed(audience);
  }

  @Get("timeline/:bookingId")
  timeline(@Param("bookingId") bookingId: string) {
    return this.dbCoreService.getBookingTimeline(bookingId);
  }

  @Post("devices/register")
  registerDevice(
    @Body()
    body: {
      role: "customer" | "partner" | "admin";
      user_id: string;
      device_token: string;
      platform?: string;
    }
  ) {
    this.deviceRegistry.set(body.device_token, {
      role: body.role,
      user_id: body.user_id,
      platform: body.platform ?? "unknown",
      updated_at: new Date().toISOString()
    });
    return { ok: true };
  }

  @Get("devices")
  listRegisteredDevices() {
    return {
      data: Array.from(this.deviceRegistry.entries()).map(([device_token, value]) => ({
        device_token,
        ...value
      }))
    };
  }
}
