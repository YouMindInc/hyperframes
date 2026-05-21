---
name: hyperframes-media
description: Asset preprocessing for HyperFrames compositions — TTS (Kokoro-82M, 54 voices), Whisper transcription, background removal, and caption authoring. Use for npx hyperframes tts, transcribe, remove-background, voice selection, Whisper model selection, transparent cutouts, captions / subtitles / lyrics / karaoke / per-word styling, or TTS-to-captions workflows.
---

# HyperFrames Media

CLI commands that create assets, plus everything needed to consume and animate transcript data in HTML. For placing assets into compositions, see `hyperframes-core`.

## Routing

| Task                                                              | Read                                        |
| ----------------------------------------------------------------- | ------------------------------------------- |
| `npx hyperframes tts` — Kokoro narration, voice / language choice | `references/tts.md`                         |
| `npx hyperframes transcribe` — Whisper, model rules, output shape | `references/transcribe.md`                  |
| `npx hyperframes remove-background` — transparent cutouts         | `references/remove-background.md`           |
| TTS → transcription → captions (no recorded voiceover)            | `references/tts-to-captions.md`             |
| Caption HTML — subtitles, lyrics, karaoke, per-word styling       | `references/captions/styling.md`            |
| Transcript JSON / SRT / VTT cleanup + quality gates               | `references/captions/transcript-guide.md`   |
| Caption motion, animated emphasis, dynamic per-word effects       | `references/captions/dynamic-techniques.md` |
| Model caches, system dependencies, troubleshooting                | `references/requirements.md`                |

## Non-negotiable rules

- **Always pass `--model` to `transcribe`.** The CLI default `small.en` silently translates non-English audio. See `references/transcribe.md` → "Language Rule".
- **Captions consume the flat word-array format** with `{ id, text, start, end }`. See `references/transcribe.md` → "Output Shape".
- **`remove-background --background-output` is hole-cut, not inpainted.** For "scene without the person", a different tool is needed. See `references/remove-background.md` → "When NOT the right tool".
