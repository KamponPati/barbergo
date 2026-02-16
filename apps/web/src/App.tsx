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
import { MarketingHomePage } from "./features/marketing/MarketingHomePage";
import { PartnerAcquisitionPage } from "./features/marketing/PartnerAcquisitionPage";
import { FaqPage } from "./features/marketing/FaqPage";
import { PricingPage } from "./features/marketing/PricingPage";
import { ContactPage } from "./features/marketing/ContactPage";
import { LegalPage } from "./features/legal/LegalPage";
import { SupportCenterPage } from "./features/support/SupportCenterPage";

export default function App(): JSX.Element {
  return (
    <I18nProvider>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/marketing" replace />} />
            <Route path="marketing" element={<MarketingHomePage />} />
            <Route path="marketing/partner" element={<PartnerAcquisitionPage />} />
            <Route path="marketing/faq" element={<FaqPage />} />
            <Route path="marketing/pricing" element={<PricingPage />} />
            <Route path="marketing/contact" element={<ContactPage />} />
            <Route path="legal/terms" element={<LegalPage variant="terms" />} />
            <Route path="legal/privacy" element={<LegalPage variant="privacy" />} />
            <Route path="legal/cookie" element={<LegalPage variant="cookie" />} />
            <Route path="legal/policy" element={<LegalPage variant="policy" />} />
            <Route path="support" element={<SupportCenterPage />} />
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

            <Route path="*" element={<Navigate to="/marketing" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </I18nProvider>
  );
}
