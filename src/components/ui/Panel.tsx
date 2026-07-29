import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CountUp } from "./CountUp";
import { SegmentedProgress } from "./SegmentedProgress";

/**
 * The screen's hero block: one label, one huge number, one optional progress strip.
 *
 * There is exactly one of these per screen — it is what stops the dense telemetry
 * rows below from reading as a spreadsheet, and it only works because it is rare.
 */
export function Panel({
  eyebrow,
  value,
  caption,
  unit,
  meta,
  progress,
  animate = true,
  chamfer = true,
  children,
  className,
}: {
  /** Small uppercase label above the number. */
  eyebrow?: string;
  /** The hero number. Pass a string to opt out of the count-up. */
  value: number | string;
  /** Line under the number, e.g. "EXERCISES LEFT". */
  caption?: string;
  /** Rendered inline after the number at a smaller size, e.g. "KG". */
  unit?: string;
  meta?: ReactNode;
  progress?: { total: number; filled: number };
  animate?: boolean;
  chamfer?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative bg-panel border border-line p-5",
        chamfer && "chamfer",
        className,
      )}
    >
      {eyebrow && (
        <p className="text-eyebrow uppercase text-fg-dim">{eyebrow}</p>
      )}

      <div className="mt-3 flex items-end gap-2">
        <span className="font-display text-hero-num tnum text-fg leading-none">
          {typeof value === "number" && animate ? (
            <CountUp value={value} />
          ) : (
            value
          )}
        </span>
        {unit && (
          <span className="font-display text-title-md uppercase text-fg-dim pb-1.5">
            {unit}
          </span>
        )}
      </div>

      {caption && (
        <p className="mt-1 text-eyebrow uppercase text-fg-muted">{caption}</p>
      )}

      {progress && (
        <SegmentedProgress
          total={progress.total}
          filled={progress.filled}
          className="mt-4"
        />
      )}

      {meta && (
        <div className="mt-4 pt-3 border-t border-line font-mono text-data-sm tnum text-fg-muted">
          {meta}
        </div>
      )}

      {children}
    </section>
  );
}
