import { defineCommand } from "citty";
import type { Example } from "./_examples.js";
import { existsSync, readFileSync } from "node:fs";

export const examples: Example[] = [
  ["Generate 30s of BGM (auto-detects provider)", "hyperframes bgm --duration 30 -o bgm.wav"],
  [
    "Specify a mood prompt",
    'hyperframes bgm --duration 60 --prompt "Calm cinematic, soft strings, BPM 95" -o bgm.wav',
  ],
  [
    "Infer mood from a script file",
    "hyperframes bgm --duration 45 --from-file script.txt -o bgm.wav",
  ],
  ["Force MusicGen (local, free)", "hyperframes bgm --duration 30 --provider musicgen -o bgm.wav"],
  [
    "Tune Lyria parameters",
    'hyperframes bgm --duration 30 --prompt "..." --bpm 95 --scale MINOR --brightness 0.6 -o bgm.wav',
  ],
];
import { resolve } from "node:path";
import * as clack from "@clack/prompts";
import { c } from "../ui/colors.js";
import { selectProvider, generate, inferMood, type ProviderName } from "../bgm/index.js";

export default defineCommand({
  meta: {
    name: "bgm",
    description:
      "Generate background music. Auto-detects provider from env: $GEMINI_API_KEY → Lyria, else local MusicGen.",
  },
  args: {
    output: {
      type: "string",
      description: "Output WAV path (default: bgm.wav)",
      alias: "o",
    },
    duration: {
      type: "string",
      description: "Target duration in seconds (required)",
      alias: "d",
      required: true,
    },
    prompt: {
      type: "string",
      description: "Mood / instrumentation prompt (overrides --from-file inference)",
    },
    "from-file": {
      type: "string",
      description: "Infer mood from this text file (script, narration, etc.)",
    },
    provider: {
      type: "string",
      description: "BGM provider: auto (default) | lyria | musicgen",
      alias: "p",
    },
    bpm: {
      type: "string",
      description: "Lyria BPM (default 110)",
    },
    scale: {
      type: "string",
      description: "Lyria scale: MAJOR | MINOR | PENTATONIC | ... (default MAJOR)",
    },
    brightness: {
      type: "string",
      description: "Lyria brightness 0-1 (default 0.8)",
    },
    density: {
      type: "string",
      description: "Lyria density 0-1 (default 0.5)",
    },
    "negative-prompt": {
      type: "string",
      description: "Lyria negative prompt — styles to exclude",
    },
    json: {
      type: "boolean",
      description: "Output result as JSON",
      default: false,
    },
  },
  async run({ args }) {
    const duration = parseFloat(args.duration);
    if (isNaN(duration) || duration <= 0) {
      console.error(c.error("--duration must be a positive number (seconds)"));
      process.exit(1);
    }

    const output = resolve(args.output ?? "bgm.wav");

    let prompt = args.prompt;
    if (!prompt && args["from-file"]) {
      const filePath = resolve(args["from-file"]);
      if (!existsSync(filePath)) {
        console.error(c.error(`File not found: ${args["from-file"]}`));
        process.exit(1);
      }
      prompt = inferMood(readFileSync(filePath, "utf-8"));
    }
    if (!prompt) {
      prompt = inferMood(""); // default preset
    }

    let provider: ProviderName;
    try {
      provider = selectProvider(args.provider);
    } catch (err) {
      console.error(c.error(err instanceof Error ? err.message : String(err)));
      process.exit(1);
    }

    const spin = args.json ? null : clack.spinner();
    spin?.start(`Generating BGM via ${c.accent(provider)}...`);

    try {
      const result = await generate(provider, output, {
        prompt,
        duration,
        bpm: args.bpm ? parseInt(args.bpm, 10) : undefined,
        scale: args.scale,
        brightness: args.brightness ? parseFloat(args.brightness) : undefined,
        density: args.density ? parseFloat(args.density) : undefined,
        negativePrompt: args["negative-prompt"],
        onProgress: spin ? (msg) => spin.message(msg) : undefined,
      });

      if (args.json) {
        console.log(
          JSON.stringify({
            ok: true,
            provider: result.provider,
            prompt,
            durationSeconds: result.durationSeconds,
            outputPath: result.outputPath,
          }),
        );
      } else {
        spin?.stop(
          c.success(
            `[${result.provider}] generated ${c.accent(result.durationSeconds.toFixed(1) + "s")} of BGM → ${c.accent(result.outputPath)}`,
          ),
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (args.json) {
        console.log(JSON.stringify({ ok: false, provider, error: message }));
      } else {
        spin?.stop(c.error(`BGM generation failed: ${message}`));
      }
      process.exit(1);
    }
  },
});
