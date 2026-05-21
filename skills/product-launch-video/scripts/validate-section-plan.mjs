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

// Pull anything that looks like a referenced identifier:
//   `effect-name`  or  **effect-name**
function extractReferenced(plan) {
  const found = new Set();
  for (const m of plan.matchAll(/`([a-z][a-z0-9-]+)`/g)) found.add(m[1]);
  for (const m of plan.matchAll(/\*\*([a-z][a-z0-9-]+)\*\*/g)) found.add(m[1]);
  return found;
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

const referenced = extractReferenced(plan);
// Only consider hyphenated tokens — single-word backticks are usually code/data-attrs.
const effectLike = [...referenced].filter((n) => n.includes("-"));

const matched = effectLike.filter((n) => known.has(n));
const unknown = effectLike.filter((n) => !known.has(n));

// Skip known non-effect terms that are also hyphenated (HyperFrames data-* attrs,
// CSS values, filename tokens).
const SKIP_PREFIXES = ["data-"];
const SKIP_EXACT = new Set([
  // GSAP / CSS / HyperFrames vocabulary
  "z-index",
  "back-out",
  "power3-out",
  "power2-out",
  "power1-out",
  "elastic-out",
  "sine-inout",
  "ease-in-out",
  // Filenames / paths
  "narrator-scripts",
  "section-plan",
  "tokens-json",
  "report-json",
]);

const suspicious = unknown.filter(
  (n) => !SKIP_EXACT.has(n) && !SKIP_PREFIXES.some((p) => n.startsWith(p)),
);

const errors = [];

if (matched.length === 0) {
  errors.push(
    "Zero known effects referenced. Every scene must cite at least one effect from hyperframes-animation/rules/ (backtick-wrapped name).",
  );
}

for (const s of suspicious) {
  errors.push(
    `Unknown effect-like token "${s}" — not a rule under hyperframes-animation/rules/. Pick an existing rule name.`,
  );
}

if (errors.length) {
  console.error(`✗ ${planPath}: ${errors.length} issue(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error(`\n  Known rules: \`ls ${rulesDir}\``);
  process.exit(1);
}

console.log(`✓ ${planPath}: ${matched.length} known effects referenced — OK`);
