import { getMarketplaceProfiles, getRoutineProfiles } from "@/app/actions";
import MarketplaceManager from "@/app/routines/MarketplaceManager";
import { PageTitle } from "@/components/ui";

export default async function MarketplacePage() {
  const [result, routinesResult] = await Promise.all([
    getMarketplaceProfiles(),
    getRoutineProfiles()
  ]);
  const profiles = result.success ? result.data || [] : [];
  const userRoutines = routinesResult.success ? routinesResult.data || [] : [];

  return (
    <div className="space-y-5 animate-rise">
      <PageTitle title="Marketplace" eyebrow="Community routines" />

      <MarketplaceManager initialProfiles={profiles} userRoutines={userRoutines} />
    </div>
  );
}
