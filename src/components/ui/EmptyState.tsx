import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Dashed hairline frame — the "nothing here yet" state reads as an empty slot in the
 * system rather than as a broken card.
 */
export function EmptyState({
  title,
  message,
  icon: Icon,
  action,
  className,
}: {
  title: string;
  message?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border border-dashed border-line-strong p-8 flex flex-col items-center text-center",
        className,
      )}
    >
      {Icon && <Icon size={28} className="text-fg-dim mb-3" strokeWidth={1.5} />}
      <p className="text-eyebrow uppercase text-fg">{title}</p>
      {message && (
        <p className="mt-2 text-body-sm text-fg-muted max-w-[36ch]">{message}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
