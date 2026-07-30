import { cn } from "@/lib/cn";

/**
 * The loader's segmented pulse, sized to sit inline in a button.
 *
 * Replaces the spinner in every pending control, so "working" looks the same whether
 * it is a whole route booting, a day swapping, or one button saving — a rotating
 * circle was the only thing in the app still speaking a different visual language.
 *
 * `currentColor` rather than a lime token: on a primary button the bars sit on lime
 * and must read as near-black, on a secondary they sit on the surface and must read
 * as lime. Inheriting the text colour gets both right for free.
 */
export function PendingBars({
  count = 5,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("inline-flex items-stretch gap-[2px] h-3 w-6 shrink-0", className)}
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="flex-1 bg-current animate-boot-seg"
          style={{ animationDelay: `${i * 90}ms` }}
        />
      ))}
    </span>
  );
}
