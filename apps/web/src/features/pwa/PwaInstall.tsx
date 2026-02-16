import { useEffect, useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { UiButton } from "../shared/UiKit";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function PwaInstall(): JSX.Element | null {
  const { label } = useI18n();
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event): void => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = (): void => {
      setInstalled(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || dismissed || !promptEvent) return null;

  return (
    <div className="install-banner" role="status" aria-live="polite">
      <p>{label("ติดตั้งแอป BarberGo บนอุปกรณ์นี้", "Install BarberGo app on this device")}</p>
      <div className="row">
        <UiButton
          onClick={async () => {
            await promptEvent.prompt();
            await promptEvent.userChoice;
            setPromptEvent(null);
          }}
        >
          {label("ติดตั้ง", "Install")}
        </UiButton>
        <UiButton variant="secondary" onClick={() => setDismissed(true)}>
          {label("ภายหลัง", "Later")}
        </UiButton>
      </div>
    </div>
  );
}
