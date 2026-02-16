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
              <Chip tone="brand">Phase 7</Chip>
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
        <nav className="nav-tabs" aria-label="Main navigation">
          <NavLink to="/customer">Customer</NavLink>
          <NavLink to="/partner">Partner</NavLink>
          <NavLink to="/admin">Admin</NavLink>
          <Link to="/login">Login</Link>
        </nav>
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
