import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Queue } from "bullmq";

@Injectable()
export class BullmqService implements OnModuleDestroy {
  private readonly queues = new Map<string, Queue>();

  getQueue(name: string): Queue {
    const existing = this.queues.get(name);
    if (existing) {
      return existing;
    }

    const queue = new Queue(name, {
      connection: {
        url: process.env.REDIS_URL ?? "redis://localhost:6379"
      }
    });

    this.queues.set(name, queue);
    return queue;
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all(Array.from(this.queues.values()).map((queue) => queue.close()));
  }
}
