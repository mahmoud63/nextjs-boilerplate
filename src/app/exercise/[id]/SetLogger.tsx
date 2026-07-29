"use client";

import { useState, useTransition } from "react";
import { logSet } from "@/app/actions";
import { Plus, Check, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { normalizeType, TYPE_LABELS } from "@/lib/exerciseTypes";
import Stopwatch from "@/components/Stopwatch";
import RestTimer from "@/components/RestTimer";
import { Button, Card, Chip, Divider, Field, SegmentedProgress } from "@/components/ui";

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
  const loggedSets = Math.min(targetSets, setNumber - 1);

  if (isCompleted && !showExtraForm) {
    return (
      <Card className="text-center" padded>
        <p className="text-eyebrow uppercase text-fg-dim">Target reached</p>
        <p className="mt-3 font-display text-title-lg uppercase text-fg">
          {targetSets} / {targetSets} {unitLabel}s
        </p>
        <SegmentedProgress total={targetSets} filled={targetSets} className="mt-4" />

        <div className="mt-6 space-y-2">
          <Button
            fullWidth
            size="lg"
            onClick={handleNextExercise}
            iconRight={<ArrowRight size={18} />}
          >
            {nextExerciseId ? "Next exercise" : "Finish session"}
          </Button>

          {!isOneExtraDone && (
            <Button
              fullWidth
              variant="ghost"
              onClick={() => setShowExtraForm(true)}
              icon={<Plus size={16} />}
            >
              Add 1 extra {unitLabel.toLowerCase()}
            </Button>
          )}
        </div>
      </Card>
    );
  }

  const handleStopwatchStop = (totalSeconds: number) => {
    setMinutes(String(Math.floor(totalSeconds / 60)));
    setSeconds(String(totalSeconds % 60));
  };

  const durationFields = (
    <div className="space-y-3">
      <Stopwatch onStop={handleStopwatchStop} disabled={isPending} />
      <Divider label="Or enter manually" />
      <div className="flex gap-3">
        <Field label="Minutes" numeric inputMode="numeric" type="number" min="0" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="0" wrapperClassName="flex-1" />
        <Field label="Seconds" numeric inputMode="numeric" type="number" min="0" max="59" value={seconds} onChange={(e) => setSeconds(e.target.value)} placeholder="0" wrapperClassName="flex-1" />
      </div>
    </div>
  );

  return (
    <div>
      {resting && (
        <div className="mb-3">
          <RestTimer key={restKey} onStop={() => setResting(false)} />
        </div>
      )}

      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-eyebrow uppercase text-fg-dim">
            {showExtraForm ? `Extra ${unitLabel}` : TYPE_LABELS[type]}
          </p>
          <h2 className="mt-1 font-display text-title-md uppercase text-fg">
            {unitLabel} {setNumber}
          </h2>
        </div>
        <Chip variant="outline">
          {loggedSets}/{targetSets}
        </Chip>
      </div>

      <SegmentedProgress total={targetSets} filled={loggedSets} className="mb-3" />

      {/* The form is the active element on this screen, so it takes the lime border
          and the glow — it is what the user is looking for with a bar in hand. */}
      <Card active padded>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === "WEIGHTS" && (
            <div className="flex gap-3">
              <Field label="Weight" suffix="kg" numeric inputMode="decimal" type="number" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0" required wrapperClassName="flex-1" />
              <Field label="Reps" numeric inputMode="numeric" type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="0" required wrapperClassName="flex-1" />
            </div>
          )}

          {type === "BODYWEIGHT" && (
            <div className="flex gap-3">
              <Field label="Reps" numeric inputMode="numeric" type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="0" required wrapperClassName="flex-1" />
              <Field label="Added" suffix="kg" numeric inputMode="decimal" type="number" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0" wrapperClassName="flex-1" />
            </div>
          )}

          {type === "TIMED" && durationFields}

          {type === "CARDIO" && (
            <div className="space-y-4">
              {durationFields}
              <Field label="Distance" suffix="km" hint="Optional" numeric inputMode="decimal" type="number" step="0.01" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="0" />
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={!canSubmit}
            loading={isPending}
            icon={!isPending ? (success ? <Check size={18} /> : <Plus size={18} />) : undefined}
          >
            {isPending
              ? "Saving"
              : success
              ? "Saved"
              : showExtraForm
              ? `Log extra ${unitLabel.toLowerCase()}`
              : `Log ${unitLabel.toLowerCase()} ${setNumber}`}
          </Button>
        </form>
      </Card>
    </div>
  );
}
