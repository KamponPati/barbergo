import { HttpException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuditLogService } from "../src/common/services/audit-log.service";
import { AuthService } from "../src/modules/auth/auth.service";

describe("Auth hardening", () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(new JwtService({ secret: "change-me" }), new AuditLogService());
  });

  it("locks account after repeated invalid attempts", async () => {
    for (let i = 0; i < 5; i += 1) {
      try {
        await service.issueToken("admin_1", "customer", { ip: "10.0.0.1" });
      } catch {
        // expected
      }
    }

    await expect(service.issueToken("admin_1", "admin", { ip: "10.0.0.1" })).rejects.toThrow(UnauthorizedException);
  });

  it("rotates refresh token and invalidates previous token", async () => {
    const issued = await service.issueToken("admin_1", "admin", { ip: "10.0.0.2" });
    const rotated = await service.rotateRefreshToken(issued.refresh_token, { ip: "10.0.0.2" });

    expect(rotated.access_token).toBeDefined();
    expect(rotated.refresh_token).not.toBe(issued.refresh_token);

    await expect(service.rotateRefreshToken(issued.refresh_token, { ip: "10.0.0.2" })).rejects.toThrow(UnauthorizedException);
  });

  it("revokes session by refresh token", async () => {
    const issued = await service.issueToken("partner_1", "partner", { ip: "10.0.0.3" });
    const revoked = await service.revokeByRefreshToken(issued.refresh_token);

    expect(revoked.revoked).toBe(true);
    await expect(service.rotateRefreshToken(issued.refresh_token, { ip: "10.0.0.3" })).rejects.toThrow(UnauthorizedException);
  });

  it("enforces login rate limit by ip", async () => {
    let rateLimited = false;

    for (let i = 0; i < 35; i += 1) {
      try {
        await service.issueToken(`unknown_${i}`, "admin", { ip: "10.0.0.44" });
      } catch (error) {
        if (error instanceof HttpException && error.getStatus() === 429) {
          rateLimited = true;
          break;
        }
      }
    }

    expect(rateLimited).toBe(true);
  });
});
