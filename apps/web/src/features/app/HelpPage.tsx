import { PageSection } from "../shared/PageSection";
import { Link } from "react-router-dom";

const HELP_TOPICS = [
  {
    title: "How booking transitions work",
    desc: "Authorized -> confirmed -> started -> completed. Each step follows strict state transition rules."
  },
  {
    title: "Troubleshoot login issues",
    desc: "Check API base URL, role token freshness, and environment endpoint availability."
  },
  {
    title: "Payment and refund handling",
    desc: "Review wallet logs and booking payment IDs for disputes and reconciliation."
  }
];

export function HelpPage(): JSX.Element {
  return (
    <PageSection title="Help Center" subtitle="Troubleshooting, guides, and operator docs">
      <div className="support-grid">
        {HELP_TOPICS.map((topic) => (
          <article key={topic.title} className="marketing-card">
            <h3>{topic.title}</h3>
            <p>{topic.desc}</p>
          </article>
        ))}
      </div>

      <div className="row">
        <Link className="text-link" to="/support">
          Open Public Support Center
        </Link>
        <Link className="text-link" to="/marketing/faq">
          Open FAQ
        </Link>
      </div>
    </PageSection>
  );
}
