import { Link, NavLink, Outlet } from "react-router-dom";
import { API_BASE_URL } from "../../lib/api";
import { AuthPanel } from "../../features/auth/AuthPanel";

export function AppLayout(): JSX.Element {
  return (
    <main className="shell">
      <header className="hero">
        <div className="hero-top">
          <div>
            <p className="eyebrow">BarberGo Web App</p>
            <h1>Standard Multi-Role App Shell</h1>
          </div>
          <AuthPanel />
        </div>
        <p>
          API Base: <code>{API_BASE_URL}</code>
        </p>
        <nav className="nav-tabs">
          <NavLink to="/customer">Customer</NavLink>
          <NavLink to="/partner">Partner</NavLink>
          <NavLink to="/admin">Admin</NavLink>
          <Link to="/login">Login</Link>
        </nav>
      </header>

      <section className="content">
        <Outlet />
      </section>
    </main>
  );
}
