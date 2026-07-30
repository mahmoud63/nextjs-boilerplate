"use client";

import { useState, useTransition, useEffect } from "react";
import { updateRoutineDay, createRoutineProfile, activateRoutineProfile, updateRoutineProfile, deleteRoutineProfile, publishToMarketplace, addRoutineDay, deleteRoutineDay, moveRoutineDay } from "@/app/actions";
import { Plus, Trash2, ArrowUp, ArrowDown, CheckCircle, Edit2, Globe, X, RefreshCw } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import AlertModal, { AlertType } from "@/components/ui/AlertModal";
import RichTextEditor from "@/components/RichTextEditor";

import { RouteLoader } from "@/components/ui";
type Day = any;
type Exercise = any;
type Profile = any;

export default function DaysManager({ 
  initialDays, 
  initialExercises, 
  profiles, 
  currentProfileId,
  publishedProfiles = [] 
}: { 
  initialDays: Day[], 
  initialExercises: Exercise[], 
  profiles: Profile[], 
  currentProfileId: string,
  publishedProfiles?: any[]
}) {
  const router = useRouter();
  const pathname = usePathname() || "/routines";
  const [isPending, startTransition] = useTransition();

  const [selectedDayId, setSelectedDayId] = useState<string>(initialDays[0]?.id || "");
  const selectedDay = initialDays.find(d => d.id === selectedDayId) || initialDays[0];
  const [dayForm, setDayForm] = useState(selectedDay || null);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishName, setPublishName] = useState("");
  const [publishDesc, setPublishDesc] = useState("");
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, title: string, message: string, type: AlertType, onConfirm?: () => void}>({
    isOpen: false, title: "", message: "", type: "info"
  });

  // When initialDays changes (navigation, save, reorder), re-sync the form from the
  // server data but stay on the day the user was editing — reordering re-renders this
  // list, and snapping back to Day 1 every time makes the arrows unusable.
  useEffect(() => {
    if (initialDays.length === 0) {
      setSelectedDayId("");
      setDayForm(null);
      return;
    }
    const stillPresent = initialDays.find(d => d.id === selectedDayId);
    const next = stillPresent || initialDays[0];
    setSelectedDayId(next.id);
    setDayForm(next);
    // selectedDayId is read to preserve it, not to re-run this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDays]);

  const currentProfile = profiles.find(p => p.id === currentProfileId) || profiles[0];
  const isCurrentActive = currentProfile?.isActive;

  const currentMarketplaceProfile = currentProfile?.publishedMarketplaceId 
    ? publishedProfiles?.find(p => p.id === currentProfile?.publishedMarketplaceId) 
    : null;
    
  const hasUnpublishedEdits = currentProfile && currentMarketplaceProfile 
    ? new Date(currentProfile.updatedAt || 0).getTime() > new Date(currentMarketplaceProfile.updatedAt || 0).getTime()
    : false;

  const [isEditingProfileName, setIsEditingProfileName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState("");

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`${pathname}?profileId=${e.target.value}`);
  };

  const handleEditProfileName = () => {
    if (!currentProfile || currentProfile.name === "Default Profile") return;
    setIsEditingProfileName(true);
    setEditingNameValue(currentProfile.name);
  };

  const handleSaveProfileName = () => {
    if (!currentProfile || !editingNameValue) return;
    startTransition(async () => {
      await updateRoutineProfile(currentProfile.id, editingNameValue);
      setIsEditingProfileName(false);
    });
  };

  const handleDeleteProfile = () => {
    if (!currentProfile || currentProfile.name === "Default Profile") return;
    setAlertConfig({
      isOpen: true,
      title: "Delete Profile?",
      message: `Are you sure you want to delete "${currentProfile.name}"? All its days will be permanently deleted.`,
      type: "warning",
      onConfirm: () => {
        startTransition(async () => {
          await deleteRoutineProfile(currentProfile.id);
          router.push(pathname);
        });
      }
    });
  };

  const handleCreateProfile = () => {
    if (!newProfileName) return;
    startTransition(async () => {
      const res = await createRoutineProfile(newProfileName);
      if (res.success && res.data) {
        setShowProfileModal(false);
        setNewProfileName("");
        router.push(`${pathname}?profileId=${res.data.id}`);
      }
    });
  };

  const handlePublishProfile = () => {
    if (!currentProfileId || !publishName) return;
    startTransition(async () => {
      const res = await publishToMarketplace(currentProfileId, publishDesc, publishName);
      if (res.success) {
        setAlertConfig({ isOpen: true, title: "Success", message: "Published to Marketplace!", type: "success" });
        setShowPublishModal(false);
      } else {
        setAlertConfig({ isOpen: true, title: "Publishing Failed", message: res.error || "An error occurred.", type: "error" });
      }
    });
  };

  const handleActivateProfile = () => {
    setAlertConfig({
      isOpen: true,
      title: "Switch Active Profile?",
      message: `Activate "${currentProfile?.name}"? This will reset your current cycle progress and all day completion states.`,
      type: "warning",
      onConfirm: () => {
        startTransition(async () => {
          await activateRoutineProfile(currentProfileId);
        });
      }
    });
  };

  const handleSaveDay = async () => {
    if (!dayForm) return;
    startTransition(async () => {
      await updateRoutineDay(dayForm.id, {
        dayName: dayForm.dayName,
        description: dayForm.description,
        isRestDay: dayForm.isRestDay,
        exerciseIds: dayForm.exerciseIds,
      });
    });
  };

  const dayIndex = initialDays.findIndex((d: Day) => d.id === selectedDayId);

  const handleMoveDay = (direction: "up" | "down") => {
    if (!dayForm) return;
    startTransition(async () => {
      const res = await moveRoutineDay(dayForm.id, direction);
      if (!res.success) {
        setAlertConfig({ isOpen: true, title: "Cannot Move Day", message: res.error || "Failed to move day.", type: "error" });
      }
    });
  };

  const handleAddDay = () => {
    if (!currentProfileId) return;
    startTransition(async () => {
      const res = await addRoutineDay(currentProfileId);
      if (!res.success) {
        setAlertConfig({ isOpen: true, title: "Cannot Add Day", message: res.error || "Failed to add day.", type: "error" });
      }
    });
  };

  const handleDeleteDay = (dayId: string, dayName: string) => {
    setAlertConfig({
      isOpen: true,
      title: "Delete Day?",
      message: `Are you sure you want to delete "${dayName}"? All its exercises will be unlinked and remaining days will be re-numbered.`,
      type: "warning",
      onConfirm: () => {
        startTransition(async () => {
          const res = await deleteRoutineDay(dayId);
          if (!res.success) {
            setAlertConfig({ isOpen: true, title: "Error", message: res.error || "Failed to delete day.", type: "error" });
          }
        });
      }
    });
  };

  const moveEx = (idx: number, direction: -1 | 1) => {
    if (!dayForm) return;
    const newIds = [...dayForm.exerciseIds];
    if (idx + direction < 0 || idx + direction >= newIds.length) return;
    
    const temp = newIds[idx];
    newIds[idx] = newIds[idx + direction];
    newIds[idx + direction] = temp;
    
    setDayForm({ ...dayForm, exerciseIds: newIds });
  };

  const toggleExerciseInDay = (exId: string) => {
    if (!dayForm) return;
    const isAttached = dayForm.exerciseIds.includes(exId);
    let newIds = [...dayForm.exerciseIds];
    if (isAttached) {
      newIds = newIds.filter(id => id !== exId);
    } else {
      newIds.push(exId);
    }
    setDayForm({ ...dayForm, exerciseIds: newIds });
  };

  return (
    <div className="space-y-6 pb-20">

      {isPending && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-[100] flex items-center justify-center">
          <RouteLoader compact label="Days" />
        </div>
      )}

      {/* PROFILE SELECTOR & CONTROLS */}
      <div className="bg-panel border border-line p-4 space-y-4">
        <div className="flex flex-col mb-2">
          <label className="text-eyebrow uppercase text-fg-dim mb-2">Workout Profile</label>
          <div className="flex gap-2">
            {!isEditingProfileName ? (
              <select 
                value={currentProfileId}
                onChange={handleProfileChange}
                className="flex-1 min-w-0 bg-background border border-line p-2 font-semibold focus:border-accent transition-colors text-ellipsis"
              >
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.isActive ? "(Active)" : ""}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={editingNameValue}
                onChange={e => setEditingNameValue(e.target.value)}
                className="flex-1 bg-background border border-accent p-2 font-semibold focus:outline-none"
                autoFocus
              />
            )}
            
            {!isEditingProfileName ? (
              <>
                <button 
                  onClick={() => setShowProfileModal(true)}
                  className="bg-field text-accent p-2 border border-line hover:bg-field transition-colors shrink-0"
                  title="Create New Profile"
                >
                  <Plus size={20} />
                </button>
                {currentProfile?.publishedMarketplaceId ? (
                  <button 
                    onClick={() => setShowPublishModal(true)}
                    disabled={!hasUnpublishedEdits}
                    className={`p-2 border transition-colors shrink-0 ${
                      hasUnpublishedEdits 
                        ? "bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20" 
                        : "bg-field text-fg-muted border-line opacity-50 cursor-not-allowed"
                    }`}
                    title={hasUnpublishedEdits ? "Republish to Marketplace" : "No new changes to republish"}
                  >
                    <RefreshCw size={20} />
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowPublishModal(true)}
                    className="bg-field text-accent p-2 border border-line hover:bg-field transition-colors shrink-0"
                    title="Share to Marketplace"
                  >
                    <Globe size={20} />
                  </button>
                )}
              </>
            ) : (
              <button 
                onClick={handleSaveProfileName}
                className="bg-accent-fill text-background px-4 font-bold transition-colors shrink-0"
              >
                Save
              </button>
            )}
          </div>
          
          {currentProfile && currentProfile.name !== "Default Profile" && !isEditingProfileName && (
            <div className="flex gap-4 mt-2">
              <button onClick={handleEditProfileName} className="text-xs text-accent font-semibold flex items-center gap-1 hover:underline"><Edit2 size={12} /> Rename Profile</button>
              <button onClick={handleDeleteProfile} className="text-xs text-danger font-semibold flex items-center gap-1 hover:underline"><Trash2 size={12} /> Delete Profile</button>
            </div>
          )}
        </div>

        {!isCurrentActive && currentProfile && (
          <div className="bg-danger-fill/20 border border-danger/30 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-danger text-sm font-semibold">
              This profile is currently inactive.
            </p>
            <button 
              onClick={handleActivateProfile}
              className="bg-danger text-background px-4 py-2 font-bold text-sm w-full sm:w-auto"
            >
              Set as Active
            </button>
          </div>
        )}

        {isCurrentActive && currentProfile && (
          <div className="bg-field border border-line p-3 flex items-center gap-2">
            <CheckCircle size={18} className="text-accent" />
            <p className="text-accent text-sm font-semibold">
              This is your currently active profile.
            </p>
          </div>
        )}
      </div>

      {dayForm && (
        <div className="space-y-6">
          <div className="flex gap-2 items-center">
            <select 
              className="flex-1 bg-panel border border-line p-3 text-fg font-semibold"
              value={selectedDayId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedDayId(id);
                setDayForm(initialDays.find(d => d.id === id));
              }}
            >
              {initialDays.map(d => (
                <option key={d.id} value={d.id}>Day {d.dayNumber}: {d.dayName}</option>
              ))}
            </select>

            {/* Reorder days */}
            {initialDays.length > 1 && (
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => handleMoveDay("up")}
                  disabled={isPending || dayIndex <= 0}
                  title="Move day earlier"
                  className="bg-panel text-fg-muted p-3 border border-line hover:text-fg hover:bg-field transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowUp size={20} />
                </button>
                <button
                  onClick={() => handleMoveDay("down")}
                  disabled={isPending || dayIndex === -1 || dayIndex >= initialDays.length - 1}
                  title="Move day later"
                  className="bg-panel text-fg-muted p-3 border border-line hover:text-fg hover:bg-field transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowDown size={20} />
                </button>
              </div>
            )}

            {/* Add Day icon button */}
            {initialDays.length < 30 && (
              <button
                onClick={handleAddDay}
                disabled={isPending}
                title="Add New Day"
                className="shrink-0 bg-field text-accent p-3 border border-line hover:bg-field transition-colors disabled:opacity-50"
              >
                <Plus size={20} />
              </button>
            )}
          </div>

          {/* Delete Day button */}
          {dayForm && initialDays.length > 1 && (
            <div className="flex justify-end">
              <button
                onClick={() => handleDeleteDay(dayForm.id, dayForm.dayName)}
                className="flex items-center gap-1.5 text-xs text-danger font-bold hover:bg-danger-fill/30/10 px-3 py-1.5 transition-colors"
              >
                <Trash2 size={14} /> Delete This Day
              </button>
            </div>
          )}

          <div className="bg-panel border border-line p-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-1 block">Day Name</label>
              <input 
                type="text" 
                value={dayForm.dayName} 
                onChange={e => setDayForm({...dayForm, dayName: e.target.value})}
                className="w-full bg-background border border-line p-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-1 block">Description</label>
              <RichTextEditor
                key={dayForm.id}
                value={dayForm.description}
                onChange={html => setDayForm((f: any) => ({ ...f, description: html }))}
                placeholder="Warm-up, block targets, cool-down…"
              />
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="isRest" 
                checked={dayForm.isRestDay} 
                onChange={e => setDayForm({...dayForm, isRestDay: e.target.checked})}
                className="w-5 h-5 accent-primary"
              />
              <label htmlFor="isRest" className="font-semibold text-sm">This is a Rest Day</label>
            </div>
          </div>

          {!dayForm.isRestDay && (
            <div className="bg-panel border border-line p-4 space-y-4">
              <h3 className="font-bold border-b border-line pb-2">Attached Exercises (Order Matters)</h3>
              
              <div className="space-y-2">
                {dayForm.exerciseIds.length === 0 && (
                  <p className="text-xs text-fg-muted text-center py-4">No exercises attached.</p>
                )}
                {dayForm.exerciseIds.map((exId: string, idx: number) => {
                  const ex = initialExercises.find((e: Exercise) => e.id === exId);
                  if (!ex) return null;
                  return (
                    <div key={exId} className="flex items-center justify-between bg-background p-2 border border-line">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-field text-accent flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                        <span className="text-sm font-medium line-clamp-1">{ex.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => moveEx(idx, -1)} disabled={idx === 0} className="p-1 text-fg-muted hover:text-fg disabled:opacity-30"><ArrowUp size={16} /></button>
                        <button onClick={() => moveEx(idx, 1)} disabled={idx === dayForm.exerciseIds.length - 1} className="p-1 text-fg-muted hover:text-fg disabled:opacity-30"><ArrowDown size={16} /></button>
                        <button onClick={() => toggleExerciseInDay(exId)} className="p-1 text-danger hover:bg-danger-fill/30/10 rounded ml-2"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6">
                <h4 className="text-eyebrow uppercase text-fg-dim mb-2">Available Exercises</h4>
                <div className="max-h-60 overflow-y-auto space-y-1 pr-2">
                  {initialExercises.filter((e: Exercise) => !dayForm.exerciseIds.includes(e.id)).map((ex: Exercise) => (
                    <div key={ex.id} className="flex items-center justify-between p-2 hover:bg-field/30 cursor-pointer" onClick={() => toggleExerciseInDay(ex.id)}>
                      <span className="text-sm">{ex.name}</span>
                      <Plus size={16} className="text-accent" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button onClick={handleSaveDay} className="w-full bg-accent-fill text-on-accent py-3 font-bold flex items-center justify-center gap-2 hover:opacity-90">
            Save Day Configuration
          </button>
        </div>
      )}

      {/* CREATE PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-panel w-full max-w-sm border border-line overflow-hidden animate-rise">
            <div className="p-4 border-b border-line font-bold text-lg">
              Create New Profile
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-fg-muted block mb-1">Profile Name</label>
                <input 
                  type="text" 
                  value={newProfileName} 
                  onChange={e => setNewProfileName(e.target.value)} 
                  placeholder="e.g. Push Pull Legs"
                  className="w-full bg-background border border-line p-3 text-sm font-semibold focus:border-accent transition-colors" 
                  autoFocus
                />
              </div>
              <p className="text-xs text-fg-muted">
                This will create 1 blank day linked to this profile. You can add more days (up to 30) and customize them afterwards.
              </p>
            </div>
            <div className="p-4 border-t border-line flex gap-3 bg-field">
              <button onClick={() => setShowProfileModal(false)} className="flex-1 py-2 font-semibold text-fg-muted hover:bg-field transition-colors">Cancel</button>
              <button onClick={handleCreateProfile} disabled={!newProfileName} className="flex-1 py-2 font-bold bg-accent-fill text-on-accent disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-rise">
          <div className="bg-panel w-full max-w-sm p-6 animate-rise duration-200 border border-line">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-fg">
                {currentProfile?.publishedMarketplaceId ? "Republish Updates" : "Publish Profile"}
              </h3>
              <button onClick={() => setShowPublishModal(false)} className="text-fg-muted hover:bg-field p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-fg-muted mb-4">
              {currentProfile?.publishedMarketplaceId 
                ? `Sync your latest changes for "${currentProfile?.name}" to the marketplace.`
                : `Share "${currentProfile?.name}" with the community. People can copy this template.`
              }
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-eyebrow uppercase text-fg-dim block mb-1">Your Display Name</label>
                <input 
                  type="text" 
                  value={publishName}
                  onChange={e => setPublishName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-background border border-line p-3 text-sm font-semibold focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="text-eyebrow uppercase text-fg-dim block mb-1">Description</label>
                <textarea 
                  value={publishDesc}
                  onChange={e => setPublishDesc(e.target.value)}
                  placeholder="e.g. A 4-day upper/lower split focused on strength."
                  className="w-full bg-background border border-line p-3 text-sm font-semibold focus:border-accent transition-colors resize-none h-24"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setShowPublishModal(false)}
                className="flex-1 py-3 bg-field text-fg-muted font-bold text-sm hover:bg-field transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handlePublishProfile}
                disabled={!publishName || isPending}
                className="flex-1 py-3 bg-accent-fill text-on-accent font-bold text-sm hover:bg-accent-dim transition-colors disabled:opacity-50"
              >
                {isPending ? "Publishing..." : "Publish"}
              </button>
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
