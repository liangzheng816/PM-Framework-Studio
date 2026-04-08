import * as fs from "fs";
import * as path from "path";

const SKILLS_DIR = path.resolve(__dirname, "../../skills");

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
