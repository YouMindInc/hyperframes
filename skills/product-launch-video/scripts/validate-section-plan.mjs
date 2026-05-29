#!/usr/bin/env node
// Validate ./section_plan.md references effects that exist in
// skills/hyperframes-animation/rules/ — the single source of truth for
// the effect catalog (see also visual-design/effects-catalog.md which is
// auto-generated from the same rules dir).
//
// Usage:
//   node validate-section-plan.mjs [section_plan_path] [rules_dir]
//
// Exit 0 = pass; non-zero = fail (errors on stderr).
// Pipeline contract: run after Phase 3 dispatch returns, before Phase 4 begins.

import { readFileSync, readdirSync } from "node:fs";
import { resolve, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

function loadKnownEffects(rulesDir) {
  return new Set(
    readdirSync(rulesDir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => basename(f, ".md")),
  );
}

const planPath = resolve(process.argv[2] || "./section_plan.md");

const here = dirname(fileURLToPath(import.meta.url));
const defaultRulesDir = resolve(here, "../../hyperframes-animation/rules");
const rulesDir = resolve(process.argv[3] || defaultRulesDir);

let plan;
try {
  plan = readFileSync(planPath, "utf8");
} catch {
  console.error(`✗ section_plan.md not found at ${planPath}`);
  process.exit(1);
}

let known;
try {
  known = loadKnownEffects(rulesDir);
} catch (e) {
  console.error(`✗ rules dir not readable at ${rulesDir}: ${e.message}`);
  process.exit(1);
}

// Load design-system/chunks/index.json (best-effort, relative to plan dir).
// Drives three preset-conditional checks:
//   1. Surface anchor is REQUIRED when any component declares a `surface` field
//      (surface-aware presets). Legacy presets ship components with no `surface`
//      field → check is skipped.
//   2. `avoids_same_scene` cross-check between cited components — preset
//      invariants like "single signature element per plate" live there. Missing
//      index.json → cross-check is skipped (prep.mjs still validates existence).
//   3. Motifs anchor id validation when index.json.motifs_file is set — every
//      cited motif id must appear as a `## motif: <id>` heading in motifs.md.
const chunksIndexPath = resolve(dirname(planPath), "design-system/chunks/index.json");
let chunksIndex = null;
try {
  chunksIndex = JSON.parse(readFileSync(chunksIndexPath, "utf8"));
} catch {
  // chunks/index.json absent or unreadable — surface / avoids_same_scene checks skipped.
}

const componentsById = new Map();
const knownSurfaces = new Set();
let surfaceRequired = false;
if (chunksIndex?.components) {
  for (const c of chunksIndex.components) {
    componentsById.set(c.id, c);
    if (c.surface) {
      surfaceRequired = true;
      knownSurfaces.add(c.surface);
    }
  }
}

// Load chunks/motifs.md and extract known motif ids from `## motif: <id>` headings.
// Skipped when preset declares no §M (motifs_file null in index.json). The check
// is best-effort: motifs.md unreadable → log inside the loop the first time we
// hit a Motifs anchor and downgrade to syntax-only validation.
const knownMotifIds = new Set();
let motifsLoadError = null;
if (chunksIndex?.motifs_file) {
  const motifsPath = resolve(dirname(planPath), "design-system", chunksIndex.motifs_file);
  try {
    const motifsMd = readFileSync(motifsPath, "utf8");
    for (const m of motifsMd.matchAll(/^##\s+motif:\s+([a-z0-9-]+)\s*$/gm)) {
      knownMotifIds.add(m[1]);
    }
  } catch (e) {
    motifsLoadError = `motifs.md referenced by index.json (${chunksIndex.motifs_file}) but unreadable: ${e.message}`;
  }
}

// SFX manifest (self-located relative to this script, like the default rules dir
// above). Used to validate that each cited `<file>.mp3` actually exists in the
// library — turning what used to be a silent Phase-4a drop (prep.mjs only pushed
// an anomaly) into a loud, in-loop Phase-3 error. SFX itself stays optional: a
// scene with no anchor is fine; only a *cited* file that doesn't exist fails.
// Best-effort: an unreadable manifest downgrades to syntax-only validation
// (prep.mjs still drops unknown files as a backstop).
let sfxKnownFiles = null;
try {
  const sfxManifestPath = resolve(here, "../assets/sfx/manifest.json");
  const sfxManifest = JSON.parse(readFileSync(sfxManifestPath, "utf8"));
  sfxKnownFiles = new Set(
    Object.values(sfxManifest)
      .map((e) => e?.file)
      .filter(Boolean),
  );
} catch {
  // manifest absent/unreadable — skip membership check.
}

const errors = [];
let totalEffectsCited = 0;
let totalComponentsCited = 0;
let totalSurfaceCommitments = 0;
let totalMotifsCited = 0;
let totalSfxCited = 0;

// ---- Per-scene anchor validation (Phase 4a contract) ----
// Every "## Scene N:" block must have all three required anchors. Phase 4a's
// prep.mjs reads these deterministically; missing anchors break the build.
// **Components:** and **Blueprint:** are optional (soft) anchors; if present
// they must parse cleanly. prep.mjs resolves Components ids against
// design-system/chunks/index.json — this validator only enforces the syntactic
// shape (backtick-wrapped ids), not the existence check.
const sceneHeadRe = /^## Scene\s+(\d+)\s*:\s*(.+?)\s*$/gm;
const heads = [...plan.matchAll(sceneHeadRe)];
const ANCHORS = ["Effects", "Duration", "Continuity"];
const OPTIONAL_ANCHORS = ["Blueprint", "Components", "Motifs"];

const hasAnchor = (body, name) => {
  const re = new RegExp(`^\\*\\*${name}:\\*\\*`, "mi");
  return re.test(body);
};

const hasAny = (text, patterns) => patterns.some((pattern) => pattern.test(text));

const hierarchyActionRe =
  /\b(exit|hide|hidden|compact|demote|supporting|rail|background|outside|safe zone|safe-zone)\b/i;
const supportingRe =
  /\b(supporting|demote|rail|side rail|bottom rail|background texture|low-contrast|lower contrast|smaller|outside)\b/i;

function hierarchyRisk(body) {
  const text = body.toLowerCase();
  const multiAct = /\b(multi[- ]?act|three[- ]?act|act\s+[abc]|\bfocal points?)\b/i.test(text);
  const hasAction =
    /\b(cta|get started|call[- ]?to[- ]?action|button|sign up|book demo|start trial|download|subscribe|contact sales|action headline|payoff frame|payoff close|closing action)\b/i.test(
      text,
    );
  const hasSocialProof =
    /\b(logos?|logo strip|customer logos?|social[- ]proof|trusted by|testimonial|customers?|partners?)\b/i.test(
      text,
    );
  const hasDataProof = hasAny(text, [
    /\bstats?\b/i,
    /\bstat[- ]?counter\b/i,
    /\bmetrics?\b/i,
    /\bkpis?\b/i,
    /\bproof cluster\b/i,
    /\bproof rail\b/i,
    /\bchart\b/i,
    /\bcount[- ]?up\b/i,
    /\bpolicy compliance\b/i,
    /\bhours saved\b/i,
    /\byield\b/i,
  ]);
  return {
    multiAct,
    hasAction,
    hasSocialProof,
    hasDataProof,
    risky: multiAct || (hasAction && (hasSocialProof || hasDataProof)),
  };
}

if (heads.length === 0) {
  errors.push(
    "No '## Scene N: <name>' headings found — section_plan must have at least one scene block.",
  );
}

for (let i = 0; i < heads.length; i++) {
  const m = heads[i];
  const sceneNumber = m[1];
  const sceneId = `scene_${sceneNumber}`;
  const start = m.index + m[0].length;
  const end = i + 1 < heads.length ? heads[i + 1].index : plan.length;
  const body = plan.slice(start, end);

  const found = {};
  for (const a of ANCHORS) {
    const re = new RegExp(`^\\*\\*${a}:\\*\\*\\s*(.*)$`, "m");
    const am = body.match(re);
    if (!am) {
      errors.push(`${sceneId}: missing **${a}:** anchor`);
    } else {
      found[a] = am[1].trim();
    }
  }

  // Surface anchor (preset-conditional): required when chunks/index.json shows
  // any component declares a `surface` field. Value must be one of those declared
  // surfaces. Mixing surfaces within one scene breaks the preset's visual
  // contract — surface registers are paired with specific component shapes that
  // don't compose across surfaces.
  const surfaceMatch = body.match(/^\*\*Surface:\*\*\s*(.*)$/m);
  if (surfaceRequired && !surfaceMatch) {
    errors.push(
      `${sceneId}: missing **Surface:** anchor — preset declares surface-aware components (allowed: ${[...knownSurfaces].sort().join(", ")})`,
    );
  } else if (surfaceMatch) {
    const v = surfaceMatch[1].trim().toLowerCase();
    if (surfaceRequired && !knownSurfaces.has(v)) {
      errors.push(
        `${sceneId}: **Surface:** "${v}" not declared by any component (allowed: ${[...knownSurfaces].sort().join(", ")})`,
      );
    } else {
      found.Surface = v;
      totalSurfaceCommitments++;
    }
  }

  if (found.Continuity != null) {
    const v = found.Continuity.toLowerCase();
    if (v !== "break" && v !== "continue") {
      errors.push(
        `${sceneId}: **Continuity:** must be "break" or "continue" (got "${found.Continuity}")`,
      );
    } else if (i === 0 && v !== "break") {
      errors.push(`${sceneId}: scene 1 must be **Continuity:** break`);
    }
  }

  if (found.Duration != null) {
    const dm = found.Duration.match(/[\d.]+/);
    if (!dm || !(parseFloat(dm[0]) > 0)) {
      errors.push(`${sceneId}: **Duration:** must be a positive float (got "${found.Duration}")`);
    }
  }

  // SFX anchor (OPTIONAL / soft): a scene with no sound effects simply omits the
  // anchor — absence is a valid "no SFX" decision, not an error. When the anchor
  // IS present we validate its shape AND that every cited `<file>.mp3` exists in
  // the SFX manifest. That membership check is what lets the anchor stay optional
  // safely: a typo'd filename surfaces here (Phase 3, fixable in-loop) instead of
  // being silently dropped by prep.mjs at Phase 4a. `**SFX:** none` is still
  // accepted (explicit zero-cue), just no longer required.
  const sfxLineRe = /^\*\*SFX:\*\*[ \t]*(.*)$/m;
  const sfxLineM = body.match(sfxLineRe);
  if (sfxLineM) {
    const trailer = sfxLineM[1].trim();
    if (trailer.toLowerCase() === "none") {
      // explicit zero-cue decision — OK
    } else if (trailer !== "") {
      errors.push(
        `${sceneId}: **SFX:** header line must be empty or "none" — put cue bullets on subsequent lines (got "${trailer}")`,
      );
    } else {
      const after = body.slice(sfxLineM.index + sfxLineM[0].length).split("\n");
      const citedFiles = [];
      for (const line of after) {
        const t = line.trim();
        if (t === "") continue;
        if (!t.startsWith("-")) break; // next anchor / prose / scene heading
        const fm = t.match(/`([^`]+\.mp3)`/);
        if (fm) citedFiles.push(fm[1]);
      }
      if (citedFiles.length === 0) {
        errors.push(
          `${sceneId}: **SFX:** header present but no \`<file>.mp3\` bullet follows — add cue bullets or remove the anchor`,
        );
      } else if (sfxKnownFiles) {
        for (const f of citedFiles) {
          if (!sfxKnownFiles.has(f)) {
            errors.push(
              `${sceneId}: **SFX:** cites "${f}" not in the SFX manifest (known: ${[...sfxKnownFiles].sort().join(", ")})`,
            );
          } else {
            totalSfxCited++;
          }
        }
      } else {
        totalSfxCited += citedFiles.length;
      }
    }
  }

  const risk = hierarchyRisk(body);
  if (risk.risky) {
    const needs = risk.multiAct ? "multi-act scene" : "action/payoff + proof scene";
    if (!hasAnchor(body, "PrimarySubjectTimeline")) {
      errors.push(
        `${sceneId}: ${needs} must include **PrimarySubjectTimeline:** with exactly one primary subject per time range`,
      );
    } else if (!/\bprimary\b/i.test(body)) {
      errors.push(`${sceneId}: **PrimarySubjectTimeline:** must name the primary subject(s)`);
    }

    if (!hasAnchor(body, "Handoff")) {
      errors.push(
        `${sceneId}: ${needs} must include **Handoff:** explaining how previous primary exits, hides, compacts, or demotes`,
      );
    } else if (!hierarchyActionRe.test(body)) {
      errors.push(
        `${sceneId}: **Handoff:** must include an explicit action: exit, hide, compact, demote, supporting, rail, or outside safe zone`,
      );
    }

    if (risk.hasAction && (risk.hasSocialProof || risk.hasDataProof) && !supportingRe.test(body)) {
      errors.push(
        `${sceneId}: action/payoff + proof can coexist only if proof is explicitly supporting/demoted/rail/background/outside the primary bbox`,
      );
    }
  }

  if (found.Effects != null) {
    const ids = [...found.Effects.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    if (ids.length === 0) {
      errors.push(`${sceneId}: **Effects:** has no backtick-wrapped ids`);
    } else {
      for (const id of ids) {
        if (!known.has(id)) {
          errors.push(
            `${sceneId}: **Effects:** cites unknown rule "${id}" — not under hyperframes-animation/rules/`,
          );
        } else {
          totalEffectsCited++;
        }
      }
    }
  }

  // Optional **Components:** anchor — list of backticked ids referencing
  // design-system/chunks/components/<id>.html. Existence is enforced by
  // prep.mjs (which has filesystem access to chunks/index.json); here we only
  // require well-formed syntax if the anchor is present.
  //
  // Optional **Motifs:** anchor — preset-conditional: when index.json.motifs_file
  // is set we cross-check each backticked id against the `## motif: <id>` headings
  // in motifs.md. When the preset declared no §M (motifs_file null) we still
  // syntax-validate the anchor but skip the id existence check (motif unknown is
  // accepted as a soft cite).
  let pickedIds = [];
  for (const a of OPTIONAL_ANCHORS) {
    const re = new RegExp(`^\\*\\*${a}:\\*\\*\\s*(.*)$`, "m");
    const am = body.match(re);
    if (!am) continue;
    const raw = am[1].trim();
    if (a === "Components") {
      const ids = [...raw.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
      if (raw && ids.length === 0) {
        errors.push(
          `${sceneId}: **Components:** present but has no backtick-wrapped ids (got "${raw}")`,
        );
      }
      for (const id of ids) {
        if (!/^[a-z0-9-]+$/.test(id)) {
          errors.push(
            `${sceneId}: **Components:** id "${id}" — must be lowercase + digits + dashes (matches design-system/chunks/components/<id>.html)`,
          );
        } else {
          totalComponentsCited++;
          pickedIds.push(id);
        }
      }
    } else if (a === "Motifs") {
      const ids = [...raw.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
      if (raw && ids.length === 0) {
        errors.push(
          `${sceneId}: **Motifs:** present but has no backtick-wrapped ids (got "${raw}")`,
        );
      }
      for (const id of ids) {
        if (!/^[a-z0-9-]+$/.test(id)) {
          errors.push(
            `${sceneId}: **Motifs:** id "${id}" — must be lowercase + digits + dashes`,
          );
          continue;
        }
        totalMotifsCited++;
        if (chunksIndex?.motifs_file) {
          if (motifsLoadError) {
            errors.push(`${sceneId}: ${motifsLoadError}`);
            motifsLoadError = null; // report once
          } else if (!knownMotifIds.has(id)) {
            errors.push(
              `${sceneId}: **Motifs:** id "${id}" not in chunks/motifs.md (known: ${[...knownMotifIds].sort().join(", ") || "(empty)"})`,
            );
          }
        }
      }
    }
  }

  // avoids_same_scene cross-check: every pair of cited components is checked
  // against each other's avoids_same_scene list (from chunks/index.json
  // component frontmatter). Preset invariants like "single signature element
  // per plate" live there; the specific mutex pairs are preset-declared.
  // Skipped when chunks/index.json wasn't loaded.
  if (chunksIndex && pickedIds.length > 1) {
    for (let i = 0; i < pickedIds.length; i++) {
      for (let j = i + 1; j < pickedIds.length; j++) {
        const a = pickedIds[i];
        const b = pickedIds[j];
        const ca = componentsById.get(a);
        const cb = componentsById.get(b);
        if (!ca || !cb) continue; // unknown ids — prep.mjs will reject them
        const aAvoidsB = (ca.avoids_same_scene || []).includes(b);
        const bAvoidsA = (cb.avoids_same_scene || []).includes(a);
        if (aAvoidsB || bAvoidsA) {
          errors.push(
            `${sceneId}: **Components:** "${a}" and "${b}" conflict (avoids_same_scene) — pick one and re-plan`,
          );
        }
      }
    }
  }

  // Surface ↔ component surface consistency: when scene commits to a surface
  // and a cited component carries a different `surface` field, that's a visual
  // contract break (e.g. paper-only component on a blue scene). Surface-agnostic
  // components (no `surface` field) pass through.
  if (found.Surface && chunksIndex) {
    for (const id of pickedIds) {
      const c = componentsById.get(id);
      if (!c || !c.surface) continue;
      if (c.surface !== found.Surface) {
        errors.push(
          `${sceneId}: **Components:** "${id}" is surface=${c.surface}, but scene **Surface:** is ${found.Surface} — surface mix breaks preset visual contract`,
        );
      }
    }
  }
}

// Sanity: if no scenes had any known effect, complain at the top level (per-scene
// errors will have surfaced the specifics, but make the overall failure obvious).
if (heads.length > 0 && totalEffectsCited === 0 && errors.length === 0) {
  errors.push(
    "Zero known effects cited across all scenes — every scene's **Effects:** must include at least one rule from hyperframes-animation/rules/.",
  );
}

if (errors.length) {
  console.error(`✗ ${planPath}: ${errors.length} issue(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error(`\n  Known rules: \`ls ${rulesDir}\``);
  process.exit(1);
}

const componentsNote =
  totalComponentsCited > 0 ? `, ${totalComponentsCited} component citation(s)` : "";
const surfaceNote =
  totalSurfaceCommitments > 0 ? `, ${totalSurfaceCommitments} surface commitment(s)` : "";
const motifsNote = totalMotifsCited > 0 ? `, ${totalMotifsCited} motif citation(s)` : "";
const sfxNote = totalSfxCited > 0 ? `, ${totalSfxCited} SFX cue(s)` : "";
console.log(
  `✓ ${planPath}: ${heads.length} scene(s), ${totalEffectsCited} effect citation(s)${componentsNote}${surfaceNote}${motifsNote}${sfxNote} — OK`,
);
