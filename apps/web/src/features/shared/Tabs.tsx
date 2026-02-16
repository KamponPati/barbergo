export function Tabs({
  tabs,
  value,
  onChange
}: {
  tabs: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}): JSX.Element {
  return (
    <div className="tabs" role="tablist" aria-label="Section tabs">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            className={`tab ${active ? "tab-active" : ""}`}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
