import { useEffect, useMemo, useState } from "react";
import { getAdvancedAnalytics, getCustomerHistory, getUnitEconomics } from "../../lib/api";
import type { Booking } from "../../lib/types";
import { useAuth } from "../auth/AuthContext";
import { EmptyHint, ErrorBanner, LoadingBadge, StatusLine } from "../shared/UiState";
import { PageSection } from "../shared/PageSection";
import { StatCard, UiButton } from "../shared/UiKit";

export function InsightsPage(): JSX.Element {
  const { token, role } = useAuth();
  const [status, setStatus] = useState("Idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Booking[]>([]);
  const [economics, setEconomics] = useState<Array<{ zone_id: string; bookings: number; contribution_margin_value: number }>>([]);
  const [repeatRate, setRepeatRate] = useState<string>("-");

  const qualityMetrics = useMemo(() => {
    const total = history.length;
    const completed = history.filter((item) => item.status === "completed").length;
    const cancelled = history.filter((item) => item.status === "cancelled" || item.status === "failed").length;
    return [
      { label: "Booking Completion", value: total ? `${Math.round((completed / total) * 100)}%` : "-" },
      { label: "Repeat Customer Rate", value: repeatRate },
      { label: "Total Bookings", value: String(total) },
      { label: "Cancellation Rate", value: total ? `${Math.round((cancelled / total) * 100)}%` : "0%" }
    ];
  }, [history, repeatRate]);

  const recommendations = useMemo(() => {
    const rows: string[] = [];
    const weakZone = economics.find((zone) => zone.contribution_margin_value < 5000);
    if (weakZone) {
      rows.push(`Zone ${weakZone.zone_id} has low contribution margin. Review service mix and pricing.`);
    }
    if (history.filter((item) => item.status === "authorized").length > 0) {
      rows.push("Pending authorized bookings found. Improve confirm/start execution SLA.");
    }
    if (rows.length === 0) {
      rows.push("Operational health looks good. Continue monitoring peak-hour utilization.");
    }
    return rows;
  }, [economics, history]);

  async function refresh(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const historyRes = await getCustomerHistory(token);
      setHistory(historyRes.data);

      if (role === "admin") {
        const econRes = await getUnitEconomics(token);
        const advRes = await getAdvancedAnalytics(token);
        const econRows = ((econRes as { data?: Array<{ zone_id: string; bookings: number; contribution_margin_value: number }> }).data ??
          []) as Array<{ zone_id: string; bookings: number; contribution_margin_value: number }>;
        setEconomics(econRows);
        const rate = (advRes as { retention?: { repeat_customer_rate?: number } })?.retention?.repeat_customer_rate;
        setRepeatRate(typeof rate === "number" ? `${Math.round(rate * 100)}%` : "-");
        setStatus("Loaded insights from customer and admin analytics");
      } else {
        setEconomics([]);
        setRepeatRate("-");
        setStatus("Loaded insights from customer booking data");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load insights failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [role]);

  return (
    <PageSection title="Insights" subtitle="Performance, quality, and growth recommendations">
      <div className="row">
        <UiButton onClick={() => void refresh()}>Refresh Insights</UiButton>
      </div>
      <div className="stats-grid">
        {qualityMetrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>
      {loading ? <LoadingBadge text="Loading insights..." /> : null}
      {error ? <ErrorBanner message={error} /> : null}
      <StatusLine value={status} />

      <div className="marketing-grid">
        <article className="marketing-card">
          <h3>Growth Focus</h3>
          <p>{economics.length > 0 ? "Weekly gross revenue and contribution view loaded from admin economics." : "Use admin role to unlock economics-backed growth view."}</p>
        </article>
        <article className="marketing-card">
          <h3>Service Mix</h3>
          <p>Completed booking ratio is used as quality baseline for service-mix tuning.</p>
        </article>
        <article className="marketing-card">
          <h3>Risk Signal</h3>
          <p>Pending authorized bookings indicate transition delays and potential SLA risk.</p>
        </article>
      </div>

      {!loading && !error && recommendations.length === 0 ? <EmptyHint message="No recommendations available." /> : null}

      <div className="app-list">
        {recommendations.map((item) => (
          <article key={item} className="app-list-item">
            <p>{item}</p>
          </article>
        ))}
      </div>
    </PageSection>
  );
}
