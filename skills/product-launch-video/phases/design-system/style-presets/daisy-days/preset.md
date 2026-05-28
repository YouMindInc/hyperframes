```preset-meta
{
  "name": "daisy-days",
  "label": "Daisy Days",
  "fingerprint": {
    "shadow": "hard-offset-charcoal",
    "border": "thick-charcoal-rounded",
    "type": "rounded-display",
    "decoration": "hand-drawn-sticker",
    "mood": "storybook-pastel",
    "motion": "bounce-and-settle"
  },
  "match_signals": [
    { "kind": "shadow_zero_blur", "weight": 0.3 },
    { "kind": "thick_solid_border", "weight": 0.25 },
    { "kind": "low_saturation", "weight": 0.2 },
    { "kind": "bouncy_easing", "weight": 0.1 }
  ],
  "best_for": ["educational content", "wellness", "community workshops", "creator portfolios", "friendly internal kickoffs"],
  "avoid_for": ["enterprise compliance", "financial precision", "security", "authority-first contexts"],
  "chromeFonts": {
    "googleFontsHref": "https://fonts.googleapis.com/css2?family=Fredoka+One&family=Quicksand:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
    "display": "Fredoka One",
    "body": "Quicksand",
    "script": "Fredoka One",
    "mono": "JetBrains Mono"
  }
}
```

> `chromeFonts` makes the design.html doc chrome (title-card, section heads, h2/h3, lede paragraphs, eyebrows) render in the preset's NATIVE typography — Fredoka One + Quicksand — instead of the brand DNA fonts. Daisy Days is a two-face system: Fredoka does every headline, Quicksand carries every body line; the `script` slot also points at Fredoka because the storybook voice refuses a third face (mono lives only as metadata chrome). The brand fonts still apply to §6 component code (paste-ready for Phase 4b). §M motifs grid and §T type-role atlas use `.preset-native-scope` so var(--font-display/body/script/mono) re-resolves to these native families for the live preview.

## §A Director's intent

Daisy Days is a **cheerful, storybook-pastel system**. Every container is a rounded card with a thick charcoal outline (3px) and a hard offset shadow (6px / 6px / 0), and every region is wreathed in hand-drawn SVG ornaments — daisies, stars, suns, clouds, rainbows — that cluster at the corners and crop past the edges. Type pairs a chubby rounded display face with a friendly humanist sans; surfaces alternate between cream and saturated pastels (turquoise, soft-pink, butter, mint, lavender, peach, sky). The single accent — coral — is reserved for small high-attention markers, never as a surface.

Voice is **warm and informal**: short sentence fragments, sentence case, no shouting. Motion is **bounce-and-settle**: things hop in with a mild overshoot, ornaments breathe and twinkle, exits are quick and clean. Use `dc-` as the CSS class prefix to namespace components.

**Best for:** educational content, wellness, community workshops, creator portfolios, friendly internal kickoffs, anything that wants to feel soft, hand-made, and approachable. **Avoid for:** authority-first contexts (enterprise compliance, financial precision, security) where storybook decoration reads as flippant.

## §B Decoration tokens

```css
/* Hard offset shadow + chunky borders — the system's signature elevation.
   All borders/shadows use var(--ink) directly; site DNA's ink carries it. */
--border-bold: 3px solid var(--ink);
--border-thin: 2px solid var(--ink);
--shadow-card: 6px 6px 0 var(--ink);
--shadow-small: 4px 4px 0 var(--ink);
--shadow-text-bold: 3px 3px 0 var(--ink);
--shadow-text-soft: 3px 3px 0 color-mix(in srgb, var(--ink) 20%, transparent);

/* Generous radii — there are no square corners in this system */
--radius-card: 20px;
--radius-card-lg: 28px;
--radius-pill: 50px;

/* Spacing */
--gap-card: 1.5vw;
--gap-grid: 1.25vw;
--pad-card-lg: 2.4vw 2.8vw;
--pad-card-md: 1.6vw 2vw;
--pad-card-sm: 0.8vw 1.2vw;

/* Surface alternates — each is a low-opacity tint over the brand palette so any
   brand still produces a pastel-garden surface. Falls back cleanly when the
   site's accent palette is itself pastel.

   §8.2 exception: pastel/butter/blush/sky anchors are technical hue anchors,
   declared once here so every surface/sticker mix produces a storybook tone
   regardless of brand DNA. Without these anchors, dark or saturated brands
   would produce dark pastels — breaking the storybook register. */
--anchor-cream: #fffaf0; /* off-white pastel anchor for surfaces */
--anchor-warm-cream: #f5f0e6; /* warmer cream for canvas wash */
--anchor-butter: #fde68a; /* butter-yellow sticker anchor */
--anchor-sky: #a8d8f0; /* sky-blue sticker anchor */
--anchor-blush: #f7c8d4; /* blush-pink sticker anchor */

--surface-pastel-primary: color-mix(in srgb, var(--brand-primary) 32%, var(--anchor-cream));
--surface-pastel-secondary: color-mix(in srgb, var(--brand-secondary) 30%, var(--anchor-cream));
--surface-pastel-accent: color-mix(in srgb, var(--brand-accent) 28%, var(--anchor-cream));
--surface-cream: color-mix(in srgb, var(--canvas) 78%, var(--anchor-warm-cream));

/* Sticker tints — used for ornament fills so daisies/stars re-color with brand */
--sticker-warm: color-mix(in srgb, var(--brand-primary) 50%, var(--anchor-butter));
--sticker-cool: color-mix(in srgb, var(--brand-accent) 50%, var(--anchor-sky));
--sticker-soft: color-mix(in srgb, var(--brand-secondary) 45%, var(--anchor-blush));

/* SVG stroke (used inline on ornaments) */
--sticker-stroke: var(--ink);
--sticker-stroke-w: 2.1px;
```

## §D Font pairing fallback

- **display**: `'Fredoka One'` · `'Fredoka'` wght 600 · `'Baloo 2'` wght 700
- **body**: `'Quicksand'` wght 500 · `'Nunito'` wght 500 · `'Comfortaa'` wght 500
- **mono**: `'JetBrains Mono'` wght 500 · `'IBM Plex Mono'` wght 500

## §T Type-role atlas (Phase 4b reads this to size text correctly)

Each entry is a **named type role** with concrete render parameters at 1920×1080 — family token, px range, weight, leading, tracking, case, and any color/shadow/rotation decoration. Phase 4b scene workers may cite roles by `id` ("use a `headline-pastel` here"); the brand DNA fonts plug in automatically via `var(--font-*)` tokens. This is the Daisy Days typographic ladder (§D + design.md typography table) ported as machine-readable JSON.

The atlas is the **sole authoring source** for non-component text. If a scene needs a `number-hero` numeral that isn't covered by §6 components, the worker reads role `number-hero` here and writes inline CSS from these values. Do NOT invent ad-hoc sizes — the Fredoka/Quicksand role boundary collapses at the 1.3rem threshold and ad-hoc sizes break the storybook ladder.

```type-roles
[
  {
    "id": "display-cover",
    "family": "display",
    "purpose": "cover / opening hero headline (Fredoka One on cream, no text-shadow)",
    "px_min": 52, "px_max": 112, "weight": 400, "leading": "1.1", "tracking": "0.02em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-display-cover\">{BRAND_NAME}</div>"
  },
  {
    "id": "headline",
    "family": "display",
    "purpose": "primary slide headline on cream / white card (dark ink, flat — no shadow)",
    "px_min": 40, "px_max": 72, "weight": 400, "leading": "1.1", "tracking": "0.02em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-headline\">A friendlier way to begin</div>"
  },
  {
    "id": "headline-pastel",
    "family": "display",
    "purpose": "headline on a saturated pastel surface (white text + 3px charcoal text-shadow — non-optional)",
    "px_min": 40, "px_max": 72, "weight": 400, "leading": "1.1", "tracking": "0.02em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-headline-pastel-wrap\"><span class=\"t-trole-headline-pastel\">This week's lineup</span></div>"
  },
  {
    "id": "title",
    "family": "display",
    "purpose": "section title or framed-header title (Fredoka One on cream/card)",
    "px_min": 28, "px_max": 48, "weight": 400, "leading": "1.15", "tracking": "0.02em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-title\">Section title</div>"
  },
  {
    "id": "quote-text",
    "family": "display",
    "purpose": "pull-quote body inside a white quote box (Fredoka One, dark ink)",
    "px_min": 22, "px_max": 36, "weight": 400, "leading": "1.35", "tracking": "0.02em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-quote-text\">A small kindness, repeated daily, becomes the work.</div>"
  },
  {
    "id": "subtitle",
    "family": "display",
    "purpose": "sub-headline or in-card title (Fredoka One mid-scale)",
    "px_min": 20, "px_max": 28, "weight": 400, "leading": "1.2", "tracking": "0.02em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-subtitle\">Sub-headline</div>"
  },
  {
    "id": "label-display",
    "family": "display",
    "purpose": "small Fredoka label — day-card header, step title, marker numeral",
    "px_min": 16, "px_max": 21, "weight": 400, "leading": "1.3", "tracking": "0.02em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-label-display\">Monday</div>"
  },
  {
    "id": "number-hero",
    "family": "display",
    "purpose": "hero statistic numeral (Fredoka One, brand-accent on cream / white card)",
    "px_min": 80, "px_max": 152, "weight": 400, "leading": "1", "tracking": "0.02em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-number-hero\">63%</div>"
  },
  {
    "id": "body-strong",
    "family": "body",
    "purpose": "emphasized body line — welcome list items, info-card descriptions (Quicksand 600)",
    "px_min": 15, "px_max": 18, "weight": 600, "leading": "1.5", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body-strong\">A friendlier way to start the week — together.</p>"
  },
  {
    "id": "body",
    "family": "body",
    "purpose": "standard paragraph body (Quicksand 500, never uppercase)",
    "px_min": 15, "px_max": 18, "weight": 500, "leading": "1.6", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body\">Body runs in Quicksand 500. The friendly humanist counterweight to Fredoka — never uppercase, never italic.</p>"
  },
  {
    "id": "meta",
    "family": "body",
    "purpose": "compact secondary text — day-card lists, step descriptions, legend rows (Quicksand 600, muted ink)",
    "px_min": 13, "px_max": 15, "weight": 600, "leading": "1.45", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-meta\">Source — internal kickoff, May 2026.</p>"
  },
  {
    "id": "quote-author",
    "family": "body",
    "purpose": "quote attribution (Quicksand 700, muted ink)",
    "px_min": 14, "px_max": 16, "weight": 700, "leading": "1.4", "tracking": "0", "case": "sentence",
    "sample_html": "<div class=\"t-trole-quote-author\">— A friend, in a workshop</div>"
  },
  {
    "id": "badge",
    "family": "display",
    "purpose": "pill badge text (Fredoka One on butter-yellow fill, charcoal border)",
    "px_min": 13, "px_max": 14, "weight": 400, "leading": "1", "tracking": "0.02em", "case": "sentence",
    "sample_html": "<div><span class=\"t-trole-badge\">New today</span></div>"
  },
  {
    "id": "marker-numeral",
    "family": "display",
    "purpose": "numeral / letter inside a marker circle (Fredoka, white on saturated fill — dark on butter)",
    "px_min": 16, "px_max": 22, "weight": 400, "leading": "1", "tracking": "0.02em", "case": "sentence",
    "sample_html": "<div><span class=\"t-trole-marker-numeral\">1</span></div>"
  }
]
```

The atlas omits the SVG ornament layer (a texture / motif declared in §B + §M) and the framed-header lockup (a §M motif, not a text role).

## §E Motion (GSAP consts — REPLACES site ease)

```js
// Daisy Days motion — bounce-and-settle storybook character
const EASE = {
  entry: "back.out(1.6)", // chunky cards hop in with mild overshoot
  emphasis: "back.out(2.0)", // bigger overshoot for hero moments
  exit: "power2.in", // exits stay quick and clean
  drift: "sine.inOut", // ornaments breathe; rainbow shimmer; sun twinkle
  wobble: "elastic.out(1, 0.5)", // optional: signature joy moment, use sparingly
};
const DUR = {
  snap: 0.18,
  med: 0.5,
  slow: 0.9,
};
// RULE: cards/badges enter with EASE.entry, never with linear or power2.out — the back.out is the brand
// RULE: ornaments use EASE.drift on a continuous yoyo (rotation ±3deg, scale 0.97-1.03) — never freeze
// RULE: do NOT cross-fade scenes. Cut on the beat. The shadow + outline only read on a hard frame change.
// RULE: text-shadow on headlines must animate IN with the headline, not after — they're one object
// RULE: EASE.wobble is for ONE element per scene at most (the focal stat number, a sticker pop) — overuse turns the system into a toy
```

**§E.5 Motion choreography**

- **Atmosphere:** ornaments (daisies, stars, suns, clouds, rainbows) drift continuously on `EASE.drift`. Stagger rotation phase 0-2s across instances so the field never moves in lockstep.
- **Entry vocabulary:** cards bounce up from `y: 24, scale: 0.94, opacity: 0` to rest. Stagger 0.06-0.08s between siblings in a grid (week-card row, info-card grid, team-grid).
- **Emphasis:** numbers/stats count up on `EASE.emphasis` with a one-shot wobble on the final value. Display headlines pop in on `EASE.entry` with a 0.5x letter-by-letter stagger when budget allows.
- **Exits:** quick fade + 8-12px upward drift on `EASE.exit` over `DUR.snap`. Ornaments fade last.
- **Transitions:** **hard cut** between scenes — no crossfade, no slide. The charcoal outline must land on a clean frame to read sticker-on-paper.
- **Forbidden gestures:** blur, parallax, perspective tilt past 6°, motion-blur trails, gradient sweeps, glass refraction. The system is 2D and graphic.

## §G Voice transform recipe

1. Keep sentence case — never UPPERCASE. Fredoka is loud on its own; shouting breaks the storybook warmth.
2. Strip corporate hedges (`leverage`, `enable`, `solutions`, `seamlessly`, `holistic`) and connectives where the line still reads.
3. Prefer short, friendly fragments. 4-8 words per line for headlines; 6-12 for subheads.
4. Use commas, em-dashes, and exclamation points sparingly but warmly. Never trail with `.` on a headline.
5. End with one warm word as a closer when possible — `today`, `friends`, `welcome`, brand-name.
6. Pastel surfaces want softer copy ("Let's begin"); cream surfaces can carry the meatier line ("A friendlier way to build").

**Example:**

- IN: `Our platform enables teams to seamlessly collaborate across complex workflows in real time`
- OUT: `Teams, working together — in real time. Welcome.`

## §H Scene composition hints

- **One main subject per scene.** A single card / frame / grid lives at the center, max-width well inside the slide padding. Two competing panels reads anxious; let one focal region carry the beat.
- **Wreath every scene with 3-7 SVG ornaments** clustered at corners. Crop them past the edge (`top: -30px / right: -20px` style). An empty corner reads as broken — ornaments are structural, not garnish.
- **Surface alternation:** rotate scenes through `var(--surface-cream)` (cover, info), `var(--surface-pastel-primary)` (welcome, week), `var(--surface-pastel-secondary)` (timeline, quote), `var(--surface-pastel-accent)` (process, donut). Don't repeat the same surface back-to-back.
- **Headline shadow rule:** on a saturated pastel surface, every Fredoka headline carries `var(--shadow-text-bold)` and switches to white. On cream or on a white card, headline sits flat in `var(--ink)`. This is non-optional — skipping it on a colored surface breaks the system.
- **Brand-color role contract:**
  - `var(--brand-primary)` → focal sticker fills (daisy centers, star fills), primary card surfaces
  - `var(--brand-secondary)` → soft sticker fills (cloud bands, rainbow stripes), divider rules
  - `var(--brand-accent)` → marker dots (timeline node, step circle), single high-attention spot
  - `var(--ink)` → every border, every shadow, every SVG stroke. Never colored.
- **Bullet rule:** body lists use outlined 20px discs with butter-yellow fill (`var(--brand-secondary)` 50% tint). Never glyph bullets, never bare hyphens.
- **Marker rotation:** when a sequence of dots/steps is needed (timeline rows, process steps, day-headers), rotate fills through `accent → secondary → primary → soft` so each beat has a distinct color. Never one color for all.
- **Type roles:** display font (Fredoka One register) for any text > 1.3rem; body font (Quicksand register) for any text < 1.3rem. The size threshold IS the role boundary. No exceptions.
- **Forbidden:** colored borders, dashed lines, square corners outside legend swatches, blurred or rgba shadows, gradients, glow effects, photo backdrops, italic display text.
- **Transition default:** hard cut on the beat. Ornaments fade out last, cards exit first.

## §M Atomic motifs (gestures the plan agent can reference)

Each motif is a **single reusable gesture** that lives inside a larger pattern. Patterns compose motifs; motifs do not compose anything. The plan agent treats motifs as the smallest cite-able vocabulary — a scene description can say "uses motif:badge-pill on the welcome card" without specifying which pattern the card sits in.

```motifs
[
  {
    "id": "outlined-card",
    "label": "Outlined card",
    "role": "sticker-on-paper-depth",
    "surface_safe": ["cream", "pastel"],
    "description": "White card with 3px charcoal border, 20px radius, and a 6px/6px/0 hard offset shadow. The system's signature elevation — sticker-on-paper, never blurred. Pair with corner ornaments to read as a storybook spread.",
    "wide": true,
    "demo": "<div class=\"dc-motif-card\"><div class=\"dc-motif-card-title\">Workshop tomorrow</div><div class=\"dc-motif-card-body\">Bring a notebook and a kind word.</div></div>",
    "css": ".dc-motif-card{display:inline-block;background:#fff;border:3px solid var(--ink);border-radius:20px;box-shadow:6px 6px 0 var(--ink);padding:20px 28px;max-width:32ch}.dc-motif-card-title{font-family:var(--f-disp-native);font-weight:400;font-size:clamp(20px,2vw,28px);line-height:1.15;letter-spacing:.02em;color:var(--ink);margin-bottom:6px}.dc-motif-card-body{font-family:var(--f-body-native);font-weight:500;font-size:clamp(14px,1.2vw,16px);line-height:1.5;color:var(--ink)}"
  },
  {
    "id": "framed-header",
    "label": "Framed header",
    "role": "two-part-stack",
    "surface_safe": ["cream"],
    "description": "Two-part stacked card: a pastel header strip (any saturated surface) with rounded top corners sits flush above a white body with rounded bottom corners. Single 3px ink border wraps both halves; a single offset shadow under the unit. Reach for this when a card needs a tonal cap (welcome frame, section intro).",
    "wide": true,
    "demo": "<div class=\"dc-motif-framed\"><div class=\"dc-motif-framed-head\">Welcome</div><div class=\"dc-motif-framed-body\">A friendlier way to begin the week — together.</div></div>",
    "css": ".dc-motif-framed{display:inline-block;border:3px solid var(--ink);border-radius:28px;box-shadow:6px 6px 0 var(--ink);overflow:hidden;max-width:34ch}.dc-motif-framed-head{background:var(--brand-secondary);padding:14px 28px;text-align:center;font-family:var(--f-disp-native);font-weight:400;font-size:clamp(18px,1.8vw,24px);line-height:1.15;letter-spacing:.02em;color:var(--ink);border-bottom:3px solid var(--ink)}.dc-motif-framed-body{background:#fff;padding:18px 28px;font-family:var(--f-body-native);font-weight:600;font-size:clamp(14px,1.3vw,16px);line-height:1.5;color:var(--ink)}"
  },
  {
    "id": "badge-pill",
    "label": "Badge pill",
    "role": "section-tag",
    "surface_safe": ["cream", "pastel"],
    "description": "Short rounded-pill chip with 3px ink border and butter-yellow fill (the system's default highlight color). Fredoka One at small scale, 0.02em tracking. Reserve for section eyebrows / 'new' tags — overuse turns every card into a tagged item.",
    "demo": "<span class=\"dc-motif-badge\">New today</span>",
    "css": ".dc-motif-badge{display:inline-block;background:var(--anchor-butter);border:3px solid var(--ink);border-radius:50px;padding:8px 20px;font-family:var(--f-disp-native);font-weight:400;font-size:clamp(13px,1.1vw,14px);line-height:1;letter-spacing:.02em;color:var(--ink)}"
  },
  {
    "id": "marker-dot",
    "label": "Marker dot",
    "role": "step-anchor",
    "surface_safe": ["cream", "pastel"],
    "description": "Outlined coloured disc (48px) holding a Fredoka numeral or single letter. White text on saturated fills, dark text on butter. Used as timeline node, step marker, or numbered list anchor. Cycle fills through coral → mint → sky → lavender → butter across a sequence — never one color for all.",
    "demo": "<div class=\"dc-motif-dots\"><span class=\"dc-motif-dot dc-dot-1\">1</span><span class=\"dc-motif-dot dc-dot-2\">2</span><span class=\"dc-motif-dot dc-dot-3\">3</span><span class=\"dc-motif-dot dc-dot-4\">4</span></div>",
    "css": ".dc-motif-dots{display:flex;gap:14px;align-items:center}.dc-motif-dot{width:48px;height:48px;border-radius:50%;border:3px solid var(--ink);display:inline-flex;align-items:center;justify-content:center;font-family:var(--f-disp-native);font-weight:400;font-size:clamp(16px,1.4vw,20px);line-height:1;letter-spacing:.02em;color:#fff}.dc-motif-dot.dc-dot-1{background:var(--brand-accent)}.dc-motif-dot.dc-dot-2{background:color-mix(in srgb,var(--brand-primary) 60%, var(--anchor-cream))}.dc-motif-dot.dc-dot-3{background:color-mix(in srgb,var(--brand-secondary) 55%, var(--anchor-sky))}.dc-motif-dot.dc-dot-4{background:var(--anchor-butter);color:var(--ink)}"
  },
  {
    "id": "bullet-disc",
    "label": "Bullet disc",
    "role": "list-marker",
    "surface_safe": ["cream", "pastel"],
    "description": "20px outlined butter-yellow disc as a ::before bullet on body lists. Aligned 4px from the top of the first text line (x-height, not baseline). Never glyph bullets, never bare hyphens — the disc IS the list voice.",
    "demo": "<ul class=\"dc-motif-bullets\"><li>One kind thing per line.</li><li>Outlined butter discs only.</li><li>Never glyph bullets.</li></ul>",
    "css": ".dc-motif-bullets{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:14px}.dc-motif-bullets li{font-family:var(--f-body-native);font-weight:600;font-size:clamp(14px,1.3vw,16px);line-height:1.5;color:var(--ink);padding-left:32px;position:relative}.dc-motif-bullets li::before{content:\"\";position:absolute;left:0;top:4px;width:20px;height:20px;background:var(--anchor-butter);border:2px solid var(--ink);border-radius:50%}"
  },
  {
    "id": "quote-mark",
    "label": "Quote mark",
    "role": "quote-anchor",
    "surface_safe": ["cream", "pastel"],
    "description": "Oversized Fredoka `\"` glyph in soft-pink, anchored above a quote body. Non-optional whenever a quote appears — quotes without the pink mark read as a stray headline.",
    "demo": "<div class=\"dc-motif-quote\"><div class=\"dc-motif-quote-mark\">&ldquo;</div><div class=\"dc-motif-quote-body\">A small kindness, repeated daily, becomes the work.</div></div>",
    "css": ".dc-motif-quote{display:inline-flex;flex-direction:column;align-items:center;text-align:center;max-width:32ch}.dc-motif-quote-mark{font-family:var(--f-disp-native);font-weight:400;font-size:clamp(48px,5vw,72px);line-height:1;color:var(--anchor-blush);margin-bottom:6px}.dc-motif-quote-body{font-family:var(--f-disp-native);font-weight:400;font-size:clamp(18px,2vw,28px);line-height:1.35;letter-spacing:.02em;color:var(--ink)}"
  },
  {
    "id": "headline-shadow",
    "label": "Headline shadow",
    "role": "outlined-display",
    "surface_safe": ["pastel"],
    "description": "3px solid charcoal text-shadow under a white Fredoka headline placed on a saturated pastel surface. Non-optional — skipping it on a colored surface breaks the outlined-shape vocabulary. Headlines on cream / on a white card sit flat without the shadow.",
    "wide": true,
    "demo": "<div class=\"dc-motif-hshadow-wrap\"><div class=\"dc-motif-hshadow\">This week's lineup</div></div>",
    "css": ".dc-motif-hshadow-wrap{background:color-mix(in srgb,var(--brand-primary) 40%, var(--anchor-cream));padding:28px 36px;border:3px solid var(--ink);border-radius:20px;display:inline-block}.dc-motif-hshadow{font-family:var(--f-disp-native);font-weight:400;font-size:clamp(32px,4vw,56px);line-height:1.1;letter-spacing:.02em;color:#fff;text-shadow:3px 3px 0 var(--ink)}"
  }
]
```

The `motifs` JSON block above is the SOLE source of truth. build-design.mjs reads it to render §M cards in design.html. The Phase 3 plan agent and Phase 4b scene worker may cite motifs by `id` when annotating which gesture a scene relies on.

**Materials lexicon** (informational — these are the composition atoms behind the patterns):

- outlined-card · framed-header · badge-pill · marker-dot · bullet-disc · quote-mark · headline-shadow · sticker-cluster · pill-counter · step-circle-lg · avatar-circle

## §I Page-level CSS

```css
/* ── Preset-native typography vars (loaded via preset-meta.chromeFonts.googleFontsHref).
 * These let the doc chrome render in Fredoka One + Quicksand regardless of which
 * brand DNA the preset is applied to. The §6 component preview, §M motifs grid,
 * and §T type-role atlas also read these via .preset-native-scope.
 *
 * Daisy Days is a two-face system — the script slot points at Fredoka One
 * because the storybook voice refuses a third face; mono is reserved as the
 * metadata fallback only. Fallback chains end in a face that still carries
 * the rounded-display vibe (Baloo 2 / Comfortaa for display; Nunito for body). */
:root {
  --f-disp-native:
    "Fredoka One", "Fredoka", "Baloo 2", "Comfortaa", "Nunito", system-ui, sans-serif;
  --f-body-native:
    "Quicksand", "Nunito", "Comfortaa", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --f-script-native:
    "Fredoka One", "Fredoka", "Baloo 2", "Comfortaa", "Nunito", system-ui, sans-serif;
  --f-mono-native:
    "JetBrains Mono", "IBM Plex Mono", "Space Mono", "Menlo", ui-monospace, monospace;
}

/* .preset-native-scope: re-bind brand DNA font tokens to preset-native families.
 * Wraps §6 component previews, §M motif demos, and §T type-role atlas so
 * var(--font-*) resolves to Fredoka One / Quicksand regardless of brand DNA.
 * Paste-ready component source is untouched — Phase 4b still grep + paste the
 * original `var(--font-display)` tokens, which resolve to brand DNA at
 * scene-render time. */
.preset-native-scope {
  --font-display: var(--f-disp-native);
  --font-body: var(--f-body-native);
  --font-script: var(--f-script-native);
  --font-mono: var(--f-mono-native);
}

/* Daisy Days — make design.html itself read as a storybook spread */
body {
  background: var(--surface-cream);
}

.ds-section {
  border: var(--border-bold);
  border-radius: var(--radius-card-lg);
  box-shadow: var(--shadow-card);
  background: #ffffff;
  margin-bottom: 2.4rem;
}

.ds-section h2 {
  font-family: var(--font-display);
  letter-spacing: 0.02em;
}

.ds-component-preview {
  border: var(--border-bold);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-small);
  background: var(--surface-cream);
}

.ds-code {
  border: var(--border-thin);
  border-radius: 12px;
  background: #fffaf0;
}

/* ── §M Motifs grid: atomic gestures.
 * 12-col grid of small cards each teaching ONE reusable gesture. Cards may
 * declare a surface (cream / pastel) to demonstrate the gesture against its
 * native bg. */
.ds-motif-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 18px;
}
.ds-motif {
  grid-column: span 4;
  min-height: 280px;
  padding: 28px;
  border: var(--border-bold);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-small);
  background: #ffffff;
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
  background: var(--surface-cream);
}
.ds-motif.ds-motif-surface-pastel {
  background: var(--surface-pastel-primary);
}
.ds-motif-h {
  margin: 0;
  font-family: var(--f-disp-native);
  font-weight: 400;
  font-size: clamp(20px, 2vw, 30px);
  line-height: 1.1;
  letter-spacing: 0.02em;
  color: var(--ink);
}
.ds-motif-desc {
  margin: 0;
  font-family: var(--f-body-native);
  font-weight: 500;
  font-size: 14px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--ink) 72%, transparent);
  max-width: 32ch;
}
.ds-motif-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
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
  opacity: 0.45;
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

/* ── §T Type-role atlas. Container = outlined card look (sticker-on-paper).
 * Each .ds-trole-row stacks padding only (no internal grid) — the role's
 * sample stretches full width within the card so display-cover scale reads
 * honestly. Family selectors use var(--font-*) tokens so the atlas renders
 * in BRAND DNA fonts; only the recipe is preset-declared. */
.ds-trole-box {
  display: flex;
  flex-direction: column;
  border: var(--border-bold);
  border-radius: var(--radius-card-lg);
  background: #ffffff;
  box-shadow: var(--shadow-card);
  overflow: hidden;
  margin-top: 24px;
}
.ds-trole-row {
  padding: 28px 32px;
  border-bottom: var(--border-thin);
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

/* ── Type-role samples. Each .t-trole-* class mirrors a daisy-days type-scale
 * entry but uses var(--font-display/body/script/mono) so the actual typeface
 * comes from brand DNA. Decoration (color, text-shadow, fill, border,
 * surface backing) is preset-native and stays declared with hard-coded
 * daisy-days colors (var(--ink), var(--anchor-butter), var(--brand-*), etc). */
.t-trole-display-cover {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(52px, 7vw, 112px);
  line-height: 1.1;
  letter-spacing: 0.02em;
  color: var(--ink);
}
.t-trole-headline {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(40px, 5vw, 72px);
  line-height: 1.1;
  letter-spacing: 0.02em;
  color: var(--ink);
}
.t-trole-headline-pastel-wrap {
  display: inline-block;
  background: var(--surface-pastel-primary);
  border: var(--border-bold);
  border-radius: var(--radius-card);
  padding: 24px 32px;
}
.t-trole-headline-pastel {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(40px, 5vw, 72px);
  line-height: 1.1;
  letter-spacing: 0.02em;
  color: #ffffff;
  text-shadow: var(--shadow-text-bold);
}
.t-trole-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(28px, 3.5vw, 48px);
  line-height: 1.15;
  letter-spacing: 0.02em;
  color: var(--ink);
}
.t-trole-quote-text {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(22px, 2.5vw, 36px);
  line-height: 1.35;
  letter-spacing: 0.02em;
  color: var(--ink);
  max-width: 28ch;
}
.t-trole-subtitle {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(20px, 2vw, 28px);
  line-height: 1.2;
  letter-spacing: 0.02em;
  color: var(--ink);
}
.t-trole-label-display {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(16px, 1.5vw, 21px);
  line-height: 1.3;
  letter-spacing: 0.02em;
  color: var(--ink);
}
.t-trole-number-hero {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(80px, 11vw, 152px);
  line-height: 1;
  letter-spacing: 0.02em;
  color: var(--brand-accent);
}
.t-trole-body-strong {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: clamp(15px, 1.4vw, 18px);
  line-height: 1.5;
  color: var(--ink);
  max-width: 50ch;
  margin: 0;
}
.t-trole-body {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: clamp(15px, 1.3vw, 18px);
  line-height: 1.6;
  color: var(--ink);
  max-width: 60ch;
  margin: 0;
}
.t-trole-meta {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: clamp(13px, 1.1vw, 15px);
  line-height: 1.45;
  color: color-mix(in srgb, var(--ink) 60%, transparent);
  max-width: 60ch;
  margin: 0;
}
.t-trole-quote-author {
  font-family: var(--font-body);
  font-weight: 700;
  font-size: clamp(14px, 1.2vw, 16px);
  line-height: 1.4;
  color: color-mix(in srgb, var(--ink) 60%, transparent);
}
.t-trole-badge {
  display: inline-block;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(13px, 1.1vw, 14px);
  line-height: 1;
  letter-spacing: 0.02em;
  color: var(--ink);
  background: var(--anchor-butter);
  border: var(--border-bold);
  border-radius: var(--radius-pill);
  padding: 8px 20px;
}
.t-trole-marker-numeral {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: var(--border-bold);
  background: var(--brand-accent);
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(16px, 1.5vw, 22px);
  line-height: 1;
  letter-spacing: 0.02em;
  color: #ffffff;
}
```
