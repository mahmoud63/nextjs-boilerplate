import { getExerciseHistory, getCycleStartDate, getExerciseConfig, getAllRoutineDays } from "@/app/actions";
import Link from "next/link";
import { ChevronLeft, Info, History, CheckCircle2, Link as LinkIcon, ExternalLink } from "lucide-react";
import SetLogger from "./SetLogger";
import HistoryChart from "./HistoryChart";
import HistoryList from "./HistoryList";
import ExerciseMedia from "@/components/ExerciseMedia";
import { normalizeType, TYPE_LABELS } from "@/lib/exerciseTypes";

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
    return <div className="text-center p-10 text-muted-foreground">Exercise not found</div>;
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

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="flex items-center gap-3">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors">
          <ChevronLeft size={24} className="text-muted-foreground hover:text-foreground" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight leading-tight flex-1">{exercise.name}</h1>
      </header>

      {history && history.length > 0 && new Date(history[history.length - 1].date) > startOfCycle && history[history.length - 1].sets.length >= exercise.sets && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-xl flex items-center gap-2">
          <CheckCircle2 size={20} />
          <span className="font-bold text-sm">Exercise Completed for This Cycle!</span>
        </div>
      )}

      <section className="bg-card border border-muted rounded-2xl p-4 shadow-lg flex items-start gap-4">
        <div className="bg-primary/10 p-3 rounded-xl text-primary">
          <Info size={24} />
        </div>
        <div className="text-sm w-full">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="font-semibold text-foreground">{exercise.targetMuscle}</p>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-1 rounded-md shrink-0">
              {TYPE_LABELS[exerciseType]}
            </span>
          </div>
          <p className="text-muted-foreground">Target: {exercise.sets} {exerciseType === "CARDIO" ? "rounds" : "sets"} × {exercise.reps}</p>
          <p className="text-muted-foreground">Rest: {exercise.rest}</p>
          {exercise.targetWeight && <p className="text-muted-foreground">Weight: {exercise.targetWeight}</p>}
          {exercise.rpe && <p className="text-muted-foreground">Target RPE: {exercise.rpe}</p>}
          {exercise.notes && <p className="text-primary/80 mt-2 text-xs italic">{exercise.notes}</p>}

          <ExerciseMedia videoUrl={exercise.videoUrl} imageUrl={exercise.imageUrl} name={exercise.name} />

          {exercise.refLinks && exercise.refLinks.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <LinkIcon size={12} /> References
              </p>
              <div className="flex flex-wrap gap-2">
                {exercise.refLinks.map((ref, idx) => (
                  <a
                    key={idx}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded-lg px-2.5 py-1.5 hover:bg-primary/20 transition-colors"
                  >
                    {ref.label} <ExternalLink size={11} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section>
        <SetLogger
          exerciseId={exercise.id}
          exerciseName={exercise.name}
          exerciseType={exercise.type}
          dayName={activeDayName}
          nextSetNumber={cycleSetsCount + 1}
          targetSets={exercise.sets}
          nextExerciseId={nextExerciseId}
        />
      </section>

      {history && history.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <History size={18} className="text-primary" /> Past Performance
          </h2>
          <HistoryChart history={history} type={exerciseType} />
          <HistoryList history={history} type={exerciseType} />
        </section>
      )}
    </div>
  );
}
