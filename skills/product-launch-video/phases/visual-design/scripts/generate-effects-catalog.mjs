#!/usr/bin/env node
// Generate skills/product-launch-video/phases/visual-design/effects-catalog.md from
// skills/hyperframes-animation/rules/*.md frontmatter.
//
// This is the single-source-of-truth chain:
//   rules/<name>.md frontmatter  →  effects-catalog.md  →  section_plan.md citations
//
// Run after adding / renaming a rule. The Phase 3 validator
// (validate-section-plan.mjs) checks section_plan.md against rules/, so the
// catalog and validator share the same source of truth.

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve, join, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
// here = skills/product-launch-video/phases/visual-design/scripts/
// rules = skills/hyperframes-animation/rules/  → go up 4, across to hyperframes-animation
const RULES_DIR = resolve(here, "../../../../hyperframes-animation/rules");
const OUT_PATH = resolve(here, "../effects-catalog.md");

// Tag-priority routing. Each rule lands in the FIRST matching category, so order matters.
// Categories mirror the legacy hand-written catalog (in visual-design SKILL.md) so
// downstream agents see the same shape.
const CATEGORIES = [
  ["SVG & Icons", (t) => t.has("svg")],
  ["Camera & Viewport", (t) => t.has("camera") || t.has("viewport")],
  [
    "Interaction & Click",
    (t) =>
      (t.has("cursor") && (t.has("click") || t.has("interaction"))) ||
      t.has("click") ||
      t.has("button") ||
      t.has("press"),
  ],
  [
    "Text & Typography",
    (t) =>
      t.has("text") ||
      t.has("typewriter") ||
      t.has("typography") ||
      t.has("counter") ||
      t.has("counting"),
  ],
  [
    "Layout & 3D",
    (t) =>
      t.has("3d") ||
      t.has("orbit") ||
      t.has("network") ||
      t.has("cards") ||
      t.has("layers") ||
      t.has("scatter") ||
      t.has("layout") ||
      t.has("ai"),
  ],
  ["Transition & Motion", () => true], // fallthrough
];

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const body = m[1];
  const fm = { tags: [] };
  for (const line of body.split(/\r?\n/)) {
    const nameMatch = line.match(/^name:\s*(.+)$/);
    if (nameMatch) fm.name = nameMatch[1].trim();
    const descMatch = line.match(/^description:\s*(.+)$/);
    if (descMatch) fm.description = descMatch[1].trim();
    const tagsMatch = line.match(/^\s+tags:\s*(.+)$/);
    if (tagsMatch) fm.tags = tagsMatch[1].split(",").map((s) => s.trim());
  }
  return fm;
}

function categorize(tags) {
  const t = new Set(tags);
  for (const [name, match] of CATEGORIES) if (match(t)) return name;
  return "Transition & Motion";
}

const files = readdirSync(RULES_DIR)
  .filter((f) => f.endsWith(".md"))
  .sort();
const rules = [];
const skipped = [];
for (const f of files) {
  const fm = parseFrontmatter(readFileSync(join(RULES_DIR, f), "utf8"));
  if (!fm || !fm.name || !fm.description) {
    skipped.push(`${f}: missing frontmatter (name + description)`);
    continue;
  }
  // The filename is the canonical name — assert frontmatter matches.
  const expected = basename(f, ".md");
  if (fm.name !== expected) {
    skipped.push(`${f}: frontmatter name="${fm.name}" ≠ filename "${expected}"`);
    continue;
  }
  rules.push({ ...fm, category: categorize(fm.tags) });
}

// Group by category preserving CATEGORIES order.
const groups = new Map(CATEGORIES.map(([n]) => [n, []]));
for (const r of rules) groups.get(r.category).push(r);
for (const list of groups.values()) list.sort((a, b) => a.name.localeCompare(b.name));

let out = `# Animation Effects Catalog

> ⚠ AUTO-GENERATED from \`skills/hyperframes-animation/rules/*.md\`. Do NOT edit by hand.
> Regenerate: \`node skills/product-launch-video/phases/visual-design/scripts/generate-effects-catalog.mjs\`

Reference these effects **by name** (backtick-wrapped) in \`section_plan.md\`. The build agent (Phase 4) translates each name into its \`hyperframes-animation/rules/<name>.md\` recipe.

Phase 3 self-validates against this catalog via \`validate-section-plan.mjs\` — every effect cited in the plan must appear here.

Total effects: ${rules.length}

`;

for (const [cat, list] of groups) {
  if (list.length === 0) continue;
  out += `## ${cat}\n\n`;
  out += "| Effect | Description |\n|---|---|\n";
  for (const r of list) {
    out += `| \`${r.name}\` | ${r.description.replace(/\|/g, "\\|")} |\n`;
  }
  out += "\n";
}

if (skipped.length) {
  out += `## Skipped (frontmatter problems)\n\n`;
  for (const s of skipped) out += `- ${s}\n`;
  out += "\n";
}

writeFileSync(OUT_PATH, out);
console.log(`✓ wrote ${OUT_PATH} — ${rules.length} effects in ${groups.size} categories`);
if (skipped.length) {
  console.warn(`⚠ skipped ${skipped.length} file(s):`);
  for (const s of skipped) console.warn(`  - ${s}`);
}
