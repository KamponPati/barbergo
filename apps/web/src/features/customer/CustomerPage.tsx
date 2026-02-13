import { useMemo, useState } from "react";
import { checkoutBooking, getAvailability, getCustomerHistory, getNearbyShops, quoteBooking } from "../../lib/api";
import type { Booking, Shop } from "../../lib/types";
import { JsonView } from "../shared/JsonView";
import { PageSection } from "../shared/PageSection";
import { EmptyHint, ErrorBanner, LoadingBadge } from "../shared/UiState";

export function CustomerPage(): JSX.Element {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [quote, setQuote] = useState<Record<string, unknown> | null>(null);
  const [history, setHistory] = useState<Booking[]>([]);
  const [status, setStatus] = useState("Idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serviceId = selectedShop?.services[0]?.id ?? "svc_1";
  const slot = useMemo(() => slots[0] ?? "2026-02-20T10:00:00.000Z", [slots]);

  return (
    <PageSection title="Customer App Core" subtitle="Search, availability, quote, checkout, history">
      <div className="row">
        <button
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              const data = await getNearbyShops();
              setShops(data.data);
              setSelectedShop(data.data[0] ?? null);
              setStatus(`Loaded ${data.data.length} shops`);
            } catch (e) {
              const message = e instanceof Error ? e.message : "unknown error";
              setError(message);
              setStatus("Load shops failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          Load Shops
        </button>
        <button
          disabled={!selectedShop}
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              if (!selectedShop) return;
              const data = await getAvailability(selectedShop.id, serviceId);
              setSlots(data.slots);
              setStatus(`Loaded ${data.slots.length} slots`);
            } catch (e) {
              const message = e instanceof Error ? e.message : "unknown error";
              setError(message);
              setStatus("Load availability failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          Load Availability
        </button>
        <button
          disabled={!selectedShop}
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              if (!selectedShop) return;
              const data = await quoteBooking(selectedShop.id, serviceId);
              setQuote(data);
              setStatus("Quote calculated");
            } catch (e) {
              const message = e instanceof Error ? e.message : "unknown error";
              setError(message);
              setStatus("Quote failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          Quote
        </button>
        <button
          disabled={!selectedShop}
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              if (!selectedShop) return;
              const data = await checkoutBooking({ shopId: selectedShop.id, serviceId, slot });
              setStatus(`Booked ${data.booking.id}`);
            } catch (e) {
              const message = e instanceof Error ? e.message : "unknown error";
              setError(message);
              setStatus("Checkout failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          Checkout
        </button>
        <button
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              const data = await getCustomerHistory();
              setHistory(data.data);
              setStatus(`Loaded ${data.data.length} bookings`);
            } catch (e) {
              const message = e instanceof Error ? e.message : "unknown error";
              setError(message);
              setStatus("Load history failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          Load History
        </button>
      </div>
      {loading ? <LoadingBadge text="Customer flow loading..." /> : null}
      {error ? <ErrorBanner message={error} /> : null}
      <small>Status: {status}</small>
      {!loading && !error && shops.length === 0 ? <EmptyHint message="No shops loaded yet. Click Load Shops." /> : null}
      <JsonView value={{ selectedShop, slots, quote, history, shops }} />
    </PageSection>
  );
}
