import { Body, Controller, ForbiddenException, Get, Param, Post, UseGuards } from "@nestjs/common";
import { DbCoreService } from "../../common/services/db-core.service";
import { CurrentUser, CurrentUserPayload } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/roles.decorator";

@Controller("customer/bookings")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("customer")
export class CustomerBookingController {
  constructor(private readonly dbCoreService: DbCoreService) {}

  @Post("quote")
  async quote(
    @CurrentUser() user: CurrentUserPayload,
    @Body()
    body: {
      customer_id: string;
      shop_id: string;
      service_id: string;
      promo_code?: string;
    }
  ) {
    return await this.dbCoreService.quoteBooking({
      ...body,
      customer_id: user.user_id
    });
  }

  @Post("checkout")
  async checkout(
    @CurrentUser() user: CurrentUserPayload,
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
    return await this.dbCoreService.checkoutBooking({
      ...body,
      customer_id: user.user_id
    });
  }

  @Get(":customerId")
  history(@CurrentUser() user: CurrentUserPayload, @Param("customerId") customerId: string) {
    if (customerId !== user.user_id) {
      throw new ForbiddenException({ code: "CUSTOMER_FORBIDDEN", message: "cannot access another customer history" });
    }
    return this.dbCoreService.listCustomerBookings(user.user_id);
  }

  @Get("detail/:bookingId")
  detail(@CurrentUser() user: CurrentUserPayload, @Param("bookingId") bookingId: string) {
    return this.dbCoreService.getBookingDetailForCustomer(bookingId, user.user_id);
  }

  @Post(":bookingId/cancel")
  cancel(@CurrentUser() user: CurrentUserPayload, @Param("bookingId") bookingId: string, @Body() body: { reason: string }) {
    return this.dbCoreService.cancelBooking({ booking_id: bookingId, customer_id: user.user_id, reason: body.reason });
  }

  @Post(":bookingId/post-service")
  postService(
    @CurrentUser() user: CurrentUserPayload,
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
      customer_id: user.user_id,
      booking_id: bookingId,
      rating: body.rating,
      review: body.review,
      tip_amount: body.tip_amount,
      rebook_slot_at: body.rebook_slot_at,
      dispute_reason: body.dispute_reason
    });
  }
}
