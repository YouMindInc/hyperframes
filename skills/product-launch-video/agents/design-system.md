# Subagent Prompt: design-system (Phase 1b)

**INPUT:** Phase 1 `<PROJECT_DIR>/capture/` artifacts (`extracted/` + `assets/` written by `hyperframes capture`)
**OUTPUT:** `<PROJECT_DIR>/design-system/design.html` + `<PROJECT_DIR>/design-system/chunks/` + `<PROJECT_DIR>/design-system/inference.json`
**TOOLS:** Bash · Read
**DONE:** `chunks/` are in place; report includes a `preset review:` block + two stdout sections

**Path contract:** Dispatch provides `PROJECT_DIR` (the video project root, e.g. `./videos/heygen-promo`). Write all output to `PROJECT_DIR/design-system/`; run Bash through a `(cd "$PROJECT_DIR" && <guide.md command>)` subshell; do not create a `hyperframes/` subdirectory under `PROJECT_DIR`. **Do not call designlang anymore** — `build-design.mjs` reads the `capture/extracted/` output already written by Phase 1 directly.

Follow the command templates in `<SKILL_DIR>/phases/design-system/guide.md` §1 step by step.

## Flow

1. **Step 1:** **Prefer the dispatch `## Inference decision inputs` section (or the inline `inference.json` body)** to choose the preset. The Phase 1 capture stage already deterministically ran `build-design.mjs --no-emit` to generate `inference.json`, so **you do not need to run it again**, and normally you **do not need to Read it again** either (the orchestrator already inlined it into the dispatch). Only Read `<PROJECT_DIR>/design-system/inference.json` / run `build-design.mjs ./design-system --no-emit` yourself if the dispatch does not contain the inline data, `inference.json` is missing, or you need to revalidate candidates after capability auto-install. (Note: this step only skips the Read of `inference.json`; you still need to Read `guide.md` for the §1 command template / §3b screenshot workflow / §4 report template / §5 hard contracts.)
2. **Step 2:** Choose the selected preset according to the decision table in `guide.md` §3. When choosing among `capability_gated` options, if `auto_install` is non-null, run it inside `PROJECT_DIR`, then rerun `--no-emit` to validate; if `auto_install: null`, choose another preset. When `brand.needs_review=true`, inspect screenshots and sample/crop the brand color according to §3b.
3. **Step 3:** Run `build-design.mjs --style <chosen> [--brand-primary <hex>]` with the chosen preset.
4. **Step 4:** Run `emit-chunks.mjs`.

## Self-Check

After `emit-chunks` exits 0, use a one-line `node -e` check to verify that `chunks/index.json` contains `preset` / `tokens_file` / `easings_file` / `voice_file` / `components[]`. Failure → investigate the comment anchors in `build-design.mjs`; do not modify `emit-chunks`.

## Report

Use the template from `guide.md` §4.
