# Audio (Phase 2.5) — workflow guide

Phase 2.5 由 **`scripts/audio.mjs`** 一把跑完：narrator_scripts → 每 scene voice + word JSON + audio_meta.json，外加（可选）detached BGM。Step 3 编排器直接 `node audio.mjs`，**没有 subagent**。

完整 flag 见 SKILL.md Step 3 / `audio.mjs --help`。本文件只描述 schema 和失败模式。

## 产物

```
./audio_meta.json                               # 给 prep.mjs 的 index
hyperframes/assets/voice/scene_<N>.wav          # 每 scene narration
hyperframes/assets/voice/scene_<N>_words.json   # 每 scene word-level timestamp
hyperframes/assets/bgm.wav                      # BGM（可选；可能 audio.mjs 退出时还没落盘）
```

`audio_meta.json` schema（被 `prep.mjs` 消费）：

```json
{
  "tts_provider": "heygen" | "elevenlabs" | "kokoro",
  "bgm_provider": "lyria" | "musicgen" | null,
  "bgm_enabled": true | false,
  "bgm_pending": true | false,        // Lyria detached 时 audio.mjs 退出可能仍在渲染
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

Provider 链 / voice id / mood prompt / env detection 全部 audio.mjs 内部处理；orchestrator 不挑。强制 provider 用 `--provider <name>`，覆盖 BGM mood 用 `--bgm-prompt "<text>"`。底层能力文档见 `hyperframes-media` skill。

## Failure modes

| Failure                  | 行为                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------- |
| Single scene TTS exits 1 | 该 scene 不进 `audio_meta.scenes`，其他继续。Phase 4a 用 `estimatedDuration` 兜底。 |
| BGM exits 1              | `bgm_enabled: false`, `bgm_path: null`。voice 完成，Phase 4c 跳 `<audio>` 元素。    |
| All scenes fail          | audio.mjs 退 1，stderr 报错，pipeline 停。                                          |

BGM 失败永不阻塞；只有"零场景拿到 voice"是 fatal。
