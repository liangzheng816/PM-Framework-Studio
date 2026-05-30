import type { CategorySlug } from "./types";

/**
 * Token-driven category color classes — single source of truth in app/globals.css.
 * Each entry emits Tailwind arbitrary-value classes that resolve to `--color-cat-{slug}`
 * and its `-soft` variant. Callers concatenate these into className strings.
 */
export const CATEGORY_COLORS: Record<
  CategorySlug,
  { bg: string; text: string; border: string; dot: string }
> = {
  "user-insights": {
    bg: "bg-[var(--color-cat-user-insights-soft)]",
    text: "text-[var(--color-cat-user-insights)]",
    border: "border-[var(--color-cat-user-insights)]/30",
    dot: "bg-[var(--color-cat-user-insights)]",
  },
  "problem-framing": {
    bg: "bg-[var(--color-cat-problem-framing-soft)]",
    text: "text-[var(--color-cat-problem-framing)]",
    border: "border-[var(--color-cat-problem-framing)]/30",
    dot: "bg-[var(--color-cat-problem-framing)]",
  },
  ideation: {
    bg: "bg-[var(--color-cat-ideation-soft)]",
    text: "text-[var(--color-cat-ideation)]",
    border: "border-[var(--color-cat-ideation)]/30",
    dot: "bg-[var(--color-cat-ideation)]",
  },
  validation: {
    bg: "bg-[var(--color-cat-validation-soft)]",
    text: "text-[var(--color-cat-validation)]",
    border: "border-[var(--color-cat-validation)]/30",
    dot: "bg-[var(--color-cat-validation)]",
  },
  execution: {
    bg: "bg-[var(--color-cat-execution-soft)]",
    text: "text-[var(--color-cat-execution)]",
    border: "border-[var(--color-cat-execution)]/30",
    dot: "bg-[var(--color-cat-execution)]",
  },
  growth: {
    bg: "bg-[var(--color-cat-growth-soft)]",
    text: "text-[var(--color-cat-growth)]",
    border: "border-[var(--color-cat-growth)]/30",
    dot: "bg-[var(--color-cat-growth)]",
  },
  "systems-thinking": {
    bg: "bg-[var(--color-cat-systems-thinking-soft)]",
    text: "text-[var(--color-cat-systems-thinking)]",
    border: "border-[var(--color-cat-systems-thinking)]/30",
    dot: "bg-[var(--color-cat-systems-thinking)]",
  },
  appendix: {
    bg: "bg-[var(--color-cat-appendix-soft)]",
    text: "text-[var(--color-cat-appendix)]",
    border: "border-[var(--color-cat-appendix)]/30",
    dot: "bg-[var(--color-cat-appendix)]",
  },
};
