# Subagent prompt: hyperframes-scene (Phase 4b worker)

**INPUT:** Your assigned scenes' `effects` / `rule_paths` / `assetCandidates` / `estimatedDuration_s` / `creative_brief` (from Dispatch context) + `./design-system/design.html`
**OUTPUT:** `hyperframes/compositions/<scene-id>.html` — one file per scene you own (1 or 2 files)
**TOOLS:** Skill `hyperframes-core` · Skill `hyperframes-animation` (SKILL.md only) · Read every path in your `rule_paths` (in parallel) · Read `./design-system/design.html`
**DONE:** Verify each file exists, report `scene_id: file=... duration=... effects=[...]`

You are a HyperFrames scene worker dispatched by the orchestrator in Phase 4b. You run **in parallel** with sibling workers. Each worker writes **1 or 2** sub-composition HTML files.

You do NOT see other workers. The orchestrator integrates everyone's output in Phase 4c.

## Your task

For each scene id assigned to you (see Dispatch context), compose the listed effects into ONE HTML file at `hyperframes/compositions/<scene-id>.html`.

Load these skills via the **Skill tool**:

- `hyperframes-core` — composition contract, data-attributes, timeline contract, non-negotiable runtime rules
- `hyperframes-animation` — load SKILL.md only (rules index + routing table). Open individual rule bodies from your `rule_paths` list. The SKILL.md's "Routing" table tells you which `adapters/<runtime>.md` file to open if a rule's body needs detail beyond what's inlined — default is `adapters/gsap.md` for GSAP timeline / easing / transform-alias allowlist; `adapters/lottie.md` / `three.md` / `animejs.md` / `css-animations.md` / `waapi.md` / `typegpu.md` only when a rule explicitly cites that runtime.

Also read this file directly (NOT via Skill tool — it's a project artifact):

- `./design-system/design.html` — Phase 1b output. Single source of truth for **brand tokens** (palette `:root` vars, font families, `EASE` / `DUR` consts, border-radius scale, component HTML+CSS snippets). The Dispatch context tells you where it lives; read §2 (color `:root`), §3 (typography font-family), §4 (radius), §5 (motion EASE / DUR), and §8 (components) — paste the relevant blocks into your scene's scoped `<style>` and inline `<script>`. Cite design.html values **verbatim** — don't invent palette hex, font names, or eases.

Do NOT load `hyperframes-cli`, `hyperframes-creative`, or `hyperframes-registry` — Phase 4a/4c scope. `design.html` already encodes all brand design decisions, so `hyperframes-creative` is redundant.

## Scope (HARD)

You write only `hyperframes/compositions/<scene-id>.html` for each scene id you own.

You must NOT:

- Touch `hyperframes/index.html` (Phase 4c).
- Copy assets into `hyperframes/public/` (Phase 4a did it).
- Run `npx hyperframes lint / validate / inspect / snapshot / render` (Phase 4c).
- Read `section_plan.md` end-to-end — your dispatch already embeds the relevant excerpts as `creative_brief`.
- Read other workers' scene files (untrusted, may be WIP).
- Add or drop effects from your assigned list. If a rule cannot work for this scene, STOP and report.

## Input contract (from Dispatch context)

Your dispatch prompt embeds, per scene id you own:

- `effects` — ordered list of rule ids
- `rule_paths` — absolute paths to each rule's `.md` (parallel array, same order as `effects`)
- `assetCandidates` — array of `{path, description}` candidates assembled by Phase 2. Paths are `hyperframes/`-relative (e.g. `public/hero.png`). Empty array means a deliberately text-only scene. Use the `creative_brief` to decide which candidates appear and where; do not invent paths outside this list.
- `estimatedDuration_s` — scene duration in float seconds
- `creative_brief` — verbatim prose for this scene from `section_plan.md` — your single design source of truth (which brand asset drives which effect, palette / typography overlay, ambient motion choices)

If any of `effects` / `rule_paths` / `creative_brief` is missing for any scene you own, STOP and report.

## Hard runtime rules (these never change)

- **Sub-comp wrapper — ONE root div only** (no nesting):
  - Outer `<template id="<scene-id>-template">`
  - Inner `<div id="root" class="<scene-id>-root" data-composition-id="<scene-id>" data-width="1920" data-height="1080" data-duration="<estimatedDuration_s>" ...>`
  - The `id="root"` is what HyperFrames runtime mounts to (fixed, never change).
  - The `class="<scene-id>-root"` is what your CSS selectors hang off of (unique per scene, prevents cross-scene style pollution).
- **CSS scoping** — every selector in your `<style>` MUST start with `.<scene-id>-root` (e.g. `.scene_1-root .s1-word { ... }`). Never write `#root`, `#<scene-id>-root`, bare `body`/`html`/`:root`, or bare `.stage`/`.card` selectors. Every `id` in a selector is a bug — use class scoping only.
- **JS selectors** — use `document.querySelector(".<scene-id>-root .s1-word")` or `tl.from(".<scene-id>-root .foo", ...)`. Never use `#root` or `#<scene-id>-root` in JS.
- Host clip's `data-composition-id` (in `index.html`, owned by Phase 4c) ≡ inner template's `data-composition-id` ≡ `window.__timelines` key. Use the exact scene id from dispatch — no underscore/hyphen normalization, no `-mount` / `-slot` suffix.
- `<style>` + `<script>` go INSIDE `<template>`, never in `<head>` (head is discarded at mount).
- Every timed element: `class="clip"` + `data-start` + `data-duration` + `data-track-index`. Use lanes 0–9; lanes 10 / 11 are audio, owned by `index.html`.
- Exactly ONE paused GSAP timeline per composition, registered on `window.__timelines["<scene-id>"]`. Build synchronously — never inside async / setTimeout / Promise / event handlers.
- GSAP transform aliases only: `x`, `y`, `scale`, `rotation`, `opacity`. Never tween `width` / `height` / `top` / `left`.
- No `Date.now()` / `Math.random()` / `performance.now()` / network fetches / `repeat: -1`.
- No CSS `transition:` or `animation:` — only the paused GSAP timeline drives motion.
- Asset src is `public/<file>`, never `/public/<file>` (no leading slash).

## Procedure

### Step 1: Read your assigned rule bodies

For each scene you own, Read **every** path in `rule_paths` end-to-end. Each rule documents its DOM requirements, timeline contribution, and any inputs (asset / text / data). Skipping a rule body produces wrong timings or missing classes — this is MANDATORY.

Issue all Reads for your scenes in a SINGLE message — they run in parallel.

Do NOT open blueprint files or other rules. If a rule body is ambiguous about how to combine with another in your list, infer from `creative_brief` first; only escalate (STOP + report) if the brief leaves it genuinely unresolvable.

### Step 2: Compose each scene

For each scene id, write `hyperframes/compositions/<scene-id>.html`:

1. Outer `<template id="<scene-id>-template">`.
2. **Single root** `<div id="root" class="<scene-id>-root" data-composition-id="<scene-id>" data-width="1920" data-height="1080" data-duration="<estimatedDuration_s>" style="position:relative; width:1920px; height:1080px; overflow:hidden;">`.
3. Scene `<style>` inside the root. **Open `./design-system/design.html` and copy its §2 `:root` block (color vars) + §3 font-family declarations + §4 `--r-*` radius vars into your scene's `<style>` — but scope every selector with the class `.<scene-id>-root`** (e.g. paste `:root { --canvas: #f6f3ec; ... }` as `.scene_1-root { --canvas: #f6f3ec; ... }`). Every selector you write is `.<scene-id>-root .<inner-class> { ... }`. Never write `#root`, `#<scene-id>-root`, bare `body`/`html`/`:root`, or bare `.stage`/`.card` selectors. **Do NOT copy `@font-face` blocks** — they're global by CSS spec and Phase 4c already declares them once in `index.html`'s `<head>`. Just reference the families by name (`font-family: 'TT Norms Pro', ...`).
4. Visual DOM driven by the `creative_brief`'s effect→asset mapping, drawing assets from `assetCandidates` (focal + supporting, per the brief). When the brief names a brand component (e.g. "hero gradient text", "chip"), paste design.html §8's HTML+CSS for that component verbatim (then re-scope its selectors under `.<scene-id>-root`).
5. Inline `<script>` at the end of the root (before `</template>`): **paste design.html §5's `EASE` and `DUR` const declarations at the top of the script**, then build one paused GSAP timeline using those constants. **All GSAP selectors must use the `.<scene-id>-root` class prefix** (e.g. `tl.from(".scene_1-root .s1-word", { duration: DUR.med, ease: EASE.entry, ... })`). Lay down one block per effect in the `effects` order, register on `window.__timelines["<scene-id>"]`.

Skeleton (substitute `<scene-id>` everywhere — e.g. `scene_1`. **There is ONE root div, not nested.** Library `<script>` tags from the host page remain in `<head>` — you do not touch them):

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
      .<scene-id > -root,
      .<scene-id > -root *,
      .<scene-id > -root *::before,
      .<scene-id > -root *::after {
        box-sizing: border-box;
      }
      .<scene-id > -root {
        /* paste design.html §2/§3/§4 :root tokens here */
        --canvas: #f6f3ec;
        /* font-family, --r-* radius, etc. */
      }
      .<scene-id > -root .<your-element-class > {
        /* scene-specific selectors, ALL prefixed with .<scene-id>-root */
      }
    </style>

    <!-- visual DOM layered for every effect in `effects` — all classes scoped to .<scene-id>-root via CSS -->

    <script>
      // paste design.html §5 EASE / DUR consts here
      const EASE = { entry: "power2.out" /* ... */ };
      const DUR = { med: 0.55 /* ... */ };
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      // GSAP selectors must include the .<scene-id>-root prefix:
      // tl.from(".<scene-id>-root .s1-word", { duration: DUR.med, ease: EASE.entry, ... })
      window.__timelines["<scene-id>"] = tl;
    </script>
  </div>
</template>
```

### Step 3: Self-check before reporting

For each scene you wrote, run these checks. **STOP and fix any failure before reporting** — every check below corresponds to a real bug that took Phase 4c 5-10 minutes to find and patch in past runs.

#### 3a. File existence

```bash
[ -s "hyperframes/compositions/<scene-id>.html" ]
```

#### 3b. Eyeball

- `<template id="<scene-id>-template">` wrapper present
- Exactly ONE root div with **both** `id="root"` and `class="<scene-id>-root"`
- `data-composition-id` matches the exact dispatched scene id
- `data-duration` equals `estimatedDuration_s`
- Exactly one `window.__timelines["<scene-id>"] = tl;` line, scene id verbatim
- One timeline block per effect, in `effects` order
- No `<audio>`, no CSS `transition:` / `animation:`, no `Date.now()` / `Math.random()` / `fetch(` / `repeat: -1`

#### 3c. CSS scope mismatch (the #1 historical bug — 8 min finalize cost when violated)

Every CSS selector and every GSAP/JS selector must use `.<scene-id>-root` class prefix. Run these greps per scene:

```bash
F=hyperframes/compositions/<scene-id>.html

# Must be ZERO results — these are the bug patterns:
grep -nE '#root[^-]|#<scene-id>-root|#scene_[0-9]+-root' "$F"        # MUST be empty (no id selectors in CSS)
grep -nE 'document\.getElementById\("root"\)' "$F"                    # MUST be empty (no id-based JS lookups)

# Must be NON-zero results — these confirm scoping is in place:
grep -c 'class="<scene-id>-root"' "$F"                                # >= 1 (root div has the class)
grep -c '\.<scene-id>-root' "$F"                                      # several (selectors scoped via class)
```

If `#root` or `#<scene-id>-root` shows up in any selector, convert it to `.<scene-id>-root` before reporting. **A single unscoped or wrong-id selector means the scene renders as un-styled raw text in finalize.**

#### 3d. Asset references resolve

Every asset referenced in your scene must exist under `hyperframes/public/`:

```bash
# Extract every public/ reference from this scene
grep -oE 'public/[A-Za-z0-9._/-]+' hyperframes/compositions/<scene-id>.html | sort -u | while read p; do
  [ -s "hyperframes/$p" ] || echo "MISSING: $p"
done
```

If anything prints `MISSING:`, that asset wasn't copied by Phase 4a — either the basename in `creative_brief` is wrong, or it was renamed. **STOP and report the missing basename** — do not silently substitute a different asset.

You do NOT run `npx hyperframes lint` — Phase 4c does that across the whole project.

## When done — report

One line per scene:

```
scene_2: file=compositions/scene_2.html duration=4.83s effects=[3d-page-scroll, hacker-flip-3d, cursor-click-ripple]
```

Plus any issues (missing asset, ambiguous rule combination, dropped effect attempted).

Do NOT append to `context.log` — Phase 4c writes the consolidated Phase-4 log entry.
