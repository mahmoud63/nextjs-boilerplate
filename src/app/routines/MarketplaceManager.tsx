"use client";

import { useState, useTransition } from "react";
import { getMarketplaceProfiles, copyMarketplaceProfile, updateMarketplaceProfileLocalCopy } from "@/app/actions";
import { Download, Loader2, UserCircle, X, Activity, CheckCircle, RefreshCw } from "lucide-react";
import AlertModal, { AlertType } from "@/components/ui/AlertModal";
import { toPlainText } from "@/lib/html";

export default function MarketplaceManager({ initialProfiles, userRoutines }: { initialProfiles: any[], userRoutines: any[] }) {
  const [activeTab, setActiveTab] = useState<"discover" | "added">("discover");
  const [profiles, setProfiles] = useState(initialProfiles);
  const [isPending, startTransition] = useTransition();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, title: string, message: string, type: AlertType, onConfirm?: () => void}>({
    isOpen: false, title: "", message: "", type: "info"
  });

  const handleDownload = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDownloadingId(id);
    startTransition(async () => {
      const res = await copyMarketplaceProfile(id);
      if (res.success) {
        setAlertConfig({ isOpen: true, title: "Success!", message: "Profile added to your routines!", type: "success" });
      } else {
        setAlertConfig({ isOpen: true, title: "Error", message: res.error || "Failed to add profile.", type: "error" });
      }
      setDownloadingId(null);
    });
  };

  const handleUpdateLocalCopy = (marketId: string, localProfileId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setAlertConfig({
      isOpen: true,
      title: "Warning: Overwrite Local Edits?",
      message: "If you proceed, any personal changes you made to the days or exercises in this routine will be permanently overwritten by the newest marketplace version.",
      type: "warning",
      onConfirm: () => {
        setDownloadingId(marketId);
        startTransition(async () => {
          const res = await updateMarketplaceProfileLocalCopy(marketId, localProfileId);
          if (res.success) {
            setAlertConfig({ isOpen: true, title: "Updated!", message: "Your local copy has been updated to the newest marketplace version.", type: "success" });
          } else {
            setAlertConfig({ isOpen: true, title: "Error", message: res.error || "Failed to update profile.", type: "error" });
          }
          setDownloadingId(null);
        });
      }
    });
  };

  const filteredProfiles = activeTab === "discover" 
    ? profiles 
    : profiles.filter(p => userRoutines.some(ur => ur.sourceMarketplaceId === p.id));

  return (
    <div className="space-y-4">
      <div className="flex bg-muted/30 p-1.5 rounded-2xl shadow-inner border border-muted/50 mb-6">
        <button
          onClick={() => setActiveTab("discover")}
          className={`flex-1 py-2 text-sm font-black uppercase tracking-wider rounded-xl transition-all ${
            activeTab === "discover" ? "bg-background text-primary shadow-sm border border-muted" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Discover
        </button>
        <button
          onClick={() => setActiveTab("added")}
          className={`flex-1 py-2 text-sm font-black uppercase tracking-wider rounded-xl transition-all ${
            activeTab === "added" ? "bg-background text-primary shadow-sm border border-muted" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          My Added
        </button>
      </div>

      {filteredProfiles.length === 0 ? (
        <div className="text-center text-muted-foreground p-8 bg-card rounded-2xl border border-muted">
          No profiles in the marketplace yet.
        </div>
      ) : (
        profiles.map(p => (
          <div 
            key={p.id} 
            onClick={() => setSelectedProfile(p)}
            className="bg-card p-5 rounded-3xl border border-muted shadow-sm flex flex-col gap-4 relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors"
          >
            <div className="flex gap-4 items-start">
              {p.ownerPicUrl ? (
                <img src={`/api/blob?url=${encodeURIComponent(p.ownerPicUrl)}`} alt="Owner" className="w-12 h-12 rounded-full object-cover border border-muted shadow-sm bg-black" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border border-muted">
                  <UserCircle size={28} className="text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-foreground text-lg leading-tight uppercase truncate">{p.name}</h3>
                <p className="text-xs font-semibold text-muted-foreground truncate">by {p.ownerName}</p>
              </div>
            </div>
            
            {p.description && (
              <p className="text-sm text-foreground/80 font-medium bg-muted/30 p-3 rounded-xl border border-muted/50 leading-snug line-clamp-2">
                {p.description}
              </p>
            )}

            {(() => {
              const localMatch = userRoutines.find(ur => ur.sourceMarketplaceId === p.id);
              if (localMatch) {
                const marketTime = new Date(p.updatedAt).getTime();
                const localTime = new Date(localMatch.sourceMarketplaceUpdatedAt || 0).getTime();
                const needsUpdate = marketTime > localTime;

                if (needsUpdate) {
                  return (
                    <button 
                      onClick={(e) => handleUpdateLocalCopy(p.id, localMatch.id, e)}
                      disabled={isPending && downloadingId === p.id}
                      className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white p-3 rounded-xl font-bold text-sm transition-colors hover:bg-blue-600 disabled:opacity-50"
                    >
                      {isPending && downloadingId === p.id ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                      Update Available
                    </button>
                  );
                } else {
                  return (
                    <button 
                      disabled
                      className="w-full flex items-center justify-center gap-2 bg-green-500/20 text-green-600 dark:text-green-400 p-3 rounded-xl font-bold text-sm transition-colors opacity-80 cursor-not-allowed border border-green-500/30"
                    >
                      <CheckCircle size={16} />
                      Added
                    </button>
                  );
                }
              }

              return (
                <button 
                  onClick={(e) => handleDownload(p.id, e)}
                  disabled={isPending && downloadingId === p.id}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground p-3 rounded-xl font-bold text-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {isPending && downloadingId === p.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  Add to Routines
                </button>
              );
            })()}
          </div>
        ))
      )}

      {/* DETAIL MODAL */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-background z-[100] overflow-y-auto animate-in slide-in-from-bottom-full duration-300">
          <div className="p-4 md:p-8 max-w-2xl mx-auto pb-24">
            <header className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Profile Details</h2>
              <button onClick={() => setSelectedProfile(null)} className="p-2 bg-muted text-muted-foreground rounded-full">
                <X size={24} />
              </button>
            </header>

            <div className="bg-card border border-muted rounded-3xl p-6 shadow-lg space-y-6">
              <div className="flex items-center gap-4">
                {selectedProfile.ownerPicUrl ? (
                  <img src={`/api/blob?url=${encodeURIComponent(selectedProfile.ownerPicUrl)}`} alt="Owner" className="w-16 h-16 rounded-full object-cover shadow-sm bg-black border border-muted" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border border-muted">
                    <UserCircle size={32} className="text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-black text-foreground uppercase">{selectedProfile.name}</h1>
                  <p className="text-sm font-semibold text-muted-foreground">Created by {selectedProfile.ownerName}</p>
                </div>
              </div>

              {selectedProfile.description && (
                <p className="text-sm text-foreground/90 bg-muted/30 p-4 rounded-xl leading-relaxed">
                  {selectedProfile.description}
                </p>
              )}

              <div className="pt-4 border-t border-muted">
                <h3 className="font-bold text-lg mb-4 text-primary">Included Days</h3>
                <div className="space-y-4">
                  {selectedProfile.data.routineDays?.sort((a: any, b: any) => a.dayNumber - b.dayNumber).map((day: any) => (
                    <div key={day.id} className="bg-background border border-muted rounded-2xl p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-foreground">Day {day.dayNumber}: {day.dayName}</h4>
                        {day.isRestDay && <span className="bg-secondary/20 text-secondary text-xs px-2 py-1 rounded-md font-bold">Rest Day</span>}
                      </div>
                      {day.description && (
                        // Preview only — flatten another author's rich text rather than rendering their markup.
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{toPlainText(day.description)}</p>
                      )}
                      
                      {!day.isRestDay && day.exercises && day.exercises.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {day.exercises.map((ex: any) => (
                            <div key={ex.id} className="flex items-center justify-between bg-muted/40 p-2 rounded-xl text-sm">
                              <div className="flex items-center gap-2">
                                <Activity size={16} className="text-primary" />
                                <span className="font-semibold">{ex.name}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">{ex.sets}x{ex.reps}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-muted pb-safe">
              <div className="max-w-2xl mx-auto flex gap-4">
                <button 
                  onClick={() => handleDownload(selectedProfile.id)}
                  disabled={isPending && downloadingId === selectedProfile.id}
                  className="flex-1 bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isPending && downloadingId === selectedProfile.id ? (
                    <><Loader2 size={24} className="animate-spin" /> Adding to Routines...</>
                  ) : (
                    <><Download size={24} /> Add to My Routines</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false, onConfirm: undefined }))}
        onConfirm={alertConfig.onConfirm}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
}
