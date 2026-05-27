```preset-meta
{
  "name": "peoples-platform",
  "label": "People's Platform",
  "fingerprint": {
    "shadow": "triple-stamp",
    "border": "cream-inset-frame",
    "motion": "stamp-slam",
    "density": "medium",
    "voice": "manifesto"
  },
  "match_signals": [
    { "kind": "shadow_zero_blur", "weight": 0.30 },
    { "kind": "high_sat_accent",  "weight": 0.20 },
    { "kind": "medium_solid_border", "weight": 0.15 },
    { "kind": "bouncy_easing",    "weight": 0.10 },
    { "kind": "minimal_decoration", "weight": 0.05 }
  ],
  "best_for": [
    "manifesto launches",
    "indie SaaS poster",
    "editorial-stamp brands",
    "people-first storytelling",
    "campaign-style narratives"
  ],
  "avoid_for": [
    "minimalist enterprise",
    "quiet authority",
    "fintech compliance pages",
    "data-heavy dashboards",
    "luxury / glass aesthetics"
  ]
}
```

## §A Director's intent

Stamped-poster atlas. Every focal headline carries the same **triple-offset shadow**: accent word in front, a mid-warm drop at 6-10px, a deep-warm drop at 12-20px — always lower-right. The shadow IS the system; nothing else needs to shout.

One **Caveat-script handwritten accent** threads through each plate, rotated −3°, in the deep-warm drop colour. Two voices alternate — Alfa Slab for declarations, Caveat Brush for the human aside — never a third. Cream frames isolate authority surfaces. Pill chrome marks volume.

**Stance** (write into every scene; this is the brand's identity, not optional decoration):

- _character_ — triple-stamped poster system. Every focal word casts the same drop.
- _signal_ — single triple-stamp per plate. Reserve it for one phrase; never split focus.
- _cadence_ — stamp · script · stamp. Two voices alternate; nothing else.

## §B Decoration tokens (merge into design.html `:root`)

This preset depends on the **5-slot brand alias system** (`--brand-primary` / `--brand-secondary` / `--brand-tertiary` / `--brand-accent` / `--brand-costume`) plus the **script font role** (`--font-script`). build-design.mjs emits these automatically. The aliases below give peoples-native names to those slots so component CSS can use the original peoples vocabulary (`var(--paper)`, `var(--blue)`, `var(--orange)`).

**Drop colours** (red / red-deep) are visual signatures — they MUST contrast with the brand accent regardless of brand DNA, so they live as warm-complement literals. If a future brand's accent is red itself, override these in §B with HSL-rotated drops.

```css
/* Surface aliases — bind brand DNA + system neutrals into peoples vocabulary.
 *
 * IMPORTANT MAPPING NOTE: peoples uses "primary/secondary/..." as SURFACE roles
 * (paper = primary surface) but brand DNA uses them as IDENTITY-HUE roles
 * (brand-primary = the most identifying hue, often the signal). Don't confuse:
 *
 *   peoples --paper  = system canvas (light surface)           → var(--canvas)
 *   peoples --orange = signal hue (the brand's loudest color)  → var(--brand-primary)
 *   peoples --blue   = second authority surface (dark plate)   → var(--brand-tertiary)
 *
 * For brands without a second hue (brand-tertiary falls back to accent), the
 * blue plate degrades to a light-tinted surface — known limitation; document
 * via Stage 1 remix-from-golden audit before committing to a video.
 */
--paper: var(--canvas); /* system light canvas — NOT brand-primary */
--ink-line: var(--ink); /* system dark line — NOT brand-secondary */
--blue: var(--brand-tertiary); /* authority dark plate (second hue) */
--orange: var(--brand-primary); /* THE signal — brand's loudest hue */
--cream: var(--brand-costume); /* second light surface — often equals --canvas */

/* Triple-stamp drop palette — warm-complement of accent (literal by design) */
--red: #e83a2a;
--red-deep: #b7281c;

/* Brand-aware derived shades via color-mix (browsers compute at render time) */
--blue-deep: color-mix(in srgb, var(--blue) 65%, var(--ink));
--orange-deep: color-mix(in srgb, var(--orange) 88%, var(--ink));
--ink-dim: color-mix(in srgb, var(--ink) 65%, var(--paper));

/* Triple-stamp shadow stack — THE signature move */
--shadow-triple-sm: 3px 3px 0 var(--red), 6px 6px 0 var(--red-deep);
--shadow-triple-md: 6px 6px 0 var(--red), 12px 12px 0 var(--red-deep);
--shadow-triple-lg: 10px 10px 0 var(--red), 20px 20px 0 var(--red-deep);

/* Frame + bullet primitives */
--frame-cream: 6px solid var(--cream);
--frame-inset: 48px; /* cream frame sits this far from plate edge */
--bullet-diamond: 28px; /* red square rotated 45°, list-only */

/* Grain tooth (two radial layers multiplied @50%) */
--grain-image:
  radial-gradient(rgba(0, 0, 0, 0.06) 1px, transparent 1px),
  radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
--grain-size: 3px 3px, 5px 5px;
--grain-offset: 0 0, 1px 2px;
--grain-opacity: 0.5;

/* Rotation primitives */
--tilt-script: -3deg; /* caveat-brush accent word */
--tilt-stamp: -9deg; /* round end-stamp */
```

## §D Font pairing fallback

- **display**: `'Alfa Slab One'` · `'Archivo Black'` · `'Anton'` wght 400
- **body**: `'Archivo Narrow'` · `'Inter'` · `'IBM Plex Sans'` wght 500
- **mono**: `'DM Mono'` · `'Space Mono'` · `'JetBrains Mono'` wght 500
- **script**: `'Caveat Brush'` · `'Pacifico'` · `'Kalam'` wght 400

The script role is unique to this preset — `var(--font-script)` resolves at render time when the host preset declares §D's script bullet OR the site ships a script face. If absent the role degrades to system-cursive.

## §E Motion (GSAP consts — REPLACES site ease)

```js
const EASE = {
  entry: "back.out(2.4)", // poster slam — bounce overshoot, then stick
  emphasis: "expo.out", // triple-shadow snaps to final position
  exit: "power4.in", // dive off-screen, never fade
  drift: "sine.inOut", // ambient only (grain breath, frame width)
};
const DUR = {
  snap: 0.18,
  med: 0.45,
  slow: 0.9,
};
// RULE: never ease-in-out on primary motion — stamps land, they don't glide
// RULE: each triple-stamp entry pairs with a percussive cue (kick + snare double-hit)
// RULE: caveat-script accent stagger-pops 100-150ms after its host headline
// RULE: cream frame draws once with EASE.entry; never re-animates
// RULE: hard cut between scenes — never crossfade; the stamp IS the cut
```

### §E.5 Motion choreography

- **Allowed primitives**: stamp-slam (translateY −16→0 + scale .92→1), script-pop (rotate −3° + opacity 0→1), frame-draw (scaleX 0→1 or path stroke), grain-breath (filter brightness 1↔1.04), dot-tick (scale 0→1 staggered on track-dots).
- **Forbidden**: cross-fade between plates, slide transitions with momentum, blur in/out, any ease-in-out on primary motion.
- **Stagger budget**: 100-150ms between elements within a single plate. Tight, not languid.
- **Scene transitions**: hard cut only. No surface fade (paper-to-blue cut is part of the brand register).

## §G Voice transform recipe

Take the brand's value-prop sentence. Transform with:

1. Strip articles + connectives (the / a / of / and / with / to)
2. Break into 2-3 word noun-stamp fragments
3. UPPERCASE all
4. End each fragment with `.`
5. Drop one Caveat-script accent word inline (wrap in `<em>`) for emphasis

**Example:**

- IN: `Brex helps teams move money faster across global accounts`
- OUT: `TEAMS. MOVE MONEY. <em>faster</em>. — GLOBAL. — BREX.`

Apply ONLY to DOM-visible text (headlines, chips, button labels, stat captions). Do NOT touch narrator scripts — TTS will mispronounce uppercase and break sentence prosody.

## §H Scene composition hints

**Surface contract** — every scene picks ONE surface from the start; never mix within a scene. Components are surface-tagged (see `chunks/index.json.components[].surface`):

| surface  | components that work                                                | typical narrative role                              |
| -------- | ------------------------------------------------------------------- | --------------------------------------------------- |
| `paper`  | stamp-statement, script-em, diamond-list, track-dots, rotated-stamp | manifestos, ledes, lists, timelines, closing stamps |
| `blue`   | framed-stamp, mega-stat, end-stamp                                  | authority moments, hero stats, closers              |
| `orange` | orange-quote                                                        | customer voice / testimonial                        |

Scene transitions go through hard cut, not surface fade.

**Material composition rules** (peoples invariants — encoded in component frontmatter `avoids_same_scene`):

- Single triple-stamp per plate. `stamp-statement` + `framed-stamp` in same scene → visual collision; pick one.
- Single script-accent per stamp. Two `script-em` instances in one scene → register breaks.
- Cream frame goes only on blue or orange surfaces, never paper. (Cream-on-paper has no contrast.)
- Round stamps (`rotated-stamp`, `end-stamp`) belong to **closer beats** only — never opening/intro scenes.

**Focal sizing per 1920×1080** (rendered px, driven by component CSS `clamp()`):

- Hero headline (display): 120-200px
- Stat numeral (display, tightest tracking): 140-260px
- Body lead: 36-60px
- Caveat-script accent: 80-140px

**Brand colour placement (60 / 30 / 10)**:

- 60% — `var(--paper)` (paper scenes) or `var(--blue)` (framed scenes) — full-bleed background
- 30% — `var(--cream)` for frame chrome, `var(--ink)` for type
- 10% — `var(--orange)` for the stamp head — exactly one focal element per plate

**Sound design hooks** (Phase 4b worker; not encoded in §E):

- Each triple-stamp entry → kick + snare double-hit
- Script-pop → soft pluck or pen-stroke
- Cream frame draw → low whoosh, short

**Materials lexicon** (informational — these are the composition atoms behind the patterns):

- triple-stamp · cream-frame · script-em · star-ribbon · diamond-bullet · round-stamp · pill-chip · track-dot · grain-tooth

## §I Page-level CSS (makes design.html itself read as peoples)

```css
body {
  background: var(--paper);
  color: var(--ink);
  background-image: var(--grain-image);
  background-size: var(--grain-size);
  background-position: var(--grain-offset);
  background-blend-mode: multiply;
}

/* ── Title card: cream-framed blue plate, peoples signature ── */
.title-card {
  position: relative;
  background: var(--blue);
  color: var(--cream);
  border-bottom: 8px solid var(--orange);
  padding: 120px 0 96px;
}
.title-card::after {
  content: "";
  position: absolute;
  inset: 48px 64px;
  border: var(--frame-cream);
  pointer-events: none;
}
.title-card-inner {
  position: relative;
  z-index: 1;
}
.brand-row {
  color: var(--cream);
}
.title-display {
  text-transform: uppercase;
  letter-spacing: -0.01em;
  color: var(--orange);
  text-shadow: var(--shadow-triple-lg);
  line-height: 0.86;
}
.brand-name {
  color: var(--cream);
  font-weight: 700;
}
.brand-x {
  color: var(--orange);
  opacity: 1;
}
.style-name {
  color: var(--cream);
  font-weight: 700;
}
.title-meta {
  color: color-mix(in srgb, var(--cream) 80%, transparent);
}
.title-meta strong {
  color: var(--orange);
}

/* ── Section chrome: thick ink dividers, blue eyebrow, triple-shadow h2 ── */
.ds-section {
  border-top: 4px solid var(--ink);
}
.eyebrow {
  color: var(--blue);
  font-weight: 700;
  letter-spacing: 0.2em;
}
h2 {
  text-transform: uppercase;
  letter-spacing: -0.01em;
  color: var(--blue);
  text-shadow: var(--shadow-triple-sm);
}
h2 em {
  font-style: normal;
  color: var(--orange);
  text-shadow: var(--shadow-triple-sm);
}
.ds-h3 {
  color: var(--blue);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Markdown table: peoples-flavor ── */
.ds-table {
  border: 3px solid var(--ink);
  background: var(--paper);
}
.ds-table th {
  background: var(--blue) !important;
  color: var(--cream) !important;
  border: 3px solid var(--ink) !important;
}
.ds-table td {
  border: 1px solid var(--ink) !important;
}
.ds-table td code {
  background: var(--orange);
  color: var(--blue);
  padding: 2px 6px;
  font-weight: 700;
}

/* ── Lists in prose blocks ── */
.ds-prose-block .ds-list {
  list-style: none;
  padding-left: 32px;
}
.ds-prose-block .ds-list li {
  position: relative;
}
.ds-prose-block .ds-list li::before {
  content: "";
  position: absolute;
  left: -28px;
  top: 0.55em;
  width: 14px;
  height: 14px;
  background: var(--red);
  transform: rotate(45deg);
}
.ds-prose-block .ds-list.ds-list,
.ds-prose-block ol.ds-list li::before {
  /* numbered lists keep default markers */
  display: revert;
}
.ds-prose-block ol.ds-list {
  list-style: decimal;
}
.ds-prose-block ol.ds-list li::before {
  content: none;
}

/* ── Cards take the peoples treatment: thick ink border, cream chrome on dark ── */
.dna-swatch,
.type-card,
.voice-pair,
.comp-card {
  border: 4px solid var(--ink) !important;
  border-radius: 14px !important;
}
.comp-head {
  background: var(--blue) !important;
  color: var(--cream);
  border-bottom: 4px solid var(--ink) !important;
}
.comp-head .comp-name,
.comp-head .comp-marker {
  color: var(--cream);
}
.comp-preview {
  background-image: var(--grain-image);
  background-size: var(--grain-size);
  background-position: var(--grain-offset);
  background-blend-mode: multiply;
}

/* ── Code blocks: warmer than default ── */
.ds-code {
  border: 3px solid var(--ink) !important;
  border-radius: 14px !important;
  background: #0e0e14 !important;
  color: var(--cream) !important;
}
.eyebrow code,
.ds-prose code {
  background: var(--orange);
  color: var(--blue);
  font-weight: 700;
}
```
