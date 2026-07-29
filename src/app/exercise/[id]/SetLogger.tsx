"use client";

import { useState, useTransition } from "react";
import { logSet } from "@/app/actions";
import { Plus, Check, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { normalizeType, TYPE_LABELS } from "@/lib/exerciseTypes";
import Stopwatch from "@/components/Stopwatch";
import RestTimer from "@/components/RestTimer";

export default function SetLogger({
  exerciseId,
  exerciseName,
  exerciseType,
  dayName,
  nextSetNumber,
  targetSets,
  nextExerciseId
}: {
  exerciseId: string,
  exerciseName: string,
  exerciseType?: string | null,
  dayName: string,
  nextSetNumber: number,
  targetSets: number,
  nextExerciseId: string | null
}) {
  const router = useRouter();
  const type = normalizeType(exerciseType);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [setNumber, setSetNumber] = useState(nextSetNumber);
  const [weight, setWeight] = useState<string>("");
  const [reps, setReps] = useState<string>("");
  const [minutes, setMinutes] = useState<string>("");
  const [seconds, setSeconds] = useState<string>("");
  const [distance, setDistance] = useState<string>("");
  const [showExtraForm, setShowExtraForm] = useState(false);
  // Bumping the key restarts the count when a new set is logged mid-rest.
  const [restKey, setRestKey] = useState(0);
  const [resting, setResting] = useState(false);

  const totalSeconds =
    (parseInt(minutes || "0") || 0) * 60 + (parseInt(seconds || "0") || 0);

  // Each type has its own idea of "enough to save".
  const canSubmit =
    type === "WEIGHTS" ? !!weight && !!reps
    : type === "BODYWEIGHT" ? !!reps
    : totalSeconds > 0;

  const resetFields = () => {
    setWeight("");
    setReps("");
    setMinutes("");
    setSeconds("");
    setDistance("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    startTransition(async () => {
      const res = await logSet({
        exerciseId,
        exerciseName,
        dayName,
        setNumber,
        weight: parseFloat(weight) || 0,
        reps: parseInt(reps) || 0,
        duration: totalSeconds > 0 ? totalSeconds : undefined,
        distance: distance ? parseFloat(distance) : undefined,
      });

      if (res.success) {
        setSuccess(true);
        setShowExtraForm(false);
        resetFields();
        setTimeout(() => setSuccess(false), 2000);

        // Start the rest timer automatically — logging the set is the cue, so
        // there is nothing extra to tap. Not after the final set.
        const nextSet = setNumber + 1;
        setSetNumber(nextSet);
        if (nextSet <= targetSets) {
          setRestKey(k => k + 1);
          setResting(true);
        }
      }
    });
  };

  const handleNextExercise = () => {
    if (nextExerciseId) {
      router.push(`/exercise/${nextExerciseId}?dayName=${encodeURIComponent(dayName)}`);
    } else {
      router.push('/');
    }
  };

  const isCompleted = setNumber > targetSets;
  const isOneExtraDone = setNumber > targetSets + 1;
  const unitLabel = type === "CARDIO" ? "Round" : "Set";

  if (isCompleted && !showExtraForm) {
    return (
      <div className="bg-card border border-muted rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-2">
          <CheckCircle2 size={24} />
        </div>
        <h3 className="text-xl font-bold">Target {unitLabel}s Reached!</h3>
        <p className="text-sm text-muted-foreground mb-4">Great job! You've finished the required {unitLabel.toLowerCase()}s for this exercise.</p>

        <div className="w-full space-y-3">
          <button
            onClick={handleNextExercise}
            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all"
          >
            {nextExerciseId ? "Go to Next Exercise" : "Finish & Go to Dashboard"} <ArrowRight size={18} />
          </button>

          {!isOneExtraDone && (
            <button
              onClick={() => setShowExtraForm(true)}
              className="w-full bg-background border border-muted text-muted-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-muted/50 transition-all"
            >
              <Plus size={18} /> Add 1 Extra {unitLabel}
            </button>
          )}
        </div>
      </div>
    );
  }

  const inputClass = "w-full bg-background border border-muted rounded-xl p-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all";
  const labelClass = "text-xs font-medium text-muted-foreground uppercase tracking-wider";

  const handleStopwatchStop = (totalSeconds: number) => {
    setMinutes(String(Math.floor(totalSeconds / 60)));
    setSeconds(String(totalSeconds % 60));
  };

  const durationFields = (
    <div className="space-y-3">
      <Stopwatch onStop={handleStopwatchStop} disabled={isPending} />
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-muted" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Or enter manually
        </span>
        <span className="h-px flex-1 bg-muted" />
      </div>
      <div className="flex gap-4">
        <div className="flex-1 space-y-1">
          <label className={labelClass}>Minutes</label>
          <input type="number" min="0" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="0" className={inputClass} />
        </div>
        <div className="flex-1 space-y-1">
          <label className={labelClass}>Seconds</label>
          <input type="number" min="0" max="59" value={seconds} onChange={(e) => setSeconds(e.target.value)} placeholder="0" className={inputClass} />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {resting && (
        <div className="mb-4">
          <RestTimer key={restKey} onStop={() => setResting(false)} />
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">
          {showExtraForm ? `Log Extra ${unitLabel}` : `Log ${unitLabel}`}
        </h2>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
          {TYPE_LABELS[type]}
        </span>
      </div>
      <form onSubmit={handleSubmit} className="bg-card border border-muted rounded-2xl p-4 shadow-lg space-y-4">
        {type === "WEIGHTS" && (
          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className={labelClass}>Weight (kg)</label>
              <input type="number" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0" className={inputClass} required />
            </div>
            <div className="flex-1 space-y-1">
              <label className={labelClass}>Reps</label>
              <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="0" className={inputClass} required />
            </div>
          </div>
        )}

        {type === "BODYWEIGHT" && (
          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className={labelClass}>Reps</label>
              <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="0" className={inputClass} required />
            </div>
            <div className="flex-1 space-y-1">
              <label className={labelClass}>Added Weight (kg)</label>
              <input type="number" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0" className={inputClass} />
            </div>
          </div>
        )}

        {type === "TIMED" && durationFields}

        {type === "CARDIO" && (
          <div className="space-y-4">
            {durationFields}
            <div className="space-y-1">
              <label className={labelClass}>Distance (km) — optional</label>
              <input type="number" step="0.01" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="0" className={inputClass} />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || !canSubmit}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold rounded-xl p-3 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {isPending ? <Loader2 size={20} className="animate-spin" /> : success ? <Check size={20} /> : <Plus size={20} />}
          {isPending ? "Saving..." : success ? "Saved!" : showExtraForm ? `Log Extra ${unitLabel}` : `Log ${unitLabel} ${setNumber}`}
        </button>

      </form>
    </div>
  );
}
