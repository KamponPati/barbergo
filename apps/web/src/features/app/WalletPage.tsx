import { useEffect, useMemo, useState } from "react";
import { getCustomerHistory } from "../../lib/api";
import type { Booking } from "../../lib/types";
import { useAuth } from "../auth/AuthContext";
import { DataTable } from "../shared/DataTable";
import { EmptyHint, ErrorBanner, LoadingBadge, StatusLine } from "../shared/UiState";
import { PageSection } from "../shared/PageSection";
import { StatCard, UiButton } from "../shared/UiKit";
import { useI18n } from "../i18n/I18nContext";

export function WalletPage(): JSX.Element {
  const { token, role } = useAuth();
  const { formatCurrency, formatDateTime } = useI18n();
  const [history, setHistory] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Idle");

  const settledAmount = history.filter((item) => item.status === "completed").reduce((sum, item) => sum + item.amount, 0);
  const pendingAmount = history
    .filter((item) => item.status === "authorized" || item.status === "confirmed" || item.status === "started")
    .reduce((sum, item) => sum + item.amount, 0);

  const rows = useMemo(
    () =>
      history.slice(0, 8).map((item) => ({
        id: item.payment_id || item.id,
        kind: item.status === "completed" ? "Booking Income" : "Pending Booking",
        amount: formatCurrency(item.amount),
        at: item.updated_at ? formatDateTime(item.updated_at) : formatDateTime(item.slot_at),
        status: item.status
      })),
    [formatCurrency, formatDateTime, history]
  );

  async function refresh(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomerHistory(token);
      setHistory(data.data);
      setStatus(`Loaded ${data.data.length} financial records from bookings`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load wallet data failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (role === "customer" || role === "admin") {
      void refresh();
    } else {
      setHistory([]);
      setStatus("Wallet requires customer/admin scope in this build");
    }
  }, [role]);

  return (
    <PageSection title="Wallet" subtitle="Payouts, balances, and recent money movement">
      <div className="row">
        <UiButton onClick={() => void refresh()} disabled={role !== "customer" && role !== "admin"}>
          Refresh Wallet
        </UiButton>
      </div>
      <div className="stats-grid">
        <StatCard label="Available Balance" value={formatCurrency(settledAmount)} />
        <StatCard label="Pending Settlement" value={formatCurrency(pendingAmount)} />
        <StatCard label="This Week Revenue" value={formatCurrency(settledAmount + pendingAmount)} />
        <StatCard label="Records" value={history.length} />
      </div>

      {loading ? <LoadingBadge text="Loading wallet data..." /> : null}
      {error ? <ErrorBanner message={error} /> : null}
      <StatusLine value={status} />

      {!loading && !error && rows.length === 0 ? <EmptyHint message="No transaction data found." /> : null}

      {rows.length > 0 ? (
        <DataTable
          caption="Recent financial transactions"
          columns={[
            { key: "id", header: "Ref" },
            { key: "kind", header: "Kind" },
            { key: "amount", header: "Amount" },
            { key: "at", header: "At" },
            { key: "status", header: "Status" }
          ]}
          rows={rows}
          emptyText="No wallet transactions"
        />
      ) : null}
    </PageSection>
  );
}
