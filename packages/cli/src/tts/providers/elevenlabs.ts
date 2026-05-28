import { execFileSync } from "node:child_process";
import { writeFileSync, mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { finalizeAudio } from "./transcode.js";
import type { ProviderOptions, ProviderResult } from "./types.js";

const DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM"; // Rachel
const DEFAULT_MODEL = "eleven_multilingual_v2";

export async function synthesize(
  text: string,
  outputPath: string,
  options: ProviderOptions,
): Promise<ProviderResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set");

  const voiceId = options.voice ?? DEFAULT_VOICE;
  options.onProgress?.(`ElevenLabs: requesting synthesis (voice ${voiceId})...`);

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, model_id: DEFAULT_MODEL }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ElevenLabs API ${res.status}: ${detail.slice(0, 500)}`);
  }

  const audioBytes = Buffer.from(await res.arrayBuffer());
  const tempDir = mkdtempSync(join(tmpdir(), "hf-elevenlabs-"));
  const tempPath = join(tempDir, "audio.mp3");
  writeFileSync(tempPath, audioBytes);

  finalizeAudio(tempPath, outputPath);

  return {
    outputPath,
    sampleRate: 44100,
    durationSeconds: existsSync(outputPath) ? probeDuration(outputPath) : 0,
    provider: "elevenlabs",
  };
}

function probeDuration(file: string): number {
  try {
    const out = execFileSync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file],
      { encoding: "utf-8", timeout: 5000 },
    );
    return parseFloat(out.trim()) || 0;
  } catch {
    return 0;
  }
}
