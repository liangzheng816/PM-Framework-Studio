# PRD — Framework Studio

## 1. Document status
- Version: v1.0
- Audience: Claude Code, OpenAI Codex, full-stack product/design/engineering teams
- Purpose: Build a premium web product that teaches product management frameworks through a beautiful, high-trust, highly visual learning experience inspired by PMFrame.works, but differentiated with stronger UX, richer metadata, better discoverability, and a more polished visual language.

---

## 2. Product summary

### 2.1 Working title
**Framework Studio**

### 2.2 One-line pitch
A visually elegant, interactive framework-learning platform that helps product managers, designers, founders, and operators discover, compare, and apply the right framework at the right moment.

### 2.3 Product vision
Create the best-looking and most usable framework education site on the web: a product that feels editorial, interactive, and premium, while remaining practical enough to support real product work.

### 2.4 Why now
Framework content is abundant, but most products in this category have one or more of these problems:
- fragmented information quality
- weak source transparency
- shallow page structure
- limited comparison workflows
- uninspired UI
- poor mobile reading experience
- low actionability after the user learns a framework

Framework Studio should solve all of these with a modern product experience.

---

## 3. Product goals

### 3.1 Primary goals
1. Help users quickly discover relevant PM frameworks by stage, goal, and context.
2. Turn each framework page into a high-value learning object, not just a glossary entry.
3. Make the UI feel premium, modern, and visually memorable.
4. Enable users to compare frameworks and pick one confidently.
5. Provide enough structure that the product can later expand into templates, exercises, downloads, and AI coaching.

### 3.2 Business/product goals
1. Achieve strong organic traffic through high-quality, indexable content.
2. Build a reusable content engine for 100+ framework pages.
3. Create a premium design system that can later support subscriptions, downloads, learning paths, or team workspaces.
4. Establish authority through clear sourcing and editorial quality.

### 3.3 Non-goals for MVP
- Full community/social layer
- User-generated framework editing
- Enterprise collaboration workspace
- In-product AI tutor
- Native mobile app

---

## 4. Users

### 4.1 Primary personas

#### Persona A — PM learner
- Early-career PM, APM, MBA student, founder, or career switcher
- Needs simple explanations, examples, and guidance on when to use a framework
- Values visual clarity and low cognitive load

#### Persona B — Practicing PM
- Mid-career PM or product lead
- Already knows many frameworks by name but needs better recall, comparison, and application guidance
- Values speed, trust, and practical use cases

#### Persona C — Workshop facilitator
- Product leader, design lead, consultant, coach, or instructor
- Needs materials that are easy to present and share
- Values structure, downloadable summaries, and comparison tools

#### Persona D — Cross-functional partner
- Designer, researcher, engineer, strategy lead, or founder
- Needs frameworks as decision tools, not academic theory
- Values examples, tradeoffs, and stage-based recommendations

### 4.2 Core user jobs
- “I need the right framework for my current problem.”
- “I know the name, but I need a clean deep dive.”
- “I want to compare 2–4 frameworks before choosing.”
- “I want a beautiful page I can read, save, or share.”
- “I want to understand when not to use a framework.”

---

## 5. Product principles
1. **Elegant first** — the site must feel premium and intentional.
2. **Learn fast** — users should grasp value within 30 seconds.
3. **Depth without clutter** — pages should be dense but breathable.
4. **Action over abstraction** — every page should help a user actually do something.
5. **Source-aware** — distinguish canonical sources, practitioner adaptations, and editorial synthesis.
6. **Motion with restraint** — subtle animation, never noisy animation.
7. **Mobile deserves respect** — mobile is not a reduced afterthought.

---

## 6. Inspiration analysis translated into product requirements

The reference product pattern to emulate at a high level is:
- a homepage centered on a curated set of roughly 100 PM/design frameworks
- a “map” view that supports exploration by position/category
- a deep-dive page structure that explains problem, framework structure, use cases, example, tips, history, and related tools
- quick movement from one framework to the next
- downloadable framework artifacts

Framework Studio should preserve the strengths of this pattern while improving:
- visual sophistication
- content consistency in English
- search/filter quality
- taxonomy depth
- source transparency
- framework comparison
- saved collections
- accessibility and mobile responsiveness
- design-system maturity

---

## 7. Value proposition

### For users
- Learn frameworks faster
- Choose frameworks more confidently
- Understand tradeoffs and adjacent tools
- Save time during product discovery, prioritization, validation, and growth work

### For the product/business
- Strong SEO surface area through structured framework pages
- Strong brand differentiation through superior visual design
- Expandable into premium tools: PDF cards, canvases, templates, playbooks, and AI assistant workflows

---

## 8. Information architecture

### 8.1 Top-level navigation
- Home
- Explore
- Framework Map
- Categories
- Compare
- Collections
- About / Methodology

### 8.2 Primary content objects
1. Framework
2. Category
3. Collection
4. Learning Path
5. Downloadable Asset
6. Editorial Note / Source Note

### 8.3 Category model
Use the PMFrame-inspired taxonomy as the seed taxonomy:
- User Insights
- Problem Framing
- Ideation
- Validation
- Execution
- Growth
- Systems Thinking

### 8.4 Additional metadata per framework
- Framework ID / slug
- English title
- Alternate titles / aliases
- Category
- Short description
- Best for
- Complexity level
- Time to apply
- Team size fit
- Output artifact type
- Primary stage in product lifecycle
- Related frameworks
- Canonical source type
- Confidence label (canonical / adapted / synthesized)
- Recommended templates or worksheets

---

## 9. Core user flows

### Flow A — Exploratory discovery
1. User lands on home page
2. Sees hero + framework cards + category entry points
3. Uses search or clicks a category
4. Opens a framework page
5. Saves it or compares it with another framework

### Flow B — Intent-led discovery
1. User arrives with a task (“prioritize roadmap”, “run interviews”, “find root cause”)
2. Uses task-oriented filter or guided finder
3. Receives ranked framework suggestions
4. Opens comparison view
5. Chooses one framework and exports a summary

### Flow C — Deep learning
1. User opens a framework page
2. Reads the overview and use cases
3. Studies structure, example, and anti-patterns
4. Downloads a one-page worksheet or saves to collection

### Flow D — Repeat user
1. Returns to saved collection
2. Continues reading previously bookmarked frameworks
3. Builds a personal toolkit

---

## 10. Functional requirements

### 10.1 Homepage
The homepage must:
- clearly communicate the product purpose within the first viewport
- highlight the breadth of frameworks available
- support immediate search
- support category-based discovery
- feature visually rich cards
- feel premium and editorial rather than directory-like

#### Homepage sections
1. Hero
2. Search + quick picks
3. Category ribbons
4. Featured frameworks
5. Framework map preview
6. Learning paths / “Start here” blocks
7. Why this site is trustworthy
8. CTA to explore all frameworks

### 10.2 Explore page
Must support:
- full-text search
- facet filters
- sort by popularity / category / complexity / stage / recency
- card and compact list modes
- keyboard-friendly interactions

### 10.3 Framework map page
Must provide an interactive map that lets users browse frameworks visually.
Potential dimensions:
- Early ↔ Late stage
- Low leverage ↔ High leverage
- Qualitative ↔ Quantitative
- Strategy ↔ Execution

Requirements:
- hover state with framework preview
- click to open framework
- accessible fallback list below the visual map
- mobile-friendly version using stacked clusters or segmented tabs

### 10.4 Framework deep-dive page
Each framework page must include the following sections in a stable structure:
1. Hero / title block
2. What problem it solves
3. Core idea in one paragraph
4. Framework structure / components / steps
5. When to use it
6. When not to use it
7. Real-world example
8. How to apply it step-by-step
9. Common mistakes / anti-patterns
10. Inputs needed
11. Outputs produced
12. Recommended companion frameworks
13. Source notes and lineage
14. Download / save / compare actions

Optional sections:
- worksheet
- example templates
- FAQ
- AI prompt starter

### 10.5 Compare view
User can select 2–4 frameworks and compare:
- purpose
- best use case
- time to run
- evidence needed
- output artifact
- strengths
- weaknesses
- best team context
- adjacent frameworks

### 10.6 Collections
Registered users can:
- save frameworks
- create named collections (e.g., “Discovery toolkit”)
- pin a default collection
- share a read-only collection link

### 10.7 Content administration
Admin/editor tools must support:
- create/edit framework content in structured schema
- mark source confidence
- attach citations/notes
- manage related frameworks
- preview draft pages
- publish/unpublish

---

## 11. UX and visual design direction

### 11.1 Brand personality
- intelligent
- stylish
- calm
- premium
- modern
- editorial
- slightly futuristic

### 11.2 Desired emotional response
The product should feel like:
- “This is beautiful.”
- “This is trustworthy.”
- “This helps me think clearly.”
- “I want to keep browsing.”

### 11.3 Visual style
Design language should mix:
- editorial layout discipline
- premium SaaS polish
- subtle art-direction
- warm minimalism with strong typography

### 11.4 UI style guidance
- Large, elegant type scale for headings
- Ample whitespace
- Thin dividers, soft gradients, subtle grain or glow accents
- Rounded cards with layered elevation
- Premium iconography
- High-contrast but not harsh
- Rich hover states
- Tasteful micro-interactions

### 11.5 Fashion-forward design cues
- editorial serif + modern sans pairing
- muted luxury palette with a bold accent color
- glassy or satin layered panels used sparingly
- animated gradient mesh in hero area
- card transitions with softness and precision
- dark mode that feels luxurious, not gamer-style

### 11.6 Suggested palette directions
Choose one of these:

#### Option A — Midnight editorial
- Background: near-black navy
- Surface: deep slate
- Text: warm white
- Accent: electric lavender or icy blue
- Secondary accent: soft rose gold

#### Option B — Ivory luxury
- Background: warm ivory
- Surface: white + pearl gray
- Text: charcoal
- Accent: forest green or cobalt
- Secondary accent: muted copper

#### Option C — Soft futurism
- Background: blue-gray mist
- Surface: translucent white panels
- Text: deep graphite
- Accent: neon-indigo used sparingly
- Secondary accent: lilac haze

### 11.7 Typography recommendations
- Heading font: editorial serif or high-contrast display serif
- Body/UI font: clean neo-grotesk sans
- Monospace: for schemas, shortcuts, and metadata labels

Example pairings:
- Canela + Inter
- Fraunces + Geist
- Playfair Display + Inter
- Instrument Serif + Manrope

### 11.8 Motion principles
- 120–240ms default motion for UI elements
- spring-based motion for cards and overlays
- no aggressive parallax
- no constant autoplay motion beyond subtle ambient hero movement

---

## 12. Component and “beautiful web part” specification

This section is intentionally explicit for Claude Code / Codex.

### 12.1 Hero web part
A visually stunning landing component with:
- oversized headline
- subhead explaining the site value
- prominent search input
- one primary CTA and one secondary CTA
- animated framework chips floating subtly
- optional mesh gradient or blurred light blobs

Acceptance criteria:
- first contentful meaning visible above the fold
- headline readable on mobile
- search usable from keyboard immediately

### 12.2 Framework card web part
A reusable premium card component with:
- title
- category pill
- one-sentence explanation
- “best for” label
- save icon
- hover reveal of meta info

Variants:
- default card
- featured card
- compact row card
- mini card for related frameworks

### 12.3 Framework map web part
A visually interactive exploration block:
- quadrant or axis-based layout
- draggable or hoverable nodes
- node size can represent popularity or editorial priority
- node color reflects category
- filter chips above the map
- tooltip with short summary and CTA

### 12.4 Deep-dive article shell web part
The article page template should include:
- sticky local navigation
- beautiful title block
- elegant content rhythm
- section dividers
- quote / note / warning callouts
- example panels
- related frameworks rail
- save / compare / download actions

### 12.5 Compare table web part
- sticky left column
- horizontally scrollable on smaller screens
- toggle “differences only”
- visually highlight recommended choices per scenario

### 12.6 Collection shelf web part
- horizontal scroll shelf for saved frameworks
- collection title and count
- share/export actions

### 12.7 Guided finder web part
A smart multi-step chooser:
- “What are you trying to do?”
- “How much time do you have?”
- “How much evidence do you have?”
- “Solo or team?”
Outputs 3–5 best frameworks.

---

## 13. Content model for each framework

```yaml
framework:
  id: string
  slug: string
  title: string
  aliases: string[]
  category: enum
  summary: string
  best_for: string[]
  stage: string[]
  complexity: enum(low|medium|high)
  time_to_apply: string
  team_size: string
  inputs: string[]
  outputs: string[]
  when_to_use: string[]
  when_not_to_use: string[]
  steps_or_components: array
  real_world_example:
    title: string
    description: string
  common_mistakes: string[]
  companion_frameworks: string[]
  source_notes:
    canonical_sources: array
    editorial_notes: string
    confidence: enum(canonical|adapted|synthesized)
  assets:
    hero_image: string
    downloadable_template: string
```

---

## 14. Search and recommendation logic

### 14.1 Search expectations
Search must support:
- title match
- alias match
- category match
- “best for” and use-case match
- typo tolerance
- instant suggestions

### 14.2 Recommendation logic
Recommend frameworks based on:
- current page context
- same category
- same job to be done
- same output type
- complementary stage adjacency

Example:
If user reads **JTBD**, suggest:
- Persona
- User Journey Map
- Value Proposition Canvas
- Problem-Solution Fit

---

## 15. Accessibility requirements
- WCAG 2.2 AA target
- keyboard navigable primary flows
- visible focus states
- semantic heading structure
- accessible chart/map fallback
- color contrast compliant in both light and dark modes
- motion reduction setting respected

---

## 16. Responsive behavior

### Desktop
- rich hero
- multi-column card grids
- sticky side navigation on deep pages
- interactive map with hover detail

### Tablet
- 2-column card grid
- collapsible filters
- map simplifies interactions

### Mobile
- stacked layout
- sticky bottom action bar on framework pages
- simplified map or segmented list alternative
- reduced motion
- large touch targets

---

## 17. Technical product requirements

### 17.1 Recommended stack
- **Frontend**: Next.js + TypeScript
- **Styling**: Tailwind CSS + design tokens
- **Animation**: Framer Motion
- **Content**: MDX or structured CMS content
- **Search**: local indexed search for MVP; Algolia/Meilisearch later
- **CMS**: Sanity / Contentful / headless CMS, or filesystem MDX for MVP
- **Data layer**: static generation with incremental revalidation if needed
- **Analytics**: PostHog or Plausible
- **Deployment**: Vercel or equivalent

### 17.2 Architecture suggestion
For MVP:
- Static framework pages generated from structured content files
- Server-rendered / statically generated explore pages
- Lightweight auth for collections (optional in MVP+)

### 17.3 Performance requirements
- Lighthouse performance > 90 on core content pages
- LCP under 2.5s on modern mobile
- CLS under 0.1
- Core pages should remain usable even with motion disabled

### 17.4 SEO requirements
- schema markup for articles / educational content
- indexable framework pages
- canonical URLs
- metadata for social share cards
- FAQ sections where helpful
- internal linking between related frameworks and categories

---

## 18. Design system requirements

### 18.1 Foundations
- color tokens
- typography scale
- spacing scale
- radius scale
- elevation system
- border system
- motion tokens

### 18.2 Core components
- buttons
- chips
- tabs
- accordions
- cards
- callouts
- comparison tables
- search input
- command palette
- nav bar
- footer
- modal / drawer
- toast

### 18.3 Theming
- light mode
- dark mode
- future seasonal or editorial themes

---

## 19. MVP scope

### Include in MVP
- homepage
- category browsing
- search
- framework explore page
- framework deep-dive page template
- framework map page
- related frameworks
- compare 2 frameworks
- source note section
- responsive design
- premium visual system

### Nice-to-have in MVP if time allows
- collections
- learning paths
- downloadable one-page summary cards
- guided finder

### Exclude from MVP
- user comments
- AI chat assistant
- collaborative workspaces
- multilingual support
- paid subscriptions

---

## 20. Success metrics

### User metrics
- % of users who open a framework page from home
- framework page completion depth
- save rate
- compare rate
- return rate within 30 days
- search-to-click success rate

### Product metrics
- organic search growth
- average time on deep-dive pages
- collection creation rate
- category exploration rate
- bounce reduction on landing pages

### Quality metrics
- accessibility audit pass rate
- page speed benchmarks
- editorial completeness score per framework page

---

## 21. Risks and mitigations

### Risk 1 — Content quality inconsistency
Mitigation:
- structured content schema
- editorial checklist
- source confidence labeling

### Risk 2 — Beautiful but slow experience
Mitigation:
- motion budgets
- image optimization
- progressive enhancement

### Risk 3 — Overdesigned UI hurts readability
Mitigation:
- strict typography and contrast review
- usability testing on long-form pages

### Risk 4 — Map view becomes novelty instead of utility
Mitigation:
- add filters, tooltips, and useful defaults
- provide fallback list and category paths

### Risk 5 — Users struggle to choose among similar frameworks
Mitigation:
- strong compare experience
- “best for” labels
- guided finder

---

## 22. Editorial quality bar
Each framework page must answer, clearly and concretely:
1. What is it?
2. What problem does it solve?
3. When should I use it?
4. When should I not use it?
5. What are the steps/components?
6. What does good usage look like?
7. What are common mistakes?
8. What should I use with it?
9. How trustworthy is this interpretation?

---

## 23. Example page template

```md
# [Framework Name]
Short value statement.

## What problem it solves
...

## Core idea
...

## Structure / steps
...

## When to use it
...

## When not to use it
...

## Example
...

## How to apply it
...

## Common mistakes
...

## Inputs needed
...

## Outputs produced
...

## Companion frameworks
...

## Source notes and lineage
...
```

---

## 24. Delivery plan

### Phase 1 — Foundations
- design system
- content model
- homepage
- framework page template
- base navigation

### Phase 2 — Discovery
- search
- category pages
- related framework logic
- compare view

### Phase 3 — Delight
- interactive map
- collections
- guided finder
- downloads

### Phase 4 — Authority and growth
- editorial notes
- source confidence layer
- SEO enhancement
- learning paths

---

## 25. Prompting notes for Claude Code / Codex

### What the coding agent should optimize for
- premium visual design
- component reusability
- clean information architecture
- accessibility
- responsive behavior
- structured content rendering
- fast performance

### Build constraints
- avoid generic template aesthetics
- avoid crowded dashboards
- avoid loud gradients and excessive neon
- prioritize readability on long pages
- do not ship placeholder lorem ipsum
- use realistic framework seed data

### Suggested implementation sequence
1. Create design tokens and themes
2. Build nav, layout shell, hero, and card system
3. Build framework content schema and renderer
4. Build home, category, and detail pages
5. Build search and related framework logic
6. Build map and compare experience
7. Add saved collections if time permits

---

## 26. Open questions
1. Should MVP support only English, or English-first with future multilingual architecture?
2. Should sources be visible inline or tucked under an editorial note block?
3. Should saved collections require auth from day one?
4. Should the map use editorial positioning only, or a data-driven scoring system?
5. Should downloadable assets be free or reserved for future premium tiers?

---

## 27. Final product standard
If this product launches well, a user should be able to say:
- “This is the most beautiful framework education site I’ve seen.”
- “I can actually choose the right framework now.”
- “The pages are rich, practical, and trustworthy.”
- “I want to keep using this as my PM reference library.”

