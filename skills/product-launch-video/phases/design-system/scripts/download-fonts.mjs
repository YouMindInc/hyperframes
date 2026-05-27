#!/usr/bin/env node
// download-fonts.mjs — Step 3 of Phase 1b (design-system).
//
// designlang extracts font-family NAMES into <prefix>-design-tokens.json but
// does NOT download the actual .woff2 files. For self-hosted brand fonts
// (which Google Fonts does not have, e.g. heygen.com's "TT Norms Pro"), the
// render-time browser would fall back to system-ui and the video typography
// would not match the brand. This script closes that gap.
//
// What it does:
//   1. Resolves the source URL (from design.html's AGENT NOTE comment, or argv).
//   2. Fetches the page HTML.
//   3. Extracts every @font-face block via regex.
//   4. Filters to the families actually declared in design.html's :root
//      (--display, --body, --mono) — avoids downloading dozens of fallback fonts.
//   5. Downloads each .woff2/.woff/.ttf/.otf to design-system/fonts/.
//   6. Writes design-system/fonts/manifest.json (family → [{file, weight, style}]).
//   7. Rewrites design.html — injects a real @font-face block at the top of
//      its <style>, pointing at relative paths fonts/<basename>.
//
// Phase 4a (prep.mjs) then copies design-system/fonts/* → hyperframes/public/fonts/
// so the renderer can resolve them.
//
// Usage:
//   node download-fonts.mjs <design-system-dir>
//
// Exit 0: fonts downloaded (or none needed — e.g. site uses only Google Fonts).
// Exit 1: fatal (network failed AND fonts are clearly self-hosted).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

// ---------- argv ----------
const dir = resolve(process.argv[2] || "./design-system");
if (!existsSync(dir)) {
  console.error(`✗ download-fonts.mjs: ${dir} does not exist`);
  process.exit(1);
}
const designHtmlPath = join(dir, "design.html");
if (!existsSync(designHtmlPath)) {
  console.error(
    `✗ download-fonts.mjs: ${designHtmlPath} missing — run build-design-html.mjs first`,
  );
  process.exit(1);
}

const designHtml = readFileSync(designHtmlPath, "utf8");

// ---------- Step 1: resolve source URL ----------
// design.html's AGENT NOTE has "Re-extract: npx designlang <URL> --out ./design-system"
const reUrl = designHtml.match(/Re-extract:\s*npx designlang\s+(\S+)\s+--out/);
const sourceUrl = reUrl ? reUrl[1] : null;
if (!sourceUrl) {
  console.error(`✗ download-fonts.mjs: could not find source URL in ${designHtmlPath} AGENT NOTE`);
  process.exit(1);
}
console.log(`source URL: ${sourceUrl}`);

// ---------- Step 2: extract :root font families from design.html ----------
// Look for --display / --body / --mono CSS variable values (and font-family lines)
const declaredFamilies = new Set();
const familyDecls = [
  ...designHtml.matchAll(/--(?:font-)?(?:display|body|mono)\s*:\s*([^;]+);/g),
  ...designHtml.matchAll(/font-family:\s*([^;}\n]+)/g),
];
for (const m of familyDecls) {
  // Each declaration is a comma-separated stack: 'TT Norms Pro', 'ABC Solar Display', system-ui, ...
  // Take the FIRST name only — that's the brand font; the rest are fallbacks.
  const stack = m[1].trim();
  const first = stack
    .split(",")[0]
    .trim()
    .replace(/^['"]|['"]$/g, "");
  if (
    first &&
    !/^(system-ui|ui-monospace|ui-sans-serif|ui-serif|sans-serif|serif|monospace|-apple-system|BlinkMacSystemFont|inherit|initial|unset)$/i.test(
      first,
    )
  ) {
    declaredFamilies.add(first);
  }
}
console.log(`declared brand families: ${[...declaredFamilies].join(", ") || "(none)"}`);
if (declaredFamilies.size === 0) {
  console.log("nothing to download — design.html has no brand-specific font-family declarations");
  process.exit(0);
}

// ---------- Step 3: fetch source URL ----------
async function fetchText(url, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15_000);
  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        Accept: "text/html,*/*",
      },
      signal: ctrl.signal,
      ...opts,
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } finally {
    clearTimeout(t);
  }
}

async function fetchBuffer(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 30_000);
  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      signal: ctrl.signal,
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return Buffer.from(await r.arrayBuffer());
  } finally {
    clearTimeout(t);
  }
}

let pageHtml;
try {
  pageHtml = await fetchText(sourceUrl);
} catch (e) {
  console.error(`✗ failed to fetch ${sourceUrl}: ${e.message}`);
  process.exit(1);
}
console.log(`fetched page (${(pageHtml.length / 1024).toFixed(1)} KB)`);

// ---------- Step 4: also fetch external stylesheets (the @font-face may live there) ----------
const stylesheetUrls = [
  ...pageHtml.matchAll(/<link[^>]+rel=["']?stylesheet["']?[^>]+href=["']([^"']+)["']/gi),
  ...pageHtml.matchAll(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']?stylesheet["']?/gi),
].map((m) => new URL(m[1], sourceUrl).href);
const uniqueSheets = [...new Set(stylesheetUrls)].slice(0, 10); // cap at 10
console.log(`fetching ${uniqueSheets.length} external stylesheet(s)…`);

let cssCorpus = pageHtml;
for (const sheetUrl of uniqueSheets) {
  try {
    const css = await fetchText(sheetUrl);
    cssCorpus += "\n/* === " + sheetUrl + " === */\n" + css;
  } catch (e) {
    console.log(`  skip ${sheetUrl}: ${e.message}`);
  }
}

// ---------- Step 5: extract @font-face blocks ----------
// Match @font-face { ... } blocks, then within each block pick the family +
// the FIRST src url (which is the highest-priority format — usually woff2).
const faceBlocks = [...cssCorpus.matchAll(/@font-face\s*\{([^}]+)\}/g)];
console.log(`found ${faceBlocks.length} @font-face block(s) across page + stylesheets`);

const faces = [];
for (const fb of faceBlocks) {
  const body = fb[1];
  const family = (body.match(/font-family\s*:\s*['"]?([^'";]+)['"]?/) || [])[1]?.trim();
  if (!family) continue;
  // Skip families not in our brand allowlist.
  if (!declaredFamilies.has(family)) continue;

  // Capture all url(...) refs in this block, prefer .woff2 over .woff over .ttf/.otf.
  const urls = [...body.matchAll(/url\(["']?([^"')\s]+)["']?\)/g)].map((m) => m[1]);
  const pick = (re) => urls.find((u) => re.test(u));
  const url =
    pick(/\.woff2(\?|$)/i) || pick(/\.woff(\?|$)/i) || pick(/\.ttf(\?|$)/i) || pick(/\.otf(\?|$)/i);
  if (!url) continue;

  const weight = (body.match(/font-weight\s*:\s*([^;]+)/) || [])[1]?.trim() || "400";
  const style = (body.match(/font-style\s*:\s*([^;]+)/) || [])[1]?.trim() || "normal";

  // Resolve to absolute URL.
  const absUrl = new URL(url, sourceUrl).href;
  faces.push({ family, url: absUrl, weight, style });
}
// Dedupe by (family + weight + style) — keep the first (preferred-format) URL.
const seen = new Set();
const facesDeduped = faces.filter((f) => {
  const k = `${f.family}|${f.weight}|${f.style}`;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});
console.log(`matched ${facesDeduped.length} brand font face(s) after filtering + dedup`);

if (facesDeduped.length === 0) {
  console.log(
    "no brand fonts to download (Google Fonts or system-only — render-time fallback will work)",
  );
  process.exit(0);
}

// ---------- Step 6: download fonts ----------
const fontsDir = join(dir, "fonts");
mkdirSync(fontsDir, { recursive: true });

function safeBasename(family, weight, style, url) {
  const ext = (url.match(/\.(woff2|woff|ttf|otf)(?:\?|$)/i) || [
    undefined,
    "woff2",
  ])[1].toLowerCase();
  const fam = family.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const wt = String(weight).replace(/[^0-9]/g, "") || "400";
  const st = style === "italic" ? "i" : "";
  return `${fam}-${wt}${st}.${ext}`;
}

const manifest = {};
let downloaded = 0;
const failed = [];
for (const f of facesDeduped) {
  const filename = safeBasename(f.family, f.weight, f.style, f.url);
  const dest = join(fontsDir, filename);
  if (existsSync(dest)) {
    console.log(`  ✓ ${filename} (cached)`);
  } else {
    try {
      const buf = await fetchBuffer(f.url);
      writeFileSync(dest, buf);
      console.log(`  ✓ ${filename} (${(buf.length / 1024).toFixed(1)} KB)`);
      downloaded++;
    } catch (e) {
      console.log(`  ✗ ${filename}: ${e.message}`);
      failed.push({ ...f, error: e.message });
      continue;
    }
  }
  manifest[f.family] ||= [];
  manifest[f.family].push({
    file: filename,
    weight: f.weight,
    style: f.style,
    sourceUrl: f.url,
  });
}

writeFileSync(join(fontsDir, "manifest.json"), JSON.stringify(manifest, null, 2));

// ---------- Step 7: rewrite design.html to include @font-face ----------
// Build a CSS block declaring each downloaded face, then inject into the
// first <style>...</style> in design.html immediately after the opening <style>.
const formatFor = (ext) =>
  ({ woff2: "woff2", woff: "woff", ttf: "truetype", otf: "opentype" })[ext] || "woff2";

const faceCss = Object.entries(manifest)
  .flatMap(([family, files]) =>
    files.map(
      (f) => `@font-face {
  font-family: '${family}';
  src: url('fonts/${f.file}') format('${formatFor(f.file.split(".").pop())}');
  font-weight: ${f.weight};
  font-style: ${f.style};
  font-display: swap;
}`,
    ),
  )
  .join("\n");

const fontBlockMarker = "/* === auto-injected by download-fonts.mjs === */";
const fontBlockMarkerEnd = "/* === end download-fonts.mjs block === */";

let newHtml = designHtml;
// Remove any prior auto-injected block (so re-runs are idempotent).
const priorBlockRe = new RegExp(
  `${fontBlockMarker.replace(/[/*]/g, "\\$&")}[\\s\\S]*?${fontBlockMarkerEnd.replace(/[/*]/g, "\\$&")}\\n?`,
  "g",
);
newHtml = newHtml.replace(priorBlockRe, "");

const injection = `${fontBlockMarker}\n${faceCss}\n${fontBlockMarkerEnd}\n`;
// Inject right after the first `<style>` tag.
const styleIdx = newHtml.indexOf("<style>");
if (styleIdx < 0) {
  console.error("✗ no <style> tag in design.html — cannot inject @font-face");
  process.exit(1);
}
const insertAt = styleIdx + "<style>".length;
newHtml = newHtml.slice(0, insertAt) + "\n" + injection + newHtml.slice(insertAt);
writeFileSync(designHtmlPath, newHtml);

console.log(
  `\n✓ wrote ${Object.values(manifest).flat().length} @font-face rule(s) into ${designHtmlPath}`,
);
console.log(
  `✓ ${downloaded} font(s) downloaded${failed.length ? `, ${failed.length} failed` : ""} → ${fontsDir}`,
);
if (failed.length) {
  console.log("failed:");
  for (const f of failed) console.log(`  - ${f.family} ${f.weight}: ${f.error}`);
}
