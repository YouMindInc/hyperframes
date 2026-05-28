```preset-meta
{
  "name": "editorial-forest",
  "label": "Editorial Forest",
  "fingerprint": {
    "voice": "literary-quarterly",
    "type": "serif-500-with-opsz",
    "chrome": "mono-uppercase-tracked",
    "depth": "flat-paper-no-shadow",
    "palette": "tri-tone-forest-pink-cream",
    "motion": "quiet-committed"
  },
  "match_signals": [
    { "kind": "serif_display", "weight": 0.35 },
    { "kind": "minimal_decoration", "weight": 0.2 },
    { "kind": "low_saturation", "weight": 0.15 },
    { "kind": "medium_solid_border", "weight": 0.15 }
  ],
  "best_for": ["warm unhurried product stories", "research recaps", "studio updates", "literary brands", "quiet annual reports"],
  "avoid_for": ["urgent sales-driven registers", "punchy promo", "high-energy launches", "consumer hype"],
  "chromeFonts": {
    "googleFontsHref": "https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&family=JetBrains+Mono:wght@400;500;700&display=swap",
    "display": "Source Serif 4",
    "body": "Source Serif 4",
    "script": "Source Serif 4",
    "mono": "JetBrains Mono"
  }
}
```

> `chromeFonts` makes the design.html doc chrome (title-card, section heads, h2/h3, lede paragraphs, eyebrows) render in the preset's NATIVE typography — Source Serif 4 (opsz axis engaged) + JetBrains Mono — instead of the brand DNA fonts. Editorial Forest is a two-face system: Source Serif 4 carries every editorial moment (display, body, even the script slot, because the preset refuses a third face); JetBrains Mono carries chrome only. The brand fonts still apply to §6 component code (paste-ready for Phase 4b). §M motifs grid and §T type-role atlas use `.preset-native-scope` so var(--font-display/body/script/mono) re-resolves to these native families for the live preview.

## §A Director's intent

Editorial Forest reads like a Penguin classic or a quiet annual report — a serif voice committed to one face (Source Serif 4 at weight 500, with the optical-size axis engaged) and a mono chrome that frames every page (JetBrains Mono UPPERCASE with 0.14em–0.18em tracking). Depth is flat: no drop shadows, no glows, no gradients, ever. Elevation is communicated by color-block contrast, 2px hairline rules, and the difference between a filled tile and a bordered one. The palette is a tight tri-tone — deep forest green, dusty rose pink, oat cream paper — and the brand colors map onto those roles via `--brand-primary` / `--brand-secondary` / `--canvas`. Every scene carries a topbar (mono label + monogram or counter) as the editorial spine. Motion is quiet and committed: nothing bounces, nothing snaps; entries glide, emphasis settles, ambient layers breathe. Best for: warm, unhurried product stories, research recaps, studio updates. Avoid for: urgent, sales-driven, or punchy registers — the rhythm is intentionally slow. **Class prefix: `ef-`.**

## §B Decoration tokens

```css
/* Editorial Forest: flat, paper-based. No shadows. Rules + color blocks only. */
--ef-rule-weight: 2px;
--ef-rule-weight-card: 2.5px;
--ef-radius-tile: 6px;
--ef-radius-step: 8px;
--ef-radius-bar: 3px 3px 0 0;
--ef-radius-swatch: 2px;
--ef-monogram-size: 130px;
--ef-pad-default: 96px 120px;
--ef-pad-wide: 100px 140px;
--ef-pad-statement: 130px 160px;
--ef-gap-grid: 1.5vw;
--ef-gap-stack: 1.6vw;
--ef-track-label: 0.18em;
--ef-track-caption: 0.14em;
--ef-track-axis: 0.08em;

/* Brand-aware palette derivatives (no raw hex — all roles come from brand DNA) */
--ef-green-deep: color-mix(in srgb, var(--brand-primary) 88%, #000 12%);
--ef-green-lite: color-mix(in srgb, var(--brand-primary) 78%, #fff 22%);
--ef-pink-deep: color-mix(in srgb, var(--brand-secondary) 85%, #000 15%);
--ef-cream-2: color-mix(in srgb, var(--canvas) 92%, var(--brand-primary) 8%);
--ef-ink-soft: color-mix(in srgb, var(--ink) 92%, transparent);

/* Region-accent rule color (used by .ef-rule-thin) — green on cream, pink on green */
--ef-rule-accent: var(--brand-primary);
```

## §D Font pairing fallback

- **display**: `'Source Serif 4'` · `'Source Serif Pro'` · `'Fraunces'` · `'Spectral'` wght 500
- **body**: `'Source Serif 4'` · `'Source Serif Pro'` · `'Spectral'` · `'Newsreader'` wght 400
- **mono**: `'JetBrains Mono'` · `'IBM Plex Mono'` · `'Space Mono'` wght 500

## §T Type-role atlas (Phase 4b reads this to size text correctly)

Each entry is a **named type role** with concrete render parameters at 1920×1080 — family token, px range, weight, leading, tracking, case. Phase 4b scene workers may cite roles by `id` ("use a `stat-figure` here"); the brand DNA fonts plug in automatically via `var(--font-*)` tokens. This is the same atlas Editorial Forest ships in its Typography section, ported as machine-readable JSON.

The atlas is the **sole authoring source** for non-component text. If a scene needs a `display-hero` numeral that isn't covered by §6 components, the worker reads role `display-hero` here and writes inline CSS from these values. Do NOT invent ad-hoc sizes — Editorial Forest's identity collapses if the display ladder (220 / 140 / 96 / 84 / 80 / 68 / 56) is broken, or if serif body drifts above weight 400.

```type-roles
[
  {
    "id": "display-hero",
    "family": "display",
    "purpose": "cover-scale / closing-scale headline — Source Serif 4 at 500, opsz engaged",
    "px_min": 168, "px_max": 220, "weight": 500, "leading": "0.92", "tracking": "-0.02em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-display-hero\">{BRAND_NAME}</div>"
  },
  {
    "id": "display",
    "family": "display",
    "purpose": "pull-quote / big-idea statement (140px display tier)",
    "px_min": 112, "px_max": 140, "weight": 500, "leading": "1.02", "tracking": "-0.02em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-display\">A confident sentence — set in serif.</div>"
  },
  {
    "id": "headline-xl",
    "family": "display",
    "purpose": "primary section headline on cream surface",
    "px_min": 76, "px_max": 96, "weight": 500, "leading": "0.96", "tracking": "-0.02em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-headline-xl\">Section title</div>"
  },
  {
    "id": "headline",
    "family": "display",
    "purpose": "primary section headline on brand-primary (green) surface",
    "px_min": 68, "px_max": 84, "weight": 500, "leading": "1.0", "tracking": "-0.02em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-headline\">Section title</div>"
  },
  {
    "id": "stat-figure",
    "family": "display",
    "purpose": "KPI numeral — Source Serif 4 500 at hero scale, opsz engaged",
    "px_min": 168, "px_max": 220, "weight": 500, "leading": "0.92", "tracking": "-0.03em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-stat-figure\">63<span class=\"t-trole-stat-figure-unit\">%</span></div>"
  },
  {
    "id": "title-card",
    "family": "display",
    "purpose": "title inside a step tile / framework card",
    "px_min": 56, "px_max": 68, "weight": 500, "leading": "0.96", "tracking": "-0.01em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-title-card\">Step title</div>"
  },
  {
    "id": "title-card-sm",
    "family": "display",
    "purpose": "title inside a standard topic tile",
    "px_min": 44, "px_max": 56, "weight": 500, "leading": "0.98", "tracking": "-0.01em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-title-card-sm\">Topic title</div>"
  },
  {
    "id": "name",
    "family": "display",
    "purpose": "personal name in an attribution row (the only weight-600 moment)",
    "px_min": 36, "px_max": 44, "weight": 600, "leading": "1.0", "tracking": "-0.01em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-name\">A. Surname</div>"
  },
  {
    "id": "body-lg",
    "family": "body",
    "purpose": "primary body paragraph in a summary / stat description (weight 400, never 500)",
    "px_min": 26, "px_max": 32, "weight": 400, "leading": "1.32", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body-lg\">A lead paragraph carries the system's voice — serif weight 400, generous line-height, never above 32px.</p>"
  },
  {
    "id": "body",
    "family": "body",
    "purpose": "standard body paragraph",
    "px_min": 24, "px_max": 30, "weight": 400, "leading": "1.38", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body\">Body holds at 24-30px. Weight 400 — the weight drop from headline to body is the system's reading rhythm.</p>"
  },
  {
    "id": "body-card",
    "family": "body",
    "purpose": "body paragraph inside a card or tile",
    "px_min": 22, "px_max": 26, "weight": 400, "leading": "1.34", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body-card\">Body inside a tile sits at 22-26px so it doesn't compete with the title.</p>"
  },
  {
    "id": "label",
    "family": "mono",
    "purpose": "topbar eyebrow / section label — JetBrains Mono 500 uppercase, 0.18em tracking",
    "px_min": 22, "px_max": 26, "weight": 500, "leading": "1.3", "tracking": "0.18em", "case": "upper",
    "sample_html": "<div class=\"t-trole-label\">Vol. 01 — Product note</div>"
  },
  {
    "id": "label-tight",
    "family": "mono",
    "purpose": "caption row / foot line / tile ordinal — 0.14em tracking",
    "px_min": 22, "px_max": 26, "weight": 500, "leading": "1.3", "tracking": "0.14em", "case": "upper",
    "sample_html": "<div class=\"t-trole-label-tight\">Section meta · Issue 03</div>"
  },
  {
    "id": "caption-mono",
    "family": "mono",
    "purpose": "tile foot / kpi tag / meta-dl term",
    "px_min": 20, "px_max": 24, "weight": 500, "leading": "1.3", "tracking": "0.14em", "case": "upper",
    "sample_html": "<div class=\"t-trole-caption-mono\">— printed in this issue —</div>"
  },
  {
    "id": "axis-mono",
    "family": "mono",
    "purpose": "chart axis tick / numeric axis label (tighter tracking than label)",
    "px_min": 22, "px_max": 26, "weight": 500, "leading": "1.3", "tracking": "0.08em", "case": "upper",
    "sample_html": "<div class=\"t-trole-axis-mono\">2026 · Q1</div>"
  }
]
```

The atlas omits the monogram circle (a §M motif, not a text role) and the footline layout (structural, declared in §H).

## §E Motion (GSAP consts — REPLACES site ease)

```js
// Editorial Forest motion: quiet, committed, unhurried.
// The system reads as paper-on-projector; motion must match that register.
const EASE = {
  entry: "power3.out", // glide in, no overshoot — a page settling onto the desk
  emphasis: "expo.out", // decisive but smooth — a numeral landing
  exit: "power2.in", // quiet leave, no snap
  drift: "sine.inOut", // ambient breath for the monogram circle / hairline rule
};

const DUR = {
  snap: 0.18, // mono labels, topbar entry, hairline rule reveal
  med: 0.5, // serif headline mass-in, tile fill-up
  slow: 0.9, // hero display headline, stat numeral count-up
};

// RULE: never use back/elastic/bounce — overshoot breaks the editorial register
// RULE: do not animate box-shadow (system is shadow-free; tweening shadow adds shadow)
// RULE: serif headlines reveal by mass-in (opacity + y: 12px → 0), not by char/word stagger
// RULE: mono labels enter via clip-path reveal (left-to-right wipe) at DUR.snap
// RULE: hairline rules draw left-to-right via scaleX 0→1 with transform-origin: left
// RULE: monogram circle uses EASE.drift for a slow 4s breath (scale 1 → 1.03 → 1, loop)
// RULE: stat numerals count-up with EASE.emphasis over DUR.slow; no character-stagger
```

### §E.5 Motion choreography

- **Allowed primitives**: opacity fade-up (y: 12–20px), clip-path wipe (mono labels, hairline rules), scale-breath (monogram only), numeric count-up (stat figures).
- **Forbidden gestures**: tilt/rotate (the page is paper, not a card), bounce/elastic, snap-in with overshoot, char-by-char letter scrambles, color-shift on entry (the palette is committed; entries don't recolor).
- **Transition defaults**: scenes cross-fade at DUR.med with no spatial motion — the page changes, the camera doesn't. Only exception: cover → first content scene may use a 1.2s vertical lift on the hero headline (translateY -8px).
- **Type-in-motion**: serif display headlines enter as a single block (opacity 0 → 1, y: 16 → 0) at DUR.slow with EASE.entry. Mono labels enter at DUR.snap as a left-to-right wipe (`clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)`). Body paragraphs enter at DUR.med, simple opacity, no y-offset.
- **Stagger budget**: stagger between topbar elements is 0.04s; between tile grid items is 0.08s; between KPI row items is 0.15s. Never stagger characters within a word.

## §G Voice transform recipe

1. Strip filler ("really", "actually", "very") but keep articles ("the", "a") — editorial voice keeps sentence flow.
2. Prefer noun-phrase headlines over verb-led clauses; end with a period or em-dash, never an exclamation.
3. For mono labels (eyebrow / kicker / foot / caption): UPPERCASE, max 4 words, no terminal punctuation, use `·` (middle dot) or `&middot;` between meta items.
4. For serif display headlines: sentence case, drop terminal period when ≤ 8 words.
5. Use em-dash `—` for editorial pause, not double hyphens.
6. Brand name belongs in the mono topbar label or footline — never in the display headline. The headline carries the idea; the chrome carries the byline.

**Example:**

- IN: `Acme is a really fast way for teams to ship products together in real time, with AI in the loop.`
- OUT (display headline, serif sentence case): `Ship faster — together, with AI in the loop`
- OUT (mono topbar label): `ACME &middot; PRODUCT NOTE 01`
- OUT (mono footline): `ACME 2026 &middot; PRESENTED BY THE STUDIO`

## §H Scene composition hints

- **One subject per scene.** Cramming two competing content blocks reads as broken. If you have two ideas, split the scene.
- **Surface alternation.** Pick a single dominant surface per scene from { `var(--canvas)`, `var(--brand-primary)`, `var(--brand-secondary)` }. Two surface colors per scene maximum; three is loud. Default: `var(--canvas)` for content-heavy scenes, `var(--brand-primary)` for cover / statement / KPI / summary.
- **Brand-color role contract.**
  - On `var(--canvas)` surface: headline color = `var(--brand-primary)`; body = `var(--ink)`; mono label = `var(--brand-primary)`.
  - On `var(--brand-primary)` surface: primary headline = `var(--canvas)`; hero-scale headline = `var(--brand-secondary)`; body = `var(--canvas)`; mono label = `var(--brand-secondary)`.
  - On `var(--brand-secondary)` surface: headline = `var(--ef-green-deep)`; body = `var(--ef-green-deep)`; mono label = `var(--ef-green-deep)`.
- **Topbar is the spine.** Every scene carries a topbar at the top edge (mono label on the left, monogram or counter on the right). Without it, the scene loses its editorial anchor.
- **Footline is reserved.** Cover, statement, KPI, and summary scenes get a footline; routine content scenes don't.
- **Padding ladder.** Use `--ef-pad-default` (96px 120px) for most scenes; `--ef-pad-wide` (100px 140px) for cover / summary; `--ef-pad-statement` (130px 160px) for the pull-quote moment.
- **Hairline rules.** 2px solid in the region's accent color. Section separators above KPI rows and meta-dls always use a hairline. Never 1px (reads web-app), never 3px+ (reads poster).
- **Card radii.** 6px for topic tiles, 8px for step tiles, 50% for the monogram circle. Do not introduce a fourth radius.
- **Display type ladder.** Hero / cover / closing = 220px serif. Pull-quote = 140px serif. Primary section headline = 96px on cream, 84px on green. Stat figure = 220px (with 110px unit). Card title = 56–84px depending on tile prominence. Body = 26–32px serif weight 400. Never invent a size between rungs.
- **Forbidden shapes.** No drop shadow, no inner shadow, no gradient surface, no glass blur, no italics, no underline. Emphasis is communicated through size, color, and the negative space around the subject.

## §M Atomic motifs (gestures the plan agent can reference)

Each motif is a **single reusable gesture** that lives inside a larger pattern. Patterns compose motifs; motifs do not compose anything. Editorial Forest is sparse by design — five gestures qualify as atomic. Adding more would dilute the quiet editorial register.

```motifs
[
  {
    "id": "topbar-spine",
    "label": "Topbar spine",
    "role": "editorial-chrome",
    "surface_safe": ["cream", "green", "pink"],
    "description": "Mono UPPERCASE label on the left (0.18em tracking), monogram circle or counter on the right, separated by full-bleed flex space. Sits at the top edge of every scene — the editorial spine. Without it, a scene loses its register.",
    "wide": true,
    "demo": "<div class=\"ef-motif-topbar\"><span class=\"ef-motif-topbar-label\">Vol. 01 — Product note</span><span class=\"ef-motif-topbar-mono\">EF · 01 / 06</span></div>",
    "css": ".ef-motif-topbar{display:flex;justify-content:space-between;align-items:baseline;padding:24px 32px;border-bottom:var(--ef-rule-weight) solid var(--brand-primary)}.ef-motif-topbar-label{font-family:var(--f-mono-native);font-weight:500;font-size:clamp(14px,1.1vw,18px);letter-spacing:.18em;text-transform:uppercase;color:var(--brand-primary)}.ef-motif-topbar-mono{font-family:var(--f-mono-native);font-weight:500;font-size:clamp(14px,1.1vw,18px);letter-spacing:.14em;text-transform:uppercase;color:var(--brand-primary)}"
  },
  {
    "id": "monogram-circle",
    "label": "Monogram circle",
    "role": "identity-stamp",
    "surface_safe": ["cream", "green"],
    "description": "130px outlined circle with a 2px brand-secondary (pink) border, holding a 2-3 char JetBrains Mono monogram. Reserved for cover + summary scenes — using it on every scene dilutes the stamp.",
    "demo": "<div class=\"ef-motif-monogram\">EF</div>",
    "css": ".ef-motif-monogram{display:inline-flex;align-items:center;justify-content:center;width:clamp(72px,9vw,130px);height:clamp(72px,9vw,130px);border-radius:50%;border:2px solid var(--brand-secondary);font-family:var(--f-mono-native);font-weight:500;font-size:clamp(16px,1.5vw,28px);letter-spacing:.1em;text-transform:uppercase;color:var(--brand-primary)}"
  },
  {
    "id": "hairline-rule",
    "label": "Hairline rule",
    "role": "section-separator",
    "surface_safe": ["cream", "green", "pink"],
    "description": "2px solid rule in the region's accent (brand-primary on cream, brand-secondary on green, deep-green on pink). The system's universal separator above KPI rows, summary grids, meta-dls. Never 1px (reads web-app), never 3px+ (reads poster).",
    "wide": true,
    "demo": "<div class=\"ef-motif-rule-wrap\"><div class=\"ef-motif-rule-cap\">Section above</div><div class=\"ef-motif-rule\"></div><div class=\"ef-motif-rule-cap\">Section below</div></div>",
    "css": ".ef-motif-rule-wrap{display:flex;flex-direction:column;gap:12px;width:100%;padding:0 8px}.ef-motif-rule{height:var(--ef-rule-weight);background:var(--brand-primary);width:100%}.ef-motif-rule-cap{font-family:var(--f-mono-native);font-weight:500;font-size:clamp(11px,.9vw,14px);letter-spacing:.14em;text-transform:uppercase;color:var(--brand-primary);opacity:.7}"
  },
  {
    "id": "tile-rotation",
    "label": "Tile rotation",
    "role": "fill-vs-bordered",
    "surface_safe": ["cream"],
    "description": "Topic-tile grid alternates fills — solid green, solid pink, green-lite, cream-2-with-green-border. Mixing 3 of these 4 in one grid is the system's variation language. 6px radius; never sharp, never plush.",
    "wide": true,
    "demo": "<div class=\"ef-motif-tiles\"><div class=\"ef-motif-tile ef-motif-tile-green\">01</div><div class=\"ef-motif-tile ef-motif-tile-pink\">02</div><div class=\"ef-motif-tile ef-motif-tile-cream\">03</div></div>",
    "css": ".ef-motif-tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;width:100%}.ef-motif-tile{border-radius:var(--ef-radius-tile);padding:24px 20px;font-family:var(--f-mono-native);font-weight:500;font-size:clamp(14px,1.2vw,20px);letter-spacing:.14em;text-transform:uppercase;min-height:96px;display:flex;align-items:flex-end}.ef-motif-tile-green{background:var(--brand-primary);color:var(--canvas)}.ef-motif-tile-pink{background:var(--brand-secondary);color:var(--ef-green-deep)}.ef-motif-tile-cream{background:var(--ef-cream-2);border:var(--ef-rule-weight) solid var(--brand-primary);color:var(--brand-primary)}"
  },
  {
    "id": "stat-mass",
    "label": "Stat mass",
    "role": "kpi-numeral",
    "surface_safe": ["cream", "green"],
    "description": "220px Source Serif 4 weight 500 numeral with an optional 110px unit suffix, sat above a mono caption tag. The biggest serif moment in the system — opsz axis engages, letterforms thicken automatically. Reserve for the single KPI beat per video.",
    "demo": "<div class=\"ef-motif-stat\"><span class=\"ef-motif-stat-tag\">— growth this year</span><span class=\"ef-motif-stat-big\">63<span class=\"ef-motif-stat-unit\">%</span></span></div>",
    "css": ".ef-motif-stat{display:flex;flex-direction:column;gap:8px}.ef-motif-stat-tag{font-family:var(--f-mono-native);font-weight:500;font-size:clamp(12px,1vw,16px);letter-spacing:.14em;text-transform:uppercase;color:var(--brand-primary)}.ef-motif-stat-big{font-family:var(--f-disp-native);font-weight:500;font-size:clamp(80px,10vw,160px);line-height:.92;letter-spacing:-.03em;color:var(--brand-primary)}.ef-motif-stat-unit{font-family:var(--f-disp-native);font-weight:500;font-size:.5em;line-height:.92}"
  },
  {
    "id": "meta-dl",
    "label": "Meta definition list",
    "role": "credits-row",
    "surface_safe": ["cream", "green"],
    "description": "Three-column dt/dd grid with a 2px brand-primary top rule. Mono uppercase term (0.14em tracking) above a serif weight-500 value. Used as a credits / specs row at the bottom of two-column scenes.",
    "wide": true,
    "demo": "<dl class=\"ef-motif-dl\"><div><dt>Issue</dt><dd>Vol. 01</dd></div><div><dt>Released</dt><dd>May 2026</dd></div><div><dt>Pages</dt><dd>96</dd></div></dl>",
    "css": ".ef-motif-dl{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;border-top:var(--ef-rule-weight) solid var(--brand-primary);padding-top:16px;margin:0}.ef-motif-dl div{display:flex;flex-direction:column;gap:6px}.ef-motif-dl dt{font-family:var(--f-mono-native);font-weight:500;font-size:clamp(11px,.9vw,14px);letter-spacing:.14em;text-transform:uppercase;color:var(--brand-primary)}.ef-motif-dl dd{font-family:var(--f-disp-native);font-weight:500;font-size:clamp(20px,1.8vw,32px);line-height:1;letter-spacing:-.01em;color:var(--ink);margin:0}"
  }
]
```

The `motifs` JSON block above is the SOLE source of truth. build-design.mjs reads it to render §M cards in design.html. The Phase 3 plan agent and Phase 4b scene worker may cite motifs by `id` when annotating which gesture a scene relies on.

**Materials lexicon** (informational — composition atoms behind the patterns):

- topbar-spine · monogram-circle · hairline-rule · tile-rotation · stat-mass · meta-dl · footline-row · bar-chart · legend-row

## §I Page-level CSS

```css
/* ── Preset-native typography vars (loaded via preset-meta.chromeFonts.googleFontsHref).
 * These let the doc chrome render in Source Serif 4 (opsz engaged) + JetBrains Mono
 * regardless of which brand DNA the preset is applied to. The §6 component preview,
 * §M motifs grid, and §T type-role atlas also read these via .preset-native-scope.
 *
 * Editorial Forest is two-face: Source Serif 4 carries every editorial moment;
 * JetBrains Mono carries chrome only. The script slot points back at Source Serif 4
 * because the preset refuses a third face. Fallbacks end in Georgia / Menlo so the
 * register survives even if the Google fonts fail. */
:root {
  --f-disp-native:
    "Source Serif 4", "Source Serif Pro", "Fraunces", "Spectral", "Newsreader", Georgia, serif;
  --f-body-native: "Source Serif 4", "Source Serif Pro", "Spectral", "Newsreader", Georgia, serif;
  --f-script-native: "Source Serif 4", "Source Serif Pro", "Spectral", "Newsreader", Georgia, serif;
  --f-mono-native:
    "JetBrains Mono", "IBM Plex Mono", "Space Mono", "Menlo", ui-monospace, monospace;
}

/* .preset-native-scope: re-bind brand DNA font tokens to preset-native families.
 * Wraps §6 component previews, §M motif demos, and §T type-role atlas so
 * var(--font-*) resolves to Source Serif 4 / JetBrains Mono regardless of the
 * brand DNA tokens emitted in :root. The paste-ready component source is
 * untouched — Phase 4b still grep + paste the original `var(--font-display)`
 * tokens, which resolve to brand DNA at scene-render time. */
.preset-native-scope {
  --font-display: var(--f-disp-native);
  --font-body: var(--f-body-native);
  --font-script: var(--f-script-native);
  --font-mono: var(--f-mono-native);
}

/* design.html itself reads as an editorial spread: cream paper, serif body, mono chrome.
   These styles never reach exported chunks — they style the design preview only. */
body {
  background: #efe7d4;
  color: #1a1a17;
  font-family: "Source Serif 4", "Source Serif Pro", Georgia, serif;
}
h1,
h2,
h3,
h4 {
  font-family: "Source Serif 4", "Source Serif Pro", Georgia, serif;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: #2e4a2a;
}
code,
pre,
.ds-code {
  font-family: "JetBrains Mono", ui-monospace, Menlo, monospace;
  font-size: 13px;
}
.ds-section {
  border-top: 2px solid #2e4a2a;
  padding-top: 28px;
  margin-top: 36px;
}
.ds-component-preview {
  background: #efe7d4;
  border: 2px solid #2e4a2a;
  border-radius: 6px;
  padding: 24px;
}

/* ── §M Motifs grid: atomic gestures.
 * Editorial Forest is sparse — 6 motifs. Cards may declare a surface
 * (cream / green / pink) to demonstrate the gesture against its native bg.
 * Cards are flat — no shadow, no gradient — matching the system's depth rules. */
.ds-motif-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}
.ds-motif {
  grid-column: span 4;
  min-height: 280px;
  padding: 28px;
  border: 2px solid #2e4a2a;
  border-radius: 6px;
  background: #efe7d4;
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
.ds-motif.ds-motif-surface-cream {
  background: var(--ef-cream-2);
  color: var(--ink);
}
.ds-motif.ds-motif-surface-green {
  background: var(--brand-primary);
  color: var(--canvas);
  border-color: var(--brand-secondary);
}
.ds-motif.ds-motif-surface-pink {
  background: var(--brand-secondary);
  color: var(--ef-green-deep);
  border-color: var(--ef-green-deep);
}
.ds-motif-h {
  margin: 0;
  font-family: var(--f-disp-native);
  font-weight: 500;
  font-size: clamp(22px, 2.2vw, 34px);
  line-height: 1;
  letter-spacing: -0.01em;
  color: #2e4a2a;
}
.ds-motif.ds-motif-surface-green .ds-motif-h {
  color: var(--canvas);
}
.ds-motif.ds-motif-surface-pink .ds-motif-h {
  color: var(--ef-green-deep);
}
.ds-motif-desc {
  margin: 0;
  font-family: var(--f-body-native);
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--ink) 70%, transparent);
  max-width: 30ch;
}
.ds-motif.ds-motif-surface-green .ds-motif-desc {
  color: color-mix(in srgb, var(--canvas) 85%, transparent);
}
.ds-motif.ds-motif-surface-pink .ds-motif-desc {
  color: color-mix(in srgb, var(--ef-green-deep) 80%, transparent);
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
.ds-motif.ds-motif-surface-green .ds-motif-id {
  color: color-mix(in srgb, var(--canvas) 60%, transparent);
}
.ds-motif.ds-motif-surface-pink .ds-motif-id {
  color: color-mix(in srgb, var(--ef-green-deep) 60%, transparent);
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

/* ── §T Type-role atlas. Container = cream-paper card with 2px green border.
 * Each .t-trole-* class encodes the role's family / size / weight / leading /
 * tracking / case. Family selectors use var(--font-*) tokens so the atlas
 * renders in BRAND DNA fonts; only the recipe is preset-declared. Color
 * decisions follow Editorial Forest's role contract — brand-primary headlines
 * on cream, ink body, brand-primary mono chrome. */
.ds-trole-box {
  display: flex;
  flex-direction: column;
  border: 2px solid #2e4a2a;
  border-radius: 6px;
  background: #efe7d4;
  overflow: hidden;
  margin-top: 24px;
}
.ds-trole-row {
  padding: 28px 32px;
  border-bottom: 2px solid color-mix(in srgb, #2e4a2a 22%, transparent);
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
 * Editorial Forest's color contract: brand-primary headlines + mono labels on
 * cream; ink body. Display weight is always 500 (the system's signature),
 * body weight is 400, name is the only weight-600 moment. */
.t-trole-display-hero {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(96px, 14vw, 220px);
  line-height: 0.92;
  letter-spacing: -0.02em;
  color: var(--brand-primary);
}
.t-trole-display {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(72px, 9vw, 140px);
  line-height: 1.02;
  letter-spacing: -0.02em;
  color: var(--brand-primary);
  max-width: 22ch;
}
.t-trole-headline-xl {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(56px, 6vw, 96px);
  line-height: 0.96;
  letter-spacing: -0.02em;
  color: var(--brand-primary);
}
.t-trole-headline {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(48px, 5.4vw, 84px);
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--brand-primary);
}
.t-trole-stat-figure {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(96px, 14vw, 220px);
  line-height: 0.92;
  letter-spacing: -0.03em;
  color: var(--brand-primary);
}
.t-trole-stat-figure-unit {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 0.5em;
  line-height: 0.92;
}
.t-trole-title-card {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(40px, 4.4vw, 68px);
  line-height: 0.96;
  letter-spacing: -0.01em;
  color: var(--brand-primary);
}
.t-trole-title-card-sm {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(32px, 3.6vw, 56px);
  line-height: 0.98;
  letter-spacing: -0.01em;
  color: var(--brand-primary);
}
.t-trole-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(28px, 2.8vw, 44px);
  line-height: 1;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.t-trole-body-lg {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(20px, 2vw, 32px);
  line-height: 1.32;
  color: var(--ink);
  max-width: 44ch;
  margin: 0;
}
.t-trole-body {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(18px, 1.9vw, 30px);
  line-height: 1.38;
  color: var(--ink);
  max-width: 60ch;
  margin: 0;
}
.t-trole-body-card {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(16px, 1.6vw, 26px);
  line-height: 1.34;
  color: var(--ink);
  max-width: 50ch;
  margin: 0;
}
.t-trole-label {
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: clamp(14px, 1.5vw, 26px);
  line-height: 1.3;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-label-tight {
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: clamp(14px, 1.5vw, 26px);
  line-height: 1.3;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-caption-mono {
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: clamp(13px, 1.4vw, 24px);
  line-height: 1.3;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-axis-mono {
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: clamp(14px, 1.5vw, 26px);
  line-height: 1.3;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
```
