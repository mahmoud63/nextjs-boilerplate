import { getExerciseHistory, getCycleStartDate, getExerciseConfig, getAllRoutineDays } from "@/app/actions";
import Link from "next/link";
import { ChevronLeft, Check, Link as LinkIcon, ExternalLink } from "lucide-react";
import SetLogger from "./SetLogger";
import HistoryChart from "./HistoryChart";
import HistoryList from "./HistoryList";
import ExerciseMedia from "@/components/ExerciseMedia";
import { normalizeType, TYPE_LABELS } from "@/lib/exerciseTypes";
import {
  Card,
  Chip,
  Divider,
  EmptyState,
  PageTitle,
  StatBlock,
  StatRow,
} from "@/components/ui";

export default async function ExercisePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ dayName?: string }>
}) {
  const { id } = await params;
  const { dayName } = await searchParams;

  const exerciseResult = await getExerciseConfig(id);
  const exercise = exerciseResult.success ? exerciseResult.data : null;

  if (!exercise) {
    return <EmptyState title="Exercise not found" message="This exercise no longer exists." />;
  }

  // Determine active dayName
  let activeDayName = dayName;
  if (!activeDayName) {
    // Fallback: check which days this exercise belongs to
    const daysResult = await getAllRoutineDays();
    if (daysResult.success && daysResult.data) {
      const parentDay = daysResult.data.find(d => d.exerciseIds.includes(exercise.id));
      if (parentDay) {
        activeDayName = parentDay.dayName;
      }
    }
  }

  if (!activeDayName) {
    activeDayName = "Unknown Day";
  }

  const exerciseType = normalizeType(exercise.type);

  const historyRes = await getExerciseHistory(exercise.name);
  const history = historyRes.success && historyRes.data ? historyRes.data : [];

  const startOfCycle = await getCycleStartDate();

  let cycleSetsCount = 0;
  if (history.length > 0) {
    const lastLog = history[history.length - 1];
    if (new Date(lastLog.date) > startOfCycle) {
      cycleSetsCount = lastLog.sets.length;
    }
  }

  let nextExerciseId: string | null = null;
  const daysResult = await getAllRoutineDays();
  if (daysResult.success && daysResult.data) {
    const parentDay = daysResult.data.find(d => d.dayName === activeDayName);
    if (parentDay) {
      const currentIdx = parentDay.exerciseIds.indexOf(exercise.id);
      if (currentIdx !== -1 && currentIdx < parentDay.exerciseIds.length - 1) {
        nextExerciseId = parentDay.exerciseIds[currentIdx + 1];
      }
    }
  }

  const isDoneThisCycle =
    history.length > 0 &&
    new Date(history[history.length - 1].date) > startOfCycle &&
    history[history.length - 1].sets.length >= exercise.sets;

  const unitLabel = exerciseType === "CARDIO" ? "Rounds" : "Sets";

  return (
    <div className="flex flex-col space-y-4 animate-rise">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 -ml-1 text-eyebrow uppercase text-fg-dim hover:text-fg transition-colors w-fit"
      >
        <ChevronLeft size={14} /> Back
      </Link>

      <PageTitle
        title={exercise.name}
        eyebrow={exercise.targetMuscle}
        right={<Chip>{TYPE_LABELS[exerciseType]}</Chip>}
      />

      {isDoneThisCycle && (
        <Card className="border-l-[3px] border-l-accent-fill" padded>
          <div className="flex items-center gap-3">
            <Check size={18} className="text-accent shrink-0" />
            <p className="text-eyebrow uppercase text-fg">Done for this cycle</p>
          </div>
        </Card>
      )}

      {/* Targets as an instrument cluster: the three numbers checked between sets. */}
      <div className="border border-line">
        <StatRow>
          <StatBlock label={unitLabel} value={exercise.sets} />
          <StatBlock label="Reps" value={exercise.reps} />
          <StatBlock label="Rest" value={exercise.rest} size="sm" />
        </StatRow>
      </div>

      {(exercise.targetWeight || exercise.rpe) && (
        <div className="flex flex-wrap gap-2">
          {exercise.targetWeight && <Chip variant="outline">{exercise.targetWeight}</Chip>}
          {exercise.rpe && <Chip variant="outline">RPE {exercise.rpe}</Chip>}
        </div>
      )}

      {exercise.notes && (
        <Card>
          <p className="text-eyebrow uppercase text-fg-dim">Coach note</p>
          <p className="mt-2 text-body text-fg-muted">{exercise.notes}</p>
        </Card>
      )}

      <ExerciseMedia videoUrl={exercise.videoUrl} imageUrl={exercise.imageUrl} name={exercise.name} />

      {exercise.refLinks && exercise.refLinks.length > 0 && (
        <div>
          <p className="flex items-center gap-1.5 text-eyebrow uppercase text-fg-dim">
            <LinkIcon size={12} /> References
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {exercise.refLinks.map((ref, idx) => (
              <a
                key={idx}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 border border-line-strong px-2.5 py-1.5 text-eyebrow uppercase text-fg-muted hover:border-accent hover:text-accent transition-colors"
              >
                {ref.label} <ExternalLink size={11} />
              </a>
            ))}
          </div>
        </div>
      )}

      <SetLogger
        exerciseId={exercise.id}
        exerciseName={exercise.name}
        exerciseType={exercise.type}
        dayName={activeDayName}
        nextSetNumber={cycleSetsCount + 1}
        targetSets={exercise.sets}
        nextExerciseId={nextExerciseId}
      />

      {history && history.length > 0 && (
        <section className="pt-4 space-y-4">
          <Divider label="Past performance" />
          <HistoryChart history={history} type={exerciseType} />
          <HistoryList history={history} type={exerciseType} />
        </section>
      )}
    </div>
  );
}
