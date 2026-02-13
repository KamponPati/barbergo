import { ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "../src/modules/auth/auth.service";
import { RolesGuard } from "../src/modules/auth/guards/roles.guard";
import { IdempotencyService } from "../src/common/services/idempotency.service";
import { EventBusService } from "../src/modules/platform/events/event-bus.service";
import { DomainEvent } from "../src/modules/platform/events/event-bus.types";
import { AuditLogService } from "../src/common/services/audit-log.service";

describe("Security and reliability", () => {
  it("validates JWT issue + role guard enforcement", () => {
    const jwtService = new JwtService({ secret: "change-me" });
    const authService = new AuthService(jwtService, new AuditLogService());
    const guard = new RolesGuard(new Reflector());

    const token = authService.issueToken("admin_1", "admin", { ip: "127.0.0.1" });
    expect(token.access_token).toBeDefined();

    const mockContext = {
      getHandler: () => "handler",
      getClass: () => "class",
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            role: "customer"
          }
        })
      })
    };

    const reflectorSpy = jest
      .spyOn(Reflector.prototype, "getAllAndOverride")
      .mockReturnValue(["admin"]);

    expect(() => guard.canActivate(mockContext as any)).toThrow(ForbiddenException);

    reflectorSpy.mockRestore();
  });

  it("supports idempotency and dead-letter on handler failure", async () => {
    const idempotency = new IdempotencyService();
    idempotency.set(
      "idem-1",
      {
        requestHash: "hash-1",
        statusCode: 201,
        body: { ok: true }
      },
      60
    );

    expect(idempotency.get("idem-1")?.statusCode).toBe(201);

    const queueAdd = jest.fn().mockResolvedValue(undefined);
    const mockBullmq = {
      getQueue: () => ({
        add: queueAdd
      })
    };

    const mockGateway = {
      emitTimeline: jest.fn()
    };

    const mockPushProvider = {
      sendNotification: jest.fn().mockResolvedValue({ delivered: true, provider: "simulated" })
    };

    const eventBus = new EventBusService(mockBullmq as any, mockGateway as any, mockPushProvider as any);
    eventBus.subscribe("booking.request.created", async () => {
      throw new Error("handler failed");
    });

    const event: DomainEvent = {
      event_name: "booking.request.created",
      occurred_at: new Date().toISOString(),
      payload: {
        booking_id: "book_1"
      }
    };

    await eventBus.publish(event);

    expect(mockGateway.emitTimeline).toHaveBeenCalled();
    expect(queueAdd).toHaveBeenCalledTimes(1);
  });
});
