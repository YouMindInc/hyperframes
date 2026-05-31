---
name: product-launch-video
description: product-launch video workflow — URL → narrator_scripts.json + audio（voice + BGM）+ section_plan.md。
metadata:
  tags: orchestrator, pipeline, product-launch
---

# product-launch-video — dispatch entry

所有 artifact 都写到 `PROJECT_DIR = videos/<project-name>/`（Step 0 建立）。下表路径都相对 `PROJECT_DIR`。

| Phase               | 执行方式                                                                                                                | Primary artifact                                     | 详细流程                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| init                | Bash 直跑                                                                                                               | `hyperframes.json`                                   | Step 0（本文件）                                                 |
| capture             | Bash 直跑 hyperframes capture                                                                                           | `capture/extracted/tokens.json`                      | `phases/capture/guide.md`                                        |
| design-system       | subagent（general-purpose）                                                                                             | `design-system/design.html` + `chunks/`              | `agents/design-system.md`                                        |
| story-design        | subagent（general-purpose）                                                                                             | `narrator_scripts.json`                              | `agents/story-design.md`                                         |
| audio               | Bash 直跑 audio.mjs                                                                                                     | `audio_meta.json`                                    | `phases/audio/guide.md`（脚本即流程）                            |
| visual-design       | subagent（general-purpose）                                                                                             | `section_plan.md`                                    | `agents/visual-design.md`                                        |
| prep                | Bash 直跑 prep.mjs                                                                                                      | `group_spec.json`                                    | `scripts/prep.mjs`（脚本即流程）                                 |
| captions（确定性）  | Bash 直跑 build-captions.mjs → build-captions-html.mjs（无 subagent）                                                   | `caption_groups.json` + `compositions/captions.html` | `scripts/build-captions.mjs` · `scripts/build-captions-html.mjs` |
| scenes              | N×subagent（general-purpose，同条 message 并行）                                                                        | `compositions/scene_*.html`                          | `agents/hyperframes-scene.md`                                    |
| finalize (Phase 4c) | Bash 前置（wait-bgm + assemble-index + sfx-verify + preflight）→ 修复型 subagent（snapshot 眼检 + 就地一次修 + render） | `renders/video.mp4`                                  | SKILL.md Step 7 · `agents/hyperframes-finalize.md`               |

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
# 确定性产出 design-system/inference.json（site_dna + preset 评分）。Step 1b（design-system）
# 与 Step 2（story-design）都读它且并行 fork —— 这里先跑，两个 fork 才无生产者依赖。
(cd "$PROJECT_DIR" && node <SKILL_DIR>/phases/design-system/scripts/build-design.mjs ./design-system --no-emit)
```

抓取产物：`capture/extracted/{tokens,design-styles,animations,fonts-manifest,asset-descriptions,video-manifest,visible-text}.{json,md,txt}` + `capture/assets/` + `capture/screenshots/` + `capture/context_pack.md`（derive-context-pack 合成的 LLM brief，Phase 2 / Phase 3 直接读）+ `design-system/inference.json`（`build-design.mjs --no-emit` 的确定性产物：`site_dna` + preset 候选评分；不产 `design.html` / chunks，那是 Step 1b 的事）。

校验：

```bash
[ -s "$PROJECT_DIR/capture/extracted/tokens.json" ] && \
[ -s "$PROJECT_DIR/capture/extracted/design-styles.json" ] && \
[ -s "$PROJECT_DIR/capture/context_pack.md" ] && \
[ -s "$PROJECT_DIR/design-system/inference.json" ] && \
[ -d "$PROJECT_DIR/capture/assets" ] && echo ok || echo missing
```

缺任一 → 报错，停止。`capture/BLOCKED.md` 存在 = 反爬 / 超时，按里面说明排查。

### Step 1b + Step 2 — 视觉系统 ∥ 故事设计（Phase 1b 与 Phase 2 并行 fork）

Step 1 的 Bash 阶段已确定性产出 `design-system/inference.json` 和 `capture/context_pack.md`。这两个 subagent **都只依赖 capture 阶段的产物、互不读对方输出**，所以 capture 退 0 后 **同一条 message 并行启动**（各 `run_in_background: true`）—— 不要串行：

- **design-system**（Phase 1b）：`Agent`（`subagent_type: "general-purpose"`），prompt = `agents/design-system.md` 内容 + `## Dispatch context`（含 `SKILL_DIR`、`PROJECT_DIR`、`Target URL`）。**可选省一次 Read**：把 Step 1 已产的 `inference.json` 整文 `cat` 进 dispatch（`(cd "$PROJECT_DIR" && cat design-system/inference.json)`，~2-4 KB），agent 即可直接用 `confidence` / 候选评分 / `brand.needs_review` 选 preset，无需开工先 Read 它（但 agent 仍需 Read `guide.md` 拿 §1 命令模板 / §3b 截图流程 / §4 报告模板；`brand.needs_review=true` 时仍 Read 截图做视觉判断）。流程：选 preset →（`brand.needs_review=true` 时看截图裁品牌色）→ `build-design.mjs --style <chosen> [--brand-primary <hex>]` → `emit-chunks.mjs`。产 `design.html` + `chunks/`。**不再自己跑 `--no-emit`**（已在 Step 1 跑过；仅 capability auto-install 后需重验时才重跑）。Captions 样式**先看 preset 是否自带** —— 选中的 preset 若在 `style-presets/<preset>/` 放了 `caption-skin.html`，`emit-chunks` 会把它拷进 `chunks/caption-skin.html`，且 design.html 自动多一段 **§C 实时预览**（内嵌该皮肤循环播放）。Step 5.5 的**确定性脚本** `build-captions-html.mjs` 便**优先用它**；否则才按 `inference.json` 评分选 registry `caption-*` 皮肤（已审入 `caption-pill-karaoke`〔默认〕+ `caption-highlight`〔`voice_tone=direct` 时胜出〕;`--skin` 可强制），注入 `caption_groups.json` 的词、tokenize 成 brand-strict 后写 `compositions/captions.html`（分组/计时由 `build-captions.mjs` 先算好；**无 LLM**）。

- **story-design**（Phase 2）：`Agent`（`subagent_type: "general-purpose"`），prompt = `agents/story-design.md` 内容 + `## Dispatch context`：
  ```
  SKILL_DIR: <绝对路径>
  PROJECT_DIR: <视频项目根>
  Schema validator: <SKILL_DIR>/scripts/validate-narrator-scripts.mjs
  Design DNA: ./design-system/inference.json   # 开场读一次 site_dna（voice_tone / material / imagery / page_intent / section_role_counts）定叙事 register；这是 Step 1 的确定性产物，不依赖 design-system subagent —— 故不破坏并行
  Script style: 每个 scene 的 script 保持简短——1-2 句话，不超过 20 个词
  ```

> ⚠️ design-system 与 story-design 是 sibling producer —— 都 fork 自 capture，**互不读对方输出**。不要把 story-design 串到 design-system 之后（旧版"design-system 返回后再启动 story-design"是人为串行，已移除）。story-design 读的 `inference.json.site_dna` 是 Step 1 Bash 阶段写好的稳定值（开场读一次即可），design-system subagent 后续用 `--style` 重写 inference.json 不影响它。Phase 3 visual-design 才是真正 join 点（需 `chunks/index.json` + `narrator_scripts.json` 都就位）。

### Step 3 — 音频（Phase 2.5）

story-design 返回且 `narrator_scripts.json` 存在后即可启动（**只依赖 story-design**；design-system 可能仍在并行跑，audio 不等它）：

```bash
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/audio.mjs \
  --narrator-scripts ./narrator_scripts.json \
  --hyperframes . \
  --out ./audio_meta.json \
  --lyria-recipe <SKILL_DIR>/phases/audio/lyria-recipe.py)
```

**BGM 前置条件**（满足其一即可，否则 BGM 静默跳过，voice 照常生成）：

- `$GOOGLE_API_KEY` 已设置 + `--lyria-recipe` 路径存在 → Lyria 云端生成（detached，后台运行）
- `pip install transformers torch soundfile numpy` 已装（本地，免费）→ MusicGen via HuggingFace transformers 本地生成（首次运行下载 ~300MB 模型）。脚本会在 TTS 跑的同时后台 pip-install 缺失的包；**本地 MusicGen 单次生成一条 ~28s 种子片，再裁切（目标更短）或 crossfade 循环平铺（目标更长）到 TTS 实测总时长，合成一个 `assets/bgm.wav`**，控制在模型 ~30s 位置编码上限内、且循环无硬接缝。

可选 flags（默认不需要）：

- `--voice <id>` — 默认 HeyGen `1bd001e7e50f421d891986aad5158bc8` / ElevenLabs `21m00Tcm4TlvDq8ikWAM` / Kokoro `am_michael`
- `--provider heygen|elevenlabs|kokoro` — 强制 TTS provider（不传 = 按 env 自动选）
- `--no-bgm` — 跳过 BGM
- `--bgm-prompt "<text>"` — 覆盖自动推断的 BGM mood
- `--bgm-seed-seconds <n>` — 本地 MusicGen 种子片长度（默认 28，夹在 10-30；一般不用改）

exit 0 → voice + transcribe 完成（BGM 可能仍在后台渲染，`audio_meta.json` 会记录 `bgm_log` / `bgm_pid` / 种子+循环信息），继续。
exit 1 → 零场景拿到 voice，报告错误，停止。

### Step 4 — 视觉设计（Phase 3）

**join 点**：design-system + story-design 都返回（`design-system/chunks/index.json` + `narrator_scripts.json` 都在）且 audio 完成（`audio_meta.json` 存在）后，把 visual-design 的**全部输入**一次性 `cat` 进 dispatch —— subagent 写 plan 前 **0 个 Read**（catalog / rules / chunks / 故事全内联；Read 仅作兜底）：

```bash
# 静态目录（每次都一样）
cat <SKILL_DIR>/phases/visual-design/effects-catalog.md
cat <SKILL_DIR>/phases/visual-design/blueprints-index.md
cat <SKILL_DIR>/assets/sfx/manifest.json
cat <SKILL_DIR>/phases/visual-design/rules/{typography,color-system,composition,motion-language}.md
# 项目级输入（此刻全在盘上；非空 chunk 才存在，cat 自动跳过缺失文件 —— 省去先读 index.json 判 *_file 的两跳）
(cd "$PROJECT_DIR" && cat design-system/chunks/index.json \
  design-system/chunks/composition-hints.md design-system/chunks/voice.md \
  design-system/chunks/tokens.css design-system/chunks/easings.js 2>/dev/null)
(cd "$PROJECT_DIR" && cat narrator_scripts.json)
(cd "$PROJECT_DIR" && cat audio_meta.json 2>/dev/null)   # 可选；用于 Duration >10% 漂移覆盖
# Captions 闸：从 audio_meta 算（≥1 scene 有 wordsPath ⇒ 会有字幕）。group_spec.captions_enabled
# 是 Step 5 prep.mjs 才产的权威闸；Phase 3 此刻没有它，所以这里先算一个规划提示透传给 plan agent。
(cd "$PROJECT_DIR" && node -e 'try{const m=require("./audio_meta.json");process.stdout.write(Object.values(m.scenes||{}).some(s=>s.wordsPath)?"enabled":"disabled")}catch{process.stdout.write("enabled")}')
```

然后启动 visual-design subagent：

- visual-design：`Agent`（`subagent_type: "general-purpose"`），prompt = `agents/visual-design.md` 内容 + `## Dispatch context`：
  ```
  SKILL_DIR: <绝对路径>
  PROJECT_DIR: <视频项目根>
  Schema validator: <SKILL_DIR>/scripts/validate-section-plan.mjs
  Captions: <enabled | disabled>   # 上面 node -e 算出的规划提示：enabled ⇒ 散文里把关键内容留在上 ~83%、底部 ~17% 当字幕领地（见 guide §4 第 2 条）。prep.mjs 在 Step 5 会重算权威闸 group_spec.captions_enabled
  ## Design chunks      # ← 契约放最前（高注意力位）：composition-hints 是"违反=渲染失败"、voice 必须在散文承诺、index.json 的 surface/avoids 决定挑 component
  <chunks/index.json 全文 + 实际存在的 composition-hints.md / voice.md / tokens.css / easings.js（null 的不会出现）—— preset 视觉契约 + 品牌 token；agent 据此挑 component / surface / 承诺 voice register>
  ## Effects catalog    # ← 以下为静态参考（查表用，放中段无妨）
  <effects-catalog.md 全文>
  ## Blueprints index
  <blueprints-index.md 全文>
  ## Design rules
  <typography / color-system / composition / motion-language 四个 rules/*.md 全文 —— 设计判断的角色/意图目录，静态>
  ## SFX library
  <manifest.json 全文 —— SFX 可选；列出每条 file / duration / 用途>
  ## Narrator scripts   # ← 工作项放最后（recency：动手那刻最新鲜）
  <narrator_scripts.json 全文 —— 每 scene 的 narrativeIntent / transition / assetCandidates / estimatedDuration + 顶层 archetype + emotionalArc>
  ## Audio meta
  <audio_meta.json 全文（若存在）—— scenes[].duration_s；与 estimatedDuration 相差 >10% 时 Duration 锚点用它>
  ```
  **块序刻意**：契约（`## Design chunks`）放最前不被埋、静态参考居中、工作项（`## Narrator scripts`）放最后吃 recency。以上输入全部内联，subagent **不再从盘 Read**（Read 仅在内联意外缺失时兜底）；`type-roles.md` 和 component HTML 本体**不内联也不读**（worker 的事）。agent 动笔前先复述契约（见 `agents/visual-design.md` 与 guide §4 第 0 步）。

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
4. 解析 `section_plan.md` 的 anchors：必选 Effects / Duration / Continuity，可选 Blueprint / Components / Surface / **Transition** / **SFX**
5. 校验每个 effect id 都对应 `hyperframes-animation/rules/<id>.md` 存在
6. 解析 `design-system/chunks/index.json` —— 把 Components 锚点引用的 component id 解析为绝对路径；id 不在 index.json 中 → fatal 退出
7. 合并 `audio_meta.json` —— `voiceDuration` 覆盖 section_plan duration（差 >10% 时）
8. 按 `Continuity` 分组（`break` 开新 worker、`continue` 续到 cap=2）
9. **Transitions**：每相邻场景对生成一条 `group_spec.transitions[]`（`from`/`to`/`type`/`direction`/`duration_s`/`tier`/`is_break`）。`is_break` 从**分组**取（不同 worker_id），不是从 Continuity 锚点重读 —— 分组才是 worker 隔离的权威。`**Transition:**` 锚点缺失时按注册表默认推导（surface 冲突→`blur-crossfade`、HIGH energy→`zoom-through`、CALM→`blur-crossfade`、否则 `crossfade`）。`tier:"a"`（共享元素桥接）只在 same-worker 且锚点显式命名 Tier-A 类型时给；若 cap 把这种对拆到两 worker → **fatal**，给三种修法
10. **SFX**：复制 `<sfxLibDir>/*.mp3` + `manifest.json` 到 `assets/sfx/`，校验每条 cue 文件存在于 manifest，把 scene-local `t` 加 `start_s` offset 转全局秒数，写入 `group_spec.sfx[]`（flat list 按 t 排序）
11. 写 `./group_spec.json` + stdout summary（含每 scene 的 design_chunks 块、transitions、SFX 条数）

退出码：

- 0 → 读 stdout（scenes / groups / total duration / 每组 breakdown），追加到 `$PROJECT_DIR/context.log`
- 1 → stderr 给出失败的 scene + anchor，回退到 Step 4 重派 visual-design

### Step 5.5 + Step 6 — Captions（确定性）+ scene workers 并行 fan-out（Phase 4a.5 + 4b）

**Captions 全程无 subagent —— 两个确定性脚本接力**（prep 退 0 后、scene fan-out 前，Bash 直跑，几十毫秒）：

```bash
# (1) 词引擎：whisper 词流 → caption_groups.json（清洗/分组/打 class/全局计时/scene+surface）
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/build-captions.mjs \
  --group-spec ./group_spec.json --hyperframes . \
  --tokens design-system/chunks/tokens.css --out ./caption_groups.json)

# (2) HTML 引擎：caption_groups.json + registry 皮肤 → compositions/captions.html（取代旧 captions agent）
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/build-captions-html.mjs \
  --hyperframes . --groups ./caption_groups.json \
  --tokens design-system/chunks/tokens.css \
  --inference design-system/inference.json \
  --out compositions/captions.html)
```

两个脚本都**退 0 即正常**：任一打印 `captions: skipped (<reason>)`（无 group_spec / 无 whisper words / 无 tokens.css / 无 caption groups）时直接跳过整条字幕链 —— 不生成 `captions.html`，assemble-index 不挂 track-12。`build-captions-html.mjs` 内部已做 skin 选择（**先看 `chunks/caption-skin.html` 在否:在 → 用 preset 自带皮肤〔通用填充:注 GROUPS/DURATION/tokens〕;否则**按 `inference.json` 评分:`caption-pill-karaoke` 默认 / `caption-highlight` 当 `voice_tone=direct`;`--skin <name>` 仍可强制 registry 皮肤）+ 注词 + brand token 化 + **node 结构自检**（取代旧浏览器 self-lint）；自检失败 → 退 1、不写出 captions.html。**不要**对 captions.html 跑 `npx hyperframes lint <file>`（lint 参数是项目目录，传文件必退 1）；整项目 lint 由 Step 7 覆盖。

> 离线/CI：`build-captions-html.mjs` 默认 `npx hyperframes add caption-<skin>` 拉皮肤；无网时传 `--skin-file <已下载皮肤路径>`。

然后读 `group_spec.json.groups[]` 得 worker 数 N。**同一条 message** 里并行启动 **N 个 scene worker subagent**（captions 已由上面的脚本产出，**不再是 subagent**）。fan-out 前先读 `group_spec.json.captions_enabled`（prep.mjs 算的单一闸）：`true` 时每个 scene worker 的 dispatch 带 `Captions: enabled`（触发底部 ~17% keep-out）；`false` 时带 `Captions: disabled`（全画幅）。

fan-out 前先 `cat` 一次三个**项目级全局、每场相同**的 chunk（每个 worker 都要、内容一致），把正文内联进**每个** worker 的 dispatch（像 Step 4 visual-design 那样），省掉每个 worker 各 3 次 Read：

```bash
(cd "$PROJECT_DIR" && cat design-system/chunks/tokens.css design-system/chunks/easings.js design-system/chunks/voice.md 2>/dev/null)
```

**Scene workers**（每个写 `compositions/scene_<N>.html`）：

- N 个 `Agent`（`subagent_type: "general-purpose"`，每个 `run_in_background: true`），prompt = `agents/hyperframes-scene.md` 全文 + `## Dispatch context`：

  ```
  SKILL_DIR: <绝对路径>
  PROJECT_DIR: <视频项目根>
  Worker ID: <w1 / w2 / ...>
  Captions: <enabled | disabled>   # = group_spec.captions_enabled；enabled ⇒ 前景留上 ~83%、底部 ~17%（y 900–1080）字幕带保留（约束 #13）
  Design chunks dir: ./design-system/chunks/  # 若 design_chunks: null（chunks 缺失），回退到 ./design-system/design.html
  ## Tokens/easings/voice (inline)   # ← 上面 cat 的三份正文，每个 worker 一致；worker 优先用这里、不再 Read tokens_file/easings_file/voice_file
  <tokens.css 全文 + easings.js 全文 + voice.md 全文（缺失则该段空，worker 回退 Read 对应 *_file）>
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
        components:
          - <abs path to chunks/components/<id>.html>
          - ...
      creative_brief: |
        <Phase 3 该 scene 的 prose body verbatim>
  ```

  每个 worker 的 Scenes 列表只放 group_spec.groups[i].scene_ids 对应的 scene（1-2 个）；字段从 `group_spec.json.groups[i].scenes[<sid>]` verbatim 抄。`design_chunks` 也是 verbatim 拷贝 —— prep.mjs 已经把 Phase 3 的 `**Components:**` 锚点解析为绝对路径放到 group_spec.json 里。

  **`design_chunks: null`** 表示 Phase 1b 的 `emit-chunks.mjs` 没跑（或 `chunks/index.json` 缺失）—— prep.mjs 已在 anomalies 里报；worker 在 dispatch 里看到 null 时回退到 `./design-system/design.html` 通读模式（每个 worker 多 ~30-90s）。正常流程不应该走到 fallback。

所有 subagent（scene workers + captions）都返回后，跑预飞 harness。注意 `check-compositions.mjs` **只按 `group_spec.json` 的 `scene_ids` 扫 `compositions/scene_*.html`**（跑 scene 专属规则：root div 契约 / component rank 等）——它 **不检 `captions.html`**（captions.html 走 caption agent 自己的 self-lint + 结构 grep + Step 7 finalize 的整项目 lint）：

```bash
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/check-compositions.mjs \
  --hyperframes . \
  --group-spec ./group_spec.json)
```

退出码：

- 0 → 所有 composition 过检（blueprint anomaly 不阻塞），继续 Step 7
- 1 → stderr 给出违规 scene + rule 类别，**回退到 Step 6 重派受影响的 worker**（不要在主 agent 里 Edit 修 —— 修在上游）

### Step 7 — 拼装前置 + 预飞 gate + finalize（Phase 4c）

Step 6 预飞（check-compositions.mjs）退 0 后，编排器先做**确定性 Bash 前置**（wait-bgm + assemble + inject/verify-transitions + sfx-verify + preflight），再派一个**修复型 finalize subagent** 包圆视觉 QA → 就地修 → render。设计取舍：能确定性做的都不要让 agent 做 —— BGM 落盘判断、拼装、**场景间过渡注入+复核**、SFX 复核、lint/validate/inspect、caption keep-out 扫描都搬到 Bash；agent 只负责 snapshot 眼检 + 就地一次改对 + render。`compositions/scene_N.html` 是 worker 的源文件，改它 = 改源；**不**回退重派 worker（重派 = 冷启 + 重读 + 重写 200 行 = 最慢路径，只留给"需重新构图"的例外）。

**(1) BGM 等待 + 拼装前置（确定性，Bash 直跑）：**

```bash
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/wait-bgm.mjs \
  --audio-meta ./audio_meta.json \
  --hyperframes . \
  --timeout-ms 120000 \
  --interval-ms 2000)
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/assemble-index.mjs --group-spec ./group_spec.json --hyperframes .)
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/inject-transitions.mjs --group-spec ./group_spec.json --hyperframes .)
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/verify-transitions.mjs --group-spec ./group_spec.json --index ./index.html)
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/sfx-verify.mjs --group-spec ./group_spec.json --index ./index.html)
```

`wait-bgm.mjs` 读 `audio_meta.json`，在 assemble 前做唯一一次 BGM harness：若 `assets/bgm.wav` 已落盘 → 写 `bgm_status.json {status:"ready"}`；若后台进程报错 / 退出无文件 / 超时 → 写结构化原因但 exit 0，assemble 会自然跳过 BGM。**agent 不再手动 `ls assets/bgm.wav` / `ps` / `tail /tmp/bgm-*.log`。** assemble 把 group_spec 翻成 `index.html`：scene clip(track 0) / voice(10) / BGM(11) / captions(12) / SFX(20+i)，`start_s` 预算好、track 不撞、BGM volume 按有无人声选、`@font-face` 注入 `<head>`、scene clip 的 `data-composition-id` 对内层 id、根尺寸固定 1920×1080、BGM/captions 落盘检查内建、`caption-overrides.json` 空 `[]` shim 顺便写好（captions runtime 找不到这文件会让 validate 报 ✗）。**没有 agent 手写 index.html**；SFX correct-by-construction，sfx-verify 是确定性复核。check-compositions.mjs 已在 Step 6 跑过，**这里不重跑**。

`inject-transitions.mjs` 读 `group_spec.json.transitions[]`（prep 算的，每相邻场景对一条；`tier:"b"` = `break` 边界的通用过渡），在 assemble 之后**确定性注入**场景间过渡到 `index.html`：把出场 clip 外壳 `data-duration` 延长 `duration_s`（hold 住最后一帧）、所有 scene clip 的 `data-track-index` 做 0/1 乒乓重排（相邻重叠的两层永不同 track —— 否则 lint `overlapping_clips_same_track` fatal）、把 `TRANSITION-REGISTRY.md` 的 GSAP 模板 stamp 到 `window.__timelines["main"]`。**只动外壳 `data-start`/`data-duration`/`data-track-index`，从不碰 scene 文件 root，也不碰任何 `data-start`（voice/SFX/captions 同步不受影响）。** `verify-transitions.mjs` 是确定性复核：每条 `tier:"b"` 的外壳重叠 == `duration_s`、重叠两层不同 track、tween 引用两个外壳 id、全局无同 track 重叠。**agent 不写过渡 GSAP、不手算 overlap/track。** 单场景或注册表缺失时两脚本都 no-op 退 0。

- assemble exit 1 → 它指名某 scene（root `data-duration` ≠ group_spec，或 scene 文件缺）。这是 worker 契约破坏（timing 上游已定死，finalize 改不动）→ **回 Step 6 重派该 worker**，重派后重跑本步。
- inject-transitions / verify-transitions exit 1 → 注入器自身 bug（正常不会，prep 已校验过 transitions[]）→ 报告排查，不回退 worker。
- sfx-verify exit 1 → assembler 自身 bug（正常不会）→ 报告排查。

**(2) 预飞 gate + 计算 snapshot 时刻（确定性，Bash 直跑）：**

```bash
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/preflight-finalize.mjs --group-spec ./group_spec.json --hyperframes .)
```

preflight 做五件 agent 不需要判断的事：① 从 `PROJECT_DIR/package.json` 读出 `hyperframes` 版本，用 `npx --yes hyperframes@<version> --version` 一次性 warm npx cache（消除"Missing module"类的缓存抖动 + 让后续 CLI 调用全部命中 warm cache）；② 用同一个 pinned `npx --yes hyperframes@<version>` 跑 `lint` / `validate` / `inspect`，捕获 tail；③ 从 `group_spec.json` 算出 snapshot 时刻表（每 scene midpoint + multi-act effect / `estimatedDuration_s ≥ 8` / `PrimarySubjectTimeline` 时加 `* 0.75` 与 `* 0.9`，去重升序）；④ **跑 `check-caption-keepout.mjs`**（仅当 `group_spec.captions_enabled === true`）—— 静态扫每个 `compositions/scene_*.html`，落实**"foreground 元素渲染下沿 y ≤ 900"**这条原则。覆盖三种静态可查的 CSS 形态：(A) `position: absolute` + `bottom: <X>px` (X<180)；(B) `position: absolute` + `top: <X>px` (X≥900)；(C) `position: absolute` + `top + height` 静态可加和 > 900。leaf class 名在装饰类白名单（`bg`/`dot-grid`/`deco`/`pin`/`star-burst` 等，详见脚本 `DECORATION_NAME_RX`）的全部豁免。每条违规生成**准 Edit 字符串**（`edit_old` / `edit_new` + `pattern` 标签），finalize agent 直接 `Edit(file, edit_old, edit_new)` 改对、不用 Read 不用算几何；⑤ 把全部结果写 `finalize_brief.json`：`preflight_clean` / `gates_clean` / `gates.{lint,validate,inspect}.{ok, output_tail}` / `bgm.{status,ready,message,provider,mode,loop_count}` / `caption_keepout.{enabled, violations[], scenes_scanned}` / `snapshot_times_s[]` / `npx_prefix` / `scenes[]`。**总是 exit 0**（gate / keep-out 失败都靠 brief 报给下游 agent，preflight 不卡 pipeline）。

**(3) 派 finalize subagent（修复型 —— snapshot 眼检 + 就地一次修 + render）：**

- `Agent`（`subagent_type: "general-purpose"`），prompt = `agents/hyperframes-finalize.md` 全文 + `## Dispatch context`：

  ```
  SKILL_DIR: <绝对路径>
  PROJECT_DIR: <视频项目根>
  Render quality: high     # 或编排器决定 draft / standard
  Finalize brief: <PROJECT_DIR>/finalize_brief.json   # ← preflight 已写好；agent Read 一次拿到 gate 结果 + npx_prefix + snapshot_times_s
  Scenes:                  # 每 scene 一行，从 group_spec.json verbatim（供眼检对照 + 定位要修的 scene 文件）
    - { scene_id, start_s, estimatedDuration_s, effects: [...], creative_brief: |
        <Phase 3 该 scene 的散文> }
  ```

  index.html 已拼好、gate + caption keep-out 都已跑过、snapshot 时刻已算好。**正常情况（`preflight_clean: true`）**：finalize 跳过 Step 1+2+2.5，直接 snapshot（用 brief 的 `snapshot_times_s` 一次性传 `--at`）→ 眼检 → 就地一次修可视问题 → render（用 brief 的 `npx_prefix`）→ verify-render。**异常情况**：finalize 按 brief 失败位分流——gate 失败 → 看 `output_tail` 定位 + 就地 Edit + 重跑那一道 gate；caption keep-out 违规 → 照 `caption_keepout.violations[].edit_old/edit_new` 直接 Edit（一条一次，不读源文件、不算几何），全部改完跑一次 `check-caption-keepout.mjs` 复核。完整失败处理表 + 眼检清单见 agent prompt。

退出码 / 行为：

- finalize 报告 mp4（verify-render 过）+ gate/snapshot 状态 + 就地修过的 scene 文件 → 完成。
- finalize STOP（**仅当**某 scene 需要"重新构图" —— 整场内容根本错 / 多 primary 要真正重新布局 / 动画逻辑坏到非一两处可改）→ 编排器回 Step 6 重派该 worker → **重跑 (1) + (2) 拼装与预飞** → 重派 finalize。这是例外路径，不是默认。

### 完成报告

汇总给用户：

- capture：Final URL、page title、section 数、asset 数、fonts、动画/shader/Lottie/video manifest（如有）
- design-system：build-design.mjs stdout（palette、fonts、preset、components 数）
- story-design：archetype、scene 数、total duration、per-scene 一行摘要
- audio：TTS provider、voice id、BGM enabled/pending、BGM provider/mode/log/segment count、total_duration_s
- visual-design：scene 数、total duration、per-scene 一行摘要
- prep（Phase 4a）：scenes、groups（worker 数）、total_duration_s、每组 scene_ids、**transitions（每边界 type/direction/duration + tier）**、assets 复制数、anomalies
- captions（Phase 4a.5）：build-captions.mjs 的 groups/words/split 统计（`caption_groups.json.stats`）；build-captions-html.mjs 选的皮肤 `caption-<x>`、是否生成 captions.html、self-lint 结果；或 skipped 原因
- scene workers（Step 6）：worker 数、每个 worker 写的 scene_ids + effects + blueprint 标签、check-compositions 通过/违规/anomaly 计数
- finalize（Step 7，Phase 4c）：wait-bgm 摘要（ready/failed/timeout + message）、assemble-index 摘要（clips/voice/bgm/captions/sfx 计数）、**inject-transitions 摘要（每边界 type/direction/duration + track 重排）+ verify-transitions 通过**、preflight 摘要（pinned hyperframes 版本 / gates_clean / 任何 deterministic fix）、lint/validate/inspect 状态、snapshot 眼检每 scene 一行 **+ 每个过渡 seam 一行**、**就地修过的 scene 文件（file + 改了什么）**、verify-render 的 mp4 路径 + 字节数 + ffprobe duration、quality、任何（例外）重派的 worker

---

## Resume 表

读 `$PROJECT_DIR/context.log`，按以下状态决定从哪里继续：

| 状态                                                                                                        | 从这里继续                                                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| log 不存在或为空                                                                                            | 完整 pipeline                                                                                                                                                                    |
| `capture/extracted/tokens.json` 缺失                                                                        | 重跑 Step 1（capture + derive-context-pack + `build-design.mjs --no-emit`）                                                                                                      |
| `tokens.json` 有，`design-system/inference.json` 缺失                                                       | 重跑 Step 1 末尾的 `build-design.mjs --no-emit` 一步（确定性，几秒）                                                                                                             |
| `inference.json` 有，`design.html` 缺 **或** `narrator_scripts.json` 缺                                     | Step 1b∥2 并行补缺：`design.html` 缺→派 design-system；`narrator_scripts.json` 缺→派 story-design；两个都缺→同条 message 一起派                                                  |
| `narrator_scripts.json` 有，`audio_meta.json` 缺失                                                          | Step 3（audio）                                                                                                                                                                  |
| `audio_meta.json` 有，`section_plan.md` 缺失                                                                | Step 4（visual-design）                                                                                                                                                          |
| `section_plan.md` 有，`group_spec.json` 缺失                                                                | Step 5（prep）                                                                                                                                                                   |
| `group_spec.json` 有，`compositions/scene_*.html` 缺 / `captions.html` 缺（且 ≥1 scene 有 `wordsPath`）     | Step 5.5+6（先 Bash 跑 `build-captions.mjs` → `build-captions-html.mjs` 产 `caption_groups.json` + `captions.html`；再同条 message 并行：缺哪个 scene 派 worker）                |
| 所有 `compositions/scene_*.html` 齐 + captions 状态确定（文件存在或确认 skipped），`renders/video.mp4` 缺失 | Step 7：先确定性重跑 assemble-index + sfx-verify + preflight-finalize（即使 `finalize_brief.json` / `index.html` 已存在也覆盖重写——上游 scene 可能改过），再派 finalize subagent |
| `renders/video.mp4` 有                                                                                      | 报告已完成，停止                                                                                                                                                                 |

---

> ❌ Step 6 的 N 个 scene worker subagent 必须同一条 message 里 fan-out，每个 `run_in_background: true`。先起一个等完成再起另一个 = 串行化反模式（GitHub issue #29181 的默认行为，请刻意对抗）。Captions 在 fan-out 之前由 Bash 脚本（build-captions.mjs → build-captions-html.mjs）确定性产出，**不占 subagent**。Step 1 现在是单条 capture（design-system 直接吃 capture 产物，不再并行抓两次），并在尾部确定性跑 `build-design.mjs --no-emit` 产出 `inference.json`。Step 1b（design-system）与 Step 2（story-design）随后在 capture 退 0 后**同条 message 并行 fork**（见 Step 1b+2）——两者都 fork 自 capture、互不读对方输出，旧版的"design-system 返回后再启动 story-design"串行已移除。

---

> 下游 gate 报错回上游修，不在 finalize 里 patch。具体 invariant 见各 agent prompt。
