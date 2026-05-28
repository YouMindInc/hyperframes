```preset-meta
{
  "name": "block-frame",
  "label": "Block Frame",
  "fingerprint": {
    "shadow": "hard-offset-black",
    "border": "4px-solid-ink",
    "palette": "saturated-pastel-cycle",
    "motion": "tilt-and-snap",
    "decoration": "tilted-puncture"
  },
  "match_signals": [
    { "kind": "shadow_zero_blur", "weight": 0.3 },
    { "kind": "thick_solid_border", "weight": 0.3 },
    { "kind": "high_sat_accent", "weight": 0.15 },
    { "kind": "minimal_decoration", "weight": 0.05 }
  ],
  "best_for": ["indie SaaS launches", "agency credentials", "creative reviews", "brand redesigns", "design-led product talks"],
  "avoid_for": ["regulated disclosures", "formal legal briefs", "institutional restraint", "enterprise compliance"],
  "chromeFonts": {
    "googleFontsHref": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap",
    "display": "Inter",
    "body": "Inter",
    "script": "Inter",
    "mono": "Space Grotesk"
  }
}
```

> `chromeFonts` makes the design.html doc chrome (title-card, section heads, h2/h3, lede paragraphs, eyebrows) render in the preset's NATIVE typography — Inter + Space Grotesk — instead of the brand DNA fonts. Block Frame is a two-face system: heavy uppercase Inter does display + body, wide-tracked Space Grotesk carries chrome / mono / labels. The `script` slot also points at Inter because Block Frame refuses a third face. The brand fonts still apply to §6 component code (paste-ready for Phase 4b). §M motifs grid and §T type-role atlas use `.preset-native-scope` so `var(--font-display/body/script/mono)` re-resolves to these native families for the live preview.

## §A Director's intent

Block Frame is maximalist neobrutalism: every region wears a 4px solid ink
border, every elevated card carries an 8px hard offset shadow (zero blur,
solid ink), every corner is square, and the canvas cycles through five
saturated pastels — pink, blue, green, yellow, cream — plus off-white and
ink. Display is heavy uppercase Inter with negative tracking; chrome is
wide-tracked Space Grotesk in caps. Decorative tilts (±2° to ±12°),
star-bursts, stripe blocks, and dot grids puncture the grid intentionally.
The system reads as confident, joyful, slightly chaotic — zine layout meets
toy packaging. Density is the rule, not the exception: empty surfaces feel
timid. Best for: indie SaaS launch, agency credentials, creative reviews,
brand redesigns. Avoid for: regulated disclosures, formal legal briefs.

Brand-aware color contract: `--brand-primary` is the dominant pastel
ground, `--brand-secondary` is the colored-shadow accent (replaces the
template's signature yellow shadow on the close-frame), `--brand-accent`
is the CTA fill. Class prefix is `bf-` (block-frame initials).

## §B Decoration tokens

```css
/* Border ladder — 4px primary, 3px secondary, 2px atomic chrome */
--bf-border-bold: 4px solid var(--ink);
--bf-border-mid: 3px solid var(--ink);
--bf-border-thin: 2px solid var(--ink);

/* Hard offset shadow stack — solid ink, zero blur, bottom-right */
--bf-shadow: 8px 8px 0 var(--ink);
--bf-shadow-sm: 4px 4px 0 var(--ink);
--bf-shadow-hover: 6px 6px 0 var(--ink);

/* Inverted close-surface depth — only colored shadow in the system,
   aliased to brand-secondary so it follows the site palette instead
   of the template's locked yellow. */
--bf-shadow-close: 12px 12px 0 var(--brand-secondary);
--bf-shadow-close-btn: 6px 6px 0 var(--canvas);

/* Tilt vocabulary — stat cards alternate small, decorations tilt loud */
--bf-tilt-sm-l: -2deg;
--bf-tilt-sm-r: 2deg;
--bf-tilt-md-l: -8deg;
--bf-tilt-md-r: 8deg;
--bf-tilt-loud: 12deg;

/* Spacing — template's px scale, kept px for structural fidelity */
--bf-pad-card: 36px;
--bf-pad-card-sm: 28px;
--bf-pad-card-xs: 22px;
--bf-pad-card-lg: 60px;
--bf-gap-lg: 48px;
--bf-gap-md: 32px;
--bf-gap-sm: 24px;
--bf-gap-xs: 16px;

/* Decorative dot-grid pattern unit */
--bf-dot-size: 24px;
--bf-dot-radius: 1.2px;
```

## §D Font pairing fallback

- **display**: `'Inter'` · `'Archivo Black'` · `'Space Grotesk'` wght 900
- **body**: `'Inter'` · `'IBM Plex Sans'` wght 500
- **mono**: `'Space Grotesk'` · `'JetBrains Mono'` · `'IBM Plex Mono'` wght 600

## §T Type-role atlas (Phase 4b reads this to size text correctly)

Each entry is a **named type role** with concrete render parameters at 1920×1080 — family token, px range, weight, leading, tracking, case, and any color/shadow/rotation decoration. Phase 4b scene workers may cite roles by `id` ("use a `stat-number` here"); the brand DNA fonts plug in automatically via `var(--font-*)` tokens. This is the Block Frame typography scale, ported as machine-readable JSON.

The atlas is the **sole authoring source** for non-component text. If a scene needs a `quote-text` block that isn't covered by §6 components, the worker reads role `quote-text` here and writes inline CSS from these values. Do NOT invent ad-hoc sizes — Block Frame's identity depends on the heavy-uppercase + negative-tracking + sentence-body + wide-tracked-label ladder.

```type-roles
[
  {
    "id": "heading-xl",
    "family": "display",
    "purpose": "hero / cover headline — uppercase Inter 900 with negative tracking",
    "px_min": 48, "px_max": 96, "weight": 900, "leading": "0.95", "tracking": "-0.03em", "case": "upper",
    "sample_html": "<div class=\"t-trole-heading-xl\">Neo-Brutalism Style</div>"
  },
  {
    "id": "heading-lg",
    "family": "display",
    "purpose": "primary section headline (Inter 800, uppercase, -0.02em)",
    "px_min": 32, "px_max": 64, "weight": 800, "leading": "1", "tracking": "-0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-heading-lg\">What we deliver</div>"
  },
  {
    "id": "heading-md",
    "family": "display",
    "purpose": "region or chart title (Inter 700, sentence-case allowed)",
    "px_min": 24, "px_max": 40, "weight": 700, "leading": "1.1", "tracking": "-0.01em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-heading-md\">Quarterly growth metrics</div>"
  },
  {
    "id": "close-title",
    "family": "display",
    "purpose": "closing-statement title on the inverted ink surface (cream / canvas text)",
    "px_min": 40, "px_max": 80, "weight": 900, "leading": "0.95", "tracking": "-0.03em", "case": "upper",
    "sample_html": "<div class=\"t-trole-close-title\">Let's build something bold</div>"
  },
  {
    "id": "quote-text",
    "family": "display",
    "purpose": "uppercase pull-quote body (Inter 900, framed inside a bordered quote-frame)",
    "px_min": 28, "px_max": 52, "weight": 900, "leading": "1.15", "tracking": "-0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-quote-text\">Design is how it works, how it feels, how it lasts.</div>"
  },
  {
    "id": "stat-number",
    "family": "display",
    "purpose": "hero / card stat numeral (Inter 900, line-height 1)",
    "px_min": 36, "px_max": 64, "weight": 900, "leading": "1", "tracking": "0", "case": "upper",
    "sample_html": "<div class=\"t-trole-stat-number\">98%</div>"
  },
  {
    "id": "card-title",
    "family": "display",
    "purpose": "feature / intro / team card title — Inter 700 uppercase",
    "px_min": 20, "px_max": 22, "weight": 700, "leading": "1.2", "tracking": "0", "case": "upper",
    "sample_html": "<div class=\"t-trole-card-title\">Modular layouts</div>"
  },
  {
    "id": "step-num",
    "family": "display",
    "purpose": "timeline-step numeral — Inter 900 at 0.6 opacity (mandatory reduction)",
    "px_min": 48, "px_max": 48, "weight": 900, "leading": "1", "tracking": "0", "case": "upper",
    "sample_html": "<div class=\"t-trole-step-num\">01</div>"
  },
  {
    "id": "body",
    "family": "body",
    "purpose": "standard paragraph body — Inter 500, sentence case, line-height 1.6",
    "px_min": 16, "px_max": 20, "weight": 500, "leading": "1.6", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body\">Body holds at 16-20px clamp, sentence case, weight 500. Body in uppercase or with tight line-height reads as broken.</p>"
  },
  {
    "id": "body-card",
    "family": "body",
    "purpose": "compact card body (intro / feature / stat / team) — Inter 500 / 15px",
    "px_min": 15, "px_max": 15, "weight": 500, "leading": "1.6", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body-card\">Card body sits at 15px weight 500 with line-height 1.6 — calmer than full-bleed body, never tighter.</p>"
  },
  {
    "id": "label-pill",
    "family": "mono",
    "purpose": "universal eyebrow inside a bordered + shadowed pastel pill — Space Grotesk 600, 13px, 0.08em tracked, uppercase",
    "px_min": 13, "px_max": 13, "weight": 600, "leading": "1", "tracking": "0.08em", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-label-pill\">Overview</span></div>"
  },
  {
    "id": "mono-tag",
    "family": "mono",
    "purpose": "mono tag / badge — Space Grotesk 600, 14px, 0.05em tracked, uppercase",
    "px_min": 14, "px_max": 14, "weight": 600, "leading": "1", "tracking": "0.05em", "case": "upper",
    "sample_html": "<div class=\"t-trole-mono-tag\">12+ years</div>"
  },
  {
    "id": "subtitle-mono",
    "family": "mono",
    "purpose": "hero / close subtitle — Space Grotesk 500, 18px sentence case",
    "px_min": 18, "px_max": 18, "weight": 500, "leading": "1.5", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-subtitle-mono\">A bold, high-contrast template designed for maximum visual impact.</p>"
  },
  {
    "id": "counter",
    "family": "mono",
    "purpose": "persistent slide counter — Space Grotesk 700, 14px, 0.1em tracked, uppercase (NN / NN)",
    "px_min": 14, "px_max": 14, "weight": 700, "leading": "1", "tracking": "0.1em", "case": "upper",
    "sample_html": "<div class=\"t-trole-counter\">01 / 10</div>"
  }
]
```

The atlas omits `nav-btn` / `slide-counter` chrome shells (declared in §B / template chrome) and the decorative `star-burst` / `stripe-block` / `dot-grid` patterns (they're §M atomic motifs, not text roles).

## §E Motion (GSAP consts — REPLACES site ease)

```js
// RULE: motion is snap-and-hit, never slow ease-in-out for primary entrances.
// RULE: cards "punch in" — translate from -8/-8 offset with shadow growing
//       from 0 to var(--bf-shadow). Mirrors the hover lift-up signature.
// RULE: tilts are baked at rest; do NOT tween rotation during entry.
//       Tilt-then-pop reads as wobble; tilt-at-rest reads as deliberate.
// RULE: emphasis on chrome (label-pills, buttons) uses back.out(1.6) to
//       echo the hard-shadow "stamp" feel.
// RULE: never blur shadows during motion — toggle box-shadow values, do
//       not interpolate filter() or use shadow-blur tweens.

const EASE = {
  entry: "expo.out", // cards hit and stick — template uses 0.15s ease but punchier on video scale
  emphasis: "back.out(1.6)", // chrome pops (pills, buttons, stat cards) — echoes the brutalist stamp
  exit: "power2.in", // sharp exits — never linger
  drift: "sine.inOut", // ambient (dot-grid fade-in, tilt micro-sway) only
};

const DUR = {
  snap: 0.16, // chrome hover, label-pill in, button settle — mirrors template's 0.15s
  med: 0.42, // card entry, headline reveal
  slow: 0.9, // hero entry, close-frame reveal — the loudest moments
};
```

### §E.5 Motion choreography

- **Allowed primitives:** snap-translate (-8/-8 → 0/0 with shadow grow),
  punch-scale (0.92 → 1.0 with back.out), stagger-reveal (children appear
  at 0.06s offset), shadow-grow (0/0 → 8/8 in DUR.med), tilt-rest (tilt
  applied at rest, not tweened).
- **Forbidden gestures:** rotation tweens, blur interpolation, ease-in-out
  on primary motion (only on `drift`), cross-fade between cards (use
  punch-translate or hard cut).
- **Transition defaults:** hard cut between scenes is the spiritual default
  (the template has no slide transitions). If a transition is needed,
  punch-translate the incoming hero element with DUR.med + EASE.emphasis.
- **Type-in-motion:** display headlines reveal as a single unit (no per-
  character split). Sub-headline reveals at +0.12s with `power2.out` +
  DUR.snap. Label-pills always emphasis-pop, never linear-fade.
- **Stagger budget:** ≤6 elements in a single stagger; beyond that, group
  visually (timeline-step row, stat-grid) and animate the group as one.

## §G Voice transform recipe

1. Strip articles and connectives (the / a / of / and / with / to).
2. Break into 2-4 word noun-verb-noun fragments or single dominant nouns.
3. UPPERCASE all on-screen text that lands in display, chip, or button
   slots — sentence body stays sentence case.
4. Join fragments with `.` + linebreak for stacked impact, or em-dash
   `—` for a single beat of emphasis.
5. End headlines on a noun, not a verb — the brutalist stamp lands on the
   thing, not the action.
6. Brand name appears as the final clause, punctuated standalone.

**Example:**

- IN: `Higgsfield is the AI platform that helps creators generate stunning visuals in seconds`
- OUT: `CREATORS. GENERATE. STUNNING VISUALS — IN SECONDS. HIGGSFIELD.`

## §H Scene composition hints

- **Surface alternation:** cycle scene grounds through off-white →
  `--brand-primary` pastel → off-white → `--brand-accent` pastel → ink
  close. Staying on one ground for >2 consecutive scenes flattens the
  system. The cycle is the rhythm.
- **Brand-color role contract:** `--brand-primary` is the dominant ground
  pastel and the icon-square fill; `--brand-secondary` is the colored
  shadow on the close-frame and the stat-deco-dot fill; `--brand-accent`
  is the CTA (button) and list-number / feature-deco fill.
- **Focal element sizing:** hero headline reaches 6-8vw at minimum; never
  shrink display Inter below 4vw or its character collapses. Stat
  numerals at 4-6vw with line-height 1.
- **Card-on-ground structure:** every scene's primary content sits inside
  a bordered card (4px ink, 8px ink shadow) on a pastel ground. Secondary
  cells inside the card use 3px border + 4px shadow.
- **Required decorative disruption:** every scene carries at least one
  decorative element — a tilted rectangle, a star-burst, a stripe-block,
  a dot-grid corner, or a corner-bracket frame. Empty surface reads as
  broken.
- **Tilt rules:** stat cards alternate `var(--bf-tilt-sm-l)` /
  `var(--bf-tilt-sm-r)`. Decorative rectangles and stars use
  `var(--bf-tilt-md-l/r)` to `var(--bf-tilt-loud)`. Never tilt primary
  cards more than ±2°; never leave decoration un-tilted.
- **Forbidden shapes:** no rounded corners on cards / buttons / pills /
  icon-squares / avatars. The only circle in the system is the 12px
  stat-deco dot.
- **Border discipline:** borders are always solid ink (or solid canvas on
  the inverted close-frame). No colored borders. No 1px or 5px+ borders;
  the ladder is 2 / 3 / 4 only.
- **Shadow discipline:** all shadows zero-blur, solid color, offset
  bottom-right. The only colored shadow is `--bf-shadow-close` on the
  closing surface; everywhere else, shadow is solid ink.
- **Close-frame:** final scene uses ink ground, canvas-color text,
  canvas-bordered close-frame, and `--bf-shadow-close` (12px offset in
  brand-secondary). This is the loudest depth statement in the deck.

## §M Atomic motifs (gestures the plan agent can reference)

Each motif is a **single reusable gesture** that lives inside a larger pattern. Patterns compose motifs; motifs do not compose anything. The plan agent treats motifs as the smallest cite-able vocabulary — a scene description can say "uses motif:offset-shadow on the hero card" without specifying which pattern the card sits in.

```motifs
[
  {
    "id": "offset-shadow",
    "label": "Hard offset shadow",
    "role": "card-depth",
    "surface_safe": ["pastel", "canvas"],
    "description": "Solid-ink 8px offset shadow (zero blur, bottom-right) behind a 4px ink-bordered card. The signature depth move — never blurred, never colored on default surfaces. Border weight (4px) and shadow size (8px) are tightly coupled; 3px borders pair with 4px shadows.",
    "wide": true,
    "demo": "<div class=\"bf-motif-shadow\"><div class=\"bf-motif-shadow-card\">Block Frame card</div></div>",
    "css": ".bf-motif-shadow{display:inline-block;padding:0 8px 8px 0}.bf-motif-shadow-card{background:var(--canvas,#fffdf5);border:4px solid var(--ink);box-shadow:8px 8px 0 var(--ink);padding:28px 36px;font-family:var(--f-disp-native);font-weight:800;font-size:clamp(20px,2vw,28px);line-height:1;letter-spacing:-.02em;text-transform:uppercase;color:var(--ink)}"
  },
  {
    "id": "label-pill",
    "label": "Label pill eyebrow",
    "role": "section-eyebrow",
    "surface_safe": ["pastel", "canvas", "ink"],
    "description": "Universal eyebrow: 3px ink border + 4px ink offset shadow + pastel fill + Space Grotesk 13px weight 600 uppercase with 0.08em tracking. Without all three properties (border, shadow, tracked uppercase) it is not a pill — it is a stray text element.",
    "demo": "<span class=\"bf-motif-pill\">Overview</span>",
    "css": ".bf-motif-pill{display:inline-block;background:var(--brand-primary);color:var(--ink);border:3px solid var(--ink);box-shadow:4px 4px 0 var(--ink);padding:6px 16px;font-family:var(--f-mono-native);font-weight:600;font-size:13px;line-height:1;letter-spacing:.08em;text-transform:uppercase}"
  },
  {
    "id": "tilted-decoration",
    "label": "Tilted decoration",
    "role": "grid-disruption",
    "surface_safe": ["pastel", "canvas"],
    "description": "Pastel rectangle / square with 3-4px ink border, rotated ±8° to ±12°. Pinned absolutely to puncture a card or surface edge. Never centered, never axis-aligned — the intentional misalignment is the system's playful signature.",
    "demo": "<div class=\"bf-motif-tilt-wrap\"><div class=\"bf-motif-tilt\"></div></div>",
    "css": ".bf-motif-tilt-wrap{position:relative;width:140px;height:120px;display:flex;align-items:center;justify-content:center}.bf-motif-tilt{width:80px;height:80px;background:var(--brand-primary);border:4px solid var(--ink);box-shadow:4px 4px 0 var(--ink);transform:rotate(12deg)}"
  },
  {
    "id": "star-burst",
    "label": "Star burst",
    "role": "attention-mark",
    "surface_safe": ["pastel", "canvas", "ink"],
    "description": "10-point star clipped via CSS clip-path with a 3px ink border (or 3px canvas border on the ink close-surface), pastel fill. Decorative attention-grabber pinned to corners of close-frames and feature cards. The only non-rectangular decoration in the system.",
    "demo": "<div class=\"bf-motif-star\"></div>",
    "css": ".bf-motif-star{width:64px;height:64px;background:var(--brand-primary);border:3px solid var(--ink);clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)}"
  },
  {
    "id": "stripe-block",
    "label": "Diagonal stripe block",
    "role": "poster-accent",
    "surface_safe": ["pastel", "canvas"],
    "description": "Black-and-color diagonal repeating stripe (4px on, 8px off) framed with a 3px ink border. Reserved for poster-class surfaces and quote scenes — never inside dense card grids where the stripe pattern competes with body type.",
    "demo": "<div class=\"bf-motif-stripe\"></div>",
    "css": ".bf-motif-stripe{width:96px;height:96px;background:repeating-linear-gradient(45deg,var(--ink),var(--ink) 4px,var(--brand-primary) 4px,var(--brand-primary) 12px);border:3px solid var(--ink)}"
  },
  {
    "id": "dot-grid",
    "label": "Dot-grid overlay",
    "role": "texture-corner",
    "surface_safe": ["pastel", "canvas", "ink"],
    "description": "1.2px radial-gradient dot pattern at 24×24 spacing, 30-40% opacity. Used as a faint decorative overlay in corners of slides and as a soft texture inside dense scenes. On the ink close-surface, dots flip to canvas color.",
    "wide": true,
    "demo": "<div class=\"bf-motif-dots\"></div>",
    "css": ".bf-motif-dots{width:100%;max-width:240px;height:96px;background-image:radial-gradient(circle,var(--ink) 1.2px,transparent 1.2px);background-size:24px 24px;opacity:.4}"
  },
  {
    "id": "list-number",
    "label": "Numbered square bullet",
    "role": "list-marker",
    "surface_safe": ["pastel", "canvas"],
    "description": "36×36 brand-accent square with 3px ink border holding a Space Grotesk 14px weight 700 numeral. The system's only numeric bullet — never dots, never dashes. Pinned flush-left at the start of every list item.",
    "demo": "<ul class=\"bf-motif-list\"><li><span>01</span>Discovery and stakeholder alignment.</li><li><span>02</span>Iterative wireframing with rapid feedback.</li><li><span>03</span>Production handoff with style guide.</li></ul>",
    "css": ".bf-motif-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:14px}.bf-motif-list li{display:flex;align-items:flex-start;gap:14px;font-family:var(--f-body-native);font-weight:500;font-size:15px;line-height:1.5;color:var(--ink)}.bf-motif-list li span{flex-shrink:0;width:36px;height:36px;background:var(--brand-accent,var(--brand-primary));border:3px solid var(--ink);display:flex;align-items:center;justify-content:center;font-family:var(--f-mono-native);font-weight:700;font-size:14px}"
  }
]
```

The `motifs` JSON block above is the SOLE source of truth. build-design.mjs reads it to render §M cards in design.html. The Phase 3 plan agent and Phase 4b scene worker may cite motifs by `id` when annotating which gesture a scene relies on.

**Materials lexicon** (informational — these are the composition atoms behind the patterns):

- offset-shadow · label-pill · tilted-decoration · star-burst · stripe-block · dot-grid · list-number · corner-bracket · feature-deco-notch · stat-deco-dot

## §I Page-level CSS

```css
/* ── Preset-native typography vars (loaded via preset-meta.chromeFonts.googleFontsHref).
 * These let the doc chrome render in Inter + Space Grotesk regardless of
 * brand DNA. The §6 component preview, §M motifs grid, and §T type-role atlas
 * also read these via .preset-native-scope.
 *
 * Block Frame has no script face — the script slot points at Inter because the
 * preset refuses a third face. The fallback chain ends in a heavy grotesque
 * (Archivo Black / system-ui) that still carries the "neobrutalist mass"
 * register. Mono slot is Space Grotesk (treated as quasi-mono via wide
 * tracking + uppercase) with JetBrains Mono / IBM Plex Mono as deeper falls. */
:root {
  --f-disp-native:
    "Inter", "Archivo Black", "Helvetica Neue", -apple-system, BlinkMacSystemFont, system-ui,
    sans-serif;
  --f-body-native:
    "Inter", "IBM Plex Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --f-script-native:
    "Inter", "Archivo Black", "Helvetica Neue", -apple-system, BlinkMacSystemFont, system-ui,
    sans-serif;
  --f-mono-native:
    "Space Grotesk", "JetBrains Mono", "IBM Plex Mono", "Menlo", ui-monospace, monospace;
}

/* .preset-native-scope: re-bind brand DNA font tokens to preset-native families.
 * Wraps §6 component previews, §M motif demos, and §T type-role atlas so
 * var(--font-*) resolves to Inter / Space Grotesk regardless of brand DNA.
 * Paste-ready component source is untouched — Phase 4b still grep + paste the
 * original `var(--font-display)` tokens, which resolve to brand DNA at
 * scene-render time. */
.preset-native-scope {
  --font-display: var(--f-disp-native);
  --font-body: var(--f-body-native);
  --font-script: var(--f-script-native);
  --font-mono: var(--f-mono-native);
}

/* design.html chrome — borrows the preset's visual register */
body {
  background: var(--canvas, #fffdf5);
  font-family: "Inter", sans-serif;
  color: var(--ink, #000);
}

h1,
h2,
h3 {
  font-family: "Inter", sans-serif;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.02em;
}

h2 {
  border-bottom: var(--bf-border-bold, 4px solid #000);
  padding-bottom: 0.4em;
  margin-top: 1.4em;
}

code,
pre {
  font-family: "Space Grotesk", monospace;
  background: color-mix(in srgb, var(--brand-primary, #fe90e8) 12%, transparent);
  border: var(--bf-border-mid, 3px solid #000);
  padding: 0.1em 0.4em;
}

pre {
  padding: 1em;
  box-shadow: var(--bf-shadow-sm, 4px 4px 0 #000);
}

/* ── §M Motifs grid: atomic gestures.
 * Mirrors the template's bordered + shadowed card grid — a 12-col grid of
 * small cards each teaching ONE reusable gesture. Cards may declare a surface
 * (pastel / canvas / ink) to demonstrate the gesture against its native bg. */
.ds-motif-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}
.ds-motif {
  grid-column: span 4;
  min-height: 280px;
  padding: 28px;
  border: var(--bf-border-bold, 4px solid var(--ink));
  border-radius: 0;
  background: var(--canvas, #fffdf5);
  color: var(--ink);
  box-shadow: var(--bf-shadow, 8px 8px 0 var(--ink));
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
.ds-motif.ds-motif-surface-pastel {
  background: var(--brand-primary);
  color: var(--ink);
}
.ds-motif.ds-motif-surface-canvas {
  background: var(--canvas, #fffdf5);
  color: var(--ink);
}
.ds-motif.ds-motif-surface-ink {
  background: var(--ink);
  color: var(--canvas, #fffdf5);
  border-color: var(--canvas, #fffdf5);
  box-shadow: 12px 12px 0 var(--brand-secondary, var(--brand-primary));
}
.ds-motif-h {
  margin: 0;
  font-family: var(--f-disp-native);
  font-weight: 900;
  font-size: clamp(22px, 2.2vw, 32px);
  line-height: 1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: inherit;
}
.ds-motif-desc {
  margin: 0;
  font-family: var(--f-body-native);
  font-weight: 500;
  font-size: 14px;
  line-height: 1.55;
  color: color-mix(in srgb, currentColor 75%, transparent);
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
  top: 12px;
  right: 14px;
  font-family: var(--f-mono-native);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, currentColor 55%, transparent);
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

/* ── §T Type-role atlas. Container = bordered + shadowed canvas card.
 * Each .t-trole-* class encodes the role's family / size / weight / leading /
 * tracking / case. Family selectors use var(--font-*) tokens so the atlas
 * renders in BRAND DNA fonts; only the recipe is preset-declared. */
.ds-trole-box {
  display: flex;
  flex-direction: column;
  border: var(--bf-border-bold, 4px solid var(--ink));
  border-radius: 0;
  background: var(--canvas, #fffdf5);
  box-shadow: var(--bf-shadow, 8px 8px 0 var(--ink));
  overflow: hidden;
  margin-top: 24px;
}
.ds-trole-row {
  padding: 28px 32px;
  border-bottom: var(--bf-border-thin, 2px solid var(--ink));
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
 * Decoration (color, border, shadow, tracking, case, tilt) is preset-native
 * and stays declared with Block Frame tokens (--ink, --brand-primary,
 * --brand-accent, --bf-shadow-sm). */
.t-trole-heading-xl {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(48px, 6vw, 96px);
  line-height: 0.95;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-heading-lg {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(32px, 4vw, 64px);
  line-height: 1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-heading-md {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(24px, 2.5vw, 40px);
  line-height: 1.1;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.t-trole-close-title {
  display: inline-block;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(40px, 5vw, 80px);
  line-height: 0.95;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: var(--canvas, #fffdf5);
  background: var(--ink);
  border: 4px solid var(--canvas, #fffdf5);
  box-shadow: 12px 12px 0 var(--brand-secondary, var(--brand-primary));
  padding: 24px 32px;
  max-width: 22ch;
}
.t-trole-quote-text {
  display: inline-block;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(28px, 3.5vw, 52px);
  line-height: 1.15;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--ink);
  background: var(--canvas, #fffdf5);
  border: 4px solid var(--ink);
  box-shadow: 8px 8px 0 var(--ink);
  padding: 24px 32px;
  max-width: 28ch;
}
.t-trole-stat-number {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(36px, 4vw, 64px);
  line-height: 1;
  color: var(--ink);
}
.t-trole-card-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 22px;
  line-height: 1.2;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-step-num {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 48px;
  line-height: 1;
  color: var(--ink);
  opacity: 0.6;
}
.t-trole-body {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: clamp(16px, 1.2vw, 20px);
  line-height: 1.6;
  color: var(--ink);
  max-width: 60ch;
  margin: 0;
}
.t-trole-body-card {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 15px;
  line-height: 1.6;
  color: var(--ink);
  max-width: 48ch;
  margin: 0;
}
.t-trole-label-pill {
  display: inline-block;
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 13px;
  line-height: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink);
  background: var(--brand-primary);
  border: 3px solid var(--ink);
  box-shadow: 4px 4px 0 var(--ink);
  padding: 6px 16px;
}
.t-trole-mono-tag {
  display: inline-block;
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 14px;
  line-height: 1;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ink);
  background: var(--brand-accent, var(--brand-primary));
  border: 3px solid var(--ink);
  padding: 10px 20px;
}
.t-trole-subtitle-mono {
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: 18px;
  line-height: 1.5;
  color: var(--ink);
  max-width: 44ch;
  margin: 0;
}
.t-trole-counter {
  display: inline-block;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 14px;
  line-height: 1;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink);
  background: var(--canvas, #fffdf5);
  border: 3px solid var(--ink);
  box-shadow: 4px 4px 0 var(--ink);
  padding: 10px 18px;
}
```

</content>
</invoke>
