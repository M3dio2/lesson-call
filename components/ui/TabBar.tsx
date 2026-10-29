"use client";

import Marker from "./Marker";

// Tabs for panel headers. The active tab is underlined by the marker, which draws itself each
// time the tab changes. `highlight` briefly circles a tab (after a teacher's (!) nudge).
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
            className={`relative isolate rounded-md px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              active ? "font-semibold text-ink" : "font-medium text-ink-muted hover:text-ink"
            }`}
          >
            {tab.label}
            {active && (
              <Marker
                shape="underline"
                className="absolute bottom-0.5 left-2 -z-10 h-1.5 w-[calc(100%-1rem)]"
              />
            )}
            {highlight === tab.id && (
              <Marker
                shape="circle"
                width={2.5}
                // An SVG doesn't stretch between insets, so it gets an explicit size.
                className="absolute -top-1 -left-1.5 h-[calc(100%+0.5rem)] w-[calc(100%+0.75rem)]"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
