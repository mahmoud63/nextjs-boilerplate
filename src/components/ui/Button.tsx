import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { PendingBars } from "./PendingBars";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

/* Lime is the one-per-viewport signal, so only `primary` may use it. Everything
   else is monochrome and earns emphasis from weight and borders instead. */
const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-fill text-on-accent border border-accent-fill hover:bg-accent-dim hover:border-accent-dim",
  secondary:
    "bg-transparent text-fg border border-line-strong hover:border-accent hover:text-accent",
  ghost:
    "bg-transparent text-fg-muted border border-transparent hover:bg-field hover:text-fg",
  /* Filling with --danger would put light pink on light pink in dark mode; the
     outline plus a tinted hover reads correctly in both themes. */
  danger:
    "bg-transparent text-danger border border-danger/60 hover:bg-danger-fill hover:border-danger",
};

/* Heights are the touch-target floor: md/lg clear 44px. */
const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-[11px] tracking-[0.14em]",
  md: "h-11 px-4 text-[12px] tracking-[0.12em]",
  lg: "h-14 px-6 text-[14px] tracking-[0.1em]",
};

const BASE =
  "inline-flex items-center justify-center gap-2 font-sans font-bold uppercase " +
  "select-none transition-[background-color,border-color,color,transform] duration-[120ms] " +
  "ease-kinetic active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

function classesFor(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  className?: string,
) {
  return cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className);
}

type SharedProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
};

export type ButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Swaps the leading icon for a spinner and blocks input. */
    loading?: boolean;
  };

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  iconRight,
  loading = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={classesFor(variant, size, fullWidth, className)}
    >
      {loading ? <PendingBars /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
}

/** Same skin on a next/link, for the many places a nav target is styled as a CTA. */
export type ButtonLinkProps = SharedProps & ComponentProps<typeof Link>;

export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  iconRight,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link {...rest} className={classesFor(variant, size, fullWidth, className)}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}
