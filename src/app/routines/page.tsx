import { getAllRoutineDays, getAllExercises, getRoutineProfiles, getMarketplaceProfiles, getCurrentUser } from "@/app/actions";
import RoutinesTabs from "./RoutinesTabs";

export default async function RoutinesPage({ searchParams }: { searchParams: Promise<{ profileId?: string; tab?: string }> }) {
  const { profileId, tab } = await searchParams;

  const profilesResult = await getRoutineProfiles();
  const profiles = profilesResult.success ? profilesResult.data || [] : [];
  
  const targetProfileId = profileId || profiles.find((p: any) => p.isActive)?.id || (profiles[0]?.id);

  const daysResult = await getAllRoutineDays(targetProfileId);
  const exercisesResult = await getAllExercises();
  const marketplaceResult = await getMarketplaceProfiles();

  const days = daysResult.success ? daysResult.data || [] : [];
  const exercises = exercisesResult.success ? exercisesResult.data || [] : [];
  const marketplaceProfiles = marketplaceResult.success ? marketplaceResult.data || [] : [];
  const user = await getCurrentUser();
  const publishedProfiles = user ? marketplaceProfiles.filter((p: any) => p.ownerId === user.id) : [];

  return (
    <div className="h-full">
      <RoutinesTabs 
        initialDays={days} 
        initialExercises={exercises} 
        profiles={profiles} 
        currentProfileId={targetProfileId} 
        publishedProfiles={publishedProfiles}
        initialTab={tab}
      />
    </div>
  );
}
