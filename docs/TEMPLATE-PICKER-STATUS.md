# Template Picker — Current Status & Handoff

## What This Is

A visual design picker that lets users browse 34 HTML presentation templates, apply color palettes, typography, and other design tokens, then export a design.md. It replaces the original moodboard-based design picker with a template-first approach.

## Architecture

```
skills/hyperframes/
├── templates/
│   ├── design-picker.html          ← Main picker page (Phase 1 + Phase 2)
│   ├── template-picker.html        ← Phase 1: template grid (embedded in design-picker via iframe)
│   └── presentations/              ← 34 tokenized HTML templates (from beautiful-html-templates)
│       ├── 8-bit-orbit/
│       ├── biennale-yellow/
│       ├── studio/
│       └── ... (34 total)
├── scripts/
│   ├── build-template-picker.py    ← Generates template-picker.html with injected data
│   └── tokenize-templates.py       ← Converts templates to use --tp-* CSS variable contract
└── references/
    └── design-picker.md            ← Skill reference (updated with template-based flow docs)
```

## How It Works

### Data Flow

1. **Agent generates prompt-specific data** (palettes, text pools, prompt description)
2. **`build-template-picker.py`** reads template index, extracts CSS color vars and `preview_html` from each template, injects data into `template-picker.html`
3. **`design-picker.html`** embeds `template-picker.html` as Phase 1 iframe, has Phase 2 fine-tune controls
4. Served via `python3 -m http.server`

### Two Phases

- **Phase 1 (Template tab)**: Grid of 34 templates. Each shows first slide as inline HTML preview. Palette bar at top re-themes all templates live. Click a template → transition animation → Phase 2.
- **Phase 2 (Fine-tune tab)**: Selected template preview + config options (theme, palette, typography, corners, density, depth, easing, background shader) + design sections (palette swatches, type specimens, corner radius, elevation, motion).

### CSS Variable Contract (`--tp-*`)

All 34 templates have been tokenized with `tokenize-templates.py`. Each template's `:root` block now has:

```css
:root {
  --tp-bg: #E9E5DB;        /* background */
  --tp-fg: #1B2566;        /* foreground/text */
  --tp-ac: #F1EE2E;        /* accent */
  --tp-mt: #888888;        /* muted */
  --tp-surface: #E9E5DB;   /* card/panel bg */
  --tp-border: #1B2566;    /* borders */
  --tp-hf: "Archivo";      /* headline font */
  --tp-bf: "Instrument Serif"; /* body font */
  --tp-mf: "monospace";    /* mono font */
  --tp-bg-layer: none;     /* shader background slot */
}
```

Original template variables reference these tokens:
```css
--paper: var(--tp-bg, #E9E5DB);
--sun: var(--tp-ac, #F1EE2E);
--ink: var(--tp-fg, #1B2566);
```

Hardcoded hex values throughout the CSS were also replaced with `var(--tp-*)` references (1240 total replacements across 34 templates).

## What Works

- [x] Template grid with 34 templates rendering inline (extracted first-slide HTML)
- [x] Palette bar with mini type specimen chips
- [x] Contextual text injection (prompt-specific headlines, body, stats, labels replace template placeholder text)
- [x] Word-length matching (replacement text matches original word count)
- [x] Phase 1 → Phase 2 transition animation (fade to black, card lift, phase slide-in)
- [x] Phase 2 fine-tune panel with all config options (theme, palette, type, corners, density, depth, easing, background)
- [x] Phase 2 shows palette swatches, typography specimens, corner radius, elevation, motion sections
- [x] Back navigation (← Template tab returns to grid)
- [x] Template Default palette clears overrides, restoring original template colors
- [x] `--tp-*` CSS variable contract on all 34 templates
- [x] Name-aware color role detection (variables named "sun" map to accent, "paper" to bg, etc.)
- [x] Build script (`build-template-picker.py`) extracts preview_html with scoped CSS
- [x] Skill reference updated (`design-picker.md`) with full template-based flow documentation

## Known Bugs / Incomplete

### Critical — Must Fix

1. **Page won't scroll in Phase 1**. The `.phase` container has `overflow: auto` but the template-picker iframe with `position: absolute; inset: 0` creates a non-scrolling layer. The iframe content (template grid) scrolls internally but the parent page doesn't respond to scroll events. Need to either:
   - Remove the iframe and embed the picker content directly in the DOM
   - Or fix the iframe sizing so it doesn't need `position: absolute`

2. **Some template preview cards render as black rectangles**. The `extract_preview()` function in `build-template-picker.py` uses regex to find the first slide — works for most templates but fails silently for some (returns empty/minimal HTML). Templates with unusual structure (no `.slide` class, deck-stage only, complex nesting) may not extract correctly.

3. **Fine-tune palette/theme changes don't visually update the template preview**. The override code sets `--tp-*` variables on the inline template container via `style.setProperty()`, but the scoped CSS uses `.tp-{slug}` class prefix which may not inherit `:root` variables from the parent. The cascade path: `renderPreview()` → `querySelector("[class^='tp-']")` → `setProperty("--tp-bg", ...)` — this should work but hasn't been verified end-to-end since the inline rendering change.

4. **Background shader options have no effect on template preview**. The Three.js shader canvas renders in the design-picker page behind the scene grid. With iframe-based templates, the canvas was invisible behind the opaque iframe. With inline templates, it SHOULD show through if the template's background is transparent — but the templates still have opaque backgrounds. Need to:
   - Set `--tp-bg-layer` to control the background
   - Or make template background transparent when a shader is selected, letting the canvas show through

### Medium Priority

5. **Producer dist files fail format checks**. `packages/producer/dist/index.js` and `public-server.js` were modified somewhere and now fail `oxfmt --check`. These are build artifacts — should be in `.gitignore` or reset.

6. **Text injection doesn't work on all templates**. Templates using `<deck-stage>` with sections that don't have `.slide` class need the query `deck-stage > section, section[class]` to find text elements. Some templates still show original placeholder text.

7. **React app (`template-picker-app/`) exists but is incomplete**. Started a React rewrite, reverted to vanilla. The app scaffolding is in the repo at `skills/hyperframes/template-picker-app/` with working components but missing features. Should either complete or delete.

### Low Priority

8. **Component extraction below hero card** not implemented. User wants actual buttons, cards, headings, tags from the selected template displayed as a specimen sheet below the main preview. This requires parsing the template DOM to identify distinct component patterns — deferred.

9. **Motion templates (HyperFrames compositions)** partially built. Created restyled versions of launch video compositions (thesis × biennale-yellow, end card × biennale-yellow, save-time × bold-poster). The `<hyperframes-player>` integration for hover-to-play video cards works. Feature is disabled (empty `motion_templates` array) pending further design.

## How to Test

```bash
cd /Users/vanceingalls/src/wt/hyperframes/one

# Ensure templates have files (git checkout if empty)
ls skills/hyperframes/templates/presentations/8-bit-orbit/template.html || \
  (cd /tmp/beautiful-html-templates && git checkout -- templates/)

# Generate picker for a prompt
cat > /tmp/test-data.json << 'EOF'
{
  "palettes": [
    {"name":"Default", "bg":"__DEFAULT__"},
    {"name":"Brand Purple", "bg":"#0F0A1A", "fg":"#FFFFFF", "ac":"#7C3AED", "mt":"#9CA3AF"}
  ],
  "prompt_text": {
    "headline": "MYAPP",
    "sub": "Your Product Tagline",
    "taglines": {"bold":"BUILD SOMETHING","editorial":"The Future","playful":"Let's go.","dark":"SHIP IT.","technical":"FROM CODE TO PROD","warm":"Made With Care"},
    "headlines": ["Feature One","Feature Two"],
    "body": ["Description of the product."],
    "stats": ["10M+","99%"],
    "statLabels": ["Users","Uptime"],
    "labels": ["FEATURE","API"],
    "smalls": ["Try Free","Learn More"]
  },
  "prompt_desc": "Product launch video",
  "motion_templates": []
}
EOF

# Build picker
cat /tmp/test-data.json | python3 skills/hyperframes/scripts/build-template-picker.py \
  --template skills/hyperframes/templates/template-picker.html \
  --templates-dir skills/hyperframes/templates/presentations \
  --output /tmp/test-project/.hyperframes/template-picker.html

# Copy templates for serving
cp -r skills/hyperframes/templates/presentations /tmp/test-project/templates

# Generate pick-design.html (use Python — see previous session's generation script pattern)
# ... inject ARCHITECTURES/PALETTES/TYPEPAIRS/MOODBOARDS/PROMPT into design-picker.html template

# Serve
cd /tmp/test-project && python3 -m http.server 8724
# Open http://localhost:8724/.hyperframes/pick-design.html
```

## Key Files to Read

| File | Purpose |
|------|---------|
| `skills/hyperframes/templates/design-picker.html` | Main picker — Phase 1 iframe + Phase 2 fine-tune. Contains `handleTemplatePick()`, `applyOverrideToIframe()`, `renderPreview()`, shader background module. ~2700 lines. |
| `skills/hyperframes/templates/template-picker.html` | Template grid — palette bar, card rendering, text injection, transition animation. ~720 lines. Placeholders: `__PALETTES_JSON__`, `__PROMPT_TEXT_JSON__`, `__TEMPLATES_JSON__`, `__PROMPT_DESC__`. |
| `skills/hyperframes/scripts/build-template-picker.py` | Build script — reads template index, extracts CSS vars + preview HTML, injects data. |
| `skills/hyperframes/scripts/tokenize-templates.py` | Converts templates to `--tp-*` contract. Run once to tokenize; templates are already tokenized in repo. |
| `skills/hyperframes/references/design-picker.md` | Skill reference — includes "Alternative: Template-based picker" section with full flow docs. |

## Recommended Next Steps (Priority Order)

1. **Fix scrolling** — The #1 blocker. Either embed picker content directly (no iframe) or fix iframe height calculation.
2. **Verify end-to-end palette override** — After scroll fix, test that selecting a palette in Phase 2 actually changes the template preview's colors via `--tp-*` tokens.
3. **Fix blank template cards** — Improve `extract_preview()` regex to handle all 34 template structures.
4. **Wire shader backgrounds** — When a shader preset is selected, set the template's `--tp-bg` to `transparent` so the canvas shows through.
5. **Clean up** — Delete `template-picker-app/` React scaffold if not continuing that path. Fix producer dist format issues.
