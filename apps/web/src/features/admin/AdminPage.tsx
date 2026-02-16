import { useEffect, useMemo, useState } from "react";
import { estimateDynamicPricing, getAdvancedAnalytics, getScaleGateEval, getUnitEconomics } from "../../lib/api";
import { DataTable } from "../shared/DataTable";
import { JsonView } from "../shared/JsonView";
import { PageSection } from "../shared/PageSection";
import { SkeletonRows } from "../shared/Skeleton";
import { Tabs } from "../shared/Tabs";
import { Toast } from "../shared/Toast";
import { EmptyHint, ErrorBanner, LoadingBadge, StatusLine } from "../shared/UiState";
import { StatCard, UiBadge, UiButton } from "../shared/UiKit";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";

type AdminTab = "overview" | "zones" | "economics" | "debug";

type ZoneEvalRow = {
  zone_id: string;
  completion_rate: number;
  complaint_rate: number;
  refund_rate: number;
  decision: string;
};

type UnitEconomicsRow = {
  zone_id: string;
  gross_revenue: number;
  contribution_margin_value: number;
  bookings: number;
};

function numberValue(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "-";
}

export function AdminPage(): JSX.Element {
  const { token } = useAuth();
  const { formatCurrency, label } = useI18n();
  const [zoneEval, setZoneEval] = useState<unknown>(null);
  const [unitEconomics, setUnitEconomics] = useState<unknown>(null);
  const [advanced, setAdvanced] = useState<unknown>(null);
  const [priceEstimation, setPriceEstimation] = useState<unknown>(null);
  const [status, setStatus] = useState("Idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  const zoneRows = useMemo(() => {
    const source = (zoneEval as { data?: ZoneEvalRow[] } | null)?.data ?? [];
    return source.map((row) => ({
      zone: row.zone_id,
      completion: `${Math.round(numberValue(row.completion_rate) * 100)}%`,
      complaint: `${Math.round(numberValue(row.complaint_rate) * 100)}%`,
      refund: `${Math.round(numberValue(row.refund_rate) * 100)}%`,
      decision: stringValue(row.decision)
    }));
  }, [zoneEval]);

  const economicsRows = useMemo(() => {
    const source = (unitEconomics as { data?: UnitEconomicsRow[] } | null)?.data ?? [];
    return source.map((row) => ({
      zone: row.zone_id,
      gross: formatCurrency(numberValue(row.gross_revenue)),
      contribution: formatCurrency(numberValue(row.contribution_margin_value)),
      bookings: numberValue(row.bookings)
    }));
  }, [formatCurrency, unitEconomics]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

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

  return (
    <PageSection
      title={label("แกนหลักแอดมิน", "Admin Web Core")}
      subtitle={label("กำกับดูแล วิเคราะห์เศรษฐศาสตร์ และควบคุมราคา", "Governance, economics, and pricing controls")}
    >
      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}

      <div className="stats-grid">
        <StatCard label={label("เกตโซน", "Zone Gates")} value={zoneRows.length ? label("โหลดแล้ว", "Loaded") : "-"} />
        <StatCard label={label("เศรษฐศาสตร์ต่อหน่วย", "Unit Economics")} value={economicsRows.length ? label("โหลดแล้ว", "Loaded") : "-"} />
        <StatCard label={label("วิเคราะห์ขั้นสูง", "Advanced Analytics")} value={advanced ? label("โหลดแล้ว", "Loaded") : "-"} />
        <StatCard label={label("ราคาไดนามิก", "Dynamic Pricing")} value={priceEstimation ? label("คำนวณแล้ว", "Estimated") : "-"} />
      </div>

      <div className="row">
        <UiButton
          onClick={() =>
            runAction(
              async () => {
                const data = await getScaleGateEval(token);
                setZoneEval(data);
                setStatus("Loaded zone gate evaluation");
                setToast("Zone gate evaluation loaded");
              },
              "Loading zone gate evaluation",
              "Zone gate evaluation failed"
            )
          }
        >
          {label("ประเมินเกตโซน", "Evaluate Zone Gates")}
        </UiButton>
        <UiButton
          onClick={() =>
            runAction(
              async () => {
                const data = await getUnitEconomics(token);
                setUnitEconomics(data);
                setStatus("Loaded unit economics");
                setToast("Unit economics loaded");
              },
              "Loading unit economics",
              "Unit economics failed"
            )
          }
        >
          {label("เศรษฐศาสตร์ต่อหน่วย", "Unit Economics")}
        </UiButton>
        <UiButton
          onClick={() =>
            runAction(
              async () => {
                const data = await getAdvancedAnalytics(token);
                setAdvanced(data);
                setStatus("Loaded advanced analytics");
                setToast("Advanced analytics loaded");
              },
              "Loading advanced analytics",
              "Advanced analytics failed"
            )
          }
        >
          {label("วิเคราะห์ขั้นสูง", "Advanced Analytics")}
        </UiButton>
        <UiButton
          onClick={() =>
            runAction(
              async () => {
                const data = await estimateDynamicPricing(token);
                setPriceEstimation(data);
                setStatus("Dynamic pricing estimated");
                setToast("Dynamic pricing estimated");
              },
              "Estimating dynamic pricing",
              "Dynamic pricing estimation failed"
            )
          }
        >
          {label("ประเมินราคา", "Estimate Pricing")}
        </UiButton>
      </div>
      <p className="helper-note">
        {label(
          "เริ่มจาก Zone Gates และ Unit Economics ก่อน แล้วค่อยเปิด Advanced/Pricing",
          "Start with Zone Gates and Unit Economics, then run Advanced Analytics and Pricing."
        )}
      </p>

      <Tabs
        value={activeTab}
        onChange={(value) => setActiveTab(value as AdminTab)}
        tabs={[
          { value: "overview", label: label("ภาพรวม", "Overview") },
          { value: "zones", label: label("เกตโซน", "Zone Gates") },
          { value: "economics", label: label("เศรษฐศาสตร์", "Economics") },
          { value: "debug", label: "Debug JSON" }
        ]}
      />

      {loading ? <LoadingBadge text={label("กำลังโหลดข้อมูลแอดมิน...", "Admin analytics loading...")} /> : null}
      {loading && activeTab !== "debug" ? <SkeletonRows count={4} /> : null}
      {error ? <ErrorBanner message={error} /> : null}
      <StatusLine value={status} />
      <div className="row">
        <UiBadge tone={zoneRows.length > 0 ? "success" : "neutral"}>Zone Gates</UiBadge>
        <UiBadge tone={economicsRows.length > 0 ? "success" : "neutral"}>Economics</UiBadge>
        <UiBadge tone={priceEstimation ? "success" : "warning"}>Pricing</UiBadge>
      </div>

      {!loading && !error && !zoneEval && !unitEconomics && !advanced && !priceEstimation ? (
        <EmptyHint message="No admin data loaded yet. Run any action above." />
      ) : null}

      {activeTab === "overview" ? (
        <div className="panel-grid">
          <article className="mini-panel">
            <h3>Retention</h3>
            <p>{advanced ? JSON.stringify((advanced as { retention?: unknown }).retention ?? {}) : "-"}</p>
          </article>
          <article className="mini-panel">
            <h3>Price Estimation</h3>
            <p>{priceEstimation ? JSON.stringify(priceEstimation) : "-"}</p>
          </article>
        </div>
      ) : null}

      {activeTab === "zones" ? (
        <DataTable
          caption={label("ตารางผลการตัดสินเกตโซน", "Zone gate decision table")}
          columns={[
            { key: "zone", header: "Zone" },
            { key: "completion", header: "Completion" },
            { key: "complaint", header: "Complaint" },
            { key: "refund", header: "Refund" },
            { key: "decision", header: "Decision" }
          ]}
          rows={zoneRows}
          emptyText={label("ยังไม่มีข้อมูลเกตโซน", "No zone gate data loaded.")}
        />
      ) : null}

      {activeTab === "economics" ? (
        <DataTable
          caption={label("ตารางเศรษฐศาสตร์ต่อหน่วย", "Unit economics table")}
          columns={[
            { key: "zone", header: "Zone" },
            { key: "gross", header: "Gross Revenue" },
            { key: "contribution", header: "Contribution Margin" },
            { key: "bookings", header: "Bookings" }
          ]}
          rows={economicsRows}
          emptyText={label("ยังไม่มีข้อมูลเศรษฐศาสตร์", "No economics data loaded.")}
        />
      ) : null}

      {activeTab === "debug" ? <JsonView value={{ zoneEval, unitEconomics, advanced, priceEstimation }} /> : null}
    </PageSection>
  );
}
