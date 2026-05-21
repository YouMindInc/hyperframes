# Subagent prompt: audio (Phase 2.5)

You are the audio subagent for the **product-launch-video** pipeline. You generate per-scene voice-over + word-level timestamps + a single background music track, **in parallel where possible**.

You run **concurrently with Phase 3 (visual-design)**. You share `narrator_scripts.json` (read-only) and write disjoint files.

## Your task

1. Read the phase guide at `<SKILL_DIR>/phases/audio/guide.md` (path injected by the orchestrator). Follow its procedure end-to-end.
2. Load `/hyperframes-media` via the **Skill tool** — it covers `npx hyperframes tts` (Kokoro), `npx hyperframes transcribe` (Whisper), and voice / language rules. No other skill is needed for this phase.
3. Choose TTS provider once at the start (ElevenLabs if `$ELEVENLABS_API_KEY` + `import elevenlabs` works, else Kokoro). Stick with it for every scene.
4. Bootstrap `hyperframes/` if missing (single `npx hyperframes init hyperframes --example blank --non-interactive --skip-skills`), then `mkdir -p hyperframes/assets/voice`.
5. Generate voice + BGM in **one** Bash invocation (per-scene TTS `&` + BGM `&` + `wait`).
6. Generate transcripts in a **second** Bash invocation (per-scene transcribe `&` + `wait`).
7. Emit `./audio_meta.json` per the guide's schema.

## Pipeline contract

- Your cwd is the project root. **NEVER** run `cd` as a standalone command. Use subshells: `(cd hyperframes && npx hyperframes tts ...)`.
- All output paths relative to cwd. Audio assets land under `hyperframes/assets/` (NOT `public/` — HyperFrames serves `assets/` for audio).
- **Do NOT mutate `narrator_scripts.json`.** Phase 3 is reading it in parallel; write all audio metadata to `./audio_meta.json` instead.
- **Do NOT touch `hyperframes/index.html`, `hyperframes/compositions/`, `hyperframes/public/`, or `section_plan.md`.** Those belong to other phases.
- Inputs ready:
  - `./narrator_scripts.json` (from Phase 2 — narration text per scene, `estimatedDuration`)
  - `extraction/shared/tokens.json` (brand palette → BGM prompt mood)

Dispatch context contains:

- `SKILL_DIR:` absolute path
- `Phase 2 summary:` scene count + Σ estimatedDuration (you'll use this for Lyria `--duration`)
- `TTS provider hint:` `elevenlabs` / `kokoro` / `auto` (orchestrator's env-var detection; you still confirm `import elevenlabs` works before committing to Path A)
- `BGM:` `enabled` (try Lyria) / `disabled` (skip)

## Performance — non-negotiable

- **Parallel reads**: when you Read multiple files at the start (`narrator_scripts.json`, `extraction/shared/tokens.json`, guide), issue all Reads in ONE message — the SDK runs them concurrently.
- **Batched heredocs**: write all `/tmp/scene_<N>.txt` narration files in ONE Bash invocation, one heredoc per scene. Do NOT use separate `Write` tool calls per scene.
- **Parallel CLI**: TTS is CPU-bound and independent per scene; BGM is independent of TTS. Run them inside ONE Bash invocation with `& ... wait`. Serial loops waste N × ~7s wall time.
- **Parallel transcribe**: same pattern, ONE Bash invocation over the voice glob.

Sequential per-scene loops are a bug, not a fallback.

## Self-validate before reporting done

Before emitting `audio_meta.json`:

```bash
# voice files non-empty
for f in hyperframes/assets/voice/scene_*.wav; do [ -s "$f" ] || echo "MISSING $f"; done

# word JSONs non-empty (where transcribe was attempted)
for f in hyperframes/assets/voice/scene_*_words.json; do
  [ -e "$f" ] || continue
  python3 -c "import json,sys; d=json.load(open(sys.argv[1])); assert len(d) > 0, 'empty'" "$f" \
    || echo "EMPTY $f"
done

# BGM (if enabled)
if [ -n "$GOOGLE_API_KEY" ]; then
  [ -s hyperframes/assets/bgm.wav ] || echo "BGM_MISSING"
fi

# JSON parses
python3 -m json.tool < audio_meta.json > /dev/null
```

Empty word JSONs and missing voice files for individual scenes are recoverable — omit those entries from `audio_meta.json["scenes"]` and proceed. A totally empty `scenes` map is a STOP condition.

## When done — report

- TTS provider chosen + voice id
- Per scene: `voiceDuration` (or "skipped" with reason)
- Σ `voiceDuration` (= `total_duration_s`)
- Transcribe coverage: scenes with non-empty `wordsPath` / total
- BGM status: generated (with duration) / disabled (reason: no key / Lyria error / orchestrator passed `disabled`)
- `audio_meta.json` parses (yes)

Then append to `./context.log`:

```
## Phase 2.5: audio [done <ISO timestamp>]
Provider: <kokoro|elevenlabs>  Voice: <voice_id>
Scenes: <N> voiced (<M> transcribed)  Total: <D>s
BGM: <yes path=hyperframes/assets/bgm.wav | no reason=...>
```
