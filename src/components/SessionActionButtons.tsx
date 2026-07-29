"use client";

import { useTransition } from "react";
import { updateSessionStatus } from "@/app/actions";
import { Check, FastForward } from "lucide-react";
import { Button } from "@/components/ui";

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

  /* Both actions stay monochrome. The active exercise row above already spends the
     screen's lime, and two lime CTAs would flatten the hierarchy it creates. */
  return (
    <div className="mt-2 flex flex-col gap-2">
      <Button
        variant="secondary"
        size="lg"
        fullWidth
        onClick={() => handleStatusUpdate("COMPLETED")}
        disabled={isDisabled}
        loading={isPending}
        icon={<Check size={18} />}
      >
        {isPending ? "Updating" : isCompleted ? "Completed" : "Mark day complete"}
      </Button>

      <Button
        variant="ghost"
        size="md"
        fullWidth
        onClick={() => handleStatusUpdate("SKIPPED")}
        disabled={isDisabled}
        loading={isPending}
        icon={<FastForward size={16} />}
      >
        {isPending ? "Updating" : isSkipped ? "Skipped" : "Skip day"}
      </Button>
    </div>
  );
}
