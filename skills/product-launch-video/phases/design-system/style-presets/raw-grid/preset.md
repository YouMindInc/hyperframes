```preset-meta
{
  "name": "raw-grid",
  "label": "Raw Grid",
  "fingerprint": {
    "shadow": "hard-offset-zero-blur",
    "border": "hairline-3px-mono",
    "motion": "direct-no-overshoot",
    "density": "medium",
    "contrast": "high-with-pastel-warmth",
    "type": "system-sans-uppercase",
    "palette-mode": "open"
  },
  "match_signals": [
    { "kind": "shadow_zero_blur",    "weight": 0.30 },
    { "kind": "thick_solid_border",  "weight": 0.20 },
    { "kind": "low_saturation",      "weight": 0.20 },
    { "kind": "minimal_decoration",  "weight": 0.10 }
  ],
  "best_for": ["startup pitches", "accelerator demos", "indie launches", "brand decks", "creator portfolios", "scrappy-confident registers"],
  "avoid_for": ["ultra-polished enterprise", "very dark brand palettes (vs white canvas default)", "luxury / premium"],
  "chromeFonts": {
    "googleFontsHref": "https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap",
    "display": "Inter",
    "body": "Inter",
    "script": "Inter",
    "mono": "JetBrains Mono"
  }
}
```

> `chromeFonts` makes the design.html doc chrome (title-card, section heads, h2/h3, lede paragraphs, eyebrows) render in preset-native typography. Raw Grid's primary aesthetic argument is "this is the user's actual system font" — so the runtime stack still leads with `system-ui` / `Segoe UI` / `-apple-system`. Inter loads as the **web fallback** anchor: when system-ui can't be measured reliably (off-host previews, headless capture, design.html shared outside the user's OS), Inter at weight 900 is the closest grotesque that preserves the brutalist density. The brand fonts still apply to §6 component code (paste-ready for Phase 4b). §M motifs grid and §T type-role atlas use `.preset-native-scope` so var(--font-display/body/mono) re-resolves to system-ui-first for the live preview. Raw Grid has no script face — the script slot points at Inter because the system refuses a third face.

## §A Director's intent

Border-as-layout neobrutalism. 3px solid ink lines wall off every region with **zero gaps** — borders meet edge-to-edge and the line itself is the grid system. Cards, tables, stats, bars all share the same hairline frame; the rhythm is "rectangle next to rectangle, separated by a black hair."

Display type is **system sans (Segoe UI / system-ui)** at weight 900 uppercase with negative tracking. Body is the same family at weight 500 sentence case. The weight ladder (900 / 800 / 700 / 500) is the only typographic tool — no italics, no underlines, no decorative faces. The class prefix is `rg-` (raw-grid initialism, 3 chars).

Depth is **hard offset shadow** — `6px 6px 0 var(--ink)` or `4px 4px 0 var(--ink)`, solid ink, zero blur, fixed bottom-right offset. Soft shadows do not exist here.

**Brand DNA drives accent surfaces, preset drives structure.** Two muted pastel accents (`--brand-primary` / `--brand-secondary`) are region fills only — never text. `--ink` (black) carries all headlines, body text, borders, label fills, and shadows. `--canvas` (white) is the default background. Text never inverts over accent surfaces; only over the ink-black surface does white text appear.

**Signature moves**: black-pill `chip` labels with white uppercase text, `→`-arrow prefix on CTAs and interactive rows, oversized decorative numerals at 0.15-0.35 opacity sitting behind card content as wallpaper, bordered horizontal bar meters with pink/sage/black fills, zebra-striped comparison tables with ink-black headers.

**Best for** sites with muted or pastel palettes that want to read as scrappy-confident — startup pitches, accelerator demos, indie launches, brand decks, creator portfolios. The aesthetic survives saturated brand DNA but loses some of its pastel warmth; very dark brand palettes will struggle against the white canvas default.

**Atmosphere is the absence of atmosphere.** No scanlines, no grain, no gradients, no glows. The borders carry the whole visual identity. Adding ambient decoration reads as broken.

## §B Decoration tokens (merge into design.html `:root`)

Raw Grid declares **structural** tokens here (hairline border, hard offset shadows, fixed gap scale, decorative numeral opacity). Color is sourced from site brand DNA — `--brand-primary` / `--brand-secondary` flow through component CSS as accent surface fills; `--ink` and `--canvas` carry structure and ground.

No literal hex declarations are required — the muted-pastel character is delegated to brand DNA. If brand DNA arrives saturated, the system still reads as Raw Grid because the borders, shadows, and uppercase weight-900 type carry the identity regardless of accent hue.

```css
/* Hairline border — the entire layout system is 3px solid ink */
--rg-border: 3px solid var(--ink);

/* Hard offset shadows — solid ink, zero blur, fixed bottom-right */
--rg-shadow: 6px 6px 0 var(--ink);
--rg-shadow-sm: 4px 4px 0 var(--ink);

/* Fixed gap scale — borders separate regions, gaps live inside cells only */
--rg-pad-lg: clamp(32px, 4vw, 64px);
--rg-pad-md: clamp(20px, 2.5vw, 40px);
--rg-pad-sm: clamp(12px, 1.5vw, 20px);
--rg-gap-lg: clamp(24px, 3vw, 48px);
--rg-gap-md: clamp(16px, 2vw, 32px);
--rg-gap-sm: clamp(8px, 1vw, 16px);

/* Decorative-numeral wallpaper opacity range */
--rg-numeral-opacity: 0.2;
--rg-quote-opacity: 0.15;
--rg-ordinal-opacity: 0.35;

/* Decorative rule-stub dimensions */
--rg-rule-len: 60px;
--rg-rule-thick: 4px;

/* Gray tertiary fill — derived from canvas, not from brand DNA */
--rg-gray: color-mix(in srgb, var(--ink) 4%, var(--canvas));
```

## §D Font pairing fallback (if brand fonts not on Google Fonts)

Raw Grid's aesthetic argument is "this is the user's actual system font." If brand DNA ships a Google Font, keep it — preset only enforces the weight ladder (900 / 800 / 700 / 500) and the uppercase rule. If brand fonts fail, fall back to the system sans stack below; do NOT load a display face just to fill the slot.

- **display**: `'system-ui'` · `'Segoe UI'` · `'Inter'` wght 900
- **body**: `'system-ui'` · `'Segoe UI'` · `'Inter'` wght 500
- **mono**: `'ui-monospace'` · `'SF Mono'` · `'JetBrains Mono'` wght 700

## §T Type-role atlas (Phase 4b reads this to size text correctly)

Each entry is a **named type role** with concrete render parameters at 1920×1080 — family token, px range, weight, leading, tracking, case, and any color/decoration. Phase 4b scene workers may cite roles by `id` ("use a `number` here"); the brand DNA fonts plug in automatically via `var(--font-*)` tokens. This atlas is the machine-readable port of design.md's typography table.

The atlas is the **sole authoring source** for non-component text. If a scene needs a hero numeral that isn't covered by §6 components, the worker reads role `number` here and writes inline CSS from these values. Do NOT invent ad-hoc sizes — Raw Grid's identity collapses if weights drift below 900 at display scale, or if the uppercase + negative-tracking + weight-900 trio is broken on a display element.

```type-roles
[
  {
    "id": "number",
    "family": "display",
    "purpose": "hero numerical stat — weight 900, deep negative tracking",
    "px_min": 64, "px_max": 120, "weight": 900, "leading": "1.0", "tracking": "-0.04em", "case": "upper",
    "sample_html": "<div class=\"t-trole-number\">+47%</div>"
  },
  {
    "id": "display",
    "family": "display",
    "purpose": "cover / opening display headline (ink on canvas)",
    "px_min": 48, "px_max": 96, "weight": 900, "leading": "1.05", "tracking": "-0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-display\">Cities. Startups.</div>"
  },
  {
    "id": "number-lg",
    "family": "display",
    "purpose": "large decorative or featured numeral (step ordinal at full opacity)",
    "px_min": 48, "px_max": 80, "weight": 900, "leading": "1.0", "tracking": "-0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-number-lg\">03</div>"
  },
  {
    "id": "headline",
    "family": "display",
    "purpose": "primary section headline — the default loudest moment per scene",
    "px_min": 32, "px_max": 64, "weight": 900, "leading": "1.1", "tracking": "-0.01em", "case": "upper",
    "sample_html": "<div class=\"t-trole-headline\">Section title</div>"
  },
  {
    "id": "number-md",
    "family": "display",
    "purpose": "stat tile or metric numeral inside a bordered card",
    "px_min": 36, "px_max": 56, "weight": 900, "leading": "1.0", "tracking": "-0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-number-md\">12.4M</div>"
  },
  {
    "id": "title",
    "family": "display",
    "purpose": "region or section title (weight 800 — one notch under headline)",
    "px_min": 24, "px_max": 36, "weight": 800, "leading": "1.2", "tracking": "0.01em", "case": "upper",
    "sample_html": "<div class=\"t-trole-title\">Region title</div>"
  },
  {
    "id": "subtitle",
    "family": "display",
    "purpose": "subtitle / intra-region heading (weight 700)",
    "px_min": 16, "px_max": 22, "weight": 700, "leading": "1.3", "tracking": "0.04em", "case": "upper",
    "sample_html": "<div class=\"t-trole-subtitle\">Sub-headline</div>"
  },
  {
    "id": "body",
    "family": "body",
    "purpose": "paragraph body — sentence case, weight 500 (the only sentence-case role)",
    "px_min": 16, "px_max": 20, "weight": 500, "leading": "1.6", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body\">Body holds at weight 500 in sentence case. The contrast against weight-900 uppercase display is the system's typographic rhythm.</p>"
  },
  {
    "id": "caption",
    "family": "body",
    "purpose": "caption / fine print / footnote (uppercase tracked, weight 700)",
    "px_min": 11, "px_max": 13, "weight": 700, "leading": "1.2", "tracking": "0.08em", "case": "upper",
    "sample_html": "<div class=\"t-trole-caption\">Source — internal data, Q1 2026</div>"
  },
  {
    "id": "label-text",
    "family": "body",
    "purpose": "text inside black-pill label chips — white-on-ink, weight 800",
    "px_min": 11, "px_max": 11, "weight": 800, "leading": "1.0", "tracking": "0.08em", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-label-text\">Vol. 01</span></div>"
  },
  {
    "id": "arrow-cta",
    "family": "display",
    "purpose": "arrow-prefixed CTA — `→` glyph + non-breaking space + uppercase verb-first",
    "px_min": 16, "px_max": 22, "weight": 800, "leading": "1.2", "tracking": "0.06em", "case": "upper",
    "sample_html": "<div class=\"t-trole-arrow-cta\">Get started now</div>"
  },
  {
    "id": "wallpaper-numeral",
    "family": "display",
    "purpose": "oversized decorative numeral at 0.20 opacity — wallpaper behind card content",
    "px_min": 40, "px_max": 72, "weight": 900, "leading": "1.0", "tracking": "-0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-wallpaper-numeral\">04</div>"
  }
]
```

The atlas omits the bar-meter, table cells, and stat tile (they're §M motifs / §6 components, not text roles).

## §E Motion (GSAP consts — REPLACES site ease)

Template ships **zero @keyframes** — slides themselves are static; only the inline keyboard navigator transitions between them. EASE/DUR are derived from the template's voice register per §8.4: "direct, modern, no-nonsense, graphic" → `power3.out` / `power4.out` family, no overshoot, no bounce.

```js
const EASE = {
  entry: "power3.out", // direct arrival, no overshoot — borders don't bounce
  emphasis: "expo.out", // hard hit for stat reveals, bar fills, numeral wallpaper
  exit: "power2.in", // accelerate off
  drift: "sine.inOut", // only for the rare ambient layer (bar-fill width tween)
};
const DUR = {
  snap: 0.16,
  med: 0.42,
  slow: 0.85,
};
// RULE: never back.out / elastic / bounce on primary motion. Raw Grid is graphic-confident,
//       not playful — overshoot reads as a different system.
// RULE: bar-meter width fills use power3.out at DUR.med; the bar is data, not personality.
// RULE: decorative wallpaper numerals fade in at DUR.snap on opacity only — never tween
//       position, scale, or rotation on the wallpaper layer.
// RULE: transitions between scenes are hard cuts. No crossfade, no slide.
```

### §E.5 Motion choreography

**Allowed primitives**

- Hard cut between scenes (no crossfade, no slide, no blur).
- Direct arrival on hero text (power3.out at DUR.med) — no overshoot, no glide.
- Hard-hit emphasis on stat numerals (expo.out at DUR.snap).
- Bar-meter width fill (power3.out at DUR.med, 0% → target width).
- Decorative-numeral wallpaper fade-in (opacity 0 → 0.2-0.35 at DUR.snap, opacity only).
- Arrow-prefix translateX nudge on CTA emphasis (±2px at DUR.snap, optional beat accent).

**Forbidden**

- Crossfade, dissolve, blur transitions.
- back.out, elastic, bounce easing — at all.
- Soft / blurred drop shadows — only hard offset 4px/6px.
- Border-radius animations (corners stay square, period).
- Gradient fills on accent surfaces — pink and sage are flat color blocks.
- Rotation on any element. Strict orthogonality is the system.

**Stagger budget**

100-150ms between elements. Faster than editorial (200-280ms), slower than 8-bit-orbit (80-120ms). Total scene-in stagger ≤ 600ms.

## §G Voice transform recipe (apply to brand's voice from §1 DNA)

Take the brand's product description / value prop. Transform with:

1. Strip filler ("really", "very", "just"), keep declarative verbs and concrete nouns
2. Hero headlines: 1-3 words MAX, UPPERCASE, period-separated for emphasis (`CITIES. STARTUPS.`)
3. Chip / label / pill text: UPPERCASE with 0.08em tracking, weight 800 — short noun phrases (max 4 words)
4. Body copy: sentence case, weight 500, one or two declarative sentences — no exclamation, no hedging
5. Stats: bare numeric + UPPERCASE caption (e.g. `+47%` / `YEAR OVER YEAR GROWTH`), no full sentences
6. CTAs: arrow-prefixed (`→ GET STARTED NOW`), UPPERCASE, verb-first imperative

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: hero=`TEAMS. SHIP.` / chip=`REAL-TIME` / cta=`→ START FREE` / body=`Design together, ship faster.`

## §H Scene composition hints (Phase 4b layout guidance)

**Surface alternation across scenes**

- White canvas + ink-bordered cells is the default ground — most scenes anchor here.
- Accent-surface scenes use a single pastel (`--brand-primary` OR `--brand-secondary`) as the dominant region fill, paired with white as the contrasting region.
- Ink-black surface scenes are rare and high-impact — use for image-paired scenes or single closing-statement beats. Text inverts to white on ink only.
- Alternate white → accent → white across the video. Two consecutive accent-heavy scenes desaturate the brutalist contrast.

**Border-as-layout principle (non-negotiable)**

- Every structural division uses `var(--rg-border)` (3px solid ink).
- Regions meet **edge-to-edge** at the border. No `gap` between bordered cells. No margin between adjacent regions. The 3px line itself is the separator.
- Internal padding (`--rg-pad-*`) provides breathing room **inside** a cell. Outside, the border does the work.
- Border weight is fixed: 3px for structural, 4px only for the decorative line-stub (`divider-loud`) and for inverted borders on ink-black surfaces. Never colored, never dashed, never thinner.

**Hero text and headlines**

- One headline tier per scene. Either a `display` (cover scenes) OR a `headline` (interior scenes) — never both.
- Hero color is `var(--ink)` on white/accent surfaces, `var(--canvas)` on ink-black surfaces. Headlines NEVER appear in brand-primary or brand-secondary — pastels are surfaces, not text.
- Hero takes ≥ 45% canvas width on cover scenes, ≥ 35% on interior scenes.
- Display gets period-separated word fragments (`CITIES.<br>STARTUPS.`) for the brutalist staccato cadence.

**Brand color placement (role contract)**

- `--brand-primary` and `--brand-secondary` are **accent surface fills only** — region backgrounds, bar-meter fills, alternating cards. Never used as text color.
- `--ink` carries all text, borders, label fills, shadows. `--canvas` is the ground.
- When two accent regions appear adjacent, pair primary with secondary (warm/cool balance) rather than doubling on one. A scene with two primary-fill cells reads as monotonal.
- `--rg-gray` (4% ink tint of canvas) is the tertiary neutral fill — use for table zebra rows and de-emphasized cards.

**Decorative-numeral wallpaper (signature)**

- Cards that carry a numerical identity (step ordinal, section number, opening quote-mark) get an oversized weight-900 numeral at 0.15-0.35 opacity behind the content.
- The wallpaper numeral fills the upper portion of the card; the actual title sits in front at full opacity. No z-index trickery — DOM order is enough.
- Use `--rg-ordinal-opacity` (0.35) for card-ordinal style, `--rg-numeral-opacity` (0.20) for step numbers, `--rg-quote-opacity` (0.15) for the giant opening-quote mark.

**Transitions between scenes**

- Hard cut. Pair with a single percussive hit on the cut frame if you need a beat between scenes.
- NEVER crossfade, slide, blur, or zoom-between-scenes. The brutalist identity dies in a crossfade.

## §M Atomic motifs (gestures the plan agent can reference)

Each motif is a **single reusable gesture** that lives inside a larger pattern. Patterns compose motifs; motifs do not compose anything. Raw Grid is structurally severe — the gesture vocabulary is small (border + hard offset + signature pill / arrow / wallpaper). Adding more gestures dilutes the neobrutalist register.

```motifs
[
  {
    "id": "hard-offset-shadow",
    "label": "Hard offset shadow",
    "role": "paper-depth",
    "surface_safe": ["canvas", "accent"],
    "description": "Solid ink shadow at 6px/6px or 4px/4px with zero blur. The system's only depth move — never blurred, never colored, never centered. Applied to elevated cards, primary callouts, and the bar-meter housing.",
    "demo": "<div class=\"rg-motif-shadow\">Lifted card</div>",
    "css": ".rg-motif-shadow{display:inline-block;background:var(--canvas);border:3px solid var(--ink);box-shadow:6px 6px 0 var(--ink);padding:18px 28px;font-family:var(--f-disp-native);font-weight:900;font-size:clamp(20px,2vw,28px);line-height:1;letter-spacing:-.01em;text-transform:uppercase;color:var(--ink)}"
  },
  {
    "id": "black-pill-chip",
    "label": "Black pill chip",
    "role": "section-tag",
    "surface_safe": ["canvas", "accent"],
    "description": "Small black rectangle, white uppercase text at 11px / weight 800 / 0.08em tracking, 6px x 14px padding. The system's universal section tag, status mark, or fiscal-year stamp. Zero border-radius — the 'pill' is rhetorical, not geometric.",
    "demo": "<span class=\"rg-motif-chip\">Vol. 01 — Signal</span>",
    "css": ".rg-motif-chip{display:inline-block;background:var(--ink);color:var(--canvas);padding:6px 14px;font-family:var(--f-body-native);font-weight:800;font-size:11px;line-height:1;letter-spacing:.08em;text-transform:uppercase}"
  },
  {
    "id": "arrow-prefix-cta",
    "label": "Arrow-prefix CTA",
    "role": "interactive-signal",
    "surface_safe": ["canvas", "accent"],
    "description": "`→` (U+2192) + non-breaking space prepended via ::before on CTAs and interactive list rows. The system's entire interactivity vocabulary. Uppercase verb-first imperative; weight 800; tracked 0.06em.",
    "demo": "<div class=\"rg-motif-arrow\">Get started now</div>",
    "css": ".rg-motif-arrow{display:inline-block;font-family:var(--f-disp-native);font-weight:800;font-size:clamp(16px,1.6vw,22px);line-height:1.2;letter-spacing:.06em;text-transform:uppercase;color:var(--ink)}.rg-motif-arrow::before{content:\"\\2192\\00a0\";font-weight:900}"
  },
  {
    "id": "decorative-numeral-wallpaper",
    "label": "Decorative-numeral wallpaper",
    "role": "ambient-depth",
    "surface_safe": ["canvas", "accent"],
    "description": "Oversized weight-900 numeral at 0.20 opacity sitting inside a card behind real content. The wallpaper occupies the upper portion of the card; the actual title sits in front at full opacity. No z-index trickery — DOM order is enough. The system's signature decorative move.",
    "wide": true,
    "demo": "<div class=\"rg-motif-wallpaper\"><div class=\"rg-motif-wallpaper-num\">04</div><div class=\"rg-motif-wallpaper-title\">Ship faster</div><div class=\"rg-motif-wallpaper-body\">The fourth signal sits behind its own ordinal — content over decoration.</div></div>",
    "css": ".rg-motif-wallpaper{position:relative;background:var(--canvas);border:3px solid var(--ink);padding:24px 28px;min-height:160px;overflow:hidden}.rg-motif-wallpaper-num{position:absolute;top:-8px;right:16px;font-family:var(--f-disp-native);font-weight:900;font-size:clamp(72px,9vw,140px);line-height:1;letter-spacing:-.04em;color:var(--ink);opacity:.2;pointer-events:none}.rg-motif-wallpaper-title{position:relative;font-family:var(--f-disp-native);font-weight:900;font-size:clamp(24px,2.4vw,36px);line-height:1.1;letter-spacing:-.01em;text-transform:uppercase;color:var(--ink)}.rg-motif-wallpaper-body{position:relative;margin-top:8px;font-family:var(--f-body-native);font-weight:500;font-size:14px;line-height:1.6;color:var(--ink);max-width:36ch}"
  },
  {
    "id": "bar-meter",
    "label": "Bar meter",
    "role": "data-bar",
    "surface_safe": ["canvas"],
    "description": "32px-tall horizontal track with 3px ink border and canvas interior. Fill is a child div whose width represents the value, in pink / sage / ink. Data-bar values inside ink fills invert to canvas text. The system's only chart primitive besides the donut.",
    "wide": true,
    "demo": "<div class=\"rg-motif-bar\"><div class=\"rg-motif-bar-fill\" style=\"width:68%\"><span>68%</span></div></div>",
    "css": ".rg-motif-bar{position:relative;height:32px;border:3px solid var(--ink);background:var(--canvas);width:100%}.rg-motif-bar-fill{display:flex;align-items:center;justify-content:flex-end;height:100%;background:var(--brand-primary);padding:0 10px;font-family:var(--f-body-native);font-weight:800;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink)}"
  },
  {
    "id": "zebra-table-row",
    "label": "Zebra table row",
    "role": "tabular-rhythm",
    "surface_safe": ["canvas"],
    "description": "Comparison-table row pattern — ink-black header row (white uppercase weight-800), alternating canvas / rg-gray body rows, 3px ink borders on every cell. The brutalist table aesthetic; never restyle.",
    "wide": true,
    "demo": "<div class=\"rg-motif-table\"><div class=\"rg-motif-table-h\"><span>Signal</span><span>Volume</span></div><div class=\"rg-motif-table-r\"><span>Inbound</span><span>+47%</span></div><div class=\"rg-motif-table-r rg-motif-table-zebra\"><span>Outbound</span><span>+12%</span></div></div>",
    "css": ".rg-motif-table{border:3px solid var(--ink);background:var(--canvas)}.rg-motif-table-h,.rg-motif-table-r{display:grid;grid-template-columns:1fr auto;gap:0}.rg-motif-table-h{background:var(--ink);color:var(--canvas)}.rg-motif-table-h span{padding:12px 16px;font-family:var(--f-body-native);font-weight:800;font-size:12px;letter-spacing:.06em;text-transform:uppercase;border-right:3px solid var(--canvas)}.rg-motif-table-h span:last-child{border-right:0}.rg-motif-table-r{border-top:3px solid var(--ink)}.rg-motif-table-r span{padding:12px 16px;font-family:var(--f-body-native);font-weight:600;font-size:14px;color:var(--ink);border-right:3px solid var(--ink)}.rg-motif-table-r span:last-child{border-right:0}.rg-motif-table-zebra{background:color-mix(in srgb,var(--ink) 4%,var(--canvas))}"
  },
  {
    "id": "icon-box",
    "label": "Icon box",
    "role": "logo-mark",
    "surface_safe": ["canvas", "accent"],
    "description": "48x48 canvas square with 3px ink border holding a 1-3 character glyph at weight 900 — initials, Roman numeral, single letter. The system's logo / feature-icon primitive.",
    "demo": "<div class=\"rg-motif-iconbox\">IV</div>",
    "css": ".rg-motif-iconbox{display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border:3px solid var(--ink);background:var(--canvas);font-family:var(--f-disp-native);font-weight:900;font-size:20px;line-height:1;letter-spacing:0;color:var(--ink)}"
  }
]
```

The `motifs` JSON block above is the SOLE source of truth. build-design.mjs reads it to render §M cards in design.html. The Phase 3 plan agent and Phase 4b scene worker may cite motifs by `id` when annotating which gesture a scene relies on.

**Materials lexicon** (informational — the composition atoms behind the patterns):

- hard-offset-shadow · black-pill-chip · arrow-prefix-cta · decorative-numeral-wallpaper · bar-meter · zebra-table-row · icon-box · connector-node · rule-stub

## §I Page-level CSS (overrides design.html's neutral chrome — makes the doc itself read as raw-grid)

```css
/* ── Preset-native typography vars (loaded via preset-meta.chromeFonts.googleFontsHref).
 * Raw Grid's argument is "this is the user's actual system font" — so every native
 * stack leads with system-ui / Segoe UI / -apple-system. Inter loads from Google
 * Fonts ONLY as the web fallback for off-host previews and headless capture, where
 * system fonts cannot be measured reliably. The fallback chain ends in plain
 * sans-serif so a missing CDN still renders correctly.
 *
 * Raw Grid has no script face. The script slot points at the same system stack as
 * display because the preset refuses a third face. */
:root {
  --f-disp-native:
    system-ui, "Segoe UI", -apple-system, BlinkMacSystemFont, "Inter", "Helvetica Neue", Helvetica,
    Arial, sans-serif;
  --f-body-native:
    system-ui, "Segoe UI", -apple-system, BlinkMacSystemFont, "Inter", "Helvetica Neue", Helvetica,
    Arial, sans-serif;
  --f-script-native:
    system-ui, "Segoe UI", -apple-system, BlinkMacSystemFont, "Inter", "Helvetica Neue", Helvetica,
    Arial, sans-serif;
  --f-mono-native: ui-monospace, "SF Mono", "JetBrains Mono", "Menlo", "Consolas", monospace;
}

/* .preset-native-scope: re-bind brand DNA font tokens to preset-native families.
 * Wraps §6 component previews, §M motif demos, and §T type-role atlas so
 * var(--font-*) resolves to system-ui-first regardless of brand DNA. Paste-ready
 * component source is untouched — Phase 4b still grep + paste the original
 * `var(--font-display)` tokens, which resolve to brand DNA at scene-render time. */
.preset-native-scope {
  --font-display: var(--f-disp-native);
  --font-body: var(--f-body-native);
  --font-script: var(--f-script-native);
  --font-mono: var(--f-mono-native);
}

/* Raw Grid page chrome — applied to design.html itself */
body {
  background: var(--canvas);
}
.title-card {
  background: var(--canvas);
  border-bottom: var(--rg-border);
  padding: 96px 0 80px;
}
.title-display {
  text-transform: uppercase;
  letter-spacing: -0.02em;
  color: var(--ink);
}
.brand-name,
.style-name {
  font-weight: 900;
}
.ds-section {
  border-top: var(--rg-border);
  padding: 80px 0;
}
h2 {
  text-transform: uppercase;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.eyebrow {
  color: var(--ink);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
/* Cards / panels get the bordered-rectangle treatment */
.dna-swatch,
.type-card,
.voice-pair,
.comp-card {
  border: var(--rg-border) !important;
  border-radius: 0 !important;
  box-shadow: var(--rg-shadow);
}
.comp-card {
  margin: 32px 0 !important;
  overflow: visible !important;
}
.comp-head {
  background: var(--ink) !important;
  color: var(--canvas) !important;
  border-bottom: var(--rg-border) !important;
}
.comp-head .comp-name,
.comp-head .comp-marker {
  color: var(--canvas) !important;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.ds-code {
  background: var(--canvas) !important;
  border: var(--rg-border);
  border-radius: 0 !important;
  color: var(--ink) !important;
}

/* ── §M Motifs grid: atomic gestures.
 * Raw Grid is structurally severe — 7 motifs anchor the gesture vocabulary
 * (shadow / chip / arrow / wallpaper / bar / table / icon-box). Cards inherit
 * the bordered-rectangle + hard-offset-shadow treatment so the grid itself
 * teaches the system. */
.ds-motif-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}
.ds-motif {
  grid-column: span 4;
  min-height: 280px;
  padding: 28px;
  border: var(--rg-border);
  border-radius: 0;
  background: var(--canvas);
  color: var(--ink);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--rg-shadow-sm);
}
.ds-motif.ds-motif-wide {
  grid-column: span 8;
}
.ds-motif.ds-motif-surface-canvas {
  background: var(--canvas);
  color: var(--ink);
}
.ds-motif.ds-motif-surface-accent {
  background: var(--brand-primary);
  color: var(--ink);
}
.ds-motif-h {
  margin: 0;
  font-family: var(--f-disp-native);
  font-weight: 900;
  font-size: clamp(22px, 2.2vw, 32px);
  line-height: 1.05;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: var(--ink);
}
.ds-motif-desc {
  margin: 0;
  font-family: var(--f-body-native);
  font-weight: 500;
  font-size: 14px;
  line-height: 1.55;
  color: var(--ink);
  opacity: 0.78;
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

/* ── §T Type-role atlas. Container = bordered canvas card with hard offset
 * shadow. Each .t-trole-* class encodes the role's family / size / weight /
 * leading / tracking / case. Family selectors use var(--font-*) tokens so the
 * atlas renders in BRAND DNA fonts at scene-render time; only the recipe is
 * preset-declared. Color follows Raw Grid's contract: var(--ink) for all text,
 * pastels are surfaces only. */
.ds-trole-box {
  display: flex;
  flex-direction: column;
  border: var(--rg-border);
  border-radius: 0;
  background: var(--canvas);
  overflow: hidden;
  margin-top: 24px;
  box-shadow: var(--rg-shadow-sm);
}
.ds-trole-row {
  padding: 28px 32px;
  border-bottom: var(--rg-border);
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
 * scene-render time; inside .preset-native-scope (the atlas + motif grid) it
 * resolves to the system-ui-first native stack. Color is always var(--ink) —
 * Raw Grid never tints display text with accents. */
.t-trole-number {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(64px, 8vw, 120px);
  line-height: 1;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-display {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(48px, 7vw, 96px);
  line-height: 1.05;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-number-lg {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(48px, 6vw, 80px);
  line-height: 1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-headline {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(32px, 4.5vw, 64px);
  line-height: 1.1;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-number-md {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(36px, 4vw, 56px);
  line-height: 1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(24px, 2.5vw, 36px);
  line-height: 1.2;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-subtitle {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(16px, 1.4vw, 22px);
  line-height: 1.3;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-body {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: clamp(16px, 1.3vw, 20px);
  line-height: 1.6;
  color: var(--ink);
  max-width: 60ch;
  margin: 0;
}
.t-trole-caption {
  font-family: var(--font-body);
  font-weight: 700;
  font-size: clamp(11px, 1vw, 13px);
  line-height: 1.2;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-label-text {
  display: inline-block;
  font-family: var(--font-body);
  font-weight: 800;
  font-size: 11px;
  line-height: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: var(--ink);
  color: var(--canvas);
  padding: 6px 14px;
}
.t-trole-arrow-cta {
  display: inline-block;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(16px, 1.6vw, 22px);
  line-height: 1.2;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink);
}
.t-trole-arrow-cta::before {
  content: "\2192\00a0";
  font-weight: 900;
}
.t-trole-wallpaper-numeral {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(40px, 5vw, 72px);
  line-height: 1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--ink);
  opacity: 0.2;
}
```
