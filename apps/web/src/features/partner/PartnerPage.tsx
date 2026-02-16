import { useEffect, useMemo, useState } from "react";
import { completePartnerBooking, confirmPartnerBooking, getPartnerQueue, startPartnerBooking } from "../../lib/api";
import type { Booking } from "../../lib/types";
import { useAuth } from "../auth/AuthContext";
import { DataTable } from "../shared/DataTable";
import { Field, Select } from "../shared/FormControls";
import { JsonView } from "../shared/JsonView";
import { PageSection } from "../shared/PageSection";
import { SkeletonRows } from "../shared/Skeleton";
import { Tabs } from "../shared/Tabs";
import { Toast } from "../shared/Toast";
import { EmptyHint, ErrorBanner, LoadingBadge, StatusLine } from "../shared/UiState";
import { StatCard, UiBadge, UiButton, UiDrawer } from "../shared/UiKit";
import { useI18n } from "../i18n/I18nContext";

type PartnerTab = "queue" | "operations" | "debug";

export function PartnerPage(): JSX.Element {
  const { token } = useAuth();
  const { formatCurrency, formatDateTime, label } = useI18n();
  const [queue, setQueue] = useState<Booking[]>([]);
  const [activeBookingId, setActiveBookingId] = useState("");
  const [status, setStatus] = useState("Idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PartnerTab>("queue");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeBooking = queue.find((booking) => booking.id === activeBookingId) ?? null;

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
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function refreshQueue(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const data = await getPartnerQueue(token);
      setQueue(data.data);
      if (data.data.length > 0 && !activeBookingId) {
        setActiveBookingId(data.data[0].id);
      }
      if (data.data.length === 0) {
        setActiveBookingId("");
      }
      setStatus(`Loaded ${data.data.length} incoming bookings`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load queue failed");
    } finally {
      setLoading(false);
    }
  }

  async function confirmActive(): Promise<void> {
    if (!activeBookingId) return;
    try {
      await confirmPartnerBooking(token, activeBookingId);
      setStatus(`Confirmed ${activeBookingId}`);
      setToast("Booking confirmed");
      await refreshQueue();
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus(`Confirm failed: ${message}`);
    }
  }

  async function startActive(): Promise<void> {
    if (!activeBookingId) return;
    try {
      await startPartnerBooking(token, activeBookingId);
      setStatus(`Started ${activeBookingId}`);
      setToast("Booking started");
      await refreshQueue();
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus(`Start failed: ${message}`);
    }
  }

  async function completeActive(): Promise<void> {
    if (!activeBookingId) return;
    try {
      await completePartnerBooking(token, activeBookingId);
      setStatus(`Completed ${activeBookingId}`);
      setToast("Booking completed");
      setActiveBookingId("");
      await refreshQueue();
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus(`Complete failed: ${message}`);
    }
  }

  return (
    <PageSection
      title={label("แกนหลักพาร์ทเนอร์", "Partner App Core")}
      subtitle={label("จัดการคิวงานพร้อมควบคุมการเปลี่ยนสถานะอย่างปลอดภัย", "Queue operations with safer transition controls")}
    >
      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}

      <div className="stats-grid">
        <StatCard label={label("คิวเข้า", "Incoming Queue")} value={queue.length} />
        <StatCard label={label("งานที่เลือก", "Active Booking")} value={activeBookingId || "-"} />
        <StatCard label={label("สถานะปัจจุบัน", "Active Status")} value={activeBooking?.status ?? "-"} />
      </div>

      <div className="row">
        <UiButton onClick={refreshQueue}>{label("โหลดคิว", "Load Queue")}</UiButton>
        <UiButton variant="secondary" onClick={() => setDrawerOpen(true)} disabled={!activeBookingId}>
          {label("เปิดรายละเอียด", "Open Booking Drawer")}
        </UiButton>
        <UiButton onClick={confirmActive} disabled={!activeBookingId}>
          {label("ยืนยัน", "Confirm")}
        </UiButton>
        <UiButton onClick={startActive} disabled={!activeBookingId}>
          {label("เริ่มงาน", "Start")}
        </UiButton>
        <UiButton onClick={completeActive} disabled={!activeBookingId}>
          {label("จบงาน", "Complete")}
        </UiButton>
      </div>
      <p className="helper-note">
        {label(
          "ลำดับที่ปลอดภัย: Load Queue -> Confirm -> Start -> Complete",
          "Safe transition order: Load Queue -> Confirm -> Start -> Complete"
        )}
      </p>

      <Tabs
        value={activeTab}
        onChange={(value) => setActiveTab(value as PartnerTab)}
        tabs={[
          { value: "queue", label: label("คิว", "Queue") },
          { value: "operations", label: label("ปฏิบัติการ", "Operations") },
          { value: "debug", label: "Debug JSON" }
        ]}
      />

      {loading ? <LoadingBadge text={label("กำลังโหลดข้อมูลพาร์ทเนอร์...", "Partner operations loading...")} /> : null}
      {loading && activeTab !== "debug" ? <SkeletonRows count={3} /> : null}
      {error ? <ErrorBanner message={error} /> : null}
      <StatusLine value={status} />
      <div className="row">
        <UiBadge tone={activeBooking?.status === "completed" ? "success" : "warning"}>
          {activeBooking?.status ?? "no-active"}
        </UiBadge>
      </div>

      {activeTab === "operations" ? (
        <div className="form-grid">
          <Field label="Active booking">
            <Select
              value={activeBookingId}
              onChange={setActiveBookingId}
              options={
                queue.length
                  ? queue.map((booking) => ({
                      value: booking.id,
                      label: `${booking.id} (${booking.status})`
                    }))
                  : [{ value: "", label: "No queue items" }]
              }
            />
          </Field>
        </div>
      ) : null}

      {activeTab === "queue" ? (
        <DataTable
          caption={label("ตารางคิวงานเข้า", "Partner incoming booking queue")}
          columns={[
            { key: "id", header: "Booking" },
            { key: "status", header: "Status" },
            { key: "slot", header: "Slot" },
            { key: "amount", header: "Amount" }
          ]}
          rows={queueRows}
          emptyText={label("ยังไม่มีรายการคิวเข้า", "No incoming queue items.")}
        />
      ) : null}

      {activeTab === "debug" ? <JsonView value={{ queue, activeBookingId }} /> : null}

      {!loading && !error && queue.length === 0 ? (
        <EmptyHint
          message={label("ยังไม่มีรายการคิวเข้า เมื่อมีการจองใหม่จะปรากฏที่นี่", "No incoming queue items. New bookings will appear here.")}
        />
      ) : null}

      <UiDrawer title={label("รายละเอียดการจอง", "Booking Details")} open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {activeBooking ? (
          <div className="drawer-grid">
            <p>
              <strong>{label("รหัส", "ID")}:</strong> {activeBooking.id}
            </p>
            <p>
              <strong>{label("สถานะ", "Status")}:</strong> {activeBooking.status}
            </p>
            <p>
              <strong>{label("สล็อต", "Slot")}:</strong> {activeBooking.slot_at ? formatDateTime(activeBooking.slot_at) : "-"}
            </p>
            <p>
              <strong>{label("ยอดเงิน", "Amount")}:</strong> {formatCurrency(activeBooking.amount)}
            </p>
          </div>
        ) : (
          <EmptyHint message={label("ยังไม่ได้เลือกงาน", "No active booking selected.")} />
        )}
      </UiDrawer>
    </PageSection>
  );
}
