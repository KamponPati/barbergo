import { PageSection } from "../shared/PageSection";
import { useI18n } from "../i18n/I18nContext";

export function SupportCenterPage(): JSX.Element {
  const { label } = useI18n();

  return (
    <PageSection
      title={label("ศูนย์ช่วยเหลือ", "Support Center")}
      subtitle={label("คู่มือ onboarding, dispute และการแก้ปัญหาเบื้องต้น", "Onboarding, dispute, and troubleshooting guides.")}
    >
      <div className="support-grid">
        <article className="marketing-card">
          <h3>{label("คู่มือลูกค้า", "Customer Guide")}</h3>
          <ul className="marketing-list">
            <li>{label("วิธีค้นหาร้านและจองคิว", "How to search shops and book slots")}</li>
            <li>{label("วิธีแก้ปัญหาการชำระเงินไม่ผ่าน", "How to resolve payment issues")}</li>
            <li>{label("วิธีเปิดข้อพิพาทหลังใช้บริการ", "How to open disputes post-service")}</li>
          </ul>
        </article>
        <article className="marketing-card">
          <h3>{label("คู่มือพาร์ทเนอร์", "Partner Guide")}</h3>
          <ul className="marketing-list">
            <li>{label("ขั้นตอน KYC และเปิดร้าน", "KYC and go-live steps")}</li>
            <li>{label("วิธีจัดการคิว confirm/start/complete", "Queue transitions: confirm/start/complete")}</li>
            <li>{label("การติดตามรายได้และถอนเงิน", "Wallet tracking and withdrawals")}</li>
          </ul>
        </article>
        <article className="marketing-card">
          <h3>{label("คู่มือทีมปฏิบัติการ", "Ops Guide")}</h3>
          <ul className="marketing-list">
            <li>{label("Incident escalation matrix", "Incident escalation matrix")}</li>
            <li>{label("SLA quality monitoring", "SLA quality monitoring")}</li>
            <li>{label("Dispute resolution runbook", "Dispute resolution runbook")}</li>
          </ul>
        </article>
      </div>
    </PageSection>
  );
}
