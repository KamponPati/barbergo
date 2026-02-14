import { HttpException, HttpStatus, Inject, Injectable, Optional, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { randomUUID } from "node:crypto";
import { AuditLogService } from "../../common/services/audit-log.service";
import { AuthRepo, InMemoryAuthRepo, IssueContext, SessionRecord } from "./auth.repo";

type LoginAttempt = {
  failed_count: number;
  lock_until?: number;
  first_attempt_at: number;
  last_attempt_at: number;
};

type IssueResult = {
  access_token: string;
  refresh_token: string;
  expires_in_seconds: number;
  refresh_expires_in_seconds: number;
};

export const AUTH_REPO_TOKEN = "AUTH_REPO_TOKEN";

@Injectable()
export class AuthService {
  private readonly attempts = new Map<string, LoginAttempt>();
  private readonly ipWindow = new Map<string, { count: number; started_at: number }>();
  private readonly accessTtlSeconds = 60 * 60;
  private readonly refreshTtlSeconds = 7 * 24 * 60 * 60;
  private readonly lockoutThreshold = 5;
  private readonly lockoutDurationMs = 15 * 60 * 1000;
  private readonly rateWindowMs = 60 * 1000;
  private readonly rateLimitPerMinute = 25;
  private readonly repo: AuthRepo;

  constructor(
    private readonly jwtService: JwtService,
    private readonly auditLogService: AuditLogService,
    @Optional()
    @Inject(AUTH_REPO_TOKEN)
    repo?: AuthRepo
  ) {
    this.repo = repo ?? new InMemoryAuthRepo();
  }

  async issueToken(userId: string, role: string, context: IssueContext): Promise<IssueResult> {
    this.enforceIpRateLimit(context.ip);
    this.enforceLockout(userId);

    const validUser = await this.repo.validateUserRole(userId, role);
    if (!validUser) {
      this.recordLoginFailure(userId, context);
      throw new UnauthorizedException({
        code: "AUTH_INVALID_CREDENTIALS",
        message: "invalid credentials"
      });
    }

    this.clearLoginFailure(userId);
    const sessionId = `sess_${randomUUID()}`;
    const refreshToken = `rt_${randomUUID()}`;
    const now = Date.now();
    const session: SessionRecord = {
      session_id: sessionId,
      user_id: userId,
      role,
      refresh_token: refreshToken,
      created_at: now,
      expires_at: now + this.refreshTtlSeconds * 1000,
      ip: context.ip,
      user_agent: context.user_agent
    };

    await this.repo.createSession(session);

    const payload = {
      sub: userId,
      role,
      sid: sessionId
    };

    void this.auditLogService.record({
      action: "auth.login.success",
      actor_user_id: userId,
      request_id: undefined,
      path: "/api/v1/auth/login",
      method: "POST",
      metadata: {
        role,
        session_id: sessionId,
        ip: context.ip
      }
    });

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: `${this.accessTtlSeconds}s` }),
      refresh_token: refreshToken,
      expires_in_seconds: this.accessTtlSeconds,
      refresh_expires_in_seconds: this.refreshTtlSeconds
    };
  }

  async rotateRefreshToken(refreshToken: string, context: IssueContext): Promise<IssueResult> {
    const existing = await this.repo.findSessionByRefreshToken(refreshToken);
    if (!existing) {
      void this.auditLogService.record({
        action: "auth.refresh.invalid_token",
        actor_user_id: undefined,
        request_id: undefined,
        path: "/api/v1/auth/refresh",
        method: "POST",
        metadata: { ip: context.ip }
      });
      throw new UnauthorizedException({
        code: "AUTH_REFRESH_INVALID",
        message: "invalid refresh token"
      });
    }

    const now = Date.now();
    if (existing.revoked_at || existing.expires_at <= now) {
      throw new UnauthorizedException({
        code: "AUTH_REFRESH_EXPIRED",
        message: "refresh token expired or revoked"
      });
    }

    const nextSessionId = `sess_${randomUUID()}`;
    const nextRefreshToken = `rt_${randomUUID()}`;
    const next: SessionRecord = {
      session_id: nextSessionId,
      user_id: existing.user_id,
      role: existing.role,
      refresh_token: nextRefreshToken,
      created_at: now,
      expires_at: now + this.refreshTtlSeconds * 1000,
      ip: context.ip,
      user_agent: context.user_agent
    };

    const rotated = await this.repo.rotateSession(refreshToken, next, now);
    if (!rotated) {
      throw new UnauthorizedException({
        code: "AUTH_REFRESH_INVALID",
        message: "invalid refresh token"
      });
    }

    const accessToken = this.jwtService.sign(
      {
        sub: existing.user_id,
        role: existing.role,
        sid: nextSessionId
      },
      { expiresIn: `${this.accessTtlSeconds}s` }
    );

    void this.auditLogService.record({
      action: "auth.refresh.success",
      actor_user_id: existing.user_id,
      request_id: undefined,
      path: "/api/v1/auth/refresh",
      method: "POST",
      metadata: {
        previous_session_id: existing.session_id,
        next_session_id: nextSessionId,
        ip: context.ip
      }
    });

    return {
      access_token: accessToken,
      refresh_token: nextRefreshToken,
      expires_in_seconds: this.accessTtlSeconds,
      refresh_expires_in_seconds: this.refreshTtlSeconds
    };
  }

  async revokeByRefreshToken(refreshToken: string, actorUserId?: string): Promise<{ revoked: boolean }> {
    const now = Date.now();
    const result = await this.repo.revokeByRefreshToken(refreshToken, now);
    if (!result.revoked || !result.session) {
      return { revoked: false };
    }

    void this.auditLogService.record({
      action: "auth.logout",
      actor_user_id: actorUserId ?? result.session.user_id,
      request_id: undefined,
      path: "/api/v1/auth/logout",
      method: "POST",
      metadata: {
        session_id: result.session.session_id
      }
    });
    return { revoked: true };
  }

  async revokeAllByUser(userId: string): Promise<{ revoked_count: number }> {
    const now = Date.now();
    const revokedCount = await this.repo.revokeAllByUser(userId, now);

    void this.auditLogService.record({
      action: "auth.logout_all",
      actor_user_id: userId,
      request_id: undefined,
      path: "/api/v1/auth/logout-all",
      method: "POST",
      metadata: {
        revoked_count: revokedCount
      }
    });

    return { revoked_count: revokedCount };
  }

  private enforceIpRateLimit(ip?: string): void {
    const key = ip ?? "unknown";
    const now = Date.now();
    const current = this.ipWindow.get(key);
    if (!current || now - current.started_at > this.rateWindowMs) {
      this.ipWindow.set(key, { count: 1, started_at: now });
      return;
    }

    current.count += 1;
    if (current.count > this.rateLimitPerMinute) {
      throw new HttpException(
        {
          code: "AUTH_RATE_LIMITED",
          message: "too many login attempts, retry later"
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
  }

  private enforceLockout(userId: string): void {
    const state = this.attempts.get(userId);
    const now = Date.now();
    if (state?.lock_until && state.lock_until > now) {
      throw new UnauthorizedException({
        code: "AUTH_ACCOUNT_LOCKED",
        message: "account is temporarily locked"
      });
    }
  }

  private recordLoginFailure(userId: string, context: IssueContext): void {
    const now = Date.now();
    const current = this.attempts.get(userId) ?? {
      failed_count: 0,
      first_attempt_at: now,
      last_attempt_at: now
    };
    current.failed_count += 1;
    current.last_attempt_at = now;
    if (current.failed_count >= this.lockoutThreshold) {
      current.lock_until = now + this.lockoutDurationMs;
      current.failed_count = 0;
    }
    this.attempts.set(userId, current);

    this.auditLogService.record({
      action: "auth.login.failed",
      actor_user_id: userId,
      request_id: undefined,
      path: "/api/v1/auth/login",
      method: "POST",
      metadata: {
        ip: context.ip,
        lock_until: current.lock_until
      }
    });
  }

  private clearLoginFailure(userId: string): void {
    this.attempts.delete(userId);
  }
}
