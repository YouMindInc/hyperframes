import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, renameSync } from "node:fs";
import { dirname, extname } from "node:path";

/**
 * Transcode a downloaded audio buffer to the requested output format.
 *
 * HeyGen and ElevenLabs return mp3 by default; downstream tools in this repo
 * (ffprobe duration, Whisper transcribe) work best on .wav. If the requested
 * output ends in .wav we transcode via ffmpeg; for .mp3 we move the temp file
 * directly without re-encoding.
 */
export function finalizeAudio(tempMp3: string, outputPath: string): void {
  mkdirSync(dirname(outputPath), { recursive: true });
  const ext = extname(outputPath).toLowerCase();

  if (ext === ".mp3" || ext === "") {
    renameSync(tempMp3, outputPath);
    return;
  }

  if (ext !== ".wav") {
    throw new Error(`Unsupported output extension "${ext}". Use .wav or .mp3.`);
  }

  if (!hasFfmpeg()) {
    throw new Error(
      "ffmpeg is required to transcode mp3 → wav. Install ffmpeg or use -o speech.mp3 to keep the source format.",
    );
  }

  execFileSync(
    "ffmpeg",
    ["-y", "-loglevel", "error", "-i", tempMp3, "-ar", "44100", "-ac", "1", outputPath],
    { stdio: ["ignore", "ignore", "pipe"] },
  );

  if (!existsSync(outputPath)) {
    throw new Error("Transcode produced no output file");
  }
}

function hasFfmpeg(): boolean {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: ["ignore", "ignore", "ignore"] });
    return true;
  } catch {
    return false;
  }
}
