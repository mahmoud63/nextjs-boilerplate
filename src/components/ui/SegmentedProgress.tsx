import { cn } from "@/lib/cn";

/**
 * Discrete segments rather than a continuous bar — the whole point of the tracker
 * is countable increments, and a smooth bar implies partial credit for a set that
 * was either logged or not.
 *
 * The fill animation is pure CSS (`animate-seg` scales from the left), staggered by
 * index, so this stays a server component.
 */
export function SegmentedProgress({
  total,
  filled,
  animate = true,
  className,
}: {
  total: number;
  filled: number;
  animate?: boolean;
  className?: string;
}) {
  // Guard: an empty routine day would otherwise render a zero-width flex child.
  if (total <= 0) return null;

  const done = Math.max(0, Math.min(total, filled));

  return (
    <div
      className={cn("flex items-stretch gap-[3px] h-1.5", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
    >
      {Array.from({ length: total }, (_, i) => {
        const isFilled = i < done;
        return (
          <span
            key={i}
            className={cn(
              "flex-1 origin-left",
              isFilled ? "bg-accent-fill" : "bg-line",
              isFilled && animate && "animate-seg",
            )}
            style={isFilled && animate ? { animationDelay: `${i * 40}ms` } : undefined}
          />
        );
      })}
    </div>
  );
}
