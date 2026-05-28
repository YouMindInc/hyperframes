import { defineCommand } from "citty";
import type { Example } from "./_examples.js";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

export const examples: Example[] = [
  ["Generate speech (auto-detects provider from env)", 'hyperframes tts "Welcome to HyperFrames"'],
  ["Force a specific provider", 'hyperframes tts "Hello" --provider kokoro'],
  [
    "Use a HeyGen voice (requires $HEYGEN_API_KEY)",
    'hyperframes tts "Hello" --voice <heygen-voice-id>',
  ],
  ["Save to a specific file", 'hyperframes tts "Intro" --output narration.wav'],
  [
    "Write HeyGen word-level timestamps to JSON",
    'hyperframes tts "Hi there" --words narration.words.json',
  ],
  ["Adjust speech speed", 'hyperframes tts "Slow and clear" --speed 0.8'],
  [
    "Generate Spanish speech (Kokoro)",
    'hyperframes tts "La reunión empieza a las nueve" --voice ef_dora --output es.wav',
  ],
  ["Read text from a file", "hyperframes tts script.txt"],
  ["List bundled Kokoro voices", "hyperframes tts --list"],
];
import { resolve, extname } from "node:path";
import * as clack from "@clack/prompts";
import { c } from "../ui/colors.js";
import { errorBox } from "../ui/format.js";
import {
  DEFAULT_VOICE,
  BUNDLED_VOICES,
  SUPPORTED_LANGS,
  inferLangFromVoiceId,
  isSupportedLang,
  type SupportedLang,
} from "../tts/manager.js";
import { selectProvider, dispatch } from "../tts/providers/index.js";

const langList = SUPPORTED_LANGS.join(", ");

export default defineCommand({
  meta: {
    name: "tts",
    description:
      "Generate speech audio from text. Auto-detects provider from env: $HEYGEN_API_KEY → $ELEVENLABS_API_KEY → local Kokoro fallback.",
  },
  args: {
    input: {
      type: "positional",
      description: "Text to speak, or path to a .txt file",
      required: false,
    },
    output: {
      type: "string",
      description: "Output file path (default: speech.wav in current directory)",
      alias: "o",
    },
    provider: {
      type: "string",
      description: "TTS provider: auto (default) | heygen | elevenlabs | kokoro",
      alias: "p",
    },
    voice: {
      type: "string",
      description: `Voice ID (provider-specific). Kokoro default: ${DEFAULT_VOICE}. HeyGen/ElevenLabs use the provider's own voice IDs.`,
      alias: "v",
    },
    speed: {
      type: "string",
      description: "Speech speed multiplier (default: 1.0)",
      alias: "s",
    },
    lang: {
      type: "string",
      description: `Phonemizer language for Kokoro (auto-detected from voice prefix). Options: ${langList}`,
      alias: "l",
    },
    words: {
      type: "string",
      description:
        "Write word-level timestamps to this JSON path (HeyGen only — other providers ignore)",
      alias: "w",
    },
    list: {
      type: "boolean",
      description: "List bundled Kokoro voices and exit",
      default: false,
    },
    json: {
      type: "boolean",
      description: "Output result as JSON",
      default: false,
    },
  },
  async run({ args }) {
    if (args.list) {
      return listVoices(args.json);
    }

    if (!args.input) {
      console.error(c.error("Provide text to speak, or use --list to see Kokoro voices."));
      process.exit(1);
    }

    let text: string;
    const maybeFile = resolve(args.input);

    if (existsSync(maybeFile) && extname(maybeFile).toLowerCase() === ".txt") {
      text = readFileSync(maybeFile, "utf-8").trim();
      if (!text) {
        console.error(c.error("File is empty."));
        process.exit(1);
      }
    } else {
      text = args.input;
    }

    if (!text.trim()) {
      console.error(c.error("No text provided."));
      process.exit(1);
    }

    const output = resolve(args.output ?? "speech.wav");
    const speed = args.speed ? parseFloat(args.speed) : 1.0;

    if (isNaN(speed) || speed <= 0 || speed > 3) {
      console.error(c.error("Speed must be a number between 0.1 and 3.0"));
      process.exit(1);
    }

    let provider;
    try {
      provider = selectProvider(args.provider);
    } catch (err) {
      console.error(c.error(err instanceof Error ? err.message : String(err)));
      process.exit(1);
    }

    // Kokoro-specific language resolution. HeyGen/ElevenLabs ignore these.
    let lang: SupportedLang | undefined;
    if (provider === "kokoro") {
      const voice = args.voice ?? DEFAULT_VOICE;
      const inferredLang = inferLangFromVoiceId(voice);
      lang = inferredLang;
      if (args.lang != null) {
        const requested = String(args.lang).toLowerCase();
        if (!isSupportedLang(requested)) {
          errorBox("Invalid --lang", `Got "${args.lang}". Must be one of: ${langList}.`);
          process.exit(1);
        }
        lang = requested;
      }
      if (!args.json && args.lang != null && lang !== inferredLang) {
        console.log(
          c.dim(
            `  Note: voice "${voice}" is ${inferredLang}, rendering with --lang ${lang} instead.`,
          ),
        );
      }
    }

    const voiceForProvider = args.voice ?? (provider === "kokoro" ? DEFAULT_VOICE : undefined);

    const spin = args.json ? null : clack.spinner();
    spin?.start(`Generating speech via ${c.accent(provider)}...`);

    try {
      const result = await dispatch(provider, text, output, {
        voice: voiceForProvider,
        speed,
        lang,
        language: args.lang,
        onProgress: spin ? (msg) => spin.message(msg) : undefined,
      });

      let wordsWritten: string | undefined;
      if (args.words && result.words?.length) {
        const wordsPath = resolve(args.words);
        writeFileSync(wordsPath, JSON.stringify(result.words, null, 2));
        wordsWritten = wordsPath;
      }

      if (args.json) {
        console.log(
          JSON.stringify({
            ok: true,
            provider: result.provider,
            voice: voiceForProvider,
            speed,
            lang,
            durationSeconds: result.durationSeconds,
            outputPath: result.outputPath,
            wordsPath: wordsWritten,
            wordCount: result.words?.length ?? 0,
          }),
        );
      } else {
        spin?.stop(
          c.success(
            `[${result.provider}] generated ${c.accent(result.durationSeconds.toFixed(1) + "s")} of speech → ${c.accent(result.outputPath)}`,
          ),
        );
        if (wordsWritten) {
          console.log(
            c.dim(`  Wrote ${result.words?.length ?? 0} word timestamps → ${wordsWritten}`),
          );
        } else if (args.words && !result.words?.length) {
          console.log(
            c.dim(
              `  Note: ${result.provider} did not return word timestamps; run 'hyperframes transcribe' for them.`,
            ),
          );
        }
        if (provider === "kokoro" && args.lang != null && result.langApplied === false) {
          console.log(
            c.dim(
              "  Note: installed kokoro-onnx version does not support the --lang kwarg; phonemization used Kokoro's default.",
            ),
          );
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (args.json) {
        console.log(JSON.stringify({ ok: false, provider, error: message }));
      } else {
        spin?.stop(c.error(`Speech synthesis failed: ${message}`));
      }
      process.exit(1);
    }
  },
});

// ---------------------------------------------------------------------------
// List voices (Kokoro only — HeyGen/ElevenLabs voices live in their dashboards)
// ---------------------------------------------------------------------------

function listVoices(json: boolean): void {
  const rows = BUNDLED_VOICES.map((v) => ({ ...v, defaultLang: inferLangFromVoiceId(v.id) }));

  if (json) {
    console.log(JSON.stringify(rows));
    return;
  }

  console.log(`\n${c.bold("Bundled Kokoro voices")} (local provider)\n`);
  console.log(
    `  ${c.dim("ID")}                ${c.dim("Name")}         ${c.dim("Language")}   ${c.dim("Lang code")}  ${c.dim("Gender")}`,
  );
  console.log(`  ${c.dim("─".repeat(72))}`);
  for (const row of rows) {
    const id = row.id.padEnd(18);
    const label = row.label.padEnd(13);
    const lang = row.language.padEnd(10);
    const code = row.defaultLang.padEnd(10);
    console.log(`  ${c.accent(id)} ${label} ${lang} ${code} ${row.gender}`);
  }
  console.log(
    `\n  ${c.dim("Use any Kokoro voice ID — see https://github.com/thewh1teagle/kokoro-onnx for all 54.")}`,
  );
  console.log(
    `  ${c.dim("HeyGen voices: developers.heygen.com (GET /v3/voices?engine=starfish)")}`,
  );
  console.log(`  ${c.dim("ElevenLabs voices: elevenlabs.io dashboard")}\n`);
}
