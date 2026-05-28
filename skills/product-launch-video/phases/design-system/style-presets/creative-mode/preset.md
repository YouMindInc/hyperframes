```preset-meta
{
  "name": "creative-mode",
  "label": "Creative Mode",
  "fingerprint": {
    "canvas": "warm-cream-paper",
    "borders": "thick-ink-square",
    "shadow": "hard-offset-color-then-ink",
    "type": "archivo-black-uppercase-tight",
    "voice": "editorial-zine"
  },
  "match_signals": [
    { "kind": "shadow_zero_blur", "weight": 0.32 },
    { "kind": "thick_solid_border", "weight": 0.28 },
    { "kind": "condensed_display", "weight": 0.20 },
    { "kind": "high_sat_accent", "weight": 0.15 }
  ],
  "best_for": ["creative agency sites", "design studios", "brand-led launches", "editorial-confident product stories"],
  "avoid_for": ["institutional restraint", "quiet authority", "formal corporate", "regulated industries"],
  "chromeFonts": {
    "googleFontsHref": "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
    "display": "Archivo Black",
    "body": "Space Grotesk",
    "script": "Archivo Black",
    "mono": "JetBrains Mono"
  }
}
```

> `chromeFonts` makes the design.html doc chrome (title-card, section heads, h2/h3, lede paragraphs, eyebrows) render in the preset's NATIVE typography — Archivo Black + Space Grotesk + JetBrains Mono — instead of the brand DNA fonts. Creative Mode is a three-face system; the `script` slot points at Archivo Black because the preset refuses a script face (the editorial-zine register has no hand-script voice). The brand fonts still apply to §6 component code (paste-ready for Phase 4b). §M motifs grid and §T type-role atlas use `.preset-native-scope` so var(--font-display/body/mono) re-resolves to these native families for the live preview.

## §A Director's intent

Creative Mode is a **neo-brutalist editorial poster system** on a warm cream canvas. Edges are square, borders are heavy 4px ink, depth comes from hard offset color shadows (no blur, ever), and the type is Archivo Black uppercase pushed to extreme sizes with tight 0.92 line-height. Three accents collide per scene — never blended, never gradiented — sitting on flat color-blocks that screen-print across each other. Voice is part Bauhaus grid, part punk zine, part Swiss editorial: short imperative fragments in caps, mono labels carrying the "technical artifact" register.

**Best for:** creative-agency / design-studio sites, brand-led launches, editorial-confident product stories. **Avoid for:** institutional restraint or quiet authority — the multi-accent palette reads expressive, not formal.

**Brand-aware color contract.** The four template accents (forest green, hot pink, burnt orange, sunshine yellow) are mapped to brand DNA: `--brand-primary` (hero accent / closing canvas), `--brand-secondary` (offset-shadow color on featured blocks), `--brand-accent` (third hit / stat block), `--ink` (borders + text), `--canvas` (cream base). No literal hex appears in component CSS — the cream/ink defaults come from site DNA when present. **Class prefix is `cm-`** (creative-mode initialism, 3 chars).

## §B Decoration tokens

```css
/* Borders — 4px structural, 3px internal sub-rules, 2px chip */
--border-structural: 4px solid var(--ink);
--border-internal: 3px solid var(--ink);
--border-chip: 2px solid var(--ink);
--border-dashed-rule: 3px dashed var(--ink);

/* Hard offset shadows — color first, ink halo second. Never blur. */
--shadow-hard-lg: 24px 24px 0 var(--brand-secondary), 24px 24px 0 4px var(--ink);
--shadow-hard-md: 18px 18px 0 var(--ink);
--shadow-hard-sm: 8px 8px 0 var(--ink);

/* Spacing — scene-scaled */
--gap-grid: 1.45vw; /* ~28px @ 1920w */
--gap-cell-pad: 1.65vw; /* ~32px @ 1920w */
--gap-content: 5vw; /* 96px content gutter */
--gap-chrome: 3.33vw; /* 64px chrome gutter */

/* Rotation — deliberate imperfection signals */
--tilt-badge: -4deg;
--tilt-stamp: -6deg;

/* Type rhythm */
--display-track: -0.01em;
--mono-track-tight: 0.06em;
--mono-track-mid: 0.1em;
--mono-track-loose: 0.14em;
--display-leading: 0.92;

/* Surfaces — cream-2 is one step darker cream for recessed tables.
   color-mix keeps it brand-portable. */
--surface-recess: color-mix(in srgb, var(--canvas) 88%, var(--ink) 6%);
```

## §D Font pairing fallback

- **display**: `'Archivo Black'` · `'Anton'` · `'Space Grotesk'` wght 800
- **body**: `'Space Grotesk'` · `'Inter'` · `'IBM Plex Sans'` wght 400
- **mono**: `'JetBrains Mono'` · `'Space Mono'` · `'IBM Plex Mono'` wght 500

## §T Type-role atlas (Phase 4b reads this to size text correctly)

Each entry is a **named type role** with concrete render parameters at 1920×1080 — family token, px range, weight, leading, tracking, case, and any color/decoration. Phase 4b scene workers may cite roles by `id` ("use a `step-num` here"); the brand DNA fonts plug in automatically via `var(--font-*)` tokens. This is the same atlas Creative Mode ships in its Typography section, ported as machine-readable JSON.

The atlas is the **sole authoring source** for non-component text. If a scene needs a `stat-num` numeral that isn't covered by §6 components, the worker reads role `stat-num` here and writes inline CSS from these values. Do NOT invent ad-hoc sizes — Creative Mode's identity collapses if Archivo Black drifts below 0.92 leading or loses uppercase lock.

```type-roles
[
  {
    "id": "display-jumbo",
    "family": "display",
    "purpose": "closing-slide jumbo headline at maximum scale — Archivo Black on brand-primary canvas",
    "px_min": 160, "px_max": 220, "weight": 400, "leading": "0.92", "tracking": "-0.01em", "case": "upper",
    "sample_html": "<div class=\"t-trole-display-jumbo\">Ship It</div>"
  },
  {
    "id": "display-hero",
    "family": "display",
    "purpose": "primary deck title / hero name on the title slide",
    "px_min": 120, "px_max": 160, "weight": 400, "leading": "0.92", "tracking": "-0.01em", "case": "upper",
    "sample_html": "<div class=\"t-trole-display-hero\">Creative Mode</div>"
  },
  {
    "id": "display-xl",
    "family": "display",
    "purpose": "section-opening headline (140px deck slide)",
    "px_min": 100, "px_max": 140, "weight": 400, "leading": "0.92", "tracking": "-0.01em", "case": "upper",
    "sample_html": "<div class=\"t-trole-display-xl\">Section title</div>"
  },
  {
    "id": "display-lg",
    "family": "display",
    "purpose": "section headline alongside a panel / diagram",
    "px_min": 84, "px_max": 100, "weight": 400, "leading": "0.92", "tracking": "-0.01em", "case": "upper",
    "sample_html": "<div class=\"t-trole-display-lg\">Headline beside panel</div>"
  },
  {
    "id": "display-md",
    "family": "display",
    "purpose": "section headline for data-heavy / grid layouts",
    "px_min": 72, "px_max": 96, "weight": 400, "leading": "0.92", "tracking": "-0.01em", "case": "upper",
    "sample_html": "<div class=\"t-trole-display-md\">Data section</div>"
  },
  {
    "id": "step-num",
    "family": "display",
    "purpose": "large ordinal numeral in stepped / process card (dominates the card)",
    "px_min": 100, "px_max": 140, "weight": 400, "leading": "0.85", "tracking": "0", "case": "upper",
    "sample_html": "<div class=\"t-trole-step-num\">01</div>"
  },
  {
    "id": "stat-num",
    "family": "display",
    "purpose": "large numeral inside a stat / data cell",
    "px_min": 72, "px_max": 96, "weight": 400, "leading": "0.9", "tracking": "0", "case": "upper",
    "sample_html": "<div class=\"t-trole-stat-num\">340%</div>"
  },
  {
    "id": "stamp-num",
    "family": "display",
    "purpose": "stamp / seal numeral inside the rotated stamp motif",
    "px_min": 48, "px_max": 64, "weight": 400, "leading": "0.9", "tracking": "0", "case": "upper",
    "sample_html": "<div class=\"t-trole-stamp-num\">2026</div>"
  },
  {
    "id": "marker-label",
    "family": "display",
    "purpose": "featured marker / callout block label (pink-on-ink with orange offset)",
    "px_min": 34, "px_max": 46, "weight": 400, "leading": "1", "tracking": "0", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-marker-label\">Featured</span></div>"
  },
  {
    "id": "step-title",
    "family": "display",
    "purpose": "title inside a step / process card (below the step-num)",
    "px_min": 28, "px_max": 34, "weight": 400, "leading": "1", "tracking": "0", "case": "upper",
    "sample_html": "<div class=\"t-trole-step-title\">Design</div>"
  },
  {
    "id": "badge-label",
    "family": "display",
    "purpose": "rotated badge / annotation label (yellow square, -4deg tilt)",
    "px_min": 22, "px_max": 28, "weight": 400, "leading": "1", "tracking": "0", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-badge-label\">New</span></div>"
  },
  {
    "id": "body-lg",
    "family": "body",
    "purpose": "lede paragraph / wide-column body (Space Grotesk 400)",
    "px_min": 22, "px_max": 28, "weight": 400, "leading": "1.4", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body-lg\">A lede paragraph carries the section's opening idea. Sentence case, never centered — grid discipline is left-aligned.</p>"
  },
  {
    "id": "body-md",
    "family": "body",
    "purpose": "body text inside stat cells / step descriptions / footnotes",
    "px_min": 18, "px_max": 24, "weight": 400, "leading": "1.3", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body-md\">Body text holds at 18–24px inside a card. Terse, max two sentences — Creative Mode is sparse-on-detail, loud-on-display.</p>"
  },
  {
    "id": "mono-kicker",
    "family": "mono",
    "purpose": "inverted kicker block — ink fill, cream text, loose tracking (the chapter / section register)",
    "px_min": 18, "px_max": 24, "weight": 400, "leading": "1", "tracking": "0.14em", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-mono-kicker\">Section 01</span></div>"
  },
  {
    "id": "mono-label",
    "family": "mono",
    "purpose": "topbar / meta-footer label, slide number, figure note — flat mono on cream",
    "px_min": 18, "px_max": 24, "weight": 400, "leading": "1", "tracking": "0.06em", "case": "upper",
    "sample_html": "<div class=\"t-trole-mono-label\">Vol. 01 / Edition 2026</div>"
  },
  {
    "id": "mono-tag",
    "family": "mono",
    "purpose": "layer tag / chip-style mono in a callout (mid tracking)",
    "px_min": 14, "px_max": 24, "weight": 400, "leading": "1", "tracking": "0.1em", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-mono-tag\">Fig. 01</span></div>"
  }
]
```

The atlas omits chrome layout (topbar / meta footer — declared in §H), hard offset shadows (depth motifs declared in §M), and the rotated stamp / badge surface treatment (also §M motifs, not text roles).

## §E Motion (GSAP consts — REPLACES site ease)

```js
// Creative Mode motion: editorial poster register.
// Source deck is keyboard-cut between static slides — no native @keyframes.
// We translate "slam down a printed page" feel: snap entries, hold, no float.
// RULE: never ease-in-out on primary motion — feels SaaS, breaks the zine voice.
// RULE: rotated elements (badge -4deg, stamp -6deg) animate from 0 → final tilt;
//       do NOT tween the angle past the final value (no overshoot rotation).
// RULE: hard-offset shadows must arrive AFTER the surface, not with it — fake the
//       screen-print registration error by lagging --shadow-* paint by DUR.snap.
// RULE: type-in-motion is per-line (not per-char) — Archivo Black uppercase reads
//       as a poster slab; splitting glyphs breaks the editorial integrity.
const EASE = {
  entry: "expo.out", // slam-down poster placement
  emphasis: "power3.out", // numeral counts, badge snap
  exit: "power2.in", // brisk departure, no lingering
  drift: "sine.inOut", // ambient only — never on primary type
  print: "back.out(1.4)", // optional registration-offset arrival
};
const DUR = {
  snap: 0.18, // chip / badge / corner appearance
  med: 0.45, // surface block placement, type slab arrival
  slow: 0.9, // hero headline + stamp full reveal
};
```

### §E.5 Motion choreography

**Allowed primitives.**

- **Slab-in:** opacity 0→1 + y +32px → 0 on full color-blocks (cells, panels, step cards) using `EASE.entry` + `DUR.med`. Stagger siblings by 0.06s.
- **Hard-shadow lag:** the colored shadow layer (`box-shadow` first stop) animates `opacity 0→1` 0.12s AFTER its surface lands. Fakes screen-print registration.
- **Number tick:** numerals (stat-counter, step-num, bar values) GSAP-animate via `{ textContent }` plugin, `DUR.med`, `EASE.emphasis`. Never tween font-size or letter-spacing.
- **Rotate-into-place:** badges and stamps animate `rotate: 0deg → var(--tilt-badge)`, `scale: 0.92 → 1`, `EASE.entry`, `DUR.med`. Single landing — no wobble.
- **Dashed rule reveal:** clip-path inset from right to 0 (`DUR.slow`, `EASE.entry`).

**Forbidden gestures.**

- No blur transitions, no glow, no soft fade between scenes.
- No parallax — the canvas is a flat page, not a 3D stage.
- No per-character splits on Archivo Black headlines (lines yes, glyphs no).
- No tween-back on rotated elements (overshoot betrays the "stamped" intent).

**Transition defaults between scenes.** Hard cut on a single ink frame (3-4 frames black with a cream wipe). `EASE.entry` for the incoming surface block. Never crossfade.

## §G Voice transform recipe

1. Strip articles + connectives (`the` / `a` / `of` / `and` / `to` / `with`).
2. Reduce to imperative fragments or single dominant nouns; favor verb-noun pairs.
3. UPPERCASE every on-screen string (display + label + chip).
4. Join with `.` line-break or em-dash `—` for emphasis between fragments.
5. End decisive — period or single-word punchline. No question marks, no ellipsis.
6. Mono labels (kicker, chip, axis ticks) carry chapter / index / unit copy in the form `SECTION 01`, `FIG. 01`, `VOL. 01 / EDITION 2026`.

**Example:**

- IN: `Figma helps teams design products collaboratively in real time.`
- OUT: `TEAMS. DESIGN. TOGETHER. — REAL-TIME. FIGMA.`

## §H Scene composition hints

**Canvas + frame.**

- Canvas is always `var(--canvas)` (cream). The closing scene is the single exception — full-bleed `var(--brand-primary)` (green role).
- Content lives inside 96px (≈5vw) left/right gutter; chrome rails (top label / bottom meta) sit at 64px (3.33vw).
- The topbar pill is the **only** rounded element per scene. Everything else is square.

**Focal sizing.**

- Hero scenes: display headline 140-220px (`8.3vw - 11.5vw`), line-height 0.92, max 3 lines.
- Section scenes: display 84-100px (`4.4vw - 5.2vw`), paired with a mono kicker (24px) above.
- Stat scenes: numerals 96px, max 4 cells in a 2×2 grid.
- Step / process scenes: 4 cards in a row, step numeral 140px dominates the card.

**Brand color role contract.**

- `--brand-primary` (green role): closing canvas fill; one major stat cell or process step; iso-stack panel base.
- `--brand-secondary` (pink role): featured marker block, stamp surface, stat cell #2.
- `--brand-accent` (orange role): hard-shadow color on featured blocks; bar-chart hot series; table column accent.
- Yellow (`color-mix` tint of `--brand-accent` if no 4th brand color) → decorative circle, rotated badge, step card #3.
- Use 2-3 accents per scene. Never all four simultaneously. Save the `--brand-primary` full-bleed for the deck's closing beat.

**Surface alternation.**

- Stat grid (4 cells): cream → pink → cream → green (or rotate to taste, but always include one cream cell so the grid breathes).
- Process row (4 cards): cream → pink → yellow → green. Final card is always the brand-primary anchor.
- Table: ink header row, cream label column, pink/green/orange data columns.

**Transition vocabulary.**

- Between scenes: hard cut + brief ink frame, no crossfade.
- Within a scene: slab-in for surfaces (DUR.med), then shadow-lag (DUR.snap), then numeral / type fill, then mono label tick-in.

**Forbidden shapes.**

- Rounded card corners outside the topbar pill (999px) and the decorative circle (50%).
- Gradient fills (the four-accent palette is solid-only).
- Drop-shadow blur, glow, neon — every shadow is hard offset.
- Center-aligned body text (grid discipline = left-aligned).

## §M Atomic motifs (gestures the plan agent can reference)

Each motif is a **single reusable gesture** that lives inside a larger pattern. Patterns compose motifs; motifs do not compose anything. The plan agent treats motifs as the smallest cite-able vocabulary — a scene description can say "uses motif:hard-offset-shadow on the featured callout" without specifying which pattern the callout sits in.

```motifs
[
  {
    "id": "hard-offset-shadow",
    "label": "Hard offset shadow",
    "role": "screen-print-depth",
    "surface_safe": ["cream", "brand"],
    "description": "Featured block sits on a 24px down-and-right offset color slab + 4px ink halo. The signature Creative Mode depth move — Risograph-style registration error, never a blurred drop-shadow. Reserve for hero callouts (marker block, poster switch); grid cells never get individual hard shadows.",
    "wide": true,
    "demo": "<div class=\"cm-motif-shadow\"><div class=\"cm-motif-shadow-card\">Featured.</div></div>",
    "css": ".cm-motif-shadow{position:relative;display:inline-block;padding:0 24px 24px 0}.cm-motif-shadow-card{position:relative;background:var(--brand-secondary);border:4px solid var(--ink);padding:24px 36px;font-family:var(--f-disp-native);font-weight:400;font-size:clamp(28px,3vw,46px);line-height:1;letter-spacing:-.01em;text-transform:uppercase;color:var(--ink);box-shadow:24px 24px 0 var(--brand-accent),24px 24px 0 4px var(--ink)}"
  },
  {
    "id": "kicker-block",
    "label": "Kicker block",
    "role": "section-label",
    "surface_safe": ["cream"],
    "description": "Inverted mono kicker — ink fill, cream text, loose 0.14em tracking. Sits above a display headline as the chapter / section register marker. Always a single line, single phrase like 'SECTION 01' or 'VOL. 01 / EDITION 2026'.",
    "demo": "<div class=\"cm-motif-kicker-wrap\"><span class=\"cm-motif-kicker\">Section 01</span></div>",
    "css": ".cm-motif-kicker-wrap{display:flex;justify-content:center}.cm-motif-kicker{display:inline-block;background:var(--ink);color:var(--canvas);font-family:var(--f-mono-native);font-weight:400;font-size:clamp(16px,1.4vw,24px);line-height:1;letter-spacing:.14em;text-transform:uppercase;padding:8px 16px}"
  },
  {
    "id": "rotated-badge",
    "label": "Rotated badge",
    "role": "imperfection-stamp",
    "surface_safe": ["cream"],
    "description": "Yellow square with 4px ink border, Archivo Black label, rotated -4deg. The deliberate-imperfection signal — reserve for 'NEW' / status callouts. Never tween the rotation; the angle is a static signature.",
    "demo": "<div class=\"cm-motif-badge-wrap\"><span class=\"cm-motif-badge\">New</span></div>",
    "css": ".cm-motif-badge-wrap{display:flex;justify-content:center;padding:14px 0}.cm-motif-badge{display:inline-block;background:var(--brand-accent);border:4px solid var(--ink);padding:14px 22px;font-family:var(--f-disp-native);font-weight:400;font-size:clamp(20px,1.8vw,28px);line-height:1;text-transform:uppercase;color:var(--ink);transform:rotate(-4deg)}"
  },
  {
    "id": "rotated-stamp",
    "label": "Rotated stamp",
    "role": "approval-seal",
    "surface_safe": ["cream", "brand"],
    "description": "Pink square stamp with two concentric cream borders (4px outer + 4px inner ring), rotated -6deg. The 'sealed by hand' beat — reserve for closing slides, approvals, or the final stat callout. The two-ring border is non-negotiable; a single border reads as a card, not a stamp.",
    "demo": "<div class=\"cm-motif-stamp-wrap\"><div class=\"cm-motif-stamp\"><div class=\"cm-motif-stamp-inner\">2026</div></div></div>",
    "css": ".cm-motif-stamp-wrap{display:flex;justify-content:center;padding:18px 0}.cm-motif-stamp{display:flex;align-items:center;justify-content:center;width:140px;height:140px;background:var(--brand-secondary);border:4px solid var(--canvas);transform:rotate(-6deg);box-shadow:0 0 0 4px var(--ink)}.cm-motif-stamp-inner{display:flex;align-items:center;justify-content:center;width:108px;height:108px;border:4px solid var(--canvas);border-radius:50%;font-family:var(--f-disp-native);font-weight:400;font-size:clamp(28px,3vw,44px);line-height:1;color:var(--canvas);text-transform:uppercase}"
  },
  {
    "id": "em-step-arrow",
    "label": "Step arrow",
    "role": "process-marker",
    "surface_safe": ["cream"],
    "description": "Right-pointing ink triangle between process cards — CSS-only chevron made from border tricks. The signal that step N → step N+1; never used outside the process row.",
    "demo": "<div class=\"cm-motif-arrow-wrap\"><span class=\"cm-motif-arrow-card\">Step 01</span><span class=\"cm-motif-arrow\"></span><span class=\"cm-motif-arrow-card\">Step 02</span></div>",
    "css": ".cm-motif-arrow-wrap{display:flex;align-items:center;gap:14px;flex-wrap:wrap;justify-content:center}.cm-motif-arrow-card{display:inline-block;background:var(--canvas);border:4px solid var(--ink);padding:10px 18px;font-family:var(--f-disp-native);font-weight:400;font-size:14px;line-height:1;text-transform:uppercase;color:var(--ink)}.cm-motif-arrow{display:inline-block;width:0;height:0;border-top:14px solid transparent;border-bottom:14px solid transparent;border-left:20px solid var(--ink)}"
  },
  {
    "id": "decorative-circle",
    "label": "Decorative circle",
    "role": "shape-figure",
    "surface_safe": ["cream", "brand"],
    "description": "Yellow circle with 4px ink border placed inside a green square — pure shape-on-color geometry. The system's only non-orthogonal decorative figure besides badge/stamp. Use sparingly; one per scene maximum.",
    "demo": "<div class=\"cm-motif-circle-wrap\"><div class=\"cm-motif-circle\"></div></div>",
    "css": ".cm-motif-circle-wrap{display:flex;align-items:center;justify-content:center;background:var(--brand-primary);border:4px solid var(--ink);width:160px;height:160px}.cm-motif-circle{width:96px;height:96px;background:var(--brand-accent);border:4px solid var(--ink);border-radius:50%}"
  }
]
```

The `motifs` JSON block above is the SOLE source of truth. build-design.mjs reads it to render §M cards in design.html. The Phase 3 plan agent and Phase 4b scene worker may cite motifs by `id` when annotating which gesture a scene relies on.

**Materials lexicon** (informational — these are the composition atoms behind the patterns):

- hard-offset-shadow · kicker-block · rotated-badge · rotated-stamp · em-step-arrow · decorative-circle · stat-cell-grid · table-color-column

## §I Page-level CSS

```css
/* ── Preset-native typography vars (loaded via preset-meta.chromeFonts.googleFontsHref).
 * These let the doc chrome render in Archivo Black / Space Grotesk / JetBrains Mono
 * regardless of which brand DNA the preset is applied to. The §6 component preview,
 * §M motifs grid, and §T type-role atlas also read these via .preset-native-scope.
 *
 * Creative Mode has no script face — the script slot points at Archivo Black because
 * the preset refuses a fourth family. Fallback chains end in heavy grotesques /
 * system mono so the editorial-zine register survives a missing webfont. */
:root {
  --f-disp-native:
    "Archivo Black", "Anton", "Space Grotesk", -apple-system, BlinkMacSystemFont, system-ui,
    sans-serif;
  --f-body-native:
    "Space Grotesk", "Inter", "IBM Plex Sans", -apple-system, BlinkMacSystemFont, system-ui,
    sans-serif;
  --f-script-native:
    "Archivo Black", "Anton", "Space Grotesk", -apple-system, BlinkMacSystemFont, system-ui,
    sans-serif;
  --f-mono-native:
    "JetBrains Mono", "IBM Plex Mono", "Space Mono", "Menlo", ui-monospace, monospace;
}

/* .preset-native-scope: re-bind brand DNA font tokens to preset-native families.
 * Wraps §6 component previews, §M motif demos, and §T type-role atlas so
 * var(--font-*) resolves to Archivo Black / Space Grotesk / JetBrains Mono
 * regardless of brand DNA. The paste-ready component source is untouched —
 * Phase 4b still grep + paste original `var(--font-display)` tokens, which
 * resolve to brand DNA at scene-render time. */
.preset-native-scope {
  --font-display: var(--f-disp-native);
  --font-body: var(--f-body-native);
  --font-script: var(--f-script-native);
  --font-mono: var(--f-mono-native);
}

/* Make design.html itself read as Creative Mode. */
body {
  background: var(--canvas, #efe9d9);
  color: var(--ink, #0f0f0f);
  font-family: "Space Grotesk", system-ui, sans-serif;
}
h1,
h2,
h3 {
  font-family: "Archivo Black", "Anton", sans-serif;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  line-height: 0.92;
}
.ds-section-heading,
.ds-h2 {
  border-bottom: 4px solid var(--ink, #0f0f0f);
  padding-bottom: 0.4em;
}
.ds-callout,
.ds-intent {
  background: var(--canvas, #efe9d9);
  border: 4px solid var(--ink, #0f0f0f);
  box-shadow:
    12px 12px 0 var(--brand-secondary, #f06ca8),
    12px 12px 0 4px var(--ink, #0f0f0f);
  padding: 1.5em;
}
.ds-code {
  background: #fff;
  border: 3px solid var(--ink, #0f0f0f);
  font-family: "JetBrains Mono", monospace;
}

/* ── §M Motifs grid: atomic gestures.
 * Cream canvas cards with 4px ink borders — every motif card reads as a
 * mini-poster. Cards may declare a surface (cream / brand) to demonstrate the
 * gesture against its native bg. */
.ds-motif-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
}
.ds-motif {
  grid-column: span 4;
  min-height: 280px;
  padding: 28px;
  border: 4px solid var(--ink);
  border-radius: 0;
  background: var(--canvas);
  color: var(--ink);
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
  background: var(--canvas);
  color: var(--ink);
}
.ds-motif.ds-motif-surface-brand {
  background: var(--brand-primary);
  color: var(--canvas);
  border-color: var(--ink);
}
.ds-motif-h {
  margin: 0;
  font-family: var(--f-disp-native);
  font-weight: 400;
  font-size: clamp(22px, 2.2vw, 34px);
  line-height: 0.92;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: var(--ink);
}
.ds-motif.ds-motif-surface-brand .ds-motif-h {
  color: var(--canvas);
}
.ds-motif-desc {
  margin: 0;
  font-family: var(--f-body-native);
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--ink) 75%, transparent);
  max-width: 32ch;
}
.ds-motif.ds-motif-surface-brand .ds-motif-desc {
  color: color-mix(in srgb, var(--canvas) 80%, transparent);
}
.ds-motif-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 110px;
}
.ds-motif-id {
  position: absolute;
  top: 12px;
  right: 14px;
  font-family: var(--f-mono-native);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--ink) 50%, transparent);
}
.ds-motif.ds-motif-surface-brand .ds-motif-id {
  color: color-mix(in srgb, var(--canvas) 70%, transparent);
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

/* ── §T Type-role atlas. Container = cream canvas card with 4px ink border.
 * Each .t-trole-* class encodes the role's family / size / weight / leading /
 * tracking / case. Family selectors use var(--font-*) tokens so the atlas
 * renders in BRAND DNA fonts (with .preset-native-scope flipping back to
 * Archivo Black + Space Grotesk + JetBrains Mono in the live preview); only
 * the recipe is preset-declared. Color decisions follow Creative Mode's
 * four-accent contract — ink-on-cream by default, brand-secondary / accent
 * for decoration motifs. */
.ds-trole-box {
  display: flex;
  flex-direction: column;
  border: 4px solid var(--ink);
  border-radius: 0;
  background: var(--canvas);
  overflow: hidden;
  margin-top: 24px;
}
.ds-trole-row {
  padding: 28px 32px;
  border-bottom: 3px solid var(--ink);
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

/* ── Type-role samples. var(--font-display/body/mono) resolves to brand DNA at
 * scene-render time; .preset-native-scope on the atlas container rebinds them
 * to Archivo Black + Space Grotesk + JetBrains Mono for the design.html
 * preview. Color decisions stay ink-on-cream except for motif-bearing roles
 * (marker / badge / kicker) which carry the four-accent palette directly. */
.t-trole-display-jumbo {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(120px, 14vw, 220px);
  line-height: 0.92;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-display-hero {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(96px, 10vw, 160px);
  line-height: 0.92;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-display-xl {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(84px, 8vw, 140px);
  line-height: 0.92;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-display-lg {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(72px, 6vw, 100px);
  line-height: 0.92;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-display-md {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(60px, 5.4vw, 96px);
  line-height: 0.92;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-step-num {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(80px, 8vw, 140px);
  line-height: 0.85;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-stat-num {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(60px, 5.4vw, 96px);
  line-height: 0.9;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-stamp-num {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(40px, 3.6vw, 64px);
  line-height: 0.9;
  text-transform: uppercase;
  color: var(--canvas);
}
.t-trole-marker-label {
  display: inline-block;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(28px, 2.6vw, 46px);
  line-height: 1;
  text-transform: uppercase;
  background: var(--brand-secondary);
  color: var(--ink);
  border: 4px solid var(--ink);
  padding: 14px 22px;
  box-shadow:
    18px 18px 0 var(--brand-accent),
    18px 18px 0 4px var(--ink);
}
.t-trole-step-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(24px, 2vw, 34px);
  line-height: 1;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-badge-label {
  display: inline-block;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(18px, 1.6vw, 28px);
  line-height: 1;
  text-transform: uppercase;
  background: var(--brand-accent);
  color: var(--ink);
  border: 4px solid var(--ink);
  padding: 10px 18px;
  transform: rotate(-4deg);
}
.t-trole-body-lg {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(20px, 1.6vw, 28px);
  line-height: 1.4;
  color: var(--ink);
  max-width: 50ch;
  margin: 0;
}
.t-trole-body-md {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(16px, 1.3vw, 24px);
  line-height: 1.3;
  color: var(--ink);
  max-width: 60ch;
  margin: 0;
}
.t-trole-mono-kicker {
  display: inline-block;
  font-family: var(--font-mono);
  font-weight: 400;
  font-size: clamp(16px, 1.4vw, 24px);
  line-height: 1;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  background: var(--ink);
  color: var(--canvas);
  padding: 8px 16px;
}
.t-trole-mono-label {
  font-family: var(--font-mono);
  font-weight: 400;
  font-size: clamp(14px, 1.2vw, 24px);
  line-height: 1;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-mono-tag {
  display: inline-block;
  font-family: var(--font-mono);
  font-weight: 400;
  font-size: clamp(12px, 1.1vw, 24px);
  line-height: 1;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink);
  border: 2px solid var(--ink);
  padding: 6px 14px;
  border-radius: 999px;
}
```
