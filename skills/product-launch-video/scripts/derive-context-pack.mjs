#!/usr/bin/env node
// derive-context-pack.mjs (Phase 1 post-processor)
//
// Reads a `hyperframes capture` output directory and emits a single
// LLM-friendly brief at <captureDir>/context_pack.md. story-design and
// visual-design agents read THIS file (not the raw extracted/ JSON) as the
// primary input for narrative arc + scene planning.
//
// Output format mirrors the v2 web-research `context_pack.md` so agent
// prompts don't need to change beyond the path. Asset paths are written as
// `assets/<filename>` (no `capture/` prefix), matching the legacy convention
// — prep.mjs walks `capture/assets/` → `public/` so the asset paths the
// agent emits as `public/<filename>` resolve correctly downstream.
//
// Usage:
//   node derive-context-pack.mjs --capture <path> [--out <path>]
//
// --capture: directory containing extracted/, assets/, screenshots/
// --out:     output path (default: <captureDir>/context_pack.md)
//
// Exit 0 = wrote file. Exit 1 = capture/ missing required artifacts.

import fs from "node:fs";
import path from "node:path";
import { discoverSourceUrl } from "./lib/capture-meta.mjs";

const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : def;
};
function die(msg) {
  console.error(`✗ derive-context-pack: ${msg}`);
  process.exit(1);
}

const captureDir = path.resolve(flag("capture", "./capture"));
const outPath = path.resolve(flag("out", path.join(captureDir, "context_pack.md")));

if (!fs.existsSync(captureDir)) die(`capture dir not found: ${captureDir}`);

function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}
function readText(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

const tokens = readJSON(path.join(captureDir, "extracted", "tokens.json"), null);
if (!tokens) die("extracted/tokens.json missing — run 'npx hyperframes capture <url>' first");
const visibleText = readText(path.join(captureDir, "extracted", "visible-text.txt"));
const assetDescriptions = readText(path.join(captureDir, "extracted", "asset-descriptions.md"));
const meta = readJSON(path.join(captureDir, "meta.json"), {});

// Discover source URL from CLAUDE.md / AGENTS.md scaffolding (shared with
// build-design.mjs via lib/capture-meta.mjs so the two stay in lockstep).
const sourceUrl = discoverSourceUrl(captureDir, meta);

// List local assets — each line in context_pack.md references `assets/<filename>`,
// the same convention used by the legacy web-research output. prep.mjs will
// copy these files into public/ so the agent's `public/<filename>` references
// resolve at render time.
const localAssets = [];
const assetsDir = path.join(captureDir, "assets");
if (fs.existsSync(assetsDir)) {
  for (const ent of fs.readdirSync(assetsDir, { withFileTypes: true })) {
    if (!ent.isFile()) continue;
    if (/^contact-sheet/.test(ent.name)) continue; // skip review-only thumbnails
    if (!/\.(png|jpe?g|webp|gif|svg|mp4|mov|webm|woff2?|otf|ttf|ico)$/i.test(ent.name)) continue;
    localAssets.push(ent.name);
  }
}

// Parse asset-descriptions.md into a Map<filename, description-line> so each
// asset can show its DOM-context description (and Gemini caption if present)
// inline with the asset inventory.
const descLines = new Map();
for (const line of assetDescriptions.split(/\r?\n/)) {
  // Lines look like: "- assets/foo.svg (320×180 @ y=842) alt: 'hero icon' — Gemini: …"
  const m = line.match(/^[\s\-*]+(?:assets\/|svgs\/)?([\w.-]+\.[\w]+)\s+(.*)$/);
  if (m) {
    const fname = path.basename(m[1]);
    if (!descLines.has(fname)) descLines.set(fname, m[2].trim());
  }
}

function clean(text, limit = 400) {
  const s = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (limit && s.length > limit) return s.slice(0, limit - 1).trim() + "…";
  return s;
}

const lines = [];
lines.push("# Web Context Pack");
lines.push("");
lines.push("## Source");
lines.push("");
lines.push(`- URL: ${sourceUrl}`);
lines.push(`- Title: ${tokens.title || ""}`);
lines.push(`- Description: ${clean(tokens.description, 300)}`);
if (meta?.name && meta.name !== tokens.title) lines.push(`- Capture name: ${meta.name}`);
lines.push("");

lines.push("## Product Signals");
lines.push("");
if (tokens.description) lines.push(`- description: ${clean(tokens.description, 300)}`);
const ogVars = Object.entries(tokens.cssVariables || {}).filter(([k]) => /^--/.test(k));
if (ogVars.length > 0) {
  lines.push(
    `- CSS variables (${ogVars.length}): ${ogVars
      .slice(0, 6)
      .map(([k, v]) => `${k}=${v}`)
      .join(", ")}${ogVars.length > 6 ? ", …" : ""}`,
  );
}
const palette = (tokens.colors || []).slice(0, 8);
if (palette.length > 0) lines.push(`- Palette (top 8): ${palette.join(", ")}`);
const fontList = (tokens.fonts || []).map((f) => f.family).filter(Boolean);
if (fontList.length > 0) lines.push(`- Fonts: ${fontList.join(", ")}`);
lines.push("");

lines.push("## Headings");
lines.push("");
for (const h of (tokens.headings || []).slice(0, 30)) {
  lines.push(`- h${h.level || "?"}: ${clean(h.text, 180)}`);
}
lines.push("");

lines.push("## Section Candidates");
lines.push("");
for (let i = 0; i < (tokens.sections || []).length; i++) {
  const s = tokens.sections[i];
  lines.push(`### Section ${i} — ${s.selector || "?"} (type=${s.type}, y=${s.y}, h=${s.height})`);
  if (s.heading) lines.push(`- Heading: ${clean(s.heading, 180)}`);
  if (s.callsToAction && s.callsToAction.length > 0) {
    lines.push(`- CTAs: ${s.callsToAction.join(" · ")}`);
  }
  if (s.backgroundColor) lines.push(`- Background: ${s.backgroundColor}`);
  if (s.assetUrls && s.assetUrls.length > 0) {
    lines.push("- Assets:");
    for (const url of s.assetUrls.slice(0, 4)) {
      // Map a remote URL back to a local file if it landed in capture/assets/.
      // hyperframes capture writes images as <slug>.<ext> with stable naming
      // (e.g. "hero-blue.png" or content-hashed for CMS). We can't perfectly
      // round-trip from URL to filename without an index, so we just surface
      // the URL — story-design will match against the local asset inventory
      // by filename / alt text rather than URL.
      lines.push(`  - ${url}`);
    }
  }
  lines.push("");
}

lines.push("## Asset Inventory");
lines.push("");
lines.push(
  "_All paths are relative to `capture/`. Phase 4a will copy these into `public/` — when you cite an asset in `assetCandidates[].path`, use `public/<filename>` (drop the `assets/` prefix)._",
);
lines.push("");
let n = 0;
for (const fname of localAssets) {
  n++;
  const ext = path.extname(fname).toLowerCase().slice(1);
  const desc = descLines.get(fname);
  const kind = /^(png|jpe?g|webp|gif|svg|avif)$/.test(ext)
    ? "image"
    : /^(mp4|webm|mov)$/.test(ext)
      ? "video"
      : /^(woff2?|otf|ttf)$/.test(ext)
        ? "font"
        : ext;
  lines.push(`- ${n}. [${kind}] assets/${fname}${desc ? "  — " + desc : ""}`);
}
lines.push("");

lines.push("## Visible Text Excerpt");
lines.push("");
lines.push(clean(visibleText, 6000));

fs.writeFileSync(outPath, lines.join("\n") + "\n");
const sizeKb = (Buffer.byteLength(lines.join("\n")) / 1024).toFixed(1);
console.log(`✓ ${path.relative(process.cwd(), outPath)} (${sizeKb}KB)`);
console.log(`  source: ${sourceUrl}`);
console.log(`  sections: ${(tokens.sections || []).length}`);
console.log(`  headings: ${(tokens.headings || []).length}`);
console.log(`  assets: ${localAssets.length}`);
