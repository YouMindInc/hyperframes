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
  ],
  "chromeFonts": {
    "googleFontsHref": "https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Source+Sans+3:wght@400;500;600;700&family=Caveat+Brush&family=DM+Mono:wght@400;500&display=swap",
    "display": "Alfa Slab One",
    "body": "Source Sans 3",
    "script": "Caveat Brush",
    "mono": "DM Mono"
  }
}
```

> `chromeFonts` makes the design.html doc chrome (title-card, section heads, h2/h3, lede paragraphs, eyebrows) render in the preset's NATIVE typography — Alfa Slab + Caveat Brush + Source Sans + DM Mono — instead of the brand DNA fonts. The brand fonts still apply to §6 component code (paste-ready for Phase 4b) and to the LEFT column of §6's dual preview. The RIGHT column uses `.preset-native-scope` to re-bind `--font-display/body/script/mono` to these native families so reviewers can compare brand-applied vs preset-native side-by-side.

## §A Director's intent

Stamped-poster atlas. Every focal headline carries the same **triple-offset shadow**: accent word in front, a mid-warm drop at 6-10px, a deep-warm drop at 12-20px — always lower-right. The shadow IS the system; nothing else needs to shout.

One **Caveat-script handwritten accent** threads through each plate, rotated −3°, in the deep-warm drop colour. Two voices alternate — Alfa Slab for declarations, Caveat Brush for the human aside — never a third. Cream frames isolate authority surfaces. Pill chrome marks volume.

**Stance** (write into every scene; this is the brand's identity, not optional decoration):

- _character_ — triple-stamped poster system. Every focal word casts the same drop.
- _signal_ — single triple-stamp per plate. Reserve it for one phrase; never split focus.
- _cadence_ — stamp · script · stamp. Two voices alternate; nothing else.

## §B Decoration tokens (merge into design.html `:root`)

This preset uses the **5-slot brand alias system** (`--brand-primary` / `--brand-secondary` / `--brand-tertiary` / `--brand-accent` / `--brand-costume`) plus the **script font role** (`--font-script`). build-design.mjs emits these automatically. The aliases below give peoples-native names to those slots so component CSS can use the original peoples vocabulary (`var(--paper)`, `var(--blue)`, `var(--orange)`).

**Poster hue anchors** (blue / orange / cream) are a §8.2 preset-character exception. People's Platform collapses if the authority plate becomes a near-black tertiary token or the stamp signal stops reading orange; the original system is a saturated royal-blue plate with orange stamp type. Brand DNA still tints the plate, but the orange signal remains anchored.

**Drop colours** (red / red-deep) are visual signatures — they MUST contrast with the brand accent regardless of brand DNA, so they live as warm-complement literals. If a future brand's accent is red itself, override these in §B with HSL-rotated drops.

```css
/* §8.2 exception: poster hue anchors. Declared once so every surface keeps the
   original peoples high-chroma blue/orange register while brand DNA lightly
   tints the authority plate. */
--anchor-blue: #2c2cdc;
--anchor-orange: #f2a03a;
--anchor-cream: #f4e9d6;

/* Surface aliases — bind brand DNA + system neutrals into peoples vocabulary.
 *
 * IMPORTANT MAPPING NOTE: peoples uses "primary/secondary/..." as SURFACE roles
 * (paper = primary surface) but brand DNA uses them as IDENTITY-HUE roles
 * (brand-primary = the most identifying hue, often the signal). Don't confuse:
 *
 *   peoples --paper  = system canvas (light surface)           → var(--canvas)
 *   peoples --orange = orange stamp signal                     → var(--anchor-orange)
 *   peoples --blue   = vivid authority surface                 → anchor blue + brand tint
 *
 * Do not map --blue directly to --brand-tertiary: many sites expose very dark
 * text/semantic blues there, which turns the poster plate muddy instead of vivid.
 */
--paper: var(--canvas); /* system light canvas — NOT brand-primary */
--ink-line: var(--ink); /* system dark line — NOT brand-secondary */
--blue: color-mix(in srgb, var(--brand-primary) 18%, var(--anchor-blue));
--orange: var(--anchor-orange); /* THE signal — always reads orange */
--cream: color-mix(in srgb, var(--brand-costume) 68%, var(--anchor-cream));

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

## §T Type-role atlas (Phase 4b reads this to size text correctly)

Each entry is a **named type role** with concrete render parameters at 1920×1080 — family token, px range, weight, leading, tracking, case, and any color/shadow/rotation decoration. Phase 4b scene workers may cite roles by `id` ("use a `stamp-statement` here"); the brand DNA fonts plug in automatically via `var(--font-*)` tokens. This is the same atlas peoples-design.html ships in its `// 03 / type` section, ported as machine-readable JSON.

The atlas is the **sole authoring source** for non-component text. If a scene needs a `mega-stat` numeral that isn't covered by §6 components, the worker reads role `mega-stat` here and writes inline CSS from these values. Do NOT invent ad-hoc sizes.

```type-roles
[
  {
    "id": "display",
    "family": "display",
    "purpose": "hero display with triple shadow",
    "px_min": 120, "px_max": 200, "weight": 400, "leading": "0.86", "tracking": "0.005em", "case": "upper",
    "sample_html": "<div class=\"t-trole-display\">{BRAND_NAME}.</div>"
  },
  {
    "id": "mega-stamp",
    "family": "display",
    "purpose": "closing stamp",
    "px_min": 140, "px_max": 260, "weight": 400, "leading": "0.82", "tracking": "-0.01em", "case": "upper",
    "sample_html": "<div class=\"t-trole-mega-stamp\">Stamped.</div>"
  },
  {
    "id": "stat-numeral",
    "family": "display",
    "purpose": "hero stat with red + red-deep shadow",
    "px_min": 140, "px_max": 260, "weight": 400, "leading": "0.82", "tracking": "-0.015em", "case": "upper",
    "sample_html": "<div class=\"t-trole-stat-numeral\">63<sup>%</sup></div>"
  },
  {
    "id": "script-line",
    "family": "script",
    "purpose": "rotated script accent (−3°)",
    "px_min": 80, "px_max": 140, "weight": 400, "leading": "0.95", "tracking": "0.005em", "case": "lower",
    "sample_html": "<div class=\"t-trole-script-line\">over to you —</div>"
  },
  {
    "id": "framed-headline",
    "family": "display",
    "purpose": "cream-framed blue plate",
    "px_min": 60, "px_max": 108, "weight": 400, "leading": "0.92", "tracking": "0.005em", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-framed-headline\">Framed plate.</span></div>"
  },
  {
    "id": "stamp-statement",
    "family": "display",
    "purpose": "paper statement with red drop + orange em",
    "px_min": 72, "px_max": 128, "weight": 400, "leading": "0.95", "tracking": "0.005em", "case": "upper",
    "sample_html": "<div class=\"t-trole-stamp-statement\">The product <em>gets simpler.</em></div>"
  },
  {
    "id": "script-inline",
    "family": "display + script",
    "purpose": "inline script accent word inside display run",
    "px_min": 40, "px_max": 64, "weight": 400, "leading": "1", "tracking": "0.005em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-script-inline\">SET IN <em>slab</em> &amp; SCRIPT.</div>"
  },
  {
    "id": "lead",
    "family": "body",
    "purpose": "deck lead beside the stamp",
    "px_min": 36, "px_max": 60, "weight": 600, "leading": "1.4", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-lead\">The lede sits beside the stamp. Same width as the shadow; never above the headline.</p>"
  },
  {
    "id": "body",
    "family": "body",
    "purpose": "body paragraph",
    "px_min": 36, "px_max": 60, "weight": 500, "leading": "1.55", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body\">Body holds at 500. Tight measure, no italic — the script does the curve.</p>"
  },
  {
    "id": "pill-row",
    "family": "mono",
    "purpose": "cream-bordered pill chip (chrome marker, not verdict)",
    "px_min": 27, "px_max": 32, "weight": 500, "leading": "1", "tracking": "0.18em", "case": "upper",
    "sample_html": "<div class=\"t-trole-pill-row\"><span class=\"t-trole-pill\">Vol. 01</span><span class=\"t-trole-pill t-trole-pill-paper\">May 2026</span><span class=\"t-trole-pill t-trole-pill-dark\">★ Stamped ★</span></div>"
  },
  {
    "id": "mono-chrome",
    "family": "mono",
    "purpose": "mono chrome line with star separators",
    "px_min": 27, "px_max": 32, "weight": 500, "leading": "1.5", "tracking": "0.18em", "case": "upper",
    "sample_html": "<div class=\"t-trole-mono-chrome\">★ ★ ★&nbsp; OUR THESIS &nbsp;★ ★ ★</div>"
  },
  {
    "id": "diamond-row",
    "family": "body",
    "purpose": "diamond-bulleted list row (one sentence per row)",
    "px_min": 27, "px_max": 40, "weight": 500, "leading": "1.4", "tracking": "0", "case": "sentence",
    "sample_html": "<div class=\"t-trole-diamond-row\"><span>Stamped, signed, framed.</span><span>Three lines, no more.</span></div>"
  },
  {
    "id": "star-ribbon",
    "family": "mono",
    "purpose": "orange star-ribbon strip with ink rule top + bottom",
    "px_min": 27, "px_max": 32, "weight": 500, "leading": "1", "tracking": "0.22em", "case": "upper",
    "sample_html": "<div class=\"t-trole-star-ribbon\"><span>★ Focus</span><span>★ Learn</span><span>★ Ship</span></div>"
  },
  {
    "id": "rotated-stamp",
    "family": "display + mono",
    "purpose": "rotated round stamp (−9°) with red drop",
    "px_min": 120, "px_max": 220, "weight": 400, "leading": "1", "tracking": "0", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-rotated-stamp\"><span class=\"big\">END</span><span class=\"small\">— V. 01 —</span></span></div>"
  },
  {
    "id": "track-row",
    "family": "mono",
    "purpose": "dotted track timeline row (alternating orange + blue dots)",
    "px_min": 27, "px_max": 32, "weight": 500, "leading": "1", "tracking": "0.16em", "case": "upper",
    "sample_html": "<div class=\"t-trole-track-row\"><span class=\"dot\"></span><span class=\"bar\"></span><span class=\"dot alt\"></span><span class=\"bar\"></span><span class=\"dot\"></span><span class=\"bar\"></span><span class=\"dot alt\"></span><span class=\"label\">May → October</span></div>"
  },
  {
    "id": "cta-block",
    "family": "display",
    "purpose": "cream-bordered orange CTA button",
    "px_min": 32, "px_max": 48, "weight": 400, "leading": "1", "tracking": "0.02em", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-cta\">Let's talk</span></div>"
  },
  {
    "id": "end-mark",
    "family": "display",
    "purpose": "closing end mark",
    "px_min": 80, "px_max": 140, "weight": 400, "leading": "0.9", "tracking": "0.005em", "case": "upper",
    "sample_html": "<div class=\"t-trole-end-mark\">Stamped.</div>"
  }
]
```

The atlas omits `grain-tile` from peoples-design (it's a texture, not a type role — belongs in §B decoration tokens).

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

**Surface `#root` CSS** — paste-ready stanza for the Phase 4b scene worker. When `dispatch.surface` is set, the worker drops the matching block into the scene's `#root { ... }` instead of the default `background: var(--canvas)`. Missing the override → mp4 renders generic SaaS canvas, loses half the preset's visual signature.

```css
/* surface: paper —— poster-board base + paper grain */
#root {
  background: var(--paper);
  color: var(--ink);
  background-image: var(--grain-image);
  background-size: var(--grain-size);
  background-position: var(--grain-offset);
  background-blend-mode: multiply;
  font-family: var(--font-body);
}

/* surface: blue —— authority plate + cream-frame inset.
   ::after frame is z-index:0, so all scene content MUST be wrapped in
   <div style="position:relative; z-index:1;"> to sit above the frame. */
#root {
  position: relative;
  background: var(--blue);
  color: var(--cream);
  font-family: var(--font-body);
}
#root::after {
  content: "";
  position: absolute;
  inset: 48px 64px;
  border: var(--frame-cream);
  pointer-events: none;
  z-index: 0;
}

/* surface: orange —— signal plate (≤ 1 scene per video) */
#root {
  background: var(--orange);
  color: var(--blue);
  font-family: var(--font-body);
}
```

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

## §M Atomic motifs (gestures the plan agent can reference)

Each motif is a **single reusable gesture** that lives inside a larger pattern. Patterns compose motifs; motifs do not compose anything. The plan agent treats motifs as the smallest cite-able vocabulary — a scene description can say "uses motif:triple-shadow on the headline" without specifying which pattern the headline sits in.

```motifs
[
  {
    "id": "triple-shadow",
    "label": "Triple shadow",
    "role": "signature-shadow",
    "surface_safe": ["paper", "blue", "cream"],
    "description": "Orange word + 6px red drop + 12px red-deep drop. The system's only shadow. Apply to every focal headline; never duplicate within a scene.",
    "wide": true,
    "demo": "<div class=\"pp-motif-shadow\">SHADOW.</div>",
    "css": ".pp-motif-shadow{font-family:var(--f-disp-native);font-weight:400;font-size:clamp(64px,8vw,120px);line-height:.9;text-transform:uppercase;letter-spacing:.005em;color:var(--orange);text-shadow:6px 6px 0 var(--red),12px 12px 0 var(--red-deep);text-align:center}"
  },
  {
    "id": "script-flick",
    "label": "Script flick",
    "role": "handwritten-accent",
    "surface_safe": ["paper", "blue", "orange"],
    "description": "Caveat Brush, −3° rotation, in red ink. One handwritten word per stamp; never two. Threads humanity through authority.",
    "demo": "<span class=\"pp-motif-flick\">— simpler</span>",
    "css": ".pp-motif-flick{display:inline-block;font-family:var(--f-script-native);font-weight:400;font-size:clamp(48px,5vw,80px);line-height:1;color:var(--red);transform:rotate(-3deg)}"
  },
  {
    "id": "star-flank",
    "label": "Star flank",
    "role": "separator-stars",
    "surface_safe": ["orange", "paper"],
    "surface": "orange",
    "description": "★ ★ ★ separators frame chrome lines in mono caps. The only ornament allowed inside ribbon strips.",
    "demo": "<div class=\"pp-motif-star\">★ ★ ★&nbsp; OUR THESIS &nbsp;★ ★ ★</div>",
    "css": ".pp-motif-star{font-family:var(--f-mono-native);font-weight:500;font-size:clamp(16px,1.6vw,22px);line-height:1;letter-spacing:.22em;text-transform:uppercase;color:var(--blue);text-align:center}"
  },
  {
    "id": "diamond-row",
    "label": "Diamond row",
    "role": "list-marker",
    "surface_safe": ["paper", "cream"],
    "description": "Red square rotated 45°. List items only — never decorative. Three rows is the cap; one sentence per row.",
    "demo": "<div class=\"pp-motif-diamonds\"><span>Stamped.</span><span>Signed.</span><span>Framed.</span></div>",
    "css": ".pp-motif-diamonds{display:flex;flex-direction:column;gap:10px}.pp-motif-diamonds span{font-family:var(--f-body-native);font-weight:500;font-size:clamp(16px,1.6vw,22px);line-height:1.4;color:var(--ink);padding-left:30px;position:relative}.pp-motif-diamonds span::before{content:\"\";position:absolute;left:0;top:.4em;width:16px;height:16px;background:var(--red);transform:rotate(45deg)}"
  },
  {
    "id": "rotated-stamp",
    "label": "Rotated stamp",
    "role": "round-approval",
    "surface_safe": ["paper", "blue"],
    "surface": "cream",
    "description": "Cream disc, orange border, −9° rotation, red drop shadow. Reserved for END / APPROVED beats — never opens, only closes.",
    "demo": "<div class=\"pp-motif-round\">★</div>",
    "css": ".pp-motif-round{width:140px;height:140px;border-radius:50%;background:var(--cream);color:var(--blue);border:6px solid var(--orange);display:grid;place-items:center;font-family:var(--f-disp-native);font-weight:400;font-size:36px;line-height:1;text-transform:uppercase;transform:rotate(-9deg);box-shadow:8px 8px 0 var(--red);margin:0 auto}"
  },
  {
    "id": "end-mark",
    "label": "End mark",
    "role": "closing-mark",
    "surface_safe": ["blue"],
    "surface": "blue",
    "description": "The closing lock: triple-stamped headline on cream-framed blue plate, with rotated round stamp. Last-shot only; never used mid-arc.",
    "demo": "<div class=\"pp-motif-end\">End.</div>",
    "css": ".pp-motif-end{font-family:var(--f-disp-native);font-weight:400;font-size:clamp(64px,8vw,120px);line-height:.9;text-transform:uppercase;letter-spacing:.005em;color:var(--orange);text-shadow:6px 6px 0 var(--red),12px 12px 0 var(--red-deep);text-align:center}"
  }
]
```

The `motifs` JSON block above is the SOLE source of truth. build-design.mjs reads it to render §M cards in design.html. The Phase 3 plan agent and Phase 4b scene worker may cite motifs by `id` when annotating which gesture a scene relies on.

**Sound design hooks** (Phase 4b worker; not encoded in §E):

- Each triple-stamp entry → kick + snare double-hit
- Script-pop → soft pluck or pen-stroke
- Cream frame draw → low whoosh, short

**Materials lexicon** (informational — these are the composition atoms behind the patterns):

- triple-stamp · cream-frame · script-em · star-ribbon · diamond-bullet · round-stamp · pill-chip · track-dot · grain-tooth

## §C Captions (peoples-stamped karaoke overlay)

Captions ride a dedicated full-bleed sub-composition (`compositions/captions.html`) overlaid on every scene via track 12. They are a **support layer** — primary scene motion still governs the cut. What captions DO carry: the peoples register (stamp-slam entrance, single red drop, blue/orange voice rotation), shrunken to caption scale.

Caption type uses a **single 5-6px red drop**, not the heavy §M triple — the triple is reserved for §T hero / mega-stamp roles (120-200px). At caption scale (72-128px in a 2-3-word line) stacked triple drops clip neighbours; the §T `stamp-statement` recipe applies here instead.

The active word IS the only thing on screen with a shadow. Passed words drop the shadow and fade to ink-55. Upcoming words sit at ink-22 — visible enough to anchor the line, faint enough to never compete with the active stamp.

**Active variant by underlying surface** — caption groups inherit no surface of their own, but the active word's hue depends on what's underneath:

| Scene underneath | Active word color | Drop         |
| ---------------- | ----------------- | ------------ |
| `paper`          | `var(--blue)`     | `var(--red)` |
| `orange`         | `var(--blue)`     | `var(--red)` |
| `blue`           | `var(--orange)`   | `var(--red)` |

When `captions.mjs` cannot sample the per-window surface (default case), it ships the **paper variant** (blue word). Mixed-surface video → pick majority. Blue-heavy video → switch globally to the orange variant by adding `class="surface-blue"` on every `.cap-line` wrapper.

**Cadence**: ONE group on screen at a time. Hard cut between groups — peoples never crossfades plates, captions are no exception. The within-group transition (active → passed) IS gradual via class toggle, but the line itself snaps off at `group.end` via `tl.set` hard kill.

**Group sizing**: 2-3 words per group. Hard cap. The stamp must LAND; long caption lines dilute the slam. Break on: sentence boundary (`.` `,` `?` `!`) · 150ms+ inter-word silence · 3-word cap.

**Script-flick emphasis** (opt-in, ≤ 1 per group): wrap a word in `<em>` in the source transcript and the captions builder renders it as motif:script-flick — Caveat Brush, `var(--red)`, `-3deg` rotation, no shadow. Use it like §A's "human aside" — once per stamp, never twice. Two script-flicks in one group breaks the register.

**Diverges from §E in one specific way**: captions allow a 350ms `power4.in` opacity drift on group exit. Primary motion in scenes still obeys §E (no ease-in-out on primary motion; hard cut between cuts). Captions are the support layer — soft within-group exit prevents flicker without weakening the brand register.

### Caption config (machine-readable defaults)

```caption-config
{
  "position_landscape":   { "bottom": "100px", "anchor": "center" },
  "position_portrait":    { "bottom": "700px", "anchor": "center" },
  "font_size_clamp":      "clamp(72px, 8vw, 128px)",
  "group_words_min":      2,
  "group_words_max":      3,
  "group_split_on":       ["sentence_boundary", "silence_150ms", "max_words"],
  "ease_line_enter":      "back.out(2.4)",
  "ease_line_exit":       "power4.in",
  "ease_word_stamp":      "back.out(2.4)",
  "dur_line_enter":       0.45,
  "dur_line_exit":        0.35,
  "dur_word_stamp":       0.18,
  "dur_word_settle":      0.12,
  "default_hold_s":       0.42,
  "active_variants": {
    "paper":  { "color": "var(--blue)",   "drop": "5px 5px 0 var(--red)" },
    "orange": { "color": "var(--blue)",   "drop": "5px 5px 0 var(--red)" },
    "blue":   { "color": "var(--orange)", "drop": "5px 5px 0 var(--red)" }
  },
  "default_variant":      "paper",
  "sound_hooks": {
    "per_active_word":    "kick + snare double-hit (matches §H stamp-slam cue) — track 20+",
    "per_emphasis":       "soft pluck or pen-stroke (script-flick)",
    "per_line_entry":     "low whoosh-short, optional (skip if SFX budget tight)"
  }
}
```

### Caption CSS (paste into `compositions/captions.html` `<style>`)

```caption-css
/* peoples-platform · captions · single red drop, stamp-slam, ink fade ladder */

.cap-line {
  position: absolute;
  left: 50%;
  bottom: 100px;
  transform: translateX(-50%);
  display: flex;
  gap: 0.32em;
  align-items: baseline;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(72px, 8vw, 128px);
  line-height: 0.95;
  letter-spacing: 0.005em;
  text-transform: uppercase;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  z-index: 10;
}

/* Upcoming — line is on, this word hasn't stamped yet. Faint ink. */
.cap-word {
  display: inline-block;
  color: var(--ink);
  opacity: 0.22;
  text-shadow: none;
  will-change: transform, opacity;
}

/* Active — THE stamp. Default = paper / orange surface variant (blue word). */
.cap-word.active {
  color: var(--blue);
  opacity: 1;
  text-shadow: 5px 5px 0 var(--red);
}

/* Passed — already stamped, fading. No shadow. */
.cap-word.passed {
  color: var(--ink);
  opacity: 0.55;
  text-shadow: none;
}

/* Surface-blue override — line over a blue-surface scene swaps the active hue. */
.cap-line.surface-blue .cap-word.active {
  color: var(--orange);
}

/* Script-flick emphasis (transcript-tagged via <em>). Caveat Brush, red, tilted. */
.cap-word.emphasis,
.cap-line em.cap-word {
  font-family: var(--font-script);
  font-weight: 400;
  color: var(--red);
  text-shadow: none;
  transform: rotate(-3deg);
  opacity: 1;
}

/* Portrait variant — lower-third position, smaller cap. */
@media (max-aspect-ratio: 9/16) {
  .cap-line {
    bottom: 700px;
    font-size: clamp(56px, 7vw, 92px);
  }
}
```

### HTML template (one per group, captions.mjs emits N groups)

```caption-template
<div class="cap-line" id="cap-g-{N}">
  <span class="cap-word" id="cap-g-{N}-w-0">{WORD_0}</span>
  <span class="cap-word" id="cap-g-{N}-w-1">{WORD_1}</span>
  <!-- 2-3 words per group · wrap one in <em class="cap-word"> for script-flick -->
  <!-- Add `class="cap-line surface-blue"` when the underlying scene is blue -->
</div>
```

### Animation pattern (GSAP recipe captions.mjs emits per group)

```js
// 1) Line enter at group.start
tl.fromTo(
  line,
  { opacity: 0, y: 16, visibility: "visible" },
  { opacity: 1, y: 0, duration: 0.45, ease: "back.out(2.4)" },
  group.start,
);

// 2) Per word at word.start — class toggle + stamp-slam
words.forEach((word, i) => {
  tl.call(
    () => {
      word.classList.add("active");
      if (i > 0) {
        words[i - 1].classList.remove("active");
        words[i - 1].classList.add("passed");
      }
    },
    null,
    word.start,
  );

  tl.fromTo(
    word,
    { y: -16, scale: 0.92 },
    {
      y: 0,
      scale: 1.0,
      duration: Math.min(0.18, word.dur * 0.9), // never overruns next word
      ease: "back.out(2.4)",
    },
    word.start,
  );
});

// 3) Last word passes 0.1s after its end (so it doesn't stay glowing under silence)
tl.call(
  () => {
    last.classList.remove("active");
    last.classList.add("passed");
  },
  null,
  lastWord.end + 0.1,
);

// 4) Line exit at group.end - 0.35
tl.to(line, { opacity: 0, y: -12, duration: 0.35, ease: "power4.in" }, group.end - 0.35);

// 5) Hard kill at group.end — required by hyperframes-core (deterministic seek)
//    and by captions.md (no two groups visible simultaneously).
tl.set(line, { opacity: 0, visibility: "hidden" }, group.end);
```

### Sound hooks (wired by hyperframes-finalize on track 20+)

Captions inherit the peoples percussive register declared in §H — they don't introduce a new audio voice.

- **Per active stamp** → `kick + snare` double-hit at `word.start`. Same gesture as headline stamp-slams in primary scenes.
- **Per script-flick** → optional `pluck` or `pen-stroke` at the emphasis word's `start`. Skip if the same beat already has a primary-scene SFX (don't double-trigger).
- **Per line entry** → optional `whoosh-short` at `group.start - 0.05`. Skip if SFX budget is tight; the per-word stamp hits carry the rhythm alone.

### Edge cases & lints (captions.mjs enforces)

- **Word duration < `dur_word_stamp` (0.18s)** — clamp the stamp animation to `min(0.18, word.dur * 0.9)` so it always finishes before the next class toggle. (Recipe already does this.)
- **Two `<em>` in one group** — drop the second; one script voice per stamp (§A: "two voices alternate; nothing else"). Lint at group-build time.
- **Gap between groups** — leave it. Don't pad with extended exit. Empty space between groups IS the brand's silence beat (peoples is poster-paced, not continuous chatter).
- **Source transcript has no `<em>`** — fine. Default groups have no script-flick; emphasis is opt-in.
- **All-blue-surface video** — pass `default_variant: "blue"` to `captions.mjs`; the builder applies `class="surface-blue"` on every `.cap-line` and the active hue swaps to orange globally.
- **Caption fits in viewport** — the builder MUST call `fitTextFontSize()` (per `hyperframes-media/captions/authoring.md`) against `maxWidth: 1600` landscape / `900` portrait, baseline 96px, min 56px. A 3-word group with a long word (e.g. "INFRASTRUCTURE.") would otherwise clip the line.

## §I Page-level CSS (makes design.html itself read as peoples)

```css
/* ── Preset-native typography vars (loaded via preset-meta.chromeFonts.googleFontsHref).
 * These let the doc chrome render in Alfa Slab/Caveat Brush/Source Sans/DM Mono
 * regardless of which brand DNA the preset is applied to. The §6 component
 * preview also reads these via .preset-native-scope.
 *
 * The fallback chain matters: if Google Fonts is blocked (some IDE previews) or
 * slow, we DO NOT want to fall through to generic `serif` (renders as Times,
 * which kills the stamped-slab character). Each chain ends in a font that still
 * carries the preset's vibe — Archivo Black / Anton / Impact for the display
 * slab; Inter for body; system cursives for script. Falling all the way to
 * generic should never happen in practice. */
:root {
  --f-disp-native:
    "Alfa Slab One", "Archivo Black", "Anton", "Impact", "Arial Black", "Helvetica Neue", sans-serif;
  --f-body-native:
    "Source Sans 3", "Inter", "IBM Plex Sans", -apple-system, BlinkMacSystemFont, system-ui,
    sans-serif;
  --f-script-native:
    "Caveat Brush", "Pacifico", "Kalam", "Brush Script MT", "Comic Sans MS", cursive;
  --f-mono-native: "DM Mono", "Space Mono", "JetBrains Mono", "Menlo", ui-monospace, monospace;
}

body {
  background: var(--paper);
  color: var(--ink);
  background-image: var(--grain-image);
  background-size: var(--grain-size);
  background-position: var(--grain-offset);
  background-blend-mode: multiply;
  font-family: var(--f-body-native);
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
  font-family: var(--f-disp-native);
  font-weight: 400;
  font-size: clamp(96px, 14vw, 220px);
  text-transform: uppercase;
  letter-spacing: 0.005em;
  color: var(--orange);
  text-shadow:
    8px 8px 0 var(--red),
    16px 16px 0 var(--red-deep);
  line-height: 0.86;
}
.brand-row {
  font-family: var(--f-mono-native);
}
.title-meta {
  font-family: var(--f-mono-native);
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
  padding: clamp(56px, 9vh, 120px) 0;
}
.eyebrow {
  font-family: var(--f-mono-native);
  color: var(--blue);
  font-weight: 700;
  letter-spacing: 0.2em;
  font-size: 13px;
  opacity: 1;
  margin-bottom: 24px;
}
h1,
h2,
h3 {
  font-family: var(--f-disp-native);
}
.ds-section h2 {
  font-family: var(--f-disp-native);
  font-weight: 400;
  font-size: clamp(56px, 9vw, 128px);
  line-height: 0.88;
  text-transform: uppercase;
  letter-spacing: 0.005em;
  color: var(--blue);
  text-shadow: 6px 6px 0 var(--red);
  margin-bottom: clamp(32px, 5vh, 56px);
  max-width: 18ch;
}
.ds-section h2 em {
  font-style: normal;
  color: var(--orange);
  text-shadow:
    6px 6px 0 var(--red),
    12px 12px 0 var(--red-deep);
}
.ds-h3 {
  font-family: var(--f-disp-native) !important;
  font-weight: 400 !important;
  font-size: clamp(20px, 1.8vw, 28px) !important;
  color: var(--blue);
  text-transform: uppercase;
  letter-spacing: 0.005em !important;
  opacity: 1 !important;
}
.ds-prose,
.ds-prose-block .ds-prose {
  font-family: var(--f-body-native);
  font-size: clamp(15px, 1.2vw, 17px);
  line-height: 1.7;
  opacity: 0.9;
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

/* ── .preset-native-scope: re-bind brand DNA font tokens to preset-native
 * families. Wraps §6 component previews and §M motifs demos so var(--font-*)
 * resolves to Alfa Slab / Source Sans / Caveat Brush / DM Mono regardless of
 * the brand DNA tokens emitted in :root. The paste-ready component source is
 * untouched — Phase 4b still grep + paste original `var(--font-display)`
 * tokens, which resolve to brand DNA at scene-render time. */
.preset-native-scope {
  --font-display: var(--f-disp-native);
  --font-body: var(--f-body-native);
  --font-script: var(--f-script-native);
  --font-mono: var(--f-mono-native);
}

/* ── §M Motifs grid: atomic gestures.
 * Mirrors peoples-design.html "06 moves" — a 12-col grid of small cards each
 * teaching ONE reusable gesture (triple-shadow, script-flick, star-flank,
 * diamond-row, rotated-stamp, end-mark). Cards may declare a surface
 * (orange / blue / cream) to demonstrate the gesture against its native bg. */
.ds-motif-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}
.ds-motif {
  grid-column: span 4;
  min-height: 280px;
  padding: 30px;
  border: 4px solid var(--ink);
  border-radius: 14px;
  background: var(--paper);
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
.ds-motif.ds-motif-surface-blue {
  background: var(--blue);
  color: var(--cream);
  border-color: var(--cream);
}
.ds-motif.ds-motif-surface-orange {
  background: var(--orange);
  color: var(--blue);
}
.ds-motif.ds-motif-surface-cream {
  background: var(--cream);
  color: var(--ink);
}
.ds-motif-h {
  margin: 0;
  font-family: var(--f-disp-native);
  font-weight: 400;
  font-size: clamp(26px, 2.8vw, 40px);
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.005em;
  color: var(--blue);
  text-shadow: 4px 4px 0 var(--red);
}
.ds-motif.ds-motif-surface-blue .ds-motif-h {
  color: var(--orange);
  text-shadow: 4px 4px 0 var(--red);
}
.ds-motif.ds-motif-surface-orange .ds-motif-h {
  color: var(--blue);
  text-shadow: 4px 4px 0 var(--red);
}
.ds-motif-h em {
  font-style: normal;
  color: var(--orange);
  text-shadow: 4px 4px 0 var(--red);
}
.ds-motif.ds-motif-surface-orange .ds-motif-h em {
  color: var(--cream);
}
.ds-motif-desc {
  margin: 0;
  font-family: var(--f-body-native);
  font-weight: 500;
  font-size: 15px;
  line-height: 1.55;
  color: var(--ink-dim);
  max-width: 30ch;
}
.ds-motif.ds-motif-surface-blue .ds-motif-desc {
  color: color-mix(in srgb, var(--cream) 85%, transparent);
}
.ds-motif.ds-motif-surface-orange .ds-motif-desc {
  color: var(--blue);
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
.ds-motif.ds-motif-surface-blue .ds-motif-id {
  color: var(--cream);
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

/* ── §T Type-role atlas (declared as JSON in §T; rendered in §3 Typography).
 * Container = peoples-design's `.type-box` look. Each row's `.t-trole-*` class
 * encodes the role's family / size / weight / leading / tracking / case /
 * shadow / decoration. Family selectors use var(--font-display) etc. so the
 * atlas renders in BRAND DNA fonts (heygen → ABC Solar Display etc.), not
 * preset-native. The role itself is preset-declared (the recipe is peoples-
 * native), only the actual typeface comes from brand. */
.ds-trole-box {
  display: flex;
  flex-direction: column;
  border: 4px solid var(--ink);
  border-radius: 14px;
  background: var(--paper);
  overflow: hidden;
  margin-top: 24px;
}
.ds-trole-row {
  display: grid;
  grid-template-columns: 14em 1fr;
  gap: 32px;
  padding: 30px 36px;
  border-bottom: 2px dashed color-mix(in srgb, var(--ink) 30%, transparent);
  align-items: baseline;
}
.ds-trole-row:last-child {
  border-bottom: 0;
}
.ds-trole-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: var(--f-mono-native);
  font-weight: 500;
  font-size: 11px;
  line-height: 1.5;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-dim);
}
.ds-trole-meta b {
  color: var(--red);
  font-family: var(--f-disp-native);
  font-weight: 400;
  font-size: 18px;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.005em;
}
.ds-trole-sample {
  min-width: 0;
  overflow-wrap: anywhere;
}
@media (max-width: 960px) {
  .ds-trole-row {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 24px;
  }
}

/* ── Type-role samples. Each .t-trole-* class mirrors a peoples-design
 *    `.t-*` class but uses var(--font-display/body/mono/script) tokens so the
 *    actual typeface comes from brand DNA. Decoration (shadow, color, frame,
 *    rotation, pill, ribbon, dots, button, etc.) is peoples-native and stays
 *    declared with hard-coded peoples colors (var(--orange), var(--red), etc.). */
.t-trole-display {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(96px, 13vw, 200px);
  line-height: 0.86;
  letter-spacing: 0.005em;
  text-transform: uppercase;
  color: var(--orange);
  text-shadow:
    8px 8px 0 var(--red),
    16px 16px 0 var(--red-deep);
}
.t-trole-mega-stamp {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(140px, 18vw, 260px);
  line-height: 0.82;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: var(--blue);
  text-shadow:
    10px 10px 0 var(--red),
    20px 20px 0 var(--red-deep);
}
.t-trole-stat-numeral {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(140px, 18vw, 260px);
  line-height: 0.82;
  letter-spacing: -0.015em;
  color: var(--orange);
  text-shadow:
    8px 8px 0 var(--red),
    16px 16px 0 var(--red-deep);
}
.t-trole-stat-numeral sup {
  font-size: 0.36em;
  color: var(--blue);
  text-shadow: 5px 5px 0 var(--red);
  vertical-align: top;
  line-height: 1;
}
.t-trole-script-line {
  font-family: var(--font-script);
  font-weight: 400;
  font-size: clamp(80px, 9vw, 140px);
  line-height: 0.95;
  color: var(--red);
  transform: rotate(-3deg);
  display: inline-block;
}
.t-trole-framed-headline {
  display: inline-block;
  padding: 24px 32px;
  border: 5px solid var(--cream);
  background: var(--blue);
  color: var(--orange);
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(60px, 7vw, 108px);
  line-height: 0.92;
  letter-spacing: 0.005em;
  text-transform: uppercase;
  text-shadow: 5px 5px 0 var(--red);
}
.t-trole-stamp-statement {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(72px, 8vw, 128px);
  line-height: 0.95;
  letter-spacing: 0.005em;
  text-transform: uppercase;
  color: var(--blue);
  text-shadow: 5px 5px 0 var(--red);
}
.t-trole-stamp-statement em {
  font-style: normal;
  color: var(--orange);
  text-shadow: 5px 5px 0 var(--red);
}
.t-trole-script-inline {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(40px, 4vw, 64px);
  line-height: 1;
  letter-spacing: 0.005em;
  text-transform: uppercase;
  color: var(--blue);
}
.t-trole-script-inline em {
  font-style: normal;
  font-family: var(--font-script);
  text-transform: lowercase;
  color: var(--red);
  font-size: 1.05em;
  transform: rotate(-3deg);
  display: inline-block;
  margin: 0 0.12em;
}
.t-trole-lead {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: clamp(28px, 2.4vw, 40px);
  line-height: 1.4;
  color: var(--ink);
  max-width: 44ch;
  margin: 0;
}
.t-trole-body {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 27px;
  line-height: 1.55;
  color: var(--ink);
  max-width: 60ch;
  margin: 0;
}
.t-trole-pill-row {
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
}
.t-trole-pill {
  display: inline-block;
  padding: 8px 18px;
  border: 3px solid var(--cream);
  background: var(--blue);
  color: var(--cream);
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: 16px;
  line-height: 1;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  border-radius: 999px;
}
.t-trole-pill.t-trole-pill-dark {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--orange);
}
.t-trole-pill.t-trole-pill-paper {
  background: var(--paper);
  border-color: var(--ink);
  color: var(--ink);
}
.t-trole-mono-chrome {
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: 16px;
  line-height: 1.5;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-diamond-row {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.t-trole-diamond-row span {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 22px;
  line-height: 1.4;
  color: var(--ink);
  padding-left: 36px;
  position: relative;
}
.t-trole-diamond-row span::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.4em;
  width: 18px;
  height: 18px;
  background: var(--red);
  transform: rotate(45deg);
}
.t-trole-star-ribbon {
  display: flex;
  align-items: center;
  gap: 36px;
  padding: 14px 24px;
  background: var(--orange);
  border-top: 5px solid var(--ink);
  border-bottom: 5px solid var(--ink);
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: 18px;
  line-height: 1;
  letter-spacing: 0.22em;
  color: var(--blue);
  text-transform: uppercase;
}
.t-trole-rotated-stamp {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: var(--cream);
  color: var(--blue);
  border: 6px solid var(--orange);
  transform: rotate(-9deg);
  box-shadow: 8px 8px 0 var(--red);
  font-family: var(--font-display);
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
  text-align: center;
  gap: 8px;
}
.t-trole-rotated-stamp .big {
  font-size: 44px;
  line-height: 0.9;
}
.t-trole-rotated-stamp .small {
  font-size: 13px;
  letter-spacing: 0.18em;
  font-family: var(--font-mono);
}
.t-trole-track-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.t-trole-track-row .dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--orange);
  border: 5px solid var(--ink);
  box-shadow: 4px 4px 0 var(--red);
  flex-shrink: 0;
}
.t-trole-track-row .dot.alt {
  background: var(--blue);
}
.t-trole-track-row .bar {
  flex: 0 1 60px;
  height: 8px;
  background: var(--ink);
}
.t-trole-track-row .label {
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: 16px;
  line-height: 1;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-cta {
  display: inline-block;
  padding: 18px 32px;
  background: var(--orange);
  color: var(--blue);
  border: 5px solid var(--cream);
  box-shadow: 8px 8px 0 var(--red);
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 32px;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.t-trole-end-mark {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(80px, 9vw, 140px);
  line-height: 0.9;
  letter-spacing: 0.005em;
  text-transform: uppercase;
  color: var(--orange);
  text-shadow:
    6px 6px 0 var(--red),
    12px 12px 0 var(--red-deep);
}
```
