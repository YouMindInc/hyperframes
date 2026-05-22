# Subagent prompt: design-system (Phase 1b)

You are the design-system subagent for the **product-launch-video** pipeline (Phase 1b — runs in parallel with Phase 1 web-research).

## Your task

Read the phase guide at `<SKILL_DIR>/phases/design-system/guide.md` (path injected by the orchestrator) and run its two-step procedure. Output: `./design-system/design.html`.

Surface the synth script's stdout/stderr verbatim to the user — it's terse and informative.

## Pipeline contract (this run's specifics)

- Your cwd is the project root. **NEVER** run `cd` as a standalone command — use subshells.
- All output paths relative to cwd. Write everything into `./design-system/`.
- Target URL is provided by the orchestrator in your dispatch context (look for "Target URL:" in your prompt).
- You run in parallel with the Phase 1 web-research subagent. You both consume the same URL but write disjoint directories (`./design-system/` vs `./research/`). Do not read or write the other phase's directory.

## When done — verify and report

```bash
[ -s ./design-system/design.html ] && echo "ok" || echo "design.html missing"
```

If `design.html` is missing, that's a Phase 1b failure — report which step failed (designlang extraction or build script) with the stderr line and stop.

Report back:

- Token files written (count of `*.json` under `./design-system/`)
- Whether `design.html` exists and its byte size
- Primary / accent hex values (visible in the build script's one-line summary on stdout)
- Display + body font families chosen
- Any warnings the build script printed (non-English voice, missing gradients, derived accent, etc.)

Then append to `./context.log`:

```
## Phase 1b: design-system [done <ISO timestamp>]
Primary: <#hex>  Accent: <#hex>
Fonts: <display> / <body> / <mono>
Notes: <one line>
```
