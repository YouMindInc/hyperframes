#!/usr/bin/env node
// Validate ./narrator_scripts.json against the Phase 2 canonical schema.
//
// Usage:
//   node validate-narrator-scripts.mjs [path]
//
// Exit 0 = pass; non-zero = fail (errors on stderr).
// Pipeline contract: run after Phase 2 dispatch returns, before Phase 3 begins.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const REQUIRED_TOP = ["project", "narrativeArchetype", "emotionalArc", "scenes"];
const REQUIRED_SCENE = [
  "sceneNumber",
  "sceneName",
  "narrativeIntent",
  "assetCandidates",
  "script",
  "estimatedDuration",
];
const REQUIRED_INTENT = ["type", "narrativeRole", "keyMessage", "persuasion", "emotionalBeat"];
const VALID_INTENT_TYPES = new Set([
  "hook",
  "pain_point",
  "product_intro",
  "feature_showcase",
  "benefit_highlight",
  "social_proof",
  "branding",
  "cta",
]);
// Common drift modes the story-design SKILL.md explicitly warns about.
const FORBIDDEN_LEGACY = {
  scene_id: "sceneNumber",
  scene_name: "sceneName",
  narration: "script",
  voicePath: "(out of scope; remove)",
  voiceDuration: "(out of scope; remove)",
};

function validate(filePath) {
  const errors = [];
  let raw;
  try {
    raw = readFileSync(filePath, "utf8");
  } catch {
    return [`File not found: ${filePath}`];
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return [`Invalid JSON: ${e.message}`];
  }

  for (const key of REQUIRED_TOP) {
    if (!(key in data)) errors.push(`Missing top-level field "${key}"`);
  }

  for (const [legacy, correct] of Object.entries(FORBIDDEN_LEGACY)) {
    if (legacy in data) {
      errors.push(`Top-level forbidden field "${legacy}" — use "${correct}" instead`);
    }
  }

  if (Array.isArray(data.scenes)) {
    data.scenes.forEach((scene, i) => {
      const ctx = `scenes[${i}]`;

      for (const key of REQUIRED_SCENE) {
        if (!(key in scene)) errors.push(`${ctx}: missing "${key}"`);
      }

      for (const [legacy, correct] of Object.entries(FORBIDDEN_LEGACY)) {
        if (legacy in scene) {
          errors.push(`${ctx}: forbidden "${legacy}" — use "${correct}"`);
        }
      }

      if (scene.narrativeIntent && typeof scene.narrativeIntent === "object") {
        for (const key of REQUIRED_INTENT) {
          if (!(key in scene.narrativeIntent)) {
            errors.push(`${ctx}.narrativeIntent: missing "${key}"`);
          }
        }
        const t = scene.narrativeIntent.type;
        if (t && !VALID_INTENT_TYPES.has(t)) {
          errors.push(
            `${ctx}.narrativeIntent.type: "${t}" not in allowed set [${[...VALID_INTENT_TYPES].join(", ")}]`,
          );
        }
      } else if ("narrativeIntent" in scene) {
        errors.push(
          `${ctx}.narrativeIntent must be an object with [${REQUIRED_INTENT.join(", ")}]`,
        );
      }

      // Flattened-intent-fields trap (intent fields living on scene root instead of nested).
      for (const intentKey of REQUIRED_INTENT) {
        if (
          intentKey in scene &&
          (!scene.narrativeIntent || !(intentKey in scene.narrativeIntent))
        ) {
          errors.push(
            `${ctx}: "${intentKey}" flat on the scene — must live inside "narrativeIntent"`,
          );
        }
      }

      // assetCandidates shape — must be an array of {path, description}.
      // Empty array is allowed (text-only scenes).
      if ("assetCandidates" in scene) {
        if (!Array.isArray(scene.assetCandidates)) {
          errors.push(`${ctx}.assetCandidates must be an array (use [] for text-only scenes)`);
        } else {
          scene.assetCandidates.forEach((cand, j) => {
            const cctx = `${ctx}.assetCandidates[${j}]`;
            if (!cand || typeof cand !== "object") {
              errors.push(`${cctx}: must be an object with {path, description}`);
              return;
            }
            if (typeof cand.path !== "string" || !cand.path) {
              errors.push(`${cctx}: missing or empty "path"`);
            } else if (!cand.path.startsWith("public/")) {
              errors.push(`${cctx}.path: must start with "public/" (got "${cand.path}")`);
            }
            if (typeof cand.description !== "string" || !cand.description) {
              errors.push(`${cctx}: missing or empty "description"`);
            }
          });
        }
      }

      // captions: optional string[] (one entry = one caption group).
      // Hard rules (cheap to check at schema time; semantic alignment to TTS
      // word grid happens at captions.mjs build time):
      //   - must be an array of strings (when present)
      //   - each entry has ≥1 non-whitespace word
      //   - per-group max 3 words after tag-strip (peoples §C cap)
      //   - tags are not nested
      //   - tag inner content non-empty (no <em></em>)
      // Tags allowed: <em> <brand> <emph> <cta>. Empty captions[] is fine
      // (text-only scenes / empty script).
      if ("captions" in scene) {
        if (!Array.isArray(scene.captions)) {
          errors.push(`${ctx}.captions must be an array of strings (use [] when no captions needed)`);
        } else {
          const TAG_RE = /<(\/?)(em|brand|emph|cta)\b[^>]*>/gi;
          scene.captions.forEach((entry, j) => {
            const ectx = `${ctx}.captions[${j}]`;
            if (typeof entry !== "string") {
              errors.push(`${ectx}: must be a string (got ${typeof entry})`);
              return;
            }
            // Strip tags, then count words.
            const stripped = entry.replace(TAG_RE, "").trim();
            if (!stripped) {
              errors.push(`${ectx}: empty caption group after tag-strip`);
              return;
            }
            const wordCount = stripped.split(/\s+/).filter(Boolean).length;
            if (wordCount > 3) {
              errors.push(
                `${ectx}: ${wordCount} words after tag-strip — peoples §C max 3 words/group ("${stripped}")`,
              );
            }
            // Validate tag balance + no nesting in one quick pass.
            let depth = 0;
            let openTag = null;
            let lastOpenEnd = -1;
            let m;
            TAG_RE.lastIndex = 0;
            while ((m = TAG_RE.exec(entry)) !== null) {
              const isClose = m[1] === "/";
              const tagName = m[2].toLowerCase();
              if (!isClose) {
                if (depth > 0) {
                  errors.push(`${ectx}: nested tag <${tagName}> inside <${openTag}> not allowed`);
                  break;
                }
                depth = 1;
                openTag = tagName;
                lastOpenEnd = m.index + m[0].length;
              } else {
                if (depth === 0 || openTag !== tagName) {
                  errors.push(`${ectx}: stray </${tagName}> with no matching opener`);
                  break;
                }
                const inner = entry.slice(lastOpenEnd, m.index).trim();
                if (!inner) {
                  errors.push(`${ectx}: empty <${tagName}></${tagName}> — tag inner content required`);
                }
                depth = 0;
                openTag = null;
              }
            }
            if (depth !== 0) {
              errors.push(`${ectx}: unclosed <${openTag}> tag`);
            }
          });
        }
      }
    });

    // UI demo requirement from story-design SKILL.md.
    const types = data.scenes.flatMap((s) =>
      s.narrativeIntent?.type ? [s.narrativeIntent.type] : [],
    );
    if (!types.some((t) => t === "feature_showcase" || t === "product_intro")) {
      errors.push(
        "No scene with type=feature_showcase or product_intro — story-design requires at least one UI-demo scene",
      );
    }
  } else if ("scenes" in data) {
    errors.push("scenes must be an array");
  }

  return errors;
}

const target = resolve(process.argv[2] || "./narrator_scripts.json");
const errs = validate(target);
if (errs.length) {
  console.error(`✗ ${target}: ${errs.length} schema error(s)`);
  for (const e of errs) console.error(`  - ${e}`);
  process.exit(1);
} else {
  console.log(`✓ ${target}: schema OK`);
}
