import type { ProviderName, ProviderOptions, ProviderResult } from "./types.js";

export type { ProviderName, ProviderOptions, ProviderResult, Word } from "./types.js";

/**
 * Pick a provider based on explicit override or env-var auto-detect.
 * Chain (most specific → fallback):
 *   heygen      ← $HEYGEN_API_KEY
 *   elevenlabs  ← $ELEVENLABS_API_KEY
 *   kokoro      ← always available (local, no key)
 */
export function selectProvider(explicit?: string): ProviderName {
  if (explicit && explicit !== "auto") {
    if (explicit !== "heygen" && explicit !== "elevenlabs" && explicit !== "kokoro") {
      throw new Error(`Unknown TTS provider "${explicit}". Use heygen, elevenlabs, or kokoro.`);
    }
    return explicit;
  }
  if (process.env.HEYGEN_API_KEY) return "heygen";
  if (process.env.ELEVENLABS_API_KEY) return "elevenlabs";
  return "kokoro";
}

export async function dispatch(
  provider: ProviderName,
  text: string,
  outputPath: string,
  options: ProviderOptions,
): Promise<ProviderResult> {
  if (provider === "heygen") {
    const { synthesize } = await import("./heygen.js");
    return synthesize(text, outputPath, options);
  }
  if (provider === "elevenlabs") {
    const { synthesize } = await import("./elevenlabs.js");
    return synthesize(text, outputPath, options);
  }
  const { synthesize } = await import("../synthesize.js");
  const result = await synthesize(text, outputPath, options);
  return {
    outputPath: result.outputPath,
    sampleRate: result.sampleRate,
    durationSeconds: result.durationSeconds,
    provider: "kokoro",
    langApplied: result.langApplied,
  };
}
