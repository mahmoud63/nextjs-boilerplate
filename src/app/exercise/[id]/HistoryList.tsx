"use client";

import { Calendar } from "lucide-react";
import { describeSet, type ExerciseType, type SetLog } from "@/lib/exerciseTypes";

type ExerciseLog = { id: string; date: Date; sets: SetLog[] };

export default function HistoryList({ history, type = "WEIGHTS" }: { history: ExerciseLog[]; type?: ExerciseType }) {
  if (!history || history.length === 0) {
    return null;
  }

  const unit = type === "CARDIO" ? "rounds" : "sets";

  // Sort history by date descending
  const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4 mt-6">
      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <Calendar size={14} /> Logged Sessions
      </h3>

      <div className="space-y-3">
        {sortedHistory.map((session) => (
          <div key={session.id} className="bg-card border border-muted rounded-xl overflow-hidden shadow-sm">
            <div className="bg-muted/30 px-4 py-2 border-b border-muted flex justify-between items-center text-sm">
              <span className="font-medium text-foreground">
                {new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-md">
                {session.sets.length} {unit}
              </span>
            </div>

            <div className="p-3">
              {session.sets.length === 0 ? (
                <p className="text-xs text-muted-foreground italic px-2">No {unit} logged for this session.</p>
              ) : (
                <ul className="space-y-2">
                  {session.sets.map((set, idx) => (
                    <li key={idx} className="flex items-center justify-between text-sm px-2">
                      <span className="text-muted-foreground w-16 shrink-0">
                        {type === "CARDIO" ? "Round" : "Set"} {set.setNumber}
                      </span>
                      <span className="font-medium text-right">{describeSet(set, type)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
