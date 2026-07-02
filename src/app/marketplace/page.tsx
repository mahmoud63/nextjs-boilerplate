import { getMarketplaceProfiles, getRoutineProfiles } from "@/app/actions";
import MarketplaceManager from "@/app/routines/MarketplaceManager";

export default async function MarketplacePage() {
  const [result, routinesResult] = await Promise.all([
    getMarketplaceProfiles(),
    getRoutineProfiles()
  ]);
  const profiles = result.success ? result.data || [] : [];
  const userRoutines = routinesResult.success ? routinesResult.data || [] : [];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Marketplace</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Discover and copy routines from the community
          </p>
        </div>
      </header>

      <MarketplaceManager initialProfiles={profiles} userRoutines={userRoutines} />
    </div>
  );
}
