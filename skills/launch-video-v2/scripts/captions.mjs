#!/usr/bin/env node
// Phase 4a.5 — captions builder (deterministic; no subagent).
//
// Reads:  narrator_scripts.json  (per-scene captions[] — agent-authored groups
//                                  with inline tags <em>/<brand>/<emph>/<cta>),
//         audio_meta.json        (per-scene wordsPath — TTS+whisper word grid
//                                  with start/end timestamps),
//         group_spec.json        (per-scene start_s + surface),
//         design-system/chunks/captions.md  (preset §C: CSS, animation pattern,
//                                  config including fit_font_family).
// Writes: <PROJECT_DIR>/compositions/captions.html — single full-bleed sub-
//         comp overlaying every scene on track 12 (finalize wires it).
//
// Authoring model:
//   story-design agent decides BOTH which words to highlight (via inline tag)
//   AND how to group words into caption lines (via captions[] array).
//   captions.mjs is the translator — it aligns agent groups to the whisper
//   word grid (so the karaoke timing comes from TTS truth), applies per-word
//   styling classes (from tags + auto-detect ALL CAPS / numerics), wraps <em>
//   words in <em class="cap-word"> for script-flick, and emits a deterministic
//   GSAP timeline. fitTextFontSize is called per group so long words can't clip.
//
// Fallback ladder (per scene):
//   1. narrator_scripts.scenes[i].captions[]   present + alignable → use them
//   2. else                                    → auto-group whisper words by
//                                                  §C config (sentence boundary
//                                                  / silence_150ms / max_words).
//   This means scenes that lack a captions[] still get reasonable captions, and
//   scenes whose agent groups don't line up with whisper output (mis-count,
//   whisper drop / re-order) degrade silently instead of breaking the render.
//
// If audio_meta or any wordsPath is missing/empty → captions.html is NOT written
// and the script exits 0 (no-op). finalize agent checks file existence before
// emitting the clip ref, so captions are silently optional.
//
// Usage:
//   node captions.mjs --audio-meta <path> --group-spec <path> \
//                     --narrator-scripts <path> \
//                     --chunks-captions <path> --hyperframes <project-root> \
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
const chunksCaptionsPath = flag("chunks-captions");
const hyperframesDir = flag("hyperframes");
const outPath = flag("out") || "./compositions/captions.html";

if (!groupSpecPath) die("missing --group-spec");
if (!chunksCaptionsPath) die("missing --chunks-captions");
if (!hyperframesDir) die("missing --hyperframes");

// audio_meta is optional — no audio_meta → no captions (no-op exit 0)
if (!audioMetaPath || !existsSync(audioMetaPath)) {
  console.log("ℹ captions.mjs: no audio_meta.json — skipping (captions optional)");
  process.exit(0);
}
if (!existsSync(chunksCaptionsPath)) {
  console.log(`ℹ captions.mjs: no chunks/captions.md at ${chunksCaptionsPath} — skipping (preset doesn't declare §C)`);
  process.exit(0);
}
if (!existsSync(groupSpecPath)) die(`group_spec.json not found at ${groupSpecPath}`);

const audioMeta = JSON.parse(readFileSync(audioMetaPath, "utf8"));
const groupSpec = JSON.parse(readFileSync(groupSpecPath, "utf8"));
const chunksMd = readFileSync(chunksCaptionsPath, "utf8");

// narrator_scripts is optional — without it, every scene falls back to auto-grouping.
let narrator = null;
if (narratorScriptsPath && existsSync(narratorScriptsPath)) {
  try {
    narrator = JSON.parse(readFileSync(narratorScriptsPath, "utf8"));
  } catch (e) {
    console.error(`! captions.mjs: narrator_scripts.json parse failed (${e.message}) — falling back to auto-grouping`);
  }
}

// ---------- Extract §C config + CSS from chunks/captions.md ----------
const configMatch = chunksMd.match(/```json\n([\s\S]+?)\n```/);
if (!configMatch) die("chunks/captions.md missing ```json config block");
let config;
try {
  config = JSON.parse(configMatch[1]);
} catch (e) {
  die(`chunks/captions.md config JSON parse: ${e.message}`);
}

const cssMatch = chunksMd.match(/```css\n([\s\S]+?)\n```/);
if (!cssMatch) die("chunks/captions.md missing ```css block");
const captionCss = cssMatch[1].trim();

const GROUP_WORDS_MAX = config.group_words_max ?? 3;
const SILENCE_GAP_S = 0.15;
const DUR_LINE_ENTER = config.dur_line_enter ?? 0.45;
const DUR_LINE_EXIT = config.dur_line_exit ?? 0.35;
const DUR_WORD_STAMP = config.dur_word_stamp ?? 0.18;
const EASE_LINE_ENTER = config.ease_line_enter ?? "back.out(2.4)";
const EASE_LINE_EXIT = config.ease_line_exit ?? "power4.in";
const EASE_WORD_STAMP = config.ease_word_stamp ?? "back.out(2.4)";

// fitTextFontSize config (preset-decided per scheme (a)). All optional with
// sensible defaults so preset can omit them when not using fit.
const FIT_FONT_FAMILY = config.fit_font_family || null; // null → skip fit calls
const FIT_MAX_WIDTH_LANDSCAPE = config.fit_max_width_landscape ?? 1600;
const FIT_MAX_WIDTH_PORTRAIT = config.fit_max_width_portrait ?? 900;
const FIT_BASE_FONT_SIZE = config.fit_base_font_size ?? 96;
const FIT_MIN_FONT_SIZE = config.fit_min_font_size ?? 56;

// ---------- Parse narrator captions per scene (agent-authored groups) ----------
// Returns { sceneId → [{ words: [{ text, tag }], rawGroupIdx }] } or null when
// scene has no captions[]. Tag-strip preserves the original word casing
// because peoples §C uppercases everything via CSS text-transform — alignment
// (against whisper, which is lowercase + punctuation) is done on a normalized
// alpha-only form regardless of original case.
const TAG_RE = /<(em|brand|emph|cta)\b[^>]*>([\s\S]*?)<\/\1>/gi;
const CLOSE_TAG_RE = /<\/?(em|brand|emph|cta)\b[^>]*>/gi;

function parseCaptionGroup(groupStr) {
  // Yield { text, tag } per word. The string may have inline tags wrapping
  // single words. Strategy: scan tag occurrences, slot un-tagged tokens between
  // them, then split each segment by whitespace. Keep tag on the matched word.
  const tokens = [];
  let cursor = 0;
  const matches = [];
  let m;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(groupStr)) !== null) {
    matches.push({ start: m.index, end: m.index + m[0].length, tag: m[1].toLowerCase(), inner: m[2] });
  }
  for (const match of matches) {
    // Emit un-tagged words from cursor up to match.start.
    const before = groupStr.slice(cursor, match.start);
    for (const w of before.split(/\s+/).filter(Boolean)) {
      tokens.push({ text: w, tag: null });
    }
    // Emit tagged words. Tag applies to the whole inner content's words
    // (multi-word inner is unusual but tolerated).
    for (const w of match.inner.split(/\s+/).filter(Boolean)) {
      tokens.push({ text: w, tag: match.tag });
    }
    cursor = match.end;
  }
  // Emit trailing un-tagged words.
  const after = groupStr.slice(cursor);
  for (const w of after.split(/\s+/).filter(Boolean)) {
    tokens.push({ text: w, tag: null });
  }
  // Whitespace split can leave standalone punctuation tokens when the agent
  // writes e.g. `<brand>Brex</brand>.` — the `.` after </brand> would otherwise
  // count as its own word, breaking alignment vs whisper output which emits
  // "Brex." as one token. Merge any pure-punctuation token into the preceding
  // word's text (preserving the preceding token's tag).
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

// ---------- Per-word style classification ----------
// Auto-detect classes are ALL CAPS (≥2 letters, all uppercase) and numerics
// (starts with a digit). Explicit tags win over auto-detect; cap-num beats
// cap-allcaps when both could fire ("100M" is num, not allcaps).
const NUM_RE = /^\d/;
const ALLCAPS_RE = /^[A-Z]{2,}/;
function classifyWord(text, tag) {
  if (tag === "em") return { className: null, wrapInEm: true };   // script-flick → <em class="cap-word">
  if (tag === "brand") return { className: "cap-brand", wrapInEm: false };
  if (tag === "emph") return { className: "cap-emph", wrapInEm: false };
  if (tag === "cta") return { className: "cap-cta", wrapInEm: false };
  // Auto-detect on un-tagged words. Strip surrounding punctuation before test
  // so "Brex." reads as "Brex" (still capitalized, not all-caps; not classified).
  const core = text.replace(/^[^\w]+|[^\w]+$/g, "");
  if (NUM_RE.test(core)) return { className: "cap-num", wrapInEm: false };
  if (ALLCAPS_RE.test(core)) return { className: "cap-allcaps", wrapInEm: false };
  return { className: null, wrapInEm: false };
}

// ---------- Alignment: agent words ↔ whisper words ----------
// Whisper emits words with timestamps; agent emits ordered word list with tags.
// We need to attach (start, end) from whisper to each agent word.
//
// Strategy: walk both lists in lockstep with a normalize(s) = [a-z0-9]+ join.
// Strict 1:1 succeeds only when token counts match. On count mismatch we DON'T
// try to recover at the scene level — captions.mjs falls back to auto-grouping
// (whisper-side). Logged as anomaly + use whisper auto-groups for this scene.
function normalizeWord(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function alignToWhisper(agentGroups, whisperWords, sceneStartS) {
  // Flatten agent words for 1:1 alignment.
  const flat = [];
  for (let gi = 0; gi < agentGroups.length; gi++) {
    for (let wi = 0; wi < agentGroups[gi].words.length; wi++) {
      flat.push({ gi, wi, text: agentGroups[gi].words[wi].text, tag: agentGroups[gi].words[wi].tag });
    }
  }
  if (flat.length !== whisperWords.length) {
    return { ok: false, reason: `word-count mismatch (agent=${flat.length}, whisper=${whisperWords.length})` };
  }
  // Soft-match: normalized strings must agree. One-off mismatches are allowed
  // (whisper may say "AI's" when agent says "AI'S"; both normalize to "ais").
  // Mismatches > 25% of words → bail to auto-group.
  let mismatches = 0;
  for (let i = 0; i < flat.length; i++) {
    if (normalizeWord(flat[i].text) !== normalizeWord(whisperWords[i].text)) mismatches++;
  }
  if (mismatches / flat.length > 0.25) {
    return { ok: false, reason: `${mismatches}/${flat.length} word mismatches (>25%)` };
  }
  // Apply whisper timestamps + scene offset.
  const result = agentGroups.map(() => ({ words: [], rawGroupIdx: null }));
  for (let i = 0; i < flat.length; i++) {
    const { gi, wi, text, tag } = flat[i];
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

// ---------- Auto-group fallback (whisper-side, when no agent captions) ----------
// Split when EITHER: hit group_words_max | gap > SILENCE_GAP_S | sentence end |
// surface change. Same rules as the previous v1 of captions.mjs.
function autoGroup(whisperWords, sceneStartS, surface) {
  const groups = [];
  let cur = null;
  for (let i = 0; i < whisperWords.length; i++) {
    const w = whisperWords[i];
    if (!w.text) continue;
    const prev = i > 0 ? whisperWords[i - 1] : null;
    let split = !cur || cur.words.length >= GROUP_WORDS_MAX;
    if (!split && prev) {
      if (w.start - prev.end > SILENCE_GAP_S) split = true;
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
  // Attach surface uniformly to each group.
  return groups.map((g) => ({ ...g, surface }));
}

// ---------- Build per-scene groups ----------
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
const allGroups = []; // global flat list of groups with full timing

let scenesWithCaptions = 0;
let scenesUsingAgent = 0;
let scenesUsingAuto = 0;

for (const s of orderedScenes) {
  const audioScene = audioMeta.scenes?.[s.scene_id];
  if (!audioScene?.wordsPath) continue;
  const wordsAbs = join(hyperframesDir, audioScene.wordsPath);
  if (!existsSync(wordsAbs)) {
    anomalies.push(`${s.scene_id}: wordsPath ${audioScene.wordsPath} not on disk — captions skipped for this scene`);
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

  const surface = s.surface || "paper";

  // Try agent-authored groups first.
  const ns = narratorByScene.get(s.scene_id);
  const agentGroups = ns ? parseSceneCaptions(ns.captions) : null;
  let sceneGroups;
  if (agentGroups) {
    const aligned = alignToWhisper(agentGroups, whisperWords, s.start_s);
    if (aligned.ok) {
      sceneGroups = aligned.groups.map((g) => ({ ...g, surface }));
      scenesUsingAgent++;
      if (aligned.mismatches > 0) {
        anomalies.push(`${s.scene_id}: aligned agent captions with ${aligned.mismatches} soft mismatches (acceptable)`);
      }
    } else {
      anomalies.push(`${s.scene_id}: agent captions ${aligned.reason} — falling back to auto-group`);
      sceneGroups = autoGroup(whisperWords, s.start_s, surface);
      scenesUsingAuto++;
    }
  } else {
    sceneGroups = autoGroup(whisperWords, s.start_s, surface);
    scenesUsingAuto++;
  }
  allGroups.push(...sceneGroups);
}

if (allGroups.length === 0) {
  console.log("ℹ captions.mjs: no caption groups built — skipping output");
  if (anomalies.length) for (const a of anomalies) console.log(`  ${a}`);
  process.exit(0);
}

// ---------- Compute group timing (line in / out) ----------
for (const g of allGroups) {
  g.start = g.words[0].start;
  g.end = g.words[g.words.length - 1].end + 0.1;
}

// ---------- Emit HTML ----------
function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const groupHtml = allGroups
  .map((g, i) => {
    const lineCls = g.surface === "blue" ? "cap-line surface-blue" : "cap-line";
    const wordSpans = g.words
      .map((w, j) => {
        const cls = classifyWord(w.text, w.tag);
        const wid = `cap-g-${i}-w-${j}`;
        const klass = ["cap-word", cls.className].filter(Boolean).join(" ");
        if (cls.wrapInEm) {
          return `        <em class="${klass}" id="${wid}">${escHtml(w.text)}</em>`;
        }
        return `        <span class="${klass}" id="${wid}">${escHtml(w.text)}</span>`;
      })
      .join("\n");
    return `      <div class="${lineCls}" id="cap-g-${i}">
${wordSpans}
      </div>`;
  })
  .join("\n");

// Build timeline data
const groupsData = allGroups.map((g, i) => ({
  i,
  start: Number(g.start.toFixed(3)),
  end: Number(g.end.toFixed(3)),
  text: g.words.map((w) => w.text).join(" "),
  words: g.words.map((w) => ({
    start: Number(w.start.toFixed(3)),
    end: Number(w.end.toFixed(3)),
  })),
}));

// Scope the §C CSS under `#root` so it can't leak.
const scopedCaptionCss = captionCss
  .replace(/^\.cap-/gm, "#root .cap-")
  .replace(/^\.cap-line\.surface-blue/gm, "#root .cap-line.surface-blue")
  .replace(/(\n\s*)\.cap-line\s+em\.cap-word/g, "$1#root .cap-line em.cap-word")
  .replace(/^\.cap-word\./gm, "#root .cap-word.");

const totalDuration = groupSpec.total_duration_s;

// Generate fitTextFontSize call block. If preset declared fit_font_family,
// every group calls __hyperframes.fitTextFontSize before the timeline runs.
const fitBlock = FIT_FONT_FAMILY
  ? `        // fitTextFontSize per group — preset-decided font family. Aspect-ratio
        // sniff picks landscape vs portrait maxWidth at runtime (no build-time
        // canvas knowledge). Falls back silently if runtime API absent.
        (function fitAllGroups() {
          if (!window.__hyperframes || !window.__hyperframes.fitTextFontSize) return;
          var portrait = window.matchMedia && window.matchMedia("(max-aspect-ratio: 9/16)").matches;
          var maxWidth = portrait ? ${FIT_MAX_WIDTH_PORTRAIT} : ${FIT_MAX_WIDTH_LANDSCAPE};
          for (var gi = 0; gi < GROUPS.length; gi++) {
            var groupEl = document.getElementById("cap-g-" + gi);
            if (!groupEl) continue;
            try {
              var result = window.__hyperframes.fitTextFontSize(GROUPS[gi].text.toUpperCase(), {
                fontFamily: ${JSON.stringify(FIT_FONT_FAMILY)},
                fontWeight: 400,
                maxWidth: maxWidth,
                baseFontSize: ${FIT_BASE_FONT_SIZE},
                minFontSize: ${FIT_MIN_FONT_SIZE},
              });
              if (result && result.fontSize) {
                groupEl.style.fontSize = result.fontSize + "px";
              }
            } catch (_) { /* skip; CSS clamp keeps the line readable */ }
          }
        })();

`
  : "";

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <!-- Captions sub-composition (track 12 overlay). Built by scripts/captions.mjs.
         Per-word classes (cap-brand/cap-allcaps/cap-num/cap-emph/cap-cta) come
         from story-design inline tags + auto-detect (ALL CAPS / numerics).
         <em class="cap-word"> = script-flick (peoples 招牌). -->
  </head>
  <body>
    <template>
      <style>
        #root {
          position: absolute;
          inset: 0;
          width: 1920px;
          height: 1080px;
          pointer-events: none;
          overflow: hidden;
        }
${scopedCaptionCss
  .split("\n")
  .map((l) => (l.length ? "        " + l : l))
  .join("\n")}
      </style>

      <div id="root" data-composition-id="captions">
${groupHtml}
      </div>

      <script>
        // Captions GSAP recipe (per-group): line enter → per-word stamp-slam →
        // hard kill at group.end. Source: design-system §C "Animation pattern".
        const GROUPS = ${JSON.stringify(groupsData)};

${fitBlock}        const tl = gsap.timeline({ paused: true });

        for (const g of GROUPS) {
          const lineSel = "#cap-g-" + g.i;
          tl.fromTo(lineSel,
            { opacity: 0, y: 16, visibility: "visible" },
            { opacity: 1, y: 0, duration: ${DUR_LINE_ENTER}, ease: "${EASE_LINE_ENTER}" },
            g.start
          );

          g.words.forEach((w, i) => {
            const wSel = "#cap-g-" + g.i + "-w-" + i;
            tl.call(() => {
              const cur = document.querySelector(wSel);
              if (cur) cur.classList.add("active");
              if (i > 0) {
                const prev = document.querySelector("#cap-g-" + g.i + "-w-" + (i - 1));
                if (prev) {
                  prev.classList.remove("active");
                  prev.classList.add("passed");
                }
              }
            }, null, w.start);

            const wDur = Math.max(0.05, w.end - w.start);
            tl.fromTo(wSel,
              { y: -16, scale: 0.92 },
              { y: 0, scale: 1.0,
                duration: Math.min(${DUR_WORD_STAMP}, wDur * 0.9),
                ease: "${EASE_WORD_STAMP}" },
              w.start
            );
          });

          const last = g.words[g.words.length - 1];
          tl.call(() => {
            const lastSel = "#cap-g-" + g.i + "-w-" + (g.words.length - 1);
            const el = document.querySelector(lastSel);
            if (el) {
              el.classList.remove("active");
              el.classList.add("passed");
            }
          }, null, last.end + 0.1);

          tl.to(lineSel,
            { opacity: 0, y: -12, duration: ${DUR_LINE_EXIT}, ease: "${EASE_LINE_EXIT}" },
            g.end - ${DUR_LINE_EXIT}
          );

          tl.set(lineSel, { opacity: 0, visibility: "hidden" }, g.end);
        }

        window.__timelines = window.__timelines || {};
        window.__timelines["captions"] = tl;
      </script>
    </template>
  </body>
</html>
`;

mkdirSync(dirname(resolve(outPath)), { recursive: true });
writeFileSync(outPath, html);

console.log(`✓ wrote ${outPath}`);
console.log(`  scenes captioned: ${scenesWithCaptions}/${orderedScenes.length}`);
console.log(`    via agent groups: ${scenesUsingAgent}`);
console.log(`    via auto-group:   ${scenesUsingAuto}`);
console.log(`  groups: ${allGroups.length}, fit: ${FIT_FONT_FAMILY ? `enabled (${FIT_FONT_FAMILY})` : "disabled"}`);
console.log(`  total duration: ${totalDuration}s`);
if (anomalies.length) {
  console.log(`  anomalies (non-fatal):`);
  for (const a of anomalies) console.log(`    - ${a}`);
}
