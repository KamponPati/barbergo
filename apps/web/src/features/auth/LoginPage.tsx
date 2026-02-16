import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { UserRole } from "../../lib/types";
import { UiButton } from "../shared/UiKit";
import { useI18n } from "../i18n/I18nContext";

export function LoginPage(): JSX.Element {
  const { loginAs } = useAuth();
  const { label } = useI18n();
  const navigate = useNavigate();

  async function login(role: UserRole): Promise<void> {
    await loginAs(role);
    navigate(role === "admin" ? "/admin" : role === "partner" ? "/partner" : "/customer");
  }

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>{label("เข้าสู่ระบบ", "Login")}</h2>
        <p className="section-subtitle">
          {label("เลือกบทบาทเพื่อทดสอบสิทธิ์การเข้าถึงด้วย RBAC", "Choose a role to test flow permissions with RBAC guards.")}
        </p>
      </header>
      <div className="panel-body">
        <div className="row">
          <UiButton onClick={() => void login("customer")}>{label("เข้าระบบลูกค้า", "Login as Customer")}</UiButton>
          <UiButton onClick={() => void login("partner")}>{label("เข้าระบบพาร์ทเนอร์", "Login as Partner")}</UiButton>
          <UiButton onClick={() => void login("admin")}>{label("เข้าระบบแอดมิน", "Login as Admin")}</UiButton>
        </div>
      </div>
    </section>
  );
}
