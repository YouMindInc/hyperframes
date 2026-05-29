#!/usr/bin/env node
// Phase 4c (pre-flight) — deterministic gate runner + brief writer.
//
// Sits between assemble-index.mjs / sfx-verify.mjs and the finalize subagent.
// Owns the work that doesn't need LLM judgment:
//
//   1. Pin hyperframes CLI version (read from PROJECT_DIR/package.json) and
//      warm the npx cache with one `--yes hyperframes@<version> --version`
//      call. Subsequent CLI calls (here AND inside the agent) reuse this
//      pinned spec, so npx cache hits cleanly instead of cold-resolving on
//      every gate / snapshot / render. Eliminates the ~90s cache-miss /
//      "Missing module: contrast-audit" rabbit hole observed in prior runs.
//
//   2. Create `caption-overrides.json` empty-array shim if missing. The
//      captions runtime fetches this file at validate time; absence yields a
//      validate ✗ that previously cost finalize ~30s of chasing.
//
//   3. Run lint / validate / inspect once each with the pinned npx. Capture
//      stdout+stderr tails. Set `gates.{lint,validate,inspect}.ok` based on
//      exit code. Doesn't decide what to fix — that's still the agent's job
//      when something fails. But when all three pass, the agent skips Step 1
//      entirely (fast-path).
//
//   4. Compute snapshot timestamps from group_spec.json: per-scene midpoint
//      + high-risk extras (effect-driven heuristic mirroring the agent's old
//      rules). Hand to the agent verbatim so it doesn't recompute, dedupe,
//      or sort.
//
//   5. Run check-caption-keepout.mjs (when captions are enabled) — static
//      scan of compositions/scene_*.html for foreground `position: absolute`
//      elements with `bottom:` values inside the bottom-17% caption band.
//      Findings include Edit-ready old_string / new_string so the finalize
//      agent patches each scene in one Edit call per violation — no Read,
//      no search, no geometry math. Result lands in `caption_keepout`.
//
//   6. Write everything to `finalize_brief.json` for the agent to consume in
//      one Read. `preflight_clean = gates_clean && caption_keepout has 0
//      violations` — the agent uses this for fast-path decision.
//
// Always exits 0. Gate failures are surfaced via brief.gates[].ok=false so
// the agent can decide; this script doesn't gate the pipeline.
//
// Usage:
//   node preflight-finalize.mjs --group-spec ./group_spec.json --hyperframes . \
//        [--out ./finalize_brief.json]

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execSync, spawnSync } from "node:child_process";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { checkCaptionKeepout } from "./check-caption-keepout.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------- argv ----------
const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : def;
};

const groupSpecPath = resolve(flag("group-spec", "./group_spec.json"));
const hyperframesDir = resolve(flag("hyperframes", "."));
const outPath = resolve(flag("out", join(hyperframesDir, "finalize_brief.json")));

if (!existsSync(groupSpecPath)) {
  console.error(`✗ preflight-finalize: group_spec.json missing at ${groupSpecPath}`);
  process.exit(1);
}
const groupSpec = JSON.parse(readFileSync(groupSpecPath, "utf8"));

// ---------- 1. Resolve pinned hyperframes version ----------
// Try in order:
//   (a) package.json `dependencies` / `devDependencies` (typical when the
//       project locally installs hyperframes)
//   (b) any `hyperframes@<version>` substring in package.json (what
//       `hyperframes init` actually writes today — version is baked into
//       `scripts.{dev,check,render,publish}` strings, not declared as a dep)
//   (c) `latest`
// Using `npx --yes hyperframes@<v>` keys npx cache on version, so all three
// gates + subsequent agent calls reuse the same resolution. The agent gets
// `npx_prefix` in the brief and uses it verbatim.
let pinnedVersion = "latest";
const pkgPath = join(hyperframesDir, "package.json");
if (existsSync(pkgPath)) {
  const raw = readFileSync(pkgPath, "utf8");
  try {
    const pkg = JSON.parse(raw);
    const declared =
      pkg.dependencies?.hyperframes ||
      pkg.devDependencies?.hyperframes ||
      null;
    if (declared && typeof declared === "string") {
      pinnedVersion = declared.replace(/^[\^~>=<\s]+/, "").trim() || "latest";
    }
  } catch {
    /* fall through to substring scan */
  }
  if (pinnedVersion === "latest") {
    // Substring scan as fallback: matches `hyperframes@<version>` anywhere in
    // the file. Picks the first occurrence (typically `scripts.dev`).
    const m = raw.match(/hyperframes@([\d.][\d.\w\-+]*)/);
    if (m && m[1]) pinnedVersion = m[1];
  }
}
const npxPrefix = `npx --yes hyperframes@${pinnedVersion}`;

// Warm cache + verify install in one shot. If this fails, the agent will see
// gates.lint.ok=false (its `lint` invocation will fail the same way) and can
// diagnose with full context — we don't try to fix it here.
let cliVersionLine = "";
try {
  cliVersionLine = execSync(`${npxPrefix} --version`, {
    cwd: hyperframesDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 60_000,
  }).trim();
} catch (e) {
  cliVersionLine = `(failed to resolve hyperframes@${pinnedVersion}: ${e.message?.split("\n")[0] || "unknown"})`;
}

// ---------- 2. caption-overrides.json shim ----------
// The captions runtime fetches caption-overrides.json at validate time; if
// it 404s, validate logs an error that previously made finalize chase a
// non-issue. An empty `[]` is a no-op override list, semantically identical
// to absent — but the file existing silences the validate noise.
const deterministicFixes = [];
const captionOverridesPath = join(hyperframesDir, "caption-overrides.json");
if (!existsSync(captionOverridesPath)) {
  writeFileSync(captionOverridesPath, "[]\n");
  deterministicFixes.push("caption-overrides.json: created empty [] shim");
}

// ---------- 3. Run gates ----------
// Each gate: capture tail of combined stdout+stderr (~60 lines is enough for
// the agent to spot the problem without overloading dispatch). The agent
// re-runs only the specific gate it needs deeper output from.
function runGate(name, args, { timeoutMs = 90_000 } = {}) {
  const t0 = Date.now();
  const res = spawnSync("npx", ["--yes", `hyperframes@${pinnedVersion}`, ...args], {
    cwd: hyperframesDir,
    encoding: "utf8",
    timeout: timeoutMs,
  });
  const dur = ((Date.now() - t0) / 1000).toFixed(2);
  const out = (res.stdout || "") + (res.stderr || "");
  const lines = out.split("\n");
  const tail = lines.slice(-60).join("\n");
  return {
    ok: res.status === 0,
    exit_code: res.status,
    duration_s: parseFloat(dur),
    output_tail: tail,
  };
}

const gates = {
  lint: runGate("lint", ["lint"]),
  validate: runGate("validate", ["validate"]),
  inspect: runGate("inspect", ["inspect"]),
};
const gatesClean = gates.lint.ok && gates.validate.ok && gates.inspect.ok;

// ---------- 4. Snapshot timestamps ----------
// Per-scene midpoint always. High-risk extras (* 0.75 and * 0.9) when the
// scene is long OR uses a multi-act effect OR the brief signals
// PrimarySubjectTimeline. Mirrors agent's old in-context rule so the agent
// gets the same coverage without recomputing.
const MULTI_ACT_EFFECTS = new Set([
  "multi-phase-camera",
  "coordinate-target-zoom",
  "camera-cursor-tracking",
  "viewport-change",
  "3d-page-scroll",
  "cursor-click-ripple",
  "reactive-displacement",
  "card-morph-anchor",
  "scale-swap-transition",
]);
const HIGH_RISK_BRIEF_RX = /PrimarySubjectTimeline|multi-act|action-payoff|dense/i;

const sceneRows = [];
const tsSet = new Set();
function pushTs(t) {
  // Round to 3 decimals so HF CLI's --at parser doesn't reject and dedupe
  // across scene boundaries works.
  const rounded = Math.round(t * 1000) / 1000;
  tsSet.add(rounded);
}

for (const group of groupSpec.groups || []) {
  for (const sid of group.scene_ids || []) {
    const s = group.scenes?.[sid];
    if (!s) continue;
    const start = Number(s.start_s);
    const dur = Number(s.estimatedDuration_s);
    if (!isFinite(start) || !isFinite(dur) || dur <= 0) continue;
    const midpoint = start + dur * 0.5;
    pushTs(midpoint);
    const effects = Array.isArray(s.effects) ? s.effects : [];
    const brief = String(s.creative_brief || "");
    const highRisk =
      dur >= 8 ||
      effects.some((e) => MULTI_ACT_EFFECTS.has(e)) ||
      HIGH_RISK_BRIEF_RX.test(brief);
    const extras = [];
    if (highRisk) {
      const t075 = start + dur * 0.75;
      const t090 = start + dur * 0.9;
      pushTs(t075);
      pushTs(t090);
      extras.push(Math.round(t075 * 1000) / 1000, Math.round(t090 * 1000) / 1000);
    }
    sceneRows.push({
      scene_id: sid,
      start_s: start,
      duration_s: dur,
      midpoint_s: Math.round(midpoint * 1000) / 1000,
      high_risk_extras_s: extras,
      high_risk: highRisk,
      effects,
    });
  }
}

const snapshotTimes = [...tsSet].sort((a, b) => a - b);

// ---------- 5. Caption keep-out static check ----------
// Skipped automatically when group_spec.captions_enabled !== true. Findings
// include Edit-ready old_string / new_string strings so the finalize agent
// can patch each violation with one Edit call per scene file. No Read, no
// search, no math — the brief encodes the full transform.
const captionKeepout = checkCaptionKeepout({ groupSpec, hyperframesDir });
const keepoutClean = captionKeepout.violations.length === 0;
const preflightClean = gatesClean && keepoutClean;

// ---------- 6. Write brief ----------
const brief = {
  version: 2,
  generated_at: new Date().toISOString(),
  pinned_hyperframes_version: pinnedVersion,
  cli_version_line: cliVersionLine,
  npx_prefix: npxPrefix,
  gates_clean: gatesClean,
  gates,
  caption_keepout: captionKeepout,
  preflight_clean: preflightClean,
  deterministic_fixes_applied: deterministicFixes,
  snapshot_times_s: snapshotTimes,
  total_duration_s: groupSpec.total_duration_s,
  scenes: sceneRows,
};

writeFileSync(outPath, JSON.stringify(brief, null, 2) + "\n");

// ---------- stdout summary ----------
console.log(`✓ wrote ${outPath}`);
console.log(`  hyperframes:    ${pinnedVersion} (${cliVersionLine || "version unknown"})`);
console.log(`  preflight_clean: ${preflightClean ? "yes (gates + caption keep-out)" : "no"}`);
console.log(`    lint:     ${gates.lint.ok ? "✓" : "✗"} (${gates.lint.duration_s}s, exit ${gates.lint.exit_code})`);
console.log(`    validate: ${gates.validate.ok ? "✓" : "✗"} (${gates.validate.duration_s}s, exit ${gates.validate.exit_code})`);
console.log(`    inspect:  ${gates.inspect.ok ? "✓" : "✗"} (${gates.inspect.duration_s}s, exit ${gates.inspect.exit_code})`);
if (!captionKeepout.enabled) {
  console.log(`    caption-keepout: skipped (captions_enabled=false)`);
} else if (keepoutClean) {
  console.log(`    caption-keepout: ✓ (${captionKeepout.scenes_scanned} scene(s) scanned, 0 violations)`);
} else {
  console.log(`    caption-keepout: ✗ (${captionKeepout.violations.length} violation(s) across ${new Set(captionKeepout.violations.map(v => v.scene_id)).size} scene(s)) — see brief.caption_keepout.violations[] for Edit-ready strings`);
  for (const v of captionKeepout.violations) {
    console.log(`      [${v.scene_id}] ${v.selector} (${v.pattern}): element bottom at y=${v.element_bottom_y} → Edit \`${v.edit_old}\` → \`${v.edit_new}\``);
  }
}
console.log(`  snapshot_times: ${snapshotTimes.length} timestamp(s)`);
console.log(`  deterministic_fixes: ${deterministicFixes.length === 0 ? "none" : deterministicFixes.join("; ")}`);
if (!preflightClean) {
  if (!gatesClean) {
    console.log(`\n  ⚠ at least one CLI gate failed — finalize agent will diagnose from brief.gates[].output_tail`);
  }
  if (!keepoutClean) {
    console.log(`  ⚠ caption-keepout violations — finalize agent applies brief.caption_keepout.violations[].edit_old → edit_new in each file (one Edit per violation, no Read needed)`);
  }
}
