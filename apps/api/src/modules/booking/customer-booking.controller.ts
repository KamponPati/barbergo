import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { MvpCoreService } from "../../common/services/mvp-core.service";

@Controller("customer/bookings")
export class CustomerBookingController {
  constructor(private readonly mvpCoreService: MvpCoreService) {}

  @Post("quote")
  quote(
    @Body()
    body: {
      customer_id: string;
      shop_id: string;
      service_id: string;
      promo_code?: string;
    }
  ) {
    return this.mvpCoreService.quoteBooking(body);
  }

  @Post("checkout")
  checkout(
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
    return this.mvpCoreService.checkoutBooking(body);
  }

  @Get(":customerId")
  history(@Param("customerId") customerId: string) {
    return this.mvpCoreService.listCustomerBookings(customerId);
  }

  @Get("detail/:bookingId")
  detail(@Param("bookingId") bookingId: string) {
    return this.mvpCoreService.getBookingDetail(bookingId);
  }

  @Post(":bookingId/cancel")
  cancel(@Param("bookingId") bookingId: string, @Body() body: { reason: string }) {
    return this.mvpCoreService.cancelBooking({ booking_id: bookingId, reason: body.reason });
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
    return this.mvpCoreService.postServiceAction({
      booking_id: bookingId,
      rating: body.rating,
      review: body.review,
      tip_amount: body.tip_amount,
      rebook_slot_at: body.rebook_slot_at,
      dispute_reason: body.dispute_reason
    });
  }
}
