/**
 * Regenerates the AI Learning landing page (public/ai-learning/index.html).
 *
 * It scans every collection folder under public/ai-learning/Content/ for a
 * `collection.json` manifest, then rewrites the two AUTO-INDEX regions of
 * index.html (the stats bar and the collection sections). Everything else in
 * index.html — the CSS, hero, "Coming up" slot, and how-to notes — is left
 * untouched.
 *
 * Usage:
 *   npx tsx scripts/build-ai-learning-index.ts          # write changes
 *   npx tsx scripts/build-ai-learning-index.ts --check   # fail if out of date
 *
 * Manifest content (titles, subtitles, descriptions) is treated as trusted,
 * author-written HTML and injected verbatim so curated markup like <em> and
 * <code> is preserved. Only run this on your own local content.
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const AI_LEARNING = join(ROOT, "public", "ai-learning");
const CONTENT_DIR = join(AI_LEARNING, "Content");
const INDEX_FILE = join(AI_LEARNING, "index.html");

type Category = "agent" | "applied" | "advanced";

interface Page {
  /** Eyebrow label shown above the card title, e.g. "GUIDE 01", "07", "PRACTICE". */
  num: string;
  /** Card heading (trusted HTML allowed). */
  title: string;
  /** Card body copy (trusted HTML allowed). */
  desc: string;
  /** Path to the page, relative to the collection folder. */
  href: string;
  /** Call-to-action text, e.g. "Open guide", "Open site". Default "Open page". */
  cta?: string;
  /** Practice pages (quizzes, flashcards) are excluded from the "Pages" stat. */
  practice?: boolean;
}

interface Manifest {
  /** Sort order on the page (1-based). */
  order: number;
  /** Color lane: agent (slate), applied (amber), advanced (vermillion). */
  category: Category;
  /** Short uppercase label in the collection meta line. */
  collectionLabel: string;
  /** ISO date (YYYY-MM-DD) shown in the meta line. */
  date: string;
  /** Collection heading (trusted HTML allowed, e.g. uses <em>). */
  title: string;
  /** Collection sub-heading (trusted HTML allowed). */
  subtitle: string;
  /** Collection home page, relative to the folder. Default "index.html". */
  home?: string;
  /** Quiz questions contributed to the global stat. Default 0. */
  quizQuestions?: number;
  /** Flashcards contributed to the global stat. Default 0. */
  flashcards?: number;
  /** The cards rendered for this collection. */
  pages: Page[];
}

const START = (region: string) => `<!-- AUTO-INDEX:${region}:START -->`;
const END = (region: string) => `<!-- AUTO-INDEX:${region}:END -->`;

function loadManifests(): { folder: string; manifest: Manifest }[] {
  if (!existsSync(CONTENT_DIR)) {
    throw new Error(`Content directory not found: ${CONTENT_DIR}`);
  }
  const out: { folder: string; manifest: Manifest }[] = [];
  for (const entry of readdirSync(CONTENT_DIR)) {
    const folder = join(CONTENT_DIR, entry);
    if (!statSync(folder).isDirectory()) continue;
    const manifestPath = join(folder, "collection.json");
    if (!existsSync(manifestPath)) {
      console.warn(`  skip  ${entry} (no collection.json)`);
      continue;
    }
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;
    out.push({ folder: entry, manifest });
  }
  out.sort((a, b) => a.manifest.order - b.manifest.order);
  return out;
}

function renderStats(collections: { manifest: Manifest }[]): string {
  const pageCount = collections.reduce(
    (n, c) => n + c.manifest.pages.filter((p) => !p.practice).length,
    0,
  );
  const quiz = collections.reduce((n, c) => n + (c.manifest.quizQuestions ?? 0), 0);
  const cards = collections.reduce((n, c) => n + (c.manifest.flashcards ?? 0), 0);
  return [
    `<div class="stats">`,
    `  <div class="s"><div class="v">${collections.length}</div><div class="l">Collections</div></div>`,
    `  <div class="s"><div class="v">${pageCount}</div><div class="l">Pages · Sites &amp; Guides</div></div>`,
    `  <div class="s"><div class="v">${quiz}</div><div class="l">Quiz Questions</div></div>`,
    `  <div class="s"><div class="v">${cards}</div><div class="l">Flashcards</div></div>`,
    `</div>`,
  ].join("\n");
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y} · ${m} · ${d}`;
}

function renderCard(prefix: string, page: Page): string {
  const cta = page.cta ?? "Open page";
  return [
    `    <a class="site" href="${prefix}${page.href}">`,
    `      <div class="num">${page.num}</div>`,
    `      <h3>${page.title}</h3>`,
    `      <p>${page.desc}</p>`,
    `      <span class="open">${cta} <span class="arw">→</span></span>`,
    `    </a>`,
  ].join("\n");
}

function renderCollection(
  folder: string,
  manifest: Manifest,
  position: number,
): string {
  const prefix = `Content/${folder}/`;
  const home = manifest.home ?? "index.html";
  const num = String(position).padStart(2, "0");
  const cards = manifest.pages.map((p) => renderCard(prefix, p)).join("\n");
  return [
    `<!-- ============ COLLECTION ${num} ============ -->`,
    `<section class="group cat-${manifest.category}">`,
    `  <div class="group-head">`,
    `    <div class="gh-l">`,
    `      <div class="gh-meta">`,
    `        <span>Collection ${num}</span><span class="dot"></span>`,
    `        <span>${manifest.collectionLabel}</span><span class="dot"></span>`,
    `        <span class="date">${formatDate(manifest.date)}</span>`,
    `      </div>`,
    `      <h2>${manifest.title}</h2>`,
    `      <p class="gh-sub">${manifest.subtitle}</p>`,
    `    </div>`,
    `    <a class="gh-home" href="${prefix}${home}">Collection home <span class="arw">→</span></a>`,
    `  </div>`,
    ``,
    `  <div class="grid">`,
    cards,
    `  </div>`,
    `</section>`,
  ].join("\n");
}

function replaceRegion(html: string, region: string, body: string): string {
  const startMark = START(region);
  const endMark = END(region);
  const startIdx = html.indexOf(startMark);
  const endIdx = html.indexOf(endMark);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(
      `Markers ${startMark} / ${endMark} not found in index.html. ` +
        `Add them around the ${region.toLowerCase()} region.`,
    );
  }
  const before = html.slice(0, startIdx + startMark.length);
  const after = html.slice(endIdx);
  return `${before}\n${body}\n${after}`;
}

function main(): void {
  const check = process.argv.includes("--check");
  const collections = loadManifests();
  if (collections.length === 0) {
    throw new Error("No collection.json manifests found under Content/.");
  }

  const original = readFileSync(INDEX_FILE, "utf8");
  let html = original;

  const stats = renderStats(collections);
  html = replaceRegion(html, "STATS", stats);

  const sections = collections
    .map((c, i) => renderCollection(c.folder, c.manifest, i + 1))
    .join("\n\n");
  html = replaceRegion(html, "COLLECTIONS", sections);

  if (check) {
    if (html !== original) {
      console.error(
        "index.html is out of date. Run: npx tsx scripts/build-ai-learning-index.ts",
      );
      process.exit(1);
    }
    console.log("AI Learning index is up to date.");
    return;
  }

  if (html === original) {
    console.log(`AI Learning index already current (${collections.length} collections).`);
    return;
  }

  writeFileSync(INDEX_FILE, html, "utf8");
  console.log(
    `Wrote ${INDEX_FILE} — ${collections.length} collection(s): ` +
      collections.map((c) => c.folder).join(", "),
  );
}

main();
