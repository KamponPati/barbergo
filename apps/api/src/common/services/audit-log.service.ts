import { Injectable } from "@nestjs/common";

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

  record(entry: Omit<AuditLogEntry, "id" | "created_at">): AuditLogEntry {
    const log: AuditLogEntry = {
      id: `audit_${this.logs.length + 1}`,
      created_at: new Date().toISOString(),
      ...entry
    };

    this.logs.push(log);
    return log;
  }

  list(): AuditLogEntry[] {
    return [...this.logs].reverse();
  }
}
