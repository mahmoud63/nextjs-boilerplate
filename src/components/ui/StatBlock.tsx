import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type StatBlockProps = {
  label: string;
  value: ReactNode;
  unit?: string;
  /** Signed change vs. the previous session. Positive is rendered as accent. */
  delta?: number;
  /** Set false where a rise is bad news (e.g. rest time). */
  higherIsBetter?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: "text-data-sm",
  md: "text-[20px] leading-6",
  lg: "text-[28px] leading-8",
} as const;

/**
 * The telemetry tile: label above, tabular number below. Mono throughout so a row
 * of these aligns column-wise and reads as one instrument cluster.
 */
export function StatBlock({
  label,
  value,
  unit,
  delta,
  higherIsBetter = true,
  size = "md",
  className,
}: StatBlockProps) {
  const good = delta === undefined ? false : higherIsBetter ? delta > 0 : delta < 0;

  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-eyebrow uppercase text-fg-dim truncate">{label}</p>
      <p className="mt-1 flex items-baseline gap-1 font-mono tnum text-fg">
        <span className={SIZES[size]}>{value}</span>
        {unit && <span className="text-eyebrow uppercase text-fg-dim">{unit}</span>}
      </p>
      {delta !== undefined && delta !== 0 && (
        <p
          className={cn(
            "mt-0.5 font-mono tnum text-data-sm",
            good ? "text-accent" : "text-fg-dim",
          )}
        >
          {delta > 0 ? "+" : ""}
          {delta}
        </p>
      )}
    </div>
  );
}

/** Hairline-divided row of stats. Three fit a 360px viewport; four do not. */
export function StatRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-px bg-line [&>*]:bg-panel [&>*]:p-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
