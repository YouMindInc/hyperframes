```preset-meta
{
  "name": "neo-brutalism",
  "label": "Neo-Brutalism",
  "fingerprint": {
    "shadow": "hard-offset",
    "border": "solid-thick",
    "motion": "hit-and-stick",
    "density": "high",
    "contrast": "high"
  },
  "match_signals": [
    { "kind": "shadow_zero_blur",    "weight": 0.30 },
    { "kind": "thick_solid_border",  "weight": 0.25 },
    { "kind": "condensed_display",   "weight": 0.15 },
    { "kind": "high_sat_accent",     "weight": 0.15 },
    { "kind": "rotated_transform",   "weight": 0.10 },
    { "kind": "bouncy_easing",       "weight": 0.05 }
  ],
  "best_for": ["manifesto brands", "indie SaaS", "declarative product launches", "agency talks", "design-led pitches"],
  "avoid_for": ["corporate restraint", "quiet authority", "institutional finance", "healthcare", "regulated industries"],
  "chromeFonts": {
    "googleFontsHref": "https://fonts.googleapis.com/css2?family=Anton&family=Archivo+Black&family=Inter:wght@400;500;700;800&family=Space+Mono:wght@400;700&display=swap",
    "display": "Anton",
    "body": "Inter",
    "script": "Anton",
    "mono": "Space Mono"
  }
}
```

> `chromeFonts` makes the design.html doc chrome (title-card, section heads, h2/h3, lede paragraphs, eyebrows) render in the preset's NATIVE typography — Anton + Inter + Space Mono — instead of the brand DNA fonts. Neo-Brutalism is a two-face system: Anton (condensed display) carries every heading and the `script` slot also points at Anton because the preset refuses a third face. The brand fonts still apply to §6 component code (paste-ready for Phase 4b). §M motifs grid and §T type-role atlas use `.preset-native-scope` so var(--font-display/body/mono) re-resolves to these native families for the live preview.

## §A Director's intent

Hard edges. Declarative typography. Shadow is **weight**, not depth.
Manifesto voice. Hit-and-stick motion. No glide, no fade, no apology.
One huge thing per scene. Cut, don't crossfade.

## §B Decoration tokens (merge into design.html `:root`)

Shadow offsets and border widths stay in **px** — they're visual signatures,
not proportional spacing. A 4px border that scales would vanish on small
viewports. Only the spacing variable uses `vw`.

```css
--shadow-hard: 8px 8px 0 var(--ink);
--shadow-hover: 11px 11px 0 var(--ink);
--border-bold: 4px solid var(--ink);
--border-loud: 6px solid var(--ink);
--tilt-l: -1deg;
--tilt-r: 1deg;
--gap-loud: 1.7vw; /* ~32px on a 1920 canvas */
```

## §D Font pairing fallback (if brand fonts not on Google Fonts)

- **display**: `'Anton'` · `'Archivo Black'` · `'Space Grotesk'` wght 800
- **body**: `'Inter'` · `'IBM Plex Sans'` wght 500
- **mono**: `'Space Mono'` · `'JetBrains Mono'` wght 700

If brand fonts ARE on Google Fonts, keep brand fonts — preset only overrides weight and tracking.

## §T Type-role atlas (Phase 4b reads this to size text correctly)

Each entry is a **named type role** with concrete render parameters at 1920×1080 — family token, px range, weight, leading, tracking, case, and any color/border/shadow decoration. Phase 4b scene workers may cite roles by `id` ("use a `display-cover` here"); the brand DNA fonts plug in automatically via `var(--font-*)` tokens. Decoration (hard offset shadow, thick ink border, hard tilt) is preset-native and stays declared with neo-brutalism colors.

The atlas is the **sole authoring source** for non-component text. If a scene needs a `number-hero` numeral that isn't covered by §6 components, the worker reads role `number-hero` here and writes inline CSS from these values. Do NOT invent ad-hoc sizes — neo-brutalism's identity collapses if weights drift below 800 at display scale or borders thin below 4px.

```type-roles
[
  {
    "id": "display-cover",
    "family": "display",
    "purpose": "cover hero at maximum scale — one huge thing per scene, ink on canvas",
    "px_min": 200, "px_max": 340, "weight": 800, "leading": "0.86", "tracking": "-0.04em", "case": "upper",
    "sample_html": "<div class=\"t-trole-display-cover\">BRAND</div>"
  },
  {
    "id": "headline",
    "family": "display",
    "purpose": "primary slide headline — declarative manifesto voice",
    "px_min": 96, "px_max": 160, "weight": 800, "leading": "0.9", "tracking": "-0.03em", "case": "upper",
    "sample_html": "<div class=\"t-trole-headline\">TEAMS. SHIP.</div>"
  },
  {
    "id": "statement",
    "family": "display",
    "purpose": "framed declarative quote on canvas — thick border + hard offset shadow",
    "px_min": 56, "px_max": 96, "weight": 800, "leading": "1", "tracking": "-0.02em", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-statement\">ONE HUGE THING. NO APOLOGY.</span></div>"
  },
  {
    "id": "number-hero",
    "family": "display",
    "purpose": "hero statistic numeral — ink on canvas, no decoration",
    "px_min": 120, "px_max": 240, "weight": 800, "leading": "0.9", "tracking": "-0.04em", "case": "upper",
    "sample_html": "<div class=\"t-trole-number-hero\">340%</div>"
  },
  {
    "id": "h2",
    "family": "display",
    "purpose": "secondary headline / section title",
    "px_min": 56, "px_max": 96, "weight": 800, "leading": "0.95", "tracking": "-0.03em", "case": "upper",
    "sample_html": "<div class=\"t-trole-h2\">Section title</div>"
  },
  {
    "id": "h3",
    "family": "display",
    "purpose": "panel title / card heading",
    "px_min": 32, "px_max": 48, "weight": 800, "leading": "1", "tracking": "-0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-h3\">Sub-headline</div>"
  },
  {
    "id": "eyebrow",
    "family": "body",
    "purpose": "eyebrow label above a headline — tracked uppercase Inter 700",
    "px_min": 14, "px_max": 18, "weight": 700, "leading": "1.2", "tracking": "0.18em", "case": "upper",
    "sample_html": "<div class=\"t-trole-eyebrow\">Vol. 01 — Manifesto</div>"
  },
  {
    "id": "lead",
    "family": "body",
    "purpose": "lead paragraph / opening sentence (Inter 500)",
    "px_min": 22, "px_max": 32, "weight": 500, "leading": "1.4", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-lead\">Hard edges. Declarative typography. Shadow is weight, not depth.</p>"
  },
  {
    "id": "body",
    "family": "body",
    "purpose": "default body paragraph (Inter 500)",
    "px_min": 16, "px_max": 22, "weight": 500, "leading": "1.55", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body\">Body sits at Inter 500. Sentence case, terse. The manifesto is in the display; the body is the receipt.</p>"
  },
  {
    "id": "caption",
    "family": "mono",
    "purpose": "small caption / source attribution (Space Mono 700)",
    "px_min": 12, "px_max": 16, "weight": 700, "leading": "1.4", "tracking": "0.04em", "case": "sentence",
    "sample_html": "<p class=\"t-trole-caption\">Source: internal data, 2026.</p>"
  },
  {
    "id": "label-mono",
    "family": "mono",
    "purpose": "tracked uppercase mono label — chrome bar, slide counter, chip metadata",
    "px_min": 12, "px_max": 15, "weight": 700, "leading": "1.3", "tracking": "0.16em", "case": "upper",
    "sample_html": "<div class=\"t-trole-label-mono\">01 / MANIFESTO</div>"
  },
  {
    "id": "chip-loud",
    "family": "display",
    "purpose": "ink pill chip — canvas text on ink fill, thick border, slight tilt",
    "px_min": 18, "px_max": 28, "weight": 800, "leading": "1", "tracking": "0.04em", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-chip-loud\">SHIP IT</span></div>"
  },
  {
    "id": "cta-arrow",
    "family": "display",
    "purpose": "arrow-prefixed CTA — declarative imperative with hit-and-stick weight",
    "px_min": 28, "px_max": 44, "weight": 800, "leading": "1", "tracking": "-0.01em", "case": "upper",
    "sample_html": "<div class=\"t-trole-cta-arrow\">→ JOIN THE DROP</div>"
  }
]
```

The atlas omits `shadow-hard` and `border-bold` (they're decoration tokens, declared in §B) and signature gestures like `triple-pin` / `tilt-card` (declared in §M atomic motifs).

## §E Motion (GSAP consts — REPLACES site ease)

```js
const EASE = {
  entry: "back.out(2.4)", // bouncy slam-pop
  emphasis: "expo.out", // hard arrival
  exit: "power4.in", // dive off
  drift: "sine.inOut", // only for ambient breathing
};
const DUR = {
  snap: 0.18,
  med: 0.45,
  slow: 0.9,
};
// RULE: never ease-in-out for primary motion. Hit-and-stick.
```

## §G Voice transform recipe (apply to brand's voice from §1 DNA)

Take the brand's product description / value prop. Transform with:

1. Strip articles + connectives (the / a / of / and / with / to)
2. Break into noun-verb-noun fragments OR single dominant nouns
3. UPPERCASE all
4. Join with `.` + linebreak, OR em-dash for emphasis
5. End with brand name as one-word punchline

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: `TEAMS. DESIGN. TOGETHER. — REAL-TIME. — FIGMA.`

## §H Scene composition hints (Phase 4b layout guidance)

- **One huge thing per scene**. Display size 200-340px dominates frame.
- **Use corner-pins on framed scenes** (`<!-- COMPONENT: corner-pins -->`). They give brutalist signature in one element.
- **Background**: solid brand canvas OR dot-grid (`<!-- COMPONENT: dot-grid-bg -->`). Never gradient (gradient is glass territory).
- **Transitions between scenes**: hard cut. No crossfade, no slide, no blur.
- **Stagger**: 100-150ms between elements. Tight, not languid.

## §M Atomic motifs (gestures the plan agent can reference)

Each motif is a **single reusable gesture** that lives inside a larger pattern. Patterns compose motifs; motifs do not compose anything. The plan agent treats motifs as the smallest cite-able vocabulary — a scene description can say "uses motif:hard-offset-shadow on the headline card" without specifying which pattern the card sits in.

```motifs
[
  {
    "id": "hard-offset-shadow",
    "label": "Hard offset shadow",
    "role": "weight-as-depth",
    "surface_safe": ["canvas", "ink"],
    "description": "Solid ink rectangle sitting 8px down-and-right of the foreground card — zero blur, fixed offset, ink color. Shadow is weight, not atmosphere. Apply to every hero card / framed callout / corner-pinned panel.",
    "wide": true,
    "demo": "<div class=\"nb-motif-shadow\">Card front</div>",
    "css": ".nb-motif-shadow{display:inline-block;background:var(--canvas);border:var(--border-bold);box-shadow:var(--shadow-hard);padding:24px 32px;font-family:var(--f-disp-native);font-weight:800;font-size:clamp(28px,3vw,48px);line-height:1;letter-spacing:-.02em;text-transform:uppercase;color:var(--ink)}"
  },
  {
    "id": "thick-border-frame",
    "label": "Thick border frame",
    "role": "structural-edge",
    "surface_safe": ["canvas", "ink"],
    "description": "4px solid ink border on every card / panel / quote frame. Border-radius 0 always — corners stay square. The 6px `--border-loud` variant is reserved for hero frames and title-card chrome.",
    "demo": "<div class=\"nb-motif-frame\">Framed.</div>",
    "css": ".nb-motif-frame{display:inline-block;background:var(--canvas);border:var(--border-loud);padding:24px 36px;font-family:var(--f-disp-native);font-weight:800;font-size:clamp(28px,3vw,48px);line-height:1;letter-spacing:-.02em;text-transform:uppercase;color:var(--ink)}"
  },
  {
    "id": "tilt-card",
    "label": "Tilt card",
    "role": "hand-placed-tag",
    "surface_safe": ["canvas"],
    "description": "Bordered card rotated ±1° to feel hand-stamped onto the canvas. Use the rotation set `--tilt-l` / `--tilt-r` only — beyond ±1° the brutalist register tips into playful, which is the wrong voice.",
    "demo": "<div class=\"nb-motif-tilt\">HOT TAKE</div>",
    "css": ".nb-motif-tilt{display:inline-block;background:var(--canvas);border:var(--border-bold);box-shadow:var(--shadow-hard);padding:16px 24px;font-family:var(--f-disp-native);font-weight:800;font-size:clamp(20px,2vw,32px);line-height:1;letter-spacing:.02em;text-transform:uppercase;color:var(--ink);transform:rotate(var(--tilt-l))}"
  },
  {
    "id": "ink-chip",
    "label": "Ink chip",
    "role": "loud-label",
    "surface_safe": ["canvas"],
    "description": "Ink rectangle with canvas Anton uppercase — the brutalist equivalent of a pill chip. Square corners, 2px border, no shadow. Reserve for CTA labels and category stamps.",
    "demo": "<span class=\"nb-motif-chip\">SHIP IT</span>",
    "css": ".nb-motif-chip{display:inline-block;background:var(--ink);color:var(--canvas);border:2px solid var(--ink);padding:8px 18px;font-family:var(--f-disp-native);font-weight:800;font-size:clamp(16px,1.6vw,24px);line-height:1;letter-spacing:.04em;text-transform:uppercase}"
  },
  {
    "id": "corner-pin",
    "label": "Corner pin",
    "role": "frame-anchor",
    "surface_safe": ["canvas", "ink"],
    "description": "Four 16px ink squares pinned to the corners of a card — the visual signature of brutalist framing. Each pin is a solid square, never rounded, never animated.",
    "wide": true,
    "demo": "<div class=\"nb-motif-pinframe\"><span class=\"nb-pin nb-pin-tl\"></span><span class=\"nb-pin nb-pin-tr\"></span><span class=\"nb-pin nb-pin-bl\"></span><span class=\"nb-pin nb-pin-br\"></span><div class=\"nb-motif-pinframe-body\">Pinned panel</div></div>",
    "css": ".nb-motif-pinframe{position:relative;display:inline-block;background:var(--canvas);border:var(--border-bold);padding:32px 40px;font-family:var(--f-disp-native);font-weight:800;font-size:clamp(24px,2.4vw,40px);line-height:1;letter-spacing:-.02em;text-transform:uppercase;color:var(--ink)}.nb-motif-pinframe .nb-pin{position:absolute;width:16px;height:16px;background:var(--ink)}.nb-motif-pinframe .nb-pin-tl{top:-8px;left:-8px}.nb-motif-pinframe .nb-pin-tr{top:-8px;right:-8px}.nb-motif-pinframe .nb-pin-bl{bottom:-8px;left:-8px}.nb-motif-pinframe .nb-pin-br{bottom:-8px;right:-8px}"
  },
  {
    "id": "arrow-cta",
    "label": "Arrow CTA",
    "role": "imperative",
    "surface_safe": ["canvas", "ink"],
    "description": "`→`-prefixed declarative CTA in Anton uppercase. The arrow is the gesture — no underline, no hover state. Pair with `motif:ink-chip` for inverted-surface CTAs.",
    "demo": "<div class=\"nb-motif-arrow\">→ JOIN THE DROP</div>",
    "css": ".nb-motif-arrow{display:inline-flex;align-items:baseline;gap:.4em;font-family:var(--f-disp-native);font-weight:800;font-size:clamp(28px,3vw,44px);line-height:1;letter-spacing:-.01em;text-transform:uppercase;color:var(--ink)}"
  }
]
```

The `motifs` JSON block above is the SOLE source of truth. build-design.mjs reads it to render §M cards in design.html. The Phase 3 plan agent and Phase 4b scene worker may cite motifs by `id` when annotating which gesture a scene relies on.

**Materials lexicon** (informational — these are the composition atoms behind the patterns):

- hard-offset-shadow · thick-border-frame · tilt-card · ink-chip · corner-pin · arrow-cta · dot-grid-bg · slab-divider

## §I Page-level CSS (overrides design.html's neutral chrome — makes the doc itself brutalist)

```css
/* ── Preset-native typography vars (loaded via preset-meta.chromeFonts.googleFontsHref).
 * These let the doc chrome render in Anton + Inter + Space Mono regardless of
 * brand DNA. The §6 component preview, §M motifs grid, and §T type-role atlas
 * also read these via .preset-native-scope.
 *
 * Neo-Brutalism has no script face — the script slot points at Anton because the
 * preset refuses a third face. The fallback chain ends in a heavy condensed
 * grotesque (Archivo Black / Impact / Arial Black) that still carries the
 * declarative-display register. */
:root {
  --f-disp-native:
    "Anton", "Archivo Black", "Oswald", "Impact", "Arial Black", "Helvetica Neue", sans-serif;
  --f-body-native:
    "Inter", "IBM Plex Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --f-script-native:
    "Anton", "Archivo Black", "Oswald", "Impact", "Arial Black", "Helvetica Neue", sans-serif;
  --f-mono-native:
    "Space Mono", "JetBrains Mono", "IBM Plex Mono", "Menlo", ui-monospace, monospace;
}

/* .preset-native-scope: re-bind brand DNA font tokens to preset-native families.
 * Wraps §6 component previews, §M motif demos, and §T type-role atlas so
 * var(--font-*) resolves to Anton / Inter / Space Mono regardless of brand DNA.
 * Paste-ready component source is untouched — Phase 4b still grep + paste the
 * original `var(--font-display)` tokens, which resolve to brand DNA at
 * scene-render time. */
.preset-native-scope {
  --font-display: var(--f-disp-native);
  --font-body: var(--f-body-native);
  --font-script: var(--f-script-native);
  --font-mono: var(--f-mono-native);
}

/* Brutalist page chrome — applied to design.html itself */
body {
  background: var(--canvas);
}
.title-card {
  background: var(--canvas);
  border-bottom: var(--border-loud);
  padding: 96px 0 80px;
}
.title-display {
  text-transform: uppercase;
  letter-spacing: -0.04em;
}
.brand-name,
.style-name {
  font-weight: 800;
}

.ds-section {
  border-top: var(--border-loud);
  padding: 80px 0;
}

/* Cards / panels get the brutalist treatment */
.dna-swatch,
.type-card,
.voice-pair {
  border: var(--border-bold) !important;
  border-radius: 0 !important;
  box-shadow: var(--shadow-hard);
}

.comp-card {
  border: var(--border-bold) !important;
  border-radius: 0 !important;
  box-shadow: var(--shadow-hard);
  margin: 32px 0 !important;
  overflow: visible !important; /* don't crop shadows */
}
.comp-head {
  background: var(--ink) !important;
  color: var(--canvas);
  border-bottom: var(--border-bold) !important;
}
.comp-head .comp-name,
.comp-head .comp-marker {
  color: var(--canvas);
}

.ds-code {
  border: var(--border-bold);
  border-radius: 0 !important;
  box-shadow: var(--shadow-hard);
}

h2 {
  text-transform: uppercase;
  letter-spacing: -0.03em;
}
.eyebrow {
  color: var(--ink);
  font-weight: 700;
}

/* ── §M Motifs grid: atomic gestures.
 * 12-col grid of small cards each teaching ONE reusable gesture. Cards may
 * declare a surface (canvas / ink) to demonstrate the gesture against its
 * native bg. */
.ds-motif-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}
.ds-motif {
  grid-column: span 4;
  min-height: 280px;
  padding: 28px;
  border: var(--border-bold);
  border-radius: 0;
  background: var(--canvas);
  box-shadow: var(--shadow-hard);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  position: relative;
  overflow: hidden;
}
.ds-motif.ds-motif-wide {
  grid-column: span 8;
}
.ds-motif.ds-motif-surface-canvas {
  background: var(--canvas);
  color: var(--ink);
}
.ds-motif.ds-motif-surface-ink {
  background: var(--ink);
  color: var(--canvas);
  border-color: var(--ink);
}
.ds-motif-h {
  margin: 0;
  font-family: var(--f-disp-native);
  font-weight: 800;
  font-size: clamp(24px, 2.6vw, 36px);
  line-height: 1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--ink);
}
.ds-motif.ds-motif-surface-ink .ds-motif-h {
  color: var(--canvas);
}
.ds-motif-desc {
  margin: 0;
  font-family: var(--f-body-native);
  font-weight: 500;
  font-size: 14px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--ink) 72%, transparent);
  max-width: 30ch;
}
.ds-motif.ds-motif-surface-ink .ds-motif-desc {
  color: color-mix(in srgb, var(--canvas) 80%, transparent);
}
.ds-motif-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 96px;
}
.ds-motif-id {
  position: absolute;
  top: 12px;
  right: 14px;
  font-family: var(--f-mono-native);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink);
  opacity: 0.5;
}
.ds-motif.ds-motif-surface-ink .ds-motif-id {
  color: var(--canvas);
  opacity: 0.7;
}
@media (max-width: 880px) {
  .ds-motif-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .ds-motif,
  .ds-motif.ds-motif-wide {
    grid-column: auto;
  }
}

/* ── §T Type-role atlas. Container = canvas card with thick ink border + hard
 * offset shadow. Each .t-trole-* class encodes the role's family / size /
 * weight / leading / tracking / case / decoration. Family selectors use
 * var(--font-*) tokens so the atlas renders in BRAND DNA fonts; only the
 * recipe is preset-declared. Single-column layout — sample stacks vertically
 * with padding-only rows divided by a thin ink hairline. */
.ds-trole-box {
  display: flex;
  flex-direction: column;
  border: var(--border-bold);
  border-radius: 0;
  background: var(--canvas);
  box-shadow: var(--shadow-hard);
  overflow: hidden;
  margin-top: 24px;
}
.ds-trole-row {
  padding: 32px;
  border-bottom: 2px solid var(--ink);
}
.ds-trole-row:last-child {
  border-bottom: 0;
}
.ds-trole-sample {
  min-width: 0;
  overflow-wrap: anywhere;
}
@media (max-width: 960px) {
  .ds-trole-row {
    padding: 24px;
  }
}

/* ── Type-role samples. Each .t-trole-* class mirrors a neo-brutalism type
 * role but uses var(--font-display/body/mono/script) so the actual typeface
 * comes from brand DNA. Decoration (color, border, shadow, tilt, ink chip)
 * is preset-native and stays declared with hard-coded neo-brutalism colors
 * (var(--ink), var(--canvas), var(--border-bold), var(--shadow-hard)). */
.t-trole-display-cover {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(120px, 16vw, 340px);
  line-height: 0.86;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-headline {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(72px, 9vw, 160px);
  line-height: 0.9;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-statement {
  display: inline-block;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(48px, 6vw, 96px);
  line-height: 1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--ink);
  background: var(--canvas);
  border: var(--border-bold);
  box-shadow: var(--shadow-hard);
  padding: 24px 32px;
  max-width: 22ch;
}
.t-trole-number-hero {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(96px, 14vw, 240px);
  line-height: 0.9;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-h2 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(48px, 6vw, 96px);
  line-height: 0.95;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-h3 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(28px, 3.2vw, 48px);
  line-height: 1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-eyebrow {
  font-family: var(--font-body);
  font-weight: 700;
  font-size: clamp(14px, 1.2vw, 18px);
  line-height: 1.2;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-lead {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: clamp(20px, 2vw, 32px);
  line-height: 1.4;
  color: var(--ink);
  max-width: 48ch;
  margin: 0;
}
.t-trole-body {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: clamp(15px, 1.4vw, 22px);
  line-height: 1.55;
  color: var(--ink);
  max-width: 60ch;
  margin: 0;
}
.t-trole-caption {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: clamp(12px, 1vw, 16px);
  line-height: 1.4;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--ink) 72%, transparent);
  margin: 0;
}
.t-trole-label-mono {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: clamp(11px, 1vw, 15px);
  line-height: 1.3;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-chip-loud {
  display: inline-block;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(16px, 1.8vw, 28px);
  line-height: 1;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: var(--ink);
  color: var(--canvas);
  border: 2px solid var(--ink);
  padding: 10px 22px;
  transform: rotate(var(--tilt-l));
}
.t-trole-cta-arrow {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(24px, 2.6vw, 44px);
  line-height: 1;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: var(--ink);
}
```
