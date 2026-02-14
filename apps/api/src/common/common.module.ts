import { Module } from "@nestjs/common";
import { HealthController } from "./controllers/health.controller";
import { MetricsController } from "./controllers/metrics.controller";
import { AuditLogService } from "./services/audit-log.service";
import { BullmqService } from "./services/bullmq.service";
import { IdempotencyService } from "./services/idempotency.service";
import { MetricsService } from "./services/metrics.service";
import { MinioService } from "./services/minio.service";
import { PaymentGatewayService } from "./services/payment-gateway.service";
import { PrismaService } from "./services/prisma.service";
import { DbCoreService } from "./services/db-core.service";
import { MvpCoreService } from "./services/mvp-core.service";
import { PushProviderService } from "./services/push-provider.service";
import { RedisService } from "./services/redis.service";

@Module({
  controllers: [HealthController, MetricsController],
  providers: [
    MetricsService,
    IdempotencyService,
    PrismaService,
    DbCoreService,
    RedisService,
    BullmqService,
    MinioService,
    AuditLogService,
    MvpCoreService,
    PaymentGatewayService,
    PushProviderService
  ],
  exports: [
    MetricsService,
    IdempotencyService,
    PrismaService,
    DbCoreService,
    RedisService,
    BullmqService,
    MinioService,
    AuditLogService,
    MvpCoreService,
    PaymentGatewayService,
    PushProviderService
  ]
})
export class CommonModule {}
