---
name: hyperframes-animation
description: Atomic animation rules + scene blueprints for HyperFrames promo videos. Default path is rule composition — pick 2-4 rules from the index and combine them on a single paused GSAP timeline. Multi-phase scene templates (blueprints) and runnable examples live in `blueprints-index.md`, loaded only when authoring a full pre-designed scene. HyperFrames-native: seek-safe, deterministic.
---

# HyperFrames Animation

Atomic motion **rules** and multi-phase scene **blueprints**.

For the composition contract (data attributes, sub-compositions, determinism) see `hyperframes-core`. For GSAP API specifics (eases, transform aliases, allowlist) see `hyperframes-adapters/references/gsap.md`.

## Default: compose atomic rules

Pick 2-4 rules from `rules-index.md`, glue them together with a single paused GSAP timeline, done. This is faster and produces less code than starting from a blueprint.

## Load a blueprint when

- The scene matches an existing pre-designed multi-phase template (brand-reveal, social-proof, demo-page-scroll-spotlight, etc.) and reusing its phase pipeline saves real authoring time
- You want runnable ground-truth code for a complex 4-5 phase choreography

Blueprints live in `blueprints-index.md`. Each entry points to `blueprints/<id>.md` (recipe) and `examples/<id>.html` (runnable sample). Do not read it speculatively; load it when you've already decided you need scene-level orchestration.

## Routing

| Want to…                                                  | Read                                                |
| --------------------------------------------------------- | --------------------------------------------------- |
| Pick an atomic motion pattern by trigger / tag            | `rules-index.md`                                    |
| Read one rule's full HTML / CSS / GSAP recipe             | `rules/<name>.md`                                   |
| Pick a multi-phase scene template                         | `blueprints-index.md`                               |
| Read one blueprint's full recipe                          | `blueprints/<id>.md` + `examples/<id>.html`         |
| Author a scene transition (CSS-driven, between two clips) | `transitions/overview.md`, `transitions/catalog.md` |
| Look up a broader motion-design technique                 | `techniques.md`                                     |
| Analyze an existing composition's animation map           | `scripts/animation-map.mjs`                         |

## Critical Constraints (apply to every rule and blueprint)

- **Single paused timeline per composition** — registered to `window.__timelines["composition-id"]`.
- **`data-duration` on the root** governs render length, not the GSAP timeline's intrinsic length.
- **Pre-calculated layout constants** — never derive positions from `getBoundingClientRect()` at tween time.
- **GSAP transform aliases only** (`x`, `y`, `scale`, `rotation`) — `width` / `height` / `left` / `top` are forbidden.
- **No infinite repeats** — `repeat: -1` is forbidden; compute finite repeats from `data-duration`.
- **No nondeterministic state** — no `Math.random()`, no `Date.now()`, no `performance.now()`, no network fetches. State must be a pure function of `tl.time()`.

## Scripts

```bash
node skills/hyperframes-animation/scripts/animation-map.mjs <composition-dir> \
  --out <composition-dir>/.hyperframes/anim-map
```

Reads every GSAP timeline registered on `window.__timelines`, enumerates tweens, samples bboxes, computes flags, outputs `animation-map.json`. Use it to audit choreography (dead zones, stagger consistency, lifecycle warnings) after authoring.

## See Also

- `hyperframes-core` — composition structure, data attributes, sub-compositions, deterministic render contract
- `hyperframes-adapters` — GSAP / Lottie / Three / Anime.js / CSS / WAAPI / TypeGPU runtime references
- `hyperframes-creative` — palettes, typography, narration, beat planning (non-animation creative direction)
- `hyperframes-cli` — `npx hyperframes lint / validate / inspect / preview / render`
