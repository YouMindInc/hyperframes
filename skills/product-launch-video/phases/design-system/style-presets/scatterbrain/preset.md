```preset-meta
{
  "name": "scatterbrain",
  "label": "Scatterbrain",
  "fingerprint": {
    "shadow": "soft-blur-paper-lift",
    "border": "none-on-stickies",
    "motion": "hand-placed-tilt",
    "density": "casually-clustered",
    "contrast": "warm-pastel-on-paper",
    "palette-mode": "brand-tinted-with-anchors"
  },
  "match_signals": [
    { "kind": "bouncy_easing", "weight": 0.25 },
    { "kind": "low_saturation", "weight": 0.15 },
    { "kind": "minimal_decoration", "weight": 0.05 }
  ],
  "best_for": ["creative agencies", "education", "indie tools", "workshop products", "warm friendly brands", "workshop / brainstorm decks"],
  "avoid_for": ["cold corporate", "formal enterprise", "regulated industries", "high-polish premium"],
  "chromeFonts": {
    "googleFontsHref": "https://fonts.googleapis.com/css2?family=Shrikhand&family=Zilla+Slab:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap",
    "display": "Shrikhand",
    "body": "Zilla Slab",
    "script": "Caveat",
    "mono": "Caveat"
  }
}
```

> `chromeFonts` makes the design.html doc chrome (title-card, section heads, h2/h3, lede paragraphs, eyebrows) render in the preset's NATIVE typography — Shrikhand + Zilla Slab + Caveat — instead of the brand DNA fonts. Scatterbrain has no machine-mono moment, so the `mono` slot also points at Caveat (the system's hand-script doubles for any mono role per §D's three-slot contract). The brand fonts still apply to §6 component code (paste-ready for Phase 4b). §M motifs grid and §T type-role atlas use `.preset-native-scope` so var(--font-display/body/script/mono) re-resolves to these native families for the live preview.

## §A Director's intent

Designer's whiteboard at 11am. Sticky notes pinned to cork, masking tape across the corner, marker doodles in the margins. Shrikhand display reads as chunky marker-pen lettering; Zilla Slab body sits like a printed handout; Caveat is the moment something got jotted down.

Depth is **soft blurred drop-shadow** (`2px 3px 15px shadow, 0 1px 3px shadow-deep`) on every post-it — the rare preset that embraces blur because the visual depends on paper lifting off cork. Every sticky carries a small rotation (±1° to ±15°) and a thumbtack pin via `::before`; hero stickies add a translucent tape strip via `::after`.

**Brand DNA tints the stickies; preset anchors keep the register playful.** Three site colors (`--brand-primary` / `--brand-secondary` / `--brand-accent`) mix with named pastel anchors (`--anchor-butter` / `--anchor-sky` / `--anchor-blush` / `--anchor-mint`) so dark or oversaturated brands still produce sticky-note pastels instead of muddy fills. Cream paper (`--paper-cream`) and warm ink (`--ink-warm`) are technical prerequisites — pure white kills the tactile register; pure black on warm pastels reads cold.

**Color role contract**: post-its cycle through the four anchor-mixed pastels (butter, sky, blush, mint) for categorical variety; brand DNA flows in as gradient deepening, pin colors, and feature-icon accents. Ink-warm carries every headline, every body line, every border, every doodle — colored text on pastel stickies kills legibility.

Motion is **hand-placed tilt**: short overshoot on entry (the sticky "lands" with a tiny bounce), no glide. Doodles drift on `sine.inOut`. Scene transitions are quick cuts with a single tape-rip beat — never crossfade.

**Best for** sites with warm, friendly, or craft-leaning palettes (creative agencies, education, indie tools, workshop products). Cold corporate brands still render but the workshop voice softens.

**Class prefix:** `sb-` (initialism, 3 chars per §8.6).

**Atmosphere is non-negotiable.** Every scene gets the grain overlay + one of three background variants (cork / paper / warm). A post-it floating on plain white reads as broken — the textured ground IS the system.

## §B Decoration tokens (merge into design.html `:root`)

Scatterbrain declares **structural** tokens here (sticky-note shadow stack, rotation tilts, pin / tape geometry, doodle stroke). Color comes mostly from brand DNA mixed against named pastel anchors so the playful register survives any brand palette.

The cream paper base (`--paper-cream`) and warm ink (`--ink-warm`) are technical exceptions: pure white loses the paper texture, pure black on warm pastels feels cold. The four anchor hues are §8.2 hue-anchor tokens — declared once, mixed against brand vars in every component — so the system stays "sticky-note" regardless of brand DNA.

```css
/* §8.2 technical exception — warm paper + warm ink. Pure white destroys the
   tactile register; pure black reads cold on warm pastels. */
--paper-cream: #f7f5f0;
--paper-cream-deep: #f5f2ec;
--ink-warm: #2d2a26;
--ink-warm-light: #5c5750;

/* §8.2 hue-anchor tokens — declared once so every sticky-fill mix produces a
   consistent pastel register regardless of brand DNA. Without these anchors,
   dark or oversaturated brands would push the stickies into muddy or fluorescent
   territory and the workshop voice breaks. */
--anchor-butter: #ffe066; /* yellow sticky */
--anchor-butter-deep: #ffd43b;
--anchor-sky: #a5d8ff; /* blue sticky */
--anchor-sky-deep: #74c0fc;
--anchor-blush: #ffc9c9; /* pink sticky */
--anchor-blush-deep: #ff9f9f;
--anchor-mint: #b2f2bb; /* green sticky */
--anchor-mint-deep: #8ce99a;
--anchor-peach: #ffcc80; /* orange sticky (flat fill) */
--anchor-lavender: #d0bfff; /* purple sticky (flat fill) */

/* §8.2 tactile-prop anchors — physical objects the brand DNA does not own.
   Thumbtacks are physical-object red / gold / blue / green beads; cork is wood;
   polaroid paper is white. Mixing brand DNA into these would break the
   workshop metaphor (a red thumbtack should look like a red thumbtack). */
--pin-red-light: #ff6b6b;
--pin-red-deep: #c92a2a;
--pin-gold-light: #ffd43b;
--pin-gold-deep: #f59f00;
--pin-green-light: #69db7c;
--pin-green-deep: #2f9e44;
--pin-blue-light: #4dabf7;
--pin-blue-deep: #1864ab;
/* Cork-wood tones for bg-cork tonal gradient */
--cork-light: #e8ddd0;
--cork-mid: #d4c5b0;
--cork-deep: #c9b8a0;
/* Polaroid photo paper + placeholder photo tones */
--photo-paper: #fff;
--photo-placeholder-1: #e9ecef;
--photo-placeholder-2: #dee2e6;
--photo-placeholder-3: #ced4da;

/* Sticky surface mixes — 70% brand-tinted anchor + 30% brand-primary lifts the
   anchor toward the brand without overwhelming it. Components reference these
   tokens by name so the cluster recolors cleanly across brands. */
--sticky-butter: color-mix(in srgb, var(--brand-primary) 18%, var(--anchor-butter));
--sticky-butter-deep: color-mix(in srgb, var(--brand-primary) 18%, var(--anchor-butter-deep));
--sticky-sky: color-mix(in srgb, var(--brand-secondary) 18%, var(--anchor-sky));
--sticky-sky-deep: color-mix(in srgb, var(--brand-secondary) 18%, var(--anchor-sky-deep));
--sticky-blush: color-mix(in srgb, var(--brand-accent) 18%, var(--anchor-blush));
--sticky-blush-deep: color-mix(in srgb, var(--brand-accent) 18%, var(--anchor-blush-deep));
--sticky-mint: color-mix(in srgb, var(--brand-primary) 14%, var(--anchor-mint));
--sticky-mint-deep: color-mix(in srgb, var(--brand-primary) 14%, var(--anchor-mint-deep));

/* Shadow stack — signature soft paper-lift. The 15px-blur outer + 3px-blur inner
   makes the sticky hover off cork. This is the rare preset that uses blur. */
--shadow-paper: rgba(45, 42, 38, 0.15);
--shadow-paper-deep: rgba(45, 42, 38, 0.25);
--shadow-sticky: 2px 3px 15px var(--shadow-paper), 0 1px 3px var(--shadow-paper-deep);
--shadow-pin: 0 2px 4px var(--shadow-paper-deep), inset -2px -2px 4px rgba(0, 0, 0, 0.2);

/* Tilt presets — apply via transform on the sticky element. Hero / statement:
   small (±1-3°). Accent / floating / closing: larger (±5-15°). */
--tilt-quiet-l: -1.5deg;
--tilt-quiet-r: 1.5deg;
--tilt-loud-l: -8deg;
--tilt-loud-r: 8deg;
--tilt-wild-l: -14deg;
--tilt-wild-r: 14deg;

/* Geometry — pin, tape, feature-icon, doodle stroke */
--pin-size: 16px;
--pin-top: -12px;
--tape-w: 80px;
--tape-h: 25px;
--tape-top: -15px;
--tape-rot: -2deg;
--feature-icon-size: 60px;
--feature-icon-border: 3px solid var(--ink-warm);
--doodle-stroke: 3px;
--doodle-opacity: 0.15;

/* Spacing — clamp the post-it padding scale */
--gap-slide: 3rem;
--pad-postit-lg: 3rem 4rem;
--pad-postit-md: 2.5rem;
--pad-postit-sm: 1.5rem;
--pad-postit-statement: 3.5rem 4rem;
--gap-cluster: 2.5rem;
```

## §D Font pairing fallback (if brand fonts not on Google Fonts)

Scatterbrain forces its display / body / script regardless of site DNA — the workshop voice depends on Shrikhand's chunky decorative shapes, Zilla Slab's warm slabs, and Caveat's casual cursive. Fallbacks below are only used if the primary face fails to load.

- **display**: `'Shrikhand'` · `'Fraunces'` · `'Lobster'` wght 400
- **body**: `'Zilla Slab'` · `'Roboto Slab'` · `'Bitter'` wght 400
- **mono**: `'Caveat'` · `'Patrick Hand'` · `'Kalam'` wght 500

(The "mono" slot is reused for the script face — Scatterbrain has no monospace need, but `resolveFont()` reads three roles. The fallback chain stays on hand-script.)

## §T Type-role atlas (Phase 4b reads this to size text correctly)

Each entry is a **named type role** with concrete render parameters at 1920×1080 — family token, px range, weight, leading, tracking, case, and any color/shadow/rotation decoration. Phase 4b scene workers may cite roles by `id` ("use a `headline` here"); the brand DNA fonts plug in automatically via `var(--font-*)` tokens. This is the same atlas scatterbrain ships in its Typography section, ported as machine-readable JSON.

The atlas is the **sole authoring source** for non-component text. If a scene needs a `stat-value` numeral that isn't covered by §6 components, the worker reads role `stat-value` here and writes inline CSS from these values. Do NOT invent ad-hoc sizes — Scatterbrain's identity collapses if Shrikhand drops out of headline roles or if body copy slips into Shrikhand.

```type-roles
[
  {
    "id": "display-hero",
    "family": "display",
    "purpose": "cover / closing oversized headline — Shrikhand on a hero sticky",
    "px_min": 40, "px_max": 72, "weight": 400, "leading": "1.1", "tracking": "0.02em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-display-hero\">Design together.</div>"
  },
  {
    "id": "statement",
    "family": "display",
    "purpose": "centered manifesto / pulled-quote statement",
    "px_min": 32, "px_max": 56, "weight": 400, "leading": "1.1", "tracking": "0.02em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-statement\">Pin it. Share it. Ship it.</div>"
  },
  {
    "id": "headline",
    "family": "display",
    "purpose": "primary slide / section headline inside a post-it",
    "px_min": 28, "px_max": 48, "weight": 400, "leading": "1.1", "tracking": "0.02em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-headline\">Section title</div>"
  },
  {
    "id": "title",
    "family": "display",
    "purpose": "sub-region or feature-card title",
    "px_min": 20, "px_max": 28, "weight": 400, "leading": "1.1", "tracking": "0.02em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-title\">Feature title</div>"
  },
  {
    "id": "stat-value",
    "family": "display",
    "purpose": "numeric stat value inside a stat-row (Shrikhand)",
    "px_min": 28, "px_max": 44, "weight": 400, "leading": "1.1", "tracking": "0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-stat-value\">128K USERS</div>"
  },
  {
    "id": "caption-subtitle",
    "family": "body",
    "purpose": "slide subtitle below a hero headline (Zilla Slab)",
    "px_min": 18, "px_max": 22, "weight": 400, "leading": "1.6", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-caption-subtitle\">A short subtitle in friendly slab serif.</p>"
  },
  {
    "id": "body",
    "family": "body",
    "purpose": "standard paragraph body on a sticky",
    "px_min": 16, "px_max": 20, "weight": 400, "leading": "1.7", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body\">Body sits in Zilla Slab at conversational length — like a designer explaining their notes to a peer.</p>"
  },
  {
    "id": "list-item",
    "family": "body",
    "purpose": "bullet / check-marked list row inside a sticky",
    "px_min": 16, "px_max": 18, "weight": 400, "leading": "1.6", "tracking": "0", "case": "sentence",
    "sample_html": "<ul class=\"t-trole-list-item\"><li>One sticky per idea.</li><li>Pin it. Tape it.</li><li>Step back. Look.</li></ul>"
  },
  {
    "id": "handwritten",
    "family": "script",
    "purpose": "casual side quip / decorative annotation (Caveat 400)",
    "px_min": 20, "px_max": 28, "weight": 400, "leading": "1.4", "tracking": "0", "case": "sentence",
    "sample_html": "<div class=\"t-trole-handwritten\">jot it down before you forget :)</div>"
  },
  {
    "id": "handwritten-lg",
    "family": "script",
    "purpose": "larger handwritten subtitle / hero quip (Caveat 600)",
    "px_min": 24, "px_max": 32, "weight": 600, "leading": "1.3", "tracking": "0", "case": "sentence",
    "sample_html": "<div class=\"t-trole-handwritten-lg\">like a whiteboard, but online</div>"
  },
  {
    "id": "handwritten-sm",
    "family": "script",
    "purpose": "small accent label / stat-row personal note (Caveat 500)",
    "px_min": 18, "px_max": 22, "weight": 500, "leading": "1.3", "tracking": "0", "case": "sentence",
    "sample_html": "<div class=\"t-trole-handwritten-sm\">ok!</div>"
  },
  {
    "id": "label-script",
    "family": "script",
    "purpose": "tracked-caps eyebrow above a card headline (Caveat uppercase, 0.15em)",
    "px_min": 13, "px_max": 16, "weight": 400, "leading": "1.2", "tracking": "0.15em", "case": "upper",
    "sample_html": "<div class=\"t-trole-label-script\">The brief — chapter one</div>"
  },
  {
    "id": "feature-icon-glyph",
    "family": "display",
    "purpose": "single-character glyph inside a 60px round ink-bordered feature icon",
    "px_min": 22, "px_max": 28, "weight": 400, "leading": "1", "tracking": "0", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-feature-icon-glyph\">A</span></div>"
  },
  {
    "id": "versus-mark",
    "family": "display",
    "purpose": "compare-circle connector text (cream on ink, Shrikhand)",
    "px_min": 18, "px_max": 22, "weight": 400, "leading": "1", "tracking": "0.02em", "case": "lower",
    "sample_html": "<div><span class=\"t-trole-versus-mark\">vs</span></div>"
  }
]
```

The atlas omits `grain-overlay` (it's a texture, declared in §B decoration tokens) and post-it / pin / tape geometry (depth motifs, declared in §M atomic motifs).

## §E Motion (GSAP consts — REPLACES site ease)

```js
const EASE = {
  entry: "back.out(1.6)", // sticky "lands" with a tiny bounce — hand-placed feel
  emphasis: "back.out(1.4)", // pin/tape attach beats, doodle reveals
  exit: "power2.in", // sticky lifts off cleanly on exit
  drift: "sine.inOut", // doodle / handwritten quip ambient sway
};
const DUR = {
  snap: 0.18,
  med: 0.5,
  slow: 0.9,
};
// RULE: entry uses back.out — the sticky must land with a small overshoot.
//       Never ease-in-out for primary motion; the sticky reads as floating instead of pinned.
// RULE: tilt is part of the resting state, NOT animated. Set transform: rotate(<tilt>)
//       at scene start; do not tween rotation between values. The whole point is "hand-placed
//       and left alone" — a sticky that wiggles reads as broken.
// RULE: scene transitions are quick cuts (≤ 0.18s) with a tape-rip beat. No crossfade,
//       no slide between scenes — crossfade kills the tactile register.
// RULE: pin attaches AFTER the sticky lands. Stagger pin reveal ~80ms behind the sticky
//       so the eye reads "sticky placed → pin pressed in".
```

### §E.5 Motion choreography

**Allowed primitives**

- Sticky entry: `back.out(1.6)`, ~0.5s, from offset (translateY +24px, opacity 0). Tilt is set at landing, not animated.
- Pin attach: `back.out(1.4)`, ~0.18s, scale 0 → 1, ~80ms after sticky lands.
- Tape attach: same as pin but ~120ms later, with a tiny rotation jiggle (-3° → -2°).
- Handwritten Caveat lines reveal with a brief x-offset (translateX -8px → 0) on `power2.out`.
- Doodle stroke drift: `sine.inOut`, ~3s, ±2° rotation around its center — ambient only.
- Stat numerals: count-up on `power2.out`, ~0.6s, snap to final value.

**Forbidden**

- Crossfade, dissolve, blur transitions between scenes.
- Sub-degree rotation tweens on a sticky (a sticky that wiggles reads as broken).
- Glow, neon, hard-offset zero-blur shadows (the wrong preset).
- Border-radius on post-its (every sticky is a rectangle, only icons / pins / versus-circles are round).
- More than 6 post-its visible at once — the playful energy collapses into chaos.
- Uniform tilt direction across adjacent stickies — alternate ± per neighbor.

**Stagger budget**

120-160ms between cluster items (sticky → pin → tape, then next sticky). Total scene-in stagger ≤ 700ms. Doodles always last, after all stickies have landed.

## §G Voice transform recipe

Take the brand's product description / value prop. Transform with:

1. Strip corporate hedges ("solution", "platform", "leverage", "synergy"). Keep concrete nouns + verbs.
2. Hero headlines: 2-5 words, **mixed case** (NOT uppercase — Shrikhand is loud enough; uppercase reads as shouting and kills the workshop register).
3. Eyebrow labels: short categorical words in Caveat, UPPERCASE with 0.15em tracking (`THE BRIEF`, `CHAPTER ONE`, `01 / DISCOVERY`). This is the only place uppercase appears.
4. Body paragraphs: Zilla Slab sentence case, conversational. Write like a designer explaining their notes to a peer, not like marketing copy.
5. Personal quips in Caveat: 2-6 words, lowercase, with personality ("jot it down before you forget", "pin this somewhere safe", "ok :)"). One per scene maximum.
6. Stat values: numeric + UPPERCASE one-word unit (`128K USERS`, `4.8 STARS`). Stat labels in Zilla Slab sentence case.

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: hero=`Design together.` / eyebrow=`THE TEAM SPACE` / body=`Every cursor, every comment, every revision — visible to the whole crew.` / quip=`like a whiteboard, but online :)`

## §H Scene composition hints (Phase 4b layout guidance)

**Surface alternation across scenes**

- Cork scene (`bg-cork`): warm tan/brown gradient + faint plus-sign pattern. Best for "wall of pinned notes" beats — feature grids, comparisons, hero clusters.
- Paper scene (`bg-paper`): cream gradient + 40px grid lines at 8% opacity. Best for "desk surface" beats — statements, single hero stickies, focused content.
- Warm scene (`bg-warm`): cream base with soft yellow/blue/pink glow ellipses. Best for "morning light" beats — opening, closing, atmospheric pivots.
- **Every scene gets `grain-overlay` at 4% opacity fixed above all content.** Without it the deck loses its paper register.
- Alternate cork → paper → warm → cork across the video. Two consecutive same-background scenes reads as monotonous.

**Hero text**

- One large pinned post-it per scene carries the headline. Shrikhand display, sentence case, ink-warm color, on one of the four sticky variants (butter / sky / blush / mint).
- Hero sticky takes 40-60% of canvas width. Tilt: `--tilt-quiet-l` or `--tilt-quiet-r` (±1.5°). Always carries both `pin` AND `tape` (the "officially posted" treatment).
- Surround the hero with 1-3 accent stickies at larger tilts (`--tilt-loud-*` / `--tilt-wild-*`) carrying Caveat quips. Never two hero-tier post-its per scene.

**Sticky color cycling (role contract)**

- Stickies cycle through the four anchor-mixed pastels (butter → sky → blush → mint). Do not repeat the same sticky color in adjacent positions.
- Sticky colors have **no fixed semantic meaning** — yellow is not "warning", green is not "success". They're categorical only.
- Pin color follows the sticky underneath for cohesion (`pin` red on butter, `pin-blue` on sky, `pin-gold` on butter as variant, `pin-green` on mint). The default red pin works on every sticky.
- Brand DNA shows up as the 18% tint mixed into each sticky and as feature-icon glyph color / accent borders. Body text stays `--ink-warm` regardless.

**Tactile layering rules**

- Every primary headline sticky gets a `pin` via `::before`. Pinless headline stickies read as floating and undefined.
- Hero / statement / closing stickies get BOTH `pin` AND `tape` (the `pin tape` class pair). Other stickies get pin only.
- Pin and tape consume `::before` and `::after` on the same element — additional marks need a real child element.
- Doodles live in 1-2 unoccupied corners per scene at 0.15 opacity. Three or more doodles per scene clutters the margin.

**Rotation discipline**

- Hero stickies: ±1.5° (use `--tilt-quiet-l` / `--tilt-quiet-r`).
- Feature / column stickies: ±2-3°.
- Accent / floating Caveat-quip stickies: ±5-8° (`--tilt-loud-*`).
- Closing-cluster scattered stickies: up to ±14° (`--tilt-wild-*`).
- **Alternate directions** across adjacent stickies. Uniform tilt reads as a tilted canvas, not as hand-placement.
- Never exceed ±15°. Beyond that, hand-placed becomes wonky.

**Transitions between scenes**

- Quick cut paired with a single tape-rip beat (audio + a brief tape-shape flash if visual). No crossfade, no slide, no zoom.

**Ambient motion**

- Doodle drift on `sine.inOut`, ±2° around center, ~3s loop. Doodles only — never the stickies.
- Caveat handwritten lines may sway ±1° on the same drift. One per scene maximum.

## §M Atomic motifs (gestures the plan agent can reference)

Each motif is a **single reusable gesture** that lives inside a larger pattern. Patterns compose motifs; motifs do not compose anything. The plan agent treats motifs as the smallest cite-able vocabulary — a scene description can say "uses motif:pinned-sticky on the headline card" without specifying which pattern the card sits in.

```motifs
[
  {
    "id": "pinned-sticky",
    "label": "Pinned sticky",
    "role": "anchor-card",
    "surface_safe": ["paper", "cork", "warm"],
    "description": "Anchor-mixed pastel sticky (butter / sky / blush / mint) with the soft paper-lift shadow stack, fixed rotation, and a red thumbtack via ::before. The system's foundational card — every primary headline lives inside one. Pinless headline stickies read as floating and undefined.",
    "wide": true,
    "demo": "<div class=\"sb-motif-sticky\">Pin it. Share it.</div>",
    "css": ".sb-motif-sticky{position:relative;display:inline-block;background:var(--sticky-butter);padding:28px 36px;box-shadow:var(--shadow-sticky);transform:rotate(-1.5deg);font-family:var(--f-disp-native);font-weight:400;font-size:clamp(24px,3vw,40px);line-height:1.1;letter-spacing:.02em;color:var(--ink-warm);max-width:18ch}.sb-motif-sticky::before{content:\"\";position:absolute;top:-12px;left:50%;transform:translateX(-50%);width:16px;height:16px;border-radius:50%;background:radial-gradient(circle at 30% 30%,var(--pin-red-light),var(--pin-red-deep));box-shadow:var(--shadow-pin)}"
  },
  {
    "id": "tape-strip",
    "label": "Tape strip",
    "role": "officially-posted",
    "surface_safe": ["paper", "cork", "warm"],
    "description": "Translucent white masking-tape strip via ::after across the top-center of a sticky, rotated -2deg. Combined with motif:pinned-sticky on hero / statement / closing cards as the 'officially posted' treatment. One per scene maximum.",
    "demo": "<div class=\"sb-motif-tape\">Officially posted.</div>",
    "css": ".sb-motif-tape{position:relative;display:inline-block;background:var(--sticky-sky);padding:28px 36px;box-shadow:var(--shadow-sticky);transform:rotate(1.5deg);font-family:var(--f-disp-native);font-weight:400;font-size:clamp(24px,3vw,40px);line-height:1.1;letter-spacing:.02em;color:var(--ink-warm);max-width:18ch}.sb-motif-tape::after{content:\"\";position:absolute;top:-15px;left:50%;transform:translateX(-50%) rotate(-2deg);width:80px;height:25px;background:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.3)}"
  },
  {
    "id": "feature-icon",
    "label": "Feature icon",
    "role": "category-marker",
    "surface_safe": ["paper", "cork", "warm"],
    "description": "60px round ink-bordered circle with a single Shrikhand glyph inside (letter / number / symbol). Sits at the top of feature post-its as a category marker. The 3px ink border + display glyph is non-negotiable — variations break the icon signature.",
    "demo": "<div class=\"sb-motif-icon\">A</div>",
    "css": ".sb-motif-icon{display:inline-flex;align-items:center;justify-content:center;width:60px;height:60px;border:3px solid var(--ink-warm);border-radius:50%;font-family:var(--f-disp-native);font-weight:400;font-size:clamp(20px,2vw,28px);line-height:1;color:var(--ink-warm);background:transparent}"
  },
  {
    "id": "hand-script-quip",
    "label": "Hand-script quip",
    "role": "personal-voice",
    "surface_safe": ["paper", "cork", "warm"],
    "description": "Caveat handwritten side-note in 2-6 words, lowercase, with personality ('jot it down before you forget', 'pin this somewhere safe', 'ok :)'). One per scene maximum. May sway ±1° on the ambient drift — never tween rotation between fixed values.",
    "demo": "<div class=\"sb-motif-quip\">like a whiteboard, but online :)</div>",
    "css": ".sb-motif-quip{display:inline-block;font-family:var(--f-script-native);font-weight:600;font-size:clamp(22px,2.4vw,32px);line-height:1.3;color:var(--ink-warm);transform:rotate(-3deg)}"
  },
  {
    "id": "eyebrow-label",
    "label": "Eyebrow label",
    "role": "categorical-kicker",
    "surface_safe": ["paper", "cork", "warm"],
    "description": "Caveat at 0.9rem, UPPERCASE, 0.15em tracking — the only place uppercase appears in the system. Sits above a card headline as a categorical kicker ('THE BRIEF', 'CHAPTER ONE', '01 / DISCOVERY'). Caveat at normal tracking reads as a body cursive; the uppercase + tracking turns it into a label.",
    "demo": "<div class=\"sb-motif-eyebrow\">The brief — chapter one</div>",
    "css": ".sb-motif-eyebrow{display:inline-block;font-family:var(--f-script-native);font-weight:400;font-size:clamp(13px,1.1vw,16px);line-height:1.2;letter-spacing:.15em;text-transform:uppercase;color:var(--ink-warm-light)}"
  },
  {
    "id": "doodle-mark",
    "label": "Doodle mark",
    "role": "margin-decoration",
    "surface_safe": ["paper", "cork", "warm"],
    "description": "Decorative SVG mark — circle, squiggle, triangle, line, X+ pair — placed in 1-2 unoccupied slide corners. 3px ink stroke at 0.15 opacity. Drifts on sine.inOut ±2° around its center, ~3s loop. Three or more doodles per scene clutters the margin.",
    "demo": "<div class=\"sb-motif-doodle\"><svg viewBox=\"0 0 80 80\" width=\"72\" height=\"72\" aria-hidden=\"true\"><circle cx=\"40\" cy=\"40\" r=\"28\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\"/><path d=\"M20 56 Q40 36 60 56\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"/></svg></div>",
    "css": ".sb-motif-doodle{display:inline-flex;color:var(--ink-warm);opacity:.35}"
  }
]
```

The `motifs` JSON block above is the SOLE source of truth. build-design.mjs reads it to render §M cards in design.html. The Phase 3 plan agent and Phase 4b scene worker may cite motifs by `id` when annotating which gesture a scene relies on.

**Materials lexicon** (informational — these are the composition atoms behind the patterns):

- pinned-sticky · tape-strip · feature-icon · hand-script-quip · eyebrow-label · doodle-mark · versus-circle · photo-frame · stat-row · grain-overlay

## §I Page-level CSS (overrides design.html's neutral chrome — makes the doc itself read as scatterbrain)

```css
/* ── Preset-native typography vars (loaded via preset-meta.chromeFonts.googleFontsHref).
 * These let the doc chrome render in Shrikhand / Zilla Slab / Caveat regardless
 * of brand DNA. The §6 component preview, §M motifs grid, and §T type-role atlas
 * also read these via .preset-native-scope.
 *
 * Scatterbrain has no machine-mono moment — the mono slot falls back to Caveat
 * (the system's hand-script) per §D's three-slot contract. Fallback chains end
 * in a face that still carries the preset's vibe (Fraunces / Lobster display;
 * Roboto Slab / Bitter body; Patrick Hand / Kalam script). Falling all the way
 * to generic should never happen in practice. */
:root {
  --f-disp-native: "Shrikhand", "Fraunces", "Lobster", "Georgia", "Times New Roman", serif;
  --f-body-native: "Zilla Slab", "Roboto Slab", "Bitter", "Georgia", "Times New Roman", serif;
  --f-script-native: "Caveat", "Patrick Hand", "Kalam", "Brush Script MT", "Comic Sans MS", cursive;
  --f-mono-native: "Caveat", "Patrick Hand", "Kalam", "Brush Script MT", "Comic Sans MS", cursive;
}

/* .preset-native-scope: re-bind brand DNA font tokens to preset-native families.
 * Wraps §6 component previews, §M motif demos, and §T type-role atlas so
 * var(--font-*) resolves to Shrikhand / Zilla Slab / Caveat regardless of the
 * brand DNA tokens emitted in :root. The paste-ready component source is
 * untouched — Phase 4b still grep + paste original var(--font-display) tokens,
 * which resolve to brand DNA at scene-render time. */
.preset-native-scope {
  --font-display: var(--f-disp-native);
  --font-body: var(--f-body-native);
  --font-script: var(--f-script-native);
  --font-mono: var(--f-mono-native);
}

body {
  background: var(--paper-cream);
  position: relative;
}
body::before {
  /* Paper grain on design.html itself */
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 200px 200px;
}
.title-card {
  background: var(--paper-cream-deep);
  border-bottom: none;
  padding: 96px 0 80px;
}
.title-display {
  font-family: "Shrikhand", cursive;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: var(--ink-warm);
}
.brand-name {
  color: var(--brand-primary);
  font-weight: 400;
}
.style-name {
  color: var(--brand-secondary);
  font-weight: 400;
}
.ds-section {
  border-top: 1px dashed rgba(45, 42, 38, 0.2);
  padding: 80px 0;
}
h2 {
  font-family: "Shrikhand", cursive;
  color: var(--ink-warm);
  letter-spacing: 0.02em;
}
.eyebrow {
  font-family: "Caveat", cursive;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--ink-warm-light);
  font-weight: 500;
}
.type-card,
.voice-pair,
.comp-card {
  background: var(--sticky-butter) !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: var(--shadow-sticky) !important;
  transform: rotate(-0.5deg);
}
.type-card:nth-child(even),
.voice-pair:nth-child(even),
.comp-card:nth-child(even) {
  background: var(--sticky-sky) !important;
  transform: rotate(0.8deg);
}
/* dna-swatch keeps inline brand-color background — only sticky-tilt + shadow */
.dna-swatch {
  border: none !important;
  border-radius: 0 !important;
  box-shadow: var(--shadow-sticky) !important;
  transform: rotate(-0.5deg);
}
.dna-swatch:nth-child(even) {
  transform: rotate(0.8deg);
}
.comp-head {
  background: transparent !important;
  color: var(--ink-warm) !important;
  border-bottom: 1px dashed rgba(45, 42, 38, 0.2) !important;
  font-family: "Shrikhand", cursive;
}
.ds-code {
  background: var(--photo-paper) !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: var(--shadow-sticky);
  color: var(--ink-warm) !important;
  font-family: "Caveat", "Courier New", monospace;
}

/* ── §M Motifs grid: atomic gestures.
 * Mirrors the scatterbrain workshop register — each card is a small sticky-like
 * surface teaching ONE reusable gesture. Cards may declare a surface
 * (paper / cork / warm) to demonstrate the gesture against its native bg. */
.ds-motif-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
}
.ds-motif {
  grid-column: span 4;
  min-height: 280px;
  padding: 28px;
  border: none;
  border-radius: 0;
  background: var(--sticky-butter);
  box-shadow: var(--shadow-sticky);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  position: relative;
  overflow: hidden;
  transform: rotate(-0.8deg);
}
.ds-motif:nth-child(even) {
  background: var(--sticky-sky);
  transform: rotate(1deg);
}
.ds-motif:nth-child(3n) {
  background: var(--sticky-blush);
  transform: rotate(-1.4deg);
}
.ds-motif:nth-child(5n) {
  background: var(--sticky-mint);
  transform: rotate(0.6deg);
}
.ds-motif.ds-motif-wide {
  grid-column: span 8;
}
.ds-motif.ds-motif-surface-paper {
  background: var(--paper-cream-deep);
}
.ds-motif.ds-motif-surface-cork {
  background: var(--cork-mid);
}
.ds-motif.ds-motif-surface-warm {
  background: var(--anchor-peach);
}
.ds-motif-h {
  margin: 0;
  font-family: var(--f-disp-native);
  font-weight: 400;
  font-size: clamp(22px, 2.4vw, 34px);
  line-height: 1.1;
  letter-spacing: 0.02em;
  color: var(--ink-warm);
}
.ds-motif-desc {
  margin: 0;
  font-family: var(--f-body-native);
  font-weight: 400;
  font-size: 14px;
  line-height: 1.6;
  color: var(--ink-warm-light);
  max-width: 30ch;
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
  font-family: var(--f-script-native);
  font-size: 12px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ink-warm-light);
  opacity: 0.65;
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

/* ── §T Type-role atlas. Container = cream sticky-card. Each .t-trole-* class
 * encodes the role's family / size / weight / leading / tracking / case /
 * decoration. Family selectors use var(--font-*) tokens so the atlas renders
 * in BRAND DNA fonts; only the recipe is preset-declared. Decoration (color,
 * shadow, rotation, feature-icon round border, versus-circle fill) is
 * preset-native and stays declared with hard-coded scatterbrain tokens
 * (var(--ink-warm), var(--paper-cream), etc). */
.ds-trole-box {
  display: flex;
  flex-direction: column;
  border: none;
  border-radius: 0;
  background: var(--paper-cream-deep);
  box-shadow: var(--shadow-sticky);
  overflow: hidden;
  margin-top: 24px;
}
.ds-trole-row {
  padding: 28px 32px;
}
.ds-trole-row:not(:last-child) {
  border-bottom: 1px dashed rgba(45, 42, 38, 0.2);
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

/* ── Type-role samples. Each .t-trole-* class mirrors a scatterbrain type-scale
 * entry but uses var(--font-display/body/script) so the actual typeface comes
 * from brand DNA. Color stays preset-native (ink-warm on pastel-ish surfaces). */
.t-trole-display-hero {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(40px, 5vw, 72px);
  line-height: 1.1;
  letter-spacing: 0.02em;
  color: var(--ink-warm);
}
.t-trole-statement {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(32px, 4vw, 56px);
  line-height: 1.1;
  letter-spacing: 0.02em;
  color: var(--ink-warm);
}
.t-trole-headline {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(28px, 3.5vw, 48px);
  line-height: 1.1;
  letter-spacing: 0.02em;
  color: var(--ink-warm);
}
.t-trole-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(20px, 2.5vw, 28px);
  line-height: 1.1;
  letter-spacing: 0.02em;
  color: var(--ink-warm);
}
.t-trole-stat-value {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(28px, 3vw, 44px);
  line-height: 1.1;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--ink-warm);
}
.t-trole-caption-subtitle {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(18px, 1.6vw, 22px);
  line-height: 1.6;
  color: var(--ink-warm-light);
  max-width: 50ch;
  margin: 0;
}
.t-trole-body {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(16px, 1.4vw, 20px);
  line-height: 1.7;
  color: var(--ink-warm-light);
  max-width: 60ch;
  margin: 0;
}
.t-trole-list-item {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.t-trole-list-item li {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(16px, 1.3vw, 18px);
  line-height: 1.6;
  color: var(--ink-warm);
  padding-left: 1.3em;
  position: relative;
}
.t-trole-list-item li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--ink-warm);
  font-weight: 700;
}
.t-trole-handwritten {
  font-family: var(--font-script);
  font-weight: 400;
  font-size: clamp(20px, 2vw, 28px);
  line-height: 1.4;
  color: var(--ink-warm);
}
.t-trole-handwritten-lg {
  font-family: var(--font-script);
  font-weight: 600;
  font-size: clamp(24px, 2.5vw, 32px);
  line-height: 1.3;
  color: var(--ink-warm);
}
.t-trole-handwritten-sm {
  font-family: var(--font-script);
  font-weight: 500;
  font-size: clamp(18px, 1.5vw, 22px);
  line-height: 1.3;
  color: var(--ink-warm);
}
.t-trole-label-script {
  display: inline-block;
  font-family: var(--font-script);
  font-weight: 400;
  font-size: clamp(13px, 1.1vw, 16px);
  line-height: 1.2;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ink-warm-light);
}
.t-trole-feature-icon-glyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border: 3px solid var(--ink-warm);
  border-radius: 50%;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(22px, 2vw, 28px);
  line-height: 1;
  color: var(--ink-warm);
  background: transparent;
}
.t-trole-versus-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(18px, 1.6vw, 22px);
  line-height: 1;
  letter-spacing: 0.02em;
  background: var(--ink-warm);
  color: var(--paper-cream);
  box-shadow: 0 2px 8px var(--shadow-paper-deep);
}
```
