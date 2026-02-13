import { BadRequestException, Body, Controller, Headers, HttpCode, Post } from "@nestjs/common";
import { MvpCoreService } from "../../common/services/mvp-core.service";
import { PaymentGatewayService } from "../../common/services/payment-gateway.service";

@Controller("payments")
export class PaymentController {
  constructor(
    private readonly mvpCoreService: MvpCoreService,
    private readonly paymentGatewayService: PaymentGatewayService
  ) {}

  @Post("authorize")
  async authorize(@Body() body: { booking_id: string; amount: number; payment_method: string }) {
    const provider = await this.paymentGatewayService.authorize({
      booking_id: body.booking_id,
      amount: body.amount,
      payment_method: body.payment_method
    });

    const payment = this.mvpCoreService.authorizePayment({
      booking_id: body.booking_id,
      amount: body.amount,
      payment_method: body.payment_method,
      provider_ref: provider.provider_ref
    });

    return {
      payment,
      provider
    };
  }

  @Post("capture")
  async capture(@Body() body: { booking_id: string }) {
    const payment = this.mvpCoreService.getPaymentByBookingId(body.booking_id);
    if (!payment) {
      throw new BadRequestException({ code: "PAYMENT_NOT_FOUND", message: "no payment to capture" });
    }

    const provider = await this.paymentGatewayService.capture({
      booking_id: body.booking_id,
      amount: payment.amount,
      provider_ref: payment.provider_ref
    });

    return {
      payment: this.mvpCoreService.capturePayment(body),
      provider
    };
  }

  @Post("refund")
  async refund(@Body() body: { booking_id: string; reason: string }) {
    const payment = this.mvpCoreService.getPaymentByBookingId(body.booking_id);
    if (!payment) {
      throw new BadRequestException({ code: "PAYMENT_NOT_FOUND", message: "no payment to refund" });
    }

    const provider = await this.paymentGatewayService.refund({
      booking_id: body.booking_id,
      amount: payment.amount,
      provider_ref: payment.provider_ref,
      reason: body.reason
    });

    return {
      payment: this.mvpCoreService.refundPayment(body),
      provider
    };
  }

  @Post("webhook")
  @HttpCode(200)
  webhook(
    @Body() body: { booking_id: string; status: "authorized" | "captured" | "refunded" },
    @Headers("x-provider-signature") signature?: string
  ): { accepted: boolean } {
    const rawPayload = JSON.stringify(body);
    const valid = this.paymentGatewayService.verifyWebhookSignature(rawPayload, signature);
    if (!valid) {
      throw new BadRequestException({ code: "INVALID_PROVIDER_SIGNATURE", message: "invalid webhook signature" });
    }

    if (body.status === "captured") {
      this.mvpCoreService.capturePayment({ booking_id: body.booking_id });
    } else if (body.status === "refunded") {
      this.mvpCoreService.refundPayment({ booking_id: body.booking_id, reason: "provider_webhook" });
    }

    return { accepted: true };
  }
}
