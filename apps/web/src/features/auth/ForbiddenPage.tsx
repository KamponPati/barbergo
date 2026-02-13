import { Link } from "react-router-dom";

export function ForbiddenPage(): JSX.Element {
  return (
    <section className="panel">
      <header className="panel-header">
        <h3>Forbidden</h3>
        <p>This role cannot access this page.</p>
      </header>
      <div className="panel-body">
        <div className="row">
          <Link className="text-link" to="/login">
            Login with another role
          </Link>
          <Link className="text-link" to="/customer">
            Go to customer
          </Link>
        </div>
      </div>
    </section>
  );
}
