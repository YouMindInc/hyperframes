import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import { findPython, hasPythonPackage } from "./python.js";
import type { BgmOptions, BgmResult } from "./types.js";

const SCRIPT = `
import argparse, json, sys
from pathlib import Path

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--output", required=True)
    p.add_argument("--duration", type=float, required=True)
    p.add_argument("--prompt", required=True)
    return p.parse_args()

def main():
    args = parse_args()
    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    from transformers import AutoProcessor, MusicgenForConditionalGeneration
    import soundfile as sf
    import torch

    processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
    model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small")

    sr = model.config.audio_encoder.sampling_rate
    tokens = int(args.duration * 50) + 4

    inputs = processor(text=[args.prompt], padding=True, return_tensors="pt")
    with torch.no_grad():
        audio_values = model.generate(**inputs, max_new_tokens=tokens, do_sample=True)

    audio = audio_values[0, 0].cpu().numpy()
    target = int(args.duration * sr)
    if len(audio) > target:
        audio = audio[:target]

    sf.write(str(out_path), audio, sr)
    print(json.dumps({"outputPath": str(out_path), "durationSeconds": round(len(audio) / sr, 3)}))

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"MusicGen failed: {exc}", file=sys.stderr)
        sys.exit(1)
`;

const SCRIPT_DIR = join(homedir(), ".cache", "hyperframes", "bgm");
const SCRIPT_PATH = join(SCRIPT_DIR, "musicgen-v1.py");

function ensureScript(): string {
  mkdirSync(SCRIPT_DIR, { recursive: true });
  if (!existsSync(SCRIPT_PATH)) writeFileSync(SCRIPT_PATH, SCRIPT);
  return SCRIPT_PATH;
}

export function isAvailable(): boolean {
  const python = findPython();
  if (!python) return false;
  return hasPythonPackage(python, "transformers") && hasPythonPackage(python, "torch");
}

export async function generate(outputPath: string, options: BgmOptions): Promise<BgmResult> {
  const python = findPython();
  if (!python) {
    throw new Error(
      "Python 3 is required for MusicGen BGM. Install Python 3.8+ and run: pip install transformers torch soundfile",
    );
  }
  for (const pkg of ["transformers", "torch", "soundfile"]) {
    if (!hasPythonPackage(python, pkg)) {
      throw new Error(
        `${pkg} package not installed. Run: pip install transformers torch soundfile`,
      );
    }
  }

  mkdirSync(dirname(outputPath), { recursive: true });
  const scriptPath = ensureScript();

  options.onProgress?.(
    `MusicGen: generating ${options.duration.toFixed(1)}s of BGM (first run downloads ~300MB)...`,
  );

  const args = [
    scriptPath,
    "--output", outputPath,
    "--duration", String(options.duration),
    "--prompt", options.prompt,
  ];

  return new Promise<BgmResult>((resolveResult, rejectResult) => {
    const child = spawn(python, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d: Buffer) => {
      stdout += d.toString();
    });
    child.stderr.on("data", (d: Buffer) => {
      stderr += d.toString();
    });
    child.on("close", (code) => {
      if (code !== 0) {
        rejectResult(new Error(`MusicGen failed (exit ${code}): ${stderr.slice(-500)}`));
        return;
      }
      try {
        const last = stdout.trim().split("\n").pop() ?? "";
        const parsed = JSON.parse(last) as { outputPath: string; durationSeconds: number };
        resolveResult({ ...parsed, provider: "musicgen" });
      } catch (err) {
        rejectResult(new Error(`MusicGen output parse failed: ${(err as Error).message}`));
      }
    });
    child.on("error", rejectResult);
  });
}
