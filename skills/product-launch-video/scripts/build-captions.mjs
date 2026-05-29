#!/usr/bin/env node
// Phase 4a.5 (engine) — deterministic caption grouping. No subagent.
//
// Owns the word-data half of the captions contract (clean / group / global-time
// / class + the non-overlap invariant). Its output, caption_groups.json, is the
// single source of grouping/timing truth consumed by the deterministic HTML
// builder build-captions-html.mjs (no LLM, no hand-authored spans).
// Color/contrast decisions are NOT made here — color-mix()/var() can only be
// resolved by a browser at render time, so the A-lite scene-background
// adaptation lives in the caption template's render-time <script>, not here.
// This script only carries each group's `scene_id` + `surface` through so the
// template knows which scene a caption sits over.
//
// Reads:  ./group_spec.json (Phase 4a — groups[].scenes[<sid>].{start_s,
//           estimatedDuration_s, wordsPath, surface}); each scene's
//           wordsPath → assets/voice/scene_<N>_words.json (Phase 2.5 whisper
//           output, [{text,start,end}] in SCENE-LOCAL seconds);
//           design-system/chunks/tokens.css (existence gate only).
// Writes:  ./caption_groups.json (cleaned / grouped / tagged / globally-timed
//           word groups + stats + anomalies[]).
//
// Usage:
//   node build-captions.mjs --group-spec ./group_spec.json \
//        --hyperframes . --tokens design-system/chunks/tokens.css \
//        --out ./caption_groups.json
//
// Exit 0 = caption_groups.json written, OR a documented SKIP (prints
//          "captions: skipped (<reason>)" — finalize keys off file existence,
//          so a skip is not an error). Skips: group_spec missing; no scene has
//          an existing/valid wordsPath; tokens.css missing.
// Exit 1 = structural failure only (group_spec unreadable JSON; a wordsPath
//          that is present but malformed JSON). Non-fatal issues → anomalies[].

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";

// ---------- argv ----------
const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : def;
};
function die(msg) {
  console.error(`✗ build-captions.mjs: ${msg}`);
  process.exit(1);
}
function skip(reason) {
  // Skip is not an error: finalize decides track-12 by file existence, and a
  // missing caption_groups.json simply means the captions agent also skips.
  console.log(`captions: skipped (${reason})`);
  process.exit(0);
}

const groupSpecPath = resolve(flag("group-spec", "./group_spec.json"));
const hyperframesDir = resolve(flag("hyperframes", "."));
const tokensPath = resolve(hyperframesDir, flag("tokens", "design-system/chunks/tokens.css"));
const outPath = resolve(flag("out", "./caption_groups.json"));

// ---------- skip gates ----------
if (!existsSync(groupSpecPath)) skip("no group_spec");
if (!existsSync(tokensPath)) skip("no brand tokens");

let spec;
try {
  spec = JSON.parse(readFileSync(groupSpecPath, "utf8"));
} catch (e) {
  die(`group_spec.json is not valid JSON: ${e.message}`);
}
const groups = Array.isArray(spec.groups) ? spec.groups : [];
if (groups.length === 0) skip("group_spec has no groups");

const anomalies = [];

// ---------- §1: load word stream, scene-local → global, carry scene_id+surface ----------
// Outer loop over groups in array order, inner loop over each group's
// scene_ids in array order (group_spec is a list of worker-groups, each with
// its own scenes map — there is NO top-level scenes map).
const rawWords = [];
let scenesWithWords = 0;
for (const g of groups) {
  for (const sid of g.scene_ids || []) {
    const sc = (g.scenes || {})[sid];
    if (!sc) {
      anomalies.push(`${sid}: listed in scene_ids but missing from scenes map — skipped`);
      continue;
    }
    const wordsPath = sc.wordsPath; // prep writes "" (not absent) when no/invalid file
    if (!wordsPath) continue; // empty string === "no words for this scene"
    const abs = join(hyperframesDir, wordsPath);
    if (!existsSync(abs)) {
      anomalies.push(
        `${sid}: wordsPath "${wordsPath}" not on disk — scene contributes no captions`,
      );
      continue;
    }
    let arr;
    try {
      arr = JSON.parse(readFileSync(abs, "utf8"));
    } catch (e) {
      // A present-but-malformed wordsPath is a structural failure: prep claimed
      // this scene had transcribed words, so a parse error is a real break.
      die(`${sid}: wordsPath "${wordsPath}" is present but not valid JSON: ${e.message}`);
    }
    if (!Array.isArray(arr) || arr.length === 0) {
      anomalies.push(`${sid}: wordsPath "${wordsPath}" is empty — scene contributes no captions`);
      continue;
    }
    const offset = Number(sc.start_s);
    if (!isFinite(offset)) {
      anomalies.push(`${sid}: start_s "${sc.start_s}" not finite — using 0`);
    }
    const base = isFinite(offset) ? offset : 0;
    const surface = sc.surface ?? null; // named surface token or null (non-surface-aware preset)
    let kept = 0;
    for (const w of arr) {
      const text = typeof w.text === "string" ? w.text : typeof w.word === "string" ? w.word : "";
      const start = Number(w.start);
      const end = Number(w.end);
      if (!text || !isFinite(start) || !isFinite(end) || end <= start) {
        continue; // silently drop unusable word entries (timestamps unreliable)
      }
      rawWords.push({ text, start: base + start, end: base + end, scene_id: sid, surface });
      kept++;
    }
    if (kept > 0) scenesWithWords++;
  }
}

if (scenesWithWords === 0) skip("no whisper words");

// ---------- §2: clean the word stream ----------
const MUSIC_RE = /^[♪♯�\s-]+$/; // ♪ ♯ replacement-char / dashes only
const FILLER = new Set(["uh", "um", "ah", "oh", "huh"]);
const HAS_ALNUM = /[A-Za-z0-9]/;
let droppedMusic = 0;
let droppedPunct = 0;
let droppedShort = 0;
let droppedFiller = 0;
const cleaned = [];
for (const w of rawWords) {
  const t = w.text.trim();
  if (t === "" || MUSIC_RE.test(t)) {
    droppedMusic++;
    continue;
  }
  if (!HAS_ALNUM.test(t)) {
    // Entirely non-alphanumeric (lone "." / "," / "—") — cannot stand as a word.
    // Punctuation ATTACHED to a word ("Figma.") keeps it — it has alnum chars.
    droppedPunct++;
    continue;
  }
  const dur = w.end - w.start;
  if (dur < 0.05) {
    droppedShort++;
    continue;
  }
  if (FILLER.has(t.toLowerCase().replace(/[^a-z]/g, "")) && dur < 0.1) {
    droppedFiller++;
    continue;
  }
  cleaned.push(w);
}

if (cleaned.length === 0) skip("no whisper words");

// ---------- §3: group the word stream ----------
// Hard rules (never violated):
//   1. cross-scene boundary (scene_id change) → force new group
//   2. sentence-end punctuation suffix on a word → close group AFTER that word
//   3. silence gap (word.start − prev.end > 0.18s) → new group
//   4. word cap (density-modulated, default 4) → force close
// Soft rhythm guidance is encoded deterministically as a density-aware cap:
// dense narration (local >2.5 w/s) shortens groups; lyrical (<1.5 w/s) allows 4.
const SILENCE_GAP = 0.18;
const SENTENCE_END_RE = /[.?!,;:—]$/; // . ? ! , ; : —
const TAIL_PAD = 0.12; // extra hold so the last word is readable

// Local density at index i = words whose start falls within [start, start+1.0s).
function effectiveCap(i) {
  const t0 = cleaned[i].start;
  let n = 0;
  for (let j = i; j < cleaned.length && cleaned[j].start < t0 + 1.0; j++) n++;
  if (n > 3.5) return 2;
  if (n > 2.5) return 3;
  return 4;
}

let densityShortened = 0;
let crossSceneSplits = 0;
let silenceGapSplits = 0;
let punctSplits = 0;
let capSplits = 0;
const grouped = []; // arrays of word objects
let cur = [];
let curCap = 4;
for (let i = 0; i < cleaned.length; i++) {
  const w = cleaned[i];
  const prev = cur.length ? cur[cur.length - 1] : null;
  const crossScene = prev && w.scene_id !== prev.scene_id;
  const silenceGap = prev && w.start - prev.end > SILENCE_GAP;
  if (cur.length && (crossScene || silenceGap || cur.length >= curCap)) {
    // attribute the split (priority: scene boundary > silence > word cap)
    if (crossScene) crossSceneSplits++;
    else if (silenceGap) silenceGapSplits++;
    else capSplits++;
    grouped.push(cur);
    cur = [];
  }
  if (cur.length === 0) {
    curCap = effectiveCap(i);
    if (curCap < 4) densityShortened++;
  }
  cur.push(w);
  if (SENTENCE_END_RE.test(w.text)) {
    punctSplits++;
    grouped.push(cur);
    cur = [];
  }
}
if (cur.length) grouped.push(cur);
// The final flush is not a split; the loop counted one split per boundary
// crossed, which is exactly (groups − 1) boundaries — no off-by-one to correct.

// ---------- §4: ALL-CAPS / numeric tagging (free emphasis, no upstream tag) ----------
function classesFor(text) {
  const cls = [];
  const letters = text.match(/[A-Za-z]/g) || [];
  if (letters.length >= 2 && !/[a-z]/.test(text)) cls.push("is-allcaps");
  if (/^[0-9]/.test(text)) cls.push("is-numeric");
  return cls;
}

let isAllcaps = 0;
let isNumeric = 0;
const outGroups = grouped.map((words, gi) => {
  const start = words[0].start;
  // Hold the last word up to TAIL_PAD ms longer — but never past the next
  // group's first word, or the GSAP hard-kill would fire AFTER the next group
  // appears and two groups would be on screen at once (guide §9 top failure).
  const nextStart = gi + 1 < grouped.length ? grouped[gi + 1][0].start : Infinity;
  const end = Math.min(words[words.length - 1].end + TAIL_PAD, nextStart);
  const text = words.map((w) => w.text).join(" ");
  return {
    id: `caption-group-${gi}`,
    scene_id: words[0].scene_id,
    surface: words[0].surface ?? null,
    start: Number(start.toFixed(3)),
    end: Number(end.toFixed(3)),
    text,
    words: words.map((w, wi) => {
      const classes = classesFor(w.text);
      if (classes.includes("is-allcaps")) isAllcaps++;
      if (classes.includes("is-numeric")) isNumeric++;
      return {
        id: `caption-word-${gi}-${wi}`,
        text: w.text,
        start: Number(w.start.toFixed(3)),
        end: Number(w.end.toFixed(3)),
        classes,
      };
    }),
  };
});

// ---------- §8 invariant: intra-scene groups must not temporally overlap ----------
// (Two visible at once is guide §9's top failure. We catch it here, on data,
// before any HTML is authored — never by seeking a GSAP timeline.)
for (let i = 1; i < outGroups.length; i++) {
  const a = outGroups[i - 1];
  const b = outGroups[i];
  if (a.scene_id === b.scene_id && b.start < a.end) {
    anomalies.push(
      `group overlap: ${a.id} ends ${a.end} but ${b.id} starts ${b.start} (same scene ${a.scene_id})`,
    );
  }
}

const out = {
  total_duration_s: Number(spec.total_duration_s) || 0,
  source_word_count: rawWords.length,
  cleaned_word_count: cleaned.length,
  groups: outGroups,
  stats: {
    groups: outGroups.length,
    cross_scene_splits: crossSceneSplits,
    silence_gap_splits: silenceGapSplits,
    punct_splits: punctSplits,
    cap_splits: capSplits,
    density_shortened: densityShortened,
    is_allcaps: isAllcaps,
    is_numeric: isNumeric,
    dropped: {
      music: droppedMusic,
      punct: droppedPunct,
      short: droppedShort,
      filler: droppedFiller,
    },
  },
  anomalies,
};

writeFileSync(outPath, JSON.stringify(out, null, 2));

// ---------- summary ----------
console.log(`✓ wrote ${outPath}`);
console.log(
  `  source words: ${rawWords.length} → cleaned: ${cleaned.length} → groups: ${outGroups.length}`,
);
console.log(
  `  splits — cross-scene:${crossSceneSplits} silence:${silenceGapSplits} punct:${punctSplits} cap:${capSplits}  /  density-shortened: ${densityShortened}`,
);
console.log(`  is-allcaps: ${isAllcaps}  /  is-numeric: ${isNumeric}`);
console.log(
  `  dropped — music:${droppedMusic} punct:${droppedPunct} short:${droppedShort} filler:${droppedFiller}`,
);
if (anomalies.length) {
  console.log(`\nanomalies (non-fatal):`);
  for (const a of anomalies) console.log(`  - ${a}`);
}
