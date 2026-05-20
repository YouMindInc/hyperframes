# Section 05 — Transitions (Shader)

WebGL-style shader transitions between beats: chromatic split, sdf-iris, domain-warp dissolve, whip-pan, etc. These are the "expensive-looking" transitions that signal high production value.

**When to study this section:** any composition with multi-beat structure where the transition between beats should feel like a cinematic cut, not a CSS crossfade. In a real video, shader transitions live in `HyperShader.init({ transitions: [...] })` orchestrating between sub-compositions — see `videos/v9/huly-launch/index.html` for the production pattern.

**For this library**, the scenes demonstrate the VISUAL EFFECT of shader transitions within a single standalone HTML — using Canvas 2D + GLSL-style algorithms to mimic the effect inline. The technique transfers directly to the @hyperframes/shader-transitions runtime.

---

## Scenes

| Scene | Duration | Techniques | Why study |
|-------|----------|------------|-----------|
| [`scene-01-shader-transitions-showcase/`](scene-01-shader-transitions-showcase/) | 6s | 4-panel grid demonstrating 4 shader transition types side-by-side. Each panel pre-paints Beat A (cyan/violet grid + circles + "A") and Beat B (warm magenta/amber + stripes + "B") to offscreen Canvas 2D contexts, then runs ONE transition between them: (1) **chromatic-split** RGB channel offset with scanlines; (2) **sdf-iris** circle reveal expanding from center with edge ring; (3) **domain-warp** organic FBM noise dissolve; (4) **whip-pan** horizontal motion-blur swipe. Transitions stagger at 0.5s, 1.5s, 2.5s, 3.5s so all 4 are caught across snapshot frames. | Single scene proves 4 distinct shader-transition effects work standalone — agents can lift the Canvas 2D + GLSL-style mask algorithms directly into custom transitions without needing the @hyperframes/shader-transitions runtime. |
| [`scene-02-ripple-shader-transition/`](scene-02-ripple-shader-transition/) | 6s | **Dedicated single-shader showcase: ripple A → B transition.** UNDER (cool blue underwater) → OVER (warm amber sunset) with a centered ripple sweep over a 2-second window. Eight concentric expanding rings drawn with R/G/B channel offsets simulate chromatic aberration; a central white-flash radial gradient peaks at the midpoint; the two scenes crossfade at peak distortion. | The pattern for **individual shader transitions** between two beats. Demonstrates the canonical `gsap.ticker.add()` reading `tl.time()` pattern (mandatory for seekable canvas rendering) plus the bell-curve intensity (`sin(u * π)`) that gives shader transitions their characteristic peak-then-fade arc. |
| [`scene-03-glitch-shader-transition/`](scene-03-glitch-shader-transition/) | 6s | **Cyber-glitch A → B transition.** SIGNAL (deep purple) → DECODED (vivid green). Canvas 2D draws 12 horizontal slice bands with seeded "random" y-positions, heights, and x-displacements; each slice paints in 3 RGB-offset channels to simulate RGB-split chromatic glitch. Hero text jitters during the glitch window. Central flash on the deepest displacement. All 12 slice positions hardcoded so the glitch is deterministic + seekable. | The cyber/VHS-glitch transition pattern. Use for tech/sci-fi reveals, mode switches, or any beat that wants "the signal cut out and something else came through." Three distinct shader-transition types now in section 05 (ripple = concentric, chromatic-aberration = on-image RGB, glitch = sliced bands) cover the most common shader transition aesthetics. |

---

## Important pattern

This scene uses `gsap.ticker.add()` reading `tl.time()` to drive its Canvas 2D rendering — NOT `tl.to(proxy, {onUpdate: render})`. The proxy+onUpdate pattern does NOT fire under `tl.seek()` (which the snapshot/render CLI uses). See `beat-builder-guide.md` "CANVAS RENDER LOOPS" rule, and `07-html-in-canvas/scene-02-canvas-ascii/index.html` for another example.

## QC log

- scene-01: **PASS** — 6 frames; frame 1 black startup, frame 2 chromatic-split mid (RGB ghosted A+B in panel 1), frame 3 sdf-iris mid-reveal (orange edge ring in panel 2), frame 4 domain-warp organic mask in panel 3 + whip-pan starting in panel 4, frame 5 whip-pan mid (A→B motion blur), frame 6 all panels rebounded to A. All 4 transition types visibly caught.
- scene-02: **PASS** — 6 frames; frame 1 black intro, frame 2 UNDER scene fully visible (blue gradient + white "UNDER" hero), frame 3 mid-ripple peak (RGB chromatic aberration visible on text + central white flash + colors blending blue→orange), frame 4 OVER revealed (orange gradient + "OVER" hero), frames 5-6 OVER scene held with subtle Ken Burns drift. Authored from scratch (not lifted) to fill the section-05 gap with the canonical single-shader transition pattern.
