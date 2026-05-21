---
name: anchor-at-target
description: Land an element on another element's anchor point using static CSS alignment plus a transform-only offset tween — eliminates manual delta math and direction errors.
metadata:
  tags: cursor, modal, landing, positioning, transform, no-reflow
---

# Anchor at Target

When element A's animation terminates on element B's anchor point (cursor lands on button, modal lands on screen center, icon lands on dock), anchor A's CSS `top`/`left` **statically** to B's anchor and tween only the `x`/`y` transform offset. Terminal state is `{ x: 0, y: 0 }` — no arithmetic, no direction risk.

## Why

The naive approach is to position A at its entry point in CSS, then tween it to B's center via `x`/`y` deltas computed by hand:

```js
// ❌ Naive — agent must compute (1300, 800) → (960, 655) = (-340, -145)
// Half the time the y-direction comes out reversed.
.cursor { top: 800px; left: 1300px; }
tl.fromTo(".cursor", { x: 0, y: 0 }, { x: -340, y: -145, duration: 1.3 }, t);
```

Two failure modes compound here:

1. **Direction errors** — when the entry point is in a different quadrant from the target, agents routinely flip the sign of one axis.
2. **Coupling to target's position** — if you nudge the button down by 40 px, you must remember to recompute the cursor delta too.

The pattern below makes both impossible.

## Pattern

```html
<!-- Target (button) -->
<div
  class="cta"
  style="position:absolute; top:600px; left:50%; margin-left:-250px; width:500px; height:110px;"
>
  Open ChatGPT
</div>

<!-- Cursor: CSS anchors it to the button's CENTER (top+half-height, left+half-width). -->
<!-- The negative margins offset by the cursor's own size so its visual hotspot lands dead-center. -->
<div
  class="cursor"
  style="position:absolute; top:655px; left:960px; margin:-14px 0 0 -14px; width:28px; height:28px; opacity:0;"
>
  <svg>...</svg>
</div>
```

```js
// Cursor enters from the bottom-right, ending exactly at the button center.
// "Bottom-right" → entry offset is (+x, +y). The signs match the visual direction
// you're describing, not a delta between two coordinate pairs.
tl.set(".cursor", { x: 340, y: 145, opacity: 0 }, ENTER_AT - 0.001);
tl.to(".cursor", { x: 0, y: 0, opacity: 1, duration: 1.3, ease: "power2.inOut" }, ENTER_AT);
```

Terminal state is `{ x: 0, y: 0 }`. Always. Regardless of where the target is, regardless of where the entry point is.

## When to use

- Cursor lands on button / CTA / interactive element
- Modal or popup centers on screen
- Icon flies to dock / tray / inbox
- Any "A → onto → B" animation where B's position is the source of truth

## When not to use

- A traverses a complex path (multiple waypoints, curves) — use a per-segment timeline or `MotionPathPlugin`
- A's terminal position is genuinely floating (e.g. tracking a moving target every frame) — see `camera-cursor-tracking`

## Common variants

### Entry direction → offset sign

| Entry direction relative to target | Offset signs     |
| ---------------------------------- | ---------------- |
| bottom-right                       | `x: +Δx, y: +Δy` |
| top-right                          | `x: +Δx, y: -Δy` |
| bottom-left                        | `x: -Δx, y: +Δy` |
| top-left                           | `x: -Δx, y: -Δy` |
| straight up from below             | `x: 0,   y: +Δy` |

The Δ values are positive distances ("how far off-screen does it start"). The sign is determined by direction, not by subtracting coordinates.

### Pairing with click-ripple

When the cursor lands and then triggers a click ripple, the ripple anchors to the same `top`/`left` as the cursor (target center) — same pattern, applied to a different element. See `cursor-click-ripple.md`.

## See also

- `cursor-click-ripple.md` — uses this pattern for cursor entry; covers ripple expansion and press feedback
- `cta-morph-press.md` — full blueprint for hero → CTA → cursor lands → click reaction
- `hyperframes-build.md` Hard Rules — animate only via transforms + opacity; this rule is how cursor-to-target lands while honoring that constraint
