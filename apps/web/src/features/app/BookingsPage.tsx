import { useEffect, useMemo, useState } from "react";
import { getCustomerHistory, getPartnerQueue } from "../../lib/api";
import type { Booking } from "../../lib/types";
import { useAuth } from "../auth/AuthContext";
import { DataTable } from "../shared/DataTable";
import { EmptyHint, ErrorBanner, LoadingBadge, StatusLine } from "../shared/UiState";
import { PageSection } from "../shared/PageSection";
import { StatCard, UiBadge, UiButton } from "../shared/UiKit";
import { useI18n } from "../i18n/I18nContext";

function toneFromStatus(status: string): "success" | "warning" | "danger" | "neutral" {
  if (status === "completed" || status === "confirmed") return "success";
  if (status === "authorized" || status === "started") return "warning";
  if (status === "cancelled" || status === "failed") return "danger";
  return "neutral";
}

export function BookingsPage(): JSX.Element {
  const { token, role } = useAuth();
  const { formatCurrency, formatDateTime, label } = useI18n();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Idle");

  const rows = useMemo(
    () =>
      bookings.map((booking) => ({
        id: booking.id,
        status: booking.status,
        slot: booking.slot_at ? formatDateTime(booking.slot_at) : "-",
        amount: formatCurrency(booking.amount)
      })),
    [bookings, formatCurrency, formatDateTime]
  );

  const todayCount = bookings.filter((item) => item.slot_at?.slice(0, 10) === "2026-02-20").length;
  const inServiceCount = bookings.filter((item) => item.status === "started").length;
  const pendingCount = bookings.filter((item) => item.status === "authorized" || item.status === "confirmed").length;
  const completionRate = bookings.length
    ? `${Math.round((bookings.filter((item) => item.status === "completed").length / bookings.length) * 100)}%`
    : "0%";

  async function refresh(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      if (role === "partner") {
        const data = await getPartnerQueue(token);
        setBookings(data.data);
        setStatus(`Loaded ${data.data.length} partner queue items`);
      } else {
        const data = await getCustomerHistory(token);
        setBookings(data.data);
        setStatus(`Loaded ${data.data.length} booking history items`);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load bookings failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [role]);

  return (
    <PageSection title="Bookings" subtitle="Track, monitor, and operate your daily booking pipeline">
      <div className="row">
        <UiButton onClick={() => void refresh()}>{label("รีเฟรชรายการ", "Refresh Bookings")}</UiButton>
      </div>
      <div className="stats-grid">
        <StatCard label={label("คิววันนี้", "Today Queue")} value={todayCount} />
        <StatCard label={label("กำลังรอดำเนินการ", "Awaiting Action")} value={pendingCount} />
        <StatCard label={label("กำลังให้บริการ", "In Service")} value={inServiceCount} />
        <StatCard label={label("อัตราสำเร็จ", "Completion Rate")} value={completionRate} />
      </div>

      {loading ? <LoadingBadge text="Loading booking data..." /> : null}
      {error ? <ErrorBanner message={error} /> : null}
      <StatusLine value={status} />

      {!loading && !error && bookings.length === 0 ? <EmptyHint message="No booking items found for current role." /> : null}

      {bookings.length > 0 ? (
        <DataTable
          caption="Booking list"
          columns={[
            { key: "id", header: "Booking" },
            { key: "status", header: "Status" },
            { key: "slot", header: "Slot" },
            { key: "amount", header: "Amount" }
          ]}
          rows={rows}
          emptyText="No bookings"
        />
      ) : null}

      {bookings.length > 0 ? (
        <div className="row">
          {bookings.slice(0, 6).map((item) => (
            <UiBadge key={item.id} tone={toneFromStatus(item.status)}>
              {item.status}
            </UiBadge>
          ))}
        </div>
      ) : null}
    </PageSection>
  );
}
