import { Controller, Get, Param } from "@nestjs/common";
import { MvpCoreService } from "../../common/services/mvp-core.service";

@Controller("platform")
export class PlatformNotificationsController {
  constructor(private readonly mvpCoreService: MvpCoreService) {}

  @Get("notifications/:audience")
  notifications(@Param("audience") audience: "customer" | "partner" | "admin") {
    return this.mvpCoreService.getNotificationFeed(audience);
  }

  @Get("timeline/:bookingId")
  timeline(@Param("bookingId") bookingId: string) {
    return this.mvpCoreService.getBookingTimeline(bookingId);
  }
}
