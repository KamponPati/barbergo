import { useEffect, useMemo, useState } from "react";
import { checkoutBooking, getAvailability, getCustomerHistory, getNearbyShops, quoteBooking } from "../../lib/api";
import type { Booking, Shop } from "../../lib/types";
import { useAuth } from "../auth/AuthContext";
import { DataTable } from "../shared/DataTable";
import { Field, Input, Select } from "../shared/FormControls";
import { JsonView } from "../shared/JsonView";
import { PageSection } from "../shared/PageSection";
import { SkeletonRows } from "../shared/Skeleton";
import { Tabs } from "../shared/Tabs";
import { Toast } from "../shared/Toast";
import { EmptyHint, ErrorBanner, LoadingBadge, StatusLine } from "../shared/UiState";
import { StatCard, UiBadge, UiButton, UiModal } from "../shared/UiKit";
import { useI18n } from "../i18n/I18nContext";

type CustomerTab = "actions" | "history" | "debug";

export function CustomerPage(): JSX.Element {
  const { token } = useAuth();
  const { formatCurrency, formatDateTime, label } = useI18n();
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [quote, setQuote] = useState<Record<string, unknown> | null>(null);
  const [history, setHistory] = useState<Booking[]>([]);
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState("Idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CustomerTab>("actions");
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  const selectedShop = shops.find((shop) => shop.id === selectedShopId) ?? null;
  const selectedService = selectedShop?.services.find((service) => service.id === selectedServiceId) ?? null;

  const filteredShops = useMemo(() => {
    if (!searchText.trim()) return shops;
    const q = searchText.trim().toLowerCase();
    return shops.filter((shop) => shop.name.toLowerCase().includes(q));
  }, [searchText, shops]);

  const historyRows = useMemo(
    () =>
      history.map((booking) => ({
        id: booking.id,
        status: booking.status,
        slot: booking.slot_at ? formatDateTime(booking.slot_at) : "-",
        amount: formatCurrency(booking.amount)
      })),
    [formatCurrency, formatDateTime, history]
  );

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function syncShopDefaults(nextShop: Shop | null): void {
    setSelectedServiceId(nextShop?.services[0]?.id ?? "");
    setSelectedBranchId(nextShop?.branches?.[0]?.id ?? nextShop?.branch_ids?.[0] ?? "branch_1");
  }

  async function loadShops(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const data = await getNearbyShops();
      setShops(data.data);
      const first = data.data[0] ?? null;
      setSelectedShopId(first?.id ?? "");
      syncShopDefaults(first);
      setStatus(`Loaded ${data.data.length} shops`);
      setToast("Shops loaded");
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load shops failed");
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailability(): Promise<void> {
    if (!selectedShopId || !selectedServiceId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAvailability(selectedShopId, selectedServiceId, selectedBranchId || "branch_1");
      setSlots(data.slots);
      setSelectedSlot(data.slots[0] ?? "");
      setStatus(`Loaded ${data.slots.length} slots`);
      setToast("Availability loaded");
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load availability failed");
    } finally {
      setLoading(false);
    }
  }

  async function loadQuote(): Promise<void> {
    if (!selectedShopId || !selectedServiceId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await quoteBooking(token, selectedShopId, selectedServiceId);
      setQuote(data);
      setStatus("Quote calculated");
      setToast("Quote ready");
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Quote failed");
    } finally {
      setLoading(false);
    }
  }

  async function checkout(): Promise<void> {
    if (!selectedShopId || !selectedServiceId) return;
    setLoading(true);
    setError(null);
    try {
      const slotAt = selectedSlot || slots[0] || "2026-02-20T10:00:00.000Z";
      const data = await checkoutBooking({ token, shopId: selectedShopId, serviceId: selectedServiceId, slot: slotAt });
      setStatus(`Booked ${data.booking.id}`);
      setToast("Checkout completed");
      await loadHistory();
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomerHistory(token);
      setHistory(data.data);
      setStatus(`Loaded ${data.data.length} bookings`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load history failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageSection
      title={label("แกนหลักลูกค้า", "Customer App Core")}
      subtitle={label(
        "ค้นหาร้าน ตรวจสอบคิว ขอราคา ชำระเงิน และดูประวัติในหน้าเดียว",
        "Discovery, availability, quote, checkout, and history in one flow"
      )}
    >
      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}

      <div className="stats-grid">
        <StatCard label={label("ร้านที่กรอง", "Filtered Shops")} value={filteredShops.length} />
        <StatCard label={label("สล็อต", "Slots")} value={slots.length} />
        <StatCard label={label("ประวัติ", "History")} value={history.length} />
        <StatCard label={label("บริการที่เลือก", "Selected Service")} value={selectedService?.name ?? "-"} />
      </div>

      <div className="form-grid">
        <Field label={label("ค้นหาร้าน", "Search shop")}>
          <Input value={searchText} onChange={setSearchText} placeholder={label("ค้นหาจากชื่อร้าน", "Search by shop name")} />
        </Field>
        <Field label={label("ร้าน", "Shop")}>
          <Select
            value={selectedShopId}
            onChange={(nextShopId) => {
              setSelectedShopId(nextShopId);
              const nextShop = shops.find((shop) => shop.id === nextShopId) ?? null;
              syncShopDefaults(nextShop);
              setSlots([]);
              setSelectedSlot("");
            }}
            options={
              filteredShops.length > 0
                ? filteredShops.map((shop) => ({
                    value: shop.id,
                    label: `${shop.name} (${shop.rating})`
                  }))
                : [{ value: "", label: label("ไม่พบร้าน", "No shops found") }]
            }
          />
        </Field>
        <Field label={label("สาขา", "Branch")}>
          <Select
            value={selectedBranchId}
            onChange={setSelectedBranchId}
            disabled={!selectedShop}
            options={
              selectedShop?.branches?.length
                ? selectedShop.branches.map((branch) => ({
                    value: branch.id,
                    label: branch.name
                  }))
                : [{ value: selectedBranchId || "branch_1", label: selectedBranchId || "branch_1" }]
            }
          />
        </Field>
        <Field label={label("บริการ", "Service")}>
          <Select
            value={selectedServiceId}
            onChange={setSelectedServiceId}
            disabled={!selectedShop}
            options={
              selectedShop?.services?.length
                ? selectedShop.services.map((service) => ({
                    value: service.id,
                    label: `${service.name} (${formatCurrency(service.price)})`
                  }))
                : [{ value: "", label: label("ไม่มีบริการ", "No services") }]
            }
          />
        </Field>
      </div>

      <div className="row">
        <UiButton onClick={loadShops}>{label("โหลดร้าน", "Load Shops")}</UiButton>
        <UiButton onClick={loadAvailability} disabled={!selectedShopId || !selectedServiceId}>
          {label("โหลดเวลาว่าง", "Load Availability")}
        </UiButton>
        <UiButton onClick={loadQuote} disabled={!selectedShopId || !selectedServiceId}>
          {label("ขอราคา", "Quote")}
        </UiButton>
        <UiButton onClick={() => setCheckoutModalOpen(true)} disabled={!selectedShopId || !selectedServiceId}>
          {label("ชำระเงิน", "Checkout")}
        </UiButton>
        <UiButton variant="secondary" onClick={loadHistory}>
          {label("โหลดประวัติ", "Load History")}
        </UiButton>
      </div>
      <p className="helper-note">
        {label(
          "ลำดับที่แนะนำ: โหลดร้าน -> โหลดเวลาว่าง -> ขอราคา -> ชำระเงิน -> โหลดประวัติ",
          "Recommended order: Load Shops -> Load Availability -> Quote -> Checkout -> Load History"
        )}
      </p>

      <Tabs
        value={activeTab}
        onChange={(value) => setActiveTab(value as CustomerTab)}
        tabs={[
          { value: "actions", label: label("การทำงาน", "Actions") },
          { value: "history", label: label("ประวัติ", "History") },
          { value: "debug", label: "Debug JSON" }
        ]}
      />

      {loading ? <LoadingBadge text={label("กำลังโหลดข้อมูลลูกค้า...", "Customer flow loading...")} /> : null}
      {loading && activeTab !== "debug" ? <SkeletonRows count={4} /> : null}
      {error ? <ErrorBanner message={error} /> : null}
      <StatusLine value={status} />
      <div className="row">
        <UiBadge tone={quote ? "success" : "neutral"}>{quote ? "Quote Ready" : "Quote Pending"}</UiBadge>
        <UiBadge tone={slots.length > 0 ? "success" : "warning"}>{slots.length > 0 ? "Slots Available" : "No Slots"}</UiBadge>
      </div>

      {!loading && !error && shops.length === 0 ? (
        <EmptyHint message={label("ยังไม่มีข้อมูลร้าน กดโหลดร้านเพื่อเริ่มต้น", "No shops loaded yet. Click Load Shops.")} />
      ) : null}

      {activeTab === "actions" ? (
        <div className="form-grid">
          <Field label={label("สล็อตที่เลือก", "Selected slot")} hint={label("ใช้ส่งตอน checkout", "Used for checkout request")}>
            <Select
              value={selectedSlot}
              onChange={setSelectedSlot}
              disabled={slots.length === 0}
              options={
                slots.length
                  ? slots.map((slot) => ({ value: slot, label: formatDateTime(slot) }))
                  : [{ value: "", label: label("ยังไม่มีสล็อต", "No slots loaded") }]
              }
            />
          </Field>
          <Field label={label("ราคาปัจจุบัน", "Current quote")}>
            <Input value={quote?.total ? formatCurrency(Number(quote.total)) : "-"} onChange={() => {}} readOnly />
          </Field>
        </div>
      ) : null}

      {activeTab === "history" ? (
        <DataTable
          caption={label("ตารางประวัติการจองลูกค้า", "Customer booking history table")}
          columns={[
            { key: "id", header: "Booking" },
            { key: "status", header: "Status" },
            { key: "slot", header: "Slot" },
            { key: "amount", header: "Amount" }
          ]}
          rows={historyRows}
          emptyText={label("ยังไม่มีประวัติ", "No history yet.")}
        />
      ) : null}

      {activeTab === "debug" ? (
        <JsonView
          value={{
            selectedShop,
            selectedBranchId,
            selectedServiceId,
            selectedSlot,
            slots,
            quote,
            history,
            shops
          }}
        />
      ) : null}

      <UiModal
        open={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        title={label("ยืนยันการชำระเงิน", "Confirm Checkout")}
        footer={
          <div className="row">
            <UiButton variant="secondary" onClick={() => setCheckoutModalOpen(false)}>
              {label("ยกเลิก", "Cancel")}
            </UiButton>
            <UiButton
              onClick={async () => {
                await checkout();
                setCheckoutModalOpen(false);
              }}
            >
              {label("ยืนยันการจอง", "Confirm Booking")}
            </UiButton>
          </div>
        }
      >
        <p>
          {label("ร้าน", "Shop")}: <strong>{selectedShop?.name ?? "-"}</strong>
        </p>
        <p>
          {label("บริการ", "Service")}: <strong>{selectedService?.name ?? "-"}</strong>
        </p>
        <p>
          {label("สล็อตเวลา", "Slot")}: <strong>{selectedSlot ? formatDateTime(selectedSlot) : "-"}</strong>
        </p>
        <p>
          {label("ยอดรวม", "Quote Total")}: <strong>{quote?.total ? formatCurrency(Number(quote.total)) : "-"}</strong>
        </p>
      </UiModal>
    </PageSection>
  );
}
