// Beast Tracker Main Dashboard Component
import { Suspense } from "react";
import { getAllRoutineDays, getAllCycleSessions } from "@/app/actions";
import DaySelector from "@/components/DaySelector";
import ResetCycleButton from "@/components/ResetCycleButton";
import DayBoard from "./DayBoard";
import { RouteLoader } from "@/components/ui";

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

  return (
    <div className="flex flex-col space-y-4 animate-rise">
      <div className="flex items-center justify-between">
        <p className="text-eyebrow uppercase text-fg-dim">Training cycle</p>
        <ResetCycleButton />
      </div>

      {/* Outside the boundary below, so the strip stays visible and tappable while a
          day loads — switching again mid-load should not have to wait. */}
      <DaySelector selectedDay={selectedDay} defaultDay={defaultMappedDay} days={mappedDays} />

      {/* key resets the boundary on every day change, which is what makes the
          fallback appear; without it React reuses the mounted subtree and the
          previous day just sits there until the new data lands. */}
      <Suspense
        key={selectedDay}
        fallback={<RouteLoader compact label={`Day ${selectedDay}`} />}
      >
        <DayBoard day={selectedDay} totalDays={mappedDays.length} />
      </Suspense>
    </div>
  );
}
