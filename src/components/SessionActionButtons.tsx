"use client";

import { useTransition } from "react";
import { updateSessionStatus, resetDayProgress } from "@/app/actions";
import { CheckCircle2, Loader2, FastForward, RotateCcw } from "lucide-react";

export default function SessionActionButtons({ dayName, currentStatus, hasAnyProgress }: { dayName: string, currentStatus?: string | null, hasAnyProgress?: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusUpdate = (status: "COMPLETED" | "SKIPPED") => {
    startTransition(async () => {
      await updateSessionStatus(dayName, status);
    });
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all progress for this day? This will delete all sets you've logged today.")) {
      startTransition(async () => {
        await resetDayProgress(dayName);
      });
    }
  };

  const isCompleted = currentStatus === "COMPLETED";
  const isSkipped = currentStatus === "SKIPPED";
  const isDisabled = isPending || isCompleted || isSkipped;

  return (
    <div className="mt-6 flex flex-col gap-3">
      <button
        onClick={() => handleStatusUpdate("COMPLETED")}
        disabled={isDisabled}
        className={`w-full flex items-center justify-center gap-2 font-bold rounded-xl p-3 transition-all ${
          isCompleted 
            ? "bg-primary text-primary-foreground border border-primary opacity-50 cursor-not-allowed" 
            : "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 active:scale-[0.98] disabled:opacity-50"
        }`}
      >
        {isPending ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
        {isPending ? "Updating..." : isCompleted ? "Completed" : "Mark Day Complete"}
      </button>

      <button
        onClick={() => handleStatusUpdate("SKIPPED")}
        disabled={isDisabled}
        className={`w-full flex items-center justify-center gap-2 font-bold rounded-xl p-3 transition-all ${
          isSkipped
            ? "bg-red-500/20 text-red-500 border border-red-500 opacity-50 cursor-not-allowed"
            : "bg-muted/30 text-muted-foreground border border-muted hover:bg-muted/50 active:scale-[0.98] disabled:opacity-50"
        }`}
      >
        {isPending ? <Loader2 size={20} className="animate-spin" /> : <FastForward size={20} />}
        {isPending ? "Updating..." : isSkipped ? "Skipped" : "Skip Day"}
      </button>

      {hasAnyProgress && (
        <button
          onClick={handleReset}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 font-bold rounded-xl p-3 transition-all text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 active:scale-[0.98] disabled:opacity-50 mt-2"
        >
          {isPending ? <Loader2 size={20} className="animate-spin" /> : <RotateCcw size={20} />}
          Reset Day Progress
        </button>
      )}
    </div>
  );
}
