# Beast Tracker — UI/UX Revamp Design

**Date:** 2026-07-30
**Scope:** Visual language only. Routes, data flow, and `src/app/actions.ts` are untouched.

## Origin

The palette and type pairing are borrowed from the sibling `Ehab fitness/` project's
"Kinetic Intensity" system (`Ehab fitness/design.md`): Electric Lime `#CCFF00`, an
obsidian surface ramp, Anton headlines, Archivo Narrow body. Only the *tokens* are
borrowed — layout, components, and interaction design here are designed for a
data-entry PWA used mid-workout, not for a marketing landing page.

## Decisions

| Question | Decision |
|---|---|
| Depth | New visual language, same screens. No route, flow, or server-action changes. |
| Theme | Keep light **and** dark, both designed properly. |
| Direction | Telemetry + Poster hybrid. |
| Primitives | Build a shared `src/components/ui/` layer first, then refactor screens onto it. |
| Motion | CSS only, restrained. No animation library. |

### Direction: Telemetry + Poster

Sharp 0-radius geometry, hairline dividers, tabular monospace numerals for every
number the user reads mid-set, segmented (never continuous) progress. Lime is spent
only as signal. Against that density, poster-scale Anton for page titles and one
hero number per screen keeps the app from reading as a spreadsheet.

## Foundation

### Color

The light-mode lime problem — `#CCFF00` is unreadable as text on a light surface —
is solved by splitting the accent in two:

- `--accent` — text, icon, and stroke safe. Darkens to olive in light mode.
- `--accent-fill` — block fills only, always paired with `--on-accent` near-black text.
  Stays true lime in both themes.

In dark mode the two are the same value, so lime behaves as expected; in light mode
lime survives as a fill and never becomes thin text.

| token | dark | light |
|---|---|---|
| `--background` | `#0E0E0E` | `#F4F4F1` |
| `--surface` (card) | `#161616` | `#FFFFFF` |
| `--surface-raised` (popover, modal) | `#1F1F1F` | `#FAFAF7` |
| `--surface-input` (input, hover) | `#2A2A2A` | `#ECECE7` |
| `--line` (hairline) | `#262626` | `#DDDDD6` |
| `--line-strong` | `#383838` | `#C4C4BB` |
| `--fg` | `#E5E2E1` | `#131313` |
| `--fg-muted` | `#8A8A87` | `#5C5C57` |
| `--fg-dim` | `#5C5C5A` | `#8A8A83` |
| `--accent` | `#CCFF00` | `#556D00` |
| `--accent-fill` | `#CCFF00` | `#CCFF00` |
| `--accent-dim` | `#ABD600` | `#6E8A00` |
| `--on-accent` | `#131313` | `#131313` |
| `--danger` | `#FFB4AB` | `#93000A` |
| `--danger-fill` | `#93000A` | `#FFDAD6` |

Light-mode background is bone `#F4F4F1` rather than pure white; the warm-neutral
cast echoes lime's yellow bias so both themes read as the same brand.

Contrast: lime on obsidian ≈16:1, olive on bone ≈5.6:1, near-black on lime ≈14:1,
`--fg-muted` ≥4.5:1 in both themes.

**The lime budget.** At most **one** lime element per viewport, plus progress fill.
Eligible: primary CTA, active-set marker, current-day marker, PR badge, focused
input, active nav item. Everything else is monochrome. This rule is what keeps a
neon accent from reading as a toy.

### Type

| role | font | size / line-height | notes |
|---|---|---|---|
| `hero-num` | Anton | 64 / 60 | one per screen |
| `title-lg` | Anton | 32 / 34 | uppercase |
| `title-md` | Anton | 24 / 26 | uppercase |
| `eyebrow` | Archivo Narrow 700 | 11 / 14 | `ls .14em`, uppercase |
| `body` | Archivo Narrow | 15 / 22 | |
| `body-sm` | Archivo Narrow | 13 / 18 | |
| `data` | Geist Mono | 15 / 20 | `tabular-nums` — weights, reps, timers, dates |

Ehab's 80px display is landing-page scale; the app tops out at 64px so a hero
number survives a 360px viewport.

### Shape

Radius 0 everywhere. Sole exception: the profile avatar (`rounded-full`). Touch
targets stay ≥44px so sharpness costs nothing in tappability. Depth comes from
tonal surface layers plus hairlines — never shadows, which are invisible on
obsidian anyway. One 45° chamfered corner per screen, on the hero panel only.

### Motion

`--ease-kinetic: cubic-bezier(.2, 0, 0, 1)`, durations 120 / 200 / 320ms.

- press: `scale(.98)` plus border shift
- active set: 2s lime glow breathe
- progress segments: staggered 40ms fill
- hero number: 500ms count-up
- route change: 200ms fade plus 2px rise

The whole block is disabled under `prefers-reduced-motion: reduce`.

## Primitives — `src/components/ui/`

Each exists because the current markup already repeats it by hand.

| primitive | replaces |
|---|---|
| `Button` — primary / secondary / ghost / danger, sizes, loading | ~30 hand-rolled `bg-primary rounded-xl` buttons |
| `Card` — props `chamfer`, `active` | every `bg-card border-muted rounded-2xl shadow-lg` |
| `Panel` — hero: eyebrow + hero number + meta row | ad-hoc header blocks |
| `Field` — eyebrow label + bottom-border input, `numeric` prop | `SetLogger.tsx` `inputClass`, 6 forms |
| `Select` | native selects in `DaysManager`, `ExercisesManager` |
| `Chip` — default / accent / outline / danger | `TYPE_LABELS` badge, muscle groups, difficulty |
| `StatBlock` — eyebrow + value + unit + delta | scattered stat divs |
| `SegmentedProgress` | set and day progress |
| `Divider` — optional centered inline label | `SetLogger` "OR ENTER MANUALLY" |
| `PageTitle` — eyebrow + Anton title + right slot | every screen's `<h1>` |
| `ListRow` — mono index, uppercase title, mono meta, status; idle / active / done / skipped | exercise, day, history, marketplace, published lists |
| `EmptyState` | "Day not found", "No complete logs found" |
| `Modal` | `ui/AlertModal.tsx` + `ConfirmModal.tsx`, merged |
| `Skeleton` | nothing today — blank flashes |

Plus `src/lib/chartTheme.ts` (not a component): shared recharts axis, grid, tooltip,
and line props so `HistoryChart`, `ExerciseChart`, and the history charts are
provably identical. Recharts stays; only styling changes.

## Screen application

- **`/` home** — `Panel` with counting hero ("04 EXERCISES LEFT"), `SegmentedProgress`,
  chamfer. `DaySelector` becomes a horizontal mono day strip, current day lime-marked.
  Exercise list becomes `ListRow`: active row lime, done rows dimmed with a mono recap.
- **`/exercise/[id]`** — the mid-set screen, gets the most care. Exercise name in Anton,
  target as mono `3×12 · 120s`. `SetLogger` uses `Field` pairs and a lime submit.
  `RestTimer` and `Stopwatch` get `hero-num` mono digits via the existing
  `FixedDigits.tsx`. The completed state uses `EmptyState` + `Button` and drops its
  green circle for lime.
- **Charts** — `chartTheme`, with a `StatBlock` row above each chart.
- **`/routines`, `/marketplace`, `/studio`, `/days`, `/exercises`, `/admin`** —
  `ListRow` + `Card` + `Modal` sweep. `RoutinesTabs` and `StudioTabs` become
  underline-rule tabs with a lime active rule.
- **`/settings`, `/about`** — `Card` sections, `Field` forms, `Chip` for version and meta.
- **`/login`, `/welcome`** — full-bleed, poster-scale Anton, off the 448px column.
  `AppMockups.tsx` mockups redrawn to match the new UI.
- **Chrome** — `Header` gains a hairline bottom rule and a mono user label.
  `BottomNav` goes sharp with a top hairline; the active item is a lime icon plus a
  2px lime top-edge marker, and `animate-pulse-slow` is dropped. `SplashScreen` sits
  on `--background` with a lime rule.

## Rollout

Five phases, each independently viewable.

1. **Tokens** — rewrite `globals.css`, add `chartTheme.ts`. Legacy token aliases
   (`--card`, `--muted`, `--primary`, …) are kept and remapped so all existing markup
   picks up the new palette immediately without editing 32 files. `--radius-*` are
   overridden to `0`, so the app goes sharp in one step. `--shadow-*` are overridden
   to `none`.
2. **Primitives** — the 14 files above, isolated. Nothing consumes them yet.
3. **Chrome, home, exercise logger** — the daily-use path.
4. **Remaining routes** — sweeps out the last of 220 `rounded-*` and 60 hardcoded
   palette-color occurrences, and deletes the legacy aliases.
5. **QA** — light mode, `prefers-reduced-motion`, 360px viewport.

Deploy is explicitly out of scope until the user asks.

## Out of scope

Information architecture, navigation restructuring, new features, data model changes,
and any edit to `actions.ts`, `prisma/`, or auth. The theme toggle stays.
