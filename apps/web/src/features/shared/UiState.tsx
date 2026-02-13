export function LoadingBadge({ text = "Loading..." }: { text?: string }): JSX.Element {
  return <small className="state-loading">{text}</small>;
}

export function ErrorBanner({ message }: { message: string }): JSX.Element {
  return <div className="state-error">{message}</div>;
}

export function EmptyHint({ message }: { message: string }): JSX.Element {
  return <div className="state-empty">{message}</div>;
}
