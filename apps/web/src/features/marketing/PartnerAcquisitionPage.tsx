import { PageSection } from "../shared/PageSection";
import { useI18n } from "../i18n/I18nContext";

export function PartnerAcquisitionPage(): JSX.Element {
  const { label } = useI18n();

  return (
    <PageSection
      title={label("Partner Acquisition", "Partner Acquisition")}
      subtitle={label("ข้อเสนอคุณค่าและขั้นตอน onboarding สำหรับร้านพาร์ทเนอร์", "Value proposition and onboarding flow for partner shops.")}
    >
      <div className="marketing-grid">
        <article className="marketing-card">
          <h3>{label("1) สมัครและยืนยันตัวตน", "1) Apply and verify")}</h3>
          <p>{label("ส่งข้อมูลนิติบุคคล เอกสาร และรอผล KYC ภายใน SLA ที่กำหนด", "Submit legal docs and complete KYC within the defined SLA.")}</p>
        </article>
        <article className="marketing-card">
          <h3>{label("2) ตั้งค่าร้าน", "2) Configure shop")}</h3>
          <p>{label("เพิ่มสาขา บริการ พนักงาน และช่วงเวลาพร้อมให้บริการ", "Set branches, services, staff, and service windows.")}</p>
        </article>
        <article className="marketing-card">
          <h3>{label("3) เปิดรับคิวงาน", "3) Go live")}</h3>
          <p>{label("เริ่มรับงานจากคิว incoming และจัดการสถานะ booking ตามมาตรฐาน", "Start receiving bookings and operate standard transitions.")}</p>
        </article>
      </div>
      <ul className="marketing-list">
        <li>{label("รายได้โปร่งใส: เห็น gross, commission, payout ได้ทุกวัน", "Transparent revenue: daily gross, commission, and payout visibility")}</li>
        <li>{label("เครื่องมือปฏิบัติการครบ: queue, staff, branch, wallet", "Complete ops toolkit: queue, staff, branch, wallet")}</li>
        <li>{label("ระบบคุณภาพรองรับการขยายสเกล: SLA, dispute, analytics", "Quality controls for scale: SLA, dispute, analytics")}</li>
      </ul>
    </PageSection>
  );
}
