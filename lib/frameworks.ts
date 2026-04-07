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

export function getFeaturedFrameworks(count = 6): Framework[] {
  // Editorial picks: well-known, high-confidence frameworks across categories
  const featuredSlugs = [
    "design-thinking",
    "jtbd",
    "double-diamond",
    "rice",
    "lean-startup-mvp",
    "wardley-mapping",
    "aarrr-pirates",
    "business-model-canvas",
  ];
  const all = readAllFrameworks();
  return featuredSlugs
    .map((slug) => all.find((f) => f.slug === slug))
    .filter((f): f is Framework => f !== undefined)
    .slice(0, count);
}
