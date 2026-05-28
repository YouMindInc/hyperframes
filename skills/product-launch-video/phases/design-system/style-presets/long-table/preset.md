```preset-meta
{
  "name": "long-table",
  "label": "Long Table",
  "fingerprint": {
    "ink": "single-color",
    "surface": "paper-texture",
    "borders": "1.5px-outlined",
    "type": "bricolage-uppercase + fraunces-italic",
    "depth": "flat-no-shadow",
    "anchor": "jumbo-italic-numeral"
  },
  "match_signals": [
    { "kind": "serif_display", "weight": 0.25 },
    { "kind": "hairline_border", "weight": 0.25 },
    { "kind": "minimal_decoration", "weight": 0.2 },
    { "kind": "low_saturation", "weight": 0.05 }
  ],
  "best_for": ["hospitality", "community brands", "lifestyle", "editorial", "magazine-friendly brands", "small-press / riso"],
  "avoid_for": ["technical", "corporate", "cold-minimal sites", "enterprise SaaS"],
  "chromeFonts": {
    "googleFontsHref": "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400;1,9..144,500;1,9..144,600&family=JetBrains+Mono:wght@400;500&display=swap",
    "display": "Bricolage Grotesque",
    "body": "Fraunces",
    "script": "Fraunces",
    "mono": "JetBrains Mono"
  }
}
```

> `chromeFonts` makes the design.html doc chrome (title-card, section heads, h2/h3, lede paragraphs, eyebrows) render in the preset's NATIVE typography — Bricolage Grotesque + Fraunces — instead of the brand DNA fonts. Long Table is a two-face system: Bricolage uppercase carries every display moment, Fraunces italic carries every body moment; the `script` slot also points at Fraunces because the preset refuses a third face (italic Fraunces is the "hand-written" voice). The brand fonts still apply to §6 component code (paste-ready for Phase 4b). §M motifs grid and §T type-role atlas use `.preset-native-scope` so var(--font-display/body/script/mono) re-resolves to these native families for the live preview.

## §A Director's intent

Long Table is a **single-ink editorial system** in the register of a supper-club poster, a Risograph zine, or a small-press dinner program. Every mark — text, border, rule, pill outline, page number — is rendered in **one brand ink** on a cream paper ground; opacity variants (78% / 32%) are the only chromatic variation. Depth is flat and printed: no shadows, no gradients, no fills — only 1.5px solid outlines and 1px solid/dashed internal dividers at 32% opacity. A subtle 4px radial-dot **paper texture** sits on every scene, invisible at distance, present up close.

Type carries the system: **Bricolage Grotesque weight 800 in strict uppercase** for every display moment (negative letter-spacing), paired with **Fraunces italic** as the default body voice — paragraphs, metadata, pills, page numbers. A massive **italic Fraunces jumbo numeral** (up to 480px) is the system's signature typographic anchor on cover-class scenes.

Class prefix: `lt-`. Best for warm, hospitality, community, lifestyle, editorial, magazine-friendly brands. Avoid for technical / corporate / cold-minimal sites — the warmth depends on serif italic + outlined shapes + paper texture.

**Brand-aware color contract:** the rust terracotta in the source template is discarded; the site's `--brand-primary` becomes "the ink." Three opacity tokens (78% / 50% / 32%) are synthesized via `color-mix()` so every brand re-colors cleanly. The "paper" surface is the site's `--canvas`.

## §B Decoration tokens

```css
/* Single-ink discipline — ink references brand-primary; opacities synthesized via color-mix */
--lt-ink-78: color-mix(in srgb, var(--brand-primary) 78%, transparent);
--lt-ink-50: color-mix(in srgb, var(--brand-primary) 50%, transparent);
--lt-ink-32: color-mix(in srgb, var(--brand-primary) 32%, transparent);

/* Structural borders — 1.5px is the only structural weight; never thicker */
--lt-border-structural: 1.5px solid var(--brand-primary);
--lt-divider-solid: 1px solid var(--lt-ink-32);
--lt-divider-dashed: 1px dashed var(--lt-ink-32);

/* Radii — only three values exist: pill, badge, or zero */
--lt-radius-pill: 999px;
--lt-radius-badge: 50%;
--lt-radius-flat: 0;

/* Paper-texture overlay — 4px radial dot @ 10% opacity ink, applied via pseudo-element */
--lt-paper-texture: radial-gradient(circle at 1px 1px, var(--lt-ink-50) 0.5px, transparent 1px);
--lt-paper-texture-size: 4px 4px;
--lt-paper-texture-opacity: 0.1;

/* Spacing — clamped fluid units mirroring the template's scale */
--lt-gap-tight: clamp(10px, 1.2vh, 18px);
--lt-gap-row: clamp(14px, 1.6vh, 24px);
--lt-gap-content: clamp(18px, 2vh, 32px);
--lt-gap-section: clamp(28px, 3vh, 50px);
--lt-pad-h: clamp(60px, 5vw, 110px);
--lt-pad-h-wide: clamp(80px, 7vw, 160px);
--lt-pad-h-narrow: clamp(120px, 12vw, 280px);

/* Tracking constants — Bricolage display always tight, Fraunces info-key always wide */
--lt-track-display: -0.012em;
--lt-track-tight: -0.005em;
--lt-track-wide: 0.16em;
--lt-track-wider: 0.18em;
```

## §D Font pairing fallback

- **display**: `'Bricolage Grotesque'` · `'Archivo Black'` · `'Anton'` wght 800
- **body**: `'Fraunces'` · `'Spectral'` · `'Newsreader'` wght 400
- **mono**: `'JetBrains Mono'` · `'Space Mono'` wght 400

## §T Type-role atlas (Phase 4b reads this to size text correctly)

Each entry is a **named type role** with concrete render parameters at 1920×1080 — family token, px range, weight, leading, tracking, case, italic flag, and any decoration (badge, divider stub, tracked letter-spacing). Phase 4b scene workers may cite roles by `id` ("use a `jumbo-numeral` here"); the brand DNA fonts plug in automatically via `var(--font-*)` tokens. This is the same atlas long-table ships in its Typography section, ported as machine-readable JSON.

The atlas is the **sole authoring source** for non-component text. If a scene needs a `jumbo-numeral` italic that isn't covered by §6 components, the worker reads role `jumbo-numeral` here and writes inline CSS from these values. Do NOT invent ad-hoc sizes — Long Table's identity collapses if Bricolage drifts below weight 800 at display scale, or if a body line is rendered in roman instead of italic.

```type-roles
[
  {
    "id": "jumbo-numeral",
    "family": "script",
    "purpose": "hero italic Fraunces numeral up to 480px — the system's signature typographic anchor on cover-class scenes",
    "px_min": 180, "px_max": 480, "weight": 400, "leading": "0.86", "tracking": "-0.02em", "case": "as-is",
    "sample_html": "<div class=\"t-trole-jumbo-numeral\">No. 05</div>"
  },
  {
    "id": "display-cover",
    "family": "display",
    "purpose": "cover-scale Bricolage title (uppercase, weight 800, negative tracking)",
    "px_min": 82, "px_max": 180, "weight": 800, "leading": "0.92", "tracking": "-0.012em", "case": "upper",
    "sample_html": "<div class=\"t-trole-display-cover\">Long Table</div>"
  },
  {
    "id": "display",
    "family": "display",
    "purpose": "section-opener / manifesto headline",
    "px_min": 72, "px_max": 160, "weight": 800, "leading": "0.9", "tracking": "-0.012em", "case": "upper",
    "sample_html": "<div class=\"t-trole-display\">A note before we sit.</div>"
  },
  {
    "id": "headline",
    "family": "display",
    "purpose": "topbar headline on index / calendar scenes",
    "px_min": 56, "px_max": 120, "weight": 800, "leading": "0.9", "tracking": "-0.012em", "case": "upper",
    "sample_html": "<div class=\"t-trole-headline\">Three recent editions</div>"
  },
  {
    "id": "headline-md",
    "family": "display",
    "purpose": "menu / programme title (smaller than headline)",
    "px_min": 48, "px_max": 100, "weight": 800, "leading": "0.92", "tracking": "-0.012em", "case": "upper",
    "sample_html": "<div class=\"t-trole-headline-md\">December · Lisbon</div>"
  },
  {
    "id": "quote",
    "family": "display",
    "purpose": "pull-quote body — weight 700 (slightly lighter than display-tier headlines)",
    "px_min": 40, "px_max": 96, "weight": 700, "leading": "0.95", "tracking": "-0.012em", "case": "upper",
    "sample_html": "<div class=\"t-trole-quote\">An evening I keep describing.</div>"
  },
  {
    "id": "card-title",
    "family": "display",
    "purpose": "title inside an outlined card",
    "px_min": 28, "px_max": 44, "weight": 800, "leading": "0.95", "tracking": "-0.008em", "case": "upper",
    "sample_html": "<div class=\"t-trole-card-title\">A Plate of Quiet</div>"
  },
  {
    "id": "info-value",
    "family": "display",
    "purpose": "value side of a key/value info row (Bricolage 700 uppercase)",
    "px_min": 20, "px_max": 28, "weight": 700, "leading": "1.1", "tracking": "-0.005em", "case": "upper",
    "sample_html": "<div class=\"t-trole-info-value\">11 December 2025</div>"
  },
  {
    "id": "edition-label-tracked",
    "family": "display",
    "purpose": "tracked Bricolage label beneath a hero edition numeral (0.18em letter-spacing)",
    "px_min": 15, "px_max": 18, "weight": 700, "leading": "1.2", "tracking": "0.18em", "case": "upper",
    "sample_html": "<div class=\"t-trole-edition-label-tracked\">December · Lisbon · Edition</div>"
  },
  {
    "id": "body-lede",
    "family": "body",
    "purpose": "large italic Fraunces lede / opening paragraph",
    "px_min": 20, "px_max": 28, "weight": 400, "leading": "1.45", "tracking": "0", "case": "sentence", "italic": true,
    "sample_html": "<p class=\"t-trole-body-lede\">A long winter dinner in a converted printing room above a bookshop. One shared roast, an unhurried wine list.</p>"
  },
  {
    "id": "body",
    "family": "body",
    "purpose": "standard italic Fraunces body paragraph",
    "px_min": 17, "px_max": 22, "weight": 400, "leading": "1.5", "tracking": "0", "case": "sentence", "italic": true,
    "sample_html": "<p class=\"t-trole-body\">Italic Fraunces is the default body voice — the slanted serif lends warmth and editorial personality. Roman is the exception.</p>"
  },
  {
    "id": "body-roman",
    "family": "body",
    "purpose": "small-size roman Fraunces — card descriptions where italic would be hard to read",
    "px_min": 15, "px_max": 17, "weight": 400, "leading": "1.45", "tracking": "0", "case": "sentence", "italic": false,
    "sample_html": "<p class=\"t-trole-body-roman\">Eight courses cooked entirely on a single induction ring. The room agreed not to use phones for the entire evening.</p>"
  },
  {
    "id": "edition-label",
    "family": "body",
    "purpose": "italic Fraunces label paired with an edition badge (\"december edition\")",
    "px_min": 20, "px_max": 30, "weight": 400, "leading": "1", "tracking": "0", "case": "sentence", "italic": true,
    "sample_html": "<div class=\"t-trole-edition-label\">december edition</div>"
  },
  {
    "id": "tagline",
    "family": "body",
    "purpose": "italic Fraunces tagline beneath a cover title",
    "px_min": 18, "px_max": 26, "weight": 400, "leading": "1.35", "tracking": "0", "case": "sentence", "italic": true,
    "sample_html": "<p class=\"t-trole-tagline\">Where ten strangers, one cook, and a long evening meet under low light.</p>"
  },
  {
    "id": "pill-text",
    "family": "body",
    "purpose": "italic Fraunces text inside a pill button or rect-tag",
    "px_min": 15, "px_max": 20, "weight": 400, "leading": "1", "tracking": "0", "case": "sentence", "italic": true,
    "sample_html": "<div><span class=\"t-trole-pill-text\">Apply now</span></div>"
  },
  {
    "id": "info-key",
    "family": "body",
    "purpose": "italic Fraunces key in a key/value info row — tracked uppercase (one of two roman exceptions)",
    "px_min": 14, "px_max": 16, "weight": 400, "leading": "1.4", "tracking": "0.16em", "case": "upper", "italic": true,
    "sample_html": "<div class=\"t-trole-info-key\">When</div>"
  },
  {
    "id": "pagenum",
    "family": "body",
    "purpose": "italic Fraunces page-number marker at scene bottom-right (the system's spine)",
    "px_min": 14, "px_max": 16, "weight": 400, "leading": "1", "tracking": "0.02em", "case": "as-is", "italic": true,
    "sample_html": "<div class=\"t-trole-pagenum\">04 / 08</div>"
  }
]
```

The atlas omits the edition badge (a §M motif — circle outline + numeral, declared in §M), the outlined card (a §M motif — 1.5px ink border + solid/dashed internal divider rhythm), and the paper-texture overlay (a §B decoration token, not a text role).

## §E Motion (GSAP consts — REPLACES site ease)

```js
// Long Table motion — calm, considered, supper-club pace.
// Type and outlined shapes settle into place; no overshoot, no bounce.
const EASE = {
  entry: "power2.out", // type + cards fade-rise into place
  emphasis: "expo.out", // jumbo numeral + headlines arriving with weight
  exit: "power2.in", // marks lift off paper, no snap
  drift: "sine.inOut", // paper-texture breath, candlelight flicker
  // RULE: never back/elastic/bounce — printed paper does not overshoot.
  // RULE: never "steps()" — the system has no pixel-grid, no staircase aesthetic.
};
const DUR = {
  snap: 0.18, // pill border-draw, tag arrivals
  med: 0.45, // headline rise, card fade-in
  slow: 0.95, // jumbo numeral entrance, scene crossfade
  // RULE: scene transitions are opacity crossfades, ~280-380ms; never slide or wipe.
};
```

### §E.5 Motion choreography

- **Allowed gestures:** opacity fade, gentle y-translate (12-24px), letter-by-letter type-in (Bricolage display, EASE.emphasis, 35-55ms stagger), border-length draw (1.5px outlines stroking on from one edge), Fraunces italic numeral scale-in from ~0.94 to 1.0 with EASE.emphasis + DUR.slow.
- **Forbidden gestures:** any back/elastic/bounce ease, any rotation > 1deg, any scale-in from below 0.85, any blur transition, any slide/wipe scene change, any color-shift (single-ink discipline).
- **Type-in motion:** Bricolage uppercase headlines stagger letter-by-letter or word-by-word, not character-rotation. Fraunces body fades in as a single block with EASE.entry (italic letterforms self-decorate; per-letter stagger breaks the flow).
- **Edition badge + label** are one animated unit — they enter together with EASE.entry + DUR.med. Never animate the badge before the label.
- **Paper-texture overlay** has its own DUR.slow opacity drift (0.08 ↔ 0.12) on EASE.drift for living-paper feel, but the overlay itself never enters or exits — it's a stage-level constant.
- **Scene transitions:** default is a 320ms opacity crossfade (EASE.entry on incoming, EASE.exit on outgoing). Hard cuts are reserved for kicker beats (e.g., "EDITION NO. 05" reveal); slide/wipe transitions are forbidden.

## §G Voice transform recipe

1. **Bricolage display lines (headlines, card titles, course names, info values):** UPPERCASE the source string; strip articles + connectives sparingly (keep "of / and" if they read as part of the title); apply -0.012em tracking implicitly via §B.
2. **Fraunces body lines (lede, tagline, pill text, page numbers, edition labels):** lowercase or sentence case; italic by default; **never UPPERCASE** a body line (uppercase is reserved for Bricolage).
3. **Edition / chapter markers:** rendered as `EDITION NO. <N>` in Bricolage tracked uppercase, or as a numeral inside a circular badge plus an italic Fraunces label like `december edition`.
4. **Stats and metadata:** short Fraunces italic phrases — `22 seats only`, `Twice a month`, `By application`. Avoid bullet symbols; use line breaks or middle-dot separators (`·`).
5. **Punchline:** brand name as the final mark, in either Bricolage display (cover) or Fraunces italic (closing).

**Example:**

- IN: `Long Table is an intimate supper-club bringing strangers together over a shared meal in a different city each month`
- OUT: `LONG TABLE — twenty-two seats, one cook, one long evening. *by application, a different city each month.*`

(Headline portion is Bricolage uppercase; the italicised continuation is Fraunces body voice — the recipe writes both styles into one line where appropriate.)

## §H Scene composition hints

- **Surface:** always the brand canvas as paper; the paper-texture overlay (`paper-texture` component or `--lt-paper-texture` token) sits on every scene at 10% opacity. Never solid flat color — always textured.
- **Focal density:** rich-but-curated — one major Bricolage display moment + 2-4 supporting groups (cards, pills, ledger rows, info pairs). Single-element scenes feel underweight; 8-element scenes feel broken.
- **Brand-color role contract:** `--brand-primary` is "the ink" — every text run, every border, every pill outline, every page number is this color. The opacity tokens (`--lt-ink-78`, `--lt-ink-32`) are the _only_ chromatic variation. Do not use `--brand-secondary` or `--brand-accent` — a second hue shatters the printed-program register.
- **Padding rhythm:** wide horizontal padding (`--lt-pad-h-narrow`) for quote / menu scenes that need a tall vertical column; default `--lt-pad-h` for cover / index; `--lt-pad-h-wide` for featured / calendar.
- **Type pairing:** every display element is Bricolage 800 uppercase with `--lt-track-display`. Every body element is Fraunces italic 400. Roman Fraunces appears _only_ for `info-key` labels (tracked uppercase) and card-body descriptions (small-size legibility).
- **Edition badge unit:** the circular badge and the italic "EDITION N." label are inseparable. Always render together.
- **Outlined shape discipline:** pills (`--lt-radius-pill`), badges (`--lt-radius-badge`), and every other container (`--lt-radius-flat`) — only those three radii. No 4px / 8px / 12px medium radii.
- **Internal divider rhythm:** inside cards, 1px solid @ 32% above the title, 1px dashed @ 32% below the body — the solid/dashed pairing is the system's signature card rhythm.
- **Cover-class hero anchor:** when a scene is a cover moment, reach for the `jumbo-numeral` component (italic Fraunces up to 480px) instead of a hero image. The numeral is the visual centerpiece.
- **Scene transition default:** 320ms opacity crossfade. No slide / wipe / push transitions — these break the printed-paper feel.
- **Allowed backgrounds:** the canvas + paper-texture overlay only. No gradients, no mesh, no full-bleed photography (decorative photo can sit inside an outlined card as a contained element, but the scene background itself is always cream paper).
- **Forbidden:** filled rectangles in ink color (outline-only); any box-shadow; any second hue; any non-italic body Fraunces (except info-keys and card-body); any sentence-case Bricolage.
- **Page-number marker:** italic Fraunces at the bottom-right of every scene. The marker is the system's spine — its presence ties otherwise-different scenes into one coherent program.

## §M Atomic motifs (gestures the plan agent can reference)

Each motif is a **single reusable gesture** that lives inside a larger pattern. Patterns compose motifs; motifs do not compose anything. The plan agent treats motifs as the smallest cite-able vocabulary — a scene description can say "uses motif:edition-badge on the cover" without specifying which pattern the badge sits in.

```motifs
[
  {
    "id": "edition-badge",
    "label": "Edition badge",
    "role": "ordinal-marker",
    "surface_safe": ["paper"],
    "description": "Circular 1.5px outlined badge holding a single italic Fraunces digit, paired with an italic 'EDITION N.' Fraunces label. The badge + label are one unit — render together, never one without the other. The system's edition / chapter ordinal marker.",
    "demo": "<div class=\"lt-motif-edition\"><div class=\"lt-motif-edition-badge\">5</div><div class=\"lt-motif-edition-label\">december edition</div></div>",
    "css": ".lt-motif-edition{display:inline-flex;align-items:center;gap:14px}.lt-motif-edition-badge{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border:1.5px solid var(--brand-primary);border-radius:50%;font-family:var(--f-body-native);font-style:italic;font-weight:400;font-size:18px;line-height:1;color:var(--brand-primary)}.lt-motif-edition-label{font-family:var(--f-body-native);font-style:italic;font-weight:400;font-size:clamp(20px,1.6vw,30px);line-height:1;color:var(--brand-primary)}"
  },
  {
    "id": "jumbo-numeral",
    "label": "Jumbo italic numeral",
    "role": "cover-anchor",
    "surface_safe": ["paper"],
    "description": "Massive italic Fraunces numeral up to 480px — the system's signature hero typographic anchor on cover-class scenes. Replaces the hand-drawn illustration that would traditionally fill the cover-right column. Paired with a small tracked Bricolage label beneath.",
    "wide": true,
    "demo": "<div class=\"lt-motif-jumbo\"><div class=\"lt-motif-jumbo-num\">No. 05</div><div class=\"lt-motif-jumbo-lab\">December · Lisbon · Edition</div></div>",
    "css": ".lt-motif-jumbo{display:flex;flex-direction:column;align-items:flex-end;text-align:right;gap:12px}.lt-motif-jumbo-num{font-family:var(--f-script-native);font-style:italic;font-weight:400;font-size:clamp(120px,14vw,240px);line-height:.86;letter-spacing:-.02em;color:var(--brand-primary)}.lt-motif-jumbo-lab{font-family:var(--f-disp-native);font-weight:700;font-size:clamp(15px,1.1vw,18px);line-height:1.2;letter-spacing:.18em;text-transform:uppercase;color:var(--brand-primary)}"
  },
  {
    "id": "outlined-card",
    "label": "Outlined card",
    "role": "content-container",
    "surface_safe": ["paper"],
    "description": "1.5px ink-outlined rectangle with the signature solid-above / dashed-below rhythm: 1px solid @ 32% opacity above the card title, 1px dashed @ 32% opacity below the body. The solid/dashed pairing IS the system's card-rhythm device — using one without the other breaks the printed-program register.",
    "wide": true,
    "demo": "<div class=\"lt-motif-card\"><div class=\"lt-motif-card-top\">No. 03 · Mexico City</div><div class=\"lt-motif-card-title\">A Plate of Quiet</div><div class=\"lt-motif-card-body\">Eight courses cooked on a single induction ring; the room agreed not to use phones.</div><div class=\"lt-motif-card-meta\">22 seats · 14 March 2025</div></div>",
    "css": ".lt-motif-card{border:1.5px solid var(--brand-primary);padding:24px 28px;display:flex;flex-direction:column;gap:14px;background:var(--canvas);max-width:340px}.lt-motif-card-top{font-family:var(--f-body-native);font-style:italic;font-weight:400;font-size:16px;color:var(--brand-primary);border-bottom:1px solid color-mix(in srgb,var(--brand-primary) 32%,transparent);padding-bottom:12px}.lt-motif-card-title{font-family:var(--f-disp-native);font-weight:800;font-size:32px;line-height:.95;letter-spacing:-.008em;text-transform:uppercase;color:var(--brand-primary)}.lt-motif-card-body{font-family:var(--f-body-native);font-style:normal;font-weight:400;font-size:15px;line-height:1.45;color:var(--brand-primary)}.lt-motif-card-meta{font-family:var(--f-body-native);font-style:italic;font-weight:400;font-size:14px;color:var(--brand-primary);border-top:1px dashed color-mix(in srgb,var(--brand-primary) 32%,transparent);padding-top:12px}"
  },
  {
    "id": "pill-button",
    "label": "Outlined pill",
    "role": "action-affordance",
    "surface_safe": ["paper"],
    "description": "Fully-rounded (border-radius 999px) 1.5px ink-outlined rectangle holding short italic Fraunces text. The system's CTA / action button. Pairs with a tiny italic Fraunces pill-divider character (·, /, |) when clustering.",
    "demo": "<div class=\"lt-motif-pills\"><span class=\"lt-motif-pill\">Apply now</span><span class=\"lt-motif-pill-div\">·</span><span class=\"lt-motif-pill\">Lisbon</span></div>",
    "css": ".lt-motif-pills{display:inline-flex;align-items:center;gap:10px}.lt-motif-pill{display:inline-flex;align-items:center;justify-content:center;padding:10px 24px;border:1.5px solid var(--brand-primary);border-radius:999px;font-family:var(--f-body-native);font-style:italic;font-weight:400;font-size:clamp(15px,1.1vw,18px);line-height:1;color:var(--brand-primary);white-space:nowrap}.lt-motif-pill-div{font-family:var(--f-body-native);font-style:italic;font-size:18px;color:var(--brand-primary);opacity:.7}"
  },
  {
    "id": "topbar-rule",
    "label": "Topbar with divider",
    "role": "section-opener",
    "surface_safe": ["paper"],
    "description": "Bricolage uppercase headline on the left + small italic Fraunces label-tag on the right, separated below by a 1.5px solid ink horizontal rule. The system's universal section-opener device — every index / calendar scene uses this exact gesture.",
    "wide": true,
    "demo": "<div class=\"lt-motif-topbar\"><div class=\"lt-motif-topbar-h\">Three recent editions</div><div class=\"lt-motif-topbar-lab\">Long Table · 2025 · selected</div></div>",
    "css": ".lt-motif-topbar{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;border-bottom:1.5px solid var(--brand-primary);padding-bottom:14px}.lt-motif-topbar-h{font-family:var(--f-disp-native);font-weight:800;font-size:clamp(36px,3.6vw,72px);line-height:.9;letter-spacing:-.012em;text-transform:uppercase;color:var(--brand-primary)}.lt-motif-topbar-lab{font-family:var(--f-body-native);font-style:italic;font-weight:400;font-size:clamp(15px,1.05vw,18px);line-height:1.4;color:var(--brand-primary);text-align:right}"
  },
  {
    "id": "pagenum-spine",
    "label": "Page-number spine",
    "role": "scene-anchor",
    "surface_safe": ["paper"],
    "description": "Italic Fraunces page-number marker (e.g. '03 / 08') fixed at scene bottom-right. The system's spine — its presence on every scene ties otherwise-different layouts into one coherent program. Removing it from any scene reads as 'unanchored'.",
    "demo": "<div class=\"lt-motif-pagenum\">03 / 08</div>",
    "css": ".lt-motif-pagenum{display:inline-block;font-family:var(--f-body-native);font-style:italic;font-weight:400;font-size:clamp(14px,.95vw,16px);line-height:1;letter-spacing:.02em;color:var(--brand-primary)}"
  }
]
```

The `motifs` JSON block above is the SOLE source of truth. build-design.mjs reads it to render §M cards in design.html. The Phase 3 plan agent and Phase 4b scene worker may cite motifs by `id` when annotating which gesture a scene relies on.

**Materials lexicon** (informational — these are the composition atoms behind the patterns):

- edition-badge · jumbo-numeral · outlined-card · pill-button · topbar-rule · pagenum-spine · rect-tag · ledger-row · paper-texture · solid-dashed-divider

## §I Page-level CSS

```css
/* ── Preset-native typography vars (loaded via preset-meta.chromeFonts.googleFontsHref).
 * These let the doc chrome render in Bricolage Grotesque + Fraunces + JetBrains Mono
 * regardless of which brand DNA the preset is applied to. The §6 component preview,
 * §M motifs grid, and §T type-role atlas also read these via .preset-native-scope.
 *
 * Long Table has no machine-mono moment in the source — the `mono` slot is reserved
 * for design.html chrome code blocks only. The `script` slot points at Fraunces
 * because italic Fraunces IS the system's "hand-written" voice; the preset refuses
 * a third face. Fallback chains end in faces that still carry the supper-club
 * register (Archivo Black / Anton / Impact for display mass; Spectral / Newsreader /
 * Georgia for serif body warmth). Falling all the way to generic should never
 * happen in practice. */
:root {
  --f-disp-native:
    "Bricolage Grotesque", "Archivo Black", "Anton", "Impact", "Arial Black", "Helvetica Neue",
    sans-serif;
  --f-body-native: "Fraunces", "Spectral", "Newsreader", Georgia, "Times New Roman", serif;
  --f-script-native: "Fraunces", "Spectral", "Newsreader", Georgia, "Times New Roman", serif;
  --f-mono-native:
    "JetBrains Mono", "IBM Plex Mono", "Space Mono", "Menlo", ui-monospace, monospace;
}

/* .preset-native-scope: re-bind brand DNA font tokens to preset-native families.
 * Wraps §6 component previews, §M motif demos, and §T type-role atlas rows so
 * var(--font-*) resolves to Bricolage / Fraunces / JetBrains Mono regardless of
 * the brand DNA tokens emitted in :root. The paste-ready component source is
 * untouched — Phase 4b still grep + paste original `var(--font-display)` tokens,
 * which resolve to brand DNA at scene-render time. */
.preset-native-scope {
  --font-display: var(--f-disp-native);
  --font-body: var(--f-body-native);
  --font-script: var(--f-script-native);
  --font-mono: var(--f-mono-native);
}

/* Style design.html itself in the Long Table register so the human-facing
   preview reads as a supper-club program preview, not a generic dump. */
:root {
  --lt-design-paper: var(--canvas);
  --lt-design-ink: var(--brand-primary);
}

body {
  background: var(--lt-design-paper);
  color: var(--lt-design-ink);
  font-family: "Fraunces", Georgia, serif;
  font-style: italic;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: var(--lt-paper-texture-opacity);
  background-image: var(--lt-paper-texture);
  background-size: var(--lt-paper-texture-size);
}

h1,
h2,
h3,
h4 {
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: var(--lt-track-display);
  font-style: normal;
}

.ds-section {
  border-top: var(--lt-border-structural);
  position: relative;
  z-index: 1;
}

.ds-code {
  border: var(--lt-border-structural);
  border-radius: var(--lt-radius-flat);
  background: var(--canvas);
}

/* ── §M Motifs grid: atomic gestures.
 * Mirrors long-table's outlined-card vocabulary — a 12-col grid of small cards
 * each teaching ONE reusable gesture. Cards may declare a surface (paper) to
 * demonstrate the gesture against its native bg. Long Table is single-ink:
 * there is no `brand` or `ink` surface variant — every motif card sits on the
 * paper canvas with 1.5px ink borders. */
.ds-motif-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}
.ds-motif {
  grid-column: span 4;
  min-height: 280px;
  padding: 28px;
  border: var(--lt-border-structural);
  border-radius: var(--lt-radius-flat);
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
.ds-motif.ds-motif-surface-paper {
  background: var(--canvas);
}
.ds-motif-h {
  margin: 0;
  font-family: var(--f-disp-native);
  font-weight: 800;
  font-size: clamp(22px, 2.2vw, 32px);
  line-height: 1;
  letter-spacing: -0.008em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.ds-motif-desc {
  margin: 0;
  font-family: var(--f-body-native);
  font-style: italic;
  font-weight: 400;
  font-size: 15px;
  line-height: 1.5;
  color: var(--lt-ink-78);
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
  color: var(--lt-ink-32);
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

/* ── §T Type-role atlas. Container = paper-on-paper card look with 1.5px ink
 * border + 1px @ 32% solid internal row dividers (the system's signature card
 * rhythm). Each .t-trole-* class encodes the role's family / size / weight /
 * leading / tracking / case / italic. Family selectors use var(--font-*) tokens
 * so the atlas renders in BRAND DNA fonts; only the recipe is preset-declared.
 * Color decisions follow Long Table's single-ink discipline — every text mark
 * is `var(--brand-primary)`, opacity tiers `--lt-ink-78` / `--lt-ink-32` are
 * the only chromatic variation. */
.ds-trole-box {
  display: flex;
  flex-direction: column;
  border: var(--lt-border-structural);
  border-radius: var(--lt-radius-flat);
  background: var(--canvas);
  overflow: hidden;
  margin-top: 24px;
}
.ds-trole-row {
  padding: 28px 32px;
  border-bottom: var(--lt-divider-solid);
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

/* ── Type-role samples. var(--font-display/body/script/mono) resolves to brand
 * DNA. Italic body roles set font-style:italic inline because Fraunces italic
 * IS the long-table body voice — flipping to roman breaks the supper-club
 * register. Color is always var(--brand-primary); opacity tiers for muting. */
.t-trole-jumbo-numeral {
  display: inline-block;
  font-family: var(--font-script);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(120px, 14vw, 240px);
  line-height: 0.86;
  letter-spacing: -0.02em;
  color: var(--brand-primary);
}
.t-trole-display-cover {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(64px, 9vw, 180px);
  line-height: 0.92;
  letter-spacing: -0.012em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-display {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(56px, 7vw, 160px);
  line-height: 0.9;
  letter-spacing: -0.012em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-headline {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(48px, 6vw, 120px);
  line-height: 0.9;
  letter-spacing: -0.012em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-headline-md {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(40px, 5vw, 100px);
  line-height: 0.92;
  letter-spacing: -0.012em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-quote {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(36px, 4.4vw, 96px);
  line-height: 0.95;
  letter-spacing: -0.012em;
  text-transform: uppercase;
  color: var(--brand-primary);
  max-width: 22ch;
}
.t-trole-card-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(24px, 2.4vw, 44px);
  line-height: 0.95;
  letter-spacing: -0.008em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-info-value {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(18px, 1.6vw, 28px);
  line-height: 1.1;
  letter-spacing: -0.005em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-edition-label-tracked {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(15px, 1.1vw, 18px);
  line-height: 1.2;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-body-lede {
  font-family: var(--font-body);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(18px, 1.5vw, 28px);
  line-height: 1.45;
  color: var(--brand-primary);
  max-width: 50ch;
  margin: 0;
}
.t-trole-body {
  font-family: var(--font-body);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(16px, 1.2vw, 22px);
  line-height: 1.5;
  color: var(--brand-primary);
  max-width: 60ch;
  margin: 0;
}
.t-trole-body-roman {
  font-family: var(--font-body);
  font-style: normal;
  font-weight: 400;
  font-size: clamp(14px, 1vw, 17px);
  line-height: 1.45;
  color: var(--brand-primary);
  max-width: 60ch;
  margin: 0;
}
.t-trole-edition-label {
  font-family: var(--font-body);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(18px, 1.6vw, 30px);
  line-height: 1;
  color: var(--brand-primary);
}
.t-trole-tagline {
  font-family: var(--font-body);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(16px, 1.4vw, 26px);
  line-height: 1.35;
  color: var(--brand-primary);
  max-width: 40ch;
  margin: 0;
}
.t-trole-pill-text {
  display: inline-block;
  font-family: var(--font-body);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(14px, 1.1vw, 20px);
  line-height: 1;
  color: var(--brand-primary);
  border: var(--lt-border-structural);
  border-radius: var(--lt-radius-pill);
  padding: 10px 24px;
}
.t-trole-info-key {
  font-family: var(--font-body);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(13px, 0.95vw, 16px);
  line-height: 1.4;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-pagenum {
  display: inline-block;
  font-family: var(--font-body);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(13px, 0.95vw, 16px);
  line-height: 1;
  letter-spacing: 0.02em;
  color: var(--brand-primary);
}
```
