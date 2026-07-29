"use client";

import { cn } from "@/lib/cn";

export type TabItem<T extends string> = { value: T; label: string };

/**
 * Underline tabs. The pill-in-a-tray pattern this replaces needed a radius and an
 * inner shadow to read as a control — neither exists in this system, so selection is
 * carried by a lime rule on the shared baseline instead.
 */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: ReadonlyArray<TabItem<T>>;
  value: T;
  onChange: (next: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex border-b border-line", className)} role="tablist">
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.value)}
            className={cn(
              "relative flex-1 min-h-[44px] px-2 pb-2.5 pt-3 text-eyebrow uppercase transition-colors duration-[120ms] ease-kinetic",
              isActive ? "text-fg" : "text-fg-dim hover:text-fg-muted",
            )}
          >
            {item.label}
            {isActive && (
              /* Sits on the container's border so the rule replaces it rather than
                 stacking a second line under it. */
              <span className="absolute -bottom-px inset-x-0 h-0.5 bg-accent-fill" />
            )}
          </button>
        );
      })}
    </div>
  );
}
