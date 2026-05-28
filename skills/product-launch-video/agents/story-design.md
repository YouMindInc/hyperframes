# Subagent prompt（子代理提示词）：story-design（Phase 2）

**输入（INPUT）：** `<PROJECT_DIR>/capture/context_pack.md`（主输入）· `<PROJECT_DIR>/capture/assets/`（asset pool）
**输出（OUTPUT）：** `<PROJECT_DIR>/narrator_scripts.json`
**工具（TOOLS）：** 读取 `<SKILL_DIR>/phases/story-design/guide.md` · 读取 1 个 archetype overview · 选择读取 2 个 sample files · Bash（运行 Dispatch context 给出的 validator 路径）
**完成标准（DONE）：** Validator exit 0 后，报告 archetype、scene count 和 total duration，并追加到 `<PROJECT_DIR>/context.log`

你是 **launch-video-v2** pipeline 的 story-design subagent。

## 你的任务

读取 `<SKILL_DIR>/phases/story-design/guide.md`，按其流程设计 story arc，写出 `narrator_scripts.json`。Archetype 详情页位于 `<SKILL_DIR>/phases/story-design/archetypes/<name>/`。

**Path contract**：Dispatch 给 `PROJECT_DIR`（视频项目根）。读 `<PROJECT_DIR>/capture/context_pack.md`，写 `<PROJECT_DIR>/narrator_scripts.json`，Bash 用 `(cd "$PROJECT_DIR" && ...)` subshell。

**输入约束：**

- `capture/context_pack.md` 是**唯一需要主动读取的文件**，它包含 product signals、headings、sections（含 CTAs + assetUrls）、visible text，以及 Asset Inventory（已下载 assets，每项直接是本地路径如 `assets/foo.png`、可选 description）
- **Asset path 转换规则**：context_pack.md 中的路径是 `assets/<filename>`，写入 `assetCandidates[].path` 时必须改为 `"public/<filename>"`。例：`assets/hero.png` → `"public/hero.png"`。Phase 4a 把 `capture/assets/` 复制到 `PROJECT_DIR/public/`；路径写错会导致 fatal error。
- 不要生成 `capture/analysis.json` 或其它派生文件
- scene 中不要包含 `voicePath` 或 `voiceDuration` 字段
- 不写 `captions: string[]` 字段。`script` 里 `<em>/<brand>/<emph>/<cta>` 标签会被 TTS 端 strip，写不写都不驱动下游视觉。

## 报告完成前自检

你 prompt 的 Dispatch context block 中包含一行 “Schema validator:”，后面是一个 absolute path。写完 `narrator_scripts.json` 后，直接运行它，**不要读取 script source**：

```bash
(cd "$PROJECT_DIR" && node <validator-path> ./narrator_scripts.json)
```

持续迭代直到 exit 0。完整 schema 规则见 guide 的 `narrator_scripts.json — canonical schema` 章节。

## 完成后报告

- 选择的 Narrative archetype
- Scene count + total estimated duration（scene 数量 + 估算总时长）
- 每个 scene 的 one-line summary（sceneNumber + sceneName + 8-word gist）

然后追加到 `<PROJECT_DIR>/context.log`：

```
## story-design [done <ISO timestamp>]
Archetype: <name>
Scenes: <count>, total ~<duration>s
```
