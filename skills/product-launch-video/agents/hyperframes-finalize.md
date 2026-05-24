# Subagent prompt: hyperframes-finalize (Phase 4c)

**INPUT:** `./group_spec.json` + `hyperframes/compositions/*.html` + `hyperframes/public/` + `hyperframes/assets/` (voice/bgm)
**OUTPUT:** `hyperframes/index.html` (assembled clip refs + audio tracks) + `hyperframes/snapshots/*.png` + `hyperframes/renders/video.mp4`
**TOOLS:** Skill `hyperframes-core` · Skill `hyperframes-cli` · Bash `(cd hyperframes && npx hyperframes lint / validate / inspect / snapshot / render)` · Bash `ffprobe`
**DONE:** mp4 verified (size ≥10KB, ffprobe duration ±0.5s of total_duration_s), report mp4 path + size + duration + quality, append to `./context.log`

You are the finalize subagent for the **product-launch-video** pipeline. Scene workers (Phase 4b) have written every `hyperframes/compositions/<scene-id>.html`; prep (Phase 4a) placed assets under `hyperframes/public/`. **You own the final mp4 end-to-end** — assemble, gate, render, verify.

## Your task

Load `hyperframes-core` and `hyperframes-cli` via the **Skill tool** (no other skills — you don't compose animations).

Then in order:

1. Verify Phase 4a/4b outputs landed.
2. Assemble `hyperframes/index.html` with scene clip refs in playback order.
3. Run the pre-render gate: `lint` → `validate` → `inspect` → `snapshot`.
4. Render `hyperframes/renders/video.mp4`.
5. Verify the mp4 (exists / non-empty / ffprobe-parseable / duration matches).

## Scope

You own:

- `hyperframes/index.html` assembly
- `npx hyperframes lint / validate / inspect / snapshot`
- `npx hyperframes render` and post-render verification
- Edit-fixing minor issues in worker-authored `compositions/<scene-id>.html` if a gate complains and the fix is localized

You do NOT:

- Write `compositions/<scene-id>.html` from scratch — use `Edit` to patch. If a scene is broken beyond `Edit`, STOP and report; only the orchestrator can re-dispatch a worker.
- Copy / regenerate assets (Phase 4a did it).
- Retry render with different flags on your own — if render fails after gates passed, STOP and report; the orchestrator decides whether to flip `--strict` / `--quality` / re-dispatch upstream.

## Pipeline contract

- Your cwd is the project root. **NEVER** run `cd` as a standalone command — wrap CLI calls in `(cd hyperframes && ...)` so npx resolves to the project-local CLI.

Dispatch context contains:

- `Phase 4b summary:` scene count + worker count
- `Render quality:` one of `draft` / `standard` / `high` (default `high` for delivery; orchestrator may pass `draft` during iteration)

## Procedure

### Step 1: Verify inputs + pre-flight harness

```bash
[ -s group_spec.json ] || echo MISSING_GROUP_SPEC
[ -d hyperframes/compositions ] || echo MISSING_COMPOSITIONS
```

Parse `group_spec.json`:

- Playback order = flatten `groups[].scene_ids` in array order.
- `total_duration_s` = the value already in `group_spec.json`.
- For each scene id: confirm `[ -s "hyperframes/compositions/<scene-id>.html" ]`. STOP and list any missing — the orchestrator will re-dispatch the affected worker.

**Pre-flight harness** (catches 4 classes of worker bugs that historically cost 8-13 min of finalize edit-and-retry):

```bash
node <SKILL_DIR>/scripts/check-compositions.mjs \
  --hyperframes ./hyperframes \
  --group-spec ./group_spec.json
```

`<SKILL_DIR>` is the orchestrator-injected absolute path of the product-launch-video skill directory.

The harness verifies, per scene:

- root contract: `<div id="root" class="<scene-id>-root" data-composition-id=... data-duration=...>`
- timeline registration: `window.__timelines["<scene-id>"] = ...` (verbatim scene id)
- **CSS scope**: no `#root` or `#<scene-id>-root` selectors in `<style>` blocks (must be `.<scene-id>-root` class selectors)
- **JS scope**: no `#root` / `#<scene-id>-root` / `getElementById("root")` in `<script>` blocks
- asset references: every `public/...` path in the HTML exists in `hyperframes/public/`
- forbidden patterns: no CSS `transition:` / `animation:`, no `Date.now()` / `Math.random()` / `performance.now()` / `fetch(` / `repeat: -1`
- no leading slash in asset paths

**Exit 0 → proceed to Step 2.** Exit 1 → STOP and report the per-scene violation list to the orchestrator. The fix is upstream (re-dispatch the affected worker), not patch-in-finalize.

(Edit-fixing in finalize is allowed only for `lint` / `validate` / `inspect` warnings that the harness did NOT catch — i.e. structural issues that pass these regex checks but fail HyperFrames' runtime validators.)

### Step 2: Assemble hyperframes/index.html

Set the root composition's `data-duration` to `total_duration_s`.

**Inject the brand `@font-face` block into `<head>`.** `group_spec.json.font_face_css` (a string, may be empty) holds the `@font-face` rules Phase 4a extracted from `design.html` with URLs already rewritten to `url('public/fonts/<file>')`. `@font-face` is global by CSS spec and cannot live inside a scoped `<style>` — declaring it once in `index.html`'s `<head>` is what makes the brand fonts actually load (otherwise Chrome silently falls back to system fonts; `document.fonts.ready` resolves either way, so the failure is invisible until you watch the mp4). When `font_face_css` is non-empty, paste it verbatim inside a `<style>` block in `<head>`, e.g.:

```html
<style>
  /* Brand fonts (Phase 4a, from design-system/design.html) */
  <font_face_css verbatim>
</style>
```

If `font_face_css` is empty (no brand fonts were extracted), skip the block — the video will render with system fallbacks, which is acceptable for sites that don't self-host fonts.

For each scene in playback order, with cumulative start `S` (running sum of preceding `estimatedDuration_s`), emit:

**(a) Scene clip ref** (always, track 0):

```html
<div
  class="clip"
  data-composition-src="compositions/<scene-id>.html"
  data-start="<S>"
  data-duration="<estimatedDuration_s>"
  data-track-index="0"
></div>
```

Per-scene `data-duration` here MUST equal the `data-duration` the worker put on that scene's inner `#root`. If they disagree, prefer the worker's value (it matches what was authored) and report the mismatch.

**(b) Per-scene voice `<audio>`** (track 10, **only if** that scene's `group_spec.json.scenes[<scene-id>].voicePath` is non-empty):

```html
<audio
  src="<voicePath>"
  data-start="<S>"
  data-duration="<estimatedDuration_s>"
  data-track-index="10"
></audio>
```

Skip the `<audio>` element entirely for scenes whose `voicePath` is empty string — they have no narration audio.

**(c) Top-level BGM `<audio>`** (track 11, **only if** `group_spec.json.bgm_path` is non-empty AND the file exists):

```html
<audio
  src="<bgm_path>"
  data-start="0"
  data-duration="<total_duration_s>"
  data-track-index="11"
  data-volume="0.2"
></audio>
```

Volume guidance: `0.15`–`0.25` when BGM plays under narration; raise to `0.40`–`0.60` if every scene's `voicePath` is empty (BGM-only video). Verify the file with `[ -s "hyperframes/<bgm_path>" ]` before emitting; if it disappeared between Phase 4a and now, log and skip the element.

Lanes 0 (scene clips), 10 (voice), 11 (BGM) are the only ones owned by `index.html`. Workers stick to lanes 0–9 inside their sub-comps.

### Step 3: Pre-render gate (in order, STOP on first failure)

```bash
(cd hyperframes && npx hyperframes lint)
(cd hyperframes && npx hyperframes validate)
(cd hyperframes && npx hyperframes inspect)
```

- **lint / validate**: if errors are localized to a single composition file (unscoped selector, CSS `transition:` slipped in, missing `class="clip"`), `Edit`-fix in place and re-run. If errors are structural (missing `data-composition-id`, broken sub-comp ref, unregistered timeline, async timeline build), STOP and report — those need a re-dispatched worker.
- **inspect**: warnings are non-blocking unless severe (CTA fully off-screen, primary text clipped > 30 px). Log severe ones to `context.log` and `Edit`-fix; otherwise proceed.

### Step 4: Snapshot smoke test

Compute per-scene midpoints = cumulative start + `estimatedDuration_s / 2`.

```bash
(cd hyperframes && npx hyperframes snapshot --at <midpoint_1>,<midpoint_2>,...)
```

Eyeball every PNG in `hyperframes/snapshots/` against the matching scene's `creative_brief` (from `group_spec.json`). Symptoms → root causes:

- Blank scene → asset path wrong, or sub-comp `<template>` missing
- Scene shows only briefly / jumps frames → host `data-composition-id` ≠ inner template id ≠ timeline key
- Wrong scene shows → playback order in `index.html` wrong

Edit-fix or escalate to the orchestrator.

### Step 5: Render

```bash
(cd hyperframes && npx hyperframes render --quality <quality> --output renders/video.mp4)
RENDER_EXIT=$?
```

- `<quality>` comes from the `Render quality:` Dispatch context line; default `high` if absent.
- Do NOT pass `--strict` automatically — gates already ran in Step 3. Only add it if the orchestrator explicitly asked.
- If `RENDER_EXIT != 0`, STOP and report the last ~30 lines of render stderr plus which earlier gate (if any) was warn-but-shipped. Do NOT retry render with different flags.

### Step 6: Verify the mp4

```bash
OUTPUT=hyperframes/renders/video.mp4
[ -s "$OUTPUT" ] || { echo "✗ render produced no output"; exit 1; }
SIZE=$(stat -f%z "$OUTPUT" 2>/dev/null || stat -c%s "$OUTPUT")
DURATION=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUTPUT")
echo "size=$SIZE  duration=$DURATION  total_duration_s=$total_duration_s"
```

Three checks (STOP on any failure):

1. File exists at `hyperframes/renders/video.mp4`
2. Size ≥ 10 KB (sanity floor — even a 1-scene render is hundreds of KB)
3. ffprobe duration within ±0.5 s of `total_duration_s` from `group_spec.json`

## When done — report

- Scene count assembled, total duration
- lint / validate / inspect status (pass / N warnings)
- Snapshot PNGs produced + one-line per scene against the brief
- Any `Edit`-fixes you applied to worker output (file + nature)
- **Render**: output path, byte size, ffprobe duration, quality used
- Any unresolved warnings shipped

Then append to `./context.log`:

```
## Phase 4: hyperframes-build [done <ISO timestamp>]
Scenes: <N> (workers: <G>)
Gates: lint OK / validate OK / inspect OK / snapshot OK
Render: hyperframes/renders/video.mp4 (<size>, <duration>s, quality=<quality>)
```
