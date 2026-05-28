```preset-meta
{
  "name": "editorial",
  "label": "Editorial / Swiss",
  "fingerprint": {
    "shadow": "none-or-hairline",
    "border": "hairline",
    "motion": "refined-glide",
    "density": "low",
    "contrast": "medium"
  },
  "match_signals": [
    { "kind": "hairline_border",     "weight": 0.25 },
    { "kind": "serif_display",       "weight": 0.25 },
    { "kind": "low_saturation",      "weight": 0.20 },
    { "kind": "generous_padding",    "weight": 0.15 },
    { "kind": "minimal_decoration",  "weight": 0.15 }
  ],
  "best_for": ["longform essays", "research recaps", "restrained editorial", "swiss-style brand decks", "academic / advisory"],
  "avoid_for": ["sales-driven punch", "expressive maximalism", "decoration-heavy briefs", "high-energy promo"],
  "chromeFonts": {
    "googleFontsHref": "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&family=Newsreader:ital,wght@0,400;1,400;1,500&family=JetBrains+Mono:wght@400;500&display=swap",
    "display": "Instrument Serif",
    "body": "Inter",
    "script": "Newsreader",
    "mono": "JetBrains Mono"
  }
}
```

> `chromeFonts` makes the design.html doc chrome (title-card, section heads, h2/h3, lede paragraphs, eyebrows) render in the preset's NATIVE typography — Instrument Serif italic display + Inter body + Newsreader italic asides + JetBrains Mono — instead of the brand DNA fonts. Editorial is a serif-display + sans-body system: the `script` slot points at Newsreader italic (an expressive serif companion) because the preset has no handwritten voice but does ship italic asides / footnotes that need a slightly different cut from the display face. The brand fonts still apply to §6 component code (paste-ready for Phase 4b). §M motifs grid uses `.preset-native-scope` so var(--font-display/body/script/mono) re-resolves to these native families for the live preview.

## §A Director's intent

Restraint. Hierarchy through size and space, not color or weight.
Long-form sentences. Generous whitespace. Subtle motion.
The page should feel like a printed essay set in lead type.

**Asymmetry over symmetry.** Composition follows a modular grid (Müller-Brockmann).
Prefer 1/3 + 2/3 splits over 1/2 + 1/2. Anchor strong elements to grid intersections;
let the negative space carry equal weight. Center alignment is forbidden; ragged-right
left alignment is the default.

## §B Decoration tokens (merge into design.html `:root`)

Spacing / measure units are in `vw` so the same ratios scale identically across
the design.html preview (~1440px) and the final video canvas (1920×1080).
Hairline thickness stays in px — line weights shouldn't scale.

```css
--rule-hairline: 1px solid var(--ink);
--paper-warm: #f6f3ec; /* fallback if canvas is pure white */
--gap-quiet: 5vw; /* ~96px on a 1920 canvas */
--gap-page: 8.3vw; /* ~160px on a 1920 canvas */
--measure-narrow: 32vw; /* ~614px on a 1920 canvas (≈ 65ch) */
--measure-wide: 43vw; /* ~826px on a 1920 canvas */

/* Modular grid (Swiss). All layout snaps to these tracks. */
--grid-cols: 12;
--grid-gutter: 1.25vw; /* ~24px on 1920 */
--grid-margin: 8.3vw; /* outer side margin, matches --gap-page */
--baseline: 8px; /* vertical rhythm unit — round line-heights / margins to multiples */
```

## §D Font pairing fallback (if brand fonts not on Google Fonts)

- **display**: `'Instrument Serif'` · `'Fraunces'` · `'Newsreader'` · `'Spectral'`
- **body**: `'Inter'` · `'Source Sans 3'` · `'Public Sans'` wght 400
- **mono**: `'JetBrains Mono'` · `'IBM Plex Mono'` wght 400

Prefer keeping site fonts if they exist on Google Fonts. Preset only enforces weight (light/regular) and tracking.

## §T Type-role atlas (Phase 4b reads this to size text correctly)

Each entry is a **named type role** with concrete render parameters at 1920×1080 — family token, px range, weight, leading, tracking, case, and any color/border/rotation decoration. Phase 4b scene workers may cite roles by `id` ("use a `number-hero` here"); the brand DNA fonts plug in automatically via `var(--font-*)` tokens.

The atlas is the **sole authoring source** for non-component text. If a scene needs a `pull-quote` that isn't covered by §6 components, the worker reads role `pull-quote` here and writes inline CSS from these values. Do NOT invent ad-hoc sizes — the editorial register collapses when sizes drift off the Swiss type scale.

```type-roles
[
  {
    "id": "display-title",
    "family": "display",
    "purpose": "cover / opening display — italic serif, anchored to grid intersection",
    "px_min": 72, "px_max": 160, "weight": 400, "leading": "1.0", "tracking": "-0.01em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-display-title\">A canvas for teams</div>"
  },
  {
    "id": "h2-section",
    "family": "display",
    "purpose": "primary section headline (italic serif, the editorial section marker)",
    "px_min": 44, "px_max": 88, "weight": 400, "leading": "1.05", "tracking": "0", "case": "sentence",
    "sample_html": "<div class=\"t-trole-h2-section\">Section title</div>"
  },
  {
    "id": "statement",
    "family": "display",
    "purpose": "long-form quoted statement — italic serif, hairline rule above",
    "px_min": 32, "px_max": 64, "weight": 400, "leading": "1.2", "tracking": "0", "case": "sentence",
    "sample_html": "<div class=\"t-trole-statement\">A canvas for teams — designing together, in real time.</div>"
  },
  {
    "id": "pull-quote",
    "family": "script",
    "purpose": "pulled aside / margin annotation — Newsreader italic, indented on the wide measure",
    "px_min": 22, "px_max": 36, "weight": 400, "leading": "1.4", "tracking": "0", "case": "sentence",
    "sample_html": "<div class=\"t-trole-pull-quote\">Trusted by 4 million.</div>"
  },
  {
    "id": "number-hero",
    "family": "display",
    "purpose": "hero numeral — italic serif at scale, anchored to a single grid line",
    "px_min": 96, "px_max": 200, "weight": 400, "leading": "0.95", "tracking": "-0.01em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-number-hero\">4M</div>"
  },
  {
    "id": "eyebrow",
    "family": "mono",
    "purpose": "section eyebrow / kicker — mono uppercase, tracked, ink",
    "px_min": 12, "px_max": 15, "weight": 500, "leading": "1.4", "tracking": "0.16em", "case": "upper",
    "sample_html": "<div class=\"t-trole-eyebrow\">Section · 01</div>"
  },
  {
    "id": "label-spaced",
    "family": "body",
    "purpose": "title-cased section label (Inter 500, tracked) — never UPPERCASE per §G",
    "px_min": 13, "px_max": 16, "weight": 500, "leading": "1.3", "tracking": "0.04em", "case": "title",
    "sample_html": "<div class=\"t-trole-label-spaced\">A note on method</div>"
  },
  {
    "id": "body-lead",
    "family": "body",
    "purpose": "lead paragraph carrying the scene's argument — Inter 400 on narrow measure",
    "px_min": 18, "px_max": 24, "weight": 400, "leading": "1.55", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body-lead\">The lead carries one complete sentence — semicolons and em-dashes for rhythm; never a list.</p>"
  },
  {
    "id": "body",
    "family": "body",
    "purpose": "standard paragraph body on the narrow measure (~65ch)",
    "px_min": 14, "px_max": 18, "weight": 400, "leading": "1.65", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body\">Body sits at 14-18px on a 32vw measure. Left-aligned, ragged right — never justified, never centered. The whitespace carries equal weight.</p>"
  },
  {
    "id": "caption",
    "family": "body",
    "purpose": "figure caption / source attribution — Inter 400, smaller and slightly muted",
    "px_min": 12, "px_max": 14, "weight": 400, "leading": "1.5", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-caption\">Source: internal data, March 2026.</p>"
  },
  {
    "id": "footnote-italic",
    "family": "script",
    "purpose": "italic editorial aside — Newsreader italic, hung beside body on the wide measure",
    "px_min": 13, "px_max": 16, "weight": 400, "leading": "1.5", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-footnote-italic\">— a factual aside, set in italic to read as parenthetical.</p>"
  },
  {
    "id": "mono-tag",
    "family": "mono",
    "purpose": "small mono metadata — chapter counter, footer rule, factual label",
    "px_min": 11, "px_max": 13, "weight": 400, "leading": "1.4", "tracking": "0.08em", "case": "upper",
    "sample_html": "<div class=\"t-trole-mono-tag\">Vol. 01 / 2026</div>"
  }
]
```

The atlas omits the hairline rule (it's structural — declared in §B decoration tokens) and the asymmetric grid (a layout primitive declared in §H).

## §E Motion (GSAP consts — REPLACES site ease)

```js
const EASE = {
  entry: "power3.out", // soft arrival, no bounce
  emphasis: "power2.inOut", // refined transitions
  exit: "power2.in", // gentle dismissal
  drift: "sine.inOut",
};
const DUR = {
  snap: 0.32, // even "fast" is unhurried
  med: 0.65,
  slow: 1.1,
};
// RULE: motion is subtle. If you can hear the entry, it's wrong.
// RULE: prefer fade + tiny y-translate over scale or rotation.
```

## §E.5 Motion choreography

**Allowed primitives**

- Crossfade (320–650ms).
- Slow upward translate, max 24px.
- Opacity hold + delayed exit on outgoing element (overlap, never cut).
- Single element revealed at a time; stagger 200–280ms between sibling elements.

**Forbidden**

- `bounce`, `elastic`, `back.out` — anything with overshoot.
- `scale` in/out beyond 0.98 → 1.0. No "zoom" reveals.
- `rotate` on any content element. (Rotation breaks Swiss orthogonality.)
- Parallax. Camera moves. Mask wipes.
- Letter-by-letter typewriter unless the scene is _about_ type.

**Transitions between scenes**

Default is a 320–500ms crossfade with a 16–24px upward drift on the incoming
content. Never hard-cut. Never directional swipes. If two adjacent scenes share
a rule line or chapter label, hold that element across the transition (match-cut
on the rule).

**Typography in motion**

Words enter as a single block, not glyph-by-glyph. The baseline does not move
during a sentence read. Numbers (stat counters) tween linearly, never with ease.

## §G Voice transform recipe (apply to brand's voice from §1 DNA)

Take the brand's product description / value prop. Transform with:

1. Keep complete sentences. Use semicolons and em-dashes for rhythm.
2. Prefer one strong noun phrase over a list.
3. Title-case section labels, not UPPERCASE.
4. End scenes with a quiet declarative — no exclamation.
5. Cite numbers and proofs (years, customers, awards) as factual asides.

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: `A canvas for teams — designing together, in real time. Trusted by 4 million.`

## §H Scene composition hints (Phase 4b layout guidance)

**Grid & balance**

- Compose on a **12-column modular grid** with `--grid-margin` outer side margins.
- **Asymmetric split is the default**: 1/3 + 2/3, or 2/5 + 3/5. Never 1/2 + 1/2.
- Anchor display headlines and stat counters to a single grid line; let the
  remaining tracks stay empty.
- Vertical rhythm snaps to `--baseline` (8px). Round padding, margins, and
  line-heights to multiples — drifting off the baseline reads as sloppy.

**Typography discipline**

- **Left-align by default**, ragged right.
- **Never `text-align: justify`** (rivers and uneven word spacing kill the rhythm).
- **Never `text-align: center`** for body or display, except a single deliberate
  symbol/numeral on a scene. Centered editorial typography reads as wedding invite.
- One typeface family per scene. Mix weight and size, not faces.

**Color discipline**

- Canvas is the hero — solid warm paper (use brand canvas; fall back to
  `--paper-warm` if canvas is pure white).
- **Brand accent ≤ 5% of frame area.** One small chip, one underline, one numeral
  — never an entire panel. The page should still read as monochrome at a squint.
- Primary brand color is reserved for emphasis (a single quote, a single number).
  Do not use it as a background fill.

**Density & focus**

- **Two strong things per scene maximum**. Hierarchy through size, not stacking.
- **Whitespace is the primary design element**. Side margins > 8% of frame.
- One scene = one idea. If you can't name it in three words, split the scene.

**Atmosphere**

- **Transitions between scenes**: crossfade 320–500ms with a 16–24px upward
  drift. No hard cut. No swipe.
- **Stagger**: 200–280ms between elements. Unhurried.

## §M Atomic motifs (gestures the plan agent can reference)

Each motif is a **single reusable gesture** that lives inside a larger pattern. Patterns compose motifs; motifs do not compose anything. Editorial is restrained by design — only the gestures that reinforce Swiss discipline qualify as atomic. Decoration is the enemy.

```motifs
[
  {
    "id": "hairline-rule",
    "label": "Hairline rule",
    "role": "structural-separator",
    "surface_safe": ["paper"],
    "description": "1px ink rule above a section label or between scenes. The system's only structural ornament — never thicker, never colored, never dashed. Holds across scene transitions as a match-cut anchor.",
    "wide": true,
    "demo": "<div class=\"ed-motif-rule\"><div class=\"ed-motif-rule-line\"></div><div class=\"ed-motif-rule-label\">Section · 01</div></div>",
    "css": ".ed-motif-rule{display:flex;flex-direction:column;gap:12px;width:100%;max-width:360px}.ed-motif-rule-line{height:1px;background:var(--ink)}.ed-motif-rule-label{font-family:var(--f-mono-native);font-weight:500;font-size:clamp(11px,1vw,14px);line-height:1.4;letter-spacing:.16em;text-transform:uppercase;color:var(--ink)}"
  },
  {
    "id": "italic-pull",
    "label": "Italic pull-quote",
    "role": "editorial-aside",
    "surface_safe": ["paper"],
    "description": "Newsreader italic on the wide measure, hung beside a body paragraph — the editorial fingerprint. One per scene. Never paired with a second italic block (italic-on-italic dilutes the aside).",
    "wide": true,
    "demo": "<div class=\"ed-motif-pull\"><p class=\"ed-motif-pull-body\">The page should feel like a printed essay set in lead type — hierarchy through size and space.</p><p class=\"ed-motif-pull-aside\">— a factual aside, italic in the margin.</p></div>",
    "css": ".ed-motif-pull{display:grid;grid-template-columns:2fr 1fr;gap:24px;align-items:start;max-width:560px}.ed-motif-pull-body{margin:0;font-family:var(--f-body-native);font-weight:400;font-size:clamp(14px,1.2vw,18px);line-height:1.65;color:var(--ink)}.ed-motif-pull-aside{margin:0;font-family:var(--f-script-native);font-style:italic;font-weight:400;font-size:clamp(13px,1.1vw,16px);line-height:1.5;color:color-mix(in srgb,var(--ink) 70%, transparent)}"
  },
  {
    "id": "number-anchor",
    "label": "Number anchor",
    "role": "stat-display",
    "surface_safe": ["paper"],
    "description": "Italic-serif numeral at hero scale, anchored to a single grid line with a hairline rule beneath and a mono caption. The stat reads as a quiet declarative — never a chart, never a sparkline.",
    "demo": "<div class=\"ed-motif-num\"><div class=\"ed-motif-num-value\">4M</div><div class=\"ed-motif-num-rule\"></div><div class=\"ed-motif-num-label\">Teams · trusted</div></div>",
    "css": ".ed-motif-num{display:flex;flex-direction:column;gap:12px;align-items:flex-start}.ed-motif-num-value{font-family:var(--f-disp-native);font-style:italic;font-weight:400;font-size:clamp(64px,8vw,140px);line-height:.95;letter-spacing:-.01em;color:var(--ink)}.ed-motif-num-rule{width:80px;height:1px;background:var(--ink)}.ed-motif-num-label{font-family:var(--f-mono-native);font-weight:500;font-size:clamp(11px,1vw,14px);line-height:1.4;letter-spacing:.16em;text-transform:uppercase;color:var(--ink)}"
  },
  {
    "id": "asymmetric-split",
    "label": "Asymmetric split",
    "role": "grid-anchor",
    "surface_safe": ["paper"],
    "description": "1/3 + 2/3 (or 2/5 + 3/5) split with a single thought anchored to one column and the other left as breathing room. Never 1/2 + 1/2. The Müller-Brockmann signature.",
    "wide": true,
    "demo": "<div class=\"ed-motif-split\"><div class=\"ed-motif-split-eyebrow\">01</div><p class=\"ed-motif-split-body\">Asymmetry over symmetry. Composition follows a modular grid; the negative space carries equal weight.</p></div>",
    "css": ".ed-motif-split{display:grid;grid-template-columns:1fr 2fr;gap:32px;align-items:start;max-width:560px}.ed-motif-split-eyebrow{font-family:var(--f-mono-native);font-weight:500;font-size:clamp(11px,1vw,14px);line-height:1.4;letter-spacing:.16em;text-transform:uppercase;color:var(--ink)}.ed-motif-split-body{margin:0;font-family:var(--f-body-native);font-weight:400;font-size:clamp(14px,1.2vw,18px);line-height:1.65;color:var(--ink);max-width:36ch}"
  },
  {
    "id": "em-dash-aside",
    "label": "Em-dash aside",
    "role": "voice-marker",
    "surface_safe": ["paper"],
    "description": "Em-dash opener on a single body line — the Swiss equivalent of a callout. Carries factual asides (years, customers, awards) without breaking the paragraph flow. Never an exclamation, never a quote mark.",
    "demo": "<p class=\"ed-motif-emdash\">— Trusted by 4 million teams, since 2016.</p>",
    "css": ".ed-motif-emdash{margin:0;font-family:var(--f-body-native);font-weight:400;font-size:clamp(14px,1.3vw,18px);line-height:1.6;color:var(--ink);max-width:36ch}"
  }
]
```

The `motifs` JSON block above is the SOLE source of truth. build-design.mjs reads it to render §M cards in design.html. The Phase 3 plan agent and Phase 4b scene worker may cite motifs by `id` when annotating which gesture a scene relies on.

**Materials lexicon** (informational — these are the composition atoms behind the patterns):

- hairline-rule · italic-pull · number-anchor · asymmetric-split · em-dash-aside

## §I Page-level CSS (makes design.html itself read as editorial)

```css
/* ── Preset-native typography vars (loaded via preset-meta.chromeFonts.googleFontsHref).
 * These let the doc chrome render in Instrument Serif + Inter + Newsreader + JetBrains Mono
 * regardless of which brand DNA the preset is applied to. The §6 component preview,
 * §M motifs grid also reads these via .preset-native-scope.
 *
 * Fallback chains end in a face that still carries the preset's vibe (Fraunces / Newsreader /
 * Spectral / Georgia for the italic-serif display; Source Sans 3 / Public Sans / system-ui for
 * Inter body; system serif italic for Newsreader). Falling all the way to generic should never
 * happen in practice. */
:root {
  --f-disp-native:
    "Instrument Serif", "Fraunces", "Newsreader", "Spectral", "Georgia", "Times New Roman", serif;
  --f-body-native:
    "Inter", "Source Sans 3", "Public Sans", -apple-system, BlinkMacSystemFont, system-ui,
    sans-serif;
  --f-script-native: "Newsreader", "Spectral", "Fraunces", "Georgia", "Times New Roman", serif;
  --f-mono-native:
    "JetBrains Mono", "IBM Plex Mono", "Space Mono", "Menlo", ui-monospace, monospace;
}

/* .preset-native-scope: re-bind brand DNA font tokens to preset-native families.
 * Wraps §6 component previews and §M motif demos so var(--font-*) resolves to
 * Instrument Serif / Inter / Newsreader / JetBrains Mono regardless of the brand
 * DNA tokens emitted in :root. The paste-ready component source is untouched —
 * Phase 4b still grep + paste original `var(--font-display)` tokens, which
 * resolve to brand DNA at scene-render time. */
.preset-native-scope {
  --font-display: var(--f-disp-native);
  --font-body: var(--f-body-native);
  --font-script: var(--f-script-native);
  --font-mono: var(--f-mono-native);
}

body {
  background: var(--canvas);
}
.title-card {
  padding: 120px 0 80px;
  border-bottom: var(--rule-hairline);
}
.title-display {
  font-style: italic;
  max-width: var(--measure-wide);
}

.ds-section {
  border-top: var(--rule-hairline);
  padding: 96px 0;
}

.dna-swatch {
  border-radius: 4px !important;
  border: var(--rule-hairline) !important;
  box-shadow: none !important;
}

.comp-card {
  border: var(--rule-hairline) !important;
  border-radius: 4px !important;
  box-shadow: none !important;
  margin: 24px 0 !important;
}
.comp-head {
  background: transparent !important;
  border-bottom: var(--rule-hairline) !important;
}

.ds-code {
  border: var(--rule-hairline);
  border-radius: 4px !important;
}

h2 {
  font-style: italic;
}

/* ── §M Motifs grid: atomic gestures.
 * Mirrors editorial's restraint — a 12-col grid of small cards each teaching ONE
 * reusable gesture. Cards carry no surface variant (editorial is paper-only);
 * decoration is the enemy, so the card itself is the canvas with a hairline rule. */
.ds-motif-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}
.ds-motif {
  grid-column: span 4;
  min-height: 280px;
  padding: 32px;
  border: var(--rule-hairline);
  border-radius: 4px;
  background: var(--canvas);
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
.ds-motif-h {
  margin: 0;
  font-family: var(--f-disp-native);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(22px, 2.2vw, 32px);
  line-height: 1.05;
  letter-spacing: 0;
  color: var(--ink);
}
.ds-motif-desc {
  margin: 0;
  font-family: var(--f-body-native);
  font-weight: 400;
  font-size: 14px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--ink) 65%, transparent);
  max-width: 32ch;
}
.ds-motif-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 96px;
}
.ds-motif-id {
  position: absolute;
  top: 14px;
  right: 16px;
  font-family: var(--f-mono-native);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--ink) 45%, transparent);
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

/* ── §T Type-role atlas. Container = flat paper card with hairline border.
 * Each .t-trole-* class encodes the role's family / size / weight / leading /
 * tracking / case / decoration. Family selectors use var(--font-*) tokens so
 * the atlas renders in BRAND DNA fonts; only the recipe is preset-declared. */
.ds-trole-box {
  display: flex;
  flex-direction: column;
  border: var(--rule-hairline);
  border-radius: 4px;
  background: var(--canvas);
  overflow: hidden;
  margin-top: 24px;
}
.ds-trole-row {
  padding: 32px;
  border-bottom: var(--rule-hairline);
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

/* ── Type-role samples. var(--font-display/body/script/mono) resolves to brand DNA.
 * Color uses editorial restraint: ink only, mute via opacity, brand-primary reserved
 * for a single emphasis numeral or chip — never as a panel fill. */
.t-trole-display-title {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(56px, 8vw, 160px);
  line-height: 1;
  letter-spacing: -0.01em;
  color: var(--ink);
  max-width: var(--measure-wide);
}
.t-trole-h2-section {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(40px, 5vw, 88px);
  line-height: 1.05;
  letter-spacing: 0;
  color: var(--ink);
}
.t-trole-statement {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(28px, 4vw, 64px);
  line-height: 1.2;
  color: var(--ink);
  max-width: var(--measure-wide);
  padding-top: 24px;
  border-top: var(--rule-hairline);
}
.t-trole-pull-quote {
  font-family: var(--font-script);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(20px, 2.4vw, 36px);
  line-height: 1.4;
  color: color-mix(in srgb, var(--ink) 75%, transparent);
  max-width: 28ch;
}
.t-trole-number-hero {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(80px, 12vw, 200px);
  line-height: 0.95;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.t-trole-eyebrow {
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: clamp(11px, 0.9vw, 15px);
  line-height: 1.4;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-label-spaced {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: clamp(13px, 1.1vw, 16px);
  line-height: 1.3;
  letter-spacing: 0.04em;
  color: var(--ink);
}
.t-trole-body-lead {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(16px, 1.6vw, 24px);
  line-height: 1.55;
  color: var(--ink);
  max-width: var(--measure-narrow);
  margin: 0;
}
.t-trole-body {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(14px, 1.2vw, 18px);
  line-height: 1.65;
  color: var(--ink);
  max-width: var(--measure-narrow);
  margin: 0;
}
.t-trole-caption {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(12px, 0.95vw, 14px);
  line-height: 1.5;
  color: color-mix(in srgb, var(--ink) 65%, transparent);
  max-width: var(--measure-narrow);
  margin: 0;
}
.t-trole-footnote-italic {
  font-family: var(--font-script);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(13px, 1.1vw, 16px);
  line-height: 1.5;
  color: color-mix(in srgb, var(--ink) 70%, transparent);
  max-width: var(--measure-narrow);
  margin: 0;
}
.t-trole-mono-tag {
  font-family: var(--font-mono);
  font-weight: 400;
  font-size: clamp(11px, 0.9vw, 13px);
  line-height: 1.4;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink);
}
```
