"use client";

import { useState, useTransition, useEffect } from "react";
import { updateRoutineDay, createRoutineProfile, activateRoutineProfile, updateRoutineProfile, deleteRoutineProfile } from "@/app/actions";
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, CheckCircle, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Day = any;
type Exercise = any;
type Profile = any;

export default function DaysManager({ 
  initialDays, 
  initialExercises, 
  profiles, 
  currentProfileId 
}: { 
  initialDays: Day[], 
  initialExercises: Exercise[], 
  profiles: Profile[], 
  currentProfileId: string 
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedDayId, setSelectedDayId] = useState<string>(initialDays[0]?.id || "");
  const selectedDay = initialDays.find(d => d.id === selectedDayId) || initialDays[0];
  const [dayForm, setDayForm] = useState(selectedDay || null);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  // When initialDays changes (e.g. via navigation), reset the selected day
  useEffect(() => {
    if (initialDays.length > 0) {
      setSelectedDayId(initialDays[0].id);
      setDayForm(initialDays[0]);
    } else {
      setSelectedDayId("");
      setDayForm(null);
    }
  }, [initialDays]);

  const currentProfile = profiles.find(p => p.id === currentProfileId);
  const isCurrentActive = currentProfile?.isActive;

  const [isEditingProfileName, setIsEditingProfileName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState("");

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/days?profileId=${e.target.value}`);
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
    if (!confirm(`Are you sure you want to delete profile "${currentProfile.name}"? All its days will be permanently deleted.`)) return;
    startTransition(async () => {
      await deleteRoutineProfile(currentProfile.id);
      router.push("/days");
    });
  };

  const handleCreateProfile = () => {
    if (!newProfileName) return;
    startTransition(async () => {
      const res = await createRoutineProfile(newProfileName);
      if (res.success && res.data) {
        setShowProfileModal(false);
        setNewProfileName("");
        router.push(`/days?profileId=${res.data.id}`);
      }
    });
  };

  const handleActivateProfile = () => {
    if (!confirm(`Are you sure you want to activate ${currentProfile?.name}? This will reset your current cycle progress!`)) return;
    startTransition(async () => {
      await activateRoutineProfile(currentProfileId);
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
      <header className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Days</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Configure your routine days
          </p>
        </div>
      </header>

      {isPending && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-[100] flex items-center justify-center">
          <Loader2 className="animate-spin text-primary w-10 h-10" />
        </div>
      )}

      {/* PROFILE SELECTOR & CONTROLS */}
      <div className="bg-card border border-muted p-4 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col mb-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Workout Profile</label>
          <div className="flex gap-2">
            {!isEditingProfileName ? (
              <select 
                value={currentProfileId}
                onChange={handleProfileChange}
                className="flex-1 bg-background border border-muted rounded-xl p-2 font-semibold focus:border-primary transition-colors"
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
                className="flex-1 bg-background border border-primary rounded-xl p-2 font-semibold focus:outline-none"
                autoFocus
              />
            )}
            
            {!isEditingProfileName ? (
              <button 
                onClick={() => setShowProfileModal(true)}
                className="bg-primary/10 text-primary p-2 rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors shrink-0"
                title="Create New Profile"
              >
                <Plus size={20} />
              </button>
            ) : (
              <button 
                onClick={handleSaveProfileName}
                className="bg-primary text-background px-4 rounded-xl font-bold transition-colors shrink-0"
              >
                Save
              </button>
            )}
          </div>
          
          {currentProfile && currentProfile.name !== "Default Profile" && !isEditingProfileName && (
            <div className="flex gap-4 mt-2">
              <button onClick={handleEditProfileName} className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"><Edit2 size={12} /> Rename Profile</button>
              <button onClick={handleDeleteProfile} className="text-xs text-red-500 font-semibold flex items-center gap-1 hover:underline"><Trash2 size={12} /> Delete Profile</button>
            </div>
          )}
        </div>

        {!isCurrentActive && currentProfile && (
          <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-orange-500 text-sm font-semibold">
              This profile is currently inactive.
            </p>
            <button 
              onClick={handleActivateProfile}
              className="bg-orange-500 text-background px-4 py-2 rounded-lg font-bold text-sm w-full sm:w-auto"
            >
              Set as Active
            </button>
          </div>
        )}

        {isCurrentActive && currentProfile && (
          <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" />
            <p className="text-green-500 text-sm font-semibold">
              This is your currently active profile.
            </p>
          </div>
        )}
      </div>

      {dayForm && (
        <div className="space-y-6">
          <select 
            className="w-full bg-card border border-muted rounded-xl p-3 text-foreground font-semibold"
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

          <div className="bg-card border border-muted rounded-xl p-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Day Name</label>
              <input 
                type="text" 
                value={dayForm.dayName} 
                onChange={e => setDayForm({...dayForm, dayName: e.target.value})}
                className="w-full bg-background border border-muted rounded-lg p-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Description</label>
              <textarea 
                value={dayForm.description} 
                onChange={e => setDayForm({...dayForm, description: e.target.value})}
                className="w-full bg-background border border-muted rounded-lg p-2 text-sm h-20"
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
            <div className="bg-card border border-muted rounded-xl p-4 space-y-4">
              <h3 className="font-bold border-b border-muted pb-2">Attached Exercises (Order Matters)</h3>
              
              <div className="space-y-2">
                {dayForm.exerciseIds.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No exercises attached.</p>
                )}
                {dayForm.exerciseIds.map((exId: string, idx: number) => {
                  const ex = initialExercises.find((e: Exercise) => e.id === exId);
                  if (!ex) return null;
                  return (
                    <div key={exId} className="flex items-center justify-between bg-background p-2 rounded-lg border border-muted">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                        <span className="text-sm font-medium line-clamp-1">{ex.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => moveEx(idx, -1)} disabled={idx === 0} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowUp size={16} /></button>
                        <button onClick={() => moveEx(idx, 1)} disabled={idx === dayForm.exerciseIds.length - 1} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowDown size={16} /></button>
                        <button onClick={() => toggleExerciseInDay(exId)} className="p-1 text-red-500 hover:bg-red-500/10 rounded ml-2"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Available Exercises</h4>
                <div className="max-h-60 overflow-y-auto space-y-1 pr-2">
                  {initialExercises.filter((e: Exercise) => !dayForm.exerciseIds.includes(e.id)).map((ex: Exercise) => (
                    <div key={ex.id} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg cursor-pointer" onClick={() => toggleExerciseInDay(ex.id)}>
                      <span className="text-sm">{ex.name}</span>
                      <Plus size={16} className="text-primary" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button onClick={handleSaveDay} className="w-full bg-foreground text-background py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90">
            Save Day Configuration
          </button>
        </div>
      )}

      {/* CREATE PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-muted shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-muted font-bold text-lg">
              Create New Profile
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Profile Name</label>
                <input 
                  type="text" 
                  value={newProfileName} 
                  onChange={e => setNewProfileName(e.target.value)} 
                  placeholder="e.g. Push Pull Legs"
                  className="w-full bg-background border border-muted rounded-lg p-3 text-sm font-semibold focus:border-primary transition-colors" 
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This will generate 7 blank routine days linked to this profile. You can customize them afterwards.
              </p>
            </div>
            <div className="p-4 border-t border-muted flex gap-3 bg-muted/20">
              <button onClick={() => setShowProfileModal(false)} className="flex-1 py-2 rounded-xl font-semibold text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleCreateProfile} disabled={!newProfileName} className="flex-1 py-2 rounded-xl font-bold bg-foreground text-background disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
