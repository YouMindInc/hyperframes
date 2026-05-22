---
name: video-motion-language
description: "Unified easing presets, duration norms, stagger limits, exit/entry timing for consistent motion across scenes [easing, spring, timing, rhythm, duration]"
category: visual-design
---

# Motion Language for Video

A good promo video feels like one continuous piece, not a slideshow of unrelated animations. This requires a consistent motion language: the same easing curves, the same timing rhythm, and the same spring feel across all scenes.

**`EASE` / `DUR` JS constants come from `./design-system/design.html` §5. This file owns video-craft numerics** — spring intents, frame counts at 30 fps, stagger caps, the "cut-the-curve" transition spec.

## Spring intents

HyperFrames motion runs on GSAP, not a spring solver. Spring **intents** below describe the feel each named role should have; the build agent realizes them with the GSAP ease in the next table. Reuse the same intent for similar elements across scenes.

| Intent     | Feel                              | GSAP ease + duration                 | Use for                                       | Archive example                            |
| ---------- | --------------------------------- | ------------------------------------ | --------------------------------------------- | ------------------------------------------ |
| **entry**  | Confident overshoot, settles fast | `back.out(1.4-1.7)` over 0.45-0.55 s | Primary elements entering the frame           | All 13 animation examples (11/13 use this) |
| **gentle** | Soft glide, no overshoot          | `power3.out` over 0.55-0.70 s        | Background elements, subtle movements         | `concept-demo-decode-pan` text exit        |
| **snappy** | Tight overshoot, near-instant     | `back.out(1.7)` over 0.20-0.30 s     | UI elements, small icons, button-like objects | `cta-orbit-collapse` 6-icon stagger entry  |
| **heavy**  | Weighted deceleration             | `power3.out` over 0.65-0.85 s        | Large images, mockups, hero visuals           | `problem-mockup-overwhelm` phone cluster   |
| **slam**   | Bounce-overshoot, deliberate      | `back.out(1.5)` over 0.30-0.45 s     | Logo/bell impact moments                      | timeline-editor-launch-v5 Act 0 bell slam  |

**Consistency rule**: Similar elements share the same intent. All icons in a scene use `snappy`. All hero images use `heavy`. Do not invent a bespoke ease + duration per element.

## GSAP easing palette

GSAP eases drive every tween — pick from this curated set (the broader GSAP catalog exists, but these read cleanly on video and stay distinct from each other). The counts below are **observed usage** across the 13-file hyperframes-animation/examples archive:

| Curve                 | Use for                                                  | GSAP ease           | Usage count  | Where in archive                                   |
| --------------------- | -------------------------------------------------------- | ------------------- | ------------ | -------------------------------------------------- |
| **back.out(1.4-1.7)** | Overshoot entries (`entry`, `snappy`, `slam`)            | `back.out(1.4)`     | 11/13        | brand-reveal, cta-morph, comparison-split, orbit   |
| **power3 out**        | Smooth refined entrances, slide-outs                     | `power3.out`        | 10/13        | concept-demo text exit, codex stage entry          |
| **power2 out**        | General fade, scale, slider motion                       | `power2.out`        | 9/13         | hook-counter fade, ticker scroll                   |
| **power2 in**         | Quick acceleration (release springs, cut-the-curve exit) | `power2.in`         | 3/13         | workflow-approve press release; cut-the-curve exit |
| **sine inOut**        | Breathing loops, drift cycles                            | `sine.inOut`        | 4/13         | continuous floats (problem-mockup platform icons)  |
| **none / linear**     | Continuous drift, rotation, particles, orbit             | `none`              | 2/13         | cta-orbit-collapse orbit, brand-reveal rotation    |
| **expo out**          | Fast fan-out, cut-the-curve entry                        | `expo.out`          | 2/13         | problem-mockup explode, cut-the-curve entry side   |
| **custom quadratic**  | Stage-open accelerate-then-decelerate                    | `-0.806t² + 1.806t` | codex Beat 1 | codex stage `scale(1.45)→1, blur(14px)→0`          |

**When to choose which**: `back.out(1.4-1.7)` is the entry-overshoot default. `expo.out` is snappy and confident for the entry side of a cut-the-curve transition. `power3.out` is smoother and more refined — secondary elements, ambient motion. `power2.in` is for the _exit_ side of any transition (accelerating departure).

**Forbidden**: `bounce.out` and `elastic.out`. They feel dated and draw attention to the animation itself rather than the content. Real objects decelerate smoothly — they do not bounce. (`back.out` with a low overshoot 1.4-1.7 is the sanctioned overshoot; reserve higher values for explicit playfulness moments only.)

## Duration norms

### The 100/300/500 rule at 30fps

This framework maps animation intent to frame count:

| Intent             | Duration | Frames at 30fps | Use for                            |
| ------------------ | -------- | --------------- | ---------------------------------- |
| Instant feedback   | 100ms    | 3 frames        | Microinteractions, state flickers  |
| State change       | 300ms    | 9 frames        | Element entry, icon swaps          |
| Layout change      | 500ms    | 15 frames       | Scene entrances, major transitions |
| Entrance animation | 800ms    | 24 frames       | Hero reveals, opening sequences    |

Anything beyond 800ms (24 frames) for a single entrance risks feeling slow. If you need a longer build, use stagger across multiple elements rather than extending one element's duration.

At 30fps, frame counts for common actions (calibrated against the archive):

| Action                                  | Duration            | Frames (30fps) | Archive example                                                 |
| --------------------------------------- | ------------------- | -------------- | --------------------------------------------------------------- |
| Fast pop (character reveal, icon)       | 450-550ms           | 14-17 frames   | hacker-flip per-char rotateX in brand-reveal                    |
| Standard entry (card, mockup, headline) | 600-800ms           | 18-24 frames   | comparison-split-cards entry, codex h1 fade-in                  |
| Slow entry (full-screen effect)         | 1000-1200ms         | 30-36 frames   | brand-reveal-assemble-zoom logo zoom                            |
| Element exit                            | 300-600ms           | 9-18 frames    | concept-demo text exit, ticker scroll-off                       |
| Quick emphasis (pulse, flash)           | 100-200ms           | 3-6 frames     | Cursor click ripple peak                                        |
| Cut-the-curve exit                      | 330ms               | 10 frames      | playground-launch all 8 transitions                             |
| Cut-the-curve entry                     | 420ms               | 13 frames      | playground-launch all 8 transitions                             |
| Camera drift (continuous)               | Full scene duration | All frames     | Every example                                                   |
| Stagger delay per item                  | 50-150ms            | 2-5 frames     | cta-orbit 6-icon stagger (0.10s), problem-mockup bubble (0.07s) |

### Exit is faster than entry

Exit animations should be ~75% of the entry duration — not 70%, not 50%. Arrival is deliberate; departure is swift but not abrupt. The 75% ratio is the sweet spot that feels natural without being jarring:

- 15-frame entry → 11-12 frame exit
- 9-frame entry → 6-7 frame exit
- 24-frame entry → 18 frame exit

An exit that is too fast (50%) feels like a glitch. An exit that matches entry duration (100%) feels sluggish and blocks the next scene.

The cut-the-curve transition is calibrated against this rule: entry `0.42s` is ~127% of exit `0.33s`. The asymmetry is _deliberate inversion_ of the normal rule — the entering scene takes longer because it must clear its blur while the audience adapts.

### Total stagger cap

When staggering N items, the total stagger time must stay reasonable:

```
total_stagger = (N - 1) * per_item_delay
```

**Cap total stagger at 500ms (15 frames).** For 10 items at 100ms each, total stagger is 900ms — far too long. Reduce to 50ms per item (500ms total). For many items:

| Item count | Max per-item delay                                | Total stagger | Archive example                            |
| ---------- | ------------------------------------------------- | ------------- | ------------------------------------------ |
| 3-4 items  | 100ms (3 frames)                                  | ~300ms        | comparison-split-cards twin cards          |
| 5-7 items  | 75-100ms (2-3 frames)                             | ~450-700ms    | cta-orbit-collapse 6 icons @ 100ms = 600ms |
| 8-10 items | 50-70ms (1.5-2 frames)                            | ~450ms        | problem-mockup-overwhelm 8 platform icons  |
| 10+ items  | Stagger first 6-8 only; rest enter with last item | 500ms cap     | proof-logo-chain 12-avatar ring            |

## Timing rhythm across scenes

### Beat structure

A well-paced video has a rhythm: tension → release → tension → release. The playground-launch 46-second plan is the cleanest archive reference:

| Phase             | Duration | Pacing                   | Scene types                    |
| ----------------- | -------- | ------------------------ | ------------------------------ |
| **Slow setup**    | 6-10s    | Slow build               | Establishing hero, no VO yet   |
| **Rapid montage** | 6-10s    | 4 scenes in 8s, ~2s each | Cut-the-curve every 1.5-2s     |
| **Process show**  | 12-18s   | Continuous, no cuts      | Screen captures, real workflow |
| **Resolution**    | 3-5s     | Held, breathing          | Logo, URL, CTA                 |

Within a scene:

- **High-energy scenes** (hook, CTA): faster entries (9 frames), tighter stagger, snappy springs
- **Breathing scenes** (brand reveal, emotional beat): slower entries (15-24 frames), gentle springs, longer holds
- **Data scenes** (statistics, features): medium pace, clean stagger, count-up animations

### Hold time

After elements enter, they must remain visible long enough to be read. Minimum hold times, calibrated against archive scene durations:

| Content                              | Minimum hold     | Archive example                         |
| ------------------------------------ | ---------------- | --------------------------------------- |
| Display text (1-3 words)             | 1.0s (30 frames) | timeline-editor Act 0 each section word |
| Short sentence                       | 1.5s (45 frames) | codex h1 hold before next beat          |
| Data/statistic                       | 1.5s (45 frames) | hook-counter-burst counter final hold   |
| Product screenshot                   | 2.0s (60 frames) | metric-video-text-pivot video plate     |
| Complex visual (diagram, comparison) | 2.5s (75 frames) | comparison-split-cards twin reveal      |
| Hero / climax word                   | 0.9-1.4s         | fadeglow Beat 7 "RED" at 800px          |

If the voice-over duration is shorter than the required hold time, extend the scene padding.

### The "stillness before climax" beat

A recurring archive move: a **0.3-0.75s pause** between the main action and the confirmation/result. This silence creates narrative tension before the payoff:

- `cta-orbit-collapse`: icons collapse at 2.2s, demo doesn't spring until 2.95s (0.75s gap)
- `workflow-approve-press`: step 3 active at 3.33s, button enters at 3.52s (0.19s buffer)
- timeline-editor-launch-v2 Act 2b: "_Hold on a final frustrated beat: the cursor sits still, the chat is full, the SFX is still slightly off._"

Plan this beat explicitly. A scene that goes straight from action to payoff loses the dramatic comma.

## Continuous motion principles

From the scene-quality baseline: static elements = dead video. After entry, every visible element must keep moving.

### Post-entry motion patterns

| Pattern                  | How                                                     | Use for                    | Archive example                                                                                              |
| ------------------------ | ------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Slow drift               | `translateX/Y` changing by 0.3-1px per frame            | All elements (default)     | All examples                                                                                                 |
| Sine float               | `Math.sin(t * 0.9) * 6` per-frame Y offset              | Icons, decorative elements | comparison-split-cards cards float ±6px in opposition (π phase)                                              |
| Multiplicative breathing | `scale = final * (1 + Math.sin(t * f) * amp)`           | Hero images, backgrounds   | brand-reveal (±4%), cta-morph (±2%), takeover-ticker (±5% × dual 1.0s + 1.33s frequencies)                   |
| Rotate drift             | `rotation: Math.sin(t * 1.0) * 4°`                      | 3D cards, hero logos       | brand-reveal-assemble-zoom (±4° at 1.5s period)                                                              |
| Orbit                    | `cos/sin(angle)` with continuous angle += t\*speed      | Orbiting icons             | cta-orbit-collapse (RADIUS_X=480, RADIUS_Y=280)                                                              |
| Glow pulse               | `box-shadow: 0 0 var(--g) <accent>` with `--g` animated | CTAs, click targets        | workflow-approve-press, cta-orbit per-icon (38 ± 26px)                                                       |
| Halftone breathing       | Background dot density + radius warp per beat           | Atmospheric scenes         | inspector-logo-intro field has explicit energy arc: explosive → settling → explosive → calm → explosive exit |

**Multiplicative breathing is the most-repeated and most-skipped technique.** Use `onUpdate` reading `tl.time()` to compute the scale, _not_ a `yoyo` tween which overwrites the entry scale:

```javascript
// CORRECT — multiplicative on final scale
tl.to(
  { tick: 0 },
  {
    tick: 1,
    duration: 9999,
    onUpdate: () => {
      const t = tl.time();
      gsap.set(el, { scale: FINAL_SCALE * (1 + Math.sin(t * freq) * amp) });
    },
  },
  startTime,
);

// WRONG — yoyo overwrites entry, breaks scale
tl.fromTo(el, { scale: 1 }, { scale: 1.04, yoyo: true, repeat: -1 });
```

**Forbidden**: Using `Math.sin(frame/40) * 3` as the only form of continuous motion. A 3-pixel float at 40-frame period is barely perceptible and does not count as meaningful motion. The archive's amplitudes start at ±6px and go up to ±5% scale.

**Deterministic clock**: continuous motion always reads `tl.time()` or `tl.progress()`, never `Date.now()` or `Math.random()`. Pseudo-randomness uses a seeded hash:

```javascript
function pseudoHash(i, t) {
  return ((i * 374761393 + t * 668265263) >>> 0) % CHAR_POOL.length;
}
```

## Transition consistency

Scene-to-scene transitions should follow a limited vocabulary (pick 2-3 for the entire video):

### Cut-the-curve (the archive's signature)

The recurring transition across playground-launch (all 8 beats), timeline-editor-launch-v5, codex-plugin, and inspector-logo-intro. Exact spec from playground HANDOFF.md:

```javascript
// Exit (current scene leaves)
gsap.to(
  stage,
  {
    x: -200, // direction alternates per seam
    filter: "blur(8px)",
    duration: 0.33,
    ease: "power2.in",
  },
  "END-0.33",
);

// Entry (next scene arrives)
gsap.set(stage, { x: 200, filter: "blur(8px)" });
gsap.to(
  stage,
  {
    x: 0,
    filter: "blur(0px)",
    duration: 0.42,
    ease: "expo.out",
  },
  0,
);

// Internal reveals offset by 0.42s — they fire AFTER the stage lands
```

Hard rules:

- Both sides use **identical blur magnitude** (8-10px). Mismatched blur reads as a rough cut.
- Direction alternates per seam: right→left→up→down across the video.
- **Background leads by ~0.1s** — the field warp / radial color shift fires before the foreground starts moving (inspector-logo-intro motion rule).
- Internal scene content does not animate until the stage has fully landed.

### Scale + fade (zoom-through)

Zoom into the frame center while fading. Camera moves forward into next headline. Blur peaks mid-transition, previous headline scales down and away. Used for section breaks in article-walkthrough. `power3.in` on zoom acceleration, blur peaks mid, then `expo.out` settle.

### Slide

Content slides directionally (match the narrative flow). The hyperframes-animation `concept-demo-decode-pan` uses this with parallax: foreground `x: -PARALLAX_DIST` (400px) faster than camera pan.

### Morph

A shared element transforms between scenes (strongest narrative connection). `problem-mockup-overwhelm` morphs a phone-cluster rectangle into a circular avatar mark via concurrent `scaleX`, `scaleY`, `borderRadius: 42px → 50%` tweens.

### Hard cut

Instantaneous opacity flip between scenes. Used for high-energy moments (hermes Beats 2-4: grid appears fully populated, no build-in). The background may shift simultaneously but with no easing. Use sparingly — the cut-the-curve is the default; hard cuts are reserved for genre/tonal shifts.

**Do not use a different transition for every scene.** Pick 2-3 for the entire video and repeat them. Repetition of transition type creates professional cohesion — playground-launch uses only cut-the-curve across 8 wildly different visual universes, and that _is_ what holds the video together.
