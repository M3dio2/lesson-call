import type { ReactNode } from "react";
import Panel from "@/components/ui/Panel";
import Wordmark from "@/components/ui/Wordmark";

// The centred card shared by login, sign-up and the password pages.
export default function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center p-4">
      <Panel className="w-full max-w-sm">
        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-3">
            <Wordmark underline="draw" />
            <h1 className="text-2xl">{title}</h1>
          </div>
          {children}
        </div>
      </Panel>
    </main>
  );
}

// Small text link under a form ("Forgot your password?", "Create an account").
export const textLink =
  "rounded-sm font-medium text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";
