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
import { transitionsByName, tierATypes } from "./lib/transition-registry.mjs";

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
// Drives two preset-conditional checks:
//   1. Surface anchor is REQUIRED when any component declares a `surface` field
//      (surface-aware presets). Legacy presets ship components with no `surface`
//      field → check is skipped.
//   2. `avoids_same_scene` cross-check between cited components — preset
//      invariants like "single signature element per plate" live there. Missing
//      index.json → cross-check is skipped (prep.mjs still validates existence).
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
const OPTIONAL_ANCHORS = ["Blueprint", "Components"];

// Transition vocabulary — loaded from the single source of truth so this
// validator never drifts from prep/injector. Absence of the anchor is fine
// (prep default-fills); when present, type/direction/duration are checked here.
let TX_BY_NAME = new Map();
let TX_TIER_A = new Set();
try {
  TX_BY_NAME = transitionsByName();
  TX_TIER_A = tierATypes();
} catch (e) {
  // Non-fatal: if the registry can't be read, skip Transition validation rather
  // than block the whole plan check. prep.mjs will surface a hard error later.
  console.error(
    `⚠ transition registry unreadable, skipping **Transition:** validation — ${e.message}`,
  );
}

const hasAnchor = (body, name) => {
  const re = new RegExp(`^\\*\\*${name}:\\*\\*`, "mi");
  return re.test(body);
};

const hasAny = (text, patterns) => patterns.some((pattern) => pattern.test(text));

const hierarchyActionRe =
  /\b(exit|hide|hidden|compact|demote|supporting|rail|background|outside|safe zone|safe-zone)\b/i;
const supportingRe =
  /\b(supporting|demote|rail|side rail|bottom rail|background texture|low-contrast|lower contrast|smaller|outside)\b/i;

// Strip negated clauses so a scene that only mentions proof to DENY it (e.g. a
// pure CTA: "there is no logo strip / customer logo / stat counter / chart")
// doesn't read as a proof scene. Each negation eats to the next sentence stop.
// This is what lets a CTA stop writing anti-regex defensive prose.
function stripNegations(text) {
  return text.replace(
    /\b(no|not|never|without|isn'?t|aren'?t|don'?t|doesn'?t|won'?t|cannot|can'?t)\b[^.;:]*/gi,
    " ",
  );
}

function hierarchyRisk(body) {
  const text = body.toLowerCase();
  // Proof signals are read from (1) cited component ids — an unambiguous,
  // structured signal preferred over fuzzy prose scans — and (2) the prose with
  // negated clauses removed, using PHRASE patterns (not bare "logo"/"customer",
  // which over-trigger on brand wordmarks and incidental mentions).
  const proofText = stripNegations(text);
  const compM = body.match(/^\*\*Components:\*\*\s*(.*)$/m);
  const compIds = compM ? [...compM[1].matchAll(/`([^`]+)`/g)].map((m) => m[1]) : [];
  const compProof = compIds.some((id) => /logo|proof|testimonial|customer/i.test(id));
  const compData = compIds.some((id) => /stat|chart|metric|kpi|counter/i.test(id));

  const multiAct = /\b(multi[- ]?act|three[- ]?act|act\s+[abc]|\bfocal points?)\b/i.test(text);
  const hasAction =
    /\b(cta|get started|call[- ]?to[- ]?action|button|sign up|book demo|start trial|download|subscribe|contact sales|action headline|payoff frame|payoff close|closing action)\b/i.test(
      text,
    );
  const hasSocialProof =
    compProof ||
    hasAny(proofText, [
      /logo[- ]?(strip|grid|wall|cloud|chain|row|rail|lockup)/i,
      /\btrusted by\b/i,
      /social[- ]proof/i,
      /\btestimonials?\b/i,
      /customer logos?/i,
      /enterprise logos?/i,
      /\bbrands? you (know|trust)\b/i,
    ]);
  const hasDataProof =
    compData ||
    hasAny(proofText, [
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

// File shape: no project-level preamble. section_plan.md must contain only an
// optional H1 title + the "## Scene N:" blocks. Anything substantial before the
// first scene heading is a write-only preamble — prep.mjs slices per-scene from
// the first "## Scene", the validator iterates scene blocks, and the scene
// worker is forbidden from reading section_plan.md, so a preamble reaches no
// consumer. Global invariants travel via per-scene prose + dedicated channels
// (voice_file / Captions flag / tokens.css / easings.js). See guide.md §2.
if (heads.length > 0) {
  const preamble = plan
    .slice(0, heads[0].index)
    .replace(/^﻿?[ \t]*#[ \t]+.*$/m, "") // allow one leading H1 title line
    .replace(/\s+/g, " ")
    .trim();
  if (preamble.length > 200) {
    errors.push(
      `project-level preamble detected before "## Scene 1" (${preamble.length} chars beyond an H1 title) — section_plan.md must contain only an H1 title and "## Scene N:" blocks. Global rules reach workers via per-scene prose + dedicated channels (voice_file / Captions flag / tokens.css / easings.js), never a preamble.`,
    );
  }
}

for (let i = 0; i < heads.length; i++) {
  const m = heads[i];
  const sceneNumber = m[1];
  const sceneId = `scene_${sceneNumber}`;
  const start = m.index + m[0].length;
  const end = i + 1 < heads.length ? heads[i + 1].index : plan.length;
  const body = plan.slice(start, end);

  // Block order: all **Anchor:** lines (incl. SFX bullets, PrimarySubjectTimeline,
  // Handoff) must precede the free prose. Once a prose sentence appears, no anchor
  // line may follow — interleaving makes prep.mjs's "creative_brief = text after
  // the last recognized anchor" slice unpredictable (e.g. PST/Handoff dropping out
  // of, or prose leaking into, the worker's brief). See guide.md §2 "块内顺序".
  // PST/Handoff continuation lines (timecode-led) and bullets are NOT prose.
  {
    const ANCHOR_LINE_RE =
      /^\*\*(Effects|Duration|Continuity|Surface|Blueprint|Components|Transition|Bridge|SFX|PrimarySubjectTimeline|Handoff):\*\*/;
    const blockLines = body.split("\n");
    let firstProse = -1;
    let lastAnchor = -1;
    for (let li = 0; li < blockLines.length; li++) {
      const t = blockLines[li].trim();
      if (t === "") continue;
      if (ANCHOR_LINE_RE.test(t)) {
        lastAnchor = li;
        continue;
      }
      if (/^[-*]/.test(t)) continue; // SFX cue bullets
      if (/^[\d>#`]/.test(t)) continue; // timecode continuations / quotes / code / fences
      if (firstProse === -1) firstProse = li;
    }
    if (firstProse !== -1 && lastAnchor > firstProse) {
      errors.push(
        `${sceneId}: an **Anchor:** line appears after the prose began (prose at body line ${firstProse}, anchor at ${lastAnchor}) — put ALL anchors (incl. SFX/PrimarySubjectTimeline/Handoff) before the prose`,
      );
    }
  }

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

  let continuityVal = null;
  if (found.Continuity != null) {
    const v = found.Continuity.toLowerCase();
    if (v !== "break" && v !== "continue") {
      errors.push(
        `${sceneId}: **Continuity:** must be "break" or "continue" (got "${found.Continuity}")`,
      );
    } else if (i === 0 && v !== "break") {
      errors.push(`${sceneId}: scene 1 must be **Continuity:** break`);
    } else {
      continuityVal = v;
    }
  }

  // Transition (OPTIONAL): how this scene is ENTERED. Shape:
  //   **Transition:** <type> [DIRECTION] [<dur>s]
  // e.g. `blur-crossfade`, `push-slide LEFT`, `zoom-through 0.3s`.
  // Absent → prep default-fills. Scene 1's is the open (ignored as a between-
  // scene transition) but still shape-checked if present. Only validated when
  // the registry loaded (TX_BY_NAME non-empty).
  // continue ⟺ Tier-A: track whether this scene NAMED a Tier-A (shared-element)
  // transition, so the converse check after this block can enforce that a
  // `continue` scene IS a Tier-A morph (the only reason two scenes share a
  // worker). Stays false when no Transition anchor / registry unreadable.
  let namedTierA = false;
  const txMatch = body.match(/^\*\*Transition:\*\*\s*(.*)$/m);
  if (txMatch && TX_BY_NAME.size > 0) {
    const raw = txMatch[1].trim();
    if (raw === "") {
      errors.push(`${sceneId}: **Transition:** is empty — name a type or omit the anchor`);
    } else {
      const tokens = raw.split(/\s+/);
      const type = tokens[0].toLowerCase();
      const rec = TX_BY_NAME.get(type);
      const isTierA = TX_TIER_A.has(type);
      namedTierA = isTierA;
      if (!rec && !isTierA) {
        errors.push(
          `${sceneId}: **Transition:** unknown type "${type}" (known: ${[...TX_BY_NAME.keys()].join(", ")})`,
        );
      } else {
        // break boundary must not name a Tier-A (shared-element) transition —
        // those require the same worker to author both scenes (continue only).
        if (continuityVal === "break" && isTierA) {
          errors.push(
            `${sceneId}: **Transition:** "${type}" is a shared-element (Tier-A) transition but **Continuity: break** — Tier-A needs **Continuity: continue** (same worker authors both scenes)`,
          );
        }
        // direction / duration trailing tokens (Tier-A types take neither)
        for (const tok of tokens.slice(1)) {
          const t = tok.toLowerCase();
          if (/^[\d.]+s$/.test(t)) {
            const dur = parseFloat(t);
            if (!(dur > 0) || dur > 2.0) {
              errors.push(
                `${sceneId}: **Transition:** duration "${tok}" out of range (0 < dur ≤ 2.0s)`,
              );
            }
          } else {
            const dir = tok.toUpperCase();
            const allowed = rec?.directions || [];
            if (!allowed.includes(dir)) {
              errors.push(
                `${sceneId}: **Transition:** "${type}" does not take direction "${tok}"${allowed.length ? ` (allowed: ${allowed.join(", ")})` : " (this type is non-directional)"}`,
              );
            }
          }
        }
      }

      // Bridge anchor (Tier-A only): `shared-element` REQUIRES a **Bridge:** anchor
      // (single backtick-wrapped kebab-case id) AND **Continuity: continue** (both
      // scenes must land in one worker). A non-Tier-A scene must NOT carry **Bridge:**.
      const bridgeMatch = body.match(/^\*\*Bridge:\*\*\s*(.*)$/m);
      const bridgeRaw = bridgeMatch ? bridgeMatch[1].trim() : null;
      const bridgeId = bridgeRaw ? (bridgeRaw.match(/`([^`]+)`/)?.[1] ?? null) : null;
      if (isTierA) {
        if (!bridgeId) {
          errors.push(
            `${sceneId}: **Transition:** "${type}" (Tier-A) requires a **Bridge:** \`<kebab-id>\` anchor naming the shared element`,
          );
        } else if (!/^[a-z][a-z0-9-]*$/.test(bridgeId)) {
          errors.push(
            `${sceneId}: **Bridge:** "${bridgeId}" must be kebab-case (lowercase, digits, hyphens)`,
          );
        }
        if (continuityVal === "continue" || continuityVal == null) {
          // ok (null = Continuity already errored above)
        }
      } else if (bridgeId) {
        errors.push(
          `${sceneId}: **Bridge:** present but **Transition:** is not a shared-element (Tier-A) type — Bridge only applies to Tier-A morphs`,
        );
      }
    }
  }

  // Converse of the break-rule above (A1): `continue` exists ONLY to land two
  // scenes in one worker for a Tier-A morph. A `continue` scene that did not name
  // a Tier-A (shared-element) transition — including one that omitted
  // **Transition:** to accept a Tier-B default — has no reason to share a worker.
  // Gated on the registry loading (else we'd false-positive when Transition
  // validation is skipped). scene 1 can't reach here (continue on scene 1 already
  // errored, leaving continuityVal null).
  if (TX_BY_NAME.size > 0 && continuityVal === "continue" && !namedTierA) {
    errors.push(
      `${sceneId}: **Continuity: continue** is reserved for shared-element (Tier-A) morphs — name **Transition: shared-element** + **Bridge:** \`<id>\`, or set **Continuity: break**`,
    );
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
const sfxNote = totalSfxCited > 0 ? `, ${totalSfxCited} SFX cue(s)` : "";
console.log(
  `✓ ${planPath}: ${heads.length} scene(s), ${totalEffectsCited} effect citation(s)${componentsNote}${surfaceNote}${sfxNote} — OK`,
);
