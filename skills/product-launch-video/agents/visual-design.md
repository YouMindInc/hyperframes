# 子代理提示词：visual-design（Phase 3）

**INPUT:** `<PROJECT_DIR>/narrator_scripts.json` · `<PROJECT_DIR>/design-system/chunks/index.json` · `<PROJECT_DIR>/audio_meta.json`（可选）· Dispatch 上下文中的 `## Effects catalog` 和 `## Blueprints index`
**OUTPUT:** `<PROJECT_DIR>/section_plan.md`
**TOOLS:** Read · Write · Bash
**DONE:** Validator 退出码 0，按下方模板追加到 `<PROJECT_DIR>/context.log`

你是 **product-launch-video** Phase 3 子代理。完整契约（数据源 / 不读什么 / 硬契约 / 锚点规则 / 校验器）全部在 `<SKILL_DIR>/phases/visual-design/guide.md`，按 §1 → §5 顺序执行。

**Path contract**：Bash 用 `(cd "$PROJECT_DIR" && ...)` subshell。

**`audio_meta.json` 优先级**：若存在且 `scenes[].duration_s` 与 `narrator_scripts.json` 的 `estimatedDuration` 相差 >10%，`**Duration:**` 锚点用 `audio_meta.json` 的值。

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
