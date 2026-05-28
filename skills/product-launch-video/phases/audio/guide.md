# Audio (Phase 2.5) — workflow guide

Phase 2.5 generates narration + (optional) background music for each scene. All capability lives in the **`hyperframes-media`** skill — `npx hyperframes tts` and `npx hyperframes bgm` do provider auto-detection internally. This file only describes how to wire those commands into the launch-video-v2 workflow.

For provider chains, voice IDs, mood prompts, env-var detection, and failure modes, read:

- `hyperframes-media` → `references/tts.md` — HeyGen / ElevenLabs / Kokoro chain, `--words` flag for HeyGen word timestamps
- `hyperframes-media` → `references/bgm.md` — Lyria / MusicGen chain, `--from-file` mood inference, Lyria knobs
- `hyperframes-media` → `references/tts-to-captions.md` — when to skip Whisper (HeyGen Path A) vs. chain TTS → transcribe (Path B)
- `hyperframes-media` → `references/transcribe.md` — Whisper model + Language Rule

## What this phase produces

```
./audio_meta.json                                   # index for Phase 4a / 4c
hyperframes/assets/voice/scene_<N>.wav              # narration audio per scene
hyperframes/assets/voice/scene_<N>_words.json       # word-level timestamps per scene
hyperframes/assets/bgm.wav                          # background music (optional)
```

`audio_meta.json` schema (consumed by `prep.mjs`):

```json
{
  "tts_provider": "heygen" | "elevenlabs" | "kokoro",
  "bgm_provider": "lyria" | "musicgen" | null,
  "bgm_enabled": true | false,
  "bgm_path": "assets/bgm.wav" | null,
  "total_duration_s": <Σ voiceDuration>,
  "scenes": {
    "scene_1": {
      "voicePath": "assets/voice/scene_1.wav",
      "voiceDuration": 4.823,
      "wordsPath": "assets/voice/scene_1_words.json"
    },
    "scene_2": { ... }
  }
}
```

## Procedure (orchestrator)

For each scene in `narrator_scripts.json`, in parallel:

1. **TTS** — `npx hyperframes tts <scene_text> -o hyperframes/assets/voice/scene_<N>.wav --words hyperframes/assets/voice/scene_<N>_words.json --json`
   - If the result's `wordCount > 0` (HeyGen Path A), the words file is already populated — no Whisper pass needed.
   - If `wordCount == 0` (ElevenLabs / Kokoro), chain `npx hyperframes transcribe scene_<N>.wav --model small.en` to fill in word timing.
2. **Duration** — read `durationSeconds` from the TTS JSON result (it's the same number `ffprobe` would report).

In parallel with all scenes:

3. **BGM** — `npx hyperframes bgm --duration <total_duration_s> --from-file narrator_scripts.json -o hyperframes/assets/bgm.wav --json &` (run detached / in the background; voice work doesn't block on it).

4. **Meta** — once all per-scene TTS + word-data is settled, write `audio_meta.json` aggregating the results. Set `bgm_pending: true` if BGM is still running; Phase 4c re-checks `bgm.wav` on disk before emitting the `<audio>` element.

## Provider selection — do nothing

The orchestrator does **not** check API keys or pick a provider. `npx hyperframes tts` / `npx hyperframes bgm` handle that internally using the env chain documented in `hyperframes-media`. If the user wants to force a provider, they can set `--provider <name>` in their own override layer; the workflow itself stays provider-agnostic.

## Failure modes

| Failure                  | Behavior                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Single scene TTS exits 1 | Omit that scene from `audio_meta.json["scenes"]`. Other scenes proceed. Phase 4a falls back to `estimatedDuration`. |
| BGM exits 1              | `bgm_enabled: false`, `bgm_path: null`. Voice still completes. Phase 4c skips the `<audio>` element.                |
| All scenes fail          | Exit 1 with stderr; stop the pipeline.                                                                              |

BGM failure never blocks the pipeline. Only "zero scenes got voice" is fatal.
