import { getExerciseHistory, getCycleStartDate, getExerciseConfig, getAllRoutineDays } from "@/app/actions";
import Link from "next/link";
import { ChevronLeft, Info, History, CheckCircle2 } from "lucide-react";
import SetLogger from "./SetLogger";
import HistoryChart from "./HistoryChart";
import HistoryList from "./HistoryList";

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
          <p className="font-semibold mb-1 text-foreground">{exercise.targetMuscle}</p>
          <p className="text-muted-foreground">Target: {exercise.sets} sets × {exercise.reps}</p>
          <p className="text-muted-foreground">Rest: {exercise.rest}</p>
          {exercise.notes && <p className="text-primary/80 mt-2 text-xs italic">{exercise.notes}</p>}
          
          {exercise.imageUrl && (
            <div className="mt-4 rounded-xl overflow-hidden border border-muted">
              <img src={exercise.imageUrl} alt={exercise.name} className="w-full h-auto object-cover max-h-48" />
            </div>
          )}
        </div>
      </section>

      <section>
        <SetLogger 
          exerciseId={exercise.id} 
          exerciseName={exercise.name} 
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
          <HistoryChart history={history} />
          <HistoryList history={history} />
        </section>
      )}
    </div>
  );
}
