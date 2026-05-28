import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, extname } from "node:path";
import { finalizeAudio } from "./transcode.js";
import type { ProviderOptions, ProviderResult, Word } from "./types.js";

const ENDPOINT = "https://api.heygen.com/v3/voices/speech";
const DEFAULT_VOICE = "1bd001e7e50f421d891986aad5158bc8";

interface HeyGenResponse {
  data?: {
    audio_url?: string;
    duration?: number;
    request_id?: string;
    word_timestamps?: Array<{ word: string; start: number; end: number }>;
  };
  audio_url?: string;
  duration?: number;
  request_id?: string;
  word_timestamps?: Array<{ word: string; start: number; end: number }>;
  error?: { message?: string } | string;
}

export async function synthesize(
  text: string,
  outputPath: string,
  options: ProviderOptions,
): Promise<ProviderResult> {
  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) throw new Error("HEYGEN_API_KEY is not set");

  const voice_id = options.voice ?? DEFAULT_VOICE;
  const speed = options.speed ?? 1.0;

  options.onProgress?.(`HeyGen: requesting synthesis (voice ${voice_id})...`);

  const body: Record<string, unknown> = { text, voice_id, speed };
  if (options.language) body.language = options.language;

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`HeyGen API ${res.status}: ${detail.slice(0, 500)}`);
  }

  const payload = (await res.json()) as HeyGenResponse;
  const inner = payload.data ?? payload;
  const audioUrl = inner.audio_url;
  if (!audioUrl) {
    const errMsg = typeof payload.error === "string" ? payload.error : payload.error?.message;
    throw new Error(`HeyGen response missing audio_url${errMsg ? `: ${errMsg}` : ""}`);
  }

  options.onProgress?.("HeyGen: downloading audio...");
  const audioRes = await fetch(audioUrl);
  if (!audioRes.ok) {
    throw new Error(`HeyGen audio download ${audioRes.status} from ${audioUrl}`);
  }
  const audioBytes = Buffer.from(await audioRes.arrayBuffer());

  const sourceExt = extname(new URL(audioUrl).pathname).toLowerCase() || ".mp3";
  const tempDir = mkdtempSync(join(tmpdir(), "hf-heygen-"));
  const tempPath = join(tempDir, `audio${sourceExt}`);
  writeFileSync(tempPath, audioBytes);

  finalizeAudio(tempPath, outputPath);

  const duration =
    inner.duration ??
    (existsSync(outputPath) ? probeDuration(outputPath) : audioBytes.length / 48000);

  const words: Word[] | undefined = inner.word_timestamps?.map((w, i) => ({
    id: `w${i}`,
    text: w.word,
    start: w.start,
    end: w.end,
  }));

  return {
    outputPath,
    sampleRate: 44100,
    durationSeconds: duration,
    provider: "heygen",
    words,
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
