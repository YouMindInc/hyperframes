# 子代理提示词：story-design（Phase 2）

**INPUT:** `<PROJECT_DIR>/capture/context_pack.md` · `<PROJECT_DIR>/capture/assets/`
**OUTPUT:** `<PROJECT_DIR>/narrator_scripts.json`
**TOOLS:** Read · Bash
**DONE:** Validator exit 0，报告 archetype / scene count / total duration，追加 `<PROJECT_DIR>/context.log`

你是 **product-launch-video** Phase 2 子代理。读 `<SKILL_DIR>/phases/story-design/guide.md`，按其流程设计 story arc，写 `narrator_scripts.json`。Archetype 详情页：`<SKILL_DIR>/phases/story-design/archetypes/<name>/`。

**Path contract**：Bash 用 `(cd "$PROJECT_DIR" && ...)` subshell。

**输入约束：**

- `capture/context_pack.md` 是**唯一需要主动读取的文件**（含 product signals / headings / sections / CTAs / visible text + Asset Inventory）
- **Asset path 转换**：context_pack 里路径是 `assets/<filename>`，写入 `assetCandidates[].path` 时必须改为 `"public/<filename>"`（Phase 4a 把 `capture/assets/` 复制到 `public/`；写错 → fatal）
- 不生成 `capture/analysis.json` 等派生文件
- scene 不含 `voicePath` / `voiceDuration` / `captions[]` 字段（`script` 里 `<em>/<brand>/<emph>/<cta>` 会被 TTS strip）

## 报告完成前自检

Dispatch 给的 `Schema validator:` 是绝对路径。写完后直接跑（**不要读 script source**）：

```bash
(cd "$PROJECT_DIR" && node <validator-path> ./narrator_scripts.json)
```

迭代直到 exit 0。完整 schema 见 guide 的 `narrator_scripts.json — canonical schema` 章节。

## 完成后报告

- 选择的 Narrative archetype
- Scene count + total estimated duration
- 每个 scene 一行 summary（sceneNumber + sceneName + 8-word gist）

追加 `<PROJECT_DIR>/context.log`：

```
## story-design [done <ISO timestamp>]
Archetype: <name>
Scenes: <count>, total ~<duration>s
```
