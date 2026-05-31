# Captions (Phase 4a.5) — 确定性,无 subagent

字幕由**两个确定性脚本接力**产出 `compositions/captions.html`,由 `assemble-index.mjs` 在 `index.html` 以 **track-12 clip** 挂上去。**没有 captions LLM agent**(已删)——整条字幕路径零 LLM,因此旧版那一整类"agent 手写 captions.html"的渲染期 footgun(§6 Illegal invocation / timeline 没注册 / 裸色 / 两组同屏 / fitText 没接)**全部归零**。

```
build-captions.mjs       → caption_groups.json          (词引擎:清洗/分组/打 class/全局计时/scene+surface)
build-captions-html.mjs  → compositions/captions.html   (HTML 引擎:选皮肤 + 注词 + brand token 化 + 自检)
assemble-index.mjs       → 文件存在则挂 track-12 clip(data-composition-id="captions", data-start=0, data-duration=total)
```

字幕仍是**独立文件 + 子合成**(不是 inline),所以 **studio caption 编辑器**(认 `.caption-group` + 可 fetch 的 caption 源文件)与运行期 `captionOverrides`(认 `.caption-group/.caption-word`)都继续可用。

---

## 0. 输入

以下是 `build-captions-html.mjs` 的输入;`build-captions.mjs` 的输入是 `group_spec.json`(见 §1)。

| 文件                                           | 用途                                                                                                                                                                                                     |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `caption_groups.json`                          | **唯一词数据源**:`groups[]`(`id`/`scene_id`/`surface`/`start`/`end`/`text`/`words[]`,全局秒、已清洗、已打 class)、`total_duration_s`、`stats`。由 `build-captions.mjs` 产出。                            |
| `design-system/chunks/tokens.css`              | brand DNA(`--font-display`/`--font-body`/`--brand-primary`/`--canvas`/`--ink` + surface 别名)。整段被 inline 进 captions.html 的 `<style data-brand-tokens>`。                                           |
| `design-system/inference.json`(可选)           | 皮肤评分用(site DNA / 选中 preset vibe)。缺了按品牌色明暗回退。                                                                                                                                          |
| `design-system/chunks/caption-skin.html`(可选) | **preset 自带字幕皮肤(第一来源)** —— 选中的 preset 在 `style-presets/<preset>/` 放了 `caption-skin.html` 时,`emit-chunks` 拷到此。**在 → 优先用它**(预烤、已 token 化,见 §2);不在 → 回退 registry 评分。 |

---

## 1. 运行(orchestrator 在 Step 5.5、scene fan-out 之前 Bash 直跑)

```bash
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/build-captions.mjs \
  --group-spec ./group_spec.json --hyperframes . \
  --tokens design-system/chunks/tokens.css --out ./caption_groups.json)

(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/build-captions-html.mjs \
  --hyperframes . --groups ./caption_groups.json \
  --tokens design-system/chunks/tokens.css \
  --inference design-system/inference.json \
  --out compositions/captions.html)
```

**flags(build-captions-html.mjs)**:`--skin caption-<name>` 强制皮肤(仅限受支持集);`--no-emit` 只评分 + 写 `caption_skin_scores.json`、不安装/不生成;`--skin-file <path>` 用预下载皮肤(离线/CI,跳过 `npx hyperframes add`)。

**skip 码(退 0,不是错)**:`captions: skipped (<reason>)` —— 无 caption groups / 无 brand tokens。这种情况不生成 captions.html,assemble-index 不挂 track-12,视频照常出、只是没字幕。

---

## 2. 来源优先级 + 受支持皮肤集

**第一来源 —— preset 自带**:选中的 preset 若带 `chunks/caption-skin.html`(由 `emit-chunks` 从 `style-presets/<preset>/caption-skin.html` 拷来),`build-captions-html.mjs` **优先用它** —— 它是预烤、已 brand-token 化的皮肤,脚本只做**通用填充**(注 `var GROUPS` / `var DURATION` / `data-duration` + inline `tokens.css`),无 per-preset 代码。`--no-preset-skin` 禁用、`--skin <registry>` 仍可强制 registry 皮肤。design.html 也会把它内嵌成 **§C 实时预览**(见 design-system/guide.md)。**没有 caption-skin.html 时**才回退到下面的 registry 闭集评分。

**第二来源 —— registry 闭集。已审入两个皮肤**(脚本 `SKINS` 表 `supported: true`):

| 皮肤                   | 可读性                                | 选中条件(`scoreSkins`)                                                          |
| ---------------------- | ------------------------------------- | ------------------------------------------------------------------------------- |
| `caption-pill-karaoke` | 自带不透明 pill(无需 scrim)           | **安全默认**。`voice_tone` = warm/neutral/缺失 时胜出;任何平局都回退到它        |
| `caption-highlight`    | 透明 → 变换注入 brand-strict scrim 带 | `voice_tone` = **direct** 时胜出(+2);loud preset(neo-brutalism/raw-grid/…)再 +1 |

两者都满足:canonical `.caption-group/.caption-word`(studio + captionOverrides 认;highlight 用自带 `.hl-*` 类**并排**加 canonical 类)、CSS 内配色(可 token 化)、底部位置、可绕过的运行期分组。`scoreSkins` 用 `inference.json` 的 `site_dna.voice_tone` + `selected.name` 打分,**确定性**、平局永远回 pill-karaoke。`--skin <name>` 强制覆盖评分。

其余皮肤各有专属阻碍,需**逐个**按 descriptor 审入(见脚本里 `SKINS` 表 + 对应 transform 分支),**不要**假定即插即用:

| 皮肤                    | 阻碍                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| neon-accent / emoji-pop | 颜色/辉光在 **JS 里 parseInt(hex) 算** → 无法机械 token 化;且关键词/emoji 是硬编码英文词表(换产品就动画变哑) |
| weight-shift            | 无 `.caption-word` 类(动画作用在行上)→ studio 检测有缺口                                                     |
| clip-wipe               | `.wp-*` 类名 + RAW_GROUPS/KEYWORDS **按索引硬编码**                                                          |
| editorial-emphasis      | 字幕在 `top:580px` **画布中部** → 与底部字幕带模型不兼容                                                     |

`--skin` 指到未支持皮肤 → 脚本退 1 并打印具体原因。

---

## 3. build-captions-html.mjs 对皮肤做的确定性改造(以 pill-karaoke 为例)

脚本读下载到的皮肤文件,按 descriptor 做**有断言的字符串变换**(任一 handle 找不到 = registry 漂移 = 响亮退 1,绝不静默出空字幕):

1. 删 Google Fonts `<link>`(品牌 @font-face 由 assemble-index 注入 index.html,子合成被 flatten 进该文档即可用)。
2. 删 demo `<video>` 占位 + 其死 CSS。
3. host `data-composition-id="caption-pill-karaoke"` → `"captions"`;`data-duration="8"` → `total_duration_s`。
4. **`var DURATION = 8` → `total_duration_s`**。否则皮肤的 `normalizeWords` 把所有词 end 钳到 8s → 60-90s 视频 8 秒后字幕全废。
5. **注入引擎分组**:`var GROUPS = <caption_groups 的 groups>`,绕过皮肤自带的 `normalizeWords` + scene 无关的 `makeGroups`。引擎分组已是全局秒、scene-aware、不重叠 —— 一步同时解决"词被钳到 8s"和"字幕跨 scene 切口"。
6. 逐词 karaoke 从**改 color 值**改成**切 `.is-active` class**(颜色由 CSS token 给):`.caption-word { color: color-mix(--ink 45%, --canvas) }`、`.caption-word.is-active { color: var(--ink) }`。gsap 无法插值 `var()` 颜色,class flip 既 brand-strict 又可读。
7. **双改名**:host `data-composition-id` 与 `window.__timelines["caption-pill-karaoke"]` **都**改成 `"captions"`(compositionScoping 仅在 timeline key === inner root 的 composition-id 时才重映射写入 —— 双改才落到 `__timelines["captions"]`)。
8. 全片尾锚 `tl.to({}, { duration: DURATION }, 0)`,让子合成 timeline 时长 == host clip 时长。
9. inline `tokens.css` 到 `<style data-brand-tokens>`;CSS 内硬编码色/字 token 化:pill bg `#e7e5e7` → `var(--canvas)`、阴影 `rgba(0,0,0,.12)` → `color-mix(in srgb, var(--ink) 14%, transparent)`、字体 `"Poppins"` → `var(--font-display)`(JS 里 measureText 的 `FONT_FAMILY` 用 tokens.css 提取出的真实族名,canvas 量字不能用 `var()`)。

**可读性(本 skill = vito-A keep-out + 带)**:pill-karaoke 自带**不透明 pill**(`background: var(--canvas)` + active 文字 `var(--ink)` → 恒对比),**无需** scrim、**无需**渲染期对比探针。透明类皮肤(如 caption-highlight)才需在 caption root 第一个子元素加一条 brand-strict 渐变 scrim 带(`color-mix(var(--ink) …)`,z-index 在 `.caption-group` 之下)。scene 前景留上 ~83% 的 keep-out 由 `hyperframes-scene.md` 约束 #13 + visual-design 在 brief 里强制(见那两处),不在本脚本。

### 3b. caption-highlight 的不同/额外改造

highlight(TikTok 式逐词红底扫光)与 pill 走**独立 transform 分支**,差异点:

1. **无 demo `<video>` 元素**(只有死的 `#hl-video` CSS)→ 不删元素,只删那条死 CSS 规则。
2. **分组数据形状不同**:它的 build/timeline 循环吃**扁平全局 `WORDS` 数组** + `GROUPS` 的 `{wordStart,wordEnd,start,end}` 索引区间(词 el id = `wordStart+i`)。变换把引擎 groups 摊平成这两个结构,**同时**干掉 demo `TRANSCRIPT` 和**按索引硬编码的 `RAW_GROUPS`**(就是 clip-wipe 同款阻碍 —— 这里被新分支结构性解决)。
3. **类名并排**:`.hl-group`/`.hl-word` 旁边**加** canonical `.caption-group`/`.caption-word`(保留自带动画的同时让 studio/captionOverrides 认出)。
4. **scrim 带**:它透明,所以把满屏第一子元素 `.hl-overlay`(z-index 1,在词 z-index 10 之下)tokenize 成一条底部 brand-strict 渐变带(`color-mix(var(--ink) …)`)。
5. **自适应对比(关键)**:active 词压在 `var(--brand-primary)` 满填充上,而**主色明暗在构建期未知**(确定性脚本不能量色,也不赌 `contrast-color()`)——所以**没有任何单一文字色**对它恒安全(canvas 在浅主色上糊、ink 在深主色上糊)。解法:文字 `var(--canvas)` 填充 **+ 8 向 `var(--ink)` 描边**(外加一层柔 ink 投影)。可读性不再依赖主色亮度,而是骑在**保证对比的 `canvas↔ink` 对**上:浅主色→ink 描边勾边,深主色→canvas 填充跳出,任意主色都清。inactive 词在 scrim 上同理(描边定形)。
6. **配色 token 化**:红渐变 `#ff1745→#df1238` → `var(--brand-primary)`(深端 `color-mix(... var(--ink))`)满填充保留;红阴影 → `color-mix`;文字阴影 → 上面的 ink 描边;`"Montserrat"` → `var(--font-display)`(canvas measureText 用 tokens 提取的真实族名)。
7. **几何**:80px 大写 @ `bottom:140px` 顶到 ~y845(高于保留带)→ 缩到 46px @ `bottom:36px`,1-2 行都落进 keep-out 带(y900–1080)。
8. 双改名 → `"captions"` + 全片尾锚(同 pill 的 7/8 步)。

**self-lint**:公共门 + 皮肤专属门(pill / highlight 各有专属断言)见 §4。

---

## 4. node 结构自检(取代旧浏览器 self-lint)

`build-captions-html.mjs` 写文件前对产物断言(`check-compositions.mjs` 不扫 captions.html,这是唯一结构 gate)。任一失败退 1。

**公共门**:`data-composition-id="captions"` 在、字面 `window.__timelines["captions"]` 在、`.caption-group`/`.caption-word` 在、占位串 "Every great video starts" 没了、demo video 没了、无 Google Fonts link、**无 `window.getComputedStyle(`/`requestAnimationFrame(`/`matchMedia(`**、`DURATION === total_duration_s`、品牌严格(剥 `<style data-brand-tokens>` 后零裸 hex/rgb)。

**皮肤专属门**:pill —— 无 `#avatar-video`、`var DURATION` 改写;highlight —— 无 `RAW_GROUPS` 残留、无 `<video>`、全片尾锚在。

---

## 5. Failure modes

| 现象                                          | 根因                                       | 修法                                                                                         |
| --------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `captions: skipped`                           | 无 caption_groups / 无 tokens.css          | 正常 —— 不挂 track-12,视频照常出                                                             |
| `transform "...": expected literal not found` | registry 皮肤改版、handle 漂移             | 对照新皮肤源码更新脚本里该皮肤的 descriptor / 变换字符串                                     |
| `self-lint: brand-strict violation`           | 有色/字没 token 化(扩皮肤时常见)           | 给该皮肤补 token 化映射;JS 里 parseInt(hex) 算色的皮肤(neon/emoji)无法机械 token 化 —— 见 §2 |
| `--skin "..." not yet supported`              | 指到未审入皮肤                             | 用受支持集,或按 §2/§3 给该皮肤写 descriptor + 变换                                           |
| `npx hyperframes add ... failed`              | 离线/无 registry                           | 传 `--skin-file <已下载皮肤>`                                                                |
| 8 秒后字幕错乱                                | (回归)DURATION 没改写                      | 自检已断言 `DURATION === total`;确认变换步骤 4 命中                                          |
| 字幕跨 scene 切口 / 两组同屏                  | (回归)用了皮肤自带 makeGroups 而非引擎分组 | 确认变换步骤 5 命中(注入引擎 GROUPS)                                                         |

---

## 6. 验收

渲一条 60-90s 带字幕视频,核对:① 8s 后字幕正常(DURATION/全片尾锚);② 逐词高亮 + 不跨 scene 重叠(引擎分组);③ 暗/亮主题下都可读(pill 自带对比 / highlight 的 scrim 带);④ scene 前景在上 ~83%、背景满铺(keep-out);⑤ studio 能识别 `.caption-group`;⑥ node 自检零失败;⑦ `--no-emit` 选皮肤可复核(neutral→pill、direct→highlight);⑧ `--skin caption-highlight` 强制可出。
