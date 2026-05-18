---
name: hyperframes-gsap
description: GSAP animation API reference for HyperFrames. Use when writing seekable GSAP timelines in HyperFrames compositions, including gsap.to(), from(), fromTo(), set(), timeline position parameters, labels, easing, stagger, finite repeats, and transform performance.
---

# HyperFrames GSAP

GSAP usage scoped to HyperFrames' seek-driven render model. This skill is the GSAP reference _as constrained by HyperFrames_ — for the framework's broader composition contract see `hyperframes-core`.

## HyperFrames Contract

HyperFrames controls GSAP through its `gsap` runtime adapter. Create a paused timeline synchronously, register it on `window.__timelines` with the exact `data-composition-id`, and let HyperFrames seek it.

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });

  tl.from(".title", { y: 48, opacity: 0, duration: 0.6, ease: "power3.out" }, 0);
  tl.to(".accent", { scaleX: 1, duration: 0.5, ease: "power2.out" }, 0.25);

  window.__timelines["main"] = tl; // key must equal data-composition-id on the composition root
</script>
```

- The registry key must match the composition root's `data-composition-id`.
- Do not call `tl.play()` for render-critical motion.
- Do not build timelines inside async code, timers, or event handlers.
- Keep loops finite. HyperFrames renders finite video durations.
- **Render duration comes from `data-duration` on the composition root, not from GSAP timeline length.** Do not pad the timeline with empty tweens like `tl.set({}, {}, 283)` to "extend" it. (Some external docs show this trick; in HyperFrames it conflicts with the seek-driven duration model — set `data-duration` instead.)

## Core Tween Methods

- **gsap.to(targets, vars)** — animate from current state to `vars`. Most common.
- **gsap.from(targets, vars)** — animate from `vars` to current state (entrances).
- **gsap.fromTo(targets, fromVars, toVars)** — explicit start and end.
- **gsap.set(targets, vars)** — apply immediately (duration 0).

Always use **camelCase** property names (e.g. `backgroundColor`, `rotationX`).

## Common vars (cheatsheet)

- **duration** — seconds (default 0.5).
- **delay** — seconds before start.
- **ease** — `"power1.out"` (default), `"power3.inOut"`, `"back.out(1.7)"`, `"elastic.out(1, 0.3)"`, `"none"`. See `references/easing-and-stagger.md`.
- **stagger** — number or object. See `references/easing-and-stagger.md`.
- **repeat** — finite number; never `-1` in HyperFrames. Compute repeats from the visible duration.
- **yoyo** — alternates direction with repeat.
- **overwrite** — `false` (default), `true`, or `"auto"`.
- **immediateRender** — default `true` for from()/fromTo(). Set `false` on later tweens targeting the same property+element.
- **onComplete**, **onStart**, **onUpdate** — callbacks.

For transforms, autoAlpha, clearProps, and SVG specifics see `references/transforms-and-perf.md`.

## Animated Property Allowlist

HyperFrames is stricter than vanilla GSAP. Animate only:

- **Compositor-cheap**: `opacity`, `x`, `y`, `scale`, `scaleX`, `scaleY`, `rotation`, `rotationX`, `rotationY`, `skewX`, `skewY`, `transformOrigin`
- **Visual fills**: `color`, `backgroundColor`, `borderColor`, `borderRadius`
- **CSS variables**: `"--hue": 180` etc.

**Avoid** (use the transform alias instead):

- `width` / `height` / `top` / `left` / `right` / `bottom` / `margin*` / `padding*` — trigger layout reflows. Use `scaleX/Y` (with `transformOrigin`) or `x` / `y`.

**Forbidden** (breaks the renderer or the clip lifecycle):

- `display`, `visibility` — never tween these directly. Use `autoAlpha` (sets opacity + visibility together at endpoints, doesn't tween the discrete property).
- Anything driven by `Math.random()`, `Date.now()`, `performance.now()`, or event handlers — animation state must be deterministic from time alone.

> **Note**: `docs/guides/gsap-animation.mdx` lists `width`/`height`/`visibility` in its "Supported Properties" — that list is too permissive for HyperFrames composition rules. This allowlist is the canonical one. See `hyperframes-core/references/determinism-rules.md` for the full deterministic-render contract.

## References

- `references/timeline-and-labels.md` — timeline creation, position parameter (`+=`, `<`, `>`), labels, nesting, sub-comp `fromTo` preference, playback control.
- `references/easing-and-stagger.md` — easing families, stagger objects, function-based values, `gsap.matchMedia()`, `gsap.defaults()`.
- `references/transforms-and-perf.md` — transform aliases, autoAlpha, `quickTo`, `will-change`, performance rules.
- `references/effects.md` — drop-in recipes: typewriter (with cursor / backspace / word rotation) + audio visualizer (uses `scripts/extract-audio-data.py`).

## Best Practices

- Use camelCase property names; prefer transform aliases and autoAlpha.
- Prefer timelines over chained tweens with delays; use the position parameter.
- Add labels with `addLabel()` for readable sequencing.
- Pass defaults into the timeline constructor.
- Store the tween/timeline return value when controlling playback.

## Do Not

- Animate layout properties (`width`/`height`/`top`/`left`) when transforms suffice.
- Use both `svgOrigin` and `transformOrigin` on the same SVG element.
- Chain animations with `delay` when a timeline can sequence them.
- Create tweens before the DOM exists.
- Use infinite `repeat: -1` in HyperFrames compositions — use finite repeat counts computed from the visible duration.

## Credits And References

- HyperFrames adapter source: `packages/core/src/runtime/adapters/gsap.ts`.
- GSAP documentation: https://gsap.com/docs/v3/
- GSAP timeline pause and seek behavior: https://gsap.com/docs/v3/GSAP/Timeline/pause%28%29/
