import * as fs from "fs";
import * as path from "path";

// In the container: __dirname = /app/dist/src/lib, skills at /app/skills
const SKILLS_DIR = path.join(__dirname, "../../../skills");

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
