# 子代理提示词：design-system（Phase 1b）

**INPUT:** Phase 1 `<PROJECT_DIR>/capture/` 产物（hyperframes capture 写好的 extracted/ + assets/）
**OUTPUT:** `<PROJECT_DIR>/design-system/design.html` + `<PROJECT_DIR>/design-system/chunks/` + `<PROJECT_DIR>/design-system/inference.json`
**TOOLS:** Bash · Read
**DONE:** chunks/ 就位，汇报含 `preset review:` 块 + 两段 stdout

**Path contract**：Dispatch 给 `PROJECT_DIR`（视频项目根，如 `./videos/heygen-promo`）。所有输出写到 `PROJECT_DIR/design-system/`；Bash 用 `(cd "$PROJECT_DIR" && <guide.md 命令>)` subshell；不在 `PROJECT_DIR` 下建 `hyperframes/` 子目录。**不再调用 designlang** —— build-design.mjs 直接读 Phase 1 写好的 `capture/extracted/`。

按 `<SKILL_DIR>/phases/design-system/guide.md` §1 的命令模板逐步执行。

## 流程

1. **Step 1**：**优先用 dispatch 的 `## Inference decision inputs`（或内联的 inference.json 正文）**选 preset —— Phase 1 capture 阶段已确定性跑过 `build-design.mjs --no-emit` 生成 `inference.json`，**你不必再跑**，正常也**不必再 Read**（编排器已把它内联进 dispatch）。仅当 dispatch 里没有该内联、或 inference.json 缺失、或 capability auto-install 后需重新验证候选时，才 Read `<PROJECT_DIR>/design-system/inference.json` / 自己跑 `build-design.mjs ./design-system --no-emit`。（注意：本步只省 inference.json 的 Read；§1 命令模板 / §3b 截图流程 / §4 报告模板 / §5 硬契约仍需 Read `guide.md`。）
2. **Step 2**：按 guide.md §3 决策表选 chosen preset。capability_gated 选优时若 `auto_install` 非 null 就在 `PROJECT_DIR` 内跑，跑完重跑 `--no-emit` 验证；`auto_install: null` 改选别的。`brand.needs_review=true` 时按 §3b 看截图裁品牌色
3. **Step 3**：用 chosen 跑 `build-design.mjs --style <chosen> [--brand-primary <hex>]`
4. **Step 4**：跑 `emit-chunks.mjs`

## 自检

emit-chunks 退 0 后用一行 `node -e` 抽查 `chunks/index.json` 含 `preset` / `tokens_file` / `easings_file` / `voice_file` / `components[]`。失败 → 排查 build-design.mjs 的注释锚点，不要改 emit-chunks。

## 汇报

按 guide.md §4 的模板。
