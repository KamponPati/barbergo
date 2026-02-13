import { useState } from "react";
import { estimateDynamicPricing, getAdvancedAnalytics, getScaleGateEval, getUnitEconomics } from "../../lib/api";
import { useAuth } from "../auth/AuthContext";
import { JsonView } from "../shared/JsonView";
import { PageSection } from "../shared/PageSection";
import { EmptyHint, ErrorBanner, LoadingBadge } from "../shared/UiState";

export function AdminPage(): JSX.Element {
  const { token } = useAuth();
  const [zoneEval, setZoneEval] = useState<unknown>(null);
  const [unitEconomics, setUnitEconomics] = useState<unknown>(null);
  const [advanced, setAdvanced] = useState<unknown>(null);
  const [priceEstimation, setPriceEstimation] = useState<unknown>(null);
  const [status, setStatus] = useState("Idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <PageSection title="Admin Web Core" subtitle="Scale controls, analytics, economics">
      <div className="row">
        <button
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              const data = await getScaleGateEval(token);
              setZoneEval(data);
              setStatus("Loaded zone gate evaluation");
            } catch (e) {
              const message = e instanceof Error ? e.message : "unknown error";
              setError(message);
              setStatus("Load zone gate evaluation failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          Evaluate Zone Gates
        </button>
        <button
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              const data = await getUnitEconomics(token);
              setUnitEconomics(data);
              setStatus("Loaded unit economics");
            } catch (e) {
              const message = e instanceof Error ? e.message : "unknown error";
              setError(message);
              setStatus("Load unit economics failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          Unit Economics
        </button>
        <button
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              const data = await getAdvancedAnalytics(token);
              setAdvanced(data);
              setStatus("Loaded advanced analytics");
            } catch (e) {
              const message = e instanceof Error ? e.message : "unknown error";
              setError(message);
              setStatus("Load advanced analytics failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          Advanced Analytics
        </button>
        <button
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              const data = await estimateDynamicPricing(token);
              setPriceEstimation(data);
              setStatus("Dynamic pricing estimated");
            } catch (e) {
              const message = e instanceof Error ? e.message : "unknown error";
              setError(message);
              setStatus("Dynamic pricing estimation failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          Estimate Pricing
        </button>
      </div>
      {loading ? <LoadingBadge text="Admin analytics loading..." /> : null}
      {error ? <ErrorBanner message={error} /> : null}
      <small>Status: {status}</small>
      {!loading && !error && !zoneEval && !unitEconomics && !advanced && !priceEstimation ? (
        <EmptyHint message="No admin data loaded yet. Run any action above." />
      ) : null}
      <JsonView value={{ zoneEval, unitEconomics, advanced, priceEstimation }} />
    </PageSection>
  );
}
