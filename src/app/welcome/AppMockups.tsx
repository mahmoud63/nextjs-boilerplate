import { Check, ChevronRight, Dumbbell, Timer } from "lucide-react";

/**
 * Hand-built recreations of the real app screens. Deliberately not screenshots:
 * they stay sharp at any size, need no image assets, and no person appears in them.
 */

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[280px] sm:w-[320px] shrink-0">
      <div className="absolute -inset-6 bg-neon-lime/10 blur-3xl rounded-full" aria-hidden />
      <div className="relative border-2 border-surface-container-high bg-surface p-3 shadow-2xl">
        <div className="flex justify-center mb-3">
          <span className="h-1 w-16 bg-surface-container-high" aria-hidden />
        </div>
        {children}
      </div>
    </div>
  );
}

const days = [1, 2, 3, 4, 5, 6, 7];

export function DayScreen() {
  return (
    <PhoneFrame>
      <div className="space-y-3">
        {/* Day selector */}
        <div className="bg-deep-charcoal border border-surface-container-high p-1.5 flex gap-1">
          {days.map((d) => (
            <div
              key={d}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 ${
                d === 4 ? "bg-neon-lime/15 ring-1 ring-neon-lime/40" : ""
              }`}
            >
              <span
                className={`font-sans text-[9px] font-bold tracking-wider ${
                  d === 4 ? "text-neon-lime" : "text-on-surface-variant/60"
                }`}
              >
                D{d}
              </span>
              <span className="mt-1 flex items-center justify-center h-2.5">
                {d < 4 ? (
                  <Check size={9} strokeWidth={4} className="text-neon-lime" />
                ) : (
                  <span className="w-1 h-1 rounded-full bg-on-surface-variant/30" />
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Day card */}
        <div className="bg-deep-charcoal border border-surface-container-high p-4">
          <h3 className="font-display text-xl uppercase text-on-surface">Legs</h3>
          <div className="mt-2 border border-surface-container-high px-3 py-1.5 flex items-center justify-between">
            <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/70">
              Session Brief
            </span>
            <ChevronRight size={11} className="text-on-surface-variant/70" />
          </div>

          <div className="mt-3 space-y-1.5">
            {[
              { n: "Goblet Squat", meta: "4 × 8-10 · RPE 7", done: true },
              { n: "Leg Press", meta: "4 × 10-12 · RPE 7-8", done: true },
              { n: "Romanian Deadlift", meta: "3 × 10 · RPE 6", done: false },
              { n: "Seated Leg Curl", meta: "3 × 10-12 · 40 kg", done: false },
              { n: "Cardio — LISS", meta: "30 min · RPE 4", done: false },
            ].map((ex, i) => (
              <div
                key={ex.n}
                className={`flex items-center gap-2.5 p-2 border ${
                  ex.done ? "border-neon-lime/25 bg-neon-lime/5" : "border-transparent bg-surface"
                }`}
              >
                <span
                  className={`w-5 h-5 flex items-center justify-center font-sans text-[9px] font-bold shrink-0 ${
                    ex.done ? "bg-neon-lime/20 text-neon-lime" : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {ex.done ? <Check size={9} strokeWidth={4} /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className={`block font-sans text-[11px] font-semibold truncate ${ex.done ? "text-neon-lime" : "text-on-surface"}`}>
                    {ex.n}
                  </span>
                  <span className="block font-sans text-[9px] text-on-surface-variant/60 truncate">{ex.meta}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

export function LoggerScreen() {
  return (
    <PhoneFrame>
      <div className="space-y-3">
        <div className="bg-deep-charcoal border border-surface-container-high p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg uppercase text-on-surface leading-tight">Plank</h3>
            <span className="font-sans text-[8px] font-bold uppercase tracking-widest text-neon-lime border border-neon-lime/40 px-1.5 py-0.5 shrink-0">
              Timed
            </span>
          </div>
          <p className="mt-2 font-sans text-[10px] text-on-surface-variant/70">
            Core (Anti-Extension) · 3 × 45 sec · RPE 8
          </p>

          <div className="mt-3 aspect-video bg-surface border border-surface-container-high flex items-center justify-center">
            <Timer size={26} className="text-neon-lime/50" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <label className="block">
              <span className="font-sans text-[8px] font-bold uppercase tracking-widest text-on-surface-variant/70">
                Minutes
              </span>
              <span className="mt-1 block bg-surface border-b-2 border-surface-container-high px-2 py-1.5 font-display text-lg text-on-surface">
                0
              </span>
            </label>
            <label className="block">
              <span className="font-sans text-[8px] font-bold uppercase tracking-widest text-on-surface-variant/70">
                Seconds
              </span>
              <span className="mt-1 block bg-surface border-b-2 border-neon-lime px-2 py-1.5 font-display text-lg text-neon-lime">
                45
              </span>
            </label>
          </div>

          <div className="mt-3 bg-neon-lime text-surface font-display text-sm uppercase text-center py-2.5">
            Log Set 2
          </div>
        </div>

        {/* Progress chart */}
        <div className="bg-deep-charcoal border border-surface-container-high p-4">
          <span className="font-sans text-[8px] font-bold uppercase tracking-widest text-on-surface-variant/70">
            Hold Time
          </span>
          <svg viewBox="0 0 200 70" className="mt-3 w-full h-16" role="img" aria-label="Progress trending upward">
            {[0, 17, 34, 51].map((y) => (
              <line key={y} x1="0" y1={y + 8} x2="200" y2={y + 8} stroke="#2a2a2a" strokeWidth="1" strokeDasharray="3 3" />
            ))}
            <polyline
              points="10,55 50,46 90,38 130,24 170,12"
              fill="none"
              stroke="#ccff00"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {[
              [10, 55], [50, 46], [90, 38], [130, 24], [170, 12],
            ].map(([cx, cy]) => (
              <circle key={`${cx}`} cx={cx} cy={cy} r="3.5" fill="#ccff00" />
            ))}
          </svg>
          <div className="flex justify-between font-sans text-[8px] text-on-surface-variant/50">
            <span>WK 1</span>
            <span>WK 5</span>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

export function TypeChips() {
  const types = [
    { label: "Weights", meta: "weight × reps", Icon: Dumbbell },
    { label: "Bodyweight", meta: "reps + added kg", Icon: Dumbbell },
    { label: "Timed", meta: "duration", Icon: Timer },
    { label: "Cardio", meta: "duration + distance", Icon: Timer },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {types.map(({ label, meta, Icon }) => (
        <div key={label} className="border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5">
          <Icon size={24} className="text-neon-lime" />
          <h3 className="mt-3 font-display text-xl uppercase text-on-surface">{label}</h3>
          <p className="mt-1 font-sans text-sm text-on-surface-variant/70">{meta}</p>
        </div>
      ))}
    </div>
  );
}
