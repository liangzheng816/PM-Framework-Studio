# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PM Studio** — a premium web product that teaches product management frameworks through a beautiful, interactive learning experience. This repo contains 100 PM framework source markdown files, a PRD, and the fully built Next.js web application.

## Repository Structure

```
├── api/                        # Azure Functions API backend (SWA managed, legacy)
│   ├── src/functions/chat.ts   # POST /api/chat — skill-based Claude streaming endpoint
│   ├── src/lib/skills.ts       # Loads skill .md files as system prompts (with cache)
│   └── skills/                 # 9 skill .md files (single source of truth)
├── container-api/              # Express API backend (Azure Container Apps, primary)
│   ├── src/server.ts           # Express app with CORS, routes
│   ├── src/routes/chat.ts      # POST /api/chat — SSE streaming via res.write()
│   ├── src/routes/health.ts    # GET /api/health — diagnostics
│   ├── src/lib/skills.ts       # Skill loader (same logic, different path resolution)
│   └── Dockerfile              # Multi-stage Node 22 build
├── infra/                      # Bicep IaC templates
│   ├── main.bicep              # SWA resource
│   └── container-api.bicep     # ACR + Container Apps Environment + Container App
├── app/                        # Next.js App Router pages (root = Coach chat UI)
├── components/                 # UI components by domain (coach/, search/, deep-dive/, etc.)
├── content/en/frameworks/      # 100 migrated MDX files with enriched frontmatter
├── data/                       # categories.ts, search-index.json, map-positions.json
├── lib/                        # Core modules: frameworks.ts, types.ts, collections.ts, coach-types.ts
├── scripts/                    # migrate-content.ts, generate-map-positions.ts, build-ai-learning-index.ts, build-ai-weekly-index.ts
├── public/                     # robots.txt, static assets
│   ├── ai-learning/            # Self-contained static "AI Learning" library (centralized index.html + Content/ collections). Single source of truth — linked from the navbar as /ai-learning/index.html. Edit here directly; do NOT keep a second copy at repo root. index.html is GENERATED from each Content/<folder>/collection.json — never hand-edit the cards/stats; run `npm run build:ai-index` (auto-runs on prebuild). See /update-ai-learning-index.
│   └── ai-weekly/              # Self-contained static "AI Weekly" library — linked from the navbar as /ai-weekly/index.html. Source dashboards live (pristine, never modified) in RAW/ named ai-intel-dashboard-YYYYMMDD-HHMMSS.html (timestamp sorts freshness). `npm run build:ai-weekly` (auto-runs on prebuild) GENERATES index.html AND writes a site-themed copy of each dashboard into pages/ named ai-weekly-digest-YYYYMMDD-HHMMSS.html (same timestamp suffix); the index cards link to pages/. Never hand-edit index.html or the generated pages/ files. See /update-ai-weekly-index.
└── .github/workflows/          # CI/CD (SWA deploy + Container API deploy)
```

## Build & Dev Commands

```bash
# Frontend (static site)
npm run dev              # Turbopack dev server (http://localhost:3000)
npm run build            # Production static export → out/ (118 pages)
npm run start            # Serve production build locally
npm run lint             # ESLint (api/dist/, container-api/ excluded)
npm run typecheck        # tsc --noEmit (container-api/ excluded via tsconfig.json)
npm run validate         # lint + typecheck (matches CI)

# Container API (primary backend) — from container-api/
cd container-api
npm run dev              # tsx dev server (http://localhost:8080)
npm run build            # TypeScript compile → dist/
npm run start            # node dist/src/server.js

# SWA API (legacy) — from api/, requires Azure Functions Core Tools
cd api
npm run build && npm run start   # func start on port 7071

# Content pipeline
npx tsx scripts/migrate-content.ts          # PM_Frameworks/*.md → content/en/frameworks/*.mdx + search-index.json
npx tsx scripts/generate-map-positions.ts   # Regenerate SVG scatter map positions
```

## Deployment

Two deployment pipelines, both triggered on push to `main`:

**Frontend (Azure Static Web Apps)** — `azure-static-web-apps-*.yml`

- Validates (lint + typecheck), then deploys via `Azure/static-web-apps-deploy@v1`
- Static export: `output: "export"` in `next.config.ts`. No SSR, no API routes, no middleware, no ISR.
- `NEXT_PUBLIC_API_BASE` set in `.env.production` points frontend to the Container App API
- Bicep: `infra/main.bicep`

**Container API (Azure Container Apps)** — `deploy-container-api.yml`

- Triggers on changes to `container-api/**`, `api/skills/**`, `infra/container-api.*`
- Builds Docker image → pushes to ACR (`pmstudioacr`) → deploys to Container App (`pmstudio-api`)
- Skill `.md` files copied from `api/skills/` into image at build time
- No timeout constraint (240s default vs SWA's ~50s)
- Bicep: `infra/container-api.bicep` (ACR + managed environment + container app)
- Env vars: `ANTHROPIC_API_KEY` (secret), `COACH_MODEL`, `COACH_MAX_TOKENS`, `CORS_ORIGINS`

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
| `lib/category-colors.ts` | Token-driven category color class mappings (`var(--color-cat-*)`) |
| `lib/motion.ts` | Shared Framer Motion variants (fadeInUp, staggerContainer, scaleIn) — reuse instead of inline |
| `components/coach/coach-shell.tsx` | Root Coach chat UI (home page): skill selector, message list, streaming responses |
| `components/search/command-palette.tsx` | Global Cmd+K / `/` or navbar click → search overlay with ARIA combobox. Listens for `fs:open-search` custom event. |
| `container-api/src/routes/chat.ts` | POST /api/chat — loads skill as system prompt, streams Claude response via SSE (`res.write()`). Debate mode injects all domain expert files. |
| `container-api/src/lib/skills.ts` | Loads skill `.md` files, caches in memory. `loadDomainSkills()` for debate mode. |
| `api/src/functions/chat.ts` | Legacy SWA version of chat endpoint (same logic, Azure Functions wrapper, 4-expert cap). |

## Coach Chat Architecture

The home page (`/`) is an AI coaching chat. User selects a skill → frontend sends `{ messages, skill, files? }` to `/api/chat` → API loads the skill `.md` as a system prompt → streams Claude's response via SSE.

- **"Auto" mode** maps to `advise-frameworks` (triage agent)
- **Debate mode** (`pm-debate`): API injects domain expert skill files into the system prompt with a web-specific override that replaces Claude Code's Agent tool with internal role-playing. Container API uses all 7 experts; SWA legacy API caps at 4 due to timeout.
- **File uploads**: Appended to the last user message as markdown blocks so skills ground analysis in uploaded docs
- **API env vars**: `ANTHROPIC_API_KEY` (required), `COACH_MODEL` (default: `claude-sonnet-4-6`), `COACH_MAX_TOKENS` (default: 4096, debate auto-bumps to 16384 on container-api, 8192 on SWA)
- **Dual API backends**: `container-api/` (Express, primary) and `api/` (Azure Functions, legacy). Frontend selects via `NEXT_PUBLIC_API_BASE` in `.env.local` (dev) or `.env.production` (prod)

## Content Pipeline

Source markdown in `PM_Frameworks/` → `scripts/migrate-content.ts` → enriched MDX in `content/en/frameworks/` + `data/search-index.json`. Map positions generated separately by `scripts/generate-map-positions.ts` → `data/map-positions.json`.

To update content: edit source files in `PM_Frameworks/`, then re-run both scripts and rebuild.

## Key Conventions

- **Next.js 16 breaking changes**: `params` and `searchParams` are async Promises — always `await params` in page components. **Read `node_modules/next/dist/docs/` before writing any Next.js code** — APIs, conventions, and file structure may differ from training data.
- **Design tokens are the only truth**: All color, font, radius, shadow, and motion values come from CSS custom properties defined in `app/globals.css` and exposed through Tailwind via `@theme inline`. **Never use raw Tailwind color utilities** like `bg-emerald-500`, `text-purple-400`, `border-rose-500/30` in component code — they bypass the theme system. Use `bg-[var(--color-confidence-high-soft)]`, `text-[var(--color-cat-user-insights)]`, etc. An ESLint guard in `eslint.config.mjs` blocks color-with-ramp utilities under `app/`, `components/`, and `lib/`. The bare-name utilities `text-white`, `bg-white`, `text-black`, `bg-black` are allowed (semantic, used for white-on-accent text in primary buttons / logo badges).
- **Category colors**: `lib/category-colors.ts` emits token-driven class strings (`bg-[var(--color-cat-{slug}-soft)]` etc.) — use these for any category-keyed UI, never hardcode hues.
- **Motion**: `lib/motion.ts` exports shared Framer Motion variants (fadeInUp, staggerContainer, etc.) — reuse them instead of writing inline animations
- **Coach types**: `lib/coach-types.ts` defines all skill IDs, metadata, and the `resolveSkillForApi()` mapping — update this when adding skills
- **Confidence labeling**: Frontmatter `confidence: "high" | "moderate"` drives trust badges ("Canonical" / "Adapted") via `components/ui/confidence-badge.tsx`
- **API env vars**: `ANTHROPIC_API_KEY` (required), `COACH_MODEL` (default: `claude-sonnet-4-6`), `COACH_MAX_TOKENS` (default: 4096, debate auto-bumps to 16384)

## Design System

- **Theme**: Single warm editorial light theme — paper `#f4f1ea` background, ink `#1b1a17` text, vermillion `#cc3b1d` accent. No dark mode. Tokens live in `:root` in `app/globals.css`; consumers reference them via `var(--color-*)` directly or through Tailwind utilities exposed by `@theme inline`.
- **Fonts**: Fraunces (display — h1/h2 and italic accents), Inter (body, UI chrome), JetBrains Mono (kickers, eyebrows, code) — all loaded via `next/font/google` in `app/layout.tsx`.
- **Italic accent in display headings**: `<h1>Discover <em>frameworks</em></h1>` renders the em in vermillion italic Fraunces automatically (CSS rule on `h1 em, h2 em`).
- **Editorial primitives** in `components/ui/`: `Eyebrow` (mono kicker), `Lead` (21px lead paragraph), `SectionLabel` (mono section divider), `Card` (editorial card with optional left stripe), `ConfidenceBadge`. Reuse these — don't reinvent the patterns inline.
- **Motion**: 120–240ms spring-based, `prefers-reduced-motion` respected (global rule in `globals.css`)
- **Accessibility**: skip nav, focus-visible outlines (vermillion 2px), ARIA combobox on search, keyboard navigation

## Design Constraints (PRD §25)

- Avoid generic template aesthetics, crowded dashboards, loud gradients, excessive neon
- Prioritize readability on long-form pages
- Never ship placeholder lorem ipsum — use real framework content
- Editorial calm over dashboard density — generous whitespace, serif headlines, restrained color
- WCAG 2.2 AA accessibility target
- Lighthouse performance > 90, LCP < 2.5s on mobile
