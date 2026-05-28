import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import { findPython, hasPythonPackage } from "./python.js";
import type { BgmOptions, BgmResult } from "./types.js";

const SCRIPT = `
import argparse, asyncio, json, os, sys, wave
from pathlib import Path

SAMPLE_RATE = 48000
CHANNELS = 2
SAMPLE_WIDTH = 2

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--output", required=True)
    p.add_argument("--duration", type=float, required=True)
    p.add_argument("--prompt", required=True)
    p.add_argument("--negative-prompt", default=None)
    p.add_argument("--bpm", type=int, default=110)
    p.add_argument("--brightness", type=float, default=0.8)
    p.add_argument("--density", type=float, default=0.5)
    p.add_argument("--scale", default="MAJOR")
    return p.parse_args()

async def generate(args):
    from google import genai
    from google.genai import types

    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY", "")
    if not key:
        raise RuntimeError("Neither GEMINI_API_KEY nor GOOGLE_API_KEY is set")

    client = genai.Client(api_key=key, http_options={"api_version": "v1alpha"})
    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    target_bytes = int(args.duration * SAMPLE_RATE * CHANNELS * SAMPLE_WIDTH)

    cfg = {"bpm": args.bpm, "temperature": 1.0,
           "density": args.density, "brightness": args.brightness}
    if args.scale:
        scale_enum = getattr(types.Scale, args.scale, None)
        if scale_enum:
            cfg["scale"] = scale_enum

    prompts = [types.WeightedPrompt(text=args.prompt, weight=1.0)]
    if args.negative_prompt:
        prompts.append(types.WeightedPrompt(text=args.negative_prompt, weight=-1.0))

    buf = bytearray()
    timeout = args.duration + 8

    async with client.aio.live.music.connect(model="models/lyria-realtime-exp") as session:
        await session.set_weighted_prompts(prompts=prompts)
        await session.set_music_generation_config(
            config=types.LiveMusicGenerationConfig(**cfg))
        await session.play()

        async def collect():
            while len(buf) < target_bytes:
                async for msg in session.receive():
                    sc = msg.server_content
                    if sc and sc.audio_chunks:
                        for chunk in sc.audio_chunks:
                            buf.extend(chunk.data)
                            if len(buf) >= target_bytes:
                                return
                await asyncio.sleep(1e-6)

        try:
            await asyncio.wait_for(collect(), timeout=timeout)
        except TimeoutError:
            print(f"Timeout after {timeout:.0f}s, collected {len(buf)} bytes", file=sys.stderr)

    audio = bytes(buf[:target_bytes])
    with wave.open(str(out_path), "wb") as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(SAMPLE_WIDTH)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(audio)

    actual_duration = len(audio) / (SAMPLE_RATE * CHANNELS * SAMPLE_WIDTH)
    print(json.dumps({"outputPath": str(out_path), "durationSeconds": round(actual_duration, 3)}))

if __name__ == "__main__":
    args = parse_args()
    try:
        asyncio.run(generate(args))
    except RuntimeError as exc:
        print(f"BGM generation failed: {exc}", file=sys.stderr)
        sys.exit(1)
`;

const SCRIPT_DIR = join(homedir(), ".cache", "hyperframes", "bgm");
const SCRIPT_PATH = join(SCRIPT_DIR, "lyria-v1.py");

function ensureScript(): string {
  mkdirSync(SCRIPT_DIR, { recursive: true });
  if (!existsSync(SCRIPT_PATH)) writeFileSync(SCRIPT_PATH, SCRIPT);
  return SCRIPT_PATH;
}

export function isAvailable(): boolean {
  return !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
}

export async function generate(outputPath: string, options: BgmOptions): Promise<BgmResult> {
  const python = findPython();
  if (!python) {
    throw new Error(
      "Python 3 is required for Lyria BGM. Install Python 3.8+ and run: pip install google-genai",
    );
  }
  if (!hasPythonPackage(python, "google.genai")) {
    throw new Error("google-genai package not installed. Run: pip install google-genai");
  }

  mkdirSync(dirname(outputPath), { recursive: true });
  const scriptPath = ensureScript();

  options.onProgress?.(`Lyria: generating ${options.duration.toFixed(1)}s of BGM...`);

  const args = [
    scriptPath,
    "--output", outputPath,
    "--duration", String(options.duration),
    "--prompt", options.prompt,
    "--bpm", String(options.bpm ?? 110),
    "--brightness", String(options.brightness ?? 0.8),
    "--density", String(options.density ?? 0.5),
    "--scale", options.scale ?? "MAJOR",
  ];
  if (options.negativePrompt) args.push("--negative-prompt", options.negativePrompt);

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
        rejectResult(new Error(`Lyria failed (exit ${code}): ${stderr.slice(-500)}`));
        return;
      }
      try {
        const last = stdout.trim().split("\n").pop() ?? "";
        const parsed = JSON.parse(last) as { outputPath: string; durationSeconds: number };
        resolveResult({ ...parsed, provider: "lyria" });
      } catch (err) {
        rejectResult(new Error(`Lyria output parse failed: ${(err as Error).message}`));
      }
    });
    child.on("error", rejectResult);
  });
}
