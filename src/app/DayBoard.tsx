import { getTodaySession, getRoutineDay } from "@/app/actions";
import { Check, ChevronRight, FastForward } from "lucide-react";
import SessionActionButtons from "@/components/SessionActionButtons";
import RichText from "@/components/RichText";
import {
  ButtonLink,
  Card,
  EmptyState,
  ListGroup,
  ListRow,
  Panel,
} from "@/components/ui";

/**
 * Everything on the dashboard that depends on which day is selected.
 *
 * Split out of page.tsx so the day strip can sit outside this boundary: the parent
 * wraps it in <Suspense key={day}>, and changing the key remounts the boundary so
 * its fallback streams while these queries run. Without the split, switching days
 * re-rendered the whole page and the user watched the previous day until the server
 * answered, with no indication anything was happening.
 */
export default async function DayBoard({
  day,
  totalDays,
}: {
  day: number;
  totalDays: number;
}) {
  const routineDayResult = await getRoutineDay(day);
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
    <div className="flex flex-col space-y-4">
      {activeRoutine.isRestDay ? (
        <Panel
          eyebrow={activeRoutine.dayName}
          value="REST"
          caption="Recovery day"
          meta={
            <div className="flex justify-between">
              <span>DAY {activeRoutine.dayNumber} / {totalDays}</span>
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
              <span>DAY {activeRoutine.dayNumber} / {totalDays}</span>
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
