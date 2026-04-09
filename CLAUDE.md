# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PM Studio** — a premium web product that teaches product management frameworks through a beautiful, interactive learning experience. This repo contains 100 PM framework source markdown files, a PRD, and the fully built Next.js web application.

## Repository Structure

```
├── api/                        # Azure Functions API backend (Anthropic SDK, SSE streaming)
│   ├── src/functions/chat.ts   # POST /api/chat — skill-based Claude streaming endpoint
│   └── src/lib/skills.ts      # Loads skill .md files as system prompts (with cache)
├── PM_Frameworks/              # 100 source markdown files (001_*.md – 100_*.md) + manifest JSON/CSV
├── PRD/                        # Product spec (pmframe_inspired_prd.md) + research summary
├── DEV_DESIGN/                 # Design specs for Coach and Framework Studio features
├── app/                        # Next.js App Router pages (root = Coach chat UI)
├── components/                 # UI components by domain (coach/, search/, deep-dive/, etc.)
├── content/en/frameworks/      # 100 migrated MDX files with enriched frontmatter
├── data/                       # categories.ts, search-index.json, map-positions.json
├── lib/                        # Core modules: frameworks.ts, types.ts, collections.ts, coach-types.ts
├── scripts/                    # migrate-content.ts, generate-map-positions.ts, copy-skills.ts
├── public/                     # robots.txt, static assets
└── .github/workflows/          # Azure Static Web Apps CI/CD
```

## Build & Dev Commands

```bash
# Frontend (static site)
npm run dev              # Turbopack dev server (http://localhost:3000)
npm run build            # Production static export → out/ (118 pages)
npm run start            # Serve production build locally
npm run lint             # ESLint

# API backend (Azure Functions) — run from api/
cd api
npm run build            # TypeScript compile → dist/
npm run start            # func start (requires Azure Functions Core Tools + local.settings.json with ANTHROPIC_API_KEY)

# Content & skill pipeline
npx tsx scripts/migrate-content.ts          # PM_Frameworks/*.md → content/en/frameworks/*.mdx + search-index.json
npx tsx scripts/generate-map-positions.ts   # Regenerate SVG scatter map positions
npx tsx scripts/copy-skills.ts              # pm-skills/*.md → api/skills/ (required before API can serve skills)
```

## Deployment

Hosted on **Azure Static Web Apps** via GitHub Actions. On every push to `main`, the workflow (`.github/workflows/azure-static-web-apps-*.yml`) builds and deploys automatically.

Key workflow settings:
- `app_location: "/"` — repo root
- `output_location: "out"` — Next.js static export directory

The app uses `output: "export"` in `next.config.ts` for fully static HTML generation.

## Tech Stack

Next.js 16 (App Router) + TypeScript (strict) + Tailwind CSS v4 + Framer Motion + MDX filesystem content + Fuse.js client-side search + Azure Static Web Apps

**Next.js 16 note**: `params` and `searchParams` are async Promises — always `await params` in page components.

## Framework Categories (7 groups, 100 total)

User Insights (12) · Problem Framing (17) · Ideation (14) · Validation (14) · Execution (15) · Growth (15) · Systems Thinking (12) · Appendix (1: Pre-mortem)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Coach: AI PM coaching chat interface with skill selector |
| `/discover` | Browse + search: compact hero, Fuse.js fuzzy search, category filters, featured frameworks, trust section |
| `/framework/[slug]` | Deep-dive: parsed sections, sticky sidebar nav, related frameworks, collapsible source notes, save button, JSON-LD schema, mobile action bar |
| `/category/[slug]` | Category landing: hero + framework grid (8 categories) |
| `/map` | Interactive SVG scatter map (x: stage, y: qual/quant), category filters, hover tooltips, mobile fallback |
| `/compare` | Side-by-side comparison: 2–4 frameworks, 9-attribute table, differences-only toggle |
| `/finder` | Guided wizard: 4 questions → ranked recommendations |
| `/collections` | Saved frameworks via localStorage |
| `/about` | Methodology and confidence label explanations |

## Key Modules

| Module | Purpose |
|--------|---------|
| `lib/frameworks.ts` | Content loader: reads MDX, parses frontmatter, caches. Exports: `getAllFrameworks()`, `getFrameworkBySlug()`, `getFrameworksByCategory()`, `getRelatedFrameworks()`, `getFeaturedFrameworks()`, `getCategoriesWithCounts()` |
| `lib/types.ts` | Core interfaces: `Framework`, `Category`, `Collection`, `CategorySlug`, `SearchableFramework` |
| `lib/coach-types.ts` | Skill IDs, metadata, `resolveSkillForApi()`, `buildDebateMessage()`, `Message`, `Conversation` types |
| `lib/collections.ts` | localStorage CRUD for saved frameworks |
| `lib/category-colors.ts` | Tailwind-safe category color class mappings |
| `lib/motion.ts` | Shared Framer Motion variants (fadeInUp, staggerContainer, scaleIn) — reuse instead of inline |
| `components/coach/coach-shell.tsx` | Root Coach chat UI (home page): skill selector, message list, streaming responses |
| `components/search/command-palette.tsx` | Global Cmd+K / `/` or navbar click → search overlay with ARIA combobox. Listens for `fs:open-search` custom event. |
| `api/src/functions/chat.ts` | POST /api/chat — loads skill as system prompt, streams Claude response via SSE. Debate mode injects all domain expert files. |
| `api/src/lib/skills.ts` | Loads skill `.md` files from `api/skills/`, caches in memory. `loadDomainSkills()` for debate mode. |

## Coach Chat Architecture

The home page (`/`) is an AI coaching chat. User selects a skill → frontend sends `{ messages, skill, files? }` to `/api/chat` → API loads the skill `.md` as a system prompt → streams Claude's response via SSE.

- **"Auto" mode** maps to `advise-frameworks` (triage agent)
- **Debate mode** (`pm-debate`): API injects all 7 domain expert skill files into the system prompt with a web-specific override that replaces Claude Code's Agent tool with internal role-playing
- **File uploads**: Appended to the last user message as markdown blocks so skills ground analysis in uploaded docs
- **API env vars**: `ANTHROPIC_API_KEY` (required), `COACH_MODEL` (default: `claude-sonnet-4-6`), `COACH_MAX_TOKENS` (default: 4096, debate auto-bumps to 16384)

## Content Pipeline

Source markdown in `PM_Frameworks/` → `scripts/migrate-content.ts` → enriched MDX in `content/en/frameworks/` + `data/search-index.json`. Map positions generated separately by `scripts/generate-map-positions.ts` → `data/map-positions.json`.

To update content: edit source files in `PM_Frameworks/`, then re-run both scripts and rebuild.

## Design System

- **Theme**: Midnight editorial dark (default) + light mode tokens via `[data-theme="light"]` in `app/globals.css`
- **Fonts**: Instrument Serif (headings), Inter (body), JetBrains Mono (code) — loaded via `next/font/google`
- **Motion**: 120–240ms spring-based, `prefers-reduced-motion` respected
- **Accessibility**: skip nav, focus-visible outlines, ARIA combobox on search, keyboard navigation
- **Confidence labels**: `high` → "Canonical" (green), `moderate` → "Adapted" (amber) — indicates source attribution trustworthiness

## Design Constraints (PRD §25)

- Avoid generic template aesthetics, crowded dashboards, loud gradients, excessive neon
- Prioritize readability on long-form pages
- Never ship placeholder lorem ipsum — use real framework content
- Dark mode must feel luxurious, not gamer-style
- WCAG 2.2 AA accessibility target
- Lighthouse performance > 90, LCP < 2.5s on mobile
