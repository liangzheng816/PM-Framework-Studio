# PRD — AI PM Coach

## 1. Document status
- Version: v0.1 (Draft)
- Date: 2026-04-08
- Parent PRD: `PRD/pmframe_inspired_prd.md` (PM Studio v1.0)
- Audience: Claude Code, full-stack product/design/engineering teams
- Purpose: Build a standalone AI-powered PM coaching web application that translates the 9 existing PM Skills (currently Claude Code slash commands) into an interactive web-based consultancy experience, with deep cross-links to PM Studio for methodology and framework reference detail.

---

## 2. Product summary

### 2.1 Working title
**AI PM Coach**

### 2.2 One-line pitch
A ChatGPT-style conversational interface that gives product teams on-demand access to 9 domain-expert PM consultants and a multi-expert debate mode, all powered by the same 100-framework knowledge base that drives PM Studio.

### 2.3 Product vision
Complement PM Studio's reference library with an active coaching product. Users describe their situation in natural language, optionally upload context documents, and receive expert-level PM guidance grounded in 100 source-verified frameworks — with every recommended framework linking out to its deep-dive page on PM Studio.

### 2.4 Why now
1. The 9 PM Skills already encode deep domain expertise (~125 KB of structured prompts) but are only accessible via Claude Code CLI — a developer-only surface.
2. PM Studio v1.0 established the content and design foundation; "In-product AI tutor" was explicitly deferred as a non-goal for MVP (§3.3 of parent PRD).
3. LLM API costs and streaming infrastructure have matured enough to support a web-based inference product at acceptable latency and cost.
4. User feedback on PM Studio's Guided Finder (§12.7 of parent PRD) indicates demand for conversational discovery that goes beyond a 4-question wizard.

### 2.5 Relationship to PM Studio v1.0
AI PM Coach is a **separate web application** deployed independently from PM Studio. PM Studio remains an unmodified static site hosted on Azure Static Web Apps at its existing domain. AI PM Coach is deployed to its own Azure resource (e.g., Azure App Service or a separate Azure Static Web App + Functions) at a different origin.

The two products are connected through **cross-origin framework deep-links**: every framework name mentioned in a coach response links to `{FRAMEWORK_STUDIO_BASE_URL}/framework/{slug}` on PM Studio. This keeps PM Studio as the authoritative reference layer while AI PM Coach serves as the interactive consultancy layer.

```
┌──────────────────────┐          ┌──────────────────────────┐
│   AI PM Coach        │          │   PM Studio       │
│   (coach.example.com)│  links → │   (studio.example.com)   │
│                      │          │                          │
│   Chat interface     │          │   /framework/[slug]      │
│   Skill selector     │          │   /explore               │
│   Debate mode        │          │   /map, /compare, etc.   │
│   File upload        │          │                          │
│                      │          │   Static site (unchanged)│
│   API (Functions)    │          │   Azure Static Web Apps  │
└──────────────────────┘          └──────────────────────────┘
```

**Key implications of separate deployment:**
- PM Studio requires zero code changes — no new routes, no nav updates, no homepage relocation
- AI PM Coach owns its own domain, deployment pipeline, and scaling configuration
- Framework links open in a new tab (`target="_blank"`) since they navigate to a different origin
- The coach must be configured with `FRAMEWORK_STUDIO_BASE_URL` to construct correct deep-links
- The two products can be versioned, deployed, and scaled independently

---

## 3. Product goals

### 3.1 Primary goals
1. Make the 9 PM Skills accessible to any user with a browser — no CLI, no developer tooling required.
2. Provide streaming, multi-turn conversational PM coaching with framework-aware responses.
3. Allow users to select specific skills or invoke debate mode for multi-expert analysis.
4. Support markdown file uploads so users can provide context (PRDs, research notes, strategy docs).
5. Cross-link every recommended framework to its deep-dive page on PM Studio (external links to the separate static site).

### 3.2 Business/product goals
1. Increase average session duration by 3× through conversational engagement.
2. Create a differentiated product surface that competitors (static framework sites) cannot replicate.
3. Establish a foundation for future premium tiers (usage-based pricing, team workspaces, saved coaching sessions).
4. Drive deeper exploration of the framework library through contextual links in coach responses.

### 3.3 Non-goals for this version
- User accounts or authentication (sessions are browser-local)
- Payment/subscription system
- Custom fine-tuned model training
- Non-English language support
- Voice input/output
- Mobile native app
- Collaborative/shared coaching sessions
- Editing or generating PM Skills prompts from the UI
- File uploads of non-markdown formats (PDF, DOCX, images)

---

## 4. Users

### 4.1 Primary personas

#### Persona E — PM seeking active guidance
- Mid-career PM facing a specific product decision (what to prioritize, how to validate, which research method to use)
- Has tried reading framework pages but wants contextual advice applied to THEIR situation
- Values practical, opinionated recommendations over encyclopedic coverage

#### Persona F — PM learner exploring through conversation
- Early-career PM, MBA student, or career switcher who learns better through dialogue than reading
- Asks broad questions ("How do I figure out what my users actually need?") and wants to be guided to the right frameworks
- Values the feeling of having a knowledgeable mentor available on demand

#### Persona G — Product leader running a structured exercise
- Senior PM, product lead, or consultant who wants a multi-perspective analysis of a strategic decision
- Uses debate mode to surface tensions, blind spots, and framework recommendations across 7 domains
- Uploads existing PRDs or strategy docs for contextual coaching
- Values thoroughness, structure, and the ability to choose which expert perspectives to include

### 4.2 Core user jobs (extending §4.2 of parent PRD)
- "I have a product problem and I want expert guidance on which framework to use and how to apply it."
- "I want multiple expert perspectives on the same challenge to find blind spots."
- "I have a PRD/doc I want analyzed through a PM framework lens."
- "I want to go deeper on a framework that was recommended to me in conversation."
- "I want a conversational way to explore frameworks rather than browsing a catalog."

---

## 5. Product principles

Inherits all 7 principles from §5 of the parent PRD, plus:

8. **Conversation is the interface** — the primary interaction is typing a question and getting expert guidance, not clicking through menus.
9. **Expert, not generic** — responses must demonstrate deep framework knowledge, not generic consulting advice. Every recommendation must name specific frameworks and explain WHY.
10. **Transparent routing** — when the system selects a skill or invokes debate mode, the user can see which expert(s) are responding and why.
11. **Connected, not siloed** — every framework mentioned in a coach response should link to its deep-dive page on PM Studio, creating a bridge between conversational and reference modes.
12. **Visually cohesive across sites** — AI PM Coach adopts PM Studio's Midnight Editorial design system (same CSS tokens, typography, colors) so that navigating between the two products feels like a single experience despite separate deployments.

---

## 6. Information architecture

### 6.1 Deployment topology

AI PM Coach is a **standalone application** deployed separately from PM Studio. PM Studio requires **zero modifications** — no route changes, no navigation updates, no homepage relocation.

| Application | Domain (example) | Hosting | Changes required |
|-------------|-----------------|---------|-----------------|
| PM Studio | `studio.example.com` | Azure Static Web Apps | None |
| AI PM Coach | `coach.example.com` | Azure App Service or Azure Static Web App + linked Functions | New application |

### 6.2 AI PM Coach routes

| Route | Description |
|-------|-------------|
| `/` | Coach interface (chat, skill selector, debate mode) |
| `/about` | About page explaining AI PM Coach, linking to PM Studio |

### 6.3 AI PM Coach navigation

The coach app has its own navbar:

| Link | Target |
|------|--------|
| "Coach" | `/` (internal — coach homepage) |
| "Framework Library" | `{FRAMEWORK_STUDIO_BASE_URL}/explore` (external — opens PM Studio in new tab) |
| "Framework Map" | `{FRAMEWORK_STUDIO_BASE_URL}/map` (external — opens PM Studio in new tab) |
| "About" | `/about` (internal) |

This provides a seamless bridge to PM Studio for users who want to browse the reference library directly.

### 6.4 Cross-origin framework linking

Every framework name mentioned in a coach response links to `{FRAMEWORK_STUDIO_BASE_URL}/framework/{slug}`. These are external links that open in a new browser tab (`target="_blank"`, `rel="noopener noreferrer"`). The base URL is configured via the `FRAMEWORK_STUDIO_BASE_URL` environment variable.

### 6.5 New content objects

| Object | Description |
|--------|-------------|
| `Conversation` | A multi-turn chat session with messages, skill context, and uploaded files |
| `Message` | A single user or assistant turn with role, content (markdown), timestamps, and metadata |
| `SkillInvocation` | A record of which skill system prompt was used for a given response |

---

## 7. Core user flows

### Flow E — Quick question (single skill, auto-routed)
1. User lands on `/` and sees the coach interface with centered input
2. Types a question: "How do I prioritize my Q3 roadmap?"
3. System invokes `/advise-frameworks` triage to determine the best skill
4. Triage routes to `/ship-decisions` (Execution domain)
5. Response streams in with diagnosis, 1–3 recommended frameworks, and deep-dive links
6. User clicks a framework link to read more, or continues the conversation

### Flow F — Skill selection (user-directed)
1. User opens the skill selector (pill bar above the input)
2. Selects "Validation" skill
3. Types: "We have a hypothesis that users want collaborative editing but only surveyed 5 people"
4. System uses `/validate-bets` system prompt directly (no triage)
5. Expert walks through relevant validation frameworks applied to their context

### Flow G — Debate mode
1. User toggles "Debate" mode via the mode switcher
2. Optionally narrows to 2–4 specific skills using the skill selector chips
3. Types: "We're a B2B SaaS with 10K users but only 2% convert to paid"
4. System dispatches the problem to all selected domain experts in parallel
5. Responses stream in as a structured synthesis: Consensus, Tensions, Blind Spots, Top Frameworks, Recommended Sequence, Deep Dive suggestions

### Flow H — Document-assisted coaching
1. User clicks the upload icon in the input area
2. Selects 1–3 `.md` files (e.g., a PRD, research summary, strategy doc)
3. Files appear as removable chips below the input
4. User types: "Analyze this PRD through a validation lens"
5. File contents are prepended to the user message as context
6. Skill provides analysis grounded in the uploaded documents

### Flow I — Cross-link exploration
1. During a coach conversation, the response mentions "RICE Scoring" and "MoSCoW"
2. Each framework name renders as an inline link to PM Studio (e.g., `studio.example.com/framework/rice-scoring`)
3. User clicks a link — it opens the PM Studio deep-dive page in a new tab
4. The coach conversation persists in the original tab; user switches back to continue

---

## 8. Functional requirements

### 8.1 Chat interface

The coach interface must:
- Display a centered, prominent text input area as the primary interaction point
- Support multi-turn conversation with full message history visible
- Stream assistant responses token-by-token (not wait for completion)
- Render assistant responses as rich markdown (headings, lists, tables, code blocks, bold/italic)
- Auto-link framework names in responses to their deep-dive pages on PM Studio (external links, new tab)
- Support keyboard shortcuts: `Enter` to send, `Shift+Enter` for newline
- Auto-resize the input textarea up to 6 lines, then scroll internally
- Show a loading/thinking indicator during inference
- Allow the user to stop a streaming response mid-generation

Acceptance criteria:
- First token appears within 2 seconds of sending a message (p50)
- Full response streams at perceptible token rate (no large buffered chunks)
- Conversation history persists across page navigation within the same browser session (localStorage)
- Markdown rendering handles all elements present in skill outputs: headings (h2–h4), tables, bold, italic, bullet lists, numbered lists, code blocks, horizontal rules

### 8.2 Skill selector

The skill selector must:
- Display all 7 domain skills plus "Auto" mode as selectable options
- Default to "Auto" mode (triage via `/advise-frameworks`)
- Allow selecting exactly one skill for single-skill mode
- Allow selecting 2–7 skills when debate mode is active
- Show skill name and short domain label (e.g., "Validation — Testing & Evidence")
- Use category colors from the design system for each skill chip
- Persist selection across messages within the same conversation

Skill-to-category color mapping:

| Skill | Category color variable |
|-------|----------------------|
| Auto (`/advise-frameworks`) | `--color-accent` (triage/meta) |
| `/discover-users` | `--color-cat-user-insights` |
| `/frame-problems` | `--color-cat-problem-framing` |
| `/generate-ideas` | `--color-cat-ideation` |
| `/validate-bets` | `--color-cat-validation` |
| `/ship-decisions` | `--color-cat-execution` |
| `/grow-product` | `--color-cat-growth` |
| `/think-systems` | `--color-cat-systems-thinking` |

Acceptance criteria:
- Skill selection is visible and accessible without scrolling on desktop
- On mobile, skill selector is a horizontally scrollable pill bar
- "Auto" mode is clearly the default with visual distinction
- Switching skills mid-conversation starts a new context (with confirmation dialog)

### 8.3 Debate mode toggle

The debate mode must:
- Be a distinct, visually prominent toggle (not just another skill chip)
- When enabled, change the skill selector to allow multi-select (2–7 skills)
- Default to all 7 domain experts when no specific skills are selected
- Support `--versus` semantics when exactly 2 skills are selected (head-to-head format)
- Produce structured synthesis output matching the debate output schema (§8.7)

Acceptance criteria:
- Toggle state is visually unambiguous (not just a color change — use icon, label, and position)
- Debate responses render with clear section headers: Consensus, Tensions, Blind Spots, Top Frameworks, Recommended Sequence
- Each section uses appropriate visual treatment (e.g., Tensions use a two-column comparison layout on desktop)

### 8.4 File upload

The file upload must:
- Accept only `.md` (markdown) files
- Enforce a maximum of 10 files per conversation
- Enforce a maximum of 100 KB per individual file
- Display uploaded files as removable chips with filename and size
- Include file contents as context in the LLM prompt (prepended before the user message)
- Support drag-and-drop onto the input area as well as a file picker button

Acceptance criteria:
- Non-`.md` files are rejected with a clear error message
- Files exceeding 100 KB are rejected with a clear error message
- Attempting to upload an 11th file shows the limit error
- File contents are faithfully included in the prompt (no truncation below 100 KB)
- Drag-and-drop zone activates with a visual border highlight

### 8.5 Response rendering

Responses must:
- Render full markdown with the existing design system typography
- Use `--font-heading` for h2/h3, `--font-body` for body text, `--font-mono` for code blocks
- Auto-detect framework names and convert to external links pointing to PM Studio (match against the 100 slugs bundled from `data/search-index.json`)
- Render debate synthesis sections with distinct visual containers
- Support copy-to-clipboard for individual messages or the full conversation

Framework auto-linking algorithm:
1. At build time, bundle a copy of PM Studio's `search-index.json` (`slug` → `title`, `aliases`) into the coach app
2. Build a lookup map: `title` → `slug`, `alias` → `slug` (case-insensitive)
3. Sort keys by length descending (match longest first to avoid partial matches)
4. After markdown rendering, scan text nodes for exact matches
5. Replace matches with `<a href="{FRAMEWORK_STUDIO_BASE_URL}/framework/{slug}" target="_blank" rel="noopener noreferrer">` styled with `--color-accent` and an external-link icon
6. Skip matches inside code blocks, headings, or already-linked text

The search index is a static JSON file (~40 KB) copied from PM Studio at build time via `scripts/sync-search-index.ts`. It does not require a runtime dependency on PM Studio.

Acceptance criteria:
- At least 90% of framework names mentioned in responses are correctly auto-linked
- Framework links open PM Studio in a new tab (external navigation)
- Links display a subtle external-link icon (↗) to signal cross-site navigation
- Markdown tables render with proper alignment and borders
- Code blocks use JetBrains Mono with syntax highlighting
- Debate synthesis sections have visual separators and distinct background treatment

### 8.6 Conversation management

The system must:
- Store conversation history in `localStorage` (keyed by conversation ID)
- Support creating a new conversation (clears context)
- Support a conversation list sidebar (collapsible) showing recent conversations
- Auto-title conversations based on the first user message (truncated to 60 characters)
- Limit stored conversations to the most recent 50 (LRU eviction)

Acceptance criteria:
- Conversations persist across page refreshes
- Switching conversations restores full message history and skill selection
- "New conversation" button is always accessible
- Conversation list is searchable by title

### 8.7 Skill invocation model

#### Single-skill mode (Auto)

```
1. User sends message
2. System calls /api/classify with the user message
3. Classify endpoint returns the recommended skill ID
4. System calls /api/chat with the specific skill ID + user message
5. Streamed response delivered to user with skill badge
```

The classification call uses a condensed version of the `/advise-frameworks` prompt that returns only a skill identifier. This is a non-streaming, fast call.

#### Single-skill mode (user-selected)

```
1. User selects a specific skill via the pill bar
2. User sends message
3. System calls /api/chat with that skill ID + user message
4. Streamed response delivered to user with skill badge
```

#### Debate mode

```
1. User enables debate mode, optionally selects 2–7 skills
2. User sends message
3. System calls /api/chat/debate with selected skill IDs + user message
4. Server dispatches parallel LLM calls, each with:
   - The selected skill's full system prompt
   - [DEBATE MODE ACTIVE] prefix
   - The user's message (plus any uploaded file context)
5. All responses collected in parallel
6. Server makes one final synthesis call using the pm-debate synthesis prompt
   with all expert responses as input
7. Synthesized response streamed to user
```

#### System prompt construction

Each LLM call constructs messages as:

```yaml
messages:
  - role: system
    content: |
      {full content of the skill .md file}

      ## Context: PM Studio Integration
      When you mention a framework, use its exact canonical title as listed in
      your toolkit table. The web interface will auto-link these to deep-dive
      pages on PM Studio (a separate reference site). Use exact titles
      so the auto-linker can match them reliably.

      ## Uploaded Documents
      {contents of any uploaded .md files, each prefixed with filename}
  - role: user
    content: "{user's message}"
  # For multi-turn: include prior conversation messages
```

---

## 9. UX design specification

### 9.1 Overall layout — Coach page (`/`)

```
+------------------------------------------------------------------+
|  NavBar (Coach logo | Coach | Framework Library↗ | Map↗ | About) |
+------------------------------------------------------------------+
|                                                                    |
|  [Sidebar]     |  [Main chat area]                                |
|  (collapsible) |                                                  |
|                |  +--------------------------------------+        |
|  [+ New chat]  |  |                                      |        |
|  [Conv 1]      |  |  Empty state / message history       |        |
|  [Conv 2]      |  |  (scrollable)                        |        |
|  [...]         |  |                                      |        |
|                |  +--------------------------------------+        |
|                |                                                  |
|                |  +--------------------------------------+        |
|                |  | [Auto] [Users] [Problems] [Ideas]    |        |
|                |  | [Valid.] [Exec.] [Growth] [Systems]  |        |
|                |  |                      [Debate toggle]  |        |
|                |  +--------------------------------------+        |
|                |  | [Uploaded file chips]                 |        |
|                |  +--------------------------------------+        |
|                |  | [Upload] [   Input textarea   ] [Send]|       |
|                |  +--------------------------------------+        |
|                                                                    |
+------------------------------------------------------------------+
|  Footer (with link to PM Studio)                           |
+------------------------------------------------------------------+
```

### 9.2 Empty state (new conversation)

When no messages exist, the main area displays:

- Large heading: **"What product challenge are you working on?"** (Instrument Serif, `text-3xl`)
- Subhead: "Describe your situation and get expert PM framework guidance." (Inter, `--color-text-muted`)
- 3×3 grid (desktop) or 2×3 grid (mobile) of quick-start prompt cards:
  - "Help me prioritize my roadmap"
  - "How do I validate this idea before building?"
  - "What research method should I use?"
  - "Analyze my PRD for blind spots" *(suggests file upload)*
  - "Compare frameworks for my situation"
  - "Run a multi-expert debate on my strategy" *(activates debate mode)*
- Each card is clickable and populates the input area with the prompt text
- Cards use `--color-surface` background, `--radius-lg`, `--shadow-sm` elevation, hover → `--shadow-md`
- Skill selector and input area remain fixed at the bottom

### 9.3 Skill selector detail

A horizontal row of pill-shaped chips rendered above the input area:

- **First chip**: "Auto" (always present, the default) — uses `--color-accent` background when active
- **7 domain chips**: "Users", "Problems", "Ideas", "Validation", "Execution", "Growth", "Systems" — each using its category color when active
- **Debate toggle**: positioned at the far right, visually distinct with a speech-bubbles icon — uses `--color-accent-2`

Behavior:
- **Single-skill mode** (debate off): clicking a chip selects it exclusively (radio behavior); clicking the active chip returns to "Auto"
- **Debate mode** (debate on): chips become multi-select (checkbox behavior); at least 2 must be selected; "Auto" is disabled; all 7 domain chips are pre-selected by default
- **Active chips**: filled background with white text
- **Inactive chips**: `--color-border` outline, `--color-text-muted` text
- When exactly 2 skills are selected in debate mode, a "Head-to-Head" badge appears next to the debate toggle

### 9.4 Input area detail

- Textarea with placeholder: "Describe your product challenge..."
- Min height: 48px (single line); max height: 168px (6 lines); then internal scroll
- Background: `--color-surface`
- Border: 1px `--color-border`, `--radius-lg`
- Focus state: border transitions to `--color-accent`
- Left icon: paperclip (upload trigger), `--color-text-subtle`
- Right button: send arrow, `--color-accent` background, `--radius-full`
- During streaming: send button morphs to stop (square) icon
- `Enter` sends; `Shift+Enter` inserts newline

### 9.5 Message bubbles

**User messages:**
- Right-aligned, max-width 80%
- Background: `--color-accent` at 10% opacity
- Border-radius: `--radius-lg`
- Text: `--color-text`, `--font-body`

**Assistant messages:**
- Left-aligned, max-width 90%
- Background: `--color-surface`
- Border-radius: `--radius-lg`
- **Skill badge**: small pill at top-left showing which skill responded (e.g., "Execution" in `--color-cat-execution`)
- Content: full markdown rendering
- Footer: copy button (icon), relative timestamp (e.g., "2m ago")

**Debate synthesis messages:**
- Full-width, no max-width constraint
- Section headers (Consensus, Tensions, etc.) render as styled cards within the message
- "Tensions" section: side-by-side layout on desktop (two columns with vs. divider), stacked on mobile
- "Top Frameworks": ranked list with framework deep-dive links
- "Recommended Sequence": horizontal chain/flow diagram (desktop) or vertical numbered list (mobile)

### 9.6 Conversation sidebar

- Width: 280px on desktop, full-screen slide-in drawer on mobile
- Background: `--color-bg`
- Border-right: 1px `--color-border`
- **"+ New chat"** button at top: full-width, `--color-accent` outline, `--radius-md`
- Conversation items: auto-generated title, relative date, skill badge (most-used skill)
- Active conversation: `--color-surface-2` background
- Collapse toggle: chevron icon in sidebar header
- Mobile: hamburger icon in navbar triggers sidebar as slide-in drawer from left

---

## 10. Component specification

### 10.1 CoachShell

Top-level layout for the coach page.

```yaml
location: components/coach/coach-shell.tsx
type: client component
children:
  - ConversationSidebar
  - ChatArea
    - EmptyState (when no messages)
    - MessageList (when messages exist)
    - SkillSelector
    - FileUploadChips
    - ChatInput
responsibilities:
  - Manages conversation state (current conversation ID, messages)
  - Provides CoachContext (React context) to children
  - Handles API calls (classify, chat, debate)
  - Manages streaming state
```

### 10.2 ChatInput

```yaml
location: components/coach/chat-input.tsx
type: client component
props:
  onSend: (message: string) => void
  onStop: () => void
  isStreaming: boolean
  disabled: boolean
elements:
  - auto-resizing textarea
  - upload button (paperclip icon)
  - send/stop button (toggles based on isStreaming)
  - hidden file input (accept=".md")
acceptance:
  - textarea resizes from 1 to 6 lines automatically
  - Enter sends, Shift+Enter newlines
  - disabled during streaming (except stop button)
  - focus ring uses --color-accent
```

### 10.3 SkillSelector

```yaml
location: components/coach/skill-selector.tsx
type: client component
props:
  selectedSkills: SkillId[]
  debateMode: boolean
  onSkillToggle: (skillId: SkillId) => void
  onDebateToggle: () => void
elements:
  - horizontal pill bar (scrollable on mobile)
  - "Auto" pill
  - 7 domain pills (each with category color)
  - "Debate" toggle pill (with icon)
acceptance:
  - single-select behavior when debate off
  - multi-select behavior when debate on
  - pills use category colors when active, muted outline when inactive
  - horizontally scrollable on mobile with no clip
  - "Head-to-Head" badge when exactly 2 selected in debate mode
```

### 10.4 MessageBubble

```yaml
location: components/coach/message-bubble.tsx
type: client component
props:
  message: Message
  isStreaming: boolean
elements:
  - role indicator (user/assistant)
  - skill badge for assistant messages
  - markdown content (rendered via react-markdown or similar)
  - framework auto-links
  - copy button
  - relative timestamp
acceptance:
  - streaming messages show blinking cursor at end of content
  - framework names are clickable external links to PM Studio (new tab)
  - copy button copies raw markdown to clipboard
  - user messages right-aligned, assistant messages left-aligned
```

### 10.5 DebateSynthesis

Specialized renderer for debate-mode responses.

```yaml
location: components/coach/debate-synthesis.tsx
type: client component
props:
  content: string (markdown with known section headers)
elements:
  - section cards for: Consensus, Tensions, Blind Spots, Top Frameworks, Recommended Sequence, Deep Dive
  - tension comparison layout (side-by-side on desktop, stacked on mobile)
  - framework rank list with deep-dive links
  - sequence chain/flow visualization
acceptance:
  - parses H2 headers to identify synthesis sections
  - each section has distinct visual treatment (background, icon, border color)
  - responsive: side-by-side → stacked at md breakpoint
  - framework names within sections are auto-linked
```

### 10.6 FileUploadZone

```yaml
location: components/coach/file-upload-zone.tsx
type: client component
props:
  files: UploadedFile[]
  onAdd: (files: File[]) => void
  onRemove: (fileId: string) => void
  maxFiles: 10
  maxSizeBytes: 102400 (100 KB)
elements:
  - drag-and-drop overlay (visible on dragover)
  - file chip list (filename, size, remove × button)
  - file count indicator ("3/10 files")
acceptance:
  - rejects non-.md files with toast notification
  - rejects files > 100 KB with toast notification
  - drag overlay shows dashed border with --color-accent
  - chips show file icon, name (truncated at 24 chars), size in KB, and remove button
  - drop zone covers the entire input area on drag
```

### 10.7 ConversationSidebar

```yaml
location: components/coach/conversation-sidebar.tsx
type: client component
props:
  conversations: ConversationSummary[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
elements:
  - "+ New chat" button
  - search input (filter by title)
  - conversation item list (title, date, skill badge)
  - collapse/expand toggle
acceptance:
  - conversations sorted by last activity (most recent first)
  - search filters by title substring
  - swipe-to-delete on mobile, hover × button on desktop
  - collapsed state persists in localStorage
  - active conversation highlighted with --color-surface-2
```

---

## 11. Technical architecture

### 11.1 Architecture: separate application with cross-site framework links

AI PM Coach is deployed as its own application, **completely independent** from PM Studio. PM Studio remains an unmodified static site on Azure Static Web Apps. The two applications are connected only by cross-origin hyperlinks: the coach links out to PM Studio's `/framework/{slug}` pages for deep-dive reference content.

```
┌─────────────────────────────────────────────────────┐
│  AI PM Coach (coach.example.com)                    │
│                                                     │
│  Next.js app (hybrid: static shell + API routes)    │
│  ┌───────────────────┐  ┌────────────────────────┐  │
│  │ Client (React SPA)│  │ API (Azure Functions)  │  │
│  │                   │→ │ POST /api/classify     │  │
│  │ Chat UI           │  │ POST /api/chat         │  │
│  │ Skill selector    │  │ POST /api/chat/debate  │  │
│  │ File upload       │  │        │               │  │
│  └───────────────────┘  └────────┼───────────────┘  │
│                                  ▼                  │
│                         Anthropic Claude API        │
└──────────────────────────┬──────────────────────────┘
                           │ external links
                           │ (target="_blank")
                           ▼
┌─────────────────────────────────────────────────────┐
│  PM Studio (studio.example.com)              │
│                                                     │
│  Azure Static Web Apps (unchanged)                  │
│  /framework/{slug}  — deep-dive pages               │
│  /explore           — browse + search               │
│  /map               — interactive SVG scatter       │
│  /compare, /finder, /collections, /about            │
└─────────────────────────────────────────────────────┘
```

**Why separate deployment:**
- PM Studio remains a zero-change, zero-risk static site — no code modifications, no redeployment
- AI PM Coach can use a different hosting tier (Azure App Service, or Azure Static Web App with linked Functions) sized for LLM API workloads
- Independent scaling: coach API scales on demand; PM Studio's CDN-served pages are unaffected
- Independent release cycles: coach features ship without touching the reference library
- Skill prompts remain server-side (not exposed to the client)

**Why NOT embed coach inside PM Studio:**
- PM Studio uses `output: "export"` (fully static) — adding API routes would require removing this and fundamentally changing the deployment model
- Cold-start latency for LLM endpoints would degrade the currently instant static pages
- Higher blast radius: a coach deployment failure could take down the reference library

**Why NOT client-side only with user's API key:**
- Poor UX: requires users to have an Anthropic API key
- Exposes skill prompts to the client (IP leakage)
- No server-side control over rate limiting or usage tracking

### 11.1.1 Cross-site data dependencies

AI PM Coach needs two artifacts from PM Studio at **build time** (not runtime):

| Artifact | Source | Purpose | Sync mechanism |
|----------|--------|---------|----------------|
| `search-index.json` (~40 KB) | `../data/search-index.json` (parent framework-studio) | Framework name → slug lookup for auto-linking | `scripts/sync-search-index.ts` copies at build time |
| `categories.ts` | `../data/categories.ts` (parent framework-studio) | Category colors for skill selector pills | Duplicated into coach's `data/` directory |

These are static, rarely-changing files. Since the coach lives inside the `framework-studio/` git repo, the build scripts simply read from sibling directories (`../data/`). Skill prompts are tracked directly in `api/skills/`. No cross-repo or runtime API calls between the two applications are required.

### 11.2 API endpoints

```yaml
POST /api/classify:
  description: Fast skill classification (non-streaming)
  request:
    body:
      message: string
      files: { name: string, content: string }[]
  response:
    skill: SkillId
    confidence: number
    reasoning: string
  latency_target: < 1.5s (p50)
  model: claude-sonnet-4-20250514 (fast, low cost)

POST /api/chat:
  description: Single-skill conversational response (streaming)
  request:
    body:
      messages: { role: "user" | "assistant", content: string }[]
      skill: SkillId
      files: { name: string, content: string }[]
  response: SSE stream (Content-Type: text/event-stream)
  latency_target: first token < 2s (p50)
  model: claude-sonnet-4-20250514

POST /api/chat/debate:
  description: Multi-expert debate with parallel dispatch + synthesis
  request:
    body:
      messages: { role: "user" | "assistant", content: string }[]
      skills: SkillId[] (2–7)
      files: { name: string, content: string }[]
  response: SSE stream (Content-Type: text/event-stream)
  flow:
    1. Dispatch N parallel Claude API calls (one per skill, debate mode prompt)
    2. Collect all responses
    3. Make synthesis call with pm-debate prompt + all expert responses
    4. Stream synthesis response to client
  latency_target: first token < 8s (p50, due to parallel wait + synthesis)
  model: claude-sonnet-4-20250514 for experts, claude-sonnet-4-20250514 for synthesis
```

### 11.3 Skill prompt management

The 9 skill `.md` files are tracked directly in `api/skills/` and committed to git:

```
framework-studio/
  api/
    skills/                        # Tracked directly in git
      advise-frameworks.md
      discover-users.md
      frame-problems.md
      generate-ideas.md
      validate-bets.md
      ship-decisions.md
      grow-product.md
      think-systems.md
      pm-debate.md
    src/
      lib/skills.ts                # Reads .md files, caches in memory
      functions/chat.ts            # POST /api/chat handler
```

Skill files are available after `git checkout` with no build-time copy step needed.

### 11.4 Streaming protocol

Uses Server-Sent Events (SSE) via the Anthropic SDK's streaming API:

```yaml
protocol: SSE (Content-Type: text/event-stream)
events:
  - type: "token"
    data: { text: string }
  - type: "skill"
    data: { skillId: string, skillLabel: string }
  - type: "progress"
    data: { expertsComplete: number, expertsTotal: number }  # debate mode only
  - type: "done"
    data: { usage: { input_tokens: number, output_tokens: number } }
  - type: "error"
    data: { message: string, code: string }
```

Client-side: use `fetch()` with `ReadableStream` to consume SSE. Append tokens to the message content as they arrive. Batch React state updates via `requestAnimationFrame` to avoid excessive re-renders.

### 11.5 Client-side data model

```typescript
type SkillId =
  | "auto"
  | "discover-users"
  | "frame-problems"
  | "generate-ideas"
  | "validate-bets"
  | "ship-decisions"
  | "grow-product"
  | "think-systems";

type CoachMode = "single" | "debate";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;             // markdown
  skill?: SkillId;             // which skill generated this response
  isDebate?: boolean;          // true for debate synthesis responses
  timestamp: number;
  files?: UploadedFile[];      // files attached to this user message
}

interface UploadedFile {
  id: string;
  name: string;
  content: string;             // raw markdown text
  sizeBytes: number;
}

interface Conversation {
  id: string;
  title: string;               // auto-generated from first user message
  messages: Message[];
  mode: CoachMode;
  selectedSkills: SkillId[];
  createdAt: number;
  updatedAt: number;
}
```

Storage: `localStorage` key `fs:coach:conversations` containing JSON-serialized `Conversation[]`. Limited to 50 conversations with LRU eviction. Total localStorage budget: 5 MB.

### 11.6 Environment and secrets

```yaml
required:
  ANTHROPIC_API_KEY: string              # Claude API key (server-side only, never exposed to client)
  FRAMEWORK_STUDIO_BASE_URL: string      # Base URL for PM Studio deep-links
                                         # e.g., "https://studio.example.com"
                                         # Used client-side for framework auto-links
                                         # Exposed as NEXT_PUBLIC_FRAMEWORK_STUDIO_BASE_URL

optional:
  COACH_MODEL: string                    # Override default model (default: claude-sonnet-4-20250514)
  COACH_MAX_TOKENS: number               # Max response tokens (default: 4096)
  COACH_RATE_LIMIT: number               # Requests per minute per IP (default: 20)
```

---

## 12. Content model

### 12.1 Skill metadata (new file: `data/skills.ts`)

```typescript
interface SkillMeta {
  id: SkillId;
  label: string;               // e.g., "User Insights"
  shortLabel: string;          // e.g., "Users"
  domain: string;              // e.g., "User Insights & Research"
  description: string;         // one-sentence description
  frameworkCount: number;      // e.g., 12
  categorySlug: CategorySlug;  // maps to existing category color
  command: string;             // original slash command, e.g., "/discover-users"
}
```

### 12.2 Quick-start prompts (new file: `data/coach-prompts.ts`)

```typescript
interface QuickStartPrompt {
  id: string;
  text: string;                // the prompt text displayed on the card
  suggestedSkill: SkillId;     // which skill this naturally routes to
  activatesDebate?: boolean;   // if true, toggles debate mode on click
}
```

---

## 13. Accessibility requirements

Inherits all requirements from §15 of the parent PRD, plus:

1. **Chat input**: proper `<label>` association, `aria-label="Type your product challenge"` on textarea
2. **Skill selector**: `role="radiogroup"` in single mode, `role="group"` with `aria-pressed` on each chip in debate mode; arrow-key navigation
3. **Message list**: `role="log"`, `aria-live="polite"` for new messages, `aria-label` on each message indicating role and timestamp
4. **Streaming indicator**: `aria-live="polite"` region announcing "Generating response..." and "Response complete"
5. **File upload**: `aria-label` on upload button, `aria-describedby` linking to file type and size constraints text
6. **Conversation sidebar**: `role="navigation"`, keyboard-navigable list with `aria-current` on active conversation
7. **Framework links in responses**: visually distinguishable from plain text (underline + `--color-accent` + external-link icon ↗), `title` attribute with framework name, `target="_blank"` with `rel="noopener noreferrer"` for cross-origin safety
8. **Debate synthesis sections**: proper heading hierarchy (h2 for section titles within the response) for screen reader navigation

---

## 14. Responsive behavior

### Desktop (≥1024px)
- Sidebar visible by default (280px), collapsible
- Chat area fills remaining width; input area max-width 720px, centered
- Skill selector as single horizontal row, no scrolling needed
- Debate tensions render side-by-side (two columns)
- Quick-start prompt grid: 3 columns

### Tablet (768–1023px)
- Sidebar collapsed by default, toggleable via header button
- Chat area full width
- Skill selector may scroll horizontally if needed
- Debate tensions stacked vertically
- Quick-start prompt grid: 2 columns
- Input area full width with horizontal padding

### Mobile (<768px)
- Sidebar hidden, accessible via hamburger icon (slide-in drawer from left)
- Chat area full width, minimal padding (16px)
- Skill selector: horizontally scrollable pill bar
- File upload: button only (no drag-and-drop)
- Input area fixed to bottom of viewport (like native messaging apps)
- Send button: minimum 44×44px touch target
- Debate synthesis: fully stacked, single column
- Quick-start prompt grid: 2 columns
- Message bubbles: max-width 95% (user), 100% (assistant)

---

## 15. MVP scope

### Phase 1 — Foundation
- Standalone coach application scaffolding (Next.js + Azure Functions)
- Build-time sync of search-index.json and skill prompts from PMModels monorepo
- Chat input with streaming responses
- Single-skill mode with manual skill selection
- Auto-routing via `/advise-frameworks` triage
- Debate mode with all 7 experts
- Markdown file upload (max 10 files, max 100 KB each)
- Multi-turn conversation (current session only)
- Framework auto-linking with external links to PM Studio (new tab)
- Responsive layout (desktop + mobile)
- Coach navbar with external links to PM Studio (Explore, Map)

### Phase 2 — History & polish
- Conversation sidebar with history (up to 50 conversations)
- Conversation search by title
- Debate `--versus` mode (2-expert head-to-head with adversarial format)
- Stop/cancel streaming mid-response
- Quick-start prompt cards on empty state
- Copy message to clipboard
- Rate limiting middleware (per-IP, 20 req/min)
- Progress indicator for debate mode ("Gathering expert analyses... 5/7 complete")

### Phase 3 — Refinement
- Conversation export (markdown download)
- Suggested follow-up questions after each response
- Skill handoff suggestions (clickable: "Try /validate-bets next" inserts into skill selector)
- Framework mini-cards embedded inline in responses (preview card on hover, not just text links)
- Light mode support for coach interface
- Analytics integration (skill usage, debate frequency, framework link click-through)
- Usage monitoring dashboard and cost alerting

### Exclude (out of scope for all phases)
- User authentication / accounts
- Server-side conversation storage
- Custom API key input
- Voice input / output
- Non-markdown file uploads (PDF, DOCX, images)
- Collaborative / shared sessions
- Fine-tuned models
- Prompt engineering UI
- Usage-based billing / payments

---

## 16. Success metrics

### Engagement
- Coach sessions per week
- Messages per session (target: >4, indicating multi-turn engagement)
- Skill distribution (are all 7 domains used, or concentrated in 1–2?)
- Debate mode usage rate (target: >15% of sessions)
- File upload usage rate

### Cross-site referral
- PM Studio deep-dive page visits originating from coach response links (target: >30% of sessions include at least one framework click-through to PM Studio)
- PM Studio Explore / Map / Compare visits referred from coach navbar links

### Quality
- Time to first token (target: <2s p50, <5s p95 for single-skill; <8s p50 for debate)
- Streaming completion rate (% of responses that finish without error)
- User message length (proxy for engagement depth — longer messages suggest invested users)
- Conversation abandonment rate (single-message sessions as % of total)

### Cost
- Average tokens per session (input + output)
- API cost per session
- API cost per framework recommendation

---

## 17. Risks and mitigations

### Risk 1 — LLM response quality differs from CLI experience

The skill prompts were designed for Claude Code (which has tool use, file reading, and agent capabilities). Running them as pure system prompts via the Messages API may produce different quality.

**Mitigation:**
- Test each skill prompt via the API in isolation before integration
- Create a minimal adaptation layer: strip Claude Code-specific instructions (file reading paths, agent spawning syntax) from the web-served versions of the prompts
- Add a "Context: PM Studio Integration" appendix to each system prompt (§8.7)
- Monitor response quality through user feedback signals (copy rate, follow-up questions vs. abandonment)

### Risk 2 — Debate mode latency

Dispatching 7 parallel LLM calls and then a synthesis call will be slow (potentially 15–30 seconds total).

**Mitigation:**
- Stream a progress indicator as individual expert calls complete ("Gathering expert analyses... 5/7 complete")
- Use a faster model for individual expert calls; reserve the primary model for synthesis
- Allow users to narrow to 2–4 experts to reduce latency
- Set a timeout (45 seconds) with graceful degradation: synthesize with whatever responses have arrived

### Risk 3 — Cross-site navigation feels disjointed

Users clicking framework links in coach responses will be navigated to a different domain (PM Studio). This context switch may feel jarring if the visual identity differs too much, or confusing if users don't understand they've left the coach.

**Mitigation:**
- AI PM Coach adopts the same Midnight Editorial design system (same CSS tokens, fonts, colors) as PM Studio for visual continuity
- External framework links display a small ↗ icon and open in a new tab (the coach conversation remains in the original tab)
- The coach navbar includes prominent "Framework Library ↗" and "Map ↗" links so users understand the two products are connected but separate
- The coach empty state includes a callout: "Every framework recommended here links to its full deep-dive on PM Studio."
- Future: optionally embed a framework summary card inline in the coach response (Phase 3), reducing the need to navigate to PM Studio for quick reference

### Risk 4 — Cost overruns from LLM API usage

Without authentication, any visitor can make unlimited API calls.

**Mitigation:**
- Per-IP rate limiting (20 requests/minute default)
- Max token limits per response (4096 output tokens)
- Monitor daily spend with alerts at threshold amounts
- If needed: add optional CAPTCHA or require email for extended usage (Phase 3+)

### Risk 5 — Skill prompt IP exposure

The 9 skill prompts represent significant intellectual property and should not be visible to end users.

**Mitigation:**
- Skill prompts are loaded server-side only (Azure Functions); never sent to the client
- Client sends only the skill ID; the server resolves it to the full prompt
- API responses do not include the system prompt in metadata
- `/api/chat` and `/api/classify` endpoints do not accept arbitrary system prompts — only recognized skill IDs

### Risk 6 — localStorage limits

50 conversations with multi-turn history could approach the ~5 MB localStorage limit.

**Mitigation:**
- Enforce 50-conversation LRU eviction
- Truncate stored message content to 10,000 characters per message (with "[truncated]" indicator)
- Show a warning when storage exceeds 4 MB
- Phase 3: offer conversation export (markdown download) to free up space

---

## 18. Delivery plan

### Phase 1 — Foundation (Weeks 1–3)
- Scaffold standalone Next.js application (`framework-studio/ai-pm-coach/`) with API routes
- Implement skill prompt loader and caching (`load-skill.ts`)
- Build `POST /api/chat` endpoint with SSE streaming
- Build `POST /api/classify` endpoint for auto-routing
- Create `CoachShell`, `ChatInput`, `MessageBubble` components
- Implement basic single-skill mode (manual selection + auto-routing)
- Framework auto-linking with external links to PM Studio
- Coach navbar with external links to PM Studio (Explore ↗, Map ↗)
- Mobile-responsive layout
- Deploy to Azure (App Service or Static Web App + linked Functions)

### Phase 2 — Intelligence (Weeks 4–5)
- Build `POST /api/chat/debate` endpoint with parallel dispatch + synthesis
- Implement `SkillSelector` with single/debate mode toggle
- Build `DebateSynthesis` renderer
- Add file upload support (`FileUploadZone` component + API integration)
- localStorage conversation persistence
- `ConversationSidebar` component
- Quick-start prompt cards (empty state)

### Phase 3 — Polish (Weeks 6–7)
- Streaming stop/cancel
- Copy to clipboard
- Conversation search
- Rate limiting middleware
- Error handling and retry UX (timeouts, API errors, graceful degradation)
- Performance optimization (token batching, render throttling)
- Accessibility audit and fixes
- Light mode for coach components
- Analytics event tracking

### Phase 4 — Growth (Week 8+)
- Conversation export (markdown download)
- Suggested follow-ups and skill handoff suggestions
- Inline framework mini-cards (hover preview)
- Usage monitoring dashboard
- Cost alerting
- A/B test: coach homepage vs. original homepage

---

## 19. Prompting notes for Claude Code / Codex

### What the coding agent should optimize for
- Streaming UX that feels instant and responsive
- Clean separation between static app and API layer
- Skill prompt isolation (server-side only)
- Markdown rendering quality (the responses ARE the product)
- Framework auto-linking accuracy
- Conversation state management without a database

### Build constraints
- AI PM Coach lives at `framework-studio/ai-pm-coach/` — do NOT modify any existing framework-studio files outside of `ai-pm-coach/`
- Do NOT expose skill prompt contents to the client bundle
- Do NOT use WebSockets — use SSE (simpler, works with Azure Functions)
- Do NOT auto-send messages on page load (user must explicitly interact)
- Do NOT persist conversation data to any server or external service
- Debate mode must dispatch expert calls in PARALLEL, never sequentially
- All coach components must use the existing design token system (`--color-*`, `--font-*`, `--radius-*`, `--motion-*`)
- Assistant responses must never include raw HTML — always markdown rendered through a sanitized pipeline

### Suggested implementation sequence
1. Scaffold `framework-studio/ai-pm-coach/` Next.js app with API routes
2. Skill prompt loader (`load-skill.ts`)
3. SSE streaming helper (`stream-response.ts`)
4. `POST /api/chat` endpoint (single skill, streaming)
5. `ChatInput` component
6. `MessageBubble` component with markdown rendering + external framework links
7. `CoachShell` layout with basic chat flow
8. Coach navbar with external PM Studio links
9. `SkillSelector` component
10. `POST /api/classify` endpoint + auto-routing flow
11. File upload components and API integration
12. `POST /api/chat/debate` endpoint
13. `DebateSynthesis` renderer
14. Conversation sidebar and localStorage persistence
15. Framework auto-linking (search-index-based, external URLs)
16. Responsive polish and accessibility
17. Azure deployment pipeline (CI/CD)

---

## 20. Open questions

1. **Model selection**: Should debate synthesis use a higher-tier model (higher quality, higher cost, slower) or the same model as expert calls? Needs cost/quality testing.
2. **Conversation context window**: How many prior messages should be included in each API call? Sending full history for long conversations will hit token limits. Recommend: sliding window of the most recent 10 messages.
3. **Azure Functions cold start**: Cold start on the Consumption plan can add 2–5 seconds. Should we use a Premium plan for warm instances, or accept the latency for MVP?
4. **Skill prompt versioning**: Skill `.md` files are tracked directly in `api/skills/` and deployed with the Functions app. Updates are made by editing the files in-place and committing.
5. **Framework name disambiguation**: Some framework names are common English words (e.g., "Persona", "Sprint"). How aggressively should auto-linking match? Recommend: only match exact title case or full multi-word titles.
6. **Rate limiting scope**: Per-IP rate limiting may be too restrictive for teams sharing an office IP. Should we use browser fingerprinting, or accept the limitation for MVP?
7. **Fallback when API is down**: Should the coach page show graceful degradation (e.g., link to PM Studio's guided finder), or just an error message?
8. **PM Studio URL stability**: The coach depends on PM Studio's URL structure (`/framework/{slug}`). Should we add a URL health check at build time to verify that all 100 slugs resolve, or trust the static contract?
9. **Search index freshness**: If PM Studio adds new frameworks, the coach's bundled `search-index.json` becomes stale. Should the coach fetch a fresh index from PM Studio at runtime (adds cross-site dependency), or accept build-time sync with a CI trigger when PM Studio deploys?
10. **Custom domain and branding**: Should the coach share a subdomain with PM Studio (e.g., `coach.frameworkstudio.com` / `library.frameworkstudio.com`) or use an entirely separate domain? Subdomain sharing improves brand coherence but requires DNS coordination.

---

## 21. Final product standard

If AI PM Coach launches well, a user should be able to say:

- "I described my product challenge and got genuinely useful, specific framework recommendations — not generic advice."
- "The debate mode showed me blind spots I never would have found on my own."
- "Every framework the coach mentioned was a clickable link that opened the full deep-dive on PM Studio."
- "It felt like talking to a team of expert PM consultants, not a chatbot."
- "I uploaded my PRD and got a structured analysis in under 30 seconds."
