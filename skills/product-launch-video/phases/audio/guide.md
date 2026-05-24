# Audio (Phase 2.5) — reference

Phase 2.5 is **deterministic** — owned by [`scripts/audio.mjs`](../../scripts/audio.mjs). No subagent. This document is a reference for the script's contract and design choices; not a procedure (the script _is_ the procedure).

## Procedure at a glance (what the script does)

1. Detect TTS provider (ElevenLabs if `$ELEVENLABS_API_KEY` + python `elevenlabs` import OK, else Kokoro)
2. For each scene in parallel: TTS → Whisper transcribe (chained per-scene, not waiting for siblings)
3. Spawn Lyria BGM **detached** (if `$GOOGLE_API_KEY` + `--lyria-recipe` set) — does NOT block voice
4. ffprobe each voice wav → write `audio_meta.json` with real `voiceDuration` per scene
5. Exit 0 the moment voice + transcribe done; BGM keeps rendering in the background

## What the script does

1. Reads `narrator_scripts.json`. BGM mood inference looks at the script bodies + `narrativeArchetype` + `emotionalArc` directly — no `tokens.json` side file (Phase 1 web-research writes asset/section data, not styling tokens; styling lives in Phase 1b's `design-system/`).
2. Picks TTS provider once at startup:
   - `$ELEVENLABS_API_KEY` set **and** `python3 -c 'import elevenlabs'` succeeds → **ElevenLabs** (cloud).
   - Otherwise → **Kokoro** (local, free) via `npx hyperframes tts`.
3. Writes every scene's narration to `/tmp/scene_<N>.txt`.
4. Per-scene **pipelined** TTS → transcribe: each scene's whisper run starts the moment its own TTS finishes (does NOT wait for sibling scenes). All scenes run in parallel via `Promise.all`.
5. Spawns Lyria BGM **detached** in parallel (if `$GOOGLE_API_KEY` set and `--lyria-recipe` path provided). The BGM child outlives the script — `audio.mjs` exits as soon as voice + transcribe finish.
6. ffprobes each voice file for true `voiceDuration` and writes `./audio_meta.json`.

## Outputs

```
./audio_meta.json                                   # index for Phase 4a / 4c
hyperframes/assets/voice/scene_<N>.wav              # narration audio
hyperframes/assets/voice/scene_<N>_words.json       # Whisper word-level timestamps (omitted if transcribe failed or count=0)
hyperframes/assets/bgm.wav                          # background music (lands after audio.mjs exits if Lyria takes longer)
```

`audio_meta.json` schema:

```json
{
  "tts_provider": "kokoro" | "elevenlabs",
  "voice_id": "<voice id used>",
  "bgm_enabled": true | false,
  "bgm_path": "assets/bgm.wav" | null,
  "bgm_pending": true | false,
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

- `bgm_pending: true` means Lyria is still rendering when the script exited. `prep.mjs` (Phase 4a) trusts the path; `finalize` (Phase 4c) re-checks `[ -s hyperframes/assets/bgm.wav ]` before emitting the `<audio>` element.
- `wordsPath` is `""` when transcribe failed or the JSON has zero words. Downstream effects (e.g. `asr-keyword-glow`) detect this and degrade.
- Scenes whose TTS failed are **omitted from `scenes` entirely** — Phase 4a falls back to `estimatedDuration` for those.

## CLI

```bash
node <SKILL_DIR>/scripts/audio.mjs \
  --narrator-scripts ./narrator_scripts.json \
  --hyperframes ./hyperframes \
  --out ./audio_meta.json \
  [--lyria-recipe <SKILL_DIR>/phases/audio/lyria-recipe.py] \
  [--voice <id>] [--lang en] \
  [--provider kokoro|elevenlabs] \
  [--no-bgm] [--bgm-prompt "<custom prompt>"]
```

Exit 0 = voice + transcribe + `audio_meta.json` done (BGM may still be rendering).
Exit 1 = zero scenes got voice; stderr names the reason.

## Voice IDs

**Kokoro (Path B)** — default `am_michael` for English. Other options (see `/hyperframes-media` → `references/tts.md`):

- English: `am_michael`, `af_heart`, `af_sky`, `af_nova`, `bf_emma`, `bm_george`
- Non-English: pass `--voice <id> --lang <iso>` AND the script switches Whisper to `small` + `--language <iso>` for transcribe.

**ElevenLabs (Path A)** — default voice id `21m00Tcm4TlvDq8ikWAM` (Rachel). Override with `--voice <voice-id-from-elevenlabs-dashboard>`.

## BGM mood prompt (auto-inferred)

The script concatenates `project` + `narrativeArchetype` + `emotionalArc` + every scene's `sceneName` / `script` / `narrativeIntent.{narrativeRole, keyMessage}` into a single lowercased blob, then matches industry keywords against it. Defaults by industry:

| Heuristic                                                | Default prompt                                                                                |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `saas / api / cloud / developer / platform / sdk` …      | `"Uplifting corporate tech, bright and modern, gentle piano with synth pads, BPM 110, MAJOR"` |
| `crypto / nft / web3 / defi / token / blockchain` …      | `"Atmospheric electronic, deep bass, futuristic synths, restrained percussion, BPM 100"`      |
| `creative / agency / design / studio / art / brand` …    | `"Playful electronic, warm pads, light percussion, BPM 115, MAJOR"`                           |
| `finance / fintech / bank / payment / invest / wealth` … | `"Calm cinematic, soft strings, restrained percussion, BPM 95"`                               |
| _(default)_                                              | `"Uplifting corporate tech, bright and modern, gentle piano with synth pads, BPM 110, MAJOR"` |

Override the entire prompt with `--bgm-prompt "..."`. The Lyria recipe at [`lyria-recipe.py`](./lyria-recipe.py) accepts `--prompt / --duration / --output`; tune with `--bpm` (90-110 calm, 110-130 energetic), `--brightness ≥ 0.7` for promotional, `--scale MAJOR` upbeat / `MINOR` somber by editing the recipe call.

## Failure modes (built into the script)

| Failure                                                  | Behavior                                                                                                                                                                                      |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `$ELEVENLABS_API_KEY` unset OR `import elevenlabs` fails | Auto-fallback to Kokoro.                                                                                                                                                                      |
| Both providers unavailable                               | The script logs the missing dep and exits 1 with an empty `scenes` map written. Orchestrator decides to skip audio (Phase 4a falls back to `estimatedDuration`) or install the dep and retry. |
| Single scene TTS fails                                   | Omit that scene from `audio_meta.json["scenes"]`. Other scenes proceed.                                                                                                                       |
| `$GOOGLE_API_KEY` missing or Lyria fails                 | `"bgm_enabled": false`, `"bgm_path": null`. Voice + transcribe still complete.                                                                                                                |
| Single scene transcribe fails OR word count 0            | Keep `voicePath` + `voiceDuration`, set `wordsPath: ""`. Downstream effects detect missing word data and avoid `asr-keyword-glow` for that scene.                                             |

BGM failure never blocks the pipeline. Only "zero scenes got voice" exits 1.

## See also

- `/hyperframes-media` → `references/tts.md` (Kokoro voice list, language flag)
- `/hyperframes-media` → `references/transcribe.md` (Whisper Language Rule, output shape)
- `/hyperframes-media` → `references/tts-to-captions.md` (full TTS → captions chain context)
- [`lyria-recipe.py`](./lyria-recipe.py) — BGM generator script (Google Lyria)
