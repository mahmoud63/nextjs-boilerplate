"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Plus, X, CheckCircle2 } from "lucide-react";
import FixedDigits from "./FixedDigits";
import { formatClock } from "@/lib/exerciseTypes";

/** Short chime + buzz so you can look away during the rest. */
function alertDone() {
  try {
    navigator.vibrate?.([180, 90, 180]);
  } catch {
    // Vibration is best-effort; unsupported browsers simply stay silent.
  }
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
    osc.onended = () => ctx.close();
  } catch {
    // Autoplay policy can block audio before any interaction — the buzz still fires.
  }
}

export default function RestTimer({
  seconds,
  onDismiss,
}: {
  seconds: number;
  onDismiss: () => void;
}) {
  const [total, setTotal] = useState(seconds);
  const [remaining, setRemaining] = useState(seconds);
  const [paused, setPaused] = useState(false);

  // Countdown runs against a wall-clock deadline rather than a decrementing
  // counter, so a backgrounded tab (throttled timers) still finishes on time.
  const deadlineRef = useRef<number>(Date.now() + seconds * 1000);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setRemaining(0);
    alertDone();
  }, []);

  useEffect(() => {
    if (paused || doneRef.current) return;

    const tick = () => {
      const left = Math.ceil((deadlineRef.current - Date.now()) / 1000);
      if (left <= 0) finish();
      else setRemaining(left);
    };

    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [paused, finish]);

  const togglePause = () => {
    if (doneRef.current) return;
    if (paused) {
      deadlineRef.current = Date.now() + remaining * 1000;
      setPaused(false);
    } else {
      setPaused(true);
    }
  };

  const addTime = () => {
    doneRef.current = false;
    setTotal((t) => t + 30);
    if (paused) {
      setRemaining((r) => r + 30);
    } else {
      deadlineRef.current = Math.max(Date.now(), deadlineRef.current) + 30_000;
      setRemaining(Math.ceil((deadlineRef.current - Date.now()) / 1000));
    }
  };

  const isDone = remaining <= 0;
  const progress = total > 0 ? Math.min(100, ((total - remaining) / total) * 100) : 100;

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        isDone ? "border-primary bg-primary/10" : "border-muted bg-background"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {isDone ? "Rest complete" : paused ? "Rest paused" : "Resting"}
        </span>
        <button
          type="button"
          onClick={onDismiss}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          {isDone ? "Dismiss" : "Skip"} <X size={13} />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-center gap-2">
        {isDone && <CheckCircle2 size={26} className="text-primary" />}
        <FixedDigits
          value={formatClock(remaining)}
          className={`font-display text-4xl leading-none ${isDone ? "text-primary" : "text-foreground"}`}
        />
        <span className="sr-only">
          {isDone ? "Rest complete" : `${remaining} seconds remaining`}
        </span>
      </div>

      <div className="mt-3 h-1 w-full bg-muted overflow-hidden rounded-full">
        <div
          className="h-full bg-primary transition-[width] duration-300 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-3 flex gap-2">
        {!isDone && (
          <button
            type="button"
            onClick={togglePause}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold border border-muted text-foreground hover:bg-muted/40 transition-colors"
          >
            {paused ? <Play size={16} /> : <Pause size={16} />}
            {paused ? "Resume" : "Pause"}
          </button>
        )}
        <button
          type="button"
          onClick={addTime}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold border border-muted text-foreground hover:bg-muted/40 transition-colors"
        >
          <Plus size={16} /> 30s
        </button>
        {isDone && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex-1 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground"
          >
            Next Set
          </button>
        )}
      </div>
    </div>
  );
}
