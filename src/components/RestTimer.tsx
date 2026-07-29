"use client";

import { useEffect, useState } from "react";
import { Square } from "lucide-react";
import FixedDigits from "./FixedDigits";
import { formatClock } from "@/lib/exerciseTypes";

/**
 * Counts rest time upward. No target, no countdown — it just runs until stopped.
 */
export default function RestTimer({ onStop }: { onStop: () => void }) {
  const [elapsed, setElapsed] = useState(0);

  // Anchored to a start timestamp rather than incremented per tick, so a locked
  // phone or backgrounded tab still shows the true rest time on return.
  useEffect(() => {
    const startedAt = Date.now();

    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-xl border border-muted bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Resting
        </span>
        <button
          type="button"
          onClick={onStop}
          className="flex items-center gap-1.5 rounded-lg border border-muted px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          <Square size={13} /> Stop
        </button>
      </div>

      <div className="mt-2 flex justify-center">
        <FixedDigits
          value={formatClock(elapsed)}
          className="font-display text-4xl leading-none text-foreground"
        />
        <span className="sr-only">{elapsed} seconds of rest</span>
      </div>
    </div>
  );
}
