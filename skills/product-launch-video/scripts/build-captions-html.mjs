#!/usr/bin/env node
// Phase 4a.5 (engine) — deterministic caption-HTML builder. No subagent.
//
// Replaces the old captions LLM agent (agents/captions.md, now deleted). Turns
// the deterministic word data from build-captions.mjs into a brand-strict,
// render-ready caption sub-composition WITHOUT any LLM judgment — killing the
// whole class of agent-authored render-time footguns the old guide §6/§7 warned
// about (Illegal-invocation, timeline-not-registered, naked-color brand leaks,
// two-groups-visible, fitText-return-ignored).
//
// Pipeline position:
//   build-captions.mjs  → caption_groups.json   (clean/group/global-time/class)
//   build-captions-html.mjs (THIS)  → compositions/captions.html   (skin + brand)
//   assemble-index.mjs  → mounts it as the track-12 clip IF the file exists
//
// What it does:
//   1. SKIP gates (parity with build-captions.mjs / old agent): exit 0 with a
//      "captions: skipped (<reason>)" line so finalize simply omits track-12.
//   2. SCORE + pick one of the SUPPORTED registry skins from inference.json
//      (deterministic rubric; --skin forces; --no-emit reports without building).
//   3. INSTALL the skin (`npx hyperframes add caption-<skin>`, or --skin-file
//      for offline/CI), then TRANSFORM it via a per-skin descriptor:
//        - replace the placeholder transcript with caption_groups words
//        - feed the engine's pre-computed groups (scene-aware, non-overlapping)
//          so the skin never re-groups scene-blind  [fixes blocker B5]
//        - rewrite `var DURATION = 8` → total_duration_s  [fixes blocker B1:
//          the 8s placeholder clamps every word past 8s on a 60-90s video]
//        - rename host data-composition-id AND window.__timelines key → "captions"
//          (both must match: compositionScoping only remaps the timeline write
//          when the key === the inner root's data-composition-id)
//        - inline tokens.css + tokenize every hardcoded color/font to var(--*)
//          / color-mix(...) so the file is brand-strict
//        - convert the karaoke color tween to an .is-active CLASS flip so the
//          active/inactive colors live in CSS tokens (gsap can't interpolate
//          var() colors)  [keeps brand-strict + readable on any brand theme,
//          addressing blocker B6 structurally: pill bg = var(--canvas), active
//          text = var(--ink) → always contrast, no render-time probe needed]
//        - add a full-span timeline anchor so the sub-comp timeline duration
//          spans the whole video
//   4. NODE structural self-lint (replaces the old browser self-lint; check-
//      compositions.mjs does NOT scan captions.html, so this is the sole gate).
//
// SUPPORTED SKINS:
//   - caption-pill-karaoke — own opaque pill (no scrim needed), canonical
//     .caption-group/.caption-word classes, a runtime makeGroups we bypass,
//     lower-third position, CSS-only colors. The safe default.
//   - caption-highlight — TikTok-style per-word background sweep. Audited in
//     behind its own transform: it ships NON-canonical .hl-group/.hl-word
//     classes (we add the canonical ones alongside), an INDEX-PINNED RAW_GROUPS
//     map keyed to the demo transcript (we replace it with the engine's
//     scene-aware groups), and a TRANSPARENT layer (we tokenize its full-screen
//     .hl-overlay into a brand-strict lower-third scrim band so text stays
//     readable over any scene). CSS-only colors → tokenizable; bottom-anchored.
// The remaining registry caption-* skins still need per-skin work (JS-computed
// colors, mid-canvas position, line-only animation with no word class) and are
// added one at a time behind their own descriptor — see phases/captions/guide.md.
//
// Usage:
//   node build-captions-html.mjs --hyperframes . --groups ./caption_groups.json \
//        --tokens design-system/chunks/tokens.css \
//        [--inference design-system/inference.json] \
//        [--out compositions/captions.html] \
//        [--skin caption-pill-karaoke] [--skin-file <path>] [--no-emit]
//
// Exit 0 = compositions/captions.html written, OR a documented SKIP.
// Exit 1 = structural failure (bad JSON, skin handle drift, self-lint failure).

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";

// ---------- argv ----------
const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : def;
};
const has = (name) => argv.includes(`--${name}`);

function die(msg) {
  console.error(`✗ build-captions-html.mjs: ${msg}`);
  process.exit(1);
}
function skip(reason) {
  // Skip is not an error: finalize decides track-12 by file existence, so a
  // missing captions.html simply means no caption layer.
  console.log(`captions: skipped (${reason})`);
  process.exit(0);
}

const hyperframesDir = resolve(flag("hyperframes", "."));
const groupsPath = resolve(flag("groups", "./caption_groups.json"));
const tokensPath = resolve(hyperframesDir, flag("tokens", "design-system/chunks/tokens.css"));
const inferencePath = resolve(hyperframesDir, flag("inference", "design-system/inference.json"));
const outPath = resolve(hyperframesDir, flag("out", "compositions/captions.html"));
const forcedSkin = flag("skin", null);
const skinFile = flag("skin-file", null);
const noEmit = has("no-emit");

// ---------- per-skin descriptor table ----------
// Each entry pins the exact handles for one registry skin so the transform leans
// on the genuinely-shared contract (paused gsap timeline → window.__timelines,
// GSAP via CDN, a single <video> placeholder, an inline transcript array) and
// asserts the per-skin deltas rather than discovering them. Adding a skin = one
// entry + (if it diverges) extending applyTransform. A registry drift that moves
// a handle fails loudly at build time, never silently blank captions.
const SKINS = {
  "caption-pill-karaoke": {
    supported: true,
    has_own_bg: true,
    componentFile: "compositions/components/caption-pill-karaoke.html",
    // vibe weights for scoreSkins (matched against inference signals)
    vibe: { neutral: 1, saas: 1, rounded: 1, friendly: 1 },
  },
  "caption-highlight": {
    supported: true,
    has_own_bg: false, // transparent → transform injects a brand-strict scrim band
    componentFile: "compositions/components/caption-highlight.html",
    // bold/energetic/social — wins auto-pick only on a "direct" voice tone or a
    // loud preset (see scoreSkins); otherwise pill-karaoke stays the safe default.
    vibe: { bold: 1, social: 1, energetic: 1 },
  },
  // Not yet supported — present so scoring/--skin can report a clear
  // "needs per-skin work" message instead of a generic failure:
  "caption-neon-accent": {
    supported: false,
    reason: "JS-computed hex glow colors can't be brand-tokenized",
  },
  "caption-emoji-pop": {
    supported: false,
    reason: "JS-computed colors + hardcoded English keyword/emoji map",
  },
  "caption-weight-shift": {
    supported: false,
    reason: "no .caption-word class (animates lines) — Studio detection gap",
  },
  "caption-clip-wipe": {
    supported: false,
    reason: ".wp-* classes + index-pinned RAW_GROUPS/KEYWORDS",
  },
  "caption-editorial-emphasis": {
    supported: false,
    reason: "mid-canvas (top:580px) — incompatible with lower-third band",
  },
};

// ---------- skip gates ----------
if (!existsSync(groupsPath)) skip("no caption groups");
if (!existsSync(tokensPath)) skip("no brand tokens");

let cg;
try {
  cg = JSON.parse(readFileSync(groupsPath, "utf8"));
} catch (e) {
  die(`caption_groups.json is not valid JSON: ${e.message}`);
}
const groups = Array.isArray(cg.groups) ? cg.groups : [];
if (groups.length === 0) skip("no caption groups");
const totalDuration = Number(cg.total_duration_s);
if (!isFinite(totalDuration) || totalDuration <= 0)
  die(`caption_groups.total_duration_s missing/invalid (${cg.total_duration_s})`);

const tokensCss = readFileSync(tokensPath, "utf8");

// ---------- transform helpers (assert-or-die) — shared by both skin sources ----------
function replaceOnce(html, find, replacement, label) {
  if (typeof find === "string") {
    const idx = html.indexOf(find);
    if (idx === -1)
      die(`transform "${label}": expected literal not found (registry skin drifted?)`);
    if (html.indexOf(find, idx + find.length) !== -1)
      die(`transform "${label}": literal appears more than once`);
    return html.slice(0, idx) + replacement + html.slice(idx + find.length);
  }
  // regex
  const matches = html.match(new RegExp(find.source, find.flags.replace("g", "") + "g"));
  if (!matches || matches.length === 0)
    die(`transform "${label}": pattern not found (registry skin drifted?)`);
  return html.replace(find, replacement);
}
function replaceAll(html, find, replacement, label) {
  if (!html.includes(find)) die(`transform "${label}": expected literal not found`);
  return html.split(find).join(replacement);
}

// Brand display family name for any canvas measureText() fit math (a CSS var() can't be
// a canvas font; the visible font still uses var(--font-display)). Shared by every skin.
const fdm = /--font-display:\s*'([^']+)'/.exec(tokensCss);
const brandDisplay = fdm ? fdm[1] : "Poppins";

// ---------- §0: preset-local caption skin (second source, preferred when present) ----------
// emit-chunks copies a preset's own caption-skin.html (style-presets/<preset>/caption-skin.html)
// into chunks/ for the chosen preset, so its presence beside tokens.css here means "this preset
// ships its own caption look". It is authored pre-baked + brand-token-strict against the canonical
// contract (data-composition-id=captions, .caption-group/.caption-word, var(--*) colors), so the
// transform is a GENERIC fill shared by every preset — no per-preset code. Precedence:
//   --skin <registry>  forces a registry skin · --no-preset-skin disables this ·
//   otherwise a present caption-skin.html wins over registry scoring.
const presetSkinPath = resolve(dirname(tokensPath), "caption-skin.html");
const usePresetSkin = !forcedSkin && !has("no-preset-skin") && existsSync(presetSkinPath);

function buildPresetSkin(src) {
  // Engine groups → the shape the skin's buildCaptions()/timeline consume; times are already
  // GLOBAL seconds + scene-aware / non-overlapping (build-captions.mjs), same as the pill path.
  const engineGroups = groups.map((g) => ({
    start: Number(g.start),
    end: Number(g.end),
    words: (g.words || []).map((w) => ({
      text: String(w.text),
      start: Number(w.start),
      end: Number(w.end),
    })),
  }));
  let h = src;
  h = replaceOnce(
    h,
    "var GROUPS = [];",
    `var GROUPS = ${JSON.stringify(engineGroups)};`,
    "preset engine groups",
  );
  h = replaceOnce(h, "var DURATION = 0;", `var DURATION = ${totalDuration};`, "preset DURATION");
  h = replaceOnce(
    h,
    'data-duration="0"',
    `data-duration="${totalDuration}"`,
    "preset host data-duration",
  );
  // optional: a skin that does canvas-measure fitting leaves an empty FONT_FAMILY to fill.
  if (h.includes('var FONT_FAMILY = "";')) {
    h = replaceOnce(
      h,
      'var FONT_FAMILY = "";',
      `var FONT_FAMILY = ${JSON.stringify(brandDisplay)};`,
      "preset FONT_FAMILY",
    );
  }
  h = replaceOnce(
    h,
    "<style data-brand-tokens></style>",
    `<style data-brand-tokens>\n${tokensCss.trim()}\n    </style>`,
    "preset brand tokens",
  );
  return h;
}

// ---------- §a: deterministic skin scoring ----------
let inference = null;
if (existsSync(inferencePath)) {
  try {
    inference = JSON.parse(readFileSync(inferencePath, "utf8"));
  } catch {
    inference = null; // optional input; ignore malformed
  }
}

// Loud/expressive presets (build-design.mjs names) — a site that picked one of
// these reads punchy enough that the TikTok-style highlight skin fits it.
const LOUD_PRESETS =
  /neo-brutalism|raw-grid|peoples-platform|8-bit-orbit|retro-zine|neo-grid-bold|stencil-tablet|scatterbrain/;

function scoreSkins() {
  // Deterministic rubric over the SUPPORTED skins, grounded in real
  // inference.json fields (site_dna.voice_tone, selected.name). pill-karaoke is
  // the safe floor (own opaque pill → readable on any scene with no scrim); the
  // bolder, transparent-scrim highlight only overtakes it on a clearly punchy
  // signal. Tie ALWAYS resolves to pill-karaoke (the guide §1 documented default)
  // → fully deterministic, no Date/random.
  const tone = inference?.site_dna?.voice_tone || null; // "direct" | "warm" | "neutral" | null
  const selected = inference?.selected?.name || "";
  const score = {
    "caption-pill-karaoke": 1 + (tone === "warm" || tone === "neutral" ? 1 : 0),
    "caption-highlight": (tone === "direct" ? 2 : 0) + (LOUD_PRESETS.test(selected) ? 1 : 0),
  };
  const ranked = Object.entries(SKINS)
    .filter(([, d]) => d.supported)
    .map(([id]) => ({ id, score: score[id] ?? 0 }));
  ranked.sort(
    (a, b) =>
      b.score - a.score ||
      (a.id === "caption-pill-karaoke" ? -1 : b.id === "caption-pill-karaoke" ? 1 : 0),
  );
  return ranked;
}

let ranked = null;
let winner;
if (usePresetSkin) {
  winner = "preset-skin"; // resolved from chunks/caption-skin.html (second source)
} else {
  ranked = scoreSkins();
  if (forcedSkin) {
    const d = SKINS[forcedSkin];
    if (!d) die(`unknown --skin "${forcedSkin}" — not a caption-* skin in the descriptor table`);
    if (!d.supported)
      die(
        `--skin "${forcedSkin}" not yet supported (${d.reason}). Phase 1 supports: caption-pill-karaoke`,
      );
    winner = forcedSkin;
  } else {
    winner = ranked[0]?.id || "caption-pill-karaoke";
  }
}

if (noEmit) {
  const scoresPath = resolve(hyperframesDir, "caption_skin_scores.json");
  writeFileSync(
    scoresPath,
    JSON.stringify(
      {
        winner,
        source: usePresetSkin ? "preset-local" : "registry",
        ranked,
        inference: !!inference,
      },
      null,
      2,
    ),
  );
  console.log(`✓ (--no-emit) ranked skins → ${scoresPath}`);
  console.log(`  winner: ${winner}${usePresetSkin ? " (preset-local caption-skin.html)" : ""}`);
  process.exit(0);
}

// ---------- §b+§c: resolve + transform the chosen skin ----------
let html;
if (usePresetSkin) {
  // Preset-local skin (second source): pre-baked + brand-token-strict, so the GENERIC
  // fill (groups + duration + tokens) is the whole transform — no per-skin/per-preset code.
  html = buildPresetSkin(readFileSync(presetSkinPath, "utf8"));
} else {
  // ---------- §b: install / load the registry skin ----------
  const desc = SKINS[winner];
  let skinHtml;
  if (skinFile) {
    const sf = resolve(skinFile);
    if (!existsSync(sf)) die(`--skin-file "${skinFile}" not found`);
    skinHtml = readFileSync(sf, "utf8");
  } else {
    // `hyperframes add` only copies the component file into the project; it never
    // edits index.html. Needs registry/network access — fails loudly if offline
    // (unlike the old LLM agent, this script cannot improvise; pass --skin-file
    // for offline/CI golden renders).
    try {
      execFileSync("npx", ["hyperframes", "add", winner, "--no-clipboard"], {
        cwd: hyperframesDir,
        stdio: "pipe",
      });
    } catch (e) {
      die(
        `\`npx hyperframes add ${winner}\` failed (offline? pass --skin-file <path>): ${e.message}`,
      );
    }
    const compAbs = resolve(hyperframesDir, desc.componentFile);
    if (!existsSync(compAbs)) die(`expected ${desc.componentFile} after add, but it is missing`);
    skinHtml = readFileSync(compAbs, "utf8");
  }

  // ---------- §c: transform the chosen registry skin ----------
  html = skinHtml;

  if (winner === "caption-pill-karaoke") {
    // ---------- §c1: transform pill-karaoke ----------
    // Engine groups → the shape the skin's buildCaptions()/timeline consume:
    // { start, end, words:[{text,start,end}] }. Times are already GLOBAL seconds and
    // scene-aware / non-overlapping (build-captions.mjs §3 + §8), so feeding them and
    // bypassing the skin's scene-blind makeGroups fixes B5 and the 8s word clamp (B1).
    const engineGroups = groups.map((g) => ({
      start: Number(g.start),
      end: Number(g.end),
      words: (g.words || []).map((w) => ({
        text: String(w.text),
        start: Number(w.start),
        end: Number(w.end),
      })),
    }));
    const groupsJson = JSON.stringify(engineGroups);

    // (1) strip Google Fonts <link> tags (brand @font-face is injected into index.html
    //     by assemble-index; the caption sub-comp is flattened into that document).
    {
      let removed = 0;
      html = html.replace(/\s*<link\b[^>]*?>/gi, (m) => {
        if (/fonts\.g(oogleapis|static)/i.test(m)) {
          removed++;
          return "";
        }
        return m;
      });
      if (removed === 0) die(`transform "strip google fonts": no font <link> found`);
    }

    // (2) strip the demo <video> placeholder element + its now-dead CSS rule.
    if (!/<video\b[^>]*id="avatar-video"/i.test(html))
      die(`transform "strip video": demo <video id=avatar-video> not found`);
    html = html.replace(/\s*<video\b[\s\S]*?<\/video>/i, "");
    html = html.replace(/\s*#avatar-video\s*\{[^}]*\}/i, "");

    // (3) host root: rename composition id + set real duration.
    html = replaceOnce(
      html,
      'data-composition-id="caption-pill-karaoke"',
      'data-composition-id="captions"',
      "host composition-id",
    );
    html = replaceOnce(
      html,
      'data-duration="8"',
      `data-duration="${totalDuration}"`,
      "host data-duration",
    );

    // (4) DURATION clamp [B1].
    html = replaceOnce(html, "var DURATION = 8;", `var DURATION = ${totalDuration};`, "DURATION");

    // (5) measurement font → brand display family.
    html = replaceOnce(
      html,
      'var FONT_FAMILY = "Poppins";',
      `var FONT_FAMILY = ${JSON.stringify(brandDisplay)};`,
      "FONT_FAMILY",
    );

    // (6) drop the JS color constants (hex → would trip brand-strict; karaoke now CSS-class driven).
    html = replaceOnce(
      html,
      '      var COLOR_INACTIVE = "#A6A6A6";\n      var COLOR_ACTIVE = "#1C1E1D";',
      "      // karaoke colors are CSS-token driven (.caption-word / .caption-word.is-active)",
      "color consts",
    );

    // (7) kill the placeholder transcript (its text must be gone for the self-lint).
    html = replaceOnce(
      html,
      /var TRANSCRIPT = \[[\s\S]*?\];/,
      "var TRANSCRIPT = [];",
      "TRANSCRIPT placeholder",
    );

    // (8) feed engine groups; bypass normalizeWords + scene-blind makeGroups [B1+B5].
    html = replaceOnce(
      html,
      "      var WORDS = normalizeWords(TRANSCRIPT);\n      var GROUPS = makeGroups(WORDS);",
      `      var GROUPS = ${groupsJson};`,
      "engine groups",
    );

    // (9) karaoke color tween → .is-active class flip (colors come from CSS tokens).
    html = replaceOnce(
      html,
      `        group.words.forEach(function (word, wordIndex) {
          var wordEl = document.getElementById("caption-word-" + groupIndex + "-" + wordIndex);
          var isFirstWord = wordIndex === 0;
          var wordStart = Math.max(visibleStart, word.start - WORD_FADE_LEAD);
          tl.set(wordEl, { color: isFirstWord ? COLOR_ACTIVE : COLOR_INACTIVE }, visibleStart);
          if (isFirstWord) return;
          tl.to(
            wordEl,
            { color: COLOR_ACTIVE, duration: COLOR_FADE_DURATION, ease: "none" },
            wordStart,
          );
        });`,
      `        group.words.forEach(function (word, wordIndex) {
          var wordEl = document.getElementById("caption-word-" + groupIndex + "-" + wordIndex);
          var isFirstWord = wordIndex === 0;
          var wordStart = Math.max(visibleStart, word.start - WORD_FADE_LEAD);
          tl.set(wordEl, { className: "caption-word" }, visibleStart);
          tl.set(wordEl, { className: "caption-word is-active" }, isFirstWord ? visibleStart : wordStart);
        });`,
      "karaoke class flip",
    );

    // (10) full-span timeline anchor + rename the registry key → "captions".
    html = replaceOnce(
      html,
      'window.__timelines["caption-pill-karaoke"] = tl;',
      'tl.to({}, { duration: DURATION }, 0);\n      window.__timelines["captions"] = tl;',
      "timeline key + anchor",
    );

    // (11) tokenize CSS colors/fonts → brand-strict.
    html = replaceAll(
      html,
      'font-family: "Poppins", Arial, sans-serif;',
      "font-family: var(--font-display), Arial, sans-serif;",
      "font-family token",
    );
    html = replaceOnce(html, "background: #e7e5e7;", "background: var(--canvas);", "pill bg token");
    html = replaceOnce(
      html,
      "box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);",
      "box-shadow: 0 2px 8px color-mix(in srgb, var(--ink) 14%, transparent);",
      "pill shadow token",
    );
    html = replaceAll(
      html,
      "color: #a6a6a6;",
      "color: color-mix(in srgb, var(--ink) 45%, var(--canvas));",
      "inactive color token",
    );

    // (11b) geometry/size → match vito's compact lower-third. pill-karaoke ships a
    // large 72px caption at bottom:100px (top edge ~y760), which (a) reads ~1.6x
    // bigger than vito's 44px pill and (b) sits ABOVE the reserved ~180px band
    // (y900-1080) the scene keep-out (#13) clears — so a scene filling to y900 could
    // still be overlapped. Shrink to ~46px and hug the lower edge (bottom 24px,
    // shorter box → pill bottom ~y1031) so caption geometry ≈ vito's bottom:4%.
    html = replaceOnce(
      html,
      "var BASE_FONT_SIZE = 72;",
      "var BASE_FONT_SIZE = 46;",
      "base font size",
    );
    html = replaceOnce(html, "var MIN_FONT_SIZE = 52;", "var MIN_FONT_SIZE = 34;", "min font size");
    html = replaceOnce(html, "font-size: 72px;", "font-size: 46px;", "copy font-size");
    html = replaceOnce(
      html,
      "bottom: 100px;",
      "bottom: 24px;",
      "safe-zone bottom (hug lower edge, ~vito bottom:4%)",
    );
    html = replaceAll(html, "height: 220px;", "height: 120px;", "safe-zone/group box height");

    // (12) inline tokens.css + the .is-active rule, before the skin's <style>.
    const headInject = `<style data-brand-tokens>
${tokensCss.trim()}
    </style>
    <style>
      /* karaoke active word — brand ink, set via .is-active class flip */
      .caption-word.is-active { color: var(--ink); }
    </style>
    <style>`;
    html = replaceOnce(html, "    <style>", `    ${headInject}`, "inline brand tokens");
  } else if (winner === "caption-highlight") {
    // ---------- §c2: transform caption-highlight ----------
    // highlight's build/timeline loops consume a FLAT global WORDS array + a GROUPS
    // list of {wordStart,wordEnd,start,end} index ranges (word el id = wordStart+i).
    // Rebuilding both from the engine's groups replaces (a) the demo TRANSCRIPT and
    // (b) the index-pinned RAW_GROUPS map keyed to it — so the skin renders real,
    // scene-aware, non-overlapping captions instead of its hardcoded placeholder.
    const flatWords = [];
    const hlGroups = [];
    for (const g of groups) {
      const wordStart = flatWords.length;
      for (const w of g.words || []) {
        flatWords.push({ text: String(w.text), start: Number(w.start), end: Number(w.end) });
      }
      const wordEnd = flatWords.length - 1;
      if (wordEnd < wordStart) continue; // defensive: skip an empty group
      hlGroups.push({ wordStart, wordEnd, start: Number(g.start), end: Number(g.end) });
    }
    const flatWordsJson = JSON.stringify(flatWords);
    const hlGroupsJson = JSON.stringify(hlGroups);

    // (1) strip Google Fonts <link> tags (brand @font-face comes from index.html).
    {
      let removed = 0;
      html = html.replace(/\s*<link\b[^>]*?>/gi, (m) => {
        if (/fonts\.g(oogleapis|static)/i.test(m)) {
          removed++;
          return "";
        }
        return m;
      });
      if (removed === 0) die(`transform "strip google fonts": no font <link> found`);
    }

    // (2) strip the dead #hl-video CSS rule (highlight ships no <video> element).
    html = replaceOnce(html, /\s*#hl-video\s*\{[^}]*\}/, "", "strip dead #hl-video rule");

    // (3) host root: rename composition id + set real duration.
    html = replaceOnce(
      html,
      'data-composition-id="caption-highlight"',
      'data-composition-id="captions"',
      "host composition-id",
    );
    html = replaceOnce(
      html,
      'data-duration="8"',
      `data-duration="${totalDuration}"`,
      "host data-duration",
    );

    // (4) measurement base size 80→46 + measure font → brand display family
    //     (canvas font can't be a CSS var(); the visible font uses var(--font-display)).
    html = replaceOnce(
      html,
      'fitFontSize(groupText, 80, "800", "Montserrat", 1620)',
      `fitFontSize(groupText, 46, "800", ${JSON.stringify(brandDisplay)}, 1620)`,
      "fit base size + measure font",
    );

    // (5) kill the placeholder transcript → engine flat words.
    html = replaceOnce(
      html,
      /var WORDS = \[[\s\S]*?\];/,
      `var WORDS = ${flatWordsJson};`,
      "WORDS placeholder",
    );

    // (6) drop the index-pinned RAW_GROUPS + its derived GROUPS map → engine groups
    //     (scene-aware, non-overlapping). Fixes the same class of blocker as clip-wipe.
    html = replaceOnce(
      html,
      /var RAW_GROUPS = \[[\s\S]*?\}\);/,
      `var GROUPS = ${hlGroupsJson};`,
      "engine groups",
    );

    // (7) add the canonical .caption-group/.caption-word classes alongside the skin's
    //     own (.hl-group/.hl-word) so Studio + captionOverrides can detect captions.
    html = replaceOnce(
      html,
      'grp.className = "hl-group";',
      'grp.className = "hl-group caption-group";',
      "group canonical class",
    );
    html = replaceOnce(
      html,
      'wordEl.className = "hl-word";',
      'wordEl.className = "hl-word caption-word";',
      "word canonical class",
    );

    // (8) full-span timeline anchor + rename the registry key → "captions".
    html = replaceOnce(
      html,
      'window.__timelines["caption-highlight"] = tl;',
      `tl.to({}, { duration: ${totalDuration} }, 0);\n        window.__timelines["captions"] = tl;`,
      "timeline key + anchor",
    );

    // (9) geometry → shrink into the lower-third keep-out band (~vito bottom band).
    //     80px uppercase at bottom:140px would top out ~y845, ABOVE the reserved
    //     ~180px band (y900-1080); 46px at bottom:36px keeps 1-2 lines inside it.
    html = replaceOnce(html, "font-size: 80px;", "font-size: 46px;", "word font-size");
    html = replaceOnce(html, "bottom: 140px;", "bottom: 36px;", "group bottom (hug lower edge)");

    // (10) tokenize CSS colors/fonts → brand-strict.
    html = replaceOnce(
      html,
      'font-family: "Montserrat", sans-serif;',
      "font-family: var(--font-display), sans-serif;",
      "font-family token",
    );
    html = replaceOnce(html, "color: #ffffff;", "color: var(--canvas);", "word color token");
    // ADAPTIVE CONTRAST: the active word sits on a var(--brand-primary) fill whose
    // lightness is unknown at build time, so NO single text color is safe on it
    // (canvas fails on a light primary, ink fails on a dark one). Give the glyphs a
    // crisp var(--ink) OUTLINE (8-way) so the canvas-filled text reads on any brand
    // fill — light or dark — plus a soft ink drop for depth. Legibility no longer
    // depends on the primary's luminance; it rides the guaranteed canvas↔ink pair.
    html = replaceOnce(
      html,
      "text-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);",
      "text-shadow: 2px 0 0 var(--ink), -2px 0 0 var(--ink), 0 2px 0 var(--ink), 0 -2px 0 var(--ink), 1.5px 1.5px 0 var(--ink), -1.5px 1.5px 0 var(--ink), 1.5px -1.5px 0 var(--ink), -1.5px -1.5px 0 var(--ink), 0 4px 12px color-mix(in srgb, var(--ink) 40%, transparent);",
      "ink-outline text (adaptive contrast on any brand fill)",
    );
    html = replaceOnce(
      html,
      "background: linear-gradient(135deg, #ff1745 0%, #df1238 100%);",
      "background: linear-gradient(135deg, var(--brand-primary) 0%, color-mix(in srgb, var(--brand-primary) 85%, var(--ink)) 100%);",
      "highlight bg token",
    );
    html = replaceOnce(
      html,
      "box-shadow: 0 12px 30px rgba(229, 20, 58, 0.32);",
      "box-shadow: 0 12px 30px color-mix(in srgb, var(--brand-primary) 32%, transparent);",
      "highlight shadow token",
    );

    // (11) scrim band — highlight is transparent, so its full-screen first-child
    //      .hl-overlay (z-index 1, below the words at z-index 10) becomes a
    //      brand-strict lower-third gradient so text reads over any scene (guide §3).
    html = replaceOnce(
      html,
      `      .hl-overlay {
        position: absolute;
        inset: 0;
        background: transparent;
        z-index: 1;
        pointer-events: none;
      }`,
      `      .hl-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to top,
          color-mix(in srgb, var(--ink) 82%, transparent) 0%,
          color-mix(in srgb, var(--ink) 55%, transparent) 12%,
          transparent 26%
        );
        z-index: 1;
        pointer-events: none;
      }`,
      "scrim band",
    );

    // (12) inline tokens.css before the skin's <style>.
    const headInject = `<style data-brand-tokens>
${tokensCss.trim()}
    </style>
    <style>`;
    html = replaceOnce(html, "    <style>", `    ${headInject}`, "inline brand tokens");
  } else {
    die(`internal: no transform implemented for ${winner}`);
  }
} // end else: registry-skin path (preset-local path handled above)

// ---------- §d: node structural self-lint ----------
function lint(cond, msg) {
  if (!cond) die(`self-lint: ${msg}`);
}
// common (every skin): canonical hooks, real duration, no leaks/footguns.
lint(html.includes('data-composition-id="captions"'), 'missing data-composition-id="captions"');
lint(html.includes('window.__timelines["captions"]'), 'missing window.__timelines["captions"]');
lint(/class="caption-group/.test(html) || html.includes("caption-group"), "missing .caption-group");
lint(html.includes("caption-word"), "missing .caption-word");
lint(!html.includes("Every great video starts"), "placeholder transcript text still present");
lint(!/fonts\.g(oogleapis|static)/i.test(html), "Google Fonts link still present");
lint(
  !/window\.(getComputedStyle|requestAnimationFrame|matchMedia)\(/.test(html),
  "render-time Illegal-invocation footgun (window.<native>())",
);
lint(
  html.includes(`data-duration="${totalDuration}"`),
  "host data-duration not rewritten to total",
);
// skin-specific structural gates.
if (winner === "caption-pill-karaoke") {
  lint(!/id="avatar-video"/.test(html), "demo <video> still present");
  lint(
    html.includes(`var DURATION = ${totalDuration};`),
    "DURATION not rewritten to total_duration_s",
  );
} else if (winner === "caption-highlight") {
  lint(!html.includes("var RAW_GROUPS"), "index-pinned RAW_GROUPS not replaced with engine groups");
  lint(!/<video\b/i.test(html), "unexpected <video> element");
  lint(
    html.includes(`tl.to({}, { duration: ${totalDuration} }, 0);`),
    "full-span timeline anchor missing",
  );
}
// brand-strict: strip the brand-token block, then no bare hex / rgb(a).
{
  const stripped = html.replace(/<style data-brand-tokens>[\s\S]*?<\/style>/g, "");
  const bareHex = stripped.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  const bareRgb = stripped.match(/\brgba?\(/g) || [];
  if (bareHex.length || bareRgb.length) {
    die(
      `self-lint: brand-strict violation (bare color outside token block): ${[...bareHex, ...bareRgb].slice(0, 6).join(", ")}`,
    );
  }
}

// ---------- write ----------
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, html);

// ---------- summary ----------
const wordCount = groups.reduce((n, g) => n + (g.words ? g.words.length : 0), 0);
const ownBg = usePresetSkin ? true : SKINS[winner]?.has_own_bg;
console.log(`✓ wrote ${outPath}`);
if (usePresetSkin) {
  console.log(`  skin:     ${winner} (preset-local → chunks/caption-skin.html)`);
} else {
  console.log(
    `  skin:     ${winner}${forcedSkin ? " (forced)" : ""}${skinFile ? " (from --skin-file)" : ""}`,
  );
}
console.log(`  groups:   ${groups.length}  words: ${wordCount}  duration: ${totalDuration}s`);
console.log(
  `  readability: ${ownBg ? "own opaque pill (no scrim needed)" : "brand-strict lower-third scrim band"}; colors brand-token driven`,
);
console.log(`  self-lint: OK`);
