# Product Launch Video — Pipeline Reference

End-to-end pipeline: URL → 60–90s product-launch / SaaS explainer / promo video as a HyperFrames composition.

The orchestrator (defined by `SKILL.md`) dispatches one specialized subagent (or deterministic script) per phase. The orchestrator itself does **NOT** execute phase work — it only routes context, validates outputs, and triggers parallel fan-out.

---

## Pipeline at a glance

```
                ┌─────────────────────┐
                │  User provides URL  │
                └──────────┬──────────┘
                           │
        ┌──────────────────┴───────────────────┐
        │  Phase 1 ‖ Phase 1b  (PARALLEL)       │
        │  ─────────────────────────────────    │
        │  Phase 1  : web-research              │
        │  Phase 1b : design-system             │
        │  + optional model pre-warm (Bash bg)  │
        └──────────────────┬───────────────────┘
                           │
                ┌──────────▼───────────┐
                │   Phase 2: story     │
                │   narrator_scripts.  │
                │   json + validator   │
                └──────────┬───────────┘
                           │
        ┌──────────────────┴───────────────────┐
        │  Phase 2.5 ‖ Phase 3  (PARALLEL)      │
        │  ─────────────────────────────────    │
        │  Phase 2.5 : audio.mjs (Bash)         │
        │  Phase 3   : visual-design (Agent)    │
        └──────────────────┬───────────────────┘
                           │
                ┌──────────▼───────────┐
                │  Phase 4a: prep.mjs  │
                │  (deterministic)     │
                │  → group_spec.json   │
                └──────────┬───────────┘
                           │
        ┌──────────────────┴───────────────────┐
        │  Phase 4b: N scene workers (PARALLEL) │
        │  one Agent block per worker group     │
        └──────────────────┬───────────────────┘
                           │
                ┌──────────▼───────────┐
                │ Phase 4c: finalize   │
                │ assemble + gates +   │
                │ render + verify mp4  │
                └──────────────────────┘
```

Three parallel pairs (1 ‖ 1b, 2.5 ‖ 3, 4b fan-out) MUST be issued in ONE assistant message with `run_in_background: true` on each call. Serializing them is the documented anti-pattern.

---

## Project layout (cwd-rooted artifacts)

```
./                                          # project root (orchestrator's cwd)
├── context.log                              # phase log (each subagent appends its line)
├── narrator_scripts.json                    # Phase 2 output
├── audio_meta.json                          # Phase 2.5 output (side file)
├── section_plan.md                          # Phase 3 output
├── group_spec.json                          # Phase 4a output
├── research/                                # Phase 1 output
│   ├── context_pack.md
│   ├── extraction.json
│   ├── screenshot_full.png
│   ├── page.html
│   └── assets/
├── design-system/                           # Phase 1b output
│   ├── design.html                          # SINGLE SOURCE OF TRUTH for brand
│   ├── fonts/*.woff2                        # self-hosted brand fonts
│   └── *.json (~30 token files)
└── hyperframes/                             # Phase 2.5 + Phase 4 outputs
    ├── public/                               # bulk-copied assets (Phase 4a)
    ├── assets/
    │   ├── voice/scene_*.wav                 # Phase 2.5
    │   ├── voice/scene_*_words.json          # Phase 2.5
    │   └── bgm.wav                           # Phase 2.5 (Lyria, detached)
    ├── compositions/scene_*.html             # Phase 4b workers
    ├── index.html                            # Phase 4c
    ├── snapshots/                            # Phase 4c
    └── renders/video.mp4                     # Phase 4c — final delivery
```

---

## Phase summary table

| Phase | Type          | Dispatcher                       | Reads                                                                                | Writes                                                          |
| ----- | ------------- | -------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| 1     | Subagent      | `agents/web-research.md`         | Target URL · `phases/web-research/guide.md` · capture script                         | `research/` (context_pack + extraction + screenshot + assets/)  |
| 1b    | Subagent      | `agents/design-system.md`        | Target URL · `phases/design-system/guide.md` · 3 build scripts                       | `design-system/design.html` + ~30 JSON tokens + `fonts/*.woff2` |
| 2     | Subagent      | `agents/story-design.md`         | `research/` · `phases/story-design/guide.md` · 1 archetype overview · 0–2 samples    | `narrator_scripts.json`                                         |
| 2.5   | Script (Bash) | `scripts/audio.mjs`              | `narrator_scripts.json`                                                              | `audio_meta.json` + `hyperframes/assets/voice/*` + `bgm.wav`    |
| 3     | Subagent      | `agents/visual-design.md`        | `narrator_scripts.json` · `design-system/design.html` · embedded effects catalog     | `section_plan.md`                                               |
| 4a    | Script (Bash) | `scripts/prep.mjs`               | `section_plan.md` · `narrator_scripts.json` · `audio_meta.json?` · `research/assets` | `group_spec.json` + `hyperframes/public/`                       |
| 4b    | Subagent × N  | `agents/hyperframes-scene.md`    | `hyperframes-core` + `hyperframes-animation` skills · `design-system/design.html`    | `hyperframes/compositions/scene_*.html`                         |
| 4c    | Subagent      | `agents/hyperframes-finalize.md` | `hyperframes-core` + `hyperframes-cli` skills · `group_spec.json` · compositions     | `hyperframes/index.html` + snapshots + `renders/video.mp4`      |

---

## Phase 1 — web-research

**Type:** Subagent (`agents/web-research.md`)
**Runs in parallel with:** Phase 1b

### Context injected by orchestrator

- `SKILL_DIR` — absolute path of the skill directory
- `Target URL` — user-provided URL

### Reads

- `<SKILL_DIR>/phases/web-research/guide.md`
- `<SKILL_DIR>/phases/web-research/scripts/capture_web_context.py`

### Executes

```bash
uv run --with playwright \
  <SKILL_DIR>/phases/web-research/scripts/capture_web_context.py \
  "<TARGET_URL>" --out ./research --download-assets
```

### Writes

```
research/
├── context_pack.md       # ~50KB compact LLM digest
├── extraction.json       # ~175KB raw extraction (sections, assets, colors, fonts, rects)
├── page.html             # raw page source
├── screenshot_full.png   # full-page rendered screenshot (1440px wide)
└── assets/
    ├── index.json        # inventory of downloaded assets with local paths
    └── *.{png,jpg,svg,webp,mp4,woff2,...}
```

### Scope

Pure capture only. Does **NOT** generate `analysis.json` (that's fused into Phase 2) and does **NOT** extract brand tokens (Phase 1b's job).

### Done report

- Final URL (post-redirects)
- Page title
- Section candidate count + brief list
- Asset totals broken down by extension
- Notable findings (hero candidate, font families)
- Anomalies (timeouts, missing screenshot, etc.)
- Append `## Phase 1: web-research [done <ISO>]` to `context.log`

---

## Phase 1b — design-system

**Type:** Subagent (`agents/design-system.md`)
**Runs in parallel with:** Phase 1

### Context injected by orchestrator

- `SKILL_DIR`
- `Target URL`

### Reads

- `<SKILL_DIR>/phases/design-system/guide.md`
- 3 scripts under `phases/design-system/scripts/`

### Executes (three steps)

```bash
# Step 1 — extract tokens
npx designlang <url> --out ./design-system

# Step 2 — synthesize design.html
node <SKILL_DIR>/phases/design-system/scripts/build-design-html.mjs ./design-system

# Step 3 — download self-hosted fonts + inject @font-face into design.html
node <SKILL_DIR>/phases/design-system/scripts/download-fonts.mjs ./design-system
```

### Writes

```
design-system/
├── design.html                  # ~80KB, 10 sections — SINGLE SOURCE OF TRUTH for brand
├── fonts/*.woff2                # self-hosted brand fonts (e.g. TT Norms Pro)
└── ~30 *.json sidecars          # design-tokens, motion-tokens, visual-dna, voice, gradients, ...
```

### Why design.html is the source of truth

- **§1 Brand DNA** · **§2 Color** (`:root` vars) · **§3 Typography** (font-family) · **§4 Border radius** (`--r-*`) · **§5 Motion** (`EASE` / `DUR` consts) · **§6 Visual DNA** · **§7 Voice** · **§8 Components** (HTML+CSS snippets)
- Phase 3 cites brand hex/fonts/eases verbatim from here
- Phase 4b workers paste `:root` blocks, EASE/DUR consts, and component HTML+CSS into their scoped `<style>` and `<script>`

### Done report

- Token files written count
- design.html byte size
- Primary / accent hex
- Display + body + mono font families
- Fonts downloaded count (0 = Google Fonts only; ≥1 = real self-hosted brand fonts)
- Append `## Phase 1b: design-system [done <ISO>]` to `context.log`

---

## Phase 2 — story-design

**Type:** Subagent (`agents/story-design.md`)
**Blocked by:** Phase 1 + Phase 1b both complete

### Context injected by orchestrator

- `SKILL_DIR`
- One-paragraph summary of Phase 1 + 1b (assets seen, primary/accent hex, fonts)
- `Schema validator:` absolute path to `validate-narrator-scripts.mjs`

### Reads

- `<SKILL_DIR>/phases/story-design/guide.md` (~30KB — archetypes, narrative fields, schema)
- One archetype overview at `phases/story-design/archetypes/<name>/overview.md`
- Optionally 0–2 sample files in same archetype directory
- `research/context_pack.md` (read first — compact digest)
- `research/extraction.json` (drill-down for full asset URLs, section rects, colors)
- `research/screenshot_full.png`
- `research/assets/` (the asset pool for `assetCandidates[].path`)

**Does NOT read:** `design-system/` (Phase 3's job).

### Picks

- **One archetype** from: PAS · Future Pacing · Demo Loop · BAB · Feature-Benefit Cascade
- Scene sequence (independent of webpage section order — narrative beats, not info layout)
- Per scene: `narrativeIntent` · `transition` · `assetCandidates[]` (paths from `research/assets/`) · `script` · `estimatedDuration`

### Writes

`./narrator_scripts.json` — canonical schema:

- `narrativeArchetype` · `emotionalArc` (top-level)
- `scenes[]`: each with `sceneNumber` · `sceneName` · `narrativeIntent{}` · `transition` · `assetCandidates[]` · `script` · `estimatedDuration`

### Self-validation

```bash
node <validator> ./narrator_scripts.json
```

Catches `scene_id` vs `sceneNumber`, `narration` vs `script`, flattened `narrativeIntent`, missing UI-demo scene type, etc. Iterate until exit 0.

### Done report

- Archetype chosen
- Scene count + total estimated duration
- Per-scene one-liner (sceneNumber + sceneName + 8-word gist)
- Append `## Phase 2: story-design [done <ISO>]`

---

## Phase 2.5 — audio (deterministic script, NO subagent)

**Type:** Bash invocation of `scripts/audio.mjs`
**Runs in parallel with:** Phase 3
**Optional:** Skip entirely if user said "no audio" or no TTS provider available

### Executes

```bash
node <SKILL_DIR>/scripts/audio.mjs \
  --narrator-scripts ./narrator_scripts.json \
  --hyperframes ./hyperframes \
  --out ./audio_meta.json \
  --lyria-recipe <SKILL_DIR>/phases/audio/lyria-recipe.py
```

Optional flags:

- `--voice <id>` — Kokoro default `am_michael`, ElevenLabs default `21m00Tcm4TlvDq8ikWAM`
- `--provider kokoro|elevenlabs` — force a provider
- `--lang <iso>` — non-English (needs explicit `--voice` for Kokoro)
- `--no-bgm` — skip BGM
- `--bgm-prompt "<text>"` — override auto-inferred mood

### What it does

1. Picks TTS provider: ElevenLabs (`$ELEVENLABS_API_KEY` + python `elevenlabs` import) else Kokoro (`npx hyperframes tts`)
2. Per-scene **pipelined** TTS → Whisper transcribe in parallel via `Promise.all`
3. Spawns Lyria BGM **detached** (if `$GOOGLE_API_KEY` set) — child outlives the script
4. ffprobes each voice wav for true `voiceDuration`
5. Exits 0 the moment voice + transcribe done; BGM keeps rendering in background

### Writes

```
./audio_meta.json                                # index — schema:
hyperframes/assets/voice/scene_<N>.wav            # TTS narration
hyperframes/assets/voice/scene_<N>_words.json     # Whisper word-level timestamps
hyperframes/assets/bgm.wav                        # Lyria BGM (may land minutes later)
```

`audio_meta.json`:

```json
{
  "tts_provider": "kokoro" | "elevenlabs",
  "voice_id": "...",
  "bgm_enabled": true | false,
  "bgm_path": "assets/bgm.wav" | null,
  "bgm_pending": true | false,
  "total_duration_s": <Σ voiceDuration>,
  "scenes": {
    "scene_1": { "voicePath": "assets/voice/scene_1.wav", "voiceDuration": 4.823, "wordsPath": "..." }
  }
}
```

`bgm_pending: true` signals Lyria is still rendering; Phase 4c re-checks `bgm.wav` on disk before emitting `<audio>`.

### Exit codes

- 0 → voice + transcribe done; proceed
- 1 → zero scenes got voice → orchestrator decides retry vs proceed without audio

---

## Phase 3 — visual-design

**Type:** Subagent (`agents/visual-design.md`)
**Runs in parallel with:** Phase 2.5

### Context injected by orchestrator

- `SKILL_DIR`
- Phase 2 summary (archetype + scene count + emotional arc)
- `Design system:` path to `./design-system/design.html`
- `Schema validator:` absolute path to `validate-section-plan.mjs`
- **Embedded `## Effects catalog`** — the full contents of `phases/visual-design/effects-catalog.md` inlined into the prompt (~67 lines)

### Reads

- `<SKILL_DIR>/phases/visual-design/guide.md`
- 4 `phases/visual-design/rules/*.md` (typography · color-system · composition · motion-language) — issued in parallel
- `./narrator_scripts.json` (scenes + assetCandidates + estimatedDuration)
- `./design-system/design.html` §1–§7 (brand palette / typography / motion eases verbatim)

**Does NOT read:** `research/` · `effects-catalog.md` from disk (embedded in dispatch) · `hyperframes-animation` skill (only effect names; bodies are opened by Phase 4b).

### Writes

`./section_plan.md` — one `## Scene N: <name>` block per scene with:

- **3 mandatory anchors** — `**Effects:**` (4–7 effect ids from catalog) · `**Duration:**` (seconds) · `**Continuity:**` (`break` or `continue`)
- **Prose body** — composition / palette / typography / motion choreography, citing real hex from design.html §2 and assets from `assetCandidates`

### Self-validation

```bash
node <validator> ./section_plan.md
```

Validator asserts: (a) every effect name exists in `hyperframes-animation/rules/`, (b) every scene has all 3 anchors, (c) `Continuity` is `break`|`continue` and scene 1 is `break`.

### Done report

- Scene count + total target duration
- Per-scene visual concept one-liner (composition + 1–2 effect names)
- Any scene that deviated from baseline (and why)
- Append `## Phase 3: visual-design [done <ISO>]`

---

## Phase 4a — prep (deterministic script, NO subagent)

**Type:** Bash invocation of `scripts/prep.mjs`

### Executes

```bash
node <SKILL_DIR>/scripts/prep.mjs \
  --section-plan ./section_plan.md \
  --narrator-scripts ./narrator_scripts.json \
  $( [ -f audio_meta.json ] && echo "--audio-meta ./audio_meta.json" ) \
  --rules-dir <SKILL_DIR>/../hyperframes-animation/rules \
  --research ./research \
  --design-system ./design-system \
  --hyperframes ./hyperframes \
  --out ./group_spec.json
```

### What it does

1. Scaffolds `hyperframes/` via `npx hyperframes init --example blank --non-interactive --skip-skills` if missing
2. Recursively copies `research/**/*.{png,jpg,jpeg,webp,svg}` into `hyperframes/public/` (first-wins; collisions reported)
3. Copies `design-system/fonts/*.{woff2,woff,ttf,otf}` into `hyperframes/public/fonts/`
4. Parses each `## Scene N:` block's three anchors — missing/malformed → exit 1
5. Resolves effect ids to `<rules-dir>/<id>.md` and `statSync`-verifies each — missing rule → exit 1
6. Merges `audio_meta.json` if present (`voiceDuration` wins over section_plan duration; captures `voicePath`/`wordsPath`/`bgm_path`)
7. Groups scenes by `Continuity` anchor (`break` → new worker; `continue` → extend current; cap = 2 scenes/worker)
8. Writes `./group_spec.json` and a stdout summary

### Writes

- `./group_spec.json` — scene groups + per-scene paths + audio refs + `total_duration_s` + `font_face_css`
- `hyperframes/public/` — populated with assets + fonts

### Exit codes

- 0 → read stdout summary (scenes, groups, total duration, per-group breakdown) → proceed to 4b
- 1 → stderr names failing scene + anchor → fix is upstream (re-dispatch Phase 3)

Append `## Phase 4a: prep [done <ISO>]` to `context.log`.

---

## Phase 4b — scene workers (parallel fan-out)

**Type:** N parallel subagents (`agents/hyperframes-scene.md` × N)
**Where:** `N = len(group_spec.json["groups"])` — Phase 4a sized so each worker writes 1–2 scenes

### Context injected per worker

- `Worker ID` — e.g. `w1`
- `Design system:` path to `./design-system/design.html`
- Per scene in worker's group:
  - `effects` — ordered list of rule ids
  - `rule_paths` — absolute paths to each rule's `.md`
  - `assetCandidates` — `[{path, description}, ...]`
  - `estimatedDuration_s` — float seconds
  - `creative_brief` — verbatim Phase 3 prose body for this scene

### Reads

- **Skill tool:** `hyperframes-core` (composition contract, data-attributes, timeline contract)
- **Skill tool:** `hyperframes-animation` (SKILL.md only — rules index + routing; adapters loaded on demand)
- Each path in own `rule_paths` (in parallel)
- `./design-system/design.html` §2 / §3 / §4 / §5 / §8

**Does NOT load:** `hyperframes-cli` · `hyperframes-creative` · `hyperframes-registry`.

### Writes

`hyperframes/compositions/<scene-id>.html` — one file per scene owned. Skeleton:

```html
<template id="<scene-id>-template">
  <div
    id="root"
    class="<scene-id>-root"
    data-composition-id="<scene-id>"
    data-width="1920"
    data-height="1080"
    data-duration="<estimatedDuration_s>"
    style="position:relative; width:1920px; height:1080px; overflow:hidden;"
  >
    <style>
      /* design.html §2/§3/§4 tokens pasted, scoped under .<scene-id>-root */
    </style>
    <!-- visual DOM driven by creative_brief's effect→asset mapping -->
    <script>
      // design.html §5 EASE / DUR consts pasted at top
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      // ...one block per effect in order
      window.__timelines["<scene-id>"] = tl;
    </script>
  </div>
</template>
```

### Hard runtime rules

- **ONE root div only** with both `id="root"` and `class="<scene-id>-root"`
- **CSS scoping** — every selector starts with `.<scene-id>-root` (NEVER `#root`, `#<scene-id>-root`, bare `body`/`html`/`:root`)
- **JS selectors** — same rule; `tl.from(".<scene-id>-root .foo", ...)` not `#root`
- `<style>` + `<script>` go INSIDE `<template>`, never in `<head>`
- Exactly ONE paused GSAP timeline, registered on `window.__timelines["<scene-id>"]`
- Build synchronously — never inside async / setTimeout / Promise / event handler
- GSAP transform aliases only: `x` `y` `scale` `rotation` `opacity` (never `width`/`height`/`top`/`left`)
- No `Date.now()` / `Math.random()` / `performance.now()` / `fetch()` / `repeat: -1`
- No CSS `transition:` or `animation:` — only the paused GSAP timeline drives motion
- Asset src is `public/<file>` (no leading slash)
- Do NOT copy `@font-face` blocks — global, owned by Phase 4c's `<head>`

### Self-check before reporting

- File existence
- Eyeball: template wrapper, ONE root div with both id+class, correct `data-composition-id`, `data-duration` match, one `window.__timelines[…]` line, one block per effect in order
- CSS scope greps: zero `#root` / `#<scene-id>-root` / `getElementById("root")` matches
- Asset references: every `public/...` path exists in `hyperframes/public/`

### Done report (per scene)

```
scene_2: file=compositions/scene_2.html duration=4.83s effects=[3d-page-scroll, hacker-flip-3d, cursor-click-ripple]
```

Does NOT append to context.log — Phase 4c writes the consolidated entry.

---

## Phase 4c — finalize

**Type:** Subagent (`agents/hyperframes-finalize.md`)

### Context injected by orchestrator

- `Phase 4b summary:` scene count + worker count
- `Render quality:` `draft` | `standard` | `high` (default `high`)

### Reads

- **Skill tool:** `hyperframes-core` (composition contract)
- **Skill tool:** `hyperframes-cli` (lint / validate / inspect / snapshot / render flags + failure modes)
- `./group_spec.json` (parses for playback order + `total_duration_s` + `font_face_css` + per-scene `voicePath`/`bgm_path`)
- `hyperframes/compositions/*.html` (worker output)
- `hyperframes/public/` + `hyperframes/assets/` (assets + voice + BGM)

### Procedure

**Step 1 — Verify inputs + pre-flight harness**

```bash
node <SKILL_DIR>/scripts/check-compositions.mjs --hyperframes ./hyperframes --group-spec ./group_spec.json
```

Catches 4 worker-bug classes (root contract, timeline registration, CSS/JS scope, forbidden patterns, asset references) that historically cost 8–13 min of edit-and-retry. Exit 1 → STOP and surface per-scene violations (fix is upstream — re-dispatch worker, NOT patch-in-finalize).

**Step 2 — Assemble `hyperframes/index.html`**

- Inject `group_spec.json.font_face_css` verbatim into `<head>` (brand `@font-face` rules with URLs rewritten to `public/fonts/...`)
- For each scene in playback order with cumulative start `S`:
  - **(a)** Scene clip ref on track 0 — `<div class="clip" data-composition-src="compositions/<scene-id>.html" data-start="<S>" data-duration="<estimatedDuration_s>" data-track-index="0">`
  - **(b)** Per-scene voice `<audio>` on track 10 IF `voicePath` non-empty
  - **(c)** Top-level BGM `<audio>` on track 11 IF `bgm_path` non-empty AND file exists (volume `0.15`–`0.25` under narration; `0.40`–`0.60` if BGM-only)
- Set root `data-duration` = `total_duration_s`

**Step 3 — Pre-render gate (STOP on first failure)**

```bash
(cd hyperframes && npx hyperframes lint)
(cd hyperframes && npx hyperframes validate)
(cd hyperframes && npx hyperframes inspect)
```

Localized issues → `Edit`-fix in place and re-run. Structural issues (missing `data-composition-id`, broken sub-comp ref, unregistered timeline, async timeline build) → STOP and report.

**Step 4 — Snapshot smoke test**

```bash
(cd hyperframes && npx hyperframes snapshot --at <midpoint_1>,<midpoint_2>,...)
```

Per-scene midpoints = cumulative start + `estimatedDuration_s / 2`. Eyeball each PNG against the scene's `creative_brief`. Symptoms:

- Blank scene → asset path wrong, or sub-comp `<template>` missing
- Briefly visible / jump frames → host `data-composition-id` ≠ inner template id ≠ timeline key
- Wrong scene → playback order in `index.html` wrong

**Step 5 — Render**

```bash
(cd hyperframes && npx hyperframes render --quality <quality> --output renders/video.mp4)
```

No `--strict` unless orchestrator explicitly asked. No auto-retry — on failure, STOP and report stderr.

**Step 6 — Verify mp4**

- File exists at `hyperframes/renders/video.mp4`
- Size ≥ 10 KB
- ffprobe duration within ±0.5s of `total_duration_s`

### Writes

- `hyperframes/index.html`
- `hyperframes/snapshots/*.png`
- `hyperframes/renders/video.mp4`

### Done report

- Scene count assembled + total duration
- lint / validate / inspect status (pass / N warnings)
- Snapshot PNGs + one-line per scene against the brief
- Any `Edit`-fixes applied to worker output (file + nature)
- Render: output path, byte size, ffprobe duration, quality used
- Unresolved warnings shipped
- Append:

```
## Phase 4: hyperframes-build [done <ISO>]
Scenes: <N> (workers: <G>)
Gates: lint OK / validate OK / inspect OK / snapshot OK
Render: hyperframes/renders/video.mp4 (<size>, <duration>s, quality=<quality>)
```

---

## Parallel-dispatch contracts (the three critical pairs)

All three are the same shape: ONE assistant message with TWO+ tool_use blocks, every block `run_in_background: true`.

### Pair 1 — Phase 1 ‖ Phase 1b (first turn after URL)

```
<text: "Dispatching web-research + design-system in parallel.">
<Agent block: Phase 1 web-research,  run_in_background: true>
<Agent block: Phase 1b design-system, run_in_background: true>
<Bash block (optional): model pre-warm, run_in_background: true>
```

### Pair 2 — Phase 2.5 ‖ Phase 3 (after Phase 2 validator passes)

```
<text: "Running audio.mjs + dispatching visual-design in parallel.">
<Bash block:  node <SKILL_DIR>/scripts/audio.mjs ..., run_in_background: true>
<Agent block: Phase 3 visual-design, run_in_background: true>
```

### Pair 3 — Phase 4b fan-out (after Phase 4a returns)

```
<text: "Spawning N scene-worker subagents in parallel for groups w1..wN.">
<Agent block: worker w1, run_in_background: true>
<Agent block: worker w2, run_in_background: true>
... (N total — count before sending)
```

**Self-check rule:** if your draft message is about to emit only ONE block "and dispatch the other(s) after," STOP and reconstruct as all-blocks-in-this-message. That intent is the documented serialization anti-pattern (GitHub issue #29181 — Claude Code's default behavior).

---

## Resume / interactive mode

Read `./context.log` before dispatching anything:

| State                                                                          | Resume from                                                    |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Missing or empty                                                               | First run — full pipeline                                      |
| Last entry not `[interrupted]`                                                 | Interactive mode — dispatch only the requested phase + cascade |
| One of `research/` / `design-system/` missing                                  | Re-dispatch only the missing phase                             |
| Both present, no `narrator_scripts.json`                                       | Resume Phase 2                                                 |
| `narrator_scripts.json` present, no `audio_meta.json` AND no `section_plan.md` | Resume parallel (3 ‖ 2.5)                                      |
| One of `audio_meta.json` / `section_plan.md` missing                           | Resume the missing one only                                    |
| Both audio + section_plan, no `group_spec.json`                                | Resume Phase 4a                                                |
| Only `group_spec.json`, no `compositions/`                                     | Resume Phase 4b                                                |
| Some `compositions/scene_*.html` missing                                       | Resume Phase 4b for missing scene_ids only                     |
| All compositions present, no `renders/video.mp4`                               | Resume Phase 4c                                                |

### Interactive change types

| User request                               | Cascade                                          |
| ------------------------------------------ | ------------------------------------------------ |
| Small fix in scene file (font color, typo) | Edit scene HTML directly → 4c                    |
| Single scene rebuild                       | One 4b worker with that scene's slice → 4c       |
| Multi-scene rebuild                        | 4b fan-out → 4c                                  |
| Visual plan change                         | 3 → 4a → 4b → 4c                                 |
| Narration text change                      | 2 → (3 ‖ 2.5) → 4a → 4b → 4c                     |
| Voice / BGM swap (same script)             | 2.5 (with `--voice` or `--bgm-prompt`) → 4a → 4c |
| Drop audio entirely                        | Delete `audio_meta.json` + voice/bgm → 4a → 4c   |
| Narrative change (reorder, new archetype)  | 2 → (3 ‖ 2.5) → 4a → 4b → 4c                     |
| More assets needed                         | (1 ‖ 1b) → 2 → (3 ‖ 2.5) → 4a → 4b → 4c          |
| Brand styling change only                  | 1b only → 3 → 4a → 4b → 4c                       |
| Faster iteration                           | Pass `Render quality: draft` to 4c               |

---

## File map

```
skills/product-launch-video/
├── SKILL.md                                 # orchestrator rules
├── PIPELINE.md                              # this file
├── agents/                                  # subagent wrapper prompts (injected as Agent tool prompts)
│   ├── web-research.md                      # Phase 1
│   ├── design-system.md                     # Phase 1b
│   ├── story-design.md                      # Phase 2
│   ├── visual-design.md                     # Phase 3
│   ├── hyperframes-scene.md                 # Phase 4b worker
│   └── hyperframes-finalize.md              # Phase 4c
├── phases/                                  # workflow-internal procedure guides
│   ├── web-research/
│   │   ├── guide.md
│   │   └── scripts/capture_web_context.py
│   ├── design-system/
│   │   ├── guide.md
│   │   └── scripts/                         # designlang + build-design-html + download-fonts
│   ├── story-design/
│   │   ├── guide.md                         # ~30KB — archetypes, fields, JSON schema
│   │   └── archetypes/{pas,future-pacing,demo-loop,bab,feature-benefit-cascade}/
│   ├── audio/
│   │   ├── guide.md                         # reference (script is the procedure)
│   │   └── lyria-recipe.py                  # Google Lyria BGM recipe
│   └── visual-design/
│       ├── guide.md
│       ├── effects-catalog.md               # embedded into Phase 3 dispatch
│       └── rules/{typography,color-system,composition,motion-language}.md
└── scripts/                                 # deterministic pipeline scripts
    ├── audio.mjs                            # Phase 2.5
    ├── prep.mjs                             # Phase 4a
    ├── check-compositions.mjs               # Phase 4c pre-flight
    ├── validate-narrator-scripts.mjs        # Phase 2 schema gate
    └── validate-section-plan.mjs            # Phase 3 schema gate
```

Shared domain skills loaded by Phase 4 (NOT under this directory):

- `/hyperframes-core` — composition contract + runtime rules (4b + 4c)
- `/hyperframes-animation` — atomic rules + blueprints + per-runtime adapters (4b)
- `/hyperframes-cli` — render dev loop + failure modes (4c)
