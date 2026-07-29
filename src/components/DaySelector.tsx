"use client";

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

  return (
    <div className="border border-line bg-panel overflow-x-auto">
      <div className="flex w-max min-w-full">
        {days.map((routine) => {
          const isCompleted = routine.status === "COMPLETED";
          const isSkipped = routine.status === "SKIPPED";
          const isSelected = selectedDay === routine.dayNumber;

          return (
            <button
              key={routine.id}
              onClick={() => router.push(`/?day=${routine.dayNumber}`)}
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

              {/* Lime underline marks the selected day. */}
              {isSelected && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-accent-fill" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
