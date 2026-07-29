import Link from "next/link";
import { Check, ChevronRight, FastForward } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SegmentedProgress } from "./SegmentedProgress";

export type RowState = "idle" | "active" | "done" | "skipped";

/**
 * The workhorse row: exercises, routine days, history entries, marketplace items.
 *
 * Layout is fixed on purpose — mono index, uppercase title, mono meta line, status
 * on the right — so a user scanning mid-set finds the same information in the same
 * place on every screen.
 */
export type ListRowProps = {
  title: string;
  /** 1-based position. Rendered zero-padded in dim mono, e.g. `01`. */
  index?: number;
  /** Technical line under the title. Mono, tabular — targets, weights, dates. */
  meta?: ReactNode;
  /** Right-hand slot. Falls back to a status icon or chevron. */
  right?: ReactNode;
  state?: RowState;
  progress?: { total: number; filled: number };
  href?: string;
  onClick?: () => void;
  className?: string;
};

const STATE_SHELL: Record<RowState, string> = {
  idle: "bg-panel border-line",
  /* The only row allowed to glow. Left edge thickens to lime so the active item is
     findable from a peripheral glance while holding a bar. */
  active: "bg-panel border-accent border-l-[3px] border-l-accent-fill animate-breathe",
  done: "bg-panel border-line opacity-55",
  skipped: "bg-panel border-line opacity-45",
};

function StatusIcon({ state }: { state: RowState }) {
  if (state === "done") return <Check size={18} className="text-accent" />;
  if (state === "skipped") return <FastForward size={18} className="text-fg-dim" />;
  return <ChevronRight size={18} className="text-fg-dim" />;
}

function Inner({ title, index, meta, right, state, progress }: ListRowProps) {
  const s = state ?? "idle";

  return (
    <>
      <div className="flex items-center gap-3">
        {index !== undefined && (
          <span className="font-mono tnum text-data-sm text-fg-dim shrink-0">
            {String(index).padStart(2, "0")}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-sans font-bold uppercase text-body tracking-[0.04em] truncate",
              s === "active" ? "text-fg" : "text-fg",
            )}
          >
            {title}
          </p>
          {meta && (
            <p className="mt-0.5 font-mono tnum text-data-sm text-fg-muted truncate">
              {meta}
            </p>
          )}
        </div>

        <span className="shrink-0 flex items-center gap-2">
          {right ?? <StatusIcon state={s} />}
        </span>
      </div>

      {progress && (
        <SegmentedProgress
          total={progress.total}
          filled={progress.filled}
          className="mt-3"
        />
      )}
    </>
  );
}

export function ListRow(props: ListRowProps) {
  const { href, onClick, className, state } = props;

  const shell = cn(
    "block w-full text-left border p-3 min-h-[56px] transition-colors duration-200 ease-kinetic",
    STATE_SHELL[state ?? "idle"],
    (href || onClick) && "hover:border-line-strong",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={shell}>
        <Inner {...props} />
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={shell}>
        <Inner {...props} />
      </button>
    );
  }

  return (
    <div className={shell}>
      <Inner {...props} />
    </div>
  );
}

/** Vertical rhythm for a stack of rows. */
export function ListGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}
