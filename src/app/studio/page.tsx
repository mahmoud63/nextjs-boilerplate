import { getAllRoutineDays, getAllExercises, getRoutineProfiles, getMarketplaceProfiles, getCurrentUser } from "@/app/actions";
import StudioTabs from "./StudioTabs";
import { redirect } from "next/navigation";

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ profileId?: string }> }) {
  const { profileId } = await searchParams;
  if (!profileId) redirect("/routines"); // Require a profile to edit

  const [daysResult, exercisesResult, profilesResult, marketplaceResult] = await Promise.all([
    getAllRoutineDays(profileId),
    getAllExercises(),
    getRoutineProfiles(),
    getMarketplaceProfiles()
  ]);

  const profiles = profilesResult.success ? profilesResult.data || [] : [];
  const days = daysResult.success ? daysResult.data || [] : [];
  const exercises = exercisesResult.success ? exercisesResult.data || [] : [];
  
  const marketplaceProfiles = marketplaceResult.success ? marketplaceResult.data || [] : [];
  const user = await getCurrentUser();
  const publishedProfiles = user ? marketplaceProfiles.filter((p: any) => p.ownerId === user.id) : [];

  return (
    <div className="h-full">
      <StudioTabs 
        initialDays={days} 
        initialExercises={exercises} 
        profiles={profiles} 
        currentProfileId={profileId} 
        publishedProfiles={publishedProfiles}
      />
    </div>
  );
}
