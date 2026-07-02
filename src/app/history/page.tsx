import { getWeightHistory, getCurrentUser, getCycleStats, getAllExercises, getWorkoutHistory, getRoutineProfiles } from "@/app/actions";
import HistoryManager from "./HistoryManager";
import { redirect } from "next/navigation";

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const logsResult = await getWeightHistory();
  const logs = logsResult.success ? logsResult.data || [] : [];

  const statsResult = await getCycleStats();
  const cycleStats = statsResult.success ? statsResult.data : { completed: 0, skipped: 0 };

  const exercisesResult = await getAllExercises();
  const exercises = exercisesResult.success ? exercisesResult.data || [] : [];

  const historyResult = await getWorkoutHistory();
  const workoutHistory = historyResult.success ? historyResult.data || [] : [];

  const profilesResult = await getRoutineProfiles();
  const profiles = profilesResult.success ? profilesResult.data || [] : [];

  return (
    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
      <HistoryManager 
        initialLogs={logs} 
        userHeight={user.height} 
        cycleStats={cycleStats!} 
        exercises={exercises} 
        workoutHistory={workoutHistory}
        profiles={profiles}
      />
    </div>
  );
}
