import { Link } from "react-router-dom";
import { PageSection } from "../shared/PageSection";

export function FeaturesPage(): JSX.Element {
  return (
    <PageSection title="Features" subtitle="Navigate product capabilities by function">
      <div className="marketing-grid">
        <article className="marketing-card">
          <h3>Customer Features</h3>
          <ul className="marketing-list">
            <li>Nearby search + filters</li>
            <li>Availability + quote + checkout</li>
            <li>History and post-service flow</li>
          </ul>
          <Link className="text-link" to="/app/customer">
            Open Customer Module
          </Link>
        </article>
        <article className="marketing-card">
          <h3>Partner Features</h3>
          <ul className="marketing-list">
            <li>Incoming queue operations</li>
            <li>Confirm / start / complete transitions</li>
            <li>Operational execution flow</li>
          </ul>
          <Link className="text-link" to="/app/partner">
            Open Partner Module
          </Link>
        </article>
        <article className="marketing-card">
          <h3>Admin Features</h3>
          <ul className="marketing-list">
            <li>Zone quality gates</li>
            <li>Unit economics and analytics</li>
            <li>Dynamic pricing estimation</li>
          </ul>
          <Link className="text-link" to="/app/admin">
            Open Admin Module
          </Link>
        </article>
        <article className="marketing-card">
          <h3>Bookings Features</h3>
          <ul className="marketing-list">
            <li>Daily queue overview</li>
            <li>Status visibility by stage</li>
            <li>Operational action planning</li>
          </ul>
          <Link className="text-link" to="/app/bookings">
            Open Bookings
          </Link>
        </article>
        <article className="marketing-card">
          <h3>Finance Features</h3>
          <ul className="marketing-list">
            <li>Balance and payout view</li>
            <li>Transaction timeline</li>
            <li>Refund monitoring</li>
          </ul>
          <Link className="text-link" to="/app/wallet">
            Open Wallet
          </Link>
        </article>
        <article className="marketing-card">
          <h3>Support Features</h3>
          <ul className="marketing-list">
            <li>In-app notification center</li>
            <li>Help and troubleshooting guides</li>
            <li>Public support handoff</li>
          </ul>
          <Link className="text-link" to="/app/help">
            Open Help Center
          </Link>
        </article>
      </div>
    </PageSection>
  );
}
