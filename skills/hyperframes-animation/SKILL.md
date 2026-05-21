---
name: hyperframes-animation
description: Atomic animation rules + scene blueprints for HyperFrames promo videos. Default path is rule composition — pick the rules you need from the index below and combine them. Multi-phase scene templates (blueprints) and runnable examples live in `blueprints-index.md`, loaded only when authoring a full pre-designed scene. HyperFrames-native: single paused GSAP timeline, seek-safe, deterministic.
---

# HyperFrames Animation

Atomic motion **rules** and multi-phase scene **blueprints** for HyperFrames promo videos. HyperFrames-native:

- One paused GSAP timeline per composition, registered to `window.__timelines[data-composition-id]`
- All timing in **seconds** (not frames); `data-start` / `data-duration` carry phase windows
- Only deterministic state — no `Math.random()`, no `Date.now()`, no infinite repeats
- GSAP transform aliases (`x`, `y`, `scale`, `rotation`); never tween layout properties

For the broader HyperFrames composition contract see `hyperframes-core`. For GSAP-specific reference (eases, transform aliases, the animated-property allowlist) see `hyperframes-gsap`.

## When to Use — rules first, blueprints on demand

**Default path: compose atomic rules** from the index below. Rules are the building blocks — pick the 2-4 you need for the scene, glue them together with a single paused timeline, done. This is faster and produces less code than starting from a blueprint.

**Load a blueprint** only when:

- The scene matches an existing pre-designed multi-phase template (brand-reveal, social-proof, CTA orbit-collapse, etc.) and reusing its phase pipeline saves real authoring time
- You want runnable ground-truth code for a complex 4-5 phase choreography

Blueprints live in [`blueprints-index.md`](./blueprints-index.md) — that file is the index, each entry points to the full `blueprints/<id>.md` recipe and `examples/<id>.html` runnable sample. Do not read it speculatively; load it when you've already decided you need scene-level orchestration.

## Atomic Rules (the default toolbox)

Self-contained motion recipes. Each lives at `rules/<name>.md`. The build agent (Phase 4 of `/product-launch-video`) cites these by name in `section_plan.md` references — the auto-generated catalog at `skills/visual-design/effects-catalog.md` is derived from this same `rules/` directory.

### Text & Typography

<rules>
<hacker-flip-3d path="rules/hacker-flip-3d.md">Character-level 3D rotation with deterministic glyph substitution (decryption). GSAP `back.out` ease + per-glyph `onUpdate` for the flicker hash. Tags: text, 3d, reveal, decode</hacker-flip-3d>
<vertical-spring-ticker path="rules/vertical-spring-ticker.md">Slot-machine vertical scrolling using stepped GSAP tweens within a masked column. Tags: text, ticker, scroll, vertical</vertical-spring-ticker>
<counting-dynamic-scale path="rules/counting-dynamic-scale.md">Counter where font size grows with the value for escalating emphasis. Single GSAP tween on a numeric proxy. Tags: counter, scale, font-size, number, dynamic</counting-dynamic-scale>
<discrete-text-sequence path="rules/discrete-text-sequence.md">Replace entire text states at time thresholds for non-linear typing (typos, holds, bulk additions, backspaces). GSAP onUpdate-driven reverse search. Tags: text, typing, discrete, threshold, non-linear</discrete-text-sequence>
<asr-keyword-glow path="rules/asr-keyword-glow.md">Highlight keywords with glow + scale + color synced to ASR word timestamps. Two GSAP tweens per word drive a CSS custom property `--glow` through attack-decay-rest envelope. Tags: asr, audio-sync, highlight, glow, keyword, text</asr-keyword-glow>
<3d-text-depth-layers path="rules/3d-text-depth-layers.md">Multiple offset text layers (N divs at `(i*dx, i*dy)` with decreasing alpha) create a stacked 3D extrusion illusion on large typography. Tags: text, 3d, depth, layers, shadow, typography, stacked</3d-text-depth-layers>
<context-sensitive-cursor path="rules/context-sensitive-cursor.md">Typing cursor whose `background-color` switches at segment boundaries plus square-wave blink via `(tl.time() % cycle) < cycle/2`. Tags: cursor, color, context, typewriter, styling, segment</context-sensitive-cursor>
<dynamic-content-sequencing path="rules/dynamic-content-sequencing.md">Pre-compute a flat `[{startTime, endTime, ...}]` array from a script of `{textMain, textAccent, charSpeed, hold}` entries. Each phrase's window = `chars × charSpeed + hold`. Content-driven duration, no hand-tuned offsets. Tags: timeline, sequencing, dynamic, duration, script-driven</dynamic-content-sequencing>
</rules>

### Camera & Viewport

<rules>
<coordinate-target-zoom path="rules/coordinate-target-zoom.md">Zoom into non-centered elements via scale (outer wrapper) + counter-translation (inner wrapper). Tags: camera, zoom, scale, translate</coordinate-target-zoom>
<camera-cursor-tracking path="rules/camera-cursor-tracking.md">Two-phase virtual camera that locks the viewport to a moving focal point (typing cursor) — static initial framing then focal-point-locked tracking. Uses browser-native `getBoundingClientRect()` / `ctx.measureText()` after `document.fonts.ready`. Tags: camera, tracking, viewport, two-phase, typing</camera-cursor-tracking>
<multi-phase-camera path="rules/multi-phase-camera.md">Sequential camera-zoom system (pull-back / focus / push) plus continuous micro-drift. Tags: camera, zoom, phase, drift, scale, cinematic</multi-phase-camera>
<viewport-change path="rules/viewport-change.md">Virtual camera — simulate zoom / pan / focus-lock by transforming a single `.world` wrapper containing all scene content. Single-element composite transform `translate(x,y) scale(S)`; counter-translate math is `T = -offset × S` (DIFFERENT from coordinate-target-zoom's `T = -offset`). Tags: viewport, camera, zoom, pan, focus-lock</viewport-change>
</rules>

### Layout & Network

<rules>
<avatar-cloud-network path="rules/avatar-cloud-network.md">Avatars on an elliptical ring with SVG connection lines to a center point, staggered entry. Cloud center coordinates must match the centerpiece element exactly. Tags: avatar, cloud, network, social-proof, stagger</avatar-cloud-network>
<3d-page-scroll path="rules/3d-page-scroll.md">Full webpage rendered as a tilted 3D card whose internal content scrolls to reveal specific sections. Pair with asr-keyword-glow for on-page keyword highlighting. Tags: 3d, page, scroll, webpage, tilt, perspective, product-demo</3d-page-scroll>
<center-outward-expansion path="rules/center-outward-expansion.md">Elements start clustered at screen center and expand outward to final positions. Each element gets its target position via CSS once; GSAP tweens transform `x` / `y` offsets to 0 in lockstep with a shared driver. Tags: expansion, scatter, center, reveal, layout, sync</center-outward-expansion>
<split-tilt-cards path="rules/split-tilt-cards.md">Two cards side-by-side with opposing rotationY tilts (+/- baseTilt) and entry slides from their respective sides. Continuous floating runs in phase opposition (`Math.PI` offset). Tags: 3d, cards, split, tilt, comparison, symmetric</split-tilt-cards>
<orbit-3d-entry path="rules/orbit-3d-entry.md">Elements flip in from 3D space (`rotateX` + `rotateY` + `translateZ`) then settle into a continuous elliptical orbit. **Critical**: entry MUST flip in-place at the orbital starting position (`gsap.set` BEFORE phase 1), not at scene center. Tags: orbit, 3d, flip, ellipse, circular, icon, entry, continuous</orbit-3d-entry>
<ai-tracking-box path="rules/ai-tracking-box.md">AI detection overlay — yellow `#facc15` L-bracket corners + confidence label (fluctuating 95-99%) following a target on a sine arc path. Box position recomputed per-frame from target position (never tweened separately). Tags: ai, tracking, bounding-box, detection, corner, ml</ai-tracking-box>
</rules>

### SVG & Icons

<rules>
<svg-icon-enrichment path="rules/svg-icon-enrichment.md">Animate internal SVG elements (rotating hands, oscillating blades, pulsing dots, dash-flow lines) so icons feel alive. **Critical**: use SVG `setAttribute('transform', 'rotate(deg cx cy)')` for explicit center — CSS `transform-origin` + `transform-box: fill-box` interprets origin in bbox-local coords (off-center for thin lines). Tags: svg, icon, animation, micro-animation, rotation, pulse</svg-icon-enrichment>
<svg-path-draw path="rules/svg-path-draw.md">SVG outline draws itself stroke-by-stroke via `stroke-dasharray` / `stroke-dashoffset`. Measure with `getTotalLength()` at composition setup, set initial dashoffset = length, GSAP tweens to 0. For circular progress rings, rotate the stroke `-90deg` so drawing starts at 12 o'clock. Tags: svg, stroke, draw, vector, path, dasharray</svg-path-draw>
</rules>

### Idle & Ambient

<rules>
<sine-wave-loop path="rules/sine-wave-loop.md">Continuous breathing/idle ambient motion. Two forms: GSAP `sine.inOut` yoyo with finite repeats (preferred when standalone) or onUpdate reading `tl.time()` (preferred when multiplying onto another live value). Tags: idle, loop, breathing, sine, ambient</sine-wave-loop>
</rules>

### Transition & Motion

<rules>
<reactive-displacement path="rules/reactive-displacement.md">Physical-collision transition where an entering element's GSAP tween drives the exiting element's displacement. Three concurrent tweens at the same timeline position with victim durations 40-50% of the intruder's. Tags: transition, physics, collision, displacement, push</reactive-displacement>
<press-release-spring path="rules/press-release-spring.md">Tactile button press: linear compression then spring recovery via two adjacent GSAP tweens on the same property. Variations: color transition, shadow depth via CSS vars, release burst, background glow. Tags: spring, press, button, interaction, physics, glow, burst</press-release-spring>
<physics-press-reaction path="rules/physics-press-reaction.md">Physical click simulation — two sequential GSAP scale tweens (down to 0.9, up to 1.0) approximate a spring with overshoot. Pass a single targets array `["#cta", "#cursor"]` to compress both together for tactile contact feel. Tags: spring, click, physics, press, interaction, cursor</physics-press-reaction>
<cursor-click-ripple path="rules/cursor-click-ripple.md">Animated cursor moves to a target, depresses cursor + target together on click, emits an expanding ripple with attack-decay opacity envelope. Element lives in DOM from t=0 with `opacity: 0` (no conditional rendering). Tags: cursor, click, ripple, interaction, mouse, button, keyframes</cursor-click-ripple>
<scale-swap-transition path="rules/scale-swap-transition.md">Coordinated morph between two DOM elements at the same screen center. Exit cluster shrinks + fades; entrance pops in with `back.out(2)` overshoot. Tags: transition, morph, scale, swap</scale-swap-transition>
<card-morph-anchor path="rules/card-morph-anchor.md">Container morphs apparent size + corner radius + surface treatment between two shots, then fades to reveal the real target underneath. HyperFrames substitutes uniform `scale` for the forbidden `width`/`height` tween, plus paint-only `borderRadius`/`background`/`boxShadow`. Tags: morph, anchor, transition, border-radius, container, shape, handoff</card-morph-anchor>
</rules>

## Scene Blueprints (load on demand)

Need a full multi-phase scene template instead of composing from rules? See [`blueprints-index.md`](./blueprints-index.md) — 13 blueprints covering: social-proof, concept-demo, brand-reveal, takeover, demo, opening-hook, workflow, problem, cta (×2), comparison, metric, messaging. Each blueprint entry includes a runnable example path.

Default to rule composition. Only load blueprints-index.md when you've identified a need for scene-level orchestration that maps cleanly to one of the 13 templates.

## Critical Constraints (apply to every rule and blueprint)

- **Single paused timeline per composition** — registered to `window.__timelines["composition-id"]`.
- **`data-duration` on the root** governs render length, not the GSAP timeline's intrinsic length.
- **Pre-calculated layout constants** — never derive positions from `getBoundingClientRect()` at tween time.
- **GSAP transform aliases only** (`x`, `y`, `scale`, `rotation`) — `width` / `height` / `left` / `top` are forbidden.
- **No infinite repeats** — `repeat: -1` is forbidden; compute finite repeats from `data-duration`.
- **No nondeterministic state** — no `Math.random()`, no `Date.now()`, no `performance.now()`, no network fetches. State must be a pure function of `tl.time()`.

## See Also

- [`blueprints-index.md`](./blueprints-index.md) — scene blueprints + runnable examples (load on demand)
- `hyperframes-core` — composition structure, data attributes, clips, sub-compositions, deterministic render contract
- `hyperframes-gsap` — GSAP API reference scoped to HyperFrames (eases, allowlist, transform aliases)
- `hyperframes-cli` — `npx hyperframes lint / validate / inspect / preview / render`
- `hyperframes-creative` — design.md handling, palettes, visual styles, motion principles
