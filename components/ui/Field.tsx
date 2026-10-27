import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string };

// Labelled text input. The label is visible, not just a placeholder (docs/DESIGN.md).
export default function Field({ label, className = "", ...props }: Props) {
  return (
    <label className={`flex flex-col gap-1 text-sm font-medium text-ink ${className}`}>
      {label}
      <input
        className="rounded-md border border-line bg-surface px-3 py-2 text-base font-normal text-ink placeholder:text-ink-muted focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        {...props}
      />
    </label>
  );
}
