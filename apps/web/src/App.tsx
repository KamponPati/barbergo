import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./app/layout/AppLayout";
import { RoleGuard } from "./app/guards/RoleGuard";
import { AuthProvider } from "./features/auth/AuthContext";
import { I18nProvider } from "./features/i18n/I18nContext";
import { LoginPage } from "./features/auth/LoginPage";
import { ForbiddenPage } from "./features/auth/ForbiddenPage";
import { CustomerPage } from "./features/customer/CustomerPage";
import { PartnerPage } from "./features/partner/PartnerPage";
import { AdminPage } from "./features/admin/AdminPage";

export default function App(): JSX.Element {
  return (
    <I18nProvider>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/customer" replace />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="forbidden" element={<ForbiddenPage />} />

            <Route element={<RoleGuard allow={["customer", "admin"]} />}>
              <Route path="customer" element={<CustomerPage />} />
            </Route>

            <Route element={<RoleGuard allow={["partner", "admin"]} />}>
              <Route path="partner" element={<PartnerPage />} />
            </Route>

            <Route element={<RoleGuard allow={["admin"]} />}>
              <Route path="admin" element={<AdminPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/customer" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </I18nProvider>
  );
}
