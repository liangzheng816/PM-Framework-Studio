import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type {
  Framework,
  FrameworkFrontmatter,
  CategorySlug,
  Category,
} from "./types";
import { CATEGORY_META, CATEGORY_ORDER } from "@/data/categories";

const CONTENT_DIR = path.join(process.cwd(), "content/en/frameworks");

let _cache: Framework[] | null = null;

function readAllFrameworks(): Framework[] {
  if (_cache) return _cache;

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));
  const frameworks: Framework[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    frameworks.push({
      ...(data as FrameworkFrontmatter),
      content,
    });
  }

  frameworks.sort((a, b) => a.order - b.order);
  _cache = frameworks;
  return frameworks;
}

export function getAllFrameworks(): Framework[] {
  return readAllFrameworks();
}

export function getFrameworkBySlug(slug: string): Framework | undefined {
  return readAllFrameworks().find((f) => f.slug === slug);
}

export function getFrameworksByCategory(category: CategorySlug): Framework[] {
  return readAllFrameworks().filter((f) => f.category === category);
}

export function getAllSlugs(): string[] {
  return readAllFrameworks().map((f) => f.slug);
}

export function getRelatedFrameworks(
  slug: string,
  limit = 6
): Framework[] {
  const current = getFrameworkBySlug(slug);
  if (!current) return [];

  const all = readAllFrameworks();
  const related: Framework[] = [];
  const seen = new Set<string>([slug]);

  // 1. Explicit companions (strongest signal)
  for (const companionSlug of current.companion_frameworks) {
    if (seen.has(companionSlug)) continue;
    const fw = all.find((f) => f.slug === companionSlug);
    if (fw) {
      related.push(fw);
      seen.add(companionSlug);
    }
    if (related.length >= limit) return related;
  }

  // 2. Same category
  for (const fw of all) {
    if (seen.has(fw.slug)) continue;
    if (fw.category === current.category) {
      related.push(fw);
      seen.add(fw.slug);
    }
    if (related.length >= limit) return related;
  }

  // 3. Same stage
  for (const fw of all) {
    if (seen.has(fw.slug)) continue;
    if (fw.stage.some((s) => current.stage.includes(s))) {
      related.push(fw);
      seen.add(fw.slug);
    }
    if (related.length >= limit) return related;
  }

  return related;
}

export function getCategoriesWithCounts(): Category[] {
  const all = readAllFrameworks();
  return CATEGORY_ORDER.map((slug) => ({
    ...CATEGORY_META[slug],
    frameworkCount: all.filter((f) => f.category === slug).length,
  }));
}

/**
 * Tiered popularity ranking of frameworks.
 * Tier 1 — iconic, universally recognized across PM/design/business.
 * Tier 2 — widely referenced in product orgs, strong name recognition.
 * Tier 3 — solid and well-regarded, known by experienced PMs.
 *
 * Each entry maps slug → { tier, category } so we can guarantee
 * category diversity when sampling.
 */
const FEATURED_POOL: { slug: string; tier: 1 | 2 | 3; cat: CategorySlug }[] = [
  // ── Tier 1: iconic ──
  { slug: "design-thinking",          tier: 1, cat: "user-insights" },
  { slug: "jtbd",                     tier: 1, cat: "user-insights" },
  { slug: "double-diamond",           tier: 1, cat: "problem-framing" },
  { slug: "business-model-canvas",    tier: 1, cat: "ideation" },
  { slug: "lean-startup-mvp",         tier: 1, cat: "validation" },
  { slug: "rice",                     tier: 1, cat: "execution" },
  { slug: "aarrr-pirates",            tier: 1, cat: "growth" },
  { slug: "porter-five-forces",       tier: 1, cat: "systems-thinking" },
  { slug: "swot",                     tier: 1, cat: "problem-framing" },
  { slug: "north-star-metric",        tier: 1, cat: "growth" },

  // ── Tier 2: widely known ──
  { slug: "empathy-map",              tier: 2, cat: "user-insights" },
  { slug: "persona",                  tier: 2, cat: "user-insights" },
  { slug: "user-journey-map",         tier: 2, cat: "user-insights" },
  { slug: "first-principles",         tier: 2, cat: "problem-framing" },
  { slug: "5-whys",                   tier: 2, cat: "problem-framing" },
  { slug: "hmw-problem-frame",        tier: 2, cat: "problem-framing" },
  { slug: "kano-model",              tier: 2, cat: "ideation" },
  { slug: "lean-canvas",              tier: 2, cat: "ideation" },
  { slug: "value-proposition-canvas", tier: 2, cat: "ideation" },
  { slug: "google-design-sprint",     tier: 2, cat: "ideation" },
  { slug: "a-b-testing",              tier: 2, cat: "validation" },
  { slug: "pmf",                      tier: 2, cat: "validation" },
  { slug: "moscow",                   tier: 2, cat: "execution" },
  { slug: "shape-up",                 tier: 2, cat: "execution" },
  { slug: "now-next-later",           tier: 2, cat: "execution" },
  { slug: "hook-model",               tier: 2, cat: "growth" },
  { slug: "blue-ocean-strategy",      tier: 2, cat: "growth" },
  { slug: "go-to-market-strategy",    tier: 2, cat: "growth" },
  { slug: "wardley-mapping",          tier: 2, cat: "systems-thinking" },
  { slug: "three-horizons",           tier: 2, cat: "systems-thinking" },
  { slug: "theory-of-constraints",    tier: 2, cat: "systems-thinking" },

  // ── Tier 3: solid, well-regarded ──
  { slug: "opportunity-solution-tree", tier: 3, cat: "problem-framing" },
  { slug: "six-thinking-hats",        tier: 3, cat: "ideation" },
  { slug: "scamper",                   tier: 3, cat: "ideation" },
  { slug: "working-backwards",         tier: 3, cat: "ideation" },
  { slug: "ice-scoring",              tier: 3, cat: "execution" },
  { slug: "impact-effort-matrix",     tier: 3, cat: "execution" },
  { slug: "storybrand",               tier: 3, cat: "growth" },
  { slug: "ltv-cac",                   tier: 3, cat: "growth" },
  { slug: "growth-flywheel",          tier: 3, cat: "growth" },
  { slug: "cynefin-framework",        tier: 3, cat: "systems-thinking" },
  { slug: "ansoff-matrix",            tier: 3, cat: "systems-thinking" },
  { slug: "wizard-of-oz-test",        tier: 3, cat: "validation" },
  { slug: "hypothesis-board",         tier: 3, cat: "validation" },
  { slug: "service-blueprint",        tier: 3, cat: "user-insights" },
  { slug: "contextual-inquiry",       tier: 3, cat: "user-insights" },
];

/**
 * Returns `count` featured frameworks, randomly sampled with two guarantees:
 * 1. Higher tiers are strongly preferred (weighted sampling).
 * 2. No two picks share a category — maximum diversity.
 *
 * The result changes on every call (server render = every page load).
 */
export function getFeaturedFrameworks(count = 6): Framework[] {
  const all = readAllFrameworks();

  // Build a lookup for quick slug → Framework resolution
  const bySlug = new Map(all.map((f) => [f.slug, f]));

  // Resolve pool entries to real frameworks and attach weight
  const resolved = FEATURED_POOL
    .map((entry) => ({ ...entry, fw: bySlug.get(entry.slug) }))
    .filter((e): e is typeof e & { fw: Framework } => e.fw !== undefined);

  // Weighted shuffle: tier 1 = weight 6, tier 2 = weight 3, tier 3 = weight 1
  const tierWeight = { 1: 6, 2: 3, 3: 1 } as const;
  const weighted = resolved.map((e) => ({
    ...e,
    sort: Math.random() * tierWeight[e.tier],
  }));
  weighted.sort((a, b) => b.sort - a.sort);

  // Pick greedily, skipping duplicate categories
  const usedCats = new Set<string>();
  const picks: Framework[] = [];
  for (const entry of weighted) {
    if (picks.length >= count) break;
    if (usedCats.has(entry.cat)) continue;
    usedCats.add(entry.cat);
    picks.push(entry.fw);
  }

  // If we still need more (fewer categories than count), fill without category constraint
  if (picks.length < count) {
    const pickedSlugs = new Set(picks.map((f) => f.slug));
    for (const entry of weighted) {
      if (picks.length >= count) break;
      if (pickedSlugs.has(entry.slug)) continue;
      picks.push(entry.fw);
      pickedSlugs.add(entry.slug);
    }
  }

  return picks;
}
