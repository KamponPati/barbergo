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
    navigate("/app/home");
  }

  return (
    <section className="login-shell">
      <article className="login-card">
        <p className="eyebrow">BarberGo</p>
        <h2>{label("เข้าสู่ระบบ", "Login")}</h2>
        <p className="section-subtitle">
          {label(
            "เลือกบทบาทเพื่อเข้าสู่หน้าหลักของแอปและใช้งานฟังก์ชันตามสิทธิ์",
            "Choose a role to enter the app and access role-based features."
          )}
        </p>
        <div className="login-actions">
          <UiButton onClick={() => void login("customer")}>{label("เข้าสู่ระบบลูกค้า", "Continue as Customer")}</UiButton>
          <UiButton onClick={() => void login("partner")}>{label("เข้าสู่ระบบพาร์ทเนอร์", "Continue as Partner")}</UiButton>
          <UiButton onClick={() => void login("admin")}>{label("เข้าสู่ระบบแอดมิน", "Continue as Admin")}</UiButton>
        </div>
      </article>
    </section>
  );
}
