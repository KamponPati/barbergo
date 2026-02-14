import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { DbCoreService } from "../../common/services/db-core.service";

@Controller("partner/bookings")
export class PartnerBookingController {
  constructor(private readonly dbCoreService: DbCoreService) {}

  @Get("incoming/:partnerId")
  incoming(@Param("partnerId") partnerId: string) {
    return this.dbCoreService.listIncomingQueue(partnerId);
  }

  @Post(":bookingId/confirm")
  confirm(@Param("bookingId") bookingId: string) {
    return this.dbCoreService.confirmBooking(bookingId);
  }

  @Post(":bookingId/reject")
  reject(@Param("bookingId") bookingId: string, @Body() body: { reason: string }) {
    return this.dbCoreService.rejectBooking({ booking_id: bookingId, reason: body.reason });
  }

  @Post(":bookingId/reschedule")
  reschedule(@Param("bookingId") bookingId: string, @Body() body: { new_slot_at: string }) {
    return this.dbCoreService.rescheduleBooking({ booking_id: bookingId, new_slot_at: body.new_slot_at });
  }

  @Post(":bookingId/start")
  start(@Param("bookingId") bookingId: string) {
    return this.dbCoreService.startBooking(bookingId);
  }

  @Post(":bookingId/complete")
  complete(@Param("bookingId") bookingId: string) {
    return this.dbCoreService.completeBooking(bookingId);
  }

  @Post(":bookingId/exception")
  exception(@Param("bookingId") bookingId: string, @Body() body: { note: string }) {
    // Keep MVP behavior for now: exception handling is an ops/admin feature.
    return { booking_id: bookingId, note: body.note, accepted: true };
  }
}
