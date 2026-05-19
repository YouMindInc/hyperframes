# Easing — single source of truth

Every scene in this library uses easings from this glossary. Do not import others without adding them here first. Default to `power2.out` only when nothing else fits — it's the boring choice.

## The 7 production easings

| GSAP ease | Use for | Feel |
|---|---|---|
| `power4.out` | Hero text landings, UI snaps, decisive moments | Sharp deceleration, "iOS / Apple" feel |
| `back.out(1.7)` | Numbers, badges, impact entrances, "whip" moments | Brief overshoot — eye catches motion |
| `expo.out` | Soft per-word reveals, gentle entrances, parallax landings | Smooth-tail deceleration, premium |
| `power1.out` | Terminal text, code typing, mechanical UI | Linear-ish, no flourish, machine-like |
| `elastic.out(1, 0.5)` | Counters settling, CTA reveals, "ta-da" beats | Spring bounce — playful, attention-getting |
| `expo.inOut` | Full-screen statements, hero reveals, scene-defining moments | Slow start, fast middle, slow end — dramatic |
| `"none"` | Parallax drift, ambient camera moves, Ken Burns | No curve — pure linear, for ambient/idle motion |

## Stagger guidance

| Use | Stagger |
|---|---|
| Per-character text effects | `0.018s` to `0.033s` (typewriter is at the high end, soft-blur-in at the low end) |
| Per-word text effects | `0.05s` to `0.10s` |
| Per-line | `0.08s` to `0.15s` |
| UI grid (cards, list items) | `0.08s` to `0.12s` with `power4.out` |
| Rapid-fire categories (billboard pattern) | `0.04s` to `0.06s` with hard `set` (no transition) |

## Combination rules

1. **Use a different easing for different elements in the same beat.** Headline can be `expo.out` while the badge uses `back.out(1.7)` and the underline uses `power4.out`. Variety = polish.

2. **Never put two transform tweens on the same element at the same time.** Combine into one `fromTo()` with multiple properties or split parent + child.

3. **`overwrite: "auto"`** when chaining tweens on the same element — prevents stuck transforms.

4. **Easing matches intent, not aesthetic.** A "snap" feel = `power4.out` regardless of how the rest of the scene looks. A "settle" feel = `elastic.out` regardless of brand.

## What NOT to do

- `power2.out` on every tween in a scene → boring, lazy. Use at most for 1-2 of the lower-priority tweens.
- `back.out(2.5)` or higher overshoot → cartoonish, breaks premium feel. Cap at `back.out(1.7)`.
- `elastic.out(1, 0.1)` → too much bounce, looks broken. Use `elastic.out(1, 0.5)` minimum.
- Long durations (>1s) with `power1.out` → mechanical eases feel weird at long durations. Use `expo.out` or `expo.inOut` for >1s.

## Scene-level pacing

A scene's TOTAL easing variety should span at least 3 of the 7 easings above. If you find yourself with `expo.out` on everything, look for the 1-2 elements that deserve a different feel and change them. The viewer's eye catches CONTRAST in motion — sameness reads as static even when things are moving.
