---
name: hyperframes-adapters
description: HyperFrames runtime adapters — GSAP, Lottie, Three.js, Anime.js, CSS animations, Web Animations API, and TypeGPU/WebGPU. Use when wiring any non-default animation runtime into a HyperFrames composition so it seeks deterministically. Routes to a single reference file per runtime.
---

# HyperFrames Adapters

HyperFrames seeks animations through per-runtime adapters. Each adapter has the same shape: the composition owns the animation objects, HyperFrames owns the clock and dispatches seek events.

Read `hyperframes-core` first for the HTML composition contract. Then load the one runtime reference you need — adapters are independent, never cross-reference each other.

## Routing

| Runtime                  | Read                                                                            |
| ------------------------ | ------------------------------------------------------------------------------- |
| GSAP (default)           | `references/gsap.md`                                                            |
| GSAP — drop-in effects   | `references/gsap-effects.md`                                                    |
| GSAP — transforms / perf | `references/gsap-transforms-and-perf.md`                                        |
| GSAP — easing / stagger  | `references/gsap-easing-and-stagger.md`                                         |
| GSAP — timeline / labels | `references/gsap-timeline-and-labels.md`                                        |
| Lottie / dotLottie       | `references/lottie.md` — `window.__hfLottie`, After Effects exports             |
| Three.js / WebGL         | `references/three.md` — `AnimationMixer`, `hf-seek` event handling              |
| Anime.js                 | `references/animejs.md` — `window.__hfAnime`                                    |
| CSS keyframes            | `references/css-animations.md` — `animation-delay` / `play-state` / `fill-mode` |
| Web Animations API       | `references/waapi.md` — `element.animate()`, `Animation.currentTime` seeking    |
| TypeGPU / WebGPU         | `references/typegpu.md` — `navigator.gpu`, WGSL, compute pipelines              |

## Picking a runtime

- **GSAP** is the default for nearly all motion work — covers timeline orchestration, transforms, easing, stagger.
- **Lottie** when an asset has its own pre-baked timeline (typically After Effects exports).
- **Three.js** for 3D scenes, camera motion, shader-driven visuals.
- **Anime.js** for lightweight tweening when GSAP is overkill.
- **CSS** for simple repeated motifs, decoration, shimmer — no JavaScript animation cost.
- **WAAPI** for native browser keyframes without a GSAP dependency.
- **TypeGPU / WebGPU** for GPU-rendered canvases (particles, liquid glass, custom shaders).

Multiple adapters can coexist in one composition. Each runtime registers its instances on the runtime-specific global so HyperFrames can seek all of them in one pass.
