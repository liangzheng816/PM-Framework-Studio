/**
 * Generates editorial map positions for each framework.
 * X-axis: Early stage (0) → Late stage (1)
 * Y-axis: Qualitative (0) → Quantitative (1)
 *
 * Usage: npx tsx scripts/generate-map-positions.ts
 */

import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.resolve(__dirname, "../content/en/frameworks");
const OUTPUT = path.resolve(__dirname, "../data/map-positions.json");

// Stage progression mapping (0 = early, 1 = late)
const STAGE_X: Record<string, number> = {
  "user-insights": 0.1,
  "problem-framing": 0.25,
  ideation: 0.4,
  validation: 0.55,
  execution: 0.7,
  growth: 0.85,
  "systems-thinking": 0.5,
  appendix: 0.6,
};

// Qualitative vs quantitative heuristic per framework
// 0 = purely qualitative, 1 = purely quantitative
const QUANT_OVERRIDES: Record<string, number> = {
  "a-b-testing": 0.9,
  rice: 0.85,
  "ice-scoring": 0.8,
  "ltv-cac": 0.95,
  "north-star-metric": 0.85,
  "aarrr-pirates": 0.8,
  "heart-framework": 0.75,
  "task-completion-rate-test": 0.8,
  "kano-model": 0.65,
  "porter-five-forces": 0.7,
  swot: 0.5,
  "pestle-analysis": 0.45,
  "ansoff-matrix": 0.6,
  "lean-canvas": 0.55,
  "business-model-canvas": 0.5,
  "design-thinking": 0.15,
  "empathy-map": 0.1,
  persona: 0.2,
  "user-journey-map": 0.2,
  jtbd: 0.25,
  "contextual-inquiry": 0.1,
  "diary-study": 0.15,
  "affinity-diagram": 0.15,
  "crazy-8s": 0.1,
  scamper: 0.15,
  "six-thinking-hats": 0.2,
  "reverse-brainstorming": 0.15,
  "story-spine": 0.1,
  "wardley-mapping": 0.6,
  "first-principles": 0.3,
  "three-horizons": 0.45,
  "fogg-behavior-model": 0.5,
  "hook-model": 0.4,
  pmf: 0.65,
  "growth-flywheel": 0.55,
  "network-effects": 0.5,
  "lean-startup-mvp": 0.4,
  "hypothesis-board": 0.55,
  "double-diamond": 0.25,
  moscow: 0.6,
  "impact-effort-matrix": 0.55,
  "user-story-map": 0.35,
  "google-design-sprint": 0.3,
  "shape-up": 0.45,
  "theory-of-constraints": 0.65,
  "value-chain-analysis": 0.7,
};

function generatePositions() {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));
  const positions: Record<string, { x: number; y: number }> = {};

  // Track per-category counts to spread items within category band
  const catCounts: Record<string, number> = {};
  const catIndices: Record<string, number> = {};

  // First pass: count frameworks per category
  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
    const { data } = matter(raw);
    const cat = data.category as string;
    catCounts[cat] = (catCounts[cat] || 0) + 1;
    catIndices[cat] = 0;
  }

  // Second pass: assign positions
  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
    const { data } = matter(raw);
    const slug = data.slug as string;
    const cat = data.category as string;

    // X: base from category + spread within category
    const baseX = STAGE_X[cat] || 0.5;
    const idx = catIndices[cat]++;
    const count = catCounts[cat];
    const spread = 0.12;
    const offsetX = count > 1 ? ((idx / (count - 1)) - 0.5) * spread : 0;
    let x = baseX + offsetX;

    // Y: quantitative override or heuristic spread
    let y: number;
    if (slug in QUANT_OVERRIDES) {
      y = QUANT_OVERRIDES[slug];
    } else {
      // Spread evenly within 0.25–0.75 range for unknowns
      y = 0.25 + (idx / Math.max(count - 1, 1)) * 0.5;
    }

    // Add small jitter to prevent exact overlaps
    const jitterX = (hashCode(slug) % 30 - 15) / 1000;
    const jitterY = (hashCode(slug + "y") % 30 - 15) / 1000;

    positions[slug] = {
      x: clamp(x + jitterX, 0.02, 0.98),
      y: clamp(y + jitterY, 0.02, 0.98),
    };
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(positions, null, 2), "utf-8");
  console.log(`Generated map positions for ${Object.keys(positions).length} frameworks → data/map-positions.json`);
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

generatePositions();
