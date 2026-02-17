import { PageSection } from "../shared/PageSection";
import { useAuth } from "../auth/AuthContext";
import { API_BASE_URL } from "../../lib/api";
import { getMyProfile } from "../../lib/api";
import { useEffect, useState } from "react";
import { EmptyHint, ErrorBanner, LoadingBadge, StatusLine } from "../shared/UiState";
import { UiButton } from "../shared/UiKit";
import { useNavigate } from "react-router-dom";

export function ProfilePage(): JSX.Element {
  const { role, token } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("-");
  const [status, setStatus] = useState("Idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadProfile(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyProfile(token);
      setDisplayName(data.display_name);
      setStatus("Profile loaded from API");
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load profile failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    void loadProfile();
  }, [token]);

  return (
    <PageSection title="Profile" subtitle="Session identity and environment details">
      <div className="row">
        <UiButton onClick={() => void loadProfile()}>Refresh Profile</UiButton>
        {role === "customer" || role === "admin" ? (
          <UiButton variant="secondary" onClick={() => navigate("/app/customer")}>
            Switch to Customer Mode
          </UiButton>
        ) : null}
        {role === "partner" || role === "admin" ? (
          <UiButton variant="secondary" onClick={() => navigate("/app/partner")}>
            Switch to Partner Mode
          </UiButton>
        ) : null}
      </div>
      {loading ? <LoadingBadge text="Loading profile..." /> : null}
      {error ? <ErrorBanner message={error} /> : null}
      <StatusLine value={status} />
      {!loading && !error && displayName === "-" ? <EmptyHint message="No profile details loaded." /> : null}

      <div className="marketing-grid">
        <article className="marketing-card">
          <h3>Account</h3>
          <p>Role: {role ?? "-"}</p>
          <p>Display Name: {displayName}</p>
          <p>User ID: {role === "admin" ? "admin_1" : role === "partner" ? "partner_1" : role === "customer" ? "cust_1" : "-"}</p>
        </article>
        <article className="marketing-card">
          <h3>Security</h3>
          <p>Token preview: {token ? `${token.slice(0, 24)}...` : "-"}</p>
          <p>Storage: local session state</p>
        </article>
        <article className="marketing-card">
          <h3>Environment</h3>
          <p>API Base: {API_BASE_URL}</p>
          <p>Mode: browser app shell</p>
        </article>
        <article className="marketing-card">
          <h3>Preferences Snapshot</h3>
          <p>Notifications: enabled</p>
          <p>Default view: Home dashboard</p>
        </article>
        <article className="marketing-card">
          <h3>Activity</h3>
          <p>Last sign-in: current session</p>
          <p>Device: web browser</p>
        </article>
        <article className="marketing-card">
          <h3>Support Link</h3>
          <p>Need account recovery, role reset, or token help?</p>
          <p>Go to Help Center from the app sidebar.</p>
        </article>
      </div>
    </PageSection>
  );
}
