import { Navigate, Route, Routes } from "react-router-dom";
import { PublicLayout } from "./app/layout/PublicLayout";
import { AppShellLayout } from "./app/layout/AppShellLayout";
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
import { HomePage } from "./features/app/HomePage";
import { FeaturesPage } from "./features/app/FeaturesPage";
import { BookingsPage } from "./features/app/BookingsPage";
import { WalletPage } from "./features/app/WalletPage";
import { NotificationsPage } from "./features/app/NotificationsPage";
import { InsightsPage } from "./features/app/InsightsPage";
import { ProfilePage } from "./features/app/ProfilePage";
import { SettingsPage } from "./features/app/SettingsPage";
import { HelpPage } from "./features/app/HelpPage";

export default function App(): JSX.Element {
  return (
    <I18nProvider>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Navigate to="/login" replace />} />
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
            <Route path="forbidden" element={<ForbiddenPage />} />
          </Route>

          <Route path="login" element={<LoginPage />} />

          <Route element={<RoleGuard allow={["customer", "partner", "admin"]} />}>
            <Route path="app" element={<AppShellLayout />}>
              <Route index element={<Navigate to="/app/home" replace />} />
              <Route path="home" element={<HomePage />} />
              <Route path="features" element={<FeaturesPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="wallet" element={<WalletPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="insights" element={<InsightsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="help" element={<HelpPage />} />

              <Route element={<RoleGuard allow={["customer", "admin"]} />}>
                <Route path="customer" element={<CustomerPage />} />
              </Route>

              <Route element={<RoleGuard allow={["partner", "admin"]} />}>
                <Route path="partner" element={<PartnerPage />} />
              </Route>

              <Route element={<RoleGuard allow={["admin"]} />}>
                <Route path="admin" element={<AdminPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="customer" element={<Navigate to="/app/customer" replace />} />
          <Route path="partner" element={<Navigate to="/app/partner" replace />} />
          <Route path="admin" element={<Navigate to="/app/admin" replace />} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </I18nProvider>
  );
}
