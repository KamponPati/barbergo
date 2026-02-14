import { Body, Controller, Get, NotImplementedException, Param, Post } from "@nestjs/common";
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
    // TODO(Phase 5): implement reject with refund and slot release.
    return this.dbCoreService.cancelBooking({ booking_id: bookingId, reason: `partner_reject:${body.reason}` });
  }

  @Post(":bookingId/reschedule")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  reschedule(@Param("bookingId") bookingId: string, @Body() body: { new_slot_at: string }) {
    // TODO(Phase 5): implement reschedule with reservation swap.
    throw new NotImplementedException({
      code: "RESCHEDULE_NOT_IMPLEMENTED",
      message: "reschedule is not implemented yet"
    });
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
