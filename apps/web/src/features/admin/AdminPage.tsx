import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BellRing,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CircleDollarSign,
  FileCheck2,
  Gavel,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound
} from "lucide-react";
import {
  getAdminAlerts,
  getAdminDisputes,
  getAdminOverview,
  getAdminPolicy,
  getAdminReconciliation,
  getAdvancedAnalytics,
  getScaleGateEval,
  getUnitEconomics,
  resolveAdminDispute,
  setAdminPartnerVerification,
  updateAdminPolicy
} from "../../lib/api";
import { DataTable } from "../shared/DataTable";
import { EmptyHint, ErrorBanner, LoadingBadge, StatusLine } from "../shared/UiState";
import { PageSection } from "../shared/PageSection";
import { UiBadge, UiButton } from "../shared/UiKit";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";

type AdminView = "dashboard" | "kyc" | "policy" | "disputes";

type AnalyticsOverview = {
  total_bookings?: number;
  completion_rate?: number;
  avg_ticket?: number;
};

type AlertFeedItem = {
  id: string;
  event_name: string;
  message: string;
  created_at: string;
};

type DisputeItem = {
  id: string;
  booking_id: string;
  status: string;
  reason: string;
  created_by: string;
};

type PolicyConfig = {
  commission_rate?: number;
  cancellation_fee_rate?: number;
  pricing_multiplier?: number;
  promo_enabled?: boolean;
};

type VerificationRow = {
  partner_id: string;
  partner_name: string;
  submitted_at: string;
  status: "pending" | "approved" | "rejected";
};

const MOCK_KYC_QUEUE: VerificationRow[] = [
  { partner_id: "partner_1", partner_name: "Downtown Grooming Co.", submitted_at: "2026-02-16T07:20:00.000Z", status: "pending" },
  { partner_id: "partner_2", partner_name: "Riverside Barber Lab", submitted_at: "2026-02-16T06:50:00.000Z", status: "pending" }
];

function toNumber(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

function toBool(value: unknown): boolean {
  return typeof value === "boolean" ? value : false;
}

function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function AdminPage(): JSX.Element {
  const { token } = useAuth();
  const { formatCurrency, formatDateTime, label } = useI18n();

  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const [status, setStatus] = useState("Idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [alerts, setAlerts] = useState<AlertFeedItem[]>([]);
  const [zoneEval, setZoneEval] = useState<unknown>(null);
  const [economics, setEconomics] = useState<unknown>(null);
  const [advanced, setAdvanced] = useState<unknown>(null);
  const [reconciliation, setReconciliation] = useState<unknown>(null);
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [policy, setPolicy] = useState<PolicyConfig | null>(null);
  const [kycQueue, setKycQueue] = useState<VerificationRow[]>(MOCK_KYC_QUEUE);

  const partnerTierCount = toArray<{ partner_id: string }>((advanced as { partner_quality_tiers?: unknown } | null)?.partner_quality_tiers).length;
  const repeatRate = toNumber((advanced as { retention?: { repeat_customer_rate?: number } } | null)?.retention?.repeat_customer_rate);
  const zoneCount = toArray<{ zone_id: string }>((zoneEval as { data?: unknown } | null)?.data).length;
  const economicsRows = toArray<{ gross_revenue?: number; bookings?: number }>((economics as { data?: unknown } | null)?.data);
  const grossRevenue = economicsRows.reduce((sum, row) => sum + toNumber(row?.gross_revenue), 0);
  const activePartner = partnerTierCount > 0 ? partnerTierCount : 1;

  const disputeRows = useMemo(
    () =>
      disputes.map((entry) => ({
        id: entry.id,
        booking: entry.booking_id,
        status: entry.status,
        reason: entry.reason,
        owner: entry.created_by
      })),
    [disputes]
  );

  const kycRows = useMemo(
    () =>
      kycQueue.map((item) => ({
        partner: `${item.partner_name} (${item.partner_id})`,
        submitted: formatDateTime(item.submitted_at),
        status: item.status
      })),
    [formatDateTime, kycQueue]
  );

  useEffect(() => {
    void loadControlTower();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runAction(fn: () => Promise<void>, pending: string, failed: string): Promise<void> {
    setLoading(true);
    setError(null);
    setStatus(pending);
    try {
      await fn();
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus(`${failed}: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  async function loadControlTower(): Promise<void> {
    await runAction(
      async () => {
        const today = new Date().toISOString().slice(0, 10);
        const [overviewRes, alertsRes, zoneRes, economicsRes, advancedRes, policyRes, disputesRes, reconcileRes] =
          await Promise.all([
            getAdminOverview(token),
            getAdminAlerts(token),
            getScaleGateEval(token),
            getUnitEconomics(token),
            getAdvancedAnalytics(token),
            getAdminPolicy(token),
            getAdminDisputes(token),
            getAdminReconciliation(token, today)
          ]);

        setOverview((overviewRes as AnalyticsOverview) ?? null);
        setAlerts(toArray<AlertFeedItem>((alertsRes as { data?: unknown } | null)?.data));
        setZoneEval(zoneRes);
        setEconomics(economicsRes);
        setAdvanced(advancedRes);
        setPolicy((policyRes as PolicyConfig) ?? null);
        setDisputes(toArray<DisputeItem>((disputesRes as { data?: unknown } | null)?.data));
        setReconciliation(reconcileRes);
        setStatus("Admin control tower synced");
      },
      "Syncing admin control tower...",
      "Admin control tower sync failed"
    );
  }

  async function updatePolicyField(next: Partial<PolicyConfig>): Promise<void> {
    await runAction(
      async () => {
        const merged: PolicyConfig = { ...(policy ?? {}), ...next };
        await updateAdminPolicy(token, merged);
        setPolicy(merged);
        setStatus("Global policy updated");
      },
      "Updating global policy...",
      "Policy update failed"
    );
  }

  async function handleKycAction(partnerId: string, action: "approve" | "reject"): Promise<void> {
    await runAction(
      async () => {
        if (partnerId === "partner_1") {
          await setAdminPartnerVerification(token, partnerId, action);
        }
        setKycQueue((prev) => prev.map((item) => (item.partner_id === partnerId ? { ...item, status: action === "approve" ? "approved" : "rejected" } : item)));
        setStatus(`KYC ${action} for ${partnerId}`);
      },
      `Applying KYC ${action}...`,
      "KYC action failed"
    );
  }

  async function handleResolveDispute(disputeId: string, action: "refund" | "reject"): Promise<void> {
    await runAction(
      async () => {
        await resolveAdminDispute(token, disputeId, action, action === "refund" ? "refund approved by admin" : "insufficient evidence");
        setDisputes((prev) => prev.map((item) => (item.id === disputeId ? { ...item, status: "resolved" } : item)));
        setStatus(`Dispute ${disputeId} resolved: ${action}`);
      },
      "Resolving dispute...",
      "Resolve dispute failed"
    );
  }

  return (
    <PageSection
      title={label("แอดมินคอนโทรลทาวเวอร์", "Admin Control Tower")}
      subtitle={label(
        "ศูนย์ควบคุม Marketplace: KPI, KYC, Policy, Dispute และการเชื่อม Customer/Partner แบบเรียลไทม์",
        "Marketplace command center for KPI, KYC, policy, dispute, and customer-partner operations"
      )}
    >
      <main className="admin-hub">
        <section className="admin-hero-bar">
          <div>
            <p className="admin-kicker">Authority Mode</p>
            <h3>Enterprise Operations</h3>
          </div>
          <div className="row">
            <UiButton onClick={() => void loadControlTower()}>Refresh Tower</UiButton>
            <UiButton variant="secondary" onClick={() => setCurrentView("dashboard")}>
              Dashboard
            </UiButton>
          </div>
        </section>

        {loading ? <LoadingBadge text="Admin hub loading..." /> : null}
        {error ? <ErrorBanner message={error} /> : null}
        <StatusLine value={status} />

        <div className="admin-kpi-grid">
          <article className="admin-kpi-card">
            <CircleDollarSign size={18} />
            <p>GMV</p>
            <h4>{formatCurrency(grossRevenue)}</h4>
          </article>
          <article className="admin-kpi-card">
            <ChartNoAxesCombined size={18} />
            <p>Net Revenue</p>
            <h4>{formatCurrency(grossRevenue * (policy?.commission_rate ?? 0.3))}</h4>
          </article>
          <article className="admin-kpi-card">
            <UsersRound size={18} />
            <p>Active Partners</p>
            <h4>{activePartner}</h4>
          </article>
          <article className="admin-kpi-card">
            <ShieldCheck size={18} />
            <p>SLA Health</p>
            <h4>{Math.round(toNumber(overview?.completion_rate) * 100)}%</h4>
          </article>
        </div>

        <nav className="admin-subnav" aria-label="Admin views">
          <button type="button" className={currentView === "dashboard" ? "is-active" : ""} onClick={() => setCurrentView("dashboard")}>
            <BellRing size={15} /> Dashboard
          </button>
          <button type="button" className={currentView === "kyc" ? "is-active" : ""} onClick={() => setCurrentView("kyc")}>
            <FileCheck2 size={15} /> KYC Queue
          </button>
          <button type="button" className={currentView === "policy" ? "is-active" : ""} onClick={() => setCurrentView("policy")}>
            <SlidersHorizontal size={15} /> Global Policy
          </button>
          <button type="button" className={currentView === "disputes" ? "is-active" : ""} onClick={() => setCurrentView("disputes")}>
            <Gavel size={15} /> Dispute Center
          </button>
        </nav>

        {currentView === "dashboard" ? (
          <>
            <section className="admin-card">
              <div className="admin-card-head">
                <h3>Live Activity Feed</h3>
                <UiBadge tone={alerts.length > 0 ? "success" : "neutral"}>{alerts.length} events</UiBadge>
              </div>
              {alerts.length === 0 ? <EmptyHint message="No activity yet." /> : null}
              <div className="admin-feed-list">
                {alerts.slice(0, 8).map((item) => (
                  <article key={item.id} className="admin-feed-item">
                    <p className="admin-feed-event">
                      <BellRing size={14} /> {item.event_name}
                    </p>
                    <p>{item.message}</p>
                    <span>{formatDateTime(item.created_at)}</span>
                  </article>
                ))}
              </div>
            </section>

            <div className="admin-panel-grid">
              <section className="admin-card">
                <h3>Customer + Partner Health</h3>
                <p>Bookings: {toNumber(overview?.total_bookings)}</p>
                <p>Repeat Customer Rate: {Math.round(repeatRate * 100)}%</p>
                <p>Avg Ticket: {formatCurrency(toNumber(overview?.avg_ticket))}</p>
                <p>Zones Evaluated: {zoneCount}</p>
              </section>
              <section className="admin-card">
                <h3>Reconciliation Snapshot</h3>
                <p>Date: {(reconciliation as { date?: string } | null)?.date ?? "-"}</p>
                <p>Bookings: {toNumber((reconciliation as { bookings?: { total?: number } } | null)?.bookings?.total)}</p>
                <p>Payments: {toNumber((reconciliation as { payments?: { total?: number } } | null)?.payments?.total)}</p>
                <p>Mismatches: {toArray((reconciliation as { payments?: { mismatches?: unknown } } | null)?.payments?.mismatches).length}</p>
              </section>
            </div>
          </>
        ) : null}

        {currentView === "kyc" ? (
          <section className="admin-card">
            <div className="admin-card-head">
              <h3>Partner Verification Queue</h3>
              <UiBadge tone="neutral">Workflow</UiBadge>
            </div>
            <DataTable
              caption="KYC partner queue"
              columns={[
                { key: "partner", header: "Partner" },
                { key: "submitted", header: "Submitted At" },
                { key: "status", header: "Status" }
              ]}
              rows={kycRows}
              emptyText="No KYC requests"
            />
            <div className="admin-action-grid">
              {kycQueue.map((item) => (
                <article key={item.partner_id} className="admin-action-item">
                  <p>{item.partner_name}</p>
                  <UiBadge tone={item.status === "approved" ? "success" : item.status === "rejected" ? "danger" : "warning"}>
                    {item.status}
                  </UiBadge>
                  <div className="row">
                    <UiButton variant="secondary" onClick={() => void handleKycAction(item.partner_id, "approve")}>
                      Approve
                    </UiButton>
                    <UiButton variant="secondary" onClick={() => void handleKycAction(item.partner_id, "reject")}>
                      Reject
                    </UiButton>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {currentView === "policy" ? (
          <section className="admin-card">
            <div className="admin-card-head">
              <h3>Global Policy Engine</h3>
              <UiBadge tone="neutral">Live Config</UiBadge>
            </div>
            <div className="admin-policy-grid">
              <label>
                Commission %
                <input
                  className="input admin-input"
                  type="number"
                  step="0.01"
                  value={policy?.commission_rate ?? 0.3}
                  onChange={(event) => void updatePolicyField({ commission_rate: Number(event.target.value || 0) })}
                />
              </label>
              <label>
                Cancellation Fee %
                <input
                  className="input admin-input"
                  type="number"
                  step="0.01"
                  value={policy?.cancellation_fee_rate ?? 0.1}
                  onChange={(event) => void updatePolicyField({ cancellation_fee_rate: Number(event.target.value || 0) })}
                />
              </label>
              <label>
                Pricing Multiplier
                <input
                  className="input admin-input"
                  type="number"
                  step="0.05"
                  value={policy?.pricing_multiplier ?? 1}
                  onChange={(event) => void updatePolicyField({ pricing_multiplier: Number(event.target.value || 0) })}
                />
              </label>
              <label>
                Promo Enabled
                <button
                  type="button"
                  className="admin-toggle"
                  onClick={() => void updatePolicyField({ promo_enabled: !(policy?.promo_enabled ?? false) })}
                >
                  {toBool(policy?.promo_enabled) ? "Enabled" : "Disabled"}
                </button>
              </label>
            </div>
          </section>
        ) : null}

        {currentView === "disputes" ? (
          <section className="admin-card">
            <div className="admin-card-head">
              <h3>Dispute Center</h3>
              <UiBadge tone={disputes.length > 0 ? "warning" : "neutral"}>{disputes.length} tickets</UiBadge>
            </div>
            <DataTable
              caption="Dispute tickets"
              columns={[
                { key: "id", header: "Dispute ID" },
                { key: "booking", header: "Booking ID" },
                { key: "status", header: "Status" },
                { key: "reason", header: "Reason" },
                { key: "owner", header: "Opened By" }
              ]}
              rows={disputeRows}
              emptyText="No disputes in queue"
            />
            <div className="admin-action-grid">
              {disputes.slice(0, 6).map((entry) => (
                <article key={entry.id} className="admin-action-item">
                  <p>
                    <AlertTriangle size={14} /> {entry.id}
                  </p>
                  <p>{entry.reason}</p>
                  <div className="row">
                    <UiButton variant="secondary" onClick={() => void handleResolveDispute(entry.id, "refund")} disabled={entry.status === "resolved"}>
                      Refund
                    </UiButton>
                    <UiButton variant="secondary" onClick={() => void handleResolveDispute(entry.id, "reject")} disabled={entry.status === "resolved"}>
                      Reject
                    </UiButton>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <footer className="admin-footnote">
          <p>
            <BriefcaseBusiness size={14} /> Control tower ties Customer demand, Partner quality, and Governance decisions in one view.
          </p>
        </footer>
      </main>
    </PageSection>
  );
}
