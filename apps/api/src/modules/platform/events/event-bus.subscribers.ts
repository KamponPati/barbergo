import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { EventBusService } from "./event-bus.service";
import { DomainEvent } from "./event-bus.types";

@Injectable()
export class EventBusSubscribers implements OnModuleInit {
  private readonly logger = new Logger(EventBusSubscribers.name);

  constructor(private readonly eventBusService: EventBusService) {}

  onModuleInit(): void {
    this.eventBusService.subscribe("booking.request.created", async (event: DomainEvent) => {
      this.logger.log(`Handled event: ${event.event_name}`);
    });
  }
}
