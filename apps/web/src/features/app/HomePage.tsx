import { Link } from "react-router-dom";
import { PageSection } from "../shared/PageSection";
import { StatCard } from "../shared/UiKit";
import { useAuth } from "../auth/AuthContext";

export function HomePage(): JSX.Element {
  const { role } = useAuth();

  return (
    <PageSection title="Home" subtitle="Your operational overview and quick entry points">
      <div className="stats-grid">
        <StatCard label="Session Role" value={role ?? "-"} />
        <StatCard label="Core Areas" value={5} />
        <StatCard label="App Pages" value={11} />
        <StatCard label="Environment" value="staging-ready" />
      </div>

      <div className="marketing-grid">
        <article className="marketing-card">
          <h3>Run Customer Flow</h3>
          <p>Search shops, check availability, quote, checkout, and view history.</p>
          <p>
            <Link className="text-link" to="/app/customer">
              Open Customer
            </Link>
          </p>
        </article>
        <article className="marketing-card">
          <h3>Run Partner Operations</h3>
          <p>Manage queue transitions and booking execution.</p>
          <p>
            <Link className="text-link" to="/app/partner">
              Open Partner
            </Link>
          </p>
        </article>
        <article className="marketing-card">
          <h3>Run Admin Controls</h3>
          <p>Evaluate zone gates, economics, analytics, and pricing controls.</p>
          <p>
            <Link className="text-link" to="/app/admin">
              Open Admin
            </Link>
          </p>
        </article>
        <article className="marketing-card">
          <h3>Review Booking Pipeline</h3>
          <p>Track queue, service lifecycle, and operating load in one place.</p>
          <p>
            <Link className="text-link" to="/app/bookings">
              Open Bookings
            </Link>
          </p>
        </article>
        <article className="marketing-card">
          <h3>Check Wallet & Revenue</h3>
          <p>Monitor balance, payouts, and transaction history.</p>
          <p>
            <Link className="text-link" to="/app/wallet">
              Open Wallet
            </Link>
          </p>
        </article>
        <article className="marketing-card">
          <h3>Open Insights</h3>
          <p>View quality metrics and growth recommendations.</p>
          <p>
            <Link className="text-link" to="/app/insights">
              Open Insights
            </Link>
          </p>
        </article>
      </div>
    </PageSection>
  );
}
