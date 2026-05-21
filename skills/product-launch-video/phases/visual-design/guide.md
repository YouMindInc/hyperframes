# Visual Design

The visual layer of a promotional video. Given the story (from Phase 2 — `narrator_scripts.json` produced via `phases/story-design/guide.md`) and extraction data, design the visual treatment and animation choreography for each scene. Output: `section_plan.md`.

This guide is about **creative intent**, not code. Describe what you want to see in natural language; a downstream build agent (using `/hyperframes-core` + `/hyperframes-animation`) translates it into the HTML composition + GSAP timeline.

## Design principles — load on demand

**Primary source: `hyperframes-creative` (Skill tool).** It owns the cross-workflow design canon — banned fonts, register-based font thinking, easing-as-emotion, build/breathe/resolve scene structure, load-bearing GSAP rules, the 9 named palettes, beat-direction framing. The subagent prompt loads it; reach for its routing table first when you need typography / color / composition / motion / palette / beat direction.

**Secondary overlays: local `rules/*.md` below.** They hold this pipeline's exact numbers, scene-quality minimums, and the pattern names cited by `section_plan.md`. They are HyperFrames/GSAP-native — when creative talks principle, local talks pixels and milliseconds.

<rules>
<typography path="rules/typography.md">5-tier type scale (hero 100-120px → caption 20-28px), CJK fallback chain, letter-spacing guide, tabular-nums for counters. Overlay on `hyperframes-creative/references/typography.md`. Tags: font, typography, scale, hierarchy</typography>
<color-system path="rules/color-system.md">Brand-palette extraction from `extraction/shared/tokens.json`, 60-30-10 visual-weight split, OKLCH neutral tinting (chroma ≈ 0.01), dark-scene weight/saturation adjustments. Overlay on `hyperframes-creative/references/house-style.md` + `palettes/*.md`. Tags: color, palette, brand, tokens</color-system>
<composition path="rules/composition.md">1920×1080 canvas zones (96px safe margin, bottom 15% caption zone), primary asset ≥ 40% area, depth via opacity+scale (0.15/0.6/1.0 → scale 1.1/1.0/0.95). Overlay on `hyperframes-creative/references/composition-patterns.md` + `video-composition.md`. Tags: layout, composition, whitespace, hierarchy</composition>
<motion-language path="rules/motion-language.md">Spring presets (entry / gentle / snappy / heavy), GSAP easing curves, 100/300/500 ms duration table at 30 fps, exit = 75% of entry, total stagger ≤ 500 ms, minimum hold times. Overlay on `hyperframes-creative/references/motion-principles.md`. Tags: easing, spring, timing, rhythm</motion-language>
<choreography-patterns path="rules/choreography-patterns.md">Multi-phase scene-design patterns (anchor-chain-reveal, assembly-focus-reveal, orbit-collapse-action, etc.). Pipeline-owned — these names appear in `section_plan.md` and have no creative equivalent. Tags: choreography, scene-design, patterns, multi-phase</choreography-patterns>
</rules>

### Key principles summary

- **Typography** — Use the brand's own fonts. 5-tier size scale (hero 100-120px down to caption 20-28px). Hierarchy through size + weight + color + spacing, not size alone.
- **Color** — Extract palette from `tokens.json`. 60-30-10 rule (neutral bg / secondary elements / brand accent). Tint neutrals toward brand hue. Never pure black or white.
- **Composition** — Squint test: primary element identifiable at a glance. Primary visual covers 40%+ of canvas. Every scene has 3+ depth layers (background, midground, foreground). Mix composition styles across scenes.
- **Motion** — Consistent spring presets and easing curves across the video. Entry animations 300–500ms. Exits 75% of entry duration. Total stagger capped at 500ms. Every element keeps moving after entry.

## Scene quality baseline

Every scene must meet these minimums:

### Three-layer motion model

1. **Macro Motion** — camera drift: slow zoom + translation across the whole frame
2. **Element Motion** — content enters, then keeps drifting / rotating / scaling (never sits still)
3. **Micro Motion** — ambient details: flowing gradients, breathing glow, looping particles

### Environment layers

Every scene has a visual foundation beyond its core content:

1. **Camera drift** — continuous subtle zoom + pan on the whole frame
2. **Ambient particles** — brand-colored floating particles as atmospheric background
3. **Emphasis moment** — at least one impact beat (ripple on landing, glow burst on keyword, impact lines on data reveal)

### Multi-phase choreography

Static = dead. Each scene should have multiple animation phases:

```
entry → rearrange/morph → camera push → emphasis/interaction → exit
```

A scene where elements spring in and then sit still is a slideshow, not a video.

### Forbidden patterns

- Continuous motion covers less than 50% of the scene duration
- Tiny 3px floating as the only "motion"
- Word-by-word text pop-up as the primary visual (text is supporting, visual choreography is the lead)
- All elements entering simultaneously (must stagger)
- Only environment layers with no main content (just particles + subtitles)
- Same composition layout for every scene (use at least 3 different compositions)
- Primary visual element covering less than 40% of canvas

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

One section per scene, in scene order. Each scene block has a **strict header contract** (Phase 4a greps these two lines) followed by free prose.

### Per-scene anchor format (MANDATORY)

```markdown
## Scene <N>: <scene name from narrator_scripts.json>

**Effects:** [`<rule-id>`, `<rule-id>`, `<rule-id>`]
**Duration:** <X.XXs>

<free-prose body — see "Prose contents" below>
```

Rules:

- **`**Effects:**` line** — 3-5 backtick-wrapped rule ids, comma-separated, inside square brackets. Every id must appear in the embedded catalog. The order matters: it's the timeline-layering order Phase 4 workers will use.
- **`**Duration:**` line** — float seconds, parsed from this scene's `estimatedDuration` in `narrator_scripts.json` (strip the trailing `"s"` → number).
- Both lines on their own line, exactly as shown. No surrounding text, no merging onto one line.
- A scene block missing either anchor is a fatal Phase 3 error — Phase 4a will STOP and report.

### Prose contents (free form, but cover these)

After the two anchor lines, write a free-prose body that describes:

1. **Spatial relationships in natural language** — "product screenshot dominates the left two-thirds of the frame with a slight 3D tilt; feature bullets enter from the right with staggered timing"
2. **Effect → asset mapping** — for each id in `**Effects:**`, name the brand asset (file path under `extraction/`) or text label that drives it
3. **Choreography pattern inspiration** (optional) — e.g. "follow `assembly-focus-reveal`"; see `rules/choreography-patterns.md`
4. **Brand styling overlay** — palette (primary/accent hex from `tokens.json`) + typography (font family)
5. **Transition to next scene** (optional)

Do NOT prescribe pixel values, GSAP timeline code, or composition HTML — that's the build agent's job.

The full prose body is copied **verbatim** by Phase 4a into each scene's `creative_brief` field in `group_spec.json`. The scene-builder worker treats it as the single source of design truth.

### Variety

Across all scenes, ensure at least 3 different compositional arrangements — don't center everything, don't lock to one layout family.

## See also

- `phases/story-design/guide.md` — narrative architecture (upstream; produces `narrator_scripts.json`).
- `/hyperframes-animation` — atomic rules + multi-phase blueprints a build agent uses to realize this plan.
- `/hyperframes-core` — composition contract a build agent applies.
