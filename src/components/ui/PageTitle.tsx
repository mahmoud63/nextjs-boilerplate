import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Anton, uppercase, with a hairline underneath. The eyebrow carries the context
 * (day, cycle, count) so the title itself can stay one or two words at poster scale.
 */
export function PageTitle({
  title,
  eyebrow,
  right,
  className,
}: {
  title: string;
  eyebrow?: string;
  /** Trailing slot, e.g. a Chip or an icon button. */
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("pb-3 border-b border-line", className)}>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-eyebrow uppercase text-fg-dim">{eyebrow}</p>
          )}
          <h1 className="mt-1 font-display text-title-lg uppercase text-fg truncate">
            {title}
          </h1>
        </div>
        {right && <div className="shrink-0 pb-1">{right}</div>}
      </div>
    </div>
  );
}
