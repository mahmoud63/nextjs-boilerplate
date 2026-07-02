"use client";

import { useState, useTransition } from "react";
import { logSet } from "@/app/actions";
import { Plus, Check, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SetLogger({ 
  exerciseId, 
  exerciseName, 
  dayName, 
  nextSetNumber,
  targetSets,
  nextExerciseId
}: { 
  exerciseId: string, 
  exerciseName: string, 
  dayName: string, 
  nextSetNumber: number,
  targetSets: number,
  nextExerciseId: string | null
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [setNumber, setSetNumber] = useState(nextSetNumber);
  const [weight, setWeight] = useState<string>("");
  const [reps, setReps] = useState<string>("");
  const [showExtraForm, setShowExtraForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !reps) return;

    startTransition(async () => {
      const res = await logSet({
        exerciseId,
        exerciseName,
        dayName,
        setNumber,
        weight: parseFloat(weight),
        reps: parseInt(reps),
      });

      if (res.success) {
        setSuccess(true);
        setSetNumber(prev => prev + 1);
        setShowExtraForm(false);
        setTimeout(() => setSuccess(false), 2000);
      }
    });
  };

  const handleNextExercise = () => {
    if (nextExerciseId) {
      router.push(`/exercise/${nextExerciseId}?dayName=${encodeURIComponent(dayName)}`);
    } else {
      router.push('/');
    }
  };

  const isCompleted = setNumber > targetSets;
  const isOneExtraDone = setNumber > targetSets + 1;

  if (isCompleted && !showExtraForm) {
    return (
      <div className="bg-card border border-muted rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-2">
          <CheckCircle2 size={24} />
        </div>
        <h3 className="text-xl font-bold">Target Sets Reached!</h3>
        <p className="text-sm text-muted-foreground mb-4">Great job! You've finished the required sets for this exercise.</p>
        
        <div className="w-full space-y-3">
          <button 
            onClick={handleNextExercise}
            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all"
          >
            {nextExerciseId ? "Go to Next Exercise" : "Finish & Go to Dashboard"} <ArrowRight size={18} />
          </button>
          
          {!isOneExtraDone && (
            <button 
              onClick={() => setShowExtraForm(true)}
              className="w-full bg-background border border-muted text-muted-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-muted/50 transition-all"
            >
              <Plus size={18} /> Add 1 Extra Set
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">
        {showExtraForm ? "Log Extra Set" : "Log Set"}
      </h2>
      <form onSubmit={handleSubmit} className="bg-card border border-muted rounded-2xl p-4 shadow-lg space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Weight (kg)</label>
            <input 
              type="number" 
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0"
              className="w-full bg-background border border-muted rounded-xl p-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              required
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reps</label>
            <input 
              type="number" 
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="0"
              className="w-full bg-background border border-muted rounded-xl p-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              required
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={isPending || !weight || !reps}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold rounded-xl p-3 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {isPending ? <Loader2 size={20} className="animate-spin" /> : success ? <Check size={20} /> : <Plus size={20} />}
          {isPending ? "Saving..." : success ? "Saved!" : showExtraForm ? "Log Extra Set" : `Log Set ${setNumber}`}
        </button>
      </form>
    </div>
  );
}
