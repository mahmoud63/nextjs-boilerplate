"use client";

import { describeSet, type ExerciseType, type SetLog } from "@/lib/exerciseTypes";

type ExerciseLog = { id: string; date: Date; sets: SetLog[] };

export default function HistoryList({ history, type = "WEIGHTS" }: { history: ExerciseLog[]; type?: ExerciseType }) {
  if (!history || history.length === 0) {
    return null;
  }

  const unit = type === "CARDIO" ? "rounds" : "sets";
  const rowLabel = type === "CARDIO" ? "Round" : "Set";

  // Sort history by date descending
  const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-3">
      <p className="text-eyebrow uppercase text-fg-dim">Logged sessions</p>

      <div className="space-y-2">
        {sortedHistory.map((session) => (
          <div key={session.id} className="border border-line bg-panel">
            <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-line">
              <span className="font-mono tnum text-data-sm text-fg">
                {new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="font-mono tnum text-data-sm text-fg-dim shrink-0">
                {session.sets.length} {unit}
              </span>
            </div>

            {session.sets.length === 0 ? (
              <p className="px-3 py-3 text-body-sm text-fg-dim">
                No {unit} logged for this session.
              </p>
            ) : (
              /* Hairline-divided rows so set numbers and values line up as a table
                 without the weight of an actual table element. */
              <ul>
                {session.sets.map((set, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between gap-3 px-3 py-2 border-b border-line last:border-b-0"
                  >
                    <span className="text-eyebrow uppercase text-fg-dim shrink-0">
                      {rowLabel} {set.setNumber}
                    </span>
                    <span className="font-mono tnum text-data text-fg text-right">
                      {describeSet(set, type)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
