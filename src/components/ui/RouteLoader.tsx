"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const SEGMENTS = 14;

/**
 * The between-pages boot sequence: wordmark, an indeterminate segmented bar, and a
 * live millisecond counter naming the route being fetched.
 *
 * Rendered from each route's `loading.tsx`, so React shows it the instant a
 * navigation starts rather than holding the previous screen until the server
 * answers. It fills the content column instead of the viewport on purpose — a
 * `fixed inset-0` overlay would cover BottomNav, and App Router navigations are
 * interruptible, so the tab bar has to stay tappable during a slow fetch.
 *
 * Nothing here reports real progress. The server has not replied yet, so a
 * determinate bar would be a lie; the pulse only says "still working".
 */
export function RouteLoader({
  label,
  compact = false,
  className,
}: {
  /** Route being loaded, e.g. "History". Shown after the slash. */
  label: string;
  /**
   * Drops the wordmark and the tall min-height, for swapping one region of a screen
   * rather than the whole route — the full boot screen would be shouting.
   */
  compact?: boolean;
  className?: string;
}) {
  const [ms, setMs] = useState(0);
  const frame = useRef<number>(0);

  useEffect(() => {
    // Anchored to a start stamp and read per frame, so a throttled tab reports the
    // true wait on return rather than however many ticks it was allowed.
    const startedAt = performance.now();

    const tick = () => {
      setMs(Math.round(performance.now() - startedAt));
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame.current);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Loading ${label}`}
      className={cn(
        "animate-boot-in flex flex-col items-center justify-center",
        compact ? "min-h-[220px] border border-line bg-panel" : "min-h-[65vh]",
        className,
      )}
    >
      {/* Scan line: a lime sliver travelling across a hairline track. */}
      <div className="relative w-40 h-px bg-line overflow-hidden">
        <span className="absolute inset-y-0 left-0 w-1/4 bg-accent-fill animate-scan" />
      </div>

      {!compact && (
        <p className="mt-8 font-display text-title-lg uppercase text-fg leading-none text-center">
          Beast
          <br />
          Tracker
        </p>
      )}

      <div
        className={cn(
          "flex items-stretch gap-[3px] h-1.5",
          compact ? "mt-6 w-40" : "mt-8 w-52",
        )}
      >
        {Array.from({ length: compact ? 10 : SEGMENTS }, (_, i) => (
          <span
            key={i}
            className="flex-1 bg-accent-fill animate-boot-seg"
            // Staggered so the pulse reads as a sweep rather than a flash.
            style={{ animationDelay: `${i * 55}ms` }}
          />
        ))}
      </div>

      <p className="mt-6 text-eyebrow uppercase text-fg-dim">
        Loading / <span className="text-fg-muted">{label}</span>
      </p>

      {/* tnum keeps the counter from jittering as digits change width. */}
      <p className="mt-1.5 font-mono tnum text-data-sm text-fg-dim" suppressHydrationWarning>
        {ms} ms
      </p>
    </div>
  );
}
