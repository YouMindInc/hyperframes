---
name: video-color-system
description: "Brand color extraction, palette roles, 60-30-10 allocation, cross-scene consistency [color, palette, brand, tokens, contrast]"
category: visual-design
---

# Color System for Video

**Pair with `hyperframes-creative/references/house-style.md` and `hyperframes-creative/palettes/*.md`** for the named palette catalog and the "lazy defaults to question" list (no gradient text on every scene, no `#000` / `#fff`, etc.). This file is the **numeric overlay** — 60-30-10 allocation, off-black/off-white targets, dual-radial glow recipe, dark-scene compensations — calibrated against the actual hex values used in the golden samples (codex-plugin, timeline-editor-launch-v5, fadeglow-v4, hermes, inspector-logo-intro, hyperframes-animation/examples).

## Extract the brand palette from tokens.json

`tokens.json` contains the design tokens extracted from the target website. The `colors` section is your primary source.

**Steps**:

1. Read `tokens.json` → identify primary, secondary, and accent colors
2. Note background colors (usually the most-used neutral)
3. Note text colors (usually the darkest value)
4. If the site uses a gradient, capture both endpoints
5. Cross-check `extraction/screenshots/` so you see how the brand actually deploys those colors at scale (not what the token names imply)

## Assign palette roles

Every video needs these roles filled:

| Role                   | Source                           | Usage share | Archive example                                                  |
| ---------------------- | -------------------------------- | ----------- | ---------------------------------------------------------------- |
| **Primary accent**     | Brand's main color from tokens   | ~10%        | HyperFrames cyan `#06E3FA` on hero word; Vercel red on geometry  |
| **Secondary accent**   | Brand's second color (optional)  | ~5%         | HyperFrames lime `#4FDB5E` paired with cyan in codex scan bars   |
| **Restrained third**   | Used only on one beat            | <2%         | Codex amber `#F5B84B` — only on plugin-card moments              |
| **Neutral background** | Tinted toward brand hue          | 60%         | `#0B0D0E` graphite (codex), `#f5f5f7` warm-paper (timeline)      |
| **Neutral surface**    | One step warmer/lighter than bg  | ~20%        | Codex panels `#141A1B` / `#1C2424` — barely brighter than bg     |
| **Foreground text**    | Brand-tinted off-white / off-ink | ~10%        | `#F2F6EF` text on graphite; `#1d1d1f` ink on warm paper          |
| **Semantic**           | Derived from brand palette       | Sparingly   | Green for success, red for error — both shifted toward brand hue |

### The 60-30-10 rule in video

This rule is about **visual weight**, not pixel count:

- **60% Neutral backgrounds** — the dominant surface. Must not compete with content
- **30% Secondary surface + body text** — panels, borders, supporting copy
- **10% Accent** — brand primary color, used only on the focal element of the moment

**The number one mistake**: using the brand color everywhere because it is "the brand." Accent colors work because they are rare. Overuse kills their impact. The codex-plugin DESIGN.md gets this right by reserving cyan `#06E3FA` for HyperFrames moments, lime `#4FDB5E` for render moments, and amber `#F5B84B` for Codex moments — three accents, each tied to a _meaning_, never overlapping in the same beat.

The strongest archive examples take this even further: **vercel-intro-storyboard** uses a single brand red on near-black geometry plus one short RGB aberration event, then "snap back to clean black-on-white immediately after." One color, one effect, total restraint.

## Tinted neutrals

Pure gray has no personality. Always tint neutral colors toward the brand hue:

- If the brand is warm (red/orange/yellow): add a subtle warm cast to grays
- If the brand is cool (blue/purple/green): add a subtle cool cast

The tint should be barely perceptible but creates subconscious cohesion. Real examples from the archive:

```css
/* Codex (cool teal/cyan brand) — graphite tinted cool */
.scene {
  background: #0b0d0e;
} /* canvas */
.panel {
  background: #141a1b;
} /* one step warmer surface */
.panel-raised {
  background: #1c2424;
} /* two steps */

/* Inspector (green brand) — canvas tinted green */
.scene {
  background: #07100c;
} /* near-black with green bias */

/* HyperFrames-animation examples (cyan/violet brand) */
.scene {
  background: #0a0a0f;
} /* cool near-black */
.scene-deep {
  background: #060812;
} /* deeper cool for hero moments */
```

**OKLCH approach**: Add a chroma of ~0.01 to all neutral stops in OKLCH space. This is the minimum perceptible hue that still reads as "gray" but feels alive. Warm brand → positive hue angle (~30-60°), cool brand → ~200-260°. The archive's `#07100c` (inspector) and `#0B0D0E` (codex) both encode this — they're not 0-chroma greys.

## Palette structure

A complete video palette has four layers — skip any that are not needed, but do not add extra:

1. **Primary accent**: 1-2 colors, used at 10-15% combined visual weight. Each tied to a specific meaning (e.g., HyperFrames=cyan, render=lime, Codex=amber).
2. **Neutral**: A 3-step ladder — `canvas → surface → surface-raised` — each one perceptual step apart. For dark mode, that's roughly `#0B0D0E → #141A1B → #1C2424`. For light mode, `#f5f5f7 → #ffffff → #fafafa`. Used at 60% (canvas) + ~20% (surfaces).
3. **Foreground**: 1-2 off-white or off-ink values for text (`#F2F6EF` warm-cool, `#fff8e9` warm-paper, `#1d1d1f` ink). Used at ~10%.
4. **Semantic**: Success (green), error (red), warning (amber). Derive from brand hue if possible.

Skip secondary and tertiary accent colors unless the brief explicitly requires them. Extra colors dilute the brand primary and create visual noise.

**Per-beat palette isolation is also a valid move.** Fadeglow-v4 demonstrates the opposite of unified harmony: Beat 2 uses hot magenta `#FF2D7A` on pure white with black outlines (neobrutalist crunch), Beat 4 uses soft peach→teal→lilac gradients on soft-light blend (gradient glow garden), Beat 7 uses single-color `#E63946` on full bleed (RED moment). No attempt to make them cohesive — the song's emotional arc dictates the color logic.

## Never use pure black or pure white

Pure black (#000000) and pure white (#FFFFFF) do not exist in nature. They create harsh contrast that feels synthetic and crush detail in video compression.

Use these calibrated off-blacks (every one is a real archive value):

- `#0a0a0f` — cool tint (HyperFrames default in animation examples)
- `#060812` — deeper cool, for hero/climax beats (hook-counter-burst)
- `#07100c` — green tint (inspector-logo-intro)
- `#0B0D0E` — graphite (codex-plugin canvas)
- `#0a1415` — navy bias (comparison-split-cards)

And these off-whites:

- `#f8fafc` — neutral cool off-white (default for text on near-black)
- `#fff8e9` — warm paper (inspector, magnetic-caption — "warm paper" in the named palettes)
- `#f2f6ef` — soft near-white with green undertone (codex foreground)
- `#f5f5f7` — Apple-warm-white (timeline-editor-launch-v5 canvas)
- `#f7fff7` — green-tinted soft white (playground beat 2A)

Exception: pure white glow `text-shadow` or `drop-shadow` _aura_ on an accent moment is acceptable — `cta-orbit-collapse` and `workflow-approve-press` both use white at low opacity inside a stacked shadow for the click ripple peak.

## Cross-scene color consistency

Every scene in the video must feel like it belongs to the same visual system — unless you are explicitly running the fadeglow-style "each scene a new universe" pattern (which only works when the audio/narrative arc justifies the shock).

**Rules**:

- Define the background palette once at the project level — CSS custom properties on `:root` (or a shared `<style>` in `index.html`), referenced from every scene's `<style>` — not per scene as ad-hoc hex values
- Scenes can vary in lightness (dark scene → light scene for contrast) but must share the same hue family
- Accent color usage must be consistent: if primary cyan is the HyperFrames-moment color in scene 1, it cannot become a background gradient in scene 5
- Data visualization colors should be derived from the brand palette, not arbitrary

**Scene-level variation is fine within limits**:

- Alternating dark/light backgrounds for rhythm (timeline-editor-launch-v5: Act 0 light, Act 1 dark, Act 2 light)
- Shifting from desaturated (calm scenes) to saturated (emphasis scenes)
- Using a gradient between two brand-adjacent colors (timeline-editor "know" word: cyan→lime continuous scan)

**Forbidden**:

- Each scene inventing its own color scheme without narrative justification
- Using colors not present in or derived from the brand palette
- Default "neon-on-dark" AI slop palette (electric purple + magenta + cyan on `#000`) — the archive uses muted glows at 0.15-0.35 opacity, not full-saturation neon

## Contrast for readability

Video is often viewed small (phone, embedded player). Text contrast must be aggressive:

| Content                  | Minimum contrast   | Target                                                                   |
| ------------------------ | ------------------ | ------------------------------------------------------------------------ |
| Display text on solid bg | 4.5:1              | 7:1                                                                      |
| Body/caption text        | 4.5:1              | 7:1                                                                      |
| Text on image            | Use scrim + shadow | `rgba(0,0,0,0.62-0.72)` panel + `drop-shadow(0 2px 8px rgba(0,0,0,0.6))` |
| Text on gradient         | Check both ends    | Readable across full gradient                                            |

**Gray text on colored backgrounds always looks washed out.** Use a darker shade of the background color or a transparent overlay instead. The codex-plugin's `#94A09A` muted text only sits on `#0B0D0E` graphite, never on a saturated panel.

## Background treatment

Solid flat backgrounds are safe but boring. The archive layers depth into every background:

1. **Base color** — the tinted off-black or off-white
2. **Subtle gradient or radial swell** — the dual-radial overlay is the recurring HyperFrames signature: two offset radial glows + a linear base. Endpoints typically `rgba(<accent>, 0.17-0.20)` to `transparent` at 30-50% radius. Hermes uses a warm orange `rgba(216, 95, 63, 0.18)` at 14% 8% paired with teal `rgba(47, 127, 117, 0.17)` at 84% 20% — warm + cool quadrant split.
3. **Ambient texture** — noise overlay at 2-5% opacity, scanline `repeating-linear-gradient(0deg, #ffffff 0 1px, transparent 1px 3px)` at 0.035 (playground beat 2A), or a halftone dot field whose density breathes per beat (inspector-logo-intro).
4. **Architectural grid** — codex uses `rgba(148, 160, 154, 0.08)` at 80px spacing — barely visible, but it tells the viewer "this is a real workspace, not a marketing video."
5. **Particle layer** — brand-colored floating particles (handled by environment layer); hermes uses 100-150 dots in 6 colors at low opacity as a sparse noise field across the whole video.

This creates visual richness without competing with foreground content. **A flat solid background is the strongest signal that the scene was undercooked.**

## Dangerous color combinations

Combinations that look fine in a design tool but fail at video playback size:

- **Light gray on white**: contrast collapses, especially on lower-quality screens
- **Gray on a colored background**: the gray reads as washed-out or dirty; use a darker shade of the background hue instead
- **Thin light text on images**: even with a shadow, sub-500-weight text under 40px on a busy image is unreliable — add a scrim, increase weight, or both
- **Pure-saturation neon on `#000`**: reads as AI default. Tone the background to an off-black and drop the accent to 0.20-0.35 glow opacity instead of full
- **Purple-to-blue "AI" gradients**: explicitly banned in the codex-plugin DESIGN.md — "no generic purple-blue AI gradients." If you need depth, use brand-tinted radial swells.

## Dark scene rules

Dark scenes require adjustments beyond just inverting colors:

- **Never pure black**: use a dark tinted neutral from the off-black list above. The archive's strongest hero moments (`hook-counter-burst` 806px counter on `#060812`) all anchor against tinted off-blacks, not `#000000`.
- **Reduce text font weight one step**: bold text on dark tends to bloom and look heavier than intended — drop one weight (700 → 600, 900 → 800). The codex-plugin uses 700-800 for body text on graphite where the website probably used 600.
- **Desaturate accents 10-20%**: a brand color at full saturation on dark background can feel garish — reduce saturation by 10-20% or drop opacity to 90%. Codex's `#06E3FA` is already a calibrated calmer cyan than a pure spectral cyan would be.
- **Increase line-height**: as noted in typography rules, light text on dark needs +0.05 to 0.1 line-height to maintain perceived spacing
- **Accent glow stack**: an off-black scene with a glowing accent word typically uses _two_ drop-shadows — a tight one (`drop-shadow(0 0 24px <accent> / 0.30)`) for crisp edge and a wide one (`drop-shadow(0 0 72px <accent> / 0.15)`) for the aura. Single-layer glow looks anemic.
