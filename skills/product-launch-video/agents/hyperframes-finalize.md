# 子代理提示词：hyperframes-finalize（Step 7 — gate + 视觉 QA + 就地一次修 + render）

**INPUT:** `<PROJECT_DIR>/index.html`（编排器已用 assemble-index.mjs 拼好 + sfx-verify 过）· `<PROJECT_DIR>/compositions/*.html`（worker 产出 = scene 源文件）· Dispatch 的 `Scenes:` 列表（每 scene 的 `scene_id` / `start_s` / `estimatedDuration_s` / `effects` / `creative_brief`）· `Render quality`
**OUTPUT:** `<PROJECT_DIR>/snapshots/*.png` · `<PROJECT_DIR>/renders/video.mp4`（过 verify-render）· 就地修过的 `compositions/scene_*.html`
**TOOLS:** Bash（`(cd "$PROJECT_DIR" && npx hyperframes lint|validate|inspect|snapshot|render)`、`node verify-render.mjs`）· `Edit`（就地修 scene 文件）· 按需 Skill `hyperframes-core` / `hyperframes-animation`（要改某个 scene 时按需 Read 对应 reference / rule，**不开工就全量加载**）
**DONE:** mp4 过 verify-render → 汇报 + 追加 `<PROJECT_DIR>/context.log`

你是 Phase 4c finalize，把已拼好的 `index.html` 一路带到合格 mp4。所有 CLI 调用用 `(cd "$PROJECT_DIR" && npx hyperframes ...)` subshell。

## 核心原则：默认就地一次改对，不回退重派

- **`index.html` 已由 `assemble-index.mjs` 确定性拼好——你不读、不改、不重拼它。** 它若有错（timing / track / 播放顺序），是上游错（worker 的 `data-duration`，或 group_spec）——不在这里 patch，STOP 让编排器修上游 + 重 assemble。
- **你修的是 `compositions/scene_N.html`——那是 worker 的源文件，改它 = 改源**（不是给生成物打补丁），正当、resume 安全。
- **发现问题 = 定位根因 + 一次 `Edit` 改对那个 scene 文件 + 只重跑受影响的那道 gate / 重 snapshot 那一帧。** 不要为一个局部问题回退重派整个 worker（冷启 + 重读一堆文件 + 重写 200 行 composition = 最慢路径）。
- **只有"需要重新构图"才 STOP 让编排器重派 worker**：整场内容根本错、多 primary 要真正重新布局、动画逻辑坏到非一两处可改。这是例外，不是默认。
- 编排器已跑过 `check-compositions.mjs`（Step 6）——**不重跑**；它已 assemble + sfx-verify——**不重做**。

**改 scene 文件前**：若改动涉及 selector / timeline / 组件契约，先按需 Read `hyperframes-core`（或该 effect 的 rule）确认改法对，再 Edit。别凭印象改坏 scope。

## Step 1：三道 gate（顺序，首错即停）

```bash
(cd "$PROJECT_DIR" && npx hyperframes lint)
(cd "$PROJECT_DIR" && npx hyperframes validate)
(cd "$PROJECT_DIR" && npx hyperframes inspect)
```

失败先拿结构化输出，**不凭目测**（linter 是正则扫，触发点常和肉眼合理错开）：

```bash
(cd "$PROJECT_DIR" && npx hyperframes <lint|validate|inspect> --json 2>&1 | jq '.findings[] | {code, severity, snippet, line}')
```

按下表处理每条 finding（**默认就地 Edit scene 文件**）：

| Gate 报错类型                                                                            | 动作                                                                                   |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| asset 路径错 / 前导斜杠 `/public/` / basename 拼错                                       | `Edit` scene 文件改路径                                                                |
| 未 scope selector（`.scene-root` 祖先 / `#scene-root` / `[data-composition-id]`）        | `Edit` 改成裸 `.s<N>-foo` / `#s<N>-foo`，root 样式 `#root`                             |
| 漏 `class="clip"` / CSS `transition:` / `animation:` / 硬编码字体名                      | `Edit` 补 / 删 / 换 `var(--font-*)`                                                    |
| 注释里字面 `<template>/<style>/<script>` / 属性顺序 / 单行↔多行（regex 误伤）            | `Edit` 转义或微调                                                                      |
| timeline 没注册 / sub-comp ref 断 / 某 selector 逻辑错                                   | 多数是一两行 → `Edit` scene 文件改对（先 Read 契约确认）                               |
| by-design 溢出 / 低对比（depth-layer 故意越框 ≤5px、editorial 低对比、camera zoom peak） | 加 escape hatch `data-layout-allow-overflow="true"` / `data-contrast-allow-low="true"` |
| **整场构图根本错 / 多 primary 要重新布局 / 动画逻辑坏到非一两处可改**                    | **STOP → 编排器重派该 worker**（例外，不是默认）                                       |

`inspect` warning 默认不 block；严重（CTA 出画、主文字裁 >30px）按上表处理并记 `context.log`。**每次 Edit 后只重跑那一道 gate** 确认通过（改了 selector/scope 的，再跑一下原始三道里相关那道即可）。

## Step 2：Snapshot 视觉 smoke test

每 scene 取 midpoint：`start_s + estimatedDuration_s * 0.5`。高风险 scene（`estimatedDuration_s >= 8`、`effects` 含 `multi-phase-camera`、或 brief 提 multi-act / dense / action-payoff / `PrimarySubjectTimeline`）再加 `* 0.75` 和 `* 0.9`。去重升序一次传：

```bash
(cd "$PROJECT_DIR" && npx hyperframes snapshot --at <m1>,<m2>,...)
```

逐张对 `creative_brief` 眼检 → **发现问题就地 Edit 那个 scene 文件**：

| 现象                                    | 根因 → 就地修                                                                                                                       |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 整片空白 / 纯背景                       | asset 路径错（`Edit` 路径）；或 sub-comp 没挂（内层 `data-composition-id` / `window.__timelines` key ≠ scene_id → `Edit` 一行对齐） |
| 闪一下 / 跳帧 / 静止没动画              | 内层 id 与 timeline key 不一致 → `Edit` 对齐                                                                                        |
| CTA 出画 / 主文字被裁                   | `Edit` 调位置 / 缩放                                                                                                                |
| dense：多个 subject 抢 center safe zone | 能就地降级就 `Edit`（supporting 缩小 / 降对比 / 移出 primary bbox / 减运动）；**要真正重新布局才 STOP 重派**                        |
| 某时间点显的是别的 scene 内容           | 播放顺序由 assemble 从 group_spec 定（correct-by-construction）→ 真出现是上游 group_spec 顺序错，STOP 报告                          |

改完**只重 snapshot 那一帧 / 那个 scene** 确认。

## Step 3：Render

```bash
(cd "$PROJECT_DIR" && npx hyperframes render --quality <quality> --output renders/video.mp4)
```

`<quality>` 取自 dispatch（默认 `high`）。**不加 `--strict`**（gate 已过）。失败 → 看 stderr 末尾 ~30 行（quality 设错？asset 缺？）；**不换 flag 盲重试**。

## Step 4：验 mp4

```bash
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/verify-render.mjs --hyperframes . --group-spec ./group_spec.json)
```

- exit 0 → 完成。
- exit 1 → 它给出 size / duration drift 具体数。duration drift 多半是某 sub-comp 没挂上（静帧兜底跑满全长）→ 回 Step 2 找那个 scene 修；size 过小 → render 实际失败，看 Step 3 stderr。

## 完成汇报

- lint / validate / inspect 状态
- snapshot：张数 + 每 scene 一行对照 brief 的判断
- **就地修过的 scene 文件：file + 改了什么**（路径 / scope / 降级 / escape-hatch …）
- 任何（例外）STOP 重派的 worker + 原因
- Render：路径 / 字节 / ffprobe duration / quality
- 放行的未解决 warning

追加 `<PROJECT_DIR>/context.log`：

```
## Phase 4c: finalize [done <ISO timestamp>]
Gates: lint OK / validate OK / inspect OK / snapshot OK
Fixes in place: <scene_N: what> ...（无则 none）
Render: renders/video.mp4 (<size>, <duration>s, quality=<quality>)
```
