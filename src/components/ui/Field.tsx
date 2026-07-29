import { ChevronDown } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/* Bottom-only border: with sharp corners a full box reads as another card and the
   form turns into a stack of nested rectangles. A single 2px rule that turns lime
   on focus is the whole affordance. */
const CONTROL =
  "w-full bg-field border-0 border-b-2 border-line-strong px-3 py-2.5 text-fg " +
  "placeholder:text-fg-dim transition-colors duration-[120ms] ease-kinetic " +
  "focus:border-accent focus:outline-none focus-visible:outline-none " +
  "disabled:opacity-40";

function Label({ children }: { children: ReactNode }) {
  return (
    <span className="block mb-1.5 text-eyebrow uppercase text-fg-dim">{children}</span>
  );
}

function Hint({ error, hint }: { error?: string; hint?: string }) {
  if (!error && !hint) return null;
  return (
    <span
      className={cn(
        "block mt-1.5 text-body-sm",
        error ? "text-danger" : "text-fg-dim",
      )}
    >
      {error || hint}
    </span>
  );
}

export type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  /** Renders the value in tabular mono at display size — weights, reps, durations. */
  numeric?: boolean;
  /** Static text pinned to the right of the control, e.g. "KG". */
  suffix?: string;
  wrapperClassName?: string;
};

/**
 * Wraps the control in its own <label> rather than pairing via id, so this stays a
 * server component (no `useId`) and every call site gets the association for free.
 */
export function Field({
  label,
  hint,
  error,
  numeric = false,
  suffix,
  wrapperClassName,
  className,
  ...rest
}: FieldProps) {
  return (
    <label className={cn("block", wrapperClassName)}>
      <Label>{label}</Label>
      <span className="relative block">
        <input
          {...rest}
          className={cn(
            CONTROL,
            numeric ? "font-mono tnum text-[20px] leading-7" : "text-body",
            error && "border-danger",
            suffix && "pr-12",
            className,
          )}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-eyebrow uppercase text-fg-dim">
            {suffix}
          </span>
        )}
      </span>
      <Hint error={error} hint={hint} />
    </label>
  );
}

export type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
};

export function SelectField({
  label,
  hint,
  error,
  wrapperClassName,
  className,
  children,
  ...rest
}: SelectFieldProps) {
  return (
    <label className={cn("block", wrapperClassName)}>
      <Label>{label}</Label>
      <span className="relative block">
        <select
          {...rest}
          className={cn(
            CONTROL,
            "text-body appearance-none pr-9",
            error && "border-danger",
            className,
          )}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-dim"
        />
      </span>
      <Hint error={error} hint={hint} />
    </label>
  );
}
