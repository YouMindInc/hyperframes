# Web Research (Phase 1)

Browser-based capture of a marketing/landing page into a research pack: visible text, section structure, downloadable image/video/font assets, and a full-page screenshot. Used by Phase 2 (story-design) to design the narrative and per-scene `assetCandidates`.

Pure capture — no LLM call, no analysis. Phase 2 (story-design) does the analysis directly into `narrator_scripts.json`.

## What the script produces

```
research/
├── context_pack.md          # ~50KB compact LLM-friendly digest — read first
├── extraction.json          # ~175KB raw extraction (sections, assets, colors, fonts, rects)
├── page.html                # raw page source
├── screenshot_full.png      # full-page rendered screenshot (1440px wide)
└── assets/
    ├── index.json           # inventory of downloaded assets with local paths
    └── ...                  # actual files (png/jpg/svg/webp/mp4/woff2/…)
```

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

Useful flags: `--wait <sec>` (lazy-load hydration), `--viewport 1440x1200`, `--max-assets 80`, `--no-screenshot`.

## See also

- `phases/design-system/guide.md` — Phase 1b runs in parallel; extracts brand design tokens
- `phases/story-design/guide.md` — Phase 2 consumes `research/context_pack.md` + `research/extraction.json` + `research/assets/`
- `agents/web-research.md` — Phase 1 dispatch wrapper
