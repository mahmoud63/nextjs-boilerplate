import { cn } from "@/lib/cn";

/**
 * Sharp block with a shimmer sweep. Sized by the caller so the placeholder occupies
 * the same box as the content it stands in for and nothing shifts on load.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "bg-field animate-shimmer bg-[length:200%_100%]",
        "bg-[linear-gradient(90deg,transparent_0%,color-mix(in_srgb,var(--fg)_8%,transparent)_50%,transparent_100%)]",
        className,
      )}
    />
  );
}

/** Matches the ListRow box, for lists that stream in. */
export function SkeletonRow() {
  return (
    <div className="border border-line bg-panel p-3 min-h-[56px] flex items-center gap-3">
      <Skeleton className="h-3 w-5" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}
