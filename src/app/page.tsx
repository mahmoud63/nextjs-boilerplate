// Beast Tracker Main Dashboard Component
import { getTodaySession, getRoutineDay, getAllRoutineDays, getAllCycleSessions } from "@/app/actions";
import Link from "next/link";
import { ChevronRight, CalendarDays, Flame, CheckCircle2, FastForward } from "lucide-react";
import DaySelector from "@/components/DaySelector";
import SessionActionButtons from "@/components/SessionActionButtons";
import ResetCycleButton from "@/components/ResetCycleButton";
import RichText from "@/components/RichText";

export default async function Home({ searchParams }: { searchParams: Promise<{ day?: string }> }) {
  const { day } = await searchParams;
  
  const allDaysResult = await getAllRoutineDays();
  const allDays = allDaysResult.success ? allDaysResult.data || [] : [];

  let defaultMappedDay = 1;

  let mappedDays = allDays.map(d => ({ ...d, status: "IDLE" }));

  if (allDays.length > 0) {
    const cycleSessionsResult = await getAllCycleSessions();
    const cycleSessions = cycleSessionsResult.success ? cycleSessionsResult.data || [] : [];

    mappedDays = allDays.map((routineDay: any) => {
      let status = "IDLE";
      const session = cycleSessions.find((s: any) => s.dayName === routineDay.dayName);
      
      if (session) {
        const virtualStatusLog = session.exercises.find((e: any) => e.exerciseName.startsWith("SYSTEM_STATUS_"));
        if (virtualStatusLog) {
          const vs = virtualStatusLog.exerciseName.replace("SYSTEM_STATUS_", "");
          if (vs === "COMPLETED" || vs === "SKIPPED") {
            status = vs;
          }
        } else if (!routineDay.isRestDay) {
          let completedCount = 0;
          routineDay.exercises.forEach((ex: any) => {
            const log = session.exercises.find((e: any) => e.exerciseName === ex.name);
            if (log && log.sets.length >= ex.sets) {
              completedCount++;
            }
          });
          if (completedCount === routineDay.exercises.length && routineDay.exercises.length > 0) {
            status = "COMPLETED";
          }
        }
      }

      return { ...routineDay, status };
    });

    let targetDay = null;
    let hasNonIdle = false;

    for (let i = 0; i < mappedDays.length; i++) {
      if (mappedDays[i].status !== "IDLE") {
        hasNonIdle = true;
      } else if (hasNonIdle && !targetDay) {
        targetDay = mappedDays[i].dayNumber;
      }
    }

    if (targetDay) {
      defaultMappedDay = targetDay;
    } else {
      defaultMappedDay = 1;
    }
  }
  
  const selectedDay = day ? parseInt(day, 10) : defaultMappedDay;

  const routineDayResult = await getRoutineDay(selectedDay);
  const activeRoutine = routineDayResult.success ? routineDayResult.data : null;

  if (!activeRoutine) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center space-y-4">
        <h2 className="text-xl font-bold">Day not found</h2>
        <p className="text-muted-foreground">It seems this day hasn't been configured yet.</p>
        <Link href="/settings" className="bg-primary text-primary-foreground px-4 py-2 rounded-xl">
          Go to Settings
        </Link>
      </div>
    );
  }

  const sessionResult = await getTodaySession(activeRoutine.dayName);
  const session = sessionResult.success ? sessionResult.data : null;

  // Check completion states
  const exerciseCompletion: Record<string, boolean> = {};
  let allCompleted = false;
  let virtualStatus: string | null = null;

  if (session && !activeRoutine.isRestDay) {
    let completedCount = 0;
    
    // Extract virtual status
    const statusLog = session.exercises.find(e => e.exerciseName.startsWith("SYSTEM_STATUS_"));
    if (statusLog) {
      virtualStatus = statusLog.exerciseName.replace("SYSTEM_STATUS_", "");
    }

    activeRoutine.exercises.forEach(ex => {
      // Ignore virtual status logs in exercise completion check
      const log = session.exercises.find(e => e.exerciseName === ex.name);
      if (log && log.sets.length >= ex.sets) {
        exerciseCompletion[ex.id] = true;
        completedCount++;
      } else {
        exerciseCompletion[ex.id] = false;
      }
    });
    
    if (completedCount === activeRoutine.exercises.length && activeRoutine.exercises.length > 0) {
      allCompleted = true;
    }
  } else if (session && activeRoutine.isRestDay) {
    const statusLog = session.exercises.find(e => e.exerciseName.startsWith("SYSTEM_STATUS_"));
    if (statusLog) {
      virtualStatus = statusLog.exerciseName.replace("SYSTEM_STATUS_", "");
    }
  }

  const hasAnyProgress = session?.exercises && session.exercises.length > 0;
  const isDayCompleted = virtualStatus === "COMPLETED" || allCompleted;
  const isDaySkipped = virtualStatus === "SKIPPED";
  const hasFinishedState = isDayCompleted || isDaySkipped;

  const sectionBorderClass = isDayCompleted ? "border-green-500/50" : isDaySkipped ? "border-red-500/50" : "border-muted";

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-accent">Workout</h1>
          <p className="text-muted-foreground flex items-center gap-1 mt-1">
            <CalendarDays size={14} /> Select your training day
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ResetCycleButton />
          <div className="bg-card p-2 rounded-full border border-primary/20 shadow-[0_0_15px_rgba(255,255,255,0.15)]">
            <Flame className="text-primary" size={24} />
          </div>
        </div>
      </header>

      <DaySelector selectedDay={selectedDay} defaultDay={defaultMappedDay} days={mappedDays} />

      <section className={`bg-card border ${sectionBorderClass} rounded-2xl p-5 shadow-lg relative overflow-hidden transition-colors duration-500`}>
        {selectedDay === defaultMappedDay && (
          <div className="absolute top-0 right-0 bg-primary/20 text-primary text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Today
          </div>
        )}
        
        <h2 className="text-xl font-bold mb-2">{activeRoutine.dayName}</h2>
        {activeRoutine.description && (
          <details className="group mb-6 rounded-xl border border-muted bg-background/40">
            <summary className="cursor-pointer list-none px-4 py-2.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
              Session Brief
              <ChevronRight size={16} className="transition-transform group-open:rotate-90" />
            </summary>
            <RichText
              html={activeRoutine.description}
              className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground"
            />
          </details>
        )}

        {isDayCompleted && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-xl flex items-center gap-3">
            <CheckCircle2 size={24} />
            <div>
              <p className="font-bold text-sm">Day Completed!</p>
              <p className="text-xs opacity-80">Awesome job finishing your workout.</p>
            </div>
          </div>
        )}

        {isDaySkipped && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl flex items-center gap-3">
            <FastForward size={24} />
            <div>
              <p className="font-bold text-sm">Day Skipped</p>
              <p className="text-xs opacity-80">You've skipped this session.</p>
            </div>
          </div>
        )}

        {activeRoutine.isRestDay ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl">🧘‍♂️</span>
            </div>
            <h3 className="font-semibold text-lg">Rest Day</h3>
            <p className="text-sm text-muted-foreground">Take it easy and recover for tomorrow.</p>
            
            <SessionActionButtons dayName={activeRoutine.dayName} currentStatus={virtualStatus} hasAnyProgress={hasAnyProgress} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-primary/80">Exercises ({activeRoutine.exercises.length})</h3>
            </div>
            
            <div className="space-y-2">
              {activeRoutine.exerciseIds.map((exId: string, idx: number) => {
                const exercise = activeRoutine.exercises.find((e: any) => e.id === exId);
                if (!exercise) return null;
                
                const isExCompleted = exerciseCompletion[exercise.id];
                
                return (
                  <Link 
                    key={exercise.id} 
                    href={`/exercise/${exercise.id}?dayName=${encodeURIComponent(activeRoutine.dayName)}`}
                    className={`group flex items-center justify-between p-3 rounded-xl bg-background border transition-all ${
                      isExCompleted ? "border-green-500/30 bg-green-500/5" : "border-transparent hover:border-primary/30 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                        isExCompleted ? "bg-green-500/20 text-green-500" : "bg-primary/10 text-primary"
                      }`}>
                        {isExCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>
                      <div>
                        <h4 className={`font-medium text-sm transition-colors line-clamp-1 ${isExCompleted ? "text-green-500" : "group-hover:text-primary"}`}>
                          {exercise.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{exercise.sets} sets × {exercise.reps} • {exercise.targetMuscle}</p>
                        {(exercise.targetWeight || exercise.rpe) && (
                          <p className="text-xs text-muted-foreground/70 mt-0.5">
                            {[exercise.targetWeight, exercise.rpe && `RPE ${exercise.rpe}`].filter(Boolean).join(" • ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1 shrink-0 ml-2" />
                  </Link>
                );
              })}
            </div>
            
            <SessionActionButtons dayName={activeRoutine.dayName} currentStatus={virtualStatus || (allCompleted ? "COMPLETED" : null)} hasAnyProgress={hasAnyProgress} />
          </div>
        )}
      </section>
    </div>
  );
}
