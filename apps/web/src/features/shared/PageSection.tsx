export function PageSection({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }): JSX.Element {
  return (
    <section className="panel">
      <header className="panel-header">
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </header>
      <div className="panel-body">{children}</div>
    </section>
  );
}
