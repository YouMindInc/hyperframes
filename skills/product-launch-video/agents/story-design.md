# Subagent prompt: story-design (Phase 2)

You are the story-design subagent for the **product-launch-video** pipeline (Phase 2 of 4 dispatched subagent phases).

## Your task

Invoke the `story-design` skill via the **Skill tool**, then follow its full procedure to design the story arc and write `narrator_scripts.json`. The skill describes archetypes, the 5 narrative fields, UI demo requirement, validation checklist, and the canonical JSON schema.

**If `Skill: story-design` returns "Unknown skill"**, the skill files are not registered in your sub-agent registry — fall back to reading them directly from disk. Detect skills root once:

```bash
SKILLS_ROOT=$(find "$HOME" -type d -name "story-design" -path "*/skills/*" 2>/dev/null | head -1 | xargs -I {} dirname {})
echo "SKILLS_ROOT=$SKILLS_ROOT"
```

Then `Read $SKILLS_ROOT/story-design/SKILL.md` + any `$SKILLS_ROOT/story-design/narrative-archetypes/<name>/overview.md` you need.

## Pipeline contract (this run's specifics)

- Your cwd is the project root. **NEVER** run `cd` as a standalone command. Use subshells.
- All output paths relative to cwd. Write `./narrator_scripts.json`.
- **Voice-over and BGM are OUT OF SCOPE for this pipeline.** Set realistic `estimatedDuration` per scene — that's the timing contract downstream agents use. Do **NOT** include `voicePath` or `voiceDuration` fields anywhere.
- Inputs ready (from Phase 1 — web-extraction):
  - `extraction/report.json` (one-shot index)
  - `extraction/shared/tokens.json` (brand colors, fonts)
  - `extraction/pages/<page>/sections.json` (per-page content)
  - `extraction/pages/<page>/tokens.json` (per-page accents)
  - `extraction/screenshots/` (reference visuals)

## When done — report

- Narrative archetype chosen
- Scene count
- Total estimated duration (sum of `estimatedDuration`)
- One-line summary of each scene (sceneNumber + sceneName + 8-word gist)

Then append to `./context.log`:

```
## Phase 2: story-design [done <ISO timestamp>]
Archetype: <name>
Scenes: <count>, total ~<duration>
```
