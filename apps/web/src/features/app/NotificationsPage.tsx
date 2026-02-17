import { useEffect, useMemo, useState } from "react";
import { getCustomerHistory, getPartnerQueue } from "../../lib/api";
import type { Booking } from "../../lib/types";
import { useAuth } from "../auth/AuthContext";
import { EmptyHint, ErrorBanner, LoadingBadge, StatusLine } from "../shared/UiState";
import { PageSection } from "../shared/PageSection";
import { UiBadge, UiButton } from "../shared/UiKit";

type AppNotification = {
  id: string;
  title: string;
  body: string;
  level: "success" | "warning" | "danger" | "neutral";
};

function tone(level: string): "success" | "warning" | "danger" | "neutral" {
  if (level === "success") return "success";
  if (level === "warning") return "warning";
  if (level === "danger") return "danger";
  return "neutral";
}

export function NotificationsPage(): JSX.Element {
  const { token, role } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Idle");

  const notifications = useMemo<AppNotification[]>(() => {
    const completed = bookings.filter((item) => item.status === "completed").length;
    const pending = bookings.filter((item) => item.status === "authorized" || item.status === "confirmed").length;
    const started = bookings.filter((item) => item.status === "started").length;
    const list: AppNotification[] = [];

    if (pending > 0) {
      list.push({
        id: "NTF-PENDING",
        title: "Pending booking actions",
        body: `${pending} booking(s) are awaiting next transition.`,
        level: "warning"
      });
    }
    if (started > 0) {
      list.push({
        id: "NTF-STARTED",
        title: "Bookings in progress",
        body: `${started} booking(s) are currently in service.`,
        level: "neutral"
      });
    }
    if (completed > 0) {
      list.push({
        id: "NTF-COMPLETED",
        title: "Completed bookings",
        body: `${completed} booking(s) completed successfully.`,
        level: "success"
      });
    }
    if (list.length === 0) {
      list.push({
        id: "NTF-INFO",
        title: "No notifications yet",
        body: "Run booking flows to generate operational notifications.",
        level: "neutral"
      });
    }
    return list;
  }, [bookings]);

  async function refresh(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      if (role === "partner") {
        const data = await getPartnerQueue(token);
        setBookings(data.data);
        setStatus(`Loaded notifications from ${data.data.length} partner bookings`);
      } else {
        const data = await getCustomerHistory(token);
        setBookings(data.data);
        setStatus(`Loaded notifications from ${data.data.length} customer bookings`);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load notifications failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [role]);

  return (
    <PageSection title="Notifications" subtitle="Operational alerts and product updates">
      <div className="row">
        <UiButton onClick={() => void refresh()}>Refresh Notifications</UiButton>
      </div>
      {loading ? <LoadingBadge text="Loading notifications..." /> : null}
      {error ? <ErrorBanner message={error} /> : null}
      <StatusLine value={status} />

      {!loading && !error && notifications.length === 0 ? <EmptyHint message="No notifications found." /> : null}

      <div className="app-list">
        {notifications.map((item) => (
          <article key={item.id} className="app-list-item">
            <div className="booking-item-head">
              <h3>{item.title}</h3>
              <UiBadge tone={tone(item.level)}>{item.level}</UiBadge>
            </div>
            <p>{item.body}</p>
            <p className="section-subtitle">{item.id}</p>
          </article>
        ))}
      </div>
    </PageSection>
  );
}
