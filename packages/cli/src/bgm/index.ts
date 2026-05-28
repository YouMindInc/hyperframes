import type { BgmOptions, BgmResult, ProviderName } from "./types.js";

export type { BgmOptions, BgmResult, ProviderName } from "./types.js";

/**
 * Select a BGM provider:
 *   - explicit `--provider lyria|musicgen` wins
 *   - otherwise: Lyria if a Google key is set, else MusicGen if Python deps are installed
 *   - throws if neither is available so callers decide whether to skip BGM
 */
export function selectProvider(explicit?: string): ProviderName {
  if (explicit && explicit !== "auto") {
    if (explicit !== "lyria" && explicit !== "musicgen") {
      throw new Error(`Unknown BGM provider "${explicit}". Use lyria or musicgen.`);
    }
    return explicit;
  }
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) return "lyria";
  return "musicgen";
}

export async function generate(
  provider: ProviderName,
  outputPath: string,
  options: BgmOptions,
): Promise<BgmResult> {
  if (provider === "lyria") {
    const mod = await import("./lyria.js");
    return mod.generate(outputPath, options);
  }
  const mod = await import("./musicgen.js");
  return mod.generate(outputPath, options);
}

const INDUSTRY_PROMPTS: Array<[RegExp, string]> = [
  [
    /\b(saas|api|cloud|developer|platform|sdk|infra)\b/,
    "Uplifting corporate tech, bright and modern, gentle piano with synth pads, BPM 110, MAJOR",
  ],
  [
    /\b(crypto|nft|web3|defi|token|blockchain)\b/,
    "Atmospheric electronic, deep bass, futuristic synths, restrained percussion, BPM 100",
  ],
  [
    /\b(creative|agency|design|studio|art|brand)\b/,
    "Playful electronic, warm pads, light percussion, BPM 115, MAJOR",
  ],
  [
    /\b(finance|fintech|bank|payment|invest|wealth)\b/,
    "Calm cinematic, soft strings, restrained percussion, BPM 95",
  ],
];

const DEFAULT_PROMPT =
  "Uplifting corporate tech, bright and modern, gentle piano with synth pads, BPM 110, MAJOR";

/**
 * Heuristic mood inference from arbitrary text (e.g. a narrator-scripts blob).
 * Returns the first matching industry preset, or a safe default.
 */
export function inferMood(text: string): string {
  const lower = text.toLowerCase();
  for (const [pattern, prompt] of INDUSTRY_PROMPTS) {
    if (pattern.test(lower)) return prompt;
  }
  return DEFAULT_PROMPT;
}
