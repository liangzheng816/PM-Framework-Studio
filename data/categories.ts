import type { Category, CategorySlug } from "@/lib/types";

export const CATEGORY_META: Record<
  CategorySlug,
  Omit<Category, "frameworkCount">
> = {
  "user-insights": {
    slug: "user-insights",
    label: "User Insights",
    description:
      "Frameworks for understanding user behavior, motivation, and unmet needs through research and empathy.",
    color: "var(--color-cat-user-insights)",
  },
  "problem-framing": {
    slug: "problem-framing",
    label: "Problem Framing",
    description:
      "Frameworks for defining, scoping, and structuring problems before jumping to solutions.",
    color: "var(--color-cat-problem-framing)",
  },
  ideation: {
    slug: "ideation",
    label: "Ideation",
    description:
      "Frameworks for generating, expanding, and selecting creative ideas and solution directions.",
    color: "var(--color-cat-ideation)",
  },
  validation: {
    slug: "validation",
    label: "Validation",
    description:
      "Frameworks for testing assumptions, measuring outcomes, and building evidence before scaling.",
    color: "var(--color-cat-validation)",
  },
  execution: {
    slug: "execution",
    label: "Execution",
    description:
      "Frameworks for prioritizing, sequencing, and delivering product work effectively.",
    color: "var(--color-cat-execution)",
  },
  growth: {
    slug: "growth",
    label: "Growth",
    description:
      "Frameworks for acquisition, retention, monetization, and scaling product-market fit.",
    color: "var(--color-cat-growth)",
  },
  "systems-thinking": {
    slug: "systems-thinking",
    label: "Systems Thinking",
    description:
      "Frameworks for understanding complex systems, strategy, and long-term structural dynamics.",
    color: "var(--color-cat-systems-thinking)",
  },
  appendix: {
    slug: "appendix",
    label: "Appendix",
    description: "Additional frameworks included for reference.",
    color: "var(--color-cat-appendix)",
  },
};

export const CATEGORY_ORDER: CategorySlug[] = [
  "user-insights",
  "problem-framing",
  "ideation",
  "validation",
  "execution",
  "growth",
  "systems-thinking",
  "appendix",
];
