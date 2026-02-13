import { Module } from "@nestjs/common";
import { CommonModule } from "../../common/common.module";
import { CustomerBookingController } from "./customer-booking.controller";
import { PartnerBookingController } from "./partner-booking.controller";
import { BookingPlatformController } from "./booking.controller";

@Module({
  imports: [CommonModule],
  controllers: [CustomerBookingController, PartnerBookingController, BookingPlatformController]
})
export class BookingModule {}
