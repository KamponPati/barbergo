import { PageSection } from "../shared/PageSection";
import { useI18n } from "../i18n/I18nContext";

type LegalVariant = "terms" | "privacy" | "cookie" | "policy";

function legalCopy(variant: LegalVariant, locale: "th-TH" | "en-US"): { title: string; subtitle: string; sections: Array<{ heading: string; body: string }> } {
  const th = locale === "th-TH";

  if (variant === "terms") {
    return {
      title: th ? "ข้อกำหนดการใช้งาน" : "Terms of Service",
      subtitle: th ? "เงื่อนไขการใช้แพลตฟอร์ม BarberGo สำหรับลูกค้าและพาร์ทเนอร์" : "Rules for using BarberGo as customer or partner.",
      sections: [
        {
          heading: th ? "สิทธิ์การใช้งาน" : "Access and eligibility",
          body: th
            ? "ผู้ใช้ต้องให้ข้อมูลถูกต้องและปฏิบัติตามกฎแพลตฟอร์ม รวมถึงข้อกำหนดด้านความปลอดภัยและการใช้งานที่เหมาะสม"
            : "Users must provide accurate information and follow platform safety and acceptable-use rules."
        },
        {
          heading: th ? "การจองและการชำระเงิน" : "Booking and payments",
          body: th
            ? "การจองถือว่าสมบูรณ์เมื่อระบบยืนยันและชำระเงินสำเร็จตาม flow ที่กำหนด"
            : "A booking is valid when system confirmation and payment authorization flow are completed."
        }
      ]
    };
  }

  if (variant === "privacy") {
    return {
      title: th ? "นโยบายความเป็นส่วนตัว" : "Privacy Policy",
      subtitle: th ? "การเก็บ ใช้ และจัดการข้อมูลส่วนบุคคล" : "How we collect, use, and retain personal data.",
      sections: [
        {
          heading: th ? "ข้อมูลที่เก็บ" : "Collected data",
          body: th
            ? "ข้อมูลบัญชี ข้อมูลการจอง ข้อมูลอุปกรณ์สำหรับการแจ้งเตือน และข้อมูลปฏิบัติการที่จำเป็นต่อการให้บริการ"
            : "Account, booking, device notification tokens, and operational data required for service delivery."
        },
        {
          heading: th ? "สิทธิ์ของเจ้าของข้อมูล" : "Data subject rights",
          body: th
            ? "ผู้ใช้สามารถขอเข้าถึง/แก้ไข/ลบข้อมูลตามนโยบาย retention และข้อกำหนดทางกฎหมายที่เกี่ยวข้อง"
            : "Users may request access, correction, or deletion subject to retention and legal obligations."
        }
      ]
    };
  }

  if (variant === "cookie") {
    return {
      title: th ? "นโยบายคุกกี้" : "Cookie Policy",
      subtitle: th ? "การใช้คุกกี้เพื่อความปลอดภัยและการทำงานของระบบ" : "Cookie usage for security and product operation.",
      sections: [
        {
          heading: th ? "คุกกี้ที่จำเป็น" : "Essential cookies",
          body: th
            ? "ใช้เพื่อยืนยันตัวตน session และความปลอดภัยของการเข้าสู่ระบบ"
            : "Used for session authentication and login security."
        },
        {
          heading: th ? "การควบคุมคุกกี้" : "Cookie controls",
          body: th
            ? "การปิดคุกกี้ที่จำเป็นอาจทำให้บางฟังก์ชันใช้งานไม่ได้"
            : "Disabling essential cookies may impact core functionality."
        }
      ]
    };
  }

  return {
    title: th ? "นโยบายยกเลิกและคืนเงิน" : "Cancellation and Refund Policy",
    subtitle: th ? "อ้างอิง policy matrix ที่ตกลงใน Phase 0" : "Aligned with policy matrix agreed in Phase 0.",
    sections: [
      {
        heading: th ? "การยกเลิก" : "Cancellation",
        body: th
          ? "การยกเลิกก่อนเวลานัดในช่วงที่กำหนดอาจไม่มีค่าธรรมเนียม แต่การยกเลิกใกล้เวลานัดอาจมีค่าปรับ"
          : "Cancelling within allowed window may be free; late cancellations may include fees."
      },
      {
        heading: th ? "การคืนเงิน" : "Refunds",
        body: th
          ? "การคืนเงินพิจารณาตามสถานะงาน หลักฐาน และผลการตรวจสอบข้อพิพาท"
          : "Refund eligibility depends on booking status, evidence, and dispute review outcome."
      }
    ]
  };
}

export function LegalPage({ variant }: { variant: LegalVariant }): JSX.Element {
  const { locale } = useI18n();
  const copy = legalCopy(variant, locale);

  return (
    <PageSection title={copy.title} subtitle={copy.subtitle}>
      <div className="faq-list">
        {copy.sections.map((section) => (
          <article className="faq-item" key={section.heading}>
            <h3>{section.heading}</h3>
            <p>{section.body}</p>
          </article>
        ))}
      </div>
    </PageSection>
  );
}
