import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Briefcase,
  CalendarDays,
  CheckCheck,
  CircleDollarSign,
  Clock3,
  Crown,
  MapPinned,
  Settings,
  ShieldCheck,
  Star,
  ToggleLeft,
  ToggleRight,
  Wallet
} from "lucide-react";
import { completePartnerBooking, confirmPartnerBooking, getPartnerQueue, startPartnerBooking } from "../../lib/api";
import type { Booking } from "../../lib/types";
import { useAuth } from "../auth/AuthContext";
import { DataTable } from "../shared/DataTable";
import { EmptyHint, ErrorBanner, LoadingBadge, StatusLine } from "../shared/UiState";
import { PageSection } from "../shared/PageSection";
import { UiBadge, UiButton } from "../shared/UiKit";
import { useI18n } from "../i18n/I18nContext";

type PartnerView = "dashboard" | "services" | "bookings" | "wallet" | "settings";

type IncomingJob = {
  id: string;
  customer_name: string;
  distance_km: number;
  eta_min: number;
  net_earnings: number;
  ttl_sec: number;
  status: "draft" | "confirmed" | "on_the_way" | "in_progress" | "completed";
};

type ActiveService = {
  id: string;
  name: string;
  price: number;
  duration_min: number;
  surcharge: number;
  available: boolean;
};

type ScheduleState = Record<string, boolean>;

const MOCK_INCOMING_JOBS: IncomingJob[] = [
  {
    id: "job_dv_101",
    customer_name: "Narin P.",
    distance_km: 3.4,
    eta_min: 14,
    net_earnings: 520,
    ttl_sec: 90,
    status: "draft"
  },
  {
    id: "job_dv_102",
    customer_name: "Mint S.",
    distance_km: 5.8,
    eta_min: 21,
    net_earnings: 740,
    ttl_sec: 60,
    status: "draft"
  }
];

const MOCK_SERVICES: ActiveService[] = [
  { id: "svc_partner_1", name: "Men Haircut", price: 390, duration_min: 45, surcharge: 0, available: true },
  { id: "svc_partner_2", name: "Beard + Styling", price: 320, duration_min: 35, surcharge: 0, available: true },
  { id: "svc_partner_3", name: "Home Visit Premium", price: 790, duration_min: 60, surcharge: 120, available: true }
];

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function statusTone(status: IncomingJob["status"]): "neutral" | "success" | "warning" | "danger" {
  if (status === "completed") return "success";
  if (status === "on_the_way" || status === "in_progress") return "warning";
  if (status === "confirmed") return "neutral";
  return "danger";
}

export function PartnerPage(): JSX.Element {
  const { token } = useAuth();
  const { formatCurrency, formatDateTime, label } = useI18n();

  const [currentView, setCurrentView] = useState<PartnerView>("dashboard");
  const [isPartnerMode, setIsPartnerMode] = useState(true);
  const [isOnlineStatus, setIsOnlineStatus] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<IncomingJob | null>(null);

  const [queue, setQueue] = useState<Booking[]>([]);
  const [incomingJobs, setIncomingJobs] = useState<IncomingJob[]>(MOCK_INCOMING_JOBS);
  const [activeServices, setActiveServices] = useState<ActiveService[]>(MOCK_SERVICES);
  const [schedule, setSchedule] = useState<ScheduleState>(() =>
    WEEK_DAYS.reduce<ScheduleState>((acc, day) => {
      acc[day] = day !== "Sun";
      return acc;
    }, {})
  );

  const [status, setStatus] = useState("Idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kycVerified, setKycVerified] = useState(false);

  const todayJobs = queue.length + incomingJobs.filter((job) => job.status === "completed").length;
  const todayEarnings =
    queue.filter((booking) => booking.status === "completed").reduce((sum, booking) => sum + booking.amount, 0) +
    incomingJobs.filter((job) => job.status === "completed").reduce((sum, job) => sum + job.net_earnings, 0);
  const avgRating = 4.8;

  const availableBalance = todayEarnings + 3280;
  const pendingBalance = queue
    .filter((booking) => booking.status === "authorized" || booking.status === "confirmed" || booking.status === "started")
    .reduce((sum, booking) => sum + booking.amount, 0);

  const queueRows = useMemo(
    () =>
      queue.map((booking) => ({
        id: booking.id,
        status: booking.status,
        slot: booking.slot_at ? formatDateTime(booking.slot_at) : "-",
        amount: formatCurrency(booking.amount)
      })),
    [formatCurrency, formatDateTime, queue]
  );

  useEffect(() => {
    if (!isOnlineStatus) return;
    const timer = window.setInterval(() => {
      setIncomingJobs((prev) =>
        prev
          .map((job) => ({ ...job, ttl_sec: Math.max(0, job.ttl_sec - 1) }))
          .filter((job) => job.ttl_sec > 0 || job.status !== "draft")
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isOnlineStatus]);

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

  async function runLifecycle(bookingId: string, next: "confirm" | "start" | "complete"): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      if (next === "confirm") await confirmPartnerBooking(token, bookingId);
      if (next === "start") await startPartnerBooking(token, bookingId);
      if (next === "complete") await completePartnerBooking(token, bookingId);
      await refreshQueue();
      setStatus(`Lifecycle moved: ${next} -> ${bookingId}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus(`Lifecycle failed: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  function toggleServiceAvailability(id: string): void {
    setActiveServices((prev) => prev.map((service) => (service.id === id ? { ...service, available: !service.available } : service)));
  }

  function updateService(id: string, patch: Partial<ActiveService>): void {
    setActiveServices((prev) => prev.map((service) => (service.id === id ? { ...service, ...patch } : service)));
  }

  function acceptIncomingJob(jobId: string): void {
    setIncomingJobs((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, status: "confirmed", ttl_sec: 999 } : job))
    );
    setStatus(`Accepted ${jobId}`);
  }

  function declineIncomingJob(jobId: string): void {
    setIncomingJobs((prev) => prev.filter((job) => job.id !== jobId));
    setStatus(`Declined ${jobId}`);
  }

  function moveJobStatus(jobId: string, statusValue: IncomingJob["status"]): void {
    setIncomingJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, status: statusValue } : job)));
    setStatus(`Job ${jobId} moved to ${statusValue}`);
  }

  const growthBars = [
    { label: "W1", value: 42 },
    { label: "W2", value: 58 },
    { label: "W3", value: 66 },
    { label: "W4", value: 74 }
  ];

  return (
    <PageSection
      title={label("พาร์ทเนอร์ฮับ", "Partner Hub")}
      subtitle={label("ศูนย์ควบคุมงาน รายได้ และการให้บริการแบบมืออาชีพ", "Professional operations, service, and earnings control center")}
    >
      <main className={isPartnerMode ? "partner-hub" : "partner-hub partner-hub-lite"}>
        <section className="partner-status-bar">
          <div>
            <p className="partner-label">Partner Mode</p>
            <h3>{isPartnerMode ? "ON" : "OFF"}</h3>
          </div>
          <button type="button" className="partner-toggle" onClick={() => setIsPartnerMode((prev) => !prev)}>
            {isPartnerMode ? <ToggleRight size={20} /> : <ToggleLeft size={20} />} {isPartnerMode ? "Partner" : "Customer"}
          </button>
          <button type="button" className={`partner-toggle ${isOnlineStatus ? "is-online" : ""}`} onClick={() => setIsOnlineStatus((prev) => !prev)}>
            {isOnlineStatus ? <CheckCheck size={18} /> : <Clock3 size={18} />} {isOnlineStatus ? "Online" : "Offline"}
          </button>
        </section>

        {!kycVerified ? (
          <section className="partner-kyc-banner" role="alert">
            <ShieldCheck size={18} />
            <p>Background Check Verification pending. Complete KYC before first live job.</p>
            <UiButton variant="secondary" onClick={() => setKycVerified(true)}>
              Mark KYC Complete
            </UiButton>
          </section>
        ) : null}

        {loading ? <LoadingBadge text="Partner Hub loading..." /> : null}
        {error ? <ErrorBanner message={error} /> : null}
        <StatusLine value={status} />

        {currentView === "dashboard" ? (
          <>
            <div className="partner-quick-look">
              <article className="partner-metric-card">
                <Briefcase size={18} />
                <p>Today's Jobs</p>
                <h4>{todayJobs}</h4>
              </article>
              <article className="partner-metric-card">
                <CircleDollarSign size={18} />
                <p>Net Earnings</p>
                <h4>{formatCurrency(todayEarnings)}</h4>
              </article>
              <article className="partner-metric-card">
                <Star size={18} />
                <p>Avg Rating</p>
                <h4>{avgRating}</h4>
              </article>
            </div>

            <section className="partner-chart-card">
              <h3>Growth Chart</h3>
              <div className="partner-growth-bars">
                {growthBars.map((bar) => (
                  <div key={bar.label} className="partner-growth-col">
                    <div className="partner-growth-bar" style={{ height: `${bar.value}%` }} />
                    <span>{bar.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="partner-jobs-section">
              <div className="partner-jobs-head">
                <h3>Incoming Job Alerts</h3>
                <UiButton variant="secondary" onClick={() => void refreshQueue()}>
                  Sync Queue
                </UiButton>
              </div>
              {incomingJobs.length === 0 ? <EmptyHint message="No incoming delivery requests." /> : null}
              <div className="partner-jobs-grid">
                {incomingJobs.map((job) => (
                  <motion.article key={job.id} className="partner-job-card" layout initial={{ opacity: 0.7 }} animate={{ opacity: 1 }}>
                    <div className="partner-job-head">
                      <h4>{job.customer_name}</h4>
                      <UiBadge tone={statusTone(job.status)}>{job.status}</UiBadge>
                    </div>
                    <p>
                      <MapPinned size={14} /> {job.distance_km} km | ETA {job.eta_min} min
                    </p>
                    <p>
                      <Wallet size={14} /> Net {formatCurrency(job.net_earnings)}
                    </p>
                    {job.status === "draft" ? <p className="partner-countdown">Accept window: {job.ttl_sec}s</p> : null}
                    <div className="row">
                      {job.status === "draft" ? (
                        <>
                          <UiButton onClick={() => acceptIncomingJob(job.id)}>Accept</UiButton>
                          <UiButton variant="secondary" onClick={() => declineIncomingJob(job.id)}>
                            Decline
                          </UiButton>
                        </>
                      ) : null}
                      {job.status === "confirmed" ? (
                        <UiButton onClick={() => moveJobStatus(job.id, "on_the_way")}>Start Travel</UiButton>
                      ) : null}
                      {job.status === "on_the_way" ? (
                        <UiButton onClick={() => moveJobStatus(job.id, "in_progress")}>Arrived / In Progress</UiButton>
                      ) : null}
                      {job.status === "in_progress" ? (
                        <UiButton onClick={() => moveJobStatus(job.id, "completed")}>Finish Job</UiButton>
                      ) : null}
                      <UiButton variant="secondary" onClick={() => setSelectedProfile(job)}>
                        Open Detail
                      </UiButton>
                    </div>
                  </motion.article>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {currentView === "services" ? (
          <section className="partner-card">
            <h3>Service Management</h3>
            <div className="partner-services-list">
              {activeServices.map((service) => (
                <article key={service.id} className="partner-service-item">
                  <h4>{service.name}</h4>
                  <div className="partner-service-grid">
                    <label>
                      Price
                      <input
                        className="input"
                        type="number"
                        value={service.price}
                        onChange={(event) => updateService(service.id, { price: Number(event.target.value || 0) })}
                      />
                    </label>
                    <label>
                      Duration (min)
                      <input
                        className="input"
                        type="number"
                        value={service.duration_min}
                        onChange={(event) => updateService(service.id, { duration_min: Number(event.target.value || 0) })}
                      />
                    </label>
                    <label>
                      Surcharge
                      <input
                        className="input"
                        type="number"
                        value={service.surcharge}
                        onChange={(event) => updateService(service.id, { surcharge: Number(event.target.value || 0) })}
                      />
                    </label>
                    <label>
                      Availability
                      <button type="button" className="partner-toggle" onClick={() => toggleServiceAvailability(service.id)}>
                        {service.available ? "Available" : "Disabled"}
                      </button>
                    </label>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {currentView === "bookings" ? (
          <section className="partner-card">
            <div className="partner-jobs-head">
              <h3>Live Queue & Booking Lifecycle</h3>
              <UiButton onClick={() => void refreshQueue()}>Load Queue</UiButton>
            </div>
            <div className="row">
              <UiButton variant="secondary" onClick={() => void runLifecycle(queue[0]?.id ?? "", "confirm")} disabled={!queue[0]?.id}>
                Confirm First
              </UiButton>
              <UiButton variant="secondary" onClick={() => void runLifecycle(queue[0]?.id ?? "", "start")} disabled={!queue[0]?.id}>
                Start First
              </UiButton>
              <UiButton variant="secondary" onClick={() => void runLifecycle(queue[0]?.id ?? "", "complete")} disabled={!queue[0]?.id}>
                Complete First
              </UiButton>
            </div>
            <DataTable
              caption="Partner queue"
              columns={[
                { key: "id", header: "Booking" },
                { key: "status", header: "Status" },
                { key: "slot", header: "Slot" },
                { key: "amount", header: "Amount" }
              ]}
              rows={queueRows}
              emptyText="No incoming queue"
            />
          </section>
        ) : null}

        {currentView === "wallet" ? (
          <section className="partner-card">
            <h3>Wallet & Payout</h3>
            <div className="partner-quick-look">
              <article className="partner-metric-card">
                <Wallet size={18} />
                <p>Available Balance</p>
                <h4>{formatCurrency(availableBalance)}</h4>
              </article>
              <article className="partner-metric-card">
                <Clock3 size={18} />
                <p>Pending Balance</p>
                <h4>{formatCurrency(pendingBalance)}</h4>
              </article>
              <article className="partner-metric-card">
                <Crown size={18} />
                <p>Tier</p>
                <h4>{availableBalance > 12000 ? "Gold" : "Silver"}</h4>
              </article>
            </div>
            <div className="row">
              <UiButton>Request Payout</UiButton>
              <UiButton variant="secondary">Instant Withdrawal</UiButton>
            </div>
            <div className="partner-wallet-list">
              {queue.slice(0, 8).map((booking) => (
                <article key={booking.id} className="partner-wallet-item">
                  <p>{booking.id}</p>
                  <p>{booking.status}</p>
                  <p>{formatCurrency(booking.amount)}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {currentView === "settings" ? (
          <section className="partner-card">
            <h3>Weekly Schedule Grid</h3>
            <div className="partner-schedule-grid">
              {WEEK_DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  className={`partner-day-pill ${schedule?.[day] ? "is-active" : ""}`}
                  onClick={() => setSchedule((prev) => ({ ...prev, [day]: !prev?.[day] }))}
                >
                  {day}
                </button>
              ))}
            </div>
            <div className="row">
              <UiButton variant="secondary">Quick Break 30 min</UiButton>
              <UiButton variant="secondary">Vacation Mode</UiButton>
            </div>
          </section>
        ) : null}

        {selectedProfile ? (
          <section className="partner-card">
            <h3>Selected Job Profile</h3>
            <p>Customer: {selectedProfile?.customer_name}</p>
            <p>Distance: {selectedProfile?.distance_km} km</p>
            <p>ETA: {selectedProfile?.eta_min} min</p>
            <p>Status: {selectedProfile?.status}</p>
            <div className="row">
              <UiButton variant="secondary" onClick={() => setSelectedProfile(null)}>
                Close
              </UiButton>
            </div>
          </section>
        ) : null}

        <nav className="partner-bottom-nav" aria-label="Partner navigation">
          <button type="button" className={currentView === "dashboard" ? "is-active" : ""} onClick={() => setCurrentView("dashboard")}>
            <Bell size={16} /> Dashboard
          </button>
          <button type="button" className={currentView === "services" ? "is-active" : ""} onClick={() => setCurrentView("services")}>
            <Briefcase size={16} /> Services
          </button>
          <button type="button" className={currentView === "bookings" ? "is-active" : ""} onClick={() => setCurrentView("bookings")}>
            <Clock3 size={16} /> Bookings
          </button>
          <button type="button" className={currentView === "wallet" ? "is-active" : ""} onClick={() => setCurrentView("wallet")}>
            <Wallet size={16} /> Wallet
          </button>
          <button type="button" className={currentView === "settings" ? "is-active" : ""} onClick={() => setCurrentView("settings")}>
            <Settings size={16} /> Settings
          </button>
        </nav>
      </main>
    </PageSection>
  );
}
