---
description: Regenerate the AI Weekly landing page (public/ai-weekly/index.html) and themed page copies (public/ai-weekly/pages/) after dropping a new AI Intel Weekly Dashboard into RAW/.
---

# Update AI Weekly Index

The AI Weekly landing page at `public/ai-weekly/index.html` is **generated** from the
dashboard files in `public/ai-weekly/RAW/`. You never hand-edit `index.html` or the
themed pages — you drop a dashboard into `RAW/` and run the generator.

## How it works

- Each weekly issue is a single self-contained HTML file in `public/ai-weekly/RAW/`,
  named `ai-intel-dashboard-YYYYMMDD-HHMMSS.html`. The timestamp in the filename sorts
  freshness (newest first). **`RAW/` is the pristine source — it is never modified.**
- `scripts/build-ai-weekly-index.ts` does two things:
  1. **Generates `index.html`** — a hero, a derived stats bar, and one card per dashboard
     (newest first), each card linking into `pages/`. It rewrites the regions marked by
     HTML comments:
     - `<!-- AUTO-INDEX:STATS:START -->` … `END` — the four-number stats bar.
     - `<!-- AUTO-INDEX:ISSUES:START -->` … `END` — the issue cards.
  2. **Writes a themed copy into `public/ai-weekly/pages/`** — named
     `ai-weekly-digest-YYYYMMDD-HHMMSS.html` (same timestamp suffix as the RAW source).
     The copy gets the editorial paper theme (Fraunces / Newsreader / JetBrains Mono,
     vermillion / slate / amber palette) plus a back-to-index site strip injected between
     marker comments:
     - `<!-- SITE-THEME:START -->` … `END` in `<head>`.
     - `<!-- SITE-STRIP:START -->` … `END` right after `<body>`.
- The dashboard's own table markup and its filter/sort JavaScript are carried over
  untouched into the themed copy.

## Adding a new issue

1. Drop the new dashboard into `public/ai-weekly/RAW/`, named
   `ai-intel-dashboard-YYYYMMDD-HHMMSS.html`.
2. Run the generator:
   ```bash
   npm run build:ai-weekly
   ```
3. The card and stats update automatically, and a themed copy is written to `pages/`.
   Re-runs are safe (idempotent) — a page is only rewritten when its content changes.

## Verify

```bash
npm run check:ai-weekly   # fails if index.html or any themed page is out of date
```

`build:ai-weekly` also runs automatically on `prebuild`, so a normal `npm run build`
keeps the index and themed pages current.

## Metadata extraction

The generator pulls light metadata from each dashboard's HTML for the cards/stats:
`<title>`, the `<span class="timestamp">` time, the `Sources:` list (counted), and the
`Showing: top X of Y` line. If those fields are missing it falls back to sensible
defaults — but keeping the dashboard's report-header markup intact gives the best cards.
