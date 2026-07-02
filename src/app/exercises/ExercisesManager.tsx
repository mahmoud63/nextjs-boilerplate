"use client";

import { useState, useTransition } from "react";
import { createExercise, updateExercise, deleteExercise } from "@/app/actions";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";

type Exercise = any;

export default function ExercisesManager({ initialExercises }: { initialExercises: Exercise[] }) {
  const [isPending, startTransition] = useTransition();

  const [editingEx, setEditingEx] = useState<Exercise | null>(null);
  const [exForm, setExForm] = useState({ name: "", sets: 3, reps: "12", targetMuscle: "", rest: "60 sec", notes: "", imageUrl: "" });
  const [showExModal, setShowExModal] = useState(false);

  const handleSaveExercise = async () => {
    startTransition(async () => {
      if (editingEx) {
        await updateExercise(editingEx.id, exForm);
      } else {
        await createExercise(exForm);
      }
      setShowExModal(false);
      setEditingEx(null);
    });
  };

  const handleDeleteExercise = async (id: string) => {
    if (!confirm("Are you sure? This will remove the exercise from all days.")) return;
    startTransition(async () => {
      await deleteExercise(id);
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Exercises</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your exercise library
          </p>
        </div>
      </header>

      {isPending && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-[100] flex items-center justify-center">
          <Loader2 className="animate-spin text-primary w-10 h-10" />
        </div>
      )}

      <div className="space-y-4">
        <button 
          onClick={() => {
            setEditingEx(null);
            setExForm({ name: "", sets: 3, reps: "12", targetMuscle: "", rest: "60 sec", notes: "", imageUrl: "" });
            setShowExModal(true);
          }}
          className="w-full bg-primary/10 text-primary py-4 rounded-xl border border-primary/20 font-bold flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors"
        >
          <Plus size={18} /> Create New Exercise
        </button>

        <div className="space-y-3">
          {initialExercises.map(ex => (
            <div key={ex.id} className="bg-card border border-muted p-4 rounded-xl flex items-start justify-between group">
              <div>
                <h3 className="font-bold text-foreground">{ex.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{ex.sets} sets × {ex.reps} • {ex.targetMuscle}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setEditingEx(ex);
                    setExForm({
                      name: ex.name,
                      sets: ex.sets,
                      reps: ex.reps,
                      targetMuscle: ex.targetMuscle,
                      rest: ex.rest,
                      notes: ex.notes || "",
                      imageUrl: ex.imageUrl || ""
                    });
                    setShowExModal(true);
                  }}
                  className="p-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDeleteExercise(ex.id)}
                  className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* EXERCISE MODAL */}
        {showExModal && (
          <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex justify-center items-end sm:items-center p-4">
            <div className="bg-card w-full max-w-md rounded-2xl border border-muted shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
              <div className="p-4 border-b border-muted font-bold text-lg">
                {editingEx ? "Edit Exercise" : "New Exercise"}
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Name</label>
                  <input type="text" value={exForm.name} onChange={e => setExForm({...exForm, name: e.target.value})} className="w-full bg-background border border-muted rounded-lg p-2 text-sm" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-muted-foreground block mb-1">Sets</label>
                    <input type="number" value={exForm.sets} onChange={e => setExForm({...exForm, sets: parseInt(e.target.value) || 0})} className="w-full bg-background border border-muted rounded-lg p-2 text-sm" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-muted-foreground block mb-1">Reps</label>
                    <input type="text" value={exForm.reps} onChange={e => setExForm({...exForm, reps: e.target.value})} placeholder="e.g. 12 or 8-10" className="w-full bg-background border border-muted rounded-lg p-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Target Muscle</label>
                  <input type="text" value={exForm.targetMuscle} onChange={e => setExForm({...exForm, targetMuscle: e.target.value})} className="w-full bg-background border border-muted rounded-lg p-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Rest Time</label>
                  <input type="text" value={exForm.rest} onChange={e => setExForm({...exForm, rest: e.target.value})} className="w-full bg-background border border-muted rounded-lg p-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Notes (Optional)</label>
                  <input type="text" value={exForm.notes || ""} onChange={e => setExForm({...exForm, notes: e.target.value})} className="w-full bg-background border border-muted rounded-lg p-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Image URL (Optional)</label>
                  <input type="text" value={exForm.imageUrl || ""} onChange={e => setExForm({...exForm, imageUrl: e.target.value})} placeholder="https://example.com/image.jpg" className="w-full bg-background border border-muted rounded-lg p-2 text-sm" />
                </div>
              </div>
              <div className="p-4 border-t border-muted flex gap-3 bg-muted/20">
                <button onClick={() => setShowExModal(false)} className="flex-1 py-2 rounded-xl font-semibold text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleSaveExercise} disabled={!exForm.name || !exForm.targetMuscle} className="flex-1 py-2 rounded-xl font-bold bg-foreground text-background disabled:opacity-50">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
