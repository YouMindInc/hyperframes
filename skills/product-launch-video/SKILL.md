---
name: product-launch-video
description: product-launch video workflow — URL → narrator_scripts.json + audio（voice + BGM）+ section_plan.md。
metadata:
  tags: orchestrator, pipeline, product-launch
---

# product-launch-video — dispatch entry

所有 artifact 都写到 `PROJECT_DIR = videos/<project-name>/`（Step 0 建立）。下表路径都相对 `PROJECT_DIR`。

| Phase               | 执行方式                                                                                                                | Primary artifact                                     | 详细流程                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| init                | Bash 直跑                                                                                                               | `hyperframes.json`                                   | Step 0（本文件）                                           |
| capture             | Bash 直跑 hyperframes capture                                                                                           | `capture/extracted/tokens.json`                      | `phases/capture/guide.md`                                  |
| design-system       | subagent（general-purpose）                                                                                             | `design-system/design.html` + `chunks/`              | `agents/design-system.md`                                  |
| story-design        | subagent（general-purpose）                                                                                             | `narrator_scripts.json`                              | `agents/story-design.md`                                   |
| audio               | Bash 直跑 audio.mjs                                                                                                     | `audio_meta.json`                                    | `phases/audio/guide.md`（脚本即流程）                      |
| visual-design       | subagent（general-purpose）                                                                                             | `section_plan.md`                                    | `agents/visual-design.md`                                  |
| prep                | Bash 直跑 prep.mjs                                                                                                      | `group_spec.json`                                    | `scripts/prep.mjs`（脚本即流程）                           |
| captions（确定性）  | Bash 直跑 captions.mjs group → captions.mjs html（无 subagent）                                                         | `caption_groups.json` + `compositions/captions.html` | `scripts/captions.mjs group` · `scripts/captions.mjs html` |
| scenes              | N×subagent（general-purpose，同条 message 并行）                                                                        | `compositions/scene_*.html`                          | `agents/hyperframes-scene.md`                              |
| finalize (Phase 4c) | Bash 前置（wait-bgm + assemble-index + sfx-verify + preflight）→ 修复型 subagent（snapshot 眼检 + 就地一次修 + render） | `renders/video.mp4`                                  | SKILL.md Step 7 · `agents/hyperframes-finalize.md`         |

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

> `AGENTS.md` / `CLAUDE.md` 只在 `hyperframes init` 时生成一次 —— 上面删一次即够，**后续 capture / build-design / 任何 phase 都不会再生成它们**，不要在后续 Bash 块里重复 `rm`。

**约束**（违反一项后续 phase 会找不到产物 / 触发 lint 报错）：

- 不在 workspace root 跑 `hyperframes init` / 生成 `AGENTS.md` / `CLAUDE.md`
- 不在 `PROJECT_DIR` 下再建 `hyperframes/` 子项目
- 所有 subagent 的 Dispatch context 含一行 `PROJECT_DIR: <path>`；subagent 把它当 project root，Bash 用 `(cd "$PROJECT_DIR" && ...)` subshell
- **cwd 纪律（master 自己也遵守）**：本 skill 所有 Bash 命令一律照抄成 `(cd "$PROJECT_DIR" && ...)` subshell —— **不要即兴改写成裸 `cd "$PROJECT_DIR" && ...`**（裸 `cd` 会改变 shell 持久 cwd，下一条命令的相对路径就漂了，你得 `pwd` 自查再 `cd` 回来，纯属浪费）。subshell 形式让每条命令自带 cwd、互不影响、可乱序复制。

完整目录形态见文末「设计说明 · 目录形态」。各 phase 的产物路径在对应 Step 的命令里已给。

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

- **design-system**（Phase 1b）：派 subagent，`## Dispatch context` 含 `SKILL_DIR` / `PROJECT_DIR` / `Target URL`，并把 Step 1 已产的 `inference.json` 整文 `cat` 进去（`(cd "$PROJECT_DIR" && cat design-system/inference.json)`，~2-4 KB，省 subagent 一次 Read）。选 preset / 裁品牌色 / build-design / emit-chunks 的四步流程归 `agents/design-system.md`，你不必铺开。

- **story-design**（Phase 2）：派 subagent，`## Dispatch context`：
  ```
  SKILL_DIR: <绝对路径>
  PROJECT_DIR: <视频项目根>
  Schema validator: <SKILL_DIR>/scripts/validate.mjs narrator
  Design DNA: ./design-system/inference.json   # 开场读一次 site_dna 定叙事 register（Step 1 确定性产物，不依赖 design-system subagent）
  Script style: 每个 scene 的 script 保持简短——1-2 句话，不超过 20 个词
  ```

> 为什么这俩并行、为什么不互相等：见文末「设计说明 · sibling producer」。真正的 join 点是 Phase 3 visual-design（需 `chunks/index.json` + `narrator_scripts.json` 都就位）。

### Step 3 — 音频（Phase 2.5）

story-design 返回且 `narrator_scripts.json` 存在后即可启动（**只依赖 story-design**；design-system 可能仍在并行跑，audio 不等它）：

```bash
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/audio.mjs \
  --narrator-scripts ./narrator_scripts.json \
  --hyperframes . \
  --out ./audio_meta.json \
  --lyria-recipe <SKILL_DIR>/phases/audio/lyria-recipe.py)
```

**BGM 前置条件**（满足其一则 BGM 后台 detached 生成，否则静默跳过、voice 照常）：`$GOOGLE_API_KEY` + `--lyria-recipe` 存在 → Lyria 云端；否则装了 `transformers torch soundfile numpy` → 本地 MusicGen（首次拉 ~300MB，脚本会在 TTS 跑时后台 pip-install）。BGM 合成机制（种子片 / 循环）+ 全部可选 flags（`--voice` / `--provider` / `--no-bgm` / `--bgm-prompt` / …）见 `audio.mjs` 头。

- exit 0 → voice + transcribe 完成（BGM 可能仍在后台，`audio_meta.json` 记 `bgm_log` / `bgm_pid`），继续。
- exit 1 → 零场景拿到 voice，报告错误，停止。

### Step 4 — 视觉设计（Phase 3）

**join 点**：design-system + story-design 都返回（`design-system/chunks/index.json` + `narrator_scripts.json` 都在）且 audio 完成（`audio_meta.json` 存在）后，把 visual-design 的**全部输入** `cat` 成一个 dispatch packet `/tmp/vd-dispatch.txt` —— subagent Step 0 Read 它**一次**就拿全（catalog / rules / chunks / 故事全在里面），写 plan 前从盘 0 个额外 Read：

```bash
DP=/tmp/vd-dispatch.txt
{
  # 块序刻意：契约在最前、静态参考居中、工作项在最后（见下方说明）
  echo "## Design chunks"
  # 项目级契约（此刻全在盘上；非空 chunk 才存在，cat 自动跳过缺失文件 —— 省去先读 index.json 判 *_file 的两跳）
  (cd "$PROJECT_DIR" && cat design-system/chunks/index.json \
    design-system/chunks/composition-hints.md design-system/chunks/voice.md \
    design-system/chunks/tokens.css design-system/chunks/easings.js 2>/dev/null)
  echo "## Effects catalog";  cat <SKILL_DIR>/phases/visual-design/effects-catalog.md
  echo "## Blueprints index"; cat <SKILL_DIR>/phases/visual-design/blueprints-index.md
  echo "## Design rules";     cat <SKILL_DIR>/phases/visual-design/rules/{typography,color-system,composition,motion-language}.md
  echo "## SFX library";      cat <SKILL_DIR>/assets/sfx/manifest.json
  echo "## Narrator scripts"; (cd "$PROJECT_DIR" && cat narrator_scripts.json)
  echo "## Audio meta";       (cd "$PROJECT_DIR" && cat audio_meta.json 2>/dev/null)   # 可选；用于 Duration >10% 漂移覆盖
} > "$DP"

# Captions 规划提示（单独算、不进 packet，直接填进下方 dispatch 的 Captions: 行）
(cd "$PROJECT_DIR" && node -e 'try{const m=require("./audio_meta.json");process.stdout.write(Object.values(m.scenes||{}).some(s=>s.wordsPath)?"enabled":"disabled")}catch{process.stdout.write("enabled")}')
```

然后启动 visual-design subagent。**给它的 prompt = `cat agents/visual-design.md` 全文 + 下面这段 `## Dispatch context`，原样透传** —— 你（master）不需要预读 / 消化 agent prompt 的内容，照搬即可（流程细节归 subagent 自己读 guide）：

```
SKILL_DIR: <绝对路径>
PROJECT_DIR: <视频项目根>
Schema validator: <SKILL_DIR>/scripts/validate.mjs section
Captions: <enabled | disabled>   # 上面 node -e 算出的规划提示：enabled ⇒ 散文里把关键内容留在上 ~83%、底部 ~17% 当字幕领地（见 guide §4 第 2 条）
Dispatch packet: /tmp/vd-dispatch.txt   # ← Step 0 Read 它一次拿全所有输入；段序见下。Read 它即可，正常不需要再从盘 Read 其他文件
```

here-doc 的段序是刻意的：契约（`## Design chunks`）放最前吃注意力（composition-hints"违反=渲染失败"、voice 须在散文承诺）、静态参考（catalog/blueprints/rules/SFX）居中、工作项（`## Narrator scripts` + `## Audio meta`）放最后。`type-roles.md` 和 component HTML 本体**不进 packet 也不读**（worker 的事）。`Captions:` 行只是乐观规划提示，权威闸由 Step 5 prep 产（详见文末「设计说明 · Captions 闸」）。

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

合并所有上游产物（解析 section_plan 锚点、校验 effect/component id、按 `Continuity` 分组到 cap=2、算 transitions[]、复制 assets/fonts/SFX）为 `group_spec.json`。内部逻辑详见 `prep.mjs` 头注释，你（master）只看退出码：

退出码：

- 0 → 读 stdout（scenes / groups / total duration / 每组 breakdown），追加到 `$PROJECT_DIR/context.log`
- 1 → stderr 给出失败的 scene + anchor，回退到 Step 4 重派 visual-design。**最常见的 fatal**：某对相邻场景请求了 Tier-A（共享元素桥接）过渡，但 cap=2 分组把它们拆到了两个 worker（worker 摸不到彼此 DOM）。修法三选一透传给 visual-design：(a) 该边界改用 Tier-B（如 blur-crossfade）；(b) 让两场都 `Continuity: continue` 以共享 worker；(c) 抬高 `--scenes-per-group`。

### Step 5.5 + Step 6 — Captions（确定性）+ scene workers 并行 fan-out（Phase 4a.5 + 4b）

**Captions 全程无 subagent —— 两个确定性脚本接力**（prep 退 0 后、scene fan-out 前，Bash 直跑，几十毫秒）：

```bash
# (1) 词引擎：whisper 词流 → caption_groups.json（清洗/分组/打 class/全局计时/scene+surface）
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/captions.mjs group \
  --group-spec ./group_spec.json --hyperframes . \
  --tokens design-system/chunks/tokens.css --out ./caption_groups.json)

# (2) HTML 引擎：caption_groups.json + registry 皮肤 → compositions/captions.html（取代旧 captions agent）
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/captions.mjs html \
  --hyperframes . --groups ./caption_groups.json \
  --tokens design-system/chunks/tokens.css \
  --inference design-system/inference.json \
  --out compositions/captions.html)
```

两个脚本**退 0 即正常**：任一打印 `captions: skipped (<reason>)`（无 group_spec / whisper words / tokens.css / caption groups）就跳过整条字幕链——不生成 `captions.html`，assemble 不挂 track-12。skin 选择、注词、token 化、node 自检（失败→退 1 不写出）全在 `captions.mjs html` 头；离线传 `--skin-file`。🔴 **不要**对 captions.html 跑 `npx hyperframes lint <file>`（lint 参数是项目目录，传文件必退 1）；整项目 lint 由 Step 7 覆盖。

然后读 `group_spec.json.groups[]` 得 worker 数 N。**同一条 message** 里并行启动 **N 个 scene worker subagent**（captions 已由上面的脚本产出，**不再是 subagent**）。fan-out 前先读 `group_spec.json.captions_enabled`（prep.mjs 算的单一闸）：`true` 时每个 scene worker 的 dispatch 带 `Captions: enabled`（触发底部 ~17% keep-out）；`false` 时带 `Captions: disabled`（全画幅）。

**两段式 dispatch packet**（和 Step 4 同思路，但 scene worker 是 per-worker 的）：tokens/easings/voice 三份是**项目级全局、每个 worker 一致**，先 `cat` 成一个共享头 `/tmp/scene-shared.txt`（只算一次）；再为**每个** worker 拼一个 `/tmp/scene-dispatch/w<N>.txt` = 共享头 + 该 worker 专属的 per-scene YAML。worker Step 0 Read 自己的 `wN.txt` 一次拿全，省掉每个 worker 各 3 次 Read tokens/easings/voice：

```bash
mkdir -p /tmp/scene-dispatch
# 共享头：三份全局 chunk（每个 worker 都要、内容一致），算一次
(cd "$PROJECT_DIR" && cat design-system/chunks/tokens.css design-system/chunks/easings.js design-system/chunks/voice.md 2>/dev/null) \
  > /tmp/scene-shared.txt
# 再 per-worker：共享头 + 该 worker 的 Scenes YAML（下方模板），写 /tmp/scene-dispatch/w<N>.txt
```

**Scene workers**（每个写 `compositions/scene_<N>.html`）：

- N 个 `Agent`（`subagent_type: "general-purpose"`，每个 `run_in_background: true`）。prompt = `cat agents/hyperframes-scene.md` 全文 + `## Dispatch context`，原样透传。dispatch context 的 top-level：`SKILL_DIR` / `PROJECT_DIR` / `Worker ID` / `Captions: <enabled|disabled>`（= group_spec.captions_enabled）/ `Dispatch packet: /tmp/scene-dispatch/w<N>.txt`，外加 `## Tokens/easings/voice`（共享头三份正文）+ `Scenes:` 列表两段（即 packet 内容）。

  **`Scenes:` 列表逐字段从 `group_spec.json.groups[i].scenes[<sid>]` verbatim 抄**（只放该 worker 的 1-2 个 scene）：`scene_id` / `effects` / `rule_paths` / `assetCandidates` / `estimatedDuration_s` / `voicePath` / `blueprint` / `surface` / `shared_element_bridge`（Tier-A，多数 null）/ `design_chunks`（prep 已把 Components 锚点解析成绝对路径）/ `creative_brief`（Phase 3 该 scene 散文）。字段语义见 `agents/hyperframes-scene.md`。

  **`design_chunks: null`**（emit-chunks 没跑 / index.json 缺）= prep 已在 anomalies 报；worker 看到 null 回退 `./design-system/design.html` 通读（每 worker 多 ~30-90s）。正常不应走到这。

所有 subagent（scene workers + captions）都返回后，跑预飞 harness。注意 `check-compositions.mjs` **只按 `group_spec.json` 的 `scene_ids` 扫 `compositions/scene_*.html`**（跑 scene 专属规则：root div 契约 / component rank 等）——它 **不检 `captions.html`**（captions.html 走 caption agent 自己的 self-lint + 结构 grep + Step 7 finalize 的整项目 lint）：

```bash
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/check-compositions.mjs \
  --hyperframes . \
  --group-spec ./group_spec.json)
# Tier-A 桥接校验（仅当 group_spec.transitions[] 有 tier:"a"；否则 no-op 退 0）：
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/transitions.mjs check-bridge \
  --hyperframes . \
  --group-spec ./group_spec.json)
```

`transitions.mjs check-bridge` 确定性校验每条 Tier-A 桥接出场+进场两场都有同 `data-bridge-id` 元素（写 `bridge_check.json`）；交接姿态的视觉对齐静态查不到，留给 Step 7 finalize 接缝 snapshot 眼检。

退出码（两个脚本同样语义）：

- 0 → 所有 composition 过检（blueprint anomaly 不阻塞），继续 Step 7
- 1 → stderr 给出违规 scene + rule 类别（check-compositions）或缺失/错位的桥接元素（check-bridge-continuity），**回退到 Step 6 重派受影响的 worker**（不要在主 agent 里 Edit 修 —— 修在上游）

### Step 7 — 拼装前置 + 预飞 gate + finalize（Phase 4c）

Step 6 预飞（check-compositions.mjs）退 0 后，编排器先做**确定性 Bash 前置**（wait-bgm + assemble + inject/verify-transitions + sfx-verify + preflight），再派一个**修复型 finalize subagent** 包圆视觉 QA → 就地修 → render。原则：确定性前置全走 Bash；agent 只 snapshot 眼检 + 就地一次改对 + render；不回退重派 worker，除非需重新构图。搬到 Bash 的确定性步骤：BGM 落盘判断、拼装、**场景间过渡注入+复核**、SFX 复核、lint/validate/inspect、caption keep-out 扫描。`compositions/scene_N.html` 是 worker 的源文件，改它 = 改源。

**(1) BGM 等待 + 拼装前置（确定性，Bash 直跑）：**

```bash
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/wait-bgm.mjs \
  --audio-meta ./audio_meta.json \
  --hyperframes . \
  --timeout-ms 120000 \
  --interval-ms 2000)
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/assemble-index.mjs --group-spec ./group_spec.json --hyperframes .)
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/transitions.mjs inject --group-spec ./group_spec.json --hyperframes .)
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/transitions.mjs verify --group-spec ./group_spec.json --index ./index.html)
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/verify-output.mjs sfx --group-spec ./group_spec.json --index ./index.html)
```

这四步全是确定性的，**没有 agent 手写 index.html / 手算 overlap / 手动 `ls bgm.wav`**——内部逻辑见各脚本头（`wait-bgm` 唯一一次 BGM 落盘判断、`assemble-index` 把 group_spec 翻成 index.html 的 track 布局、`inject-transitions` 注入 Tier-B 过渡时**只改 index.html 外壳 `data-start`/`data-duration`/`data-track-index`、从不碰 scene 文件 root**、`verify`/`sfx-verify` 确定性复核）。你只跑命令 + 按下方退出码分流。check-compositions 已在 Step 6 跑过，这里不重跑。

- assemble exit 1 → 它指名某 scene（root `data-duration` ≠ group_spec，或 scene 文件缺）。这是 worker 契约破坏（timing 上游已定死，finalize 改不动）→ **回 Step 6 重派该 worker**，重派后重跑本步。
- inject-transitions / verify-transitions exit 1 → 注入器自身 bug（正常不会，prep 已校验过 transitions[]）→ 报告排查，不回退 worker。
- sfx-verify exit 1 → assembler 自身 bug（正常不会）→ 报告排查。

**(2) 预飞 gate + 计算 snapshot 时刻（确定性，Bash 直跑）：**

```bash
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/preflight-finalize.mjs --group-spec ./group_spec.json --hyperframes .)
```

preflight（**总是 exit 0**，失败靠 brief 报给 finalize、不卡 pipeline）把 agent 不需判断的事一次做完，全写进 `finalize_brief.json`：warm 一个 pinned `npx hyperframes@<version>` cache、用它跑 lint/validate/inspect 抓 tail、算 snapshot 时刻表、（captions_enabled 时）跑 `captions.mjs keepout` 静态查"foreground 下沿 y ≤ 900"。**keep-out 违规会带准 Edit 字符串**（`edit_old`/`edit_new`），finalize 直接 `Edit` 改对、不读源不算几何。brief 字段（`preflight_clean` / `gates_clean` / `gates.*` / `bgm.*` / `caption_keepout.*` / `snapshot_times_s[]` / `npx_prefix` / `scenes[]`）+ 算法细节见 `preflight-finalize.mjs` 头。

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

  index.html 已拼好、gate + caption keep-out 都已跑过、snapshot 时刻已算好。**正常情况（`preflight_clean: true`）**：finalize 跳过 Step 1+2+2.5，直接 snapshot（用 brief 的 `snapshot_times_s` 一次性传 `--at`）→ 眼检 → 就地一次修可视问题 → render（用 brief 的 `npx_prefix`）→ verify-render。**异常情况**：finalize 按 brief 失败位分流——gate 失败 → 看 `output_tail` 定位 + 就地 Edit + 重跑那一道 gate；caption keep-out 违规 → 照 `caption_keepout.violations[].edit_old/edit_new` 直接 Edit（一条一次，不读源文件、不算几何），全部改完跑一次 `captions.mjs keepout` 复核。完整失败处理表 + 眼检清单见 agent prompt。🔴 finalize 就地修 scene 可视问题时**绝不改 scene root 的 `data-duration`**（= group_spec 的 estimatedDuration，timing 上游定死，改了 assemble 交叉校验 fatal）；timing 错只能回 Step 6 重派 worker。

退出码 / 行为：

- finalize 报告 mp4（verify-render 过）+ gate/snapshot 状态 + 就地修过的 scene 文件 → 完成。
- finalize STOP（**仅当**某 scene 需要"重新构图" —— 整场内容根本错 / 多 primary 要真正重新布局 / 动画逻辑坏到非一两处可改）→ 编排器回 Step 6 重派该 worker → **重跑 (1) + (2) 拼装与预飞** → 重派 finalize。这是例外路径，不是默认。

### 完成报告

跑完汇总给用户：每个 phase 的关键产出（capture 的 URL/section/asset 数、preset、archetype、scene 数/总时长、worker 分组、transitions、gate 状态、就地修过的 scene、最终 mp4 路径+字节+时长）。逐 phase 的完整字段清单见文末「设计说明 · 完成报告字段」。

---

## Resume 表

读 `$PROJECT_DIR/context.log`，按以下状态决定从哪里继续：

| 状态                                                                                                        | 从这里继续                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| log 不存在或为空                                                                                            | 完整 pipeline                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `capture/extracted/tokens.json` 缺失                                                                        | 重跑 Step 1（capture + derive-context-pack + `build-design.mjs --no-emit`）                                                                                                                                                                                                                                                                                                                                                         |
| `tokens.json` 有，`design-system/inference.json` 缺失                                                       | 重跑 Step 1 末尾的 `build-design.mjs --no-emit` 一步（确定性，几秒）                                                                                                                                                                                                                                                                                                                                                                |
| `inference.json` 有，`design.html` 缺 **或** `narrator_scripts.json` 缺                                     | Step 1b∥2 并行补缺：`design.html` 缺→派 design-system；`narrator_scripts.json` 缺→派 story-design；两个都缺→同条 message 一起派                                                                                                                                                                                                                                                                                                     |
| `narrator_scripts.json` 有，`audio_meta.json` 缺失                                                          | Step 3（audio）                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `audio_meta.json` 有，`section_plan.md` 缺失                                                                | Step 4（visual-design）                                                                                                                                                                                                                                                                                                                                                                                                             |
| `section_plan.md` 有，`group_spec.json` 缺失                                                                | Step 5（prep）                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `group_spec.json` 有，`compositions/scene_*.html` 缺 **或** captions 链未跑过（`caption_groups.json` 缺）   | Step 5.5+6（先 Bash 跑 `captions.mjs group` → `captions.mjs html` 产 `caption_groups.json` + `captions.html`；再同条 message 并行：缺哪个 scene 派 worker）。**captions 已跑过的判据 = `caption_groups.json` 存在**（无论它产出 `captions.html` 还是合法 skip）—— 不要用 `captions.html` 缺当判据：captions 合法 skip（词被清洗光 / `tokens.css` 缺 / 无 words）时本就不产 `captions.html`，用它当判据会每次 resume 重跑又重 skip。 |
| 所有 `compositions/scene_*.html` 齐 + captions 状态确定（文件存在或确认 skipped），`renders/video.mp4` 缺失 | Step 7：先确定性重跑 assemble-index + sfx-verify + preflight-finalize（即使 `finalize_brief.json` / `index.html` 已存在也覆盖重写——上游 scene 可能改过），再派 finalize subagent                                                                                                                                                                                                                                                    |
| `renders/video.mp4` 有                                                                                      | 报告已完成，停止                                                                                                                                                                                                                                                                                                                                                                                                                    |

---

## 设计说明（给维护者 —— master 执行不必读）

以下是从各 Step 下沉的"为什么"，供改 skill 时参考；执行 pipeline 不依赖本节。

### 目录形态

```text
./                            # workspace root
├── .claude/skills/
├── node_modules/  package.json
└── videos/<project-name>/    # PROJECT_DIR — HyperFrames project root
    ├── hyperframes.json  context.log
    ├── capture/              # hyperframes capture artifacts
    │   ├── extracted/        # tokens / design-styles / animations / fonts-manifest / asset-descriptions / video-manifest / visible-text
    │   ├── assets/           # 媒体 + svgs/ + fonts/ + videos/previews/ + contact sheets
    │   ├── screenshots/      # scroll-*.png + contact-sheet-*.jpg
    │   └── meta.json
    ├── design-system/        # build-design 产物（由 capture 喂养）：inference.json / design.html / chunks/ / fonts/
    ├── narrator_scripts.json  audio_meta.json  section_plan.md  group_spec.json
    ├── public/  assets/  compositions/  snapshots/
    └── renders/video.mp4
```

### sibling producer（Step 1b∥2）

design-system 与 story-design 都 fork 自 capture、**互不读对方输出**，所以同条 message 并行启动。story-design 读的 `inference.json.site_dna` 是 Step 1 Bash 阶段写好的稳定值，design-system 后续用 `--style` 重写 inference.json 不影响它。不要把 story-design 串到 design-system 之后（旧版人为串行，已移除）。

### Captions 闸（Step 4 vs Step 5）

Phase 3 给 visual-design 的 `Captions:` 只是从 audio_meta 算的乐观估计（≥1 scene 有 wordsPath ⇒ enabled，偏向给 plan 留底部字幕带）。权威闸是 Step 5 prep.mjs 产的 `group_spec.captions_enabled`；两者不一致也安全——Step 6/7 的 keep-out 一律以 group_spec 为准。caption skin 来源：preset 自带 `caption-skin.html` 优先，否则按 inference 评分选（详见 captions.mjs html 头）。

### 完成报告字段

逐 phase 可报的完整项（跑完按需取）：

- capture：Final URL / title / section 数 / asset 数 / fonts / 动画·shader·Lottie·video manifest
- design-system：build-design.mjs stdout（palette / fonts / preset / components 数）
- story-design / visual-design：archetype（仅 story）/ scene 数 / total duration / per-scene 一行
- audio：TTS provider / voice id / BGM enabled·pending·provider·mode·log / total_duration_s
- prep：scenes / groups / total_duration_s / 每组 scene_ids / transitions(type·direction·duration·tier) / assets 复制数 / anomalies
- captions：caption_groups.json.stats（groups/words/split）/ 选的皮肤 / 是否生成 captions.html / 自检结果；或 skipped 原因
- scene workers：worker 数 / 每 worker 的 scene_ids·effects·blueprint / check-compositions 通过·违规·anomaly 数
- finalize：wait-bgm 摘要 / assemble 摘要(clips·voice·bgm·captions·sfx 数) / inject-transitions 摘要(每边界 + track 重排) / preflight 摘要(pinned 版本·gates_clean·deterministic fix) / lint·validate·inspect 状态 / snapshot 眼检每 scene + 每 seam 一行 / 就地修过的 scene 文件 / verify-render 的 mp4 路径·字节·ffprobe duration / quality / 任何重派的 worker
