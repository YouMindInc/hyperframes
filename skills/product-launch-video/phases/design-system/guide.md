# Design System (Phase 1b)

Extract a website's design system into JSON tokens, then synthesize a consolidated brand-themed `design.html` that serves as the **single source of truth** for all design decisions in Phases 3 and 4b of this pipeline.

This phase is **internal to `product-launch-video`** — not a standalone skill. It runs **in parallel with Phase 1 (web-research)** since both only need the target URL.

## What you produce

A single self-contained file `./design-system/design.html` (~80KB, 10 sections, brand-themed). It is consumed by:

- **Phase 3 (visual-design)** — quotes real hex / font / GSAP-easing values in each scene's `creative_brief` in `section_plan.md`. **design.html is the authoritative source for palette, typography, and motion easing — visual-design does NOT pick palettes from any other reference.**
- **Phase 4b (hyperframes-scene workers)** — pastes the `:root` variable blocks + component HTML+CSS straight into each scene's scoped `<style>`.

Step 2 (synthesis) is **deterministic** (no LLM, ~50ms) so any token tweak re-renders instantly.

## Workflow (two steps)

### Step 1: Extract — `designlang`

```bash
mkdir -p design-system
npx designlang <url> --out ./design-system
```

Writes ~30 artifacts including `<domain>-design-tokens.json`, `-motion-tokens.json`, `-visual-dna.json`, `-voice.json`, `-gradients.json`.

Useful flags:

- `--out <dir>` — output directory (convention: `./design-system`)
- `--header "Accept-Language:en-US,en;q=0.9"` — request English (many CDNs override via geo, but it's worth trying)
- `--user-agent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ..."` — paired with the language header
- `--wait 2000` — wait for JS-heavy hydration before reading computed styles
- `--smart` — LLM-assisted classifier; needs `ANTHROPIC_API_KEY`; not required

Typical runtime: **30-90s** (network + Playwright). Surface stdout/stderr verbatim to the user.

### Step 2: Synthesize — `build-design-html.mjs`

```bash
node <SKILL_DIR>/phases/design-system/scripts/build-design-html.mjs ./design-system
```

The script:

- Auto-detects the file prefix (`<domain>-`) from `*-design-tokens.json`
- Reads up to 5 sibling JSON files (only `*-design-tokens.json` is required)
- Computes a **brand-specific theme** for the design.html page itself (primary, accent, signature gradient, ink, canvas, fonts)
- Writes `<dir>/design.html` and prints a one-line summary

Flags:

- `--prefix <name>` — override prefix auto-detection
- `--out <file>` — override output path (default: `<dir>/design.html`)

Typical runtime: **<100ms**.

### One-liner

```bash
mkdir -p design-system \
  && npx designlang <url> --out ./design-system \
  && node <SKILL_DIR>/phases/design-system/scripts/build-design-html.mjs ./design-system
```

End-to-end: ~30-90s.

## Output: design.html — what's inside

| §   | Section           | Purpose for video pipeline                                                                        |
| --- | ----------------- | ------------------------------------------------------------------------------------------------- |
| 0   | Agent intro       | Contract for the two downstream agents (Phase 3 + Phase 4b)                                       |
| 1   | Brand DNA         | One-glance summary — primary, accent, ink, canvas + signature gradient                            |
| 2   | Color system      | Swatches (click-copy) + 📦 `:root` CSS variables block for scene scoping                          |
| 3   | Typography        | Display / body / mono roles + 📦 font-family rule. **Explicit warning: web sizes ≠ video sizes**  |
| 4   | Border radius     | All extracted radii + 📦 `--r-*` variables with recommended usage                                 |
| 5   | Motion            | Easings as SVG curves with **CSS cubic-bezier → GSAP ease mapping** + 📦 `EASE` / `DUR` JS consts |
| 6   | Visual DNA        | Material (flat/material/glass) + imagery (illustration/photo) + background pattern                |
| 7   | Brand voice       | Tone, heading style, CTAs — with **non-English auto-detection + warning**                         |
| 8   | Components        | 7 reusable pieces (hero text / chip / button / card / backdrop / eyebrow / stat) with HTML+CSS    |
| 9   | Agent cheat sheet | Per-agent guidance: what visual-design quotes vs what hyperframes-scene pastes                    |

Every code block has a copy button. Every swatch click copies the hex. No external dependencies.

## How downstream phases use design.html

**Phase 3 — visual-design** (writes `section_plan.md`):

- Reads §1–§7 to absorb the brand. **This replaces any other palette/typography reference** — do not pick palettes from `hyperframes-creative` or invent values.
- In each scene's `creative_brief` prose, quotes the real hex (not "blue") and the real ease constant (not "smooth ease")
- §9 cheat sheet spells out exactly what to cite per scene

**Phase 4b — hyperframes-scene workers** (write `hyperframes/compositions/<scene-id>.html`):

- Paste the §2 → §4 `:root` variable block into the scoped `<style>`
- Copy the §5 `EASE` + `DUR` constants into the inline `<script>` before the timeline
- When the brief names a component (e.g. "hero gradient text"), paste that §8 snippet verbatim

## Edge cases the script handles automatically

- **Missing JSON file** — skip the section with a "not extracted" note; never crashes
- **No gradients** — synthesizes a signature gradient from `primary → accent`
- **No `brand.accent` and no gradient pair** — derives accent by rotating primary hue +120° in HSL
- **Single font family** — uses it for display + body; mono falls back to ui-monospace
- **No motion tokens** — defaults to `power2.out` (entry) / `power3.inOut` (emphasis)
- **Non-English voice data** — auto-detected via non-ASCII chars; emits warning + verbatim source for hand-translation. Common for sites that force locale by CDN geo (heygen.com, e.g., always returns ID/VI in some regions regardless of `Accept-Language`)
- **All neutrals near white/black** — picks the closest off-white as canvas, closest off-black as ink

## Re-build pattern

After editing any extracted JSON (hand-translating voice samples, swapping a brand hex, etc.) — re-run **only** Step 2:

```bash
node <SKILL_DIR>/phases/design-system/scripts/build-design-html.mjs ./design-system
```

~50ms turnaround. design.html re-renders with the new values.

## Alternative tool: copydesign

Commercial extractor with API key. Use only if the user already has credentials or explicitly asks.

```bash
npx copydesign <url>
```

After running, the **same Step 2 script works** as long as the output filenames follow the `<prefix>-design-tokens.json` convention. If not, pass `--prefix <name>` to override.

## Notes

- The hosted demo at designlang.app has a 1-extraction-per-IP-per-day cap; the CLI has none
- Both designlang and the synth script need the URL to be publicly reachable — auth-walled pages won't work
- Output is based on **computed styles at crawl time** — dynamic theme switches (dark mode, A/B variants) capture only the rendered variant
- The synth script is brand-agnostic — it adapts the design.html's own visual style to whichever palette was extracted, so the file always looks coherent with its subject brand

## See also

- `phases/web-research/guide.md` — Phase 1 runs in parallel; captures content/assets (not styling)
- `phases/visual-design/guide.md` — Phase 3 consumes `design-system/design.html` as the single source of truth for all design decisions
- `agents/design-system.md` — Phase 1b dispatch wrapper
