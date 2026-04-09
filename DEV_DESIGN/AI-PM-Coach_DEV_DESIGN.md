# Dev Design — AI PM Coach

> **Implementation status (updated 2026-04-09):** Coach is fully shipped. Key divergences from original spec:
> - Coach lives at `/` (root), not `/coach` — it replaced the original homepage
> - Single API endpoint `POST /api/chat` handles all modes (single-skill, debate, file upload) — `/api/classify` and `/api/chat-debate` were never built
> - Planned files `lib/framework-links.ts`, `data/skills-meta.ts`, `data/coach-prompts.ts`, `api/src/lib/stream.ts` were not created — skill metadata lives in `lib/coach-types.ts`
> - CI/CD now includes a validate job (lint + typecheck) gating deployment, actions pinned to v4, and Bicep IaC for Azure resource management
> - Runtime app settings must be configured on the SWA resource separately from the build-time workflow `env:` block

## 0. Project identity

- **Source repo:** https://github.com/liangzheng816/framework_studio
- **Live URL:** https://salmon-moss-07f46dd1e.2.azurestaticapps.net/
- **Coach page:** https://salmon-moss-07f46dd1e.2.azurestaticapps.net/ (root — replaced original homepage)
- **API endpoint:** https://salmon-moss-07f46dd1e.2.azurestaticapps.net/api/chat
- **Azure resource:** `pmframeworkstudio` (resource group: `pmframeworkstudio_group`, West US 2)

## 1. Architecture: single domain, single deployment

AI PM Coach is integrated into the existing PM Studio deployment on Azure Static Web Apps — **same domain, same repo, same CI workflow.** No separate Azure resource needed.

```
salmon-moss-07f46dd1e.2.azurestaticapps.net
├── /                        # AI PM Coach UI (client-side SPA, replaced original homepage)
├── /discover                # PM Studio browse + search (existing)
├── /framework/{slug}        # PM Studio deep-dives (existing, 100 pages)
├── /map, /compare, ...      # PM Studio pages (existing)
│
└── /api/                    # Azure Functions backend
    └── /api/chat            # Single endpoint: handles single-skill, debate, and file upload
```

**How this works:**
- **Coach UI** at `/coach` is a `"use client"` page within the Next.js static export. It renders as an HTML shell at build time, then React hydrates it into an interactive chat SPA.
- **API** lives in an `api/` directory at the repo root as **Azure Functions** (Node.js). Azure Static Web Apps natively serves these at `/api/*` on the same origin.
- **Framework links** in coach responses point to `/framework/{slug}` — same-origin internal navigation, no `target="_blank"`, no CORS, no cross-site complexity.

**Why this is better than a separate deployment:**
- One domain — framework links are internal, not cross-origin
- One deployment — single GitHub Actions workflow, no second Azure resource
- One design system — coach pages share the same CSS, fonts, and layout
- Zero CORS — API calls from `/coach` to `/api/*` are same-origin
- Zero cost increase — Azure Static Web Apps Standard plan includes managed Functions

## 2. Changes to existing PM Studio

The following changes are needed in the existing codebase. All are **additive** — no existing pages, components, or behavior are modified.

| Change | Files affected | Nature |
|--------|---------------|--------|
| Add `/coach` page | `app/coach/page.tsx` (new) | New client-side route |
| Add coach components | `components/coach/*.tsx` (new, 7 files) | New component directory |
| Add coach lib modules | `lib/coach-types.ts`, `lib/framework-links.ts` (new) | New utility files |
| Add coach data files | `data/skills-meta.ts`, `data/coach-prompts.ts` (new) | New data files |
| Add Azure Functions | `api/` directory at repo root (new) | New API backend |
| Add API dependencies | `api/package.json` (new) | Separate from framework-studio deps |
| Update navbar | `components/layout/navbar.tsx` | Add "Coach" link to NAV_LINKS |
| Update CI workflow | `.github/workflows/azure-static-web-apps-*.yml` | Change `api_location: ""` → `api_location: "api"` |
| Add new client deps | `package.json` | Add `react-markdown`, `remark-gfm` |

**What is NOT changed:**
- `next.config.ts` — stays `output: "export"`
- All existing pages and components — untouched
- `lib/frameworks.ts`, `lib/types.ts`, etc. — untouched
- Design tokens in `globals.css` — untouched

## 3. Repository layout (after changes)

```
framework-studio/                    # Existing repo root
├── app/
│   ├── page.tsx                     # Homepage (existing — UNCHANGED)
│   ├── coach/
│   │   └── page.tsx                 # NEW — "use client" coach SPA
│   ├── explore/, framework/, ...    # Existing pages — UNCHANGED
│   └── globals.css                  # Design tokens — UNCHANGED
├── components/
│   ├── coach/                       # NEW — coach-specific components
│   │   ├── coach-shell.tsx
│   │   ├── chat-input.tsx
│   │   ├── message-bubble.tsx
│   │   ├── skill-selector.tsx
│   │   ├── debate-synthesis.tsx
│   │   ├── file-upload-zone.tsx
│   │   └── conversation-sidebar.tsx
│   ├── layout/
│   │   ├── navbar.tsx               # MODIFIED — add "Coach" to NAV_LINKS
│   │   └── ...                      # UNCHANGED
│   └── ...                          # Existing components — UNCHANGED
├── lib/
│   ├── coach-types.ts               # NEW — Message, Conversation, SkillId, etc.
│   ├── framework-links.ts           # NEW — auto-link framework names in responses
│   └── ...                          # Existing lib — UNCHANGED
├── data/
│   ├── skills-meta.ts               # NEW — skill metadata for selector pills
│   ├── coach-prompts.ts             # NEW — quick-start prompt cards
│   ├── search-index.json            # Existing — also used by framework-links.ts
│   └── categories.ts                # Existing — also used by skill color mapping
├── api/                             # NEW — Azure Functions backend
│   ├── src/
│   │   ├── functions/
│   │   │   ├── chat.ts              # POST /api/chat — single-skill streaming
│   │   │   ├── classify.ts          # POST /api/classify — skill triage
│   │   │   └── chat-debate.ts       # POST /api/chat-debate — debate orchestration
│   │   └── lib/
│   │       ├── skills.ts            # Load & cache skill .md files
│   │       └── stream.ts            # SSE response helpers
│   ├── skills/                      # Skill prompts (tracked directly in git)
│   │   ├── advise-frameworks.md
│   │   ├── discover-users.md
│   │   └── ... (9 files total)
│   ├── package.json                 # API deps: @anthropic-ai/sdk, @azure/functions
│   ├── tsconfig.json
│   └── host.json                    # Azure Functions host config
├── scripts/
│   ├── migrate-content.ts           # Existing — UNCHANGED
│   └── generate-map-positions.ts    # Existing — UNCHANGED
├── package.json                     # MODIFIED — add react-markdown, remark-gfm
├── next.config.ts                   # UNCHANGED — stays output: "export"
└── .github/workflows/
    └── azure-static-web-apps-*.yml  # MODIFIED — api_location: "api"
```

## 4. Key technical decisions

### 4.1 Static export preserved — coach is a client-side SPA

PM Studio stays on `output: "export"`. The `/coach` page is a `"use client"` component — Next.js exports it as a static HTML shell, and all interactivity (chat, streaming, skill selection) runs client-side in the browser. The page calls `/api/*` endpoints for LLM inference.

```typescript
// app/coach/page.tsx
"use client";

import { CoachShell } from "@/components/coach/coach-shell";

export default function CoachPage() {
  return <CoachShell />;
}
```

### 4.2 Azure Functions for API (same domain)

API endpoints run as Azure Functions linked to the Static Web App. They're in the `api/` directory with their own `package.json` (containing `@anthropic-ai/sdk` and `@azure/functions`). Azure Static Web Apps serves them at `/api/*` on the same origin.

```typescript
// api/src/functions/chat.ts
import { app, HttpRequest, HttpResponseInit } from "@azure/functions";
import Anthropic from "@anthropic-ai/sdk";
import { loadSkill } from "../lib/skills";

app.http("chat", {
  methods: ["POST"],
  route: "chat",
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    const { messages, skill, files } = await req.json();
    const systemPrompt = loadSkill(skill);
    const anthropic = new Anthropic();

    const stream = anthropic.messages.stream({
      model: process.env.COACH_MODEL || "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      messages,
    });

    // Return streaming response
    return {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
      body: createSSEStream(stream),
    };
  },
});
```

**Azure Functions plan:** Standard tier of Azure Static Web Apps includes managed Functions with a 230-second timeout — sufficient for LLM responses including debate mode.

### 4.3 Framework links are internal (same origin)

Since coach and framework pages share the same domain, auto-linked framework names point to `/framework/{slug}` — standard `<a>` links with no `target="_blank"`, no CORS, no cross-origin concerns.

```typescript
// lib/framework-links.ts
import searchIndex from "@/data/search-index.json";

// Build lookup: title/alias → slug
const frameworkMap = new Map<string, string>();
for (const fw of searchIndex) {
  frameworkMap.set(fw.title.toLowerCase(), fw.slug);
  for (const alias of fw.aliases) {
    frameworkMap.set(alias.toLowerCase(), fw.slug);
  }
}

export function linkifyFrameworks(html: string): string {
  // Replace matched framework names with <a href="/framework/{slug}">
  // Skip matches inside <a>, <code>, <pre>, <h1>-<h6>
  // ...
}
```

### 4.4 Skill prompt loading (Azure Functions)

Skill `.md` files are tracked directly in `api/skills/` and committed to git. The Azure Functions read them from disk and cache in memory. No build-time copy step is needed.

### 4.5 No separate package.json for coach UI

Coach UI components are part of the framework-studio Next.js app — they use the same `package.json`. Only two new dependencies are needed:
- `react-markdown` — render LLM markdown responses
- `remark-gfm` — GitHub-flavored markdown (tables, strikethrough)

The API has its own `api/package.json` for server-side deps (`@anthropic-ai/sdk`, `@azure/functions`).

### 4.6 Environment variables

**For Azure Functions** (`api/local.settings.json` for local dev, App Settings in Azure for prod):
```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "",
    "ANTHROPIC_API_KEY": "sk-ant-...",
    "COACH_MODEL": "claude-sonnet-4-6",
    "COACH_MAX_TOKENS": "4096"
  }
}
```

**No `FRAMEWORK_STUDIO_BASE_URL` needed** — framework links are same-origin (`/framework/{slug}`).

## 5. CI/CD workflow (current state)

The workflow at `.github/workflows/azure-static-web-apps-salmon-moss-07f46dd1e.yml` has two jobs:

1. **Validate** — runs `npm ci` + `npm run lint` + `tsc --noEmit` for both frontend and API. Gates deployment via `needs:` dependency.
2. **Build and Deploy** — deploys via `Azure/static-web-apps-deploy@v1`.

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches: [main]

permissions:
  contents: read
  pull-requests: write

jobs:
  validate:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Validate
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm ci
        working-directory: api
      - run: npx tsc --noEmit
        working-directory: api

  build_and_deploy_job:
    needs: validate
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v4
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_SALMON_MOSS_07F46DD1E }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: "api"
          output_location: "out"
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_SALMON_MOSS_07F46DD1E }}
          action: "close"
```

### Runtime app settings (critical)

The workflow `env:` block only provides `ANTHROPIC_API_KEY` at **build time** (Oryx). Azure Functions need it as a **runtime** application setting on the SWA resource. Manage via:

```bash
az staticwebapp appsettings set --name pmframeworkstudio \
  --setting-names "ANTHROPIC_API_KEY=<key>" "COACH_MODEL=claude-sonnet-4-6" "COACH_MAX_TOKENS=4096"
```

Or via the Bicep template at `infra/main.bicep` which defines the SWA resource and all app settings declaratively.

### Infrastructure as Code

`infra/main.bicep` + `infra/main.bicepparam` define the Azure SWA resource, build properties, and application settings. Deploy with:

```bash
az deployment group create --resource-group pmframeworkstudio_group \
  --template-file infra/main.bicep --parameters infra/main.bicepparam \
  --parameters anthropicApiKey='<key>'
```

### Secrets in GitHub

| Secret | Purpose |
|--------|---------|
| `ANTHROPIC_API_KEY` | Claude API key (build-time env for Oryx + must also be set as SWA runtime app setting) |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_SALMON_MOSS_07F46DD1E` | Deployment token for Azure Static Web Apps resource |

## 6. End-to-end slice (Milestone 0)

The thinnest vertical slice to prove the architecture:

```
User visits /coach → types a question → API calls Claude → response streams back → renders as markdown
```

**What Milestone 0 includes:**
- `/coach` page with chat input and message list
- One Azure Function: `POST /api/chat` (hardcoded to `advise-frameworks` skill)
- "Coach" link added to navbar
- No skill selector, no debate, no file upload, no conversation history

**What Milestone 0 proves:**
- Static export + Azure Functions streaming works on the same domain
- Skill prompts load and produce quality responses
- Framework auto-linking works with same-origin links
- Coach page shares PM Studio's design system natively

## 7. Implementation milestones

### Milestone 0 — Thinnest slice (end-to-end proof)

| Step | What to build | Files |
|------|--------------|-------|
| 0.1 | Coach page (client SPA) | `app/coach/page.tsx` |
| 0.2 | Coach types | `lib/coach-types.ts` (Message, SkillId, CoachMode) |
| 0.3 | Azure Functions scaffold | `api/package.json`, `api/host.json`, `api/tsconfig.json` |
| 0.4 | Skill loader (Functions) | `api/src/lib/skills.ts` (read .md, cache) |
| 0.5 | Chat function | `api/src/functions/chat.ts` (load skill, call Claude, stream SSE) |
| 0.6 | Skill prompts | `api/skills/*.md` (9 skill files tracked directly in git) |
| 0.7 | Chat input component | `components/coach/chat-input.tsx` (textarea, send button) |
| 0.8 | Message bubble | `components/coach/message-bubble.tsx` (react-markdown rendering) |
| 0.9 | Coach shell | `components/coach/coach-shell.tsx` (wire input → API → message list) |
| 0.10 | Navbar update | `components/layout/navbar.tsx` — add `{ href: "/coach", label: "Coach" }` |
| 0.11 | Add client deps | `package.json` — add `react-markdown`, `remark-gfm` |
| 0.12 | Update CI workflow | `.github/workflows/*.yml` — set `api_location: "api"` |
| 0.13 | Verify | Visit `/coach`, type a PM question, see streamed markdown response |

### Milestone 1 — Skill selection + auto-routing

| Step | What to build | Files |
|------|--------------|-------|
| 1.1 | Skill metadata | `data/skills-meta.ts` (id, label, shortLabel, color, frameworkCount) |
| 1.2 | Skill selector UI | `components/coach/skill-selector.tsx` (pill bar, radio behavior) |
| 1.3 | Classify function | `api/src/functions/classify.ts` (returns skill ID, non-streaming) |
| 1.4 | Auto-routing flow | In `coach-shell.tsx`: if skill=auto, call classify first, then chat |
| 1.5 | Wire skill badge | Show which skill answered in message bubble |

### Milestone 2 — Framework auto-linking

| Step | What to build | Files |
|------|--------------|-------|
| 2.1 | Link utility | `lib/framework-links.ts` (title/alias → slug map, uses existing search-index.json) |
| 2.2 | Integrate into MessageBubble | After markdown render, run auto-linker on the DOM |
| 2.3 | Style framework links | Accent color, same-origin `<a href="/framework/{slug}">` |

### Milestone 3 — Debate mode

| Step | What to build | Files |
|------|--------------|-------|
| 3.1 | Debate function | `api/src/functions/chat-debate.ts` (parallel dispatch + synthesis) |
| 3.2 | Debate toggle in SkillSelector | Multi-select behavior when debate is on |
| 3.3 | Progress events | SSE `progress` events as individual experts complete |
| 3.4 | Debate synthesis renderer | `components/coach/debate-synthesis.tsx` |

### Milestone 4 — File upload

| Step | What to build | Files |
|------|--------------|-------|
| 4.1 | FileUploadZone component | `components/coach/file-upload-zone.tsx` (drag-drop, chips) |
| 4.2 | Validation | .md only, max 10, max 100KB each |
| 4.3 | API integration | Include file contents in the messages payload |
| 4.4 | System prompt append | `api/src/lib/skills.ts` appends uploaded docs to system prompt |

### Milestone 5 — Multi-turn + conversation management

| Step | What to build | Files |
|------|--------------|-------|
| 5.1 | Conversation state | `lib/coach-types.ts` — Conversation interface, localStorage helpers |
| 5.2 | Multi-turn messages | Send conversation history array to API |
| 5.3 | Conversation sidebar | `components/coach/conversation-sidebar.tsx` |
| 5.4 | New chat / switch / delete | CRUD operations on localStorage conversations |

### Milestone 6 — Polish

- Empty state with quick-start prompt cards (`data/coach-prompts.ts`)
- Responsive layout (mobile fixed input, sidebar drawer)
- Stop streaming button
- Copy to clipboard
- Error handling (API errors, timeouts, rate limits)

## 8. Key component contracts

### CoachShell (`components/coach/coach-shell.tsx`)

```
State:
  messages: Message[]
  isStreaming: boolean
  selectedSkill: SkillId       // "auto" | specific skill
  debateMode: boolean
  selectedDebateSkills: SkillId[]
  uploadedFiles: UploadedFile[]

Methods:
  handleSend(text: string):
    if debateMode → call /api/chat-debate
    else if skill === "auto" → call /api/classify, then /api/chat
    else → call /api/chat with selected skill

  handleStop(): abort the fetch controller

  handleSkillToggle(id): update selectedSkill or selectedDebateSkills
  handleDebateToggle(): flip debateMode, reset skill selection
  handleFileAdd/Remove(): manage uploadedFiles
```

### ChatInput

```
Props: onSend, onStop, isStreaming, disabled
Renders: textarea (auto-resize) + paperclip icon + send/stop button
Behavior: Enter sends, Shift+Enter newline
```

### MessageBubble

```
Props: message, isStreaming
Renders:
  - User: right-aligned, accent tint bg, plain text
  - Assistant: left-aligned, surface bg, skill badge, markdown content, timestamp
  - If isStreaming: blinking cursor at end
Markdown: react-markdown + remark-gfm, custom renderers for headings/tables/code
Framework links: post-process with framework-links.ts → same-origin /framework/{slug}
```

### SkillSelector

```
Props: selectedSkills, debateMode, onSkillToggle, onDebateToggle
Renders: horizontal pill bar
  - "Auto" pill (always first)
  - 7 domain pills with category colors
  - "Debate" toggle (far right, speech-bubbles icon)
Behavior:
  - debate off → radio (one at a time)
  - debate on → checkbox (2–7 required), Auto disabled
```

## 9. API function contracts

### POST /api/chat

```
Request:
  { messages: {role, content}[], skill: SkillId, files?: {name, content}[] }

Response: SSE stream
  data: {"type":"skill","skillId":"discover-users","skillLabel":"User Insights"}
  data: {"type":"token","text":"Based on..."}
  data: {"type":"token","text":" your situation"}
  ...
  data: {"type":"done","usage":{"input_tokens":1234,"output_tokens":567}}

Implementation:
  1. Load skill prompt from api/skills/{skill}.md
  2. Build system message: skill prompt + integration context + file contents
  3. Call anthropic.messages.stream()
  4. Pipe delta events as SSE
```

### POST /api/classify

```
Request:
  { message: string, files?: {name, content}[] }

Response: JSON (non-streaming)
  { skill: SkillId, confidence: number, reasoning: string }

Implementation:
  1. Build a condensed classification prompt (extract routing table from advise-frameworks.md)
  2. Call anthropic.messages.create() (non-streaming, fast)
  3. Parse structured response to extract skill ID
```

### POST /api/chat-debate

```
Request:
  { messages: {role, content}[], skills: SkillId[], files?: {name, content}[] }

Response: SSE stream
  data: {"type":"progress","expertsComplete":0,"expertsTotal":7}
  data: {"type":"progress","expertsComplete":1,"expertsTotal":7}
  ...
  data: {"type":"skill","skillId":"pm-debate","skillLabel":"Debate Synthesis"}
  data: {"type":"token","text":"## Consensus\n..."}
  ...
  data: {"type":"done","usage":{...}}

Implementation:
  1. For each skill: build expert prompt with [DEBATE MODE ACTIVE] prefix
  2. Fire all Claude calls with Promise.all() (true parallelism)
  3. As each resolves, send progress SSE event
  4. Once all complete, build synthesis prompt from pm-debate.md + all expert outputs
  5. Stream synthesis response as token events
```

## 10. Verification plan

| Milestone | How to verify |
|-----------|---------------|
| M0 | Visit `localhost:4280/coach` (SWA CLI). Type "How do I prioritize my backlog?" → see streaming markdown response. All existing PM Studio pages still work at same origin. |
| M1 | Select "Validation" pill → response uses validate-bets skill. Select "Auto" → response shows correct auto-routed skill badge. |
| M2 | Response mentions "RICE Scoring" → renders as a clickable link to `/framework/rice-scoring` (same-origin, no new tab). Click it → opens the deep-dive page. |
| M3 | Toggle debate mode → submit question → see progress indicator (1/7, 2/7...) → see structured synthesis with Consensus/Tensions/Blind Spots. |
| M4 | Upload a .md file → response references content from the file. Upload .pdf → rejected. Upload 11 files → rejected. |
| M5 | Send 3 messages → refresh page → conversation persists. Click "+ New chat" → starts fresh. Sidebar shows conversation list. |
| M6 | Resize to mobile → input fixed to bottom, sidebar becomes drawer. Click stop → streaming halts. Click copy → markdown in clipboard. |

## 11. Local development setup

Azure Static Web Apps CLI (`swa`) runs both the static frontend and Azure Functions locally:

```bash
# Install SWA CLI (one-time)
npm install -g @azure/static-web-apps-cli

# Install API dependencies
cd api && npm install && cd ..

# Create api/local.settings.json
cat > api/local.settings.json << 'EOF'
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "",
    "ANTHROPIC_API_KEY": "sk-ant-YOUR_KEY_HERE"
  }
}
EOF

# Start everything on port 4280
swa start http://localhost:3000 --run "npm run dev" --api-location api
```

This starts:
- Next.js dev server on port 3000 (static pages)
- Azure Functions on port 7071 (API)
- SWA CLI proxy on **port 4280** (routes `/api/*` to Functions, everything else to Next.js)

Access the app at `http://localhost:4280`. Both `/coach` and `/framework/*` pages work on the same origin.

## 12. Risk mitigations

| Risk | Mitigation |
|------|-----------|
| Azure Functions managed by SWA may buffer SSE responses | Test streaming early in Milestone 0. Fallback: use SWA "Bring Your Own Backend" to link an Azure Functions Premium app (still same domain). |
| Azure Functions 230s timeout on Standard plan | Single-skill responses complete in <30s. Debate mode (7 parallel + synthesis) may approach 45s. Well within limits. |
| Adding `react-markdown` increases PM Studio bundle | Only imported by coach components; Next.js tree-shakes it from non-coach pages. Verify with `next build` bundle analysis. |
| `api/` directory confuses existing PM Studio build | Azure SWA builds the `api/` directory separately. Next.js `output: "export"` ignores it. The `api/` folder has its own `package.json` — completely independent build. |
| Skill prompts missing at runtime | Skill `.md` files are tracked directly in `api/skills/` — available after `git checkout` with no build step needed. |
| SWA Free plan has limited Functions | Upgrade to Standard plan ($9/month) for 230s timeout and production-grade Functions. Free plan has 45s timeout which may be tight for debate mode. |

## 13. Hosting comparison: before and after

| Aspect | Before (PM Studio only) | After (PM Studio + Coach) |
|--------|-------------------------------|----------------------------------|
| **Azure resource** | Azure Static Web Apps (salmon-moss) | Same resource — no new Azure resource |
| **Domain** | salmon-moss-07f46dd1e.2.azurestaticapps.net | Same domain |
| **Static pages** | 118 pages | 119 pages (+1 for `/coach`) |
| **API** | None (`api_location: ""`) | Azure Functions (`api_location: "api"`) |
| **CI workflow** | 1 workflow | Same workflow (updated `api_location`) |
| **Secrets** | 1 (`AZURE_STATIC_WEB_APPS_API_TOKEN_*`) | 2 (+`ANTHROPIC_API_KEY`) |
| **Plan** | Free or Standard | Standard recommended ($9/month for 230s function timeout) |
| **Framework links** | N/A | Same-origin: `/framework/{slug}` |
