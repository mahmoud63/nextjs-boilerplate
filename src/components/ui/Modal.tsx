"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ModalTone = "default" | "danger";

/**
 * One dialog shell for the whole app. AlertModal and ConfirmModal are thin wrappers
 * over this, so the chrome, escape handling, and scroll lock only exist once.
 *
 * Rendered in place rather than through a portal — it is `position: fixed` at a high
 * z-index, which is enough here, and it keeps the tree free of hydration guards.
 */
export function Modal({
  open,
  onClose,
  title,
  tone = "default",
  icon,
  footer,
  dismissible = true,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  tone?: ModalTone;
  icon?: ReactNode;
  footer?: ReactNode;
  /** Set false for a blocking dialog: no escape key, no backdrop click, no X. */
  dismissible?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    // Without this the page behind keeps scrolling under the dialog on iOS.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) onClose();
    };
    document.addEventListener("keydown", onKey);

    // Move focus in so the escape handler and tab order start inside the dialog.
    panel.current?.focus();

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, dismissible, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={dismissible ? onClose : undefined}
    >
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        // The backdrop closes on click; the panel must not bubble into it.
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full max-w-sm bg-panel-raised border border-line-strong",
          "animate-rise focus:outline-none",
          className,
        )}
      >
        {/* 2px top rule: the only colour in the dialog, and it states the stakes. */}
        <span
          className={cn(
            "absolute inset-x-0 top-0 h-0.5",
            tone === "danger" ? "bg-danger" : "bg-accent-fill",
          )}
        />

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {icon}
              <h2 className="font-display text-title-md uppercase text-fg truncate">
                {title}
              </h2>
            </div>
            {dismissible && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 -mr-1 -mt-1 p-2 text-fg-dim hover:text-fg hover:bg-field transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {children && <div className="mt-4 text-body text-fg-muted">{children}</div>}
        </div>

        {footer && (
          <div className="flex gap-2 p-5 pt-0 [&>*]:flex-1">{footer}</div>
        )}
      </div>
    </div>
  );
}
