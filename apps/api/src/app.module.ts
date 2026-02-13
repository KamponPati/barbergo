import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { DiscoveryModule } from "./modules/discovery/discovery.module";
import { BookingModule } from "./modules/booking/booking.module";
import { PaymentModule } from "./modules/payment/payment.module";
import { SettlementModule } from "./modules/settlement/settlement.module";
import { TrustModule } from "./modules/trust/trust.module";
import { AdminModule } from "./modules/admin/admin.module";
import { CommonModule } from "./common/common.module";
import { AuditLogMiddleware } from "./common/middleware/audit-log.middleware";
import { IdempotencyMiddleware } from "./common/middleware/idempotency.middleware";
import { MetricsMiddleware } from "./common/middleware/metrics.middleware";
import { RequestContextMiddleware } from "./common/middleware/request-context.middleware";
import { PlatformModule } from "./modules/platform/platform.module";

@Module({
  imports: [
    CommonModule,
    PlatformModule,
    AuthModule,
    DiscoveryModule,
    BookingModule,
    PaymentModule,
    SettlementModule,
    TrustModule,
    AdminModule
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestContextMiddleware, MetricsMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });

    consumer
      .apply(IdempotencyMiddleware, AuditLogMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
