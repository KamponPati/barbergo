import { PageSection } from "../shared/PageSection";
import { useI18n } from "../i18n/I18nContext";
import { StatCard } from "../shared/UiKit";

export function PricingPage(): JSX.Element {
  const { label } = useI18n();

  return (
    <PageSection
      title={label("Pricing และ Commission", "Pricing and Commission")}
      subtitle={label("โมเดลราคาและค่าคอมมิชชันอิง policy ปัจจุบัน", "Pricing and commission model aligned with current policy controls.")}
    >
      <div className="stats-grid">
        <StatCard label={label("Commission baseline", "Commission baseline")} value="20%" />
        <StatCard label={label("Currency", "Currency")} value="THB" />
        <StatCard label={label("Promo control", "Promo control")} value={label("เปิด/ปิดได้", "Policy-controlled")} />
        <StatCard label={label("Cancellation", "Cancellation")} value={label("ขึ้นกับ SLA/policy", "Policy-driven")} />
      </div>
      <ul className="marketing-list">
        <li>{label("ราคาบริการกำหนดโดยพาร์ทเนอร์ และอาจมี multiplier ตามช่วงเวลา/โซน", "Service price is partner-defined and may apply dynamic multipliers by zone/time.")}</li>
        <li>{label("ค่าคอมมิชชันหักอัตโนมัติและบันทึกใน wallet ledger", "Commission is applied automatically and recorded in partner wallet ledger.")}</li>
        <li>{label("ส่วนลดและโปรโมชันถูกควบคุมผ่าน admin policy controls", "Discount and promo behavior is controlled via admin policy controls.")}</li>
      </ul>
    </PageSection>
  );
}
