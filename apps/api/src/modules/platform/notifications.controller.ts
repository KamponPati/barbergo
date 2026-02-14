import { Controller, Get, Param } from "@nestjs/common";
import { DbCoreService } from "../../common/services/db-core.service";

@Controller("platform")
export class PlatformNotificationsController {
  constructor(private readonly dbCoreService: DbCoreService) {}

  @Get("notifications/:audience")
  notifications(@Param("audience") audience: "customer" | "partner" | "admin") {
    return this.dbCoreService.getNotificationFeed(audience);
  }

  @Get("timeline/:bookingId")
  timeline(@Param("bookingId") bookingId: string) {
    return this.dbCoreService.getBookingTimeline(bookingId);
  }
}
