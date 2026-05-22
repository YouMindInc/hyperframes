---
name: product-launch-video
description: End-to-end pipeline that turns a website URL (or product brief) into a 60-90s product-launch / SaaS explainer / promo video as a HyperFrames composition. Phase 1 (web-research, browser capture) and Phase 1b (design-system, brand-token extraction → design.html) run in parallel; Phase 2 (story-design) consumes the research pack to write the narrative + per-scene asset candidates; Phase 3 (visual-design) reads narrator_scripts.json + design.html only (design.html is the single source of truth for palette / typography / motion). Then a parallel HyperFrames build (prep → scene workers fanned out → finalize, where finalize also runs the render). Use when the user provides a URL and asks for a launch video, a promo video, a SaaS explainer, a feature reveal, or otherwise says "make me a video for <url>". You dispatch subagents via the Agent tool; you do NOT execute phase work yourself.
metadata:
  tags: orchestrator, pipeline, product-launch, promo, saas-explainer, web-to-video
---

# Product Launch Video — Orchestrator

You are the orchestrator. You dispatch one specialized subagent per phase, pass context between them, and handle user interaction. You do **NOT** execute phase work yourself.

The pipeline separates **workflow-internal phases** (this workflow's owned procedures) from **shared domain skills** (cross-workflow technical references):

- **Phases** (this workflow's `phases/` dir — `web-research`, `design-system`, `story-design`, `audio`, `visual-design`) — each phase has its own `guide.md` + supporting scripts / archetypes / rules / references. They are NOT standalone skills; they exist only as part of this pipeline. All capture, token-extraction, and design tooling lives under `phases/` — there are no cross-skill dependencies for the pre-build stages.
- **Domain skills** (top-level, cross-workflow) — `/hyperframes-core`, `/hyperframes-animation`, `/hyperframes-cli`, `/hyperframes-media`, `/hyperframes-registry`. These are loaded by Phase 4 only and describe general HyperFrames technical capabilities.
- **Subagent prompts** (this skill's `agents/` dir) — pipeline-specific wrappers. Each says "you are Phase N of THIS pipeline, here's your cwd contract, read this guide, here's how to report". You inject these as the `prompt` to the Agent tool.

## Pipeline

| Phase | Subagent prompt file              | Subagent reads / loads                                                                                                 | Writes                                                                                         |
| ----- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 1     | `agents/web-research.md`          | `phases/web-research/guide.md` (+ capture script)                                                                      | `research/` (context_pack.md, extraction.json, assets/, screenshot_full.png, page.html)        |
| 1b    | `agents/design-system.md`         | `phases/design-system/guide.md` (+ build script)                                                                       | `design-system/` (design.html + ~30 token JSON files)                                          |
| 2     | `agents/story-design.md`          | `phases/story-design/guide.md` (+ archetypes) + `research/`                                                            | `narrator_scripts.json` (includes `assetCandidates` per scene)                                 |
| 2.5   | `scripts/audio.mjs` (no subagent) | `narrator_scripts.json`                                                                                                | `audio_meta.json` + `hyperframes/assets/voice/*` + `hyperframes/assets/bgm.wav` (BGM detached) |
| 3     | `agents/visual-design.md`         | `phases/visual-design/guide.md` (+ rules + effects-catalog.md) + `narrator_scripts.json` + `design-system/design.html` | `section_plan.md`                                                                              |
| 4a    | `scripts/prep.mjs` (no subagent)  | section_plan.md + narrator_scripts.json + audio_meta.json (optional) + `research/assets/`                              | `group_spec.json` + `hyperframes/public/`                                                      |
| 4b    | `agents/hyperframes-scene.md` × N | `/hyperframes-core` + `/hyperframes-animation` (Skill tool) + `design-system/design.html`                              | `hyperframes/compositions/scene_*.html`                                                        |
| 4c    | `agents/hyperframes-finalize.md`  | `/hyperframes-core` + `/hyperframes-cli` (Skill tool)                                                                  | `hyperframes/index.html` + gates + `hyperframes/renders/video.mp4`                             |

**Phase 1 ‖ Phase 1b run in parallel** — both only need the target URL and write disjoint directories (`research/` vs `design-system/`). Orchestrator launches both subagents in ONE assistant message, **both with `run_in_background: true`**. Phase 2 (story-design) cannot start until **both** finish.

**Phase 2.5 ‖ Phase 3 run in parallel** — orchestrator **launches both simultaneously**: ONE assistant message containing TWO tool_use blocks (a `Bash` for `audio.mjs` + an `Agent` for visual-design), **both with `run_in_background: true`**. They share `narrator_scripts.json` (read-only for both) and write disjoint files. Phase 4a merges `audio_meta.json` into `group_spec.json` so workers + finalize see the real `voiceDuration`. **Lyria BGM is spawned detached by `audio.mjs` and may finish minutes after the script exits** — `audio_meta.bgm_pending: true` signals this; Phase 4c re-checks `bgm.wav` on disk before emitting the `<audio>` element.

> ❌ **Critical anti-pattern**: do NOT issue Phase 1 first, wait for it to finish, then issue Phase 1b (nor 2.5 then 3). That serializes a flow that's designed parallel and adds 30-90s of wall-clock waste. Each parallel pair MUST be in the same assistant message, both with `run_in_background: true`. The same rule applies to Phase 4b's N scene workers.

Phases 1–3 read **local files** (`phases/<name>/guide.md`). Phase 4 loads **shared domain skills** via the Skill tool. Phase 4b also reads `design-system/design.html` for `:root` tokens and component HTML+CSS.

Phase 4 is split into three flat sub-phases so the orchestrator can fan out N scene workers **in parallel** in 4b. Each worker writes 1–2 scenes with a tiny per-worker context — only the rule bodies it owns, no `section_plan.md` walk, no asset copy, no gates.

## Project layout

```
./                                       # project root (cwd — never leave)
├── context.log                           # phase log (you append after each phase)
├── narrator_scripts.json                 # Phase 2 output
├── audio_meta.json                       # Phase 2.5 output (side file, do NOT mutate narrator_scripts.json)
├── section_plan.md                       # Phase 3 output
├── group_spec.json                       # Phase 4a output (scene groups + per-scene paths + audio refs)
├── research/                             # Phase 1 output (web-research)
├── design-system/                        # Phase 1b output (design.html + token JSON files)
└── hyperframes/                          # Phase 2.5 + Phase 4 outputs
    ├── public/                            # Phase 4a (bulk-copied visual assets)
    ├── assets/
    │   ├── voice/scene_*.wav              # Phase 2.5 (TTS narration)
    │   ├── voice/scene_*_words.json       # Phase 2.5 (Whisper word-level timestamps)
    │   └── bgm.wav                        # Phase 2.5 (Lyria BGM, optional)
    ├── compositions/scene_*.html          # Phase 4b (parallel workers)
    ├── index.html                         # Phase 4c (clip refs + <audio> tracks)
    ├── snapshots/                         # Phase 4c (visual smoke test)
    └── renders/video.mp4                  # Phase 4c (final render — finalize owns it end-to-end)
```

## Dispatch pattern (the "injection")

For Phases 1–4, the dispatch is always the same shape:

1. **Read** the subagent prompt file at `agents/<phase>.md` (relative to this SKILL.md's location).
2. **Construct the Agent tool's `prompt`** by concatenating:
   - The full contents of `agents/<phase>.md` (the wrapper)
   - A `## Dispatch context` section with this run's data (target URL, prev-phase summary, etc.)
3. **Call Agent** with `subagent_type: "general-purpose"`, that prompt, and a short `description`.

The subagent gets a fresh context. Its first action depends on the phase:

- **Phases 1-3** — Read `<SKILL_DIR>/phases/<phase-name>/guide.md` (the orchestrator injects `<SKILL_DIR>` as an absolute path in the Dispatch context).
- **Phase 4** — Load the relevant domain skills via the Skill tool (`hyperframes-core`, `hyperframes-animation`, etc.).

It then follows the guide / skill procedure with this pipeline's contract overlaid (cwd rules, out-of-scope flags, output filenames, when-done reporting).

## Mode detection (do this BEFORE dispatching)

Read `./context.log` if it exists:

- **Missing or empty** → first run. Dispatch **(1 ‖ 1b in parallel)** → 2 → **(3 ‖ 2.5 in parallel)** → 4a → 4b (parallel fan-out) → 4c in order (autopilot). Phase 4c produces and verifies the final mp4 — no separate render step.
- **Has completed phases, last entry not `[interrupted]`** → interactive mode (user is iterating). Dispatch only the phase relevant to their request, then any downstream cascade.
- **Last entry ends with `[interrupted]`** → resume from that phase. Inspect disk to decide where to pick up:
  - For Phase 1 / 1b interruptions: if one of (`research/context_pack.md` / `design-system/design.html`) is missing, re-dispatch only the missing phase (the other is unaffected and stays on disk).
  - `research/` + `design-system/design.html` both present, no `narrator_scripts.json` → resume from Phase 2.
  - `narrator_scripts.json` present, no `audio_meta.json` and no `section_plan.md` → resume parallel (3 ‖ 2.5)
  - One of (`audio_meta.json` / `section_plan.md`) present, other missing → resume just the missing one
  - Both audio + section_plan present, no `group_spec.json` → resume from Phase 4a
  - Only `group_spec.json` present, no `compositions/` files → resume from Phase 4b
  - Some `compositions/scene_*.html` present, not all → resume Phase 4b for the missing scene_ids only (one Agent call per missing scene)
  - All scene files present, no `hyperframes/renders/video.mp4` (or mp4 corrupted) → resume from Phase 4c

If audio is intentionally skipped (user said "no audio" or env lacks all TTS providers): orchestrator omits the `audio.mjs` Bash call and proceeds directly from Phase 2 → Phase 3 → 4a. Phase 4a tolerates a missing `audio_meta.json` and falls back to `estimatedDuration` everywhere.

## Phase 1 ‖ Phase 1b — dispatch web-research + design-system in parallel

Phase 1 (web-research, page capture) and Phase 1b (design-system, brand-token extraction) both only need the target URL and write to disjoint directories (`research/` vs `design-system/`). Both must complete before Phase 2 can start. The orchestrator launches them in ONE assistant message with TWO `Agent` tool_use blocks, both with `run_in_background: true`.

### Phase 1 — web-research dispatch

```
1. Read product-launch-video/agents/web-research.md
2. Compose prompt = <its contents>
                  + "\n\n## Dispatch context\n"
                  + "SKILL_DIR: <abs-path-to-this-skill>\n"
                  + "Target URL: <USER_URL>\n"
3. Agent block:
     subagent_type: "general-purpose",
     description: "Phase 1: web research",
     prompt: <composed>,
     run_in_background: true,    ← MANDATORY for parallelism
```

The subagent reads `<SKILL_DIR>/phases/web-research/guide.md` and runs the capture script with `--out ./research --download-assets`. Output: `research/context_pack.md`, `research/extraction.json`, `research/screenshot_full.png`, `research/page.html`, `research/assets/`. The phase does **NOT** generate an `analysis.json` — analysis is fused into Phase 2 (story-design).

### Phase 1b — design-system dispatch

```
1. Read product-launch-video/agents/design-system.md
2. Compose prompt = <its contents>
                  + "\n\n## Dispatch context\n"
                  + "SKILL_DIR: <abs-path-to-this-skill>\n"
                  + "Target URL: <USER_URL>\n"
3. Agent block:
     subagent_type: "general-purpose",
     description: "Phase 1b: design system",
     prompt: <composed>,
     run_in_background: true,    ← MANDATORY for parallelism
```

The subagent reads `<SKILL_DIR>/phases/design-system/guide.md` and runs `npx designlang` + `build-design-html.mjs`. Output: `design-system/design.html` plus ~30 token JSON sidecar files. **`design.html` is the single source of truth for all design decisions in Phases 3 and 4b** — palette, typography, motion eases, and component HTML+CSS are all defined there.

### Dispatch both in ONE message — concrete shape

The first autopilot turn after the user provides a URL MUST look like this:

```
<one sentence text: "Dispatching web-research + design-system subagents in parallel.">
<tool_use block 1: Agent(... Phase 1 web-research, run_in_background: true)>
<tool_use block 2: Agent(... Phase 1b design-system, run_in_background: true)>
<tool_use block 3 (optional): Bash(model pre-warm, run_in_background: true)>
```

Two `Agent` blocks, same message, both backgrounded. Then stop emitting tool calls in that turn — the next turn is when results come back.

**Self-check before sending**: is your draft about to emit only ONE block, planning to launch the other after? STOP — reconstruct as two blocks in this same message. That intent is the exact serialization bug this section exists to prevent.

### Model pre-warm (optional, fire-and-forget)

**While dispatching Phase 1 + 1b, kick off model pre-warm in background** so Kokoro + Whisper models are loaded into the OS page cache by the time Phase 2.5 needs them. This is fire-and-forget — failures are silent and harmless. Use a single Bash with `run_in_background: true` in the **same assistant message** as the Phase 1 + 1b dispatches:

```bash
( WARM_DIR=$(mktemp -d) && \
  echo "warm" > "$WARM_DIR/warm.txt" && \
  npx hyperframes tts "$WARM_DIR/warm.txt" --output "$WARM_DIR/warm.wav" > /dev/null 2>&1 && \
  npx hyperframes transcribe "$WARM_DIR/warm.wav" --model small.en --output "$WARM_DIR/warm.json" > /dev/null 2>&1; \
  rm -rf "$WARM_DIR" ) || true
```

(Skip the pre-warm if the user has explicitly asked for "no audio" — there's nothing to warm.)

### After both Phase 1 + 1b return

Verify on disk:

```bash
[ -s research/context_pack.md ] && [ -s research/extraction.json ] && [ -s design-system/design.html ] && echo "ok" || echo "missing artifacts"
```

If `design-system/design.html` is missing, Phase 1b failed — read its report and decide whether to re-dispatch Phase 1b only, or proceed without it (in which case Phase 3 and 4b must fall back to defaults; this is a degraded mode, warn the user). If `research/` artifacts are missing, re-dispatch Phase 1 only.

Relay key facts to the user (page captured, asset count under `research/assets/`, primary/accent hex from design.html, fonts chosen). Proceed to Phase 2.

## Phase 2 — dispatch story-design

```
1. Read product-launch-video/agents/story-design.md
2. Compose prompt = <its contents>
                  + "\n\n## Dispatch context\n"
                  + "SKILL_DIR: <abs-path-to-this-skill>\n"
                  + "Phase 1 + 1b summary: <one-paragraph: page captured, asset count under research/assets/, hero candidates seen in context_pack.md; design.html primary/accent hex, font choices>\n"
                  + "Schema validator: <SKILL_DIR>/scripts/validate-narrator-scripts.mjs\n"
3. Agent(
     subagent_type: "general-purpose",
     description: "Phase 2: story design",
     prompt: <composed>,
   )
```

`<SKILL_DIR>` is the absolute path of the directory containing this SKILL.md. The subagent uses it to (a) read `phases/story-design/guide.md`, and (b) invoke `node <SKILL_DIR>/scripts/...` validators directly.

After it returns — **machine-validate before continuing**:

```bash
node <SKILL_DIR>/scripts/validate-narrator-scripts.mjs ./narrator_scripts.json
```

- Exit 0 → surface archetype + scene list to the user, proceed to Phase 3.
- Exit 1 → re-dispatch Phase 2 with the validator's stderr appended to the Dispatch context as "Schema errors to fix: <stderr>". Do NOT advance to Phase 3 on a failed schema — Phase 3 reads these field names and will silently produce wrong output.

The subagent is also instructed (in `agents/story-design.md`) to self-validate before reporting done, so this is a double check, not the primary gate.

## Phase 2.5 ‖ Phase 3 — run `audio.mjs` (Bash) + dispatch visual-design (Agent) in parallel

After Phase 2 returns clean, **launch two things in parallel**: a Bash invocation of `audio.mjs` for Phase 2.5 and an Agent dispatch for Phase 3 visual-design. They share `narrator_scripts.json` (read-only) and write disjoint files (`audio_meta.json` + `hyperframes/assets/*` vs `section_plan.md`).

**Phase 2.5 is no longer a subagent** — it's a deterministic script that:

- detects TTS provider (`$ELEVENLABS_API_KEY` + python `elevenlabs` import → ElevenLabs, else Kokoro)
- pipelines per-scene TTS → transcribe (each scene's whisper run starts the moment its own TTS finishes; doesn't wait for siblings)
- spawns Lyria BGM **detached** in the background and **returns immediately** when voice work is done — BGM may finish minutes later. `audio_meta.json` sets `bgm_pending: true` so prep.mjs trusts the path and Phase 4c does the final on-disk check before render.

**Mechanics (non-negotiable)**:

1. **ONE assistant message** with **TWO tool_use blocks**: one Bash + one Agent.
2. **Both calls pass `run_in_background: true`** — without this flag, Claude defaults to foreground (blocking) mode and the second call waits for the first to complete, serializing the flow.
3. Issue both the moment Phase 2's schema validator exits 0. Do NOT pause for user confirmation between Phase 2 and this parallel pair.
4. After issuing both, you will be auto-notified as each completes. Do not poll, sleep, or check on progress proactively.

> ❌ **Anti-pattern (the documented Claude Code default behavior)** — see [GitHub issue #29181](https://github.com/anthropics/claude-code/issues/29181):
>
> ```
> assistant: <text> + Bash(audio.mjs, run_in_background=false)     ← message 1
> [waits 30-60s for Phase 2.5 to finish]
> assistant: <text> + Agent(Phase 3,  run_in_background=false)     ← message 2
> ```
>
> This serializes a flow that's designed parallel and adds 30-90s wall-clock waste. The orchestrator MUST consciously override the conservative-serial default; that is exactly what `run_in_background: true` + same-message dispatch are for.

If the user has explicitly asked for "no audio" (or no TTS provider is available at all in this environment), **skip the Phase 2.5 Bash call entirely** — dispatch Phase 3 only. Downstream phases tolerate a missing `audio_meta.json` (Phase 4a's `prep.mjs` falls back to `estimatedDuration` everywhere).

### Phase 2.5 (audio) — Bash command

```bash
node <SKILL_DIR>/scripts/audio.mjs \
  --narrator-scripts ./narrator_scripts.json \
  --hyperframes ./hyperframes \
  --out ./audio_meta.json \
  --lyria-recipe <SKILL_DIR>/phases/audio/lyria-recipe.py
```

`audio.mjs` infers a BGM mood from `narrator_scripts.json` content directly (project + archetype + arc + per-scene script and intent fields). Use `--bgm-prompt "<text>"` to override the inferred mood.

Optional flags:

- `--voice <id>` — override default voice (Kokoro default `am_michael`; ElevenLabs default `21m00Tcm4TlvDq8ikWAM`).
- `--provider kokoro|elevenlabs` — force a provider (else auto-detect from env).
- `--lang <iso>` — non-English (e.g. `--lang zh`); requires explicit `--voice` for Kokoro.
- `--no-bgm` — skip BGM entirely.
- `--bgm-prompt "<prompt>"` — override the auto-inferred brand-mood BGM prompt.

The script exits 0 once voice + transcribe + ffprobe are done. BGM keeps rendering in the background; the orchestrator does NOT need to wait for it. Exit 1 means zero scenes got voice — read stderr and decide whether to retry (e.g. install missing TTS deps) or proceed without audio.

### Phase 3 (visual-design) — Agent dispatch

```
1. Read product-launch-video/agents/visual-design.md
   Read product-launch-video/phases/visual-design/effects-catalog.md   ← inlined into Dispatch context
2. Compose prompt = <wrapper contents>
                  + "\n\n## Dispatch context\n"
                  + "SKILL_DIR: <abs-path-to-this-skill>\n"
                  + "Phase 2 summary: <archetype + scene count + emotional arc>\n"
                  + "Design system: ./design-system/design.html  (Phase 1b output — single source of truth for palette/typography/motion)\n"
                  + "Schema validator: <SKILL_DIR>/scripts/validate-section-plan.mjs\n"
                  + "\n## Effects catalog (single source of truth — your `**Effects:**` anchor lines must cite ids from this list)\n\n"
                  + <effects-catalog.md contents>
3. Agent block:
     subagent_type: "general-purpose",
     description: "Phase 3: visual design",
     prompt: <composed>,
     run_in_background: true,    ← MANDATORY for parallelism
```

The subagent reads `narrator_scripts.json` (for scenes + assetCandidates) AND `design-system/design.html` (for actual brand palette/fonts/easing). Section_plan.md must quote real hex values from design.html, not invented ones.

### Dispatch both in ONE message — concrete shape

The assistant turn that fires after Phase 2 validator passes MUST look like this:

```
<one sentence text: "Running audio.mjs + dispatching visual-design subagent in parallel.">
<tool_use block 1: Bash(node <SKILL_DIR>/scripts/audio.mjs ..., run_in_background: true)>
<tool_use block 2: Agent(... Phase 3 ..., run_in_background: true)>
```

Two tool_use blocks, same message, both backgrounded. Then **stop emitting tool calls in that turn** — the next turn is when their results come back.

Self-check before you hit "send": is your draft assistant message about to emit only ONE block, with the intent of "I'll launch the other after this one finishes"? **STOP and reconstruct as two blocks in this same message.** That intent is the exact bug this section exists to prevent.

### After both return

1. Run the Phase 3 schema validator:

   ```bash
   node <SKILL_DIR>/scripts/validate-section-plan.mjs ./section_plan.md
   ```

   - Exit 0 → continue
   - Exit 1 → re-dispatch Phase 3 (only) with stderr appended; Phase 2.5's output is unaffected and stays on disk.

2. Sanity-parse the audio side file (if it was produced):
   ```bash
   [ -f audio_meta.json ] && python3 -m json.tool < audio_meta.json > /dev/null
   ```
3. Surface to user: scene list (from section_plan), TTS provider + voice (from audio_meta), BGM status (`bgm_pending: true` means Lyria is still rendering in the background — that's expected, not an error), any scenes missing voice.

Then proceed to Phase 4a.

**Why pre-inject the effects catalog**: ~67 lines copied once into Dispatch context saves the Phase 3 subagent one Read round-trip and pins the catalog into the same context window as its instructions.

The Phase 3 validator (`scripts/validate-section-plan.mjs`) asserts every effect name cited in `section_plan.md` exists in `skills/hyperframes-animation/rules/`. The "After both return" step above runs it; do NOT advance to Phase 4 on a non-zero exit — the build agent will hunt for non-existent rules and waste a phase.

## Phase 4 — three flat sub-phases with parallel fan-out in 4b

Phase 4 used to be one monolithic agent writing N scenes serially. It's now `prep → scene fan-out → finalize` so worker contexts stay tiny and scene authoring runs in parallel.

### Phase 4a — run `prep.mjs` directly (no subagent)

Phase 4a is **deterministic** — `section_plan.md` carries the `**Continuity:**` and `**PrimaryAsset:**` anchors that Phase 3 owns, and `prep.mjs` packs scenes into worker groups by those anchors. No LLM judgment needed; no Agent dispatch. The orchestrator runs one Bash command:

```bash
node <SKILL_DIR>/scripts/prep.mjs \
  --section-plan ./section_plan.md \
  --narrator-scripts ./narrator_scripts.json \
  $( [ -f audio_meta.json ] && echo "--audio-meta ./audio_meta.json" ) \
  --rules-dir <SKILL_DIR>/../hyperframes-animation/rules \
  --research ./research \
  --hyperframes ./hyperframes \
  --out ./group_spec.json
```

The script:

1. Scaffolds `hyperframes/` via `npx hyperframes init … --example blank --non-interactive --skip-skills` if the dir is missing.
2. Recursively copies `research/**/*.{png,jpg,jpeg,webp,svg}` into `hyperframes/public/` with first-wins semantics (collisions skipped, reported). Asset basenames must match the `assetCandidates[].path` values that story-design wrote into `narrator_scripts.json`.
3. Parses each `## Scene N:` block's four anchors (`Effects` / `Duration` / `Continuity` / `PrimaryAsset`) — missing or malformed anchor → exit 1.
4. Resolves `effects` ids to `<rules-dir>/<id>.md` and `statSync`-verifies each — missing rule → exit 1.
5. Merges `audio_meta.json` if present (`voiceDuration` wins over the section_plan duration; captures `voicePath` / `wordsPath` / `bgm_path`; drops paths that aren't on disk).
6. Groups scenes by `Continuity` (`break` starts a new worker, `continue` extends the current one) with cap = 2 scenes/worker.
7. Writes `./group_spec.json` and prints a stdout summary.

**On exit 0**: read the stdout summary (scenes, groups, total duration, per-group breakdown, anomalies). Surface to user. Proceed to Phase 4b.

**On exit 1**: stderr names the failing scene + anchor. The fix is upstream (Phase 3), not Phase 4. Re-dispatch Phase 3 with the validator's stderr in the Dispatch context — `validate-section-plan.mjs` also enforces these anchors, so a Phase 3 that passes the validator will never fail `prep.mjs` on anchor structure.

Then append to `./context.log`:

```
## Phase 4a: prep [done <ISO timestamp>]
Scenes: <N>, Groups: <G>, Total: <D>s
```

### Phase 4b — spawn N scene-worker subagents to work simultaneously in parallel

**Count before you dispatch**: `N = len(group_spec.json["groups"])`. Phase 4a sized N so each worker writes 1–2 scenes; for 8 scenes N is typically 4, for 4 scenes N is 2, etc.

You MUST issue **exactly N `Agent` tool_use blocks in one assistant message**, every one with `run_in_background: true`. Anything less and the omitted groups' scenes never get written → Phase 4c will STOP on missing `compositions/scene_*.html`.

```
For each group g in group_spec.json.groups:
  Compose prompt = <agents/hyperframes-scene.md contents>
                 + "\n\n## Dispatch context\n"
                 + "Worker ID: " + g.worker_id + "\n"
                 + "Design system: ./design-system/design.html  (Phase 1b output — copy :root tokens and component HTML+CSS verbatim into your scene's scoped <style>)\n"
                 + "\nScenes you own:\n"
  For each scene_id in g.scene_ids:
    s = g.scenes[scene_id]
    Compose += "\n### " + scene_id + "\n"
            +  "effects: " + JSON(s.effects) + "\n"
            +  "rule_paths:\n"
    For each p in s.rule_paths:
      Compose += "  - " + p + "\n"
    Compose += "primary_visual_asset: " + s.primary_visual_asset + "\n"
            +  "estimatedDuration_s: " + s.estimatedDuration_s + "\n"
            +  "creative_brief: |\n" + indent(s.creative_brief, 2) + "\n"

  Agent(
    subagent_type: "general-purpose",
    description: "Phase 4b: scene worker " + g.worker_id + " (" + join(g.scene_ids, ", ") + ")",
    prompt: <composed>,
    run_in_background: true,    ← MANDATORY for parallelism
  )
```

### Dispatch shape — concrete

The assistant turn that fires after Phase 4a returns MUST look like this (for N=4, generalize for any N):

```
<one sentence text: "Spawning N scene-worker subagents in parallel for groups w1, w2, w3, w4.">
<tool_use block 1: Agent(... worker w1 ..., run_in_background: true)>
<tool_use block 2: Agent(... worker w2 ..., run_in_background: true)>
<tool_use block 3: Agent(... worker w3 ..., run_in_background: true)>
<tool_use block 4: Agent(... worker w4 ..., run_in_background: true)>
```

Then **stop emitting tool calls in that turn**. The next turn is when worker results come back.

**Self-check before you hit "send"**: count the `Agent` blocks in your draft assistant message. If `count(Agent) < N`, you're about to silently drop groups. STOP and add the missing blocks before sending. Do NOT plan to "dispatch the rest next turn" — that's the serial anti-pattern.

> ❌ **The observed real failure mode** (from prior runs): orchestrator dispatched `w1`, waited 4 min for it to return, then dispatched `w2`, waited 4 min, then **stopped** without ever dispatching `w3` / `w4`. Result: `compositions/scene_5.html` through `scene_8.html` never written, Phase 4c blocked, full pipeline stalled. This MUST NOT recur.

### After ALL N workers return

You will be auto-notified per worker. Once all N have returned:

- For each scene id across all groups: `[ -s hyperframes/compositions/<scene-id>.html ]`
- If any is missing or empty, re-dispatch ONLY the affected worker — **issue all re-dispatches in the same message** if more than one is missing, again `run_in_background: true`.
- Do NOT proceed to 4c with a hole.

### Phase 4c — dispatch hyperframes-finalize (assemble + gates + render)

Phase 4c owns the final mp4 end-to-end: assembles `index.html`, runs `lint → validate → inspect → snapshot`, then renders and verifies. The orchestrator does NOT load `/hyperframes-cli` knowledge — all render flags / failure handling live inside the finalize wrapper.

```
1. Read product-launch-video/agents/hyperframes-finalize.md
2. Compose prompt = <its contents>
                  + "\n\n## Dispatch context\n"
                  + "Phase 4b summary: <scene count> scenes written by <worker count> workers\n"
                  + "Render quality: high\n"   ← default; pass "draft" during iteration loops, "standard" for review
3. Agent(
     subagent_type: "general-purpose",
     description: "Phase 4c: assemble + gates + render",
     prompt: <composed>,
   )
```

After it returns: read finalize's report for the mp4 path, byte size, and ffprobe duration. Present to the user and ask "What would you like to change?".

If finalize STOPped before producing the mp4, its report names which gate failed and whether it's structural (re-dispatch a 4b worker) or render-flag related (re-dispatch 4c with a different `Render quality:` or `--strict`).

## Done — present the mp4

There is no Phase 5. The finalize subagent (4c) renders and verifies `hyperframes/renders/video.mp4` itself; the orchestrator just relays the result.

Surface to the user: mp4 path + byte size + ffprobe duration (all reported by finalize). Then ask: **"What would you like to change?"**

If finalize reported a render failure or a structural gate failure, follow its STOP message:

- Structural error (missing `data-composition-id`, broken sub-comp ref, unregistered timeline, async timeline build) → re-dispatch the affected Phase 4b worker, then 4c again
- Render-flag issue (e.g. wants `--strict`, wants a different `--quality`) → re-dispatch 4c with the updated `Render quality:` value in Dispatch context
- Environment issue (FFmpeg missing, Chrome unreachable) → finalize should have flagged this; ask the user to run `npx hyperframes doctor` outside the pipeline

Detailed render failure-mode tables live in `/hyperframes-cli` — finalize already loads that skill, so the orchestrator does not need to.

## Interactive mode (after first autopilot pass)

When `context.log` shows a full pipeline already ran, **don't redispatch everything for a small request**:

- **Small fix in worker-authored scene file** (font color, typo, swap an image) → Edit the scene HTML directly, then dispatch Phase 4c (re-gates + re-renders)
- **Single scene rebuild** (re-author scene N's animation) → dispatch ONE Phase 4b worker with that scene's slice of `group_spec.json` in the Dispatch context, then 4c
- **Multi-scene rebuild** → re-run Phase 4b fan-out (multiple `Agent` calls in one message), then 4c
- **Visual plan change** (new effect choice, restructured scene) → Phase 3 → 4a (refresh `group_spec.json`) → 4b fan-out → 4c
- **Narration text change** (different script for one or more scenes) → Phase 2 (rewrite narrator_scripts.json) → **(3 ‖ 2.5)** parallel → 4a → 4b → 4c
- **Voice / BGM change only** (same script, swap voice id or BGM mood) → re-run `audio.mjs` (Phase 2.5) with `--voice <id>` and/or `--bgm-prompt "..."` → 4a (re-merge audio_meta.json into group_spec.json) → 4c. Phase 3 / 4b unchanged.
- **Drop audio entirely** → delete `audio_meta.json` + `hyperframes/assets/voice/` + `hyperframes/assets/bgm.wav` → dispatch 4a → 4c (no `<audio>` elements emitted; everything falls back to `estimatedDuration`)
- **Narrative change** (reorder scenes, new archetype) → Phase 2 → (3 ‖ 2.5) → 4a → 4b → 4c
- **More assets needed** → re-run **(Phase 1 ‖ Phase 1b)** with a scoped URL/scope hint in the Dispatch context, then cascade through 2 → (3 ‖ 2.5) → 4a → 4b → 4c
- **Brand styling change only** (same URL, want different palette/fonts after iterating on extracted tokens) → re-run **Phase 1b only** (or edit the design-system JSON tokens by hand, then re-run only the build script per `phases/design-system/guide.md` "Re-build pattern"), then cascade through 3 → 4a → 4b → 4c
- **Faster iteration** → pass `Render quality: draft` in the 4c dispatch context to cut render time roughly in half; switch back to `high` for the final pass

## `context.log` format

Each phase appends a markdown section. Read it before doing anything; it's how you know what's already done. The subagent prompt files instruct each subagent to append its own line; you don't write to it during dispatch.

```
## Phase N: <name> [done 2026-05-20T10:42:11Z]
<one line summary>
```

If a phase fails or you abort mid-run, mark `[interrupted]` instead of `[done]`. Resume from that phase on next invocation.

## See also

- `/hyperframes-animation` — atomic rules + blueprints + per-runtime adapters (Phase 4's main motion reference)
- `/hyperframes-core` + `/hyperframes-cli` — composition contract + dev loop (Phase 4's other Skill-tool loads)
- `phases/web-research/`, `phases/design-system/`, `phases/story-design/`, `phases/audio/`, `phases/visual-design/` — workflow-internal phase guides + scripts for all pre-build phases
- `/video-workflows` (router) — the cross-workflow router that hands off to this orchestrator
