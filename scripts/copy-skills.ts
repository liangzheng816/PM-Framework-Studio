/**
 * Copy skill prompts from pm-skills/ into api/skills/
 *
 * Usage: npx tsx scripts/copy-skills.ts
 */

import * as fs from "fs";
import * as path from "path";

const SOURCE_DIR = path.resolve(__dirname, "../pm-skills");
const TARGET_DIR = path.resolve(__dirname, "../api/skills");

if (!fs.existsSync(SOURCE_DIR)) {
  console.error(`Source directory not found: ${SOURCE_DIR}`);
  process.exit(1);
}

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

const files = fs.readdirSync(SOURCE_DIR).filter((f) => f.endsWith(".md"));

let copied = 0;
for (const file of files) {
  fs.copyFileSync(path.join(SOURCE_DIR, file), path.join(TARGET_DIR, file));
  copied++;
}

console.log(`Copied ${copied} skill files to ${TARGET_DIR}`);
