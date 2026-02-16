import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Chip, UiButton } from "../shared/UiKit";
import { useI18n } from "../i18n/I18nContext";

export function AuthPanel(): JSX.Element {
  const { role, token, loginAs, logout } = useAuth();
  const { label } = useI18n();
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
      <div className="auth-title-row">
        <strong>{label("เซสชัน", "Session")}</strong>
        <Chip tone={role ? "success" : "neutral"}>{role ?? "anonymous"}</Chip>
      </div>
      <div className="auth-actions">
        <UiButton onClick={() => doLogin("customer")} disabled={loading !== null}>
          {loading === "customer" ? label("กำลังล็อกอิน...", "Signing...") : label("เข้าลูกค้า", "Login Customer")}
        </UiButton>
        <UiButton onClick={() => doLogin("partner")} disabled={loading !== null}>
          {loading === "partner" ? label("กำลังล็อกอิน...", "Signing...") : label("เข้าพาร์ทเนอร์", "Login Partner")}
        </UiButton>
        <UiButton onClick={() => doLogin("admin")} disabled={loading !== null}>
          {loading === "admin" ? label("กำลังล็อกอิน...", "Signing...") : label("เข้าแอดมิน", "Login Admin")}
        </UiButton>
        <UiButton
          variant="secondary"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          {label("ออกจากระบบ", "Logout")}
        </UiButton>
      </div>
      <small className="token-line">{label("โทเค็น", "Token")}: {token ? `${token.slice(0, 24)}...` : "-"}</small>
    </div>
  );
}
