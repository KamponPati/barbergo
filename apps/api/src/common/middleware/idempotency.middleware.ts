import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { createHash } from "node:crypto";
import { IdempotencyService } from "../services/idempotency.service";

type RequestWithContext = Request & { requestId?: string };

type JsonBody = Record<string, unknown> | string | null;

@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  constructor(private readonly idempotencyService: IdempotencyService) {}

  private requiresIdempotency(method: string, path: string): boolean {
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      return false;
    }

    if (path.startsWith("/health") || path.startsWith("/metrics") || path.startsWith("/docs")) {
      return false;
    }

    return true;
  }

  private buildRequestHash(req: Request): string {
    return createHash("sha256")
      .update(req.method)
      .update(req.originalUrl)
      .update(JSON.stringify(req.body ?? {}))
      .digest("hex");
  }

  use(req: RequestWithContext, res: Response, next: NextFunction): void {
    if (!this.requiresIdempotency(req.method, req.path)) {
      next();
      return;
    }

    const key = req.header("Idempotency-Key");
    if (!key) {
      res.status(400).json({
        code: "VALIDATION_IDEMPOTENCY_KEY_REQUIRED",
        message: "Idempotency-Key header is required",
        request_id: req.requestId ?? null
      });
      return;
    }

    const scopeKey = `${req.ip}:${req.method}:${req.path}:${key}`;
    const requestHash = this.buildRequestHash(req);
    const existing = this.idempotencyService.get(scopeKey);

    if (existing) {
      if (existing.requestHash !== requestHash) {
        res.status(409).json({
          code: "IDEMPOTENCY_CONFLICT",
          message: "Idempotency key already used with different payload",
          request_id: req.requestId ?? null
        });
        return;
      }

      res.setHeader("x-idempotent-replay", "true");
      res.status(existing.statusCode).json(existing.body as JsonBody);
      return;
    }

    const originalJson = res.json.bind(res);
    res.json = (body: JsonBody): Response => {
      const statusCode = res.statusCode;
      if (statusCode >= 200 && statusCode < 500) {
        const ttlSeconds = Number(process.env.IDEMPOTENCY_TTL_SECONDS ?? 86400);
        this.idempotencyService.set(
          scopeKey,
          {
            requestHash,
            statusCode,
            body
          },
          ttlSeconds
        );
      }

      return originalJson(body);
    };

    next();
  }
}
