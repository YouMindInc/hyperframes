---
name: visual-design
description: Design a video's visual treatment and animation choreography — typography, color, composition, motion principles, and a catalog of available animation effects described in natural language. Use when designing how the video should look after the story is decided (typically following `/story-design`). Output is a `section_plan.md` of creative intent that a build agent translates into HTML composition + GSAP timeline code.
metadata:
  tags: design, typography, color, composition, motion, animation, effects, visual, aesthetic
---

# Visual Design

The visual layer of a promotional video. Given the story (typically from `/story-design`'s `narrator_scripts.json`) and extraction data, design the visual treatment and animation choreography for each scene. Output: `section_plan.md`.

This skill is about **creative intent**, not code. Describe what you want to see in natural language; a downstream build agent (using `/hyperframes-animation` + `/hyperframes-core` + `/hyperframes-gsap`) translates it into the HTML composition + GSAP timeline.

## Design principles

Load specific rules on demand for detailed guidance:

<rules>
<typography path="rules/typography.md">Font hierarchy, scale, and selection — site fonts first, curated fallbacks second. Tags: font, typography, text, hierarchy</typography>
<color-system path="rules/color-system.md">Brand color extraction from tokens.json, palette roles, 60-30-10 allocation, cross-scene consistency. Tags: color, palette, brand, tokens</color-system>
<composition path="rules/composition.md">1920x1080 canvas layout, whitespace rhythm, visual hierarchy, depth layering. Tags: layout, composition, whitespace, hierarchy</composition>
<motion-language path="rules/motion-language.md">Unified easing presets, duration norms, stagger limits, exit/entry timing. Tags: easing, spring, timing, rhythm</motion-language>
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

---

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

---

## Choreography patterns

Proven multi-phase scene designs. Study them for structural inspiration, then adapt freely — do not copy verbatim. Every scene should be tailored to its content and narrative role.

### Brand & Authority

| Pattern                    | Description                                                                                                                                                              | Best for                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| **anchor-chain-reveal**    | A brand element (logo, product) persists across 3-4 shots as the anchor while surrounding content swaps out (text, stats, testimonials build up around it progressively) | Brand authority scenes, social proof accumulation, trust-building   |
| **sequential-type-cursor** | Typewriter effect where a cursor types multiple text segments, changing its visual style (color, shape) for each segment to match the content's tone                     | Tagline reveals, multi-benefit introductions, narrative text scenes |

### Product Showcase

| Pattern                           | Description                                                                                                                                           | Best for                                                              |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **contextual-product-showcase**   | Product interface shown in realistic context (tilted device mockup) with supporting detail cards floating around it, progressively revealing features | Feature spotlight, product introduction, "here's what it does" scenes |
| **mockup-morph-overwhelm**        | Device mockup morphs shape while content inside scrolls and additional elements flood in from the edges                                               | Product demos that need to show both breadth and depth of features    |
| **interactive-workflow-showcase** | Step-by-step workflow demo with simulated cursor interactions — click a button, see the result, move to next step                                     | Onboarding flows, "how it works" explanations, workflow automation    |

### Data & Impact

| Pattern                 | Description                                                                                                          | Best for                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **counting-icon-burst** | A central counter animates up while icons burst outward in a radial pattern, each representing a category or feature | Statistics reveals, growth metrics, "by the numbers" scenes                 |
| **decrypt-pan-track**   | Text decodes character by character (hacker-flip) while the camera simultaneously pans and tracks across the frame   | Tech product reveals, data processing visualization, cipher/security themes |

### Reveal & Transition

| Pattern                     | Description                                                                                                                           | Best for                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **assembly-focus-reveal**   | Multiple elements fly in from various directions and assemble into a formation, then the camera narrows focus to the hero element     | Feature ecosystem → hero product, "all of this comes together" moments   |
| **content-displace-reveal** | New content physically collides with and displaces existing elements (outgoing elements shoved aside by incoming ones)                | Competitive comparisons, "out with the old, in with the new" transitions |
| **split-comparison-reveal** | Screen splits into two halves showing contrasting states (before/after, old/new, problem/solution) with simultaneous animated content | Comparison scenes, transformation stories, A/B demonstrations            |
| **orbit-collapse-action**   | Elements orbit around a center point, then collapse inward converging to a single action element (CTA button, logo)                   | Closing scenes, CTA moments, "everything leads here"                     |

### CTA & Closing

| Pattern                      | Description                                                                                                     | Best for                                                          |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **morph-press-interact**     | A hero element morphs into a CTA button shape, then a cursor enters and clicks it with physical spring response | Final CTA scenes, "try it now" moments, closing with action       |
| **video-kinetic-text-pivot** | Background video plays while kinetic text overlays pivot, rotate, and transform in sync with the narrative      | Energy-heavy scenes, music-driven moments, brand manifesto closes |

---

## How to write `section_plan.md`

One section per scene, in scene order. For each scene answer: what does the viewer see, what moves, how does it feel.

1. **Describe spatial relationships in natural language** — "product screenshot dominates the left two-thirds of the frame with a slight 3D tilt; feature bullets enter from the right with staggered timing"
2. **Reference effects by name** from the catalog above (e.g. `3d-page-scroll`, `cursor-click-ripple`)
3. **Reference choreography patterns for structural inspiration** (e.g. "follow `assembly-focus-reveal`")
4. **Specify the emotional and visual intent** — the build agent chooses the concrete layout and code
5. **Do NOT prescribe specific layout templates or pixel values** — describe what you want to see, not where things go numerically
6. **Ensure variety** — at least 3 different compositional arrangements across scenes; don't center everything

## See also

- `/story-design` — story / narrative architecture (upstream; produces `narrator_scripts.json`).
- `/hyperframes-animation` — the catalog of blueprints + atomic rules a build agent uses to realize this plan.
- `/product-launch-video` — orchestrator that consumes `section_plan.md` and drives the build phase.
