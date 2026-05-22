#!/usr/bin/env node
// Phase 4a — prep + group plan (deterministic replacement for the
// hyperframes-prep subagent).
//
// Reads:  section_plan.md (Phase 3), narrator_scripts.json (Phase 2),
//         audio_meta.json (Phase 2.5, optional), research/ assets (Phase 1),
//         hyperframes-animation/rules/*.md (existence only).
// Writes: hyperframes/public/<assets>, ./group_spec.json.
//         If hyperframes/ is missing, scaffolds it via `npx hyperframes init`.
//
// Usage:
//   node prep.mjs --section-plan <path> --narrator-scripts <path> \
//                 --rules-dir <abs> --research <path> --hyperframes <path> \
//                 --out <path> [--audio-meta <path>] [--scenes-per-group <int>]
//
// Exit 0 = group_spec.json written + summary on stdout.
// Exit 1 = structural failure (missing anchor / missing rule / bad value) on stderr.

import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, extname, join, resolve } from "node:path";

// ---------- argv ----------
const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : def;
};
function die(msg) {
  console.error(`✗ prep.mjs: ${msg}`);
  process.exit(1);
}

const sectionPlanPath = resolve(flag("section-plan", "./section_plan.md"));
const narratorScriptsPath = resolve(
  flag("narrator-scripts", "./narrator_scripts.json"),
);
const audioMetaPath = flag("audio-meta") ? resolve(flag("audio-meta")) : null;
const rulesDirArg = flag("rules-dir");
if (!rulesDirArg) die("Missing required --rules-dir");
const rulesDir = resolve(rulesDirArg);
const researchDir = resolve(flag("research", "./research"));
const hyperframesDir = resolve(flag("hyperframes", "./hyperframes"));
const outPath = resolve(flag("out", "./group_spec.json"));
const scenesPerGroupMax = parseInt(flag("scenes-per-group", "2"), 10);
if (!isFinite(scenesPerGroupMax) || scenesPerGroupMax < 1) {
  die(`--scenes-per-group must be a positive integer (got "${flag("scenes-per-group")}")`);
}

// ---------- Step 1: bootstrap hyperframes/ ----------
if (!existsSync(hyperframesDir)) {
  console.log(`hyperframes/ missing → npx hyperframes init ${hyperframesDir}`);
  const r = spawnSync(
    "npx",
    [
      "hyperframes",
      "init",
      hyperframesDir,
      "--example",
      "blank",
      "--non-interactive",
      "--skip-skills",
    ],
    { stdio: "inherit" },
  );
  if (r.status !== 0) die("npx hyperframes init failed");
}

// ---------- Step 2: copy research assets → hyperframes/public/ ----------
const publicDir = join(hyperframesDir, "public");
mkdirSync(publicDir, { recursive: true });

const ASSET_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);
const collisions = [];
let copied = 0;

function walk(dir) {
  if (!existsSync(dir)) return;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.isFile() && ASSET_EXTS.has(extname(ent.name).toLowerCase())) {
      const target = join(publicDir, ent.name);
      if (existsSync(target)) {
        collisions.push({ kept: target, skipped: p });
      } else {
        copyFileSync(p, target);
        copied++;
      }
    }
  }
}
walk(researchDir);

// ---------- Step 3: parse section_plan.md ----------
if (!existsSync(sectionPlanPath))
  die(`section_plan.md not found at ${sectionPlanPath}`);
const planText = readFileSync(sectionPlanPath, "utf8");

const sceneHeadRe = /^## Scene\s+(\d+)\s*:\s*(.+?)\s*$/gm;
const heads = [...planText.matchAll(sceneHeadRe)];
if (heads.length === 0)
  die("no '## Scene N: <name>' headings found in section_plan.md");

const ANCHORS = ["Effects", "Duration", "Continuity", "PrimaryAsset"];

function anchorRe(name) {
  return new RegExp(`^\\*\\*${name}:\\*\\*\\s*(.*)$`, "m");
}

function parseSceneBlock(body, sceneId, isFirst) {
  const raw = {};
  let lastAnchorEnd = 0;
  for (const a of ANCHORS) {
    const m = body.match(anchorRe(a));
    if (!m) die(`${sceneId}: missing **${a}:** anchor in section_plan.md`);
    raw[a] = m[1].trim();
    const end = m.index + m[0].length;
    if (end > lastAnchorEnd) lastAnchorEnd = end;
  }

  // Effects: ordered backtick-wrapped ids inside [...]
  const effects = [...raw.Effects.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
  if (effects.length === 0)
    die(`${sceneId}: **Effects:** has no backtick-wrapped ids`);

  // Duration: leading float
  const durM = raw.Duration.match(/[\d.]+/);
  if (!durM)
    die(`${sceneId}: **Duration:** could not parse float from "${raw.Duration}"`);
  const estimatedDuration_s = parseFloat(durM[0]);
  if (!isFinite(estimatedDuration_s) || estimatedDuration_s <= 0)
    die(`${sceneId}: **Duration:** ${estimatedDuration_s} is not a positive float`);

  // Continuity: break | continue (scene 1 must be break)
  const cont = raw.Continuity.toLowerCase();
  if (cont !== "break" && cont !== "continue")
    die(
      `${sceneId}: **Continuity:** must be "break" or "continue" (got "${raw.Continuity}")`,
    );
  if (isFirst && cont !== "break")
    die(`${sceneId}: scene 1 must be **Continuity:** break`);

  // PrimaryAsset: empty or starts with "public/"
  let primary = raw.PrimaryAsset.trim();
  if (primary === "" || /^\(?none\)?$/i.test(primary)) primary = "";
  if (primary && !primary.startsWith("public/"))
    die(
      `${sceneId}: **PrimaryAsset:** must start with "public/" or be empty/none (got "${raw.PrimaryAsset}")`,
    );

  // creative_brief = everything after the LAST anchor line, verbatim
  const brief = body.slice(lastAnchorEnd).replace(/^\s*\n+/, "");

  return {
    effects,
    estimatedDuration_s,
    continuity: cont,
    primary_visual_asset: primary,
    creative_brief: brief,
  };
}

const scenes = [];
for (let i = 0; i < heads.length; i++) {
  const m = heads[i];
  const sceneNumber = parseInt(m[1], 10);
  const sceneName = m[2].trim();
  const start = m.index + m[0].length;
  const end = i + 1 < heads.length ? heads[i + 1].index : planText.length;
  const body = planText.slice(start, end);
  const sceneId = `scene_${sceneNumber}`;
  const parsed = parseSceneBlock(body, sceneId, i === 0);
  scenes.push({ sceneNumber, sceneId, sceneName, ...parsed });
}

// ---------- Step 4: resolve rule_paths ----------
const ruleStatCache = new Map();
function statRule(p) {
  if (ruleStatCache.has(p)) return ruleStatCache.get(p);
  let st;
  try {
    st = statSync(p);
  } catch {
    st = null;
  }
  ruleStatCache.set(p, st);
  return st;
}
for (const s of scenes) {
  s.rule_paths = s.effects.map((id) => {
    const p = join(rulesDir, `${id}.md`);
    const st = statRule(p);
    if (!st || !st.isFile() || st.size === 0)
      die(`${s.sceneId}: rule file empty or missing: ${p}`);
    return p;
  });
}

// ---------- Step 5: cross-check narrator + audio merge ----------
if (!existsSync(narratorScriptsPath))
  die(`narrator_scripts.json not found at ${narratorScriptsPath}`);
const narratorScripts = JSON.parse(readFileSync(narratorScriptsPath, "utf8"));
const narratorByNumber = new Map(
  (narratorScripts.scenes || []).map((s) => [s.sceneNumber, s]),
);

let audioMeta = null;
if (audioMetaPath) {
  if (existsSync(audioMetaPath)) {
    audioMeta = JSON.parse(readFileSync(audioMetaPath, "utf8"));
  } else {
    console.log(
      `audio-meta path given but file missing — proceeding without audio`,
    );
  }
}

const anomalies = [];

for (const s of scenes) {
  // duration cross-check
  const narrator = narratorByNumber.get(s.sceneNumber);
  if (narrator?.estimatedDuration != null) {
    const m = String(narrator.estimatedDuration).match(/[\d.]+/);
    const narratorDur = m ? parseFloat(m[0]) : NaN;
    if (
      isFinite(narratorDur) &&
      Math.abs(narratorDur - s.estimatedDuration_s) > 0.01
    ) {
      anomalies.push(
        `${s.sceneId}: duration mismatch — section_plan ${s.estimatedDuration_s}s vs narrator ${narratorDur}s (using section_plan)`,
      );
    }
  }

  // audio merge
  s.voicePath = "";
  s.wordsPath = "";
  if (audioMeta) {
    const a = audioMeta.scenes?.[s.sceneId];
    if (a) {
      if (isFinite(a.voiceDuration) && a.voiceDuration > 0) {
        s.estimatedDuration_s = a.voiceDuration;
      }
      s.voicePath = a.voicePath || "";
      s.wordsPath = a.wordsPath || "";
    }
  }

  // disk checks (drop missing voice/words paths to empty + record anomaly)
  if (s.voicePath && !existsSync(join(hyperframesDir, s.voicePath))) {
    anomalies.push(
      `${s.sceneId}: voicePath "${s.voicePath}" not on disk — dropping to ""`,
    );
    s.voicePath = "";
  }
  if (s.wordsPath && !existsSync(join(hyperframesDir, s.wordsPath))) {
    anomalies.push(
      `${s.sceneId}: wordsPath "${s.wordsPath}" not on disk — dropping to ""`,
    );
    s.wordsPath = "";
  }
  if (
    s.primary_visual_asset &&
    !existsSync(join(hyperframesDir, s.primary_visual_asset))
  ) {
    anomalies.push(
      `${s.sceneId}: primary_visual_asset "${s.primary_visual_asset}" not on disk — Phase 4b worker may fail`,
    );
  }
}

// ---------- Step 6: group by continuity, cap=N ----------
const groups = [];
let cur = null;
for (const s of scenes) {
  const startNew =
    s.continuity === "break" ||
    !cur ||
    cur.scene_ids.length >= scenesPerGroupMax;
  if (startNew) {
    if (cur) groups.push(cur);
    cur = {
      worker_id: `w${groups.length + 1}`,
      scene_ids: [],
      scenes: {},
    };
  }
  cur.scene_ids.push(s.sceneId);
  cur.scenes[s.sceneId] = {
    effects: s.effects,
    rule_paths: s.rule_paths,
    primary_visual_asset: s.primary_visual_asset,
    estimatedDuration_s: s.estimatedDuration_s,
    voicePath: s.voicePath,
    wordsPath: s.wordsPath,
    creative_brief: s.creative_brief,
  };
}
if (cur) groups.push(cur);

// ---------- Step 7: emit group_spec.json ----------
const total_duration_s = scenes.reduce(
  (sum, s) => sum + s.estimatedDuration_s,
  0,
);
// BGM may still be rendering (audio.mjs spawns Lyria detached and exits before
// it finishes). Trust audio_meta.bgm_path; Phase 4c does the final on-disk
// check before emitting the <audio> element.
let bgm_path = "";
if (audioMeta?.bgm_path) {
  bgm_path = audioMeta.bgm_path;
  if (!existsSync(join(hyperframesDir, audioMeta.bgm_path))) {
    if (audioMeta.bgm_pending) {
      anomalies.push(
        `bgm "${audioMeta.bgm_path}" still rendering (bgm_pending=true) — Phase 4c will re-check before emitting <audio>`,
      );
    } else {
      anomalies.push(
        `bgm "${audioMeta.bgm_path}" listed in audio_meta but missing — Phase 4c will skip if still absent`,
      );
    }
  }
}

const spec = {
  scenes_per_group_max: scenesPerGroupMax,
  total_scenes: scenes.length,
  total_duration_s: Number(total_duration_s.toFixed(3)),
  bgm_path,
  groups,
};

writeFileSync(outPath, JSON.stringify(spec, null, 2));

// ---------- Step 8: summary ----------
console.log(`✓ wrote ${outPath}`);
console.log(
  `  scenes: ${spec.total_scenes}, groups: ${groups.length}, total: ${spec.total_duration_s}s`,
);
console.log(`  bgm: ${bgm_path || "(none)"}`);
console.log(`  assets copied: ${copied} (collisions skipped: ${collisions.length})`);
for (const g of groups) {
  const items = g.scene_ids
    .map((id) => `${id}(${g.scenes[id].estimatedDuration_s}s)`)
    .join(", ");
  console.log(`  ${g.worker_id}: ${items}`);
}
if (collisions.length) {
  console.log(`\nasset collisions (first-wins, skipped duplicates):`);
  for (const c of collisions.slice(0, 5))
    console.log(`  ${basename(c.kept)} ← skipped ${c.skipped}`);
  if (collisions.length > 5)
    console.log(`  …and ${collisions.length - 5} more`);
}
if (anomalies.length) {
  console.log(`\nanomalies (non-fatal):`);
  for (const a of anomalies) console.log(`  - ${a}`);
}
