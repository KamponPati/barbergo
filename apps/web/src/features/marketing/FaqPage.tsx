import { PageSection } from "../shared/PageSection";
import { useI18n } from "../i18n/I18nContext";

export function FaqPage(): JSX.Element {
  const { label } = useI18n();

  return (
    <PageSection title="FAQ" subtitle={label("คำถามที่พบบ่อยสำหรับลูกค้าและพาร์ทเนอร์", "Frequently asked questions for customers and partners.")}>
      <div className="faq-list">
        <article className="faq-item">
          <h3>{label("ฉันสามารถยกเลิกการจองได้เมื่อไหร่?", "When can I cancel a booking?")}</h3>
          <p>{label("ยกเลิกได้ตามเงื่อนไข policy และอาจมีค่าธรรมเนียมตามช่วงเวลาใกล้นัด", "Cancellation is allowed per policy and may incur fees near slot time.")}</p>
        </article>
        <article className="faq-item">
          <h3>{label("ถ้าร้านไม่ยืนยันคิวจะเกิดอะไรขึ้น?", "What if a shop does not confirm in time?")}</h3>
          <p>{label("ระบบจะปล่อยคิวตาม SLA และเปิดให้เลือกร้าน/เวลาทดแทน", "The system releases queue per SLA and allows alternative options.")}</p>
        </article>
        <article className="faq-item">
          <h3>{label("พาร์ทเนอร์ได้เงินเมื่อไหร่?", "When do partners get paid?")}</h3>
          <p>{label("รายได้จะเข้า ledger หลังงาน completed และถอนเงินได้ตามรอบจ่าย", "Earnings post to ledger after completion and can be withdrawn by payout cycle.")}</p>
        </article>
        <article className="faq-item">
          <h3>{label("ถ้ามีข้อพิพาทต้องทำอย่างไร?", "How do disputes work?")}</h3>
          <p>{label("ลูกค้าสามารถเปิด dispute จาก post-service และแอดมินจะตรวจหลักฐานตาม runbook", "Customers can create disputes post-service; admins triage by runbook.")}</p>
        </article>
      </div>
    </PageSection>
  );
}
