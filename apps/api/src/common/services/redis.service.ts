import { Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: Redis;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      lazyConnect: true,
      maxRetriesPerRequest: null
    });
  }

  async connectIfNeeded(): Promise<void> {
    if (this.client.status === "ready") {
      return;
    }
    if (this.client.status === "connecting" || this.client.status === "connect") {
      return;
    }
    if (this.client.status === "end") {
      return;
    }

    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.status !== "end") {
      await this.client.quit();
    }
  }
}
