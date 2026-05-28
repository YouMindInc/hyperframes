```preset-meta
{
  "name": "stencil-tablet",
  "label": "Stencil & Tablet",
  "fingerprint": {
    "shadow": "none-flat",
    "border": "rounded-tablet",
    "motion": "considered-stamp",
    "density": "filled-tile",
    "contrast": "earthy-saturated",
    "type": "stencil-display + condensed-chrome",
    "palette-mode": "hue-anchored-neutrals + brand-saturated-tiles"
  },
  "match_signals": [
    { "kind": "condensed_display", "weight": 0.3 },
    { "kind": "minimal_decoration", "weight": 0.15 },
    { "kind": "high_sat_accent", "weight": 0.2 },
    { "kind": "hairline_border", "weight": 0.1 }
  ],
  "best_for": ["museum / cultural-institution decks", "art / architecture brands", "longform research", "heritage and craft brands", "manifestos"],
  "avoid_for": ["digital-native polished", "playful pop", "soft consumer SaaS", "fintech / enterprise"],
  "chromeFonts": {
    "googleFontsHref": "https://fonts.googleapis.com/css2?family=Stardos+Stencil:wght@400;700&family=Bowlby+One&family=Barlow+Condensed:wght@500;600;700;800;900&family=Inter:wght@400;500;600&display=swap",
    "display": "Stardos Stencil",
    "body": "Inter",
    "script": "Bowlby One",
    "mono": "Barlow Condensed"
  }
}
```

> `chromeFonts` makes the design.html doc chrome (title-card, section heads, h2/h3, lede paragraphs, eyebrows) render in the preset's NATIVE typography — Stardos Stencil + Inter + Barlow Condensed + Bowlby One — instead of the brand DNA fonts. The `mono` slot binds Barlow Condensed because Stencil & Tablet uses it as the chrome / pill / legend voice (a condensed extra-heavy uppercase grotesque playing the role mono plays elsewhere); the `script` slot binds Bowlby One because the preset reserves that face for the 320px quote-mark glyph and refuses any other handwritten register. The brand fonts still apply to §6 component code (paste-ready for Phase 4b). §M motifs grid and §T type-role atlas use `.preset-native-scope` so var(--font-display/body/mono/script) re-resolves to these native families for the live preview.

## §A Director's intent

West Coast skate-poster meets municipal stencil signage. Stardos Stencil carries every headline and numeral with its characteristic ink-break gaps; Barlow Condensed extra-heavy runs all uppercase chrome, metadata, pills, and legends; Inter handles the small set of sentence-case body paragraphs that exist mostly to caption the loud type above them.

Depth is **flat by design** — no drop shadows, no gradients. Depth comes from saturated color blocks against a warm bone field and from generous 22-26px tablet radii. Cards tile the canvas geometrically; you can identify a slide's structure from across the room because the color blocks ARE the layout.

The system's identity hinges on **warm neutrals** (bone / paper) tinted with brand DNA, not on a fixed palette. The bone and paper anchors are declared as hue-anchor hexes in §B (§8.2 exception) so the archival, kraft-paper register survives any brand color; brand-primary / -secondary / -accent ignite tablets, action-bars, section numerals, and pills as the saturated tile fills.

Type runs **huge and uppercase**: cover hero 220px, section-divider numeral 540px, tablet numerals 220px, stats 160px. Scale is the primary expressive tool, color is secondary, body sentence-case Inter is the supporting cast. Stencil ink-break glyphs are non-negotiable on every headline; Barlow Condensed without ≥0.04em tracking reads as broken.

Motion is **considered and declarative** — stamped, not glided. Headlines arrive with `power2.out` / `expo.out` (no overshoot, no bounce); numerals reveal with stepped emphasis (`steps()`) to feel printed rather than animated. Scene transitions are hard cuts or slow paper-wipe — never crossfade.

**Best for** museum / cultural-institution decks, art / architecture brands, longform research, heritage and craft brands, manifestos — anytime the brief reads "field manual," not "slide deck." **Avoid for** contexts demanding digital-native polish or playful pop — the stencil-cut display commits to a deliberate analog feel.

**Class prefix `stn-`** (4 chars, lowercase-dash). `st-` was rejected as too generic. Every component class is namespaced `stn-*`.

## §B Decoration tokens (merge into design.html `:root`)

Stencil & Tablet declares **structural** tokens here (radii, pixel-tight pads, hairline borders, gap units) and **two hue-anchor hexes** for bone + paper. Color of tile fills, headlines, numerals, and pills flows from site brand DNA — `--brand-primary` / `--brand-secondary` / `--brand-accent` carry the saturated work.

```css
/*
  §8.2 exception: warm-neutral hue anchors.
  The stencil-tablet identity depends on a warm bone field and a slightly-lighter
  paper card surface. Brand DNA's --canvas / --ink alone can't carry this — a
  cool or pure-white --canvas would break the archival, kraft-paper register
  every Stencil & Tablet slide depends on. Mixed with brand colors via
  color-mix(), these anchors keep bone/paper readable as bone/paper regardless
  of brand temperature.
*/
--anchor-bone: #e2dcc9; /* warm cream — default page field */
--anchor-paper: #f4efe0; /* lighter cream — secondary card surface */

/* Bone / paper surfaces, tinted slightly toward the brand so the archival
   neutral inherits site temperature without losing its warmth. */
--surface-bone: color-mix(in srgb, var(--brand-primary) 6%, var(--anchor-bone));
--surface-paper: color-mix(in srgb, var(--brand-primary) 4%, var(--anchor-paper));

/* Card radii — tablet register is non-optional. Square corners break the system. */
--radius-tablet: 26px; /* tablet cards, principles cards, quote panel, CTA panels */
--radius-card: 22px; /* generic cards, action bars, process nodes, matrix table, stats */
--radius-timeline: 18px;
--radius-mark: 14px; /* small lockup square */
--radius-pill: 999px; /* status pills */

/* Gap + pad scale — bone field visible BETWEEN cards is structural. */
--gap-card: 24px; /* standard between cards */
--gap-card-tight: 22px; /* dense grids (5-up process flow) */
--gap-card-loose: 28px; /* breathy two-up / four-up */
--pad-outer: 64px; /* slide left/right inset */
--pad-top: 48px; /* top chrome inset */
--pad-bottom: 36px; /* bottom chrome inset */
--pad-card: 32px; /* standard card interior */
--pad-card-tablet: 38px 32px 32px; /* tablet card — extra top for the numeral */

/* Hairlines + dividers — the matrix is the densest table; hairlines must
   read at 1920×1080 without box-shadow help. */
--rule-hairline: 1.5px solid color-mix(in srgb, var(--ink) 35%, transparent);
--rule-dashed: 1px dashed color-mix(in srgb, var(--ink) 30%, transparent);
--rule-divider: 2px solid var(--ink); /* chart axes, action-bar vertical separator */

/* Stencil tracking presets — Barlow Condensed without tracking reads as broken. */
--track-chrome: 0.04em;
--track-chrome-loose: 0.08em;
--track-eyebrow: 0.14em;
--track-stencil-tight: -0.02em; /* numerals at large scale */
--track-stencil-headline: -0.005em; /* stencil headlines */
```

## §D Font pairing fallback (if brand fonts not on Google Fonts)

Stencil & Tablet forces stencil display + condensed chrome regardless of site DNA — the system's identity is the ink-break stencil glyph and the tall condensed uppercase chrome. Fallbacks below are used only if the primary face fails to load.

- **display**: `'Stardos Stencil'` · `'Allerta Stencil'` · `'Black Ops One'` wght 700
- **body**: `'Inter'` · `'IBM Plex Sans'` · `'Source Sans 3'` wght 400
- **mono**: `'Barlow Condensed'` · `'Oswald'` · `'Archivo Narrow'` wght 800

**Note:** `mono` slot is **deliberately not monospaced** — Stencil & Tablet has no mono role. Barlow Condensed sits in the mono slot because the preset uses it as the chrome / pill / legend voice (a condensed extra-heavy uppercase grotesque), playing the role mono plays in other presets (small labels, technical metadata). Build pipeline reads the third bullet for "small chrome labels"; we hand it Barlow.

## §T Type-role atlas (Phase 4b reads this to size text correctly)

Each entry is a **named type role** with concrete render parameters at 1920×1080 — family token, px range, weight, leading, tracking, case, and any color/border/rotation/suffix decoration. Phase 4b scene workers may cite roles by `id` ("use a `numeral-tablet` here"); the brand DNA fonts plug in automatically via `var(--font-*)` tokens. This is the same atlas Stencil & Tablet ships in its Typography section, ported as machine-readable JSON.

The atlas is the **sole authoring source** for non-component text. If a scene needs a 220px tablet numeral that isn't covered by §6 components, the worker reads role `numeral-tablet` here and writes inline CSS from these values. Do NOT invent ad-hoc sizes — Stencil & Tablet's identity collapses if numerals drop below 160px or if Barlow Condensed runs without ≥0.04em tracking.

```type-roles
[
  {
    "id": "cover-hero",
    "family": "display",
    "purpose": "cover headline at maximum stencil scale — ink-break glyphs carry the system",
    "px_min": 140, "px_max": 220, "weight": 700, "leading": "0.82", "tracking": "-0.015em", "case": "upper",
    "sample_html": "<div class=\"t-trole-cover-hero\">{BRAND_NAME}</div>"
  },
  {
    "id": "numeral-mega",
    "family": "display",
    "purpose": "section-divider numeral — fills half the canvas on dark fields only",
    "px_min": 360, "px_max": 540, "weight": 700, "leading": "0.8", "tracking": "-0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-numeral-mega\">01</div>"
  },
  {
    "id": "numeral-tablet",
    "family": "display",
    "purpose": "primary numeral inside a tablet card — defining feature of the tablet form",
    "px_min": 160, "px_max": 240, "weight": 700, "leading": "0.85", "tracking": "-0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-numeral-tablet\">04</div>"
  },
  {
    "id": "numeral-stat",
    "family": "display",
    "purpose": "statistical numeral with optional Barlow superscript suffix (%, ×, K, M)",
    "px_min": 120, "px_max": 160, "weight": 700, "leading": "0.85", "tracking": "-0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-numeral-stat\">99<sup>%</sup></div>"
  },
  {
    "id": "section-headline",
    "family": "display",
    "purpose": "headline on a section-divider slide (pairs with the 540px numeral)",
    "px_min": 92, "px_max": 120, "weight": 700, "leading": "0.92", "tracking": "-0.005em", "case": "upper",
    "sample_html": "<div class=\"t-trole-section-headline\">Manifesto</div>"
  },
  {
    "id": "page-headline",
    "family": "display",
    "purpose": "standard slide headline (Stardos uppercase, ink-break glyphs)",
    "px_min": 64, "px_max": 92, "weight": 700, "leading": "0.92", "tracking": "-0.01em", "case": "upper",
    "sample_html": "<div class=\"t-trole-page-headline\">Section title</div>"
  },
  {
    "id": "quote-text",
    "family": "display",
    "purpose": "pull-quote body inside a quote panel — paired with the Bowlby quote-mark",
    "px_min": 44, "px_max": 60, "weight": 400, "leading": "1.05", "tracking": "-0.005em", "case": "upper",
    "sample_html": "<div class=\"t-trole-quote-text\">Stamped, signed, framed. The poster is the message.</div>"
  },
  {
    "id": "quote-mark",
    "family": "script",
    "purpose": "single 320px Bowlby One quote glyph beside the quote-text — the only Bowlby use",
    "px_min": 200, "px_max": 320, "weight": 700, "leading": "0.8", "tracking": "0", "case": "upper",
    "sample_html": "<div class=\"t-trole-quote-mark\">“</div>"
  },
  {
    "id": "card-headline",
    "family": "display",
    "purpose": "headline inside an action bar or tablet sub-headline (Stardos uppercase)",
    "px_min": 28, "px_max": 34, "weight": 700, "leading": "1.15", "tracking": "-0.005em", "case": "upper",
    "sample_html": "<div class=\"t-trole-card-headline\">Action bar headline</div>"
  },
  {
    "id": "matrix-row",
    "family": "display",
    "purpose": "matrix row-label cell (small Stardos uppercase, positive tracking for legibility)",
    "px_min": 22, "px_max": 26, "weight": 700, "leading": "1.1", "tracking": "0.01em", "case": "upper",
    "sample_html": "<div class=\"t-trole-matrix-row\">Row label</div>"
  },
  {
    "id": "topbar",
    "family": "mono",
    "purpose": "top chrome label — uppercase Barlow Condensed 800 with generous tracking",
    "px_min": 24, "px_max": 32, "weight": 800, "leading": "1", "tracking": "0.04em", "case": "upper",
    "sample_html": "<div class=\"t-trole-topbar\">Section name · Issue 04</div>"
  },
  {
    "id": "section-eyebrow",
    "family": "mono",
    "purpose": "eyebrow on a section-divider slide (Barlow Condensed 800, tracked 0.14em)",
    "px_min": 18, "px_max": 24, "weight": 800, "leading": "1.2", "tracking": "0.14em", "case": "upper",
    "sample_html": "<div class=\"t-trole-section-eyebrow\">Chapter II — Field manual</div>"
  },
  {
    "id": "footer",
    "family": "mono",
    "purpose": "bottom chrome footer + small meta labels (Barlow Condensed 600, 0.08em)",
    "px_min": 18, "px_max": 22, "weight": 600, "leading": "1", "tracking": "0.08em", "case": "upper",
    "sample_html": "<div class=\"t-trole-footer\">May 2026 · Stencil &amp; Tablet</div>"
  },
  {
    "id": "pill",
    "family": "mono",
    "purpose": "matrix status pill (teal=yes, mustard=partial, magenta=no, paper-bordered=note)",
    "px_min": 16, "px_max": 18, "weight": 700, "leading": "1", "tracking": "0.08em", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-pill\">Partial</span></div>"
  },
  {
    "id": "body-lg",
    "family": "body",
    "purpose": "stand-alone body paragraph (Inter 400 — the only sentence-case voice)",
    "px_min": 20, "px_max": 24, "weight": 400, "leading": "1.4", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body-lg\">A shared canvas for product teams. Edit together, ship together — no more handoff drift.</p>"
  },
  {
    "id": "body",
    "family": "body",
    "purpose": "default body inside tablets and cards (Inter 400, 22px)",
    "px_min": 18, "px_max": 22, "weight": 400, "leading": "1.4", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body\">Inter is the quiet voice — sentence case, never uppercase, captioning the loud stencil above.</p>"
  }
]
```

The atlas omits chrome positions (declared in §B / §H as fixed absolute offsets) and the tablet card pad / radius (a §M motif, not a text role).

## §E Motion (GSAP consts — REPLACES site ease)

```js
const EASE = {
  entry: "power2.out", // stamped arrival — no overshoot, no glide
  emphasis: "expo.out", // declarative, poster-loud — bigger snap on headlines / numerals
  exit: "power2.in", // accelerate off-canvas
  drift: "sine.inOut", // ambient breathing only (paper-grain shimmer if used)
};
const DUR = {
  snap: 0.18, // labels, pills, chrome
  med: 0.5, // headlines, tablets, action bars
  slow: 0.9, // section-divider 540px numeral, quote panel reveal
};
// RULE: never use back / elastic / bounce — the system reads as "printed," not "elastic."
//       overshoot breaks the stencil register.
// RULE: numeral reveal MAY use steps(6) on opacity / counter values (NOT position) to
//       feel stamped rather than tweened. Apply to {NUM}, {KICKER}, and stat numerals.
// RULE: scene transitions are hard cut OR paper-wipe (1 frame max). Crossfade kills
//       the archival register — slides must feel like turning a page, not dissolving.
// RULE: type-in-motion on stencil headlines MUST stagger by word, never by character.
//       Per-character reveal breaks the ink-break glyph integrity.
```

### §E.5 Motion choreography

**Allowed primitives**

- Stamped headline entry: y +24px → 0 + opacity 0 → 1 on `power2.out`, DUR.med. Stagger by word for multi-line stencil headlines.
- Tablet tile-in: scale 0.96 → 1 + opacity, `expo.out`, DUR.med. Stagger 80-120ms across a tile row.
- Numeral stamp: opacity stepped to 1 via `steps(6)` over DUR.med — feels like a stencil being pressed down rather than animated in.
- Pill / chip reveal: opacity + y +8px → 0 on `power2.out`, DUR.snap.
- Action-bar slide-in: x +40px → 0 + opacity, `expo.out`, DUR.med.
- Quote-mark stamp: scale 1.04 → 1 + opacity, `expo.out`, DUR.slow.
- Ambient: paper-grain opacity shimmer 0.04 → 0.06 (sine.inOut, 6s) on bone surfaces only — optional, very subtle.

**Forbidden**

- Crossfade, dissolve, blur transitions between scenes.
- Back / elastic / bounce on any motion (`back.out`, `elastic.out`).
- Per-character reveal on stencil headlines (breaks ink-break glyph integrity).
- Drop-shadow tweens — the system is flat; introducing shadows for motion drama betrays the preset.
- Rotation > 2deg on cards. Tablets sit square; only `--tilt-` decorative micro-rotations are permitted on stamp-style elements (action-bar tag, date-mark).
- Glow / bloom / filter blur on any element.

**Stagger budget**

180-220ms between elements — slower than 8-bit-orbit (80-120ms), faster than purely-editorial (240-280ms). The "considered" register wants you to feel each element arrive separately. Total scene-in stagger ≤ 700ms.

**Transition between scenes**

- Default: hard cut paired with a single percussive beat on the cut frame.
- Alternative: paper-wipe — a 1-frame 100%-canvas brand-color flash, then cut. Use sparingly (≤ 1 per 60s video) on section beats.

## §G Voice transform recipe (apply to brand's voice from §1 DNA)

Take the brand's product description / value prop. Transform with:

1. Strip filler words and articles where doing so doesn't break the imperative ("we", "really", "very", "the", "a" when not load-bearing).
2. Hero headlines: 2-5 words, UPPERCASE, broken across 2-3 lines via `<br>` — line breaks are part of the composition.
3. Eyebrows / kickers / chrome labels: UPPERCASE BARLOW CONDENSED with ≥0.04em tracking, terse noun phrases ("ISSUE 04", "PHASE II", "AGENCY × PARTNER").
4. Stat numerals: bare digit + Barlow superscript suffix at 40px — `4M`, `99.9%`, `2.4×`. Never spell the unit.
5. Body paragraphs (Inter): sentence case, declarative, considered. One idea per sentence; never more than three sentences per card.
6. Pill / matrix labels: UPPERCASE single noun or 2-word phrase. Color carries semantic — teal=YES, mustard=PARTIAL, magenta=NO, paper-bordered=NOTE.

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: hero=`TEAMS.<br>DESIGN.<br>TOGETHER.` / eyebrow=`ISSUE 01 · REAL-TIME` / body (Inter)=`A shared canvas for product teams. Edit together, ship together — no more handoff drift.`

## §H Scene composition hints (Phase 4b layout guidance)

**Surface alternation across scenes**

- Default scene: `--surface-bone` field (warm cream, brand-tinted) holding rounded tablets + chrome.
- Dark scene: `var(--ink)` field with bone-colored type. Reserved for agenda-style, section-divider, stats-headline, and quote-panel-containing slides. ≥1 dark scene per 60s video, never two consecutive.
- Light card scene: tablets / process nodes / stats grid on bone field.
- Quote scene: a single saturated-brand-color panel filling most of canvas, Bowlby-style chunky quote-mark beside stencil body.

**Brand color placement (role contract)**

- Brand colors **never appear as body text** (Inter). Only as: tile fills, section-divider numeral, action-bar fill, status pill fills, quote-panel fill, accent rules.
- One scene = **one dominant brand color** carrying the focal tile / section numeral / action bar; the other two brand colors appear only as secondary tile fills in a multi-tile grid, or as small accents (legend swatch, divider rule, em-highlight span inside a stencil headline).
- Suggested role mapping: `--brand-primary` → most-used accent (section dividers, principle cards, cover marks); `--brand-secondary` → cover hero em-highlight + quote-panel fill; `--brand-accent` → cool counterpart (process cards, matrix yes-pills).
- Text-on-fill rule: text **never inverts to pure white**. Light text on dark fills is always `var(--surface-bone)` / `var(--anchor-bone)`, never `#fff`. This is the system's only color inversion.

**Hero text / focal element**

- One big stencil moment per scene. Cover hero 220px, section headline 92-120px, tablet numeral 220px, stat numeral 160px, section-divider mega-numeral 540px.
- The 540px section-divider numeral pattern lives **on dark fields only** and pairs with a 120px stencil headline at bottom-right and a small Barlow eyebrow at top-right.
- Never two hero-tier elements per scene. If a scene needs two "loud" moments, demote one to a tablet numeral.

**Tablet doctrine**

- Tablets ALWAYS carry a numeral above their headline. A tablet without a numeral is a generic card.
- Tablet radius is 22-26px; square corners on cards / action bars / pills break the system.
- Tablets tile flat — never stack. No z-index inside tablet grids. Gap between tablets is 22-28px and the bone field showing through IS the layout.

**Pill convention (matrix only)**

- Inside comparison matrices, status pills follow a fixed convention: teal=yes, mustard=partial, magenta=no, paper-bordered=note.
- Outside matrices, pills are decorative and color is interchangeable.

**Density philosophy**

- Filled and confident. A typical scene covers most of the canvas in color blocks. A scene that feels broken in this system is one that's mostly empty bone — the design needs the blocks to hold its identity.
- Exception: section-divider scene, where a single 540px numeral against `var(--ink)` IS the design and emptiness is intentional.

## §M Atomic motifs (gestures the plan agent can reference)

Each motif is a **single reusable gesture** that lives inside a larger pattern. Patterns compose motifs; motifs do not compose anything. Stencil & Tablet's gestures are non-negotiable signatures — the tablet's numeral above headline, the 540px section numeral on dark, the action-bar's vertical ink rule, the mustard callout, the matrix pill convention, the cover lockup mark.

```motifs
[
  {
    "id": "tablet-numeral",
    "label": "Tablet numeral",
    "role": "tablet-anchor",
    "surface_safe": ["bone", "paper", "brand"],
    "description": "A rounded 22-26px tablet card carrying a 220px Stardos Stencil numeral above an uppercase stencil headline and Inter body. The numeral fills the upper half and IS the tablet's defining feature — a tablet without a numeral is a generic card. Background takes any accent fill; text follows surface rules.",
    "wide": true,
    "demo": "<div class=\"stn-motif-tablet\"><div class=\"stn-motif-tablet-num\">04</div><div class=\"stn-motif-tablet-h\">Stamp the run</div><p class=\"stn-motif-tablet-body\">Inter body sits at the bottom, captioning the loud stencil above.</p></div>",
    "css": ".stn-motif-tablet{background:var(--brand-primary);border-radius:var(--radius-tablet);padding:var(--pad-card-tablet);color:var(--ink);display:flex;flex-direction:column;min-height:280px;overflow:hidden}.stn-motif-tablet-num{font-family:var(--f-disp-native);font-weight:700;font-size:clamp(120px,18vw,220px);line-height:.9;letter-spacing:-0.02em;text-transform:uppercase;color:var(--ink)}.stn-motif-tablet-h{margin-top:auto;font-family:var(--f-disp-native);font-weight:700;font-size:clamp(24px,2.4vw,34px);line-height:1.15;letter-spacing:-0.005em;text-transform:uppercase;color:var(--ink)}.stn-motif-tablet-body{margin:8px 0 0;font-family:var(--f-body-native);font-weight:400;font-size:clamp(16px,1.4vw,22px);line-height:1.4;color:var(--ink);max-width:30ch}"
  },
  {
    "id": "mega-numeral-divider",
    "label": "Mega numeral divider",
    "role": "section-anchor",
    "surface_safe": ["ink"],
    "description": "540px Stardos Stencil numeral filling the left side of a black-field section divider, paired with a Barlow Condensed eyebrow top-right and a 120px stencil headline bottom-right. The numeral IS the layout. Lives ONLY on dark fields — a 540px numeral on bone breaks the section register.",
    "wide": true,
    "demo": "<div class=\"stn-motif-mega\"><div class=\"stn-motif-mega-num\">02</div><div class=\"stn-motif-mega-side\"><div class=\"stn-motif-mega-eye\">Chapter II</div><div class=\"stn-motif-mega-h\">Field manual</div></div></div>",
    "css": ".stn-motif-mega{position:relative;display:grid;grid-template-columns:1fr 1fr;align-items:end;gap:24px;background:var(--ink);color:var(--anchor-bone);padding:48px 32px;border-radius:var(--radius-card);overflow:hidden;min-height:280px}.stn-motif-mega-num{font-family:var(--f-disp-native);font-weight:700;font-size:clamp(160px,28vw,420px);line-height:.8;letter-spacing:-0.02em;text-transform:uppercase;color:var(--brand-primary)}.stn-motif-mega-side{display:flex;flex-direction:column;gap:12px;text-align:right}.stn-motif-mega-eye{font-family:var(--f-mono-native);font-weight:800;font-size:clamp(14px,1.2vw,24px);letter-spacing:.14em;text-transform:uppercase;color:var(--anchor-bone)}.stn-motif-mega-h{font-family:var(--f-disp-native);font-weight:700;font-size:clamp(48px,7vw,120px);line-height:.92;letter-spacing:-0.005em;text-transform:uppercase;color:var(--anchor-bone)}"
  },
  {
    "id": "action-bar",
    "label": "Action bar",
    "role": "callout-strip",
    "surface_safe": ["bone", "paper"],
    "description": "Mustard-filled 22px-rounded callout bar with a left-aligned Barlow Condensed tag, a 2px ink vertical rule separator, and a 34px Stardos stencil headline. Used for important section-opening callouts — overuse degrades the signal.",
    "wide": true,
    "demo": "<div class=\"stn-motif-action\"><span class=\"stn-motif-action-tag\">Issue 04</span><span class=\"stn-motif-action-rule\"></span><span class=\"stn-motif-action-h\">Build the field manual</span></div>",
    "css": ".stn-motif-action{display:inline-flex;align-items:center;gap:24px;background:var(--brand-primary);color:var(--ink);border-radius:var(--radius-card);padding:24px 32px}.stn-motif-action-tag{font-family:var(--f-mono-native);font-weight:800;font-size:clamp(18px,1.6vw,26px);letter-spacing:.08em;text-transform:uppercase;color:var(--ink)}.stn-motif-action-rule{display:inline-block;width:2px;align-self:stretch;background:var(--ink)}.stn-motif-action-h{font-family:var(--f-disp-native);font-weight:700;font-size:clamp(24px,2.6vw,34px);line-height:1.15;letter-spacing:-0.005em;text-transform:uppercase;color:var(--ink)}"
  },
  {
    "id": "status-pill",
    "label": "Status pill",
    "role": "matrix-signal",
    "surface_safe": ["bone", "paper"],
    "description": "Fully rounded (999px) uppercase Barlow Condensed pill with fixed matrix convention: teal=yes (bone text), mustard=partial (ink text), magenta=no (bone text), paper-bordered=note (ink text + 1.5px ink border). The convention earns weight by repeating.",
    "demo": "<div class=\"stn-motif-pills\"><span class=\"stn-motif-pill stn-pill-yes\">Yes</span><span class=\"stn-motif-pill stn-pill-partial\">Partial</span><span class=\"stn-motif-pill stn-pill-no\">No</span><span class=\"stn-motif-pill stn-pill-note\">Note</span></div>",
    "css": ".stn-motif-pills{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.stn-motif-pill{display:inline-block;font-family:var(--f-mono-native);font-weight:700;font-size:clamp(14px,1.1vw,18px);line-height:1;letter-spacing:.08em;text-transform:uppercase;padding:6px 16px;border-radius:var(--radius-pill)}.stn-motif-pill.stn-pill-yes{background:var(--brand-accent,#2D7E73);color:var(--anchor-bone)}.stn-motif-pill.stn-pill-partial{background:var(--brand-primary);color:var(--ink)}.stn-motif-pill.stn-pill-no{background:var(--brand-secondary,#C73B7A);color:var(--anchor-bone)}.stn-motif-pill.stn-pill-note{background:var(--surface-paper);color:var(--ink);border:1.5px solid var(--ink)}"
  },
  {
    "id": "cover-mark",
    "label": "Cover mark",
    "role": "lockup-tile",
    "surface_safe": ["bone", "paper"],
    "description": "Small 56px rounded-square (14px radius) accent tile sitting in the cover lockup beside an uppercase Barlow name + subtitle stack and a Stardos date. Defines the cover-bottom convention — never a logo glyph, always a solid color block.",
    "demo": "<div class=\"stn-motif-lockup\"><span class=\"stn-motif-mark\"></span><div class=\"stn-motif-lockup-stack\"><span class=\"stn-motif-lockup-name\">Stencil Studio</span><span class=\"stn-motif-lockup-sub\">Field manual · No. 04</span></div><span class=\"stn-motif-lockup-date\">MAY 2026</span></div>",
    "css": ".stn-motif-lockup{display:inline-flex;align-items:center;gap:20px}.stn-motif-mark{display:inline-block;width:56px;height:56px;border-radius:var(--radius-mark);background:var(--brand-primary)}.stn-motif-lockup-stack{display:flex;flex-direction:column;gap:2px}.stn-motif-lockup-name{font-family:var(--f-mono-native);font-weight:700;font-size:clamp(20px,1.8vw,30px);letter-spacing:.04em;text-transform:uppercase;color:var(--ink)}.stn-motif-lockup-sub{font-family:var(--f-mono-native);font-weight:600;font-size:clamp(14px,1.1vw,22px);letter-spacing:.06em;text-transform:uppercase;color:color-mix(in srgb,var(--ink) 70%,transparent)}.stn-motif-lockup-date{font-family:var(--f-disp-native);font-weight:700;font-size:clamp(24px,2.4vw,36px);letter-spacing:0;text-transform:uppercase;color:var(--ink)}"
  },
  {
    "id": "stat-with-suffix",
    "label": "Stat with suffix",
    "role": "numeric-callout",
    "surface_safe": ["bone", "paper", "brand"],
    "description": "160px Stardos Stencil numeral with a 40px Barlow Condensed superscript suffix (% × K M) at vertical-align top. Never spell the unit. The defining stat callout — pairs with a Barlow Condensed legend label below.",
    "demo": "<div class=\"stn-motif-stat\"><div class=\"stn-motif-stat-val\">99<sup>%</sup></div><div class=\"stn-motif-stat-lbl\">Uptime · last 12 months</div></div>",
    "css": ".stn-motif-stat{display:flex;flex-direction:column;gap:12px}.stn-motif-stat-val{font-family:var(--f-disp-native);font-weight:700;font-size:clamp(96px,12vw,160px);line-height:.85;letter-spacing:-0.02em;text-transform:uppercase;color:var(--ink)}.stn-motif-stat-val sup{font-family:var(--f-mono-native);font-weight:800;font-size:.25em;vertical-align:top;letter-spacing:.04em;margin-left:.08em}.stn-motif-stat-lbl{font-family:var(--f-mono-native);font-weight:700;font-size:clamp(16px,1.3vw,22px);letter-spacing:.06em;text-transform:uppercase;color:color-mix(in srgb,var(--ink) 70%,transparent)}"
  }
]
```

The `motifs` JSON block above is the SOLE source of truth. build-design.mjs reads it to render §M cards in design.html. The Phase 3 plan agent and Phase 4b scene worker may cite motifs by `id` when annotating which gesture a scene relies on.

**Materials lexicon** (informational — these are the composition atoms behind the patterns):

- tablet-numeral · mega-numeral-divider · action-bar · status-pill · cover-mark · stat-with-suffix · quote-panel · process-node · timeline-bar · matrix-cell

## §I Page-level CSS (overrides design.html's neutral chrome — makes the doc itself read as Stencil & Tablet)

```css
/* ── Preset-native typography vars (loaded via preset-meta.chromeFonts.googleFontsHref).
 * These let the doc chrome render in Stardos Stencil + Inter + Barlow Condensed +
 * Bowlby One regardless of which brand DNA the preset is applied to. The §6
 * component preview, §M motifs grid, and §T type-role atlas also read these via
 * .preset-native-scope.
 *
 * The script slot is bound to Bowlby One because Stencil & Tablet reserves it
 * for the 320px quote-mark glyph (and refuses any other handwritten register).
 * The mono slot is bound to Barlow Condensed because the preset uses it as the
 * chrome / pill / legend voice — the role mono plays in other presets. */
:root {
  --f-disp-native:
    "Stardos Stencil", "Allerta Stencil", "Black Ops One", "Impact", "Arial Black", serif;
  --f-body-native:
    "Inter", "IBM Plex Sans", "Source Sans 3", -apple-system, BlinkMacSystemFont, system-ui,
    sans-serif;
  --f-script-native:
    "Bowlby One", "Stardos Stencil", "Black Ops One", "Impact", "Arial Black", serif;
  --f-mono-native:
    "Barlow Condensed", "Oswald", "Archivo Narrow", "Helvetica Neue", Arial, sans-serif;
}

/* .preset-native-scope: re-bind brand DNA font tokens to preset-native families.
 * Wraps §6 component previews, §M motif demos, and §T type-role atlas so
 * var(--font-*) resolves to Stardos Stencil / Inter / Barlow Condensed / Bowlby
 * regardless of the brand DNA tokens emitted in :root. The paste-ready
 * component source is untouched — Phase 4b still grep + paste original
 * `var(--font-display)` tokens, which resolve to brand DNA at scene-render time. */
.preset-native-scope {
  --font-display: var(--f-disp-native);
  --font-body: var(--f-body-native);
  --font-script: var(--f-script-native);
  --font-mono: var(--f-mono-native);
}

body {
  background: var(--surface-bone);
}
.title-card {
  background: var(--surface-bone);
  border-bottom: 4px solid var(--ink);
  padding: 96px 0 80px;
}
.title-display {
  text-transform: uppercase;
  letter-spacing: var(--track-stencil-headline);
  color: var(--ink);
}
.brand-name {
  color: var(--brand-primary);
  font-weight: 700;
}
.style-name {
  color: var(--brand-secondary);
  font-weight: 700;
}
.ds-section {
  border-top: var(--rule-hairline);
  padding: 80px 0;
}
h2 {
  text-transform: uppercase;
  letter-spacing: var(--track-stencil-headline);
  color: var(--ink);
}
.eyebrow {
  color: color-mix(in srgb, var(--ink) 70%, transparent);
  font-weight: 800;
  letter-spacing: var(--track-eyebrow);
  text-transform: uppercase;
}
.type-card,
.voice-pair,
.comp-card {
  border-radius: var(--radius-card) !important;
  border: none !important;
  background: var(--surface-paper) !important;
  box-shadow: none !important;
}
/* dna-swatch keeps inline brand-color background */
.dna-swatch {
  border-radius: var(--radius-card) !important;
  border: none !important;
  box-shadow: none !important;
}
.comp-head {
  background: var(--ink) !important;
  color: var(--anchor-bone) !important;
  text-transform: uppercase !important;
  letter-spacing: var(--track-chrome) !important;
  border-bottom: none !important;
}
.ds-code {
  background: var(--surface-paper) !important;
  border: var(--rule-hairline);
  border-radius: var(--radius-card) !important;
  color: var(--ink) !important;
}

/* ── §M Motifs grid: atomic gestures.
 * 12-col grid of small cards each teaching ONE reusable gesture. Cards may
 * declare a surface (bone / paper / brand / ink) to demonstrate the gesture
 * against its native background. Stencil & Tablet is flat — no shadows, only
 * hairline borders + saturated fills + rounded chrome. */
.ds-motif-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--gap-card);
}
.ds-motif {
  grid-column: span 4;
  min-height: 300px;
  padding: var(--pad-card);
  border: none;
  border-radius: var(--radius-card);
  background: var(--surface-paper);
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
.ds-motif.ds-motif-surface-bone {
  background: var(--surface-bone);
}
.ds-motif.ds-motif-surface-paper {
  background: var(--surface-paper);
}
.ds-motif.ds-motif-surface-brand {
  background: var(--brand-primary);
  color: var(--ink);
}
.ds-motif.ds-motif-surface-ink {
  background: var(--ink);
  color: var(--anchor-bone);
}
.ds-motif-h {
  margin: 0;
  font-family: var(--f-disp-native);
  font-weight: 700;
  font-size: clamp(22px, 2.2vw, 34px);
  line-height: 1.1;
  letter-spacing: var(--track-stencil-headline);
  text-transform: uppercase;
  color: var(--ink);
}
.ds-motif.ds-motif-surface-ink .ds-motif-h {
  color: var(--anchor-bone);
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
.ds-motif.ds-motif-surface-ink .ds-motif-desc {
  color: color-mix(in srgb, var(--anchor-bone) 80%, transparent);
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
  font-weight: 700;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--ink) 45%, transparent);
}
.ds-motif.ds-motif-surface-ink .ds-motif-id {
  color: color-mix(in srgb, var(--anchor-bone) 60%, transparent);
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
 * the atlas renders in BRAND DNA fonts; only the recipe is preset-declared.
 * Decoration (color, suffix, pill bg, rotation) stays declared with hard-coded
 * Stencil & Tablet tokens (var(--brand-primary), var(--ink), etc). */
.ds-trole-box {
  display: flex;
  flex-direction: column;
  border: var(--rule-hairline);
  border-radius: var(--radius-card);
  background: var(--surface-paper);
  overflow: hidden;
  margin-top: 24px;
}
.ds-trole-row {
  padding: 28px 32px;
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

/* ── Type-role samples. var(--font-display/body/mono/script) resolves to brand
 * DNA. Color uses Stencil & Tablet's contract: ink on light, brand-primary as
 * accent, bone on dark fills. Numerals always weight 700 with negative
 * tracking; Barlow chrome always tracked ≥0.04em. */
.t-trole-cover-hero {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(140px, 14vw, 220px);
  line-height: 0.82;
  letter-spacing: -0.015em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-numeral-mega {
  display: inline-block;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(240px, 30vw, 540px);
  line-height: 0.8;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--brand-primary);
  background: var(--ink);
  padding: 32px 48px;
  border-radius: var(--radius-card);
}
.t-trole-numeral-tablet {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(160px, 18vw, 240px);
  line-height: 0.85;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-numeral-stat {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(120px, 14vw, 160px);
  line-height: 0.85;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-numeral-stat sup {
  font-family: var(--font-mono);
  font-weight: 800;
  font-size: 0.25em;
  vertical-align: top;
  letter-spacing: 0.04em;
  margin-left: 0.08em;
  text-transform: uppercase;
}
.t-trole-section-headline {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(92px, 10vw, 120px);
  line-height: 0.92;
  letter-spacing: -0.005em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-page-headline {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(64px, 7vw, 92px);
  line-height: 0.92;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-quote-text {
  display: inline-block;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(44px, 5vw, 60px);
  line-height: 1.05;
  letter-spacing: -0.005em;
  text-transform: uppercase;
  color: var(--anchor-bone);
  background: var(--brand-secondary, var(--brand-primary));
  padding: 24px 32px;
  border-radius: var(--radius-tablet);
  max-width: 28ch;
}
.t-trole-quote-mark {
  display: inline-block;
  font-family: var(--font-script);
  font-weight: 700;
  font-size: clamp(200px, 22vw, 320px);
  line-height: 0.8;
  letter-spacing: 0;
  color: var(--brand-secondary, var(--brand-primary));
}
.t-trole-card-headline {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(28px, 2.6vw, 34px);
  line-height: 1.15;
  letter-spacing: -0.005em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-matrix-row {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(22px, 2vw, 26px);
  line-height: 1.1;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-topbar {
  font-family: var(--font-mono);
  font-weight: 800;
  font-size: clamp(24px, 2vw, 32px);
  line-height: 1;
  letter-spacing: var(--track-chrome);
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-section-eyebrow {
  font-family: var(--font-mono);
  font-weight: 800;
  font-size: clamp(18px, 1.6vw, 24px);
  line-height: 1.2;
  letter-spacing: var(--track-eyebrow);
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-footer {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: clamp(18px, 1.4vw, 22px);
  line-height: 1;
  letter-spacing: var(--track-chrome-loose);
  text-transform: uppercase;
  color: color-mix(in srgb, var(--ink) 75%, transparent);
}
.t-trole-pill {
  display: inline-block;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: clamp(16px, 1.2vw, 18px);
  line-height: 1;
  letter-spacing: var(--track-chrome-loose);
  text-transform: uppercase;
  background: var(--brand-primary);
  color: var(--ink);
  padding: 6px 16px;
  border-radius: var(--radius-pill);
}
.t-trole-body-lg {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(20px, 1.6vw, 24px);
  line-height: 1.4;
  color: var(--ink);
  max-width: 50ch;
  margin: 0;
}
.t-trole-body {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(18px, 1.4vw, 22px);
  line-height: 1.4;
  color: var(--ink);
  max-width: 60ch;
  margin: 0;
}
```
