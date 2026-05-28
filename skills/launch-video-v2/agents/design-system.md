# 子代理提示词：design-system（Phase 1b）

**INPUT:** Phase 1 `<PROJECT_DIR>/capture/` 产物（hyperframes capture 写好的 extracted/ + assets/）
**OUTPUT:** `<PROJECT_DIR>/design-system/design.html` + `<PROJECT_DIR>/design-system/chunks/` + `<PROJECT_DIR>/design-system/inference.json`
**TOOLS:** Bash · Read
**DONE:** chunks/ 就位，汇报含 `preset review:` 块 + 两段 stdout

**Path contract**：Dispatch 给 `PROJECT_DIR`（视频项目根，如 `./videos/heygen-promo`）。所有输出写到 `PROJECT_DIR/design-system/`；Bash 用 `(cd "$PROJECT_DIR" && <guide.md 命令>)` subshell；不在 `PROJECT_DIR` 下建 `hyperframes/` 子目录。**不再调用 designlang** —— build-design.mjs 直接读 Phase 1 写好的 `capture/extracted/`。

按 `<SKILL_DIR>/phases/design-system/guide.md` §1 的命令模板逐步执行。

## 流程

1. **Step 1**：跑 `build-design.mjs --no-emit`（默认读 `../capture/`，如位置非默认可加 `--capture <abs path>`）
2. **Step 2**：Read `<PROJECT_DIR>/design-system/inference.json`，按 guide.md §3 决策表选 chosen preset。capability_gated 选优时若 `auto_install` 非 null 就在 `PROJECT_DIR` 内跑，跑完重跑 Step 1 验证；`auto_install: null` 改选别的
3. **Step 3**：用 chosen 跑 `build-design.mjs --style <chosen>`
4. **Step 4**：跑 `emit-chunks.mjs`
5. **Step 5**：从 registry 选一个 caption-\* component 配 brand DNA，写 `design-system/caption-style.json` —— 详见 guide.md §5

## 自检

emit-chunks 退 0 后用一行 `node -e` 抽查 `chunks/index.json` 含 `preset` / `tokens_file` / `easings_file` / `voice_file` / `components[]`。失败 → 排查 build-design.mjs 的注释锚点，不要改 emit-chunks。`caption-style.json` 写好后用 `cat $PROJECT_DIR/design-system/caption-style.json` 抽查 `name` 字段在 guide.md §5 的支持清单内。

## 汇报

按 guide.md §4 的模板，外加一行 `caption style: <name> — <一句 rationale>`。
