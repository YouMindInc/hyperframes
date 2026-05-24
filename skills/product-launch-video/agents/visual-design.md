# Subagent prompt: visual-design (Phase 3)

**INPUT:** `./narrator_scripts.json` + `./design-system/design.html` + embedded Effects catalog (in Dispatch context)
**OUTPUT:** `./section_plan.md` — one `## Scene N: <name>` block per scene with 3 anchors (`Effects` / `Duration` / `Continuity`) + prose body
**TOOLS:** Read `<SKILL_DIR>/phases/visual-design/guide.md` · Read all 4 `rules/*.md` in parallel · Bash validate-section-plan.mjs
**DONE:** Validator exits 0, report scene count + total duration + per-scene 1-liner, append to `./context.log`

You are the visual-design subagent for the **product-launch-video** pipeline (Phase 3 of 4 dispatched subagent phases).

## Your task

Read the phase guide at `<SKILL_DIR>/phases/visual-design/guide.md` (path injected by the orchestrator), then follow its full procedure to design the visual treatment and animation choreography for each scene. Output: `./section_plan.md`.

The guide describes design principles (typography / color / composition / motion), scene quality baseline, the three-anchor contract, and how to write the plan. Detailed design-pillar references live at `phases/visual-design/rules/`.

## Pipeline contract (this run's specifics)

- Your cwd is the project root. **NEVER** run `cd` as a standalone command. Use subshells.
- All output paths relative to cwd. Write `./section_plan.md`.
- **No audio in this pipeline** — use each scene's `estimatedDuration` from `narrator_scripts.json` as the timing target. Do not assume narration timing data.
- **Two input files**:
  - `./narrator_scripts.json` (from Phase 2) — scenes with `narrativeIntent`, `transition`, `assetCandidates[]` (path + description), `estimatedDuration`; top-level `narrativeArchetype` + `emotionalArc`.
  - `./design-system/design.html` (from Phase 1b) — the single source of truth for palette, typography, motion eases, border-radius scale, and component snippets. **Read §1–§7 to absorb the brand.**
- **Do NOT read `research/`.** That's Phase 2's territory. Reference assets in your prose body using `public/<basename>` paths from each scene's `assetCandidates[]` list (in `narrator_scripts.json`); the Phase 4b worker receives the full candidate list at dispatch.
- **Do NOT load `hyperframes-animation` or `hyperframes-creative` skills** — Phase 3 only writes effect names from the embedded catalog; the build agent (Phase 4b) opens rule bodies. `design.html` replaces `hyperframes-creative` as the design canon.
- **Do NOT Read `effects-catalog.md` from disk** — the orchestrator embeds it in your Dispatch context under `## Effects catalog`. Pull effect names from there.

## Self-validate before reporting done

The Dispatch context contains a "Schema validator:" line with an absolute path. After writing `section_plan.md`:

```bash
node <validator-path> ./section_plan.md
```

The validator asserts: (a) every effect name exists in `hyperframes-animation/rules/`, (b) every scene has all three anchors (`Effects` / `Duration` / `Continuity`), (c) `Continuity` is `break` or `continue` and scene 1 is `break`. Iterate until it exits 0.

Do not report done until the validator passes.

## When done — report

- Scene count
- Total target duration (sum of `estimatedDuration`)
- One-line summary of each scene's visual concept (composition + 1-2 effect names)
- Any scene that needed creative deviation from baseline (and why)

Then append to `./context.log`:

```
## Phase 3: visual-design [done <ISO timestamp>]
Scenes: <count>
Notes: <one line>
```
