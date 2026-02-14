import { Injectable } from "@nestjs/common";

@Injectable()
export class MetricsService {
  private readonly startedAt = Date.now();
  private totalRequests = 0;
  private totalErrors = 0;
  private readonly statusCounts = new Map<number, number>();
  private durationMsSum = 0;
  private durationMsCount = 0;

  incrementRequests(): void {
    this.totalRequests += 1;
  }

  recordRequest(status: number, durationMs: number): void {
    this.totalRequests += 1;
    this.durationMsSum += durationMs;
    this.durationMsCount += 1;
    this.statusCounts.set(status, (this.statusCounts.get(status) ?? 0) + 1);
    if (status >= 500) this.totalErrors += 1;
  }

  renderPrometheus(): string {
    const uptimeSeconds = Math.floor((Date.now() - this.startedAt) / 1000);
    const avgDurationMs = this.durationMsCount > 0 ? this.durationMsSum / this.durationMsCount : 0;

    const statusLines: string[] = [];
    for (const [status, count] of [...this.statusCounts.entries()].sort((a, b) => a[0] - b[0])) {
      statusLines.push(`barbergo_http_responses_total{status="${status}"} ${count}`);
    }

    return [
      "# HELP barbergo_requests_total Total HTTP requests handled by API",
      "# TYPE barbergo_requests_total counter",
      `barbergo_requests_total ${this.totalRequests}`,
      "# HELP barbergo_http_responses_total Total HTTP responses by status code",
      "# TYPE barbergo_http_responses_total counter",
      ...statusLines,
      "# HELP barbergo_errors_total Total HTTP 5xx responses",
      "# TYPE barbergo_errors_total counter",
      `barbergo_errors_total ${this.totalErrors}`,
      "# HELP barbergo_http_request_duration_ms_avg Average HTTP request duration (ms)",
      "# TYPE barbergo_http_request_duration_ms_avg gauge",
      `barbergo_http_request_duration_ms_avg ${avgDurationMs}`,
      "# HELP barbergo_uptime_seconds API process uptime in seconds",
      "# TYPE barbergo_uptime_seconds gauge",
      `barbergo_uptime_seconds ${uptimeSeconds}`
    ].join("\n");
  }
}
