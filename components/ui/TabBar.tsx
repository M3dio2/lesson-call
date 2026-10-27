"use client";

// Segmented tabs for panel headers. `highlight` briefly marks a tab (e.g. after a teacher nudge).
export default function TabBar<T extends string>({
  tabs,
  value,
  onChange,
  highlight,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  highlight?: T | null;
}) {
  return (
    <div role="tablist" className="flex gap-1">
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              active ? "bg-accent text-white" : "text-ink-muted hover:bg-surface hover:text-ink"
            } ${highlight === tab.id ? "animate-pulse ring-2 ring-accent ring-offset-1" : ""}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
