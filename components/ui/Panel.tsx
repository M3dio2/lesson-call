import type { ReactNode } from "react";

// Surface with a line border; optional header bar on surface-2 (docs/DESIGN.md).
export default function Panel({
  header,
  children,
  className = "",
}: {
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex flex-col overflow-hidden rounded-panel border border-line bg-surface ${className}`}
    >
      {header && (
        <header className="flex items-center gap-2 border-b border-line bg-surface-2 px-2 py-1.5">
          {header}
        </header>
      )}
      {children}
    </section>
  );
}
