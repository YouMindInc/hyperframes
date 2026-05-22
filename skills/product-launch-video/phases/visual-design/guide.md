# Visual Design

The visual layer of a promotional video. Given the story (from Phase 2 — `narrator_scripts.json`) and the extracted brand design system (from Phase 1b — `design-system/design.html`), design the visual treatment and animation choreography for each scene. Output: `section_plan.md`.

**Your two inputs are:**

1. `./narrator_scripts.json` — scene list with `narrativeIntent`, `transition`, `assetCandidates`, `estimatedDuration` (per scene); plus top-level `narrativeArchetype` + `emotionalArc`.
2. `./design-system/design.html` — **the single source of truth for all design decisions**. Read §1 (Brand DNA), §2 (Color), §3 (Typography), §4 (Border radius), §5 (Motion eases), §6 (Visual DNA), §7 (Voice) verbatim. The hex values, font families, GSAP eases, and component snippets you cite in `section_plan.md` MUST be the exact values from design.html. Don't invent values. Don't pick palettes from elsewhere.

You do NOT read `research/` — that's Phase 2's job (it produced the per-scene `assetCandidates` you consume).

This guide is about **creative intent**, not code. Describe what you want to see in natural language; a downstream build agent (using `/hyperframes-core` + `/hyperframes-animation`) translates it into the HTML composition + GSAP timeline.

The bar for the plan is the golden-sample archive — playground-launch, timeline-editor-launch-v5, hyperframes-codex-plugin-announcement, fadeglow-v4, inspector-logo-intro, hermes-hyperframes, and the 13 canonical scenes in `hyperframes-animation/examples/`. Those plans **name the emotional beat alongside the mechanic**, use **specific pixel/duration/easing values** (not vague "make it bounce"), define the aesthetic **by exclusion** as much as by inclusion, and treat the **background as an active agent**, not a backdrop.

## Design principles — load on demand

**Primary source: `./design-system/design.html` (Phase 1b output).** It owns the **actual brand values** extracted from the target site: real palette hex (primary / accent / ink / canvas / neutrals), real font families (display / body / mono), real border-radius scale, real GSAP eases mapped from CSS cubic-beziers, real component snippets. **Every brand value you cite in `section_plan.md` must come from design.html verbatim** — don't invent values, don't pick from elsewhere.

**Secondary overlays: local `rules/*.md` below.** They hold this pipeline's exact **video-craft numbers** (1920×1080 safe margins, 5-tier type scale, 60-30-10 in practice, spring presets, scene-quality baseline minimums, cut-the-curve transition spec). They tell you _how_ to deploy the brand tokens, not what the tokens are.

If design.html and a local rule disagree:

- On **brand values** (palette / fonts / eases) → design.html wins.
- On **video-craft numbers** (safe margins / 1920×1080 zones / stagger caps / composition templates) → local rules win.

<rules>
<typography path="rules/typography.md">6-tier type scale calibrated against archive sizes (hero 200-340px → eyebrow 14-30px → counter up to 806px). Tight tracking (-0.04 to -0.055em) for confident display, CJK fallback chain, `tabular-nums` for counters, per-beat typographic variance as a valid move. Font families come from design.html §3 — do NOT pick from elsewhere. Tags: scale, hierarchy</typography>
<color-system path="rules/color-system.md">60-30-10 in practice (primary/accent/restrained-third tied to meaning, never overlapping), dual-radial swell background recipe, dark-scene compensations (weight -1, saturation -10-20%, two-layer accent glow). Palette hex values come from design.html §2 — do NOT pick from elsewhere. Tags: 60-30-10, contrast</color-system>
<composition path="rules/composition.md">1920×1080 canvas zones (96-150px safe margin, 36-58px top chrome when present, max text-block width 1360px), 6 composition templates with archive references (centered / thirds / split / layered / asymmetric / triptych / strip), depth via opacity+scale (0.15/0.6/1.0 → scale 1.05/1.0/0.92 — note the inversion), three-layer card shadow stack, perspective 800-1400px for 3D. Tags: layout, composition, whitespace, hierarchy</composition>
<motion-language path="rules/motion-language.md">Spring intents (entry / gentle / snappy / heavy / slam), 100/300/500 ms duration table at 30 fps, exit = 75% of entry, total stagger ≤ 500 ms, multiplicative breathing formula, cut-the-curve transition spec (exit 0.33s power2.in + blur 8px / entry 0.42s expo.out / background leads by 0.1s), stillness-before-climax beat. GSAP ease names come from design.html §5 EASE/DUR consts — do NOT invent. Tags: timing, rhythm</motion-language>
</rules>

### Key principles summary

- **Typography** — Use the display / body / mono font families exactly as named in design.html §3. Apply the 6-tier scale calibrated to the archive (hero 200-340px, eyebrow 14-30px, counter up to 806px). Tight tracking (-0.04 to -0.055em) on display headlines. Hierarchy through size + weight + color + spacing + case + style mix, not size alone. Per-beat typographic variance is OK when the emotional arc justifies it.
- **Color** — Use the palette hex values from design.html §2 verbatim. Apply 60-30-10 (60% canvas / 30% surface / 10% accent — accent only on the focal element of each beat). Never substitute pure `#000` / `#fff` for design.html's off-black / off-white. Dual-radial background swell using design.html's primary + accent, not flat color.
- **Composition** — Squint test: primary element identifiable at a glance. Primary visual covers 40%+ of canvas. Every scene has 3+ depth layers (background, midground, foreground). Mix 3+ composition templates across the video. Safe margins 96-150px. Use the scene's `assetCandidates` aggressively — no AI-invented decorative blobs.
- **Motion** — Cite GSAP ease names from design.html §5 (e.g., `EASE.entry`, `EASE.emphasis`). Entry animations 450-800ms. Exits 75% of entry duration. Total stagger capped at 500ms. Every element keeps moving after entry (multiplicative breathing, sine drift ≥ ±6px, not 3-pixel float). Cut-the-curve as the default scene transition.

## Scene quality baseline

Every scene must meet these minimums.

### Three-layer motion model

1. **Macro Motion** — camera drift: slow zoom + translation across the whole frame
2. **Element Motion** — content enters, then keeps drifting / rotating / scaling (never sits still — multiplicative breathing on final scale, not yoyo)
3. **Micro Motion** — ambient details: flowing gradients, breathing glow (38 ± 26px box-shadow oscillation), looping particles, halftone density warp

### Environment layers

Every scene has a visual foundation beyond its core content:

1. **Camera drift** — continuous subtle zoom + pan on the whole frame (background `scale: 1.05`, camera `scale: 0.92` is the archive's standard inversion)
2. **Background swell** — dual-radial overlay in brand-adjacent hues at 0.17-0.20 opacity (the HyperFrames signature), or architectural grid `rgba(<neutral>, 0.08)` at 80px spacing for workspace scenes
3. **Ambient particles or scanline / halftone field** — brand-colored floating particles, scanline overlay at 3-5% opacity, or halftone dot field whose density warps per beat
4. **Emphasis moment** — at least one impact beat (ripple on landing, glow burst on keyword, impact lines on data reveal, screen-shatter on title punch)

### Multi-phase choreography

Static = dead. Each scene should have multiple animation phases:

```
entry → ambient drift → major transition (morph / pivot / collapse) → stillness-before-climax (0.3-0.75s) → result / emphasis → idle breathing → exit
```

A scene where elements spring in and then sit still is a slideshow, not a video.

### Forbidden patterns

- Continuous motion covers less than 50% of the scene duration
- Tiny 3px floating as the only "motion" (the archive's minimum amplitude is ±6px)
- Word-by-word text pop-up as the _primary_ visual when there is no choreographed visual lead
- All elements entering simultaneously (must stagger; per-item 50-150ms, total cap 500ms)
- Only environment layers with no main content (just particles + subtitles)
- Same composition layout for every scene (use at least 3 different composition templates per video)
- Primary visual element covering less than 40% of canvas
- Generic AI-slop palette: full-saturation neon on pure `#000`, purple-blue AI gradient backgrounds, floating bokeh orbs as decoration
- Flat solid background with no swell / grid / scanline / particle layer
- A scene that goes from action straight to payoff with no stillness-before-climax comma

## Animation effects catalog

The catalog is **auto-generated** from `skills/hyperframes-animation/rules/*.md` — those rule files are the single source of truth. Effect names always match rule filenames.

**Do NOT Read `effects-catalog.md` from disk** — the orchestrator embeds the full catalog in your Dispatch context under a `## Effects catalog` heading. Pull effect names from there.

Phase 3 self-validates against the catalog via `validate-section-plan.mjs` — any unknown name is a fatal error.

If you need an effect that doesn't exist in the catalog:

1. Try combining existing effects first.
2. If that's not enough, **don't invent a name** — flag the gap in your phase report as "needed effect missing: <description>". A maintainer adds a rule file + regenerates the catalog:
   ```bash
   node skills/product-launch-video/phases/visual-design/scripts/generate-effects-catalog.mjs
   ```

## How to write `section_plan.md`

### Inputs

You read TWO files:

**1. `./narrator_scripts.json`** — the narrative + per-scene asset pool. For each scene:

- `sceneNumber` + `sceneName` — used in your `## Scene N: <name>` heading
- `narrativeIntent.{type, narrativeRole, keyMessage, persuasion, emotionalBeat}` — drives effect/composition choice
- `transition.{type, description}` — informs Continuity (`break` vs `continue`) + your prose item 8
- `assetCandidates[]` — your bounded asset pool for `**PrimaryAsset:**`; each candidate has `path` + `description`
- `estimatedDuration` — strip the trailing `"s"` → float seconds → `**Duration:**`

Top-level `narrativeArchetype` + `emotionalArc` inform pacing decisions across the whole video.

**2. `./design-system/design.html`** — the brand design system. **This is the single source of truth for every hex, font, and ease you cite.** Read these sections:

- §1 Brand DNA — one-glance summary (primary, accent, ink, canvas)
- §2 Color system — `:root` CSS variables (`--brand-primary`, `--brand-accent`, `--ink`, `--canvas`, neutrals…) and named hex values
- §3 Typography — display / body / mono font families + warning that web sizes ≠ video sizes
- §4 Border radius — `--r-sm` / `--r-md` / `--r-lg` scale with recommended usage
- §5 Motion — `EASE.entry` / `EASE.emphasis` / `EASE.exit` constants mapped from CSS cubic-beziers; `DUR.fast` / `DUR.med` / `DUR.slow`
- §6 Visual DNA — material (flat / material / glass), imagery (illustration / photo), background pattern
- §7 Brand voice — tone, heading style, CTAs

You do NOT read `research/` — that's Phase 2's territory.

### Per-scene structure

One section per scene, in scene order. Each scene block has a **strict header contract** (Phase 4a greps these two lines) followed by free prose.

### Per-scene anchor format (MANDATORY)

```markdown
## Scene <N>: <scene name from narrator_scripts.json>

**Effects:** [`<rule-id>`, `<rule-id>`, `<rule-id>`]
**Duration:** <X.XXs>
**Continuity:** break | continue
**PrimaryAsset:** public/<filename> | (none)

<free-prose body — see "Prose contents" below>
```

Rules:

- **`**Effects:**` line** — 4-7 backtick-wrapped rule ids, comma-separated, inside square brackets. Every id must appear in the embedded catalog. The order matters: it's the timeline-layering order Phase 4 workers will use.
- **`**Duration:**` line** — float seconds, parsed from this scene's `estimatedDuration` in `narrator_scripts.json` (strip the trailing `"s"` → number).
- **`**Continuity:**` line** — `break` (this scene is a hard visual cut from the previous one — full subject change, palette flip, deliberate narrative pivot) or `continue` (same hero asset / palette beat / narrative arc as the previous scene). **Scene 1 is always `break`.** Phase 4a uses this to pack `continue` runs into the same worker (cap = 2 scenes per worker); a `break` always starts a new worker. Decide based on the transition you spec in prose body item 8 — `hard cut` / `jump cut` ↔ `break`; `cut-the-curve` / `morph` / `scale+fade` over the same asset ↔ `continue`.
- **`**PrimaryAsset:**` line** — the `public/<basename>` path of this scene's focal visual (the one that covers ≥40% of canvas, per the composition rules). **Pick it from the scene's `assetCandidates[]` list in `narrator_scripts.json`** — that is the bounded asset pool story-design assembled for this scene. Read each candidate's `description` field and choose the one that best fits the composition template you'll use. If a scene's `assetCandidates` is `[]`, that's a deliberate text-only scene — use `(none)`. **Do not invent paths or pick basenames you didn't see in `assetCandidates`** — Phase 4a's `prep.mjs` will exit 1 on a `public/<basename>` that wasn't copied from research output. Phase 4b worker uses this as the dispatched `primary_visual_asset` — it is the asset the scene's effects are choreographed around.
- All four lines on their own line, exactly as shown. No surrounding text, no merging onto one line.
- A scene block missing any of the four anchors is a fatal Phase 3 error — Phase 4a's `prep.mjs` will exit 1 and the orchestrator will re-dispatch Phase 3.

### Prose contents (free form, but cover these)

After the two anchor lines, write a free-prose body that describes:

1. **Tone and pacing footnote first** — one sentence that names the _feeling_ and the _rhythm_ of this beat ("frustrated, slightly-off comma", "luminous launch-film slow build", "neobrutalist crunch on the 1, then breath"). The archive's strongest plans always name the emotional intent before the mechanic — generic "the scene fades in" is the failure mode.
2. **Spatial relationships in natural language** — "product screenshot dominates the left two-thirds of the frame with a slight 3D tilt; feature bullets enter from the right with staggered timing." Be specific about composition template (centered / split / layered / triptych / asymmetric / strip), primary asset's canvas-area occupancy (target ≥40%), and safe margins.
3. **Effect → asset mapping** — for each id in `**Effects:**`, name the asset (`public/<basename>` from this scene's `assetCandidates`) or text label that drives it, and the _moment_ it fires within the scene's phase timeline. When a scene's `assetCandidates` has multiple entries, you may reference the supporting ones in this section — the build worker uses your prose verbatim.
4. **Brand styling overlay** — palette (60% canvas, 30% surface, 10% accent — use the actual hex values from `design-system/design.html` §2, called out by role: `--canvas` 60%, `--paper-2` or `--surface` 30%, `--brand-primary` or `--brand-accent` 10%), typography (font family + the 2-3 sizes/weights used in this scene — fonts named verbatim from design.html §3). Cite GSAP ease names from design.html §5 (`EASE.entry`, `EASE.emphasis`). **All values must be copyable from design.html — do not invent palette hex, font names, or ease curves.** If design.html lacks a value (e.g., no extracted mono font), say so explicitly and call out a fallback in your prose.
5. **Multi-phase choreography** — the sequence of phases (entry → ambient → major transition → stillness → emphasis → exit) with rough durations or proportions. Note any _stillness-before-climax_ beat explicitly. Name the GSAP ease intent (`entry` / `gentle` / `snappy` / `heavy` / `slam`) per phase.
6. **Continuous / ambient motion** — what keeps the scene alive after entry settles? Multiplicative breathing on the hero (±2-5% scale), sine drift on cards (±6-8px in opposition), orbit on supporting icons, halftone density warp, glow pulse on CTA?
7. **One constraint or negation** — what this scene must NOT do, in the codex-plugin voice ("no halo behind the bell — Jake killed those", "snap back to clean black-on-white after the chromatic moment, don't linger", "no neon glow, this is a workspace"). This is the move that separates a real plan from generic AI output.
8. **Transition to next scene** — name the transition vocabulary (cut-the-curve LEFT, scale+fade, slide-up, morph, hard cut). If cut-the-curve, name the direction and confirm the 0.33s exit / 0.42s entry / 8-10px blur spec applies.

Do NOT prescribe pixel values, GSAP timeline code, or composition HTML — that's the build agent's job. But DO give the build agent enough constraints that the result is recognizably _this scene_ and not a generic interpretation: specific easings, specific durations as proportions ("hold for ~1.0s after entry"), specific colors as roles ("brand cyan on the focal word"), specific phase ordering.

The full prose body is copied **verbatim** by Phase 4a into each scene's `creative_brief` field in `group_spec.json`. The scene-builder worker treats it as the single source of design truth — write as if you are briefing a senior animator who has never seen this brand.

#### Voice reference — what a good scene brief reads like

The archive's strongest plans share a voice. Aim for this register:

> "Beat 2b — the spiral (frustrated, slightly-off comma). Centered chat-app composition: message stack scrolls up at accelerating pace, cursor sits anchored at the bottom-right, never moves. ~5-7 follow-up prompts flash through at 0.4-0.6s each, each punctuated by a button click + a late SFX tick — pace tightens, audio layers the tick faster and faster, tension builds. Hold on a final frustrated beat: the cursor sits still, the chat is full, the SFX is still _slightly_ off. Palette: warm-paper `#f5f5f7` canvas, ink `#1d1d1f` text, single orange `#FF9500` cursor accent — no halo, no glow. Type: Inter 900 in chat bubbles, 39px body. Multi-phase: setup hold 0.5s → accelerating montage 4.8s → final still beat 0.9s → cut-the-curve LEFT into Act 3 (0.33s exit + 8px blur)."

Notice: emotional tone _named first_, then composition, then palette by role, then type by use, then phase sequence with durations as proportions, then transition spec. No GSAP code; every word is doing work.

### Variety

Across all scenes, ensure at least 3 different compositional arrangements — don't center everything, don't lock to one layout family. The strongest archive plans (playground-launch) run 5+ visual universes across 8 beats, held together by a single shared transition vocabulary (cut-the-curve) and a shared palette grammar. Variety in _visual world_, consistency in _seam treatment_ — that is the principle.

## See also

- `phases/design-system/guide.md` — Phase 1b that produces `design-system/design.html` (the single source of truth for brand palette/typography/motion).
- `phases/story-design/guide.md` — Phase 2 upstream; produces `narrator_scripts.json` including `assetCandidates[]` per scene.
- `/hyperframes-animation` — atomic rules + multi-phase blueprints a build agent uses to realize this plan.
- `/hyperframes-core` — composition contract a build agent applies.
