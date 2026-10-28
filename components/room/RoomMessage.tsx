import type { ReactNode } from "react";
import Panel from "@/components/ui/Panel";
import Wordmark from "@/components/ui/Wordmark";

// Full-page notice shown instead of the lesson (call ended, opened in another tab, …).
export default function RoomMessage({
  title,
  children,
  actions,
}: {
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center p-4">
      <Panel className="w-full max-w-sm">
        <div className="flex flex-col gap-2 p-6">
          <div className="mb-1">
            <Wordmark size="sm" />
          </div>
          <h1 className="text-2xl">{title}</h1>
          {children && <p className="text-ink-muted">{children}</p>}
          {actions && <div className="mt-2 flex flex-wrap gap-2">{actions}</div>}
        </div>
      </Panel>
    </main>
  );
}
