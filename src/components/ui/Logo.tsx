import { cn } from "@/lib/cn";

/* The head and its features, shared by both treatments below. */
const HEAD =
  "32,56 23,50 17,38 14,24 17,8 25,17 32,14 39,17 47,8 50,24 47,38 41,50";
const EYE_L = "22,30 29.5,32 23,35.5";
const EYE_R = "42,30 34.5,32 41,35.5";

/**
 * "Phantom Panther": a black panther head you mostly infer — lime rim light
 * tracing the skull, two burning eyes, everything else shadow.
 *
 * Full treatment (gradient rim, blurred eye glow) renders here in the browser.
 * app/icon.tsx and app/apple-icon.tsx restate this geometry without the blur
 * filter — resvg support for it is uneven — baking the glow as layered shapes
 * instead. Change the geometry in one place, change it in all three.
 */
export function Logo({
  size = 32,
  className,
  /** Silhouette in currentColor — for monochrome contexts. */
  mono = false,
}: {
  size?: number;
  className?: string;
  mono?: boolean;
}) {
  if (mono) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        role="img"
        aria-label="Beast Tracker"
        className={cn("shrink-0", className)}
      >
        <polygon points={HEAD} fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Beast Tracker"
      className={cn("shrink-0", className)}
    >
      <defs>
        {/* Rim light: lime at the crown, falling to nothing at the jaw. */}
        <linearGradient id="bt-rim" x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#ccff00" />
          <stop offset="0.55" stopColor="#ccff00" stopOpacity="0.25" />
          <stop offset="1" stopColor="#ccff00" stopOpacity="0" />
        </linearGradient>
        <filter id="bt-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <polygon points={HEAD} fill="#161616" />
      <polygon
        points={HEAD}
        fill="none"
        stroke="url(#bt-rim)"
        strokeWidth="1.8"
        strokeLinejoin="bevel"
      />

      <g filter="url(#bt-glow)">
        <polygon points={EYE_L} fill="#ccff00" />
        <polygon points={EYE_R} fill="#ccff00" />
      </g>

      {/* Nose: a shade above the coat, so the face reads at large sizes. */}
      <polygon points="32,44 34.6,47 32,50 29.4,47" fill="#2c2c2c" />
    </svg>
  );
}

/** Mark plus the wordmark, for the splash and the login screen. */
export function LogoLockup({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Logo size={size} />
      <span className="font-display text-title-md uppercase text-fg leading-none">
        Beast
        <br />
        Tracker
      </span>
    </div>
  );
}
