import { Module } from "@nestjs/common";
import { CommonModule } from "../../common/common.module";
import { EventBusController } from "./events/event-bus.controller";
import { EventBusService } from "./events/event-bus.service";
import { EventBusSubscribers } from "./events/event-bus.subscribers";
import { RealtimeGateway } from "./realtime/realtime.gateway";
import { PlatformNotificationsController } from "./notifications.controller";

@Module({
  imports: [CommonModule],
  controllers: [EventBusController, PlatformNotificationsController],
  providers: [EventBusService, EventBusSubscribers, RealtimeGateway],
  exports: [EventBusService, RealtimeGateway]
})
export class PlatformModule {}
