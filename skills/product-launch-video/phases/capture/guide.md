# capture — how-to (Phase 1)

抓取 marketing/landing page → 把全部产物写到视频项目根下的 `./capture/`。设计系统（Phase 1b）和视觉/故事 phase 都直接读 capture，不再有单独的 designlang 抓取。

## 启动

```bash
(cd "$PROJECT_DIR" && npx hyperframes capture "<TARGET_URL>" -o ./capture)
```

可选 flag（默认不需要）：

- `--timeout 60000` — JS-heavy 站点首屏未注入时，给 networkidle2 更多窗口
- `--skip-assets` — 不下载图片 / SVG / 字体（仅 schema 探查时用，正常 pipeline 不要）
- `--max-screenshots 12` — 减少滚动位截图数量

## 产物

```
capture/
├── extracted/
│   ├── tokens.json              # title / desc / cssVariables / fonts / colors / headings / ctas / svgs / sections[].{callsToAction,assetUrls}
│   ├── design-styles.json       # typography roles / buttons / cards / nav / shadows / radius / spacing
│   ├── animations.json          # CDP + Web Animations + CSS keyframes catalog（含 easing 字符串）
│   ├── fonts-manifest.json      # OpenType name-table 反查的 family/weight/style
│   ├── asset-descriptions.md    # 每张图一行（DOM 位置 + 可选 Gemini caption）
│   ├── visible-text.txt         # 全文 plain text dump
│   ├── video-manifest.json      # 每个 <video> 的截图 + 上下文（如有）
│   └── shaders.json             # WebGL 源码（如有 canvas）
├── assets/
│   ├── *.svg / *.jpg / *.png / *.webp / *.mp4
│   ├── fonts/                   # 站点字体 woff/woff2/otf
│   ├── svgs/                    # inline SVG 单独落盘
│   ├── videos/previews/         # <video> 截帧
│   └── contact-sheet-*.jpg      # 资产接触表
├── screenshots/
│   ├── scroll-*.png             # 滚动位 viewport 截图
│   └── contact-sheet-*.jpg
├── meta.json
└── CLAUDE.md / AGENTS.md / .cursorrules   # capture 自带的 agent scaffolding（本 skill 不强读）
```

## 验证

```bash
[ -s ./capture/extracted/tokens.json ] && \
[ -s ./capture/extracted/design-styles.json ] && \
[ -d ./capture/assets ] && echo ok || echo missing
```

缺任一 → 报缺失项，停止。若 `./capture/BLOCKED.md` 存在：

- "Anti-bot protection detected" → 换站，或手动喂 HTML（暂不支持）
- "Page navigation timed out" → 加 `--timeout 60000` 重跑

## 报告（回给用户）

- Final URL ← 从 `capture/CLAUDE.md` 或 `meta.json.id` 还原
- Page title ← `tokens.json.title`
- Section candidates：`tokens.json.sections.length` + 简短列表
- Assets：`ls capture/assets | wc -l`，按扩展名拆分
- Fonts：`tokens.json.fonts` 列表（与 `fonts-manifest.json` 对齐情况）
- 动画 / shader / Lottie / video：`animations.json.summary` + `shaders.json` 长度 + 是否有 `assets/lottie/` 和 `extracted/video-manifest.json`
- 异常（timeout / no assets / blank screenshot / 反爬）

## 写日志

追加到视频项目根的 `./context.log`：

```
## capture [done <ISO timestamp>]
URL: <final url>
Assets: <count>
Notes: <one line>
```

## 约束

- 所有命令用 `(cd "$PROJECT_DIR" && ...)` subshell；不要单独 `cd`。
- 只写 `./capture/`，不碰 `./design-system/`。
- 强制 English：capture 已默认设置 `Accept-Language: en-US,en;q=0.9`。如果 `tokens.json.headings` 仍是本地语言，记入 anomaly 并继续。
