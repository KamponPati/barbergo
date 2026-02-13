import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { NextFunction, Request, Response } from "express";

type RequestWithContext = Request & { requestId?: string };

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: RequestWithContext, res: Response, next: NextFunction): void {
    const incomingRequestId = req.header("x-request-id");
    const requestId = incomingRequestId && incomingRequestId.length > 0 ? incomingRequestId : randomUUID();

    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);

    next();
  }
}
