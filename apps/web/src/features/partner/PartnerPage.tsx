import { useState } from "react";
import { completePartnerBooking, confirmPartnerBooking, getPartnerQueue, startPartnerBooking } from "../../lib/api";
import type { Booking } from "../../lib/types";
import { useAuth } from "../auth/AuthContext";
import { JsonView } from "../shared/JsonView";
import { PageSection } from "../shared/PageSection";
import { EmptyHint, ErrorBanner, LoadingBadge } from "../shared/UiState";

export function PartnerPage(): JSX.Element {
  const { token } = useAuth();
  const [queue, setQueue] = useState<Booking[]>([]);
  const [status, setStatus] = useState("Idle");
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const first = queue[0];

  async function refreshQueue(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const data = await getPartnerQueue(token);
      setQueue(data.data);
      setStatus(`Loaded ${data.data.length} incoming bookings`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load queue failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageSection title="Partner App Core" subtitle="Incoming queue and booking operations">
      <div className="row">
        <button onClick={refreshQueue}>Load Queue</button>
        <button
          disabled={!first}
          onClick={async () => {
            try {
              if (!first) return;
              await confirmPartnerBooking(token, first.id);
              setActiveBookingId(first.id);
              setStatus(`Confirmed ${first.id}. Next: Start`);
              await refreshQueue();
            } catch (error) {
              const message = error instanceof Error ? error.message : "Unknown error";
              setError(message);
              setStatus(`Confirm failed: ${message}`);
            }
          }}
        >
          Confirm First
        </button>
        <button
          disabled={!activeBookingId}
          onClick={async () => {
            try {
              if (!activeBookingId) return;
              await startPartnerBooking(token, activeBookingId);
              setStatus(`Started ${activeBookingId}. Next: Complete`);
              await refreshQueue();
            } catch (error) {
              const message = error instanceof Error ? error.message : "Unknown error";
              setError(message);
              setStatus(`Start failed: ${message}`);
            }
          }}
        >
          Start Confirmed
        </button>
        <button
          disabled={!activeBookingId}
          onClick={async () => {
            try {
              if (!activeBookingId) return;
              await completePartnerBooking(token, activeBookingId);
              setStatus(`Completed ${activeBookingId}`);
              setActiveBookingId(null);
              await refreshQueue();
            } catch (error) {
              const message = error instanceof Error ? error.message : "Unknown error";
              setError(message);
              setStatus(`Complete failed: ${message}`);
            }
          }}
        >
          Complete Started
        </button>
      </div>
      {loading ? <LoadingBadge text="Partner operations loading..." /> : null}
      {error ? <ErrorBanner message={error} /> : null}
      <small>Active booking: {activeBookingId ?? "-"}</small>
      <small>Status: {status}</small>
      {!loading && !error && queue.length === 0 ? (
        <EmptyHint message="No incoming queue items. New bookings will appear here." />
      ) : null}
      <JsonView value={{ queue }} />
    </PageSection>
  );
}
