# Audio (Phase 2.5)

Generate per-scene voice-over + word-level timestamps + a single background music track in parallel. Output: `audio_meta.json` (side file, **do NOT mutate** `narrator_scripts.json`) + `hyperframes/assets/voice/*` + `hyperframes/assets/bgm.wav`.

Runs in parallel with Phase 3 (visual-design); the two are dispatched from the same orchestrator message. They share `narrator_scripts.json` (read-only for both) and write disjoint files.

## Outputs

```
./audio_meta.json                                   # index for Phase 4a / 4c
hyperframes/assets/voice/scene_<N>.wav              # narration audio
hyperframes/assets/voice/scene_<N>_words.json       # Whisper word-level timestamps
hyperframes/assets/bgm.wav                          # background music (optional)
```

`audio_meta.json` schema:

```json
{
  "tts_provider": "kokoro" | "elevenlabs",
  "voice_id": "<voice id used>",
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

`wordsPath` is omitted (or empty string) for any scene whose transcribe step failed. Scenes whose TTS failed are omitted from `scenes` entirely (Phase 4a falls back to `estimatedDuration`).

## Provider selection — once at the start

Choose TTS provider once and stick with it for every scene (do not mix voices):

- `$ELEVENLABS_API_KEY` set **and** `python3 -c 'import elevenlabs' 2>/dev/null` succeeds → **ElevenLabs (Path A)**, cloud
- Otherwise → **Kokoro (Path B)** via `npx hyperframes tts`, fully local, free

Decision is the first thing the agent logs in its report.

## Voice IDs (Kokoro path B)

Default English: `am_michael`. Other options (see `/hyperframes-media` → `references/tts.md`):

- English: `am_michael`, `af_heart`, `af_sky`, `af_nova`, `bf_emma`, `bm_george`
- Non-English: pass `--language <iso>` to `tts` AND use a non-`.en` Whisper model in transcribe

Voice id is recorded in `audio_meta.json["voice_id"]`.

## TTS — parallel batch (single Bash call)

Read narration for each scene from `narrator_scripts.json` (the `script` field). Write all `/tmp/scene_<N>.txt` files in ONE Bash invocation via multi-heredoc, then kick off TTS for each + BGM in parallel.

**Kokoro pattern (Path B)**:

```bash
mkdir -p hyperframes/assets/voice

# Write all narration files in ONE Bash call — one heredoc per scene id
cat > /tmp/scene_1.txt <<'EOF'
<scene 1 script verbatim>
EOF
cat > /tmp/scene_2.txt <<'EOF'
<scene 2 script verbatim>
EOF
# ... repeat for every scene in narrator_scripts.json

# Parallel TTS (one process per scene) — same Bash invocation as BGM below
for txt in /tmp/scene_*.txt; do
  id=$(basename "$txt" .txt)
  (cd hyperframes && npx hyperframes tts "$txt" \
    --voice am_michael \
    --output "assets/voice/$id.wav") &
done

# BGM in parallel with TTS (skip block if $GOOGLE_API_KEY unset)
SKIP_BGM=""
if [ -n "$GOOGLE_API_KEY" ]; then
  # Try in order, least invasive first. Falls through to graceful skip if all fail.
  python3 -c 'import google.genai' 2>/dev/null \
    || pip install -q google-genai python-dotenv mutagen 2>/dev/null \
    || pip install -q --break-system-packages google-genai python-dotenv mutagen 2>/dev/null \
    || pip install -q --user google-genai python-dotenv mutagen 2>/dev/null \
    || { echo "BGM skipped: cannot install google-genai (try a venv or pipx)" >> context.log; SKIP_BGM=1; }

  if [ -z "$SKIP_BGM" ]; then
    (python3 "$SKILL_DIR/phases/audio/lyria-recipe.py" \
      --output hyperframes/assets/bgm.wav \
      --duration "$TOTAL_S" \
      --prompt "<brand-mood prompt — see below>") &
  fi
fi

wait
```

`$TOTAL_S` = sum of `estimatedDuration` (parse "4.83s" → 4.83) across all scenes from `narrator_scripts.json`.

**ElevenLabs pattern (Path A)**: use a Python `concurrent.futures.ThreadPoolExecutor` (or `asyncio.gather`) over the scene list. Do NOT issue one sequential `python -c` per scene. Install on demand: `pip install -q elevenlabs mutagen` if missing.

## BGM — brand-mood prompt

Read `extraction/shared/tokens.json` for brand palette + industry hint, then write a one-sentence prompt:

- tech / SaaS → `"Uplifting corporate tech, bright and modern, gentle piano with synth pads"`
- creative agency → `"Playful electronic, warm pads, light percussion"`
- finance / serious → `"Calm cinematic, soft strings, restrained percussion"`

Tuning: `--bpm 90-110` calm, `110-130` energetic; `--brightness ≥ 0.7` for promotional; `--scale MAJOR` upbeat, `MINOR` somber.

The Lyria recipe at `phases/audio/lyria-recipe.py` accepts these as CLI flags.

## Transcribe — parallel batch (after TTS)

After every TTS file lands, batch transcribe in ONE Bash invocation:

```bash
# Model selection — see /hyperframes-media references/transcribe.md "Language Rule"
#   English voices (am_*, af_*, bf_*, bm_*)  →  small.en
#   Non-English                              →  small  + --language <iso>
MODEL=small.en

for vf in hyperframes/assets/voice/scene_*.wav; do
  [ -e "$vf" ] || continue
  id=$(basename "$vf" .wav)
  (cd hyperframes && npx hyperframes transcribe \
    "assets/voice/$id.wav" \
    --model "$MODEL" \
    --output "assets/voice/${id}_words.json") &
done
wait
```

Output shape (CLI writes a flat array):

```json
[
  { "id": "w0", "text": "Every", "start": 0.12, "end": 0.38 },
  { "id": "w1", "text": "day", "start": 0.4, "end": 0.62 }
]
```

**Sanity check** before emitting `audio_meta.json`:

```bash
for f in hyperframes/assets/voice/scene_*_words.json; do
  [ -e "$f" ] || continue
  count=$(python3 -c "import json,sys; print(len(json.load(open(sys.argv[1]))))" "$f")
  echo "$f: $count words"
done
```

Word count 0 = silent file or wrong-language model. Investigate before emitting `wordsPath` for that scene.

## Measure durations + emit audio_meta.json

```bash
for f in hyperframes/assets/voice/scene_*.wav; do
  printf '%s\t' "$f"
  ffprobe -v error -show_entries format=duration -of csv=p=0 "$f"
done
```

Assemble `audio_meta.json` with the schema above. Compute `total_duration_s = Σ voiceDuration`. Set `bgm_enabled` + `bgm_path` based on whether `hyperframes/assets/bgm.wav` lands non-empty.

## Failure handling — graceful degradation

| Failure                                                                                            | Behavior                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Both TTS providers unavailable (no ElevenLabs key + Kokoro deps missing and `pip install` blocked) | Emit `audio_meta.json` with `"scenes": {}` + `"bgm_enabled": false`. STOP and report — orchestrator decides to skip audio (4a falls back to `estimatedDuration`) or abort. |
| Single scene TTS fails                                                                             | Omit that scene from `audio_meta.json["scenes"]`. Log to `context.log`. Other scenes proceed.                                                                              |
| `$GOOGLE_API_KEY` missing or Lyria fails                                                           | `"bgm_enabled": false`, `"bgm_path": null`. Pipeline continues without BGM.                                                                                                |
| Single scene transcribe fails                                                                      | Keep `voicePath` + `voiceDuration`, omit `wordsPath`. Phase 3 / Phase 4 detect missing `wordsPath` and avoid `asr-keyword-glow`.                                           |
| Word count 0 (silent / wrong language)                                                             | Same as transcribe failure — omit `wordsPath`, log reason.                                                                                                                 |

Never block the pipeline on BGM failure. Block only when no scene got voice at all.

## See also

- `/hyperframes-media` → `references/tts.md` (Kokoro voice list, language flag)
- `/hyperframes-media` → `references/transcribe.md` (Whisper Language Rule, output shape)
- `/hyperframes-media` → `references/tts-to-captions.md` (full TTS → captions chain context)
- `phases/audio/lyria-recipe.py` (BGM generator script in this phase dir)
