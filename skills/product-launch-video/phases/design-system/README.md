# Style Preset 标准 — 以 Block Frame 为参照

`block-frame/` 是**参照实现(reference preset)**。这份 README 定义一个 style preset 必须包含什么、各部分产出什么,以及如何**新增 / 重构 / 从其它风格转换**成本标准格式。

> 起一个新 preset 最快的方式:`cp -r block-frame <new-name>`,然后按 §2 逐节改写、按 §4 守规矩、按 §6 验证。

---

## 1. 目录形态

```
<preset-name>/                 # 目录名 = preset 内部名(小写 kebab-case)
├── preset.md                  # preset-meta + §A/§B/§D/§T/§E/§G/§H/§I
├── components/                # ≥1 个 <id>.md,每个一段可粘贴的块
│   ├── hero.md
│   ├── feature-card.md
│   └── …
├── caption-skin.html          # 必需 — preset 自带字幕皮肤(见 §3.5)
└── README.md                  # 仅 block-frame 有(本文件 = 标准说明)
```

构建脚本(`phases/design-system/scripts/build-design.mjs`)按目录读取;**无 `studio` 之类的额外约定文件**。

---

## 2. `preset.md` —— 从上到下

### 2.0 `preset-meta`(围栏 JSON,**必需** —— 缺了或非法 JSON 直接构建失败)

文件**第一个块**必须是 ` ```preset-meta { … } ``` `。Block Frame 的:

```json
{
  "name": "block-frame",              // 内部名,= 目录名
  "label": "Block Frame",             // 展示名
  "fingerprint": {                    // 一句话风格指纹(人读 + 选 preset 时参考)
    "shadow": "hard-offset-black", "border": "4px-solid-ink",
    "palette": "saturated-pastel-cycle", "motion": "tilt-and-snap",
    "decoration": "tilted-puncture"
  },
  "match_signals": [                  // 自动推断用:抓取站点命中这些信号→加权选中本 preset
    { "kind": "shadow_zero_blur", "weight": 0.3 },
    { "kind": "thick_solid_border", "weight": 0.3 }
  ],
  "best_for": ["indie SaaS launches", "agency credentials", …],   // 适用场景
  "avoid_for": ["regulated disclosures", "formal legal briefs", …], // 不适用
  "chromeFonts": {                    // design.html 预览页用的"原生字体"(非品牌 DNA)
    "googleFontsHref": "https://fonts.googleapis.com/css2?family=Inter:wght@…&family=Space+Grotesk:wght@…&display=swap",
    "display": "Inter", "body": "Inter", "script": "Inter", "mono": "Space Grotesk"
  }
}
```

- `match_signals` 决定 `build-design` 不带 `--style` 时的自动命中;手动 `--style <name>` 时忽略。
- `chromeFonts` 让 design.html 的文档外壳 + §T atlas + §6 预览用 preset 原生字体渲染(经 `.preset-native-scope`,见 §I);**品牌字体仍作用于 §6 component 的可粘贴代码**。

### 2.1 各 `## §X` 章节

按 `## §<字母> <标题>` 解析。Block Frame 含 8 节,顺序如下:

| 节                             | 必需?        | 内容                                                                             | 下游产物                                       |
| ------------------------------ | ------------ | -------------------------------------------------------------------------------- | ---------------------------------------------- |
| **§A** Director's intent       | 推荐         | 散文:这套风格的导演意图、调性                                                    | design.html §1 prose                           |
| **§B** Decoration tokens       | **必需**     | `:root { … }` 设计 token                                                         | → `ROOT` 标记 → `chunks/tokens.css`            |
| **§D** Font pairing fallback   | 推荐         | 每个 role 一条 bullet:`- **display**: \`'Name1'\` · \`'Name2'\``                 | 站点字体解析不到时的回退链(缺失则走最终硬回退) |
| **§T** Type-role atlas         | 可选(标准含) | ` ```type-roles ` JSON,命名文字角色                                              | → `chunks/type-roles.md`(worker 按 id 查)      |
| **§E** Motion                  | **必需**     | `const EASE = {…}; const DUR = {…}` GSAP 常量                                    | → `MOTION` 标记 → `chunks/easings.js`          |
| **§G** Voice transform recipe  | **必需**     | DOM 可见文字的改写 register(strip/case/断句)                                     | → `VOICE` 标记 → `chunks/voice.md`             |
| **§H** Scene composition hints | 推荐         | surface 契约 / 材质互斥 / 60-30-10 配色                                          | → `HINTS` → `chunks/composition-hints.md`      |
| **§I** Page-level CSS          | 可选(标准含) | design.html 外壳 CSS + `.preset-native-scope` + `.t-trole-*` 角色 CSS + 装饰 CSS | 注入 design.html `<style>`                     |

**两条硬约束(parser 会直接报错退出):**

- **不要写 `## §F`** —— §F(components)由 `components/` 目录自动合成;写了会 `✗ declares §F inline`。
- **不要保留 `## §M`(Atomic motifs)** —— motif 特性已从本标准移除,改用 §6 component 表达招牌手势。新 preset 不应有 §M;重构旧 preset 时删掉它(连同 §I 里的 `.ds-motif*` CSS)。

**`§B` token 命名约定**(Block Frame 示例):品牌色 `--brand-primary/secondary/tertiary/accent/costume`、`--ink`、`--canvas`、`--brand-gradient`、装饰色 `--deco-1..4`、字体 `--font-display/body/mono`,以及 preset 私有 token 用前缀(Block Frame 用 `--bf-*`:`--bf-border-bold`、`--bf-shadow`、`--bf-tilt-*`、`--bf-pad-*`…)。

**`§T` 角色 schema**(每条):`id` · `family`(display/body/mono/script,渲染时解析成 `var(--font-*)`)· `purpose` · `px_min`/`px_max` · `weight` · `leading` · `tracking` · `case` · `sample_html`(用 `.t-trole-<id>` class)。每个角色的装饰 CSS 写在 §I 的 `.t-trole-<id> { … }`。Block Frame 现有 11 个:`heading-xl / heading-lg / heading-md / close-title / quote-text / stat-number / card-title / step-num / label-pill / mono-tag / counter`。

---

## 3. `components/` —— 可粘贴组件

- **一个 `.md` = 一个组件**;文件名(去 `.md`)= id,必须 `[a-z0-9-]+`。
- 至少 **1 个**(零组件构建失败)。按文件名字母序 → 产物确定。
- 文件体 = **裸 HTML + 可选 `<style>`**,用 `{SLOT}` 占位(如 `{HEADLINE}`/`{LEDE}`/`{NUM}`)。**不要**自己加 `<!-- COMPONENT -->` 标记(parser 加)。
- 可选 YAML frontmatter(surface-aware preset 用),给 plan agent 过滤:
  ```
  ---
  surface: pastel
  role: statement
  composes: offset-shadow
  avoids_same_scene: end-stamp
  slots: [headline, body]
  ---
  ```
- CSS 用 `var(--*)` 引品牌 token,class 加 preset 前缀(Block Frame 用 `.bf-*`)。Block Frame 现有 10 个:`hero / feature-card / stat-counter / timeline-step / quote-frame / button / chip / dot-grid-bg / corner-pins / star-burst`。

---

## 3.5 `caption-skin.html` —— 字幕皮肤(**必需**,preset 自带)

每个 preset **必需**在根目录放一个 `caption-skin.html`(与 `preset.md` 同级)= 这套 style **自己的下三分之一 karaoke 字幕外观**。字幕是视频的一等内容,不是可选附件 —— 没有它,字幕就套用通用 registry pill,与这套 style 的视觉语言断裂。Block Frame 带了一个作参照。

**优先级 / 数据流**:选中的 preset 若有 `caption-skin.html`,它是字幕的**第一来源** —— `emit-chunks` 拷成 `chunks/caption-skin.html`,Phase 4a.5 的 `build-captions-html.mjs` **优先用它**(没有才回退 registry 的 `caption-pill-karaoke` / `caption-highlight` 评分);`build-design` 还把它内嵌成 design.html 的 **§C 实时预览**(循环播放)。**整条链零 agent 判断** —— 脚本自动选用、填词、自检。

它是一个**"预烤"皮肤**:作者写好完整、已 brand-token 化的字幕子合成,脚本只做**通用填充**(下面三个洞,各断言恰好出现一次),不含任何 per-preset 代码。所以**契约必须严守**:

| 作者必须写好                                                                                                             | builder 填的洞(勿改名 / 勿多写)                                                           |
| ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| 根 `data-composition-id="captions"` + 注册 `window.__timelines["captions"]`                                              | `var GROUPS = [];` ← 引擎分组                                                             |
| canonical 钩子 `.caption-group` / `.caption-word`(+ 状态 `.is-active` / `.is-spoken`)                                    | `var DURATION = 0;` 和根 `data-duration="0"` ← 真实总时长                                 |
| 颜色全 `var(--*)` / `color-mix` —— **零裸 hex**(过 self-lint)                                                            | 空 `<style data-brand-tokens></style>` ← inline `tokens.css`(含 @font-face)               |
| 无 `<video>` / 无 Google Fonts `<link>` / 无占位文案 / 无 `window.{getComputedStyle,requestAnimationFrame,matchMedia}()` | (可选)`var FONT_FAMILY = "";` ← 品牌 display 族名(仅当皮肤用 canvas `measureText` 做 fit) |

**seek-safe 铁律**:状态切换必须用 `gsap.set(el, { className: "caption-word is-active" })`(引擎逐帧 seek 时 `set` 会生效);**绝不**用 `tl.call()` 回调(seek 不触发 → 渲染期字幕状态错)。GSAP 走 CDN `<script>` 可以。

**怎么写一个**:

1. `cp block-frame/caption-skin.html <your-preset>/caption-skin.html` —— 它已是合规模板(三个洞 + 钩子 + seek-safe 时间线 + 通用 `buildCaptions(GROUPS)` 全在)。
2. **只改 `<style>` 里的视觉**:`.caption-pill` / `.caption-line` / `.caption-word{,.is-active,.is-spoken}` 换成你 preset 的 token(边框 / 阴影 / 圆角 / 字体 / active 高亮)。**别动**三个洞、`.caption-*` 类名、`data-composition-id`、`window.__timelines["captions"]`、`gsap.set(className)` 那套。
3. 颜色只用 §B 的 `var(--*)`;字号 `clamp()` + flex-wrap 自适应,下沿落进底部字幕带(约 y900–1080)。

**验证**:跑 §8 的 `build-design` + `emit-chunks` → design.html 滚到 **§C** 看实时效果;字幕产物跑 `build-captions-html.mjs`(见 `phases/captions/guide.md`),stdout 应打印 `skin: preset-skin (preset-local → …)` + `self-lint: OK`(自检覆盖上表所有契约项,任一不符响亮退 1)。

> registry 的两套 karaoke 皮肤(`caption-pill-karaoke` / `caption-highlight`)仍在,但只作为**尚未迁移的旧 preset 的安全网 + 运行期兜底** —— 本标准要求每个 preset 自带 `caption-skin.html`,缺了即**不合标准**(字幕风格会断裂成通用 SaaS pill)。`build-captions-html.mjs` 当前不会因缺皮肤而报错(回退而非退 1),所以这条**靠本标准约束、暂未机器强制**;迁移现状见 §8。

---

## 4. 标准的不变量(House rules)

1. **所有文字 ≥ 24px** —— §T 每个角色的 `px_min` **和** §I 的 `.t-trole-*` font-size、以及**每个 component 的 font-size** 都不得低于 24px。视频远观要一眼可读;`build-design.mjs` 自己也写着 "Don't use body text under 24px in video"。标题给到 ~28px 以压住 24px 的正文(标题 > 正文)。纯装饰非文字(如 120px 引号、边框/阴影 px)不受限。
2. **无 §M motifs** —— 招牌手势用 component 表达,不用 motif。
3. **CSS 自包含** —— component / §T 角色 CSS 只用 `var(--*)` token,**零裸 hex/rgb**(品牌色全部 token 化)。
4. **class 前缀分层** —— `.t-trole-*` = §T 角色;`.<prefix>-*`(如 `.bf-`)= 本 preset 的 component/装饰;`.ds-*` / `.preset-native-scope` 保留给 design.html 外壳,别在 component 里用。
5. **章节顺序** 按 §2 表;`§F` 永不内联;`preset-meta` 永远在最前。
6. **自带 `caption-skin.html`** —— 每个 preset 必需提供字幕皮肤(§3.5),不是可选附件。按 §3.5 契约写(三个洞 + canonical 钩子 + seek-safe `gsap.set` + 零裸色),让下三分之一字幕与 component 同一视觉语言。缺它 = 不合标准。

---

## 5. 新增一个 preset

```bash
cd phases/design-system/style-presets
cp -r block-frame my-new-style
cd my-new-style
```

1. 改 `preset.md` 的 `preset-meta`:`name`/`label`/`fingerprint`/`match_signals`/`best_for`/`avoid_for`/`chromeFonts`(换成新风格的原生字体 + Google Fonts href)。
2. 逐节改写 §A→§I:换 §B token(色/字/几何)、§D 回退字体、§T 角色尺度(**px_min ≥24**)、§E 的 EASE/DUR、§G voice recipe、§H surface 规则、§I 外壳 + `.t-trole-*` + 装饰 CSS。
3. 重写 `components/*.md`(把 `.bf-` 前缀换成你的;**所有 font-size ≥24**)。
4. 改 `caption-skin.html` 的 `<style>` 视觉为新风格(§3.5 契约:只动视觉,别碰三个洞 / `.caption-*` 钩子 / `data-composition-id` / `window.__timelines["captions"]` / `gsap.set` 那套)。`cp -r block-frame` 已把它带过来,改视觉即可。
5. 按 §6 重新生成 + 验证。

## 6. 把旧 preset 重构成本标准

逐项过(可拿 block-frame 对照):

- [ ] 删 `## §M` 整节 + §I 里的 `.ds-motif*` CSS 块(motif 已废)。
- [ ] §T:每个角色 `px_min` 抬到 ≥24;同步把 §I 对应 `.t-trole-<id>` font-size 抬到 ≥24;删掉纯小字内容角色(如 15px 的 card-body / 18px 的 subtitle),它们焊死的招牌可在 component 里保留。
- [ ] `components/*.md`:扫每个 `<style>` 的 font-size,全部 ≥24(标题>正文)。
- [ ] 确保 ≥1 个 component;`§F` 没内联;`preset-meta` 合法。
- [ ] 裸 hex → token 化。
- [ ] 加 `caption-skin.html`(§3.5,必需):`cp block-frame/caption-skin.html` 后改 `<style>` 视觉成本风格、token 化零裸色;跑 `build-captions-html.mjs` 应打印 `self-lint: OK`。
- [ ] 按 §6 生成 + 验证。

## 7. 从"其它风格"(网页 / Figma / 品牌规范)转成 preset

1. **抽 DNA**:主色/中性/强调 → §B token;字体族 → `chromeFonts` + §D;圆角/边框/阴影/间距 → §B 私有 token(`--xx-*`)。
2. **定文字尺度** → §T 角色(**全部 ≥24**),含 hero/标题/正文/eyebrow/数字/计数器等。
3. **招牌手势 → component**:把该风格"一眼认得出"的构件(卡片、引用框、stat、时间线、装饰)各做成一个 `components/<id>.md`。
4. **填** §A 意图、§E 运动语言、§G voice、§H surface 规则。
5. **字幕外观 → `caption-skin.html`**(§3.5,必需):把这套风格的下三分之一字幕按契约做出来(`cp` block-frame 改视觉)。
6. 套 §4 不变量,按 §6 验证。

---

## 8. 生成 & 验证闭环

```bash
# 从项目根跑(<ds-dir> 是某视频项目的 design-system 目录,<cap> 是 hyperframes capture 目录)
node phases/design-system/scripts/build-design.mjs <ds-dir> --capture <cap> --style <preset-name>
node phases/design-system/scripts/emit-chunks.mjs   <ds-dir>
```

- `build-design` → `<ds-dir>/design.html` + `inference.json`;`--no-emit` 只算推断分、不渲染。
- `emit-chunks` → `<ds-dir>/chunks/`(tokens.css / easings.js / voice.md / composition-hints.md / type-roles.md / components/\*.html / index.json;preset 带 `caption-skin.html` 时还拷出 `chunks/caption-skin.html` 并记入 `index.json.caption_skin_file`,见 §3.5)。**design.html 缺 ROOT/MOTION/VOICE 标记会 exit 1**(即 §B/§E/§G 必须产出)。

**"无小字"验证**(改完必跑):列出所有 <24px 的 font-size(**空输出 = 通过**)。覆盖 `px` / `rem`(×16) / `vw`(×19.2 @1920),且只看每条的**首个尺寸 token**(= clamp 下限或裸值),不误伤 clamp 中间的 vw 项:

```bash
grep -rhoE "font-size:[^;]+" <ds-dir>/chunks/components/*.html <ds-dir>/chunks/type-roles.md \
  | awk 'match($0,/[0-9.]+(px|rem|vw)/){t=substr($0,RSTART,RLENGTH);n=t+0;p=n;
         if(t~/rem$/)p=n*16; if(t~/vw$/)p=n*19.2;
         if(p<24)print "  ⚠ "t" ≈ "p"px  ← "$0}'
```

> ⚠️ **不要只扫 `px`** —— `rem` / `vw` 写的小字会被漏掉(capsule 的组件全是 `rem`,一度骗过 px-only 检查)。上面这条 px/rem/vw 三料归一的版本才可靠。

> 跨全部 preset 的 §T+component 小字清扫尚未做(目前 block-frame + capsule 达标,其余 19 个待清)。若要"今后任何 preset 都不许有小字",需先把 21 个 preset 全扫干净,再在校验脚本里加一条 font-size 下限 lint(否则会让未清扫的 preset 构建报错)。

**`caption-skin.html` 验证**(§4 规则 6,必需):每个 preset 应自带,跑

```bash
node skills/product-launch-video/scripts/build-captions-html.mjs \
  --hyperframes <ds-dir> --groups <caption_groups.json> \
  --tokens <ds-dir>/chunks/tokens.css --out <ds-dir>/compositions/captions.html
```

stdout 应打印 `skin: preset-skin (preset-local → …)` + `self-lint: OK`。

> 迁移现状:**block-frame + capsule + scatterbrain** 已自带 `caption-skin.html`,其余 ~18 个待补。builder 缺皮肤时回退 registry 而非退 1,所以这条规则**靠标准约束、暂未机器强制** —— 同小字 lint,要硬 gate 得先把全部 preset 补齐再加校验(否则未迁移的 preset 会报错)。
