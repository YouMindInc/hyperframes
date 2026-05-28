/**
 * Shared types for the TTS provider chain.
 *
 * Providers are auto-selected from env vars in this order:
 *   1. heygen      — $HEYGEN_API_KEY set
 *   2. elevenlabs  — $ELEVENLABS_API_KEY set
 *   3. kokoro      — local fallback (no key required)
 *
 * Users can override with `--provider <name>`.
 */

import type { SupportedLang } from "../manager.js";

export type ProviderName = "heygen" | "elevenlabs" | "kokoro";

export interface Word {
  id: string;
  text: string;
  start: number;
  end: number;
}

export interface ProviderOptions {
  voice?: string;
  speed?: number;
  lang?: SupportedLang;
  /** Provider-specific language hint (e.g. "en", "es"); falls back to lang. */
  language?: string;
  onProgress?: (message: string) => void;
}

export interface ProviderResult {
  outputPath: string;
  sampleRate: number;
  durationSeconds: number;
  provider: ProviderName;
  /** Set by Kokoro to indicate whether the `lang` kwarg was applied. */
  langApplied?: boolean;
  /** HeyGen returns word-level timestamps natively; other providers return undefined. */
  words?: Word[];
}
