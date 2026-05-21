# Animation Effects Catalog

> ⚠ AUTO-GENERATED from `skills/hyperframes-animation/rules/*.md`. Do NOT edit by hand.
> Regenerate: `node skills/visual-design/scripts/generate-effects-catalog.mjs`

Reference these effects **by name** (backtick-wrapped) in `section_plan.md`. The build agent (Phase 4) translates each name into its `hyperframes-animation/rules/<name>.md` recipe.

Phase 3 self-validates against this catalog via `validate-section-plan.mjs` — every effect cited in the plan must appear here.

Total effects: 27

## SVG & Icons

| Effect                | Description                                                                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `svg-icon-enrichment` | Animate internal SVG elements (rotating hands, opening blades, pulsing dots, dash flows) to make icons feel alive without replacing them. |
| `svg-path-draw`       | Animate SVG paths drawing progressively using stroke-dasharray and stroke-dashoffset.                                                     |

## Camera & Viewport

| Effect                   | Description                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `camera-cursor-tracking` | Two-phase virtual camera that locks viewport to a moving focal point with configurable initial positioning.                                       |
| `coordinate-target-zoom` | Zoom into a specific non-centered element by combining scale with counter-translation — target ends at viewport center after the zoom completes.  |
| `multi-phase-camera`     | Sequential camera zoom with 2-3 distinct phases (pull-back / focus / push) plus continuous micro-drift for organic cinematic feel.                |
| `viewport-change`        | Virtual camera — simulate zoom / pan / focus-lock by transforming a wrapper around all scene content. Camera moves right → world translates left. |

## Interaction & Click

| Effect                   | Description                                                                                                                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cursor-click-ripple`    | Animated mouse cursor moves to target, clicks with scale depression and expanding ripple rings.                                                                                              |
| `physics-press-reaction` | Cursor + element synchronized press via subtractive spring forces — cursor lands on element, both compress together, then release. Distinct from press-release-spring (which has no cursor). |
| `press-release-spring`   | Tactile button press with linear compression, spring-based elastic recovery, and layered visual feedback (shadow shrink + release burst + background glow).                                  |

## Text & Typography

| Effect                     | Description                                                                                                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `3d-text-depth-layers`     | Multiple offset text layers create a stacked 3D shadow / extrusion effect on large typography — more impactful than CSS text-shadow because each layer is a full DOM element.           |
| `asr-keyword-glow`         | Keywords glow + scale up when "spoken" — attack/sustain/release envelope synced to per-word timestamps. Even without real audio, hardcoded timings create a "narrator emphasis" effect. |
| `context-sensitive-cursor` | Cursor color and styling that adapt to the current text segment being typed — accent color on highlights, dim on placeholders, etc.                                                     |
| `counting-dynamic-scale`   | Counter animation where font size grows with the counting value, creating escalating visual weight.                                                                                     |
| `discrete-text-sequence`   | Replace entire text states at frame thresholds for non-linear typing effects — typos, bulk additions, pauses, backspaces, simulated thinking.                                           |
| `hacker-flip-3d`           | Character-level 3D rotation with random glyph substitution for a decryption reveal effect.                                                                                              |
| `vertical-spring-ticker`   | Slot-machine style vertical scrolling using additive spring physics within a masked container — each spring contributes one "step" of scroll.                                           |

## Layout & 3D

| Effect                     | Description                                                                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `3d-page-scroll`           | Full webpage rendered as tilted 3D card that scrolls to reveal specific sections.                                                               |
| `ai-tracking-box`          | Animated bounding box with L-shaped corner markers following an oscillating path — simulates AI object detection / tracking.                    |
| `avatar-cloud-network`     | Avatars distributed on an elliptical ring connected by SVG dashed lines to a center hub — social proof "community" reveal with staggered entry. |
| `center-outward-expansion` | Elements start clustered at screen center and expand outward to their final positions, driven by a shared progress value.                       |
| `orbit-3d-entry`           | Elements flip in from 3D space then settle into continuous elliptical orbit around a focal point.                                               |
| `split-tilt-cards`         | Two cards side-by-side with opposing Y-rotation creating a symmetric 3D split-screen layout for comparisons or feature pairs.                   |

## Transition & Motion

| Effect                       | Description                                                                                                                                                |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `card-morph-anchor`          | Container morphs dimensions and border-radius between shots, serving as a visual transition anchor.                                                        |
| `dynamic-content-sequencing` | Auto-calculate timeline start/end times from content length + per-item duration config — longer content gets more screen time without hardcoded numbers.   |
| `reactive-displacement`      | Physical collision where an entering element's spring drives the exiting element's displacement — single source of truth makes the motion causally linked. |
| `scale-swap-transition`      | Coordinated shrink-out + spring pop-in morph-like transition between two elements — no SVG path interpolation needed.                                      |
| `sine-wave-loop`             | Continuous breathing / idle ambient motion using trigonometry — keeps elements alive after entry settles. Pairs with virtually every entry rule.           |
