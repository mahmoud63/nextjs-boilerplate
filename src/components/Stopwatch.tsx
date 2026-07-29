"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, Square, RotateCcw } from "lucide-react";
import FixedDigits from "./FixedDigits";
import { Button } from "@/components/ui";

type Phase = "idle" | "running" | "paused";

function format(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  return {
    minutes: String(Math.floor(totalSeconds / 60)).padStart(2, "0"),
    seconds: String(totalSeconds % 60).padStart(2, "0"),
    // Hundredths, not thousandths — two digits are readable at a glance.
    centis: String(Math.floor((ms % 1000) / 10)).padStart(2, "0"),
  };
}


export default function Stopwatch({
  onStop,
  disabled,
}: {
  /** Called with the elapsed time, rounded to whole seconds, when the user stops. */
  onStop: (totalSeconds: number) => void;
  disabled?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);

  // Elapsed time is derived from timestamps rather than accumulated per tick, so a
  // throttled or backgrounded tab catches up instead of silently losing seconds.
  const startedAtRef = useRef<number | null>(null);
  const baseRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const stopLoop = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (phase !== "running") return;

    const tick = () => {
      if (startedAtRef.current !== null) {
        setElapsed(baseRef.current + (performance.now() - startedAtRef.current));
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);

    return stopLoop;
  }, [phase, stopLoop]);

  useEffect(() => stopLoop, [stopLoop]);

  const start = () => {
    baseRef.current = 0;
    startedAtRef.current = performance.now();
    setElapsed(0);
    setPhase("running");
  };

  const resume = () => {
    startedAtRef.current = performance.now();
    setPhase("running");
  };

  const pause = () => {
    if (startedAtRef.current !== null) {
      baseRef.current += performance.now() - startedAtRef.current;
      startedAtRef.current = null;
      setElapsed(baseRef.current);
    }
    setPhase("paused");
  };

  const reset = () => {
    stopLoop();
    baseRef.current = 0;
    startedAtRef.current = null;
    setElapsed(0);
    setPhase("idle");
  };

  const stop = () => {
    const total =
      startedAtRef.current !== null
        ? baseRef.current + (performance.now() - startedAtRef.current)
        : baseRef.current;

    stopLoop();
    baseRef.current = 0;
    startedAtRef.current = null;
    setElapsed(0);
    setPhase("idle");

    onStop(Math.round(total / 1000));
  };

  const { minutes, seconds, centis } = format(elapsed);

  return (
    <div className="border border-line bg-background p-4">
      <div className="flex items-baseline justify-center">
        <FixedDigits
          value={`${minutes}:${seconds}`}
          className={`font-display text-hero-num leading-none transition-colors ${
            phase === "running" ? "text-accent" : "text-fg"
          }`}
        />
        <FixedDigits
          value={`.${centis}`}
          className="font-display text-title-md leading-none text-fg-dim"
        />
        <span className="sr-only">
          {minutes} minutes {seconds} seconds
        </span>
      </div>

      <p className="mt-1 text-center text-eyebrow uppercase text-fg-dim">
        {phase === "running" ? "Running" : phase === "paused" ? "Paused" : "Min : Sec . Cs"}
      </p>

      <div className="mt-4 flex gap-2">
        {phase === "idle" && (
          <Button fullWidth onClick={start} disabled={disabled} icon={<Play size={16} />}>
            Start
          </Button>
        )}

        {phase === "running" && (
          <>
            <Button fullWidth variant="secondary" onClick={pause} icon={<Pause size={16} />}>
              Pause
            </Button>
            <Button fullWidth onClick={stop} icon={<Square size={16} />}>
              Stop
            </Button>
          </>
        )}

        {phase === "paused" && (
          <>
            <Button fullWidth variant="secondary" onClick={resume} icon={<Play size={16} />}>
              Go
            </Button>
            <Button fullWidth variant="ghost" onClick={reset} icon={<RotateCcw size={16} />}>
              Reset
            </Button>
            <Button fullWidth onClick={stop} icon={<Square size={16} />}>
              Stop
            </Button>
          </>
        )}
      </div>

      {phase !== "idle" && (
        <p className="mt-3 text-center text-body-sm text-fg-dim">
          Stop fills the fields below, rounded to the nearest second.
        </p>
      )}
    </div>
  );
}
