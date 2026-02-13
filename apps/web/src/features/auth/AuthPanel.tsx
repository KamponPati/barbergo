import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function AuthPanel(): JSX.Element {
  const { role, token, loginAs, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<"customer" | "partner" | "admin" | null>(null);

  async function doLogin(nextRole: "customer" | "partner" | "admin"): Promise<void> {
    setLoading(nextRole);
    try {
      await loginAs(nextRole);
      navigate(nextRole === "admin" ? "/admin" : nextRole === "partner" ? "/partner" : "/customer");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="auth-panel">
      <div>
        <strong>Session:</strong> {role ?? "anonymous"}
      </div>
      <div className="auth-actions">
        <button onClick={() => doLogin("customer")} disabled={loading !== null}>
          {loading === "customer" ? "Signing..." : "Login Customer"}
        </button>
        <button onClick={() => doLogin("partner")} disabled={loading !== null}>
          {loading === "partner" ? "Signing..." : "Login Partner"}
        </button>
        <button onClick={() => doLogin("admin")} disabled={loading !== null}>
          {loading === "admin" ? "Signing..." : "Login Admin"}
        </button>
        <button
          className="ghost"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>
      <small>Token: {token ? `${token.slice(0, 24)}...` : "-"}</small>
    </div>
  );
}
