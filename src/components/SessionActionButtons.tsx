"use client";

import { useTransition } from "react";
import { updateSessionStatus } from "@/app/actions";
import { CheckCircle2, Loader2, FastForward } from "lucide-react";

export default function SessionActionButtons({ dayName, currentStatus, hasAnyProgress }: { dayName: string, currentStatus?: string | null, hasAnyProgress?: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusUpdate = (status: "COMPLETED" | "SKIPPED") => {
    startTransition(async () => {
      const res = await updateSessionStatus(dayName, status);

      // The dashboard picks the next unfinished day only when no ?day= is pinned in
      // the URL. Reopening the app restores the last URL, so a finished day would
      // stay in focus forever. Drop the param (without navigating away, so the
      // completed state stays visible) and the next open lands on the next day.
      if (res?.success && typeof window !== "undefined" && window.location.search) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    });
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
    </div>
  );
}
