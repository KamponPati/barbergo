import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { createHmac, randomUUID } from "node:crypto";

type ProviderResult = {
  provider_ref: string;
  status: "authorized" | "captured" | "refunded";
  raw: unknown;
};

type GatewayConfig = {
  primaryUrl?: string;
  secondaryUrl?: string;
  apiKey?: string;
  webhookSecret?: string;
  timeoutMs: number;
  maxRetries: number;
  circuitFailureThreshold: number;
  circuitCooldownMs: number;
};

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);
  private readonly config: GatewayConfig;
  private readonly circuitByUrl = new Map<string, { failures: number; openUntil?: number }>();

  constructor() {
    this.config = {
      primaryUrl: process.env.PAYMENT_PROVIDER_URL,
      secondaryUrl: process.env.PAYMENT_PROVIDER_FALLBACK_URL,
      apiKey: process.env.PAYMENT_PROVIDER_API_KEY,
      webhookSecret: process.env.PAYMENT_PROVIDER_WEBHOOK_SECRET,
      timeoutMs: Number(process.env.PAYMENT_PROVIDER_TIMEOUT_MS ?? 3000),
      maxRetries: Number(process.env.PAYMENT_PROVIDER_MAX_RETRIES ?? 2),
      circuitFailureThreshold: Number(process.env.PAYMENT_PROVIDER_CIRCUIT_FAILURE_THRESHOLD ?? 3),
      circuitCooldownMs: Number(process.env.PAYMENT_PROVIDER_CIRCUIT_COOLDOWN_MS ?? 30000)
    };
  }

  async authorize(params: {
    booking_id: string;
    amount: number;
    payment_method: string;
  }): Promise<ProviderResult> {
    const payload = {
      type: "authorize",
      booking_id: params.booking_id,
      amount: params.amount,
      payment_method: params.payment_method
    };

    return this.perform("/payments/authorize", payload, "authorized");
  }

  async capture(params: { provider_ref: string; booking_id: string; amount: number }): Promise<ProviderResult> {
    const payload = {
      type: "capture",
      provider_ref: params.provider_ref,
      booking_id: params.booking_id,
      amount: params.amount
    };

    return this.perform("/payments/capture", payload, "captured");
  }

  async refund(params: { provider_ref: string; booking_id: string; amount: number; reason: string }): Promise<ProviderResult> {
    const payload = {
      type: "refund",
      provider_ref: params.provider_ref,
      booking_id: params.booking_id,
      amount: params.amount,
      reason: params.reason
    };

    return this.perform("/payments/refund", payload, "refunded");
  }

  verifyWebhookSignature(rawPayload: string, signature?: string): boolean {
    if (!this.config.webhookSecret) {
      return true;
    }
    if (!signature) {
      return false;
    }

    const expected = createHmac("sha256", this.config.webhookSecret).update(rawPayload).digest("hex");
    return signature === expected;
  }

  private async perform(path: string, payload: Record<string, unknown>, status: ProviderResult["status"]): Promise<ProviderResult> {
    const urls = [this.config.primaryUrl, this.config.secondaryUrl].filter((u): u is string => Boolean(u));

    // Local dev fallback if provider endpoint is not configured.
    if (urls.length === 0) {
      return {
        provider_ref: `sim_${randomUUID()}`,
        status,
        raw: {
          provider: "simulated",
          payload
        }
      };
    }

    let lastError: Error | null = null;

    for (const baseUrl of urls) {
      if (this.isCircuitOpen(baseUrl)) {
        continue;
      }

      for (let attempt = 1; attempt <= this.config.maxRetries + 1; attempt += 1) {
        try {
          const response = await this.callProvider(baseUrl, path, payload);
          this.resetCircuit(baseUrl);
          return {
            provider_ref: String(response.provider_ref ?? `ext_${randomUUID()}`),
            status,
            raw: response
          };
        } catch (error) {
          lastError = error as Error;
          this.markFailure(baseUrl, lastError);
          if (attempt > this.config.maxRetries) {
            break;
          }
        }
      }
    }

    throw new HttpException(
      {
        code: "PAYMENT_PROVIDER_UNAVAILABLE",
        message: "payment provider is unavailable",
        detail: lastError?.message
      },
      HttpStatus.BAD_GATEWAY
    );
  }

  private async callProvider(baseUrl: string, path: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(this.config.apiKey ? { authorization: `Bearer ${this.config.apiKey}` } : {})
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        throw new Error(`provider status ${res.status}: ${JSON.stringify(json)}`);
      }
      return json;
    } finally {
      clearTimeout(timer);
    }
  }

  private isCircuitOpen(url: string): boolean {
    const state = this.circuitByUrl.get(url);
    if (!state?.openUntil) {
      return false;
    }
    if (state.openUntil <= Date.now()) {
      this.circuitByUrl.set(url, { failures: 0 });
      return false;
    }
    return true;
  }

  private markFailure(url: string, error: Error): void {
    const state = this.circuitByUrl.get(url) ?? { failures: 0 };
    state.failures += 1;
    if (state.failures >= this.config.circuitFailureThreshold) {
      state.openUntil = Date.now() + this.config.circuitCooldownMs;
      this.logger.warn(`Circuit opened for ${url}: ${error.message}`);
    }
    this.circuitByUrl.set(url, state);
  }

  private resetCircuit(url: string): void {
    this.circuitByUrl.set(url, { failures: 0 });
  }
}
