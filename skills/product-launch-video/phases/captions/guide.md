# Captions (Phase 4a.5)

为 product-launch-video 写一个 **全片 full-bleed sub-composition** `compositions/captions.html`，由 hyperframes-finalize 在 `index.html` 以 track 12 clip 挂上去。

这是 **agent-authored**（不是 registry-patch）：你直接读 `group_spec.json` + 各 scene 的 whisper word JSON + `design-system/chunks/tokens.css`，写一个 HTML 出来。**没有** registry `caption-*` 组件、**没有** builder 脚本、**不读** `narrator_scripts.json` 的 `captions[]` 字段。

## 0. 输入

| 文件                                      | 用途                                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| `group_spec.json`                         | `total_duration_s`；`groups[].scenes[<sid>].start_s` / `estimatedDuration_s` / `wordsPath` |
| `assets/voice/scene_<N>_words.json`       | 单 scene whisper word array：`[{ text, start, end }]`，时间是 **scene-local**              |
| `design-system/chunks/tokens.css`         | brand DNA：`var(--font-display)` / `var(--brand-primary)` / `var(--canvas)` / `--ink` ...  |
| `design-system/chunks/easings.js`（可选） | 若有 `EASE.entry` / `EASE.exit` 等命名 ease，沿用；没有就用下方 defaults                   |

**不要读** `narrator_scripts.json`。`narrator_scripts.captions[]` 已被废除——agent 模式自己分组。

**前置**：scene 至少有一个 `wordsPath` 文件存在。**所有** scene 都没 voice → 跳过整个 phase（finalize 不挂 track-12 clip）。

## 1. 装载词流

按 scene order（`groups[].scene_ids` 按数组顺序）依次读每个 `wordsPath`，把 scene-local 时间加上 `scenes[<sid>].start_s` 转成 **全局秒数**。结果是单一展平词列：

```json
[
  { "text": "Imagine", "start": 0.06, "end": 0.32, "scene_id": "scene_1" },
  { "text": "making",  "start": 0.32, "end": 0.97, "scene_id": "scene_1" },
  …
]
```

带 `scene_id` 因为分组要在 scene 边界断开（见 §3）。

## 2. 清理词流

按顺序丢这些：

| 丢什么                                                     | 理由                       |
| ---------------------------------------------------------- | -------------------------- |
| `text` 是 `♪` / `�` / `♪-♯` 单符号                         | whisper 检到音乐，不是语音 |
| `text` 全部非字母数字（纯标点）                            | 不能独立成词               |
| `end - start < 0.05`                                       | 时间戳不可靠，会跟相邻词撞 |
| `text` ∈ {uh, um, ah, oh, huh}（不区分大小写）且 dur <0.1s | filler hallucination       |

不丢句末标点附着的词（"Figma." 留着，"." 单独不留）。

## 3. 自动分组

从清完的词流切组。**遵守的硬规则**：

1. **不跨 scene 边界**：当前词的 `scene_id` ≠ 前一个 → 强制开新组（即使语义未完）
2. **句末标点切组**：`.` `?` `!` `,` `—` `;` `:` 词尾 → 当前词收尾，下一词开新组
3. **silence gap 切组**：当前 `start` − 前一 `end` > **0.18s** → 开新组
4. **上限 4 词**：当前组到 4 词 → 强制收尾

**节奏软指南**（不是 lint 规则，影响可读性）：

- 高密度旁白（>2.5 词/秒）→ 倾向更短组（2-3 词）
- 抒情段（<1.5 词/秒）→ 允许 3-4 词组

每组算 `group.start = words[0].start`、`group.end = words[words.length-1].end + 0.12`（多 120ms 让最后一个词看完）。

## 4. ALL CAPS / numeric 词自动加 class

不读 narrator_scripts 标签，但词本身可推：

- `text` 是 ≥2 字母**全大写** → 加 `is-allcaps` class（scale × 1.06）
- `text` 第一个字符是数字（`/^[0-9]/`） → 加 `is-numeric` class（font-weight 加重一档）

这是免费的视觉强调，不依赖任何上游 tag。

## 5. CSS 契约：brand-strict

`compositions/captions.html` 的 `<style>` **只能用 token 变量**，**禁止**：

- 硬编码 HEX / RGB / named color（除 `transparent` / `currentColor` / `none`）
- 硬编码字体名（`'Inter'` / `'Montserrat'` 等）—— 必须 `var(--font-display)` / `var(--font-body)`
- 跨 `var(--*)` 的 fallback 链是 ok 的（`var(--font-display, system-ui)`）

**`<head>` 必须先 prepend `tokens.css`**：

```html
<head>
  …
  <style data-brand-tokens>
    /* @file: design-system/chunks/tokens.css verbatim */
    :root { --brand-primary: …; --font-display: …; … }
  </style>
  <style>
    /* caption styles below, using only var(--*) */
    …
  </style>
</head>
```

把 tokens.css 的全文嵌进 `<style data-brand-tokens>`，**不要**用 `@import` / `<link>`（sub-comp 渲染时基 URL 不一定能找到外链）。

## 6. 位置 / 字号 / 动效（landscape 1920×1080 default）

```css
.cap-root {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.cap-group {
  position: absolute;
  bottom: 120px; /* 抬高就改这里；不要 50/transform */
  left: 0;
  right: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 18px;
  padding: 0 96px; /* 字溢出 1920 时由 fitTextFontSize 收 */
  opacity: 0;
  visibility: hidden;
  will-change: opacity, transform;
}
.cap-word {
  font-family: var(--font-display, system-ui);
  font-weight: 800;
  font-size: 84px;
  line-height: 1.08;
  letter-spacing: -0.01em;
  color: var(--canvas, #fff);
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.32);
  transform-origin: 50% 60%;
  will-change: transform, color;
}
.cap-word.is-allcaps {
  transform: scale(1.06);
}
.cap-word.is-numeric {
  font-weight: 900;
}
.cap-word.is-active {
  color: var(--brand-primary, var(--canvas));
}
```

**字号防溢出**：渲染前用 `window.__hyperframes.fitTextFontSize(group.text, { fontFamily, fontWeight: 800, baseFontSize: 84, maxWidth: 1700, minFontSize: 44 })` 收掉超宽组（应用到 group 整体，不分词）。

**动效（缺省）**：

- group 进场：`tl.fromTo(el, {y: 24, opacity: 0}, {y: 0, opacity: 1, duration: 0.22, ease: "back.out(1.04)"}, group.start)`
- per-word karaoke：`tl.to("#word-<i>", {className: "+=is-active", duration: 0}, word.start)`（瞬切，颜色 transition 由 CSS 给）
- group 离场：`tl.to(el, {opacity: 0, y: -8, duration: 0.14, ease: "power2.in"}, group.end - 0.14)`
- **硬关**：`tl.set(el, {opacity: 0, visibility: "hidden"}, group.end)`

ease 名字优先沿用 `chunks/easings.js` 里的命名（如 `EASE.entry`、`EASE.exit`）。

## 7. Sub-composition root 契约

```html
<body>
  <div
    id="captions-root"
    class="cap-root"
    data-composition-id="captions"
    data-start="0"
    data-duration="<total_duration_s>"
    data-width="1920"
    data-height="1080"
  >
    <div class="cap-group" id="cap-grp-0">
      <span class="cap-word" id="cap-w-0">Imagine</span>
      <span class="cap-word" id="cap-w-1">making</span>
    </div>
    …
  </div>

  <script>
    window.__timelines = window.__timelines || {};
    const tl = gsap.timeline({ paused: true });
    /* …per-group tl.fromTo / per-word className flip / tl.set kill… */
    window.__timelines["captions"] = tl;
  </script>
</body>
```

- `data-composition-id="captions"` 必须等于 host clip 的 `data-composition-id`（finalize 写的就是 `captions`）
- 时间线注册键名也是字面 `"captions"`（不要变量绕一层；`check-compositions.mjs` 正则扫）
- 整个 sub-comp 用 GSAP（CDN 加载在 `<head>`，跟 scene 一致）

## 8. 自检（写完后跑）

在 timeline 注册前插一段 self-lint，单 group 可见性回归到 0：

```js
GROUPS.forEach(function (group, gi) {
  var el = document.getElementById("cap-grp-" + gi);
  if (!el) return;
  tl.seek(group.end + 0.01);
  var cs = window.getComputedStyle(el);
  if (cs.opacity !== "0" && cs.visibility !== "hidden") {
    console.warn(
      "[caption-lint] group " + gi + " still visible at t=" + (group.end + 0.01).toFixed(2),
    );
  }
});
tl.seek(0);
window.__timelines["captions"] = tl;
```

console.warn 触发就回 §6 检查 `tl.set(...group.end)` 是不是漏写或被后续 `tl.to` 覆盖（GSAP timeline 后写的覆盖先写的）。

## 9. Failure modes

| 现象                                      | 根因                                                       | 修法                                                                    |
| ----------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| `npx hyperframes lint` 报 timeline 没注册 | 注册键名不是字面 `"captions"`                              | §7 `window.__timelines["captions"]` 别变量绕                            |
| 同时两组可见                              | 漏 `tl.set(el, ..., group.end)` 硬关                       | 跑 §8 self-lint 定位是哪一组                                            |
| 字溢出画面                                | 没用 fitTextFontSize / maxWidth 太宽                       | §6 把 `maxWidth: 1700` 降到 `1500`，或减小 `baseFontSize`               |
| 字幕跟旁白对不上                          | scene-local → 全局时间没加 `start_s`                       | §1 加 offset                                                            |
| 字体退化到系统字                          | tokens.css 没 prepend，`@font-face` 在 index.html `<head>` | §5 必须 inline tokens.css；字体本身由 finalize 写在 index.html `<head>` |
