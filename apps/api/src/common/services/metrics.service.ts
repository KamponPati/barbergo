import { Injectable } from "@nestjs/common";

@Injectable()
export class MetricsService {
  private readonly startedAt = Date.now();
  private totalRequests = 0;

  incrementRequests(): void {
    this.totalRequests += 1;
  }

  renderPrometheus(): string {
    const uptimeSeconds = Math.floor((Date.now() - this.startedAt) / 1000);

    return [
      "# HELP barbergo_requests_total Total HTTP requests handled by API",
      "# TYPE barbergo_requests_total counter",
      `barbergo_requests_total ${this.totalRequests}`,
      "# HELP barbergo_uptime_seconds API process uptime in seconds",
      "# TYPE barbergo_uptime_seconds gauge",
      `barbergo_uptime_seconds ${uptimeSeconds}`
    ].join("\n");
  }
}
