#!/usr/bin/env node
// Phase 4a.5 — captions builder (deterministic; no subagent).
//
// Architecture:
//   1. design-system agent picks a caption-* registry component and writes
//      `design-system/caption-style.json` { name, rationale }.
//   2. prep.mjs runs `npx hyperframes add caption-<name>` to install the
//      component HTML into `compositions/components/<name>.html`, then
//      invokes this script.
//   3. This script reads the installed component HTML, aligns agent
//      `narrator_scripts.scenes[i].captions[]` against the whisper word grid
//      (audio_meta.scenes[].wordsPath), injects the aligned data into the
//      component's word-array (shape-detected), patches the composition id
//      and timeline registration to "captions", applies a best-effort
//      brand-DNA CSS patcher, prepends `chunks/tokens.css` so brand
//      var(--*) resolve, and writes `compositions/captions.html`.
//
// Shape adapters:
//   P1: var TRANSCRIPT = [...]                   — component derives WORDS/GROUPS
//                                                  via makeGroups() / buildGroups().
//                                                  AGENT GROUPING IS OVERRIDDEN by
//                                                  component's auto-grouper (logged).
//   P2: var WORDS = [...] + var RAW_GROUPS = [...] — explicit groups; agent
//                                                  grouping preserved.
//   Unsupported: components with custom block/layout arrays (BLOCKS) that
//   index into hardcoded word positions. captions.mjs exits non-zero with
//   a clear message; design-system agent should not pick these.
//
// Fallback ladder (per scene):
//   1. narrator_scripts.scenes[i].captions[] present + alignable → use them
//   2. else                                    → auto-group on whisper words
//                                                 (sentence-end / silence-gap /
//                                                 max-words). For P1 components,
//                                                 this is equivalent to whatever
//                                                 the component would do itself,
//                                                 so we simply hand TRANSCRIPT
//                                                 over and let the component group.
//
// If audio_meta / caption-style / installed component missing → captions.html
// is NOT written and the script exits 0 (no-op). finalize-agent checks file
// existence before emitting the track-12 clip.
//
// Usage:
//   node captions.mjs --audio-meta <path> --group-spec <path> \
//                     --narrator-scripts <path> \
//                     --caption-style <name> \
//                     [--component-path <path>] \
//                     [--tokens-css <path>] \
//                     --hyperframes <project-root> \
//                     --out <compositions/captions.html>

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

function die(msg) {
  console.error(`✗ captions.mjs: ${msg}`);
  process.exit(1);
}
function flag(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : null;
}

const audioMetaPath = flag("audio-meta");
const groupSpecPath = flag("group-spec");
const narratorScriptsPath = flag("narrator-scripts");
const captionStyle = flag("caption-style");
const componentPathArg = flag("component-path");
const tokensCssPath = flag("tokens-css");
const hyperframesDir = flag("hyperframes");
const outPath = flag("out") || "./compositions/captions.html";

if (!groupSpecPath) die("missing --group-spec");
if (!hyperframesDir) die("missing --hyperframes");

// audio_meta optional — no audio_meta → no captions (no-op exit 0)
if (!audioMetaPath || !existsSync(audioMetaPath)) {
  console.log("ℹ captions.mjs: no audio_meta.json — skipping (captions optional)");
  process.exit(0);
}
// caption-style optional — design-system agent may decline to pick one
if (!captionStyle) {
  console.log("ℹ captions.mjs: no --caption-style — skipping (no style chosen)");
  process.exit(0);
}

const componentPath = componentPathArg
  ? resolve(componentPathArg)
  : resolve(hyperframesDir, "compositions/components", `${captionStyle}.html`);

if (!existsSync(componentPath)) {
  die(
    `caption component not installed at ${componentPath}. Run \`npx hyperframes add ${captionStyle}\` from PROJECT_DIR first.`,
  );
}
if (!existsSync(groupSpecPath)) die(`group_spec.json not found at ${groupSpecPath}`);

const audioMeta = JSON.parse(readFileSync(audioMetaPath, "utf8"));
const groupSpec = JSON.parse(readFileSync(groupSpecPath, "utf8"));
const componentHtml = readFileSync(componentPath, "utf8");

let tokensCss = "";
if (tokensCssPath && existsSync(tokensCssPath)) {
  tokensCss = readFileSync(tokensCssPath, "utf8");
}

let narrator = null;
if (narratorScriptsPath && existsSync(narratorScriptsPath)) {
  try {
    narrator = JSON.parse(readFileSync(narratorScriptsPath, "utf8"));
  } catch (e) {
    console.error(
      `! captions.mjs: narrator_scripts.json parse failed (${e.message}) — falling back to auto-grouping`,
    );
  }
}

// ===========================================================================
// Phase A: parse agent caption tags + align against whisper word grid
// ===========================================================================

const TAG_RE = /<(em|brand|emph|cta)\b[^>]*>([\s\S]*?)<\/\1>/gi;

function parseCaptionGroup(groupStr) {
  // Yield { text, tag } per word. Strips inline tags but keeps tag id on the
  // matched word. Pure-punctuation tokens get merged into the previous word
  // so "Brex." reads as one token (matching whisper output).
  const tokens = [];
  let cursor = 0;
  const matches = [];
  let m;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(groupStr)) !== null) {
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      tag: m[1].toLowerCase(),
      inner: m[2],
    });
  }
  for (const match of matches) {
    const before = groupStr.slice(cursor, match.start);
    for (const w of before.split(/\s+/).filter(Boolean)) {
      tokens.push({ text: w, tag: null });
    }
    for (const w of match.inner.split(/\s+/).filter(Boolean)) {
      tokens.push({ text: w, tag: match.tag });
    }
    cursor = match.end;
  }
  const after = groupStr.slice(cursor);
  for (const w of after.split(/\s+/).filter(Boolean)) {
    tokens.push({ text: w, tag: null });
  }
  const merged = [];
  for (const t of tokens) {
    if (/^[^\w]+$/.test(t.text) && merged.length > 0) {
      merged[merged.length - 1].text += t.text;
    } else {
      merged.push(t);
    }
  }
  return merged;
}

function parseSceneCaptions(captionsArr) {
  if (!Array.isArray(captionsArr) || captionsArr.length === 0) return null;
  const groups = [];
  for (let i = 0; i < captionsArr.length; i++) {
    const entry = captionsArr[i];
    if (typeof entry !== "string" || !entry.trim()) continue;
    const tokens = parseCaptionGroup(entry);
    if (tokens.length === 0) continue;
    groups.push({ words: tokens, rawGroupIdx: i });
  }
  return groups.length > 0 ? groups : null;
}

function normalizeWord(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function alignToWhisper(agentGroups, whisperWords, sceneStartS) {
  const flat = [];
  for (let gi = 0; gi < agentGroups.length; gi++) {
    for (let wi = 0; wi < agentGroups[gi].words.length; wi++) {
      flat.push({
        gi,
        wi,
        text: agentGroups[gi].words[wi].text,
        tag: agentGroups[gi].words[wi].tag,
      });
    }
  }
  if (flat.length !== whisperWords.length) {
    return {
      ok: false,
      reason: `word-count mismatch (agent=${flat.length}, whisper=${whisperWords.length})`,
    };
  }
  let mismatches = 0;
  for (let i = 0; i < flat.length; i++) {
    if (normalizeWord(flat[i].text) !== normalizeWord(whisperWords[i].text)) mismatches++;
  }
  if (mismatches / flat.length > 0.25) {
    return { ok: false, reason: `${mismatches}/${flat.length} word mismatches (>25%)` };
  }
  const result = agentGroups.map(() => ({ words: [], rawGroupIdx: null }));
  for (let i = 0; i < flat.length; i++) {
    const { gi, text, tag } = flat[i];
    const w = whisperWords[i];
    result[gi].words.push({
      text,
      tag,
      start: sceneStartS + Number(w.start),
      end: sceneStartS + Number(w.end),
    });
    result[gi].rawGroupIdx = agentGroups[gi].rawGroupIdx;
  }
  return { ok: true, groups: result, mismatches };
}

// Auto-group fallback (whisper-side, when no agent captions or alignment failed).
const AUTO_GROUP_WORDS_MAX = 3;
const AUTO_SILENCE_GAP_S = 0.15;
function autoGroup(whisperWords, sceneStartS) {
  const groups = [];
  let cur = null;
  for (let i = 0; i < whisperWords.length; i++) {
    const w = whisperWords[i];
    if (!w.text) continue;
    const prev = i > 0 ? whisperWords[i - 1] : null;
    let split = !cur || cur.words.length >= AUTO_GROUP_WORDS_MAX;
    if (!split && prev) {
      if (w.start - prev.end > AUTO_SILENCE_GAP_S) split = true;
      if (/[.,?!]$/.test(prev.text)) split = true;
    }
    if (split) {
      if (cur) groups.push(cur);
      cur = { words: [], rawGroupIdx: null };
    }
    cur.words.push({
      text: w.text,
      tag: null,
      start: sceneStartS + Number(w.start),
      end: sceneStartS + Number(w.end),
    });
  }
  if (cur) groups.push(cur);
  return groups;
}

// ===========================================================================
// Phase B: build per-scene groups (ordered by scene start)
// ===========================================================================

const orderedScenes = [];
for (const g of groupSpec.groups || []) {
  for (const sid of g.scene_ids) orderedScenes.push({ scene_id: sid, ...g.scenes[sid] });
}

const narratorByScene = new Map();
if (narrator?.scenes) {
  for (const ns of narrator.scenes) {
    narratorByScene.set(`scene_${ns.sceneNumber}`, ns);
  }
}

const anomalies = [];
const allGroups = [];

let scenesWithCaptions = 0;
let scenesUsingAgent = 0;
let scenesUsingAuto = 0;

for (const s of orderedScenes) {
  const audioScene = audioMeta.scenes?.[s.scene_id];
  if (!audioScene?.wordsPath) continue;
  const wordsAbs = join(hyperframesDir, audioScene.wordsPath);
  if (!existsSync(wordsAbs)) {
    anomalies.push(
      `${s.scene_id}: wordsPath ${audioScene.wordsPath} not on disk — captions skipped for this scene`,
    );
    continue;
  }
  let whisperWords;
  try {
    whisperWords = JSON.parse(readFileSync(wordsAbs, "utf8"));
  } catch (e) {
    anomalies.push(`${s.scene_id}: words JSON parse failed (${e.message}) — captions skipped`);
    continue;
  }
  if (!Array.isArray(whisperWords) || whisperWords.length === 0) continue;
  scenesWithCaptions++;

  const ns = narratorByScene.get(s.scene_id);
  const agentGroups = ns ? parseSceneCaptions(ns.captions) : null;
  let sceneGroups;
  if (agentGroups) {
    const aligned = alignToWhisper(agentGroups, whisperWords, s.start_s);
    if (aligned.ok) {
      sceneGroups = aligned.groups;
      scenesUsingAgent++;
      if (aligned.mismatches > 0) {
        anomalies.push(
          `${s.scene_id}: aligned agent captions with ${aligned.mismatches} soft mismatches (acceptable)`,
        );
      }
    } else {
      anomalies.push(
        `${s.scene_id}: agent captions ${aligned.reason} — falling back to auto-group`,
      );
      sceneGroups = autoGroup(whisperWords, s.start_s);
      scenesUsingAuto++;
    }
  } else {
    sceneGroups = autoGroup(whisperWords, s.start_s);
    scenesUsingAuto++;
  }
  allGroups.push(...sceneGroups);
}

if (allGroups.length === 0) {
  console.log("ℹ captions.mjs: no caption groups built — skipping output");
  if (anomalies.length) for (const a of anomalies) console.log(`  ${a}`);
  process.exit(0);
}

for (const g of allGroups) {
  g.start = g.words[0].start;
  g.end = g.words[g.words.length - 1].end + 0.1;
}

// ===========================================================================
// Phase C: detect component data shape + inject aligned data
// ===========================================================================

// Robust replacer for a top-level array literal `(var|let|const) <name> = [ ... ]`.
// Scans bracket depth so nested objects/arrays don't trip up the close match.
function replaceArrayLiteral(html, varName, replacementBody) {
  const re = new RegExp(`((?:var|let|const)\\s+${varName}\\s*=\\s*)\\[`);
  const m = re.exec(html);
  if (!m) return null;
  const headEnd = m.index + m[0].length; // position AFTER '['
  let depth = 1;
  let i = headEnd;
  let inStr = null; // '"' | "'" | "`" | null
  while (i < html.length) {
    const c = html[i];
    if (inStr) {
      if (c === "\\") {
        i += 2;
        continue;
      }
      if (c === inStr) inStr = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      inStr = c;
      i++;
      continue;
    }
    if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) break;
    }
    i++;
  }
  if (depth !== 0) return null;
  // i now points at the matching ']'
  return html.slice(0, m.index) + m[1] + replacementBody + html.slice(i + 1);
}

function hasArrayVar(html, varName) {
  return new RegExp(`(?:var|let|const)\\s+${varName}\\s*=\\s*\\[`).test(html);
}

const isP1 = hasArrayVar(componentHtml, "TRANSCRIPT");
const hasWordsVar = hasArrayVar(componentHtml, "WORDS");
const hasRawGroupsVar = hasArrayVar(componentHtml, "RAW_GROUPS");
const hasWVar = hasArrayVar(componentHtml, "W");
const hasBlocksVar = hasArrayVar(componentHtml, "BLOCKS");

let shape;
if (isP1) shape = "P1";
else if (hasWordsVar && hasRawGroupsVar) shape = "P2";
else if (hasWordsVar && !hasRawGroupsVar) shape = "P2-no-rg"; // explicit GROUPS literal
else if (hasWVar && hasBlocksVar) shape = "P3-blocks";
else shape = "unknown";

if (shape === "P3-blocks" || shape === "unknown") {
  die(
    `caption component '${captionStyle}' uses an unsupported data shape (${shape}). Supported: P1 (var TRANSCRIPT) or P2 (var WORDS + var RAW_GROUPS). Pick a different caption-style.`,
  );
}

// Flat WORDS list across all groups, deterministic key order (text, start, end).
function buildFlatWords() {
  const out = [];
  for (const g of allGroups) {
    for (const w of g.words) {
      out.push({
        text: w.text,
        start: Number(w.start.toFixed(3)),
        end: Number(w.end.toFixed(3)),
      });
    }
  }
  return out;
}

// RAW_GROUPS as [[startIdx, endIdx], ...] aligned to the flat WORDS list.
function buildRawGroups() {
  const out = [];
  let cursor = 0;
  for (const g of allGroups) {
    const start = cursor;
    cursor += g.words.length;
    out.push([start, cursor - 1]);
  }
  return out;
}

const flatWords = buildFlatWords();

function literalWords(arr) {
  // Pretty-print as JS array of {text,start,end} objects, one per line.
  const lines = arr.map(
    (w) => `        { text: ${JSON.stringify(w.text)}, start: ${w.start}, end: ${w.end} }`,
  );
  return `[\n${lines.join(",\n")}\n      ]`;
}

function literalRawGroups(arr) {
  const lines = arr.map((p) => `        [${p[0]}, ${p[1]}]`);
  return `[\n${lines.join(",\n")}\n      ]`;
}

let patched = componentHtml;
const totalDuration = Number(groupSpec.total_duration_s.toFixed(3));

if (shape === "P1") {
  // Replace TRANSCRIPT only; component re-groups via its own makeGroups().
  const newTranscript = literalWords(flatWords);
  const next = replaceArrayLiteral(patched, "TRANSCRIPT", newTranscript);
  if (!next) die("failed to locate var TRANSCRIPT = [...] for replacement");
  patched = next;
  anomalies.push(
    `shape=P1: component will re-group ${flatWords.length} words via its own makeGroups() — agent captions[] grouping is hint-only for this style`,
  );
} else if (shape === "P2") {
  const newWords = literalWords(flatWords);
  const newRawGroups = literalRawGroups(buildRawGroups());
  let next = replaceArrayLiteral(patched, "WORDS", newWords);
  if (!next) die("failed to locate var WORDS = [...] for replacement");
  patched = next;
  next = replaceArrayLiteral(patched, "RAW_GROUPS", newRawGroups);
  if (!next) die("failed to locate var RAW_GROUPS = [...] for replacement");
  patched = next;
} else if (shape === "P2-no-rg") {
  // Some P2-ish components write GROUPS as an object-literal array directly.
  // Replace WORDS only; the GROUPS literal in the file remains tied to the
  // old word indices, so this shape is effectively unsupported for variable
  // word counts. Bail with a clear message.
  die(
    `caption component '${captionStyle}' uses var WORDS = [...] but no var RAW_GROUPS = [...] — its GROUPS object literal references old word indices and cannot be safely retargeted. Pick a different caption-style.`,
  );
}

// Replace `var DURATION = N;` if present so end-of-track math matches our total.
patched = patched.replace(/((?:var|let|const)\s+DURATION\s*=\s*)[\d.]+(\s*;)/, `$1${totalDuration}$2`);

// ===========================================================================
// Phase D: patch composition id + timeline registration to "captions"
// ===========================================================================

const compIdMatch = patched.match(/data-composition-id="([^"]+)"/);
const originalCompId = compIdMatch ? compIdMatch[1] : null;
if (originalCompId && originalCompId !== "captions") {
  patched = patched.replace(/data-composition-id="[^"]+"/, 'data-composition-id="captions"');
  const escId = originalCompId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tlRe = new RegExp(`window\\.__timelines\\[\\s*["']${escId}["']\\s*\\]`, "g");
  patched = patched.replace(tlRe, 'window.__timelines["captions"]');
}

// ===========================================================================
// Phase E: brand-DNA injection — font-family patcher + tokens.css prepend
// ===========================================================================

// Best-effort font-family substitution. Each rule replaces a known hardcoded
// face with a brand var, keeping the original face as a fallback so the
// component still renders when brand DNA doesn't declare the var.
const FONT_FAMILY_PATCHES = [
  {
    re: /font-family:\s*"Inter"[^;]*;/g,
    repl: 'font-family: var(--font-body, "Inter", sans-serif);',
  },
  {
    re: /font-family:\s*"Montserrat"[^;]*;/g,
    repl: 'font-family: var(--font-display, "Montserrat", sans-serif);',
  },
  {
    re: /font-family:\s*"Playfair Display"[^;]*;/g,
    repl: 'font-family: var(--font-display, "Playfair Display", serif);',
  },
  {
    re: /font-family:\s*"Bebas Neue"[^;]*;/g,
    repl: 'font-family: var(--font-display, "Bebas Neue", sans-serif);',
  },
  {
    re: /font-family:\s*"Caveat Brush"[^;]*;/g,
    repl: 'font-family: var(--font-script, "Caveat Brush", cursive);',
  },
  {
    re: /font-family:\s*"Anton"[^;]*;/g,
    repl: 'font-family: var(--font-display, "Anton", sans-serif);',
  },
  {
    re: /font-family:\s*"Space Mono"[^;]*;/g,
    repl: 'font-family: var(--font-mono, "Space Mono", monospace);',
  },
];

let fontPatchCount = 0;
for (const p of FONT_FAMILY_PATCHES) {
  patched = patched.replace(p.re, () => {
    fontPatchCount++;
    return p.repl;
  });
}

// Prepend tokens.css inside <head> so var(--font-*) / var(--brand-*) resolve.
if (tokensCss) {
  const tokensStyle = `    <style data-brand-tokens>\n${tokensCss}\n    </style>`;
  if (/<\/head>/i.test(patched)) {
    patched = patched.replace(/<\/head>/i, `${tokensStyle}\n  </head>`);
  } else {
    // No <head> (defensive); inject before first <style> or before <body>
    patched = patched.replace(/<style/i, `${tokensStyle}\n    <style`);
  }
}

// ===========================================================================
// Phase F: write
// ===========================================================================

mkdirSync(dirname(resolve(outPath)), { recursive: true });
writeFileSync(outPath, patched);

console.log(`✓ wrote ${outPath}`);
console.log(`  style: ${captionStyle} (shape=${shape})`);
console.log(`  scenes captioned: ${scenesWithCaptions}/${orderedScenes.length}`);
console.log(`    via agent groups: ${scenesUsingAgent}`);
console.log(`    via auto-group:   ${scenesUsingAuto}`);
console.log(`  groups: ${allGroups.length}, words: ${flatWords.length}`);
console.log(`  total duration: ${totalDuration}s`);
console.log(`  font-family patches: ${fontPatchCount}, tokens.css: ${tokensCss ? "injected" : "(none)"}`);
if (anomalies.length) {
  console.log(`  anomalies (non-fatal):`);
  for (const a of anomalies) console.log(`    - ${a}`);
}
