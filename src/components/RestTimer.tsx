"use client";

import { useEffect, useState } from "react";
import { Square } from "lucide-react";
import FixedDigits from "./FixedDigits";
import { formatClock } from "@/lib/exerciseTypes";
import { Button } from "@/components/ui";

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
    <div className="border border-line bg-panel p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-eyebrow uppercase text-accent">Resting</span>
        <Button variant="ghost" size="sm" onClick={onStop} icon={<Square size={12} />}>
          Stop
        </Button>
      </div>

      {/* Lime while the clock runs: rest is the one thing happening right now. */}
      <div className="mt-2 flex justify-center">
        <FixedDigits
          value={formatClock(elapsed)}
          className="font-display text-hero-num leading-none text-accent"
        />
        <span className="sr-only">{elapsed} seconds of rest</span>
      </div>
    </div>
  );
}
