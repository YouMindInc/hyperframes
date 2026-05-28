# Design System (Phase 1b)

合成 `design.html` + 切碎为 `chunks/`。两步确定性脚本（站点 DNA 直接吃 Phase 1 的 `capture/`），preset 选择是 agent 唯一的决策点。

## 1. 命令模板

```bash
mkdir -p design-system

# Step 1 — baseline 推断，写 inference.json，不落 design.html
# build-design.mjs 默认读 <design-system-dir>/../capture/，与 Phase 1 hyperframes capture 的输出对齐。
node <SKILL_DIR>/phases/design-system/scripts/build-design.mjs ./design-system --no-emit

# Step 2 — 见 §3 决策规则

# Step 3 — 用 chosen preset 落 design.html
node <SKILL_DIR>/phases/design-system/scripts/build-design.mjs ./design-system --style <chosen>

# Step 4 — 切碎为 chunks/
node <SKILL_DIR>/phases/design-system/scripts/emit-chunks.mjs ./design-system

# Step 5 — caption style 选择（见 §5）
# agent 读 brand DNA 后挑一个 caption-* registry component 写入 caption-style.json
```

可选 flag：

- `build-design --capture <dir>` — 覆盖默认 `<design-system-dir>/../capture/` 路径
- `build-design --out-scores <file>` — 改 inference.json 落盘路径（默认 `<dir>/inference.json`）

## 2. inference.json 字段（agent 读这些）

```jsonc
{
  "confidence": "high" | "medium" | "low" | "forced",
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

## 4. 汇报模板

```
preset review:
  baseline: <name> (combined=<X>, confidence=<...>)
  chosen:   <name>
  reason:   <一句话，引用 site_dna / best_for / avoid_for 的具体关键词>
  alternates_considered: [<name1>, <name2>]
  capability_actions: [<装了什么 block / 哪个 env var 没设>]  # 没动作就写 none
```

外加 build-design 和 emit-chunks 两段 stdout 原样贴。

## 5. Caption style 选择（Step 5）

emit-chunks 退 0 后，从 `hyperframes-registry` 的 caption-\* component 中挑一个最配 brand DNA 的，写到 `design-system/caption-style.json`：

```bash
cat > ./design-system/caption-style.json <<EOF
{
  "name": "<one of the supported list>",
  "rationale": "<一句话，引用 site_dna / palette mood / 招式契合度>"
}
EOF
```

### 支持清单（共 12 个，按招式分组）

prep.mjs 的 captions builder 支持 P1（TRANSCRIPT 派生）和 P2（WORDS + RAW_GROUPS）两种数据形态。**只从下面 12 个里选**——其它 caption-\* 用 BLOCKS 自定义布局无法注入 word grid，会被 captions.mjs 拒绝。

| name                     | shape | 招式                                         | best_for                        |
| ------------------------ | ----- | -------------------------------------------- | ------------------------------- |
| `caption-pill-karaoke`   | P1    | 椭圆 pill 包裹两行 karaoke                   | playful / friendly / 高对比     |
| `caption-weight-shift`   | P1    | active 词 font-weight 跳变                   | editorial / minimal / 排印克制  |
| `caption-glitch-rgb`     | P1    | RGB 分离 + chromatic shift                   | tech / dark / cyber             |
| `caption-emoji-pop`      | P1    | 词配 emoji icon 弹出                         | playful / consumer / social     |
| `caption-neon-accent`    | P1    | 霓虹下划线 + 颜色波纹                        | nightlife / saturated dark      |
| `caption-highlight`      | P2    | 红色背景 sweep 高亮 active word（TikTok 风） | social / high-energy / 大众消费 |
| `caption-kinetic-slam`   | P2    | 巨字号 stamp slam 入场                       | bold / kinetic / 招式感强       |
| `caption-neon-glow`      | P2    | 发光 outline 呼吸                            | dark / neon palette             |
| `caption-gradient-fill`  | P2    | 渐变填充 active word                         | warm / saturated                |
| `caption-particle-burst` | P2    | 词激活时粒子爆发                             | celebratory / 高能场景          |
| `caption-matrix-decode`  | P2    | 字符 decode reveal                           | tech / data / cyber             |
| `caption-clip-wipe`      | P2    | clip-path wipe reveal                        | minimal / 极简                  |

**禁止**：`caption-editorial-emphasis` / `caption-parallax-layers` / `caption-blend-difference` / `caption-texture` —— 形态不兼容或非 word-grid 用途。

### 选法

1. 看 baseline preset + site_dna：material / voice_tone / palette mood 大方向（例：`peoples-platform` + site_dna 偏 playful → `caption-pill-karaoke` 或 `caption-highlight`；`liquid-glass` + dark palette → `caption-neon-glow`）
2. 看 brand DNA palette 主色：palette 已经发光/霓虹的 → 走 glow / neon-accent；克制 editorial → weight-shift；招式型品牌（gaming / DTC consumer）→ slam / highlight
3. 选**一个**写入 caption-style.json，不要写多个

prep.mjs 后续会跑 `npx hyperframes add <name>` 把 component 装到 `compositions/components/<name>.html`，再喂给 `scripts/captions.mjs` 注入 word grid + brand tokens。

## 6. 硬契约

- **`chunks/` 与 `design.html` 同源** — Step 3 重跑后必须重跑 Step 4，否则下游读旧 chunk
- **Read 范围**：`./design-system/inference.json` + 验合成结果时 `./design-system/design.html`。**不读 capture 的 extracted/ 原始 JSON** —— inference.json 已经按 site_dna 摘要了关键信号
- **不要自己设计 palette / typography / 字体 / decoration** — 全部由 build-design 写定
- `--style` 是 deliberate override，agent 必须在跑它之前满足 capability；build-design 在 forced mode 下不再 gate

## 7. 排查

| 现象                                  | 修法                                                                                                                                           |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 抓回非英语 hero                       | 已默认 `Accept-Language: en-US,en;q=0.9`；若仍是本地语言，重跑 Phase 1 capture                                                                 |
| 抓回空 hero / 占位文字                | 给 capture 加 `--timeout 60000` 重跑；或确认 capture/BLOCKED.md 是否提示反爬                                                                   |
| Step 4 报缺锚点                       | 重跑 Step 3，确认 design.html 含 ROOT-START / MOTION-START / VOICE-START / COMPONENT 注释；不要修 emit-chunks                                  |
| `chunks/index.json` 缺 `components[]` | 看 build-design stdout `components: N paste-ready`；N=0 可接受（下游退化为 tokens + easings）                                                  |
| 推断的 brand primary 颜色不对         | build-design 默认用第一个非中性 button 背景；如果 CTA 颜色不显眼，capture 跑完后手改 `inference.json` 的 site_dna 字段并 `--style` 强制 preset |
