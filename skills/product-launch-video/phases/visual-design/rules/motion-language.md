---
name: video-motion-language
description: "Unified easing presets, duration norms, stagger limits, exit/entry timing for consistent motion across scenes [easing, spring, timing, rhythm, duration]"
category: visual-design
---

# Motion Language for Video

A good promo video feels like one continuous piece, not a slideshow of unrelated animations. This requires a consistent motion language: the same easing curves, the same timing rhythm, and the same spring feel across all scenes.

**Pair with `hyperframes-creative/references/motion-principles.md`** for the qualitative guardrails (easing-as-emotion, build/breathe/resolve, load-bearing GSAP rules — no double transforms, prefer `fromTo` over `from`). This file is the **numeric overlay** — spring values, frame counts at 30 fps, stagger caps — that the build agent translates into GSAP code.

## Spring intents

HyperFrames motion runs on GSAP, not a spring solver. Spring **intents** below describe the feel each named role should have; the build agent realizes them with the GSAP ease in the next table. Reuse the same intent for similar elements across scenes.

| Intent     | Feel                              | GSAP ease + duration             | Use for                                       |
| ---------- | --------------------------------- | -------------------------------- | --------------------------------------------- |
| **entry**  | Confident overshoot, settles fast | `back.out(1.4)` over 0.40-0.50 s | Primary elements entering the frame           |
| **gentle** | Soft glide, no overshoot          | `power2.out` over 0.55-0.70 s    | Background elements, subtle movements         |
| **snappy** | Tight overshoot, near-instant     | `back.out(1.7)` over 0.20-0.30 s | UI elements, small icons, button-like objects |
| **heavy**  | Weighted deceleration             | `power3.out` over 0.65-0.85 s    | Large images, mockups, hero visuals           |

**Consistency rule**: Similar elements share the same intent. All icons in a scene use `snappy`. All hero images use `heavy`. Do not invent a bespoke ease + duration per element.

## GSAP easing palette

GSAP eases drive every tween — pick from this curated set (the broader GSAP catalog exists, but these read cleanly on video and stay distinct from each other):

| Curve             | Use for                               | GSAP ease       | Equivalent cubic-bezier         |
| ----------------- | ------------------------------------- | --------------- | ------------------------------- |
| **expo out**      | Elements entering (snappy, confident) | `expo.out`      | `cubic-bezier(0.16, 1, 0.3, 1)` |
| **power3 out**    | Smooth refined entrances              | `power3.out`    | `cubic-bezier(0.25, 1, 0.5, 1)` |
| **power2 in**     | Elements leaving (exit accelerates)   | `power2.in`     | —                               |
| **power2 inOut**  | State changes, morphs                 | `power2.inOut`  | —                               |
| **back.out(1.4)** | Overshoot entries (`entry` intent)    | `back.out(1.4)` | —                               |
| **none / linear** | Continuous drift, rotation, particles | `none`          | —                               |

**When to choose which**: `expo.out` is snappy and confident — primary hero entrances, CTA moments. `power3.out` is smoother and more refined — secondary elements, ambient motion. `back.out(1.4)` is the entry-overshoot default.

**Forbidden**: `bounce.out` and `elastic.out`. They feel dated and draw attention to the animation itself rather than the content. Real objects decelerate smoothly — they do not bounce. (`back.out` with a low overshoot 1.2-1.7 is the sanctioned overshoot; reserve higher values for explicit playfulness moments only.)

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

At 30fps, frame counts for common actions:

| Action                        | Duration            | Frames (30fps) |
| ----------------------------- | ------------------- | -------------- |
| Element entry                 | 300-500ms           | 9-15 frames    |
| Element exit                  | 200-350ms           | 6-10 frames    |
| Quick emphasis (pulse, flash) | 100-200ms           | 3-6 frames     |
| Transition between scenes     | 400-600ms           | 12-18 frames   |
| Camera drift (continuous)     | Full scene duration | All frames     |
| Stagger delay per item        | 50-100ms            | 2-3 frames     |

### Exit is faster than entry

Exit animations should be ~75% of the entry duration — not 70%, not 50%. Arrival is deliberate; departure is swift but not abrupt. The 75% ratio is the sweet spot that feels natural without being jarring:

- 15-frame entry → 11-12 frame exit
- 9-frame entry → 6-7 frame exit
- 24-frame entry → 18 frame exit

An exit that is too fast (50%) feels like a glitch. An exit that matches entry duration (100%) feels sluggish and blocks the next scene.

### Total stagger cap

When staggering N items, the total stagger time must stay reasonable:

```
total_stagger = (N - 1) * per_item_delay
```

**Cap total stagger at 500ms (15 frames).** For 10 items at 100ms each, total stagger is 900ms — far too long. Reduce to 50ms per item (500ms total). For many items:

| Item count | Max per-item delay                                | Total stagger |
| ---------- | ------------------------------------------------- | ------------- |
| 3-4 items  | 100ms (3 frames)                                  | ~300ms        |
| 5-7 items  | 75ms (2 frames)                                   | ~450ms        |
| 8-10 items | 50ms (1.5 frames)                                 | ~450ms        |
| 10+ items  | Stagger first 6-8 only; rest enter with last item | 500ms cap     |

## Timing rhythm across scenes

### Beat structure

A well-paced video has a rhythm: tension → release → tension → release.

- **High-energy scenes** (hook, CTA): faster entries (9 frames), tighter stagger, snappy springs
- **Breathing scenes** (brand reveal, emotional beat): slower entries (15 frames), gentle springs, longer holds
- **Data scenes** (statistics, features): medium pace, clean stagger, count-up animations

### Hold time

After elements enter, they must remain visible long enough to be read. Minimum hold times:

| Content                              | Minimum hold     |
| ------------------------------------ | ---------------- |
| Display text (1-3 words)             | 1.0s (30 frames) |
| Short sentence                       | 1.5s (45 frames) |
| Data/statistic                       | 1.5s (45 frames) |
| Product screenshot                   | 2.0s (60 frames) |
| Complex visual (diagram, comparison) | 2.5s (75 frames) |

If the voice-over duration is shorter than the required hold time, extend the scene padding.

## Continuous motion principles

From `scene-quality-baseline`: static elements = dead video. After entry, every visible element must keep moving.

### Post-entry motion patterns

| Pattern      | How                                          | Use for                     |
| ------------ | -------------------------------------------- | --------------------------- |
| Slow drift   | `translateX/Y` changing by 0.3-1px per frame | All elements (default)      |
| Gentle scale | Scale oscillating 1.0 → 1.02 → 1.0 over 3-4s | Hero images, backgrounds    |
| Float        | `sin(frame * speed) * amplitude` on Y        | Icons, decorative elements  |
| Rotate       | 0.1-0.5 degree per frame                     | 3D cards, orbiting elements |

**Forbidden**: Using `Math.sin(frame/40) * 3` as the only form of continuous motion. A 3-pixel float is barely perceptible and does not count as meaningful motion.

## Transition consistency

Scene-to-scene transitions should follow a limited vocabulary (pick 2-3 for the entire video):

- **Scale + fade**: zoom into the frame center while fading
- **Slide**: content slides directionally (match the narrative flow)
- **Morph**: a shared element transforms between scenes (strongest narrative connection)
- **Cut**: hard cut (use sparingly, for high-energy moments)

**Do not use a different transition for every scene.** Repetition of transition type creates professional cohesion.
