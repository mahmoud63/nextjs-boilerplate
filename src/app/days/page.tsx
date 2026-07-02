import { getAllRoutineDays, getAllExercises, getRoutineProfiles } from "@/app/actions";
import DaysManager from "./DaysManager";

export default async function DaysPage({ searchParams }: { searchParams: Promise<{ profileId?: string }> }) {
  const { profileId } = await searchParams;

  const profilesResult = await getRoutineProfiles();
  const profiles = profilesResult.success ? profilesResult.data || [] : [];
  
  const targetProfileId = profileId || profiles.find((p: any) => p.isActive)?.id || (profiles[0]?.id);

  const daysResult = await getAllRoutineDays(targetProfileId);
  const exercisesResult = await getAllExercises();

  const days = daysResult.success ? daysResult.data || [] : [];
  const exercises = exercisesResult.success ? exercisesResult.data || [] : [];

  return (
    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
      <DaysManager initialDays={days} initialExercises={exercises} profiles={profiles} currentProfileId={targetProfileId} />
    </div>
  );
}
