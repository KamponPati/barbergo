export function Toast({
  message,
  tone = "success",
  onClose
}: {
  message: string;
  tone?: "success" | "error";
  onClose?: () => void;
}): JSX.Element {
  return (
    <div className={`toast toast-${tone}`} role="status" aria-live="polite">
      <span>{message}</span>
      {onClose ? (
        <button type="button" className="toast-close" onClick={onClose} aria-label="Close notification">
          x
        </button>
      ) : null}
    </div>
  );
}
