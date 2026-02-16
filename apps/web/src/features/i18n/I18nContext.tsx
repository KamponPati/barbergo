import { createContext, useContext, useMemo, useState } from "react";

export type AppLocale = "th-TH" | "en-US";

type I18nValue = {
  locale: AppLocale;
  timeZone: string;
  setLocale: (locale: AppLocale) => void;
  formatDateTime: (iso: string) => string;
  formatCurrency: (amount: number) => string;
  label: (th: string, en: string) => string;
};

const I18N_STORAGE_KEY = "barbergo_locale";
const DEFAULT_TZ = "Asia/Bangkok";

const I18nContext = createContext<I18nValue | null>(null);

function getInitialLocale(): AppLocale {
  if (typeof window === "undefined") return "th-TH";
  const stored = window.localStorage.getItem(I18N_STORAGE_KEY);
  if (stored === "th-TH" || stored === "en-US") return stored;
  return "th-TH";
}

export function I18nProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [locale, setLocaleState] = useState<AppLocale>(getInitialLocale);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      timeZone: DEFAULT_TZ,
      setLocale(nextLocale: AppLocale): void {
        setLocaleState(nextLocale);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(I18N_STORAGE_KEY, nextLocale);
        }
      },
      formatDateTime(iso: string): string {
        if (!iso) return "-";
        const value = new Date(iso);
        if (Number.isNaN(value.getTime())) return "-";
        return new Intl.DateTimeFormat(locale, {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: DEFAULT_TZ
        }).format(value);
      },
      formatCurrency(amount: number): string {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency: "THB",
          maximumFractionDigits: 0
        }).format(amount);
      },
      label(th: string, en: string): string {
        return locale === "th-TH" ? th : en;
      }
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
