export const EXERCISE_TYPES = ["WEIGHTS", "BODYWEIGHT", "TIMED", "CARDIO"] as const;
export type ExerciseType = (typeof EXERCISE_TYPES)[number];

export const TYPE_LABELS: Record<ExerciseType, string> = {
  WEIGHTS: "Weights",
  BODYWEIGHT: "Bodyweight",
  TIMED: "Timed Hold",
  CARDIO: "Cardio",
};

export const TYPE_HINTS: Record<ExerciseType, string> = {
  WEIGHTS: "Logs weight and reps.",
  BODYWEIGHT: "Logs reps, plus added weight if you use any.",
  TIMED: "Logs duration only — planks, holds, carries.",
  CARDIO: "Logs duration and distance.",
};

export function normalizeType(value?: string | null): ExerciseType {
  return (EXERCISE_TYPES as readonly string[]).includes(value ?? "")
    ? (value as ExerciseType)
    : "WEIGHTS";
}

export type SetLog = {
  setNumber: number;
  weight: number;
  reps: number;
  duration?: number | null; // seconds
  distance?: number | null; // km
};

/** Which numeric field the progress chart should trend for this type. */
export function chartMetric(type: ExerciseType): {
  key: "weight" | "reps" | "duration" | "distance";
  label: string;
  unit: string;
} {
  switch (type) {
    case "CARDIO":
      return { key: "duration", label: "Duration", unit: "min" };
    case "TIMED":
      return { key: "duration", label: "Hold Time", unit: "sec" };
    case "BODYWEIGHT":
      return { key: "reps", label: "Max Reps", unit: "reps" };
    default:
      return { key: "weight", label: "Max Weight", unit: "kg" };
  }
}

export function formatDuration(seconds?: number | null): string {
  if (!seconds && seconds !== 0) return "—";
  if (seconds < 60) return `${seconds} sec`;
  const mins = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return rem === 0 ? `${mins} min` : `${mins}m ${rem}s`;
}

/**
 * Same as describeSet, but for places that only have the log (ExerciseLog keys on
 * exercise *name*, so the type isn't available). Infers shape from what was stored.
 */
export function describeSetLoose(set: SetLog): string {
  const parts: string[] = [];
  if (set.duration) parts.push(formatDuration(set.duration));
  if (set.distance) parts.push(`${set.distance} km`);
  if (set.reps > 0) parts.push(`${set.reps} reps`);
  if (set.weight > 0) parts.push(`${set.weight} kg`);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

/** Human-readable one-liner for a logged set, shaped by the exercise type. */
export function describeSet(set: SetLog, type: ExerciseType): string {
  switch (type) {
    case "CARDIO": {
      const parts = [formatDuration(set.duration)];
      if (set.distance) parts.push(`${set.distance} km`);
      return parts.join(" · ");
    }
    case "TIMED":
      return formatDuration(set.duration);
    case "BODYWEIGHT":
      return set.weight > 0 ? `${set.reps} reps · +${set.weight} kg` : `${set.reps} reps`;
    default:
      return `${set.weight} kg × ${set.reps}`;
  }
}
