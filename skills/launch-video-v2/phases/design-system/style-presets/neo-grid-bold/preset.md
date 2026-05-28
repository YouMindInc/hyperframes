```preset-meta
{
  "name": "neo-grid-bold",
  "label": "Neo-Grid Bold",
  "fingerprint": {
    "structure": "12x8-css-grid",
    "border": "1.5px-hairline-ink",
    "shadow": "none",
    "accent": "single-electric-signal",
    "type": "uppercase-display-mixed-body-mono-label",
    "motion": "panel-slam-mono-tick"
  },
  "match_signals": [
    { "kind": "hairline_border", "weight": 0.3 },
    { "kind": "condensed_display", "weight": 0.2 },
    { "kind": "high_sat_accent", "weight": 0.25 },
    { "kind": "minimal_decoration", "weight": 0.15 }
  ],
  "best_for": ["design-led pitches", "brand decks", "founder talks", "stat-heavy slides", "comparison matrices"],
  "avoid_for": ["warm traditional voices", "quiet brand registers", "soft consumer lifestyle", "storybook decoration"],
  "chromeFonts": {
    "googleFontsHref": "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap",
    "display": "Space Grotesk",
    "body": "Space Grotesk",
    "script": "Space Grotesk",
    "mono": "JetBrains Mono"
  }
}
```

> `chromeFonts` makes the design.html doc chrome (title-card, section heads, h2/h3, lede paragraphs, eyebrows) render in the preset's NATIVE typography — Space Grotesk + JetBrains Mono — instead of the brand DNA fonts. Neo-Grid Bold is a two-face system: Space Grotesk weight 700 carries every display moment and weight 400 carries body; JetBrains Mono is reserved for labels and metadata. The `script` slot also points at Space Grotesk because the system refuses a third face. Brand fonts still apply to §6 component code (paste-ready for Phase 4b). §M motifs grid and §T type-role atlas use `.preset-native-scope` so `var(--font-display/body/mono)` re-resolves to these native families for the live preview.

## §A Director's intent

Editorial poster on a strict 12-column × 8-row grid, inset 40px, with 12-18px gutters revealing a putty frame around every composition. Three working colors only — paper (canvas), ink (structure), and one electric signal (the brand accent stands in for the template's neon yellow). Depth is panel adjacency, never shadow. Every display moment is uppercase Space-Grotesk-class with negative letter-spacing scaled to size; body is mixed-case at weight 400; every label is mono uppercase with 0.08-0.12em tracking. Motion is brief and structural — panels slam in on a beat, mono labels tick on after, the grid never breaks. The class-prefix `ng-` is used on every component CSS so design.html previews compose cleanly.

Best for: design-led pitches, brand decks, founder talks, stat-heavy slides, comparison matrices. Avoid for: warm, traditional, or quiet brand voices — the accent and the uppercase commit to an editorial-graphic register.

## §B Decoration tokens

```css
/* Structural ink hairlines — the only border weights this system uses. */
--border-hairline: 1.5px solid var(--ink);
--border-axis: 2px solid var(--ink);
--border-dash-internal: 1px dashed color-mix(in srgb, var(--ink) 18%, transparent);

/* Grid system — every scene wraps a 12x8 CSS grid inset from the frame. */
--grid-inset: 40px;
--grid-gap: 12px;
--grid-gap-lg: 18px;
--grid-cols: repeat(12, 1fr);
--grid-rows: repeat(8, 1fr);

/* Panel padding scale (compact / standard / large / hero). */
--pad-compact: 24px 28px;
--pad-standard: 28px 32px;
--pad-large: 36px 32px;
--pad-hero: 40px 44px;

/* The signal accent — brand-primary stands in for the template's neon. */
--signal-fill: var(--brand-primary);
--signal-ink: var(--ink);

/* Highlight swatch padding (yellow <mark> behind one or more headline words). */
--mark-pad: 0 6px;
--mark-pad-lg: 0 8px;

/* Mono tracking presets — labels MUST land in this range. */
--track-mono: 0.08em;
--track-mono-tight: 0.04em;
--track-mono-wide: 0.12em;

/* Display tracking presets — uppercase, negative, scales with size. */
--track-display-tight: -0.005em;
--track-display: -0.015em;
--track-display-loose: -0.02em;
--track-display-mega: -0.05em;

/* Block stamp + corner mark — 2x2 grid, diagonal squares filled. */
--blockmark-gap: 4px;
--blockmark-size: 56px;
--corner-mark-size: 36px;

/* All radii forced to 0 — strict rectangles. */
--radius: 0;

/* No shadows — declared as none so component CSS can reference a single var. */
--shadow-panel: none;
```

## §D Font pairing fallback

- **display**: `'Space Grotesk'` · `'Archivo'` · `'Inter'` wght 700
- **body**: `'Space Grotesk'` · `'Inter'` · `'IBM Plex Sans'` wght 400
- **mono**: `'JetBrains Mono'` · `'Space Mono'` · `'IBM Plex Mono'` wght 400

## §T Type-role atlas (Phase 4b reads this to size text correctly)

Each entry is a **named type role** with concrete render parameters at 1920×1080 — family token, px range, weight, leading, tracking, case, and any color/decoration. Phase 4b scene workers may cite roles by `id` ("use a `stat-num` here"); the brand DNA fonts plug in automatically via `var(--font-*)` tokens. This is the same atlas Neo-Grid Bold ships in its Typography section, ported as machine-readable JSON.

The atlas is the **sole authoring source** for non-component text. If a scene needs a `section-num` numeral that isn't covered by §6 components, the worker reads role `section-num` here and writes inline CSS from these values. Do NOT invent ad-hoc sizes — Neo-Grid Bold's identity collapses if display weights drift below 700 or if mono labels lose their positive tracking.

```type-roles
[
  {
    "id": "section-num",
    "family": "display",
    "purpose": "hero section ordinal in a section-divider panel (320px, dominates entire panel)",
    "px_min": 240, "px_max": 320, "weight": 700, "leading": "0.85", "tracking": "-0.05em", "case": "upper",
    "sample_html": "<div class=\"t-trole-section-num\">02</div>"
  },
  {
    "id": "stat-num-lg",
    "family": "display",
    "purpose": "featured large numerical stat — type allowed to dominate the panel",
    "px_min": 180, "px_max": 240, "weight": 700, "leading": "0.85", "tracking": "-0.04em", "case": "upper",
    "sample_html": "<div class=\"t-trole-stat-num-lg\">85.6M</div>"
  },
  {
    "id": "stat-num",
    "family": "display",
    "purpose": "standard stat numeral inside a featured panel",
    "px_min": 120, "px_max": 156, "weight": 700, "leading": "0.9", "tracking": "-0.03em", "case": "upper",
    "sample_html": "<div class=\"t-trole-stat-num\">+98.7%</div>"
  },
  {
    "id": "display",
    "family": "display",
    "purpose": "cover or section-opening display headline (88-132px)",
    "px_min": 88, "px_max": 132, "weight": 700, "leading": "0.92", "tracking": "-0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-display\">Build the engine of <mark>modern money.</mark></div>"
  },
  {
    "id": "stat-num-sm",
    "family": "display",
    "purpose": "compact stat numeral inside a small card",
    "px_min": 76, "px_max": 96, "weight": 700, "leading": "0.9", "tracking": "-0.03em", "case": "upper",
    "sample_html": "<div class=\"t-trole-stat-num-sm\">12.8M</div>"
  },
  {
    "id": "title",
    "family": "display",
    "purpose": "primary content-slide headline — the workhorse",
    "px_min": 64, "px_max": 88, "weight": 700, "leading": "0.95", "tracking": "-0.015em", "case": "upper",
    "sample_html": "<div class=\"t-trole-title\">Key features</div>"
  },
  {
    "id": "subtitle",
    "family": "display",
    "purpose": "secondary headline, region heading",
    "px_min": 44, "px_max": 56, "weight": 700, "leading": "1", "tracking": "-0.01em", "case": "upper",
    "sample_html": "<div class=\"t-trole-subtitle\">Section · Vision</div>"
  },
  {
    "id": "card-headline",
    "family": "display",
    "purpose": "card title at panel-fill scale",
    "px_min": 36, "px_max": 44, "weight": 700, "leading": "1", "tracking": "-0.01em", "case": "upper",
    "sample_html": "<div class=\"t-trole-card-headline\">Pilot one workflow</div>"
  },
  {
    "id": "card-h3",
    "family": "display",
    "purpose": "sub-headline inside a smaller card",
    "px_min": 24, "px_max": 30, "weight": 700, "leading": "1.05", "tracking": "-0.005em", "case": "upper",
    "sample_html": "<div class=\"t-trole-card-h3\">Seamless transactions</div>"
  },
  {
    "id": "body",
    "family": "body",
    "purpose": "body paragraph inside a feature card (mixed case, weight 400)",
    "px_min": 22, "px_max": 28, "weight": 400, "leading": "1.35", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body\">The platform helps teams decide in real time across every market it touches.</p>"
  },
  {
    "id": "body-sm",
    "family": "body",
    "purpose": "compact body inside dense multi-card slides",
    "px_min": 18, "px_max": 22, "weight": 400, "leading": "1.45", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body-sm\">Tight measure, mixed case, weight 400 — never uppercase body in this system.</p>"
  },
  {
    "id": "label",
    "family": "mono",
    "purpose": "standard mono label or kicker — JetBrains Mono uppercase, 0.08em tracking",
    "px_min": 20, "px_max": 24, "weight": 400, "leading": "1.2", "tracking": "0.08em", "case": "upper",
    "sample_html": "<div class=\"t-trole-label\">Snapshot · Q1 2026</div>"
  },
  {
    "id": "label-sm",
    "family": "mono",
    "purpose": "secondary metadata label, copyright text",
    "px_min": 14, "px_max": 16, "weight": 400, "leading": "1.4", "tracking": "0.08em", "case": "upper",
    "sample_html": "<div class=\"t-trole-label-sm\">©2026 · All rights reserved</div>"
  },
  {
    "id": "label-xs",
    "family": "mono",
    "purpose": "axis labels, table header text, fine print — 0.12em tracking",
    "px_min": 12, "px_max": 14, "weight": 400, "leading": "1.3", "tracking": "0.12em", "case": "upper",
    "sample_html": "<div class=\"t-trole-label-xs\">FY24 vs FY25 · Indexed</div>"
  },
  {
    "id": "pagenum",
    "family": "mono",
    "purpose": "bottom-left page-number tag in the format '01 / 12' — 0.04em tracking",
    "px_min": 20, "px_max": 24, "weight": 400, "leading": "1", "tracking": "0.04em", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-pagenum\">01 / 12</span></div>"
  },
  {
    "id": "highlight-mark",
    "family": "display",
    "purpose": "inline <mark> swatch — brand-primary background on ink text inside a headline. The system's primary headline emphasis.",
    "px_min": 64, "px_max": 132, "weight": 700, "leading": "0.92", "tracking": "-0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-display\">Build <span class=\"t-trole-highlight-mark\">modern money.</span></div>"
  }
]
```

The atlas omits the block-stamp / corner-mark / QR-tile (they are §M motifs, not text roles) and the photo-region tag (a placeholder for real photography).

## §E Motion (GSAP consts — REPLACES site ease)

```js
// Neo-Grid Bold motion: structural, brief, never bouncy.
// Panels slam into grid cells; labels tick on after; ambient drift is sine on
// the mono digits only.
const EASE = {
  entry: "power2.out", // panels arriving into grid cells
  emphasis: "expo.out", // mark swatch sweep, big stat reveal
  exit: "power2.in", // panels leaving (rare — usually a hard cut)
  drift: "sine.inOut", // ambient mono-counter tick, page-number pulse
};

const DUR = {
  snap: 0.14, // mono label tick-on, pagenum swap
  med: 0.45, // panel slam-in
  slow: 0.9, // section divider reveal, large stat count-up
};

// RULE: NEVER add back/elastic — this system has no overshoot. Use power/expo.
// RULE: Panels arrive with x-or-y translate ≤ 24px + opacity, never scale.
// RULE: The <mark> yellow swatch reveals by scaleX from 0 to 1 with transform-origin: left, EASE.emphasis, DUR.med — width sweeps, not fades.
// RULE: Mono labels tick on AFTER the panel they sit in (stagger 0.06-0.10s).
// RULE: stat-counter numerals count up with a number tween, not by replacing text — keep deterministic at frame rate.
// RULE: page-number swap (paper/ink/lemon variant change) is a hard 1-frame cut, never a fade.
```

### §E.5 Motion choreography

- **Allowed primitives**: opacity + translate (≤24px) for panel entries; scaleX(0→1) with left transform-origin for the `<mark>` highlighter swatch; numeric tween for stat counters; mono-character stagger for mono labels (0.06-0.10s per char).
- **Forbidden gestures**: no rotation, no skew, no scale on panels (they are grid-sized rectangles — scaling them mis-aligns the grid), no crossfades between scenes (use a hard cut), no parallax, no spring/elastic.
- **Transition defaults**: scene-to-scene is a hard cut on the panel that carries the loudest signal (the yellow / brand-primary panel). Within a scene, panels enter in z-order by visual weight: ink panels first, paper panels second, signal panel last.
- **Type-in-motion**: display headlines arrive as a single block (no per-word stagger); only the `<mark>`-wrapped words sweep in via scaleX after the headline lands.

## §G Voice transform recipe

1. Drop articles and connectives (`the`, `a`, `of`, `and`, `with`, `to`) on display headlines only — body copy keeps its native voice.
2. Compress display copy into 1-3 line stacks of UPPERCASE Space-Grotesk-class words; each line breaks at a natural beat.
3. Promote one key word or phrase per headline to be the `<mark>` highlight — wrap it inline so the reveal sweeps the yellow swatch across it. Choose the loudest, most product-truthful noun, never an adjective.
4. Mono labels: ALL CAPS, 0.08-0.12em tracking, format `01 / 12` for counters, `Section · Vision` for section tags, `Q1 2026` for time tags. Always start with a digit when there is one.
5. Body copy stays mixed case at weight 400. Never UPPERCASE body — it reads as shouting and breaks the editorial register.

**Example:**

- IN: `The platform helps teams make data-driven financial decisions in real time across markets.`
- OUT: `BUILD<br/>THE ENGINE OF<br/><mark>MODERN&nbsp;MONEY.</mark>` (display) + `The platform helps teams decide in real time across every market it touches.` (body)

## §H Scene composition hints

- **Universal frame**: every scene composes inside a 12-column × 8-row CSS grid inset 40px from the canvas edge, gap `var(--grid-gap)` (12px) or `var(--grid-gap-lg)` (18px) for breathing room. The 40px putty surround is the system's identity — never let a panel bleed through it.
- **Surface alternation**: per scene, fill the grid corner-to-corner with 4-8 panels. Default panel is paper; alternate one or two ink panels for contrast weight; add exactly **one** signal panel (brand-primary fill) to draw the eye. Three signal panels reads as aggressive editorial; one reads as confident.
- **Focal sizing**: stat numerals scale to 156-240px, section ordinals to 320px. Type is allowed to dominate an entire panel. Display headlines run 88-132px, card headlines 30-44px.
- **Brand-color role contract**:
  - `var(--brand-primary)` — the signal fill (template's neon yellow). One panel per scene. Also: `<mark>` background, affirmative pill fill, second chart series.
  - `var(--brand-secondary)` — reserved for the signal panel's ink stroke when added to a chart bar (1.5px ink border). Use sparingly.
  - `var(--brand-accent)` — alternate signal hue for charts/data series only when a second accent is unavoidable (rare — prefer to stay on one accent).
  - `var(--ink)` — every text on paper/signal surfaces; inverted panel fill; every divider, table cell, pill outline.
  - `var(--canvas)` — the putty surround behind the 40px inset.
- **Transition vocabulary**: hard cuts only between scenes. Within a scene, panels enter on a brief beat (ink first, paper next, signal last). Mono labels tick on AFTER their parent panel arrives.
- **Decoration budget**: max one block-stamp + one corner-mark per scene. Never both in the same panel.
- **Page-number tag**: anchor `pagenum` component bottom-left of every scene. Pick the variant (paper / ink / signal) that contrasts with the lower-left panel.
- **Do**: fill the grid corner-to-corner; allow stat numerals to dominate; wrap one headline word in `<mark>` for the yellow sweep; use mono uppercase tracking ≥0.08em for every label.
- **Don't**: add shadows, round any corner, put display in mixed case, put body in UPPERCASE, introduce a second accent color, leave more than two cells empty in a row, use italic letterforms (the `<em>` tag is repurposed as a color switch — stays upright).

## §M Atomic motifs (gestures the plan agent can reference)

Each motif is a **single reusable gesture** that lives inside a larger pattern. Patterns compose motifs; motifs do not compose anything. The plan agent treats motifs as the smallest cite-able vocabulary — a scene description can say "uses motif:mark-sweep on the headline" without specifying which pattern the headline sits in.

```motifs
[
  {
    "id": "mark-sweep",
    "label": "Mark sweep",
    "role": "headline-highlight",
    "surface_safe": ["paper", "ink"],
    "description": "Brand-primary <mark> swatch wrapping one or more words inside a Space Grotesk uppercase headline. The yellow highlighter reveals via scaleX(0→1) with transform-origin: left — width sweeps, never fades. The system's primary headline emphasis.",
    "wide": true,
    "demo": "<div class=\"ng-motif-mark\">Build <mark>modern money.</mark></div>",
    "css": ".ng-motif-mark{font-family:var(--f-disp-native);font-weight:700;font-size:clamp(40px,5vw,80px);line-height:.92;letter-spacing:-.02em;text-transform:uppercase;color:var(--ink)}.ng-motif-mark mark{background:var(--brand-primary);color:var(--ink);padding:0 8px}"
  },
  {
    "id": "signal-panel",
    "label": "Signal panel",
    "role": "accent-fill",
    "surface_safe": ["paper", "ink"],
    "description": "Full brand-primary rectangular fill with ink text — the one yellow panel per scene that draws the eye. Zero border-radius, zero shadow; depth comes from adjacency to paper/ink neighbours. Reserve for the single loudest moment in a composition.",
    "demo": "<div class=\"ng-motif-signal\"><div class=\"ng-motif-signal-val\">85.6M</div><div class=\"ng-motif-signal-lab\">Data points analyzed</div></div>",
    "css": ".ng-motif-signal{display:flex;flex-direction:column;justify-content:space-between;gap:24px;background:var(--brand-primary);color:var(--ink);padding:28px 36px;min-height:200px;min-width:280px}.ng-motif-signal-val{font-family:var(--f-disp-native);font-weight:700;font-size:clamp(56px,6vw,120px);line-height:.85;letter-spacing:-.04em}.ng-motif-signal-lab{font-family:var(--f-mono-native);font-weight:400;font-size:clamp(12px,1vw,16px);line-height:1.2;letter-spacing:.08em;text-transform:uppercase}"
  },
  {
    "id": "mono-label",
    "label": "Mono label",
    "role": "metadata-tag",
    "surface_safe": ["paper", "ink", "brand"],
    "description": "JetBrains Mono uppercase label with 0.08-0.12em positive tracking — every kicker, eyebrow, page-number, axis tag, and time tag. Ticks on AFTER its parent panel arrives (0.06-0.10s stagger). The structural counter-voice to the heavy Space Grotesk display.",
    "demo": "<div class=\"ng-motif-monolabel\">Section · Vision</div>",
    "css": ".ng-motif-monolabel{font-family:var(--f-mono-native);font-weight:400;font-size:clamp(14px,1.4vw,22px);line-height:1.2;letter-spacing:.08em;text-transform:uppercase;color:var(--ink);opacity:.75}"
  },
  {
    "id": "block-stamp",
    "label": "Block stamp",
    "role": "brand-mark",
    "surface_safe": ["paper", "ink", "brand"],
    "description": "2x2 grid of small squares with the top-left and bottom-right cells filled in ink (the other two transparent). A diagonal-fill stamp that acts as the brand identity mark. Sized 36px (corner-mark) up to 96px (block stamp on quote slides). Max one per scene.",
    "demo": "<div class=\"ng-motif-block\"><span></span><span></span><span></span><span></span></div>",
    "css": ".ng-motif-block{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:6px;width:96px;height:96px}.ng-motif-block span{background:var(--ink)}.ng-motif-block span:nth-child(2),.ng-motif-block span:nth-child(3){background:transparent}"
  },
  {
    "id": "pagenum-tag",
    "label": "Page-number tag",
    "role": "persistent-chrome",
    "surface_safe": ["paper", "ink", "brand"],
    "description": "Bottom-left position-tag in the format '01 / 12' — JetBrains Mono 24px, 0.04em tracking, 14px×22px padding. Three variants: paper (default), invert (ink fill), lemon (brand-primary fill). Pick the variant that contrasts with the lower-left panel.",
    "demo": "<div class=\"ng-motif-pagenum\">01 / 12</div>",
    "css": ".ng-motif-pagenum{display:inline-block;background:var(--brand-primary);color:var(--ink);font-family:var(--f-mono-native);font-weight:400;font-size:clamp(16px,1.4vw,22px);line-height:1;letter-spacing:.04em;padding:14px 22px}"
  },
  {
    "id": "pill-row",
    "label": "Pill row",
    "role": "state-trio",
    "surface_safe": ["paper"],
    "description": "Three-color comparison pill system: yellow fill (yes / affirmative), paper with 1.5px ink border (partial), ink fill with paper text (no / negative). All three are 0-radius rectangles, not rounded pills despite the name. Mono uppercase, 0.08em tracking.",
    "wide": true,
    "demo": "<div class=\"ng-motif-pills\"><span class=\"ng-pill-yes\">Yes</span><span class=\"ng-pill-part\">Partial</span><span class=\"ng-pill-no\">No</span></div>",
    "css": ".ng-motif-pills{display:flex;gap:12px;align-items:center}.ng-motif-pills span{display:inline-block;font-family:var(--f-mono-native);font-weight:500;font-size:clamp(12px,1.1vw,16px);line-height:1.3;letter-spacing:.08em;text-transform:uppercase;padding:6px 14px}.ng-pill-yes{background:var(--brand-primary);color:var(--ink)}.ng-pill-part{background:transparent;color:var(--ink);border:1.5px solid var(--ink)}.ng-pill-no{background:var(--ink);color:var(--brand-primary)}"
  }
]
```

The `motifs` JSON block above is the SOLE source of truth. build-design.mjs reads it to render §M cards in design.html. The Phase 3 plan agent and Phase 4b scene worker may cite motifs by `id` when annotating which gesture a scene relies on.

**Materials lexicon** (informational — these are the composition atoms behind the patterns):

- mark-sweep · signal-panel · mono-label · block-stamp · pagenum-tag · pill-row · corner-mark · qr-tile · hairline-rule

## §I Page-level CSS

```css
/* ── Preset-native typography vars (loaded via preset-meta.chromeFonts.googleFontsHref).
 * These let the doc chrome render in Space Grotesk + JetBrains Mono regardless
 * of which brand DNA the preset is applied to. The §6 component preview,
 * §M motifs grid, and §T type-role atlas also read these via .preset-native-scope.
 *
 * Neo-Grid Bold is a two-face system — the script slot points at Space Grotesk
 * because the preset refuses a third face. Fallback chains end in a heavy
 * grotesque (Archivo / Inter / system-ui) that still carries the editorial
 * uppercase register. Falling all the way to generic should never happen. */
:root {
  --f-disp-native:
    "Space Grotesk", "Archivo", "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;
  --f-body-native:
    "Space Grotesk", "Inter", "IBM Plex Sans", -apple-system, BlinkMacSystemFont, system-ui,
    sans-serif;
  --f-script-native:
    "Space Grotesk", "Archivo", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --f-mono-native:
    "JetBrains Mono", "Space Mono", "IBM Plex Mono", "Menlo", ui-monospace, monospace;
}

/* .preset-native-scope: re-bind brand DNA font tokens to preset-native families.
 * Wraps §6 component previews, §M motif demos, and §T type-role atlas so
 * var(--font-*) resolves to Space Grotesk / JetBrains Mono regardless of the
 * brand DNA tokens emitted in :root. The paste-ready component source is
 * untouched — Phase 4b still grep + paste original `var(--font-display)`
 * tokens, which resolve to brand DNA at scene-render time. */
.preset-native-scope {
  --font-display: var(--f-disp-native);
  --font-body: var(--f-body-native);
  --font-script: var(--f-script-native);
  --font-mono: var(--f-mono-native);
}

/* Make design.html itself read as Neo-Grid Bold — putty surround, strict
   rectangles, paper sections, hairline ink dividers, mono labels. */
body {
  background: var(--canvas, #ecece8);
}
.ds-section {
  border-top: 1.5px solid var(--ink, #0a0a0a) !important;
  background: var(--canvas, #ecece8);
}
.ds-section:first-of-type {
  border-top: none !important;
}
.eyebrow {
  letter-spacing: 0.12em !important;
  font-weight: 400;
  text-transform: uppercase;
}
h1,
h2,
h3 {
  text-transform: uppercase;
  letter-spacing: -0.015em !important;
  font-weight: 700 !important;
}
.ds-prose code,
code {
  border-radius: 0 !important;
}
.ds-code {
  border-radius: 0 !important;
}

/* ── §M Motifs grid: atomic gestures.
 * Neo-Grid Bold is a six-motif system. Cards may declare a surface
 * (paper / ink / brand) to demonstrate the gesture against its native bg.
 * Borders use the system's 1.5px hairline ink — never a wider weight. */
.ds-motif-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}
.ds-motif {
  grid-column: span 4;
  min-height: 280px;
  padding: 28px;
  border: 1.5px solid var(--ink, #0a0a0a);
  border-radius: 0;
  background: var(--paper, #f5f4ef);
  color: var(--ink, #0a0a0a);
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
.ds-motif.ds-motif-surface-paper {
  background: var(--paper, #f5f4ef);
  color: var(--ink, #0a0a0a);
}
.ds-motif.ds-motif-surface-ink {
  background: var(--ink, #0a0a0a);
  color: var(--paper, #f5f4ef);
  border-color: var(--paper, #f5f4ef);
}
.ds-motif.ds-motif-surface-brand {
  background: var(--brand-primary);
  color: var(--ink, #0a0a0a);
  border-color: var(--ink, #0a0a0a);
}
.ds-motif-h {
  margin: 0;
  font-family: var(--f-disp-native);
  font-weight: 700;
  font-size: clamp(22px, 2.2vw, 34px);
  line-height: 1;
  letter-spacing: -0.015em;
  text-transform: uppercase;
}
.ds-motif-desc {
  margin: 0;
  font-family: var(--f-body-native);
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: color-mix(in srgb, currentColor 70%, transparent);
  max-width: 30ch;
}
.ds-motif-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}
.ds-motif-id {
  position: absolute;
  top: 14px;
  right: 16px;
  font-family: var(--f-mono-native);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, currentColor 55%, transparent);
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

/* ── §T Type-role atlas. Container = flat paper card with hairline ink border.
 * Each .t-trole-* class encodes the role's family / size / weight / leading /
 * tracking / case. Family selectors use var(--font-*) tokens so the atlas
 * renders in BRAND DNA fonts; only the recipe is preset-declared. Color
 * decisions follow Neo-Grid Bold's three-color contract — ink on paper,
 * brand-primary as the single signal accent, never a third color. */
.ds-trole-box {
  display: flex;
  flex-direction: column;
  border: 1.5px solid var(--ink, #0a0a0a);
  border-radius: 0;
  background: var(--paper, #f5f4ef);
  overflow: hidden;
  margin-top: 24px;
}
.ds-trole-row {
  padding: 28px 32px;
  border-bottom: 1.5px solid var(--ink, #0a0a0a);
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

/* ── Type-role samples. var(--font-display/body/mono) resolves to brand DNA.
 * Color uses Neo-Grid Bold's three-color contract: ink on paper, brand-primary
 * as the signal accent, mono labels muted via opacity. */
.t-trole-section-num {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(180px, 22vw, 320px);
  line-height: 0.85;
  letter-spacing: -0.05em;
  text-transform: uppercase;
  color: var(--ink, #0a0a0a);
}
.t-trole-stat-num-lg {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(140px, 16vw, 240px);
  line-height: 0.85;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: var(--ink, #0a0a0a);
}
.t-trole-stat-num {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(96px, 11vw, 156px);
  line-height: 0.9;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: var(--ink, #0a0a0a);
}
.t-trole-display {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(64px, 9vw, 132px);
  line-height: 0.92;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--ink, #0a0a0a);
}
.t-trole-display mark {
  background: var(--brand-primary);
  color: var(--ink, #0a0a0a);
  padding: 0 8px;
}
.t-trole-stat-num-sm {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(64px, 7vw, 96px);
  line-height: 0.9;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: var(--ink, #0a0a0a);
}
.t-trole-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(56px, 6vw, 88px);
  line-height: 0.95;
  letter-spacing: -0.015em;
  text-transform: uppercase;
  color: var(--ink, #0a0a0a);
}
.t-trole-subtitle {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(40px, 4.4vw, 56px);
  line-height: 1;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: var(--ink, #0a0a0a);
}
.t-trole-card-headline {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(32px, 3.4vw, 44px);
  line-height: 1;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: var(--ink, #0a0a0a);
}
.t-trole-card-h3 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(22px, 2.4vw, 30px);
  line-height: 1.05;
  letter-spacing: -0.005em;
  text-transform: uppercase;
  color: var(--ink, #0a0a0a);
}
.t-trole-body {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(20px, 2.2vw, 28px);
  line-height: 1.35;
  color: var(--ink, #0a0a0a);
  max-width: 50ch;
  margin: 0;
}
.t-trole-body-sm {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(16px, 1.8vw, 22px);
  line-height: 1.45;
  color: var(--ink, #0a0a0a);
  max-width: 60ch;
  margin: 0;
}
.t-trole-label {
  font-family: var(--font-mono);
  font-weight: 400;
  font-size: clamp(18px, 1.9vw, 24px);
  line-height: 1.2;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--ink, #0a0a0a) 75%, transparent);
}
.t-trole-label-sm {
  font-family: var(--font-mono);
  font-weight: 400;
  font-size: clamp(13px, 1.2vw, 16px);
  line-height: 1.4;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--ink, #0a0a0a) 70%, transparent);
}
.t-trole-label-xs {
  font-family: var(--font-mono);
  font-weight: 400;
  font-size: clamp(12px, 1vw, 14px);
  line-height: 1.3;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--ink, #0a0a0a) 70%, transparent);
}
.t-trole-pagenum {
  display: inline-block;
  font-family: var(--font-mono);
  font-weight: 400;
  font-size: clamp(18px, 1.9vw, 24px);
  line-height: 1;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: var(--brand-primary);
  color: var(--ink, #0a0a0a);
  padding: 14px 22px;
}
.t-trole-highlight-mark {
  background: var(--brand-primary);
  color: var(--ink, #0a0a0a);
  padding: 0 8px;
}
```
