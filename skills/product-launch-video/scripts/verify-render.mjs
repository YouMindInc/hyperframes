#!/usr/bin/env node
// Phase 4c (engine) — deterministic post-render mp4 verification. No subagent.
//
// The old finalize "Step 6" three-check, lifted out of the agent: a render
// either produced a plausible mp4 or it didn't, and that's a pure function of
// the file + ffprobe + group_spec.total_duration_s. The finalize/visual-QA
// agent no longer hand-runs stat/ffprobe or eyeballs the duration delta.
//
// Reads:  ./group_spec.json (total_duration_s) + the rendered mp4 on disk.
// Checks: 1. file exists
//         2. size >= MIN_BYTES (a 0-frame / header-only mp4 is a failed render)
//         3. ffprobe container duration within DUR_TOLERANCE_S of
//            group_spec.total_duration_s
//
// Usage:
//   node verify-render.mjs --hyperframes . --group-spec ./group_spec.json \
//        [--output renders/video.mp4]
//
// Exit 0 = all three pass (summary on stdout).
// Exit 1 = any check fails (stderr names which + the numbers).

import { existsSync, readFileSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";

const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : def;
};
function die(msg) {
  console.error(`✗ verify-render.mjs: ${msg}`);
  process.exit(1);
}

const MIN_BYTES = 10 * 1024; // 10 KB — below this is a header-only / 0-frame render
const DUR_TOLERANCE_S = 0.5; // same tolerance the old finalize Step 6 used

const hyperframesDir = resolve(flag("hyperframes", "."));
const groupSpecPath = resolve(flag("group-spec", join(hyperframesDir, "group_spec.json")));
const outputArg = flag("output", "renders/video.mp4");
const outputPath = resolve(hyperframesDir, outputArg);

if (!existsSync(groupSpecPath)) die(`group_spec.json not found at ${groupSpecPath}`);
let expectedDuration;
try {
  expectedDuration = Number(JSON.parse(readFileSync(groupSpecPath, "utf8")).total_duration_s);
} catch (e) {
  die(`group_spec.json parse: ${e.message}`);
}
if (!isFinite(expectedDuration) || expectedDuration <= 0)
  die(`group_spec.total_duration_s missing or non-positive`);

// Check 1: exists
if (!existsSync(outputPath)) die(`no render at ${outputPath} — render did not produce output`);

// Check 2: size
const size = statSync(outputPath).size;
if (size < MIN_BYTES)
  die(`render is only ${size}B (< ${MIN_BYTES}B) — header-only / 0-frame render; check render stderr`);

// Check 3: ffprobe duration within tolerance
const r = spawnSync(
  "ffprobe",
  ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", outputPath],
  { encoding: "utf8" },
);
if (r.status !== 0) {
  die(`ffprobe failed on ${outputPath} (exit ${r.status}) — file may be corrupt: ${(r.stderr || "").trim().slice(0, 200)}`);
}
const actualDuration = parseFloat((r.stdout || "").trim());
if (!isFinite(actualDuration))
  die(`ffprobe returned no parseable duration for ${outputPath}`);
const drift = Math.abs(actualDuration - expectedDuration);
if (drift > DUR_TOLERANCE_S) {
  die(
    `render duration ${actualDuration.toFixed(3)}s drifts ${drift.toFixed(3)}s from group_spec ${expectedDuration}s (> ${DUR_TOLERANCE_S}s) — a scene clip likely has the wrong data-duration, or a sub-comp failed to mount (static-frame fallback runs full length)`,
  );
}

const mb = (size / (1024 * 1024)).toFixed(2);
console.log(`✓ verify-render: ${outputArg}`);
console.log(`  size:     ${mb} MB (${size}B)`);
console.log(`  duration: ${actualDuration.toFixed(3)}s vs expected ${expectedDuration}s (drift ${drift.toFixed(3)}s ≤ ${DUR_TOLERANCE_S}s)`);
