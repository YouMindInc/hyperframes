#!/usr/bin/env node
/**
 * build-design-html.mjs
 *
 * Synthesize design.html from designlang's JSON outputs.
 * Deterministic — no LLM, no network. Reads JSON, writes HTML, exits.
 *
 * Usage:
 *   node build-design-html.mjs <design-system-dir> [--prefix <name>] [--out <file>]
 *
 * Inputs (in <design-system-dir>, file paths derived from --prefix or auto-detected):
 *   <prefix>-design-tokens.json   REQUIRED  (W3C DTCG: primitive + semantic)
 *   <prefix>-motion-tokens.json   optional  (durations + easings)
 *   <prefix>-visual-dna.json      optional  (material, imagery, patterns)
 *   <prefix>-voice.json           optional  (tone, headings, CTAs)
 *   <prefix>-gradients.json       optional  (raw + stops + classification)
 *
 * Output:
 *   <design-system-dir>/design.html  (single self-contained file, ~80-120KB)
 *
 * The output is consumed by:
 *   skills/product-launch-video/agents/visual-design.md     (Phase 3)
 *   skills/product-launch-video/agents/hyperframes-scene.md (Phase 4b)
 */

import fs from 'node:fs';
import path from 'node:path';

// ═══════════════════ CLI ════════════════════════════════
const argv = process.argv.slice(2);
if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
  console.log(`Usage: node build-design-html.mjs <design-system-dir> [--prefix <name>] [--out <file>]`);
  process.exit(argv.length === 0 ? 1 : 0);
}
const outDir = path.resolve(argv[0]);
let cliPrefix = null;
let cliOut = null;
for (let i = 1; i < argv.length; i++) {
  if (argv[i] === '--prefix' && argv[i + 1]) cliPrefix = argv[++i];
  else if (argv[i] === '--out' && argv[i + 1]) cliOut = argv[++i];
}
if (!fs.existsSync(outDir) || !fs.statSync(outDir).isDirectory()) {
  console.error(`✗ ${outDir} is not a directory`);
  process.exit(1);
}

// ═══════════════════ Discover prefix ════════════════════
let prefix = cliPrefix;
if (!prefix) {
  const match = fs.readdirSync(outDir).find(f => /-design-tokens\.json$/.test(f));
  if (!match) {
    console.error(`✗ No <prefix>-design-tokens.json in ${outDir}. Pass --prefix or check the directory.`);
    process.exit(1);
  }
  prefix = match.replace(/-design-tokens\.json$/, '');
}
const outFile = cliOut ? path.resolve(cliOut) : path.join(outDir, 'design.html');

// ═══════════════════ Load JSON (graceful fallbacks) ═════
function readJSON(filename, fallback) {
  const p = path.join(outDir, filename);
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch { return fallback; }
}
const tokens   = readJSON(`${prefix}-design-tokens.json`, null);
const motion   = readJSON(`${prefix}-motion-tokens.json`, { duration: {}, easing: {}, spring: {}, $meta: {} });
const dna      = readJSON(`${prefix}-visual-dna.json`,    null);
const voice    = readJSON(`${prefix}-voice.json`,          null);
const gradData = readJSON(`${prefix}-gradients.json`,      { gradients: [] });
const library  = readJSON(`${prefix}-library.json`,        null);
const iconSys  = readJSON(`${prefix}-icon-system.json`,    null);
const intent   = readJSON(`${prefix}-intent.json`,         null);
const formSt   = readJSON(`${prefix}-form-states.json`,    null);
const designMd = (() => {
  try { return fs.readFileSync(path.join(outDir, `${prefix}-DESIGN.md`), 'utf8'); }
  catch { return ''; }
})();
const anatomyTsx = (() => {
  try { return fs.readFileSync(path.join(outDir, `${prefix}-anatomy.tsx`), 'utf8'); }
  catch { return ''; }
})();
const brandHtml = (() => {
  try { return fs.readFileSync(path.join(outDir, `${prefix}.brand.html`), 'utf8'); }
  catch { return ''; }
})();

if (!tokens) {
  console.error(`✗ ${prefix}-design-tokens.json is required but missing.`);
  process.exit(1);
}

// ═══════════════════ brand.html parser ══════════════════
// brand.html is designlang's documentation export. When present we prefer it
// over the raw tokens for two slots that it adds genuine information to:
//   - Brand colors (it splits primary/secondary/accent; tokens often have only 2)
//   - Typography (it splits Display vs Body and lists weights; tokens often have 1 family)
// Everything else (gradients, motion, radius, voice, ...) still comes from JSON.
function parseBrandHtml(html) {
  if (!html) return null;
  const out = { brandColors: [], colorSummary: '', neutrals: [], palette: [], typography: null, typeSummary: '' };

  // Locate the Colour section
  const colorBlock = html.match(/<section id="color">([\s\S]*?)<\/section>/);
  if (colorBlock) {
    const block = colorBlock[1];
    out.colorSummary = (block.match(/<p class="summary">([^<]+)<\/p>/)?.[1] || '').trim();
    const roleRe = /<article class="brand-color brand-color-(\w+)">[\s\S]*?<span class="big-swatch-name">([^<]+)<\/span>[\s\S]*?<span class="big-swatch-hex">([^<]+)<\/span>/g;
    let m;
    while ((m = roleRe.exec(block))) {
      out.brandColors.push({
        slot: m[1],                               // primary | secondary | accent
        role: m[2].trim(),                        // "Primary" / "Secondary" / "Accent"
        hex: normalizeColor(m[3]),
      });
    }
    const neutralRe = /<div class="neutral-cell"[^>]*><code>([^<]+)<\/code>/g;
    while ((m = neutralRe.exec(block))) out.neutrals.push(normalizeColor(m[1]));
    const miniRe = /<div class="mini-swatch"[^>]*><code>([^<]+)<\/code>/g;
    while ((m = miniRe.exec(block))) out.palette.push(normalizeColor(m[1]));
  }

  // Locate the Typography section (drop the Scale table — request #2)
  const typeBlock = html.match(/<section id="type">([\s\S]*?)<\/section>/);
  if (typeBlock) {
    const block = typeBlock[1];
    out.typeSummary = (block.match(/<p class="summary">([^<]+)<\/p>/)?.[1] || '').trim();
    const meta = {};
    const metaRe = /<div><dt>([^<]+)<\/dt><dd>([^<]*(?:<code>[^<]*<\/code>[^<]*)*)<\/dd><\/div>/g;
    let m;
    while ((m = metaRe.exec(block))) {
      const key = m[1].trim().toLowerCase();
      const value = m[2].replace(/<[^>]+>/g, '').trim();
      meta[key] = value;
    }
    if (Object.keys(meta).length) {
      out.typography = {
        display: meta.display || null,
        body:    meta.body || null,
        weights: meta.weights || null,            // e.g. "400, 500, 600, 700"
      };
    }
  }

  return out;
}
const brand = parseBrandHtml(brandHtml);

// ═══════════════════ Utilities ══════════════════════════
function normalizeColor(s) {
  if (!s) return null;
  s = String(s).trim();
  if (s.startsWith('#')) return s.length === 4
    ? '#' + [1, 2, 3].map(i => s[i] + s[i]).join('').toLowerCase()
    : s.toLowerCase();
  const m = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) return '#' + [1, 2, 3].map(i => parseInt(m[i]).toString(16).padStart(2, '0')).join('').toLowerCase();
  return s;
}
function isLight(hex) {
  const h = normalizeColor(hex);
  if (!h || !h.startsWith('#') || h.length < 7) return true;
  const r = parseInt(h.substr(1, 2), 16);
  const g = parseInt(h.substr(3, 2), 16);
  const b = parseInt(h.substr(5, 2), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.7;
}
function luminance(hex) {
  const h = normalizeColor(hex);
  if (!h || !h.startsWith('#') || h.length < 7) return 0.5;
  const r = parseInt(h.substr(1, 2), 16);
  const g = parseInt(h.substr(3, 2), 16);
  const b = parseInt(h.substr(5, 2), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
function hasNonAscii(s) {
  if (typeof s !== 'string') return false;
  for (let i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) > 127) return true;
  }
  return false;
}
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
function escapeCss(s) {
  return String(s ?? '').replace(/[<>"']/g, c => ({
    '<': '&lt;', '>': '&gt;', '"': '\\"', "'": "\\'"
  }[c]));
}
function deriveAccent(primaryHex) {
  // Rotate the primary's hue by 120° in HSL to get a brand-feeling accent.
  // Used only when no explicit accent/gradient pair was extracted.
  const m = primaryHex && primaryHex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return '#f3a6ff';
  const r = parseInt(m[1].substr(0, 2), 16) / 255;
  const g = parseInt(m[1].substr(2, 2), 16) / 255;
  const b = parseInt(m[1].substr(4, 2), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  } else { h = 0; }
  h = (h + 0.333) % 1;          // rotate +120°
  s = Math.min(1, s * 1.1);     // slightly more saturated
  l = Math.min(0.78, Math.max(0.55, l * 1.05)); // pastel-ish
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const toHex = v => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0');
  return '#' + toHex(hue2rgb(p, q, h + 1/3)) + toHex(hue2rgb(p, q, h)) + toHex(hue2rgb(p, q, h - 1/3));
}

function bezierToGsapEase(bezier) {
  if (!bezier) return 'power2.out';
  const m = bezier.match(/cubic-bezier\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
  if (!m) return 'power2.out';
  const [x1, y1, x2, y2] = m.slice(1).map(Number);
  // Material standards
  if (x1 === 0    && y1 === 0 && x2 === 0.2  && y2 === 1) return 'power2.out';
  if (x1 === 0.4  && y1 === 0 && x2 === 0.2  && y2 === 1) return 'power3.inOut';
  if (x1 === 0.4  && y1 === 0 && x2 === 1    && y2 === 1) return 'power2.in';
  if (x1 === 0.25 && y1 === 0.1 && x2 === 0.25 && y2 === 1) return 'sine.out';
  if (x1 === 0.42 && y1 === 0 && x2 === 0.58 && y2 === 1) return 'sine.inOut';
  if (x1 === 0.68 && y1 === -0.55 && x2 === 0.265 && y2 === 1.55) return 'back.inOut(1.7)';
  // Heuristic by handle position
  if (x1 === 0 && y1 === 0) return 'power2.out';
  if (x2 === 1 && y2 === 1) return 'power2.in';
  return 'power2.inOut';
}
function bezierToSvgPath(bezier) {
  if (!bezier) return 'M 0 160 C 0 160, 32 0, 160 0';
  const m = bezier.match(/cubic-bezier\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
  if (!m) return 'M 0 160 C 0 160, 32 0, 160 0';
  const [x1, y1, x2, y2] = m.slice(1).map(Number);
  const cx1 = x1 * 160, cy1 = 160 - y1 * 160;
  const cx2 = x2 * 160, cy2 = 160 - y2 * 160;
  return `M 0 160 C ${cx1.toFixed(2)} ${cy1.toFixed(2)}, ${cx2.toFixed(2)} ${cy2.toFixed(2)}, 160 0`;
}

// ═══════════════════ Extract token shape ════════════════
const meta = tokens.$metadata || {};
const prim = tokens.primitive || {};
const colors = prim.color || {};

function flattenColorBucket(bucket) {
  return Object.entries(bucket || {}).map(([k, v]) => ({
    key: k,
    hex: normalizeColor(v?.$value),
  })).filter(c => c.hex);
}

// Brand colors: prefer brand.html (it usually adds an accent and an explicit
// secondary that the design-tokens.json may not carry) and fall back to tokens.
const brandFromHtml = brand?.brandColors?.length
  ? Object.fromEntries(brand.brandColors.map(c => [c.slot, c.hex]))
  : null;
const brandColors = {
  primary:   brandFromHtml?.primary   || normalizeColor(colors.brand?.primary?.$value),
  secondary: brandFromHtml?.secondary || normalizeColor(colors.brand?.secondary?.$value),
  accent:    brandFromHtml?.accent    || normalizeColor(colors.brand?.accent?.$value),
};
const neutrals    = flattenColorBucket(colors.neutral);
const backgrounds = flattenColorBucket(colors.background);
const textColors  = flattenColorBucket(colors.text);
const radii       = Object.entries(prim.radius || {})
  .map(([k, v]) => ({ key: k, val: v.$value, px: parseInt(v.$value, 10) || 0 }))
  .filter(r => r.px > 0)
  .sort((a, b) => a.px - b.px);
const fonts       = Object.values(prim.fontFamily || {})
  .map(v => v?.$value).filter(Boolean);

// ═══════════════════ Gradients (raw + derived) ══════════
function gradientShortLabel(g) {
  if (g.classification === 'brand' || g.classification === 'bold') return g.classification;
  return g.type || 'gradient';
}
const gradients = (gradData.gradients || []).map((g, i) => {
  // Normalize raw to use hex where possible
  let preview = g.raw;
  if (preview) {
    preview = preview.replace(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/g, (_, r, gn, b, a) => {
      if (a !== undefined && parseFloat(a) < 1) return `rgba(${r}, ${gn}, ${b}, ${a})`;
      return '#' + [r, gn, b].map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
    });
  }
  return {
    idx: i + 1,
    raw: g.raw,
    preview,
    type: g.type,
    classification: g.classification,
    label: gradientShortLabel(g),
    stops: g.stops || [],
  };
});

// ═══════════════════ Theme computation ══════════════════
const primaryHex = brandColors.primary || gradients[0]?.stops?.[0]?.color || '#3b82f6';
// accent: prefer brand.accent; else the second stop of the first 2-stop gradient; else brand.secondary
const accentFromGradient = gradients
  .filter(g => g.stops?.length >= 2 && normalizeColor(g.stops[0].color) === primaryHex)
  .map(g => normalizeColor(g.stops[g.stops.length - 1].color))
  .find(c => c && c !== primaryHex);
const accentHex = brandColors.accent
  || accentFromGradient
  || brandColors.secondary
  || deriveAccent(primaryHex);
const secondaryHex = brandColors.secondary || accentHex;

// signature gradient: first "brand" linear, else first 2-stop linear, else synthesize
let signatureGrad = gradients.find(g => g.classification === 'brand' && g.type === 'linear' && g.stops?.length >= 2)
  || gradients.find(g => g.type === 'linear' && g.stops?.length >= 2 && !/transparent|0,\s*0\)/.test(g.raw))
  || null;
const signatureGradCss = signatureGrad?.raw || `linear-gradient(to right, ${primaryHex}, ${accentHex})`;

// ink: darkest text color that isn't pure black
const tintedInks = textColors.filter(c => c.hex !== '#000000' && luminance(c.hex) < 0.2);
const inkHex = tintedInks.sort((a, b) => luminance(a.hex) - luminance(b.hex))[0]?.hex
  || textColors[0]?.hex
  || '#171717';
const ink2Hex = textColors.find(c => c.hex !== inkHex && c.hex !== '#000000' && luminance(c.hex) < 0.35)?.hex || '#333333';
const mutedHex = textColors.find(c => luminance(c.hex) > 0.25 && luminance(c.hex) < 0.6)?.hex
  || neutrals.find(c => luminance(c.hex) > 0.3 && luminance(c.hex) < 0.6)?.hex
  || '#515b6d';

// canvas: warmest light background; fallback to bg3/bg2/bg0
const lightBgs = backgrounds.filter(b => isLight(b.hex) && b.hex !== '#ffffff');
const canvasHex = lightBgs.sort((a, b) => luminance(b.hex) - luminance(a.hex))[0]?.hex
  || (backgrounds.find(b => isLight(b.hex))?.hex)
  || '#fbfaf9';

// border / mist: lightest gray neutral
const borderHex = neutrals.find(c => isLight(c.hex) && luminance(c.hex) > 0.92 && c.hex !== '#ffffff')?.hex
  || '#f2f2f2';

// Light brand tints for backgrounds (find any light background that isn't white/canvas/border)
const tintBgs = backgrounds.filter(b => isLight(b.hex)
  && b.hex !== '#ffffff'
  && b.hex !== canvasHex
  && b.hex !== borderHex
  && luminance(b.hex) > 0.85
);

// Fonts: brand.html splits Display vs Body explicitly; tokens often expose only
// one family. Prefer brand.html for the Display/Body assignment, fall back to
// tokens-by-frequency.
const bodyFont    = brand?.typography?.body    || fonts[0] || 'system-ui';
const displayFont = brand?.typography?.display || (fonts[1] && fonts[1] !== bodyFont ? fonts[1] : bodyFont);
const monoFont    = fonts.find(f => /mono|code|tech/i.test(f)) || `${bodyFont} Mono`;
const brandWeights = brand?.typography?.weights || '';

// Build CSS font-family with fallbacks
function fontStack(name, kind) {
  const safe = `'${escapeCss(name)}'`;
  const fallback = kind === 'mono'
    ? `ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, monospace`
    : (kind === 'display'
        ? `'${escapeCss(bodyFont)}', -apple-system, BlinkMacSystemFont, 'Inter', system-ui, sans-serif`
        : `-apple-system, BlinkMacSystemFont, 'Inter', system-ui, sans-serif`);
  return `${safe}, ${fallback}`;
}
const displayStack = fontStack(displayFont, 'display');
const bodyStack    = fontStack(bodyFont, 'body');
const monoStack    = fontStack(monoFont, 'mono');

// Pick contrast-safe text color for primary background
const primaryFg = isLight(primaryHex) ? inkHex : '#ffffff';

// ═══════════════════ Voice handling ═════════════════════
const voiceSamples = voice?.sampleHeadings || [];
const dedupedSamples = [...new Set(voiceSamples)].slice(0, 6);
const voiceNonEnglish = dedupedSamples.some(hasNonAscii);

// ═══════════════════ Title / source meta ════════════════
const sourceUrl = meta.source || '';
const brandName = (() => {
  if (!sourceUrl) return prefix;
  try {
    const u = new URL(sourceUrl);
    const host = u.hostname.replace(/^www\./, '').split('.')[0];
    return host.charAt(0).toUpperCase() + host.slice(1);
  } catch { return prefix; }
})();
const generatedDate = (meta.generatedAt || '').slice(0, 10);
const generator = meta.generator
  || (designMd.match(/generator:\s*"?([^"\n]+)/)?.[1])
  || 'designlang';

// Material / intent / library from sibling files
const materialLabel = dna?.materialLanguage?.label || (designMd.match(/material:\s*([^\n]+)/)?.[1]?.trim()) || 'unknown';
const intentLabel = (designMd.match(/intent:\s*([^\n]+)/)?.[1]?.trim()) || 'unknown';
const imageryLabel = dna?.imageryStyle?.label || 'unknown';
const bgPatternLabel = dna?.backgroundPatterns?.labels?.[0] || 'unknown';

// ═══════════════════ Section renderers ══════════════════

function renderHero() {
  return `
<header class="hero">
  <div class="wrap">
    <div class="badge"><span class="dot"></span> Design System Reference · v1</div>
    <h1 class="display">
      Turn ${escapeHtml(brandName)}'s brand into <span class="gradient-text">video</span>.
    </h1>
    <p class="sub">
      Consolidated visual reference for the <strong>product-launch-video</strong> pipeline.
      Every color, gradient, easing curve, and component on this page is grep-ready and ships
      with a copy-pasteable code block scoped to Hyperframes scene composition.
    </p>
    <div class="meta">
      <span><strong>Source:</strong> ${escapeHtml(sourceUrl)}</span>
      <span><strong>Material:</strong> ${escapeHtml(materialLabel)}</span>
      <span><strong>Intent:</strong> ${escapeHtml(intentLabel)}</span>
      <span><strong>Generator:</strong> ${escapeHtml(generator)}</span>
      ${generatedDate ? `<span><strong>Extracted:</strong> ${escapeHtml(generatedDate)}</span>` : ''}
    </div>
  </div>
</header>
`;
}

function renderToc() {
  return `
<nav class="toc" aria-label="Section navigation">
  <a href="#brand-dna" title="Brand at a glance">01</a>
  <a href="#colors" title="Colors + Gradients">02</a>
  <a href="#typography" title="Typography">03</a>
  <a href="#radius" title="Radius">04</a>
  <a href="#motion" title="Motion">05</a>
  <a href="#visual-dna" title="Visual DNA">06</a>
  <a href="#voice" title="Voice">07</a>
  <a href="#detected" title="Detected components">08</a>
</nav>
`;
}

function renderBrandDna() {
  // When brand.html is present, anchor stats on its own summaries — they're
  // the values a human-readable document already vouched for.
  const brandColorCount = brand?.brandColors?.length || Object.keys(brandColors).filter(k => brandColors[k]).length;
  const neutralCount    = brand?.neutrals?.length    || neutrals.length;
  const paletteCount    = brand?.palette?.length     || (neutrals.length + backgrounds.length + textColors.length);
  const fontCount       = brand?.typography
    ? new Set([brand.typography.display, brand.typography.body].filter(Boolean)).size
    : fonts.length;
  const weightCount     = (brand?.typography?.weights || '').split(/[,\s]+/).filter(w => /^\d+$/.test(w)).length;

  const stats = [
    `${brandColorCount} brand color${brandColorCount === 1 ? '' : 's'}`,
    `${neutralCount} neutral${neutralCount === 1 ? '' : 's'}`,
    `${paletteCount} total palette`,
    `${gradients.length} gradient${gradients.length === 1 ? '' : 's'}`,
    `${fontCount} font famil${fontCount === 1 ? 'y' : 'ies'}${weightCount ? ` (${weightCount} weights)` : ''}`,
    `${radii.length} radius value${radii.length === 1 ? '' : 's'}`,
    `${Object.keys(motion.easing || {}).length} easing${Object.keys(motion.easing || {}).length === 1 ? '' : 's'}`,
  ];
  const sigSource = signatureGrad
    ? `extracted from <code>${escapeHtml(prefix)}-gradients.json</code> (gradient #${signatureGrad.idx})`
    : `synthesized from primary → accent (no brand gradient extracted)`;

  // Brand source for the three primary tiles: brand.html if available.
  const fromHtml = brandFromHtml ? `Source: <code>${escapeHtml(prefix)}.brand.html</code> §Colour` : null;
  const primaryDesc = fromHtml
    || (brandColors.primary ? 'From <code>primitive.color.brand.primary</code>.' : 'Derived.');
  const secondaryDesc = fromHtml
    || (brandColors.secondary ? 'From <code>primitive.color.brand.secondary</code>.' : 'Derived.');
  const accentDesc = fromHtml
    || (brandColors.accent
        ? 'From <code>primitive.color.brand.accent</code>.'
        : (accentFromGradient
            ? `Derived: 2nd stop of gradient #${gradients.findIndex(g => g.stops?.length >= 2 && normalizeColor(g.stops[0].color) === primaryHex) + 1}.`
            : (brandColors.secondary
                ? 'Mirrors <code>brand.secondary</code> (no accent extracted).'
                : 'Derived: +120° hue rotation from primary.')));

  return `
<section id="brand-dna">
  <div class="eyebrow">01 · One-glance summary</div>
  <h2 class="display">Brand at a glance</h2>
  <p class="sub">
    ${stats.join(' · ')}. Material classification: <strong>${escapeHtml(materialLabel)}</strong>.
    Page intent: <strong>${escapeHtml(intentLabel)}</strong>.
  </p>

  <div class="grid grid-4" style="margin-top: 40px;">
    <div class="trait">
      <div class="key">Primary</div>
      <div class="val" style="color: ${primaryHex};">${primaryHex}</div>
      <div class="desc">${primaryDesc}</div>
    </div>
    <div class="trait">
      <div class="key">Secondary</div>
      <div class="val" style="color: ${secondaryHex};">${secondaryHex}</div>
      <div class="desc">${secondaryDesc}</div>
    </div>
    <div class="trait">
      <div class="key">Accent</div>
      <div class="val" style="color: ${accentHex};">${accentHex}</div>
      <div class="desc">${accentDesc}</div>
    </div>
    <div class="trait">
      <div class="key">Canvas / ink</div>
      <div class="val">${canvasHex} <span style="font-size: 14px; color: ${mutedHex};">on</span> ${inkHex}</div>
      <div class="desc">Warmest light background + darkest tinted text.</div>
    </div>
  </div>

  ${brand?.typography ? `<div class="panel" style="margin-top: 32px;">
    <h4>Typography roles — from <code>${escapeHtml(prefix)}.brand.html</code> §Typography</h4>
    <div class="grid grid-3" style="gap: 24px; margin-top: 12px;">
      <div><div class="label">Display</div><div style="font-family: ${displayStack}; font-size: 28px; color: ${inkHex};">${escapeHtml(brand.typography.display || '—')}</div></div>
      <div><div class="label">Body</div><div style="font-family: ${bodyStack}; font-size: 22px; color: ${inkHex};">${escapeHtml(brand.typography.body || '—')}</div></div>
      <div><div class="label">Weights</div><div style="font-family: ui-monospace, monospace; font-size: 16px; color: ${inkHex};">${escapeHtml(brand.typography.weights || '—')}</div></div>
    </div>
  </div>` : ''}

  <div class="panel" style="margin-top: 24px;">
    <h4>Signature gradient — ${sigSource}</h4>
    <div style="height: 80px; border-radius: 12px; margin: 16px 0; background: ${signatureGradCss};"></div>
    <code class="label">${escapeHtml(signatureGradCss)}</code>
  </div>
</section>
`;
}

function renderColors() {
  const swatch = (hex, role, uses, key) => `
    <div class="swatch" ${key ? `data-token="${escapeHtml(key)}"` : ''} data-copy="${hex}">
      <div class="swatch-color ${isLight(hex) ? 'light' : 'dark'}" style="background:${hex}; ${isLight(hex) ? 'border-bottom: 1px solid rgba(0,0,0,0.05);' : ''}"></div>
      <div class="swatch-body">
        <div class="swatch-hex">${hex}</div>
        ${role ? `<div class="swatch-role">${escapeHtml(role)}</div>` : ''}
        ${uses ? `<div class="swatch-uses">${escapeHtml(uses)}</div>` : ''}
      </div>
      <div class="copied">copied</div>
    </div>`;

  const brandSwatches = [];
  if (brand?.brandColors?.length) {
    // Brand colors verbatim from brand.html §Colour
    for (const c of brand.brandColors) {
      brandSwatches.push(swatch(c.hex, c.role, `from ${prefix}.brand.html`, `brand.${c.slot}`));
    }
  } else {
    if (brandColors.primary)   brandSwatches.push(swatch(brandColors.primary,   'Primary',   'primitive.color.brand.primary', 'brand.primary'));
    if (brandColors.secondary && brandColors.secondary !== brandColors.primary) brandSwatches.push(swatch(brandColors.secondary, 'Secondary', 'primitive.color.brand.secondary', 'brand.secondary'));
    if (accentHex && accentHex !== brandColors.primary && accentHex !== brandColors.secondary) brandSwatches.push(swatch(accentHex, 'Accent', brandColors.accent ? 'primitive.color.brand.accent' : 'derived', 'brand.accent'));
  }

  // Top neutrals (up to 6)
  const neutralTiles = neutrals.slice(0, 6).map(n => swatch(n.hex, '', n.key));

  // Backgrounds (light tints emphasized)
  const bgTiles = backgrounds.slice(0, 8).map(b => swatch(b.hex, b.key, ''));

  // Build :root vars block
  const cssVars = [
    `  /* brand */`,
    `  --brand-primary: ${primaryHex};`,
    secondaryHex && secondaryHex !== primaryHex ? `  --brand-secondary: ${secondaryHex};` : null,
    accentHex !== primaryHex && accentHex !== secondaryHex ? `  --brand-accent: ${accentHex};` : null,
    '',
    `  /* foreground / neutrals (tinted, not pure) */`,
    `  --ink: ${inkHex};`,
    `  --ink-2: ${ink2Hex};`,
    `  --muted: ${mutedHex};`,
    `  --border: ${borderHex};`,
    '',
    `  /* canvas surfaces */`,
    `  --bg-white: #ffffff;`,
    `  --bg-canvas: ${canvasHex};`,
    ...tintBgs.slice(0, 4).map((b, i) => `  --bg-tint-${i + 1}: ${b.hex};`),
    `  --bg-black: #000000;`,
    '',
    `  /* gradients */`,
    `  --grad-signature: ${signatureGradCss};`,
    ...gradients.slice(1, 4).map((g, i) => `  --grad-${i + 2}: ${g.raw};`),
  ].filter(Boolean).join('\n');

  const gradCard = g => `
    <div class="grad-tile">
      <div class="grad-preview" style="background: ${g.raw};"></div>
      <div class="grad-tile-body">
        <div class="label-row"><strong>g${g.idx} · ${escapeHtml(g.label)}</strong>
          <span class="tag${g === signatureGrad ? ' signature' : ''}">${escapeHtml(g.classification || g.type || 'gradient')}</span>
        </div>
        <code>${escapeHtml(g.preview || g.raw)}</code>
      </div>
    </div>`;

  return `
<section id="colors">
  <div class="eyebrow">02 · Color system</div>
  <h2 class="display">Colors &amp; gradients.</h2>
  <p class="sub">${neutrals.length + backgrounds.length + textColors.length + 3} extracted color slots across the page.
    Below: the brand-defining subset plus all ${gradients.length} site gradients. Each tile is click-to-copy.</p>

  ${brandSwatches.length ? `<h3>Brand colors</h3>
  <div class="grid grid-3">${brandSwatches.join('')}</div>` : ''}

  ${neutralTiles.length ? `<h3>Foreground &amp; neutrals</h3>
  <div class="grid grid-6">${neutralTiles.join('')}</div>` : ''}

  ${bgTiles.length ? `<h3>Backgrounds (use full-bleed for scene canvases)</h3>
  <div class="grid grid-4">${bgTiles.join('')}</div>` : ''}

  ${gradients.length ? `<h3>Gradients (${gradients.length} extracted)</h3>
  <div class="grid grid-3">${gradients.map(gradCard).join('')}</div>` : `<h3>Gradients</h3>
  <p class="sub" style="font-size: 14px; margin-top: 8px;">No site gradients detected. The signature gradient above is synthesized from primary + accent.</p>`}

  <h3>CSS custom-properties dump</h3>
  <div class="codeblock">
    <button class="copy-btn" data-copy-target="css-root">Copy</button>
<pre id="css-root"><span class="c-com">/* Faithful representation of the extracted tokens. */</span>
<span class="c-sel">:root</span> {
${cssVars}
}</pre>
  </div>
</section>
`;
}

function renderTypography() {
  // Source-of-truth ordering: brand.html §Typography wins when present; tokens
  // are the fallback. Heading scale and the weights paragraph are intentionally
  // dropped — sizes are web-only and don't transfer to video.
  const usingBrand = !!brand?.typography;
  const roles = usingBrand
    ? [
        { family: brand.typography.display, role: 'Display', isDisplay: true },
        ...(brand.typography.body && brand.typography.body !== brand.typography.display
            ? [{ family: brand.typography.body, role: 'Body', isDisplay: false }]
            : []),
      ]
    : fonts.map(family => ({
        family,
        role: family === displayFont ? 'Display' : family === bodyFont ? 'Body' : 'Auxiliary',
        isDisplay: family === displayFont,
      }));

  const fontCards = roles.map(({ family, role, isDisplay }) => `
  <div class="font-card${isDisplay ? ' display-card' : ''}">
    <div class="role">${escapeHtml(role)}${family === monoFont ? ' · mono' : ''}</div>
    <div class="family">${escapeHtml(family)}</div>
    <div class="font-specimen display" style="font-family: '${escapeCss(family)}', ${family === monoFont ? 'ui-monospace, monospace' : 'system-ui, sans-serif'}; ${isDisplay ? `background: ${signatureGradCss}; -webkit-background-clip: text; background-clip: text; color: transparent;` : `color: ${inkHex};`} font-size: 56px; font-weight: 400;">
      ${escapeHtml(brandName)}
    </div>
  </div>`).join('');

  const sourceLabel = usingBrand
    ? `<code>${escapeHtml(prefix)}.brand.html</code> §Typography`
    : `<code>primitive.fontFamily</code> in tokens`;

  return `
<section id="typography">
  <div class="eyebrow">03 · Typography</div>
  <h2 class="display">${roles.length} font famil${roles.length === 1 ? 'y' : 'ies'}.</h2>
  <p class="sub">From ${sourceLabel}${brandWeights ? `. Weights in use: <code>${escapeHtml(brandWeights)}</code>` : ''}.</p>

  ${fontCards}

  <h3>CSS font-family dump</h3>
  <div class="codeblock">
    <button class="copy-btn" data-copy-target="css-font">Copy</button>
<pre id="css-font"><span class="c-com">/* Faithful representation. Fallbacks added for hosts that lack the family. */</span>
<span class="c-sel">:root</span> {
  <span class="c-key">--font-display</span>: <span class="c-val">${escapeHtml(displayStack)}</span>;
  <span class="c-key">--font-body</span>:    <span class="c-val">${escapeHtml(bodyStack)}</span>;
  <span class="c-key">--font-mono</span>:    <span class="c-val">${escapeHtml(monoStack)}</span>;
}</pre>
  </div>
</section>
`;
}

function renderRadius() {
  if (!radii.length) return `<section id="radius"><div class="eyebrow">04 · Shape · radius</div><h2 class="display">No radius tokens extracted.</h2></section>`;

  // Use counts from DESIGN.md if available
  const radiusCounts = (designMd.match(/## Border Radii\n([\s\S]*?)\n\n/)?.[1] || '')
    .split('\n').filter(l => l.startsWith('|')).map(l => {
      const m = l.match(/\|\s*([\w]+)\s*\|\s*([\d.]+px)\s*\|\s*(\d+)\s*\|/);
      return m ? { label: m[1], val: m[2], count: parseInt(m[3], 10) } : null;
    }).filter(Boolean);
  const countByVal = Object.fromEntries(radiusCounts.map(r => [r.val, r.count]));

  const tiles = radii.map(r => {
    const uses = countByVal[r.val];
    return `
    <div class="radius-tile">
      <div class="radius-box" style="border-radius: ${r.val}; background: ${signatureGradCss};"></div>
      <div class="val">${r.val}</div>
      <div class="usage">${r.key}${uses !== undefined ? ` · ${uses} use${uses === 1 ? '' : 's'}` : ''}</div>
    </div>`;
  }).join('');

  return `
<section id="radius">
  <div class="eyebrow">04 · Shape · radius</div>
  <h2 class="display">${radii.length} radius value${radii.length === 1 ? '' : 's'}.</h2>
  <p class="sub">
    From <code>primitive.radius</code> in tokens (ordered by px ascending). Use-counts where shown
    come from <code>${escapeHtml(prefix)}-DESIGN.md</code>.
  </p>

  <div class="panel">
    <div class="grid grid-6" data-token="radius">${tiles}</div>
  </div>

  <h3>CSS custom-properties dump</h3>
  <div class="codeblock">
    <button class="copy-btn" data-copy-target="css-radius">Copy</button>
<pre id="css-radius"><span class="c-sel">:root</span> {
${radii.map(r => `  <span class="c-key">--radius-${r.key}</span>: <span class="c-val">${r.val}</span>;`).join('\n')}
}</pre>
  </div>
</section>
`;
}

function renderMotion() {
  const easings = Object.entries(motion.easing || {});
  const durations = Object.entries(motion.duration || {});
  const scrollLinked = motion.$meta?.scrollLinked;
  const feel = motion.$meta?.feel;
  const springs = Object.entries(motion.spring || {});

  const easeCard = ([name, e]) => {
    const bezier = e.$value || e.value || '';
    const gsap = bezierToGsapEase(bezier);
    const path = bezierToSvgPath(bezier);
    const family = e.family;
    return `
    <div class="easing-card">
      <div class="easing-name">${escapeHtml(name)}${family ? ` <span style="color: ${mutedHex}; font-weight: 400;">· ${escapeHtml(family)}</span>` : ''}</div>
      <span class="easing-bezier">${escapeHtml(bezier)}</span>
      <span class="easing-gsap">GSAP → "${gsap}"</span>
      <svg class="easing-curve" viewBox="0 0 160 160" preserveAspectRatio="xMidYMid meet">
        <line x1="0" y1="0" x2="160" y2="0" class="grid-line"/>
        <line x1="0" y1="160" x2="160" y2="160" class="grid-line"/>
        <line x1="0" y1="80" x2="160" y2="80" class="grid-line"/>
        <line x1="80" y1="0" x2="80" y2="160" class="grid-line"/>
        <line x1="0" y1="160" x2="160" y2="0" class="diagonal"/>
        <path d="${path}" class="curve"/>
        <circle cx="0" cy="160" r="4" class="endpoint"/>
        <circle cx="160" cy="0" r="4" class="endpoint"/>
      </svg>
      <div class="easing-demo-track">
        <span class="easing-demo-dot" style="animation-timing-function: ${escapeHtml(bezier)};"></span>
      </div>
    </div>`;
  };

  // GSAP ease names mapped directly from each extracted bezier (no fabrication)
  const easeMap = Object.fromEntries(easings.map(([k, e]) => [k, bezierToGsapEase(e.$value || e.value)]));

  // Duration values: verbatim ms from JSON; the table also shows the value in seconds
  const durMs = durations.map(([k, d]) => ({ key: k, ms: d.ms ?? parseInt(d.$value || d.value || '0') }));

  const metaBits = [
    feel ? `feel: <strong>${escapeHtml(feel)}</strong>` : null,
    scrollLinked !== undefined ? `scrollLinked: <strong>${scrollLinked}</strong>` : null,
    springs.length ? `${springs.length} spring${springs.length === 1 ? '' : 's'}` : null,
  ].filter(Boolean);

  return `
<section id="motion">
  <div class="eyebrow">05 · Motion language</div>
  <h2 class="display">${easings.length} easing${easings.length === 1 ? '' : 's'} · ${durations.length} duration${durations.length === 1 ? '' : 's'}${springs.length ? ` · ${springs.length} spring${springs.length === 1 ? '' : 's'}` : ''}.</h2>
  <p class="sub">
    From <code>${escapeHtml(prefix)}-motion-tokens.json</code>.
    ${metaBits.length ? `Metadata: ${metaBits.join(' · ')}.` : ''}
  </p>

  ${easings.length ? `<h3>Easing curves (cubic-bezier from source · GSAP equivalent)</h3>
  <div class="grid" style="grid-template-columns: repeat(${Math.min(easings.length, 2)}, 1fr); gap: 24px;">
    ${easings.map(easeCard).join('')}
  </div>
  <p style="font-size: 12px; color: ${mutedHex}; margin-top: 12px; font-family: ui-monospace, monospace;">
    GSAP mapping rules: Material standards (cubic-bezier(0,0,0.2,1) → power2.out, cubic-bezier(0.4,0,0.2,1) → power3.inOut, etc.) matched directly; non-standard curves fall back to power2.out / power2.in / power2.inOut by handle position.
  </p>` : `<p class="sub" style="font-size: 14px;">No easings extracted.</p>`}

  ${durations.length ? `<h3>Durations</h3>
  <div class="panel">
    ${durMs.map(d => {
      const sec = (d.ms / 1000).toFixed(3);
      const width = Math.min(95, Math.max(3, d.ms / 10));
      return `
    <div class="dur-row">
      <span class="dur-name">${escapeHtml(d.key)}</span>
      <span class="dur-track"><span class="dur-fill" style="width: ${width}%;"></span></span>
      <span class="dur-val">${d.ms}ms · ${sec}s</span>
    </div>`;
    }).join('')}
  </div>` : `<p class="sub" style="font-size: 14px; margin-top: 24px;">No durations extracted.</p>`}

  <h3>JS constants — direct mapping</h3>
  <div class="codeblock">
    <button class="copy-btn" data-copy-target="js-motion">Copy</button>
<pre id="js-motion"><span class="c-com">// Direct mapping of ${escapeHtml(prefix)}-motion-tokens.json into JS constants.</span>
<span class="c-com">// EASE values are GSAP names that match each extracted cubic-bezier 1:1.</span>
<span class="c-com">// DUR values are verbatim seconds (ms ÷ 1000) from the source.</span>
<span class="c-key">const</span> <span class="c-val">EASE</span> = {
${Object.entries(easeMap).length ? Object.entries(easeMap).map(([k, v]) => `  <span class="c-key">${escapeHtml(k)}</span>: <span class="c-str">"${escapeHtml(v)}"</span>,`).join('\n') : '  <span class="c-com">// no easings extracted</span>'}
};

<span class="c-key">const</span> <span class="c-val">DUR</span> = {
${durMs.length ? durMs.map(d => `  <span class="c-key">${escapeHtml(d.key)}</span>: <span class="c-val">${(d.ms / 1000).toFixed(3)}</span>,  <span class="c-com">// ${d.ms}ms</span>`).join('\n') : '  <span class="c-com">// no durations extracted</span>'}
};</pre>
  </div>
</section>
`;
}

function renderVisualDna() {
  const dnaTrait = (key, val, desc) => `
    <div class="trait">
      <div class="key">${escapeHtml(key)}</div>
      <div class="val">${escapeHtml(val)}</div>
      <div class="desc">${desc}</div>
    </div>`;

  const matMetrics = dna?.materialLanguage?.metrics || {};
  const imageryC = dna?.imageryStyle?.counts || {};
  const bgC = dna?.backgroundPatterns?.counts || {};
  const gradTotals = dna?.backgroundPatterns?.gradientTotals || {};

  const matDesc = (() => {
    const parts = [];
    if (matMetrics.saturation !== undefined) parts.push(`Saturation ${matMetrics.saturation.toFixed(2)}`);
    if (matMetrics.avgShadowBlur !== undefined) parts.push(`avg shadow blur ${matMetrics.avgShadowBlur}px`);
    if (matMetrics.avgRadius !== undefined) parts.push(`avg radius ${matMetrics.avgRadius}px`);
    parts.push(materialLabel === 'flat'
      ? '<strong>Skip every <code>box-shadow</code></strong> in scene CSS except subtle inset on glow-pulse hero CTAs.'
      : 'Match shadow habits in scene CSS — extracted values inform elevation language.');
    return parts.join(' · ');
  })();

  const imgDesc = (() => {
    const parts = [];
    if (imageryC.total !== undefined) parts.push(`${imageryC.total} images`);
    if (imageryC.svg !== undefined) parts.push(`<strong>${imageryC.svg} SVGs</strong>`);
    if (imageryC.icon !== undefined) parts.push(`<strong>${imageryC.icon} icons</strong>`);
    if (imageryC.photoLike !== undefined) parts.push(`${imageryC.photoLike} photos`);
    parts.push(imageryC.photoLike === 0
      ? 'Use it: prefer SVG illustrations and UI screenshots over photography.'
      : 'Mix illustrations and photography — match the source distribution.');
    return parts.join(' · ');
  })();

  const bgDesc = (() => {
    const parts = [];
    if (bgC.noise !== undefined) parts.push(`noise: ${bgC.noise}`);
    if (bgC.dotGrid !== undefined) parts.push(`dot-grid: ${bgC.dotGrid}`);
    if (gradTotals.linear !== undefined) parts.push(`linear gradients: ${gradTotals.linear}`);
    if (gradTotals.radial !== undefined) parts.push(`radial gradients: ${gradTotals.radial}`);
    parts.push('Use 1-2 layered radial-gradient halos for ambient surface texture, not patterns.');
    return parts.join(' · ');
  })();

  return `
<section id="visual-dna">
  <div class="eyebrow">06 · Visual DNA</div>
  <h2 class="display">Material, imagery, background.</h2>
  <p class="sub">
    Source: <code>${escapeHtml(prefix)}-visual-dna.json</code>. These traits constrain asset selection
    and scene composition — pick references that match the brand's signal, not against it.
  </p>

  <div class="grid grid-3">
    ${dnaTrait('Material', materialLabel, matDesc)}
    ${dnaTrait('Imagery', imageryLabel, imgDesc)}
    ${dnaTrait('Background', bgPatternLabel, bgDesc)}
  </div>

  <h3 style="margin-top: 48px;">Raw DNA stats</h3>
  <div class="codeblock">
    <button class="copy-btn" data-copy-target="dna-stats">Copy</button>
<pre id="dna-stats"><span class="c-com">// from ${escapeHtml(prefix)}-visual-dna.json — use to filter your asset shortlist</span>
${escapeHtml(JSON.stringify({
  materialLanguage: { label: materialLabel, ...matMetrics },
  imageryStyle:     { label: imageryLabel, ...imageryC },
  backgroundPatterns: { label: bgPatternLabel, ...bgC, ...gradTotals },
}, null, 2))}</pre>
  </div>

  <div class="comp-note">
    <strong>Translation for scene composition:</strong>
    (1) Material label drives elevation — <em>flat</em> means no <code>box-shadow</code>; <em>material</em> earns drop shadows.
    (2) Imagery label drives asset picks — <em>flat-illustration</em> prefers SVG/UI mocks; <em>photo-realistic</em> earns photography.
    (3) Background label drives ambient texture — <em>plain</em> wants radial halos at low opacity; <em>noise/grid</em> earns patterns.
  </div>
</section>
`;
}

function renderVoice() {
  if (!voice) return `
<section id="voice">
  <div class="eyebrow">07 · Brand voice</div>
  <h2 class="display">Voice data not extracted.</h2>
  <p class="sub">Re-run designlang to capture voice metadata.</p>
</section>`;

  const ctaVerbs = (voice.ctaVerbs || []).slice(0, 8).map(v => v.value).filter(Boolean);
  const buttonPatterns = (voice.buttonPatterns || []).slice(0, 12).map(b => b.value).filter(Boolean);

  return `
<section id="voice">
  <div class="eyebrow">07 · Brand voice</div>
  <h2 class="display">Tone, headings, CTAs.</h2>

  ${voiceNonEnglish ? `<div class="voice-note">
    <strong>Data note ⚠︎</strong>
    <span><code>${escapeHtml(prefix)}-voice.json</code> contains non-English text — the CDN likely
    forced a geo-locale during extraction. The <em>tone</em>, <em>pronoun</em>, and
    <em>heading style</em> fields are still trustworthy (language-agnostic). Hand-translate the
    sampleHeadings + CTA verbs below to English for the video pipeline, or post-process via LLM.</span>
  </div>` : ''}

  <div class="grid grid-4">
    <div class="trait"><div class="key">Tone</div><div class="val" style="font-size: 22px;">${escapeHtml(voice.tone || 'unknown')}</div><div class="desc">Brand communication register.</div></div>
    <div class="trait"><div class="key">Pronoun</div><div class="val" style="font-size: 22px;">${escapeHtml(voice.pronoun || 'unknown')}</div><div class="desc">Address style: first/second/third person.</div></div>
    <div class="trait"><div class="key">Heading style</div><div class="val" style="font-size: 22px;">${escapeHtml(voice.headingStyle || 'unknown')}</div><div class="desc">Capitalization convention for titles.</div></div>
    <div class="trait"><div class="key">Heading length</div><div class="val" style="font-size: 22px;">${escapeHtml(voice.headingLengthClass || 'unknown')}</div><div class="desc">Concision class: tight / balanced / verbose.</div></div>
  </div>

  ${dedupedSamples.length ? `<h3 style="margin-top: 40px;">Sample headlines${voiceNonEnglish ? ' (verbatim from source — translate before scripting)' : ''}</h3>
  <div class="voice-headings">
    ${dedupedSamples.map((h, i) => `
    <div class="specimen">${escapeHtml(h)}<span class="src">// sample ${i + 1} · ${h.split(' ').length} word${h.split(' ').length === 1 ? '' : 's'} · ${voice.headingStyle || ''}</span></div>`).join('')}
  </div>` : ''}

  ${buttonPatterns.length || ctaVerbs.length ? `<h3 style="margin-top: 32px;">CTA verbs &amp; button copy</h3>
  <div class="panel">
    ${ctaVerbs.length ? `<h4 style="margin-top: 0;">CTA verbs (verbatim)</h4>
    ${ctaVerbs.map(v => `<span class="cta-pill primary">${escapeHtml(v)}</span>`).join('')}` : ''}
    ${buttonPatterns.length ? `<h4 style="margin-top: 24px;">Button patterns (verbatim)</h4>
    ${buttonPatterns.map(b => `<span class="cta-pill secondary">${escapeHtml(b)}</span>`).join('')}` : ''}
  </div>` : ''}

</section>
`;
}

function renderDetected() {
  // ── Parse anatomy.tsx for detected components ──
  const components = [];
  if (anatomyTsx) {
    const interfaceRe = /export interface (\w+)Props\s*\{([\s\S]*?)\}/g;
    let m;
    while ((m = interfaceRe.exec(anatomyTsx))) {
      const name = m[1];
      const body = m[2];
      const props = [];
      const propRe = /(\w+)\?\s*:\s*([^;]+);/g;
      let pm;
      while ((pm = propRe.exec(body))) {
        const propName = pm[1];
        const propType = pm[2].trim();
        // Extract string-literal unions
        const literals = [...propType.matchAll(/'([^']+)'/g)].map(x => x[1]);
        props.push({ name: propName, type: propType, literals });
      }
      components.push({ name, props });
    }
  }

  // ── DESIGN.md "Detected patterns" line ──
  const patterns = (designMd.match(/\*\*Detected patterns:\*\*\s*([^\n]+)/)?.[1] || '')
    .split(/\s*·\s*/).map(s => s.replace(/`/g, '').trim()).filter(Boolean);

  // ── DESIGN.md anatomy table ──
  const anatomyRows = (designMd.match(/\*\*Anatomy\*\*\n([\s\S]*?)(?:\n\n|\n#)/)?.[1] || '')
    .split('\n').filter(l => /^\| \w/.test(l) && !l.includes('---')).slice(1).map(l => {
      const parts = l.split('|').map(s => s.trim()).filter(Boolean);
      return parts.length >= 4 ? { kind: parts[0], variants: parts[1], sizes: parts[2], instances: parts[3] } : null;
    }).filter(Boolean);

  // ── Icon stats ──
  const iconStats = iconSys ? {
    total: iconSys.stats?.count ?? iconSys.icons?.length ?? 0,
    avgStroke: iconSys.stats?.avgStrokeWidth,
    grid: iconSys.stats?.gridDistribution || {},
    roundedCapsFraction: iconSys.stats?.roundedCapsFraction,
    library: iconSys.library,
  } : null;

  // ── Library detection ──
  const lib = library ? {
    label: library.library,
    confidence: library.confidence,
    alternates: library.alternates || [],
  } : null;

  // ── Section reading order from intent.json ──
  const readingOrder = intent?.sectionRoles?.sections
    ? intent.sectionRoles.sections.map(s => s.role).filter(Boolean)
    : (designMd.match(/Reading order detected on the source:\s*`([^`]+)`/)?.[1] || '')
        .split(/\s*→\s*/).map(s => s.trim()).filter(Boolean);

  // ── Form states ──
  const formStateKeys = formSt ? Object.keys(formSt) : [];

  // ── Render ──
  const hasAnyContent = components.length || patterns.length || anatomyRows.length || iconStats || lib || readingOrder.length || formStateKeys.length;
  if (!hasAnyContent) {
    return `
<section id="detected">
  <div class="eyebrow">08 · Detected components</div>
  <h2 class="display">No component data extracted.</h2>
  <p class="sub">
    designlang's anatomy / library / icon-system / intent files were missing or empty for this site.
  </p>
</section>
`;
  }

  return `
<section id="detected">
  <div class="eyebrow">08 · Detected components</div>
  <h2 class="display">What designlang actually saw.</h2>
  <p class="sub">
    Faithful contents of <code>${escapeHtml(prefix)}-anatomy.tsx</code>,
    <code>${escapeHtml(prefix)}-library.json</code>,
    <code>${escapeHtml(prefix)}-icon-system.json</code>,
    <code>${escapeHtml(prefix)}-intent.json</code>,
    and <code>${escapeHtml(prefix)}-form-states.json</code> (when present).
  </p>

  ${lib ? `<h3>Library detection</h3>
  <div class="panel">
    <div style="display: flex; gap: 24px; align-items: baseline; flex-wrap: wrap;">
      <div>
        <div class="label">label</div>
        <div style="font-size: 24px; font-family: ui-monospace, monospace; color: ${inkHex}; font-weight: 600;">${escapeHtml(lib.label)}</div>
      </div>
      <div>
        <div class="label">confidence</div>
        <div style="font-size: 24px; font-family: ui-monospace, monospace; color: ${inkHex}; font-weight: 600;">${lib.confidence?.toFixed?.(3) ?? lib.confidence}</div>
      </div>
      ${lib.alternates.length ? `<div>
        <div class="label">alternates</div>
        <div style="font-family: ui-monospace, monospace;">${lib.alternates.map(a => escapeHtml(typeof a === 'string' ? a : a.label || JSON.stringify(a))).join(', ')}</div>
      </div>` : ''}
    </div>
  </div>` : ''}

  ${patterns.length ? `<h3>Detected patterns (from DESIGN.md)</h3>
  <p>${patterns.map(p => `<span class="cta-pill secondary">${escapeHtml(p)}</span>`).join('')}</p>` : ''}

  ${anatomyRows.length ? `<h3>Anatomy summary (from DESIGN.md)</h3>
  <div class="panel" style="padding: 0; overflow: hidden;">
    <table style="width: 100%; border-collapse: collapse; font-family: ui-monospace, monospace; font-size: 13px;">
      <thead>
        <tr style="background: ${borderHex}; color: ${mutedHex};">
          <th style="text-align: left; padding: 12px 20px; font-weight: 600;">kind</th>
          <th style="text-align: left; padding: 12px 20px; font-weight: 600;">variants</th>
          <th style="text-align: left; padding: 12px 20px; font-weight: 600;">sizes</th>
          <th style="text-align: left; padding: 12px 20px; font-weight: 600;">instances</th>
        </tr>
      </thead>
      <tbody>
        ${anatomyRows.map(r => `<tr style="border-top: 1px solid ${borderHex};">
          <td style="padding: 12px 20px; color: ${inkHex}; font-weight: 600;">${escapeHtml(r.kind)}</td>
          <td style="padding: 12px 20px;">${escapeHtml(r.variants)}</td>
          <td style="padding: 12px 20px;">${escapeHtml(r.sizes)}</td>
          <td style="padding: 12px 20px;">${escapeHtml(r.instances)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>` : ''}

  ${components.length ? `<h3>TypeScript scaffolds (from anatomy.tsx)</h3>
  ${components.map(c => `
  <div class="panel" style="margin-bottom: 12px;">
    <h4 style="margin: 0 0 12px 0; color: ${inkHex}; text-transform: none; letter-spacing: 0;">${escapeHtml(c.name)}Props</h4>
    ${c.props.length ? `<table style="width: 100%; border-collapse: collapse; font-family: ui-monospace, monospace; font-size: 12px;">
      <thead>
        <tr style="color: ${mutedHex};">
          <th style="text-align: left; padding: 6px 12px; font-weight: 600;">prop</th>
          <th style="text-align: left; padding: 6px 12px; font-weight: 600;">type / literals</th>
        </tr>
      </thead>
      <tbody>
        ${c.props.map(p => `<tr style="border-top: 1px solid ${borderHex};">
          <td style="padding: 6px 12px; color: ${inkHex};">${escapeHtml(p.name)}</td>
          <td style="padding: 6px 12px; color: ${mutedHex};">${p.literals.length ? p.literals.map(l => `<span class="cta-pill secondary" style="margin: 2px;">${escapeHtml(l)}</span>`).join('') : escapeHtml(p.type)}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : `<p style="color: ${mutedHex}; font-size: 13px;">no typed props</p>`}
  </div>`).join('')}` : ''}

  ${iconStats ? `<h3>Icon system stats (from icon-system.json)</h3>
  <div class="grid grid-4">
    <div class="trait">
      <div class="key">Icons total</div>
      <div class="val">${iconStats.total}</div>
      <div class="desc">distinct icon instances on the page</div>
    </div>
    ${iconStats.avgStroke !== undefined ? `<div class="trait">
      <div class="key">Avg stroke width</div>
      <div class="val">${iconStats.avgStroke}</div>
      <div class="desc">across icons that declare stroke-width</div>
    </div>` : ''}
    ${iconStats.roundedCapsFraction !== undefined ? `<div class="trait">
      <div class="key">Rounded caps</div>
      <div class="val">${(iconStats.roundedCapsFraction * 100).toFixed(0)}%</div>
      <div class="desc">fraction of icons using stroke-linecap: round</div>
    </div>` : ''}
    ${Object.keys(iconStats.grid).length ? `<div class="trait">
      <div class="key">Grid distribution</div>
      <div class="val" style="font-size: 20px;">${Object.entries(iconStats.grid).map(([g, n]) => `${g}×${g}: ${n}`).join(', ')}</div>
      <div class="desc">most icons live on a single grid</div>
    </div>` : ''}
  </div>` : ''}

  ${readingOrder.length ? `<h3>Section reading order (from intent.json)</h3>
  <p>${readingOrder.map(r => `<span class="cta-pill secondary" style="margin: 2px;">${escapeHtml(r)}</span>`).join('<span style="color: ${mutedHex}; margin: 0 4px;">→</span>')}</p>` : ''}

  ${formStateKeys.length ? `<h3>Form states (from form-states.json)</h3>
  <div class="codeblock">
    <button class="copy-btn" data-copy-target="form-states-json">Copy</button>
<pre id="form-states-json">${escapeHtml(JSON.stringify(formSt, null, 2))}</pre>
  </div>` : ''}
</section>
`;
}


// ═══════════════════ Page-level styles ══════════════════
const pageStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    font-family: ${bodyStack};
    color: ${inkHex};
    background: ${canvasHex};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 1120px; margin: 0 auto; padding: 0 32px; }
  main { padding: 96px 0 160px; }
  section { padding: 88px 0; border-top: 1px solid ${borderHex}; scroll-margin-top: 24px; }
  section:first-child { border-top: none; padding-top: 32px; }

  .display {
    font-family: ${displayStack};
    font-weight: 400;
    letter-spacing: -0.02em;
    line-height: 1.04;
  }
  .eyebrow {
    font-family: ${monoStack};
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${mutedHex};
  }
  h1 { font-size: clamp(40px, 6vw, 72px); }
  h2 { font-size: clamp(28px, 3.4vw, 44px); margin-bottom: 8px; }
  h3 { font-size: 20px; font-weight: 700; margin: 32px 0 16px; }
  h4 { font-size: 15px; font-weight: 600; margin: 20px 0 10px; color: ${ink2Hex}; text-transform: uppercase; letter-spacing: 0.06em; }
  p { color: ${ink2Hex}; }
  .sub { font-size: 18px; line-height: 1.55; color: ${mutedHex}; max-width: 62ch; margin-top: 16px; }
  .label { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 12px; color: ${mutedHex}; }

  a { color: ${inkHex}; text-decoration: none; border-bottom: 1px solid ${primaryHex}33; transition: border-color 0.2s cubic-bezier(0,0,0.2,1); }
  a:hover { border-bottom-color: ${primaryHex}; }

  .hero {
    background:
      radial-gradient(ellipse 80% 60% at 20% 0%, ${tintBgs[0]?.hex || primaryHex + '33'} 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 100% 100%, ${tintBgs[1]?.hex || accentHex + '33'} 0%, transparent 60%),
      ${canvasHex};
    padding: 88px 0 120px;
    position: relative;
    overflow: hidden;
  }
  .hero::after {
    content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 1px;
    background: linear-gradient(to right, transparent, ${borderHex}, transparent);
  }
  .hero h1 .gradient-text {
    background: ${signatureGradCss};
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .hero .meta {
    margin-top: 32px;
    display: flex; flex-wrap: wrap; gap: 8px 24px;
    font-family: ui-monospace, 'SF Mono', Menlo, monospace;
    font-size: 13px;
    color: ${mutedHex};
  }
  .hero .meta strong { color: ${inkHex}; font-weight: 600; }
  .hero .badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 14px;
    background: #fff;
    border: 1px solid ${borderHex};
    border-radius: 70px;
    font-size: 13px;
    color: ${inkHex};
    margin-bottom: 24px;
  }
  .hero .badge .dot { width: 8px; height: 8px; border-radius: 50%; background: ${primaryHex}; box-shadow: 0 0 0 4px ${primaryHex}33; }

  .toc {
    position: fixed;
    right: 24px;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid ${borderHex};
    border-radius: 70px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    z-index: 50;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  }
  .toc a {
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px;
    border-radius: 50%;
    font-size: 11px; font-weight: 600;
    color: ${mutedHex}; border: none;
    font-family: ui-monospace, monospace;
    transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  }
  .toc a:hover { background: ${tintBgs[0]?.hex || primaryHex + '33'}; color: ${inkHex}; }
  @media (max-width: 1280px) { .toc { display: none; } }

  .grid { display: grid; gap: 16px; }
  .grid-3 { grid-template-columns: repeat(3, 1fr); }
  .grid-4 { grid-template-columns: repeat(4, 1fr); }
  .grid-6 { grid-template-columns: repeat(6, 1fr); }
  @media (max-width: 900px) { .grid-3, .grid-4, .grid-6 { grid-template-columns: repeat(2, 1fr); } }

  .panel { background: #fff; border: 1px solid ${borderHex}; border-radius: 20px; padding: 32px; }

  .swatch {
    background: #fff;
    border: 1px solid ${borderHex};
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    position: relative;
    transition: transform 0.2s cubic-bezier(0, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0, 0, 0.2, 1);
  }
  .swatch:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06); }
  .swatch-color { height: 96px; position: relative; }
  .swatch-body { padding: 14px 16px; }
  .swatch-hex { font-family: ui-monospace, monospace; font-weight: 600; color: ${inkHex}; font-size: 14px; }
  .swatch-role { font-size: 12px; color: ${mutedHex}; margin-top: 2px; }
  .swatch-uses { font-size: 11px; color: ${mutedHex}; margin-top: 6px; font-family: ui-monospace, monospace; opacity: 0.7; }
  .copied {
    position: absolute; top: 8px; right: 8px;
    background: ${inkHex}; color: #fff;
    font-size: 11px; padding: 2px 8px; border-radius: 6px;
    opacity: 0; transition: opacity 0.2s; font-family: ui-monospace, monospace;
  }
  .copied.show { opacity: 1; }

  .grad-tile { border-radius: 16px; overflow: hidden; border: 1px solid ${borderHex}; background: #fff; }
  .grad-preview { height: 120px; }
  .grad-tile-body { padding: 14px 16px; }
  .grad-tile .label-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
  .grad-tile .tag {
    background: ${borderHex}; color: ${mutedHex};
    font-size: 10px; padding: 2px 8px; border-radius: 70px;
    text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600;
  }
  .grad-tile .tag.signature { background: ${tintBgs[0]?.hex || primaryHex + '33'}; color: ${inkHex}; }
  .grad-tile code { font-family: ui-monospace, monospace; font-size: 11px; color: ${mutedHex}; word-break: break-word; cursor: pointer; }

  .codeblock {
    background: #0f1419;
    color: #e6edf3;
    border-radius: 16px;
    padding: 20px 24px;
    margin: 20px 0;
    font-family: ui-monospace, 'SF Mono', Menlo, Monaco, monospace;
    font-size: 13px;
    line-height: 1.65;
    overflow-x: auto;
    position: relative;
    border: 1px solid #1f2937;
  }
  .codeblock .copy-btn {
    position: absolute;
    top: 14px; right: 14px;
    background: rgba(255, 255, 255, 0.06);
    color: ${mutedHex};
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 4px 10px;
    font-size: 11px;
    font-family: ui-monospace, monospace;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  }
  .codeblock .copy-btn:hover { background: ${primaryHex}26; color: ${primaryHex}; border-color: ${primaryHex}4d; }
  .codeblock .copy-btn.copied { background: #35c838; color: #fff; border-color: #35c838; }
  .codeblock pre { white-space: pre; font-family: inherit; }
  .codeblock .c-key { color: #a8b8ff; }
  .codeblock .c-val { color: #ffd580; }
  .codeblock .c-com { color: #515b6d; font-style: italic; }
  .codeblock .c-sel { color: #f3a6ff; }
  .codeblock .c-tag { color: #67d5ff; }
  .codeblock .c-attr { color: #a8b8ff; }
  .codeblock .c-str { color: #ffd580; }

  .font-card {
    background: #fff;
    border: 1px solid ${borderHex};
    border-radius: 20px;
    padding: 32px;
    margin-bottom: 16px;
    position: relative;
    overflow: hidden;
  }
  .font-card.display-card {
    background: radial-gradient(ellipse 80% 100% at 100% 0%, ${tintBgs[0]?.hex || primaryHex + '22'} 0%, transparent 60%), #fff;
  }
  .font-specimen { font-size: 80px; line-height: 1; letter-spacing: -0.02em; margin: 16px 0; }
  .font-card .role { font-size: 12px; color: ${primaryHex}; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }
  .font-card .family { font-size: 22px; font-weight: 600; margin-top: 4px; }
  .font-card .meta-line { font-family: ui-monospace, monospace; font-size: 12px; color: ${mutedHex}; margin-top: 16px; display: flex; gap: 16px; flex-wrap: wrap; }
  .font-card .meta-line span { padding: 4px 10px; background: ${borderHex}; border-radius: 70px; }
  .font-card .note {
    margin-top: 20px; padding: 12px 16px;
    background: #fff8e9; border-left: 3px solid #ff8e1c;
    border-radius: 8px;
    font-size: 13px; color: #824405;
  }

  .radius-tile { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 8px; }
  .radius-box { width: 72px; height: 72px; box-shadow: 0 4px 12px ${primaryHex}30; }
  .radius-tile .val { font-family: ui-monospace, monospace; font-size: 12px; font-weight: 600; color: ${inkHex}; }
  .radius-tile .usage { font-size: 11px; color: ${mutedHex}; }

  .easing-card { background: #fff; border: 1px solid ${borderHex}; border-radius: 20px; padding: 24px; position: relative; overflow: hidden; }
  .easing-curve { width: 100%; height: 160px; display: block; }
  .easing-curve .grid-line { stroke: ${borderHex}; stroke-width: 1; }
  .easing-curve .diagonal { stroke: #d9d9d9; stroke-width: 1; stroke-dasharray: 3 3; }
  .easing-curve .curve { fill: none; stroke: ${primaryHex}; stroke-width: 2.5; stroke-linecap: round; }
  .easing-curve .endpoint { fill: ${primaryHex}; }
  .easing-name { font-family: ui-monospace, monospace; font-size: 13px; font-weight: 600; color: ${inkHex}; }
  .easing-bezier { font-family: ui-monospace, monospace; font-size: 11px; color: ${mutedHex}; display: block; margin: 8px 0; word-break: break-all; }
  .easing-gsap { display: inline-block; background: ${inkHex}; color: #fff; font-family: ui-monospace, monospace; font-size: 11px; padding: 4px 10px; border-radius: 6px; margin-top: 4px; }
  .easing-demo-track { height: 10px; background: ${borderHex}; border-radius: 10px; margin-top: 20px; position: relative; overflow: hidden; }
  .easing-demo-dot {
    position: absolute; top: 50%; left: 0;
    width: 18px; height: 18px; border-radius: 50%;
    transform: translate(0, -50%);
    background: ${signatureGradCss};
    box-shadow: 0 0 16px ${primaryHex}80;
    animation: ride 1.8s infinite alternate;
  }
  @keyframes ride { from { left: 0; } to { left: calc(100% - 18px); } }

  .dur-row { display: grid; grid-template-columns: 80px 1fr 160px; gap: 16px; align-items: center; padding: 12px 0; }
  .dur-name { font-family: ui-monospace, monospace; font-size: 13px; color: ${mutedHex}; font-weight: 600; }
  .dur-track { height: 8px; background: ${borderHex}; border-radius: 8px; overflow: hidden; }
  .dur-fill { height: 100%; background: ${signatureGradCss}; border-radius: 8px; animation: pulse 1.6s ease-in-out infinite alternate; }
  @keyframes pulse { from { opacity: 0.5; } to { opacity: 1; } }
  .dur-val { font-family: ui-monospace, monospace; font-size: 12px; color: ${inkHex}; text-align: right; font-weight: 600; }

  .trait { background: #fff; border: 1px solid ${borderHex}; border-radius: 20px; padding: 24px; }
  .trait .key { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: ${mutedHex}; font-weight: 600; }
  .trait .val { font-size: 28px; font-weight: 700; color: ${inkHex}; margin: 6px 0 4px; font-family: ${displayStack}; }
  .trait .desc { font-size: 13px; color: ${mutedHex}; line-height: 1.5; }

  .voice-note {
    background: #fff8e9; border: 1px solid #ffd580;
    border-radius: 16px; padding: 16px 20px;
    margin-bottom: 24px;
    font-size: 13px; color: #824405;
    display: flex; gap: 12px; align-items: flex-start;
  }
  .voice-note strong { color: #571900; }
  .voice-headings { background: #fff; border: 1px solid ${borderHex}; border-radius: 20px; padding: 32px; }
  .voice-headings .specimen {
    font-family: ${displayStack};
    font-size: 28px; line-height: 1.2; letter-spacing: -0.02em; font-weight: 400;
    padding: 14px 0;
    border-bottom: 1px solid ${borderHex};
    color: ${inkHex};
  }
  .voice-headings .specimen:last-child { border-bottom: none; }
  .voice-headings .specimen .src {
    display: block;
    font-family: ui-monospace, monospace; font-size: 11px;
    color: ${mutedHex}; letter-spacing: 0; text-transform: none;
    margin-top: 4px; opacity: 0.7;
  }
  .cta-pill {
    display: inline-block;
    background: ${borderHex};
    color: ${inkHex};
    font-family: ${bodyStack};
    font-size: 14px; font-weight: 600;
    padding: 8px 18px;
    border-radius: 70px;
    margin: 4px 6px 4px 0;
  }
  .cta-pill.primary { background: ${primaryHex}; color: ${primaryFg}; }
  .cta-pill.secondary { background: ${tintBgs[0]?.hex || primaryHex + '33'}; color: ${inkHex}; }

  .comp-block { margin-bottom: 64px; }
  .comp-header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
  .comp-header h3 { margin: 0; }
  .comp-header .index { font-family: ui-monospace, monospace; font-size: 12px; color: ${primaryHex}; font-weight: 600; }
  .comp-preview {
    background:
      repeating-linear-gradient(45deg, ${primaryHex}0a 0, ${primaryHex}0a 1px, transparent 1px, transparent 16px),
      ${canvasHex};
    border: 1px solid ${borderHex};
    border-radius: 20px;
    padding: 56px 32px;
    display: flex; align-items: center; justify-content: center;
    min-height: 200px;
    position: relative;
  }
  .comp-preview.dark {
    background:
      repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 16px),
      ${inkHex};
  }
  .comp-note {
    background: ${tintBgs[0]?.hex || primaryHex + '22'}33;
    border-left: 3px solid ${primaryHex};
    padding: 14px 18px;
    border-radius: 0 8px 8px 0;
    margin-top: 16px;
    font-size: 13px;
    color: ${ink2Hex};
  }
  .comp-note strong { color: ${inkHex}; }
  .comp-note code { font-family: ui-monospace, monospace; background: rgba(0,0,0,0.06); padding: 1px 5px; border-radius: 3px; font-size: 12px; }

  .cheat {
    background:
      radial-gradient(ellipse 60% 60% at 0% 100%, ${tintBgs[0]?.hex || primaryHex + '33'} 0%, transparent 60%),
      radial-gradient(ellipse 50% 50% at 100% 0%, ${tintBgs[1]?.hex || accentHex + '33'} 0%, transparent 60%),
      #fff;
    border: 1px solid ${borderHex};
    border-radius: 28px;
    padding: 48px;
    margin-top: 24px;
  }
  .cheat .agent-tag {
    display: inline-block;
    background: ${inkHex}; color: #fff;
    padding: 6px 14px;
    border-radius: 70px;
    font-family: ui-monospace, monospace;
    font-size: 12px; font-weight: 600;
    margin-bottom: 16px;
  }
  .cheat h3 { margin-top: 0; }
  .cheat ul { margin: 16px 0 24px 24px; }
  .cheat li { margin-bottom: 8px; color: ${ink2Hex}; font-size: 15px; line-height: 1.6; }
  .cheat li code { font-family: ui-monospace, monospace; background: ${borderHex}; padding: 2px 6px; border-radius: 4px; font-size: 13px; color: ${inkHex}; }
  .cheat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
  @media (max-width: 900px) { .cheat-grid { grid-template-columns: 1fr; } }
  .cheat-divider { height: 1px; background: ${borderHex}; margin: 32px 0; }

  footer {
    border-top: 1px solid ${borderHex};
    padding: 48px 0;
    text-align: center;
    color: ${mutedHex};
    font-size: 13px;
    font-family: ui-monospace, monospace;
    margin-top: 64px;
  }
  footer a { color: ${inkHex}; }
  footer code { background: ${borderHex}; padding: 2px 6px; border-radius: 4px; }

  @media print {
    .toc, .codeblock .copy-btn { display: none; }
    section { page-break-inside: avoid; padding: 32px 0; }
  }
`;

// ═══════════════════ Inline JS (interactive copy) ═══════
const pageScript = `
  document.querySelectorAll('.swatch[data-copy]').forEach(el => {
    el.addEventListener('click', () => {
      const val = el.getAttribute('data-copy');
      navigator.clipboard?.writeText(val);
      const tip = el.querySelector('.copied');
      if (tip) {
        tip.classList.add('show');
        setTimeout(() => tip.classList.remove('show'), 1200);
      }
    });
  });
  document.querySelectorAll('.grad-tile code').forEach(code => {
    code.addEventListener('click', () => {
      navigator.clipboard?.writeText(code.textContent || '');
      const prev = code.style.color;
      code.style.color = '${primaryHex}';
      setTimeout(() => { code.style.color = prev; }, 600);
    });
  });
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy-target');
      const target = document.getElementById(targetId);
      if (!target) return;
      navigator.clipboard?.writeText(target.innerText || target.textContent || '');
      const orig = btn.textContent;
      btn.textContent = '✓ Copied';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1500);
    });
  });
  const tocLinks = document.querySelectorAll('.toc a');
  const sections = document.querySelectorAll('main section');
  const setActive = () => {
    let active = sections[0]?.id || '';
    const y = window.scrollY + 200;
    sections.forEach(s => { if (s.offsetTop <= y) active = s.id; });
    tocLinks.forEach(a => {
      const isActive = a.getAttribute('href') === '#' + active;
      a.style.background = isActive ? '${primaryHex}' : '';
      a.style.color = isActive ? '${primaryFg}' : '';
    });
  };
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
`;

// ═══════════════════ Assemble final page ════════════════
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(brandName)} — Design System for Hyperframes Video Generation</title>
<!--
  AGENT NOTE
  ──────────────────────────────────────────────────────────
  This file is the consolidated brand reference for:
    skills/product-launch-video/agents/visual-design.md    (Phase 3)
    skills/product-launch-video/agents/hyperframes-scene.md (Phase 4b)
  Source data: ${escapeHtml(prefix)}-*.json  (extracted by ${escapeHtml(generator)}, ${escapeHtml(generatedDate)})
  Re-extract:  npx designlang ${escapeHtml(sourceUrl)} --out ./design-system
  Re-build:    node skills/product-launch-video/phases/design-system/scripts/build-design-html.mjs ./design-system
  ──────────────────────────────────────────────────────────
-->
<style>
${pageStyles}
</style>
</head>
<body>

${renderHero()}

${renderToc()}

<main class="wrap">
${renderBrandDna()}
${renderColors()}
${renderTypography()}
${renderRadius()}
${renderMotion()}
${renderVisualDna()}
${renderVoice()}
${renderDetected()}
</main>

<footer>
  <div class="wrap">
    Generated for <code>skills/product-launch-video</code> · sourced from
    <a href="./${escapeHtml(prefix)}-design-tokens.json">design-tokens</a>,
    <a href="./${escapeHtml(prefix)}-motion-tokens.json">motion-tokens</a>,
    <a href="./${escapeHtml(prefix)}-visual-dna.json">visual-dna</a>,
    <a href="./${escapeHtml(prefix)}-voice.json">voice</a>,
    <a href="./${escapeHtml(prefix)}-gradients.json">gradients</a>.
    <br>
    Re-extract: <code>npx designlang ${escapeHtml(sourceUrl)} --out ./design-system</code>
    &nbsp;·&nbsp;
    Re-build: <code>node build-design-html.mjs ./design-system</code>
  </div>
</footer>

<script>
${pageScript}
</script>
</body>
</html>
`;

// ═══════════════════ Write + log ════════════════════════
fs.writeFileSync(outFile, html, 'utf8');

const sizeKb = (html.length / 1024).toFixed(1);
console.log(`✓ ${path.relative(process.cwd(), outFile)} (${sizeKb}KB)`);
console.log(`  source:   ${sourceUrl || '(no source URL in metadata)'}`);
console.log(`  brand:    ${brandName} · ${materialLabel} material · ${intentLabel} intent`);
console.log(`  palette:  ${primaryHex} primary + ${accentHex} accent, ${gradients.length} gradient${gradients.length === 1 ? '' : 's'}`);
console.log(`  fonts:    ${fonts.length} famil${fonts.length === 1 ? 'y' : 'ies'} (${displayFont} display, ${bodyFont} body)`);
console.log(`  motion:   ${Object.keys(motion.easing || {}).length} easing${Object.keys(motion.easing || {}).length === 1 ? '' : 's'}, ${Object.keys(motion.duration || {}).length} duration${Object.keys(motion.duration || {}).length === 1 ? '' : 's'}`);
if (voiceNonEnglish) {
  console.log(`  ⚠︎ voice:  non-English text in sampleHeadings (see §7 warning in design.html)`);
}
