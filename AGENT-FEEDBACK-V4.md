# Agent Feedback — Pipeline v4 Test Run

**Date:** May 16, 2026
**Branch tested:** `feat/pipeline-quality-v2` (after overengineering cuts + v3 fixes)
**Sites tested:** huly.io, arc.net, mercury.com, daylight.computer, framer.com, raycast.com, workos.com
**Prompts:** identical to v2/v3

---

## Per-Agent Summaries

### huly.io

- **Beat 5 blank in snapshots — but now we know why** (both root causes confirmed post-session). Agent correctly diagnosed "sub-timeline not seeked" and tried working around it. All prior agents hit this same issue. Fix in snapshot.ts: wait for all sub-comps + seek to local time.
- **Block name vs shader name confusion** — `domain-warp-dissolve` is the registry block name; `domain-warp` is the HyperShader runtime name. Not the same. Agent had to grep the source to confirm. Needs documentation.
- **Asset path in asset-descriptions.md wrong** — listed as `svgs/favicon.svg`, actually at `assets/favicon.svg`. Minor but causes 404 spam.

### arc.net

- **"Decide for me" friction** — skill has 4 explicit 💬 collaborative gates. User answered "decide for me" every time. Agent kept asking anyway. 4 separate round-trips that added nothing. Should read user intent once and stop asking.
- **TTS timing 42% off** — planned 32s, got 18.73s. Still happening despite timing reconciliation fix. Generate a short test clip before writing detailed storyboard timings.
- **Sub-agent prompt prep is the bottleneck** — 300-400 words × 6 agents to prepare correctly. The actual execution is fast (50-80s each in parallel). Writing the prompts is where time goes.
- **Still can't verify video actually plays** — snapshots show static frames, not whether transitions fire, audio syncs, or animations play smoothly at 30fps. The only real verification is watching it in Studio.
- **Reference chain is deep: 16+ files** — agent explicitly listed all 16 files read. "Most of the early-session time was spent reading references rather than building."

### mercury.com

- **Beat 5 blank** (same, root cause now fixed in CLI).
- **Kokoro reads SSML tags as literal text** — `<break time="1s"/>` was spoken aloud as "break time equals one slash." Use line breaks for pauses instead.
- **`../capture/` paths: 100% failure rate again** — every sub-agent, every round. Despite RULES bullet. A documentation rule is not enough.
- **HyperShader data-start/data-duration confusion** — agent studied huly-promo to reverse-engineer the correct pattern. The step-5 reference says "all beats on track-index 1" but doesn't explain WHY beats must not overlap temporally. The new documentation explains it now.

### daylight.computer

- **"Decide for me" friction** (same as arc).
- **HeyGen TTS `r['data']['audio_url']`** — skill showed `r['audio_url']` (wrong), agent had to debug raw response. Fixed in step-4-vo.md.
- **Sub-agent compound selectors fragile** — `querySelector('[data-composition-id="beat-2"] .b2-headline')` fails in some template injection contexts. Use plain IDs.
- **Font situation still dead end** — hashed filenames, no family mapping. Substituted fallbacks.
- **Still ~40% reading docs** — despite cuts (no step-5.5, no implementation references), still significant overhead.

### framer.com

- **Didn't flag GT Walsheim missing until delivery** — the video "looks like a dark product video, not a Framer video." Should flag font gaps in Step 1, not after building.
- **MacBook 3D reveal simplified to CSS rectangle** — storyboard promised real GLTF via vfx-iphone-device registry block. Built flat perspective-tilted div instead. Didn't flag the downgrade.
- **Promised captions, forgot to build them** — stated in Step 4 "I'll include captions" then never built `compositions/captions.html`. Honesty about it is good.
- **Still 4000+ lines of instruction read** before writing code.

### raycast.com

- **HeyGen TTS `data.voices` vs direct list** — still hitting this even though we documented it. Agent had structure detection fallback.
- **CSS transform + GSAP conflict** — sub-agents used `transform: translate(-50%, -50%)` then animated `y` or `scale`, breaking centering. Linter caught it. Should use `xPercent`/`yPercent` instead. Persistent issue.
- **Shader transition names uncertain** — installed `cinematic-zoom` block but wrote `"cinematic-zoom"` in HyperShader.init(). The block name and the HyperShader shader name may differ. Should check `ls registry/blocks/` (which we added to RULES) and also read the block's showcase HTML to find the actual shader name.
- **Installed blocks clutter `compositions/`** — showcase HTML files from `npx hyperframes add` land in `compositions/` and trigger lint warnings every run. Should delete them after extracting the shader name.
- **Sub-agent prompt prep** still the bottleneck.

### workos.com

- **NEW CONFIRMED: HyperShader last scene always black** — Workaround found: add dummy invisible `s-end` scene so the real CTA isn't `scenes[N-1]`. Also confirmed inline compositions aren't seeked by engine — attach tweens to main timeline instead.
- **Beats 5+6 blank through multiple iterations** — 70% of session debugging. Root cause correctly identified as a HyperShader engine behavior. Fix published to snapshot tool (both wait-for-all-subcomps and local-time-seek).
- **Beat 5 dark background** — `background:#F9F9FB` inside `<template>` not rendering (CSS-in-template issue). HyperShader bgColor showing through.

---

## New Issues (not seen in v3)

### P0 (now FIXED): Snapshot tool seeking sub-compositions to wrong time

Two root causes identified and fixed in commit `4ae59e5a`:

1. **Wait-for-all-sub-comps**: old wait resolved when beat-1 registered; beats 2-5 still loading. Snapshot seeked to beat-5 range but beat-5 DOM wasn't there yet.

2. **Local-time seek bug**: all timelines seeked to global time. Beat-5 with `data-start=26.7` seeked to global t=29 → clamps to GSAP end (t=7, exit fade complete) → black. Correct: seek to `t - data_start = 2.3s` (local time, mid-entrance).

Both verified against huly-promo render vs snapshot before/after fix.

### P1: HyperShader `scenes[N-1]` always black (still active without workaround)

The last scene in HyperShader's `scenes[]` array may render black. This is separate from the snapshot fix. Workaround: add dummy invisible `s-end` scene after the real last beat. Not investigated at code level yet.

### P2: Installed block clutter in `compositions/`

`npx hyperframes add <block>` drops showcase HTML files into `compositions/`. These trigger lint warnings. Delete them after extracting the shader name.

### P2: Block name ≠ shader name

`domain-warp-dissolve` is the registry block name. `domain-warp` is the HyperShader runtime shader name. Same split for other blocks. Should document: after installing a block, read its showcase HTML to find the actual shader name to use in HyperShader.init().

---

## Still Repeating (v1 → v4)

| Issue                                  | Rounds | Status                                      |
| -------------------------------------- | ------ | ------------------------------------------- |
| `../capture/` paths wrong              | v1–v4  | Not fixed — docs rule not sufficient        |
| Reading burden ~40%                    | v2–v4  | Reduced but not eliminated                  |
| Snapshot can't verify transitions play | v1–v4  | Partially fixed (static frames now correct) |
| TTS timing off by 40%+                 | v2–v4  | Reconciliation gate helps but gap remains   |
| "Decide for me" friction               | v3–v4  | Not addressed — skill forces 4 gates        |
| Font hashing                           | v1–v4  | Not fixed                                   |
| CSS transform + GSAP conflict          | v3–v4  | Documented but sub-agents still do it       |
| HeyGen TTS API docs wrong              | v1–v4  | Fixed (v3 API, data wrapper, word key)      |

---

_Collected: May 16, 2026_
