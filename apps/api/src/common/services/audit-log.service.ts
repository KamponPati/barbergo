import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { PrismaService } from "./prisma.service";
import { Prisma } from "@prisma/client";

type AuditLogEntry = {
  id: string;
  action: string;
  actor_user_id?: string;
  request_id?: string;
  path: string;
  method: string;
  created_at: string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class AuditLogService {
  private readonly logs: AuditLogEntry[] = [];

  constructor(private readonly prismaService?: PrismaService) {}

  async record(entry: Omit<AuditLogEntry, "id" | "created_at">): Promise<AuditLogEntry> {
    const log: AuditLogEntry = {
      id: `audit_${randomUUID()}`,
      created_at: new Date().toISOString(),
      ...entry
    };

    this.logs.push(log);
    if (this.prismaService && process.env.SKIP_DB_CONNECT !== "true") {
      void this.prismaService.auditLog
        .create({
          data: {
            action: log.action,
            actorUserId: log.actor_user_id ?? null,
            requestId: log.request_id ?? null,
            path: log.path,
            method: log.method,
            metadata: (log.metadata ?? Prisma.JsonNull) as unknown as Prisma.InputJsonValue
          }
        })
        .catch(() => {
          // Best-effort; audit must not break request paths.
        });
    }
    return log;
  }

  async list(): Promise<AuditLogEntry[]> {
    if (this.prismaService && process.env.SKIP_DB_CONNECT !== "true") {
      try {
        const rows = await this.prismaService.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 200
        });
        return rows.map((row) => ({
          id: row.id,
          action: row.action,
          actor_user_id: row.actorUserId ?? undefined,
          request_id: row.requestId ?? undefined,
          path: row.path ?? "",
          method: row.method ?? "",
          created_at: row.createdAt.toISOString(),
          metadata: (row.metadata as Record<string, unknown> | null) ?? undefined
        }));
      } catch {
        // fall through
      }
    }

    return [...this.logs].reverse();
  }
}
