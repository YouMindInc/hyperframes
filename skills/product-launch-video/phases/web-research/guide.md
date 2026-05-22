# Web Research (Phase 1)

Browser-based capture of a marketing/landing page into a research pack: visible text, section structure, downloadable image/video/font assets, and a full-page screenshot. Used by Phase 2 (story-design) to design the narrative and per-scene `assetCandidates`.

This phase is **internal to `product-launch-video`** — not a standalone skill. The capture script (`scripts/capture_web_context.py`, Playwright-based) lives in this directory.

## What the script produces

```
research/
├── context_pack.md          # ~50KB compact LLM-friendly digest — read first
├── extraction.json          # ~175KB raw extraction (sections, assets, colors, fonts, rects)
├── page.html                # raw page source
├── screenshot_full.png      # full-page rendered screenshot (1440px wide)
└── assets/
    ├── index.json           # inventory of successfully downloaded assets with local paths
    └── ...                  # actual files (png/jpg/svg/webp/mp4/woff2/…)
```

The phase is **pure capture** — no LLM call, no analysis. Phase 2 (story-design) does the analysis directly into `narrator_scripts.json`.

## How to run

```bash
uv run --with playwright \
  <SKILL_DIR>/phases/web-research/scripts/capture_web_context.py \
  "<TARGET_URL>" \
  --out ./research \
  --download-assets
```

If Chromium is missing on first run:

```bash
uv run --with playwright playwright install chromium
```

## Useful flags

```bash
--wait 3                 # seconds to wait after initial load (lazy-load hydration)
--viewport 1440x1200     # browser viewport
--max-assets 80          # cap asset downloads
--no-screenshot          # skip screenshot capture
--download-assets        # download likely-useful images/videos/fonts (RECOMMENDED for this pipeline)
```

## Capture rules (what the script does)

1. Navigates to URL, waits for `domcontentloaded`, then waits `--wait` seconds.
2. Simulates user scroll to trigger lazy-loaded content (full-page).
3. Executes browser-side JS to extract:
   - Visible text, headings (ordered), links, CTAs
   - Section candidates (`header`, `main`, `section`, `article`, `footer`, role-based)
   - Asset metadata (images / videos / fonts, including srcset variants)
   - Style tokens (top colors across buttons / text / backgrounds, font families)
   - Bounding rects for all elements (used for proximity-based asset→section mapping)
4. Takes a full-page screenshot (1440px wide × full scroll height).
5. Optionally downloads probable assets (`is_probable_asset()` filter). Tracking pixels, transparent spacers, favicon-only assets are filtered out.
6. Writes a compact `context_pack.md` summary plus the full `extraction.json` raw output.

## Out of scope for this phase

- **No LLM analysis.** Don't generate an `analysis.json` here — Phase 2 (story-design) consumes `context_pack.md` + `extraction.json` directly and produces `narrator_scripts.json` (which captures product understanding via archetype, section→scene mapping, and per-scene `assetCandidates`).
- **No brand design tokens.** Phase 1b (design-system) runs in parallel with this phase and produces `design-system/design.html` for that — see `phases/design-system/guide.md`.
- **No scene planning.** Scene plans come from Phase 2, not here.

## See also

- `phases/design-system/guide.md` — Phase 1b runs in parallel; extracts brand design tokens into a `design.html` reference
- `phases/story-design/guide.md` — Phase 2 consumes `research/context_pack.md` + `research/extraction.json` + `research/assets/`
- `agents/web-research.md` — Phase 1 dispatch wrapper
