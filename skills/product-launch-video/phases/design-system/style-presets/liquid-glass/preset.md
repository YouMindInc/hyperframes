```preset-meta
{
  "name": "liquid-glass",
  "label": "Liquid Glass",
  "fingerprint": {
    "shadow": "inset-highlight",
    "border": "hairline-translucent",
    "motion": "rise-and-settle",
    "density": "low",
    "contrast": "high-on-aurora"
  },
  "match_signals": [
    { "kind": "hairline_border",    "weight": 0.20 },
    { "kind": "minimal_decoration", "weight": 0.15 },
    { "kind": "shadow_zero_blur",   "weight": 0.10 }
  ],
  "requires_capabilities": [
    {
      "kind": "block_installed",
      "block": "liquid-glass-widgets",
      "verify_file": "hyperframes/compositions/liquid-glass-widgets.html",
      "verify_lib": "hyperframes/compositions/lib/liquid-glass.iife.js",
      "auto_install": "npx hyperframes add liquid-glass-widgets",
      "alternates": ["liquid-glass-notification", "liquid-glass-context-menu", "liquid-glass-media-controls", "ios26-liquid-glass", "macos-tahoe-liquid-glass", "vfx-liquid-glass"]
    },
    {
      "kind": "env_var_set",
      "var": "PRODUCER_HEADLESS_SHELL_PATH",
      "reason": "WebGPU-capable browser (Brave / Chrome Canary). Cannot auto-install — varies by OS / user environment.",
      "auto_install": null
    }
  ],
  "best_for": ["premium SaaS", "AI products", "hardware launches", "futuristic tech", "consumer apps with depth"],
  "avoid_for": ["print-feel brands", "low-power render targets", "warm hand-crafted registers"],
  "chromeFonts": {
    "googleFontsHref": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap",
    "display": "Inter",
    "body": "Inter",
    "script": "Inter",
    "mono": "JetBrains Mono"
  }
}
```

> `chromeFonts` makes the design.html doc chrome (title-card, section heads, h2/h3, lede paragraphs, eyebrows) render in the preset's NATIVE typography — Inter + JetBrains Mono — instead of the brand DNA fonts. Liquid-glass is a single-face system: Inter does display + body + script (the preset refuses a hand-script voice — refraction smears thin strokes), with JetBrains Mono reserved for chrome / numeric metadata. The brand fonts still apply to §6 component code (paste-ready for Phase 4b). §M motifs grid uses `.preset-native-scope` so var(--font-display/body/script/mono) re-resolves to these native families for the live preview.

> Liquid-glass auto-infers normally now (its `match_signals` light up on
> hairline-border + minimal-decoration sites), **but** `requires_capabilities`
> in the preset-meta gates auto-selection: build-design.mjs sets `combined=0`
>
> - `capabilities_missing=[...]` when (a) `lib/liquid-glass.iife.js` is absent
>   or (b) `$PRODUCER_HEADLESS_SHELL_PATH` is unset. The design-system subagent
>   auto-runs `npx hyperframes add liquid-glass-widgets` when liquid-glass wins
>   review and the block is missing; the env var is OS-specific and falls to
>   the user — agent reports it as an anomaly in the completion summary.

## §A Director's intent

Frosted glass over moving color. Surfaces are weightless — light passes
**through** them, not off them. Type sits on glass; glass sits on aurora;
aurora carries the brand. No element is the canvas; depth is the canvas.

**One reading layer at a time.** A scene has glass surfaces (panels, pills,
cards) floating over an animated color field. The eye reads what's on the
glass, not the glass itself. Decoration is reserved for the aurora — the
surfaces stay neutral, just specular highlight + edge-light + chromatic
fringe at the rim.

**Surfaces rise; they don't pop.** Entry is a soft upward translate from
below the frame + scale 0.86→1.0 with `back.out(1.04)` — the back overshoot
is tiny on purpose. Hard cuts and bouncy springs break the wetness.

## §B Decoration tokens (merge into design.html `:root`)

**Wiring contract.** The `liquid-glass.iife.js` shader reads exactly these
raw `--lg-*` properties per panel: `--lg-blur`, `--lg-refraction`,
`--lg-corner-radius`, `--lg-z-radius`, `--lg-specular`, `--lg-fresnel`,
`--lg-edge-highlight`, `--lg-chrom-aberration`, `--lg-saturation`,
`--lg-tint`, `--lg-brightness`, `--lg-shadow-opacity`, `--lg-shadow-spread`,
`--lg-shadow-offset-y`, `--lg-opacity`, `--lg-distortion`, `--lg-bevel-mode`.

Three archetypes are declared here with archetype-namespaced keys
(`--lg-widget-*`, `--lg-notif-*`, `--lg-menu-*`). Each component selects
its archetype by aliasing the raw keys, e.g. `--lg-blur: var(--lg-widget-blur)`.
Tune a knob here → all panels of that archetype move together. Brand-DNA
联动 (e.g. saturation tracking brand vibrancy) goes here too — anchored
on `--brand-*` and resolved once, consumed by every component.

```css
/* Aurora canvas — overwrites brutalism/editorial canvas. */
--liquid-bg-deep: #0a0218; /* mandatory dark base — aurora needs blackpoint */
--liquid-bg-fallback: linear-gradient(160deg, #0a0218 0%, #15082a 60%, #062035 100%);

/* ── Archetype 1: WIDGET ────────────────────────────────────────
   ≤ 280px panels: stat cards, pill chips, small toggles. */
--lg-widget-blur: 0.42;
--lg-widget-refraction: 0.82;
--lg-widget-specular: 0.34;
--lg-widget-fresnel: 1.25;
--lg-widget-edge-highlight: 0.26;
--lg-widget-chrom-aberration: 0.08;
--lg-widget-saturation: 0.38;
--lg-widget-corner-radius: 28;
--lg-widget-z-radius: 46;

/* ── Archetype 2: NOTIFICATION / OVERLAY ────────────────────────
   280-600px floating panels needing cast shadow: toasts, banners,
   media bars, sliders. */
--lg-notif-blur: 0.22;
--lg-notif-refraction: 0.6;
--lg-notif-specular: 0.2;
--lg-notif-fresnel: 0.9;
--lg-notif-edge-highlight: 0.1;
--lg-notif-chrom-aberration: 0.05;
--lg-notif-saturation: 0.25;
--lg-notif-corner-radius: 36;
--lg-notif-z-radius: 38;
--lg-notif-shadow-opacity: 0.35;
--lg-notif-shadow-spread: 14;
--lg-notif-shadow-offset-y: 4;

/* ── Archetype 3: MENU / DENSE CONTENT ──────────────────────────
   ≥ 350px panels with text rows / list / dense UI. Desaturate +
   tint up so near-black ink stays legible on the lightened glass. */
--lg-menu-blur: 0.56;
--lg-menu-refraction: 0.52;
--lg-menu-specular: 0.26;
--lg-menu-fresnel: 1;
--lg-menu-edge-highlight: 0.2;
--lg-menu-chrom-aberration: 0.035;
--lg-menu-saturation: -0.24;
--lg-menu-tint: 0.88;
--lg-menu-brightness: 0.54;
--lg-menu-corner-radius: 30;
--lg-menu-z-radius: 48;

/* Type colors on glass */
--ink-on-glass: rgba(255, 255, 255, 0.96);
--ink-on-glass-soft: rgba(255, 255, 255, 0.74);
--ink-on-light-glass: rgb(0, 7, 14); /* for menu/light-tinted glass */
--text-shadow-glass: 0 2px 12px rgba(0, 0, 0, 0.42);
```

**Picking the right archetype.** Panel diameter is the deciding factor, not content:

- ≤ 280px (chip, button, small stat, toggle) → **widget**
- 280-600px floating over content (toast, alert, media-bar, slider) → **notification** (needs shadow)
- ≥ 350px containing text rows / list / dense UI (menu, popover) → **menu** (desaturate + tint up)

## §D Font pairing fallback (if brand fonts not on Google Fonts)

- **display**: `'Inter'` wght 800 · `'SF Pro Display'` (system) · `'Geist'`
- **body**: `'Inter'` wght 500-650 · `'Public Sans'` · `'DM Sans'`
- **mono**: `'JetBrains Mono'` · `'Geist Mono'`

Liquid glass is **type-on-glass, not type-as-hero**. Body weight runs heavier
than usual (550-700) because anti-aliasing fights with refraction — thin
weights smear. Letterspacing 0 to -0.01em; never tight.

## §T Type-role atlas (Phase 4b reads this to size text correctly)

Each entry is a **named type role** with concrete render parameters at 1920×1080 — family token, px range, weight, leading, tracking, case, and any color/shadow decoration. Phase 4b scene workers may cite roles by `id` ("use a `stat-value` here"); the brand DNA fonts plug in automatically via `var(--font-*)` tokens. Liquid-glass is type-on-glass: every role assumes the text sits over a refracting panel or the aurora, so `text-shadow: var(--text-shadow-glass)` is the default decoration on every legibility-critical role (display, headline, body, label). Weight floors stay at 550 because thin strokes smear through refraction.

The atlas is the **sole authoring source** for non-component text. If a scene needs a `stat-value` numeral that isn't covered by §6 components, the worker reads role `stat-value` here and writes inline CSS from these values. Do NOT invent ad-hoc sizes — weight under 550 at body scale collapses through the IIFE shader.

```type-roles
[
  {
    "id": "display-cover",
    "family": "display",
    "purpose": "cover hero on aurora — type sits on glass card or floats directly on the aurora",
    "px_min": 96, "px_max": 180, "weight": 800, "leading": "0.95", "tracking": "-0.01em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-display-cover\">{BRAND_NAME}</div>"
  },
  {
    "id": "headline",
    "family": "display",
    "purpose": "primary slide headline on glass panel",
    "px_min": 56, "px_max": 96, "weight": 700, "leading": "1", "tracking": "-0.01em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-headline\">Design together</div>"
  },
  {
    "id": "statement",
    "family": "display",
    "purpose": "long-form quoted statement on glass — wraps across panels",
    "px_min": 40, "px_max": 64, "weight": 650, "leading": "1.1", "tracking": "0", "case": "sentence",
    "sample_html": "<div class=\"t-trole-statement\">Light passes through. Surfaces stay weightless.</div>"
  },
  {
    "id": "stat-value",
    "family": "display",
    "purpose": "hero numeral inside widget glass card — numbers-as-nouns voice",
    "px_min": 64, "px_max": 120, "weight": 800, "leading": "1", "tracking": "-0.02em", "case": "sentence",
    "sample_html": "<div class=\"t-trole-stat-value\">48ms</div>"
  },
  {
    "id": "h3",
    "family": "display",
    "purpose": "sub-headline / panel title",
    "px_min": 28, "px_max": 44, "weight": 650, "leading": "1.15", "tracking": "0", "case": "sentence",
    "sample_html": "<div class=\"t-trole-h3\">Panel title</div>"
  },
  {
    "id": "lead",
    "family": "body",
    "purpose": "lead paragraph on glass — heavier than usual to survive refraction",
    "px_min": 20, "px_max": 28, "weight": 600, "leading": "1.45", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-lead\">The lead carries one idea per panel. Heavier weight than usual — refraction softens edges.</p>"
  },
  {
    "id": "body",
    "family": "body",
    "purpose": "default body paragraph on glass",
    "px_min": 16, "px_max": 22, "weight": 550, "leading": "1.55", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-body\">Body holds at 16-22px, weight 550 minimum. Thinner reads as smudge through the glass.</p>"
  },
  {
    "id": "caption",
    "family": "body",
    "purpose": "small caption on glass — pushes the floor of legibility through refraction",
    "px_min": 14, "px_max": 16, "weight": 600, "leading": "1.4", "tracking": "0", "case": "sentence",
    "sample_html": "<p class=\"t-trole-caption\">Caption sits at 14-16px / 600. Below 14px disappears into the refraction.</p>"
  },
  {
    "id": "label-eyebrow",
    "family": "body",
    "purpose": "uppercase tracked label above a headline (panel eyebrow / section label)",
    "px_min": 12, "px_max": 14, "weight": 600, "leading": "1.2", "tracking": "0.18em", "case": "upper",
    "sample_html": "<div class=\"t-trole-label-eyebrow\">Featured panel</div>"
  },
  {
    "id": "label-mono",
    "family": "mono",
    "purpose": "metadata chrome / slide counter / unit suffix — JetBrains Mono, soft white",
    "px_min": 11, "px_max": 14, "weight": 500, "leading": "1.3", "tracking": "0.06em", "case": "upper",
    "sample_html": "<div class=\"t-trole-label-mono\">01 / Surfaces</div>"
  },
  {
    "id": "pill",
    "family": "body",
    "purpose": "gradient pill chip on glass — brand-primary→secondary fill, white text",
    "px_min": 13, "px_max": 15, "weight": 600, "leading": "1", "tracking": "0.04em", "case": "upper",
    "sample_html": "<div><span class=\"t-trole-pill\">Live now</span></div>"
  },
  {
    "id": "unit-suffix",
    "family": "mono",
    "purpose": "unit appended to a stat-value (ms / GB / %) — sits at 28-40% of the numeral",
    "px_min": 18, "px_max": 32, "weight": 500, "leading": "1", "tracking": "0", "case": "sentence",
    "sample_html": "<div><span class=\"t-trole-stat-value\">48</span><span class=\"t-trole-unit-suffix\">ms</span></div>"
  }
]
```

The atlas omits the glass card surface itself (a §M motif, not a text role) and the aurora background (a structural canvas declared in §B).

## §E Motion (GSAP consts — REPLACES site ease)

```js
const EASE = {
  entry: "back.out(1.04)", // soft overshoot — tiny "settle"
  emphasis: "power3.inOut", // viscous, liquid acceleration
  exit: "power2.in", // sink, don't fly
  drift: "sine.inOut", // ambient float on idle panels
};
const DUR = {
  snap: 0.28,
  med: 0.5,
  slow: 1.1, // aurora cycles use longer than this
};
// RULE: every glass panel entry is a translate + scale, never opacity-only.
// RULE: never crossfade two glass panels — the lower one will look murky.
// RULE: panels are continuous — never "blink in". Move them onstage from off-canvas.
```

## §E.5 Motion choreography

**Allowed primitives**

- Upward translate from `top: 1160px` (below frame) → final position with `back.out(1.04)`.
- Scale 0.86 → 1.0 paired with the translate (separate `transformOrigin` per panel).
- Stagger 100-140ms between sibling panels (widgets), 30-60ms for menu items.
- Aurora time uniform `uTime` advances linearly over scene duration (driver tween).
- Idle drift on long-held panels: ±6-8px Y, 3-4s sine cycle, very subtle.

**Forbidden**

- Opacity-only entry. Panels must move; otherwise the refraction reveals no parallax.
- Rotation on glass. (Refraction maths assumes axis-aligned.)
- Crossfade between panels in the same canvas. Stack visually with z-index, not opacity.
- Sharp edges in the aurora — no hard shapes or text on the bg layer. It must
  stay diffuse so refraction has something to bend.
- Backdrop-filter shortcuts. `--lg-blur` is **not** CSS `backdrop-filter`; it's
  a uniform read by the IIFE shader. Don't substitute.

**Transitions between scenes**

Default is a held aurora (uniform shader across scenes) with panels lifting
out (`top: +=760, ease: power2.in`) on the outgoing scene and rising in on
the incoming. Aurora carries continuity — never reset `uTime` between scenes
in the same composition.

## §G Voice transform recipe (apply to brand's voice from §1 DNA)

Take the brand's product description / value prop. Transform with:

1. **Present tense, declarative, no hedging.** "Ships in seconds" not "can ship in seconds".
2. **Surface > capability.** Talk about what the user sees and touches, not what runs underneath. "Tap and hold" beats "leverages the new context API".
3. **Numbers as nouns.** "Forty-eight milliseconds." (Period.) — not "as fast as 48ms".
4. **One verb, one object, one beat per panel.** Captions sit on glass; long sentences won't.
5. **No exclamation, no all-caps.** The medium is dramatic enough.

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: `Design together. In real time. On glass.`

## §H Scene composition hints (Phase 4b layout guidance)

**Runtime prerequisites — read first**

Liquid glass scenes will NOT render in a default Puppeteer/Chrome stable. Before
authoring or rendering a liquid-glass composition you must:

1. **Install one of the liquid-glass runtime blocks** to get
   `lib/liquid-glass.iife.js` and the three.js dependencies wired:

   ```bash
   npx hyperframes add liquid-glass-widgets
   # OR pick another:  liquid-glass-notification | liquid-glass-context-menu
   #                   liquid-glass-media-controls | ios26-liquid-glass
   #                   macos-tahoe-liquid-glass    | vfx-liquid-glass
   ```

   You only need one — they all ship the same `lib/liquid-glass.iife.js`.

2. **Use a WebGPU-capable browser for rendering**: Brave or Chrome Canary
   with WebGPU enabled. Set:

   ```bash
   export PRODUCER_HEADLESS_SHELL_PATH=/path/to/brave-or-canary
   ```

   The engine auto-passes `--enable-unsafe-webgpu`. See
   `/hyperframes-animation` → `adapters/typegpu.md` for the full setup.

3. **Verify before authoring**: `npx hyperframes doctor` should report
   `webgpu: ok`. If it says `unsupported`, fall back to a different preset
   — liquid-glass will silently render as blank panels otherwise.

**Stage structure**

- Every scene starts with the `liquid-stage` component (§F). The two canvases
  - text-overlay layer are non-negotiable; the IIFE looks for them by id.
- Glass panels go inside `#glass-canvas` as empty `<div class="glass-panel ... liquid-glass">`.
  The `liquid-glass` class is the IIFE hook — without it the panel won't be
  picked up. **Don't put text inside the glass div** — text lives in a sibling
  `.text-overlay` div absolutely positioned to overlap the panel.
- The text-overlay div itself MUST stay transparent (no background, no border,
  no box-shadow). The glass card visuals come from the IIFE pass underneath;
  the overlay only carries text + small icons + gradient pills. Adding a
  background to the overlay creates a visible rectangle that breaks the
  illusion the moment IIFE renders. (The `.stat-text` / `.showcase-text`
  inset highlights in §F are an intentional exception — they fake the **inner
  rim** of the glass card itself, not the body.)

**Aurora shader — copy verbatim from registry**

The Three.js aurora shader is byte-identical across all 8 registry liquid-glass
blocks. **Do not let an LLM rewrite it.** When authoring a scene:

1. Copy the entire `<script>` block (vs string + fs string + Three.js
   renderer/scene/camera/uniforms/quad setup + the `requestGlassRender` /
   `lg.waitForInit()` block) from:
   `registry/blocks/liquid-glass-widgets/liquid-glass-widgets.html` lines 485-601.
2. Keep `uTime` driven by your GSAP timeline (`tl.eventCallback("onUpdate",
() => requestGlassRender(tl.time()))`) — already wired in the source.
3. The `vec3 base = mix(vec3(0.10, 0.02, 0.22), vec3(0.04, 0.10, 0.25), …)`
   line is the only place to retint the aurora toward a brand color — replace
   those two vec3 stops with desaturated versions of `--brand-primary` /
   `--brand-secondary` if you want brand-tinted aurora. Don't touch the snoise
   functions or the ridge math.

**Density & focus**

- **2-4 glass surfaces per scene maximum.** More than that and the refraction
  passes start to mush each other.
- **Surfaces don't overlap.** A small chip _next to_ a card is fine; a chip
  _on_ a card produces a refraction double-bounce that reads as broken.
- **Brand color lives in the aurora and the accent strokes**, not the glass
  tint. Glass stays neutral (white at low opacity). To bring brand color
  forward, push the aurora warm/cool stops toward `--brand-primary` /
  `--brand-secondary` in the shader — don't paint the glass.

**Typography on glass**

- **Body weight ≥ 550.** Thinner reads as smudge through the refraction.
- **Always include `text-shadow: var(--text-shadow-glass)`** on labels —
  the glass refracts and softens edges, the shadow restores legibility.
- **Min text size 14px**, ideally 16-22px. Anything smaller disappears.
- For light-tinted glass (menu archetype): use `--ink-on-light-glass`
  (near-black with a subtle white text-shadow). The IIFE shader inverts
  the perceived contrast on menu panels.

**Color discipline**

- Canvas is the **aurora**, not a flat fill. Never set `body { background: var(--canvas); }`
  in a liquid-glass scene — the canvas variable is overridden to the deep
  base purple that the aurora needs as a blackpoint.
- Brand accent appears as: aurora hot zone tint, pill dots, button gradients,
  album-art conic gradients. Never as a glass panel fill.

**Atmosphere**

- **Transitions between scenes**: hold the aurora across scenes (single
  composition-wide `uTime` driver). Panels slide off the bottom on scene N,
  rise from the bottom on scene N+1. The aurora doesn't blink.
- **Stagger**: 100-140ms between sibling panels, 30-60ms between menu items.

## §M Atomic motifs (gestures the plan agent can reference)

Each motif is a **single reusable gesture** that lives inside a larger pattern. Patterns compose motifs; motifs do not compose anything. The plan agent treats motifs as the smallest cite-able vocabulary — a scene description can say "uses motif:glass-card with a motif:edge-light rim on the stat panel" without specifying which pattern the card sits in.

> Static-preview caveat. The signature `glass-card` and `aurora-field` motifs depend on the `liquid-glass.iife.js` shader pass at scene-render time. The CSS demos below fake the look with `backdrop-filter: blur()` + inset highlight + radial-gradient aurora — close enough for §M preview, NOT a substitute for the IIFE in actual scenes (see §H "Aurora shader — copy verbatim from registry").

```motifs
[
  {
    "id": "glass-card",
    "label": "Glass card",
    "role": "weightless-surface",
    "surface_safe": ["aurora"],
    "description": "The signature panel — frosted backdrop-filter blur, hairline-translucent border, inset highlight on the top edge, soft cast shadow. In scenes the IIFE shader replaces the backdrop-filter with true refraction; this CSS demo approximates the static look for the §M grid.",
    "wide": true,
    "demo": "<div class=\"lg-motif-card\"><div class=\"lg-motif-card-label\">Surface</div><div class=\"lg-motif-card-value\">Glass</div></div>",
    "css": ".lg-motif-card{display:inline-flex;flex-direction:column;gap:8px;padding:24px 32px;border-radius:28px;background:rgba(255,255,255,.08);backdrop-filter:blur(24px) saturate(1.2);-webkit-backdrop-filter:blur(24px) saturate(1.2);border:1px solid rgba(255,255,255,.18);box-shadow:inset 0 1px 0 rgba(255,255,255,.24),0 18px 48px rgba(0,0,0,.42);color:rgba(255,255,255,.96)}.lg-motif-card-label{font-family:var(--f-body-native);font-weight:600;font-size:12px;letter-spacing:.18em;text-transform:uppercase;opacity:.74}.lg-motif-card-value{font-family:var(--f-disp-native);font-weight:700;font-size:clamp(28px,3vw,44px);line-height:1;letter-spacing:-.01em;text-shadow:0 2px 12px rgba(0,0,0,.42)}"
  },
  {
    "id": "edge-light",
    "label": "Edge light",
    "role": "rim-highlight",
    "surface_safe": ["aurora"],
    "description": "1px inset highlight running along the top edge of a glass panel — fakes the lit rim of a wet surface. Always pairs with a glass-card; never appears solo. Equivalent to `--lg-edge-highlight` in the IIFE shader.",
    "demo": "<div class=\"lg-motif-edge\"></div>",
    "css": ".lg-motif-edge{display:inline-block;width:240px;height:88px;border-radius:24px;background:rgba(255,255,255,.06);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.16);box-shadow:inset 0 1px 0 rgba(255,255,255,.42),inset 0 -1px 0 rgba(255,255,255,.08)}"
  },
  {
    "id": "chromatic-fringe",
    "label": "Chromatic fringe",
    "role": "refraction-rim",
    "surface_safe": ["aurora"],
    "description": "Subtle RGB split at the panel rim — cyan on one edge, magenta on the opposite. The 'wet lens' tell. In scenes this is `--lg-chrom-aberration` on the shader; the CSS demo uses a layered gradient border.",
    "demo": "<div class=\"lg-motif-fringe\"></div>",
    "css": ".lg-motif-fringe{display:inline-block;width:240px;height:88px;border-radius:24px;background:rgba(255,255,255,.06);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid transparent;background-image:linear-gradient(rgba(255,255,255,.06),rgba(255,255,255,.06)),linear-gradient(120deg,rgba(120,220,255,.5),rgba(255,255,255,.18) 50%,rgba(255,120,200,.5));background-origin:border-box;background-clip:padding-box,border-box;box-shadow:inset 0 1px 0 rgba(255,255,255,.28)}"
  },
  {
    "id": "aurora-field",
    "label": "Aurora field",
    "role": "living-canvas",
    "surface_safe": ["aurora"],
    "description": "The animated color field underneath every glass panel — desaturated brand stops blended over the mandatory dark base. The aurora is the brand's voice; glass is the type's lectern. Never replace with a flat fill.",
    "wide": true,
    "demo": "<div class=\"lg-motif-aurora\"></div>",
    "css": ".lg-motif-aurora{display:block;width:100%;min-height:120px;border-radius:24px;background:radial-gradient(ellipse 70% 60% at 22% 30%,color-mix(in oklab,var(--brand-primary) 60%,transparent),transparent 60%),radial-gradient(ellipse 70% 60% at 80% 78%,color-mix(in oklab,var(--brand-secondary) 55%,transparent),transparent 60%),linear-gradient(160deg,#0a0218 0%,#15082a 60%,#062035 100%);border:1px solid rgba(255,255,255,.08)}"
  },
  {
    "id": "gradient-pill",
    "label": "Gradient pill",
    "role": "brand-accent-chip",
    "surface_safe": ["aurora", "glass"],
    "description": "Small capsule chip with brand-primary→secondary gradient fill and uppercase tracked label. Carries brand color forward onto glass — the one place brand hue touches a glass surface (the panel itself stays neutral).",
    "demo": "<span class=\"lg-motif-pill\">Live now</span>",
    "css": ".lg-motif-pill{display:inline-block;padding:8px 18px;border-radius:999px;background:linear-gradient(120deg,var(--brand-primary),var(--brand-secondary));color:rgba(255,255,255,.96);font-family:var(--f-body-native);font-weight:600;font-size:clamp(13px,1.1vw,15px);line-height:1;letter-spacing:.06em;text-transform:uppercase;box-shadow:inset 0 1px 0 rgba(255,255,255,.32),0 8px 22px rgba(0,0,0,.3)}"
  },
  {
    "id": "rise-and-settle",
    "label": "Rise and settle",
    "role": "panel-entry",
    "surface_safe": ["aurora"],
    "description": "Signature motion — panel translates up from off-frame paired with scale 0.86 → 1.0 on `back.out(1.04)`. The tiny overshoot is the 'settle' tell. Never opacity-only, never rotation. Static demo shows the resting state.",
    "demo": "<div class=\"lg-motif-rise\"><div class=\"lg-motif-rise-card\">Settled</div></div>",
    "css": ".lg-motif-rise{display:inline-block;padding:0;perspective:600px}.lg-motif-rise-card{display:inline-block;padding:18px 28px;border-radius:24px;background:rgba(255,255,255,.08);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.16);box-shadow:inset 0 1px 0 rgba(255,255,255,.24),0 14px 38px rgba(0,0,0,.4);color:rgba(255,255,255,.96);font-family:var(--f-disp-native);font-weight:700;font-size:clamp(18px,1.8vw,24px);letter-spacing:-.01em;text-shadow:0 2px 12px rgba(0,0,0,.42)}"
  }
]
```

The `motifs` JSON block above is the SOLE source of truth. build-design.mjs reads it to render §M cards in design.html. The Phase 3 plan agent and Phase 4b scene worker may cite motifs by `id` when annotating which gesture a scene relies on.

**Materials lexicon** (informational — these are the composition atoms behind the patterns):

- glass-card · edge-light · chromatic-fringe · aurora-field · gradient-pill · rise-and-settle · specular-highlight · idle-drift

## §I Page-level CSS (makes design.html itself read as liquid glass)

```css
/* ── Preset-native typography vars (loaded via preset-meta.chromeFonts.googleFontsHref).
 * These let the doc chrome render in Inter + JetBrains Mono regardless of
 * brand DNA. The §6 component preview, §M motifs grid, and §T type-role atlas
 * also read these via .preset-native-scope.
 *
 * Liquid-glass is a single-face system: Inter does display, body, AND script
 * because refraction smears thin-stroke script faces. JetBrains Mono carries
 * metadata + unit suffixes. The fallback chain ends in SF Pro / Geist / Public
 * Sans / system-ui — all neutral grotesques that survive backdrop-blur. */
:root {
  --f-disp-native:
    "Inter", "SF Pro Display", "Geist", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --f-body-native:
    "Inter", "Public Sans", "DM Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --f-script-native:
    "Inter", "Public Sans", "DM Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --f-mono-native:
    "JetBrains Mono", "Geist Mono", "IBM Plex Mono", "Menlo", ui-monospace, monospace;
}

/* .preset-native-scope: re-bind brand DNA font tokens to preset-native families.
 * Wraps §6 component previews, §M motif demos, and §T type-role atlas so
 * var(--font-*) resolves to Inter / JetBrains Mono regardless of brand DNA.
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
  background:
    radial-gradient(
      ellipse 90% 60% at 22% 28%,
      color-mix(in oklab, var(--brand-primary) 60%, transparent),
      transparent 60%
    ),
    radial-gradient(
      ellipse 80% 60% at 82% 78%,
      color-mix(in oklab, var(--brand-secondary) 50%, transparent),
      transparent 60%
    ),
    linear-gradient(160deg, #0a0218 0%, #15082a 60%, #062035 100%) !important;
  background-attachment: fixed !important;
  color: rgba(255, 255, 255, 0.94) !important;
}

.title-card {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.title-display {
  color: rgba(255, 255, 255, 0.98);
  text-shadow: 0 4px 32px rgba(0, 0, 0, 0.5);
}

.ds-section {
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
}
.eyebrow {
  color: rgba(255, 255, 255, 0.7);
}

/* Frosted swatches + frosted component cards for preview legibility */
.dna-swatch {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.24),
    0 12px 32px rgba(0, 0, 0, 0.32) !important;
}

.comp-card {
  background: rgba(255, 255, 255, 0.04) !important;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 18px 48px rgba(0, 0, 0, 0.4) !important;
}
.comp-head {
  background: rgba(255, 255, 255, 0.06) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}
.comp-name,
.comp-marker {
  color: rgba(255, 255, 255, 0.92);
}
.comp-preview {
  background: linear-gradient(160deg, #0a0218 0%, #15082a 60%, #062035 100%) !important;
}

.type-card {
  background: rgba(255, 255, 255, 0.04) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
}

.ds-code {
  background: rgba(7, 10, 18, 0.7) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.voice-pair {
  background: rgba(255, 255, 255, 0.04) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

h2 {
  color: rgba(255, 255, 255, 0.98);
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
}

/* ── §M Motifs grid: atomic gestures.
 * Cards live on the deep-aurora canvas with frosted glass treatment. Wide
 * motifs span 8/12; standard motifs span 4. The .preset-native-scope wrapper
 * (applied by build-design.mjs) makes inner var(--font-*) refs resolve to
 * Inter / JetBrains Mono. */
.ds-motif-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}
.ds-motif {
  grid-column: span 4;
  min-height: 280px;
  padding: 28px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 18px 48px rgba(0, 0, 0, 0.42);
  color: rgba(255, 255, 255, 0.96);
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
.ds-motif-h {
  margin: 0;
  font-family: var(--f-disp-native);
  font-weight: 700;
  font-size: clamp(22px, 2.2vw, 34px);
  line-height: 1.05;
  letter-spacing: -0.01em;
  color: rgba(255, 255, 255, 0.98);
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}
.ds-motif-desc {
  margin: 0;
  font-family: var(--f-body-native);
  font-weight: 550;
  font-size: 14px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.72);
  max-width: 30ch;
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
  color: rgba(255, 255, 255, 0.55);
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

/* ── §T Type-role atlas. Container = frosted glass card stacking each role on
 * its own row. Single column — padding only, no row dividers beyond a hairline
 * (the aurora carries the visual rhythm; lines would compete). Family selectors
 * use var(--font-*) tokens so the atlas renders in BRAND DNA fonts; only the
 * recipe + the text-shadow-glass legibility decoration are preset-declared. */
.ds-trole-box {
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 18px 48px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  margin-top: 24px;
}
.ds-trole-row {
  padding: 28px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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

/* ── Type-role samples. var(--font-*) resolves to brand DNA; text-shadow uses
 * --text-shadow-glass for legibility through refraction. Color floor stays at
 * white-on-glass; brand color appears only in pill / unit-suffix accents. */
.t-trole-display-cover {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(96px, 12vw, 180px);
  line-height: 0.95;
  letter-spacing: -0.01em;
  color: rgba(255, 255, 255, 0.98);
  text-shadow: 0 4px 32px rgba(0, 0, 0, 0.5);
}
.t-trole-headline {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(56px, 6vw, 96px);
  line-height: 1;
  letter-spacing: -0.01em;
  color: rgba(255, 255, 255, 0.98);
  text-shadow: var(--text-shadow-glass);
}
.t-trole-statement {
  display: inline-block;
  font-family: var(--font-display);
  font-weight: 650;
  font-size: clamp(40px, 4vw, 64px);
  line-height: 1.1;
  letter-spacing: 0;
  color: rgba(255, 255, 255, 0.96);
  text-shadow: var(--text-shadow-glass);
  max-width: 26ch;
}
.t-trole-stat-value {
  display: inline-block;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(64px, 8vw, 120px);
  line-height: 1;
  letter-spacing: -0.02em;
  color: rgba(255, 255, 255, 0.98);
  text-shadow: var(--text-shadow-glass);
}
.t-trole-h3 {
  font-family: var(--font-display);
  font-weight: 650;
  font-size: clamp(28px, 2.8vw, 44px);
  line-height: 1.15;
  color: rgba(255, 255, 255, 0.96);
  text-shadow: var(--text-shadow-glass);
}
.t-trole-lead {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: clamp(20px, 2vw, 28px);
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.94);
  text-shadow: var(--text-shadow-glass);
  max-width: 44ch;
  margin: 0;
}
.t-trole-body {
  font-family: var(--font-body);
  font-weight: 550;
  font-size: clamp(16px, 1.4vw, 22px);
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: var(--text-shadow-glass);
  max-width: 60ch;
  margin: 0;
}
.t-trole-caption {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: clamp(14px, 1vw, 16px);
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.74);
  text-shadow: var(--text-shadow-glass);
  max-width: 60ch;
  margin: 0;
}
.t-trole-label-eyebrow {
  display: inline-block;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: clamp(12px, 1vw, 14px);
  line-height: 1.2;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.78);
  text-shadow: var(--text-shadow-glass);
}
.t-trole-label-mono {
  display: inline-block;
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: clamp(11px, 0.9vw, 14px);
  line-height: 1.3;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.74);
}
.t-trole-pill {
  display: inline-block;
  padding: 8px 18px;
  border-radius: 999px;
  background: linear-gradient(120deg, var(--brand-primary), var(--brand-secondary));
  color: rgba(255, 255, 255, 0.98);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: clamp(13px, 1.1vw, 15px);
  line-height: 1;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.32),
    0 8px 22px rgba(0, 0, 0, 0.3);
}
.t-trole-unit-suffix {
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: clamp(18px, 2.4vw, 32px);
  line-height: 1;
  color: rgba(255, 255, 255, 0.72);
  margin-left: 0.18em;
}
```
