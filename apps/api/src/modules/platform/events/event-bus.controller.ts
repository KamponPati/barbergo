import { Body, Controller, Post } from "@nestjs/common";
import { EventBusService } from "./event-bus.service";

type PublishEventRequest = {
  event_name: string;
  payload?: Record<string, unknown>;
  request_id?: string;
  actor_user_id?: string;
};

@Controller("events")
export class EventBusController {
  constructor(private readonly eventBusService: EventBusService) {}

  @Post("publish")
  async publish(@Body() body: PublishEventRequest): Promise<{ accepted: boolean }> {
    await this.eventBusService.publish({
      event_name: body.event_name,
      occurred_at: new Date().toISOString(),
      request_id: body.request_id,
      actor_user_id: body.actor_user_id,
      payload: body.payload ?? {}
    });

    return { accepted: true };
  }
}
