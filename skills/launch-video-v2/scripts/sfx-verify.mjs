#!/usr/bin/env node
// SFX drift verifier — runs after finalize emits index.html.
//
// Reads:  group_spec.json (the truth: sfx[] = flat list with global t,
//         duration from manifest, file from manifest) + index.html (what
//         finalize actually emitted).
// Checks: for every cue in group_spec.sfx[]
//   1. matching <audio src="assets/sfx/<file>" data-start data-duration ...> exists
//   2. data-start drifts ≤ 0.1s from group_spec.t
//   3. data-duration === group_spec.duration (manifest truth; not truncated)
// Also flags <audio src="assets/sfx/..."> in index.html that are NOT in
// group_spec.sfx[] (finalize improvised an SFX → contract violation).
//
// Exit 0 = all pass. Exit 1 = any failure. stderr lists each failure with
// file, expected vs actual t / duration, and one-line guidance.
//
// Usage:
//   node sfx-verify.mjs --group-spec ./group_spec.json --index ./index.html

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const DRIFT_TOLERANCE_S = 0.1; // 3 frames @ 30fps; same as v1 w2h-verify

function flag(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : null;
}
function die(msg) {
  console.error(`✗ sfx-verify: ${msg}`);
  process.exit(1);
}

const groupSpecPath = resolve(flag("group-spec") || "./group_spec.json");
const indexPath = resolve(flag("index") || "./index.html");

if (!existsSync(groupSpecPath)) die(`group_spec.json missing at ${groupSpecPath}`);
if (!existsSync(indexPath)) die(`index.html missing at ${indexPath}`);

const groupSpec = JSON.parse(readFileSync(groupSpecPath, "utf8"));
const indexHtml = readFileSync(indexPath, "utf8");

const expected = Array.isArray(groupSpec.sfx) ? groupSpec.sfx : [];

if (expected.length === 0) {
  console.log("✓ sfx-verify: 0 SFX cues in group_spec — nothing to check");
  process.exit(0);
}

// ---------- Extract all <audio src="assets/sfx/X"> tags from index.html ----------
// Use a two-step extraction (tag → attributes) so attribute order doesn't matter.
const audioTags = [];
const audioTagRe = /<audio\b[^>]*>/g;
let m;
while ((m = audioTagRe.exec(indexHtml)) !== null) {
  const tag = m[0];
  const srcMatch = tag.match(/\bsrc=["'](?:\.?\/)?(?:assets\/)?sfx\/([\w.-]+\.mp3)["']/);
  if (!srcMatch) continue;
  const tMatch = tag.match(/\bdata-start=["']([0-9.]+)["']/);
  const dMatch = tag.match(/\bdata-duration=["']([0-9.]+)["']/);
  audioTags.push({
    file: srcMatch[1],
    t: tMatch ? parseFloat(tMatch[1]) : null,
    duration: dMatch ? parseFloat(dMatch[1]) : null,
    raw: tag,
  });
}

// ---------- Verify each expected cue against emitted tags ----------
const failures = [];
const matchedTagIdx = new Set();

for (const cue of expected) {
  // Find the closest unmatched tag with the same file. Allows multi-instances
  // of the same SFX file at different times (e.g. multiple `pop.mp3` cues).
  let bestIdx = -1;
  let bestDrift = Infinity;
  for (let i = 0; i < audioTags.length; i++) {
    if (matchedTagIdx.has(i)) continue;
    if (audioTags[i].file !== cue.file) continue;
    if (audioTags[i].t == null) continue;
    const drift = Math.abs(audioTags[i].t - cue.t);
    if (drift < bestDrift) {
      bestDrift = drift;
      bestIdx = i;
    }
  }
  if (bestIdx < 0) {
    failures.push(
      `MISSING: ${cue.file} expected at t=${cue.t}s (scene ${cue.scene_id}, note "${cue.note}") — no matching <audio> in index.html`,
    );
    continue;
  }
  matchedTagIdx.add(bestIdx);
  const tag = audioTags[bestIdx];
  if (bestDrift > DRIFT_TOLERANCE_S) {
    failures.push(
      `DRIFT: ${cue.file} expected t=${cue.t}s, found t=${tag.t}s (drift ${bestDrift.toFixed(3)}s > ${DRIFT_TOLERANCE_S}s) — agent eyeballed instead of computing`,
    );
  }
  if (tag.duration != null && Math.abs(tag.duration - cue.duration) > 0.001) {
    failures.push(
      `DURATION: ${cue.file} expected data-duration=${cue.duration}s (from manifest), found ${tag.duration}s — never truncate; decay tail belongs in the next clip`,
    );
  }
}

// Flag extra <audio src="sfx/..."> not in group_spec (finalize improvised).
for (let i = 0; i < audioTags.length; i++) {
  if (matchedTagIdx.has(i)) continue;
  const t = audioTags[i];
  failures.push(
    `UNEXPECTED: index.html emits assets/sfx/${t.file} at t=${t.t}s but no matching cue in group_spec.sfx — finalize must not invent SFX (translator-only role)`,
  );
}

if (failures.length === 0) {
  console.log(`✓ sfx-verify: ${expected.length} cue(s), all matched within ±${DRIFT_TOLERANCE_S}s drift`);
  process.exit(0);
}

console.error(`✗ sfx-verify: ${failures.length} failure(s)`);
for (const f of failures) console.error(`  ${f}`);
process.exit(1);
