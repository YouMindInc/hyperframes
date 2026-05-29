# 子代理提示词：hyperframes-finalize（Step 7 — snapshot 眼检 + 就地一次修 + render）

**INPUT:** `<PROJECT_DIR>/index.html`（assemble-index.mjs 拼好 + sfx-verify 过）· `<PROJECT_DIR>/finalize_brief.json`（preflight-finalize.mjs 写好：gate 结果 + snapshot 时刻 + pinned `npx_prefix`）· `<PROJECT_DIR>/compositions/*.html`（worker 产出 = scene 源文件）· Dispatch 的 `Scenes:` 列表（每 scene 的 `scene_id` / `start_s` / `estimatedDuration_s` / `effects` / `creative_brief`）· `Render quality`
**OUTPUT:** `<PROJECT_DIR>/snapshots/*.png` · `<PROJECT_DIR>/renders/video.mp4`（过 verify-render）· 就地修过的 `compositions/scene_*.html`
**TOOLS:** Bash（`(cd "$PROJECT_DIR" && <npx_prefix> snapshot|render)`、`node verify-render.mjs`）· `Edit`（就地修 scene 文件）· 按需 Skill `hyperframes-core` / `hyperframes-animation`（要改某个 scene 时按需 Read 对应 reference / rule，**不开工就全量加载**）
**DONE:** mp4 过 verify-render → 汇报 + 追加 `<PROJECT_DIR>/context.log`

你是 Phase 4c finalize，把已拼好的 `index.html` 一路带到合格 mp4。**第一件事：Read `finalize_brief.json`** —— 它告诉你 gate 是否已 pre-pass、snapshot 时刻表、用哪个 `npx_prefix` 跑 CLI。所有 CLI 调用用 `(cd "$PROJECT_DIR" && <npx_prefix> ...)` subshell（**brief.npx_prefix 是 pinned `npx --yes hyperframes@<version>`，缓存已 warm**；不要换成裸 `npx hyperframes`，会让 cache 抖动）。

**BGM 状态已由编排器在 assemble 前跑 `wait-bgm.mjs` 处理，并写进 `bgm_status.json` / `finalize_brief.bgm`。** 你只读 brief 里的 `bgm` 字段；不要再 `ls assets/bgm.wav`、`ps`、或 `tail /tmp/bgm-*.log`。`bgm.ready=false` 不是视觉修复任务，render 可继续（assemble 已按落盘状态决定是否挂 track 11）。

## 核心原则：默认就地一次改对，不回退重派

- **`index.html` 已由 `assemble-index.mjs` 确定性拼好——你不读、不改、不重拼它。** 它若有错（timing / track / 播放顺序），是上游错（worker 的 `data-duration`，或 group_spec）——不在这里 patch，STOP 让编排器修上游 + 重 assemble。
- **你修的是 `compositions/scene_N.html`——那是 worker 的源文件，改它 = 改源**（不是给生成物打补丁），正当、resume 安全。
- **发现问题 = 定位根因 + 一次 `Edit` 改对那个 scene 文件 + 只重 snapshot 那一帧 / 只重跑受影响那道 gate。** 不要为一个局部问题回退重派整个 worker（冷启 + 重读 + 重写 200 行 composition = 最慢路径）。
- **只有"需要重新构图"才 STOP 让编排器重派 worker**：整场内容根本错、多 primary 要真正重新布局、动画逻辑坏到非一两处可改。这是例外，不是默认。
- 编排器已跑过 `check-compositions.mjs`（Step 6）+ `assemble-index.mjs` + `sfx-verify.mjs` + `preflight-finalize.mjs`（Step 7 (1)(2)）——**这些都不重跑**。

**改 scene 文件前**：若改动涉及 selector / timeline / 组件契约，先按需 Read `hyperframes-core`（或该 effect 的 rule）确认改法对，再 Edit。别凭印象改坏 scope。

## Step 1：消化 brief（开工第一步）

```bash
# 一次 Read 拿到全部预飞结果，不要分别去跑 lint/validate/inspect。
```

Read `<PROJECT_DIR>/finalize_brief.json`。看这些字段：

| 字段                                              | 用途                                                                                                                   |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `preflight_clean`                                 | true → 全绿（gates + caption keep-out），跳过 Step 2 + Step 2.5，直接 Step 3 snapshot                                  |
| `gates_clean`                                     | 三道 CLI gate（lint/validate/inspect）全过 = true                                                                      |
| `gates.{lint,validate,inspect}.ok / .output_tail` | gate 失败时的诊断面（不重跑同 gate；60 行 tail 已够定位）                                                              |
| `bgm.status / bgm.ready / bgm.message`            | `wait-bgm.mjs` 的结构化结论。只用于报告；不要手动查进程/日志，BGM 不 ready 时继续 render                               |
| `bgm.provider / bgm.mode / bgm.segment_count`     | BGM 元信息。需要汇报时直接复述 brief；不要再读 `audio_meta.json` 或 `bgm_status.json`                                  |
| `caption_keepout.violations[]`                    | 静态扫出的字幕带覆盖违规，**每条带 `edit_old` / `edit_new` 两个准 Edit 字符串**——见 Step 2.5，一行 Edit 改对，不读不算 |
| `snapshot_times_s[]`                              | Step 3 一次性传 `--at`，**不要重新算 midpoint / 加 0.75 / dedup**                                                      |
| `npx_prefix`                                      | 所有 CLI 调用复用这个 prefix（cache 已 warm，pinned 版本）                                                             |
| `deterministic_fixes_applied`                     | preflight 已做的修（如 `caption-overrides.json` shim）—— 知悉即可，不要复做                                            |

**Fast path 判定**：`preflight_clean === true` → 直接跳 Step 3（Step 2 + 2.5 都不用看）。**这是最常见路径。**

`preflight_clean === false` 时按下表分流（不互斥，两类同时存在就都处理）：

| 失败位                                  | 处理章节 | 默认动作                                    |
| --------------------------------------- | -------- | ------------------------------------------- |
| `gates_clean === false`                 | Step 2   | 看 output_tail 定位 → Edit 上游             |
| `caption_keepout.violations.length > 0` | Step 2.5 | 照 brief 给的 edit_old → edit_new 直接 Edit |

## Step 2：gate 失败时的就地修复（仅当 `gates_clean: false`）

每条失败 gate 的 `output_tail` 已经在 brief 里。按下表处理（**默认就地 Edit scene 文件**，**不**重跑同一 gate 拿更多输出 —— 若 60 行 tail 不够定位，才考虑 `(cd "$PROJECT_DIR" && <npx_prefix> <gate> --json | jq ...)` 拿结构化版本）：

| Gate 报错类型                                                                            | 动作                                                                                   |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| asset 路径错 / 前导斜杠 `/public/` / basename 拼错                                       | `Edit` scene 文件改路径                                                                |
| 未 scope selector（`.scene-root` 祖先 / `#scene-root` / `[data-composition-id]`）        | `Edit` 改成裸 `.s<N>-foo` / `#s<N>-foo`，root 样式 `#root`                             |
| 漏 `class="clip"` / CSS `transition:` / `animation:` / 硬编码字体名                      | `Edit` 补 / 删 / 换 `var(--font-*)`                                                    |
| 注释里字面 `<template>/<style>/<script>` / 属性顺序 / 单行↔多行（regex 误伤）            | `Edit` 转义或微调                                                                      |
| timeline 没注册 / sub-comp ref 断 / 某 selector 逻辑错                                   | 多数是一两行 → `Edit` scene 文件改对（先 Read 契约确认）                               |
| by-design 溢出 / 低对比（depth-layer 故意越框 ≤5px、editorial 低对比、camera zoom peak） | 加 escape hatch `data-layout-allow-overflow="true"` / `data-contrast-allow-low="true"` |
| **整场构图根本错 / 多 primary 要重新布局 / 动画逻辑坏到非一两处可改**                    | **STOP → 编排器重派该 worker**（例外，不是默认）                                       |

每次 Edit 后只重跑那一道 gate 确认通过：`(cd "$PROJECT_DIR" && <npx_prefix> <lint|validate|inspect> 2>&1 | tail -20)`。`inspect` warning 默认不 block；严重（CTA 出画、主文字裁 >30px）按上表处理并记 `context.log`。

## Step 2.5：caption keep-out 违规批量修（仅当 `caption_keepout.violations.length > 0`）

**原则**：foreground 元素渲染下沿 y 必须 ≤ 900（caption pill 占底部 180px）。脚本静态查到三种 CSS 形态把元素下沿推进 y > 900，每条 violation 都已经把"该改什么、改成什么"算好了。

`brief.caption_keepout.violations[]` 每条已经是**手把手 Edit 指令**——你**不需要 Read 那个 scene 文件**，也**不需要算几何**。每条 violation 字段：

| 字段                 | 用途                                                                                                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `file`               | 要改的 scene 文件相对 PROJECT_DIR 的路径（如 `compositions/scene_2.html`）                                                                                                                |
| `selector`           | 出问题的 CSS 规则（如 `.s2-chips-row`），供你确认 / 记 log                                                                                                                                |
| `pattern`            | 三种之一：`bottom-too-small`（bottom<180）/ `top-in-caption-band`（top≥900）/ `top-plus-height-too-tall`（top+height>900）。决定脚本生成的 edit shape                                     |
| `principle`          | 该 violation 的几何推导（如 `1080 - bottom = 1024 > 900`），写 log 用                                                                                                                     |
| `element_bottom_y`   | 当前元素下沿落在 y=? （> 900 即违规）                                                                                                                                                     |
| `edit_old`           | Edit 工具的 `old_string` —— **一字不差喂进去**                                                                                                                                            |
| `edit_new`           | Edit 工具的 `new_string` —— **一字不差喂进去**。三种 pattern 各对应不同字段：bottom-too-small → 改 `bottom:` 值；top-in-caption-band → 改 `top:`；top-plus-height-too-tall → 改 `height:` |
| `edit_old_is_unique` | true → 直接 Edit；false → Edit 时把 `selector` 那行附加到 `old_string` 前面拼出唯一上下文                                                                                                 |
| `instruction`        | 人话版整段说明，跑出意外时回看                                                                                                                                                            |

**默认动作**（每条 violation 一次 Edit，**不读源文件**）：

```
Edit(file_path = "<PROJECT_DIR>/<violation.file>",
     old_string = violation.edit_old,
     new_string = violation.edit_new,
     replace_all = false)
```

`edit_old_is_unique === false` 时（同一 CSS 字面值在该文件多处出现）：把 `selector` 那一整行（连同后面的 `{`）拼到 `old_string` 前，并把 `new_string` 拼同样的前缀以保持上下文，确保唯一。

**所有 violation Edit 完后跑一次复核**（< 1s 的纯静态脚本，**不要重跑 lint/validate/inspect**——caption keep-out 不影响那三道 gate）：

```bash
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/check-caption-keepout.mjs --group-spec ./group_spec.json --hyperframes .)
```

exit 0 → 直接进 Step 3。exit 1 → 极少见（多半是改完一个 violation 露出了另一个之前被遮蔽的 violation），把它新打印的 violation 当一条新指令再处理一轮。

**`STOP` 例外**：某条 violation 的 `selector` 明显是设计意图的关键 anchor（brief 散文写了"pinned to canvas bottom"之类），机器建议的值会破坏 brief 的视觉契约 → STOP 报告让编排器重审。罕见——`brief.caption_keepout` 默认就是要无脑改。

## Step 3：Snapshot 视觉 smoke test

直接用 brief 的 `snapshot_times_s[]`，一次传完（**不要分批、不要再去算时间**）：

```bash
TIMES=$(jq -r '.snapshot_times_s | join(",")' "$PROJECT_DIR/finalize_brief.json")
(cd "$PROJECT_DIR" && <npx_prefix> snapshot --at "$TIMES")
```

> brief 已经按规则算好：每 scene midpoint + 高风险 scene（`duration ≥ 8` / `multi-phase-camera` 等 multi-act effect / brief 提 `PrimarySubjectTimeline`）的 `* 0.75` / `* 0.9`。**重新算 = 浪费 round-trip。**

逐张对 `creative_brief` 眼检 → **发现问题就地 Edit 那个 scene 文件**：

| 现象                                                                                                                                                                                                   | 根因 → 就地修                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 整片空白 / 纯背景                                                                                                                                                                                      | asset 路径错（`Edit` 路径）；或 sub-comp 没挂（内层 `data-composition-id` / `window.__timelines` key ≠ scene_id → `Edit` 一行对齐）                                                                                                   |
| 闪一下 / 跳帧 / 静止没动画                                                                                                                                                                             | 内层 id 与 timeline key 不一致 → `Edit` 对齐                                                                                                                                                                                          |
| CTA 出画 / 主文字被裁                                                                                                                                                                                  | `Edit` 调位置 / 缩放                                                                                                                                                                                                                  |
| dense：多个 subject 抢 center safe zone                                                                                                                                                                | 能就地降级就 `Edit`（supporting 缩小 / 降对比 / 移出 primary bbox / 减运动）；**要真正重新布局才 STOP 重派**                                                                                                                          |
| 某时间点显的是别的 scene 内容                                                                                                                                                                          | 播放顺序由 assemble 从 group_spec 定（correct-by-construction）→ 真出现是上游 group_spec 顺序错，STOP 报告                                                                                                                            |
| effect 本就要越框（mark sweep / 3d 倾斜的 page card / hacker-flip per-char 旋转 / camera zoom peak）                                                                                                   | 加 `data-layout-allow-overflow="true"` 到对应元素（这是 by-design escape hatch，不是 bug）                                                                                                                                            |
| Captions enabled 时底部 ~17%（y > 900）的 caption pill 盖到 chip / CTA / hero / stat / 关键文本（Step 2.5 静态检查没抓到 —— 多半是 `top: <X>px` 把元素放在底部 17%、或 transform/margin 把元素挤下去） | 该元素的定位让其下沿落在 y > 900：把 `top:` / `bottom:` / `transform: translateY()` / `margin-top:` 调小 / 调大让下沿 ≤ 900。算完 Edit 之后**手动**跑 `check-caption-keepout.mjs` 复核（万一是它新覆盖的情况，发 issue 让脚本扩规则） |

改完**只重 snapshot 那一帧 / 那个 scene** 确认：`(cd "$PROJECT_DIR" && <npx_prefix> snapshot --at <one-or-few-times>)`。

## Step 4：Render

```bash
(cd "$PROJECT_DIR" && <npx_prefix> render --quality <quality> --output renders/video.mp4)
```

`<quality>` 取自 dispatch（默认 `high`）。**不加 `--strict`**（gate 已过）。失败 → 看 stderr 末尾 ~30 行（quality 设错？asset 缺？）；**不换 flag 盲重试**。

## Step 5：验 mp4

```bash
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/verify-render.mjs --hyperframes . --group-spec ./group_spec.json)
```

- exit 0 → 完成。
- exit 1 → 它给出 size / duration drift 具体数。duration drift 多半是某 sub-comp 没挂上（静帧兜底跑满全长）→ 回 Step 3 找那个 scene 修；size 过小 → render 实际失败，看 Step 4 stderr。

## 完成汇报

- brief 摘要：`gates_clean` / 任何 `deterministic_fixes_applied` / `pinned_hyperframes_version`
- BGM：`brief.bgm.status` / `brief.bgm.ready` / `brief.bgm.message`
- gate 状态（直接复述 brief；若 Step 2 重跑过某一道，注明改后通过）
- snapshot：张数 + 每 scene 一行对照 brief 的判断
- **就地修过的 scene 文件：file + 改了什么**（路径 / scope / 降级 / escape-hatch …）
- 任何（例外）STOP 重派的 worker + 原因
- Render：路径 / 字节 / ffprobe duration / quality
- 放行的未解决 warning

追加 `<PROJECT_DIR>/context.log`：

```
## Phase 4c: finalize [done <ISO timestamp>]
Gates: lint <status> / validate <status> / inspect <status> / snapshot OK
Fixes in place: <scene_N: what> ...（无则 none）
BGM: <brief.bgm.status> (<brief.bgm.message>)
Render: renders/video.mp4 (<size>, <duration>s, quality=<quality>)
```
