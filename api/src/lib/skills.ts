import * as fs from "fs";
import * as path from "path";

const SKILLS_DIR = path.join(process.cwd(), "skills");

const cache = new Map<string, string>();

export function loadSkill(skillId: string): string {
  if (cache.has(skillId)) {
    return cache.get(skillId)!;
  }

  const filePath = path.join(SKILLS_DIR, `${skillId}.md`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Skill not found: ${skillId}`);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  cache.set(skillId, content);
  return content;
}

export function getAvailableSkills(): string[] {
  if (!fs.existsSync(SKILLS_DIR)) return [];
  return fs
    .readdirSync(SKILLS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

/** The 7 domain-expert skill IDs used by pm-debate. */
export const DOMAIN_SKILL_IDS = [
  "discover-users",
  "frame-problems",
  "generate-ideas",
  "validate-bets",
  "ship-decisions",
  "grow-product",
  "think-systems",
];

/**
 * Load domain expert skill files by ID.
 * If skillIds is empty/undefined, loads all 7 domain experts.
 */
export function loadDomainSkills(
  skillIds?: string[]
): Record<string, string> {
  const ids =
    skillIds && skillIds.length > 0 ? skillIds : DOMAIN_SKILL_IDS;
  const result: Record<string, string> = {};
  for (const id of ids) {
    try {
      result[id] = loadSkill(id);
    } catch {
      // skip missing skill files
    }
  }
  return result;
}

/**
 * Load condensed domain expert skill files for debate mode.
 * Extracts only the framework table and key sections to keep the
 * system prompt under ~25KB, ensuring Anthropic responds within
 * the Azure SWA 45s timeout.
 */
export function loadDomainSkillsCondensed(
  skillIds?: string[]
): Record<string, string> {
  const full = loadDomainSkills(skillIds);
  const result: Record<string, string> = {};

  for (const [id, content] of Object.entries(full)) {
    // Keep everything up to and including the framework table,
    // plus the first major instruction section after it.
    // Skill files follow a consistent structure:
    //   1. Title + intro paragraph
    //   2. Framework table (| # | Framework | ...)
    //   3. Detailed workflow instructions
    // For debate, we keep sections 1-2 and a brief excerpt of 3.
    const lines = content.split("\n");
    const condensed: string[] = [];
    let inTable = false;
    let tableEnded = false;
    let postTableLines = 0;
    const POST_TABLE_LIMIT = 30; // keep ~30 lines after the table

    for (const line of lines) {
      if (!tableEnded) {
        condensed.push(line);
        if (line.startsWith("|")) {
          inTable = true;
        } else if (inTable && !line.startsWith("|") && line.trim() !== "") {
          tableEnded = true;
          postTableLines = 1;
        }
      } else {
        postTableLines++;
        if (postTableLines <= POST_TABLE_LIMIT) {
          condensed.push(line);
        } else {
          condensed.push("\n[Remaining detailed instructions omitted for brevity]");
          break;
        }
      }
    }

    result[id] = condensed.join("\n");
  }

  return result;
}
