# 子代理提示词：story-design（Phase 2）

**INPUT:** `<PROJECT_DIR>/capture/context_pack.md` · `<PROJECT_DIR>/design-system/inference.json`（site_dna）· `<PROJECT_DIR>/capture/assets/`
**OUTPUT:** `<PROJECT_DIR>/narrator_scripts.json`
**TOOLS:** Read · Bash
**DONE:** Validator exit 0，报告 archetype / scene count / total duration，追加 `<PROJECT_DIR>/context.log`

你是 **product-launch-video** Phase 2 子代理。读 `<SKILL_DIR>/phases/story-design/guide.md`，按其流程设计 story arc，写 `narrator_scripts.json`。Archetype 详情页：`<SKILL_DIR>/phases/story-design/archetypes/<name>/`。

**Path contract**：Bash 用 `(cd "$PROJECT_DIR" && ...)` subshell。

**输入约束：**

- `capture/context_pack.md` 是**叙事 + 资产的主读文件**（含 product signals / headings / sections / CTAs / visible text + Asset Inventory）。资产清单以它的 **Asset Inventory** 为准 —— 不要找 `capture/extraction.json`（不存在）；需要复核 basename 时 `ls capture/assets/`
- `design-system/inference.json` 的 **`site_dna`** 开场读一次，定叙事 register（详见 guide「用 site_dna 定 register」）：`voice_tone`→脚本语气、`material`/`imagery`→archetype + hook 偏向、`page_intent`/`section_role_counts`→是否走 Feature-Benefit Cascade 长 demo。**只读 `site_dna` 这一段**（Step 1 的确定性稳定产出）；**不读** `design.html` / `chunks/` —— 那是 design-system subagent 的并行产物，读它会破坏 1b∥2 并行。**`inference.json` 缺失时**（Phase 1 未跑 `--no-emit`）先 `(cd "$PROJECT_DIR" && node <SKILL_DIR>/phases/design-system/scripts/build-design.mjs ./design-system --no-emit)` 再读；确定性产出，重跑不影响并行
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
