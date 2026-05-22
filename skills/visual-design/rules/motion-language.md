---
name: video-motion-language
description: "Unified easing presets, duration norms, stagger limits, exit/entry timing for consistent motion across scenes [easing, spring, timing, rhythm, duration]"
category: visual-design
---

# Motion Language for Video

A good promo video feels like one continuous piece, not a slideshow of unrelated animations. This requires a consistent motion language: the same easing curves, the same timing rhythm, and the same spring feel across all scenes.

## Spring presets

Define these once in design constants and reuse everywhere:

| Preset     | Config                                       | Use for                                       |
| ---------- | -------------------------------------------- | --------------------------------------------- |
| **entry**  | `{ mass: 1, damping: 18, stiffness: 120 }`   | Primary elements entering the frame           |
| **gentle** | `{ mass: 1, damping: 24, stiffness: 80 }`    | Background elements, subtle movements         |
| **snappy** | `{ mass: 0.8, damping: 14, stiffness: 200 }` | UI elements, small icons, button-like objects |
| **heavy**  | `{ mass: 1.5, damping: 20, stiffness: 100 }` | Large images, mockups, hero visuals           |

**Consistency rule**: Similar elements should use the same preset. All icons in a scene use `snappy`. All hero images use `heavy`. Do not give each element a bespoke spring config.

## Easing for non-spring interpolation

When using `interpolate()` with `Easing`:

| Curve              | Use for                               | Easing function                | CSS cubic-bezier                |
| ------------------ | ------------------------------------- | ------------------------------ | ------------------------------- |
| **ease-out-expo**  | Elements entering (snappy, confident) | `Easing.out(Easing.exp)`       | `cubic-bezier(0.16, 1, 0.3, 1)` |
| **ease-out-quart** | Smooth refined entrances              | `Easing.out(Easing.poly(4))`   | `cubic-bezier(0.25, 1, 0.5, 1)` |
| **ease-in**        | Elements leaving                      | `Easing.in(Easing.exp)`        | —                               |
| **ease-in-out**    | State changes, morphs                 | `Easing.inOut(Easing.poly(3))` | —                               |
| **linear**         | Continuous drift, rotation, particles | No easing needed               | —                               |

**When to choose which**: ease-out-expo (`cubic-bezier(0.16, 1, 0.3, 1)`) is snappy and confident — use for primary hero entrances and CTA moments. ease-out-quart (`cubic-bezier(0.25, 1, 0.5, 1)`) is smoother and more refined — use for secondary elements and ambient motion.

**Forbidden**: `Easing.bounce` and `Easing.elastic`. They feel dated and draw attention to the animation itself rather than the content. Real objects decelerate smoothly — they do not bounce.

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

### Element outros vs scene transitions — scope, not timing

The Duration table above lists both "Element exit" and "Transition between scenes" as separate rows on purpose. They are two **different things** that happen to share the same time slot at the end of a scene. Be explicit about which one you're specifying in `section_plan.md`, because they have different rules and different owners.

These are the four rules for multi-scene compositions:

**1. Every multi-scene composition uses scene transitions.** The composition's master timeline owns scene-to-scene visual handoffs via a defined transition vocabulary (cross-paper flash, lift-and-cut shutter, element-morph bridge, blur crossfade, push slide, etc. — see [Transition consistency](#transition-consistency) below for picking 2-3 and reusing them). Without transitions, scene swaps feel like jump cuts.

**2. Every scene specifies element entrances.** Every element that appears in a scene needs an entry tween — opacity, position, scale, rotation, etc. Use the duration norms above (300-500 ms primary, snappier for ambient, hero entries up to 800 ms). No element should pop fully-formed into the scene; the entry beat is what gives the eye something to follow.

**3. Element outros are a design choice — not required, not prohibited.** This is the rule designers most often get wrong, in both directions:

> An **element outro** is _not_ the same as a **scene transition**. The scene transition is what the master timeline does to hand off between scene N and scene N+1 (the page turn / the shutter / the morph). An element outro is what an _individual element_ does within scene N's own time budget before that handoff begins — for instance, "the GPT-4o card desaturates after typing completes," or "the chart card scales up + glow-brightens as a lead-in to the element-morph transition," or "the row of feature pills collapse together to bridge into the next scene's hero element."

When to specify an element outro:

- The design has an intentional beat where an element should fade / scale / collapse / morph _before_ the next scene starts — write it.
- The design has an element that should be visually consumed by the transition (e.g. a hero element that the element-morph circle bursts out of) — write the lead-in.
- The design is silent about the element's exit — leave it implicit; the master timeline's transition handles the visual handoff and the element rides along with the rest of the scene.

When you DO specify an element outro, these constraints apply:

- **The outro must complete strictly BEFORE the scene transition window starts.** The two motions do not overlap in time. If the scene transition occupies the last 0.5 s of scene N, the element outro must finish by `boundary - 0.5s - 0.05s margin` (i.e. wrap up at least 50 ms before the transition fires). The transition window is reserved for the master timeline; element-level tweens that bleed into it will fight the transition and look like a glitch.
- **The outro is NOT a substitute for the scene transition.** Even if every element on screen has its own outro, the scene still needs its master-timeline transition. Outros are intra-scene element lifecycle; transitions are inter-scene visual handoff. They serve different purposes.
- **The 75% rule applies to outros, not to scene transitions.** A 500 ms entry → ~375 ms outro (per the rule above). Scene transitions follow the transition-vocabulary's own durations (400-600 ms typical, see [Transition consistency](#transition-consistency)). Don't conflate the two timings.

**4. The transition window uses transition motion only.** During the master timeline's transition window, no per-element opacity / scale / position tween should be running — the master timeline owns every visible pixel of motion in that window. If you want an element to participate in the transition (e.g. the outgoing scene's hero element morphing into the incoming scene's central divider), specify it as a _transition_ — the build agent will hoist it onto the master timeline — not as a scene-level element tween.

**5. Final-scene exception.** The composition's last scene is the only scene with no scene-transition window at the end (the composition just ends). On the final scene, element outros can freely use the closing time (fade-to-black, scale-down to logo, depth-layer collapse) — there's no transition to coordinate with.

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
