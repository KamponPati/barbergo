import { Injectable, NotFoundException } from "@nestjs/common";
import { UserRole, UserStatus } from "@prisma/client";
import { PrismaService } from "../../common/services/prisma.service";

export type SessionRecord = {
  session_id: string;
  user_id: string;
  role: string;
  refresh_token: string;
  created_at: number;
  expires_at: number;
  rotated_at?: number;
  revoked_at?: number;
  ip?: string;
  user_agent?: string;
};

export type IssueContext = {
  ip?: string;
  user_agent?: string;
};

export type AuthRepo = {
  validateUserRole(userId: string, role: string): Promise<boolean>;
  createSession(record: SessionRecord): Promise<void>;
  findSessionByRefreshToken(refreshToken: string): Promise<SessionRecord | null>;
  rotateSession(
    refreshToken: string,
    next: SessionRecord,
    now: number
  ): Promise<{ previous: SessionRecord } | null>;
  revokeByRefreshToken(refreshToken: string, now: number): Promise<{ revoked: boolean; session?: SessionRecord }>;
  revokeAllByUser(userId: string, now: number): Promise<number>;
};

function mapRole(role: string): UserRole | null {
  if (role === "admin") return UserRole.admin;
  if (role === "partner") return UserRole.partner;
  if (role === "customer") return UserRole.customer;
  return null;
}

@Injectable()
export class PrismaAuthRepo implements AuthRepo {
  constructor(private readonly prisma: PrismaService) {}

  async validateUserRole(userId: string, role: string): Promise<boolean> {
    const mapped = mapRole(role);
    if (!mapped) return false;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, status: true }
    });

    return Boolean(user && user.role === mapped && user.status === UserStatus.active);
  }

  async createSession(record: SessionRecord): Promise<void> {
    const mapped = mapRole(record.role);
    if (!mapped) {
      throw new NotFoundException({ code: "ROLE_NOT_FOUND", message: "role not supported" });
    }

    await this.prisma.authSession.create({
      data: {
        id: record.session_id,
        userId: record.user_id,
        role: mapped,
        refreshToken: record.refresh_token,
        createdAt: new Date(record.created_at),
        expiresAt: new Date(record.expires_at),
        rotatedAt: record.rotated_at ? new Date(record.rotated_at) : null,
        revokedAt: record.revoked_at ? new Date(record.revoked_at) : null,
        ip: record.ip ?? null,
        userAgent: record.user_agent ?? null
      }
    });
  }

  async findSessionByRefreshToken(refreshToken: string): Promise<SessionRecord | null> {
    const row = await this.prisma.authSession.findUnique({ where: { refreshToken } });
    if (!row) return null;

    return {
      session_id: row.id,
      user_id: row.userId,
      role: row.role,
      refresh_token: row.refreshToken,
      created_at: row.createdAt.getTime(),
      expires_at: row.expiresAt.getTime(),
      rotated_at: row.rotatedAt?.getTime(),
      revoked_at: row.revokedAt?.getTime(),
      ip: row.ip ?? undefined,
      user_agent: row.userAgent ?? undefined
    };
  }

  async rotateSession(
    refreshToken: string,
    next: SessionRecord,
    now: number
  ): Promise<{ previous: SessionRecord } | null> {
    return await this.prisma.$transaction(async (tx) => {
      const existing = await tx.authSession.findUnique({ where: { refreshToken } });
      if (!existing) return null;

      const previous: SessionRecord = {
        session_id: existing.id,
        user_id: existing.userId,
        role: existing.role,
        refresh_token: existing.refreshToken,
        created_at: existing.createdAt.getTime(),
        expires_at: existing.expiresAt.getTime(),
        rotated_at: existing.rotatedAt?.getTime(),
        revoked_at: existing.revokedAt?.getTime(),
        ip: existing.ip ?? undefined,
        user_agent: existing.userAgent ?? undefined
      };

      await tx.authSession.update({
        where: { id: existing.id },
        data: {
          rotatedAt: new Date(now),
          revokedAt: new Date(now)
        }
      });

      const mapped = mapRole(next.role);
      if (!mapped) {
        throw new NotFoundException({ code: "ROLE_NOT_FOUND", message: "role not supported" });
      }

      await tx.authSession.create({
        data: {
          id: next.session_id,
          userId: next.user_id,
          role: mapped,
          refreshToken: next.refresh_token,
          createdAt: new Date(next.created_at),
          expiresAt: new Date(next.expires_at),
          ip: next.ip ?? null,
          userAgent: next.user_agent ?? null
        }
      });

      return { previous };
    });
  }

  async revokeByRefreshToken(
    refreshToken: string,
    now: number
  ): Promise<{ revoked: boolean; session?: SessionRecord }> {
    const existing = await this.prisma.authSession.findUnique({ where: { refreshToken } });
    if (!existing) return { revoked: false };

    await this.prisma.authSession.update({
      where: { id: existing.id },
      data: { revokedAt: new Date(now) }
    });

    return {
      revoked: true,
      session: {
        session_id: existing.id,
        user_id: existing.userId,
        role: existing.role,
        refresh_token: existing.refreshToken,
        created_at: existing.createdAt.getTime(),
        expires_at: existing.expiresAt.getTime(),
        rotated_at: existing.rotatedAt?.getTime(),
        revoked_at: now,
        ip: existing.ip ?? undefined,
        user_agent: existing.userAgent ?? undefined
      }
    };
  }

  async revokeAllByUser(userId: string, now: number): Promise<number> {
    const result = await this.prisma.authSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date(now) }
    });
    return result.count;
  }
}

export class InMemoryAuthRepo implements AuthRepo {
  private readonly refreshSessions = new Map<string, SessionRecord>();
  private readonly acceptedUsers = new Map<string, string>([
    ["admin_1", "admin"],
    ["partner_1", "partner"],
    ["cust_1", "customer"]
  ]);

  async validateUserRole(userId: string, role: string): Promise<boolean> {
    const expectedRole = this.acceptedUsers.get(userId);
    return Boolean(expectedRole && expectedRole === role);
  }

  async createSession(record: SessionRecord): Promise<void> {
    this.refreshSessions.set(record.session_id, record);
  }

  async findSessionByRefreshToken(refreshToken: string): Promise<SessionRecord | null> {
    for (const session of this.refreshSessions.values()) {
      if (session.refresh_token === refreshToken) {
        return session;
      }
    }
    return null;
  }

  async rotateSession(
    refreshToken: string,
    next: SessionRecord,
    now: number
  ): Promise<{ previous: SessionRecord } | null> {
    const existing = await this.findSessionByRefreshToken(refreshToken);
    if (!existing) return null;

    existing.rotated_at = now;
    existing.revoked_at = now;
    this.refreshSessions.set(next.session_id, next);
    return { previous: existing };
  }

  async revokeByRefreshToken(
    refreshToken: string,
    now: number
  ): Promise<{ revoked: boolean; session?: SessionRecord }> {
    const existing = await this.findSessionByRefreshToken(refreshToken);
    if (!existing) return { revoked: false };
    existing.revoked_at = now;
    return { revoked: true, session: existing };
  }

  async revokeAllByUser(userId: string, now: number): Promise<number> {
    let revokedCount = 0;
    for (const session of this.refreshSessions.values()) {
      if (session.user_id === userId && !session.revoked_at) {
        session.revoked_at = now;
        revokedCount += 1;
      }
    }
    return revokedCount;
  }
}

