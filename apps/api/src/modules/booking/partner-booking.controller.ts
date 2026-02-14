import { Body, Controller, ForbiddenException, Get, Param, Post, UseGuards } from "@nestjs/common";
import { DbCoreService } from "../../common/services/db-core.service";
import { CurrentUser, CurrentUserPayload } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/roles.decorator";

@Controller("partner/bookings")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("partner")
export class PartnerBookingController {
  constructor(private readonly dbCoreService: DbCoreService) {}

  @Get("incoming/:partnerId")
  incoming(@CurrentUser() user: CurrentUserPayload, @Param("partnerId") partnerId: string) {
    if (partnerId !== user.user_id) {
      throw new ForbiddenException({ code: "PARTNER_FORBIDDEN", message: "cannot access another partner queue" });
    }
    return this.dbCoreService.listIncomingQueue(user.user_id);
  }

  @Post(":bookingId/confirm")
  confirm(@CurrentUser() user: CurrentUserPayload, @Param("bookingId") bookingId: string) {
    return this.dbCoreService.confirmBooking(bookingId, user.user_id);
  }

  @Post(":bookingId/reject")
  reject(@CurrentUser() user: CurrentUserPayload, @Param("bookingId") bookingId: string, @Body() body: { reason: string }) {
    return this.dbCoreService.rejectBooking({ booking_id: bookingId, partner_id: user.user_id, reason: body.reason });
  }

  @Post(":bookingId/reschedule")
  reschedule(@CurrentUser() user: CurrentUserPayload, @Param("bookingId") bookingId: string, @Body() body: { new_slot_at: string }) {
    return this.dbCoreService.rescheduleBooking({ booking_id: bookingId, partner_id: user.user_id, new_slot_at: body.new_slot_at });
  }

  @Post(":bookingId/start")
  start(@CurrentUser() user: CurrentUserPayload, @Param("bookingId") bookingId: string) {
    return this.dbCoreService.startBooking(bookingId, user.user_id);
  }

  @Post(":bookingId/complete")
  complete(@CurrentUser() user: CurrentUserPayload, @Param("bookingId") bookingId: string) {
    return this.dbCoreService.completeBooking(bookingId, user.user_id);
  }

  @Post(":bookingId/exception")
  exception(@Param("bookingId") bookingId: string, @Body() body: { note: string }) {
    // Keep MVP behavior for now: exception handling is an ops/admin feature.
    return { booking_id: bookingId, note: body.note, accepted: true };
  }
}
