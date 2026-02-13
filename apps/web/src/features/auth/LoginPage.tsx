import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { UserRole } from "../../lib/types";

export function LoginPage(): JSX.Element {
  const { loginAs } = useAuth();
  const navigate = useNavigate();

  async function login(role: UserRole): Promise<void> {
    await loginAs(role);
    navigate(role === "admin" ? "/admin" : role === "partner" ? "/partner" : "/customer");
  }

  return (
    <section className="panel">
      <header className="panel-header">
        <h3>Login</h3>
        <p>Choose a role to test flows with RBAC guards.</p>
      </header>
      <div className="panel-body">
        <div className="row">
          <button onClick={() => void login("customer")}>Login as Customer</button>
          <button onClick={() => void login("partner")}>Login as Partner</button>
          <button onClick={() => void login("admin")}>Login as Admin</button>
        </div>
      </div>
    </section>
  );
}
