// Beast Tracker Main Dashboard Component
import { getTodaySession, getRoutineDay, getAllRoutineDays, getAllCycleSessions } from "@/app/actions";
import { ChevronRight, Check, FastForward } from "lucide-react";
import DaySelector from "@/components/DaySelector";
import SessionActionButtons from "@/components/SessionActionButtons";
import ResetCycleButton from "@/components/ResetCycleButton";
import RichText from "@/components/RichText";
import {
  ButtonLink,
  Card,
  EmptyState,
  ListGroup,
  ListRow,
  Panel,
} from "@/components/ui";

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
      <EmptyState
        title="Day not found"
        message="This day hasn't been configured yet."
        action={<ButtonLink href="/settings">Go to settings</ButtonLink>}
      />
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

  // Ordered exercise list, so "the next one to do" is a position rather than a lookup.
  const orderedExercises = activeRoutine.exerciseIds
    .map((exId: string) => activeRoutine.exercises.find((e: any) => e.id === exId))
    .filter(Boolean) as typeof activeRoutine.exercises;

  const totalExercises = orderedExercises.length;
  const doneExercises = orderedExercises.filter(ex => exerciseCompletion[ex.id]).length;
  const remaining = Math.max(0, totalExercises - doneExercises);

  // Exactly one row may be active — the first unfinished exercise. That row owns the
  // screen's lime, which is why the Panel below stays monochrome.
  const activeExerciseId = isDayCompleted || isDaySkipped
    ? null
    : orderedExercises.find(ex => !exerciseCompletion[ex.id])?.id ?? null;

  return (
    <div className="flex flex-col space-y-4 animate-rise">
      <div className="flex items-center justify-between">
        <p className="text-eyebrow uppercase text-fg-dim">Training cycle</p>
        <ResetCycleButton />
      </div>

      <DaySelector selectedDay={selectedDay} defaultDay={defaultMappedDay} days={mappedDays} />

      {activeRoutine.isRestDay ? (
        <Panel
          eyebrow={activeRoutine.dayName}
          value="REST"
          caption="Recovery day"
          meta={
            <div className="flex justify-between">
              <span>DAY {activeRoutine.dayNumber} / {mappedDays.length}</span>
              <span>{isDayCompleted ? "LOGGED" : isDaySkipped ? "SKIPPED" : "OPEN"}</span>
            </div>
          }
        />
      ) : (
        <Panel
          eyebrow={activeRoutine.dayName}
          value={remaining}
          caption={remaining === 1 ? "Exercise left" : "Exercises left"}
          progress={{ total: totalExercises, filled: doneExercises }}
          meta={
            <div className="flex justify-between">
              <span>DAY {activeRoutine.dayNumber} / {mappedDays.length}</span>
              <span>{doneExercises}/{totalExercises} DONE</span>
            </div>
          }
        />
      )}

      {activeRoutine.description && (
        <details className="group border border-line bg-panel">
          <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between text-eyebrow uppercase text-fg-dim hover:text-fg transition-colors">
            Session brief
            <ChevronRight size={14} className="transition-transform group-open:rotate-90" />
          </summary>
          <RichText
            html={activeRoutine.description}
            className="px-4 pb-4 text-body-sm leading-relaxed text-fg-muted border-t border-line pt-3"
          />
        </details>
      )}

      {isDayCompleted && (
        <Card className="border-l-[3px] border-l-accent-fill">
          <div className="flex items-center gap-3">
            <Check size={20} className="text-accent shrink-0" />
            <div>
              <p className="text-eyebrow uppercase text-fg">Day completed</p>
              <p className="mt-1 text-body-sm text-fg-muted">Session closed out. Recover well.</p>
            </div>
          </div>
        </Card>
      )}

      {isDaySkipped && (
        <Card className="border-l-[3px] border-l-danger">
          <div className="flex items-center gap-3">
            <FastForward size={20} className="text-danger shrink-0" />
            <div>
              <p className="text-eyebrow uppercase text-fg">Day skipped</p>
              <p className="mt-1 text-body-sm text-fg-muted">This session was passed over.</p>
            </div>
          </div>
        </Card>
      )}

      {activeRoutine.isRestDay ? (
        <>
          <EmptyState
            title="Rest day"
            message="Light movement, stretching, water, food. Growth happens now, not under the bar."
          />
          <SessionActionButtons dayName={activeRoutine.dayName} currentStatus={virtualStatus} hasAnyProgress={hasAnyProgress} />
        </>
      ) : (
        <>
          <div className="flex items-baseline justify-between pt-1">
            <p className="text-eyebrow uppercase text-fg-dim">Exercises</p>
            <p className="font-mono tnum text-data-sm text-fg-dim">{totalExercises}</p>
          </div>

          <ListGroup>
            {orderedExercises.map((exercise: any, idx: number) => {
              const isExCompleted = exerciseCompletion[exercise.id];
              const meta = [
                `${exercise.sets}×${exercise.reps}`,
                exercise.targetMuscle,
                exercise.targetWeight,
                exercise.rpe && `RPE ${exercise.rpe}`,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <ListRow
                  key={exercise.id}
                  index={idx + 1}
                  title={exercise.name}
                  meta={meta}
                  state={
                    isExCompleted
                      ? "done"
                      : exercise.id === activeExerciseId
                      ? "active"
                      : "idle"
                  }
                  href={`/exercise/${exercise.id}?dayName=${encodeURIComponent(activeRoutine.dayName)}`}
                />
              );
            })}
          </ListGroup>

          <SessionActionButtons
            dayName={activeRoutine.dayName}
            currentStatus={virtualStatus || (allCompleted ? "COMPLETED" : null)}
            hasAnyProgress={hasAnyProgress}
          />
        </>
      )}
    </div>
  );
}
