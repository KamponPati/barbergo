import { Link } from "react-router-dom";
import { PageSection } from "../shared/PageSection";
import { useI18n } from "../i18n/I18nContext";
import { StatCard } from "../shared/UiKit";

export function MarketingHomePage(): JSX.Element {
  const { label } = useI18n();

  return (
    <PageSection
      title={label("BarberGo สำหรับลูกค้าและพาร์ทเนอร์", "BarberGo for Customers and Partners")}
      subtitle={label(
        "จองตัดผมให้ไวเหมือนเรียกรถ พร้อมระบบคุณภาพและความน่าเชื่อถือระดับปฏิบัติการ",
        "Ride-hailing simplicity for barber booking with trust, quality, and operational reliability."
      )}
    >
      <div className="stats-grid">
        <StatCard label={label("คุณค่าหลัก", "Core Value")} value={label("เร็ว โปร่งใส เชื่อถือได้", "Fast, clear, reliable")} />
        <StatCard label={label("กลุ่มเป้าหมาย", "Audience")} value={label("ลูกค้า + ร้านพาร์ทเนอร์", "Customers + Partners")} />
        <StatCard label={label("โมเดลรายได้", "Revenue")} value={label("Commission + Value-add", "Commission + Value-add")} />
        <StatCard label={label("โหมดบริการ", "Service Modes")} value={label("In-shop + Delivery", "In-shop + Delivery")} />
      </div>

      <div className="marketing-grid">
        <article className="marketing-card">
          <h3>{label("สำหรับลูกค้า", "For Customers")}</h3>
          <p>
            {label(
              "ค้นหาร้าน ใกล้ฉัน เทียบราคา ดูรีวิว เลือกเวลา และจบการจองได้ภายในไม่กี่ขั้นตอน",
              "Search nearby shops, compare offers, choose slots, and finish checkout in a few steps."
            )}
          </p>
        </article>
        <article className="marketing-card">
          <h3>{label("สำหรับพาร์ทเนอร์", "For Partners")}</h3>
          <p>
            {label(
              "จัดการคิวงาน พนักงาน สาขา และกระเป๋ารายได้จากหน้าปฏิบัติการเดียว",
              "Run queue operations, staff, branches, and payouts from one operational console."
            )}
          </p>
        </article>
        <article className="marketing-card">
          <h3>{label("สำหรับผู้ดูแลระบบ", "For Admins")}</h3>
          <p>
            {label(
              "ควบคุมคุณภาพ ปรับ policy และติดตาม KPI ได้แบบเรียลไทม์",
              "Control quality, policy, and KPI gates with real-time visibility."
            )}
          </p>
        </article>
      </div>

      <div className="row">
        <Link className="text-link" to="/marketing/partner">
          {label("ดูหน้า Partner Acquisition", "See Partner Acquisition")}
        </Link>
        <Link className="text-link" to="/marketing/faq">
          {label("ดู FAQ", "See FAQ")}
        </Link>
        <Link className="text-link" to="/marketing/pricing">
          {label("ดู Pricing/Commission", "See Pricing/Commission")}
        </Link>
        <Link className="text-link" to="/marketing/contact">
          {label("ดูช่องทางติดต่อ", "See Contact")}
        </Link>
      </div>
    </PageSection>
  );
}
