import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { MvpCoreService } from "../../common/services/mvp-core.service";

@Controller("partner/bookings")
export class PartnerBookingController {
  constructor(private readonly mvpCoreService: MvpCoreService) {}

  @Get("incoming/:partnerId")
  incoming(@Param("partnerId") partnerId: string) {
    return this.mvpCoreService.listIncomingQueue(partnerId);
  }

  @Post(":bookingId/confirm")
  confirm(@Param("bookingId") bookingId: string) {
    return this.mvpCoreService.confirmBooking(bookingId);
  }

  @Post(":bookingId/reject")
  reject(@Param("bookingId") bookingId: string, @Body() body: { reason: string }) {
    return this.mvpCoreService.rejectBooking({ booking_id: bookingId, reason: body.reason });
  }

  @Post(":bookingId/reschedule")
  reschedule(@Param("bookingId") bookingId: string, @Body() body: { new_slot_at: string }) {
    return this.mvpCoreService.rescheduleBooking({
      booking_id: bookingId,
      new_slot_at: body.new_slot_at
    });
  }

  @Post(":bookingId/start")
  start(@Param("bookingId") bookingId: string) {
    return this.mvpCoreService.startBooking(bookingId);
  }

  @Post(":bookingId/complete")
  complete(@Param("bookingId") bookingId: string) {
    return this.mvpCoreService.completeBooking(bookingId);
  }

  @Post(":bookingId/exception")
  exception(@Param("bookingId") bookingId: string, @Body() body: { note: string }) {
    return this.mvpCoreService.markException(bookingId, body.note);
  }
}
