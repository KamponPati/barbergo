import { PageSection } from "../shared/PageSection";
import { useI18n } from "../i18n/I18nContext";
import { UiButton } from "../shared/UiKit";
import { useState } from "react";

export function SettingsPage(): JSX.Element {
  const { locale, setLocale, timeZone } = useI18n();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  return (
    <PageSection title="Settings" subtitle="App preferences and display options">
      <div className="marketing-grid">
        <article className="marketing-card">
          <h3>Language</h3>
          <p>Current locale: {locale}</p>
          <div className="row">
            <UiButton variant={locale === "th-TH" ? "primary" : "secondary"} onClick={() => setLocale("th-TH")}>
              Thai
            </UiButton>
            <UiButton variant={locale === "en-US" ? "primary" : "secondary"} onClick={() => setLocale("en-US")}>
              English
            </UiButton>
          </div>
        </article>
        <article className="marketing-card">
          <h3>Timezone</h3>
          <p>{timeZone}</p>
          <p>Date/time and currency formatting follows locale-aware settings.</p>
        </article>
        <article className="marketing-card">
          <h3>Interface</h3>
          <p>Theme: BarberGo light system</p>
          <p>Motion: respects reduced-motion preference</p>
          <div className="row">
            <UiButton variant={compactMode ? "primary" : "secondary"} onClick={() => setCompactMode((prev) => !prev)}>
              Compact Mode: {compactMode ? "On" : "Off"}
            </UiButton>
          </div>
        </article>
        <article className="marketing-card">
          <h3>Notifications</h3>
          <div className="row">
            <UiButton variant={emailAlerts ? "primary" : "secondary"} onClick={() => setEmailAlerts((prev) => !prev)}>
              Email: {emailAlerts ? "On" : "Off"}
            </UiButton>
            <UiButton variant={pushAlerts ? "primary" : "secondary"} onClick={() => setPushAlerts((prev) => !prev)}>
              Push: {pushAlerts ? "On" : "Off"}
            </UiButton>
          </div>
          <p>These preferences are local UI toggles for this prototype shell.</p>
        </article>
      </div>
    </PageSection>
  );
}
