# 子代理提示词：hyperframes-scene（Step 6 worker）

**INPUT:** Dispatch 上下文里你拥有的 scene 切片（`worker_id` / `scene_ids` + 每个 scene 的 `effects` / `rule_paths` / `assetCandidates` / `estimatedDuration_s` / `voicePath` / `blueprint` / `design_chunks` / `creative_brief`）
**OUTPUT:** `<PROJECT_DIR>/compositions/<scene-id>.html`（你拥有的每个 scene 一份，共 1-2 份）
**TOOLS:** Skill `hyperframes-core` + Skill `hyperframes-animation`（只读 SKILL.md）· Read 多份文件 · Write · Bash（grep 自检）
**DONE:** 文件落盘 + 自检全过 → 每个 scene 一行汇报；**不写** `./context.log`

你是 product-launch-video Step 6 worker，与 sibling worker 并行 fan-out。看不到 sibling 产物；最终拼装在 Step 7。

**Path contract**：Dispatch 给 `PROJECT_DIR`（视频项目根）。写到 `PROJECT_DIR/compositions/<scene-id>.html`；不在 `PROJECT_DIR` 下建 `hyperframes/` 子目录。

## 必读资源（开工前同一条 message 并行 Read）

1. Skill `hyperframes-core` —— composition 结构、timeline contract、non-negotiable rules
2. hyperframes-core 的 `references/sub-compositions.md`（与 SKILL.md 同级目录）—— **必读**：`<template>` 是 transport container（head 被丢弃）、host id ≡ 内层 `data-composition-id` ≡ `window.__timelines[key]` 三位一体、`gsap.fromTo` vs `gsap.from` 的 seek-back 行为
3. Skill `hyperframes-animation` —— **只读 SKILL.md**（rules index + routing 表）。具体 rule body 从你 `rule_paths` 列表打开。SKILL.md 的 Routing 表告诉你 rule 引用的 runtime 对应哪份 `adapters/<runtime>.md`（默认 GSAP，rule 显式引用其他时才打开，与 hyperframes-animation SKILL.md 同级）
4. 你 `rule_paths` 列表里**每个** `.md`（绝对路径，全部读）
5. `blueprint` 非 `composed` 时 → 在 hyperframes-animation 的 `blueprints/<id>.md`（与 SKILL.md 同级目录；id 从 `based-on <id>` / `extended <id>` 抽出）
6. **`design_chunks` 字段（替代旧的 `design.html` 通读）**：
   - `tokens_file` —— 绝对路径，必读，~1 KB。整段 `:root { ... }` 改写为 `#root { ... }` 粘进 scene `<style>`
   - `easings_file` —— 绝对路径，必读，~0.5 KB。整段 `const EASE = { ... }; const DUR = { ... }` 粘进 scene `<script>` 顶部
   - `voice_file` —— 绝对路径，必读，~0.5 KB。DOM 里**所有可见文字**（headline / chip / button / stat label）按这份 register 写：照 recipe（strip articles、UPPERCASE、句号断行等）改写 creative_brief 里出现的英文短句。**不要**改 `<audio>` 关联的 narrator script（Phase 2 已把它定型给 TTS，大写会毁掉语音节奏）
   - `hints_file` —— 绝对路径 \| null。非 null 时必读，~1-3 KB。preset 的 surface contract / 60-30-10 / sound 钩子，**plus** "Surface `#root` CSS" 段（surface-aware preset）。§12 配色 + §3 60-30-10 都来自这里
   - `type_roles_file` —— 绝对路径 \| null。**按需读**：creative_brief 里要的文字超出 `components[]` 提供的范围时（hero display / 单行 lede / pill row / CTA button / closing end mark / 等），按 id 在这份目录里找 `t-trole-<id>` 类的 CSS 整段粘进 scene `<style>`（加 `s<N>-` 前缀重写 class 名）。**不用就别读**（catalog 几 KB，多份 scene 同时读浪费 token）
   - `motifs_file` —— 绝对路径 \| null。**按需读**：creative_brief 在 `**Motifs:**` 锚点 cite 了 motif id 时，按 id 在这份目录里找对应 CSS（已经 rewrite 成 brand DNA 字体 var，可直接粘）+ demo HTML。没 cite motif 就别读
   - `components[]` —— 0-N 个绝对路径（Phase 3 给本 scene 挑选的 design-system 组件 HTML 片段）。**全部 Read**（每份 0.3-1.5 KB），按 §3 token + §5 effect→asset 映射在 DOM 中粘贴并把所有 class 加 `s<N>-` 前缀避免 sibling 串扰
   - **不要读** `./design-system/design.html` —— 已被 chunks 取代；如果 `design_chunks` 为 null（chunks 缺失），回退去读 `./design-system/design.html` 并自报一个 anomaly

**不要加载**：`hyperframes-cli` / `hyperframes-creative` / `hyperframes-registry`（不在你的范围）。**不要读** `section_plan.md`（dispatch 已经嵌了对应 scene 的 `creative_brief`）。**不要打开** rule_paths / design_chunks 之外的 rule / 其他 component 文件 / sibling worker 的 scene 文件。

## Blueprint 字段

| 取值            | 行为                                                                                  |
| --------------- | ------------------------------------------------------------------------------------- |
| `composed`      | 无 blueprint 引用，按 `effects` 列表自由组合                                          |
| `based-on <id>` | 照搬 blueprint 骨架（DOM 结构、phase 切分、timing 节奏），把 `effects` 嵌入对应 phase |
| `extended <id>` | 同上，允许末尾追加 1-2 个 phase 或替换其中一个 phase                                  |

blueprint 是软引用：文件缺失/不适用 → 回退为 `composed`。但绝不忽略 —— 必须先读再决定。

## 本 skill 特有约束（hyperframes-core 没单独讲的）

这些约束 worker 必须照搬执行；hyperframes-core 已经覆盖的（`<template>` 必须、`Math.random` / `Date.now` / `repeat:-1` / `display`/`visibility` 禁、同步构 timeline）这里不重复，相信你 Read 了 SKILL.md。

1. **CSS / JS selector —— root 用 `#root`，内部元素用 `s<N>-` 前缀**
   - 渲染时 producer 剥掉 `<div class="<scene-id>-root">` 这层 wrapper（preview/snapshot 保留），任何 `.<scene-id>-root .foo` 祖先 selector 渲出来全坏。
   - **规则**：scene 内 class / id 一律 `s<N>-` 前缀（scene_1 → `s1-foo`），selector 写**裸的** `.s1-foo` / `#s1-foo`；JS 同步：`querySelector(".s1-foo")` / `tl.to(".s1-foo", ...)`。root 自身样式只写 `#root { ... }`。
   - **禁**：`.<scene-id>-root` / `#<scene-id>-root` / `[data-composition-id="<sid>"]` / `:root` / 裸 `body` / 裸通用 class（`.card` 等未前缀）。
   - **粘 component 时**：HTML 外层 + 嵌套 class 全部加前缀，内嵌 `<style>` selector 同步改；`var(--*)` / `data-*` / `#root` / CSS 通用 family（`serif`、`sans-serif`）**不前缀**。漏前缀 → sibling scene 串扰。

     ```html
     <!-- ❌ inner class 漏前缀，selector 没同步，var 错误前缀 -->
     <div class="s3-card">
       <span class="headline">{H}</span>
       <style>
         .card {
           background: var(--accent);
         }
         .card .headline {
           color: var(--s3-ink);
         }
       </style>
     </div>

     <!-- ✅ 外层 + 嵌套都前缀，selector 同步，var 原样 -->
     <div class="s3-card">
       <span class="s3-headline">{H}</span>
       <style>
         .s3-card {
           background: var(--accent);
         }
         .s3-card .s3-headline {
           color: var(--ink);
         }
       </style>
     </div>
     ```

2. **`@font-face` 绝不复制到 scene** —— Step 7 在 `index.html` `<head>` 统一声明。scene 内只用 `var(--font-display|body|mono|script)`，**禁止硬编码字面字体名**（绕过 `@font-face`，真实字体无效）。chunks/tokens.css 缺某角色 token 也别降级到字面 family，留 `var(--font-body)` 让 CSS fallback 接管。
3. **Track lane**：scene 内部用 `data-track-index="0"`–`"9"`；`10` / `11` 归 `index.html`（voice / BGM），**不要**在 scene 里发 `<audio>`
4. **Asset src 无前导斜杠** —— `public/hero.png`，不是 `/public/hero.png`
5. **GSAP transform alias 限白名单**：`x` / `y` / `scale` / `rotation` / `opacity`。永不 tween `width` / `height` / `top` / `left`
6. **`voicePath` 非空的 scene** —— Step 7 会在顶层挂 `<audio>` 配合这个 scene 的时长。你不发 `<audio>`，但 timing 设计要给旁白留呼吸空间
7. **注释 / 字符串字面量里不要出现字面 HTML 开标签**（`<template>` / `<style>` / `<script>`）—— linter 用正则扫会误报。转义成 `&lt;template&gt;` 或纯文本。
8. **timeline 注册用 literal scene id 字符串**：`window.__timelines["scene_1"] = tl;`。禁 `SID` 变量绕一层（`check-compositions.mjs` 正则扫认不出）。整段 `<script>` 选择器 / dataset key / timeline key 一律字面。
9. **macro-camera scene 默认挂 layout escape hatch**
   - effects 含 `coordinate-target-zoom` / `multi-phase-camera` / `camera-cursor-tracking` / `viewport-change` 任一 → 最外层 zoom/pan wrapper 挂 `data-layout-allow-overflow="true"`
   - 原因：zoom peak 必然超出 1920×1080 viewport，`hyperframes inspect` 必报 `text_box_overflow`。by-design，提前声明省 finalize 返工 ~60s
   - 例：`<div class="s2-zoom-outer" id="s2-zoom-outer" data-layout-allow-overflow="true">`
10. **Primary handoff before enter（防 overlap）**
    - 每个时刻只有一个 `primary subject`；其他可见内容必须是 `supporting`。
    - creative_brief 有 `PrimarySubjectTimeline` / `Handoff` 时，照做，不要重新设计。
    - New primary 进场前，previous primary 必须 `exit` / `hide` / `compact` / `demote to supporting`；**camera pan/zoom/push 不算 handoff**。
    - Primary 独占 center safe zone；supporting 必须更小、更低对比、更少运动，并避开 primary bbox。
    - 给主要组加 `data-layout-role="primary|supporting"` 和 `data-layout-act="<act-name>"`，方便人工和未来 CLI audit。
    - Timeline 顺序：先 `tl.to(previousPrimary, ...)` 做退场/降级，再 `tl.fromTo(newPrimary, ...)` 进场。
11. **Surface-aware preset 的 `#root` 配色（dispatch `surface` 字段决定）**
    - dispatch 里 `surface: <preset-declared-surface> | null`。**非 null 时**`#root` 背景**不要**默认走 `background: var(--canvas)` —— 真正的画布背景、文字色、装饰 frame / 纹理 overlay 由当前 surface 决定。
    - **粘 surface 的 #root CSS**：Read `design_chunks.hints_file` 的 "Surface `#root` CSS" 段（preset 自己声明的 paste-ready stanza），按 dispatch 给的 surface 名挑对应那块整段粘进 scene `<style>`。所有 `var(--*)` 引用都已经在 tokens.css 里定义好，不要替换。
    - **`::after` 装饰 frame 的 surface 必须 wrap 内容**：composition-hints 里某个 surface 的 CSS 含 `#root::after { ... }` 时，scene 内容必须包一层 `<div style="position:relative; z-index:1;">`（`::after` 是 z-index:0，DOM 默认 z-index:auto，不 wrap 会被 frame 盖住）。
    - `surface: null` 或非 surface-aware preset —— 继续用 `background: var(--canvas)` 默认行为，不读 composition-hints 的 Surface #root CSS 段。
    - 选错 surface 或漏装饰 → mp4 渲出来"普通 SaaS 配色"而不是 preset 的视觉签名，丢掉 preset 一半的辨识度。

## 范围

只写 `<PROJECT_DIR>/compositions/<scene-id>.html`。**不要**动 `index.html` / 拷 asset / 跑 `npx hyperframes lint|validate|inspect|snapshot|render` / 增删 effect（rule 跑不通 → STOP 报告，不静默 drop）。

`effects` 列表里每个 id 都必须在 timeline 上出现一次（4-7 个 effect 一个不少）；具体 fire 时刻、驱动的 asset / 文本、所属 phase 全部由 `creative_brief` 散文（§3 effect→asset 映射 + §5 多阶段编排）指定 —— 你的工作是把 brief 翻译成 GSAP 调用，不是重新设计编排。

## 流程

1. 并行 Read 必读资源（上面 6 条）
2. 对每个 scene 写 `<PROJECT_DIR>/compositions/<scene-id>.html`（骨架见下）
3. 自检（`bash grep` 块见下），失败先修
4. 单行汇报

## 骨架

下面用 `scene_1` 举例（其他 scene 把 `scene_1` / `s1-` 换成自己的编号即可）：

```html
<template id="scene_1-template">
  <div
    id="root"
    class="scene_1-root"
    data-composition-id="scene_1"
    data-width="1920"
    data-height="1080"
    data-duration="<estimatedDuration_s>"
    style="position:relative; width:1920px; height:1080px; overflow:hidden;"
  >
    <style>
      /* root 元素自身的样式（CSS 变量 / 背景 / 字体）—— 写 #root。
         不要写 self data-composition-id selector 或 .scene_1-root。 */
      #root {
        /* chunks/tokens.css 的整个 :root { ... } 块原样粘过来 —— 颜色 token、
           字体角色 token（--font-display / --font-body / --font-mono）、间距、网格都在里面。 */
        --canvas: #f6f3ec;
        --font-display: "ABC Solar Display", system-ui, sans-serif;
        --font-body: "TT Norms Pro", -apple-system, system-ui, sans-serif;
        --font-mono: "JetBrains Mono", ui-monospace, monospace;
        background: var(--canvas);
        font-family: var(--font-body); /* 默认字体；标题等用 var(--font-display) */
        /* --r-md, ... */
      }
      #root *,
      #root *::before,
      #root *::after {
        box-sizing: border-box;
      }

      /* scene 专属规则 —— 全部裸 class，CSS scoper 会自动加 scope。
         class 名带 s1- 前缀，让 sibling scene 不冲突。 */
      .s1-grid {
        /* ... */
      }
      .s1-word {
        /* ... */
      }
    </style>

    <!-- DOM 按 creative_brief 的 effect→asset mapping 搭，blueprint 非 composed 时优先沿用 blueprint DOM 骨架。
         所有 class 都用 s1- 前缀；id 也用 s1- 前缀（例：id="s1-headline"）。 -->

    <script>
      // design.html §5 的 EASE / DUR const，粘过来
      const EASE = { entry: "power2.out" /* ... */ };
      const DUR = { med: 0.55 /* ... */ };
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      // effects 列表顺序 = 视觉层叠顺序（背景 → 主入场 → 持续 → 强调 → 过渡），不是严格时间顺序；
      // 每个 effect 在 timeline 上的 fire 时刻由 creative_brief 散文 §3 / §5 指定。
      // selector 都写裸的 .s1-foo / #s1-foo，不挂祖先。runtime 的 scoped-document
      // proxy 会自动把 query 限定在当前 scene 的 host 子树。
      const headlineEl = document.querySelector("#s1-headline");
      tl.fromTo(
        ".s1-word",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: DUR.med, ease: EASE.entry },
        0,
      );
      window.__timelines["scene_1"] = tl;
    </script>
  </div>
</template>
```

## 自检（每个 scene 都跑，失败先修再报）

把下面 `<scene-id>` 和 `<N>` 替换成真值（如 `scene_1` / `1`）后跑：

```bash
PROJECT_DIR="<Dispatch context PROJECT_DIR>"
F="$PROJECT_DIR/compositions/<scene-id>.html"
SID=<scene-id>; N=<N>

# 文件存在
[ -s "$F" ] || echo "FAIL: empty/missing $F"

# Root 5 属性一次写齐（最常见漏写：data-duration / id="root"）—— 任一缺失就让 finalize 兜底，浪费 round-trip
for ATTR in 'id="root"' "class=\"${SID}-root\"" "data-composition-id=\"${SID}\"" 'data-width="1920"' 'data-height="1080"' 'data-duration="'; do
  grep -q "$ATTR" "$F" || echo "FAIL: root 缺 $ATTR — 5 个属性必须一次写齐"
done

# 注释里禁止字面 HTML 开标签（lint 用正则扫，会把注释里的 <template>/<style>/<script> 当真标签 → 误报 1-2 分钟 debug）
grep -nE '<!--[^>]*<(template|style|script)[> ][^>]*-->' "$F" && \
  echo "FAIL: 注释里有字面 <template>/<style>/<script> — 转义成 &lt;…&gt; 或改成纯文本"

# 必为 0 —— bug 形态
# 1) `.<scene-id>-root` 当祖先选择器（producer 渲染时这层 wrapper 会被剥掉，selector 全部失配 → scene 渲成黑屏）
grep -nE "\\.${SID}-root[[:space:]]" "$F" && echo "FAIL: 不要用 .${SID}-root 作祖先 selector — 写裸的 .s${N}-foo 即可"
# 2) 不要写 self data-composition-id selector；root 样式用 #root，内部元素用 .s<N>-foo / #s<N>-foo
grep -nE "\\[[[:space:]]*data-composition-id[[:space:]]*=[[:space:]]*['\"]${SID}['\"][[:space:]]*\\]" "$F" && \
  echo "FAIL: 不要写 [data-composition-id=\"${SID}\"] selector — root 样式改 #root，内部元素写 .s${N}-foo / #s${N}-foo"
# 3) 禁 #<scene-id>-root；root id 只能写 #root，scene 内部 id 必须是 #s<N>-foo
grep -nE "#${SID}-root\\b|getElementById\\(\"${SID}-root\"\\)" "$F" && echo "FAIL: 不要用 #${SID}-root"
# 4) 老规矩：composition contract 禁的非确定性 / CSS animation / @font-face
grep -nE '@font-face|transition:|animation:|Date\.now|Math\.random|performance\.now|fetch\(|repeat:\s*-1' "$F"
# 5) 字体名必须走 var(--font-*) token —— 硬编码字面字体名会绕过 index.html <head> 的 @font-face
#    白名单：var(--font-display/body/mono)、CSS 通用 family（serif/sans-serif/monospace/system-ui/ui-monospace/ui-sans-serif/ui-serif）、
#         安全 fallback（Georgia/Times/Helvetica/Arial/Menlo/Monaco/SFMono-Regular/-apple-system/BlinkMacSystemFont）
grep -nE "font-family:[[:space:]]*['\"]" "$F" | grep -vE "var\\(--font-(display|body|mono)\\)" && \
  echo "FAIL: 字体名硬编码 — 改用 var(--font-display/body/mono)，让 index.html @font-face 生效"

# 必 ≥ 1 —— 结构证据
grep -c "class=\"${SID}-root\"" "$F"                                   # root div 仍带 class，方便 dev 时看
grep -c "data-composition-id=\"${SID}\"" "$F"                          # host 契约
grep -c "#root" "$F"                                                   # root 自身样式（CSS 变量、bg、font）
grep -c "window\\.__timelines\\[\"${SID}\"\\]" "$F"                    # timeline 注册

# scene 专属 class / id 必须带 s<N>- 前缀（粗匹配：至少出现过一次 .s<N>- 或 #s<N>-）
grep -cE "[.#]s${N}-[a-z]" "$F"

# class 前缀严格检查：列出 HTML class="..." 属性中所有 **未** 加 s<N>- 前缀的 token
# 合法白名单：(1) s<N>- 开头；(2) ${SID}-root（root div 的 class，仅 preview/dev 看）
# 命中 → component 漏前缀，sibling scene 串扰的源头
UNPRX=$(grep -oE 'class="[^"]*"' "$F" \
  | sed -E 's/class="([^"]*)"/\1/' \
  | tr ' ' '\n' \
  | grep -vE "^(s${N}-[a-zA-Z0-9_-]+|${SID}-root)$" \
  | grep -E "^[a-z]" \
  | sort -u)
[ -n "$UNPRX" ] && echo "FAIL: 漏 s${N}- 前缀的 class: $(echo $UNPRX | tr '\n' ' ')"

# asset 全在 PROJECT_DIR/public/
grep -oE 'public/[A-Za-z0-9._/-]+' "$F" | sort -u | while read p; do
  [ -s "$PROJECT_DIR/$p" ] || echo "MISSING ASSET: $p"
done
```

任一 FAIL / MISSING / bug-形态命中 → 修了再报。Step 7 finalize 有同样的 harness，先在这里拦住，省 8-13 分钟 round-trip。

## 汇报模板

每个 scene 一行：

```
scene_2: file=compositions/scene_2.html duration=4.83s effects=[3d-page-scroll, hacker-flip-3d] blueprint=based-on:demo-page-scroll-spotlight
```

外加异常（缺 asset、rule 组合模糊、试图 drop effect）。不写 `context.log`。
