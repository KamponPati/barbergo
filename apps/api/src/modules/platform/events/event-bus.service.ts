import { Injectable, Logger } from "@nestjs/common";
import { BullmqService } from "../../../common/services/bullmq.service";
import { PushProviderService } from "../../../common/services/push-provider.service";
import { DomainEvent, EventHandler } from "./event-bus.types";
import { RealtimeGateway } from "../realtime/realtime.gateway";

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);
  private readonly handlers = new Map<string, EventHandler[]>();

  constructor(
    private readonly bullmqService: BullmqService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly pushProviderService: PushProviderService
  ) {}

  subscribe(eventName: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventName) ?? [];
    this.handlers.set(eventName, [...existing, handler]);
  }

  async publish(event: DomainEvent): Promise<void> {
    this.realtimeGateway.emitTimeline(event.event_name, event.payload);
    await this.dispatchPush(event);

    const handlers = this.handlers.get(event.event_name) ?? [];
    if (handlers.length === 0) {
      return;
    }

    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        this.logger.error(`Event handler failed for ${event.event_name}`, error as Error);
        await this.pushToDeadLetter(event, error as Error);
      }
    }
  }

  private async dispatchPush(event: DomainEvent): Promise<void> {
    const requested = (event.payload as { audience?: unknown }).audience;
    const audiences = this.resolveAudiences(requested);

    for (const audience of audiences) {
      const result = await this.pushProviderService.sendNotification({
        audience,
        event_name: event.event_name,
        payload: event.payload
      });

      if (!result.delivered) {
        this.logger.warn(`Push delivery unavailable for ${event.event_name} -> ${audience}`);
      }
    }
  }

  private resolveAudiences(input: unknown): Array<"customer" | "partner" | "admin"> {
    if (input === "customer" || input === "partner" || input === "admin") {
      return [input];
    }
    if (Array.isArray(input)) {
      const values = input.filter(
        (entry): entry is "customer" | "partner" | "admin" =>
          entry === "customer" || entry === "partner" || entry === "admin"
      );
      if (values.length > 0) {
        return values;
      }
    }
    return ["customer", "partner", "admin"];
  }

  private async pushToDeadLetter(event: DomainEvent, error: Error): Promise<void> {
    const queue = this.bullmqService.getQueue("dead-letter-events");

    await queue.add(
      "event_handler_failed",
      {
        ...event,
        failed_at: new Date().toISOString(),
        error_message: error.message
      },
      {
        attempts: 1,
        removeOnComplete: 100,
        removeOnFail: 1000
      }
    );
  }
}
