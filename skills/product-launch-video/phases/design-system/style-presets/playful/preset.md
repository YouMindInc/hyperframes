```preset-meta
{
  "name": "playful",
  "label": "Playful",
  "fingerprint": {
    "depth": "double-stroke-offset-border",
    "shape": "asymmetric-organic-blob",
    "motion": "back-overshoot-hand-placed",
    "decoration": "scribbled-svg-doodles",
    "rotation": "micro-tilt-alternating",
    "palette-character": "warm-paper-ink"
  },
  "match_signals": [
    { "kind": "thick_solid_border", "weight": 0.3 },
    { "kind": "bouncy_easing", "weight": 0.2 },
    { "kind": "minimal_decoration", "weight": 0.1 }
  ],
  "best_for": ["indie product launches", "creator portfolios", "lifestyle", "community brands", "friendly research / tech"],
  "avoid_for": ["institutional credibility", "enterprise security", "formal corporate", "high-gravitas brands"],
  "chromeFonts": {
    "googleFontsHref": "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;500&display=swap",
    "display": "Syne",
    "body": "Space Grotesk",
    "script": "Syne",
    "mono": "Space Mono"
  }
}
```

> `chromeFonts` makes the design.html doc chrome (title-card, section heads, h2/h3, lede paragraphs, eyebrows) render in the preset's NATIVE typography — Syne + Space Grotesk + Space Mono — instead of the brand DNA fonts. Playful is a two-face system: Syne does every display/numeric/headline moment, Space Grotesk does body and labels; the `script` slot also points at Syne because Playful refuses a third face (Syne 700 carries the script-adjacent voice via the vertical-spine label motif). The brand fonts still apply to §6 component code (paste-ready for Phase 4b). §M motifs grid and §T type-role atlas use `.preset-native-scope` so var(--font-display/body/script/mono) re-resolves to these native families for the live preview.

## §A Director's intent

Hand-crafted studio editorial on warm paper. Syne display (700-800 weight, negative tracking -0.01 to -0.03em) carries every headline, statement, and numeral; Space Grotesk runs body and labels. The voice is independent studio, not corporate — confident but warm, structured but loose.

Depth is **double-stroke offset borders** — a 3px charcoal outline plus a 6-8px offset ghost border via `::before`. No `box-shadow` blur, no `drop-shadow`. Cards, blocks, and statistics carry small ±0.5deg to ±3deg rotations that alternate across neighbors so nothing reads as snapped to a grid.

**Warm-paper-on-ink contract via hue-anchor tokens (§8.2 exception).** Playful's character is "ink on warm paper" — collapses to mud if brand DNA is cool-toned (blue/green/violet). Three hex anchors (`--anchor-peach`, `--anchor-peach-alt`, `--anchor-cream`) are declared in §B so warm surfaces mix brand-primary at low % with the anchor, preserving the studio register across any brand palette. Brand DNA still flows through for hero text, chip fills, focal accents — the anchors only stabilize the canvas, surface, and image-placeholder slots.

Decoration vocabulary: **asymmetric organic blobs** (border-radius like `40% 60% 70% 30% / 40% 50% 60% 50%`), **pebble shapes** (alternating long/short radii), **inline 2px-stroke SVG scribbles** (squiggle, star, circle, arrow) with rounded line-caps, **doodle circles and rectangles** anchored to slide corners. Every scene gets at least one scribble mark in a corner — punctuation, not content.

Motion is **back-overshoot** — `back.out(1.4)` on entry, `back.out(1.7)` on emphasis. Hand-placed, not gliding. Ambient layers (ghost-blob drift, scribble pen-on drift) use `sine.inOut`. Scene transitions cross-fade gently (0.6s opacity) — never blur, never slide.

**Best for** indie product launches, creator portfolios, lifestyle / community brands, friendly research or tech that wants human warmth. **Avoid for** contexts where institutional credibility outweighs warmth — the warm-paper register is intentionally informal.

**Density philosophy: medium-low.** One dominant element per scene plus one or two scribbles. Crowding the canvas with simultaneous cards, doodles, and copy collapses the hand-touched feeling into clutter.

**Class prefix: `pf-`** (initialism of "playful", 3 chars). Every component CSS class uses this prefix.

## §B Decoration tokens (merge into design.html `:root`)

Playful declares **structural** tokens here (border weights, offset distances, rotation budget, anchor palette). Brand DNA drives hero text, chip fills, focal accents through `--brand-*` vars. The hue-anchor hex set is the **§8.2 exception**: warm-paper character collapses without anchored peach tones when brand DNA is cool-toned.

```css
/* §8.2 exception: warm-paper palette anchors. Declared once so every canvas-
   adjacent surface mixes consistently against brand DNA. Without these anchors,
   cool-toned brands (blue/green/violet) would produce muddy paper surfaces —
   breaking the studio character. Pattern matches storybook precedent in §8.2. */
--anchor-peach: #f0c8a0; /* base warm canvas */
--anchor-peach-alt: #e8b88e; /* slightly darker, image-placeholder surface */
--anchor-cream: #f7dec6; /* slightly lighter, gentle layering */

/* Warm surfaces — brand-primary mixes low into the anchor so brand DNA influences
   temperature without overwriting the paper register. */
--surface-paper: color-mix(in srgb, var(--brand-primary) 18%, var(--anchor-peach));
--surface-paper-alt: color-mix(in srgb, var(--brand-primary) 22%, var(--anchor-peach-alt));
--surface-cream: color-mix(in srgb, var(--brand-primary) 12%, var(--anchor-cream));

/* Border weights — the signature is 3px solid, doubled via offset ghost border */
--border-stroke: 3px solid var(--ink);
--border-stroke-thin: 2px solid var(--ink);
--offset-ghost: 6px; /* distance the ::before ghost border offsets down-right */
--offset-ghost-lg: 8px; /* larger offset for hero / contact-block cards */

/* Rotation budget — adjacent elements alternate sign, never exceed ±3deg */
--tilt-xs: 0.5deg;
--tilt-sm: 1deg;
--tilt-md: 2deg;
--tilt-lg: 3deg;

/* Spacing — slide / card padding scale, in rem */
--pad-card: 1.5rem;
--pad-card-lg: 2rem 3rem;
--gap-sm: 1.5rem;
--gap-md: 2rem;
--gap-lg: 3rem;

/* Decoration — asymmetric organic radii reused across blobs and frames */
--radius-blob-organic: 40% 60% 70% 30% / 40% 50% 60% 50%;
--radius-blob-fill: 60% 40% 30% 70% / 60% 30% 70% 40%;
--radius-blob-pebble: 255px 15px 225px 15px / 15px 225px 15px 255px;
```

## §D Font pairing fallback (if brand fonts not on Google Fonts)

Playful forces Syne display + Space Grotesk body regardless of site DNA — the studio register depends on Syne's quirky humanist proportions and negative tracking. Fallbacks below trigger only if the primary face fails to load.

- **display**: `'Syne'` · `'Fraunces'` · `'Recoleta'` wght 800
- **body**: `'Space Grotesk'` · `'Inter'` · `'IBM Plex Sans'` wght 400
- **mono**: `'Space Mono'` · `'JetBrains Mono'` wght 500

## §T Type-role atlas (Phase 4b reads this to size text correctly)

Each entry is a **named type role** with concrete render parameters at 1920×1080 — family token, px range, weight, leading, tracking, case, and any color/rotation decoration. Phase 4b scene workers may cite roles by `id` ("use a `number-hero` here"); the brand DNA fonts plug in automatically via `var(--font-*)` tokens. This is the Playful type scale (Syne 700/800 + Space Grotesk 400/500/600) ported as machine-readable JSON.

The atlas is the **sole authoring source** for non-component text. If a scene needs a `statement` block that isn't covered by §6 components, the worker reads role `statement` here and writes inline CSS from these values. Do NOT invent ad-hoc sizes — Playful's character collapses if Syne drifts below weight 700 at display scale or if negative tracking is dropped.

```type-roles
[
  {
    "id": "display-hero",
    "family": "display",
    "purpose": "oversized cover or opening date/title — Syne 800 with maximal negative tracking",
    "px_min": 64, "px_max": 144, "weight": 800, "leading": "0.9", "tracking": "-0.03em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-display-hero\">02.05.26</div>"
  },
  {
    "id": "display",
    "family": "display",
    "purpose": "closing or major declarative headline (Syne 800)",
    "px_min": 48, "px_max": 112, "weight": 800, "leading": "0.9", "tracking": "-0.02em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-display\">Thank you. Let us talk.</div>"
  },
  {
    "id": "headline",
    "family": "display",
    "purpose": "primary section headline (Syne 700)",
    "px_min": 40, "px_max": 80, "weight": 700, "leading": "1", "tracking": "-0.01em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-headline\">Section title</div>"
  },
  {
    "id": "statement",
    "family": "display",
    "purpose": "long-form quoted statement or manifesto line (Syne 700)",
    "px_min": 40, "px_max": 72, "weight": 700, "leading": "1.1", "tracking": "-0.01em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-statement\">We believe in raw expression over polished perfection.</div>"
  },
  {
    "id": "title",
    "family": "display",
    "purpose": "region or section title within a slide (Syne 700)",
    "px_min": 32, "px_max": 56, "weight": 700, "leading": "1.1", "tracking": "-0.01em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-title\">Region title</div>"
  },
  {
    "id": "title-sm",
    "family": "display",
    "purpose": "card title within a small block (Syne 700)",
    "px_min": 20, "px_max": 21, "weight": 700, "leading": "1.2", "tracking": "0", "case": "sentence",
    "sample_html": "<div class=\"t-trole-title-sm\">Card title</div>"
  },
  {
    "id": "number-hero",
    "family": "display",
    "purpose": "hero statistic numeral (Syne 800) — may carry ±0.5–1deg micro-rotation",
    "px_min": 64, "px_max": 112, "weight": 800, "leading": "1", "tracking": "-0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-number-hero\">47</div>"
  },
  {
    "id": "number-md",
    "family": "display",
    "purpose": "mid-scale ordinal or stat numeral (Syne 800)",
    "px_min": 36, "px_max": 40, "weight": 800, "leading": "1", "tracking": "-0.01em", "case": "upper",
    "sample_html": "<div class=\"t-trole-number-md\">12</div>"
  },
  {
    "id": "number-sm",
    "family": "display",
    "purpose": "inline ordinal or step numeral (Syne 800)",
    "px_min": 28, "px_max": 32, "weight": 800, "leading": "1", "tracking": "0", "case": "upper",
    "sample_html": "<div class=\"t-trole-number-sm\">01</div>"
  },
  {
    "id": "body-md",
    "family": "body",
    "purpose": "subtitle or emphasized lead body (Space Grotesk 500)",
    "px_min": 18, "px_max": 19, "weight": 500, "leading": "1.6", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body-md\">An emphasized lead paragraph — Space Grotesk 500, slightly larger than default body, carries the subtitle voice.</p>"
  },
  {
    "id": "body",
    "family": "body",
    "purpose": "default paragraph body (Space Grotesk 400)",
    "px_min": 16, "px_max": 18, "weight": 400, "leading": "1.7", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body\">Body sits at 16–18px. Generous line-height, no italic — the studio voice carries calm, conversational sentences.</p>"
  },
  {
    "id": "label-eyebrow",
    "family": "body",
    "purpose": "eyebrow label above a headline — uppercase, tracked 0.15em (Space Grotesk 600)",
    "px_min": 13, "px_max": 14, "weight": 600, "leading": "1.2", "tracking": "0.15em", "case": "upper",
    "sample_html": "<div class=\"t-trole-label-eyebrow\">Overview</div>"
  },
  {
    "id": "caption",
    "family": "body",
    "purpose": "subtitle, fine print, footnote (Space Grotesk 500)",
    "px_min": 13, "px_max": 14, "weight": 500, "leading": "1.4", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-caption\">Founded in 2019. Independent studio.</p>"
  },
  {
    "id": "tag",
    "family": "body",
    "purpose": "pill tag text inside a charcoal label — peach on ink (Space Grotesk 600)",
    "px_min": 11, "px_max": 12, "weight": 600, "leading": "1.2", "tracking": "0.04em", "case": "sentence",
    "sample_html": "<div><span class=\"t-trole-tag\">Editorial</span></div>"
  },
  {
    "id": "vertical-spine",
    "family": "display",
    "purpose": "magazine-spine wayfinder — Syne 700 rotated 90deg, anchored to slide edge",
    "px_min": 22, "px_max": 24, "weight": 700, "leading": "1.2", "tracking": "0.1em", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-vertical-spine\">Scroll down</span></div>"
  }
]
```

The atlas omits `rough-box`, `blob-frame`, `ghost-blob`, `step-node`, `scribble-svg` (those are §M motifs / structural decoration, not text roles) and the double-stroke ghost border (it's a depth motif declared in §M).

## §E Motion (GSAP consts — REPLACES site ease)

```js
const EASE = {
  entry: "back.out(1.4)", // hand-placed arrival with mild overshoot — studio register
  emphasis: "back.out(1.7)", // pronounced overshoot on focal beats (stat reveal, hero pop)
  exit: "power2.in", // gentle accelerate-off, no overshoot
  drift: "sine.inOut", // ghost-blob drift, scribble pen-on, ambient sway
};
const DUR = {
  snap: 0.18,
  med: 0.5,
  slow: 0.9,
};
// RULE: alternate rotation sign across adjacent elements. If card A enters with
//       rotation +0.8deg, the next card enters with -0.5deg (or +0.3deg).
//       Same-sign neighbors read as a tilted canvas, not as hand-placement.
// RULE: never tween beyond ±3deg. The hand-placed feeling tips into wonky past
//       3 degrees. Rest pose should sit within ±0.5 to ±3deg.
// RULE: never use blur / drop-shadow / backdrop-filter on entry. Depth comes
//       from offset ghost borders + rotation. Blurs break the hand-drawn aesthetic.
// RULE: scribble SVG pen-on uses strokeDashoffset tween with EASE.drift
//       over DUR.slow — never EASE.entry (back.out makes pen lines feel mechanical).
```

### §E.5 Motion choreography

**Allowed primitives**

- Back-overshoot snap-in on cards, blocks, stats, and step nodes (back.out 1.4 entry, back.out 1.7 emphasis). Short overshoot, hand-placed final pose.
- Cross-fade scene transitions (0.6s opacity) — soft, never blur, never slide.
- Scribble pen-on: stroke-dashoffset 1 → 0 over DUR.slow with EASE.drift. Use on hero-tier scenes only; secondary scribbles snap visible with the card they accompany.
- Ghost-blob drift: 12-20s sine.inOut on translate + rotate (max ±1deg over the loop, max ±20px translate).
- Rotation rest pose: every card/block/stat enters with a fixed micro-tilt (±0.5deg to ±3deg), randomized per-instance but alternating sign across neighbors.

**Forbidden**

- box-shadow blur on entry or rest (system has no blurred shadows).
- drop-shadow / filter: drop-shadow() at any time.
- Rotation beyond ±3deg on content; vertical-spine label is the only exception (it's anchored at 90deg).
- Slide / dissolve / blur scene transitions. Stick to cross-fade.
- Italic tweens on text emphasis. Switch face or weight instead.
- Uniform same-sign rotation across more than two consecutive elements (reads as tilted canvas).
- Smooth `ease-in-out` on numerics — use EASE.emphasis (back.out 1.7) for stat reveals so the numeral pops with overshoot.

**Stagger budget**

180-260ms between elements (deliberate, studio-paced). Slower than 8-bit-orbit's 80-120ms, faster than editorial's 200-280ms. Total scene-in stagger ≤ 700ms.

## §G Voice transform recipe (apply to brand's voice from §1 DNA)

Take the brand's product description / value prop. Transform with:

1. Keep imperative verbs and proper nouns; drop filler ("really", "very", "just"), drop articles when the line can read as a fragment.
2. Hero headlines: 4-8 words, sentence case (NOT uppercase — uppercase belongs to eyebrow labels only). Syne 800 with negative tracking carries the voice.
3. Eyebrow labels / chips: UPPERCASE with 0.15em tracking (Space Grotesk 600 treatment). Short — 1-3 words.
4. Body copy: sentence case, conversational. Pretend you're writing in a studio sketchbook to a friend, not pitching a board.
5. Stats: bare numeral (Syne 800) + a one-sentence supporting label in sentence case. Never UPPERCASE the label.
6. CTAs: 2-3 word sentence-case verb phrase ("Let us talk", "Start the work", "Say hello"). Charcoal text on outlined card, peach text on filled card.

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: hero=`Teams design together, in real time.` / chip=`REAL-TIME COLLAB` / cta=`Start the work`

## §H Scene composition hints (Phase 4b layout guidance)

**Surface alternation across scenes**

- Default scene: `--surface-paper` (brand-tinted peach) full-bleed background. Most scenes sit here.
- Variant scene: `filled-block` inverted (charcoal ground + peach text on top) for emphasis — reserve for ONE scene per video, the anchor moment.
- Variant scene: `--surface-cream` (slightly lighter) for gentle layering when a region needs to lift one tonal step without introducing white.
- Never introduce white as a surface. The warm canvas is foundational.
- Alternate paper → paper-alt → cream across scenes if all scenes are outlined; insert the single filled-block scene as the anchor beat.

**Hero text**

- One Syne 800 hero moment per scene. Negative letter-spacing (-0.02em to -0.03em). Always `var(--ink)` color on warm surfaces, `var(--canvas)` on filled-block scenes.
- Hero takes ≥ 50% canvas width. Never two hero-tier elements per scene.
- Headlines NEVER tinted with brand color — they stay ink. Brand color appears in accent moments (scribbles tinted to brand-primary if narrative beat justifies, stat numerals can flex to brand-primary on the focal stat).

**Brand color placement (role contract)**

- Default: ink-on-paper. Brand colors do NOT replace ink for body / headline / border / scribble. The system is anchored monochrome.
- Brand-primary may appear as: focal stat numeral fill (one per scene max), scribble stroke (one per scene max as accent), chip text on a filled chip, or as the tint that warms `--surface-paper` via the §B mixes.
- Brand-secondary / brand-accent appear only via the §B surface mixes — they tint the paper, never appear as standalone fills.
- One scene = ink-dominant, brand-primary as accent. Two brand colors in the foreground at once breaks the monochrome discipline.

**Rotation discipline**

- Every card / block / stat / step-node carries a rotation in ±0.5deg to ±3deg.
- Adjacent elements alternate sign. Sequence: -0.5, +0.8, -0.3, +0.5, -0.7 (never +0.5, +0.3, +0.8 in a row).
- The vertical-spine label is the only exception — it's anchored at exactly 90deg.
- Charts, timelines, and grid containers themselves do NOT rotate; only their cells / nodes / bars.

**Decoration vocabulary (every scene picks 1-2, never 4+)**

- Scribble SVG mark in a corner (squiggle, star, circle, arrow). 2px stroke, rounded line-caps, ink color.
- Doodle circle or rect anchored in a corner (3px outlined, rotated).
- Blob-frame with solid blob-fill inside (portrait stand-in for hero / contact scenes).
- Ghost-blob (0.08 opacity oversized organic) as atmospheric wallpaper when negative space feels heavy. Max one per scene, in a corner the content does not occupy.
- Vertical-spine label on the right edge — magazine spine register, reserve for hero / chapter scenes.

**Border + shape discipline**

- Border radius is sharp 0px (cards / blocks / tags), 50% (avatars / step-nodes / doodle-circles), or asymmetric organic (blobs only). Never 4px / 8px / 12px — middle radii read as generic web app.
- Border weight is 3px on outlined cards and blob frames; 2px on offset ghost borders, nav chrome, and timeline tracks; 2px stroke on SVG scribbles. No 1px hairlines.

**Transitions between scenes**

- Cross-fade 0.6s opacity. Never slide, blur, dissolve, or hard-cut.
- A single scribble pen-on at the start of the scene can serve as the "we arrived" beat.

**Ambient motion**

- Ghost-blob slow drift (12-20s sine.inOut) on heavy-negative-space scenes.
- Scribble pen-on (strokeDashoffset over DUR.slow with sine.inOut) on hero scenes.
- Cards / blocks / stats DO NOT drift after entry — they snap to their rotated rest pose and stay.

## §M Atomic motifs (gestures the plan agent can reference)

Each motif is a **single reusable gesture** that lives inside a larger pattern. Patterns compose motifs; motifs do not compose anything. The plan agent treats motifs as the smallest cite-able vocabulary — a scene description can say "uses motif:double-stroke-offset on the team card" without specifying which pattern the card sits in.

```motifs
[
  {
    "id": "double-stroke-offset",
    "label": "Double-stroke offset",
    "role": "card-depth",
    "surface_safe": ["paper", "cream"],
    "description": "3px ink card border + a 2px ::before ghost border offset 6–8px down-and-right. Playful's signature elevation — replaces every blurred shadow. Apply to outlined cards, contact blocks, TOC items, team cards.",
    "wide": true,
    "demo": "<div class=\"pf-motif-offset\">Card front</div>",
    "css": ".pf-motif-offset{position:relative;display:inline-block;background:var(--anchor-peach);border:3px solid var(--ink);padding:24px 32px;font-family:var(--f-disp-native);font-weight:700;font-size:clamp(20px,2vw,28px);line-height:1.1;letter-spacing:-.01em;color:var(--ink)}.pf-motif-offset::before{content:\"\";position:absolute;top:6px;left:6px;right:-6px;bottom:-6px;border:2px solid var(--ink);z-index:-1;pointer-events:none}"
  },
  {
    "id": "blob-frame-fill",
    "label": "Blob frame + fill",
    "role": "organic-portrait",
    "surface_safe": ["paper", "cream"],
    "description": "Outlined organic blob (asymmetric border-radius) wrapping a smaller solid blob-fill. Used as portrait stand-in for hero / contact scenes. Asymmetric radii on both frame and fill — never matched.",
    "demo": "<div class=\"pf-motif-blob\"><span class=\"pf-motif-blob-inner\"></span></div>",
    "css": ".pf-motif-blob{display:inline-flex;align-items:center;justify-content:center;width:140px;height:160px;border:3px solid var(--ink);border-radius:40% 60% 70% 30% / 40% 50% 60% 50%;background:transparent}.pf-motif-blob-inner{display:block;width:88px;height:100px;background:var(--ink);border-radius:60% 40% 30% 70% / 60% 30% 70% 40%}"
  },
  {
    "id": "scribble-mark",
    "label": "Scribble mark",
    "role": "corner-punctuation",
    "surface_safe": ["paper", "cream"],
    "description": "Inline 2px-stroke SVG path with rounded line-caps — squiggle, star, circle, arrow. Anchored to a slide corner as hand-drawn breath. Every scene gets at least one; never more than two.",
    "wide": true,
    "demo": "<svg class=\"pf-motif-scribble\" viewBox=\"0 0 200 60\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M5,30 Q25,5 45,30 T85,30 T125,30 T165,30 T195,30\" /><path d=\"M15,45 Q35,25 55,45 T95,45\" /></svg>",
    "css": ".pf-motif-scribble{display:block;width:200px;height:60px}.pf-motif-scribble path{stroke:var(--ink);stroke-width:2;fill:none;stroke-linecap:round;stroke-linejoin:round}"
  },
  {
    "id": "step-node-circle",
    "label": "Step-node circle",
    "role": "process-marker",
    "surface_safe": ["paper", "cream"],
    "description": "64px round outlined node with Syne 800 digit. Alternates outlined (peach fill, ink digit) and filled (ink fill, peach digit) across a sequence. Used for timeline / process markers.",
    "demo": "<div class=\"pf-motif-step-row\"><span class=\"pf-motif-step pf-motif-step-filled\">1</span><span class=\"pf-motif-step\">2</span><span class=\"pf-motif-step pf-motif-step-filled\">3</span></div>",
    "css": ".pf-motif-step-row{display:flex;gap:16px;align-items:center}.pf-motif-step{display:flex;align-items:center;justify-content:center;width:64px;height:64px;border:3px solid var(--ink);border-radius:50%;background:var(--anchor-peach);color:var(--ink);font-family:var(--f-disp-native);font-weight:800;font-size:clamp(20px,1.8vw,28px);line-height:1}.pf-motif-step-filled{background:var(--ink);color:var(--anchor-peach)}"
  },
  {
    "id": "filled-block-invert",
    "label": "Filled block (invert)",
    "role": "emphasis-anchor",
    "surface_safe": ["paper", "cream"],
    "description": "Charcoal-fill card with peach text — the system's only color inversion. Reserve for the one cell that anchors a slide's attention. Carries the same ±0.5–3deg micro-rotation as outlined siblings.",
    "demo": "<div class=\"pf-motif-fill\"><div class=\"pf-motif-fill-num\">02</div><div class=\"pf-motif-fill-title\">Art direction</div></div>",
    "css": ".pf-motif-fill{display:inline-flex;flex-direction:column;gap:8px;background:var(--ink);color:var(--anchor-peach);border:3px solid var(--ink);padding:20px 28px;transform:rotate(.8deg)}.pf-motif-fill-num{font-family:var(--f-disp-native);font-weight:800;font-size:clamp(24px,2.2vw,36px);line-height:1;letter-spacing:-.01em}.pf-motif-fill-title{font-family:var(--f-disp-native);font-weight:700;font-size:clamp(18px,1.6vw,24px);line-height:1.1;letter-spacing:-.01em}"
  },
  {
    "id": "tag-pill",
    "label": "Tag pill",
    "role": "category-badge",
    "surface_safe": ["paper", "cream"],
    "description": "Small ink rectangle with peach text at weight 600. Anchored to bottom-left of an image / gallery frame as a category label. The only inverted text-on-ink element that is not a full card.",
    "demo": "<div><span class=\"pf-motif-tag\">Editorial</span></div>",
    "css": ".pf-motif-tag{display:inline-block;background:var(--ink);color:var(--anchor-peach);padding:6px 14px;font-family:var(--f-body-native);font-weight:600;font-size:clamp(11px,1vw,13px);line-height:1.2;letter-spacing:.04em}"
  },
  {
    "id": "ghost-blob",
    "label": "Ghost blob",
    "role": "atmospheric-wallpaper",
    "surface_safe": ["paper", "cream"],
    "description": "Oversized organic ink blob at 0.08 opacity placed behind content as atmospheric wallpaper. Max one per slide, anchored to a corner the content does not occupy. Drifts on 12–20s sine.inOut loop.",
    "demo": "<div class=\"pf-motif-ghost\"></div>",
    "css": ".pf-motif-ghost{display:block;width:160px;height:160px;background:var(--ink);border-radius:40% 60% 70% 30% / 40% 50% 60% 50%;opacity:.08}"
  }
]
```

The `motifs` JSON block above is the SOLE source of truth. build-design.mjs reads it to render §M cards in design.html. The Phase 3 plan agent and Phase 4b scene worker may cite motifs by `id` when annotating which gesture a scene relies on.

**Materials lexicon** (informational — these are the composition atoms behind the patterns):

- double-stroke-offset · blob-frame-fill · scribble-mark · step-node-circle · filled-block-invert · tag-pill · ghost-blob · vertical-spine · doodle-circle · doodle-rect

## §I Page-level CSS (overrides design.html's neutral chrome — makes the doc itself read as playful)

```css
/* ── Preset-native typography vars (loaded via preset-meta.chromeFonts.googleFontsHref).
 * These let the doc chrome render in Syne / Space Grotesk / Space Mono regardless
 * of which brand DNA the preset is applied to. The §6 component preview, §M motifs
 * grid, and §T type-role atlas also read these via .preset-native-scope.
 *
 * Playful has no dedicated script face — the script slot points at Syne 700 because
 * the preset refuses a third face (the vertical-spine label motif carries the
 * script-adjacent voice via rotated Syne). Fallback chains end in faces that still
 * carry the studio vibe (Fraunces / Recoleta for display; Inter for body). */
:root {
  --f-disp-native:
    "Syne", "Fraunces", "Recoleta", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --f-body-native:
    "Space Grotesk", "Inter", "IBM Plex Sans", -apple-system, BlinkMacSystemFont, system-ui,
    sans-serif;
  --f-script-native:
    "Syne", "Fraunces", "Recoleta", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --f-mono-native:
    "Space Mono", "JetBrains Mono", "IBM Plex Mono", "Menlo", ui-monospace, monospace;
}

/* .preset-native-scope: re-bind brand DNA font tokens to preset-native families.
 * Wraps §6 component previews, §M motif demos, and §T type-role atlas so
 * var(--font-*) resolves to Syne / Space Grotesk / Space Mono regardless of the
 * brand DNA tokens emitted in :root. The paste-ready component source is
 * untouched — Phase 4b still grep + paste original `var(--font-display)` tokens,
 * which resolve to brand DNA at scene-render time. */
.preset-native-scope {
  --font-display: var(--f-disp-native);
  --font-body: var(--f-body-native);
  --font-script: var(--f-script-native);
  --font-mono: var(--f-mono-native);
}

body {
  background: var(--anchor-peach);
  color: var(--ink);
  font-family: "Space Grotesk", sans-serif;
}
.title-card {
  background: var(--anchor-peach);
  border-bottom: 3px solid var(--ink);
  padding: 88px 0 72px;
}
.title-display {
  font-family: "Syne", sans-serif;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ink);
}
.brand-name {
  font-family: "Syne", sans-serif;
  font-weight: 800;
  color: var(--ink);
}
.style-name {
  font-family: "Syne", sans-serif;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.ds-section {
  border-top: 3px solid var(--ink);
  padding: 72px 0;
}
h2 {
  font-family: "Syne", sans-serif;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ink);
}
.eyebrow {
  font-family: "Space Grotesk", sans-serif;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ink);
  opacity: 0.7;
}
.type-card,
.voice-pair,
.comp-card {
  border: 3px solid var(--ink) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  background: var(--anchor-peach) !important;
  position: relative;
}
/* dna-swatch keeps inline brand color; only border + ghost stay */
.dna-swatch {
  border: 3px solid var(--ink) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  position: relative;
}
.dna-swatch::before,
.type-card::before,
.voice-pair::before,
.comp-card::before {
  /* Double-stroke offset ghost border — the system's signature elevation. */
  content: "";
  position: absolute;
  top: 6px;
  left: 6px;
  right: -6px;
  bottom: -6px;
  border: 2px solid var(--ink);
  z-index: -1;
  pointer-events: none;
}
.comp-head {
  background: var(--ink) !important;
  color: var(--anchor-peach) !important;
  border-bottom: 3px solid var(--ink) !important;
  font-family: "Syne", sans-serif;
  font-weight: 700;
}
.ds-code {
  background: var(--anchor-cream) !important;
  border: 3px solid var(--ink);
  border-radius: 0 !important;
  color: var(--ink) !important;
  font-family: "Space Mono", monospace;
}

/* ── §M Motifs grid: atomic gestures.
 * Mirrors the studio editorial grid in playful's source template — 12-col grid
 * of small cards each teaching ONE reusable gesture. Cards may declare a surface
 * (paper / cream) to demonstrate the gesture against its native bg. Each card
 * carries the signature double-stroke offset border via ::before. */
.ds-motif-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 18px;
}
.ds-motif {
  grid-column: span 4;
  min-height: 280px;
  padding: 28px;
  border: 3px solid var(--ink);
  border-radius: 0;
  background: var(--anchor-peach);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  position: relative;
}
.ds-motif::before {
  content: "";
  position: absolute;
  top: 6px;
  left: 6px;
  right: -6px;
  bottom: -6px;
  border: 2px solid var(--ink);
  z-index: -1;
  pointer-events: none;
}
.ds-motif.ds-motif-wide {
  grid-column: span 8;
}
.ds-motif.ds-motif-surface-paper {
  background: var(--anchor-peach);
}
.ds-motif.ds-motif-surface-cream {
  background: var(--anchor-cream);
}
.ds-motif-h {
  margin: 0;
  font-family: var(--f-disp-native);
  font-weight: 700;
  font-size: clamp(22px, 2.2vw, 32px);
  line-height: 1.1;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.ds-motif-desc {
  margin: 0;
  font-family: var(--f-body-native);
  font-weight: 400;
  font-size: 14px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--ink) 75%, transparent);
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
  top: 14px;
  right: 16px;
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

/* ── §T Type-role atlas. Container = single-column outlined card (paper surface).
 * Single-column padding-only rows so each role gets its own breath. Each .t-trole-*
 * class encodes the role's family / size / weight / leading / tracking / case /
 * decoration. Family selectors use var(--font-*) tokens so the atlas renders in
 * BRAND DNA fonts; only the recipe is preset-declared. Color decisions follow
 * Playful's monochrome contract — var(--ink) everywhere, no third color. */
.ds-trole-box {
  display: flex;
  flex-direction: column;
  border: 3px solid var(--ink);
  border-radius: 0;
  background: var(--anchor-peach);
  overflow: hidden;
  margin-top: 24px;
}
.ds-trole-row {
  padding: 28px 32px;
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

/* ── Type-role samples. var(--font-display/body/script/mono) resolves to brand DNA.
 * Color uses Playful's monochrome contract — ink-on-paper for everything except
 * the tag-pill (peach-on-ink inversion) and the cards that carry the filled-block
 * treatment. No third color. */
.t-trole-display-hero {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(64px, 10vw, 144px);
  line-height: 0.9;
  letter-spacing: -0.03em;
  color: var(--ink);
}
.t-trole-display {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(48px, 8vw, 112px);
  line-height: 0.9;
  letter-spacing: -0.02em;
  color: var(--ink);
}
.t-trole-headline {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(40px, 6vw, 80px);
  line-height: 1;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.t-trole-statement {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(40px, 5vw, 72px);
  line-height: 1.1;
  letter-spacing: -0.01em;
  color: var(--ink);
  max-width: 24ch;
}
.t-trole-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(32px, 4vw, 56px);
  line-height: 1.1;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.t-trole-title-sm {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 21px;
  line-height: 1.2;
  color: var(--ink);
}
.t-trole-number-hero {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(64px, 8vw, 112px);
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--ink);
  transform: rotate(-0.8deg);
  display: inline-block;
}
.t-trole-number-md {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 40px;
  line-height: 1;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.t-trole-number-sm {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 32px;
  line-height: 1;
  color: var(--ink);
}
.t-trole-body-md {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 19px;
  line-height: 1.6;
  color: var(--ink);
  max-width: 50ch;
  margin: 0;
}
.t-trole-body {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(16px, 1.2vw, 18px);
  line-height: 1.7;
  color: var(--ink);
  max-width: 60ch;
  margin: 0;
}
.t-trole-label-eyebrow {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 14px;
  line-height: 1.2;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ink);
  opacity: 0.7;
}
.t-trole-caption {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4;
  color: var(--ink);
  opacity: 0.8;
  margin: 0;
}
.t-trole-tag {
  display: inline-block;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 12px;
  line-height: 1.2;
  letter-spacing: 0.04em;
  background: var(--ink);
  color: var(--anchor-peach);
  padding: 6px 14px;
}
.t-trole-vertical-spine {
  display: inline-block;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 24px;
  line-height: 1.2;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink);
  transform: rotate(90deg);
  transform-origin: left center;
  margin-left: 1em;
}
```
