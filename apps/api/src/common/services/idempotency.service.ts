import { Injectable } from "@nestjs/common";
import { RedisService } from "./redis.service";

type IdempotencyRecord = {
  requestHash: string;
  statusCode: number;
  body: unknown;
  expiresAt: number;
};

@Injectable()
export class IdempotencyService {
  private readonly records = new Map<string, IdempotencyRecord>();

  constructor(private readonly redisService: RedisService) {}

  private cleanupExpired(now: number): void {
    for (const [key, value] of this.records.entries()) {
      if (value.expiresAt <= now) {
        this.records.delete(key);
      }
    }
  }

  private async tryGetFromRedis(key: string): Promise<IdempotencyRecord | null> {
    try {
      await this.redisService.connectIfNeeded();
      const raw = await this.redisService.client.get(`idmp:${key}`);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as IdempotencyRecord;
    } catch {
      return null;
    }
  }

  private async trySetToRedis(key: string, value: IdempotencyRecord, ttlSeconds: number): Promise<void> {
    try {
      await this.redisService.connectIfNeeded();
      await this.redisService.client.set(`idmp:${key}`, JSON.stringify(value), "EX", ttlSeconds);
    } catch {
      // ignore - we always keep an in-memory fallback
    }
  }

  async get(key: string): Promise<IdempotencyRecord | null> {
    const now = Date.now();
    this.cleanupExpired(now);
    const cached = this.records.get(key) ?? null;
    if (cached) {
      return cached;
    }

    const fromRedis = await this.tryGetFromRedis(key);
    if (fromRedis && fromRedis.expiresAt > now) {
      this.records.set(key, fromRedis);
      return fromRedis;
    }
    return null;
  }

  async set(key: string, value: Omit<IdempotencyRecord, "expiresAt">, ttlSeconds: number): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    const record: IdempotencyRecord = { ...value, expiresAt };
    this.records.set(key, record);
    await this.trySetToRedis(key, record, ttlSeconds);
  }
}
