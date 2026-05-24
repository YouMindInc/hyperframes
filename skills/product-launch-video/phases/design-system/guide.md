# Design System (Phase 1b)

Extract a website's design system into JSON tokens, then synthesize a consolidated brand-themed `design.html` that serves as the **single source of truth** for all design decisions in Phases 3 and 4b of this pipeline.

Runs **in parallel with Phase 1 (web-research)** since both only need the target URL.

Output: `./design-system/design.html` (~80KB, 10 sections, brand-themed). Consumed verbatim by Phase 3 (visual-design) and Phase 4b (hyperframes-scene workers).

## Procedure at a glance

1. `npx designlang <url> --out ./design-system` → writes ~30 token JSON files
2. `node build-design-html.mjs ./design-system` → synthesizes `design.html`
3. `node download-fonts.mjs ./design-system` → downloads self-hosted brand fonts + injects `@font-face` into design.html
4. Verify `design.html` exists + report primary/accent hex + fonts

## Workflow (three steps)

### Step 1 — Extract tokens with `designlang`

```bash
mkdir -p design-system
npx designlang <url> --out ./design-system
```

Writes ~30 artifacts including `<domain>-design-tokens.json`, `-motion-tokens.json`, `-visual-dna.json`, `-voice.json`, `-gradients.json`.

Useful flags:

- `--header "Accept-Language:en-US,en;q=0.9"` + `--user-agent "..."` — request English (many CDNs override via geo)
- `--wait 2000` — wait for JS-heavy hydration before reading computed styles
- `--smart` — LLM-assisted classifier; needs `ANTHROPIC_API_KEY`; not required

Typical runtime: 30-90s.

### Step 2 — Synthesize `design.html`

```bash
node <SKILL_DIR>/phases/design-system/scripts/build-design-html.mjs ./design-system
```

Auto-detects the file prefix from `*-design-tokens.json`. Writes `<dir>/design.html` and prints a one-line summary.

Flags: `--prefix <name>` (override auto-detection), `--out <file>` (override output path).

### Step 3 — Download self-hosted fonts

```bash
node <SKILL_DIR>/phases/design-system/scripts/download-fonts.mjs ./design-system
```

designlang extracts font-family **names** but does NOT download the actual `.woff2` files. For self-hosted brand fonts (e.g. `TT Norms Pro`, `ABC Solar Display`) that Google Fonts doesn't have, the renderer would otherwise fall back to system fonts and the video typography would not match the brand.

What it does:

1. Reads `design.html` to find the source URL (from its AGENT NOTE comment) and the brand font families declared in its `font-family` lines.
2. Fetches the source URL's HTML + any external stylesheets (capped at 10).
3. Greps every `@font-face` block, filters to families that match the declared brand fonts, picks the preferred-format URL (woff2 > woff > ttf > otf).
4. Downloads each file to `design-system/fonts/<family>-<weight>[i].<ext>` (idempotent — cached files are skipped on re-run).
5. Writes `design-system/fonts/manifest.json` mapping family → [{ file, weight, style }].
6. **Rewrites `design.html`** — injects `@font-face` rules pointing at relative `fonts/<file>` paths, immediately after the opening `<style>`. Sentinel comments make re-runs idempotent.

Phase 4a (`prep.mjs`) then copies `design-system/fonts/*` → `hyperframes/public/fonts/`, so Phase 4b workers' scoped `<style>` blocks (pasted verbatim from design.html) resolve the brand fonts at render time.

If the site uses **only** Google Fonts, the script exits 0 with `no brand fonts to download` — that's fine (Google Fonts already load via design.html's `<head>`).

Typical runtime: 2-15s (network + per-font download).

### One-liner

```bash
mkdir -p design-system \
  && npx designlang <url> --out ./design-system \
  && node <SKILL_DIR>/phases/design-system/scripts/build-design-html.mjs ./design-system \
  && node <SKILL_DIR>/phases/design-system/scripts/download-fonts.mjs ./design-system
```

## Output: design.html — section index

| §   | Section           | Contents                                                                                    |
| --- | ----------------- | ------------------------------------------------------------------------------------------- |
| 0   | Agent intro       | Contract for downstream agents (Phase 3 + Phase 4b)                                         |
| 1   | Brand DNA         | Primary, accent, ink, canvas + signature gradient                                           |
| 2   | Color system      | Swatches + 📦 `:root` CSS variables block                                                   |
| 3   | Typography        | Display / body / mono roles + 📦 font-family rule                                           |
| 4   | Border radius     | All extracted radii + 📦 `--r-*` variables                                                  |
| 5   | Motion            | Easings as SVG curves + 📦 `EASE` / `DUR` JS consts (CSS cubic-bezier → GSAP ease mapping)  |
| 6   | Visual DNA        | Material (flat/material/glass) + imagery + background pattern                               |
| 7   | Brand voice       | Tone, heading style, CTAs                                                                   |
| 8   | Components        | 7 reusable pieces (hero text / chip / button / card / backdrop / eyebrow / stat) — HTML+CSS |
| 9   | Agent cheat sheet | Per-agent guidance: what visual-design quotes vs what hyperframes-scene pastes              |

## See also

- `phases/web-research/guide.md` — Phase 1 runs in parallel
- `phases/visual-design/guide.md` — Phase 3 consumes `design.html` as the single source of truth
- `agents/design-system.md` — Phase 1b dispatch wrapper
