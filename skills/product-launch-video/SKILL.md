---
name: product-launch-video
description: End-to-end pipeline that turns a website URL (or product brief) into a 60-90s product-launch / SaaS explainer / promo video as a HyperFrames composition. Orchestrates six subagent dispatches — web-extraction, story-design, visual-design, then a parallel HyperFrames build (prep → scene workers fanned out → finalize, where finalize also runs the render). Use when the user provides a URL and asks for a launch video, a promo video, a SaaS explainer, a feature reveal, or otherwise says "make me a video for <url>". You dispatch subagents via the Agent tool; you do NOT execute phase work yourself.
metadata:
  tags: orchestrator, pipeline, product-launch, promo, saas-explainer, web-to-video
---

# Product Launch Video — Orchestrator

You are the orchestrator. You dispatch one specialized subagent per phase, pass context between them, and handle user interaction. You do **NOT** execute phase work yourself.

The pipeline separates **workflow-internal phases** (this workflow's owned procedures) from **shared domain skills** (cross-workflow technical references):

- **Phases** (this workflow's `phases/` dir — `web-extraction`, `story-design`, `visual-design`) — each phase has its own `guide.md` + supporting scripts / archetypes / rules. They are NOT standalone skills; they exist only as part of this pipeline.
- **Domain skills** (top-level, cross-workflow) — `/hyperframes-core`, `/hyperframes-animation`, `/hyperframes-cli`, `/hyperframes-creative`, `/hyperframes-media`, `/hyperframes-registry`. Each describes general technical capabilities of HyperFrames.
- **Subagent prompts** (this skill's `agents/` dir) — pipeline-specific wrappers. Each says "you are Phase N of THIS pipeline, here's your cwd contract, read this guide, here's how to report". You inject these as the `prompt` to the Agent tool.

## Pipeline

| Phase | Subagent prompt file              | Subagent reads / loads                                                            | Writes                                                                          |
| ----- | --------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1     | `agents/web-extraction.md`        | `phases/web-extraction/guide.md` (+ scripts)                                      | `extraction/`                                                                   |
| 2     | `agents/story-design.md`          | `phases/story-design/guide.md` (+ archetypes)                                     | `narrator_scripts.json`                                                         |
| 2.5   | `agents/audio.md`                 | `phases/audio/guide.md` (+ `lyria-recipe.py`) + `/hyperframes-media` (Skill tool) | `audio_meta.json` + `hyperframes/assets/voice/*` + `hyperframes/assets/bgm.wav` |
| 3     | `agents/visual-design.md`         | `phases/visual-design/guide.md` (+ rules + effects-catalog.md)                    | `section_plan.md`                                                               |
| 4a    | `scripts/prep.mjs` (no subagent)  | section_plan.md + narrator_scripts.json + audio_meta.json (optional)              | `group_spec.json` + `hyperframes/public/`                                       |
| 4b    | `agents/hyperframes-scene.md` × N | `/hyperframes-core` + `/hyperframes-animation` (Skill tool)                       | `hyperframes/compositions/scene_*.html`                                         |
| 4c    | `agents/hyperframes-finalize.md`  | `/hyperframes-core` + `/hyperframes-cli` (Skill tool)                             | `hyperframes/index.html` + gates + `hyperframes/renders/video.mp4`              |

**Phase 2.5 ‖ Phase 3 run in parallel** — orchestrator **spawns both subagents to work simultaneously in parallel**: ONE assistant message containing TWO `Agent` tool_use blocks, **both with `run_in_background: true`**. They share `narrator_scripts.json` (read-only for both) and write disjoint files. Phase 4a merges `audio_meta.json` into `group_spec.json` so workers + finalize see the real `voiceDuration`.

> ❌ **Critical anti-pattern**: do NOT issue Phase 2.5 first, wait for it to finish, then issue Phase 3. That serializes a flow that's designed parallel and adds 4-8 min of wall-clock waste. Both `Agent` calls MUST be in the same assistant message. The same rule applies to Phase 4b's N scene workers.

Phases 1-3 read **local files** (`phases/<name>/guide.md`); Phase 4 loads **shared domain skills** via the Skill tool.

Phase 4 is split into three flat sub-phases so the orchestrator can fan out N scene workers **in parallel** in 4b. Each worker writes 1–2 scenes with a tiny per-worker context — only the rule bodies it owns, no `section_plan.md` walk, no asset copy, no gates.

## Project layout

```
./                                       # project root (cwd — never leave)
├── context.log                           # phase log (you append after each phase)
├── narrator_scripts.json                 # Phase 2 output
├── audio_meta.json                       # Phase 2.5 output (side file, do NOT mutate narrator_scripts.json)
├── section_plan.md                       # Phase 3 output
├── group_spec.json                       # Phase 4a output (scene groups + per-scene paths + audio refs)
├── extraction/                           # Phase 1 output
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

- **Missing or empty** → first run. Dispatch Phase 1 → 2 → **(3 ‖ 2.5 in parallel)** → 4a → 4b (parallel fan-out) → 4c in order (autopilot). Phase 4c produces and verifies the final mp4 — no separate render step.
- **Has completed phases, last entry not `[interrupted]`** → interactive mode (user is iterating). Dispatch only the phase relevant to their request, then any downstream cascade.
- **Last entry ends with `[interrupted]`** → resume from that phase. For Phase 4 interruptions, inspect disk to decide where to pick up:
  - `narrator_scripts.json` present, no `audio_meta.json` and no `section_plan.md` → resume parallel (3 ‖ 2.5)
  - One of (`audio_meta.json` / `section_plan.md`) present, other missing → resume just the missing one
  - Both audio + section_plan present, no `group_spec.json` → resume from Phase 4a
  - Only `group_spec.json` present, no `compositions/` files → resume from Phase 4b
  - Some `compositions/scene_*.html` present, not all → resume Phase 4b for the missing scene_ids only (one Agent call per missing scene)
  - All scene files present, no `hyperframes/renders/video.mp4` (or mp4 corrupted) → resume from Phase 4c

If audio is intentionally skipped (user said "no audio" or env lacks all TTS providers): orchestrator omits Phase 2.5 dispatch and proceeds directly from Phase 2 → Phase 3 → 4a. Phase 4a tolerates a missing `audio_meta.json` and falls back to `estimatedDuration` everywhere.

## Phase 1 — dispatch web-extraction

```
1. Read product-launch-video/agents/web-extraction.md
2. Compose prompt = <its contents>
                  + "\n\n## Dispatch context\n"
                  + "SKILL_DIR: <abs-path-to-this-skill>\n"
                  + "Target URL: <USER_URL>\n"
3. Agent(
     subagent_type: "general-purpose",
     description: "Phase 1: web extraction",
     prompt: <composed>,
   )
```

`SKILL_DIR` is the absolute path of the directory containing this SKILL.md. The subagent reads `<SKILL_DIR>/phases/web-extraction/guide.md` to get its procedure.

After it returns: read `extraction/report.json` to confirm shape; relay key facts to the user (pages crawled, asset counts). Proceed to Phase 2.

## Phase 2 — dispatch story-design

```
1. Read product-launch-video/agents/story-design.md
2. Compose prompt = <its contents>
                  + "\n\n## Dispatch context\n"
                  + "SKILL_DIR: <abs-path-to-this-skill>\n"
                  + "Phase 1 summary: <one-paragraph: pages crawled, brand colors, fonts noted>\n"
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

## Phase 2.5 ‖ Phase 3 — spawn audio + visual-design subagents to work simultaneously in parallel

After Phase 2 returns clean, **spawn two subagents to work simultaneously in parallel**: one for audio production (Phase 2.5), one for visual design (Phase 3). These investigations are fully independent — they share `narrator_scripts.json` (read-only) and write disjoint files (`audio_meta.json` + `hyperframes/assets/*` vs `section_plan.md`).

**Mechanics (non-negotiable)**:

1. **ONE assistant message** containing **TWO `Agent` tool_use blocks** — never two separate messages.
2. **Both `Agent` calls pass `run_in_background: true`** — without this flag, Claude defaults to foreground (blocking) mode and the second call waits for the first to complete, serializing the flow.
3. Issue both dispatches in the same turn the moment Phase 2's schema validator exits 0. Do NOT pause for user confirmation between Phase 2 and this parallel pair.
4. After issuing both, you will be auto-notified as each subagent completes. Do not poll, sleep, or check on progress proactively.

> ❌ **Anti-pattern (the documented Claude Code default behavior)** — see [GitHub issue #29181](https://github.com/anthropics/claude-code/issues/29181):
>
> ```
> assistant: <text> + Agent(Phase 2.5, run_in_background=false)    ← message 1
> [waits 4-5 min for Phase 2.5 to finish]
> assistant: <text> + Agent(Phase 3,   run_in_background=false)    ← message 2
> ```
>
> This serializes the two phases and adds 4-8 min wall-clock waste. The orchestrator MUST consciously override the conservative-serial default; that is exactly what `run_in_background: true` + same-message dispatch are for.

Decide BGM availability before composing the audio dispatch:

```bash
[ -n "$GOOGLE_API_KEY" ] && echo "BGM enabled" || echo "BGM disabled"
```

If the user has explicitly asked for "no audio" (or no TTS provider is available at all in this environment), **omit the Phase 2.5 dispatch entirely** — proceed with Phase 3 only. Downstream phases tolerate a missing `audio_meta.json`.

### Compose the Phase 2.5 (audio) dispatch

```
1. Read product-launch-video/agents/audio.md
2. Compose prompt = <wrapper contents>
                  + "\n\n## Dispatch context\n"
                  + "SKILL_DIR: <abs-path-to-this-skill>\n"
                  + "Phase 2 summary: <scene count + Σ estimatedDuration as a float>\n"
                  + "TTS provider hint: <elevenlabs|kokoro|auto based on env>\n"
                  + "BGM: <enabled|disabled>\n"
3. Agent block:
     subagent_type: "general-purpose",
     description: "Phase 2.5: audio (TTS + transcribe + BGM)",
     prompt: <composed>,
     run_in_background: true,    ← MANDATORY for parallelism
```

### Compose the Phase 3 (visual-design) dispatch

```
1. Read product-launch-video/agents/visual-design.md
   Read product-launch-video/phases/visual-design/effects-catalog.md   ← inlined into Dispatch context
2. Compose prompt = <wrapper contents>
                  + "\n\n## Dispatch context\n"
                  + "SKILL_DIR: <abs-path-to-this-skill>\n"
                  + "Phase 2 summary: <archetype + scene count + emotional arc>\n"
                  + "Schema validator: <SKILL_DIR>/scripts/validate-section-plan.mjs\n"
                  + "\n## Effects catalog (single source of truth — your `**Effects:**` anchor lines must cite ids from this list)\n\n"
                  + <effects-catalog.md contents>
3. Agent block:
     subagent_type: "general-purpose",
     description: "Phase 3: visual design",
     prompt: <composed>,
     run_in_background: true,    ← MANDATORY for parallelism
```

### Dispatch both in ONE message — concrete shape

The assistant turn that fires after Phase 2 validator passes MUST look like this:

```
<one sentence text: "Spawning audio + visual-design subagents in parallel.">
<tool_use block 1: Agent(... Phase 2.5 ..., run_in_background: true)>
<tool_use block 2: Agent(... Phase 3 ...,   run_in_background: true)>
```

Two tool_use blocks, same message, both backgrounded. Then **stop emitting tool calls in that turn** — the next turn is when their results come back.

Self-check before you hit "send": is your draft assistant message about to emit only ONE Agent block, with the intent of "I'll dispatch Phase 3 after Phase 2.5 finishes"? **STOP and reconstruct as two blocks in this same message.** That intent is the exact bug this section exists to prevent.

### After both return

1. Run the Phase 3 schema validator:

   ```bash
   node <SKILL_DIR>/scripts/validate-section-plan.mjs ./section_plan.md
   ```

   - Exit 0 → continue
   - Exit 1 → re-dispatch Phase 3 (only) with stderr appended; Phase 2.5's output is unaffected and stays on disk.

2. Sanity-parse the audio side file:
   ```bash
   [ -f audio_meta.json ] && python3 -m json.tool < audio_meta.json > /dev/null
   ```
3. Surface to user: scene list (from section_plan), TTS provider + voice (from audio_meta), BGM yes/no, any scenes missing voice.

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
  --extraction ./extraction \
  --hyperframes ./hyperframes \
  --out ./group_spec.json
```

The script:

1. Scaffolds `hyperframes/` via `npx hyperframes init … --example blank --non-interactive --skip-skills` if the dir is missing.
2. Recursively copies `extraction/**/*.{png,jpg,jpeg,webp,svg}` into `hyperframes/public/` with first-wins semantics (collisions skipped, reported).
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
- **Voice / BGM change only** (same script, swap voice id or BGM mood) → Phase 2.5 ONLY → 4a (re-merge audio_meta.json into group_spec.json) → 4c. Phase 3 / 4b unchanged.
- **Drop audio entirely** → delete `audio_meta.json` + `hyperframes/assets/voice/` + `hyperframes/assets/bgm.wav` → dispatch 4a → 4c (no `<audio>` elements emitted; everything falls back to `estimatedDuration`)
- **Narrative change** (reorder scenes, new archetype) → Phase 2 → (3 ‖ 2.5) → 4a → 4b → 4c
- **More assets needed** → Phase 1 with a scoped URL/scope hint in the Dispatch context, then cascade through (3 ‖ 2.5) → 4a → 4b → 4c
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
- `phases/web-extraction/`, `phases/story-design/`, `phases/visual-design/` — workflow-internal phase guides for Phases 1–3
- `/video-workflows` (router) — the cross-workflow router that hands off to this orchestrator
