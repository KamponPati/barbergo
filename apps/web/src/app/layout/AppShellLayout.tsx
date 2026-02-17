import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { useI18n } from "../../features/i18n/I18nContext";

export function AppShellLayout(): JSX.Element {
  const { role, logout } = useAuth();
  const { label } = useI18n();
  const navigate = useNavigate();
  const canViewCustomer = role === "customer" || role === "admin";
  const canViewPartner = role === "partner" || role === "admin";
  const canViewAdmin = role === "admin";

  return (
    <main className="app-shell-v2">
      <aside className="app-sidebar">
        <div className="app-logo">
          <p className="app-logo-kicker">BarberGo</p>
          <h1>App Console</h1>
        </div>
        <nav className="app-side-nav" aria-label="App menu">
          <NavLink to="/app/home">Home</NavLink>
          <NavLink to="/app/features">Discover</NavLink>
          <NavLink to="/app/bookings">Bookings</NavLink>
          <NavLink to="/app/wallet">Wallet</NavLink>
          <NavLink to="/app/notifications">Notifications</NavLink>
          <NavLink to="/app/insights">Insights</NavLink>
          <NavLink to="/app/profile">Profile</NavLink>
          <NavLink to="/app/settings">Settings</NavLink>
          <NavLink to="/app/help">Help Center</NavLink>
          <hr />
          {canViewCustomer ? <NavLink to="/app/customer">Customer Core</NavLink> : null}
          {canViewPartner ? <NavLink to="/app/partner">Partner Core</NavLink> : null}
          {canViewAdmin ? <NavLink to="/app/admin">Admin Core</NavLink> : null}
        </nav>
      </aside>

      <section className="app-main">
        <header className="app-topbar">
          <div>
            <p className="app-topbar-label">Signed in role</p>
            <p className="app-topbar-role">{role ?? "-"}</p>
          </div>
          <div className="app-topbar-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/app/help")}>
              {label("ช่วยเหลือ", "Help")}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/app/profile")}>
              {label("โปรไฟล์", "Profile")}
            </button>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            {label("ออกจากระบบ", "Logout")}
          </button>
        </header>
        <div className="app-page-wrap">
          <Outlet />
        </div>
      </section>
    </main>
  );
}
