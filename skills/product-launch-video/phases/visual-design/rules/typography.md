---
name: video-typography
description: "Font hierarchy, scale, and selection for HyperFrames videos — site fonts first, curated fallbacks second [font, typography, text, hierarchy, scale]"
category: visual-design
---

# Typography for Video

Video typography differs from web typography. There is no scrolling, no responsive reflow, and the viewer cannot control the pace. Every text element must be legible at a glance within its visible window (typically 1-5 seconds) and must do _real work_ in the frame — type is rarely decoration in a strong launch video, it is the scene's emotional anchor.

**Font families come from `./design-system/design.html` §3. This file owns video-craft numerics** — type scale, CJK fallback, letter-spacing — calibrated against the golden-sample archive.

## Font Selection Strategy

### Font families come from `./design-system/design.html` §3

design.html §3 is the **single source of truth** for this brand's fonts. Variables on `:root`: `--display` (headline), `--body` (UI prose), `--mono` (code / labels / eyebrows). The HyperFrames compiler auto-embeds Google Fonts; design.html already loads them in its `<head>`. Cite the **actual font name** in every scene's prose (e.g., "Instrument Serif at 132px"), never "display font" or a font from elsewhere.

If design.html lacks a mono font (single-family extraction), fall back to `ui-monospace, 'SF Mono', monospace` — call this out explicitly in the prose body.

**Never** invent font names. **Never** pick fonts based on archetype alone — design.html overrides any "feel" matching.

**Fonts to avoid as display choices** (overused in AI output): Inter as plain-weight display (fine as body or as a 900-weight tight-tracking display), Roboto, Open Sans, Lato, Montserrat. Use Inter heavy and tight, or don't use it for display at all.

### Priority 3: One font family is often enough

A single well-chosen font in multiple weights creates cleaner hierarchy than two competing typefaces. Only add a second font when you need genuine contrast (e.g. serif display headlines + sans body, or sans hero + mono labels).

The golden samples push _farther_ than this: the codex-plugin and hermes plans run a **three-voice system** — Inter Tight for headlines, IBM Plex Mono for labels/code/eyebrows, Inter/Plex Sans for body. The mono voice is the workhorse — it tags every metadata line, command palette row, and timestamp, and signals "real tool, real workflow" rather than "marketing video."

**Never pair fonts that are similar but not identical** (e.g. two geometric sans-serifs). They create visual tension without clear hierarchy.

## Type Scale for 1920x1080 Video

Video is viewed at a distance or in a small player. Use larger sizes and higher contrast than web. The golden samples skew **much** larger than typical web type — display headlines routinely exceed 200px and hero moments push to 500-800px.

### Modular scale with contrast

Use fewer size steps with more contrast between them. The 6-tier scale below is calibrated against actual sizes seen in the archive (timeline-editor-launch-v5, playground-launch, codex-plugin-announcement, fadeglow-v4, hermes, hyperframes-animation/examples):

| Role           | Size range | Weight  | Real-archive example                                                                |
| -------------- | ---------- | ------- | ----------------------------------------------------------------------------------- |
| Mega / climax  | 400-800px  | 800-900 | Fadeglow "RED" (800px), timeline-editor Act 0 "ever" (500-520px)                    |
| Hero / display | 200-340px  | 700-900 | Codex h1 (126-220px), playground 2A `.lead` (142px), Bricolage "BUM" (220px)        |
| Display        | 88-150px   | 700-900 | Hermes section heads (120px), timeline-editor trio (150px), comparison title (88px) |
| Heading        | 48-92px    | 500-700 | Codex h2 (92px), proof-logo brand label (54px)                                      |
| Body           | 26-40px    | 400-500 | Article-walkthrough body (39px), vercel storyboard (26px), demo card label (28px)   |
| Eyebrow / UI   | 14-30px    | 400-600 | Codex eyebrow (21px uppercase), nav items (14px), command palette (18px)            |
| Data / counter | 48-806px   | 600-900 | hook-counter-burst (806px), metric-video-text-pivot (340px)                         |

**Popular ratios**: 1.25 (subtle), 1.333 (fourth), 1.5 (fifth). The archive trends to **2x or 3x jumps** between roles — 220px display → 92px heading → 30px eyebrow is a 7.3x spread, intentionally jarring so the hierarchy reads in <1s. Avoid sizes that are too close together (48, 52, 56 — muddy hierarchy).

## Hierarchy through multiple dimensions

Size alone is not enough. Combine at least 2-3 of these:

| Dimension | Strong contrast                                           | Weak contrast          | Archive example                                                         |
| --------- | --------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------- |
| Size      | 3:1 ratio or more                                         | Less than 2:1          | timeline-editor: 500px "ever" against 220px "If you've"                 |
| Weight    | Bold (800-900) vs Light (300-400)                         | Medium vs Regular      | codex-plugin: 900 Inter Tight headline + 400 Plex Mono label            |
| Color     | High contrast to background                               | Similar tone           | fadeglow: hot magenta `#FF2D7A` on pure white                           |
| Spacing   | Tight (-0.045em) for display + wide (0.08em) for eyebrows | Default for body       | playground 2A `.lead` (-0.055em) + codex eyebrow (uppercase 0.08em)     |
| Case      | Uppercase eyebrow, mixed-case body                        | Everything same case   | codex "CODEX WORKSPACE" eyebrow over sentence-case h1                   |
| Style mix | Italic serif + heavy sans                                 | Same family throughout | timeline-editor Act 0: Playfair italic "ever" inside Inter 900 sentence |

Example: A hero title that is larger, heavier weight (900), with -0.04em letter-spacing, reads as clearly distinct from a 21px IBM Plex Mono eyebrow set in uppercase with 0.08em tracking. That contrast — heavy compressed sans vs. light expanded mono — is the codex-plugin signature.

## Animated Numbers

When animating numeric values (counters, percentages, statistics):

```css
.counter,
.stat-value {
  font-variant-numeric: tabular-nums;
}
```

This prevents width jumping as digits change. Without it, neighboring elements will jitter as the count animates. Every counter in the hyperframes-animation/examples archive (`hook-counter-burst`, `proof-logo-chain`) sets this — it is the lowest-effort highest-impact rule in the file.

## OpenType features for video

Enable kerning explicitly — some renderers skip it by default:

```css
.counter,
.stat-value {
  font-kerning: normal;
}
```

Always set both together on animated number elements:

```css
.counter,
.stat-value {
  font-variant-numeric: tabular-nums;
  font-kerning: normal;
}
```

## Letter-spacing guide

Calibrated against the actual values in the archive:

| Context                      | Letter-spacing                  | Where it shows up                                                     |
| ---------------------------- | ------------------------------- | --------------------------------------------------------------------- |
| Massive display (>200px)     | -0.045em to -0.055em            | playground `.lead` (142px @ -0.055em), timeline-editor Act 0 sections |
| Display headlines (88-150px) | -0.02em to -0.04em              | brand-reveal hero, hermes section heads, codex h1 (-0.02em)           |
| Sentence-case body           | 0 (default)                     | All body prose                                                        |
| Uppercase eyebrow / label    | 0.06-0.10em (most often 0.08em) | codex eyebrow, proof-logo brand strip                                 |
| Small caps / metadata        | 0.04-0.06em                     | hermes "v.0.4.2 / heygen/hyperframes" line                            |
| Mono code / terminal         | 0 (default)                     | All Plex Mono / JetBrains Mono usage                                  |

**Tight tracking (-0.04 to -0.055em) is the signature of a confident display headline.** The neutral 0em default makes a 200px headline look soft and corporate. **Never apply wide letter-spacing to body text or long sentences** — it destroys readability — and never apply tight tracking to mono code, which loses its rhythm.

## Text on backgrounds

The archive's actual color choices for text:

- **On near-black backgrounds** (`#0a0a0f`, `#060812`, `#07100c`, `#0B0D0E`): use a soft off-white — `#f8fafc`, `#fff8e9` (warm "paper"), `#f2f6ef` (green-tinted), or `#f7fff7`. Pure `#ffffff` is reserved for the very highest-emphasis hero word or counter.
- **On warm-paper backgrounds** (`#f5f5f7`, `#fff8e9`, `#f3ead7`): use a deep ink near-black tinted toward the brand — `#1d1d1f`, `#191713`. Pure `#000000` is the wrong answer.
- **On images / video plates**: always add a scrim and shadow. The archive defaults are an `rgba(0,0,0,0.62)–rgba(0,0,0,0.72)` panel behind the text plus `drop-shadow(0 2px 8px rgba(0,0,0,0.6))` or `text-shadow: 0 4px 12px rgba(0,0,0,0.5)`. magnetic-caption-webgl is the cleanest reference.
- **Glowing display text on dark**: add a `drop-shadow(0 0 24-72px <accent>)` at 0.10-0.45 opacity — `cta-morph-press` uses 0.30 cyan, `concept-demo-decode-pan` uses 0.20 green. Stack two drop-shadows for an aura: one tight, one wide.
- **Chromatic / spectral edge** (VFX moments, sparingly): two text-shadow layers offset 2-8px in `#ff4fd8` and `#49f2ff`. hermes-hyperframes uses this on the "HYPERFRAMES" title punch — **one** chromatic moment, not pervasive.
- Light text on dark requires more line-height (+0.05 to 0.1) than dark on light — compensate explicitly.

## CJK & Emoji Support

Headless Chromium has no CJK or emoji fonts unless explicitly installed. The Docker image provides `Noto Sans CJK SC` and `Noto Color Emoji` as system fonts.

### Rules

1. **Every `font-family` must include a CJK fallback** — even if you don't expect Chinese text, the narrator script or user edits may introduce it:

   ```css
   .display,
   .body {
     font-family: "BrandFont", "Noto Sans CJK SC", "PingFang SC", sans-serif;
   }
   ```

2. **For Chinese-primary content**, use a CJK font as the display font — don't rely on fallback rendering:
   - `Noto Sans CJK SC` (system font in Docker, clean and modern)
   - Any CJK Google Font that matches the chosen feel (e.g., `Noto Serif SC` for editorial, `LXGW WenKai` for handwritten warmth)

3. **Emoji** renders automatically via the system `Noto Color Emoji` font — no CSS changes needed. Avoid using emoji as critical UI elements (they render differently across platforms).

4. **CJK typography sizing**: Chinese characters are visually denser than Latin. When mixing CJK and Latin text, CJK often reads well 2-4px smaller than the Latin size guide above. For CJK-only display text, 160-200px is a good hero range (vs the 220-340px Latin display range) — the visual weight comes out comparable.

## Font pairing principles

Contrast across multiple axes creates clear hierarchy. The pairings that actually appear in the archive:

- **Heavy sans + light mono** (codex-plugin, hermes): Inter Tight 800-900 for headlines, IBM Plex Mono 400 for labels/code/eyebrows. The mono signals "real tool, real workflow."
- **Serif italic accent inside sans display** (timeline-editor-launch-v5 Act 0): Inter 900 sentence + a single Playfair Display italic 900 emphasis word. The italic word _is_ the beat.
- **Display serif + sans body + mono eyebrow** (article-walkthrough): a three-voice editorial system — Fraunces for warmth, Inter for prose, Plex Mono for metadata.
- **Single family in extreme weight range** (fadeglow Beat 2): Bricolage Grotesque 800 alone, in two sizes and two colors. The weight does the work.

**Per-scene typographic variance is a valid move.** The playground-launch plan runs **five different font pairings in 8 beats** — DM Serif Display, Bricolage, Inter, Caprasimo+Familjen Grotesk, JetBrains Mono. The constraint is that each beat's visual world is complete and self-contained. Don't unify when the emotional arc says "shift universe."

**Never pair fonts that are similar but not identical** — two geometric sans-serifs, or two humanist serifs. They create visual noise without hierarchy benefit. When in doubt, one family in two extreme weights is cleaner than two competing typefaces.
