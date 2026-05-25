# style-presets/ — how to write a new preset

A preset is a **directory** under `style-presets/`. `build-design.mjs` scans this directory for subdirectories, parses each one as a preset, merges site DNA with it, and emits `design.html`. `emit-chunks.mjs` then slices `design.html` into `chunks/*` that downstream phases consume.

This README is the **only** contract — if it doesn't appear here, it's not load-bearing. Read top-to-bottom before adding a preset.

> Stray flat `.md` files in `style-presets/` (e.g. translations like `<name>.zh.md`, the README itself) are ignored by the parser — only subdirectories are scanned. You may keep them as archives, but they take no part in builds.

---

## 1. File anatomy

```
style-presets/<preset-name>/
├── preset.md                       ← required; contains preset-meta + §A/§B/§D/§E/§G/§H/§I
└── components/                     ← required; ≥1 *.md file
    ├── <id>.md                     ← raw HTML+CSS body, no <!-- COMPONENT --> markers
    └── ...
```

`preset.md` structure:

````
```preset-meta { JSON } ```         ← machine-read; required
## §A Director's intent             ← required
## §B Decoration tokens             ← required
## §D Font pairing fallback         ← required
## §E Motion (GSAP consts)          ← required
## §G Voice transform recipe        ← required
## §H Scene composition hints       ← required
## §I Page-level CSS                ← optional
````

Parser rules:

- The `preset-meta` block MUST be the first thing in `preset.md`. Format: <code>\`\`\`preset-meta</code> + newline + `{ ... JSON ... }` + newline + <code>\`\`\`</code> + newline.
- Section headings MUST match `^##\s+§([A-Z])\s+(.+)$` (single uppercase letter, space, title). `§E.5` etc. WILL NOT be parsed as a distinct section — they fall under §E body.
- §C is unused. Do not declare it.
- §F MUST NOT appear in `preset.md` — it is synthesized from `components/*.md` at load time. The parser will error if you declare an inline `## §F` heading.
- Section order matters for human readers only; the parser keys by letter.

Component file rules:

- Filename `<id>.md` IS the component id. The id MUST match `[a-z0-9-]+`.
- File body is **raw HTML + optional `<style>` block**, typically wrapped in a single ` ```html ` fence. **Do NOT** add `<!-- COMPONENT: ... -->` / `<!-- /COMPONENT -->` markers — the parser adds them.
- Components are loaded in **alphabetical order by filename**. This determines the order they appear in design.html §6 and `chunks/index.json.components[]`. If a specific order matters, prefix filenames with digits (e.g. `01-hero.md`, `02-chip.md`); but stay consistent with the rest of the directory.
- Empty component files error out at build time.

---

## 2. `preset-meta` JSON contract

```json
{
  "name": "neo-brutalism",
  "label": "Neo-Brutalism",
  "fingerprint": { "shadow": "hard-offset", "motion": "hit-and-stick" },
  "match_signals": [
    { "kind": "shadow_zero_blur", "weight": 0.3 },
    { "kind": "thick_solid_border", "weight": 0.25 }
  ]
}
```

| Field           | Required              | Used by                                                   | Notes                                                                                                   |
| --------------- | --------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `name`          | yes                   | `--style <name>` flag, `chunks/index.json.preset`, stdout | kebab-case; must be unique across files in this directory                                               |
| `label`         | yes                   | design.html title card, §6 heading                        | Title-cased human label                                                                                 |
| `fingerprint`   | no                    | stdout report only                                        | Free-form key/value vocabulary; documentation, not matched                                              |
| `match_signals` | yes (but may be `[]`) | auto-inference scoring                                    | `kind` must be in the **detector whitelist** (§4); empty array = opt out of auto-inference (force-only) |

**Common mistake:** putting matching criteria in `fingerprint`. `fingerprint` is documentation only. The matcher reads `match_signals[].kind` exclusively.

---

## 3. Section contracts

### §A Director's intent

**What:** 3-6 lines of prose stating the directorial mood (edges, weight, voice, motion vocabulary, scene grammar).
**Consumed by:** `build-design.mjs` embeds it verbatim in design.html §4 as an "intent" callout.
**Format:** plain markdown. No code fences.
**Failure mode:** none — empty §A degrades to an empty paragraph, no fatal.

### §B Decoration tokens (merge into `:root`)

**What:** one ` ```css ` block declaring CSS custom properties.
**Consumed by:**

1. `build-design.mjs` extracts the block, merges with site-derived brand tokens (`--brand-primary`, `--canvas`, etc.), and writes the merged `:root { ... }` between `<!-- ROOT-START -->` / `<!-- ROOT-END -->` in design.html.
2. `emit-chunks.mjs` extracts that merged block → `chunks/tokens.css`.
3. Phase 4b scene workers paste it verbatim into each scene's `[data-composition-id="<scene-id>"] { ... }`.

**Hard rules:**

- Declare only style-specific decoration vars (shadows, borders, radii, gap units, tilts). Do NOT redeclare brand colors — those come from site DNA.
- Pixel values for visual signatures (shadow offsets, border widths). `vw` only for spacing that should scale.
- Every var name MUST start with `--` and be lowercase-with-dashes.

**Example (neo-brutalism):**

```css
--shadow-hard: 8px 8px 0 var(--ink);
--border-bold: 4px solid var(--ink);
--tilt-l: -1deg;
--gap-loud: 1.7vw;
```

### §D Font pairing fallback

**What:** three lines naming display / body / mono fallback families when brand fonts aren't on Google Fonts.
**Consumed by:** `resolveFont()` in build-design.mjs — if the brand-derived font isn't on Google Fonts, the first preset fallback that IS becomes the substitute.
**Format:** exactly three bullets in this shape:

```markdown
- **display**: `'Anton'` · `'Archivo Black'` · `'Space Grotesk'` wght 800
- **body**: `'Inter'` · `'IBM Plex Sans'` wght 500
- **mono**: `'Space Mono'` · `'JetBrains Mono'` wght 700
```

Backtick-wrapped names, separated by `·`, optional trailing `wght <num>`. The parser walks each name and accepts the first Google-Fonts-available one.

### §E Motion (GSAP consts — REPLACES site ease)

**What:** one ` ```js ` block declaring `const EASE` and `const DUR`.
**Consumed by:**

1. `build-design.mjs` writes the block verbatim between `<!-- MOTION-START -->` / `<!-- MOTION-END -->` in design.html §4.
2. `emit-chunks.mjs` → `chunks/easings.js`.
3. Phase 4b worker pastes both consts at the top of every scene's `<script>`.

**Hard rules:**

- Both `EASE` and `DUR` MUST be declared. Worker code assumes they exist.
- `EASE` MUST have keys: `entry`, `emphasis`, `exit`, `drift`. Extra keys allowed but the four roles above are referenced by the plan layer.
- `DUR` MUST have keys: `snap`, `med`, `slow`. Same rationale.
- Comment-rules in this block (e.g. `// RULE: never ease-in-out for primary motion`) are preserved into `chunks/easings.js` and read by workers — use them as inline guards.

You may optionally include a §E.5 "Motion choreography" subsection of plain prose after the code block (allowed primitives, forbidden gestures, transition defaults, type-in-motion rules). The parser keeps this under §E.content — agents read it when they read §E.

### §F Components (sourced from `components/*.md`)

**Where:** one file per component under `<preset-name>/components/`. Filename `<id>.md` IS the component id.
**Body:** raw HTML + optional `<style>` block, wrapped in a single ` ```html ` fence. **No** `<!-- COMPONENT: ... -->` markers — the parser adds them when synthesizing the in-memory §F.
**Consumed by:**

1. `build-design.mjs` concatenates all components in alphabetical order, wraps each in `<!-- COMPONENT: <id> -->` / `<!-- /COMPONENT -->`, and renders each as a live preview in design.html §6.
2. `emit-chunks.mjs` extracts each wrapped block → `chunks/components/<id>.html` and registers it in `chunks/index.json.components[]`.
3. Phase 3 plan agent references components by id in `**Components:** [\`<id>\`, ...]` anchors.
4. `prep.mjs` resolves each cited id to an absolute path → `group_spec.json.scenes[<sid>].design_chunks.components[]`.
5. Phase 4b worker pastes the chosen components' DOM + `<style>` into the scene HTML, prefixing all class names with `s<N>-` to avoid sibling collisions.

**Hard rules:**

- Filename id MUST match `[a-z0-9-]+`. Underscores and uppercase are rejected.
- ≥1 component file per preset.
- Every CSS class inside a component MUST be prefixed with a **preset-unique** namespace (`ed-`, `bn-`, `liquid-`, etc.) — picked by the preset author. The Phase 4b worker re-prefixes with `s<N>-` on top of this, but only the inner class body; the preset's prefix prevents collisions between preset components that share an id (e.g. `hero` exists in three presets, each with different CSS).
- Component CSS MUST reference brand vars (`var(--brand-primary)`, `var(--canvas)`) instead of hex literals so workers inherit the site palette.
- The `{PLACEHOLDER}` vocabulary is closed — see §5 below.

**Component file skeleton (e.g. `components/hero.md`):**

````markdown
```html
<div class="<prefix>-hero">
  <span class="<prefix>-eyebrow">{EYEBROW}</span>
  <h1 class="<prefix>-display">{HEADLINE}</h1>
  <p class="<prefix>-body">{SUBHEAD}</p>
</div>

<style>
  .<prefix > -hero {
    background: var(--canvas);
    padding: var(--gap-loud);
  }
  /* ... */
</style>
```
````

### §G Voice transform recipe

**What:** numbered recipe for transforming brand prose into the preset's on-screen copy register.
**Consumed by:**

1. `build-design.mjs` embeds the recipe in design.html §5 (human view) AND writes a paste-ready block bracketed by `<!-- VOICE-START -->` / `<!-- VOICE-END -->`.
2. `emit-chunks.mjs` → `chunks/voice.md`.
3. Phase 4b worker reads `chunks/voice.md` and applies the recipe to DOM text (headlines, chips, buttons) but NOT to narrator scripts (TTS-bound).

**Format:** numbered list, followed by a bolded `**Example:**` block with `IN:` and `OUT:` lines in backticks.

```markdown
1. Strip articles + connectives (the / a / of / and / with / to)
2. Break into noun-verb-noun fragments OR single dominant nouns
3. UPPERCASE all
4. Join with `.` + linebreak, OR em-dash for emphasis
5. End with brand name as one-word punchline

**Example:**

- IN: `Figma helps teams design products collaboratively in real time`
- OUT: `TEAMS. DESIGN. TOGETHER. — REAL-TIME. — FIGMA.`
```

**Hard rule:** the recipe applies to **on-screen text** only. Don't include guidance like "make narrator scripts shorter" — narrator scripts are Phase 2 territory and never read §G.

### §H Scene composition hints (Phase 4b layout guidance)

**What:** bullet rules for how a scene of this preset should be laid out (focal element scale, allowed backgrounds, transition defaults, sound-design hooks, stagger budgets).
**Currently consumed by:** nobody — §H is a known orphan section. It's preserved because (a) human reviewers read it, (b) it will eventually be sliced into `chunks/layout.md` and fed to Phase 4b workers (same pattern as §G → voice.md).
**Format:** plain markdown bullets. No code fences required.

**Recommendation:** write it anyway. When the §H → `chunks/layout.md` pipeline lands, every preset that already has §H starts working without re-authoring.

### §I Page-level CSS (optional)

**What:** one or more ` ```css ` blocks that style design.html **itself** (NOT the scenes).
**Consumed by:** `extractPagePresetCss()` in build-design.mjs concatenates all css blocks under §I and injects them into the design.html `<head>`.
**Purpose:** make the human-facing design.html visually consistent with the preset (e.g. neo-brutalism's design.html itself has thick borders and hard shadows).
**Hard rule:** these styles apply to design.html only. They are NOT exported to chunks and never reach scene HTML.

---

## 4. `match_signals` detector whitelist

`build-design.mjs` exposes exactly these features for matching. Any `kind` not on this list silently scores 0.

| Kind                 | What triggers it                                                                             | Currently stubbed? |
| -------------------- | -------------------------------------------------------------------------------------------- | ------------------ |
| `shadow_zero_blur`   | site shadow has non-inset offset ≥3px with blur=0                                            | live               |
| `thick_solid_border` | site border ≥3px solid                                                                       | live               |
| `hairline_border`    | site border = 1px solid                                                                      | live               |
| `condensed_display`  | site display font matches `Anton\|Archivo Black\|Bebas\|Oswald\|Space Grotesk`               | live               |
| `serif_display`      | site display font matches `Serif\|Fraunces\|Spectral\|Newsreader\|Playfair\|Garamond\|Times` | live               |
| `high_sat_accent`    | accent + primary both saturation > 0.7                                                       | live               |
| `low_saturation`     | accent + primary both saturation < 0.5                                                       | live               |
| `bouncy_easing`      | site CSS easing contains `back \| elastic \| bounce`                                         | live               |
| `minimal_decoration` | site exposes <2 shadow tokens                                                                | live               |
| `rotated_transform`  | always false — stub, hard to detect from tokens                                              | stub               |
| `generous_padding`   | always false — stub, no padding scale exposed                                                | stub               |

If you need a new detector, add it to `detectSiteFeatures()` in build-design.mjs first, then cite it in your preset.

**Weight policy:** weights need not sum to 1. The scorer computes `total / maxPossibleTotal` per preset, so what matters is the _ratio_ of matched signals to total declared. Typical weights: 0.25-0.35 for strong signals, 0.05-0.15 for tiebreakers.

**Opt-out:** `"match_signals": []` means "never auto-infer me; require `--style <name>`". Use for presets with runtime dependencies (e.g. liquid-glass needs WebGPU).

---

## 5. `{PLACEHOLDER}` whitelist

`build-design.mjs::placeholderFor()` knows exactly these tokens. Any `{UNKNOWN}` in §F renders literally as `{UNKNOWN}` — broken preview AND broken downstream paste.

| Token                                                                                                | Substituted with                                                                                             |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `{EYEBROW}`                                                                                          | `"Build faster"`                                                                                             |
| `{HEADLINE}`                                                                                         | site brand name                                                                                              |
| `{SUBHEAD}`                                                                                          | site tagline (truncated 80 chars) or fallback                                                                |
| `{LABEL}`                                                                                            | `"Get started"`                                                                                              |
| `{LEDE}`                                                                                             | site description (truncated 120 chars) or fallback                                                           |
| `{KICKER}`                                                                                           | `"Issue 01"`                                                                                                 |
| `{NUM}`                                                                                              | `"4M"`                                                                                                       |
| `{QUOTE}`                                                                                            | first site sample heading or fallback                                                                        |
| `{AUTHOR}`                                                                                           | `"Customer Quote"`                                                                                           |
| `{LEFT}` / `{RIGHT}`                                                                                 | column placeholder strings                                                                                   |
| `{HEADLINE_WITH_EM}`                                                                                 | preset-specific HTML with `<em>` highlights — passes through raw                                             |
| `{DO_1}` / `{DO_2}` / `{DO_3}`                                                                       | "Do" rule strings                                                                                            |
| `{DONT_1}` / `{DONT_2}` / `{DONT_3}`                                                                 | "Don't" rule strings                                                                                         |
| `{FOREGROUND_CONTENT}`                                                                               | brand-name + tagline rendered inline as raw HTML                                                             |
| `{TITLE}` / `{SUBTITLE}` / `{MESSAGE}` / `{NAME}` / `{INITIAL}` / `{LETTER}` / `{REST_OF_PARAGRAPH}` | currently fall through to literal key — if you use them, add a real substitution in `placeholderFor()` first |

If you need a new placeholder: add it to the `map` object inside `placeholderFor()` in build-design.mjs first, then cite it in §F.

---

## 6. Self-check before committing a new preset

Run from project root with a `design-system/` already prepared by `npx designlang <url>`:

```bash
# 1. Build forces your preset
node phases/design-system/scripts/build-design.mjs ./design-system --style <your-preset-name>
# 2. Verify all four anchors exist
grep -c "<!-- ROOT-START"   ./design-system/design.html   # must be 1
grep -c "<!-- MOTION-START" ./design-system/design.html   # must be 1
grep -c "<!-- VOICE-START"  ./design-system/design.html   # must be 1
grep -c "<!-- COMPONENT:"   ./design-system/design.html   # must be ≥1
# 3. Slice and verify chunks
node phases/design-system/scripts/emit-chunks.mjs ./design-system
node -e 'const i=require("./design-system/chunks/index.json"); for (const k of ["preset","tokens_file","easings_file","voice_file","components"]) if (i[k]==null) { console.error("missing",k); process.exit(1); } console.log("ok")'
# 4. Eyeball the preview (open design.html in a browser); §6 components should render, NOT show literal {PLACEHOLDER} text
```

Failure-mode quick map:

- Build errors `missing preset.md` → you wrote a flat `<name>.md` instead of `<name>/preset.md`. Move it.
- Build errors `preset.md declares §F inline` → delete the `## §F` heading from preset.md and put each component in its own `components/<id>.md` file.
- Build errors `has no components` → add at least one `components/<id>.md`.
- Build errors `component id must match [a-z0-9-]+` → rename the file to lowercase-dashed.
- Step 2 fails on any anchor → fix the corresponding § in `preset.md` (don't touch the chunker).
- Step 4 shows literal `{TOKEN}` → that token isn't in `placeholderFor()`; add it first.

---

## 7. Quick "should I add this as a new preset?" filter

- The site shows a **distinct visual vocabulary** (shadow shape, border weight, font register, motion feel) that none of the existing 3 presets capture? → yes, add a preset.
- The site is "more saturated editorial" or "neo-brutalism with serif"? → no, ship `--style editorial` or `--style neo-brutalism` and let the brand DNA carry the difference. Presets are styles, not brands.
- The preset needs a runtime that may not be present (WebGPU, WASM, custom GSAP plugin)? → yes, but declare `"match_signals": []` and document the runtime requirement at the top of §A.
