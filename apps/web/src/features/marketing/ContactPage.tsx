import { PageSection } from "../shared/PageSection";
import { useI18n } from "../i18n/I18nContext";

export function ContactPage(): JSX.Element {
  const { label } = useI18n();

  return (
    <PageSection
      title={label("ติดต่อทีม BarberGo", "Contact BarberGo")}
      subtitle={label("ช่องทางติดต่อสำหรับการขายพาร์ทเนอร์และการสนับสนุนการใช้งาน", "Contact channels for partner sales and operational support.")}
    >
      <div className="marketing-grid">
        <article className="marketing-card">
          <h3>{label("Partner Sales", "Partner Sales")}</h3>
          <p>partners@barbergo.local</p>
        </article>
        <article className="marketing-card">
          <h3>{label("Support", "Support")}</h3>
          <p>support@barbergo.local</p>
        </article>
        <article className="marketing-card">
          <h3>{label("Ops Hotline", "Ops Hotline")}</h3>
          <p>+66 2 000 0000</p>
        </article>
      </div>
      <p className="section-subtitle">
        {label(
          "สำหรับเหตุฉุกเฉินที่กระทบ SLA ให้ใช้ incident escalation matrix ตาม runbook ฝ่ายปฏิบัติการ",
          "For SLA-impacting incidents, follow the incident escalation matrix in operations runbook."
        )}
      </p>
    </PageSection>
  );
}
