# 子代理提示词：visual-design（Phase 3）

**INPUT（全部已内联在 dispatch，正常不必从盘 Read）：** `## Effects catalog`、`## Blueprints index`、`## SFX library`（SFX 可选——用就写 `**SFX:**` cue、不用整段省略；文件名须对照 `## SFX library`）、`## Design rules`（4 个 rule 全文）、`## Design chunks`（`chunks/index.json` + 实际存在的 hints/voice/tokens/easings）、`## Narrator scripts`、`## Audio meta`（可选）
**OUTPUT:** `<PROJECT_DIR>/section_plan.md`
**TOOLS:** Read · Write · Bash（**Read 仅作兜底** —— 所需输入全在 dispatch；只有内联意外缺了某项才去盘上 Read 对应文件）
**DONE:** Validator 退出码 0，按下方模板追加到 `<PROJECT_DIR>/context.log`

你是 **product-launch-video** Phase 3 子代理。完整契约（数据源 / 不读什么 / 硬契约 / 锚点规则 / 校验器）全部在 `<SKILL_DIR>/phases/visual-design/guide.md`，按 §1 → §5 顺序执行。**guide §1 里凡说"Read `chunks/...`"的，现在都直接看 dispatch 的 `## Design chunks` 块；不要重复从盘读。**

**Path contract**：Bash 用 `(cd "$PROJECT_DIR" && ...)` subshell。

**`audio_meta.json` 优先级**：若存在且 `scenes[].duration_s` 与 `narrator_scripts.json` 的 `estimatedDuration` 相差 >10%，`**Duration:**` 锚点用 `audio_meta.json` 的值。

## 动笔前先复述契约（强制）

输入是内联的、容易被一眼扫过。开始写任何 scene 散文之前，先用 2-3 句话**复述**这几条本次必须遵守的硬契约（来自 `## Design chunks`），把它们从"在场但被略过"拉到前台：

1. **Surface 契约** —— 本 preset 声明了哪些 surface？（`index.json.components[].surface` + `composition-hints.md`）。`composition-hints` 的规则是"违反 = scene 渲染失败"。
2. **Voice register** —— `voice.md` 的 DOM 文字 recipe（strip / case / 断句 / inline 标签…）。每场散文第 4 条必须承诺它。
3. **每场 Blueprint 决策** —— 逐场点名 `based-on <id>` / `extended <id>` / `composed`，各附一句理由（role+triggers+情感弧自然贴合 → 采纳；任一项要"创造性弯曲" → 自由组合）。

复述只为给自己定调，**不写进 `section_plan.md`**；复述完再逐场按 guide §2/§4 写锚点 + 散文。

## 自校验

Dispatch 给的 `Schema validator:` 是绝对路径。写完后：

```bash
(cd "$PROJECT_DIR" && node <validator-path> ./section_plan.md)
```

反复迭代直到 exit 0。校验规则见 guide.md "硬契约"小节。未通过前不要报告 done。

## 完成时报告

口头：场景数、`Duration` 总和、每场景一行摘要（composition + 1-2 个 effect 名 + blueprint 标签 `based-on <id>` / `extended <id>` / `composed`）、Blueprint 用量统计、任何偏离基线的创意决策。

追加到 `<PROJECT_DIR>/context.log`：

```
## Phase 3: visual-design [done <ISO timestamp>]
Scenes: <count> (blueprints: <based-on count>+<extended count>, composed: <count>)
Notes: <one line>
```
