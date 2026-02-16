export function LoadingBadge({ text = "Loading..." }: { text?: string }): JSX.Element {
  return (
    <p className="state-loading" role="status" aria-live="polite">
      {text}
    </p>
  );
}

export function ErrorBanner({ message }: { message: string }): JSX.Element {
  return (
    <div className="state-error" role="alert" aria-live="assertive">
      {message}
    </div>
  );
}

export function EmptyHint({ message }: { message: string }): JSX.Element {
  return (
    <div className="state-empty" role="note">
      {message}
    </div>
  );
}

export function StatusLine({ label = "Status", value }: { label?: string; value: string }): JSX.Element {
  return (
    <p className="status-line" role="status" aria-live="polite">
      <span>{label}:</span> {value}
    </p>
  );
}
