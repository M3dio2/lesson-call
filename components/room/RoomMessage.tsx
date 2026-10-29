import type { ReactNode } from "react";
import Marker from "@/components/ui/Marker";
import Panel from "@/components/ui/Panel";
import Wordmark from "@/components/ui/Wordmark";

// Full-page notice shown instead of the lesson (call ended, opened in another tab, …).
// `tick`: a marker tick draws itself above the title; it's then the page's one marker
// gesture, so the name goes without its underline.
export default function RoomMessage({
  title,
  children,
  actions,
  tick = false,
}: {
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  tick?: boolean;
}) {
  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center p-4">
      <Panel className="w-full max-w-sm">
        <div className="flex flex-col gap-2 p-6">
          <div className="mb-1">
            <Wordmark size="sm" underline={tick ? "none" : "still"} />
          </div>
          {tick && <Marker shape="tick" width={9} delay={0.2} className="my-2 h-10 w-12" />}
          <h1 className="text-2xl">{title}</h1>
          {children && <p className="text-ink-muted">{children}</p>}
          {actions && <div className="mt-2 flex flex-wrap gap-2">{actions}</div>}
        </div>
      </Panel>
    </main>
  );
}
