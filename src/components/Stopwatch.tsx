"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, Square, RotateCcw } from "lucide-react";
import FixedDigits from "./FixedDigits";

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
  const btn =
    "flex-1 flex items-center justify-center gap-2 font-bold rounded-xl py-3 transition-all active:scale-[0.98] disabled:opacity-50";

  return (
    <div className="bg-background border border-muted rounded-xl p-4">
      <div className="flex items-baseline justify-center">
        <FixedDigits
          value={`${minutes}:${seconds}`}
          className={`font-display text-5xl leading-none transition-colors ${
            phase === "running" ? "text-primary" : "text-foreground"
          }`}
        />
        <FixedDigits
          value={`.${centis}`}
          className="font-display text-2xl leading-none text-muted-foreground"
        />
        <span className="sr-only">
          {minutes} minutes {seconds} seconds
        </span>
      </div>

      <p className="mt-1 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {phase === "running" ? "Running" : phase === "paused" ? "Paused" : "Min : Sec . Cs"}
      </p>

      <div className="mt-4 flex gap-2">
        {phase === "idle" && (
          <button
            type="button"
            onClick={start}
            disabled={disabled}
            className={`${btn} bg-primary text-primary-foreground`}
          >
            <Play size={18} /> Start
          </button>
        )}

        {phase === "running" && (
          <>
            <button
              type="button"
              onClick={pause}
              className={`${btn} bg-muted/40 text-foreground border border-muted`}
            >
              <Pause size={18} /> Pause
            </button>
            <button
              type="button"
              onClick={stop}
              className={`${btn} bg-primary text-primary-foreground`}
            >
              <Square size={18} /> Stop
            </button>
          </>
        )}

        {phase === "paused" && (
          <>
            <button
              type="button"
              onClick={resume}
              className={`${btn} bg-muted/40 text-foreground border border-muted`}
            >
              <Play size={18} /> Continue
            </button>
            <button
              type="button"
              onClick={reset}
              className={`${btn} bg-muted/40 text-muted-foreground border border-muted`}
            >
              <RotateCcw size={18} /> Reset
            </button>
            <button
              type="button"
              onClick={stop}
              className={`${btn} bg-primary text-primary-foreground`}
            >
              <Square size={18} /> Stop
            </button>
          </>
        )}
      </div>

      {phase !== "idle" && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Stop fills the fields below, rounded to the nearest second.
        </p>
      )}
    </div>
  );
}
