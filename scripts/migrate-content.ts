/**
 * Content Migration Script
 *
 * Transforms PM_Frameworks/*.md into content/en/frameworks/*.mdx
 * with enriched frontmatter matching the Framework Studio content model.
 *
 * Usage: npx tsx scripts/migrate-content.ts
 */

import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";

const SOURCE_DIR = path.resolve(__dirname, "../../PM_Frameworks");
const TARGET_DIR = path.resolve(__dirname, "../content/en/frameworks");
const MANIFEST_PATH = path.join(SOURCE_DIR, "framework_manifest.json");

// Category label → slug mapping
const CATEGORY_SLUG_MAP: Record<string, string> = {
  "User insights": "user-insights",
  "Problem framing": "problem-framing",
  Ideation: "ideation",
  Validation: "validation",
  Execution: "execution",
  Growth: "growth",
  "Systems thinking": "systems-thinking",
  Appendix: "appendix",
};

// Complexity heuristics based on framework content patterns
const COMPLEXITY_MAP: Record<string, "low" | "medium" | "high"> = {};

interface ManifestEntry {
  order: number;
  framework: string;
  group: string;
  filename: string;
  confidence: string;
}

function slugFromFilename(filename: string): string {
  // "001_design-thinking.md" → "design-thinking"
  return filename
    .replace(/^\d+_/, "")
    .replace(/\.md$/, "")
    .toLowerCase();
}

function extractSection(
  content: string,
  heading: string
): string {
  const regex = new RegExp(
    `^##\\s+${escapeRegex(heading)}\\s*\\n([\\s\\S]*?)(?=^##\\s|$)`,
    "m"
  );
  const match = content.match(regex);
  return match ? match[1].trim() : "";
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractListItems(section: string): string[] {
  const items: string[] = [];
  const lines = section.split("\n");
  for (const line of lines) {
    const match = line.match(/^[-*]\s+(.+)/);
    if (match) {
      items.push(match[1].replace(/\*\*/g, "").trim());
    }
  }
  return items;
}

function extractCompanionFrameworks(content: string): string[] {
  const section = extractSection(content, "Related frameworks");
  const companions: string[] = [];
  const lines = section.split("\n");
  for (const line of lines) {
    const match = line.match(
      /[-*]\s+\*\*([^*]+)\*\*/
    );
    if (match) {
      const name = match[1].trim();
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      companions.push(slug);
    }
  }
  return companions;
}

function extractInputs(content: string): string[] {
  const section = extractSection(content, "Inputs, outputs, and success criteria");
  // Find the "Typical inputs" subsection
  const inputMatch = section.match(
    /###\s+Typical inputs\s*\n([\s\S]*?)(?=###|$)/
  );
  if (!inputMatch) return [];
  return extractListItems(inputMatch[1]);
}

function extractOutputs(content: string): string[] {
  const section = extractSection(content, "Inputs, outputs, and success criteria");
  const outputMatch = section.match(
    /###\s+Typical outputs\s*\n([\s\S]*?)(?=###|$)/
  );
  if (!outputMatch) return [];
  return extractListItems(outputMatch[1]);
}

function extractSummary(content: string): string {
  const section = extractSection(content, "One-paragraph summary");
  // Take first sentence or first 200 chars
  if (!section) return "";
  const firstSentence = section.match(/^[^.!?]*[.!?]/);
  if (firstSentence && firstSentence[0].length < 250) {
    return firstSentence[0].trim();
  }
  return section.slice(0, 200).trim() + "...";
}

function extractBestFor(content: string): string[] {
  const section = extractSection(content, "When to use it");
  const items: string[] = [];

  // Look for "Primary fit:" pattern
  const primaryMatch = section.match(
    /\*\*Primary fit:\*\*\s*(.+)/
  );
  if (primaryMatch) {
    items.push(primaryMatch[1].trim());
  }

  // Look for "Secondary fit:" pattern
  const secondaryMatch = section.match(
    /\*\*Secondary fit:\*\*\s*(.+)/
  );
  if (secondaryMatch) {
    items.push(secondaryMatch[1].trim());
  }

  return items;
}

function guessComplexity(content: string): "low" | "medium" | "high" {
  const structure = extractSection(content, "Canonical origin and what is \"official\" here");
  // Count steps in canonical structure
  const stepCount = (structure.match(/^\d+\.\s/gm) || []).length;
  if (stepCount <= 3) return "low";
  if (stepCount <= 6) return "medium";
  return "high";
}

function guessStage(categorySlug: string): string[] {
  const stageMap: Record<string, string[]> = {
    "user-insights": ["discovery", "research"],
    "problem-framing": ["discovery", "definition"],
    ideation: ["ideation", "concept"],
    validation: ["validation", "testing"],
    execution: ["execution", "delivery"],
    growth: ["growth", "scaling"],
    "systems-thinking": ["strategy", "planning"],
    appendix: ["planning"],
  };
  return stageMap[categorySlug] || ["general"];
}

function migrate(): void {
  // Read manifest
  const manifest: ManifestEntry[] = JSON.parse(
    fs.readFileSync(MANIFEST_PATH, "utf-8")
  );

  // Ensure target directory exists
  fs.mkdirSync(TARGET_DIR, { recursive: true });

  let migrated = 0;
  let errors = 0;

  for (const entry of manifest) {
    const sourcePath = path.join(SOURCE_DIR, entry.filename);

    if (!fs.existsSync(sourcePath)) {
      console.error(`SKIP: ${entry.filename} not found`);
      errors++;
      continue;
    }

    const raw = fs.readFileSync(sourcePath, "utf-8");
    const { data: frontmatter, content } = matter(raw);

    const slug = slugFromFilename(entry.filename);
    const categorySlug = CATEGORY_SLUG_MAP[entry.group] || "appendix";

    const enrichedFrontmatter = {
      title: frontmatter.title || entry.framework,
      slug,
      aliases: [] as string[],
      category: categorySlug,
      categoryLabel: entry.group,
      summary: extractSummary(content),
      best_for: extractBestFor(content),
      stage: guessStage(categorySlug),
      complexity: COMPLEXITY_MAP[slug] || guessComplexity(content),
      time_to_apply: "varies",
      team_size: "1–10",
      inputs: extractInputs(content),
      outputs: extractOutputs(content),
      companion_frameworks: extractCompanionFrameworks(content),
      confidence: (frontmatter.confidence || entry.confidence || "Moderate")
        .toLowerCase(),
      canonical_status: frontmatter.canonical_status || "adapted",
      order: entry.order,
    };

    // Build the new MDX file
    const mdxContent = matter.stringify(content, enrichedFrontmatter);
    const targetPath = path.join(TARGET_DIR, `${slug}.mdx`);

    fs.writeFileSync(targetPath, mdxContent, "utf-8");
    migrated++;
    console.log(`✓ ${entry.order.toString().padStart(3, "0")} ${slug}`);
  }

  console.log(`\nMigration complete: ${migrated} migrated, ${errors} errors`);

  // Generate search index
  generateSearchIndex(manifest);
}

function generateSearchIndex(manifest: ManifestEntry[]): void {
  const index: Array<Record<string, unknown>> = [];

  for (const entry of manifest) {
    const slug = slugFromFilename(entry.filename);
    const targetPath = path.join(TARGET_DIR, `${slug}.mdx`);

    if (!fs.existsSync(targetPath)) continue;

    const raw = fs.readFileSync(targetPath, "utf-8");
    const { data } = matter(raw);

    index.push({
      slug: data.slug,
      title: data.title,
      aliases: data.aliases,
      category: data.category,
      categoryLabel: data.categoryLabel,
      summary: data.summary,
      best_for: data.best_for,
      stage: data.stage,
    });
  }

  const indexPath = path.join(
    path.resolve(__dirname, "../data"),
    "search-index.json"
  );
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), "utf-8");
  console.log(`\nSearch index generated: ${index.length} entries → data/search-index.json`);
}

migrate();
