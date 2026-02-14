import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

type RequestWithContext = Request & { requestId?: string; user?: { sub?: string; role?: string } };

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  use(req: RequestWithContext, res: Response, next: NextFunction): void {
    const startedAt = Date.now();

    res.on("finish", () => {
      const durationMs = Date.now() - startedAt;
      // JSON logs keep Loki/Grafana parsing simple. Avoid dumping request bodies.
      const log = {
        ts: new Date().toISOString(),
        level: "info",
        msg: "http_request",
        request_id: req.requestId ?? null,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration_ms: durationMs,
        user_id: (req.user as any)?.sub ?? null,
        role: (req.user as any)?.role ?? null
      };
      console.log(JSON.stringify(log));
    });

    next();
  }
}
