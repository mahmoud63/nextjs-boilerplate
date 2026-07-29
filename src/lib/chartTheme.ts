/**
 * Shared recharts styling for the "Kinetic Intensity" system.
 *
 * HistoryChart, ExerciseChart, and the history screen each hand-rolled their own
 * axis/grid/tooltip styling and had already drifted apart. Spreading these props
 * keeps them identical and means a token change lands everywhere at once.
 *
 * Values are `var(--…)` strings on purpose: recharts writes them straight into SVG
 * presentation attributes, where custom properties resolve against the live theme,
 * so charts follow the light/dark toggle with no JS.
 */

import type { CSSProperties } from "react";

export const CHART_COLORS = {
  /** Series stroke/fill. Text-safe in both themes, unlike raw lime. */
  accent: "var(--accent)",
  accentDim: "var(--accent-dim)",
  grid: "var(--line)",
  axis: "var(--fg-dim)",
  fg: "var(--fg)",
  fgMuted: "var(--fg-muted)",
  panel: "var(--panel-raised)",
  line: "var(--line-strong)",
} as const;

/** Mono, so tick labels line up column-wise and don't reflow as values change. */
const TICK_FONT = {
  fontFamily: "var(--font-mono), ui-monospace, monospace",
  fontSize: 11,
  fontVariantNumeric: "tabular-nums",
} satisfies CSSProperties;

/** Horizontal hairlines only — vertical rules fight the sharp card edges. */
export const gridProps = {
  stroke: CHART_COLORS.grid,
  strokeDasharray: "0",
  vertical: false,
} as const;

export const xAxisProps = {
  stroke: CHART_COLORS.axis,
  tick: { fill: CHART_COLORS.axis, ...TICK_FONT },
  tickLine: false,
  axisLine: { stroke: CHART_COLORS.grid },
  dy: 8,
  interval: "preserveStartEnd",
  minTickGap: 16,
} as const;

export const yAxisProps = {
  stroke: CHART_COLORS.axis,
  tick: { fill: CHART_COLORS.axis, ...TICK_FONT },
  tickLine: false,
  axisLine: false,
  width: 40,
} as const;

/** Sharp corners, hairline border, no radius — matches the Card primitive. */
export const tooltipProps = {
  contentStyle: {
    backgroundColor: CHART_COLORS.panel,
    border: `1px solid ${CHART_COLORS.line}`,
    borderRadius: 0,
    padding: "8px 10px",
  } satisfies CSSProperties,
  itemStyle: {
    color: CHART_COLORS.fg,
    fontFamily: "var(--font-mono), ui-monospace, monospace",
    fontSize: 13,
    fontVariantNumeric: "tabular-nums",
    padding: 0,
  } satisfies CSSProperties,
  labelStyle: {
    color: CHART_COLORS.fgMuted,
    fontFamily: "var(--font-sans), sans-serif",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    marginBottom: 6,
  } satisfies CSSProperties,
  cursor: { stroke: CHART_COLORS.line, strokeWidth: 1 },
} as const;

/**
 * `linear` rather than `monotone`: a spline invents intermediate values between
 * two workouts, which reads as progress that didn't happen. Straight segments are
 * also truer to the sharp shape language.
 */
export const lineProps = {
  type: "linear",
  stroke: CHART_COLORS.accent,
  strokeWidth: 2,
  dot: { fill: CHART_COLORS.accent, stroke: "none", r: 3 },
  activeDot: { fill: CHART_COLORS.accent, stroke: CHART_COLORS.panel, strokeWidth: 2, r: 5 },
} as const;

export const barProps = {
  fill: CHART_COLORS.accent,
  radius: 0,
  maxBarSize: 28,
} as const;

/** Recharts needs explicit margins; left is tightened to claw back axis gutter. */
export const chartMargin = { top: 8, right: 8, left: -12, bottom: 0 } as const;
