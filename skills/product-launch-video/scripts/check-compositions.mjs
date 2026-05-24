#!/usr/bin/env node
// check-compositions.mjs — pre-finalize harness
//
// Runs before Phase 4c starts assembling index.html. Catches the 4 historical
// worker bugs that cost finalize ~13 minutes of edit-and-retry debugging:
//
//   1. CSS scope mismatch — selectors use `#root` or `#<scene-id>-root` but
//      the actual root div is `<div id="root" class="<scene-id>-root">`.
//      Result: scene renders as un-styled raw text.
//   2. JS selectors with `#root` / `#scene_N-root` — same root cause, breaks
//      GSAP / DOM lookups.
//   3. Missing root contract — no `id="root"`, no `class="<scene-id>-root"`,
//      no `data-composition-id`, no `data-duration`.
//   4. Asset references to files not in hyperframes/public/ — worker invented
//      or mis-quoted a basename.
//
// Usage:
//   node check-compositions.mjs --hyperframes ./hyperframes --group-spec ./group_spec.json
//
// Exit 0 = all compositions pass. Print summary on stdout.
// Exit 1 = at least one violation. Print per-scene per-rule failures on stderr.
//          Orchestrator should re-dispatch the affected workers, not patch in finalize.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : def;
};

const hyperframesDir = resolve(flag("hyperframes", "./hyperframes"));
const groupSpecPath = resolve(flag("group-spec", "./group_spec.json"));
const compositionsDir = join(hyperframesDir, "compositions");
const publicDir = join(hyperframesDir, "public");

if (!existsSync(groupSpecPath)) {
  console.error(`✗ group_spec.json not found at ${groupSpecPath}`);
  process.exit(1);
}
if (!existsSync(compositionsDir)) {
  console.error(`✗ compositions dir not found at ${compositionsDir}`);
  process.exit(1);
}

const groupSpec = JSON.parse(readFileSync(groupSpecPath, "utf8"));
const sceneIds = (groupSpec.groups || []).flatMap((g) => g.scene_ids || []);

if (sceneIds.length === 0) {
  console.error(`✗ no scene_ids found in group_spec.json`);
  process.exit(1);
}

const errors = []; // { sceneId, rule, detail }

for (const sceneId of sceneIds) {
  const filePath = join(compositionsDir, `${sceneId}.html`);

  // Rule 0: file exists and non-empty
  if (!existsSync(filePath) || statSync(filePath).size === 0) {
    errors.push({
      sceneId,
      rule: "file",
      detail: `compositions/${sceneId}.html missing or empty`,
    });
    continue; // skip further checks for this scene
  }

  const html = readFileSync(filePath, "utf8");

  // Rule 1: root div contract
  // Must contain exactly one root div with id="root" AND class="<scene-id>-root"
  const rootDivRe = new RegExp(
    `<div\\b[^>]*\\bid=["']root["'][^>]*\\bclass=["'][^"']*\\b${sceneId}-root\\b[^"']*["']`,
    "i",
  );
  const rootDivAltRe = new RegExp(
    `<div\\b[^>]*\\bclass=["'][^"']*\\b${sceneId}-root\\b[^"']*["'][^>]*\\bid=["']root["']`,
    "i",
  );
  if (!rootDivRe.test(html) && !rootDivAltRe.test(html)) {
    errors.push({
      sceneId,
      rule: "root-contract",
      detail: `no <div id="root" class="${sceneId}-root" ...> found — must have BOTH attributes on the same div`,
    });
  }

  // Rule 1b: data-composition-id, data-duration on root
  const hostIdRe = new RegExp(`data-composition-id=["']${sceneId}["']`);
  if (!hostIdRe.test(html)) {
    errors.push({
      sceneId,
      rule: "data-composition-id",
      detail: `no data-composition-id="${sceneId}" found`,
    });
  }
  if (!/data-duration=["'][\d.]+["']/.test(html)) {
    errors.push({
      sceneId,
      rule: "data-duration",
      detail: `no data-duration="<float>" found on root`,
    });
  }

  // Rule 1c: window.__timelines["<scene-id>"] registration
  const tlKeyRe = new RegExp(`window\\.__timelines\\s*\\[\\s*["']${sceneId}["']\\s*\\]\\s*=`);
  if (!tlKeyRe.test(html)) {
    errors.push({
      sceneId,
      rule: "timeline-registration",
      detail: `no window.__timelines["${sceneId}"] = ... line found (verbatim scene id)`,
    });
  }

  // Rule 2: CSS scope — no #root or #<scene-id>-root selectors in <style> blocks
  //
  // We extract every <style>...</style> block and look for id-based selectors.
  // Any id selector inside <style> is a bug, since runtime sub-comp mounting
  // means there are multiple #root nodes on the host page — id selectors apply
  // globally and pollute / get polluted.
  const styleBlocks = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)];
  for (const m of styleBlocks) {
    const css = m[1];
    // strip CSS comments first
    const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
    // find any #identifier at the start of a selector (rough but catches the bug pattern)
    const idSelectors = [...stripped.matchAll(/(^|[\s,>+~])#([a-zA-Z][\w-]*)/gm)];
    const banned = idSelectors
      .map((sm) => sm[2])
      .filter((id) => id === "root" || id === `${sceneId}-root`);
    if (banned.length > 0) {
      errors.push({
        sceneId,
        rule: "css-scope",
        detail: `<style> uses banned id selector(s): ${[...new Set(banned)].map((b) => `#${b}`).join(", ")} — convert to .${sceneId}-root class selector`,
      });
    }
  }

  // Rule 3: JS selectors — no #root or #<scene-id>-root in <script> blocks
  //
  // Same root cause as Rule 2: querySelector("#root .foo") finds the wrong root
  // (or no root) when multiple sub-comps share id="root".
  const scriptBlocks = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of scriptBlocks) {
    const js = m[1];
    const stripped = js.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
    // Look for selector strings containing #root or #<scene-id>-root
    const bannedJsRe = new RegExp(`["'\`][^"'\`]*#(?:root|${sceneId}-root)\\b[^"'\`]*["'\`]`, "g");
    const matches = [...stripped.matchAll(bannedJsRe)];
    if (matches.length > 0) {
      errors.push({
        sceneId,
        rule: "js-scope",
        detail: `<script> contains banned selector(s): ${matches
          .slice(0, 3)
          .map((mm) => mm[0])
          .join(
            ", ",
          )}${matches.length > 3 ? ` (+${matches.length - 3} more)` : ""} — convert to .${sceneId}-root class selector`,
      });
    }
    // Also flag getElementById("root") / getElementById("<scene-id>-root")
    const banGEI = new RegExp(
      `getElementById\\(\\s*["'\`](?:root|${sceneId}-root)["'\`]\\s*\\)`,
      "g",
    );
    const geiMatches = [...stripped.matchAll(banGEI)];
    if (geiMatches.length > 0) {
      errors.push({
        sceneId,
        rule: "js-scope",
        detail: `<script> uses ${geiMatches[0][0]} — there can be multiple #root nodes at runtime; use document.querySelector(".${sceneId}-root") instead`,
      });
    }
  }

  // Rule 4: every public/ asset referenced must exist on disk
  const assetRefs = new Set();
  for (const m of html.matchAll(/\bpublic\/[A-Za-z0-9._/-]+/g)) {
    assetRefs.add(m[0]);
  }
  for (const ref of assetRefs) {
    if (!existsSync(join(hyperframesDir, ref))) {
      errors.push({
        sceneId,
        rule: "asset",
        detail: `references "${ref}" but file not in hyperframes/public/`,
      });
    }
  }

  // Rule 5: forbidden patterns (CSS animation, Date.now, etc.)
  const forbidden = [
    { re: /\btransition\s*:/i, name: "CSS transition:", scope: "style" },
    { re: /\banimation\s*:/i, name: "CSS animation:", scope: "style" },
    { re: /@font-face\b/i, name: "@font-face (declare in index.html, not scenes)", scope: "style" },
    { re: /\bDate\.now\b/, name: "Date.now()", scope: "script" },
    { re: /\bMath\.random\b/, name: "Math.random()", scope: "script" },
    { re: /\bperformance\.now\b/, name: "performance.now()", scope: "script" },
    { re: /\brepeat\s*:\s*-1\b/, name: "repeat: -1", scope: "script" },
    { re: /\bfetch\s*\(/, name: "fetch(", scope: "script" },
  ];

  for (const f of forbidden) {
    const blocks = f.scope === "style" ? styleBlocks : scriptBlocks;
    for (const m of blocks) {
      if (f.re.test(m[1])) {
        errors.push({
          sceneId,
          rule: "forbidden",
          detail: `${f.name} found inside <${f.scope}> — banned by composition contract`,
        });
        break;
      }
    }
  }

  // Rule 6: no leading-slash in asset paths
  if (/\bsrc=["']\/public\//.test(html) || /\burl\(["']?\/public\//.test(html)) {
    errors.push({
      sceneId,
      rule: "asset-path",
      detail: `asset reference uses leading slash "/public/..." — must be "public/..." (no leading slash)`,
    });
  }
}

// ---------- Report ----------
if (errors.length === 0) {
  console.log(`✓ all ${sceneIds.length} compositions pass pre-finalize checks`);
  process.exit(0);
}

// Group errors by sceneId for readable output
const bySceneId = new Map();
for (const e of errors) {
  if (!bySceneId.has(e.sceneId)) bySceneId.set(e.sceneId, []);
  bySceneId.get(e.sceneId).push(e);
}

console.error(`✗ ${errors.length} violation(s) across ${bySceneId.size} scene(s):\n`);
for (const [sceneId, list] of bySceneId) {
  console.error(`  ${sceneId}:`);
  for (const e of list) {
    console.error(`    [${e.rule}] ${e.detail}`);
  }
}
console.error(
  `\n  Fix the affected scene HTML files (or re-dispatch the workers) before finalize.`,
);
process.exit(1);
