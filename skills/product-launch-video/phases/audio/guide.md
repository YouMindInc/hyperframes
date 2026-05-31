# Audio (Phase 2.5) — workflow guide

Phase 2.5 由 **`scripts/audio.mjs`** 一把跑完：narrator_scripts → 每 scene voice + word JSON + audio_meta.json，外加（可选）detached BGM。Step 3 编排器直接 `node audio.mjs`，**没有 subagent**。脚本先 ffprobe TTS 输出得到实测总时长，再让本地 MusicGen fallback 单次生成一条 ~28s 种子片（一次 `generate()`，控制在模型 ~30s 位置编码上限内），然后：目标短于种子就裁切，目标长于种子就用 ~0.3s crossfade 把种子循环平铺到等长 `assets/bgm.wav`，最后整体首淡入尾淡出。比旧的逐段拼接没有硬接缝。

完整 flag 见 SKILL.md Step 3 / `audio.mjs --help`。本文件只描述 schema 和失败模式。

## 产物

```
./audio_meta.json                       # 给 prep.mjs 的 index（PROJECT_DIR 根）
assets/voice/scene_<N>.wav              # 每 scene narration（PROJECT_DIR/assets/，无 hyperframes/ 子目录）
assets/voice/scene_<N>_words.json       # 每 scene word-level timestamp
assets/bgm.wav                          # BGM（可选；可能 audio.mjs 退出时还没落盘）
```

`audio_meta.json` schema（被 `prep.mjs` 消费）：

```json
{
  "tts_provider": "heygen" | "elevenlabs" | "kokoro",
  "bgm_provider": "lyria" | "musicgen" | null,
  "bgm_enabled": true | false,
  "bgm_pending": true | false,        // detached BGM 可能还在渲染；Step 7 wait-bgm.mjs 复核
  "bgm_path": "assets/bgm.wav" | null,
  "bgm_log": "/tmp/bgm-<timestamp>.log" | null,
  "bgm_pid": 12345 | null,
  "bgm_mode": "detached-single" | "detached-seed-loop" | "detached-seed-trim" | null,
  "bgm_seed_duration_s": 28 | null,    // MusicGen: 单条种子片长(≤30s 规避位置编码上限)
  "bgm_loop_count": 3 | null,          // 种子 crossfade-loop 平铺到目标时长的圈数(trim 时为 1)
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

| Failure                  | 行为                                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| Single scene TTS exits 1 | 该 scene 不进 `audio_meta.scenes`，其他继续。Phase 4a 用 `estimatedDuration` 兜底。                |
| BGM pending              | `bgm_enabled: true` + `bgm_pending: true`。Step 7 先跑 `wait-bgm.mjs`，ready 才挂 track 11。       |
| BGM exits 1              | `wait-bgm.mjs` 写 `bgm_status.json { status: "failed" }`；voice 完成，Phase 4c 跳 `<audio>` 元素。 |
| All scenes fail          | audio.mjs 退 1，stderr 报错，pipeline 停。                                                         |

BGM 失败永不阻塞；只有"零场景拿到 voice"是 fatal。
