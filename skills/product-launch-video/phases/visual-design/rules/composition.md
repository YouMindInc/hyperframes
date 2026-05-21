---
name: video-composition
description: "1920x1080 canvas layout, whitespace rhythm, visual hierarchy, depth layering [layout, composition, whitespace, hierarchy, canvas]"
category: visual-design
---

# Composition for 1920x1080 Video

**Pair with `hyperframes-creative/references/composition-patterns.md` and `references/video-composition.md`** for ready-made HyperFrames composition patterns (picture-in-picture, text-behind-subject, slideshow) and the broader "video frames are not pages" framing. This file is the **numeric overlay** — exact safe margins, canvas zones, density targets, depth values calibrated against the actual layouts in the golden samples (hyperframes-animation/examples × 13, codex-plugin, timeline-editor-launch-v5, playground-launch, hermes, inspector-logo-intro, article-walkthrough).

Video composition is closer to film and poster design than web layout. There is no scroll, no responsive reflow. Every frame is a fixed canvas where every pixel matters.

## The squint test

Blur your eyes (or blur a screenshot). Can you still identify:

- The most important element?
- The second most important?
- Clear spatial groupings?

If everything looks the same weight when blurred, you have a hierarchy problem. Redesign before coding. The archive's strongest beats (codex Beat 1, inspector Beat 5, timeline-editor Act 0 trio) all pass the squint test — a single dominant mass plus one supporting structural element, with everything else recessed.

## Canvas zones

Divide the 1920x1080 canvas into functional zones:

```
+--------------------------------------------------+
|         Optional top chrome (5-7%, 36-58px)      |
|  +----------------------------------------------+|
|  |         Safe margin (96-150px / 5-8%)        ||
|  |  +----------------------------------------+  ||
|  |  |                                        |  ||
|  |  |       Primary content area             |  ||
|  |  |    (center 65-75% of frame)            |  ||
|  |  |                                        |  ||
|  |  +----------------------------------------+  ||
|  |  |   Caption / subtitle zone (bottom 15%) |  ||
|  |  +----------------------------------------+  ||
|  +----------------------------------------------+|
+--------------------------------------------------+
```

- **Top chrome** (only when running a workspace-mockup scene): codex-plugin's topbar is `top: 36px, left: 48px, right: 48px, height: 58px`. If you are not showing a tool UI, skip this zone entirely.
- **Safe margin**: Keep critical content away from edges. The archive's measured values are 96px (5%) at minimum, 120-150px (7-8%) for editorial / hero scenes, up to 200px when the scene is a single hero word. Codex uses `padding: 150px 120px 92px`. Article-walkthrough uses 128px horizontal.
- **Primary content area**: The center 65-75% of the frame is where the eye naturally rests. Place the hero visual here. Max-width for text blocks in the archive caps at ~1360px even on a 1920-wide canvas — never edge-to-edge prose.
- **Caption zone**: Bottom 15% is reserved for narrator subtitles. Do not place critical visuals here during narrated segments. demo-page-scroll-spotlight pins captions at `position: absolute; bottom: 60px`.

## Composition templates

Mix at least three of these across the scenes of a single video. The archive's strongest plans never repeat the same layout family twice in a row.

### Centered (hero moments)

Single dominant element centered with generous breathing room. Use for: brand reveals, key statistics, CTAs, climax beats.

Archive examples: `brand-reveal-assemble-zoom`, `cta-morph-press`, `hook-counter-burst` (counter at 806px occupies ~50% of canvas height), `cta-orbit-collapse` (center cluster with orbiting icons), inspector Beat 5 ("Inspector" at 70% width centered after zoom).

### Rule of thirds

Place the visual anchor at a third-line intersection. The remaining space holds supporting elements or stays empty for breathing room. Use for: feature showcases, product demos with description.

Archive examples: vercel-intro storyboard triangle at lower-left third intersection; demo-page-scroll-spotlight with `.video` at left third, caption at bottom-right third.

### Split (comparison / dual focus)

Left and right halves each contain a distinct element. Use for: before/after, feature comparison, problem/solution, palette-swap moments.

Archive examples: `comparison-split-cards` (left card +18° rotateY, right card -18°), `metric-video-text-pivot` (video left ~35% width, MP4 stat right), `workflow-approve-press` (steps list left, button right), playground Beat 2B (bicolor horizontal split), fadeglow Beat 6 (palette-swap left=navy+lime vs right=magenta+yellow).

### Layered depth (immersive)

Foreground, midground, background at different scales and opacity. Use for: opening hooks, atmosphere-heavy scenes, codex's workbench beats.

Archive examples: `demo-page-scroll-spotlight` (card + carousel stacking), `problem-mockup-overwhelm` (3-phone cluster → avatar morph), codex Beat 1 (terminal + command palette + grid + scan bars all on separate z-planes).

### Asymmetric (editorial)

Main content pushed to one side (60/40 or 70/30 split). Deliberate imbalance creates visual tension and sophistication. Use for: feature spotlight, text-heavy information, editorial proof beats.

Archive examples: article-walkthrough `.proof-layout { grid-template-columns: minmax(0, 1fr) 500px }` — copy left, 620px artifact right with 86px gap and 128px outer padding. hermes Beat 3 panels are also asymmetric within the triptych.

### Triptych (3-up panel)

Three equal-width zones, often used to show three capabilities or three feature beats at once.

Archive example: hermes Beat 3 — three 540px panels side by side (Lottie, Captions, Templates), each animating independently but in sync.

### Full-bleed strip

A single horizontal strip carrying ticker, logo chain, or marquee content. Often only 20% of canvas height.

Archive examples: `takeover-ticker-displace` (typewriter left + scrolling ticker right), `proof-logo-chain` (avatar ring + brand labels, ~90% width × 20% height).

**Do not default to centered for every scene.** A 5-scene video should hit 3+ of these templates; a 9-scene video should hit 4+.

## Frame density — avoid empty-looking scenes

A common failure is scenes that feel hollow: a small element floating in the center of a 1920×1080 canvas with nothing else. Every scene should feel **intentionally filled**, not sparse.

**Density rules** (measured against archive scenes):

- The primary visual element should occupy at least **40% of the canvas area** (e.g., a product image filling ~800×600px or larger). Archive medians: hero text 50-75% height × 60-80% width; centered card 30-50% width × 50-70% height; full-width strip 90% × 20%.
- Every scene should have at least **3 visual layers**: background (gradient / particles / ambient texture / architectural grid), midground (main content — images, cards, text blocks), foreground (accent elements, overlays, subtle decorations).
- **Opening and closing scenes** are especially prone to emptiness — a lone logo on black or a single line of text feels like a placeholder, not a finished scene. Add environmental layers: dual-radial swell background, floating particles, brand-tinted ambient texture, scanline overlay at 3-5% opacity.
- If a scene has only text and no imagery, add visual elements: brand logo, extracted product images, icon decorations, halftone field, or geometric shapes derived from the brand palette. Inspector's intro uses a halftone dot field as the _primary character_ of the scene, not decoration — the field warps and breathes per beat.
- Use **extracted assets aggressively** — they are the most valuable visual material. A product screenshot at 60% frame size with supporting text and ambient layers looks rich; the same text alone looks empty.

**The fullness test:** Would this frame work as a poster or social media image? If it looks like a PowerPoint slide with too much empty space, add more visual layers.

**The poster-pause test:** If you froze the video at any moment, would the still frame be defensible as a graphic on its own? Codex Beats 1-6 all pass this — each frozen frame reads as a deliberate poster.

## Whitespace as a design tool

Whitespace is not wasted space. It directs attention and creates hierarchy.

### Rhythm through varied spacing

- **Tight groupings** for related elements (icon + label, image + caption) — 8-16px gaps
- **Generous separation** between unrelated groups — 32-48px gaps (the archive's measured rhythm; codex uses multiples of 8 throughout)
- **Asymmetric margins** feel more designed than equal padding everywhere

### Breathing room

- A hero image needs empty space around it to feel important
- A data counter needs distance from other elements to read as a standalone statement
- Crowded frames with no breathing room feel chaotic and unpolished
- The archive's hero moments routinely surround a single word with 200-400px of empty space on each side (timeline-editor Act 0 "ever" — the word is everything; everything else recedes)

### Common spacing failures

- Every element equidistant from every other element (no grouping, no hierarchy)
- Elements touching or overlapping unintentionally
- Text crammed against the edge of a container
- Subtitle text colliding with bottom-positioned visuals
- Default 24px padding on everything because it's the framework default

## Visual hierarchy in a frame

Order of visual weight (strongest to weakest):

1. **Large imagery** (mockups, photos, hero visuals)
2. **Motion** (animated elements draw the eye before static ones)
3. **High contrast** (bright on dark, saturated on neutral)
4. **Typography scale** (display text > heading > body)
5. **Position** (center and upper third are prime real estate)

**Combine at least two** to establish clear hierarchy. A large, moving element in the upper third is unmistakably the primary focus.

### Hierarchy through multiple dimensions

Do not rely on size alone. Effective hierarchy stacks 2-3 signals:

| Dimension | Strong contrast                             | Weak contrast               | Archive example                                          |
| --------- | ------------------------------------------- | --------------------------- | -------------------------------------------------------- |
| Size      | 3:1 ratio or more                           | Less than 2:1               | timeline-editor Act 0: 500px "ever" vs 220px surrounding |
| Weight    | Bold (800-900) vs Light (400)               | Medium vs Regular           | codex h1 (900) vs eyebrow (400 mono)                     |
| Color     | High contrast to background                 | Similar tone                | Single accent word in cyan on graphite scene             |
| Motion    | Element animating vs static everything else | Everything drifting same    | hook-counter-burst counter scaling vs static surround    |
| Position  | Top / left = primary                        | Center mass = neutral       | proof-logo-chain logo strip centered horizontally        |
| Space     | Surrounded by 200-400px whitespace          | Equidistant from everything | timeline-editor Act 0 trio                               |

A heading that is merely larger but the same weight, color, and spacing as body text has weak hierarchy. Stack dimensions.

## Cards and grouping

Spacing and alignment create natural grouping — a card container is not always needed.

**Use cards when**:

- Content is truly distinct from surrounding content
- The group is independently actionable in a UI demo scene (codex command palette rows; demo-page-scroll-spotlight feature cards)
- You need a shadow stack to communicate "elevated above the canvas"

**Do not use cards when**:

- You just want visual separation — use whitespace instead
- Content is part of a continuous list or flow

**Never nest cards inside cards.** Nested containment creates visual claustrophobia and ambiguous hierarchy. If you feel the need to nest, the outer card is likely unnecessary.

**Card shadow stack** — the archive's recurring three-layer recipe:

```css
.card {
  box-shadow:
    /* Drop shadow (depth) */
    0 30px 60px rgba(0, 0, 0, 0.45),
    /* Glow halo (brand color) */ 0 0 60px rgba(<brand-accent>, 0.2),
    /* Inner highlight */ inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

Used in `comparison-split-cards`, `cta-orbit-collapse` (CTA card), `problem-mockup-overwhelm` (phone mockups). Single-layer shadows look flat; the three-layer stack reads as "lifted, brand-aware, and dimensional."

## Asset prominence

Extracted assets (logos, product images, screenshots) are the most valuable visual material. They are real and specific to the brand.

- **Feature them prominently**, not as small decorations
- A product screenshot should fill at least 40-60% of the frame when it is the scene's focus. metric-video-text-pivot puts the demo video at ~35% width × 60% height. heygen-iphone-canvas-test puts the iPhone device at ~45-55% of frame width.
- Logos should be recognizable at playback size — do not shrink them to icons
- Use the highest-quality asset version available

**Never replace real assets with AI-invented decorative graphics** (generic shapes, abstract blobs) when real assets exist. The extraction step gathered them for a reason. The codex-plugin DESIGN.md is explicit: _"No empty abstract visuals: every frame should show the plugin, Codex, HTML, timeline, or render workflow."_

## Depth in a 2D canvas

Even without 3D transforms, create perceived depth through:

| Technique           | Effect                                          | Archive example                                                                    |
| ------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| Scale difference    | Larger = closer, smaller = farther              | hook-counter-burst: bg `scale: 1.05`, camera `scale: 0.92`                         |
| Blur (filter: blur) | Blurred = background, sharp = foreground        | problem-mockup `filter: blur(80-120px)` on frosted overlay                         |
| Opacity gradient    | Lower opacity = recedes, full opacity = primary | Three-tier 0.15 / 0.6 / 1.0 stack across most examples                             |
| Overlap             | Front elements partially cover back elements    | problem-mockup mail-card `translateX(-14px)` behind bell-card                      |
| Shadow stack        | Three-layer shadow = lifted + brand-aware       | comparison-split-cards card shadow                                                 |
| Motion speed        | Faster parallax = closer, slower = farther      | concept-demo-decode-pan: foreground `x: -PARALLAX_DIST` (400px) faster than camera |

Layer at least 2-3 depth levels per scene to avoid the flat-poster look.

### Depth via opacity and transform

Different opacity values assign elements to different depth planes instantly. Set them via GSAP at the appropriate timeline position so they participate in the seekable timeline:

```js
// Background plane — receding
tl.set(".bg-layer", { opacity: 0.15, scale: 1.05 }, 0);

// Midground plane — supporting
tl.set(".mid-layer", { opacity: 0.6, scale: 1.0 }, 0);

// Foreground plane — primary focus
tl.set(".fg-layer", { opacity: 1.0, scale: 0.92 }, 0);
```

Note the **inversion**: the foreground sits at _smaller_ scale (0.92) while the background sits at _larger_ scale (1.05). This is the camera-perspective trick used in `hook-counter-burst` (lines 492-493) and `brand-reveal-assemble-zoom` (zoom-scale + counter-translate pattern): the camera is "pushed in" on the focal element, so the background appears scaled up and the focal element compositely fills the frame at scale 1.0 even though its CSS scale is < 1.0.

Use `scale` (values slightly above or below 1.0) to reinforce the depth assignment. Elements at 1.05 scale feel like they are leaning toward the viewer; elements at 0.92 feel set back. Combined with opacity, this creates convincing foreground/background separation without 3D transforms.

For genuine 3D, set `perspective: 800-1400px` on the parent (the archive's measured range — `comparison-split-cards` uses `980px`) and use `rotateY: ±15°, rotateX: ±5°` on the children. Higher rotation than ±20° starts to feel gimmicky.

## What not to show in a promo video

- Navigation bars, footers, cookie banners (interactive web elements with no video purpose)
- Scrollbars, cursor arrows, browser chrome — unless the scene is _deliberately_ a workspace mockup
- Buttons that cannot be clicked
- Generic decorative shapes (blobs, orbs, swooshes) standing in for real product assets
- Floating bokeh / purple-to-blue AI gradients — explicitly banned in the codex-plugin and hermes briefs as the "default AI slop look"

**Exception**: UI demo scenes intentionally recreating the product interface. Here, a navbar, command palette, timeline rail, and CTA button provide realistic context — codex Beats 1-5 are entirely built from this convention, and the convention is what makes them feel like a _real_ workflow rather than a marketing reenactment.
