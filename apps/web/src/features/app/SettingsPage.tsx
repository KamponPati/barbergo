import { PageSection } from "../shared/PageSection";
import { useI18n } from "../i18n/I18nContext";
import { UiButton } from "../shared/UiKit";
import { useState } from "react";
import { Field, Select } from "../shared/FormControls";
import { useAuth } from "../auth/AuthContext";
import { getMySettings, updateMySettings } from "../../lib/api";
import { useEffect } from "react";
import { ErrorBanner, LoadingBadge, StatusLine } from "../shared/UiState";

export function SettingsPage(): JSX.Element {
  const { locale, setLocale, timeZone } = useI18n();
  const { token } = useAuth();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [userTimeZone, setUserTimeZone] = useState(timeZone);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState<string | null>(null);

  async function loadSettings(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const data = await getMySettings(token);
      setLocale(data.locale === "en-US" ? "en-US" : "th-TH");
      setUserTimeZone(data.time_zone || "Asia/Bangkok");
      setEmailAlerts(data.email_alerts);
      setPushAlerts(data.push_alerts);
      setCompactMode(data.compact_mode);
      setStatus("Settings loaded from API");
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Load settings failed");
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const data = await updateMySettings(token, {
        locale,
        time_zone: userTimeZone,
        email_alerts: emailAlerts,
        push_alerts: pushAlerts,
        compact_mode: compactMode
      });
      setLocale(data.locale === "en-US" ? "en-US" : "th-TH");
      setUserTimeZone(data.time_zone || "Asia/Bangkok");
      setEmailAlerts(data.email_alerts);
      setPushAlerts(data.push_alerts);
      setCompactMode(data.compact_mode);
      setStatus("Settings saved");
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      setError(message);
      setStatus("Save settings failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    void loadSettings();
  }, [token]);

  return (
    <PageSection title="Settings" subtitle="App preferences and display options">
      <div className="row">
        <UiButton onClick={() => void loadSettings()} variant="secondary">
          Reload
        </UiButton>
        <UiButton onClick={() => void saveSettings()}>Save Settings</UiButton>
      </div>
      {loading ? <LoadingBadge text="Saving/loading settings..." /> : null}
      {error ? <ErrorBanner message={error} /> : null}
      <StatusLine value={status} />

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
          <Field label="Timezone">
            <Select
              value={userTimeZone}
              onChange={setUserTimeZone}
              options={[
                { value: "Asia/Bangkok", label: "Asia/Bangkok" },
                { value: "UTC", label: "UTC" },
                { value: "Asia/Singapore", label: "Asia/Singapore" }
              ]}
            />
          </Field>
          <p>{userTimeZone}</p>
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
        <article className="marketing-card">
          <h3>Snapshot</h3>
          <p>Locale: {locale}</p>
          <p>Timezone: {userTimeZone}</p>
          <p>Email/Push: {emailAlerts ? "On" : "Off"} / {pushAlerts ? "On" : "Off"}</p>
          <p>Compact: {compactMode ? "On" : "Off"}</p>
        </article>
      </div>
    </PageSection>
  );
}
