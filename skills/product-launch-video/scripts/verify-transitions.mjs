#!/usr/bin/env node
// Phase 4c — deterministic gate over inject-transitions.mjs output (no subagent).
//
// Re-parses the emitted index.html and asserts, for the transitions[] in group_spec.json,
// that the injector did its job correctly — so finalize never has to eyeball injector
// mechanics (only the creative result at the seam snapshots).
//
// Asserts:
//   (1) For each tier:"b" record: a tween block on window.__timelines["main"] references
//       BOTH #el-<from> and #el-<to>.
//   (2) The two wrappers' windows OVERLAP by ~duration_s (extend-outgoing-only: outgoing end
//       lands `duration_s` past the incoming start).
//   (3) The two overlapping wrappers are on DIFFERENT data-track-index.
//   (4) GLOBAL: no two scene clips that overlap in time share a track-index (the same invariant
//       hyperframes lint enforces — we check it here too so a bug is caught before render).
//
// Usage:
//   node verify-transitions.mjs --group-spec ./group_spec.json --index ./index.html
//
// Exit 0 = all invariants hold (or 0 tier-b transitions). Exit 1 = injector bug.

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : def;
};

const groupSpecPath = resolve(flag("group-spec", "./group_spec.json"));
const indexPath = resolve(flag("index", "./index.html"));

const fail = [];
function bail(msg) {
  console.error(`✗ verify-transitions.mjs: ${msg}`);
  process.exit(1);
}

if (!existsSync(groupSpecPath)) bail(`group_spec.json not found at ${groupSpecPath}`);
if (!existsSync(indexPath)) bail(`index.html not found at ${indexPath}`);

let spec;
try {
  spec = JSON.parse(readFileSync(groupSpecPath, "utf8"));
} catch (e) {
  bail(`group_spec.json parse: ${e.message}`);
}
const transitions = Array.isArray(spec.transitions) ? spec.transitions : [];
// Both tiers get the same wrapper overlap + cross-track invariants (Tier-A's morph
// lives inside the scenes, but its seam wrapper-crossfade obeys the same mechanics).
const injectable = transitions.filter((t) => t.tier === "b" || t.tier === "a");

// Authoritative SCENE id set (same as the injector) — captions/voice/bgm/sfx are
// NOT scenes and are excluded from the scene track-overlap invariant. Captions
// legitimately spans the whole video on track 12; scenes ping-pong on 0/1.
const sceneIds = new Set();
for (const g of spec.groups || []) for (const sid of g.scene_ids || []) sceneIds.add(sid);

const html = readFileSync(indexPath, "utf8");

// ---------- parse SCENE clip wrappers (only known scene ids) ----------
const clipRe = /<div\s+id="el-([A-Za-z0-9_]+)"([\s\S]*?)><\/div>/g;
const clips = new Map();
let cm;
while ((cm = clipRe.exec(html)) !== null) {
  if (!sceneIds.has(cm[1])) continue; // skip captions / voice / bgm / sfx
  const attrs = cm[2];
  const num = (re) => {
    const m = attrs.match(re);
    return m ? Number(m[1]) : null;
  };
  clips.set(cm[1], {
    sid: cm[1],
    start: num(/data-start="([\d.]+)"/),
    duration: num(/data-duration="([\d.]+)"/),
    track: num(/data-track-index="(\d+)"/) ?? 0,
  });
}

const EPS = 0.011; // ms-rounding tolerance (prep rounds to 3 dp)
const overlaps = (a, b) =>
  a.start < b.start + b.duration - EPS && b.start < a.start + a.duration - EPS;

// ---------- (4) GLOBAL no-same-track-overlap ----------
const all = [...clips.values()];
for (let i = 0; i < all.length; i++) {
  for (let j = i + 1; j < all.length; j++) {
    const a = all[i];
    const b = all[j];
    if (a.track === b.track && overlaps(a, b)) {
      fail.push(
        `same-track overlap: ${a.sid}[t${a.track} ${a.start}→${(a.start + a.duration).toFixed(3)}] ` +
          `and ${b.sid}[t${b.track} ${b.start}→${(b.start + b.duration).toFixed(3)}] — lint would reject this`,
      );
    }
  }
}

// ---------- per-transition (1)(2)(3) ----------
// Isolate the injected transition block so the tween-reference check only looks there.
const blockMatch = html.match(/scene transitions \(injected[\s\S]*?\}\)\(\);/);
const txBlock = blockMatch ? blockMatch[0] : "";
if (injectable.length > 0 && !txBlock) {
  fail.push(
    `group_spec has ${injectable.length} transition(s) but no injected transition block in index.html`,
  );
}

for (const t of injectable) {
  const from = clips.get(t.from);
  const to = clips.get(t.to);
  if (!from || !to) {
    fail.push(`transition ${t.from}→${t.to}: wrapper(s) missing (from=${!!from}, to=${!!to})`);
    continue;
  }
  // (1) tween references both ids
  if (!txBlock.includes(`"#el-${t.from}"`) || !txBlock.includes(`"#el-${t.to}"`)) {
    fail.push(
      `transition ${t.from}→${t.to}: injected block does not reference both #el-${t.from} and #el-${t.to}`,
    );
  }
  // (2) overlap ≈ duration_s (extend-outgoing-only: fromEnd - toStart ≈ dur)
  const fromEnd = from.start + from.duration;
  const overlapAmt = Number((fromEnd - to.start).toFixed(3));
  const dur = Number(t.duration_s) || 0.5;
  if (Math.abs(overlapAmt - dur) > EPS) {
    fail.push(
      `transition ${t.from}→${t.to}: overlap ${overlapAmt}s ≠ duration ${dur}s ` +
        `(from end ${fromEnd.toFixed(3)}, to start ${to.start})`,
    );
  }
  // (3) overlapping wrappers on different tracks
  if (from.track === to.track) {
    fail.push(`transition ${t.from}→${t.to}: both wrappers on track ${from.track} — must differ`);
  }
}

// ---------- report ----------
if (fail.length) {
  console.error(`✗ verify-transitions: ${fail.length} invariant failure(s):`);
  for (const f of fail) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `✓ verify-transitions: ${injectable.length} transition(s) verified ` +
    `(overlap==duration, cross-track, both ids referenced, no same-track overlap)`,
);
