import type { CategorySlug } from "./types";

/** Tailwind-safe category color classes (bg, text, border) */
export const CATEGORY_COLORS: Record<
  CategorySlug,
  { bg: string; text: string; border: string; dot: string }
> = {
  "user-insights": {
    bg: "bg-sky-500/15",
    text: "text-sky-400",
    border: "border-sky-500/30",
    dot: "bg-sky-400",
  },
  "problem-framing": {
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    border: "border-purple-500/30",
    dot: "bg-purple-400",
  },
  ideation: {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
  },
  validation: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  execution: {
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    border: "border-orange-500/30",
    dot: "bg-orange-400",
  },
  growth: {
    bg: "bg-rose-500/15",
    text: "text-rose-400",
    border: "border-rose-500/30",
    dot: "bg-rose-400",
  },
  "systems-thinking": {
    bg: "bg-teal-500/15",
    text: "text-teal-400",
    border: "border-teal-500/30",
    dot: "bg-teal-400",
  },
  appendix: {
    bg: "bg-gray-500/15",
    text: "text-gray-400",
    border: "border-gray-500/30",
    dot: "bg-gray-400",
  },
};
