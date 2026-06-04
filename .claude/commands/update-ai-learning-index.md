---
description: Regenerate the AI Learning landing page (public/ai-learning/index.html) after adding or changing a learning collection.
---

# Update AI Learning Index

The AI Learning landing page at `public/ai-learning/index.html` is **generated** from
per-collection manifest files. You never hand-edit the collection cards or the stats bar —
you edit a manifest and run the generator.

## Global navbar (every page)

Every static HTML page under `public/ai-learning/` carries the global PM Studio
navbar, injected by `scripts/inject-static-navbar.ts`. The injector finds an
`<!-- AUTO-NAV:START -->` / `<!-- AUTO-NAV:END -->` block right after the
opening `<body>` and rewrites it; if the markers don't exist on a new page,
they get inserted. **Never hand-author the navbar HTML and never delete the
markers.** The injector runs as part of `npm run prebuild`, so a freshly
deployed page always carries the current navbar. To refresh locally:

```bash
npm run build:nav     # write
npm run check:nav     # CI guard, fails if any page is stale
```

## How it works

- Every collection lives in `public/ai-learning/Content/<Name_YYYYMMDD>/`.
- Each collection folder has a `collection.json` manifest describing its cards.
- `scripts/build-ai-learning-index.ts` scans those manifests and rewrites two regions of
  `index.html`, marked by HTML comments:
  - `<!-- AUTO-INDEX:STATS:START -->` … `END` — the four-number stats bar.
  - `<!-- AUTO-INDEX:COLLECTIONS:START -->` … `END` — the collection sections.
- Everything else in `index.html` (CSS, hero, "Coming up" slot, how-to notes) is left
  untouched, so the design is preserved.
- `npm run build` regenerates the index automatically via the `prebuild` hook, so a
  collection added with a manifest will appear on the deployed site even if you forget to
  regenerate locally. Still regenerate and commit so the repo stays the source of truth.

## Adding a new collection (the SOP)

1. **Drop the folder.** Place the new site under
   `public/ai-learning/Content/<Name_YYYYMMDD>/` (timestamped name, its own `index.html`).
2. **Create `collection.json`** inside that folder (schema below).
3. **Regenerate:** `npm run build:ai-index`
4. **Verify:** open `public/ai-learning/index.html` in a browser and confirm the new
   collection renders and every card link resolves.
5. **Commit** the new folder, its `collection.json`, and the updated `index.html`.

To change an existing collection (rename a card, fix a description, add a page), edit its
`collection.json` and re-run step 3.

## `collection.json` schema

```jsonc
{
  "order": 3,                      // sort position on the page (1-based)
  "category": "advanced",          // color lane: "agent" | "applied" | "advanced"
  "collectionLabel": "TOPIC NAME", // short label in the meta line
  "date": "2026-06-15",            // ISO date, rendered as "2026 · 06 · 15"
  "title": "My New <em>Collection</em>",   // heading; inline HTML allowed
  "subtitle": "One-line description of the collection.",
  "home": "index.html",            // optional, collection home page (default index.html)
  "quizQuestions": 0,              // optional, added to the global Quiz stat
  "flashcards": 0,                 // optional, added to the global Flashcards stat
  "pages": [
    {
      "num": "01",                 // eyebrow label, e.g. "01", "GUIDE 02", "PRACTICE"
      "title": "Page Title",
      "desc": "Card body copy. Inline HTML like <code>--flag</code> is allowed.",
      "href": "01-some-page/index.html",   // path relative to the collection folder
      "cta": "Open site",          // optional button text (default "Open page")
      "practice": false            // optional; true = quiz/flashcards, excluded from Pages stat
    }
  ]
}
```

### Notes

- **Stats are derived:** Collections = number of manifests; Pages = cards where
  `practice` is not `true`; Quiz Questions and Flashcards = sums of the per-collection
  numbers. Set them in the manifest; never edit the stats bar by hand.
- **Color lanes:** `agent` = slate, `applied` = amber, `advanced` = vermillion. To add a
  new lane, add a `.group.cat-<name>{--c:#hex;}` rule in the `<style>` block of
  `index.html` and use that name as the `category`.
- **Trusted HTML:** title/subtitle/desc are injected verbatim so curated markup
  (`<em>`, `<code>`, entities like `&amp;`) is preserved. Only author content you trust;
  this is a local build step.
- **CI check:** `npm run check:ai-index` fails if `index.html` is out of date relative to
  the manifests — useful as a pre-commit or CI guard.
