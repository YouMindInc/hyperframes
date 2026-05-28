```preset-meta
{
  "name": "studio",
  "label": "Studio",
  "fingerprint": {
    "type": "graphic-mass-grotesque",
    "weight": "max-only-900",
    "case": "uppercase-non-negotiable",
    "palette": "binary-plus-opacity",
    "depth": "flat-severe",
    "rule": "hairline-and-2px-only"
  },
  "match_signals": [
    { "kind": "condensed_display", "weight": 0.25 },
    { "kind": "hairline_border", "weight": 0.2 },
    { "kind": "minimal_decoration", "weight": 0.2 },
    { "kind": "low_saturation", "weight": 0.05 }
  ],
  "best_for": ["creative agencies", "fashion brands", "studios", "manifesto pages", "art-directed declarative product launches"],
  "avoid_for": ["quiet institutional registers", "decoration-expecting contexts", "warm consumer", "soft lifestyle"],
  "chromeFonts": {
    "googleFontsHref": "https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;700;900&family=IBM+Plex+Mono:wght@400;500&display=swap",
    "display": "Barlow",
    "body": "Barlow",
    "script": "Barlow",
    "mono": "IBM Plex Mono"
  }
}
```

> `chromeFonts` makes the design.html doc chrome (title-card, section heads, h2/h3, lede paragraphs, eyebrows) render in the preset's NATIVE typography — Barlow + IBM Plex Mono — instead of the brand DNA fonts. Studio is a two-face system: Barlow does everything except metadata; the `script` slot also points at Barlow because Studio refuses a third face. The brand fonts still apply to §6 component code (paste-ready for Phase 4b). §M motifs grid uses `.preset-native-scope` so var(--font-display/body/mono) re-resolves to these native families for the live preview.

## §A Director's intent

Type-as-graphic-mass agency manifesto. One typeface (Barlow), one weight (900), strict uppercase, at scales so large that letterforms stop reading as type and start reading as geometric blocks. The headline IS the design — there are no decorative elements, no ornaments, no third color.

**Binary surface system.** Every scene is either a dark canvas (`var(--canvas)`) with brand-color type, or a brand-color canvas (`var(--brand-primary)`) with dark type. Same brand color, two roles: foreground on dark, environment on light. No third color, no greys — secondary text is the surface accent at 58–62% opacity.

**Brand DNA drives the accent, preset drives the structure.** The single brand color (`--brand-primary`) does double duty as type on dark and ground on light. Other brand colors (`--brand-secondary` / `--brand-accent`) are kept out of the main type system — at most they appear as a single chart-highlight bar or a divider rule. Dilution kills the binary register.

Depth is severely flat: zero shadows, zero rounded corners, zero gradients. Only two rule weights exist — 1px hairlines for chrome separation, 2px solid for anchors (stat-card tops, compare dividers, chart baselines). Body bullets are em-dashes in the surface accent — never dots.

Motion is editorial-sharp: agency urgency, not editorial grace. Short, decisive `power3.out` / `expo.out` entries; never overshoot, never bounce. The type is already loud — motion stays subordinate. Scene transitions are clean reveals (`clip-path` reveal-right matches the template's signature).

**Best for** sites that want to feel art-directed, design-led, declarative — creative agencies, fashion brands, studios, manifesto pages. **Avoid for** quiet/institutional registers and anything where decoration is expected; Studio refuses to decorate.

Class prefix: `sd-` (Studio Design, 3 chars).

## §B Decoration tokens (merge into design.html `:root`)

Studio declares **structural** tokens only — rule weights, padding scale, opacity tiers, type scale anchors. Color is sourced from site brand DNA: `--brand-primary` plays the dual surface/accent role, `--canvas` is the dark base, `--ink` is reserved for body text on the wrong-contrast surface. No hex literals required — Studio's identity is structural, not chromatic.

```css
/* ── Rule weights ─────────────────────────────────────────── */
/* The system has exactly two: hairline (chrome separation) and heavy (anchor) */
--rule-hairline: 1px;
--rule-heavy: 2px;

/* ── Opacity tiers ────────────────────────────────────────── */
/* Studio has no greys — muting is opacity-only on the surface accent. */
--tier-2: 0.58; /* secondary text on dark (yellow at 58%) */
--tier-3: 0.32; /* tertiary text on dark */
--tier-2-light: 0.62; /* secondary text on light (near-black at 62%) */
--tier-3-light: 0.35; /* tertiary text on light */
--border-dark-opacity: 0.18; /* hairline borders on dark surfaces */
--border-light-opacity: 0.18; /* hairline borders on light surfaces */

/* ── Spacing ──────────────────────────────────────────────── */
/* Studio pads tighter than editorial — type runs to the edge. */
--pad-x: 5vw;
--pad-y: 5vh;
--gap-lg: 3.5vh;
--gap-md: 2vh;
--gap-sm: 1vh;

/* ── Type scale anchors ───────────────────────────────────── */
/* Scene workers reference these via clamp(); never hard-code px at display scale. */
--sz-display: 12vw; /* cover hero */
--sz-h1: 7.5vw; /* chapter / statement */
--sz-h2: 4.8vw; /* section headline */
--sz-h3: 2.8vw; /* sub-headline */
--sz-quote: 3.8vw; /* uppercase pull-quote */
--sz-stat: 5.5vw; /* stat numeral */
--sz-lead: 1.6vw;
--sz-body: 1.15vw;
--sz-caption: 0.85vw;
--sz-label: 0.72vw; /* mono chrome */

/* ── Display tracking ─────────────────────────────────────── */
/* Negative tracking on display weights is what compresses Barlow 900 into a block. */
--track-display: -0.02em;
--track-h2: -0.01em;
--track-stat: -0.03em;
--track-label: 0.06em; /* mono labels — positive tracking */

/* ── Surface-aware ink mixes ──────────────────────────────── */
/* Muted text uses opacity on the surface accent, not a separate grey. */
--ink-dark-2: color-mix(in srgb, var(--brand-primary) 58%, transparent);
--ink-dark-3: color-mix(in srgb, var(--brand-primary) 32%, transparent);
--ink-light-2: color-mix(in srgb, var(--canvas) 62%, transparent);
--ink-light-3: color-mix(in srgb, var(--canvas) 35%, transparent);

/* Hairline border tints — dark border on light, light border on dark. */
--border-on-dark: color-mix(in srgb, var(--brand-primary) 18%, transparent);
--border-on-light: color-mix(in srgb, var(--canvas) 18%, transparent);
```

## §D Font pairing fallback (if brand fonts not on Google Fonts)

Studio's identity depends on a heavy grotesque at weight 900. If the brand-derived display font isn't on Google Fonts, the fallback walks heavy contemporary grotesques. Mono is reserved exclusively for metadata chrome — never headlines, never body.

- **display**: `'Barlow'` · `'Archivo'` · `'Inter'` wght 900
- **body**: `'Barlow'` · `'Archivo'` · `'Inter'` wght 400
- **mono**: `'IBM Plex Mono'` · `'JetBrains Mono'` · `'Space Mono'` wght 500

## §T Type-role atlas (Phase 4b reads this to size text correctly)

Each entry is a **named type role** with concrete render parameters at 1920×1080 — family token, px range, weight, leading, tracking, case, and any color/decoration. Phase 4b scene workers may cite roles by `id` ("use a `stat-value` here"); the brand DNA fonts plug in automatically via `var(--font-*)` tokens. This is the same atlas Studio ships in its Typography section, ported as machine-readable JSON.

The atlas is the **sole authoring source** for non-component text. If a scene needs a `display` numeral that isn't covered by §6 components, the worker reads role `display` here and writes inline CSS from these values. Do NOT invent ad-hoc sizes — Studio's identity collapses if weights drift below 900 at display scale.

```type-roles
[
  {
    "id": "display",
    "family": "display",
    "purpose": "cover hero at maximum scale — type-as-graphic-mass",
    "px_min": 192, "px_max": 256, "weight": 900, "leading": "0.9", "tracking": "-0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-display\">Studio</div>"
  },
  {
    "id": "h1",
    "family": "display",
    "purpose": "chapter title / full-slide statement headline",
    "px_min": 120, "px_max": 160, "weight": 900, "leading": "0.92", "tracking": "-0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-h1\">Manifesto</div>"
  },
  {
    "id": "stat-value",
    "family": "display",
    "purpose": "statistical numeral inside a stat card",
    "px_min": 88, "px_max": 120, "weight": 900, "leading": "0.9", "tracking": "-0.03em", "case": "upper",
    "sample_html": "<div class=\"t-trole-stat-value\">4M</div>"
  },
  {
    "id": "h2",
    "family": "display",
    "purpose": "primary slide headline",
    "px_min": 76, "px_max": 100, "weight": 900, "leading": "0.95", "tracking": "-0.01em", "case": "upper",
    "sample_html": "<div class=\"t-trole-h2\">Section title</div>"
  },
  {
    "id": "quote-text",
    "family": "display",
    "purpose": "pull-quote body (uppercase, no quote marks)",
    "px_min": 60, "px_max": 84, "weight": 900, "leading": "1.05", "tracking": "-0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-quote-text\">Type stops being type and becomes mass.</div>"
  },
  {
    "id": "h3",
    "family": "display",
    "purpose": "sub-headline / panel title",
    "px_min": 44, "px_max": 60, "weight": 700, "leading": "1.1", "tracking": "0", "case": "upper",
    "sample_html": "<div class=\"t-trole-h3\">Sub-headline</div>"
  },
  {
    "id": "lead",
    "family": "body",
    "purpose": "lead paragraph / intro sentence",
    "px_min": 25, "px_max": 36, "weight": 500, "leading": "1.45", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-lead\">The lead carries the opening idea. Sparse, terse, one thought per slide.</p>"
  },
  {
    "id": "body",
    "family": "body",
    "purpose": "default body paragraph / bullet body",
    "px_min": 18, "px_max": 24, "weight": 400, "leading": "1.6", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body\">Body sits at weight 400, one or two sentences. Studio is sparse — body never carries more than one idea.</p>"
  },
  {
    "id": "caption",
    "family": "body",
    "purpose": "caption / source attribution",
    "px_min": 13, "px_max": 18, "weight": 400, "leading": "1.5", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-caption\">Source: internal data, March 2026.</p>"
  },
  {
    "id": "label",
    "family": "mono",
    "purpose": "metadata: chrome bar, slide counter, chapter number, stat note",
    "px_min": 11, "px_max": 15, "weight": 500, "leading": "1.3", "tracking": "0.06em", "case": "upper",
    "sample_html": "<div class=\"t-trole-label\">01 / Manifesto</div>"
  },
  {
    "id": "cover-meta",
    "family": "mono",
    "purpose": "three-column mono cover lockup (studio × client / title / studio name) — the 'Boring Studios' signature",
    "px_min": 11, "px_max": 15, "weight": 500, "leading": "1.5", "tracking": "0.06em", "case": "upper",
    "sample_html": "<div class=\"t-trole-cover-meta\"><span>Studio × Client</span><span>Presentation title</span><span>Studio name</span></div>"
  },
  {
    "id": "em-dash-bullet",
    "family": "body",
    "purpose": "list item with em-dash prefix in surface accent (never dots)",
    "px_min": 18, "px_max": 24, "weight": 400, "leading": "1.6", "tracking": "0", "case": "sentence",
    "sample_html": "<ul class=\"t-trole-em-dash-bullet\"><li>One idea per line.</li><li>Em-dash in surface accent.</li><li>Never dots.</li></ul>"
  }
]
```

The atlas omits the chrome bar and foot bar layouts (they're structural, declared in §B / §H) and the stat-card surface treatment (a §M motif, not a text role).

## §E Motion (GSAP consts — REPLACES site ease)

```js
const EASE = {
  entry: "expo.out", // sharp deceleration — agency urgency, never overshoot
  emphasis: "power3.out", // declarative emphasis without bounce
  exit: "power2.in", // accelerate off — clean exits
  drift: "sine.inOut", // reserved for ambient only (Studio rarely uses ambient)
};
const DUR = {
  snap: 0.18,
  med: 0.45,
  slow: 0.85,
};
// RULE: NEVER use back / elastic / bounce eases. Studio's voice is declarative,
//       not playful — overshoot reads as undisciplined.
// RULE: clip-path reveal-right / reveal-left is the signature entry for headlines.
//       Animate inset(0 100% 0 0) → inset(0 0% 0 0) with EASE.entry over DUR.med.
// RULE: stagger budget 80–180ms between elements (template's 0.08s / 0.18s /
//       0.30s / 0.44s ladder). Total scene-in stagger ≤ 600ms.
// RULE: scene transitions stay clean — short fade or hard cut. NEVER zoom, blur,
//       slide-between-scenes. Editorial discipline.
// RULE: no rotation on hero text. Barlow 900 is a graphic block; rotating it
//       breaks the block-as-shape reading.
```

### §E.5 Motion choreography

**Allowed primitives**

- `fade-up` (opacity 0 + translateY 28px → 0 / opacity 1) on headlines + body.
- `fade-in` (opacity 0 → 1) on chrome labels + metadata + image placeholders.
- `reveal-right` / `reveal-left` (clip-path inset reveal) on display headlines + heavy rules — Studio's signature.
- `scale-in` from 0.94 → 1 on stat-card numerals (subtle; never below 0.9).
- Brief settle on stat numerals — counter up with `power3.out`, no spring.

**Forbidden**

- back / elastic / bounce — any overshoot. Period.
- Rotation on type (Barlow 900 is a graphic block; rotation breaks the reading).
- Blur, glow, drop-shadow filters. Studio is severely flat.
- Crossfade between scenes longer than 200ms — agencies cut hard.
- Animating padding / margin — destabilises the type-edge tension. Animate transform / opacity / clip-path only.
- Staggers > 200ms between siblings — drags pacing past "agency urgency".

**Stagger budget**

80–180ms between siblings. Total scene-in stagger ≤ 600ms. Faster than 8-bit-orbit, faster than editorial.

## §G Voice transform recipe (apply to brand's voice from §1 DNA)

Studio's typographic identity is uppercase Barlow 900. Take the brand's product description / value prop and transform with:

1. Strip articles, connectives, hedges ("the", "a", "of", "really", "just", "very").
2. UPPERCASE every headline, chapter label, stat label, quote, button. No exceptions.
3. Hero / statement headlines: 3–7 words, one strong sentence ending without punctuation, or a question ending with `?`. Never a period at end of display type.
4. Chapter / section labels: `NN / TITLE` format — two-digit chapter number, slash, uppercase title (mono).
5. Stat numerals: bare numeric + optional `+` / `M` / `%` suffix (e.g. `200+`, `4M`, `99%`). Stat label below in sentence-case Barlow 500.
6. Body / lead paragraphs: sentence case, terse, max 2 sentences. Studio is sparse — body never carries more than one idea.
7. Quote bodies: UPPERCASE, no quote marks, end with period or em-dash. Attribution in mono uppercase below.

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: hero=`TEAMS BUILD TOGETHER` / chapter-label=`01 / DESIGN` / stat=`4M / TEAMS` / cta-label=`START`

## §H Scene composition hints (Phase 4b layout guidance)

**Surface alternation across scenes**

- Two surfaces only: `dark` (canvas-based) and `light` (brand-primary-based). Alternate freely; both are first-class. Two consecutive dark scenes = quiet section, then a single light scene as punctuation.
- Dark scene: `background: var(--canvas)`, headlines in `var(--brand-primary)`.
- Light scene: `background: var(--brand-primary)`, headlines in `var(--canvas)`.
- Never mix the two on one scene (no two-tone splits, no diagonal). The whole canvas is one surface.

**Hero / display text**

- One display-tier headline per scene (4.8vw and above). Display takes 60–95% canvas width.
- Display headline ALWAYS uses Barlow 900, uppercase, negative tracking ≥ -0.01em. Weight 800 or 700 at display scale breaks the type-as-graphic-mass effect.
- Display headlines are always in the surface accent — never muted, never a third color.

**Brand color placement (role contract)**

- `--brand-primary` is the **dual-role color** — type on dark, surface on light. This is the binary.
- `--brand-secondary` and `--brand-accent` are **kept off the main type system**. Use them only for chart-highlight bars or as the single accent rule on a divider — and only once per scene.
- Body / lead text uses the surface accent at 58–62% opacity (`--ink-dark-2` / `--ink-light-2`). Never a separate grey color.
- The em-dash bullet marker carries the surface accent at full opacity — never muted.

**Rule weights**

- 1px hairline (`--rule-hairline`) — chrome separation, foot bar, compare panel cross-rules, hairline borders.
- 2px solid (`--rule-heavy`) — stat-card top rules, compare-panel vertical divider, chart baseline, divider-loud. The 2px rule is the system's "anchor" weight — reserve it for elements that should read as structural, not decorative.
- No dashed, no dotted. No widths between 1px and 2px.

**Density philosophy**

- Sparse by design. A statement scene = one headline filling 80% width, 50–60% empty surface above. A chapter scene = small mono label + one massive title.
- Don't fill more than ~60% of any scene with content. Empty surface IS structural — Studio reads as broken when crowded.
- Padding: `5vw` horizontal, `5vh` vertical. Tighter than editorial. Display type runs near the edge; do not pad it generously.

**Mono metadata role**

- IBM Plex Mono is used ONLY for: chrome labels, slide counters (if shown), chapter numbers, stat notes, cover-meta lockup, captions on image placeholders. Tracking 0.06em, uppercase.
- Barlow in metadata roles = wrong. Mono in headline roles = wrong. The face split is absolute.

**Transitions between scenes**

- Clean short fade (≤ 200ms) or hard cut. NEVER zoom-between-scenes, NEVER slide horizontal (the source template's deck-strip slide is navigation chrome, not scene-to-scene transition for video).
- Reveal-right / reveal-left clip-path is for intra-scene element entry, not scene-to-scene.

## §M Atomic motifs (gestures the plan agent can reference)

Each motif is a **single reusable gesture** that lives inside a larger pattern. Patterns compose motifs; motifs do not compose anything. Studio is reductive by design — only 5 gestures qualify as atomic. Adding more would dilute the binary register.

```motifs
[
  {
    "id": "type-as-mass",
    "label": "Type as mass",
    "role": "graphic-block",
    "surface_safe": ["dark", "light"],
    "description": "Barlow weight 900 uppercase with negative tracking at display scale. Letterforms stop reading as type and start reading as a geometric block. The system's entire identity — without it, Studio doesn't exist.",
    "wide": true,
    "demo": "<div class=\"sd-motif-mass\">Studio</div>",
    "css": ".sd-motif-mass{font-family:var(--f-disp-native);font-weight:900;font-size:clamp(64px,8vw,140px);line-height:.9;letter-spacing:-.02em;text-transform:uppercase;color:var(--brand-primary);text-align:center}"
  },
  {
    "id": "em-dash-bullet",
    "label": "Em-dash bullet",
    "role": "list-marker",
    "surface_safe": ["dark", "light"],
    "description": "`—` prefix on every list item in the surface accent color, with 0.5em right margin. Never dots, never circles. Color flips with the surface.",
    "demo": "<ul class=\"sd-motif-dash\"><li>One idea.</li><li>Per line.</li><li>Never dots.</li></ul>",
    "css": ".sd-motif-dash{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px}.sd-motif-dash li{font-family:var(--f-body-native);font-weight:400;font-size:clamp(16px,1.5vw,22px);line-height:1.6;color:var(--brand-primary);padding-left:1.5em;position:relative}.sd-motif-dash li::before{content:\"\\2014\";position:absolute;left:0;color:var(--brand-primary);font-weight:900}"
  },
  {
    "id": "stat-rule-top",
    "label": "Stat rule top",
    "role": "anchor-divider",
    "surface_safe": ["dark", "light"],
    "description": "2px solid top rule + stat numeral (5.5vw Barlow 900) + label below. Heavier than chrome hairlines because stats are anchors, not separators. Padding right and bottom; left padding is zero (rule starts flush with card's left edge).",
    "demo": "<div class=\"sd-motif-stat\"><div class=\"sd-motif-stat-rule\"></div><div class=\"sd-motif-stat-value\">4M</div><div class=\"sd-motif-stat-label\">Teams shipping</div></div>",
    "css": ".sd-motif-stat{display:flex;flex-direction:column;gap:12px;padding:0}.sd-motif-stat-rule{height:2px;background:var(--brand-primary)}.sd-motif-stat-value{font-family:var(--f-disp-native);font-weight:900;font-size:clamp(56px,6vw,110px);line-height:.9;letter-spacing:-.03em;color:var(--brand-primary);text-transform:uppercase}.sd-motif-stat-label{font-family:var(--f-body-native);font-weight:500;font-size:clamp(14px,1.2vw,20px);line-height:1.45;color:color-mix(in srgb,var(--brand-primary) 58%, transparent)}"
  },
  {
    "id": "cover-meta-lockup",
    "label": "Cover meta lockup",
    "role": "signature-footer",
    "surface_safe": ["dark"],
    "description": "Three-column IBM Plex Mono footer — column 1 left-aligned (studio × client + date), column 2 centered (presentation title), column 3 right-aligned (studio name). Separated from cover-type by a 1px yellow-25% rule. The 'Boring Studios' signature lockup; non-negotiable on cover slides.",
    "wide": true,
    "demo": "<div class=\"sd-motif-meta\"><span>Studio × Client</span><span>Presentation title</span><span>Studio name</span></div>",
    "css": ".sd-motif-meta{display:grid;grid-template-columns:1fr 1fr 1fr;align-items:center;gap:24px;border-top:1px solid color-mix(in srgb,var(--brand-primary) 25%, transparent);padding-top:16px;font-family:var(--f-mono-native);font-weight:500;font-size:clamp(11px,1vw,14px);line-height:1.5;letter-spacing:.06em;text-transform:uppercase;color:var(--brand-primary)}.sd-motif-meta span:nth-child(2){text-align:center}.sd-motif-meta span:nth-child(3){text-align:right}"
  },
  {
    "id": "chrome-hairline",
    "label": "Chrome hairline",
    "role": "structural-rule",
    "surface_safe": ["dark", "light"],
    "description": "1px solid border-on-dark / border-on-light separating chrome (top label + counter) from content body. The only structural separator besides the 2px anchor weight.",
    "demo": "<div class=\"sd-motif-chrome\"><div class=\"sd-motif-chrome-row\"><span>01 / Section</span><span>05 / 24</span></div></div>",
    "css": ".sd-motif-chrome{padding:0 0 16px;border-bottom:1px solid color-mix(in srgb,var(--brand-primary) 18%, transparent)}.sd-motif-chrome-row{display:flex;justify-content:space-between;font-family:var(--f-mono-native);font-weight:500;font-size:clamp(11px,1vw,14px);line-height:1.5;letter-spacing:.06em;text-transform:uppercase;color:var(--brand-primary)}"
  }
]
```

The `motifs` JSON block above is the SOLE source of truth. build-design.mjs reads it to render §M cards in design.html. The Phase 3 plan agent and Phase 4b scene worker may cite motifs by `id` when annotating which gesture a scene relies on.

**Materials lexicon** (informational — these are the composition atoms behind the patterns):

- type-as-mass · em-dash-bullet · stat-rule-top · cover-meta-lockup · chrome-hairline · binary-surface-flip · opacity-tier-mute

## §I Page-level CSS (overrides design.html's neutral chrome — makes the doc itself read as Studio)

```css
/* ── Preset-native typography vars (loaded via preset-meta.chromeFonts.googleFontsHref).
 * These let the doc chrome render in Barlow + IBM Plex Mono regardless of
 * brand DNA. The §6 component preview and §M motifs grid also read these
 * via .preset-native-scope.
 *
 * Studio has no script face — the script slot points at Barlow because the
 * preset refuses a third face. The fallback chain ends in a heavy grotesque
 * (Archivo / Inter / system-ui) that still carries the "type-as-mass" register. */
:root {
  --f-disp-native:
    "Barlow", "Archivo", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --f-body-native:
    "Barlow", "Archivo", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --f-script-native:
    "Barlow", "Archivo", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --f-mono-native:
    "IBM Plex Mono", "JetBrains Mono", "Space Mono", "Menlo", ui-monospace, monospace;
}

/* .preset-native-scope: re-bind brand DNA font tokens to preset-native families.
 * Wraps §6 component previews and §M motif demos so
 * var(--font-*) resolves to Barlow / IBM Plex Mono regardless of brand DNA.
 * Paste-ready component source is untouched — Phase 4b still grep + paste the
 * original `var(--font-display)` tokens, which resolve to brand DNA at
 * scene-render time. */
.preset-native-scope {
  --font-display: var(--f-disp-native);
  --font-body: var(--f-body-native);
  --font-script: var(--f-script-native);
  --font-mono: var(--f-mono-native);
}

body {
  background: var(--canvas);
  color: var(--brand-primary);
  font-family: "Barlow", "Inter", sans-serif;
}
.title-card {
  background: var(--canvas);
  border-bottom: 2px solid var(--brand-primary);
  padding: 80px 0 64px;
}
.title-display {
  text-transform: uppercase;
  letter-spacing: -0.02em;
  font-weight: 900;
  color: var(--brand-primary);
}
.brand-name,
.style-name {
  color: var(--brand-primary);
  font-weight: 900;
  text-transform: uppercase;
}
.ds-section {
  border-top: 1px solid color-mix(in srgb, var(--brand-primary) 18%, transparent);
  padding: 64px 0;
}
h2 {
  text-transform: uppercase;
  letter-spacing: -0.01em;
  font-weight: 900;
  color: var(--brand-primary);
}
.eyebrow {
  font-family: "IBM Plex Mono", monospace;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: color-mix(in srgb, var(--brand-primary) 58%, transparent);
  font-weight: 500;
}
.type-card,
.voice-pair,
.comp-card {
  background: var(--canvas) !important;
  border: 1px solid color-mix(in srgb, var(--brand-primary) 18%, transparent) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
/* dna-swatch keeps inline brand-color background */
.dna-swatch {
  border: 1px solid color-mix(in srgb, var(--brand-primary) 18%, transparent) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
.comp-head {
  background: var(--canvas) !important;
  color: var(--brand-primary) !important;
  border-bottom: 2px solid var(--brand-primary) !important;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-family: "IBM Plex Mono", monospace;
}
.ds-code {
  background: var(--canvas) !important;
  border: 1px solid color-mix(in srgb, var(--brand-primary) 32%, transparent);
  border-radius: 0 !important;
  color: var(--brand-primary) !important;
}

/* ── §M Motifs grid: atomic gestures.
 * Studio is reductive — only 5 motifs. Cards may declare a surface
 * (dark / light) to demonstrate the gesture against its native bg. */
.ds-motif-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}
.ds-motif {
  grid-column: span 4;
  min-height: 280px;
  padding: 28px;
  border: 1px solid color-mix(in srgb, var(--brand-primary) 18%, transparent);
  border-radius: 0;
  background: var(--canvas);
  color: var(--brand-primary);
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
  background: var(--canvas);
  color: var(--brand-primary);
}
.ds-motif.ds-motif-surface-light {
  background: var(--brand-primary);
  color: var(--canvas);
  border-color: color-mix(in srgb, var(--canvas) 18%, transparent);
}
.ds-motif-h {
  margin: 0;
  font-family: var(--f-disp-native);
  font-weight: 900;
  font-size: clamp(22px, 2.2vw, 34px);
  line-height: 1;
  letter-spacing: -0.01em;
  text-transform: uppercase;
}
.ds-motif-desc {
  margin: 0;
  font-family: var(--f-body-native);
  font-weight: 500;
  font-size: 14px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-primary) 62%, transparent);
  max-width: 30ch;
}
.ds-motif.ds-motif-surface-light .ds-motif-desc {
  color: color-mix(in srgb, var(--canvas) 62%, transparent);
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
  color: color-mix(in srgb, var(--brand-primary) 45%, transparent);
}
.ds-motif.ds-motif-surface-light .ds-motif-id {
  color: color-mix(in srgb, var(--canvas) 45%, transparent);
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

/* ── §T Type-role atlas. Container = flat canvas card with hairline border.
 * Each .t-trole-* class encodes the role's family / size / weight / leading /
 * tracking / case. Family selectors use var(--font-*) tokens so the atlas
 * renders in BRAND DNA fonts (heygen → ABC Solar Display etc.); only the
 * recipe is preset-declared. Color decisions follow Studio's binary palette
 * — surface accent on canvas, opacity tiers for muting, never a third color. */
.ds-trole-box {
  display: flex;
  flex-direction: column;
  border: 1px solid color-mix(in srgb, var(--brand-primary) 18%, transparent);
  border-radius: 0;
  background: var(--canvas);
  overflow: hidden;
  margin-top: 24px;
}
.ds-trole-row {
  padding: 28px 32px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-primary) 12%, transparent);
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
 * Color uses Studio binary: brand-primary as accent on canvas, opacity tiers
 * for muting. */
.t-trole-display {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(96px, 12vw, 256px);
  line-height: 0.9;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-h1 {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(72px, 7.5vw, 160px);
  line-height: 0.92;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-stat-value {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(56px, 5.5vw, 120px);
  line-height: 0.9;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-h2 {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(48px, 4.8vw, 100px);
  line-height: 0.95;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-quote-text {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(40px, 3.8vw, 84px);
  line-height: 1.05;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--brand-primary);
  max-width: 22ch;
}
.t-trole-h3 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(28px, 2.8vw, 60px);
  line-height: 1.1;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-lead {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: clamp(20px, 1.6vw, 36px);
  line-height: 1.45;
  color: var(--brand-primary);
  max-width: 44ch;
  margin: 0;
}
.t-trole-body {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(14px, 1.15vw, 24px);
  line-height: 1.6;
  color: color-mix(in srgb, var(--brand-primary) 62%, transparent);
  max-width: 60ch;
  margin: 0;
}
.t-trole-caption {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(12px, 0.85vw, 18px);
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
  max-width: 60ch;
  margin: 0;
}
.t-trole-label {
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: clamp(11px, 0.72vw, 15px);
  line-height: 1.3;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-primary) 58%, transparent);
}
.t-trole-cover-meta {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  gap: 24px;
  border-top: 1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent);
  padding-top: 16px;
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: clamp(11px, 0.72vw, 15px);
  line-height: 1.5;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.t-trole-cover-meta span:nth-child(2) {
  text-align: center;
}
.t-trole-cover-meta span:nth-child(3) {
  text-align: right;
}
.t-trole-em-dash-bullet {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.t-trole-em-dash-bullet li {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(14px, 1.15vw, 24px);
  line-height: 1.6;
  color: var(--brand-primary);
  padding-left: 1.5em;
  position: relative;
}
.t-trole-em-dash-bullet li::before {
  content: "\2014";
  position: absolute;
  left: 0;
  color: var(--brand-primary);
  font-weight: 900;
}
```
