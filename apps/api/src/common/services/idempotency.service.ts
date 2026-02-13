import { Injectable } from "@nestjs/common";

type IdempotencyRecord = {
  requestHash: string;
  statusCode: number;
  body: unknown;
  expiresAt: number;
};

@Injectable()
export class IdempotencyService {
  private readonly records = new Map<string, IdempotencyRecord>();

  private cleanupExpired(now: number): void {
    for (const [key, value] of this.records.entries()) {
      if (value.expiresAt <= now) {
        this.records.delete(key);
      }
    }
  }

  get(key: string): IdempotencyRecord | null {
    const now = Date.now();
    this.cleanupExpired(now);
    return this.records.get(key) ?? null;
  }

  set(key: string, value: Omit<IdempotencyRecord, "expiresAt">, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.records.set(key, { ...value, expiresAt });
  }
}
