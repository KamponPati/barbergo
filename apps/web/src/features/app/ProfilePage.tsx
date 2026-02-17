import { PageSection } from "../shared/PageSection";
import { useAuth } from "../auth/AuthContext";
import { API_BASE_URL } from "../../lib/api";

export function ProfilePage(): JSX.Element {
  const { role, token } = useAuth();

  return (
    <PageSection title="Profile" subtitle="Session identity and environment details">
      <div className="marketing-grid">
        <article className="marketing-card">
          <h3>Account</h3>
          <p>Role: {role ?? "-"}</p>
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
