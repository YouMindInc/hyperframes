```preset-meta
{
  "name": "retro-zine",
  "label": "Retro Zine",
  "fingerprint": {
    "shadow": "paper-on-paper-offset-slab",
    "border": "3px-solid-ink",
    "motion": "soft-paper-shuffle",
    "density": "editorial-medium-high",
    "contrast": "warm-paper-on-forest",
    "palette-mode": "anchored-pastel"
  },
  "match_signals": [
    { "kind": "condensed_display", "weight": 0.3 },
    { "kind": "thick_solid_border", "weight": 0.25 },
    { "kind": "minimal_decoration", "weight": 0.15 },
    { "kind": "low_saturation", "weight": 0.1 }
  ],
  "best_for": ["publishers", "music + arts brands", "small-batch / craft launches", "creator portfolios", "community decks"],
  "avoid_for": ["polished digital", "hi-tech neon palettes", "consumer SaaS hype", "fintech / enterprise"],
  "chromeFonts": {
    "googleFontsHref": "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600&family=Caveat:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
    "display": "Bebas Neue",
    "body": "Space Grotesk",
    "script": "Caveat",
    "mono": "JetBrains Mono"
  }
}
```

> `chromeFonts` makes the design.html doc chrome (title-card, section heads, h2/h3, lede paragraphs, eyebrows) render in the preset's NATIVE typography — Bebas Neue + Space Grotesk + Caveat + JetBrains Mono — instead of the brand DNA fonts. The brand fonts still apply to §6 component code (paste-ready for Phase 4b). §M motifs grid uses `.preset-native-scope` so var(--font-display/body/script/mono) re-resolves to these native families for the live preview.

## §A Director's intent

Risograph-printed zine page in motion. Bebas Neue runs tall, condensed, all-caps with positive tracking for every display moment; Space Grotesk sits at editorial small body (13-16px); Caveat hand-script lands attributions and side notes. Three-face contrast IS the rhythm — one-face slides read as monotonous.

Depth is **paper-on-paper offset slabs**, not blurred shadows. Hero cards carry a forest-green `::before` sitting 12px down-and-right behind a cream card. Stamps and collage pieces tilt -8°/+6°/-5°-to-+5° to read as hand-placed. A subtle SVG fractal-noise grain at 0.07 opacity sits over every scene — the texture that anchors the deck to printed-paper register.

**Brand DNA drives accent, anchors carry the paper.** The site brand colors light up headlines, drop caps, ribbon bars, stamp text, offset slabs, and inline accents. The warm khaki canvas (`--anchor-paper`) and soft cream (`--anchor-cream`) are §8.2 anchor hexes — without them dark or saturated brand DNA muddies the printed-paper identity. Body text and structural borders use `var(--ink)`.

**Color role contract**: green-on-khaki = emphasis (drop cap, ribbon bar, hero headline); ink-on-khaki = structure (borders, body, body-paired headlines); cream cards layer on khaki as paper-on-paper. The brand-primary takes the green role. Never reverse it — ink-as-emphasis flips the zine voice.

Motion is soft paper-shuffle: gentle opacity + translateY entries, no overshoot, no glide. Decorative elements pop in with a single light tilt; nothing bounces. Three-face typography never animates a face-swap.

**Class prefix `rz-`** is documented here so future maintainers know to use it on every component selector.

**Best for** sites with editorial / craft / indie / earthy palettes (publishers, music + arts brands, small-batch / craft launches, creator portfolios, community decks). Pairs naturally with high-saturation single-hue brands (forest, oxblood, ochre). High-tech neon palettes still render but the warm-paper register softens the brand voice — use a different preset if "polished digital" is the brief.

**Density is non-negotiable.** A scene that holds only one centered headline reads as underdesigned; the zine register expects supporting moves (eyebrow, drop cap, hand-script, stamp, ribbon, divider stub). Reserve true sparseness for statement / quote beats.

## §B Decoration tokens (merge into design.html `:root`)

Retro Zine declares **structural** tokens here (borders, paper offsets, grain overlay, tape footprint, rotation set) plus **two anchor hexes** that carry the warm-paper identity. Brand DNA flows in via `--brand-primary` / `--brand-secondary` / `--brand-accent` and lights up headlines, drop caps, ribbon bars, and offset slabs.

```css
/* §8.2 exception: paper anchors. Declared once so every khaki/cream surface
   reads as printed paper regardless of brand DNA. Without these anchors, dark
   or high-saturation brands would mute the warm-paper register — breaking the
   zine identity. All other colors source from brand DNA or var(--ink). */
--anchor-paper: #c8b99a; /* warm khaki canvas — default slide surface */
--anchor-paper-dark: #b8a98a; /* tonal sibling for layered surfaces / split halves */
--anchor-cream: #f4efe6; /* soft paper-cream for cards (never pure white) */

/* Structural border weights — black-on-paper. Always var(--ink), no exceptions. */
--border-thick: 3px solid var(--ink); /* card outer, region divider, collage piece */
--border-medium: 2px solid var(--ink); /* column rule, RSVP underline */
--border-fine: 1.5px solid var(--ink); /* grid cell sub-border, ledger header */
--border-hairline: 1px solid color-mix(in srgb, var(--ink) 22%, transparent); /* ledger row divider */

/* Paper-on-paper offset — signature depth move. Slab sits 12px down-right of card. */
--offset-slab: 12px;
--offset-slab-color: var(
  --brand-primary
); /* the green slab; brand-primary carries the emphasis role */

/* Padding scale */
--pad-card-lg: 48px;
--pad-card-md: 32px;
--pad-card-sm: 24px;
--gap-lg: 60px;
--gap-md: 40px;
--gap-sm: 24px;

/* Rotation vocabulary — intentional, never accidental tilt. */
--rot-stamp: -8deg;
--rot-stamp-alt: 6deg;
--rot-collage-a: -3deg;
--rot-collage-b: 4deg;
--rot-collage-c: 2deg;
--rot-collage-d: -5deg;

/* Grain overlay — SVG fractal noise, 0.07 opacity. Required on every scene. */
--grain-svg: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
--grain-opacity: 0.07;
--grain-tile: 200px 200px;
```

## §D Font pairing fallback (if brand fonts not on Google Fonts)

Retro Zine forces its display / body / hand-script trio regardless of site DNA — the three-face contrast is the system's typographic argument. Fallbacks below are only used if the primary face fails to load.

- **display**: `'Bebas Neue'` · `'Oswald'` · `'Anton'` wght 400
- **body**: `'Space Grotesk'` · `'Inter'` · `'IBM Plex Sans'` wght 400
- **mono**: `'Caveat'` · `'Kalam'` · `'Shadows Into Light'` wght 600

Note: the `mono` slot carries the **hand-script** voice (Caveat / Kalam / Shadows Into Light) — Retro Zine has no machine-mono moment. `resolveFont()` reads the slot by name, not by role; using `mono` as the script slot keeps the three-slot contract while binding the system's signature handwritten face.

## §T Type-role atlas (Phase 4b reads this to size text correctly)

Each entry is a **named type role** with concrete render parameters at 1920×1080 — family token, px range, weight, leading, tracking, case, and any color/shadow/rotation decoration. Phase 4b scene workers may cite roles by `id` ("use a `headline` here"); the brand DNA fonts plug in automatically via `var(--font-*)` tokens. This is the same atlas retro-zine ships in its Typography section, ported as machine-readable JSON.

The atlas is the **sole authoring source** for non-component text. If a scene needs a `number-hero` numeral that isn't covered by §6 components, the worker reads role `number-hero` here and writes inline CSS from these values. Do NOT invent ad-hoc sizes.

```type-roles
[
  {
    "id": "display-cover",
    "family": "display",
    "purpose": "cover / opening display headline — brand-primary on khaki",
    "px_min": 48, "px_max": 140, "weight": 400, "leading": "0.88", "tracking": "0.04em", "case": "upper",
    "sample_html": "<div class=\"t-trole-display-cover\">{BRAND_NAME}</div>"
  },
  {
    "id": "headline",
    "family": "display",
    "purpose": "primary section headline (green-on-khaki, the loudest editorial voice)",
    "px_min": 42, "px_max": 90, "weight": 400, "leading": "0.95", "tracking": "0.03em", "case": "upper",
    "sample_html": "<div class=\"t-trole-headline\">Section title</div>"
  },
  {
    "id": "statement",
    "family": "display",
    "purpose": "long-form quoted statement on brand-primary surface (cream type)",
    "px_min": 36, "px_max": 90, "weight": 400, "leading": "1.1", "tracking": "0.02em", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-statement\">Stamped, signed, framed. The zine is the message.</span></div>"
  },
  {
    "id": "number-hero",
    "family": "display",
    "purpose": "hero statistic numeral — brand-primary on khaki",
    "px_min": 80, "px_max": 160, "weight": 400, "leading": "1", "tracking": "0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-number-hero\">63%</div>"
  },
  {
    "id": "drop-cap",
    "family": "display",
    "purpose": "initial cap leading an editorial paragraph (green, floated, line-height 0.8)",
    "px_min": 48, "px_max": 80, "weight": 400, "leading": "0.8", "tracking": "0.02em", "case": "upper",
    "sample_html": "<p class=\"t-trole-body\"><span class=\"t-trole-drop-cap\">F</span>or the zine register, the drop cap is the editorial fingerprint — green Bebas Neue, floated left, body text wraps around.</p>"
  },
  {
    "id": "label-eyebrow",
    "family": "display",
    "purpose": "eyebrow label above a headline, tracked 0.2em (brand-primary)",
    "px_min": 14, "px_max": 18, "weight": 400, "leading": "1.2", "tracking": "0.2em", "case": "upper",
    "sample_html": "<div class=\"t-trole-label-eyebrow\">Vol. 01 — May 2026</div>"
  },
  {
    "id": "label-spaced",
    "family": "body",
    "purpose": "tracked all-caps small label (Space Grotesk 600, ink)",
    "px_min": 12, "px_max": 14, "weight": 600, "leading": "1.2", "tracking": "0.25em", "case": "upper",
    "sample_html": "<div class=\"t-trole-label-spaced\">Section meta · Issue 03</div>"
  },
  {
    "id": "caption-feature",
    "family": "display",
    "purpose": "tracked all-caps caption / feature callout (Bebas, ink)",
    "px_min": 13, "px_max": 15, "weight": 400, "leading": "1.2", "tracking": "0.2em", "case": "upper",
    "sample_html": "<div class=\"t-trole-caption-feature\">— printed in this issue —</div>"
  },
  {
    "id": "body-md",
    "family": "body",
    "purpose": "lead paragraph or emphasized body (Space Grotesk 400)",
    "px_min": 14, "px_max": 18, "weight": 400, "leading": "1.6", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body-md\">A lead paragraph carries the zine's argument — small body type, generous line-height, never above 18px.</p>"
  },
  {
    "id": "body",
    "family": "body",
    "purpose": "standard paragraph body (13-16px magazine column density)",
    "px_min": 13, "px_max": 16, "weight": 400, "leading": "1.7", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body\">Body holds at 13-16px. Tight measure, no italic — the hand-script does the curve.</p>"
  },
  {
    "id": "hand-script",
    "family": "script",
    "purpose": "author attribution / decorative byline (Caveat 600)",
    "px_min": 22, "px_max": 36, "weight": 600, "leading": "1.3", "tracking": "0", "case": "sentence",
    "sample_html": "<div class=\"t-trole-hand-script\">— our founding principle since day one</div>"
  },
  {
    "id": "hand-script-sm",
    "family": "script",
    "purpose": "small handwritten label or side note",
    "px_min": 16, "px_max": 22, "weight": 400, "leading": "1.3", "tracking": "0", "case": "sentence",
    "sample_html": "<div class=\"t-trole-hand-script-sm\">jotted in the margin</div>"
  },
  {
    "id": "stamp-mark",
    "family": "display",
    "purpose": "approval stamp — ink bg, brand-primary text + 2px border, rotated -8deg",
    "px_min": 16, "px_max": 22, "weight": 400, "leading": "1", "tracking": "0.1em", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-stamp-mark\">Stamped — Vol. 01</span></div>"
  },
  {
    "id": "inline-highlight",
    "family": "body",
    "purpose": "black-on-khaki marker swipe inside a body paragraph (never green)",
    "px_min": 13, "px_max": 16, "weight": 600, "leading": "1.7", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body\">A paragraph that needs to <span class=\"t-trole-inline-highlight\">lift one phrase</span> uses the marker treatment.</p>"
  },
  {
    "id": "ribbon-bar",
    "family": "display",
    "purpose": "brand-primary color block with cream uppercase Bebas — section label / accent strip",
    "px_min": 14, "px_max": 20, "weight": 400, "leading": "1", "tracking": "0.15em", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-ribbon-bar\">Featured this issue</span></div>"
  },
  {
    "id": "chip",
    "family": "body",
    "purpose": "tabular ledger category tag (Space Grotesk uppercase, brand-primary fill, cream text)",
    "px_min": 11, "px_max": 13, "weight": 600, "leading": "1", "tracking": "0.06em", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-chip\">Manifesto</span></div>"
  }
]
```

The atlas omits `grain-overlay` (it's a texture, declared in §B decoration tokens) and `card-offset` (a depth motif, declared in §M atomic motifs).

## §E Motion (GSAP consts — REPLACES site ease)

```js
const EASE = {
  entry: "power2.out", // soft paper-shuffle — the template uses cubic-bezier(0.22, 1, 0.36, 1), Material-ish; we map to power2.out for a calm editorial arrival
  emphasis: "power3.out", // statement / quote / stamp punch — slightly firmer than entry, still no overshoot
  exit: "power2.in", // accelerate off the page
  drift: "sine.inOut", // ambient grain-tile drift / hand-script settle
};
const DUR = {
  snap: 0.18,
  med: 0.5,
  slow: 0.9,
};
// RULE: never use back/elastic/bounce. The zine register is "considered editorial" —
//       overshoot reads as digital flourish and breaks the printed-paper voice.
// RULE: stamps and collage pieces enter with a soft fade + slight scale (0.94 → 1),
//       NOT a rotation tween. Rotation is the static signature — animating it
//       turns a hand-placed stamp into a spinning gif. Set the rotation as the
//       starting AND ending value.
// RULE: hand-script (Caveat) elements animate with a write-on or simple fade.
//       Never tween letter-spacing on Caveat — the ballpoint voice depends on
//       fixed kerning.
// RULE: grain overlay never animates. It is a static texture; movement turns it
//       into TV static.
```

### §E.5 Motion choreography

**Allowed primitives**

- Soft fade + 20px translateY entry on the primary scene moment (matches template's `.slide` enter).
- Drop cap pop: 0 → 1 opacity + 0.94 → 1 scale on `EASE.emphasis`, no overshoot.
- Ribbon bar wipe-in: scaleX 0 → 1 with `transform-origin: left`, on `EASE.entry`.
- Collage piece settle: each piece fades in with a 80-120ms stagger; rotation stays fixed throughout.
- Tape settle: short fade-in only — taped pieces don't slide into place.
- Hand-script attribution: opacity fade-in 100-200ms after the headline lands. Never type-on with a cursor (mismatched register).
- Stamp-mark arrival: scale 1.1 → 1 + opacity 0 → 1 on `EASE.emphasis` — a single "thunk" feel.

**Forbidden**

- back / elastic / bounce eases on any element.
- Crossfading between scenes (the template's slide opacity 0.6s is acceptable, but for scene-level transitions in the video, use a clean fade — never blur, slide, or zoom).
- Animating rotation on stamps / collage pieces. Rotation is a static signature.
- Tweening Caveat letter-spacing or `font-weight`.
- More than ±8° tilt on any element. Beyond that, hand-placed becomes broken.
- Modern blurred `box-shadow` reveals. All depth is paper-offset / rotation / grain.
- Pure white (#ffffff) anywhere. Use `--anchor-cream` for "white" surfaces.

**Stagger budget**

120-200ms between elements. Slower than 8-bit-orbit (80-120ms), in line with editorial pacing. Total scene-in stagger ≤ 700ms.

## §G Voice transform recipe (apply to brand's voice from §1 DNA)

Take the brand's product description / value prop. Transform with:

1. Keep editorial sentence-case for body copy (the zine register IS small body type at 13-16px) — do not UPPERCASE paragraphs.
2. Hero headlines: 2-4 words MAX, UPPERCASE, tracked 0.04em (Bebas Neue treatment). Break across two lines when a phrase has a natural pivot.
3. Eyebrow labels / chips / kicker: UPPERCASE, tracked 0.2-0.25em (Bebas Neue or Space Grotesk weight 600).
4. Stats / numerals: bare numeric in Bebas Neue (`340%`, `$12.4M ARR`), paired with a Caveat hand-script label below ("year-over-year growth").
5. Hand-script lines = personal / attributional: bylines, asides, "filled-by-hand" form values. Sentence case, em-dash openers OK ("— Our founding principle since day one").
6. CTAs / stamp text: 1-3 words UPPERCASE on the stamp-mark (`CONTACT US`, `SHIP IT`, `JOIN US`); tracked 0.1em.

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: hero=`DESIGN. TOGETHER.` / eyebrow=`REAL-TIME` / hand-script=`— for the teams that ship` / stamp=`JOIN US`

## §H Scene composition hints (Phase 4b layout guidance)

**Surface alternation across scenes**

- Default scene: warm-khaki canvas (`--anchor-paper`) + grain overlay + 3px ink structural borders. ~70% of scenes.
- Statement scene: full-bleed `--brand-primary` ground + cream divider stubs + Bebas Neue quote in cream + Caveat byline. Use once per video as the manifesto beat.
- Editorial scene: khaki canvas with a single 2px ink column rule splitting two body columns; drop cap leads the left column. For dense narrative moments.
- Closing scene: ink (`var(--ink)`) ground + khaki text + brand-primary divider stub + Caveat sign-off. Mirror of the statement beat; pair them at scene 1 + last.
- Never two consecutive statement scenes — the brand-primary full-bleed loses impact if back-to-back.

**Hero text**

- One Bebas Neue headline per scene. Default color: `var(--brand-primary)` on khaki; `var(--anchor-cream)` on brand-primary / ink grounds; `var(--ink)` on column-paired layouts where the headline reads as a label rather than emphasis.
- Hero takes ≥ 50% canvas width on hero scenes. Tracking 0.02-0.04em mandatory; Bebas without positive tracking reads as cramped.
- Never two hero-tier Bebas headlines per scene.
- Pair hero with eyebrow (Bebas tracked 0.2em) or hand-script (Caveat) below — never both above; the eyebrow goes above, hand-script below.

**Brand color placement (role contract)**

- `--brand-primary` carries the **emphasis** role — headlines, drop caps, ribbon bars, offset slab behind cards, stamp borders, divider stubs.
- `--brand-secondary` is the hover / slightly-brighter sibling — secondary CTAs, alternate ribbon bars, accent rule under an eyebrow. Use sparingly (≤1 per scene).
- `--brand-accent` carries the **tag** role — chip fills inside ledger rows, categorical badges. Never as a headline color.
- `var(--ink)` is structure — borders, body text, label fills (when inverted). Never as emphasis (ink-as-emphasis flips the green-as-emphasis contract).
- One scene = one brand color carrying emphasis. Splitting emphasis across two brand colors dilutes the zine voice.

**Paper anchors are sacred**

- Every "white" surface uses `--anchor-cream`, never `#ffffff`.
- Every khaki surface uses `--anchor-paper` or `--anchor-paper-dark`. The split-screen pattern uses both halves with a 3px ink rule between.
- Pure black (`#000`) is wrong — use `var(--ink)` (the brand-derived dark ink, defaults to `#1A1A1A`-ish).

**Structural borders**

- Card outer / collage piece / region divider: `var(--border-thick)` (3px).
- Column rule / RSVP underline / stamp-mark border: `var(--border-medium)` (2px).
- Grid cell sub-border / ledger header: `var(--border-fine)` (1.5px).
- Ledger row divider: `var(--border-hairline)` (1px @ 22% ink). NEVER use as a primary divider.
- Borders are always ink. The stamp-mark green border is the single colored-border exception.

**Rotation vocabulary**

- Stamps: `-8deg` (default) or `+6deg` (alt). Reserve for "stamped" elements — badges, approval callouts.
- Collage pieces: cycle `-3deg / +4deg / +2deg / -5deg` across 4 pieces in a single composition. Never two adjacent pieces at the same angle.
- Tape: sharp angles `-40deg` to `+35deg`. Always semi-transparent white.
- No element exceeds ±8° tilt outside the tape vocabulary.

**Density**

- Editorial medium-high. Every scene carries 3-5 supporting moves: eyebrow + hero + hand-script + drop-cap + stamp / ribbon. A scene with just a centered headline reads as broken zine.
- Exception: statement scene runs sparser — one large Bebas quote + Caveat byline + two cream divider stubs framing the quote.

**Transitions between scenes**

- Soft fade. The template uses 0.6s opacity + 20px translateY; for the video, hold to a clean opacity fade between scenes (no slide, no zoom).
- NEVER blur / crossfade with motion / dissolve through a third state.

**Ambient texture (non-negotiable)**

- Grain overlay (`grain-overlay` component) on every single scene, at 0.07 opacity, fixed full-viewport, pointer-events disabled, z-index 9999. Without it, the print register evaporates.

## §M Atomic motifs (gestures the plan agent can reference)

Each motif is a **single reusable gesture** that lives inside a larger pattern. Patterns compose motifs; motifs do not compose anything. The plan agent treats motifs as the smallest cite-able vocabulary — a scene description can say "uses motif:offset-block on the RSVP card" without specifying which pattern the card sits in.

```motifs
[
  {
    "id": "offset-block",
    "label": "Offset block",
    "role": "paper-on-paper-depth",
    "surface_safe": ["paper", "cream"],
    "description": "Brand-primary slab sits 12px down-and-right behind a cream card via ::before. The signature depth move — paper-on-paper underprint, never a blurred shadow. Apply to hero callouts and RSVP-style cards.",
    "wide": true,
    "demo": "<div class=\"rz-motif-offset\"><div class=\"rz-motif-offset-card\">Card front.</div></div>",
    "css": ".rz-motif-offset{position:relative;display:inline-block;padding-right:12px;padding-bottom:12px}.rz-motif-offset-card{position:relative;background:var(--anchor-cream);border:var(--border-thick);padding:24px 32px;font-family:var(--f-disp-native);font-weight:400;font-size:clamp(28px,3vw,48px);line-height:1;letter-spacing:.04em;text-transform:uppercase;color:var(--ink)}.rz-motif-offset-card::before{content:\"\";position:absolute;inset:12px -12px -12px 12px;background:var(--brand-primary);z-index:-1}"
  },
  {
    "id": "rotated-stamp",
    "label": "Rotated stamp",
    "role": "approval-mark",
    "surface_safe": ["paper", "cream"],
    "description": "Ink rectangle, brand-primary text + 2px brand-primary border, rotated -8deg. Reserve for status / approval / 'CONTACT US' callouts — overuse degrades the signal.",
    "demo": "<div class=\"rz-motif-stamp\">Stamp of approval</div>",
    "css": ".rz-motif-stamp{display:inline-block;background:var(--ink);color:var(--brand-primary);border:2px solid var(--brand-primary);padding:10px 24px;font-family:var(--f-disp-native);font-weight:400;font-size:clamp(16px,1.6vw,22px);line-height:1;letter-spacing:.1em;text-transform:uppercase;transform:rotate(-8deg)}"
  },
  {
    "id": "drop-cap",
    "label": "Drop cap",
    "role": "editorial-opener",
    "surface_safe": ["paper", "cream"],
    "description": "Oversized brand-primary Bebas initial that opens an editorial paragraph. Floated left, line-height 0.8, body text wraps around. The system's editorial fingerprint.",
    "wide": true,
    "demo": "<p class=\"rz-motif-drop\"><span>F</span>or the editorial column, the drop cap is the system's signal — every feature-length paragraph opens with one, in brand-primary Bebas Neue.</p>",
    "css": ".rz-motif-drop{margin:0;font-family:var(--f-body-native);font-weight:400;font-size:clamp(14px,1.3vw,17px);line-height:1.6;color:var(--ink);max-width:36ch}.rz-motif-drop span{float:left;font-family:var(--f-disp-native);font-weight:400;font-size:clamp(48px,6vw,80px);line-height:.8;letter-spacing:.02em;text-transform:uppercase;color:var(--brand-primary);margin-right:12px}"
  },
  {
    "id": "ribbon-bar",
    "label": "Ribbon bar",
    "role": "accent-strip",
    "surface_safe": ["paper", "cream"],
    "description": "Brand-primary block with cream uppercase Bebas text. Read as a printed ribbon glued onto the page — section labels, eyebrows, inline highlights.",
    "demo": "<span class=\"rz-motif-ribbon\">Featured · vol. 01</span>",
    "css": ".rz-motif-ribbon{display:inline-block;background:var(--brand-primary);color:var(--anchor-cream);padding:8px 20px;font-family:var(--f-disp-native);font-weight:400;font-size:clamp(14px,1.4vw,20px);line-height:1;letter-spacing:.15em;text-transform:uppercase}"
  },
  {
    "id": "inline-highlight",
    "label": "Inline highlight",
    "role": "marker-swipe",
    "surface_safe": ["paper"],
    "description": "Black-on-khaki marker swipe inside body paragraphs to lift a phrase. The print equivalent of a marker pen. Never green-on-khaki — green inline reads as a typo.",
    "demo": "<p class=\"rz-motif-inline\">The paragraph keeps its calm <span>but lifts this phrase</span> in marker.</p>",
    "css": ".rz-motif-inline{margin:0;font-family:var(--f-body-native);font-weight:400;font-size:clamp(14px,1.3vw,17px);line-height:1.7;color:var(--ink);max-width:36ch}.rz-motif-inline span{background:var(--ink);color:var(--anchor-paper);padding:2px 8px;font-weight:600}"
  },
  {
    "id": "hand-script-byline",
    "label": "Hand-script byline",
    "role": "human-voice",
    "surface_safe": ["paper", "cream", "brand"],
    "description": "Caveat handwritten attribution under a quote or statement. One byline per statement — never two. Pairs with the em-dash opener (\"— our founding principle since day one\").",
    "demo": "<div class=\"rz-motif-byline\">— our founding principle since day one</div>",
    "css": ".rz-motif-byline{font-family:var(--f-script-native);font-weight:600;font-size:clamp(22px,3vw,36px);line-height:1.3;color:var(--ink)}"
  }
]
```

The `motifs` JSON block above is the SOLE source of truth. build-design.mjs reads it to render §M cards in design.html. The Phase 3 plan agent and Phase 4b scene worker may cite motifs by `id` when annotating which gesture a scene relies on.

**Materials lexicon** (informational — these are the composition atoms behind the patterns):

- offset-block · rotated-stamp · drop-cap · ribbon-bar · inline-highlight · hand-script-byline · collage-piece · tape-mark · grain-overlay · diamond-rule

## §I Page-level CSS (overrides design.html's neutral chrome — makes the doc itself read as retro-zine)

```css
/* ── Preset-native typography vars (loaded via preset-meta.chromeFonts.googleFontsHref).
 * These let the doc chrome render in Bebas Neue / Space Grotesk / Caveat / JetBrains Mono
 * regardless of which brand DNA the preset is applied to. The §6 component preview,
 * §M motifs grid also reads these via .preset-native-scope.
 *
 * Fallback chains end in a face that still carries the preset's vibe (Oswald / Anton /
 * Impact for the display slab; Inter for body; system cursives for script). Falling
 * all the way to generic should never happen in practice. */
:root {
  --f-disp-native:
    "Bebas Neue", "Oswald", "Anton", "Impact", "Arial Black", "Helvetica Neue", sans-serif;
  --f-body-native:
    "Space Grotesk", "Inter", "IBM Plex Sans", -apple-system, BlinkMacSystemFont, system-ui,
    sans-serif;
  --f-script-native:
    "Caveat", "Kalam", "Shadows Into Light", "Brush Script MT", "Comic Sans MS", cursive;
  --f-mono-native:
    "JetBrains Mono", "IBM Plex Mono", "Space Mono", "Menlo", ui-monospace, monospace;
}

/* .preset-native-scope: re-bind brand DNA font tokens to preset-native families.
 * Wraps §6 component previews and §M motif demos so
 * var(--font-*) resolves to Bebas Neue / Space Grotesk / Caveat / JetBrains Mono
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
  background: var(--anchor-paper);
  position: relative;
}
body::after {
  /* Grain overlay on design.html itself */
  content: "";
  position: fixed;
  inset: 0;
  background-image: var(--grain-svg);
  background-size: var(--grain-tile);
  opacity: var(--grain-opacity);
  pointer-events: none;
  z-index: 9999;
}
.title-card {
  background: var(--anchor-paper);
  border-bottom: var(--border-thick);
  padding: 96px 0 80px;
}
.title-display {
  font-family: "Bebas Neue", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--brand-primary);
}
.brand-name {
  color: var(--brand-primary);
  font-weight: 400;
}
.style-name {
  color: var(--ink);
  font-weight: 400;
}
.ds-section {
  border-top: var(--border-thick);
  padding: 80px 0;
}
h2 {
  font-family: "Bebas Neue", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--brand-primary);
}
.eyebrow {
  font-family: "Bebas Neue", sans-serif;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.type-card,
.voice-pair,
.comp-card {
  background: var(--anchor-cream) !important;
  border: var(--border-thick) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
/* dna-swatch keeps inline brand-color background */
.dna-swatch {
  border: var(--border-thick) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
.comp-head {
  background: var(--ink) !important;
  color: var(--anchor-paper) !important;
  border-bottom: var(--border-thick) !important;
  font-family: "Bebas Neue", sans-serif;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.ds-code {
  background: var(--anchor-cream) !important;
  border: var(--border-medium);
  border-radius: 0 !important;
  color: var(--ink) !important;
}

/* ── §M Motifs grid: atomic gestures.
 * Mirrors retro-zine-design.html's signature-moves grid — a 12-col grid of
 * small cards each teaching ONE reusable gesture. Cards may declare a surface
 * (paper / cream / brand) to demonstrate the gesture against its native bg. */
.ds-motif-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}
.ds-motif {
  grid-column: span 4;
  min-height: 280px;
  padding: 28px;
  border: var(--border-thick);
  border-radius: 0;
  background: var(--anchor-cream);
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
  background: var(--anchor-paper);
}
.ds-motif.ds-motif-surface-brand {
  background: var(--brand-primary);
  color: var(--anchor-cream);
  border-color: var(--ink);
}
.ds-motif.ds-motif-surface-cream {
  background: var(--anchor-cream);
  color: var(--ink);
}
.ds-motif-h {
  margin: 0;
  font-family: var(--f-disp-native);
  font-weight: 400;
  font-size: clamp(24px, 2.6vw, 36px);
  line-height: 1;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.ds-motif.ds-motif-surface-brand .ds-motif-h {
  color: var(--anchor-cream);
}
.ds-motif-desc {
  margin: 0;
  font-family: var(--f-body-native);
  font-weight: 400;
  font-size: 14px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--ink) 70%, transparent);
  max-width: 30ch;
}
.ds-motif.ds-motif-surface-brand .ds-motif-desc {
  color: color-mix(in srgb, var(--anchor-cream) 85%, transparent);
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
  opacity: 0.45;
}
.ds-motif.ds-motif-surface-brand .ds-motif-id {
  color: var(--anchor-cream);
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

/* ── §T Type-role atlas. Container = paper-on-paper card look. Each .t-trole-*
 * class encodes the role's family / size / weight / leading / tracking / case /
 * decoration. Family selectors use var(--font-*) tokens so the atlas renders
 * in BRAND DNA fonts; only the recipe is preset-declared. */
.ds-trole-box {
  display: flex;
  flex-direction: column;
  border: var(--border-thick);
  border-radius: 0;
  background: var(--anchor-cream);
  overflow: hidden;
  margin-top: 24px;
}
.ds-trole-row {
  padding: 28px 32px;
  border-bottom: var(--border-fine);
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

/* ── Type-role samples. Each .t-trole-* class mirrors a retro-zine type-scale
 * entry but uses var(--font-display/body/mono/script) so the actual typeface
 * comes from brand DNA. Decoration (color, shadow, frame, rotation, stamp,
 * ribbon, marker) is preset-native and stays declared with hard-coded
 * retro-zine colors (var(--brand-primary), var(--ink), etc). */
.t-trole-display-cover {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(48px, 10vw, 140px);
  line-height: 0.88;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-headline {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(42px, 6vw, 90px);
  line-height: 0.95;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-statement {
  display: inline-block;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(36px, 6vw, 90px);
  line-height: 1.1;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--anchor-cream);
  background: var(--brand-primary);
  padding: 24px 32px;
  max-width: 22ch;
}
.t-trole-number-hero {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(80px, 12vw, 160px);
  line-height: 1;
  letter-spacing: 0.02em;
  color: var(--brand-primary);
}
.t-trole-drop-cap {
  float: left;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(48px, 6vw, 80px);
  line-height: 0.8;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--brand-primary);
  margin-right: 12px;
}
.t-trole-label-eyebrow {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(14px, 1.2vw, 18px);
  line-height: 1.2;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-label-spaced {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: clamp(12px, 1vw, 14px);
  line-height: 1.2;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-caption-feature {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(13px, 1.1vw, 15px);
  line-height: 1.2;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-body-md {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(14px, 1.3vw, 18px);
  line-height: 1.6;
  color: var(--ink);
  max-width: 50ch;
  margin: 0;
}
.t-trole-body {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(13px, 1.2vw, 16px);
  line-height: 1.7;
  color: var(--ink);
  max-width: 60ch;
  margin: 0;
}
.t-trole-hand-script {
  font-family: var(--font-script);
  font-weight: 600;
  font-size: clamp(22px, 3vw, 36px);
  line-height: 1.3;
  color: var(--ink);
}
.t-trole-hand-script-sm {
  font-family: var(--font-script);
  font-weight: 400;
  font-size: clamp(16px, 2vw, 22px);
  line-height: 1.3;
  color: var(--ink);
}
.t-trole-stamp-mark {
  display: inline-block;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(16px, 1.5vw, 22px);
  line-height: 1;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brand-primary);
  background: var(--ink);
  border: 2px solid var(--brand-primary);
  padding: 10px 24px;
  transform: rotate(-8deg);
}
.t-trole-inline-highlight {
  display: inline;
  background: var(--ink);
  color: var(--anchor-paper);
  padding: 2px 8px;
  font-family: var(--font-body);
  font-weight: 600;
}
.t-trole-ribbon-bar {
  display: inline-block;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(14px, 1.4vw, 20px);
  line-height: 1;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  background: var(--brand-primary);
  color: var(--anchor-cream);
  padding: 8px 20px;
}
.t-trole-chip {
  display: inline-block;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 12px;
  line-height: 1;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: var(--brand-primary);
  color: var(--anchor-cream);
  padding: 4px 10px;
}
```
