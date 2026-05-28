```preset-meta
{
  "name": "8-bit-orbit",
  "label": "8-Bit Orbit",
  "fingerprint": {
    "shadow": "stacked-pixel-offset",
    "border": "none",
    "motion": "pixel-snap-twinkle",
    "density": "atmospherically-loaded",
    "contrast": "dark-neon",
    "palette-mode": "closed"
  },
  "match_signals": [
    { "kind": "high_sat_accent",   "weight": 0.40 },
    { "kind": "shadow_zero_blur",  "weight": 0.25 },
    { "kind": "condensed_display", "weight": 0.10 }
  ],
  "best_for": ["gaming", "cyberpunk", "web3", "indie tools", "high-saturation brands", "retro tech", "arcade"],
  "avoid_for": ["light-canvas brands", "minimalist pastel", "low-saturation editorial"],
  "chromeFonts": {
    "googleFontsHref": "https://fonts.googleapis.com/css2?family=Tektur:wght@400;500;600;700;800;900&family=Chakra+Petch:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap",
    "display": "Tektur",
    "body": "Chakra Petch",
    "script": "Tektur",
    "mono": "Space Mono"
  }
}
```

> `chromeFonts` makes the design.html doc chrome (title-card, section heads, h2/h3, lede paragraphs, eyebrows) render in the preset's NATIVE typography — Tektur + Chakra Petch + Space Mono — instead of brand DNA. 8-Bit Orbit is a three-face system with no script slot; `script` points back at Tektur because the preset refuses a fourth face. §M motifs grid uses `.preset-native-scope` so var(--font-\*) re-resolves to these native families.

## §A Director's intent

CRT cabinet meets editorial discipline. Tektur display sits on a strict 4px grid; Chakra Petch body reads at HUD distance; Space Mono labels feel like console readouts.

Depth is **stacked hard offset shadows** in 4px increments — never blur. Hero text gets a two-layer shadow (brand-secondary at +4/+4, navy at +8/+8). Buttons get a six-piece stack (three navy steps + three brand-color halo steps).

**Brand DNA drives color, preset drives structure.** Three site colors (`--brand-primary` / `--brand-secondary` / `--brand-accent`) ignite headlines, stat numerals, accent rules, and label fills. They **never** appear as body text. The dark base (`--canvas-void` / `--canvas-navy`) is mandatory — scanline and CRT vignette overlays are invisible without a blackpoint.

**Color role contract**: one scene = one dominant brand color carrying the hero / chip / button fill; the other two brand colors appear only as shadow halos, stat numerals, or particle accents. Body / supporting text uses white (`var(--ink)` if light on dark, otherwise neutral 0.85 opacity).

Motion is pixel-snap: hard arrivals, no glide. Ambient layers (starfield twinkle, pixel-particle float) live behind everything on dark surfaces. Scene transitions are hard cuts — crossfade kills the arcade.

**Best for** sites with high-saturation palettes (gaming, cyberpunk, web3, indie tools). Pastel or muted brand DNA still renders, but the "arcade neon" effect softens.

**Atmosphere is non-negotiable.** Every scene gets scanlines + grain (+ CRT vignette on dark surfaces). A clean surface reads as broken.

## §B Decoration tokens (merge into design.html `:root`)

8-Bit Orbit declares **structural** tokens here (pixel unit, shadow stacks, atmosphere overlays). Color is sourced from site brand DNA — `--brand-primary` / `--brand-secondary` / `--brand-accent` flow through component CSS naturally.

The dark base (`--canvas-void` / `--canvas-navy`) is the **one exception**: scanline and CRT vignette overlays are physically invisible without a blackpoint, so the dark base is a technical requirement, not a palette choice. Same pattern as liquid-glass's `--liquid-bg-deep`.

```css
/* Mandatory dark base — scanline + CRT vignette overlays need blackpoint */
--canvas-void: #0a0e27; /* darkest, hero scenes */
--canvas-navy: #0f1b3d; /* darker, most scenes */

/* Pixel unit — all offsets, gaps, paddings are multiples of this */
--pixel-unit: 4px;
--gap-pixel-sm: 16px;
--gap-pixel-md: 24px;
--gap-pixel-lg: 32px;

/* Signature stacked-offset shadows — color comes from site brand DNA.
   *-primary stacks the secondary brand color as halo; *-secondary stacks accent. */
--shadow-pixel-stack-primary:
  4px 0 0 0 var(--canvas-navy), 0 4px 0 0 var(--canvas-navy), 4px 4px 0 0 var(--canvas-navy),
  8px 4px 0 0 var(--brand-secondary), 4px 8px 0 0 var(--brand-secondary),
  8px 8px 0 0 var(--brand-secondary);
--shadow-pixel-stack-secondary:
  4px 0 0 0 var(--canvas-navy), 0 4px 0 0 var(--canvas-navy), 4px 4px 0 0 var(--canvas-navy),
  8px 4px 0 0 var(--brand-accent), 4px 8px 0 0 var(--brand-accent), 8px 8px 0 0 var(--brand-accent);
--shadow-pixel-l:
  4px 0 0 0 var(--canvas-navy), 0 4px 0 0 var(--canvas-navy), 4px 4px 0 0 var(--canvas-navy);
--shadow-pixel-text: 4px 4px 0 var(--brand-secondary), 8px 8px 0 var(--canvas-navy);
--shadow-card-featured: 8px 8px 0 var(--brand-secondary);

/* Atmosphere overlays — scanlines + grain + vignette are the always-on trio.
   §H mandates all three on every scene; without the trio a surface reads as broken. */
--scanline-overlay: repeating-linear-gradient(
  0deg,
  transparent 0px,
  transparent 2px,
  rgba(10, 14, 39, 0.04) 2px,
  rgba(10, 14, 39, 0.04) 4px
);
--crt-vignette: radial-gradient(ellipse at center, transparent 50%, rgba(10, 14, 39, 0.25) 100%);
/* SVG fractal-noise grain — inlined data URI so no external asset needed.
   Apply via ::before or ::after at opacity ~0.035, z-index 49-51, pointer-events: none. */
--grain-overlay: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>");
--grain-opacity: 0.035;

/* Grid wallpaper — primary brand color etched at low opacity onto dark base */
--bg-grid-size: 40px 40px;
```

## §D Font pairing fallback (if brand fonts not on Google Fonts)

8-Bit Orbit forces its display / body / mono regardless of site DNA — the pixel-grid logic depends on Tektur's geometry. Fallbacks below are only used if the primary face fails to load.

- **display**: `'Tektur'` · `'Press Start 2P'` · `'VT323'` wght 700
- **body**: `'Chakra Petch'` · `'Rajdhani'` · `'IBM Plex Sans'` wght 400
- **mono**: `'Space Mono'` · `'JetBrains Mono'` · `'IBM Plex Mono'` wght 400

## §T Type-role atlas (Phase 4b reads this to size text correctly)

```type-roles
[
  {
    "id": "pixel-hero",
    "family": "display",
    "purpose": "cover hero / CTA title — Tektur 900 with the two-layer pixel text-shadow",
    "px_min": 96, "px_max": 128, "weight": 900, "leading": "1.05", "tracking": "0.04em", "case": "upper",
    "sample_html": "<div class=\"t-trole-pixel-hero\">Boot Up</div>"
  },
  {
    "id": "display",
    "family": "display",
    "purpose": "large section opener (one tier below pixel-hero)",
    "px_min": 48, "px_max": 64, "weight": 700, "leading": "1.15", "tracking": "0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-display\">Section Open</div>"
  },
  {
    "id": "headline",
    "family": "display",
    "purpose": "primary slide headline (section workhorse)",
    "px_min": 32, "px_max": 45, "weight": 700, "leading": "1.15", "tracking": "0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-headline\">Primary headline</div>"
  },
  {
    "id": "subhead",
    "family": "display",
    "purpose": "region subheading / card title",
    "px_min": 18, "px_max": 24, "weight": 700, "leading": "1.15", "tracking": "0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-subhead\">Card title</div>"
  },
  {
    "id": "stat-number",
    "family": "display",
    "purpose": "stat tile numeral — Tektur 900 with the 3px navy text-shadow",
    "px_min": 40, "px_max": 56, "weight": 900, "leading": "1", "tracking": "0", "case": "upper",
    "sample_html": "<div class=\"t-trole-stat-number\">4M</div>"
  },
  {
    "id": "hero-tagline",
    "family": "body",
    "purpose": "lede paragraph below a pixel-hero",
    "px_min": 16, "px_max": 19, "weight": 400, "leading": "1.8", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-hero-tagline\">The lede sits in Chakra Petch under the pixel-hero. One sentence, breathing room.</p>"
  },
  {
    "id": "body",
    "family": "body",
    "purpose": "default paragraph body",
    "px_min": 15, "px_max": 18, "weight": 400, "leading": "1.7", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body\">Body sits in Chakra Petch at weight 400. Line-height stays at 1.7 minimum — the face is dense and tighter leading bleeds into unreadable.</p>"
  },
  {
    "id": "quote-body",
    "family": "body",
    "purpose": "quote text — Chakra Petch weight 500",
    "px_min": 20, "px_max": 26, "weight": 500, "leading": "1.8", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-quote-body\">The quote runs in Chakra Petch medium, separated below by the yellow quote-line rule.</p>"
  },
  {
    "id": "label-pill",
    "family": "mono",
    "purpose": "text inside the navy label pill — universal section eyebrow",
    "px_min": 12, "px_max": 12, "weight": 700, "leading": "1", "tracking": "0.2em", "case": "upper",
    "sample_html": "<div class=\"t-trole-label-pill\">Section · 01</div>"
  },
  {
    "id": "label-eyebrow",
    "family": "mono",
    "purpose": "standalone uppercase eyebrow (heavier tracking than the pill)",
    "px_min": 13, "px_max": 14, "weight": 400, "leading": "1", "tracking": "0.3em", "case": "upper",
    "sample_html": "<div class=\"t-trole-label-eyebrow\">System readout</div>"
  },
  {
    "id": "badge",
    "family": "mono",
    "purpose": "outline-only hero badge text",
    "px_min": 11, "px_max": 12, "weight": 400, "leading": "1", "tracking": "0.1em", "case": "upper",
    "sample_html": "<div class=\"t-trole-badge\">Real-time</div>"
  },
  {
    "id": "chart-value",
    "family": "mono",
    "purpose": "chart bar value numerals",
    "px_min": 12, "px_max": 12, "weight": 700, "leading": "1", "tracking": "0.05em", "case": "upper",
    "sample_html": "<div class=\"t-trole-chart-value\">99.9%</div>"
  },
  {
    "id": "chart-label",
    "family": "mono",
    "purpose": "chart axis / category labels",
    "px_min": 11, "px_max": 12, "weight": 400, "leading": "1", "tracking": "0.05em", "case": "upper",
    "sample_html": "<div class=\"t-trole-chart-label\">Throughput</div>"
  },
  {
    "id": "date-chip",
    "family": "mono",
    "purpose": "date marker on timeline events — navy pill with neon text",
    "px_min": 11, "px_max": 12, "weight": 400, "leading": "1", "tracking": "0.1em", "case": "upper",
    "sample_html": "<div class=\"t-trole-date-chip\">2026 · 03</div>"
  },
  {
    "id": "counter",
    "family": "mono",
    "purpose": "persistent slide counter (NN / NN)",
    "px_min": 12, "px_max": 14, "weight": 400, "leading": "1", "tracking": "0.15em", "case": "upper",
    "sample_html": "<div class=\"t-trole-counter\">01 / 10</div>"
  }
]
```

## §E Motion (GSAP consts — REPLACES site ease)

```js
const EASE = {
  entry: "back.out(1.4)", // pixel snap with slight overshoot — arcade feel
  emphasis: "steps(4)", // staircase, NOT smooth — matches 4px pixel grid
  exit: "power2.in", // accelerate off-grid
  drift: "sine.inOut", // twinkle / float ambient only
};
const DUR = {
  snap: 0.12,
  med: 0.4,
  slow: 0.8,
};
// RULE: emphasis="steps(4)" is the signature — use it on hero number reveals,
//       chip counts, and stat-block tweens. NEVER tween position with steps()
//       (snap the value, not the position) — apply steps() to opacity / scale / numeric counters.
// RULE: never tween sub-pixel positions. All x/y values must round to multiples of 4
//       in onUpdate. Sub-pixel motion looks broken at pixel-grid scale.
// RULE: scene transitions are hard cuts. Do not animate scene-out — let it snap.
```

### §E.5 Motion choreography

**Allowed primitives**

- Hard cut between scenes (no crossfade, no slide).
- Snap-pop entry on hero text (back.out 1.4) — short overshoot, no glide.
- Stepped emphasis on numerics (counter, stat reveal, bar fill via steps(4)).
- Ambient: starfield twinkle (3s sine), pixel-particle float (8s sine), CRT scanline drift (optional, very slow).
- Pixel-button click feedback: translate(2px, 2px) + shadow halve (this is a hover state in template.html; for video, apply on emphasis beat).

**Forbidden**

- Crossfade, dissolve, blur transitions.
- Smooth eases on numerics (use steps).
- Sub-pixel positions, sub-4px gaps, sub-4px shadow offsets.
- Any rotation other than 0deg / 90deg / 180deg / 270deg (rotation breaks pixel grid).
- Glow / bloom filters. Pixels don't glow — neighbors don't bleed.
- Particle systems with > 30 particles (CRT can't handle that many bright spots).

**Stagger budget**

80-120ms between elements. Faster than editorial (200-280ms), slower than chaos. Total scene-in stagger ≤ 500ms.

## §G Voice transform recipe (apply to brand's voice from §1 DNA)

Take the brand's product description / value prop. Transform with:

1. Strip filler ("really", "very", "just"), keep imperative verbs
2. Hero headlines: 2-4 words MAX, UPPERCASE
3. Label / chip / badge text: UPPERCASE with 0.2em+ tracking (Space Mono treatment)
4. Body copy: sentence case, terse — pretend you're typing on a CRT at 2am
5. Stats: bare numeric + UPPERCASE unit (e.g. `4M` / `99.9% UPTIME`), not full sentences
6. End hero blocks with a single brand-primary **call-to-action verb** in pixel-button form (`PRESS START`, `BOOT UP`, `CONNECT`, `LOAD`)

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: hero=`SHIP. TOGETHER.` / chip=`REAL-TIME` / cta=`PRESS START`

## §H Scene composition hints (Phase 4b layout guidance)

**Surface alternation across scenes**

- Dark scene: `bg-grid` (canvas-void base + brand-primary grid lines @ 7% opacity) + `var(--scanline-overlay)` + `var(--grain-overlay)` at `--grain-opacity` + `var(--crt-vignette)` + starfield.
- Light scene: any brand color as ground + low-opacity navy grid lines + `var(--scanline-overlay)` + `var(--grain-overlay)` at `--grain-opacity` (NO CRT vignette — light surfaces don't have CRT bulge).
- Atmosphere trio (scanlines + grain + vignette on dark / scanlines + grain on light) is **non-negotiable** — a surface without it reads as generic web.
- Alternate dark → light → dark → light across the video. Two consecutive dark scenes = broken pacing.

**Hero text**

- One big pixel-text-shadow moment per scene. Two layers (brand-secondary at +4/+4, canvas-navy at +8/+8). Hero text color is brand-primary on dark surfaces, canvas-navy on light surfaces.
- Hero takes ≥ 50% canvas width on dark scenes, ≥ 40% on light scenes (light surfaces breathe more).
- Never two hero-tier elements per scene.

**Brand color placement (role contract)**

- Brand colors never appear as body text. Only headlines, stat numerals, label fills (chip text), and accent rules.
- One scene = **one dominant brand color** carrying the hero or focal element. The other two brand colors appear only as halos (in shadow stacks), small accents (particle, corner-pin, secondary chip), or stat numerals.
- Suggested role mapping: brand-primary → hero / main CTA; brand-secondary → shadow halos / divider rules / focal stat numeral; brand-accent → secondary buttons / chip accents / particle color.
- This is a suggestion — narrative beat may flip primary/secondary roles, but never dilute by using all three at equal weight in one scene.

**Pixel unit is sacred**

- ALL spacing, shadow offsets, gaps, paddings must be multiples of 4px.
- ALL transforms must snap to 4px grid in onUpdate (no sub-pixel motion).
- Border widths: 2px or 4px only. No 1px hairlines (breaks the pixel logic).

**Transitions between scenes**

- Hard cut. Pair with a glitch frame or single scanline flash if you need a beat between scenes.
- NEVER crossfade, slide, blur, or zoom-between-scenes.

**Ambient motion**

- Starfield twinkle: dark surfaces only. ~12-20 stars, 4-6px squares, random positions, 3s twinkle keyframe.
- Pixel-particle float: dark surfaces only on hero / cta beats. ~6-10 particles, 8px squares, 8s float keyframe.
- Light surfaces stay still — they're "boot screens" or "menu screens", not "in-game".

## §M Atomic motifs (gestures the plan agent can reference)

```motifs
[
  {
    "id": "pixel-text-shadow",
    "label": "Pixel text-shadow",
    "role": "display-depth",
    "surface_safe": ["dark", "light"],
    "description": "Two-layer hard offset text-shadow on Tektur display type — brand-secondary at +4/+4, navy at +8/+8. Zero blur. The signature pixel-bevel cascade behind every hero. Without it Tektur reads flat.",
    "wide": true,
    "demo": "<div class=\"sd-motif-text-shadow\">Boot Up</div>",
    "css": ".sd-motif-text-shadow{font-family:var(--f-disp-native);font-weight:900;font-size:clamp(56px,7vw,120px);line-height:1.05;letter-spacing:.04em;text-transform:uppercase;color:var(--brand-primary);text-shadow:4px 4px 0 var(--brand-secondary),8px 8px 0 var(--canvas-navy);text-align:center}"
  },
  {
    "id": "pixel-button-stack",
    "label": "Pixel button stack",
    "role": "cta-elevation",
    "surface_safe": ["dark", "light"],
    "description": "Six-step stacked hard offset shadow on a brand-primary button — three navy steps at 4px, then three brand-secondary halo steps at 8px. The system's most recognizable CTA depth.",
    "demo": "<button class=\"sd-motif-button\">Press start</button>",
    "css": ".sd-motif-button{display:inline-block;background:var(--brand-primary);color:var(--canvas-navy);border:0;border-radius:0;padding:16px 36px;font-family:var(--f-disp-native);font-weight:700;font-size:clamp(14px,1.2vw,18px);line-height:1;letter-spacing:.08em;text-transform:uppercase;box-shadow:4px 0 0 0 var(--canvas-navy),0 4px 0 0 var(--canvas-navy),4px 4px 0 0 var(--canvas-navy),8px 4px 0 0 var(--brand-secondary),4px 8px 0 0 var(--brand-secondary),8px 8px 0 0 var(--brand-secondary);cursor:pointer}"
  },
  {
    "id": "label-pill",
    "label": "Label pill",
    "role": "section-eyebrow",
    "surface_safe": ["dark", "light"],
    "description": "Navy rectangle, brand-secondary Space Mono text at 12px / 0.2em / uppercase. The universal section tag — never substitute a plain h-tag. Border-radius zero.",
    "demo": "<span class=\"sd-motif-pill\">Section · 01</span>",
    "css": ".sd-motif-pill{display:inline-block;background:var(--canvas-navy);color:var(--brand-secondary);padding:6px 14px;font-family:var(--f-mono-native);font-weight:700;font-size:12px;line-height:1;letter-spacing:.2em;text-transform:uppercase;border-radius:0}"
  },
  {
    "id": "corner-bracket",
    "label": "Corner bracket",
    "role": "implied-frame",
    "surface_safe": ["dark", "light"],
    "description": "Two outward-facing L-shapes (top-left + bottom-right) bracketing a region. 24×24 with 4px stroke in brand-primary. Replaces rounded corners — the eye fills in the missing edges.",
    "demo": "<div class=\"sd-motif-bracket\"><span class=\"sd-motif-bracket-tl\"></span><span class=\"sd-motif-bracket-br\"></span><div class=\"sd-motif-bracket-inner\">Region</div></div>",
    "css": ".sd-motif-bracket{position:relative;display:inline-block;padding:24px 32px}.sd-motif-bracket-tl,.sd-motif-bracket-br{position:absolute;width:24px;height:24px;border:0 solid var(--brand-primary)}.sd-motif-bracket-tl{top:0;left:0;border-top-width:4px;border-left-width:4px}.sd-motif-bracket-br{bottom:0;right:0;border-bottom-width:4px;border-right-width:4px}.sd-motif-bracket-inner{font-family:var(--f-disp-native);font-weight:700;font-size:clamp(20px,2vw,28px);line-height:1.15;letter-spacing:.02em;text-transform:uppercase;color:var(--brand-primary)}"
  },
  {
    "id": "stat-block",
    "label": "Stat block",
    "role": "metric-tile",
    "surface_safe": ["dark"],
    "description": "Brand-primary-tinted glass tile (8% fill, 20% border) bracketed by corner-brackets at top-left + bottom-right. Holds a stat numeral over a Space Mono label. Dark surfaces only.",
    "surface": "dark",
    "demo": "<div class=\"sd-motif-stat\"><span class=\"sd-motif-stat-tl\"></span><span class=\"sd-motif-stat-br\"></span><div class=\"sd-motif-stat-value\">4M</div><div class=\"sd-motif-stat-label\">Teams shipping</div></div>",
    "css": ".sd-motif-stat{position:relative;background:color-mix(in srgb,var(--brand-primary) 8%,transparent);border:2px solid color-mix(in srgb,var(--brand-primary) 20%,transparent);padding:32px 16px;display:flex;flex-direction:column;gap:8px;align-items:center}.sd-motif-stat-tl,.sd-motif-stat-br{position:absolute;width:20px;height:20px;border:0 solid var(--brand-primary)}.sd-motif-stat-tl{top:-2px;left:-2px;border-top-width:4px;border-left-width:4px}.sd-motif-stat-br{bottom:-2px;right:-2px;border-bottom-width:4px;border-right-width:4px}.sd-motif-stat-value{font-family:var(--f-disp-native);font-weight:900;font-size:clamp(40px,4.5vw,64px);line-height:1;color:var(--brand-primary);text-shadow:3px 3px 0 var(--canvas-navy)}.sd-motif-stat-label{font-family:var(--f-mono-native);font-weight:400;font-size:11px;line-height:1;letter-spacing:.15em;text-transform:uppercase;color:var(--brand-accent)}"
  },
  {
    "id": "quote-line",
    "label": "Quote line",
    "role": "separator-rule",
    "surface_safe": ["dark", "light"],
    "description": "60×4 brand-secondary rectangle with a 4×4 navy offset shadow. Used as a short separator beneath quote bodies — pixel-grid analogue of an editorial em-rule.",
    "demo": "<div class=\"sd-motif-quote-line\"></div>",
    "css": ".sd-motif-quote-line{width:60px;height:4px;background:var(--brand-secondary);box-shadow:4px 4px 0 var(--canvas-navy)}"
  },
  {
    "id": "atmosphere-overlay",
    "label": "Atmosphere overlay",
    "role": "scene-texture",
    "surface_safe": ["dark", "light"],
    "description": "Always-on trio — scanlines (multiply 4% navy at z-50), grain (SVG fractal-noise at opacity 0.035 z-49), CRT vignette (radial navy at z-51, dark surfaces only). Non-negotiable on every scene.",
    "wide": true,
    "surface": "dark",
    "demo": "<div class=\"sd-motif-atmos\"><div class=\"sd-motif-atmos-inner\">CRT surface</div></div>",
    "css": ".sd-motif-atmos{position:relative;width:100%;height:160px;background:var(--canvas-void);background-image:linear-gradient(color-mix(in srgb,var(--brand-primary) 7%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--brand-primary) 7%,transparent) 1px,transparent 1px);background-size:40px 40px;overflow:hidden;border:2px solid color-mix(in srgb,var(--brand-primary) 20%,transparent)}.sd-motif-atmos::before{content:\"\";position:absolute;inset:0;background:var(--grain-overlay);opacity:.035;pointer-events:none;z-index:1}.sd-motif-atmos::after{content:\"\";position:absolute;inset:0;background:var(--scanline-overlay),var(--crt-vignette);pointer-events:none;mix-blend-mode:multiply;z-index:2}.sd-motif-atmos-inner{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--f-mono-native);font-weight:700;font-size:14px;line-height:1;letter-spacing:.2em;text-transform:uppercase;color:var(--brand-primary);z-index:3}"
  }
]
```

The `motifs` JSON block above is the SOLE source of truth. build-design.mjs reads it to render §M cards in design.html. The Phase 3 plan agent and Phase 4b scene worker may cite motifs by `id` when annotating which gesture a scene relies on.

**Materials lexicon** (informational — these are the composition atoms behind the patterns):

- pixel-text-shadow · pixel-button-stack · label-pill · corner-bracket · stat-block · quote-line · atmosphere-overlay · timeline-rail · starfield · pixel-particle

## §I Page-level CSS (overrides design.html's neutral chrome — makes the doc itself read as 8-bit-orbit)

```css
/* ── Preset-native typography vars (loaded via preset-meta.chromeFonts.googleFontsHref).
 * These let the doc chrome render in Tektur + Chakra Petch + Space Mono regardless
 * of brand DNA. The §6 component preview and §M motifs grid also read these via
 * .preset-native-scope.
 *
 * 8-Bit Orbit has no script face — the script slot points at Tektur because
 * the preset refuses a fourth face. Fallback chains end in retro display /
 * humanist sans / monospace that still carry the arcade register. */
:root {
  --f-disp-native:
    "Tektur", "Press Start 2P", "VT323", "Archivo", "Arial Black", "Helvetica Neue", sans-serif;
  --f-body-native:
    "Chakra Petch", "Rajdhani", "IBM Plex Sans", -apple-system, BlinkMacSystemFont, system-ui,
    sans-serif;
  --f-script-native: "Tektur", "Press Start 2P", "VT323", "Archivo", "Arial Black", sans-serif;
  --f-mono-native:
    "Space Mono", "JetBrains Mono", "IBM Plex Mono", "Menlo", ui-monospace, monospace;
}

/* .preset-native-scope: re-bind brand DNA font tokens to preset-native families.
 * Wraps §6 component previews and §M motif demos so var(--font-*) resolves to
 * Tektur / Chakra Petch / Space Mono regardless of brand DNA. Paste-ready
 * component source is untouched — Phase 4b still grep + paste the original
 * `var(--font-display)` tokens, which resolve to brand DNA at scene-render time. */
.preset-native-scope {
  --font-display: var(--f-disp-native);
  --font-body: var(--f-body-native);
  --font-script: var(--f-script-native);
  --font-mono: var(--f-mono-native);
}

body {
  background: var(--canvas-void);
  color: #d0e6ff; /* light HUD text on dark void — default --ink is #000 which is invisible on dark base */
  position: relative;
}
.ds-prose,
.dna-label,
.dna-hex,
.type-role,
.type-name,
.type-note,
.type-specimen,
.voice-tag,
.voice-in,
.voice-out,
.voice-cta,
.voice-sample,
.voice-dl dt,
.voice-dl dd,
.comp-name,
.comp-marker,
.ds-summary,
.dna-gradient-label,
.dna-gradient-code,
.title-meta,
.title-meta strong,
p,
code {
  color: #d0e6ff;
}
.comp-preview {
  background: var(--canvas-navy) !important;
  color: #d0e6ff;
  /* CRITICAL: components like bg-grid, starfield, pixel-particles, crt-overlay
     use `position: absolute; inset: 0` which need a positioned ancestor to
     anchor against. Without `position: relative` here, they escape to <body>
     (made positioned by §I) and cover the entire design.html. */
  position: relative;
  overflow: hidden;
  min-height: 200px;
}
body::before {
  /* Scanlines on design.html itself */
  content: "";
  position: fixed;
  inset: 0;
  background: var(--scanline-overlay);
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: multiply;
}
body::after {
  /* CRT vignette on design.html itself */
  content: "";
  position: fixed;
  inset: 0;
  background: var(--crt-vignette);
  pointer-events: none;
  z-index: 9998;
}
.title-card {
  background: var(--canvas-void);
  border-bottom: 4px solid var(--brand-primary);
  padding: 96px 0 80px;
}
.title-display {
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--brand-primary);
  text-shadow: var(--shadow-pixel-text);
}
.brand-name {
  color: var(--brand-secondary);
  font-weight: 800;
}
.style-name {
  color: var(--brand-accent);
  font-weight: 800;
}
.ds-section {
  border-top: 4px solid var(--canvas-navy);
  padding: 80px 0;
}
h2 {
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--brand-primary);
}
.eyebrow {
  color: var(--brand-secondary);
  font-weight: 700;
}
.dna-swatch,
.type-card,
.voice-pair,
.comp-card {
  border: 4px solid var(--canvas-navy) !important;
  border-radius: 0 !important;
  box-shadow: 8px 8px 0 var(--brand-secondary) !important;
}
.comp-head {
  background: var(--canvas-navy) !important;
  color: var(--brand-primary) !important;
  border-bottom: 4px solid var(--canvas-navy) !important;
}
.ds-code {
  background: var(--canvas-void) !important;
  border: 4px solid var(--brand-primary);
  border-radius: 0 !important;
  color: var(--brand-primary) !important;
}

/* ── §M Motifs grid: atomic gestures.
 * 12-col grid of cards each teaching ONE reusable gesture. Cards may declare a
 * surface (dark / light) to demonstrate the gesture against its native bg. */
.ds-motif-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}
.ds-motif {
  grid-column: span 4;
  min-height: 280px;
  padding: 28px;
  border: 4px solid var(--canvas-navy);
  border-radius: 0;
  background: var(--canvas-navy);
  color: #d0e6ff;
  box-shadow: 8px 8px 0 var(--brand-secondary);
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
.ds-motif.ds-motif-surface-dark {
  background: var(--canvas-void);
  color: #d0e6ff;
  border-color: var(--canvas-navy);
}
.ds-motif.ds-motif-surface-light {
  background: var(--brand-primary);
  color: var(--canvas-navy);
  border-color: var(--canvas-navy);
  box-shadow: 8px 8px 0 var(--canvas-navy);
}
.ds-motif-h {
  margin: 0;
  font-family: var(--f-disp-native);
  font-weight: 800;
  font-size: clamp(22px, 2.2vw, 32px);
  line-height: 1.15;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.ds-motif.ds-motif-surface-light .ds-motif-h {
  color: var(--canvas-navy);
}
.ds-motif-desc {
  margin: 0;
  font-family: var(--f-body-native);
  font-weight: 400;
  font-size: 14px;
  line-height: 1.6;
  color: color-mix(in srgb, #d0e6ff 78%, transparent);
  max-width: 32ch;
}
.ds-motif.ds-motif-surface-light .ds-motif-desc {
  color: color-mix(in srgb, var(--canvas-navy) 78%, transparent);
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
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--brand-secondary);
  opacity: 0.7;
}
.ds-motif.ds-motif-surface-light .ds-motif-id {
  color: var(--canvas-navy);
  opacity: 0.6;
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

/* ── §T Type-role atlas. Container = navy card with brand-primary heavy border.
 * Each .t-trole-* class encodes the role's family / size / weight / leading /
 * tracking / case. Family selectors use var(--font-*) tokens so the atlas
 * renders in BRAND DNA fonts; only the recipe is preset-declared. */
.ds-trole-box {
  display: flex;
  flex-direction: column;
  border: 4px solid var(--canvas-navy);
  border-radius: 0;
  background: var(--canvas-navy);
  overflow: hidden;
  margin-top: 24px;
  box-shadow: 8px 8px 0 var(--brand-secondary);
}
.ds-trole-row {
  padding: 28px 32px;
  border-bottom: 2px solid color-mix(in srgb, var(--brand-primary) 18%, transparent);
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
 * Color and decoration follow 8-Bit Orbit's neon-on-navy register —
 * brand-primary headlines, navy text-shadow on stat numerals, mono tracking
 * on every label. */
.t-trole-pixel-hero {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(64px, 10vw, 128px);
  line-height: 1.05;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--brand-primary);
  text-shadow:
    4px 4px 0 var(--brand-secondary),
    8px 8px 0 var(--canvas-navy);
}
.t-trole-display {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(40px, 5vw, 64px);
  line-height: 1.15;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-headline {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(28px, 3.5vw, 45px);
  line-height: 1.15;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-subhead {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(17px, 2vw, 24px);
  line-height: 1.15;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-stat-number {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(40px, 4vw, 56px);
  line-height: 1;
  color: var(--brand-primary);
  text-shadow: 3px 3px 0 var(--canvas-navy);
}
.t-trole-hero-tagline {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(14px, 1.5vw, 19px);
  line-height: 1.8;
  color: color-mix(in srgb, #d0e6ff 85%, transparent);
  max-width: 44ch;
  margin: 0;
}
.t-trole-body {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(14px, 1.2vw, 18px);
  line-height: 1.7;
  color: color-mix(in srgb, #d0e6ff 85%, transparent);
  max-width: 60ch;
  margin: 0;
}
.t-trole-quote-body {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: clamp(18px, 2.2vw, 26px);
  line-height: 1.8;
  color: #d0e6ff;
  max-width: 40ch;
  margin: 0;
}
.t-trole-label-pill {
  display: inline-block;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 12px;
  line-height: 1;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--brand-secondary);
  background: var(--canvas-navy);
  padding: 6px 14px;
  border: 2px solid color-mix(in srgb, var(--brand-primary) 25%, transparent);
}
.t-trole-label-eyebrow {
  font-family: var(--font-mono);
  font-weight: 400;
  font-size: clamp(13px, 1vw, 14px);
  line-height: 1;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--brand-secondary);
}
.t-trole-badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-weight: 400;
  font-size: clamp(11px, 0.9vw, 12px);
  line-height: 1;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brand-secondary);
  border: 2px solid var(--brand-secondary);
  padding: 8px 16px;
}
.t-trole-chart-value {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 12px;
  line-height: 1;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-chart-label {
  font-family: var(--font-mono);
  font-weight: 400;
  font-size: clamp(11px, 0.9vw, 12px);
  line-height: 1;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: color-mix(in srgb, #d0e6ff 70%, transparent);
}
.t-trole-date-chip {
  display: inline-block;
  font-family: var(--font-mono);
  font-weight: 400;
  font-size: clamp(11px, 0.9vw, 12px);
  line-height: 1;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brand-primary);
  background: var(--canvas-navy);
  padding: 2px 10px;
}
.t-trole-counter {
  font-family: var(--font-mono);
  font-weight: 400;
  font-size: clamp(12px, 1vw, 14px);
  line-height: 1;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: color-mix(in srgb, #d0e6ff 70%, transparent);
}
```
