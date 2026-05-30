<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PM Studio — Agent Instructions

Next.js 16 web app teaching 100 PM frameworks (browse, compare, map, finder) plus an AI coaching chat backed by two API services. Detailed docs live in [CLAUDE.md](CLAUDE.md) — read it for full architecture, page list, key modules, and design system. This file is the quick, behavior-guiding summary.

## Critical gotchas (read before coding)

- **Next.js 16 ≠ your training data.** `params` and `searchParams` are async Promises — always `await params` in page components. Check `node_modules/next/dist/docs/` before writing Next.js code.
- **Static export only.** `output: "export"` in `next.config.ts` — no SSR, API routes, middleware, or ISR in the frontend. The chat backend is a separate service (`container-api/`).
- **Design tokens are the only source of color.** Never use raw Tailwind ramp utilities (`bg-emerald-500`, `text-purple-400`, `border-rose-500/30`) under `app/`, `components/`, `lib/` — an ESLint guard in `eslint.config.mjs` blocks them. Use `bg-[var(--color-...)]` tokens from `app/globals.css`. Bare `text-white`/`bg-white`/`text-black`/`bg-black` are allowed.
- **Reuse primitives, don't reinvent.** Category colors via `lib/category-colors.ts`, motion variants via `lib/motion.ts`, editorial UI via `components/ui/` (`Eyebrow`, `Lead`, `SectionLabel`, `Card`, `ConfidenceBadge`).

## Git & workspace layout

- **Git root is `framework-studio/`** (remote `liangzheng816/framework_studio`). The parent `PMModels/` is just a local folder — run all git commands from `framework-studio/`.
- **Three separate npm projects** — install deps in each: root (`framework-studio/`), [api/](api/) (legacy SWA Functions), [container-api/](container-api/) (primary Express API).

## Commands (run from `framework-studio/` unless noted)

```bash
npm run dev          # Turbopack dev server → http://localhost:3000
npm run validate     # lint + typecheck — run this before finishing any change (matches CI)
npm run build        # static export → out/

cd container-api && npm run dev   # primary chat API → http://localhost:8080
npx tsx scripts/migrate-content.ts        # PM_Frameworks/*.md → content/en/frameworks/*.mdx + search-index.json
npx tsx scripts/generate-map-positions.ts # regenerate data/map-positions.json
```

There are **no automated tests** — `Tests/` holds manual notes only. Validate changes with `npm run validate` plus the dev server.

## Architecture in brief

- **Frontend** (`app/`, `components/`, `lib/`): pre-rendered static site. Client-side search via Fuse.js, collections in localStorage. Home page (`/`) is the Coach chat UI.
- **Chat backend**: `/api/chat` loads a skill `.md` from `api/skills/` as the system prompt and streams Claude via SSE. Two implementations — `container-api/` (Express, primary, on Azure Container Apps) and `api/` (Azure Functions, legacy SWA, ~50s timeout). Frontend picks one via `NEXT_PUBLIC_API_BASE`.
- **Skills are dual-use.** The 9 files in `api/skills/` are both API system prompts (loaded by `lib/skills.ts`) and Claude Code slash commands. Edit the source in `api/skills/`; `container-api/skills/` is copied at Docker build time (gitignored). When adding a skill, also update `lib/coach-types.ts` (`resolveSkillForApi()`).
- **Content pipeline**: edit source in `PM_Frameworks/`, then re-run both `scripts/` migrations and rebuild — never hand-edit generated `content/en/frameworks/*.mdx` or `data/*.json`.

## Conventions & constraints

- Confidence frontmatter (`confidence: "high" | "moderate"`) drives trust badges via `components/ui/confidence-badge.tsx`.
- Single warm editorial light theme (paper `#f4f1ea`, ink `#1b1a17`, vermillion `#cc3b1d`) — no dark mode. Fonts: Fraunces (display), Inter (body), JetBrains Mono (kickers).
- Design bar (PRD §25): editorial calm over dashboard density, no lorem ipsum, WCAG 2.2 AA, Lighthouse > 90 / LCP < 2.5s mobile, `prefers-reduced-motion` respected.

## Deployment

Two pipelines on push to `main`: frontend → Azure Static Web Apps (`azure-static-web-apps-*.yml`, Bicep `infra/main.bicep`); chat API → Azure Container Apps (`deploy-container-api.yml`, Bicep `infra/container-api.bicep`). API env: `ANTHROPIC_API_KEY` (required), `COACH_MODEL`, `COACH_MAX_TOKENS`, `CORS_ORIGINS`.

See [CLAUDE.md](CLAUDE.md), [README.md](README.md), and [DEV_DESIGN/](DEV_DESIGN/) for full detail.
