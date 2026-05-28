```preset-meta
{
  "name": "sakura-chroma",
  "label": "Sakura Chroma",
  "fingerprint": {
    "shadow": "hard-offset-zero-blur",
    "border": "ink-1.5px",
    "motion": "considered-paper-snap",
    "density": "catalogue-medium-high",
    "voice": "cassette-package-editorial",
    "palette-mode": "rainbow-anchored"
  },
  "match_signals": [
    { "kind": "shadow_zero_blur", "weight": 0.3 },
    { "kind": "medium_solid_border", "weight": 0.2 },
    { "kind": "condensed_display", "weight": 0.25 },
    { "kind": "high_sat_accent", "weight": 0.15 }
  ],
  "best_for": ["indie hardware", "music labels", "creative studios", "kawaii-tech", "magazine / zine launches", "analog product catalogues"],
  "avoid_for": ["restrained corporate", "quiet monochrome palettes", "institutional finance", "regulated industries"],
  "chromeFonts": {
    "googleFontsHref": "https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=Albert+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+JP:wght@500;700&display=swap",
    "display": "Big Shoulders Display",
    "body": "Albert Sans",
    "script": "Noto Sans JP",
    "mono": "JetBrains Mono"
  }
}
```

> `chromeFonts` makes the design.html doc chrome (title-card, section heads, h2/h3, lede paragraphs, eyebrows) render in the preset's NATIVE typography — Big Shoulders Display + Albert Sans + JetBrains Mono + Noto Sans JP — instead of the brand DNA fonts. Sakura Chroma is a four-face system; the `script` slot points at Noto Sans JP because the cassette-package register uses Japanese characters (限定版) as the only "script" voice — there is no handwritten face in the system. The brand fonts still apply to §6 component code (paste-ready for Phase 4b). §M motifs grid and §T type-role atlas use `.preset-native-scope` so var(--font-display/body/script/mono) re-resolves to these native families for the live preview.

## §A Director's intent

Vintage Japanese cassette-package editorial on warm cream paper. Big Shoulders Display 900 with negative tracking carries every display moment; Albert Sans handles body; JetBrains Mono carries spec rows, chips, page-data. The aesthetic is hand-curated industrial — warm but disciplined, playful but tightly typeset, with the cassette product page as the visual metaphor.

Depth comes from **hard 8px ink-offset shadows** (zero blur), 1.5px ink borders, and **color-block layering** — diagonal multi-color ribbon bands sweeping at ±22°, petal-cluster blobs (4-5 overlapping perfect circles), 32-point starburst seals, red rectangular stamps. No blurred shadows anywhere.

**Brand DNA tints the rainbow; the rainbow is the preset's identity.** Sakura Chroma owns a six-color anchor palette (red, pink, orange, yellow, green, blue) — declared in §B as `color-mix()` anchors so brand DNA shifts the saturation/warmth without collapsing the catalogue color story. Warm cream paper (`--anchor-paper`) and warm-brown ink (`--anchor-ink`) are technical prerequisites: the 4px halftone paper-grain texture and 8px hard ink-shadow only read on this base. Without the warm-cream blackpoint, the system stops looking like a printed cassette page.

**Color role contract**: one scene = one dominant rainbow color carrying the lockup bar or stamp / topstrip / chip; ink-brown carries every headline, border, body, and shadow. Red is reserved for inline `<em>` emphasis inside display headlines and for hero numerals. Borders are always ink — colored borders do not exist.

Motion is **considered paper-snap**: power2.out entries, no overshoot (a cassette package doesn't bounce). Ambient: petal scatter drift, ribbon parallax. Type emphasis: subtle scale + opacity, never elastic. Scene transitions favor 280ms ease cross-blends (matching the template's intrinsic opacity transition) over hard cuts.

**Best for** brands with warm/medium-saturation palettes that can carry rainbow accents — indie hardware, music labels, creative studios, kawaii-tech, magazine/zine launches, analog product catalogues. Restrained corporate or quiet palettes still render but lose the catalogue-page playfulness.

**Class prefix**: `sk-` (initialism of sakura, 3 chars).

## §B Decoration tokens (merge into design.html `:root`)

Sakura Chroma declares **structural** tokens (pixel unit, shadow stack, paper-grain texture, frame insets) AND a **six-color rainbow anchor palette** as a §8.2 hue-anchor exception. The rainbow is the preset's identity — without anchored hues, dark or muted brand DNA produces muddy ribbons that break the cassette-package character. Each anchor is mixed with `var(--brand-primary)` at 30-40% so brand DNA still tints the palette toward the site's voice.

Warm-cream paper (`--anchor-paper`) and warm-brown ink (`--anchor-ink`) are technical prerequisites: the 4px halftone paper-grain (`--paper-grain`) and the 8px hard ink shadow only register on this warm base. Same precedent as liquid-glass `--liquid-bg-deep` and 8-bit-orbit `--canvas-void`.

```css
/* §8.2 exception: warm-cream + warm-brown base. Required for the paper-grain
   halftone texture and 8px hard ink-shadow to register — cool greys or pure
   blacks collapse the print-on-paper warmth that defines the system. */
--anchor-paper: #f1e6cb; /* warm cream paper canvas */
--anchor-paper-dk: #e5d6b0; /* slightly darker tonal sibling for layered surfaces */
--anchor-ink: #3a2516; /* deep warm-brown ink — borders, type, hard shadows */

/* §8.2 exception: six-color rainbow anchors. The cassette-package register
   depends on the full red/pink/orange/yellow/green/blue ladder appearing as
   petals, ribbons, topstrips, chips. Brand DNA tints these via color-mix()
   so the rainbow shifts with the site without losing its categorical hue
   identity. Saturation must stay high — muted anchors produce dishwater. */
--anchor-red: #e5392a;
--anchor-pink: #e54489;
--anchor-orange: #f09131;
--anchor-yellow: #f0bc2a;
--anchor-green: #3d9f47;
--anchor-blue: #3f8bc4;

/* Brand-tinted rainbow — each anchor pulled toward brand-primary at 30%.
   Components reference these (not the raw anchors) so brand DNA influences
   warmth/saturation. Reduce the brand-mix percentage for cooler/darker
   brands if the rainbow flattens; raise it to 40-50% for high-sat brands
   that should bleed into the rainbow more aggressively. */
--sk-red: color-mix(in srgb, var(--brand-primary) 30%, var(--anchor-red));
--sk-pink: color-mix(in srgb, var(--brand-primary) 30%, var(--anchor-pink));
--sk-orange: color-mix(in srgb, var(--brand-primary) 30%, var(--anchor-orange));
--sk-yellow: color-mix(in srgb, var(--brand-primary) 25%, var(--anchor-yellow));
--sk-green: color-mix(in srgb, var(--brand-primary) 25%, var(--anchor-green));
--sk-blue: color-mix(in srgb, var(--brand-primary) 30%, var(--anchor-blue));

/* Paper-grain halftone texture — 4px-period radial-gradient at 16% opacity.
   Required atmosphere on every scene; removing it makes the deck look like
   a flat web template. */
--paper-grain: radial-gradient(circle at 1px 1px, rgba(58, 37, 22, 0.55) 1px, transparent 1.6px);
--paper-grain-size: 4px 4px;
--paper-grain-opacity: 0.16;

/* Signature hard ink shadow — single value, zero blur. Reserved for quote
   callouts and elevated paper-on-ribbons elements. Overuse degrades it. */
--shadow-ink-hard: 8px 8px 0 var(--anchor-ink);

/* Border weights — 1.5px ink default; 2px on spec-checklist boxes; 1px
   ink-alpha hairline on ledger row body dividers. */
--border-ink: 1.5px solid var(--anchor-ink);
--border-ink-heavy: 2px solid var(--anchor-ink);
--border-ink-hairline: 1px solid color-mix(in srgb, var(--anchor-ink) 22%, transparent);
--border-ink-dashed: 1px dashed var(--anchor-ink);

/* Spacing — frame inset, card padding, grid gaps. Pixel values for fixed
   chrome, clamp() for fluid scaling. */
--frame-inset: clamp(36px, 3.6vw, 72px);
--frame-inset-bottom: clamp(72px, 7vh, 110px);
--gap-card-x: clamp(14px, 1.4vw, 20px);
--gap-card-y: clamp(16px, 1.7vw, 24px);
--gap-grid: clamp(16px, 1.6vw, 26px);
--gap-col: clamp(28px, 3vw, 56px);

/* Ribbon-band geometry — used by the diagonal ribbon-band component. */
--ribbon-band-h: clamp(40px, 6vh, 96px);
--ribbon-band-rotate: -22deg; /* +22deg variant available on .reverse */

/* 32-point starburst clip-path polygon. Hardcoded — variations in point
   count break visual cohesion across the seal-recognition signal. */
--starburst-clip: polygon(
  50% 0%,
  60% 8%,
  73% 4%,
  76% 17%,
  89% 18%,
  87% 31%,
  100% 35%,
  92% 47%,
  100% 60%,
  87% 64%,
  90% 77%,
  76% 78%,
  75% 91%,
  62% 88%,
  53% 100%,
  42% 90%,
  30% 96%,
  25% 84%,
  12% 86%,
  13% 73%,
  0% 70%,
  7% 58%,
  0% 47%,
  11% 39%,
  4% 27%,
  17% 25%,
  13% 12%,
  27% 14%,
  25% 1%,
  38% 7%
);
```

## §D Font pairing fallback (if brand fonts not on Google Fonts)

Sakura Chroma's typographic identity depends on a four-face stack — condensed industrial display, neutral humanist body, monospaced data, optional Japanese accent. Fallbacks below are used only if the primary face fails to load on Google Fonts.

- **display**: `'Big Shoulders Display'` · `'Archivo Black'` · `'Oswald'` wght 900
- **body**: `'Albert Sans'` · `'Inter'` · `'IBM Plex Sans'` wght 400
- **mono**: `'JetBrains Mono'` · `'IBM Plex Mono'` · `'Space Mono'` wght 400

## §T Type-role atlas (Phase 4b reads this to size text correctly)

Each entry is a **named type role** with concrete render parameters at 1920×1080 — family token, px range, weight, leading, tracking, case, and any color/shadow/rotation decoration. Phase 4b scene workers may cite roles by `id` ("use a `num-hero` here"); the brand DNA fonts plug in automatically via `var(--font-*)` tokens. This is the source design.md typography table ported as machine-readable JSON.

The atlas is the **sole authoring source** for non-component text. If a scene needs a `num-hero` numeral that isn't covered by §6 components, the worker reads role `num-hero` here and writes inline CSS from these values. Do NOT invent ad-hoc sizes — Sakura Chroma's identity collapses if weights drift below 900 at display scale or if negative tracking is dropped.

```type-roles
[
  {
    "id": "disp-hero",
    "family": "display",
    "purpose": "cover-spread hero numeral / oversized title — Big Shoulders 900 at max scale, ink",
    "px_min": 120, "px_max": 280, "weight": 900, "leading": "0.84", "tracking": "-0.025em", "case": "upper",
    "sample_html": "<div class=\"t-trole-disp-hero\">Sakura</div>"
  },
  {
    "id": "disp-statement",
    "family": "display",
    "purpose": "manifesto / single-statement spread — ink with optional <em> red color shift",
    "px_min": 70, "px_max": 168, "weight": 900, "leading": "0.86", "tracking": "-0.022em", "case": "upper",
    "sample_html": "<div class=\"t-trole-disp-statement\">Teams design <em>together</em></div>"
  },
  {
    "id": "disp-section",
    "family": "display",
    "purpose": "section topbar title (left of topbar-rule)",
    "px_min": 52, "px_max": 100, "weight": 900, "leading": "0.9", "tracking": "-0.018em", "case": "upper",
    "sample_html": "<div class=\"t-trole-disp-section\">Catalogue</div>"
  },
  {
    "id": "disp-quote",
    "family": "display",
    "purpose": "pulled quote inside a qbody-box (ink, paper-on-ribbons callout)",
    "px_min": 48, "px_max": 110, "weight": 900, "leading": "0.92", "tracking": "-0.018em", "case": "upper",
    "sample_html": "<div class=\"t-trole-disp-quote\">Print is the message.</div>"
  },
  {
    "id": "disp-card-name",
    "family": "display",
    "purpose": "product-card name (inside catalogue card body, above mono spec rows)",
    "px_min": 28, "px_max": 48, "weight": 900, "leading": "0.94", "tracking": "-0.012em", "case": "upper",
    "sample_html": "<div class=\"t-trole-disp-card-name\">Model 26</div>"
  },
  {
    "id": "num-hero",
    "family": "display",
    "purpose": "primary hero statistic numeral — Big Shoulders 900 in sk-red",
    "px_min": 110, "px_max": 240, "weight": 900, "leading": "0.86", "tracking": "-0.025em", "case": "upper",
    "sample_html": "<div class=\"t-trole-num-hero\">26K<sub>+</sub></div>"
  },
  {
    "id": "ttl-row",
    "family": "display",
    "purpose": "ledger row title (only sub-display use of Big Shoulders 700)",
    "px_min": 22, "px_max": 30, "weight": 700, "leading": "1.1", "tracking": "-0.005em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-ttl-row\">Cassette · Vol. 26</div>"
  },
  {
    "id": "body",
    "family": "body",
    "purpose": "standard paragraph body — Albert Sans 400, warm-brown ink",
    "px_min": 14, "px_max": 17, "weight": 400, "leading": "1.5", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body\">Body holds at 14-17px Albert Sans. Generous leading, never uppercased — the neutral counterpoint to Big Shoulders' density.</p>"
  },
  {
    "id": "body-emphasis",
    "family": "body",
    "purpose": "lead paragraph / emphasized body (Albert Sans 600)",
    "px_min": 15, "px_max": 20, "weight": 600, "leading": "1.4", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body-emphasis\">A lead paragraph carries the spread's argument — 15-20px Albert Sans 600.</p>"
  },
  {
    "id": "micro",
    "family": "body",
    "purpose": "tracked-caps micro-label (eyebrow / chip / meta) — Albert Sans 700, 0.16em",
    "px_min": 12, "px_max": 14, "weight": 700, "leading": "1.2", "tracking": "0.16em", "case": "upper",
    "sample_html": "<div class=\"t-trole-micro\">Catalogue · Vol. 26</div>"
  },
  {
    "id": "micro-xl",
    "family": "body",
    "purpose": "loosest tracked-caps manifesto kicker (0.32em)",
    "px_min": 12, "px_max": 14, "weight": 700, "leading": "1.2", "tracking": "0.32em", "case": "upper",
    "sample_html": "<div class=\"t-trole-micro-xl\">Limited edition</div>"
  },
  {
    "id": "mono",
    "family": "mono",
    "purpose": "spec row / page number / eq-tick — JetBrains Mono 400, 11-12px",
    "px_min": 11, "px_max": 12, "weight": 400, "leading": "1.3", "tracking": "0.02em", "case": "upper",
    "sample_html": "<div class=\"t-trole-mono\">MODE → MULTIPLAYER</div>"
  },
  {
    "id": "mono-tag",
    "family": "mono",
    "purpose": "chip / tag text inside a ledger row (cream on rainbow chip)",
    "px_min": 12, "px_max": 14, "weight": 400, "leading": "1", "tracking": "0.04em", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-mono-tag\">Manifesto</span></div>"
  },
  {
    "id": "stamp-text",
    "family": "display",
    "purpose": "red rectangular stamp body — Big Shoulders 900 cream on red, rotated -3deg",
    "px_min": 20, "px_max": 28, "weight": 900, "leading": "1", "tracking": "0.02em", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-stamp-text\">Limited · Vol 26</span></div>"
  },
  {
    "id": "seal-text",
    "family": "display",
    "purpose": "32-point starburst seal glyph — Big Shoulders 900 cream on ink starburst",
    "px_min": 22, "px_max": 38, "weight": 900, "leading": "0.9", "tracking": "-0.01em", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-seal-text\">26</span></div>"
  },
  {
    "id": "jp-accent",
    "family": "script",
    "purpose": "Japanese cultural accent (限定版) inline inside a Latin label",
    "px_min": 14, "px_max": 20, "weight": 500, "leading": "1.2", "tracking": "0", "case": "sentence",
    "sample_html": "<div class=\"t-trole-micro\"><span class=\"t-trole-jp-accent\">限定版</span> · Limited edition</div>"
  }
]
```

The atlas omits `paper-grain` (a texture, declared in §B decoration tokens), `petal-cluster` / `ribbon-band` / `rosette-seal` (decorative motifs, declared in §M), and the `qbody-box` shadow (a §B structural token).

## §E Motion (GSAP consts — REPLACES site ease)

Sakura Chroma's source template ships **zero content @keyframes** — only a 280ms ease opacity slide-fade for navigation chrome. EASE/DUR are therefore derived from the design.md voice register: "warm but disciplined", "playful but tightly typeset", "hand-curated industrial". That register is calm-considered, not bouncy — power2.out / power3.out for primary motion, no back-overshoot. The single 280ms ease cross-blend the template inherits maps to the scene-transition default.

```js
const EASE = {
  entry: "power2.out", // considered paper-snap — no overshoot, no bounce
  emphasis: "power3.out", // a bit more authority for hero numerals + lockup reveals
  exit: "power2.in", // accelerate off the page like a flipped catalogue spread
  drift: "sine.inOut", // petal scatter + ribbon parallax ambient
};
const DUR = {
  snap: 0.18, // chip / micro-label / stamp drop-ins
  med: 0.5, // hero text / lockup / card reveal — calm not snappy
  slow: 1.0, // ribbon sweep, petal scatter, hero numeral count-up
};
// RULE: never use back.out / elastic on display type. The cassette-package
//       voice is hand-curated industrial, not playful-bouncy.
// RULE: red emphasis-color reveal on <em> spans MUST animate color, not
//       trigger after the headline lands. The color shift IS the emphasis.
// RULE: scene transitions default to 280ms opacity cross-blend (matches the
//       template's intrinsic .slide transition). Hard cuts only on hero
//       numeral / stat-counter beats where the impact is wanted.
// RULE: petal blobs and ribbon bands drift on sine.inOut amplitude ±8-16px,
//       period 6-10s. Never tween rotation > 4deg — ribbons stay at ±22°.
```

### §E.5 Motion choreography

**Allowed primitives**

- Cross-blend (280ms opacity) between scenes; hard cut only on stat-counter beats.
- Hero entry: y +24px → 0, opacity 0 → 1, scale 0.98 → 1 on power2.out @ DUR.med.
- Inline `<em>` emphasis: animate the red color shift (not delayed reveal). Stagger 80-160ms after the parent headline lands.
- Stamp / seal: drop-in with rotate(-3deg) preserved; opacity 0 → 1 + scale 0.92 → 1 on power3.out @ DUR.snap.
- Lockup bar (pink/rainbow background): width 0 → 100% reveal on power3.out @ DUR.med, then text fades in on top.
- Petal-cluster: stagger 40-80ms per petal; each petal scales 0.6 → 1 on power2.out @ DUR.snap.
- Ribbon-band sweep: x -10% → 0 with rotate preserved on power2.out @ DUR.slow.
- Equalizer bar fill: per-column stagger 60ms; each "on" segment scaleY 0 → 1 with `transform-origin: bottom` on power3.out @ DUR.snap.
- Hero stat counter: animated count-up (0 → target) on power3.out @ DUR.slow.
- Ambient petal / ribbon drift: sine.inOut, period 6-10s, amplitude ±8-16px.

**Forbidden**

- Back / elastic / bounce eases on display type or hero numerals (breaks catalogue voice).
- Rotation animations beyond preserving the source ±3° (stamp) / ±22° (ribbon). No spinning.
- Blurred shadow tweens or filter: blur() (sakura uses zero-blur exclusively).
- Italic on emphasis — the red `<em>` color shift IS the emphasis, never `font-style: italic`.
- Slide-in transitions (translateX 100%) — use cross-blend or paper-flip register only.
- More than 5 rainbow colors on a single scene at hero size. Pick one dominant; subordinate the rest.

**Stagger budget**

160-220ms between elements (slower than 8-bit-orbit's 80-120ms — sakura is considered, not arcade). Total scene-in stagger ≤ 700ms. Hero / lockup land first; petals + ribbons last (atmosphere drops in after the focal beat).

## §G Voice transform recipe (apply to brand's voice from §1 DNA)

Take the brand's product description / value prop. Transform with:

1. Strip filler ("really", "very", "just"); keep verbs imperative.
2. Hero display headlines: 2-5 words, **sentence case OR uppercase** depending on register — Big Shoulders Display works at both with negative tracking. Sentence case for cover/quote spreads; uppercase for manifesto / loud catalogue beats.
3. Inline emphasis inside display: wrap one keyword in `<em>` for red color shift (blue on quote spreads where red is overloaded). One emphasis per headline maximum.
4. Tracked-caps micro-labels (eyebrows, chips, meta labels): UPPERCASE with 0.16em tracking standard, 0.2em for eyebrows, 0.32em for manifesto kickers.
5. Stat numerals: bare numeric + smaller inline unit (`26K`, `61%`), unit at ~34% the numeral size in `var(--ink)`. Primary stat in red; pair with blue if a second stat appears.
6. Mono spec rows: `KEY → VALUE` lines, JetBrains Mono 400, key opacity 0.7. Treat as catalogue spec sheet, not body copy.

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: hero=`Teams design <em>together</em>` / eyebrow=`REAL-TIME COLLABORATION` / stat=`4M<sub>+</sub>` (in red) / spec-row=`MODE → MULTIPLAYER`

## §H Scene composition hints (Phase 4b layout guidance)

**Surface alternation across scenes**

- Default: warm-cream paper (`--anchor-paper`) ground with `--paper-grain` halftone overlay at 16% opacity. **Required on every scene** — removing the grain breaks the print register immediately.
- Variant: `--anchor-paper-dk` (slightly darker tonal cream) for layered half-regions or secondary panel grounds within a cream scene.
- One ink-inverted scene allowed per 6-scene video (manifesto / closing colophon): `--anchor-ink` ground with cream type. Use sparingly — the rainbow stops working on dark grounds.
- Diagonal ribbon-band scenes serve as the "atmospheric ambition" beat: cover, mid-stretch quote, closing colophon. Avoid back-to-back ribbon scenes.

**Hero text**

- Big Shoulders Display weight 900 with negative letter-spacing -0.012em to -0.025em on every display moment. Lighter tracking breaks the catalogue-front density signature.
- Hero takes ≥ 50% canvas width; pair with petal-cluster anchor or ribbon-band atmosphere, never both at hero weight.
- Inline `<em>` switches color to red (default) or blue (quote spreads where red is overloaded). Never italic.
- Hero numerals (stat-counter): 110-240px Big Shoulders 900 in `--sk-red`; inline sub-unit at 34% size in `--anchor-ink`.

**Brand color placement (role contract)**

- Borders are **always** ink (`--anchor-ink`). Colored borders do not exist.
- Body text is **always** ink (`--anchor-ink`) at 0.85-1.0 opacity. Rainbow colors never carry body copy.
- Rainbow colors appear as: petal-cluster fills, ribbon-band strips, card topstrip tabs, chip backgrounds, lockup-bar background, red-stamp body, equalizer bar fills.
- One scene = **one dominant rainbow color** carrying the lockup or topstrip; other rainbow colors appear only as petal/ribbon supporting cast.
- Red (`--sk-red`) is doubly reserved: inline `<em>` emphasis inside display + primary hero numeral. Don't dilute it as a card-topstrip on a scene that also carries a red stat.

**Paper-grain is sacred**

- The 4px-period halftone-dot texture (`--paper-grain`) at 16% opacity sits over every scene. Required.
- Period is fixed at 4px regardless of viewport. Scaling the texture period breaks the print register.

**Transitions between scenes**

- Default 280ms ease opacity cross-blend (matches the template's intrinsic `.slide` transition).
- Hard cut allowed only on stat-counter / hero-numeral beat where the impact is wanted.
- Never slide / push / blur-fade between scenes — the catalogue is page-flip register, not scroll.

**Ambient motion**

- Petal-cluster drift: sine.inOut, period 6-10s, amplitude ±8-16px on the cluster container (not per-petal). Per-petal drift breaks the overlap geometry.
- Ribbon-band parallax: sine.inOut, period 8-12s, amplitude ±12-20px on x-axis. Rotate stays locked at ±22°.
- Paper-grain stays static. Animating the grain reveals the deterministic radial-gradient tile and looks broken.

**Density philosophy**

- Catalogue register depends on visual richness — pair hero with petal anchor + spec checklist + footer micro-label, OR hero with ribbon atmosphere + stamp + page number. A scene with only a centered headline reads as manifesto (deliberate sparsity); every other scene should feel like a packed catalogue page.
- One manifesto / sparsity scene per 6-scene video. The rest carry concurrent hero + atmosphere + tabular/data + decorative marks.

## §M Atomic motifs (gestures the plan agent can reference)

Each motif is a **single reusable gesture** that lives inside a larger pattern. Patterns compose motifs; motifs do not compose anything. The plan agent treats motifs as the smallest cite-able vocabulary — a scene description can say "uses motif:petal-cluster on the cover corner" without specifying which pattern the corner sits in.

```motifs
[
  {
    "id": "petal-cluster",
    "label": "Petal cluster",
    "role": "decorative-anchor",
    "surface_safe": ["paper", "paper-dk"],
    "description": "4-5 overlapping perfect-circle petals in mixed rainbow colors (red / pink / orange / yellow / green / blue). Never all the same color; never elliptical. The signature decorative anchor — slide corners, brand-lockup anchor, quote-spread ornament.",
    "wide": true,
    "demo": "<div class=\"sk-motif-petals\"><span class=\"p p1\"></span><span class=\"p p2\"></span><span class=\"p p3\"></span><span class=\"p p4\"></span><span class=\"p p5\"></span></div>",
    "css": ".sk-motif-petals{position:relative;width:180px;height:140px}.sk-motif-petals .p{position:absolute;aspect-ratio:1/1;border-radius:50%;width:64px}.sk-motif-petals .p1{background:var(--sk-red);left:8px;top:32px}.sk-motif-petals .p2{background:var(--sk-pink);left:52px;top:8px;width:56px}.sk-motif-petals .p3{background:var(--sk-orange);left:88px;top:48px;width:60px}.sk-motif-petals .p4{background:var(--sk-green);left:36px;top:64px;width:52px}.sk-motif-petals .p5{background:var(--sk-blue);left:104px;top:80px;width:44px}"
  },
  {
    "id": "ribbon-band",
    "label": "Diagonal ribbon band",
    "role": "atmospheric-layer",
    "surface_safe": ["paper", "paper-dk"],
    "description": "Stack of 5 solid-color horizontal bars (pink / orange / yellow / green / blue) rotated ±22° to sweep diagonally across a region. Oversized (160% width) so it bleeds off the slide edges. Atmospheric layer behind hero content on cover and closing spreads.",
    "wide": true,
    "demo": "<div class=\"sk-motif-ribbon\"><span class=\"r r1\"></span><span class=\"r r2\"></span><span class=\"r r3\"></span><span class=\"r r4\"></span><span class=\"r r5\"></span></div>",
    "css": ".sk-motif-ribbon{position:relative;width:100%;height:120px;overflow:hidden}.sk-motif-ribbon .r{position:absolute;left:-30%;width:160%;height:14px;transform:rotate(-22deg);transform-origin:center}.sk-motif-ribbon .r1{background:var(--sk-pink);top:14px}.sk-motif-ribbon .r2{background:var(--sk-orange);top:38px}.sk-motif-ribbon .r3{background:var(--sk-yellow);top:62px}.sk-motif-ribbon .r4{background:var(--sk-green);top:86px}.sk-motif-ribbon .r5{background:var(--sk-blue);top:110px}"
  },
  {
    "id": "rosette-seal",
    "label": "Rosette seal (32-point starburst)",
    "role": "authority-mark",
    "surface_safe": ["paper", "paper-dk"],
    "description": "32-point starburst clip-path filled ink with cream glyph (1-4 chars in Big Shoulders 900). Authority mark on covers and closing colophons. Polygon point count is fixed — variations break the seal-recognition signal.",
    "demo": "<div class=\"sk-motif-seal\"><span>26</span></div>",
    "css": ".sk-motif-seal{display:flex;align-items:center;justify-content:center;width:clamp(72px,8vw,120px);aspect-ratio:1/1;background:var(--anchor-ink);clip-path:var(--starburst-clip)}.sk-motif-seal span{font-family:var(--f-disp-native);font-weight:900;font-size:clamp(22px,2vw,38px);line-height:.9;letter-spacing:-.01em;text-transform:uppercase;color:var(--anchor-paper)}"
  },
  {
    "id": "red-stamp",
    "label": "Red rectangular stamp",
    "role": "status-badge",
    "surface_safe": ["paper", "paper-dk"],
    "description": "Red rectangle with cream text in Big Shoulders 900, rotated -3°. Reserved for status / approval / product-callout moments (COMPLETE, AS SEEN ON, LIMITED). Overuse degrades the signal — one per spread maximum.",
    "demo": "<div class=\"sk-motif-stamp\">Limited · Vol 26</div>",
    "css": ".sk-motif-stamp{display:inline-block;background:var(--sk-red);color:var(--anchor-paper);padding:10px 22px;font-family:var(--f-disp-native);font-weight:900;font-size:clamp(20px,1.6vw,28px);line-height:1;letter-spacing:.02em;text-transform:uppercase;transform:rotate(-3deg)}"
  },
  {
    "id": "card-topstrip",
    "label": "Card topstrip",
    "role": "pantone-tab",
    "surface_safe": ["paper"],
    "description": "Colored horizontal band (red / pink / orange / blue) running the full width of a product card's top — reads as a Pantone color tab identifying the card variant. Paired with a 1.5px ink border on the rest of the card.",
    "wide": true,
    "demo": "<div class=\"sk-motif-card\"><div class=\"sk-motif-card-strip\"></div><div class=\"sk-motif-card-body\"><div class=\"sk-motif-card-name\">Model 26</div><div class=\"sk-motif-card-spec\">MODE → STEREO</div></div></div>",
    "css": ".sk-motif-card{display:inline-block;width:200px;background:var(--anchor-paper);border:var(--border-ink);overflow:hidden}.sk-motif-card-strip{height:22px;background:var(--sk-pink)}.sk-motif-card-body{padding:12px 16px}.sk-motif-card-name{font-family:var(--f-disp-native);font-weight:900;font-size:clamp(22px,2vw,32px);line-height:.94;letter-spacing:-.012em;text-transform:uppercase;color:var(--anchor-ink)}.sk-motif-card-spec{margin-top:8px;font-family:var(--f-mono-native);font-weight:400;font-size:11px;line-height:1.3;letter-spacing:.02em;text-transform:uppercase;color:var(--anchor-ink);opacity:.7}"
  },
  {
    "id": "bar-eq",
    "label": "Equalizer bar chart",
    "role": "data-vu-meter",
    "surface_safe": ["paper", "paper-dk"],
    "description": "Multi-column equalizer where each column stacks 6 segments column-reverse (bottom-up like a VU meter). 'On' segments fill with one rainbow color per column; 'off' segments fill with a translucent ink tint. The cassette-package's data-as-decoration moment.",
    "wide": true,
    "demo": "<div class=\"sk-motif-eq\"><div class=\"col c1\"><i></i><i></i><i></i><i class=\"on\"></i><i class=\"on\"></i><i class=\"on\"></i></div><div class=\"col c2\"><i></i><i></i><i class=\"on\"></i><i class=\"on\"></i><i class=\"on\"></i><i class=\"on\"></i></div><div class=\"col c3\"><i></i><i></i><i></i><i></i><i class=\"on\"></i><i class=\"on\"></i></div><div class=\"col c4\"><i></i><i class=\"on\"></i><i class=\"on\"></i><i class=\"on\"></i><i class=\"on\"></i><i class=\"on\"></i></div><div class=\"col c5\"><i></i><i></i><i></i><i class=\"on\"></i><i class=\"on\"></i><i class=\"on\"></i></div></div>",
    "css": ".sk-motif-eq{display:flex;gap:8px;width:200px;height:120px}.sk-motif-eq .col{flex:1;display:flex;flex-direction:column-reverse;gap:2px}.sk-motif-eq .col i{flex:1;background:rgba(58,37,22,.1);border:1px solid rgba(58,37,22,.22)}.sk-motif-eq .c1 i.on{background:var(--sk-red);border-color:var(--sk-red)}.sk-motif-eq .c2 i.on{background:var(--sk-pink);border-color:var(--sk-pink)}.sk-motif-eq .c3 i.on{background:var(--sk-orange);border-color:var(--sk-orange)}.sk-motif-eq .c4 i.on{background:var(--sk-green);border-color:var(--sk-green)}.sk-motif-eq .c5 i.on{background:var(--sk-blue);border-color:var(--sk-blue)}"
  },
  {
    "id": "qbody-shadow",
    "label": "Qbody hard-offset shadow",
    "role": "elevated-callout",
    "surface_safe": ["paper", "paper-dk"],
    "description": "Paper callout with 1.5px ink border and the signature 8px hard ink-offset shadow (zero blur). Reserved for quote callouts sitting on top of diagonal ribbons — the moment that earns elevation. Overuse degrades the print register.",
    "demo": "<div class=\"sk-motif-qbody\">Print is the message.</div>",
    "css": ".sk-motif-qbody{display:inline-block;background:var(--anchor-paper);border:var(--border-ink);box-shadow:var(--shadow-ink-hard);padding:20px 28px;font-family:var(--f-disp-native);font-weight:900;font-size:clamp(24px,2.4vw,40px);line-height:.92;letter-spacing:-.018em;text-transform:uppercase;color:var(--anchor-ink)}"
  }
]
```

The `motifs` JSON block above is the SOLE source of truth. build-design.mjs reads it to render §M cards in design.html. The Phase 3 plan agent and Phase 4b scene worker may cite motifs by `id` when annotating which gesture a scene relies on.

**Materials lexicon** (informational — these are the composition atoms behind the patterns):

- petal-cluster · ribbon-band · rosette-seal · red-stamp · card-topstrip · bar-eq · qbody-shadow · spec-checklist · ledger-row · chip · paper-grain · topbar-rule

## §I Page-level CSS (overrides design.html's neutral chrome — makes the doc itself read as sakura-chroma)

```css
/* ── Preset-native typography vars (loaded via preset-meta.chromeFonts.googleFontsHref).
 * These let the doc chrome render in Big Shoulders Display / Albert Sans /
 * JetBrains Mono / Noto Sans JP regardless of which brand DNA the preset is
 * applied to. The §6 component preview, §M motifs grid, and §T type-role atlas
 * read these via .preset-native-scope.
 *
 * The script slot points at Noto Sans JP because Sakura Chroma's only "script"
 * voice is the Japanese cultural-accent character (限定版) — there is no
 * handwritten face in the system. Fallback chains end in faces that still
 * carry the preset's vibe (Archivo Black / Oswald for the condensed display;
 * Inter / IBM Plex Sans for body). */
:root {
  --f-disp-native:
    "Big Shoulders Display", "Archivo Black", "Oswald", "Impact", "Helvetica Neue", sans-serif;
  --f-body-native:
    "Albert Sans", "Inter", "IBM Plex Sans", -apple-system, BlinkMacSystemFont, system-ui,
    sans-serif;
  --f-script-native: "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif;
  --f-mono-native:
    "JetBrains Mono", "IBM Plex Mono", "Space Mono", "Menlo", ui-monospace, monospace;
}

/* .preset-native-scope: re-bind brand DNA font tokens to preset-native families.
 * Wraps §6 component previews, §M motif demos, and §T type-role atlas so
 * var(--font-*) resolves to Big Shoulders / Albert Sans / Noto Sans JP /
 * JetBrains Mono regardless of brand DNA. The paste-ready component source is
 * untouched — Phase 4b still grep + paste original `var(--font-display)`
 * tokens, which resolve to brand DNA at scene-render time. */
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
body::before {
  /* Paper-grain halftone on design.html itself */
  content: "";
  position: fixed;
  inset: 0;
  background-image: var(--paper-grain);
  background-size: var(--paper-grain-size);
  opacity: var(--paper-grain-opacity);
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: multiply;
}
.title-card {
  background: var(--anchor-paper);
  border-bottom: var(--border-ink);
  padding: 96px 0 80px;
}
.title-display {
  font-family: "Big Shoulders Display", sans-serif;
  font-weight: 900;
  letter-spacing: -0.022em;
  color: var(--anchor-ink);
}
.brand-name {
  color: var(--sk-red);
  font-weight: 900;
}
.style-name {
  color: var(--sk-blue);
  font-weight: 900;
}
.ds-section {
  border-top: var(--border-ink);
  padding: 80px 0;
}
h2 {
  font-family: "Big Shoulders Display", sans-serif;
  font-weight: 900;
  letter-spacing: -0.018em;
  color: var(--anchor-ink);
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--sk-red);
  font-weight: 700;
}
.type-card,
.voice-pair,
.comp-card {
  border: var(--border-ink) !important;
  border-radius: 0 !important;
  background: var(--anchor-paper) !important;
  box-shadow: var(--shadow-ink-hard) !important;
}
/* dna-swatch keeps inline brand-color background */
.dna-swatch {
  border: var(--border-ink) !important;
  border-radius: 0 !important;
  box-shadow: var(--shadow-ink-hard) !important;
}
.comp-head {
  background: var(--anchor-ink) !important;
  color: var(--anchor-paper) !important;
  border-bottom: var(--border-ink) !important;
}
.ds-code {
  background: var(--anchor-paper-dk) !important;
  border: var(--border-ink);
  border-radius: 0 !important;
  color: var(--anchor-ink) !important;
}

/* ── §M Motifs grid: atomic gestures.
 * 12-col grid of small cards each teaching ONE reusable gesture. Cards may
 * declare a surface (paper / paper-dk) to demonstrate the gesture against its
 * native bg. Sakura Chroma's paper anchors carry the print register on every
 * demo. */
.ds-motif-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}
.ds-motif {
  grid-column: span 4;
  min-height: 280px;
  padding: 28px;
  border: var(--border-ink);
  border-radius: 0;
  background: var(--anchor-paper);
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
.ds-motif.ds-motif-surface-paper-dk {
  background: var(--anchor-paper-dk);
}
.ds-motif-h {
  margin: 0;
  font-family: var(--f-disp-native);
  font-weight: 900;
  font-size: clamp(24px, 2.6vw, 36px);
  line-height: 1;
  letter-spacing: -0.018em;
  text-transform: uppercase;
  color: var(--anchor-ink);
}
.ds-motif-desc {
  margin: 0;
  font-family: var(--f-body-native);
  font-weight: 400;
  font-size: 14px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--anchor-ink) 75%, transparent);
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
  font-family: var(--f-mono-native);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--anchor-ink);
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

/* ── §T Type-role atlas. Container = paper-on-paper card with 1.5px ink border.
 * Each .t-trole-* class encodes the role's family / size / weight / leading /
 * tracking / case / decoration. Family selectors use var(--font-*) tokens so
 * the atlas renders in BRAND DNA fonts; only the recipe is preset-declared.
 * Decoration (sk-red color, hard ink shadow, stamp/seal/ribbon treatments)
 * stays declared with sakura-chroma colors. */
.ds-trole-box {
  display: flex;
  flex-direction: column;
  border: var(--border-ink);
  border-radius: 0;
  background: var(--anchor-paper);
  overflow: hidden;
  margin-top: 24px;
}
.ds-trole-row {
  padding: 28px 32px;
  border-bottom: var(--border-ink-hairline);
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

/* ── Type-role samples. Each .t-trole-* mirrors a sakura-chroma typography
 * token (disp-hero / disp-statement / num-hero / mono / ...) but uses
 * var(--font-display/body/mono/script) so the actual typeface comes from
 * brand DNA. Decoration is preset-native: ink color, sk-red emphasis,
 * red-stamp rotation, starburst seal, ribbon-bar fill. */
.t-trole-disp-hero {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(120px, 14vw, 280px);
  line-height: 0.84;
  letter-spacing: -0.025em;
  text-transform: uppercase;
  color: var(--anchor-ink);
}
.t-trole-disp-statement {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(70px, 8.4vw, 168px);
  line-height: 0.86;
  letter-spacing: -0.022em;
  text-transform: uppercase;
  color: var(--anchor-ink);
}
.t-trole-disp-statement em {
  font-style: normal;
  color: var(--sk-red);
}
.t-trole-disp-section {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(52px, 5.6vw, 100px);
  line-height: 0.9;
  letter-spacing: -0.018em;
  text-transform: uppercase;
  color: var(--anchor-ink);
}
.t-trole-disp-quote {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(48px, 5.4vw, 110px);
  line-height: 0.92;
  letter-spacing: -0.018em;
  text-transform: uppercase;
  color: var(--anchor-ink);
}
.t-trole-disp-card-name {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(28px, 2.6vw, 48px);
  line-height: 0.94;
  letter-spacing: -0.012em;
  text-transform: uppercase;
  color: var(--anchor-ink);
}
.t-trole-num-hero {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(110px, 11vw, 240px);
  line-height: 0.86;
  letter-spacing: -0.025em;
  text-transform: uppercase;
  color: var(--sk-red);
}
.t-trole-num-hero sub {
  font-size: 34%;
  vertical-align: baseline;
  color: var(--anchor-ink);
}
.t-trole-ttl-row {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(22px, 1.7vw, 30px);
  line-height: 1.1;
  letter-spacing: -0.005em;
  color: var(--anchor-ink);
}
.t-trole-body {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(14px, 1vw, 17px);
  line-height: 1.5;
  color: var(--anchor-ink);
  max-width: 60ch;
  margin: 0;
}
.t-trole-body-emphasis {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: clamp(15px, 1.1vw, 20px);
  line-height: 1.4;
  color: var(--anchor-ink);
  max-width: 56ch;
  margin: 0;
}
.t-trole-micro {
  font-family: var(--font-body);
  font-weight: 700;
  font-size: clamp(12px, 0.9vw, 14px);
  line-height: 1.2;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--anchor-ink);
}
.t-trole-micro-xl {
  font-family: var(--font-body);
  font-weight: 700;
  font-size: clamp(12px, 0.92vw, 14px);
  line-height: 1.2;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--anchor-ink);
}
.t-trole-mono {
  font-family: var(--font-mono);
  font-weight: 400;
  font-size: clamp(11px, 0.78vw, 12px);
  line-height: 1.3;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--anchor-ink);
}
.t-trole-mono-tag {
  display: inline-block;
  font-family: var(--font-mono);
  font-weight: 400;
  font-size: clamp(12px, 0.85vw, 14px);
  line-height: 1;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: var(--sk-pink);
  color: var(--anchor-paper);
  padding: 4px 10px;
}
.t-trole-stamp-text {
  display: inline-block;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(20px, 1.6vw, 28px);
  line-height: 1;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  background: var(--sk-red);
  color: var(--anchor-paper);
  padding: 10px 22px;
  transform: rotate(-3deg);
}
.t-trole-seal-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: clamp(72px, 8vw, 120px);
  aspect-ratio: 1 / 1;
  background: var(--anchor-ink);
  clip-path: var(--starburst-clip);
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(22px, 2vw, 38px);
  line-height: 0.9;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: var(--anchor-paper);
}
.t-trole-jp-accent {
  font-family: var(--font-script);
  font-weight: 500;
  letter-spacing: 0;
  color: var(--anchor-ink);
}
```
