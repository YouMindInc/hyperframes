---
name: product-launch-video
description: product-launch video workflow — URL → narrator_scripts.json + audio（voice + BGM）+ section_plan.md。
metadata:
  tags: orchestrator, pipeline, product-launch
---

# product-launch-video — dispatch entry

所有 artifact 都写到 `PROJECT_DIR = videos/<project-name>/`（Step 0 建立）。下表路径都相对 `PROJECT_DIR`。

| Phase                | 执行方式                                             | Primary artifact                                           | 详细流程                                             |
| -------------------- | ---------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| init                 | Bash 直跑                                            | `hyperframes.json`                                         | Step 0（本文件）                                     |
| capture              | Bash 直跑 hyperframes capture                        | `capture/extracted/tokens.json`                            | `phases/capture/guide.md`                            |
| design-system        | subagent（general-purpose）                          | `design-system/design.html` + `chunks/`                    | `agents/design-system.md`                            |
| story-design         | subagent（general-purpose）                          | `narrator_scripts.json`                                    | `agents/story-design.md`                             |
| audio                | Bash 直跑 audio.mjs                                  | `audio_meta.json`                                          | `phases/audio/guide.md`（脚本即流程）                |
| visual-design        | subagent（general-purpose）                          | `section_plan.md`                                          | `agents/visual-design.md`                            |
| prep                 | Bash 直跑 prep.mjs                                   | `group_spec.json`                                          | `scripts/prep.mjs`（脚本即流程）                     |
| captions + scenes    | (N+1)×subagent（general-purpose，同条 message 并行） | `compositions/captions.html` + `compositions/scene_*.html` | `agents/captions.md` · `agents/hyperframes-scene.md` |
| hyperframes-finalize | subagent（general-purpose）                          | `renders/video.mp4`                                        | `agents/hyperframes-finalize.md`                     |

## 前置依赖（首次运行必装）

macOS Apple Silicon 或 Linux x64。系统工具：

```bash
brew install python@3.11 node ffmpeg                   # Linux 用 apt/dnf 等价命令
npx hyperframes doctor                                  # 一次性确认 Chrome / 依赖齐了
```

- `python@3.11`（**用 homebrew python，别用系统 `/usr/bin/python3`**，否则 `pip install` 会被 PEP-668 拦；audio 阶段 MusicGen fallback 用）
- `node ≥ 18` —— `npx hyperframes` 用
- `ffmpeg` —— audio.mjs 用 `ffprobe` 取 voice duration
- `hyperframes` CLI —— Phase 1 capture + design-system 共用同一份抓取，首次运行 `npx hyperframes capture` 时浏览器管理器会自动下载 Chrome

可选 API key（不设走本地 fallback）。注入见 Step 0.5。`GEMINI_API_KEY` 和 `GOOGLE_API_KEY` 是等价别名。

| Key                             | 用在                                     | 默认 voice / fallback                                              |
| ------------------------------- | ---------------------------------------- | ------------------------------------------------------------------ |
| `HEYGEN_API_KEY`                | TTS（云端，带 word-level timestamps）    | voice `1bd001e7e50f421d891986aad5158bc8`                           |
| `ELEVENLABS_API_KEY`            | TTS（云端；需 `pip install elevenlabs`） | voice `21m00Tcm4TlvDq8ikWAM` (Rachel)                              |
| 都不设                          | TTS                                      | 本地 Kokoro，voice `am_michael`（非英文需 `--voice`）              |
| `GEMINI_API_KEY` (一把钥匙两用) | Capture vision caption + Lyria BGM       | 不设 → caption 仅 DOM 上下文；BGM 走本地 MusicGen（首次拉 ~300MB） |

## 流程

### Step 0 — 初始化视频项目

cwd 是 agent workspace root（如 `/tmp/launch-video-202347`），只放 `.claude/skills/`、`node_modules/` 等 harness 状态。所有视频产物写到子目录 `PROJECT_DIR = videos/<project-name>/`。

**`<project-name>` 命名**：

- 用户 prompt 显式给目录（如 `Use ./videos/acme-launch`）→ 直接用
- 否则 orchestrator 自选：短、语义清楚的 kebab-case，如 `<brand>-promo` / `<product>-launch`。**不要**用 workspace basename / 时间戳（`launch-video-204613` ❌）
- 仅有 URL 时可先用域名/页面标题；`capture/` 写入前可以改名，写入后定型

**初始化**（仅当 `$PROJECT_DIR/hyperframes.json` 不存在）：

```bash
PROJECT_DIR="${LAUNCH_VIDEO_DIR:-videos/<project-name>}"
mkdir -p "$(dirname "$PROJECT_DIR")"
npx hyperframes init "$PROJECT_DIR" --non-interactive --skip-skills --example=blank
rm -f "$PROJECT_DIR/AGENTS.md" "$PROJECT_DIR/CLAUDE.md"   # workflow 约束已在本 skill 内，不依赖 project 内 helper docs
```

**约束**（违反一项后续 phase 会找不到产物 / 触发 lint 报错）：

- 不在 workspace root 跑 `hyperframes init` / 生成 `AGENTS.md` / `CLAUDE.md`
- 不在 `PROJECT_DIR` 下再建 `hyperframes/` 子项目
- 所有 subagent 的 Dispatch context 含一行 `PROJECT_DIR: <path>`；subagent 把它当 project root，Bash 用 `(cd "$PROJECT_DIR" && ...)` subshell

**目录形态**：

```text
./                            # workspace root
├── .claude/skills/
├── node_modules/
├── package.json
└── videos/<project-name>/    # PROJECT_DIR — HyperFrames project root
    ├── hyperframes.json
    ├── context.log
    ├── capture/              # hyperframes capture artifacts
    │   ├── extracted/        # tokens / design-styles / animations / fonts-manifest / asset-descriptions / video-manifest / visible-text
    │   ├── assets/           # 媒体 + svgs/ + fonts/ + videos/previews/ + contact sheets
    │   ├── screenshots/      # scroll-*.png + contact-sheet-*.jpg
    │   └── meta.json
    ├── design-system/        # build-design 产物（由 capture 喂养）
    │   ├── inference.json
    │   ├── design.html
    │   ├── chunks/
    │   └── fonts/            # 自托管字体（build-design 从 capture 拷出来）
    ├── narrator_scripts.json
    ├── audio_meta.json
    ├── section_plan.md
    ├── group_spec.json
    ├── public/  assets/  compositions/  snapshots/
    └── renders/video.mp4
```

### Step 0.5 — API key 引导

**跳过条件**：`$PROJECT_DIR/.env` 已存在，或 `context.log` 非空（= 不是首次）。否则说给用户：

> 这个流程可选接云端 key（见上方"前置依赖"表），不设也能跑（走本地 fallback）。怎么回我：
>
> - 粘 key → 我写到 `$PROJECT_DIR/.env`
> - "go" → 我假设已经设好了（shell `export` 或 `.env`）
> - "skip" → 全部走本地 fallback

**回应处理**：

- 粘 key → Write/Edit 到 `$PROJECT_DIR/.env`，`KEY=value` 一行一条；同名覆盖。不评判、不换路径。
- "go" / "skip" / "已经设好了" → 直接进 Step 1。

### Step 1 — 抓取（Phase 1）

1. 解析 `SKILL_DIR` 和 `TARGET_URL`。
2. 按 Step 0 解析并确保 `PROJECT_DIR` 存在。
3. 读 `$PROJECT_DIR/context.log`（若存在），按下方 Resume 表跳过已完成 phase。
4. **Bash 直跑** hyperframes capture（**不再分两条并行 branch** —— design-system 现在直接吃 capture 产物）：

```bash
(cd "$PROJECT_DIR" && npx hyperframes capture "<TARGET_URL>" -o ./capture)
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/derive-context-pack.mjs --capture ./capture)
```

抓取产物：`capture/extracted/{tokens,design-styles,animations,fonts-manifest,asset-descriptions,video-manifest,visible-text}.{json,md,txt}` + `capture/assets/` + `capture/screenshots/` + `capture/context_pack.md`（derive-context-pack 合成的 LLM brief，Phase 2 / Phase 3 直接读）。

校验：

```bash
[ -s "$PROJECT_DIR/capture/extracted/tokens.json" ] && \
[ -s "$PROJECT_DIR/capture/extracted/design-styles.json" ] && \
[ -s "$PROJECT_DIR/capture/context_pack.md" ] && \
[ -d "$PROJECT_DIR/capture/assets" ] && echo ok || echo missing
```

缺任一 → 报错，停止。`capture/BLOCKED.md` 存在 = 反爬 / 超时，按里面说明排查。

### Step 1b — 视觉系统（Phase 1b）

capture 退 0 后启动 design-system subagent：

- design-system：`Agent`（`subagent_type: "general-purpose"`），prompt = `agents/design-system.md` 内容 + `## Dispatch context`（含 `SKILL_DIR`、`PROJECT_DIR`、`Target URL`）。

agent 跑 `build-design.mjs --no-emit` → review `inference.json` → 选 preset → `build-design.mjs --style <chosen>` → `emit-chunks.mjs`。Captions 的样式不在这里决定 —— 改由 Step 5.5 的 captions agent 直接读 `chunks/tokens.css` 现写 `compositions/captions.html`（agent-authored，无 registry 组件、无 builder 脚本）。

### Step 2 — 故事设计（Phase 2）

design-system 返回后，验证 `design-system/design.html` + `design-system/chunks/index.json` 存在，再启动：

- story-design：`Agent`（`subagent_type: "general-purpose"`），prompt = `agents/story-design.md` 内容 + `## Dispatch context`：
  ```
  SKILL_DIR: <绝对路径>
  PROJECT_DIR: <视频项目根>
  Schema validator: <SKILL_DIR>/scripts/validate-narrator-scripts.mjs
  Scene limit: 最多 4 个 scene
  Script style: 每个 scene 的 script 保持简短——1-2 句话，不超过 20 个词
  ```

### Step 3 — 音频（Phase 2.5）

story-design 返回且 `narrator_scripts.json` 存在后，启动：

```bash
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/audio.mjs \
  --narrator-scripts ./narrator_scripts.json \
  --hyperframes . \
  --out ./audio_meta.json \
  --lyria-recipe <SKILL_DIR>/phases/audio/lyria-recipe.py)
```

**BGM 前置条件**（满足其一即可，否则 BGM 静默跳过，voice 照常生成）：

- `$GOOGLE_API_KEY` 已设置 + `--lyria-recipe` 路径存在 → Lyria 云端生成（detached，后台运行）
- `pip install transformers torch soundfile` 已装（本地，免费）→ MusicGen via HuggingFace transformers 本地生成（首次运行下载 ~300MB 模型）。脚本会在 TTS 跑的同时后台 pip-install 缺失的包。

可选 flags（默认不需要）：

- `--voice <id>` — 默认 HeyGen `1bd001e7e50f421d891986aad5158bc8` / ElevenLabs `21m00Tcm4TlvDq8ikWAM` / Kokoro `am_michael`
- `--provider heygen|elevenlabs|kokoro` — 强制 TTS provider（不传 = 按 env 自动选）
- `--no-bgm` — 跳过 BGM
- `--bgm-prompt "<text>"` — 覆盖自动推断的 BGM mood

exit 0 → voice + transcribe 完成（BGM 可能仍在后台渲染），继续。
exit 1 → 零场景拿到 voice，报告错误，停止。

### Step 4 — 视觉设计（Phase 3）

audio 完成且 `audio_meta.json` 存在后，读取 effects-catalog 与 blueprints-index：

```bash
cat <SKILL_DIR>/phases/visual-design/effects-catalog.md
cat <SKILL_DIR>/phases/visual-design/blueprints-index.md
```

然后启动 visual-design subagent：

- visual-design：`Agent`（`subagent_type: "general-purpose"`），prompt = `agents/visual-design.md` 内容 + `## Dispatch context`：
  ```
  SKILL_DIR: <绝对路径>
  PROJECT_DIR: <视频项目根>
  Schema validator: <SKILL_DIR>/scripts/validate-section-plan.mjs
  SFX manifest: <SKILL_DIR>/assets/sfx/manifest.json
  ## Effects catalog
  <effects-catalog.md 全文>
  ## Blueprints index
  <blueprints-index.md 全文>
  ```

### Step 5 — Phase 4a prep（deterministic script，NO subagent）

Phase 3 visual-design 退出且 `section_plan.md` 存在后，跑 `prep.mjs` 合并所有上游产物为 `group_spec.json`，供 Phase 4b/4c 消费：

```bash
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/prep.mjs \
  --section-plan ./section_plan.md \
  --narrator-scripts ./narrator_scripts.json \
  $( [ -f audio_meta.json ] && echo "--audio-meta ./audio_meta.json" ) \
  --rules-dir <SKILL_DIR>/../hyperframes-animation/rules \
  --capture ./capture \
  --design-system ./design-system \
  --hyperframes . \
  --sfx-lib <SKILL_DIR>/assets/sfx \
  --out ./group_spec.json)
```

脚本做什么：

1. 依赖 Step 0 已经把 `PROJECT_DIR` 初始化为 HyperFrames 项目；这里不再创建 `hyperframes/` 子目录
2. 复制 `capture/assets/**/*.{png,jpg,jpeg,webp,svg,mp4,mov,webm}` + `capture/screenshots/*.png` 到 `public/`
3. 复制 `design-system/fonts/*` 到 `public/fonts/`（本 skill 暂无 download-fonts 时静默跳过）
4. 解析 `section_plan.md` 的 anchors：必选 Effects / Duration / Continuity，可选 Blueprint / Components / Surface / Motifs / **SFX**
5. 校验每个 effect id 都对应 `hyperframes-animation/rules/<id>.md` 存在
6. 解析 `design-system/chunks/index.json` —— 把 Components 锚点引用的 component id 解析为绝对路径；id 不在 index.json 中 → fatal 退出
7. 合并 `audio_meta.json` —— `voiceDuration` 覆盖 section_plan duration（差 >10% 时）
8. 按 `Continuity` 分组（`break` 开新 worker、`continue` 续到 cap=2）
9. **SFX**：复制 `<sfxLibDir>/*.mp3` + `manifest.json` 到 `assets/sfx/`，校验每条 cue 文件存在于 manifest，把 scene-local `t` 加 `start_s` offset 转全局秒数，写入 `group_spec.sfx[]`（flat list 按 t 排序）
10. 写 `./group_spec.json` + stdout summary（含每 scene 的 design_chunks 块、SFX 条数）

退出码：

- 0 → 读 stdout（scenes / groups / total duration / 每组 breakdown），追加到 `$PROJECT_DIR/context.log`
- 1 → stderr 给出失败的 scene + anchor，回退到 Step 4 重派 visual-design

### Step 5.5 + Step 6 — Captions + scene workers 并行 fan-out（Phase 4a.5 + 4b）

prep 退出 0 后，读 `group_spec.json.groups[]` 得 worker 数 N。**同一条 message** 里并行启动 **N+1 个 background subagent**：N 个 scene worker + 1 个 captions agent。captions agent 跟 scene worker 是不同物种的 sub-comp（一个全片字幕、一个单 scene 画面），但都只依赖 `group_spec.json` + `chunks/`，输出不同文件，可以无锁并行。

**Captions agent**（写 `compositions/captions.html`）：

- `Agent`（`subagent_type: "general-purpose"`，`run_in_background: true`），prompt = `agents/captions.md` 内容 + `## Dispatch context`：
  ```
  SKILL_DIR: <绝对路径>
  PROJECT_DIR: <视频项目根>
  ```

退出条件：写出 `compositions/captions.html` 或汇报 `skipped` —— finalize 看文件存在性决定是否挂 track-12 clip。captions agent 自检 `npx hyperframes lint` 报错 → 它自己 STOP，captions.html 不写出，finalize 自动跳过。

**Scene workers**（每个写 `compositions/scene_<N>.html`）：

- N 个 `Agent`（`subagent_type: "general-purpose"`，每个 `run_in_background: true`），prompt = `agents/hyperframes-scene.md` 全文 + `## Dispatch context`：

  ```
  SKILL_DIR: <绝对路径>
  PROJECT_DIR: <视频项目根>
  Worker ID: <w1 / w2 / ...>
  Design chunks dir: ./design-system/chunks/  # 若 design_chunks: null（chunks 缺失），回退到 ./design-system/design.html
  Scenes:
    - scene_id: scene_<N>
      effects: [...]
      rule_paths:
        - <abs path 1>
        - <abs path 2>
      assetCandidates:
        - { path: "public/...", description: "..." }
      estimatedDuration_s: <float>
      voicePath: assets/voice/scene_<N>.wav (空字符串就略)
      blueprint: composed | based-on <id> | extended <id>
      surface: <preset-declared-surface> | null
      design_chunks:
        tokens_file: <abs path to chunks/tokens.css>
        easings_file: <abs path to chunks/easings.js>
        voice_file: <abs path to chunks/voice.md>
        hints_file: <abs path to chunks/composition-hints.md> | null
        type_roles_file: <abs path to chunks/type-roles.md> | null
        motifs_file: <abs path to chunks/motifs.md> | null
        components:
          - <abs path to chunks/components/<id>.html>
          - ...
      creative_brief: |
        <Phase 3 该 scene 的 prose body verbatim>
  ```

  每个 worker 的 Scenes 列表只放 group_spec.groups[i].scene_ids 对应的 scene（1-2 个）；字段从 `group_spec.json.groups[i].scenes[<sid>]` verbatim 抄。`design_chunks` 也是 verbatim 拷贝 —— prep.mjs 已经把 Phase 3 的 `**Components:**` 锚点解析为绝对路径放到 group_spec.json 里。

  **`design_chunks: null`** 表示 Phase 1b 的 `emit-chunks.mjs` 没跑（或 `chunks/index.json` 缺失）—— prep.mjs 已在 anomalies 里报；worker 在 dispatch 里看到 null 时回退到 `./design-system/design.html` 通读模式（每个 worker 多 ~30-90s）。正常流程不应该走到 fallback。

所有 N+1 个 subagent（scene workers + captions）都返回后，跑预飞 harness（`check-compositions.mjs` 自动扫所有 `compositions/*.html`，captions.html 跟 scene 一起被检）：

```bash
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/check-compositions.mjs \
  --hyperframes . \
  --group-spec ./group_spec.json)
```

退出码：

- 0 → 所有 composition 过检（blueprint anomaly 不阻塞），继续 Step 7
- 1 → stderr 给出违规 scene + rule 类别，**回退到 Step 6 重派受影响的 worker**（不要在主 agent 里 Edit 修 —— 修在上游）

### Step 7 — finalize 拼装 + 渲染（Phase 4c）

预飞 0 后，启动 finalize subagent：

- `Agent`（`subagent_type: "general-purpose"`），prompt = `agents/hyperframes-finalize.md` 全文 + `## Dispatch context`：
  ```
  SKILL_DIR: <绝对路径>
  PROJECT_DIR: <视频项目根>
  Step 6 summary: <scene 数> scenes / <worker 数> workers
  Preflight harness: check-compositions.mjs 已在编排器侧通过（这**不代替** Step 3 的 npx hyperframes lint / validate / inspect — 覆盖面不同，三个 gate 必须完整跑）
  Render quality: high  # 或编排器决定 draft / standard
  ```

退出码 / 行为：

- finalize 报告 mp4 路径 + size + duration + quality + lint/validate/inspect/snapshot 各 gate 状态 → 完成
- finalize STOP（预飞 OK 但 lint/validate/inspect/snapshot/render 失败）→ 按 finalize 报告里的根因决定：
  - lint/validate/inspect 结构性 → 重派对应 worker（Step 6 单 scene 重跑）
  - snapshot 显错 scene / 空白 → 改 `index.html` 播放顺序或 worker 资源引用
  - render stderr → 看是否 quality 设错 / asset 缺，必要时再跑

### 完成报告

汇总给用户：

- capture：Final URL、page title、section 数、asset 数、fonts、动画/shader/Lottie/video manifest（如有）
- design-system：build-design.mjs stdout（palette、fonts、preset、components 数）
- story-design：archetype、scene 数、total duration、per-scene 一行摘要
- audio：TTS provider、voice id、BGM enabled/pending、total_duration_s
- visual-design：scene 数、total duration、per-scene 一行摘要
- prep（Phase 4a）：scenes、groups（worker 数）、total_duration_s、每组 scene_ids、assets 复制数、anomalies
- captions（Phase 4a.5）：captions.html 是否生成、groups 数、跨 scene split 数、ALL-CAPS / numeric span 数；或 skipped 原因
- scene workers（Step 6）：worker 数、每个 worker 写的 scene_ids + effects + blueprint 标签、check-compositions 通过/违规/anomaly 计数
- finalize（Step 7）：mp4 路径、字节数、ffprobe duration、quality、lint/validate/inspect/snapshot 状态、任何 `Edit` 修过的 worker 文件

---

## Resume 表

读 `$PROJECT_DIR/context.log`，按以下状态决定从哪里继续：

| 状态                                                                                                        | 从这里继续                                                                                       |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| log 不存在或为空                                                                                            | 完整 pipeline                                                                                    |
| `capture/extracted/tokens.json` 缺失                                                                        | 重跑 Step 1 (capture)                                                                            |
| capture 有，`design-system/design.html` 缺失                                                                | Step 1b (design-system)                                                                          |
| 两个都有，`narrator_scripts.json` 缺失                                                                      | Step 2（story-design）                                                                           |
| `narrator_scripts.json` 有，`audio_meta.json` 缺失                                                          | Step 3（audio）                                                                                  |
| `audio_meta.json` 有，`section_plan.md` 缺失                                                                | Step 4（visual-design）                                                                          |
| `section_plan.md` 有，`group_spec.json` 缺失                                                                | Step 5（prep）                                                                                   |
| `group_spec.json` 有，`compositions/scene_*.html` 缺 / `captions.html` 缺（且 ≥1 scene 有 `wordsPath`）     | Step 5.5+6（同条 message 并行：缺哪个 scene 派 worker，captions.html 缺就同时派 captions agent） |
| 所有 `compositions/scene_*.html` 齐 + captions 状态确定（文件存在或确认 skipped），`renders/video.mp4` 缺失 | Step 7（finalize）                                                                               |
| `renders/video.mp4` 有                                                                                      | 报告已完成，停止                                                                                 |

---

> ❌ Step 5.5+6 的 N+1 个 subagent（N scene worker + 1 captions agent）必须同一条 message 里 fan-out，每个 `run_in_background: true`。先起一个等完成再起另一个 = 串行化反模式（GitHub issue #29181 的默认行为，请刻意对抗）。Step 1 现在是单条 capture（design-system 直接吃 capture 产物，不再并行抓两次）。

---

> 下游 gate 报错回上游修，不在 finalize 里 patch。具体 invariant 见各 agent prompt。
