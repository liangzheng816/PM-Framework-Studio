export type ConfidenceLevel = "high" | "moderate";
export type CanonicalStatus = "canonical" | "adapted" | "synthesized";
export type Complexity = "low" | "medium" | "high";

export type CategorySlug =
  | "user-insights"
  | "problem-framing"
  | "ideation"
  | "validation"
  | "execution"
  | "growth"
  | "systems-thinking"
  | "appendix";

export interface FrameworkFrontmatter {
  title: string;
  slug: string;
  aliases: string[];
  category: CategorySlug;
  categoryLabel: string;
  summary: string;
  best_for: string[];
  stage: string[];
  complexity: Complexity;
  time_to_apply: string;
  team_size: string;
  inputs: string[];
  outputs: string[];
  companion_frameworks: string[];
  confidence: ConfidenceLevel;
  canonical_status: string;
  order: number;
}

export interface Framework extends FrameworkFrontmatter {
  content: string;
}

export interface Category {
  slug: CategorySlug;
  label: string;
  description: string;
  color: string;
  frameworkCount: number;
}

export interface Collection {
  id: string;
  name: string;
  frameworkSlugs: string[];
  createdAt: string;
}

export interface SearchableFramework {
  slug: string;
  title: string;
  aliases: string[];
  category: CategorySlug;
  categoryLabel: string;
  summary: string;
  best_for: string[];
  stage: string[];
}
