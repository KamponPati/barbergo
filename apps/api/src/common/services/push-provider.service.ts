import { Injectable, Logger } from "@nestjs/common";

type PushConfig = {
  primaryUrl?: string;
  secondaryUrl?: string;
  apiKey?: string;
  timeoutMs: number;
  maxRetries: number;
  circuitFailureThreshold: number;
  circuitCooldownMs: number;
};

@Injectable()
export class PushProviderService {
  private readonly logger = new Logger(PushProviderService.name);
  private readonly config: PushConfig;
  private readonly circuitByUrl = new Map<string, { failures: number; openUntil?: number }>();

  constructor() {
    this.config = {
      primaryUrl: process.env.PUSH_PROVIDER_URL,
      secondaryUrl: process.env.PUSH_PROVIDER_FALLBACK_URL,
      apiKey: process.env.PUSH_PROVIDER_API_KEY,
      timeoutMs: Number(process.env.PUSH_PROVIDER_TIMEOUT_MS ?? 3000),
      maxRetries: Number(process.env.PUSH_PROVIDER_MAX_RETRIES ?? 2),
      circuitFailureThreshold: Number(process.env.PUSH_PROVIDER_CIRCUIT_FAILURE_THRESHOLD ?? 3),
      circuitCooldownMs: Number(process.env.PUSH_PROVIDER_CIRCUIT_COOLDOWN_MS ?? 30000)
    };
  }

  async sendNotification(params: {
    audience: "customer" | "partner" | "admin";
    event_name: string;
    payload: Record<string, unknown>;
  }): Promise<{ delivered: boolean; provider: string }> {
    const urls = [this.config.primaryUrl, this.config.secondaryUrl].filter((v): v is string => Boolean(v));

    // Local dev fallback: keep app working when provider is not configured.
    if (urls.length === 0) {
      return { delivered: true, provider: "simulated" };
    }

    for (const baseUrl of urls) {
      if (this.isCircuitOpen(baseUrl)) {
        continue;
      }

      for (let attempt = 1; attempt <= this.config.maxRetries + 1; attempt += 1) {
        try {
          await this.callProvider(baseUrl, params);
          this.resetCircuit(baseUrl);
          return { delivered: true, provider: baseUrl };
        } catch (error) {
          this.markFailure(baseUrl, error as Error);
          if (attempt > this.config.maxRetries) {
            break;
          }
        }
      }
    }

    this.logger.warn(`Push delivery failed for event ${params.event_name}`);
    return { delivered: false, provider: "none" };
  }

  private async callProvider(baseUrl: string, params: {
    audience: "customer" | "partner" | "admin";
    event_name: string;
    payload: Record<string, unknown>;
  }): Promise<void> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const res = await fetch(`${baseUrl}/push/send`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(this.config.apiKey ? { authorization: `Bearer ${this.config.apiKey}` } : {})
        },
        body: JSON.stringify(params),
        signal: controller.signal
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`push provider ${res.status}: ${text}`);
      }
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
      this.logger.warn(`Push circuit opened for ${url}: ${error.message}`);
    }
    this.circuitByUrl.set(url, state);
  }

  private resetCircuit(url: string): void {
    this.circuitByUrl.set(url, { failures: 0 });
  }
}
