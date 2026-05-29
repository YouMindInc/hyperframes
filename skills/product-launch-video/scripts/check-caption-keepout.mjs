#!/usr/bin/env node
// check-caption-keepout.mjs — static gate for caption keep-out compliance.
//
// When captions are enabled (group_spec.captions_enabled === true), index.html's
// track-12 caption pill overlays the bottom ~17% of the 1080px canvas (y > 900).
// Foreground scene content placed there (chips / CTAs / hero text / stats / cards)
// gets visually covered by the karaoke pill at render time.
//
// The principle this script enforces:
//     For every absolutely-positioned FOREGROUND element, its rendered bottom
//     edge must end at y ≤ 900 (= 20px above the y=900 caption band edge).
//
// The same principle has multiple CSS shapes — this script catches the three
// statically detectable ones. For each rule with `position: absolute` and a
// non-decoration leaf selector, it computes the element's bottom-edge y and
// flags any rule where that y > 900:
//
//   (A) `bottom: <X>px` with X < 180
//         element bottom y = 1080 - X > 900
//   (B) `top: <X>px` with X >= 900
//         element top alone is already inside the caption band (any non-zero
//         height pushes it deeper)
//   (C) `top: <X>px` AND `height: <Y>px` with X + Y > 900
//         explicit top+height pair lets us compute element bottom exactly
//
// Patterns that depend on transforms / margins / runtime GSAP positioning
// are not statically detectable here — they fall through to the finalize
// agent's snapshot eye-check (covered by a fallback row in the finalize
// agent's "phenomenon → root cause" table).
//
// Decoration exemption: any selector whose leaf class/id name matches the
// DECORATION_NAME_RX list (bg / dot-grid / surface / corner-pin / star-burst
// / ambient / glow / frame / etc.) is allowed in the caption band — those
// are full-bleed background or decorative layers, not foreground content.
// Pseudo-elements (`::before` / `::after` / etc.) are always exempt.
//
// Each violation carries the EXACT `edit_old` / `edit_new` strings that the
// finalize agent feeds into the Edit tool. No Read, no math, no search by
// the agent — the brief tells it exactly which file, which substring to
// replace, and what to replace it with. Worst case: 1 Edit call per
// violation.
//
// CLI usage (standalone):
//   node check-caption-keepout.mjs --group-spec ./group_spec.json --hyperframes . [--json]
//
// ESM import (used by preflight-finalize.mjs):
//   import { checkCaptionKeepout } from "./check-caption-keepout.mjs";
//   const result = checkCaptionKeepout({ groupSpec, hyperframesDir });
//
// Exit codes (CLI): 0 = captions disabled or no violations, 1 = violations.

import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ---------- constants ----------
const CANVAS_HEIGHT_PX = 1080;
const CAPTION_BAND_TOP_Y = 900;       // foreground must end at or above this y
const FAIL_THRESHOLD_BOTTOM_PX = 180; // any `bottom:` strictly less than this is suspect
const SUGGESTED_MIN_BOTTOM_PX = 200;  // safe blanket — element bottom lands at y=880 (20px clearance)
// Geometry note: with `position: absolute; bottom: 200px;` the element's
// bottom edge is at y = 1080 − 200 = 880, which is 20px above the caption
// band edge at y=900. This works regardless of element height — the
// constraint is "where does the element END", not "where does it start".

// Decoration / background name patterns. Selectors whose LEAF class/id name
// matches any of these are skipped — they're allowed to extend full-bleed
// into the caption band (backgrounds, surface decorations, corner frames,
// ambient layers, decorative shapes, hidden measurement probes, etc.).
// Match against the leaf token after `.` or `#`, with `-` / `_` as token boundaries.
const DECORATION_NAME_RX = /(?:^|[-_])(?:bg|background|dot-?grid|mesh|gradient|swell|ambient|texture|noise|scanline|surface|overlay|halo|glow|frame|pin|corner-?pin|deco|star-?burst|burst|ring|stripe|rect|shadow|pulse|ripple|measure|probe|hidden|scrim|backdrop|veil|fog|grain)(?:[-_]|$)/i;

// CSS pseudo-elements: always allowed (inherently decoration).
const PSEUDO_RX = /::(?:before|after|backdrop|placeholder|selection|first-letter|first-line|marker)/i;

// ---------- main check (exported) ----------
export function checkCaptionKeepout({ groupSpec, hyperframesDir }) {
  const captionsEnabled = groupSpec?.captions_enabled === true;
  const baseResult = {
    enabled: captionsEnabled,
    canvas_height_px: CANVAS_HEIGHT_PX,
    caption_band_top_y: CAPTION_BAND_TOP_Y,
    fail_threshold_bottom_px: FAIL_THRESHOLD_BOTTOM_PX,
    suggested_min_bottom_px: SUGGESTED_MIN_BOTTOM_PX,
    scenes_scanned: 0,
    violations: [],
  };
  if (!captionsEnabled) return baseResult;

  const groups = Array.isArray(groupSpec.groups) ? groupSpec.groups : [];
  const sceneIds = [];
  for (const g of groups) {
    if (Array.isArray(g.scene_ids)) sceneIds.push(...g.scene_ids);
  }

  let scannedCount = 0;
  const violations = [];

  for (const sid of sceneIds) {
    const file = join(hyperframesDir, "compositions", `${sid}.html`);
    if (!existsSync(file)) continue;
    scannedCount++;
    const html = readFileSync(file, "utf8");
    const found = scanSceneHtml(html, sid);
    for (const v of found) {
      v.file = `compositions/${sid}.html`;
      violations.push(v);
    }
  }

  return { ...baseResult, scenes_scanned: scannedCount, violations };
}

// ---------- per-scene scanner ----------
function scanSceneHtml(html, sceneId) {
  // 1. Concatenate all <style> contents, strip /* ... */ comments.
  const styleBlocks = [];
  const styleRx = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let sm;
  while ((sm = styleRx.exec(html)) !== null) styleBlocks.push(sm[1]);
  if (styleBlocks.length === 0) return [];
  const css = styleBlocks.join("\n").replace(/\/\*[\s\S]*?\*\//g, "");

  // 2. Walk top-level CSS rules `selector { body }` (no nesting). Body must
  //    not contain braces — rules out @media / @keyframes / nested-rules.
  const ruleRx = /([^{}]+)\{([^{}]*)\}/g;
  const violations = [];
  let m;
  while ((m = ruleRx.exec(css)) !== null) {
    const selectorBlock = m[1].trim();
    if (!selectorBlock || selectorBlock.startsWith("@")) continue;
    const body = m[2];

    // 3. Must be absolutely positioned.
    if (!/(?:^|[;\s{])position\s*:\s*absolute\b/i.test(body)) continue;

    // 4. Detect which CSS shape (if any) puts the element bottom into y > 900.
    //    Three independently-detectable patterns; a single rule can hit more
    //    than one (e.g. both `bottom:` AND `top:` — common for stretched bands).
    //
    //    Property regex anchors at start-of-property to avoid matching
    //    `border-bottom`, `margin-bottom`, `padding-bottom`, `border-top`, etc.
    const propPx = (name) => {
      const m = body.match(new RegExp(`(?:^|[;{\\s])${name}\\s*:\\s*(-?\\d+(?:\\.\\d+)?)px\\s*;`, "i"));
      return m ? { raw: m[1], val: parseFloat(m[1]) } : null;
    };
    const bottom = propPx("bottom");
    const top = propPx("top");
    const height = propPx("height");

    // Pattern A: `bottom: <X>px` with X < 180  →  element bottom y > 900.
    const hitsA = bottom && Number.isFinite(bottom.val) && bottom.val < FAIL_THRESHOLD_BOTTOM_PX;
    // Pattern B: `top: <X>px` with X >= 900    →  element top inside caption band.
    const hitsB = top && Number.isFinite(top.val) && top.val >= CAPTION_BAND_TOP_Y;
    // Pattern C: `top + height` with sum > 900 →  element bottom inside caption band.
    //    (Skipped when pattern A is already hitting on the same rule — we don't
    //    want to double-fire on `top: 80; bottom: 120; height: ignored`.)
    const hitsC = !hitsA && top && height &&
      Number.isFinite(top.val) && Number.isFinite(height.val) &&
      (top.val + height.val) > CAPTION_BAND_TOP_Y;

    if (!hitsA && !hitsB && !hitsC) continue;

    // 5. Split comma-separated selectors. Check each leaf independently.
    const selectors = selectorBlock.split(/,(?![^()]*\))/g)
      .map(s => s.trim()).filter(Boolean);

    for (const sel of selectors) {
      if (PSEUDO_RX.test(sel)) continue;
      const nameMatches = [...sel.matchAll(/[#.]([\w-]+)/g)];
      if (nameMatches.length === 0) continue;
      const leaf = nameMatches[nameMatches.length - 1][1];
      if (DECORATION_NAME_RX.test(leaf)) continue;

      // Pick the most reliable pattern to report (prefer A > C > B because A/C
      // pin the element bottom y exactly, B only the top y).
      let pattern, oldStr, newStr, elementBottomY, overlapPx, principle;
      if (hitsA) {
        pattern = "bottom-too-small";
        elementBottomY = CANVAS_HEIGHT_PX - bottom.val;
        overlapPx = elementBottomY - CAPTION_BAND_TOP_Y;
        oldStr = `bottom: ${bottom.raw}px;`;
        newStr = `bottom: ${SUGGESTED_MIN_BOTTOM_PX}px;`;
        principle = `1080 - bottom = ${elementBottomY} > 900 (caption band starts at y=900)`;
      } else if (hitsC) {
        pattern = "top-plus-height-too-tall";
        elementBottomY = top.val + height.val;
        overlapPx = elementBottomY - CAPTION_BAND_TOP_Y;
        // Suggested fix: shrink height to land bottom at y=CAPTION_BAND_TOP_Y-20=880.
        const suggestedHeight = Math.max(0, (CAPTION_BAND_TOP_Y - 20) - top.val);
        oldStr = `height: ${height.raw}px;`;
        newStr = `height: ${suggestedHeight}px;`;
        principle = `top(${top.val}) + height(${height.val}) = ${elementBottomY} > 900`;
      } else {
        // hitsB
        pattern = "top-in-caption-band";
        elementBottomY = top.val; // we only know top — bottom is at least this
        overlapPx = elementBottomY - CAPTION_BAND_TOP_Y;
        // Suggested fix: move element up so top lands at y=820 (=900-80, leaves room for ≤80px element).
        const suggestedTop = Math.max(0, CAPTION_BAND_TOP_Y - 80);
        oldStr = `top: ${top.raw}px;`;
        newStr = `top: ${suggestedTop}px;`;
        principle = `top(${top.val}) >= 900 (element top already in caption band)`;
      }

      const oldUniqueInFile = countOccurrences(html, oldStr) === 1;

      violations.push({
        scene_id: sceneId,
        selector: sel,
        leaf_name: leaf,
        pattern,
        principle,
        element_bottom_y: elementBottomY,
        overlap_into_caption_band_px: overlapPx,
        current_bottom_px: hitsA ? bottom.val : null,
        current_top_px: top ? top.val : null,
        current_height_px: height ? height.val : null,
        suggested_min_bottom_px: SUGGESTED_MIN_BOTTOM_PX, // for context only
        edit_old: oldStr,
        edit_new: newStr,
        edit_old_is_unique: oldUniqueInFile,
        instruction:
          `Edit compositions/${sceneId}.html: in the \`${sel}\` rule ` +
          `(it has \`position: absolute\`), replace \`${oldStr}\` with \`${newStr}\`. ` +
          (oldUniqueInFile
            ? `(The string \`${oldStr}\` is unique in this file — single Edit call with no extra context needed.)`
            : `(The string \`${oldStr}\` appears multiple times in this file — wrap your Edit's old_string with the line above it for uniqueness, e.g. include the line \`.${leaf} {\` or one of the adjacent property lines.)`) +
          ` Principle: ${principle} (caption band starts at y=${CAPTION_BAND_TOP_Y}, foreground element bottom must be ≤ y=${CAPTION_BAND_TOP_Y - 20} with 20px clearance).`,
      });
    }
  }
  return violations;
}

function countOccurrences(haystack, needle) {
  if (!needle) return 0;
  let n = 0, i = 0;
  while ((i = haystack.indexOf(needle, i)) !== -1) { n++; i += needle.length; }
  return n;
}

// ---------- CLI ----------
function runCli() {
  const argv = process.argv.slice(2);
  const flag = (n, d) => {
    const i = argv.indexOf(`--${n}`);
    return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d;
  };
  const groupSpecPath = resolve(flag("group-spec", "./group_spec.json"));
  const hyperframesDir = resolve(flag("hyperframes", "."));
  const asJson = argv.includes("--json");

  if (!existsSync(groupSpecPath)) {
    console.error(`✗ check-caption-keepout: group_spec.json missing at ${groupSpecPath}`);
    process.exit(2);
  }
  const groupSpec = JSON.parse(readFileSync(groupSpecPath, "utf8"));
  const result = checkCaptionKeepout({ groupSpec, hyperframesDir });

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.violations.length === 0 ? 0 : 1);
  }

  if (!result.enabled) {
    console.log("✓ caption-keepout: captions_enabled=false, no check needed");
    process.exit(0);
  }
  if (result.violations.length === 0) {
    console.log(`✓ caption-keepout: ${result.scenes_scanned} scene(s) scanned, all foreground absolute-positioned elements end at or above y=${CAPTION_BAND_TOP_Y}`);
    process.exit(0);
  }
  const sceneCount = new Set(result.violations.map(v => v.scene_id)).size;
  console.error(`✗ caption-keepout: ${result.violations.length} violation(s) across ${sceneCount} scene(s) (caption band starts at y=${CAPTION_BAND_TOP_Y})`);
  for (const v of result.violations) {
    console.error(`\n  [${v.scene_id}] ${v.selector}  (pattern: ${v.pattern})`);
    console.error(`    ${v.principle} → element bottom at y=${v.element_bottom_y} (${v.overlap_into_caption_band_px}px inside caption band)`);
    console.error(`    fix: replace \`${v.edit_old}\` → \`${v.edit_new}\` in ${v.file} ${v.edit_old_is_unique ? "(old string unique — Edit safely)" : "(old string non-unique — wrap with selector line)"}`);
  }
  console.error(`\n  → finalize_brief.json.caption_keepout.violations carries identical findings + Edit-ready strings. Finalize agent patches in-place with N Edit calls, no Read/search needed.`);
  process.exit(1);
}

// Run CLI when invoked directly (not when imported).
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  runCli();
}
