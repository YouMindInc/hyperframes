---
name: visual-design
description: Design a video's visual treatment and animation choreography — typography, color, composition, motion principles, and a catalog of available animation effects described in natural language. Use when designing how the video should look after the story is decided (typically following `/story-design`). Output is a `section_plan.md` of creative intent that a build agent translates into HTML composition + GSAP timeline code.
metadata:
  tags: design, typography, color, composition, motion, animation, effects, visual, aesthetic
---

# Visual Design

The visual layer of a promotional video. Given the story (typically from `/story-design`'s `narrator_scripts.json`) and extraction data, design the visual treatment and animation choreography for each scene. Output: `section_plan.md`.

This skill is about **creative intent**, not code. Describe what you want to see in natural language; a downstream build agent (using `/hyperframes-animation` + `/hyperframes-core` + `/hyperframes-adapters`) translates it into the HTML composition + GSAP timeline.

## Design principles — load on demand

<rules>
<typography path="rules/typography.md">Font hierarchy, scale, and selection — site fonts first, curated fallbacks second. Tags: font, typography, text, hierarchy</typography>
<color-system path="rules/color-system.md">Brand color extraction from tokens.json, palette roles, 60-30-10 allocation, cross-scene consistency. Tags: color, palette, brand, tokens</color-system>
<composition path="rules/composition.md">1920x1080 canvas layout, whitespace rhythm, visual hierarchy, depth layering. Tags: layout, composition, whitespace, hierarchy</composition>
<motion-language path="rules/motion-language.md">Unified easing presets, duration norms, stagger limits, exit/entry timing. Tags: easing, spring, timing, rhythm</motion-language>
<choreography-patterns path="rules/choreography-patterns.md">Multi-phase scene-design patterns (anchor-chain-reveal, assembly-focus-reveal, orbit-collapse-action, etc.) grouped by intent. Tags: choreography, scene-design, patterns, multi-phase</choreography-patterns>
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

The catalog is **auto-generated** from `skills/hyperframes-animation/rules/*.md` — those rule files are the single source of truth. Effect names here always match rule filenames; one cannot drift from the other.

→ **Read [`effects-catalog.md`](./effects-catalog.md)** for the current effect list (description per effect, grouped by category).

Reference effects **by name** in `section_plan.md` (backtick-wrapped, e.g. `` `hacker-flip-3d` ``). Combine multiple per scene for rich choreography. Phase 3 self-validates against this catalog — any unknown name is a fatal error from `validate-section-plan.mjs`.

If you need an effect that doesn't exist in the catalog:

1. Try combining existing effects first.
2. If that's not enough, **don't invent a name** — flag the gap in your phase report as "needed effect missing: <description>". A maintainer adds a rule file + regenerates the catalog:
   ```bash
   node skills/visual-design/scripts/generate-effects-catalog.mjs
   ```

## How to write `section_plan.md`

One section per scene, in scene order. For each scene answer: what does the viewer see, what moves, how does it feel.

1. **Describe spatial relationships in natural language** — "product screenshot dominates the left two-thirds of the frame with a slight 3D tilt; feature bullets enter from the right with staggered timing"
2. **Reference effects by name** from the catalog above (e.g. `3d-page-scroll`, `cursor-click-ripple`)
3. **Reference choreography patterns for structural inspiration** (e.g. "follow `assembly-focus-reveal`") — see `rules/choreography-patterns.md`
4. **Specify the emotional and visual intent** — the build agent chooses the concrete layout and code
5. **Do NOT prescribe specific layout templates or pixel values** — describe what you want to see, not where things go numerically
6. **Ensure variety** — at least 3 different compositional arrangements across scenes; don't center everything

## See also

- `/story-design` — story / narrative architecture (upstream; produces `narrator_scripts.json`).
- `/hyperframes-animation` — atomic rules + multi-phase blueprints a build agent uses to realize this plan.
- `/hyperframes-core` — composition contract a build agent applies.
