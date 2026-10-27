"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import Button from "@/components/ui/Button";

// Re-fetches the dashboard every 15 s so "Waiting" badges appear without reloading.
export function AutoRefresh({ seconds = 15 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}

// Formats a date in the viewer's own time zone (the server runs in UTC).
export function LocalDate({ iso }: { iso: string }) {
  const date = new Date(iso);
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}
    </time>
  );
}

// Submit button that asks first (server-action forms can't confirm on their own).
export function ConfirmSubmit({ message, children }: { message: string; children: ReactNode }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </Button>
  );
}
