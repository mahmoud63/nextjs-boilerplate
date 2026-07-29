import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type CardProps = {
  children: ReactNode;
  /** Lime border plus the breathe glow. Reserved for the one active item on screen. */
  active?: boolean;
  /** 45-degree cut on the top-right corner. Budgeted at one element per screen. */
  chamfer?: boolean;
  /** Set false when the card holds edge-to-edge rows and owns its own padding. */
  padded?: boolean;
  as?: ElementType;
  className?: string;
};

export function Card({
  children,
  active = false,
  chamfer = false,
  padded = true,
  as: Tag = "div",
  className,
}: CardProps) {
  return (
    <Tag
      className={cn(
        "bg-panel border transition-colors duration-200 ease-kinetic",
        active ? "border-accent animate-breathe" : "border-line",
        chamfer && "chamfer",
        padded && "p-4",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** Hairline-separated section inside a Card. */
export function CardSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-line pt-3 mt-3 first:border-0 first:pt-0 first:mt-0", className)}>
      {children}
    </div>
  );
}
