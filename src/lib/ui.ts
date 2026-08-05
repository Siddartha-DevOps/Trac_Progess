// Shared UI token classes used across polished pages.
//
// The point of this file is to encode DESIGN DECISIONS in one place so
// pass-2 polish work becomes "apply these classes" rather than another
// round of design. Every constant here has a rationale attached.
//
// No colors are changed — only structure/craft:
//   – Elevation scale: 3 rungs, chosen for real z-depth signaling.
//   – Radius scale:    2 rungs (outer / inner) — nested elements step down.
//   – Focus ring:      one consistent, keyboard-visible ring.
//   – Section rhythm:  context-aware vertical spacing, not a flat 6 everywhere.

// Elevation — 3 rungs.
// e0: surface at page background, no shadow (data-dense rows, list items).
// e1: interactive card resting state (nav items, dashboard tiles).
// e2: hero / floating panel / active overlay.
export const elevation = {
  e0: "border border-slate-800/80",
  e1: "border border-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.4),0_1px_3px_rgba(0,0,0,0.25)]",
  e2: "border border-slate-800 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6),0_4px_10px_-4px_rgba(0,0,0,0.35)]",
} as const;

// Radius — outer element uses `radius.lg`, elements nested INSIDE it use `radius.md`.
// This gives visible parent/child hierarchy instead of every element sharing rounded-2xl.
export const radius = {
  lg: "rounded-2xl",
  md: "rounded-xl",
  sm: "rounded-lg",
} as const;

// Focus ring — one consistent, keyboard-visible focus treatment. Currently
// missing from ~99% of interactive elements in the app. This is the single
// largest accessibility + craftsmanship gap.
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

// Interactive base — every button/link should compose this.
// Adds visible hover (translate + brightness), press (scale-down), and the focus ring.
// The transition uses `transition-[transform,box-shadow,background-color,opacity]`
// so we do NOT animate `all` (which is a common perf trap).
export const interactive =
  `transition-[transform,box-shadow,background-color,border-color,opacity,color] duration-150 ease-out ` +
  `hover:-translate-y-px active:translate-y-0 active:scale-[0.985] ` +
  focusRing;

// Section rhythm — context-aware vertical spacing.
// hero: hero-only, generous.
// section: normal content section between hero and footer.
// dense: data-heavy blocks (fleet grid, tables, etc.).
export const section = {
  hero: "py-16 sm:py-20 lg:py-28",
  block: "py-10 sm:py-14 lg:py-16",
  dense: "py-6 sm:py-8",
} as const;

// Container widths — deliberate measure control per context, not one uniform max-w-7xl.
export const container = {
  prose: "max-w-2xl mx-auto",           // long copy — enforce ~65 char measure.
  ui: "max-w-6xl mx-auto px-4 sm:px-6", // interactive UI — wider.
  wide: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
} as const;

// Badge — replaces the app's default `bg-*/20 text-* border border-*/30 font-mono uppercase`
// pattern used on ~everything. Restrained and legible, drops the mono-uppercase-emoji vibe.
// `tone` selects semantic color without changing the palette.
export function badgeClass(
  tone: "cyan" | "emerald" | "amber" | "rose" | "slate" = "slate"
): string {
  const tones: Record<string, string> = {
    cyan:    "bg-cyan-500/10    text-cyan-300    ring-1 ring-inset ring-cyan-500/25",
    emerald: "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/25",
    amber:   "bg-amber-500/10   text-amber-300   ring-1 ring-inset ring-amber-500/25",
    rose:    "bg-rose-500/10    text-rose-300    ring-1 ring-inset ring-rose-500/25",
    slate:   "bg-slate-800/60   text-slate-300   ring-1 ring-inset ring-slate-700",
  };
  return `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] leading-5 tracking-normal font-medium ${tones[tone]}`;
}

// Card recipes — resting state for panels. Compose with elevation + radius above.
export const card = {
  base: `bg-slate-900 ${elevation.e1} ${radius.lg}`,
  hero: `bg-slate-900 ${elevation.e2} ${radius.lg}`,
  dense: `bg-slate-900/80 ${elevation.e0} ${radius.md}`,
} as const;

// Utility: combine class strings while filtering falsy values (small helper — no clsx dep).
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
