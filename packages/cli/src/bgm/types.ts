/**
 * Shared types for BGM generation providers.
 *
 * Auto-selection chain:
 *   1. lyria    — $GEMINI_API_KEY or $GOOGLE_API_KEY set (Google's Lyria RealTime)
 *   2. musicgen — local fallback (requires `pip install transformers torch soundfile`)
 *
 * If neither is available, the command exits with a clear message — there is
 * no silent skip at this layer; the caller's workflow decides whether to
 * proceed without BGM.
 */

export type ProviderName = "lyria" | "musicgen";

export interface BgmOptions {
  prompt: string;
  duration: number;
  /** Lyria-only: 0–1, higher = brighter mood. Default 0.8. */
  brightness?: number;
  /** Lyria-only: 0–1, higher = fuller mix. Default 0.5. */
  density?: number;
  /** Lyria-only: scale name (MAJOR, MINOR, PENTATONIC, …). Default MAJOR. */
  scale?: string;
  /** Lyria-only: beats per minute. Default 110. */
  bpm?: number;
  /** Lyria-only: negative prompt (styles to exclude). */
  negativePrompt?: string;
  onProgress?: (message: string) => void;
}

export interface BgmResult {
  outputPath: string;
  durationSeconds: number;
  provider: ProviderName;
}
