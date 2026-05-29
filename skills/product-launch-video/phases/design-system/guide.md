# Design System (Phase 1b)

合成 `design.html` + 切碎为 `chunks/`。两步确定性脚本（站点 DNA 直接吃 Phase 1 的 `capture/`）。agent 有两个决策点：**preset 选择**（必做，§3）和**品牌色裁决**（仅当 `inference.json.brand.needs_review=true` 时，§3b——看截图从候选里选）。

## 1. 命令模板

```bash
mkdir -p design-system

# Step 1 — 读已生成的 inference.json（Phase 1 capture 阶段已确定性跑过 --no-emit）。
#          一般不必重跑；仅当 inference.json 缺失 / capability auto-install 后需重验候选时，再跑下面这行。
#          build-design.mjs 默认读 <design-system-dir>/../capture/，与 Phase 1 hyperframes capture 的输出对齐。
node <SKILL_DIR>/phases/design-system/scripts/build-design.mjs ./design-system --no-emit

# Step 2  — preset 决策（§3）
# Step 2b — 品牌色裁决（§3b）：仅当 inference.json.brand.needs_review=true 时

# Step 3 — 用 chosen preset 落 design.html（如做了裁决，加 --brand-primary <hex>）
node <SKILL_DIR>/phases/design-system/scripts/build-design.mjs ./design-system --style <chosen> [--brand-primary <hex>]

# Step 4 — 切碎为 chunks/
node <SKILL_DIR>/phases/design-system/scripts/emit-chunks.mjs ./design-system
```

可选 flag：

- `build-design --capture <dir>` — 覆盖默认 `<design-system-dir>/../capture/` 路径
- `build-design --out-scores <file>` — 改 inference.json 落盘路径（默认 `<dir>/inference.json`）
- `build-design --brand-primary <hex>` — 覆盖自动推断的品牌主色（agent 看截图裁决后用，见 §3b）。hex 必须取自 `inference.json.brand.candidates[]`

## 2. inference.json 字段（agent 读这些）

```jsonc
{
  "confidence": "high" | "medium" | "low" | "forced",
  "brand": {                      // 自动推断的品牌色（§3b 裁决用）
    "primary": "#XXXXXX",
    "secondary": "#XXXXXX",
    "accent": "#XXXXXX",
    "source": "signals" | "agent-override" | "legacy",
    "confidence": "high" | "medium" | "low" | "agent-override" | "legacy",
    "needs_review": true | false, // true = 自动选的不确定，agent 必须看截图裁决
    "screenshot": "capture/screenshots/scroll-0.png", // 相对 PROJECT_DIR
    "candidates": [               // 按 score 降序，--brand-primary 只能从这里选
      { "hex": "#XXXXXX", "score": 0.X, "bgCount": N, "interactiveBg": N, "on_button": true }
    ]
  },
  "baseline_winner": { "name": "...", "combined": 0.XX },
  "top_candidates": [           // 已满足 capability 的候选，按 combined 降序
    {
      "name": "...",
      "combined": 0.XX,
      "delta_from_winner": 0.XX,
      "matched_signals": [...],
      "best_for": [...],
      "avoid_for": [...],
      "sectionA_excerpt": "..."
    }
  ],
  "site_dna": {
    "material": "flat|paper|glass|...",
    "imagery": "photography|flat-illustration|...",
    "page_intent": "landing|pricing|blog|...",
    "section_role_counts": { "feature-grid": N, ... },
    "voice_tone": "neutral|warm|formal|...",
    "voice_heading_style": "Title Case|UPPERCASE|...",
    "voice_heading_length": "tight|loose"
  },
  "capability_gated_presets": [ // 因 runtime / env 缺失被 0 分；可在装齐 capability 后升回 top_candidates
    {
      "name": "liquid-glass",
      "combined_pre_capability": 0.42,
      "capabilities_missing": [
        {
          "kind": "block_installed",
          "auto_install": "npx hyperframes add liquid-glass-widgets" // 非 null 时 agent 可跑
        },
        {
          "kind": "env_var_set",
          "var": "PRODUCER_HEADLESS_SHELL_PATH",
          "auto_install": null // null = 不能自动装
        }
      ]
    }
  ]
}
```

## 3. 决策规则（Step 2）

按 `confidence` 决定：

| confidence       | 动作                                |
| ---------------- | ----------------------------------- |
| `high`           | 用 `baseline_winner.name` 跑 Step 3 |
| `medium` / `low` | 进入下面的 override 判据            |
| `forced`         | 已传 `--style`，跳过 review         |

**override 判据**（按优先级）：

1. **避坑**：top_candidates 中任一 preset 的 `avoid_for` 命中 `site_dna` 关键词 → 从候选剔除
2. **best_for 命中**：剩下的里挑 `best_for` 与 `site_dna` 关键词重合最多的
3. **capability_gated 选优**：如果某个 gated preset 的 `combined_pre_capability` 已能进 top-3 且 `site_dna` 明显契合（典型 `material: "glass"` → liquid-glass），处理 `capabilities_missing[]`：
   - `auto_install` 非 null → 跑这条命令 → 重跑 `build-design.mjs --no-emit` 验证它已进 top_candidates → 用 `--style` 选它
   - `auto_install: null` → 写进 anomaly 汇报，**改选别的 preset**
4. **无明显赢家** → 保留 baseline_winner

**禁止**：选择必须出自 `top_candidates[]` 或 `capability_gated_presets[]`，不能发明新名字。

## 3b. 品牌色裁决（Step 2b — 仅当 `brand.needs_review=true`）

`brand.primary` 默认由确定性信号打分选出（用作交互/重复填充的彩色），多数站点直接可用。
但**多色品牌**（如 figma）和**品牌色藏在大色块/logo**（如 asana 的珊瑚 logo 被大面板地色盖过）这类站点，
CSS 统计分不清"品牌 hero"和"section 地色"——这时 `needs_review=true`，**必须看截图裁决**：

1. 用 Read 打开 `brand.screenshot`（首屏截图）
2. 对照 `brand.candidates[]`：判断哪个候选 hex 是**真正的品牌色**，剔除这些误判：
   - 顶部公告条 / 横幅的背景色（细长条 = 地色，不是品牌）
   - section 大面板 / 卡片容器的背景色（大色块 = 地色）
   - 浅色 section 底色（淡色铺底 = 地色）
   - 品牌色通常出现在：**logo、主 CTA 按钮、强调元素**（`on_button:true` 是强信号）
3. 选定后 → Step 3 加 `--brand-primary <选中的hex>` 重跑（hex **必须**是某个 `candidates[].hex`）
4. 若截图里的真品牌色**不在** `candidates[]` 里（典型：品牌色只在 logo SVG，如 reddit/gitlab 的橙）→
   候选里挑不出 → 记入 anomaly 汇报，保留自动选的 primary 不强行覆盖

`needs_review=false`（confidence=high）时**跳过本步**，直接用 `brand.primary`。

## 4. 汇报模板

```
preset review:
  baseline: <name> (combined=<X>, confidence=<...>)
  chosen:   <name>
  reason:   <一句话，引用 site_dna / best_for / avoid_for 的具体关键词>
  alternates_considered: [<name1>, <name2>]
  capability_actions: [<装了什么 block / 哪个 env var 没设>]  # 没动作就写 none
brand review:
  primary: <hex> (source=<signals|agent-override|legacy>, confidence=<...>)
  reviewed: <yes 看了截图选 X / no 自动选已 high / n/a 候选里没真品牌色>
```

外加 build-design 和 emit-chunks 两段 stdout 原样贴。

## 5. 硬契约

- **`chunks/` 与 `design.html` 同源** — Step 3 重跑后必须重跑 Step 4，否则下游读旧 chunk
- **Read 范围**：`./design-system/inference.json` + 验合成结果时 `./design-system/design.html` + **品牌裁决时 `brand.screenshot`（截图）**。**不读 capture 的 extracted/ 原始 JSON** —— inference.json 已经按 site_dna 摘要了关键信号
- **不要自己设计 palette / typography / 字体 / decoration** — 全部由 build-design 写定。品牌色裁决也只是**从 `candidates[]` 里选**（`--brand-primary`），不发明 hex
- `--style` 是 deliberate override，agent 必须在跑它之前满足 capability；build-design 在 forced mode 下不再 gate

## 6. 排查

| 现象                                  | 修法                                                                                                                                           |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 抓回非英语 hero                       | 已默认 `Accept-Language: en-US,en;q=0.9`；若仍是本地语言，重跑 Phase 1 capture                                                                 |
| 抓回空 hero / 占位文字                | 给 capture 加 `--timeout 60000` 重跑；或确认 capture/BLOCKED.md 是否提示反爬                                                                   |
| Step 4 报缺锚点                       | 重跑 Step 3，确认 design.html 含 ROOT-START / MOTION-START / VOICE-START / COMPONENT 注释；不要修 emit-chunks                                  |
| `chunks/index.json` 缺 `components[]` | 看 build-design stdout `components: N paste-ready`；N=0 可接受（下游退化为 tokens + easings）                                                  |
| 推断的 brand primary 颜色不对         | build-design 用 capture 的 `colorStats` 信号给品牌色打分（最常用作交互/重复填充的彩色 = primary，详见脚本注释）；多数情况已准确。若仍不对：① 品牌色只在 logo SVG 里（如 reddit/gitlab 的橙）→ capture 无法作为填充色捕获，目前无法自动取到；② 多色品牌（如 figma）primary 本就模糊。两种情况可手改 `--style` 强制 preset，品牌色由 design.html 退化路径处理 |
