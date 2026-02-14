import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { DbCoreService } from "../../common/services/db-core.service";

@Controller("customer/bookings")
export class CustomerBookingController {
  constructor(private readonly dbCoreService: DbCoreService) {}

  @Post("quote")
  async quote(
    @Body()
    body: {
      customer_id: string;
      shop_id: string;
      service_id: string;
      promo_code?: string;
    }
  ) {
    return await this.dbCoreService.quoteBooking(body);
  }

  @Post("checkout")
  async checkout(
    @Body()
    body: {
      customer_id: string;
      shop_id: string;
      branch_id: string;
      service_id: string;
      slot_at: string;
      payment_method: string;
    }
  ) {
    return await this.dbCoreService.checkoutBooking(body);
  }

  @Get(":customerId")
  history(@Param("customerId") customerId: string) {
    return this.dbCoreService.listCustomerBookings(customerId);
  }

  @Get("detail/:bookingId")
  detail(@Param("bookingId") bookingId: string) {
    return this.dbCoreService.getBookingDetail(bookingId);
  }

  @Post(":bookingId/cancel")
  cancel(@Param("bookingId") bookingId: string, @Body() body: { reason: string }) {
    return this.dbCoreService.cancelBooking({ booking_id: bookingId, reason: body.reason });
  }

  @Post(":bookingId/post-service")
  postService(
    @Param("bookingId") bookingId: string,
    @Body()
    body: {
      rating?: number;
      review?: string;
      tip_amount?: number;
      rebook_slot_at?: string;
      dispute_reason?: string;
    }
  ) {
    return this.dbCoreService.postServiceAction({
      booking_id: bookingId,
      rating: body.rating,
      review: body.review,
      tip_amount: body.tip_amount,
      rebook_slot_at: body.rebook_slot_at,
      dispute_reason: body.dispute_reason
    });
  }
}
