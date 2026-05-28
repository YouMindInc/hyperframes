```preset-meta
{
  "name": "emerald-editorial",
  "label": "Emerald Editorial",
  "fingerprint": {
    "edges": "strict-rectangle",
    "shadow": "none",
    "rules": "4px-ink-solid",
    "ornament": "double-rule-playbill",
    "type": "bodoni-900-extreme-scale",
    "voice": "fashion-masthead",
    "register": "literary-authoritative"
  },
  "match_signals": [
    { "kind": "serif_display", "weight": 0.32 },
    { "kind": "thick_solid_border", "weight": 0.22 },
    { "kind": "minimal_decoration", "weight": 0.18 },
    { "kind": "high_sat_accent", "weight": 0.12 }
  ],
  "best_for": ["literary brands", "strategy", "planning", "leadership decks", "longform research", "authoritative editorial"],
  "avoid_for": ["quiet institutional brands", "restrained corporate decks", "calm minimalist registers"],
  "chromeFonts": {
    "googleFontsHref": "https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@500;700;800;900&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap",
    "display": "Bodoni Moda",
    "body": "Manrope",
    "script": "Bodoni Moda",
    "mono": "JetBrains Mono"
  }
}
```

> `chromeFonts` makes the design.html doc chrome (title-card, section heads, h2/h3, lede paragraphs, eyebrows) render in the preset's NATIVE typography — Bodoni Moda + Manrope + JetBrains Mono — instead of the brand DNA fonts. Emerald Editorial is a two-face system: Bodoni Moda 900 carries every display moment, Manrope carries every chrome / body moment, the `script` slot points back at Bodoni because the preset refuses a third face (italics are loaded but dormant per design.md). The brand fonts still apply to §6 component code (paste-ready for Phase 4b). §M motifs grid and §T type-role atlas use `.preset-native-scope` so var(--font-display/body/script/mono) re-resolves to these native families for the live preview.

## §A Director's intent

A fashion-masthead / 19th-century theatrical-playbill register: one display serif at extreme scale (heavy Bodoni-style, weight 900, 92-460px), with negative tracking and tight leading, set against a saturated brand canvas with deep ink and a warm alt-tile surface. The signature is the **double-rule ornament** — a centered serif word framed by two stacked 4px horizontal rules on each side (3px between them), bracketing a connector ("of", "and", "for") between two display words like a printed playbill.

Depth is flat printed ink. **Zero shadows, zero gradients, zero border-radius, zero blur.** Elevation is communicated through color-block inversion (an `--ink` tile on the canvas reads as "elevated") and 4px solid ink rules that separate every section, list row, and tile divider.

**Best for** sites whose brand DNA reads "literary / considered / authoritative / designed" — strategy, planning, leadership, editorial, longform, research, or any product that wants to feel like the front of a serious magazine. **Avoid for** quiet / institutionally-restrained brands — the saturated canvas + 900-weight display is too theatrical to disappear.

Class prefix: `ee-` (emerald-editorial). All component CSS classes are namespaced under this prefix. No hex literals — every color references brand vars (`var(--canvas)`, `var(--ink)`, `var(--brand-primary)`, `var(--brand-accent)`).

## §B Decoration tokens

```css
/* Structural rules — universal 4px ink. The system's rhythm. */
--ee-rule-weight: 4px;
--ee-rule-weight-cover: 5px; /* cover ornament rules; slightly heavier */
--ee-rule-color: var(--ink);
--ee-rule: var(--ee-rule-weight) solid var(--ee-rule-color);

/* Double-rule ornament — the signature treatment.
   Two 4px rules stacked 3px apart inside an 18px span. */
--ee-ornament-height: 18px;
--ee-ornament-rule-gap: 3px;
--ee-ornament-rule-thickness: 4px;
--ee-ornament-side-bracket-width: 64px; /* vertical-rule side bracket */
--ee-ornament-side-bracket-gap: 8px;

/* Borders — only structural, no radius anywhere */
--ee-radius: 0; /* strict rectangle commitment */
--ee-tile-border: var(--ee-rule);

/* Alt-tile (paper-equivalent) surface — aliased from brand accent.
   The "warm break" surface that breaks rows of all-inverse tiles. */
--ee-paper: var(--brand-accent);

/* Inverse tile — solid ink with canvas-color text */
--ee-inverse-bg: var(--ink);
--ee-inverse-fg: var(--canvas);

/* Spacing scale — pulled from the editorial padding system */
--ee-pad-default: 110px;
--ee-pad-default-y-bottom: 70px;
--ee-pad-cover: 56px;
--ee-pad-tile: 36px;
--ee-pad-tile-tight: 32px;
--ee-pad-pill-y: 10px;
--ee-pad-pill-x: 22px;
--ee-masthead-inset-top: 56px;
--ee-masthead-inset-x: 80px;
--ee-gap-default: 30px;
--ee-gap-loose: 50px;
--ee-gap-row: 26px;

/* Display tracking + leading — the weight-900 voice */
--ee-display-tracking: -0.015em;
--ee-display-tracking-tight: -0.03em;
--ee-display-leading: 0.95;
--ee-display-leading-tight: 0.9;

/* Chrome tracking — uppercase Manrope-equivalent at wide letter-spacing */
--ee-chrome-tracking: 0.1em;
--ee-chrome-tracking-wide: 0.18em;
--ee-chrome-tracking-tight: 0.05em;

/* Chart grid lines — subtle 22% canvas-on-ink */
--ee-chart-grid: color-mix(in srgb, var(--canvas) 22%, transparent);
```

## §D Font pairing fallback

- **display**: `'Bodoni Moda'` · `'Playfair Display'` · `'DM Serif Display'` wght 900
- **body**: `'Manrope'` · `'Inter'` wght 500
- **mono**: `'JetBrains Mono'` · `'Space Mono'` wght 600

## §T Type-role atlas (Phase 4b reads this to size text correctly)

Each entry is a **named type role** with concrete render parameters at 1920×1080 — family token, px range, weight, leading, tracking, case, and any color/decoration. Phase 4b scene workers may cite roles by `id` ("use a `kpi-figure` here"); the brand DNA fonts plug in automatically via `var(--font-*)` tokens. This is the same atlas Emerald Editorial ships in its Typography section, ported as machine-readable JSON.

The atlas is the **sole authoring source** for non-component text. If a scene needs a `numeral-jumbo` that isn't covered by §6 components, the worker reads role `numeral-jumbo` here and writes inline CSS from these values. Do NOT invent ad-hoc sizes — the system's identity collapses if Bodoni drops below weight 900 at display scale, or if Manrope crosses out of the chrome ladder (24 / 26 / 28 px).

```type-roles
[
  {
    "id": "numeral-jumbo",
    "family": "display",
    "purpose": "hero numeral on inverse navy section-opener panel — the 460px playbill mass",
    "px_min": 320, "px_max": 460, "weight": 900, "leading": "0.9", "tracking": "-0.04em", "case": "upper",
    "sample_html": "<div class=\"t-trole-numeral-jumbo\">Q3</div>"
  },
  {
    "id": "display-section",
    "family": "display",
    "purpose": "agenda / section-title hero (the Programme scale)",
    "px_min": 160, "px_max": 200, "weight": 900, "leading": "0.9", "tracking": "-0.015em", "case": "title",
    "sample_html": "<div class=\"t-trole-display-section\">The Programme</div>"
  },
  {
    "id": "display-cover",
    "family": "display",
    "purpose": "cover masthead title (184px Bodoni 900)",
    "px_min": 144, "px_max": 184, "weight": 900, "leading": "0.92", "tracking": "-0.01em", "case": "upper",
    "sample_html": "<div class=\"t-trole-display-cover\">STATE</div>"
  },
  {
    "id": "display",
    "family": "display",
    "purpose": "statement / pull-quote scale headline",
    "px_min": 104, "px_max": 130, "weight": 900, "leading": "0.96", "tracking": "-0.015em", "case": "title",
    "sample_html": "<div class=\"t-trole-display\">Three Threads Worth Following.</div>"
  },
  {
    "id": "headline",
    "family": "display",
    "purpose": "routine slide headline (the 92px default)",
    "px_min": 80, "px_max": 104, "weight": 900, "leading": "1", "tracking": "-0.02em", "case": "title",
    "sample_html": "<div class=\"t-trole-headline\">The Quarter, In Review.</div>"
  },
  {
    "id": "ornament-word",
    "family": "display",
    "purpose": "small connector word bracketed by the double-rule ornament (\"of\", \"and\", \"for\")",
    "px_min": 60, "px_max": 84, "weight": 800, "leading": "1", "tracking": "0.02em", "case": "lower",
    "sample_html": "<span class=\"t-trole-ornament-word\">of</span>"
  },
  {
    "id": "kpi-figure",
    "family": "display",
    "purpose": "KPI-tile numeral on inverse navy tile (144px Bodoni 900)",
    "px_min": 120, "px_max": 144, "weight": 900, "leading": "0.9", "tracking": "-0.03em", "case": "upper",
    "sample_html": "<div class=\"t-trole-kpi-figure\">94<span class=\"u\">%</span></div>"
  },
  {
    "id": "stat-figure",
    "family": "display",
    "purpose": "secondary stat numeral in a side panel (92px Bodoni 900)",
    "px_min": 80, "px_max": 92, "weight": 900, "leading": "1", "tracking": "-0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-stat-figure\">+24<span class=\"u\">%</span></div>"
  },
  {
    "id": "title-card",
    "family": "display",
    "purpose": "Bodoni 800 title inside a card / agenda-row name / chart take-away",
    "px_min": 40, "px_max": 64, "weight": 800, "leading": "1.05", "tracking": "-0.005em", "case": "title",
    "sample_html": "<div class=\"t-trole-title-card\">A Reading Of The Data</div>"
  },
  {
    "id": "eyebrow",
    "family": "body",
    "purpose": "Manrope 800 uppercase eyebrow above a headline (0.18em tracking)",
    "px_min": 22, "px_max": 28, "weight": 800, "leading": "1.2", "tracking": "0.18em", "case": "upper",
    "sample_html": "<div class=\"t-trole-eyebrow\">A Reading Of The Period</div>"
  },
  {
    "id": "label",
    "family": "body",
    "purpose": "masthead / footline label (Manrope 700, 0.08em)",
    "px_min": 22, "px_max": 26, "weight": 700, "leading": "1.2", "tracking": "0.08em", "case": "upper",
    "sample_html": "<div class=\"t-trole-label\">Data Study · Quarterly Movement</div>"
  },
  {
    "id": "tag",
    "family": "body",
    "purpose": "inverse pill / chip mark (ink bg, emerald text, Manrope 800 0.12em)",
    "px_min": 20, "px_max": 24, "weight": 800, "leading": "1", "tracking": "0.12em", "case": "upper",
    "sample_html": "<span class=\"t-trole-tag\">Three Themes</span>"
  },
  {
    "id": "body-lg",
    "family": "body",
    "purpose": "lede / subtitle paragraph (Manrope 500 at 28px)",
    "px_min": 24, "px_max": 28, "weight": 500, "leading": "1.5", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body-lg\">A short framing of what changed, what held steady, and where the team's attention is most needed in the weeks to come.</p>"
  },
  {
    "id": "body",
    "family": "body",
    "purpose": "standard body paragraph (Manrope 500 at 26px)",
    "px_min": 22, "px_max": 26, "weight": 500, "leading": "1.5", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body\">Internal systems were rebuilt around fewer moving parts. Incidents fell, and the time spent on routine work fell with them.</p>"
  },
  {
    "id": "caption",
    "family": "body",
    "purpose": "agenda-row kind label / chart axis / KPI sub-label (Manrope 700 uppercase 0.1em)",
    "px_min": 20, "px_max": 24, "weight": 700, "leading": "1.35", "tracking": "0.1em", "case": "upper",
    "sample_html": "<div class=\"t-trole-caption\">Overview · 8 Min</div>"
  },
  {
    "id": "delta-pill",
    "family": "body",
    "purpose": "directional change chip inside a KPI tile (emerald bg, navy text on ink tile)",
    "px_min": 20, "px_max": 24, "weight": 800, "leading": "1", "tracking": "0.08em", "case": "upper",
    "sample_html": "<span class=\"t-trole-delta-pill\">+ 12.4%</span>"
  }
]
```

The atlas omits the chart-card surface treatment (a §M motif), the masthead/footline layout (structural chrome, declared in §H), and the inverse-tile fill (a §M motif).

## §E Motion (GSAP consts — REPLACES site ease)

```js
// Emerald Editorial motion: paper-and-ink. Type sets like a typewriter
// would set it — deliberate, with clear arrivals. Avoid rubber-band / bouncy.
// Decorative rules draw on like a pen across paper.

const EASE = {
  entry: "expo.out", // headlines arrive decisively, then settle
  emphasis: "power3.out", // ornament words pop in over the rule-draw
  exit: "power2.in", // exits accelerate (book closing)
  drift: "sine.inOut", // chrome (masthead, footline) breathes very slowly
  // Optional: rule-draw — bracket lines extend horizontally with a slight ease-out
  rule: "power2.out",
};

const DUR = {
  snap: 0.16, // small chrome reveals (chips, eyebrows)
  med: 0.45, // primary headline / display arrivals
  slow: 0.9, // ornament rule-draw, jumbo numeral lockup
};

// RULE: never use back / elastic / bounce easing — overshoot breaks the
//       printed-ink discipline. The system is press-and-stop, not spring.
// RULE: ornament double-rule lines draw left-to-right (scaleX 0 -> 1) with
//       transform-origin: left. The connector word fades in AFTER both
//       lines have fully drawn (stagger by DUR.med).
// RULE: jumbo Bodoni numerals (200px+) scale in from 0.9 -> 1 with EASE.entry
//       and DUR.slow. Never spin, skew, or 3D-rotate them.
// RULE: text-transform: uppercase content (chrome labels) reveals via opacity
//       only — never per-letter splittext, which fights the wide tracking.
```

### §E.5 Motion choreography

- **Allowed primitives:** opacity fades, y-translate (subtle, ≤24px), scaleX rule-draw (transform-origin: left), scale on jumbo numerals (0.9→1).
- **Forbidden gestures:** rotation, skew, 3D, parallax-blur, particle bursts, mask-reveal of letterforms. The system is flat printed ink.
- **Transition default:** snap-cut between scenes, OR a slow `--ee-paper` page-flip wipe (left-to-right, EASE.entry, DUR.slow). Never crossfade — fade muddies the ink.
- **Stagger budget:** 0.04-0.08s between sibling items in a list (agenda rows, KPI tiles, process steps). The first row arrives at scene start; the last lands within DUR.med + 5 \* 0.08 = ~0.85s.
- **Type-in-motion rule:** Bodoni display reveals by ascending y-translate (24→0px) + opacity (0→1), not by per-letter typewriter. The wide-set heading reads as a printed page exposure.
- **Ornament timing:** rule-draw at DUR.slow, connector word fades in at end of rule-draw with EASE.emphasis at DUR.snap. The rules MUST land before the word — the rules bracket the word, they don't dance around it.

## §G Voice transform recipe

1. Strip web-marketing connectives (`learn more`, `today`, `easily`, `instantly`) — they read as adtech, not editorial.
2. Keep grammatical articles (`the`, `a`, `of`, `and`) — editorial voice is full-sentence, not strip-mined nominal.
3. Title Case the headline (`The Quarter, In Review`), NOT UPPERCASE. Bodoni 900 carries the weight; uppercase serif at 184px is brutalist, not editorial.
4. UPPERCASE only the chrome layer — eyebrows, masthead/footline strings, marks/chips, KPI labels, captions — with 0.05-0.18em letter-spacing.
5. Punctuate with em-dashes (—) and serial commas. End headlines with a period when the line stands as a complete statement (`The Quarter, In Review.`); drop the period on a fragment in the cover position (`THE STATE / of / THE WORK AHEAD`).
6. When the headline contains a small connector word (`of`, `and`, `in`, `for`), set that word in the ornament between display words and downscale it to ~0.42x the display size — this is the playbill bracket.

**Example:**

- IN: `Build faster apps with our AI-powered analytics platform`
- OUT: `Faster Apps. / — and — / Sharper Analytics.` (the em-dashes between flank an ornament-bracketed `and`; the two display lines stack)

## §H Scene composition hints

- **Default surface:** `var(--canvas)` (the site's brand canvas). Reach for `var(--ink)` as the full slide surface only for section-opener and closing moments.
- **Default text on canvas:** `var(--ink)`. **Default text on ink:** `var(--canvas)`. The system has exactly one color flip — never introduce a third (e.g. paper-on-ink) without explicit reason.
- **Focal element sizing:** one display headline per scene at 92-200px Bodoni-equivalent. Hero / cover scenes go to 184px; jumbo numeral panels go to 460px. Routine headlines stay at 92-104px. Pick from the ladder (92 / 104 / 120 / 128 / 130 / 184 / 200) — never invent a new size.
- **Tile rotation:** in any row of 3-4 supporting tiles (KPI grid, process flow), alternate `--ee-inverse-bg` (ink) and `--ee-paper` (alt-surface) tiles. Three all-ink tiles in a row reads as monotony; pattern is `ink → paper → ink → paper`.
- **Rule rhythm:** every section separator, list-row border, tile internal divider is a 4px solid `var(--ink)` rule. Never 1px, never 2px (2px is reserved for chart grid lines only), never dashed.
- **Ornament use:** the double-rule ornament works best around a small connector word between two display lines. Don't use it as page-wide decoration without a word inside the bracket — the bracket without a word reads as broken.
- **Density:** one display headline + 3-4 supporting tiles is the rhythm. A scene with six small elements breaks the editorial register; if you find yourself crowding, increase the headline size and drop tiles.
- **No corner radius anywhere.** Pills, tags, tiles, panels, bars, ornament strips — all strict rectangles. The only curves are inside the Bodoni glyphs themselves.
- **No shadows, no gradients, no glass.** If a scene needs depth, invert a tile or add a 4px rule. Never reach for box-shadow.
- **Masthead/footline chrome:** cover and closing scenes carry a top + bottom Manrope row (two uppercase strings, opposite sides) at `top/bottom: 56px, side: 80px`. Content scenes typically skip the chrome and let the 110px-top padding hold the page.
- **Section-opener pattern:** a 50/50 split where the left half is a solid `var(--ink)` panel holding a jumbo Bodoni numeral (~460px) and the right half is canvas with eyebrow + headline + lede + mark chips.
- **Transition vocabulary:** snap-cut or `--ee-paper` page-flip wipe. Never crossfade.
- **Brand color placement:** if the site exposes `--brand-primary`, prefer it for the **rule-fill accent** moments (small inline highlights on display headlines, like an underlined word in a magazine). Keep the dominant text in `--ink`.

## §M Atomic motifs (gestures the plan agent can reference)

Each motif is a **single reusable gesture** that lives inside a larger pattern. Patterns compose motifs; motifs do not compose anything. Emerald Editorial is reductive by design — only 6 gestures qualify as atomic. Adding more would dilute the printed-ink discipline.

```motifs
[
  {
    "id": "double-rule-ornament",
    "label": "Double-rule ornament",
    "role": "playbill-bracket",
    "surface_safe": ["canvas", "ink"],
    "description": "The system's signature: two stacked 4px ink rules on each side of a centered Bodoni connector word (\"of\", \"and\", \"for\"). 18px ornament span, 3px between the rules. Brackets pairs of display headlines like a 19th-century playbill. Never use without a word inside the bracket — the rules need a word to bracket.",
    "wide": true,
    "demo": "<div class=\"ee-motif-orn\"><span class=\"rule\"></span><span class=\"of\">of</span><span class=\"rule\"></span></div>",
    "css": ".ee-motif-orn{display:inline-flex;align-items:center;justify-content:center;gap:26px;width:100%;max-width:560px}.ee-motif-orn .rule{flex:1;height:18px;position:relative}.ee-motif-orn .rule::before,.ee-motif-orn .rule::after{content:\"\";position:absolute;left:0;right:0;height:4px;background:var(--ink)}.ee-motif-orn .rule::before{top:3px}.ee-motif-orn .rule::after{bottom:3px}.ee-motif-orn .of{font-family:var(--f-disp-native);font-weight:800;font-size:clamp(40px,4.4vw,68px);line-height:1;letter-spacing:.02em;padding:0 6px;color:var(--ink)}"
  },
  {
    "id": "inverse-tile",
    "label": "Inverse tile",
    "role": "color-block-elevation",
    "surface_safe": ["canvas"],
    "description": "Solid var(--ink) rectangle holding var(--canvas) text — the system's primary depth move. Strict rectangle, no radius, no shadow. Elevation reads through the color-block inversion, not through z-stack shadow. Use as chart-card / KPI tile / process step / section-opener panel.",
    "demo": "<div class=\"ee-motif-inverse\"><div class=\"ee-motif-inverse-lbl\">Active Accounts</div><div class=\"ee-motif-inverse-val\">2,418</div></div>",
    "css": ".ee-motif-inverse{background:var(--ink);color:var(--canvas);padding:32px 28px;display:flex;flex-direction:column;gap:14px;font-family:var(--f-body-native)}.ee-motif-inverse-lbl{font-family:var(--f-body-native);font-weight:800;font-size:clamp(14px,1.2vw,22px);letter-spacing:.14em;text-transform:uppercase;color:var(--canvas)}.ee-motif-inverse-val{font-family:var(--f-disp-native);font-weight:900;font-size:clamp(56px,7vw,120px);line-height:.9;letter-spacing:-.03em;color:var(--canvas)}"
  },
  {
    "id": "paper-tile",
    "label": "Paper tile",
    "role": "alt-surface",
    "surface_safe": ["canvas"],
    "description": "Solid var(--brand-accent) (oat paper) rectangle holding var(--ink) text — the warm break that interrupts a row of all-inverse tiles. Used in rotation: ink → paper → ink → paper. Strict rectangle, no radius, no shadow.",
    "demo": "<div class=\"ee-motif-paper\"><div class=\"ee-motif-paper-lbl\">Retention Rate</div><div class=\"ee-motif-paper-val\">94%</div></div>",
    "css": ".ee-motif-paper{background:var(--brand-accent);color:var(--ink);padding:32px 28px;display:flex;flex-direction:column;gap:14px}.ee-motif-paper-lbl{font-family:var(--f-body-native);font-weight:800;font-size:clamp(14px,1.2vw,22px);letter-spacing:.14em;text-transform:uppercase;color:var(--ink)}.ee-motif-paper-val{font-family:var(--f-disp-native);font-weight:900;font-size:clamp(56px,7vw,120px);line-height:.9;letter-spacing:-.03em;color:var(--ink)}"
  },
  {
    "id": "rule-4px",
    "label": "4px ink rule",
    "role": "structural-separator",
    "surface_safe": ["canvas", "ink"],
    "description": "Universal 4px solid var(--ink) horizontal rule — the system's structural rhythm. Separates every stacked section, every agenda row, every tile divider. Never 1px, never 2px (2px is reserved for chart grid only), never dashed, never colored beyond ink.",
    "wide": true,
    "demo": "<div class=\"ee-motif-rule-row\"><div class=\"ee-motif-rule-row-cell\"><span class=\"n\">01</span><span class=\"name\">The Quarter In Review</span><span class=\"kind\">Overview · 8 Min</span></div></div>",
    "css": ".ee-motif-rule-row{display:flex;flex-direction:column;width:100%;max-width:680px}.ee-motif-rule-row-cell{display:grid;grid-template-columns:64px 1fr auto;align-items:center;gap:20px;padding:18px 0;border-top:4px solid var(--ink);border-bottom:4px solid var(--ink)}.ee-motif-rule-row-cell .n{font-family:var(--f-disp-native);font-weight:800;font-size:clamp(32px,3.4vw,52px);line-height:1;color:var(--ink)}.ee-motif-rule-row-cell .name{font-family:var(--f-disp-native);font-weight:800;font-size:clamp(22px,2.4vw,38px);line-height:1;letter-spacing:-.005em;color:var(--ink)}.ee-motif-rule-row-cell .kind{font-family:var(--f-body-native);font-weight:700;font-size:clamp(11px,1vw,16px);letter-spacing:.1em;text-transform:uppercase;color:var(--ink);text-align:right;white-space:nowrap}"
  },
  {
    "id": "mark-pill",
    "label": "Mark pill",
    "role": "category-tag",
    "surface_safe": ["canvas"],
    "description": "Small strict-rectangle pill — var(--ink) bg, var(--canvas) text — used as a category mark or section tag. No border-radius, no shadow. Inverts to canvas-on-ink inside a paper tile.",
    "demo": "<span class=\"ee-motif-pill\">Three Themes</span>",
    "css": ".ee-motif-pill{display:inline-block;background:var(--ink);color:var(--canvas);padding:10px 22px;font-family:var(--f-body-native);font-weight:700;font-size:clamp(14px,1.2vw,22px);letter-spacing:.1em;text-transform:uppercase}"
  },
  {
    "id": "delta-chip",
    "label": "Delta chip",
    "role": "change-indicator",
    "surface_safe": ["ink", "canvas"],
    "description": "Directional change marker living at the corner of a KPI tile. var(--canvas) bg with var(--ink) text when inside an inverse-tile (the default); inverted to ink-on-canvas when inside a paper-tile. Strict rectangle.",
    "demo": "<div class=\"ee-motif-delta-host\"><span class=\"ee-motif-delta\">+ 12.4%</span></div>",
    "css": ".ee-motif-delta-host{display:flex;align-items:center;justify-content:center;background:var(--ink);padding:24px 32px}.ee-motif-delta{display:inline-block;background:var(--canvas);color:var(--ink);padding:6px 16px;font-family:var(--f-body-native);font-weight:800;font-size:clamp(13px,1.1vw,20px);letter-spacing:.08em;text-transform:uppercase}"
  }
]
```

The `motifs` JSON block above is the SOLE source of truth. build-design.mjs reads it to render §M cards in design.html. The Phase 3 plan agent and Phase 4b scene worker may cite motifs by `id` when annotating which gesture a scene relies on.

**Materials lexicon** (informational — these are the composition atoms behind the patterns):

- double-rule-ornament · inverse-tile · paper-tile · rule-4px · mark-pill · delta-chip · masthead-chrome · ornament-numeral-panel

## §I Page-level CSS

```css
/* ── Preset-native typography vars (loaded via preset-meta.chromeFonts.googleFontsHref).
 * These let the doc chrome render in Bodoni Moda + Manrope + JetBrains Mono regardless
 * of brand DNA. The §6 component preview, §M motifs grid, and §T type-role atlas
 * also read these via .preset-native-scope.
 *
 * Emerald Editorial has no script face — the script slot points at Bodoni Moda
 * because the preset refuses a third face (italics are loaded but dormant per
 * design.md). The display fallback chain ends in heavy contemporary serifs
 * (Playfair / DM Serif / Georgia) so the playbill voice survives offline. */
:root {
  --f-disp-native:
    "Bodoni Moda", "Playfair Display", "DM Serif Display", Georgia, "Times New Roman", serif;
  --f-body-native:
    "Manrope", "Inter", "IBM Plex Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --f-script-native:
    "Bodoni Moda", "Playfair Display", "DM Serif Display", Georgia, "Times New Roman", serif;
  --f-mono-native:
    "JetBrains Mono", "IBM Plex Mono", "Space Mono", "Menlo", ui-monospace, monospace;
}

/* .preset-native-scope: re-bind brand DNA font tokens to preset-native families.
 * Wraps §6 component previews, §M motif demos, and §T type-role atlas so
 * var(--font-*) resolves to Bodoni Moda / Manrope / JetBrains Mono regardless of
 * brand DNA. Paste-ready component source is untouched — Phase 4b still grep +
 * paste the original `var(--font-display)` tokens, which resolve to brand DNA at
 * scene-render time. */
.preset-native-scope {
  --font-display: var(--f-disp-native);
  --font-body: var(--f-body-native);
  --font-script: var(--f-script-native);
  --font-mono: var(--f-mono-native);
}

/* design.html itself reads as the preset: paper-stock canvas, ink rules,
   no radius, Bodoni-style heads. The chunks/* extracts are unaffected. */

body {
  background: var(--canvas);
  color: var(--ink);
  font-family: var(--f-body-native);
}

h1,
h2,
h3 {
  font-family: var(--f-disp-native);
  font-weight: 900;
  letter-spacing: -0.015em;
  line-height: 0.95;
}

hr,
.ds-section + .ds-section {
  border: 0;
  border-top: 4px solid var(--ink);
}

.ds-card,
.ds-section,
pre.ds-code {
  border-radius: 0 !important;
  box-shadow: none !important;
}

.ds-eyebrow,
.ds-label {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 700;
}

/* ── §M Motifs grid: atomic gestures.
 * Emerald Editorial is reductive — only 6 motifs. Cards may declare a surface
 * (canvas / ink) to demonstrate the gesture against its native bg. */
.ds-motif-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}
.ds-motif {
  grid-column: span 4;
  min-height: 280px;
  padding: 28px;
  border: 4px solid var(--ink);
  border-radius: 0;
  background: var(--canvas);
  color: var(--ink);
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
  border-color: var(--canvas);
}
.ds-motif-h {
  margin: 0;
  font-family: var(--f-disp-native);
  font-weight: 900;
  font-size: clamp(22px, 2.4vw, 36px);
  line-height: 1;
  letter-spacing: -0.015em;
  text-transform: none;
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
  color: color-mix(in srgb, var(--ink) 70%, transparent);
  max-width: 30ch;
}
.ds-motif.ds-motif-surface-ink .ds-motif-desc {
  color: color-mix(in srgb, var(--canvas) 80%, transparent);
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
  color: color-mix(in srgb, var(--ink) 45%, transparent);
}
.ds-motif.ds-motif-surface-ink .ds-motif-id {
  color: color-mix(in srgb, var(--canvas) 60%, transparent);
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

/* ── §T Type-role atlas. Container = strict-rectangle ink-bordered card.
 * Each .t-trole-* class encodes the role's family / size / weight / leading /
 * tracking / case / decoration. Family selectors use var(--font-*) tokens so
 * the atlas renders in BRAND DNA fonts; only the recipe is preset-declared.
 * Single-column padding-only rows (no row-grid splits) per the spec. */
.ds-trole-box {
  display: flex;
  flex-direction: column;
  border: 4px solid var(--ink);
  border-radius: 0;
  background: var(--canvas);
  overflow: hidden;
  margin-top: 24px;
}
.ds-trole-row {
  padding: 28px 32px;
  border-bottom: 4px solid var(--ink);
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

/* ── Type-role samples. var(--font-display/body/mono) resolves to brand DNA;
 * color decisions follow Emerald Editorial's printed-ink discipline — navy ink
 * on emerald canvas, with the inverse-tile flip for jumbo numerals. */
.t-trole-numeral-jumbo {
  display: inline-block;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(160px, 24vw, 460px);
  line-height: 0.9;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: var(--canvas);
  background: var(--ink);
  padding: 40px 56px;
}
.t-trole-display-section {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(96px, 12vw, 200px);
  line-height: 0.9;
  letter-spacing: -0.015em;
  color: var(--ink);
}
.t-trole-display-cover {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(96px, 11vw, 184px);
  line-height: 0.92;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-display {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(72px, 8.5vw, 130px);
  line-height: 0.96;
  letter-spacing: -0.015em;
  color: var(--ink);
}
.t-trole-headline {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(56px, 6vw, 104px);
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--ink);
}
.t-trole-ornament-word {
  display: inline-block;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(48px, 5.5vw, 84px);
  line-height: 1;
  letter-spacing: 0.02em;
  padding: 0 6px;
  color: var(--ink);
}
.t-trole-kpi-figure {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(96px, 11vw, 144px);
  line-height: 0.9;
  letter-spacing: -0.03em;
  color: var(--canvas);
  background: var(--ink);
  padding: 28px 40px;
  display: inline-block;
}
.t-trole-kpi-figure .u {
  font-size: 0.42em;
  margin-left: 4px;
  font-weight: 800;
}
.t-trole-stat-figure {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(64px, 7vw, 92px);
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--ink);
}
.t-trole-stat-figure .u {
  font-size: 0.52em;
  margin-left: 2px;
}
.t-trole-title-card {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(32px, 4vw, 64px);
  line-height: 1.05;
  letter-spacing: -0.005em;
  color: var(--ink);
}
.t-trole-eyebrow {
  font-family: var(--font-body);
  font-weight: 800;
  font-size: clamp(20px, 1.8vw, 28px);
  line-height: 1.2;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-label {
  font-family: var(--font-body);
  font-weight: 700;
  font-size: clamp(18px, 1.6vw, 26px);
  line-height: 1.2;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-tag {
  display: inline-block;
  font-family: var(--font-body);
  font-weight: 800;
  font-size: clamp(18px, 1.5vw, 24px);
  line-height: 1;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: var(--ink);
  color: var(--canvas);
  padding: 10px 22px;
}
.t-trole-body-lg {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: clamp(20px, 1.8vw, 28px);
  line-height: 1.5;
  color: var(--ink);
  max-width: 60ch;
  margin: 0;
}
.t-trole-body {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: clamp(18px, 1.6vw, 26px);
  line-height: 1.5;
  color: var(--ink);
  max-width: 60ch;
  margin: 0;
}
.t-trole-caption {
  font-family: var(--font-body);
  font-weight: 700;
  font-size: clamp(18px, 1.5vw, 24px);
  line-height: 1.35;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-delta-pill {
  display: inline-block;
  font-family: var(--font-body);
  font-weight: 800;
  font-size: clamp(18px, 1.5vw, 24px);
  line-height: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: var(--canvas);
  color: var(--ink);
  padding: 6px 16px;
  border: 2px solid var(--ink);
}
```
