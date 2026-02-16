import { useEffect } from "react";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";

export function UiButton({
  children,
  disabled,
  variant = "primary",
  onClick,
  type = "button"
}: {
  children: ReactNode;
  disabled?: boolean;
  variant?: ButtonVariant;
  onClick?: () => void | Promise<void>;
  type?: "button" | "submit";
}): JSX.Element {
  return (
    <button type={type} className={`btn ${variant === "secondary" ? "btn-secondary" : ""}`} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

export function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "brand" | "success" | "warning" }): JSX.Element {
  return <span className={`chip chip-${tone}`}>{children}</span>;
}

export function UiBadge({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}): JSX.Element {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function StatCard({ label, value }: { label: string; value: string | number }): JSX.Element {
  return (
    <article className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </article>
  );
}

export function UiModal({
  title,
  open,
  onClose,
  children,
  footer
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}): JSX.Element | null {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="overlay" role="presentation" onClick={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-head">
          <h3>{title}</h3>
          <UiButton variant="secondary" onClick={onClose}>
            Close
          </UiButton>
        </header>
        <div className="modal-body">{children}</div>
        {footer ? <footer className="modal-foot">{footer}</footer> : null}
      </section>
    </div>
  );
}

export function UiDrawer({
  title,
  open,
  onClose,
  children
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}): JSX.Element | null {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="overlay" role="presentation" onClick={onClose}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <header className="modal-head">
          <h3>{title}</h3>
          <UiButton variant="secondary" onClick={onClose}>
            Close
          </UiButton>
        </header>
        <div className="modal-body">{children}</div>
      </aside>
    </div>
  );
}
