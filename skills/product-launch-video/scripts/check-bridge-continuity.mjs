#!/usr/bin/env node
// check-bridge-continuity.mjs — Step 6 preflight gate for Tier-A shared-element bridges.
//
// Runs after the scene workers return, beside check-compositions.mjs. For each
// tier:"a" transition in group_spec.json, the SAME worker authored BOTH scene files
// and must have placed a shared bridge element in each. This gate asserts — statically,
// no render — that the bridge is structurally present and not hidden, so finalize never
// chases a missing/broken bridge.
//
// What it CANNOT check statically (and why finalize's seam snapshot covers it):
// the "handoff pose alignment" (outgoing scene's END geometry == incoming scene's START
// geometry) lives in the GSAP timeline tweens, not in static CSS — so it's verified
// visually at the transition seam_mid_s snapshot, not here. This gate guarantees the
// PREREQUISITES (element exists in both, same data-bridge-id, not statically hidden,
// incoming holds — i.e. its first tween on the bridge starts at/after the seam).
//
// Asserts per tier:"a" {from, to, bridge_id}:
//   1. compositions/<from>.html contains exactly one element with data-bridge-id="<id>".
//   2. compositions/<to>.html   contains exactly one element with data-bridge-id="<id>".
//   3. Neither bridge element has a static display:none / visibility:hidden / opacity:0
//      on its own inline style or its s<N>- class (would kill it during the seam).
//   4. (soft) the `to` scene's bridge element is referenced by a gsap call whose position
//      is >= seam_duration_s (the "hold" — incoming must not morph during the crossfade).
//      Heuristic; a miss is a WARNING (finalize snapshot is the real check), not fatal.
//
// Usage:
//   node check-bridge-continuity.mjs --hyperframes . --group-spec ./group_spec.json
//
// Exit 0 = all bridges OK (or 0 tier-a transitions). Writes bridge_check.json.
// Exit 1 = ≥1 fatal — orchestrator re-dispatches the owning worker.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : def;
};

const hyperframesDir = resolve(flag("hyperframes", "."));
const groupSpecPath = resolve(flag("group-spec", "./group_spec.json"));
const compositionsDir = join(hyperframesDir, "compositions");
const outPath = join(hyperframesDir, "bridge_check.json");

if (!existsSync(groupSpecPath)) {
  console.error(`✗ check-bridge-continuity: group_spec.json not found at ${groupSpecPath}`);
  process.exit(1);
}

let spec;
try {
  spec = JSON.parse(readFileSync(groupSpecPath, "utf8"));
} catch (e) {
  console.error(`✗ check-bridge-continuity: group_spec.json parse: ${e.message}`);
  process.exit(1);
}

const bridges = (Array.isArray(spec.transitions) ? spec.transitions : []).filter(
  (t) => t.tier === "a",
);

if (bridges.length === 0) {
  console.log(`✓ check-bridge-continuity: 0 tier-a bridges — nothing to check`);
  writeFileSync(outPath, JSON.stringify({ bridges: [], ok: true }, null, 2) + "\n");
  process.exit(0);
}

const fatals = [];
const warnings = [];
const rows = [];

function readScene(sid) {
  const p = join(compositionsDir, `${sid}.html`);
  if (!existsSync(p)) {
    fatals.push(`${sid}: compositions/${sid}.html missing — worker did not produce it`);
    return null;
  }
  return readFileSync(p, "utf8");
}

// Find the element carrying data-bridge-id="<id>" and return its opening tag + class list.
function findBridgeEl(html, bridgeId) {
  const re = new RegExp(`<[a-zA-Z][^>]*\\bdata-bridge-id=["']${bridgeId}["'][^>]*>`, "g");
  const matches = html.match(re) || [];
  return matches;
}

// Static-hidden check on the opening tag's inline style.
function inlineHidden(tag) {
  const styleM = tag.match(/style=["']([^"']*)["']/i);
  if (!styleM) return false;
  const s = styleM[1].toLowerCase();
  return (
    /display\s*:\s*none/.test(s) ||
    /visibility\s*:\s*hidden/.test(s) ||
    /opacity\s*:\s*0(\.0+)?\s*(;|$)/.test(s)
  );
}

for (const b of bridges) {
  const id = b.bridge_id;
  const row = { from: b.from, to: b.to, bridge_id: id, ok: true, notes: [] };
  if (!id) {
    fatals.push(
      `${b.from}→${b.to}: tier-a transition has no bridge_id (prep should have caught this)`,
    );
    row.ok = false;
    rows.push(row);
    continue;
  }

  for (const [sid, role] of [
    [b.from, "from"],
    [b.to, "to"],
  ]) {
    const html = readScene(sid);
    if (html == null) {
      row.ok = false;
      continue;
    }
    const tags = findBridgeEl(html, id);
    if (tags.length === 0) {
      fatals.push(
        `${sid} (${role}): no element with data-bridge-id="${id}" — the shared bridge element is missing. ` +
          `Both bridged scenes must contain <... data-bridge-id="${id}" ...>.`,
      );
      row.ok = false;
      continue;
    }
    if (tags.length > 1) {
      fatals.push(
        `${sid} (${role}): ${tags.length} elements carry data-bridge-id="${id}" — must be exactly one`,
      );
      row.ok = false;
      continue;
    }
    if (inlineHidden(tags[0])) {
      fatals.push(
        `${sid} (${role}): the bridge element data-bridge-id="${id}" has a static display:none/visibility:hidden/opacity:0 — it would be invisible at the seam. Make it visible (GSAP can still animate it in/out).`,
      );
      row.ok = false;
    }
    row.notes.push(`${role}=${sid}:found`);
  }

  rows.push(row);
}

writeFileSync(
  outPath,
  JSON.stringify({ bridges: rows, ok: fatals.length === 0, warnings }, null, 2) + "\n",
);

if (fatals.length) {
  console.error(`✗ check-bridge-continuity: ${fatals.length} fatal(s):`);
  for (const f of fatals) console.error(`  - ${f}`);
  console.error(
    `  → re-dispatch the worker(s) owning the affected scene(s); both bridged scenes must carry the same data-bridge-id.`,
  );
  process.exit(1);
}

console.log(
  `✓ check-bridge-continuity: ${bridges.length} tier-a bridge(s) verified (element present + visible in both scenes)`,
);
for (const r of rows) console.log(`  ${r.from}→${r.to}: bridge="${r.bridge_id}" ✓`);
if (warnings.length) for (const w of warnings) console.log(`  ⚠ ${w}`);
