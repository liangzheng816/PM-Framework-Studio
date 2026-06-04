/**
 * Injects the global PM Studio navbar into every static HTML page under
 * public/ai-learning/ and public/ai-weekly/. The navbar block lives
 * between <!-- AUTO-NAV:START --> and <!-- AUTO-NAV:END --> markers
 * placed immediately after the opening <body> tag.
 *
 * Behaviour:
 * - If a file already has the markers, the region between them is
 *   replaced with the current navbar template (idempotent — re-running
 *   without template changes is a no-op).
 * - If a file has no markers, they (and the navbar) are inserted right
 *   after the opening <body[ ...]> tag.
 * - Files with no <body> tag (rare edge case) are skipped with a warning.
 *
 * Usage:
 *   npx tsx scripts/inject-static-navbar.ts           # write changes
 *   npx tsx scripts/inject-static-navbar.ts --check    # fail if out of date
 *
 * This runs as part of the prebuild chain (see package.json) so the
 * deployed pages always have a fresh navbar.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { globSync } from "node:fs";
import {
  NAV_MARK_END,
  NAV_MARK_START,
  navTargetForPath,
  renderNavbarBlock,
} from "./lib/static-navbar.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");

const GLOBS = [
  "ai-learning/**/*.html",
  "ai-weekly/**/*.html",
];

const BODY_OPEN_RE = /<body\b[^>]*>/i;

function listFiles(): string[] {
  const out: string[] = [];
  for (const g of GLOBS) {
    // Node 22's fs.globSync supports the same patterns we already use elsewhere.
    for (const rel of globSync(g, { cwd: PUBLIC })) {
      out.push(join(PUBLIC, rel));
    }
  }
  return out.sort();
}

function rewrite(html: string, block: string): string {
  const startIdx = html.indexOf(NAV_MARK_START);
  const endIdx = html.indexOf(NAV_MARK_END);
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    // Replace existing block (markers + body) verbatim.
    const before = html.slice(0, startIdx);
    const after = html.slice(endIdx + NAV_MARK_END.length);
    return `${before}${block}${after}`;
  }
  // No markers yet: inject right after the opening <body> tag.
  const m = BODY_OPEN_RE.exec(html);
  if (!m) return html;
  const insertAt = m.index + m[0].length;
  return `${html.slice(0, insertAt)}\n${block}${html.slice(insertAt)}`;
}

function main(): void {
  const check = process.argv.includes("--check");
  const files = listFiles();
  const stale: string[] = [];
  const skipped: string[] = [];
  let touched = 0;

  for (const path of files) {
    const original = readFileSync(path, "utf8");
    const active = navTargetForPath(path);
    const block = renderNavbarBlock(active);
    const next = rewrite(original, block);

    if (next === original) continue;
    if (!BODY_OPEN_RE.test(original)) {
      skipped.push(path);
      continue;
    }

    if (check) {
      stale.push(path);
      continue;
    }

    writeFileSync(path, next, "utf8");
    touched++;
  }

  if (check) {
    if (stale.length > 0) {
      console.error(
        `Static navbar is out of date in ${stale.length} file(s). ` +
          `Run: npm run build:nav`,
      );
      for (const p of stale.slice(0, 5)) console.error(`  - ${p}`);
      if (stale.length > 5) console.error(`  ... and ${stale.length - 5} more`);
      process.exit(1);
    }
    console.log(`Static navbar up to date across ${files.length} file(s).`);
    return;
  }

  console.log(
    `Static navbar: scanned ${files.length} file(s), updated ${touched}.` +
      (skipped.length ? ` Skipped ${skipped.length} (no <body> tag).` : ""),
  );
}

main();
