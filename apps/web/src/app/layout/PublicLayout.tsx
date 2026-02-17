import { Link, NavLink, Outlet } from "react-router-dom";

export function PublicLayout(): JSX.Element {
  return (
    <main className="public-shell">
      <header className="public-header">
        <Link to="/" className="public-brand">
          BarberGo
        </Link>
        <nav className="public-nav" aria-label="Public navigation">
          <NavLink to="/marketing">Marketing</NavLink>
          <NavLink to="/support">Support</NavLink>
          <NavLink to="/legal/terms">Terms</NavLink>
          <NavLink to="/login">Login</NavLink>
        </nav>
      </header>
      <section className="public-content">
        <Outlet />
      </section>
    </main>
  );
}
