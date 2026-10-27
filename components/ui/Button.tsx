import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover",
  secondary: "border border-line bg-surface text-ink hover:bg-surface-2",
  ghost: "text-ink-muted hover:bg-surface-2 hover:text-ink",
  danger: "text-danger hover:bg-danger hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "px-2.5 py-1.5 text-sm",
  md: "px-4 py-2",
};

// Shared button classes, also for links styled as buttons (see docs/DESIGN.md).
export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${extra}`;
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size };

export default function Button({ variant, size, className = "", ...props }: Props) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}
