# 子代理提示词: visual-design (Phase 3)

**INPUT:** `<PROJECT_DIR>/narrator_scripts.json` · `<PROJECT_DIR>/design-system/chunks/index.json` · `<PROJECT_DIR>/audio_meta.json`（可选）· Dispatch 上下文中的 `## Effects catalog` 和 `## Blueprints index`
**OUTPUT:** `<PROJECT_DIR>/section_plan.md`
**DONE:** Validator 退出码 0，按下方模板追加到 `<PROJECT_DIR>/context.log`

你是 **launch-video-v2** Phase 3 子代理。读取 `<SKILL_DIR>/phases/visual-design/guide.md`（路径由编排器注入），按该指南为每个场景设计视觉与编排，写入 `./section_plan.md`。

## 流水线契约（仅本次运行）

- **Path contract**：Dispatch 给 `PROJECT_DIR`（视频项目根）。所有 artifact 相对 `PROJECT_DIR`；Bash 用 `(cd "$PROJECT_DIR" && ...)` subshell。
- 不要 Read `effects-catalog.md`、不要 Read `blueprints-index.md`、不要 Read `capture/extracted/` 原始 JSON（用 `capture/context_pack.md` brief 即可）、不要 Read blueprint 全文（`blueprints/<id>.md`）、不要加载 `hyperframes-animation` / `hyperframes-creative` 技能 —— 这些资源要么已嵌入 Dispatch 上下文，要么属于其他 phase 或 build agent。
- **品牌来自 chunks，不读 `design.html`** —— 按 guide.md §1 读 `./design-system/chunks/`；详情（哪些文件必读 / 哪些可选 / 不读什么）见 guide。
- **必读 `voice.md`**（仅当 `index.json.voice_file != null`）—— preset 的 DOM 文字 register。散文第 4 条**必须**承诺该场可见文字走 voice.md 的 recipe（recipe 由 preset 声明）。具体英文改写由 Phase 4b worker 做，plan 不抄改写后的文案。
- **Component 元数据（surface-aware preset）**：`index.json.components[]` 的 entry 可能带 `surface` / `role` / `composes` / `slots` / `avoids_same_scene` 字段。**遇到带这些字段的 entry，必须按 guide.md §1 的"挑 component 算法"做两级过滤 + 互斥校验**——先按 surface 过滤、再按 role 选、最后验 `avoids_same_scene` 不冲突。老 preset 的 entry 只有 `{id, file}`，退回按 id 直选。
- **必读 `composition-hints.md`**（仅当 `index.json.hints_file != null`）——这是 preset 自己宣告的硬规则（surface 契约 / material 互斥 / 60-30-10 配色）。**违反 = scene 渲染破坏**。先读再决定 component 组合。
- **必读 `motifs.md`**（仅当 `index.json.motifs_file != null`）—— preset 的原子手势目录。每个 motif 是单一可复用 gesture（preset 自己声明），plan agent 在 `**Motifs:**` 锚点 cite，下游 worker 按 id 查 CSS。**只 grep id + 描述行**，不抄 CSS / demo HTML（那是 worker 的事）。
- **不必读** `type-roles.md`（仅当 `index.json.type_roles_file != null`）—— 命名 text role 目录，是 worker 自己挑 inline 文字样式时用的。plan agent 在散文里按角色描述（"hero display"、"lede"、"pill row"），**不 cite type-role id**，让 worker 自己挑。
- `audio_meta.json` 若存在：当 `scenes[].duration_s` 与 `narrator_scripts.json` 的 `estimatedDuration` 相差 >10%，`**Duration:**` 锚点优先用 `audio_meta.json` 的值。
- **Surface 锚点（surface-aware preset 必填）**：preset 的 `components[]` 任一 entry 含 `surface` 字段时，每个 scene 必填 `**Surface:** <preset-declared-surface>`（合法值由 chunks/index.json 决定）。值不在 preset 声明的集合里 / 与 Components 含 surface 字段的成员冲突 → validator fatal。详见 guide.md §2 硬契约。
- **Components 锚点（强烈推荐）**：每个场景在必选锚点之后加 `**Components:** [\`<id>\`, ...]`。当 chunks 含 `avoids_same_scene` 元数据时，validator 自动跑互斥 cross-check（互斥关系由 preset 声明）。详细语法、为什么要标、写错的代价见 guide.md §2 的 "Components 锚点" 段。
- **Motifs 锚点（推荐，仅当 preset 声明 §M）**：每个场景在 Components 之后加 `**Motifs:** [\`<motif-id>\`, ...]`。motif id 必须出现在 `chunks/motifs.md`；列错 id → validator fatal。详见 guide.md §2 的 "Motifs 锚点" 段。
- **SFX 锚点（必填）**：每个 scene **必须**显式写 `**SFX:**`。零音效写 `**SFX:** none`（单独一行），有音效写 `**SFX:**` 一行 + 一或多个 bullet（`- \`<file>.mp3\` at <T>s, volume <V> — <note>`），`<file>`来自 Dispatch 上下文`SFX manifest:`给出的 manifest.json。**Less is more**——大多数场景写`none`；一场 1 条是典型。**省略锚点 = validator fatal**（避免 silent drop：忘想 vs 决定不要必须区分开）。详细放置规则见 guide.md §2 的 "SFX 锚点" 段。

## 自校验

Dispatch 上下文有一行 `Schema validator:` 给出绝对路径。写完后：

```bash
(cd "$PROJECT_DIR" && node <validator-path> ./section_plan.md)
```

反复迭代直到 exit 0。校验器规则在 guide.md 的"硬契约"小节。校验未通过前不要报告 done。

## 完成时报告

口头汇报：场景数、`Duration` 总和、每场景一行摘要（composition + 1-2 个 effect 名 + **blueprint 标签**：`based-on <id>` / `extended <id>` / `composed`）、Blueprint 用量统计（"N 场用 blueprint，M 场 composed"）、任何偏离基线的创意决策。

追加到 `<PROJECT_DIR>/context.log`：

```
## Phase 3: visual-design [done <ISO timestamp>]
Scenes: <count> (blueprints: <based-on count>+<extended count>, composed: <count>)
Notes: <one line>
```
