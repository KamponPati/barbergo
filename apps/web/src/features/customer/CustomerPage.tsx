import { useEffect, useMemo, useState } from "react";
import {
  AlarmClockCheck,
  BadgeCheck,
  CalendarDays,
  CarTaxiFront,
  CheckCircle2,
  Clock,
  Crown,
  Heart,
  Home,
  MapPinned,
  Navigation,
  PhoneCall,
  Scissors,
  ShieldAlert,
  Star,
  Truck,
  Wallet
} from "lucide-react";
import { checkoutBooking, getAvailability, getCustomerHistory, getNearbyShops, quoteBooking } from "../../lib/api";
import type { Booking, Shop } from "../../lib/types";
import { useAuth } from "../auth/AuthContext";
import { DataTable } from "../shared/DataTable";
import { EmptyHint, ErrorBanner, LoadingBadge, StatusLine } from "../shared/UiState";
import { PageSection } from "../shared/PageSection";
import { UiBadge, UiButton } from "../shared/UiKit";
import { useI18n } from "../i18n/I18nContext";

type CustomerView = "home" | "delivery" | "bookings" | "tracking" | "rewards";

type LookbookStyle = {
  id: string;
  name: string;
  image: string;
};

type DeliveryBarber = {
  id: string;
  name: string;
  specialty: string;
  years: number;
  rating: number;
  eta_min: number;
  ready: boolean;
  verified: boolean;
  bio: string;
  equipment: string[];
  portrait: string;
  portfolio: string[];
};

type TrackingState = "on_the_way" | "arrived" | "in_progress" | "completed";

type TrackingModel = {
  booking_id: string;
  barber_name: string;
  progress_pct: number;
  eta_min: number;
  state: TrackingState;
};

const LOOKBOOK: LookbookStyle[] = [
  { id: "style_1", name: "Skin Fade", image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=720&auto=format&fit=crop" },
  { id: "style_2", name: "Two Block", image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=720&auto=format&fit=crop" },
  { id: "style_3", name: "Mullet", image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=720&auto=format&fit=crop" },
  { id: "style_4", name: "Classic Pomade", image: "https://images.unsplash.com/photo-1562004760-aceed7bb0fe3?w=720&auto=format&fit=crop" }
];

const DELIVERY_BARBERS: DeliveryBarber[] = [
  {
    id: "barber_1",
    name: "Akkarin P.",
    specialty: "Fade + Texture",
    years: 7,
    rating: 4.9,
    eta_min: 18,
    ready: true,
    verified: true,
    bio: "Freelance barber focused on clean fades and premium home-service setup.",
    equipment: ["Portable Chair", "Floor Cover", "Sanitation Kit", "Mirror Light"],
    portrait: "https://images.unsplash.com/photo-1582896911227-c966f6e7fb96?w=720&auto=format&fit=crop",
    portfolio: [
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=720&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=720&auto=format&fit=crop"
    ]
  },
  {
    id: "barber_2",
    name: "Mek S.",
    specialty: "Color + Beard Styling",
    years: 5,
    rating: 4.7,
    eta_min: 24,
    ready: false,
    verified: true,
    bio: "Travel barber with strong portfolio in beard design and modern color touch-up.",
    equipment: ["Cape", "Sterile Tools", "Cordless Clipper", "Portable Vacuum"],
    portrait: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=720&auto=format&fit=crop",
    portfolio: [
      "https://images.unsplash.com/photo-1593702288056-f8fd9f65253d?w=720&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=720&auto=format&fit=crop"
    ]
  }
];

const TRACKING_STEPS: { state: TrackingState; label: string }[] = [
  { state: "on_the_way", label: "On the Way" },
  { state: "arrived", label: "Arrived" },
  { state: "in_progress", label: "In Progress" },
  { state: "completed", label: "Done" }
];

const NAV_ITEMS: { key: CustomerView; icon: JSX.Element; label: string }[] = [
  { key: "home", icon: <Home size={18} />, label: "Home" },
  { key: "delivery", icon: <Truck size={18} />, label: "Delivery" },
  { key: "bookings", icon: <CalendarDays size={18} />, label: "Bookings" },
  { key: "tracking", icon: <Navigation size={18} />, label: "Tracking" },
  { key: "rewards", icon: <Crown size={18} />, label: "Rewards" }
];

function shopReliability(shopId: string): number {
  if (shopId === "shop_1") return 96;
  if (shopId === "shop_2") return 92;
  return 89;
}

function shopLiveWait(shopId: string): number {
  if (shopId === "shop_1") return 12;
  if (shopId === "shop_2") return 28;
  return 18;
}

function nextState(state: TrackingState): TrackingState {
  if (state === "on_the_way") return "arrived";
  if (state === "arrived") return "in_progress";
  if (state === "in_progress") return "completed";
  return "completed";
}

export function CustomerPage(): JSX.Element {
  const { token } = useAuth();
  const { formatCurrency, formatDateTime, label } = useI18n();

  const [currentView, setCurrentView] = useState<CustomerView>("home");
  const [selectedStyle, setSelectedStyle] = useState<string>("style_1");
  const [asapOnly, setAsapOnly] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [quote, setQuote] = useState<{ subtotal?: number; discount?: number; total?: number } | null>(null);
  const [history, setHistory] = useState<Booking[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState(DELIVERY_BARBERS[0]?.id ?? "");
  const [tracking, setTracking] = useState<TrackingModel>({
    booking_id: "trk_mock_1",
    barber_name: "Akkarin P.",
    progress_pct: 8,
    eta_min: 18,
    state: "on_the_way"
  });
  const [status, setStatus] = useState("Idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedShop = shops.find((shop) => shop.id === selectedShopId) ?? null;
  const selectedService = selectedShop?.services?.find((service) => service.id === selectedServiceId) ?? null;
  const selectedBarber = DELIVERY_BARBERS.find((barber) => barber.id === selectedBarberId) ?? null;
  const quoteTotal = quote?.total ? formatCurrency(quote.total) : "-";
  const points = history.length * 20 + 140;
  const tier = points >= 500 ? "Gold" : "Silver";
  const nextTierPoints = tier === "Gold" ? 1000 : 500;
  const pointsProgressPct = Math.min(100, Math.round((points / nextTierPoints) * 100));

  const discoveryShops = useMemo(() => {
    const source = shops.map((shop) => ({ ...shop, reliability: shopReliability(shop.id), wait_min: shopLiveWait(shop.id) }));
    if (!asapOnly) return source;
    return source.filter((shop) => shop.wait_min <= 15);
  }, [asapOnly, shops]);

  const upcomingRows = useMemo(
    () =>
      history
        .filter((booking) => booking.status !== "completed" && booking.status !== "cancelled")
        .map((booking) => ({
          id: booking.id,
          status: booking.status,
          slot: formatDateTime(booking.slot_at),
          action: "Open Route / Track Barber"
        })),
    [formatDateTime, history]
  );

  const historyRows = useMemo(
    () =>
      history
        .filter((booking) => booking.status === "completed" || booking.status === "cancelled")
        .map((booking) => ({
          id: booking.id,
          status: booking.status,
          slot: formatDateTime(booking.slot_at),
          amount: formatCurrency(booking.amount)
        })),
    [formatCurrency, formatDateTime, history]
  );

  useEffect(() => {
    if (currentView !== "tracking" || tracking.state === "completed") return;
    const timer = window.setInterval(() => {
      setTracking((prev) => {
        const nextProgress = Math.min(100, prev.progress_pct + 8);
        const nextEta = Math.max(0, prev.eta_min - 2);
        const shouldAdvance = nextProgress >= 35 && prev.state === "on_the_way";
        const shouldProgress = nextProgress >= 70 && prev.state === "arrived";
        const shouldComplete = nextProgress >= 96 && prev.state === "in_progress";
        const nextTrackingState = shouldAdvance || shouldProgress || shouldComplete ? nextState(prev.state) : prev.state;
        return { ...prev, progress_pct: nextProgress, eta_min: nextEta, state: nextTrackingState };
      });
    }, 1600);
    return () => window.clearInterval(timer);
  }, [currentView, tracking.state]);

  useEffect(() => {
    void loadShops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runAction(fn: () => Promise<void>, pending: string, fail: string): Promise<void> {
    setLoading(true);
    setError(null);
    setStatus(pending);
    try {
      await fn();
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus(`${fail}: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  function syncShopDefault(nextShop: Shop | null): void {
    setSelectedShopId(nextShop?.id ?? "");
    setSelectedServiceId(nextShop?.services?.[0]?.id ?? "");
    setSelectedBranchId(nextShop?.branches?.[0]?.id ?? nextShop?.branch_ids?.[0] ?? "branch_1");
  }

  async function loadShops(): Promise<void> {
    await runAction(
      async () => {
        const data = await getNearbyShops();
        setShops(data.data);
        syncShopDefault(data.data[0] ?? null);
        setStatus(`Loaded ${data.data.length} shops`);
      },
      "Loading discovery shops...",
      "Load shops failed"
    );
  }

  async function loadAvailability(): Promise<void> {
    if (!selectedShopId || !selectedServiceId) return;
    await runAction(
      async () => {
        const data = await getAvailability(selectedShopId, selectedServiceId, selectedBranchId || "branch_1");
        setSlots(data.slots);
        setSelectedSlot(data.slots[0] ?? "");
        setStatus(`Loaded ${data.slots.length} slots`);
      },
      "Loading availability...",
      "Load availability failed"
    );
  }

  async function quoteAndCheckout(): Promise<void> {
    if (!selectedShopId || !selectedServiceId) return;
    await runAction(
      async () => {
        const quoteRes = await quoteBooking(token, selectedShopId, selectedServiceId);
        setQuote(quoteRes);
        const slotAt = selectedSlot || slots[0];
        if (!slotAt) {
          setStatus("No slot available right now. Please retry.");
          return;
        }
        const checkoutRes = await checkoutBooking({ token, shopId: selectedShopId, serviceId: selectedServiceId, slot: slotAt });
        setTracking({
          booking_id: checkoutRes.booking.id,
          barber_name: selectedBarber?.name ?? "Akkarin P.",
          progress_pct: 10,
          eta_min: selectedBarber?.eta_min ?? 18,
          state: "on_the_way"
        });
        await loadHistory();
        setStatus(`Checkout completed: ${checkoutRes.booking.id}`);
      },
      "Running quote + checkout...",
      "Quote + checkout failed"
    );
  }

  async function loadHistory(): Promise<void> {
    await runAction(
      async () => {
        const data = await getCustomerHistory(token);
        setHistory(data.data);
        setStatus(`Loaded ${data.data.length} bookings`);
      },
      "Loading booking history...",
      "Load history failed"
    );
  }

  function routeFor(booking: { action: string }): void {
    if (booking.action.includes("Track")) setCurrentView("tracking");
    setStatus("Opened contextual booking action");
  }

  return (
    <PageSection
      title={label("ลูกค้า BarberGo", "BarberGo Customer")}
      subtitle={label(
        "Hybrid Marketplace: ค้นหาร้านในร้านและเรียกช่างถึงบ้านได้ในแอปเดียว",
        "Hybrid marketplace for in-shop booking and on-demand delivery barber services"
      )}
    >
      <main className="customer-v2">

        {/* ── Header bar ── */}
        <header className="customer-v2-head">
          <div className="customer-v2-head-left">
            <span className="customer-kicker">
              <Scissors size={11} style={{ display: "inline", verticalAlign: "middle" }} /> Dual Mode Customer App
            </span>
            <h3>In-Shop + Delivery</h3>
          </div>
          <div className="customer-v2-head-actions">
            <UiButton onClick={() => void loadShops()} variant="secondary">Reload Shops</UiButton>
            <UiButton onClick={() => void loadHistory()} variant="secondary">Load History</UiButton>
          </div>
        </header>

        {loading ? <LoadingBadge text="Customer app syncing..." /> : null}
        {error ? <ErrorBanner message={error} /> : null}
        <StatusLine value={status} />

        {/* ── Tab navigation ── */}
        <nav className="customer-v2-nav" aria-label="Customer views">
          {NAV_ITEMS.map(({ key, icon, label: navLabel }) => (
            <button
              key={key}
              type="button"
              className={currentView === key ? "is-active" : ""}
              onClick={() => setCurrentView(key)}
            >
              {icon}
              <span>{navLabel}</span>
            </button>
          ))}
        </nav>

        {/* ── Home: Lookbook + Shop discovery ── */}
        {currentView === "home" ? (
          <>
            <section className="customer-lookbook">
              <div className="customer-card-head">
                <h3>{label("สไตล์ทรงผม", "Lookbook")}</h3>
                <button
                  type="button"
                  className={asapOnly ? "customer-asap-btn is-active" : "customer-asap-btn"}
                  onClick={() => setAsapOnly((prev) => !prev)}
                >
                  <AlarmClockCheck size={15} /> ASAP Mode
                </button>
              </div>
              <div className="customer-lookbook-row">
                {LOOKBOOK.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    className={`customer-style-chip ${selectedStyle === style.id ? "is-active" : ""}`}
                    onClick={() => {
                      setSelectedStyle(style.id);
                      setStatus(`Lookbook style selected: ${style.name}`);
                    }}
                  >
                    <div className="customer-style-img-wrap">
                      <img src={style.image} alt={style.name} />
                      {selectedStyle === style.id ? (
                        <div className="customer-style-check">
                          <CheckCircle2 size={20} />
                        </div>
                      ) : null}
                    </div>
                    <span>{style.name}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="customer-shop-grid">
              {discoveryShops.map((shop) => {
                const reliability = shopReliability(shop.id);
                const waitMin = shopLiveWait(shop.id);
                const isFast = waitMin <= 15;
                const isSelected = selectedShopId === shop.id;
                return (
                  <article key={shop.id} className={`customer-shop-card ${isSelected ? "is-selected" : ""}`}>
                    <div className="customer-card-head">
                      <div>
                        <div className="customer-shop-name-row">
                          <Scissors size={13} />
                          <h4>{shop.name}</h4>
                        </div>
                        <div className="customer-shop-meta">
                          <Star size={11} />
                          <span>{shop.rating}</span>
                          <span className="customer-meta-dot">·</span>
                          <span>Reliability {reliability}%</span>
                        </div>
                      </div>
                      <UiBadge tone={isFast ? "success" : "warning"}>{isFast ? "Ready" : "Queue"}</UiBadge>
                    </div>
                    <div className="customer-shop-info-row">
                      <span><Clock size={12} /> {waitMin} min wait</span>
                      <span><CalendarDays size={12} /> {slots?.[0] ? formatDateTime(slots[0]) : "No slot yet"}</span>
                    </div>
                    <div className="customer-shop-actions">
                      <UiButton
                        variant="secondary"
                        onClick={() => {
                          syncShopDefault(shop);
                          setStatus(`Selected shop ${shop.name}`);
                        }}
                      >
                        {isSelected ? "Selected ✓" : "Select Shop"}
                      </UiButton>
                      <UiButton onClick={() => void loadAvailability()}>Check Slots</UiButton>
                    </div>
                  </article>
                );
              })}
            </section>

            {discoveryShops.length === 0 ? (
              <EmptyHint message="No ASAP shop available right now. Try turning ASAP mode off." />
            ) : null}
          </>
        ) : null}

        {/* ── Delivery: Barber list + detail ── */}
        {currentView === "delivery" ? (
          <>
            <section className="customer-delivery-grid">
              {DELIVERY_BARBERS.map((barber) => (
                <article key={barber.id} className={`customer-barber-card ${selectedBarberId === barber.id ? "is-selected" : ""}`}>
                  <div className="customer-barber-portrait-wrap">
                    <img src={barber.portrait} alt={barber.name} className="customer-barber-portrait" />
                    <UiBadge tone={barber.ready ? "success" : "warning"}>
                      {barber.ready ? "Ready" : "Busy"}
                    </UiBadge>
                  </div>
                  <div className="customer-barber-info">
                    <div className="customer-card-head">
                      <h4>{barber.name}</h4>
                      <span className="customer-barber-rating">
                        <Star size={12} /> {barber.rating}
                      </span>
                    </div>
                    <p className="customer-barber-specialty">{barber.specialty} · {barber.years} yrs exp</p>
                    <div className="customer-barber-meta">
                      <span><BadgeCheck size={12} /> {barber.verified ? "Verified" : "Unverified"}</span>
                      <span><Clock size={12} /> ETA {barber.eta_min} min</span>
                    </div>
                  </div>
                  <div className="customer-shop-actions">
                    <UiButton
                      variant="secondary"
                      onClick={() => {
                        setSelectedBarberId(barber.id);
                        setStatus(`Selected barber ${barber.name}`);
                      }}
                    >
                      View Profile
                    </UiButton>
                    <UiButton
                      onClick={() => {
                        setCurrentView("tracking");
                        setTracking({
                          booking_id: tracking.booking_id,
                          barber_name: barber.name,
                          progress_pct: 12,
                          eta_min: barber.eta_min,
                          state: "on_the_way"
                        });
                      }}
                    >
                      Book Now
                    </UiButton>
                  </div>
                </article>
              ))}
            </section>

            {selectedBarber ? (
              <section className="customer-barber-detail">
                <div className="customer-card-head">
                  <h3>{selectedBarber.name}</h3>
                  <UiBadge tone="success">Profile</UiBadge>
                </div>
                <p className="customer-barber-bio">{selectedBarber.bio}</p>
                <div className="customer-portfolio-grid">
                  {selectedBarber.portfolio.map((photo) => (
                    <img key={photo} src={photo} alt="portfolio" />
                  ))}
                </div>
                <div className="customer-equipment">
                  {selectedBarber.equipment.map((item) => (
                    <UiBadge key={item} tone="neutral">{item}</UiBadge>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : null}

        {/* ── Bookings hub ── */}
        {currentView === "bookings" ? (
          <section className="customer-bookings-hub">
            <div className="customer-card-head">
              <h3>{label("การจอง", "Bookings Hub")}</h3>
              <UiButton onClick={() => void quoteAndCheckout()}>Quote + Checkout</UiButton>
            </div>

            <div className="customer-summary-grid">
              <article className="customer-summary-card">
                <div className="customer-summary-icon"><Scissors size={16} /></div>
                <p>{label("ร้านที่เลือก", "Selected Shop")}</p>
                <h4>{selectedShop?.name ?? "—"}</h4>
              </article>
              <article className="customer-summary-card">
                <div className="customer-summary-icon"><Wallet size={16} /></div>
                <p>{label("ราคาประเมิน", "Quote")}</p>
                <h4>{quoteTotal}</h4>
              </article>
              <article className="customer-summary-card">
                <div className="customer-summary-icon"><CalendarDays size={16} /></div>
                <p>{label("สล็อตถัดไป", "Next Slot")}</p>
                <h4>{selectedSlot ? formatDateTime(selectedSlot) : "—"}</h4>
              </article>
            </div>

            <div className="customer-booking-actions">
              <UiButton variant="secondary" onClick={() => void loadAvailability()} disabled={!selectedShopId || !selectedServiceId}>
                Load Slots
              </UiButton>
              <UiButton variant="secondary" onClick={() => void loadHistory()}>
                Refresh History
              </UiButton>
            </div>

            <DataTable
              caption="Upcoming bookings"
              columns={[
                { key: "id", header: "Booking" },
                { key: "status", header: "Status" },
                { key: "slot", header: "Slot" },
                { key: "action", header: "Action" }
              ]}
              rows={upcomingRows}
              emptyText="No upcoming bookings"
            />
            <div className="row">
              {upcomingRows.slice(0, 3).map((item) => (
                <UiButton key={item.id} variant="secondary" onClick={() => routeFor(item)}>
                  {item.action}
                </UiButton>
              ))}
            </div>
            <DataTable
              caption="Booking history"
              columns={[
                { key: "id", header: "Booking" },
                { key: "status", header: "Status" },
                { key: "slot", header: "Slot" },
                { key: "amount", header: "Amount" }
              ]}
              rows={historyRows}
              emptyText="No history records"
            />
          </section>
        ) : null}

        {/* ── Live Tracking ── */}
        {currentView === "tracking" ? (
          <section className="customer-tracking">
            <div className="customer-card-head">
              <div>
                <h3>{label("ติดตามสด", "Live Tracking")}</h3>
                <p className="customer-tracking-barber-name">{tracking.barber_name}</p>
              </div>
              <UiBadge tone={tracking.state === "completed" ? "success" : "warning"}>
                {tracking.state.replace("_", " ")}
              </UiBadge>
            </div>

            {/* Step indicator */}
            <div className="customer-tracking-steps">
              {TRACKING_STEPS.map(({ state: stepState, label: stepLabel }, i) => {
                const currentIdx = TRACKING_STEPS.findIndex((s) => s.state === tracking.state);
                const stepIdx = i;
                const isDone = stepIdx < currentIdx;
                const isActive = stepState === tracking.state;
                return (
                  <div
                    key={stepState}
                    className={`customer-tracking-step ${isDone ? "is-done" : ""} ${isActive ? "is-active" : ""}`}
                  >
                    {i < TRACKING_STEPS.length - 1 ? <div className={`customer-step-line ${isDone ? "is-done" : ""}`} /> : null}
                    <div className="customer-step-dot">
                      {isDone ? <CheckCircle2 size={14} /> : <span>{i + 1}</span>}
                    </div>
                    <span className="customer-step-label">{stepLabel}</span>
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="customer-tracking-progress-wrap">
              <div className="customer-tracking-progress-bar" style={{ width: `${tracking.progress_pct}%` }} />
            </div>
            <p className="customer-tracking-eta">
              <MapPinned size={14} />
              {tracking.state === "completed"
                ? "Service completed!"
                : `ETA ${tracking.eta_min} min · ${tracking.progress_pct}% complete`}
            </p>

            {/* Action buttons */}
            <div className="customer-tracking-actions">
              <button type="button" className="customer-action-btn">
                <PhoneCall size={18} />
                <span>Call</span>
              </button>
              <button type="button" className="customer-action-btn">
                <CarTaxiFront size={18} />
                <span>Message</span>
              </button>
              <button type="button" className="customer-action-btn customer-action-btn-danger">
                <ShieldAlert size={18} />
                <span>SOS</span>
              </button>
            </div>
          </section>
        ) : null}

        {/* ── Rewards ── */}
        {currentView === "rewards" ? (
          <section className="customer-rewards">
            {/* Tier hero */}
            <div className="customer-rewards-hero">
              <div className={`customer-tier-badge ${tier === "Gold" ? "is-gold" : "is-silver"}`}>
                <Crown size={26} />
                <span>{tier}</span>
              </div>
              <div className="customer-rewards-info">
                <p className="customer-points-label">BarberGo Points</p>
                <h3 className="customer-points-value">{points.toLocaleString()}</h3>
                <p className="customer-points-next">{(nextTierPoints - points).toLocaleString()} pts to next tier</p>
              </div>
            </div>

            {/* Points progress bar */}
            <div className="customer-points-bar-wrap">
              <div className="customer-points-bar" style={{ width: `${pointsProgressPct}%` }} />
            </div>
            <p className="customer-points-progress-label">{pointsProgressPct}% to {tier === "Gold" ? "Platinum" : "Gold"}</p>

            {/* Perk cards */}
            <div className="customer-rewards-perks">
              <div className="customer-perk-card">
                <Wallet size={22} />
                <p>Saved Cards</p>
                <span>3 cards</span>
              </div>
              <div className="customer-perk-card">
                <Crown size={22} />
                <p>Loyalty Perks</p>
                <span>5 active</span>
              </div>
              <div className="customer-perk-card">
                <Heart size={22} />
                <p>Favourites</p>
                <span>2 barbers</span>
              </div>
            </div>

            {/* Wallet summary */}
            <div className="customer-summary-grid">
              <article className="customer-summary-card">
                <div className="customer-summary-icon"><Wallet size={16} /></div>
                <p>Wallet</p>
                <h4>{formatCurrency(1240)}</h4>
              </article>
              <article className="customer-summary-card">
                <div className="customer-summary-icon"><CalendarDays size={16} /></div>
                <p>Total Bookings</p>
                <h4>{history.length}</h4>
              </article>
              <article className="customer-summary-card">
                <div className="customer-summary-icon"><Star size={16} /></div>
                <p>Tier</p>
                <h4>{tier}</h4>
              </article>
            </div>
          </section>
        ) : null}

      </main>
    </PageSection>
  );
}
