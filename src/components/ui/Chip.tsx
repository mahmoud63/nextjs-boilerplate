import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ChipVariant = "default" | "accent" | "outline" | "danger";

const VARIANTS: Record<ChipVariant, string> = {
  default: "bg-field text-fg-muted",
  /* Counts against the one-lime-per-viewport budget. For "PR", "MAX EFFORT", and
     nothing routine. */
  accent: "bg-accent-fill text-on-accent",
  outline: "border border-line-strong text-fg-muted",
  danger: "bg-danger-fill text-danger",
};

export function Chip({
  children,
  variant = "default",
  icon,
  className,
}: {
  children: ReactNode;
  variant?: ChipVariant;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 text-eyebrow uppercase whitespace-nowrap",
        VARIANTS[variant],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
