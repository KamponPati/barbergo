import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { AuditLogService } from "../services/audit-log.service";

type RequestWithContext = Request & {
  requestId?: string;
  user?: {
    user_id?: string;
  };
};

@Injectable()
export class AuditLogMiddleware implements NestMiddleware {
  constructor(private readonly auditLogService: AuditLogService) {}

  use(req: RequestWithContext, _res: Response, next: NextFunction): void {
    const isPrivilegedPath = req.path.startsWith("/api/v1/admin") || req.path.startsWith("/api/v1/auth/admin-only");

    if (isPrivilegedPath) {
      void this.auditLogService.record({
        action: "privileged_api_access",
        actor_user_id: req.user?.user_id,
        request_id: req.requestId,
        path: req.path,
        method: req.method,
        metadata: {
          ip: req.ip
        }
      });
    }

    next();
  }
}
