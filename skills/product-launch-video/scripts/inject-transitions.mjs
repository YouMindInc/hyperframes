#!/usr/bin/env node
// Phase 4c — inject Tier-B scene-to-scene transitions into index.html (deterministic; no subagent).
//
// Reads: ./index.html (written by assemble-index.mjs) + ./group_spec.json (transitions[] from prep).
// Writes: ./index.html in place — wrapper data-start/data-duration/data-track-index adjusted +
//         a transition <script> appended that stamps GSAP onto window.__timelines["main"].
//
// Mechanism (verified by prototype render 2026-05-31; see TRANSITION-REGISTRY.md):
//   For each transitions[] record with tier:"b":
//     1. EXTEND #el-<from> wrapper data-duration by duration_s  (holds its final frame —
//        runtime external-slot branch, core/src/runtime/init.ts:1393-1410)
//     2. PULL #el-<to> wrapper data-start earlier by duration_s (creates the overlap window)
//     3. (after all overlaps) PING-PONG every clip's data-track-index 0/1/0/1… in play order so
//        no two OVERLAPPING wrappers share a track (same-track overlap is a lint fatal —
//        core/src/lint/rules/composition.ts). Higher track composites on top = incoming over outgoing.
//     4. STAMP the registry gsap_template into window.__timelines["main"] at T = overlap-start.
//
//   The injector touches ONLY index.html wrappers — never a scene file's root data-duration, so the
//   assemble-index data-duration↔estimatedDuration_s cross-check stays intact. Scene-internal timelines
//   are driven independently by the runtime; the wrapper tween on the master timeline is orthogonal
//   (no double-seek). Tier-A records are skipped in Phase 1 (Tier-A is later, worker-authored).
//
// Usage:
//   node inject-transitions.mjs --group-spec ./group_spec.json --hyperframes .
//
// Exit 0 = index.html rewritten (or no-op: 0 tier-b transitions). Exit 1 = injector bug.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { transitionsByName } from "./lib/transition-registry.mjs";

const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : def;
};
function die(msg) {
  console.error(`✗ inject-transitions.mjs: ${msg}`);
  process.exit(1);
}

const groupSpecPath = resolve(flag("group-spec", "./group_spec.json"));
const hyperframesDir = resolve(flag("hyperframes", "."));
const indexPath = join(hyperframesDir, "index.html");

if (!existsSync(groupSpecPath)) die(`group_spec.json not found at ${groupSpecPath}`);
if (!existsSync(indexPath))
  die(`index.html not found at ${indexPath} — run assemble-index.mjs first`);

let spec;
try {
  spec = JSON.parse(readFileSync(groupSpecPath, "utf8"));
} catch (e) {
  die(`group_spec.json parse: ${e.message}`);
}

const transitions = Array.isArray(spec.transitions) ? spec.transitions : [];
// Both tiers get the SAME wrapper overlap + ping-pong-track mechanics; only the
// stamped GSAP differs. Tier B: a registry transition on the wrappers. Tier A:
// a short plain wrapper crossfade — the morph itself is authored INSIDE the two
// scenes by the worker (the master timeline can't reach into a sub-comp), so here
// we only crossfade the wrappers so bg/title swap while the aligned bridge element
// reads as continuous. (Verified by render-prototype 2026-05-31.)
const injectable = transitions.filter((t) => t.tier === "b" || t.tier === "a");

let html = readFileSync(indexPath, "utf8");

if (injectable.length === 0) {
  console.log(`✓ inject-transitions: 0 transitions to inject — index.html unchanged`);
  process.exit(0);
}

let txByName;
try {
  txByName = transitionsByName();
} catch (e) {
  die(`transition registry: ${e.message}`);
}

// The authoritative SCENE id set — from group_spec.groups[].scene_ids. The
// captions / voice / bgm / sfx clips also use id="el-…" + (for captions)
// data-composition-src, but they are NOT scenes: they must keep their own tracks
// (10/11/12/20+) and must NOT join the scene ping-pong. Driving off the known
// scene list (not a data-composition-src regex) is what keeps captions out.
const sceneIds = new Set();
for (const g of spec.groups || []) for (const sid of g.scene_ids || []) sceneIds.add(sid);
if (sceneIds.size === 0)
  die(`group_spec.groups[].scene_ids is empty — cannot identify scene clips`);

// ---------- parse SCENE clip wrappers out of index.html ----------
// assemble-index emits each scene clip as a stable multi-line block:
//   <div\n  id="el-<sid>"\n  data-composition-id=...\n  data-composition-src=...\n
//   data-start="X"\n  data-duration="Y"\n  data-track-index="0"\n ...></div>
// We only keep clips whose sid is a known scene (sceneIds) — captions (el-captions)
// and audio (el-<sid>-voice) are excluded. Play order comes from data-start ascending.
const clipRe = /<div\s+id="el-([A-Za-z0-9_]+)"([\s\S]*?)><\/div>/g;
const clips = new Map(); // sid -> { sid, start, duration, track, block }
let cm;
while ((cm = clipRe.exec(html)) !== null) {
  const sid = cm[1];
  if (!sceneIds.has(sid)) continue; // skip captions / voice / bgm / sfx
  const block = cm[0];
  const attrs = cm[2];
  const num = (re) => {
    const m = attrs.match(re);
    return m ? Number(m[1]) : null;
  };
  const start = num(/data-start="([\d.]+)"/);
  const duration = num(/data-duration="([\d.]+)"/);
  const track = num(/data-track-index="(\d+)"/);
  if (start == null || duration == null) {
    die(`scene clip #el-${sid} missing data-start/data-duration — assemble-index output malformed`);
  }
  clips.set(sid, { sid, start, duration, track: track ?? 0, block });
}

if (clips.size === 0)
  die(`no scene clip wrappers found in index.html for scene_ids: ${[...sceneIds].join(", ")}`);

// ---------- apply overlaps ----------
const gsapLines = [];
const applied = [];
for (const t of injectable) {
  const fromClip = clips.get(t.from);
  const toClip = clips.get(t.to);
  if (!fromClip || !toClip) {
    die(
      `transition ${t.from}→${t.to}: clip wrapper(s) not in index.html (from=${!!fromClip}, to=${!!toClip})`,
    );
  }
  const dur = Number(t.duration_s) || 0.5;

  // EXTEND-OUTGOING-ONLY overlap. The transition plays in [cut, cut + dur], where
  // `cut` is the incoming scene's start (= the outgoing scene's natural end, since
  // scenes tile). We extend ONLY the outgoing wrapper by `dur` so it lingers (held
  // final frame) across the window while the incoming — already present from `cut`
  // on the higher track — fades/pushes IN over it. We do NOT move any scene's
  // data-start, so voice/SFX/caption timing (all keyed to the original start_s)
  // stays perfectly in sync. Overlap window == tween window == `dur`. No dead frames.
  const T = Number(toClip.start.toFixed(3)); // cut = incoming start
  fromClip.duration = Number((fromClip.duration + dur).toFixed(3));

  gsapLines.push(...buildGsap(t, dur, T));
  applied.push({ ...t, T, durApplied: dur });
}

// ---------- mandatory 0/1 ping-pong track reassignment ----------
// Walk scene clips in play order (start asc, stable by sid) and alternate track 0/1.
// Overlapping neighbors always land on different tracks; non-adjacent clips reuse a
// track but never overlap, so overlapping_clips_same_track stays clean.
const ordered = [...clips.values()].sort((a, b) =>
  a.start !== b.start ? a.start - b.start : a.sid.localeCompare(b.sid),
);
ordered.forEach((c, i) => {
  c.track = i % 2;
});

// ---------- rewrite each clip block in html ----------
for (const c of clips.values()) {
  let nb = c.block
    .replace(/data-start="[\d.]+"/, `data-start="${c.start}"`)
    .replace(/data-duration="[\d.]+"/, `data-duration="${c.duration}"`)
    .replace(/data-track-index="\d+"/, `data-track-index="${c.track}"`);
  if (nb === c.block && c.block.includes(`data-track-index`)) {
    // attrs unchanged is fine; only fail if the block had no track attr to rewrite
  }
  html = html.replace(c.block, nb);
}

// ---------- inject GSAP after the master timeline creation ----------
// assemble-index emits:  window.__timelines["main"] = gsap.timeline({ paused: true });
const masterAnchor = 'window.__timelines["main"] = gsap.timeline({ paused: true });';
if (!html.includes(masterAnchor)) {
  die(`master timeline anchor not found in index.html — expected: ${masterAnchor}`);
}
const block = [
  masterAnchor,
  "      // ── scene transitions (injected by inject-transitions.mjs) ──",
  '      (function () { var tl = window.__timelines["main"];',
  ...gsapLines.map((l) => "        " + l),
  "      })();",
].join("\n");
html = html.replace(masterAnchor, block);

writeFileSync(indexPath, html);

// ---------- summary ----------
const nB = applied.filter((a) => a.tier === "b").length;
const nA = applied.filter((a) => a.tier === "a").length;
console.log(
  `✓ inject-transitions: ${applied.length} transition(s) stamped into index.html (tier-b ${nB}, tier-a ${nA})`,
);
for (const a of applied) {
  const dir = a.direction ? ` ${a.direction}` : "";
  const tag = a.tier === "a" ? ` [Tier-A bridge:${a.bridge_id || "?"}]` : "";
  console.log(
    `  ${a.from}→${a.to}: ${a.type}${dir} ${a.durApplied}s @ T=${a.T}s${tag} (from ext +${a.durApplied}s, to start→${a.T})`,
  );
}
const trackSummary = [...clips.values()]
  .sort((a, b) => a.start - b.start)
  .map((c) => `${c.sid}[t${c.track} ${c.start}→${Number((c.start + c.duration).toFixed(3))}]`)
  .join(" ");
console.log(`  tracks: ${trackSummary}`);

// ===========================================================================
// build the GSAP lines for one transition.
function buildGsap(t, dur, T) {
  const OLD = `"#el-${t.from}"`;
  const NEW = `"#el-${t.to}"`;

  // Tier A: the worker authored the morph INSIDE the two scenes (outgoing tweens the
  // bridge element to a handoff pose; incoming starts there, holds for the seam, then
  // continues). The harness only crossfades the WRAPPERS so bg/title swap while the
  // aligned bridge element reads as one continuous element. No registry template.
  if (t.tier === "a") {
    return [
      `tl.to(${OLD}, { opacity: 0, duration: ${dur}, ease: "power1.inOut" }, ${T});`,
      `tl.fromTo(${NEW}, { opacity: 0 }, { opacity: 1, duration: ${dur}, ease: "power1.inOut" }, ${T});`,
    ];
  }

  const rec = txByName.get(t.type);
  if (!rec) die(`transition ${t.from}→${t.to}: type "${t.type}" not in registry`);

  // pick template: directional types have horizontal/vertical variants
  let template;
  let extra = {};
  if (rec.directions && rec.directions.length > 0) {
    const dir = (t.direction || rec.default_direction || rec.directions[0]).toUpperCase();
    const vertical = dir === "UP" || dir === "DOWN";
    template = vertical ? rec.gsap_template_vertical : rec.gsap_template_horizontal;
    if (!template)
      die(`transition ${t.type}: missing ${vertical ? "vertical" : "horizontal"} template`);
    if (vertical) {
      const dy = dir === "UP" ? -1080 : 1080;
      extra.__DY__ = String(dy);
      extra.__DYIN__ = String(-dy); // incoming enters from the opposite edge
    } else {
      const dx = dir === "LEFT" ? -1920 : 1920;
      extra.__DX__ = String(dx);
      extra.__DXIN__ = String(-dx);
    }
  } else {
    template = rec.gsap_template;
    if (!template) die(`transition ${t.type}: missing gsap_template`);
  }

  const subs = {
    __OLD__: OLD,
    __NEW__: NEW,
    __T__: String(T),
    __DUR__: String(dur),
    ...extra,
  };
  return template.map((line) => {
    let out = line;
    for (const [k, v] of Object.entries(subs)) out = out.split(k).join(v);
    return out;
  });
}
