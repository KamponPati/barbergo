import { Module } from "@nestjs/common";
import { CommonModule } from "../../common/common.module";
import { PaymentController } from "./payment.controller";

@Module({
  imports: [CommonModule],
  controllers: [PaymentController]
})
export class PaymentModule {}
