"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, FastForward } from "lucide-react";

/**
 * The cycle as a strip of mono day cells — the primary way to move between days.
 *
 * Hairline-divided rather than gapped pills, so the whole cycle reads as one
 * instrument scale instead of six separate buttons.
 */
export default function DaySelector({
  selectedDay,
  days,
}: {
  selectedDay: number;
  /** Unused, kept for call-site compatibility. */
  defaultDay?: number;
  days: any[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Which cell was tapped, so the pending mark lands on that cell rather than on
  // whichever day the server still thinks is selected.
  const [tappedDay, setTappedDay] = useState<number | null>(null);

  const go = (dayNumber: number) => {
    setTappedDay(dayNumber);
    // Wrapping the push in a transition is what exposes isPending for a
    // searchParam-only navigation; router.push alone reports nothing.
    startTransition(() => router.push(`/?day=${dayNumber}`));
  };

  return (
    <div className="border border-line bg-panel overflow-x-auto">
      <div className="flex w-max min-w-full">
        {days.map((routine) => {
          const isCompleted = routine.status === "COMPLETED";
          const isSkipped = routine.status === "SKIPPED";
          const isSelected = selectedDay === routine.dayNumber;
          const isLoading = isPending && tappedDay === routine.dayNumber;

          return (
            <button
              key={routine.id}
              onClick={() => go(routine.dayNumber)}
              aria-busy={isLoading || undefined}
              aria-current={isSelected ? "true" : undefined}
              className={`relative flex-1 min-w-[54px] h-14 flex flex-col items-center justify-center gap-1
                border-r border-line last:border-r-0 transition-colors duration-[120ms] ease-kinetic ${
                  isSelected ? "bg-field" : "hover:bg-field/60"
                }`}
            >
              <span
                className={`font-mono tnum text-data-sm ${
                  isSelected ? "text-fg" : "text-fg-dim"
                }`}
              >
                D{routine.dayNumber}
              </span>

              <span className="flex items-center justify-center h-3.5">
                {isCompleted ? (
                  <Check size={13} strokeWidth={3} className="text-accent" />
                ) : isSkipped ? (
                  <FastForward size={13} strokeWidth={2.5} className="text-fg-dim" />
                ) : (
                  <span className="w-1 h-1 bg-line-strong" />
                )}
              </span>

              {/* Lime underline marks the selected day. While a day is being
                  fetched its cell shows the loader's scan instead, so the tap is
                  acknowledged on the strip itself and not only in the board below. */}
              {isLoading ? (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-line overflow-hidden">
                  <span className="absolute inset-y-0 left-0 w-1/3 bg-accent-fill animate-scan" />
                </span>
              ) : (
                isSelected && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-accent-fill" />
                )
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
