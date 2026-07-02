"use client";

import { useRouter } from "next/navigation";
import { Check, FastForward } from "lucide-react";

export default function DaySelector({ selectedDay, defaultDay, days }: { selectedDay: number, defaultDay: number, days: any[] }) {
  const router = useRouter();

  return (
    <div className="bg-card/40 p-1.5 rounded-2xl flex items-center justify-between border border-muted shadow-inner backdrop-blur-sm">
      {days.map((routine) => {
        const isCompleted = routine.status === "COMPLETED";
        const isSkipped = routine.status === "SKIPPED";
        const isSelected = selectedDay === routine.dayNumber;

        return (
          <button
            key={routine.id}
            onClick={() => router.push(`/?day=${routine.dayNumber}`)}
            className={`relative flex flex-col items-center justify-center w-[13%] h-14 rounded-xl transition-all duration-300 ${
              isSelected 
                ? "bg-foreground/15 text-foreground shadow-sm scale-100 ring-1 ring-foreground/20" 
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground scale-95"
            }`}
          >
            <span className={`text-[11px] font-black uppercase tracking-wider ${isSelected ? 'text-foreground' : 'opacity-70'}`}>
              D{routine.dayNumber}
            </span>
            
            <div className="mt-1 flex items-center justify-center h-4">
              {isCompleted ? (
                <Check size={14} strokeWidth={4} className={isSelected ? "text-foreground" : "text-green-500/80"} />
              ) : isSkipped ? (
                <FastForward size={14} strokeWidth={3} className={isSelected ? "text-foreground" : "text-red-500/80"} />
              ) : (
                <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-foreground/80" : "bg-muted-foreground/30"}`}></div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
