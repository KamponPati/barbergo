import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";

export function ForbiddenPage(): JSX.Element {
  const { label } = useI18n();

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>{label("ไม่อนุญาต", "Forbidden")}</h2>
        <p className="section-subtitle">{label("บทบาทนี้ไม่มีสิทธิ์เข้าหน้านี้", "This role cannot access this page.")}</p>
      </header>
      <div className="panel-body">
        <div className="row">
          <Link className="text-link" to="/login">
            {label("ล็อกอินด้วยบทบาทอื่น", "Login with another role")}
          </Link>
          <Link className="text-link" to="/customer">
            {label("ไปหน้าลูกค้า", "Go to customer")}
          </Link>
        </div>
      </div>
    </section>
  );
}
