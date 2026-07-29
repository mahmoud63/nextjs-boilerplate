"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts 0 -> value once on mount, for the single hero number on a screen.
 *
 * Pads to the digit count of the target so the layout does not reflow while the
 * count runs (9 -> 04 would otherwise jump a character width mid-animation, and
 * this sits at 64px where that is very visible).
 */
export function CountUp({
  value,
  duration = 500,
  pad = 2,
  className,
}: {
  value: number;
  duration?: number;
  /** Minimum digit count. Pass 0 to disable padding. */
  pad?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(value);
  const frame = useRef<number>(0);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || value === 0) {
      setShown(value);
      return;
    }

    const start = performance.now();
    setShown(0);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // Ease-out so it decelerates onto the final value rather than snapping.
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration]);

  const digits = Math.max(pad, String(Math.trunc(value)).length);

  return (
    <span className={className} suppressHydrationWarning>
      {String(shown).padStart(digits, "0")}
    </span>
  );
}
