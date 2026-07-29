import { cn } from "@/lib/cn";

/** Hairline rule, optionally broken by a centred uppercase label. */
export function Divider({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  if (!label) {
    return <hr className={cn("h-px border-0 bg-line", className)} />;
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="h-px flex-1 bg-line" />
      <span className="text-eyebrow uppercase text-fg-dim">{label}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
