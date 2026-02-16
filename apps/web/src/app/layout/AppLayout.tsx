import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../../lib/api";
import { AuthPanel } from "../../features/auth/AuthPanel";
import { useI18n } from "../../features/i18n/I18nContext";
import { PwaInstall } from "../../features/pwa/PwaInstall";
import { Chip, UiButton } from "../../features/shared/UiKit";

export function AppLayout(): JSX.Element {
  const location = useLocation();
  const { locale, setLocale, timeZone, label } = useI18n();
  const segments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.length === 0 ? ["customer"] : segments;
  const breadcrumbLabel = (segment: string): string => {
    if (segment === "customer") return label("ลูกค้า", "Customer");
    if (segment === "partner") return label("พาร์ทเนอร์", "Partner");
    if (segment === "admin") return label("แอดมิน", "Admin");
    if (segment === "marketing") return label("การตลาด", "Marketing");
    if (segment === "legal") return label("กฎหมาย", "Legal");
    if (segment === "support") return label("ซัพพอร์ต", "Support");
    if (segment === "terms") return label("เงื่อนไข", "Terms");
    if (segment === "privacy") return label("ความเป็นส่วนตัว", "Privacy");
    if (segment === "cookie") return label("คุกกี้", "Cookie");
    if (segment === "policy") return label("นโยบาย", "Policy");
    if (segment === "faq") return "FAQ";
    if (segment === "pricing") return label("ราคา", "Pricing");
    if (segment === "contact") return label("ติดต่อ", "Contact");
    if (segment === "login") return label("เข้าสู่ระบบ", "Login");
    if (segment === "forbidden") return label("ไม่อนุญาต", "Forbidden");
    return segment;
  };

  return (
    <main className="shell app-shell">
      <a className="skip-link" href="#main-content">
        {label("ข้ามไปเนื้อหา", "Skip to content")}
      </a>
      <header className="hero app-hero">
        <div className="hero-top">
          <div>
            <p className="eyebrow">BarberGo Web App</p>
            <h1>BarberGo Operations Console</h1>
            <p className="hero-subtitle">
              {label(
                "พื้นที่ทำงานธีมเดียวสำหรับระบบลูกค้า พาร์ทเนอร์ และแอดมิน",
                "Single-theme workspace for Customer, Partner, and Admin operational flows."
              )}
            </p>
            <div className="chip-row">
              <Chip tone="brand">Phase 9</Chip>
              <Chip>Web Core + App Core</Chip>
              <Chip>{timeZone}</Chip>
            </div>
          </div>
          <AuthPanel />
        </div>
        <div className="row">
          <UiButton variant={locale === "th-TH" ? "primary" : "secondary"} onClick={() => setLocale("th-TH")}>
            TH
          </UiButton>
          <UiButton variant={locale === "en-US" ? "primary" : "secondary"} onClick={() => setLocale("en-US")}>
            EN
          </UiButton>
        </div>
        <p className="api-base-line">
          API Base <code>{API_BASE_URL}</code>
        </p>
        <section className="nav-groups" aria-label="Global navigation groups">
          <div className="nav-group">
            <p className="nav-group-title">{label("Public", "Public")}</p>
            <nav className="nav-tabs" aria-label="Public navigation">
              <NavLink to="/marketing">{label("หน้าแนะนำ", "Marketing")}</NavLink>
              <NavLink to="/marketing/partner">{label("ร่วมเป็นพาร์ทเนอร์", "Partner Acquisition")}</NavLink>
              <NavLink to="/marketing/faq">FAQ</NavLink>
              <NavLink to="/marketing/contact">{label("ติดต่อ", "Contact")}</NavLink>
            </nav>
          </div>
          <div className="nav-group">
            <p className="nav-group-title">{label("Workspaces", "Workspaces")}</p>
            <nav className="nav-tabs" aria-label="Role workspace navigation">
              <NavLink to="/customer">{label("ลูกค้า", "Customer")}</NavLink>
              <NavLink to="/partner">{label("พาร์ทเนอร์", "Partner")}</NavLink>
              <NavLink to="/admin">{label("แอดมิน", "Admin")}</NavLink>
              <Link to="/login">{label("เข้าสู่ระบบ", "Login")}</Link>
            </nav>
          </div>
          <div className="nav-group">
            <p className="nav-group-title">{label("Policy & Help", "Policy and Help")}</p>
            <nav className="nav-subtabs" aria-label="Support and legal navigation">
              <Link to="/support">{label("ศูนย์ช่วยเหลือ", "Support Center")}</Link>
              <Link to="/legal/terms">{label("ข้อกำหนด", "Terms")}</Link>
              <Link to="/legal/privacy">{label("นโยบายข้อมูล", "Privacy")}</Link>
              <Link to="/legal/cookie">{label("คุกกี้", "Cookie")}</Link>
              <Link to="/legal/policy">{label("ยกเลิก/คืนเงิน", "Refund Policy")}</Link>
            </nav>
          </div>
        </section>
        <PwaInstall />
      </header>

      <section id="main-content" className="content">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((segment, index) => (
            <span key={`${segment}-${index}`} className="breadcrumb-item">
              {breadcrumbLabel(segment)}
            </span>
          ))}
        </nav>
        <div className="route-transition" key={location.pathname}>
          <Outlet />
        </div>
      </section>
    </main>
  );
}
