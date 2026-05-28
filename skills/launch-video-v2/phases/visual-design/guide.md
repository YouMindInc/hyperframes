# Visual Design (Phase 3)

输入故事（Phase 2 — `narrator_scripts.json`）+ 品牌设计系统（Phase 1b — `design-system/chunks/`），为每个场景设计视觉处理与动画编排，输出 `section_plan.md`。

本指南讲**创意意图**，不写代码。下游 build agent（`/hyperframes-core` + `/hyperframes-animation`）会把它翻成 HTML composition + GSAP timeline。

## 流程一览

1. 并行 Read：`narrator_scripts.json` · `design-system/chunks/index.json`（必须）·（可选）`design-system/chunks/tokens.css` + `chunks/easings.js`，各 ≤1 KB · 全部 4 个 `rules/*.md`
2. 每个场景：选 4-7 个 effects（从 Dispatch 上下文里的 catalog）、（可选）从 `chunks/index.json` 挑要用到的 components、决定 Continuity、写 3-or-4-anchor block + 散文 8 条
3. 运行 validator 至 exit 0

---

## 1. 输入

### `narrator_scripts.json`

- 场景级：`sceneNumber`、`sceneName`、`narrativeIntent.{type, narrativeRole, keyMessage, persuasion, emotionalBeat}`、`transition.{type, description}`、`assetCandidates[]`（每项含 `path` + `description`）、`estimatedDuration`（去掉末尾 `"s"` → float）
- 顶层：`narrativeArchetype` + `emotionalArc`，影响全片节奏

### `./design-system/chunks/` —— 品牌输入（不再读 `design.html`）

**路径固定**：`./design-system/chunks/index.json`（cwd 相对）。这是 Phase 1b 的 `emit-chunks.mjs` 切出来的 manifest，包含 preset 名、source URL、组件清单。

**Plan 对 chunks 做 5 件事，不读 design.html、不读组件 HTML 本体**：

1. Read `chunks/index.json`（必读，~1-2 KB）→ 拿到 `preset` + `components[]` 清单。每个 component entry 形如：

   ```jsonc
   {
     "id": "framed-stamp",
     "file": "chunks/components/framed-stamp.html",
     // 以下字段仅当 preset 的 component .md 文件带 frontmatter 时存在
     "surface": "blue", // 必须摆在哪种 surface 上
     "role": "authority", // 在 scene 里承担的语义角色
     "composes": ["cream-frame", "triple-stamp"], // 视觉签名是由哪些 material 组合
     "slots": ["pill", "headline", "sub"], // 可填的内容槽位
     "avoids_same_scene": ["stamp-statement"], // 不能与谁同 scene
   }
   ```

   老 preset（22 个）和 surface-aware preset 混在同一份 manifest 里：老 entry 只有 `{id, file}` 两键；surface-aware entry 多 5 个可选字段（具体 surface 名 / role 名 / 互斥关系全部由 preset 自己声明，例：peoples-platform 声明 `paper` / `blue` / `orange` 三个 surface，并把 `stamp-statement` ⊥ `framed-stamp` ⊥ `mega-stat` ⊥ `end-stamp` 列入 `avoids_same_scene`）。**只对带字段的 entry 启用下面的两级过滤；老 entry 退回纯按 id 选**。

2. **挑 component 算法（component entry 带 `surface` 时强制走这套）**：
   - 第 1 级 surface 过滤：决定这个 scene 走哪种 surface（看 narrative beat / 节奏），从 `components[]` 里 `filter(c => c.surface === sceneSurface || !c.surface)`
   - 第 2 级 role 过滤：在剩下的里按 `role` 与 scene 意图匹配（statement / authority / stat / quote / list / timeline / closer / aside）
   - 第 3 级互斥校验：选出的多个 component 之间，**任一对**若有 `a.id ∈ b.avoids_same_scene` 或 `b.id ∈ a.avoids_same_scene` → 拒绝组合，重选
   - **同 scene 内不要混不同 surface 的 component**（即使 surface 字段未声明，也不要把"明显 paper 风格"和"明显 blue 风格"的混在一起 —— 视觉破坏）

3. Read `chunks/composition-hints.md`（必读 if `index.json.hints_file != null`，~1-3 KB）→ preset 自己宣告的硬规则（surface contract / material 互斥 / 60-30-10 colour 配比 / sound-design hooks）。**这是 preset 视觉契约的真理源 —— 违反 = scene 渲染失败**。`hints_file` 为 null（老 preset）时跳过。

4. （可选）Read `chunks/tokens.css`（~1-2 KB）→ 看 `:root` 里实际定义了哪些角色 token（`--canvas` / `--ink` / `--brand-*` / preset-internal 别名如 `--paper` / `--blue` / `--cream` / `--shadow-triple-*`）—— 决定 30% 中间层 / 痛点场景的调色描述

5. （可选）Read `chunks/easings.js`（~0.5 KB）→ 看 `EASE.entry / emphasis / exit / drift` 角色键名齐全度，决定散文引用哪些 ease 意图

6. **必读 `chunks/voice.md`**（~0.5 KB，仅当 `index.json.voice_file != null`）→ 本 preset 的 DOM 文字 register。散文第 4 条（品牌样式覆盖层）**必须**承诺该场可见文字走 voice.md 的 recipe（具体 recipe 由 preset 声明 —— strip / case / 断句 / inline `<em>` 等转换规则因 preset 而异）。具体英文改写是 Phase 4b worker 的事，**plan 不抄改写后的文案**。不承诺 = worker 接到的 brief 无引导 = DOM 文本走不到 preset 风格

7. **必读 `chunks/motifs.md`**（~1-3 KB，仅当 `index.json.motifs_file != null`）→ preset 的原子手势目录。每个 motif 是单一可复用 gesture（id / 描述 / role / surface_safe / 默认 surface 全由 preset 自己声明）。**只 grep `## motif: <id>` 标题 + description + role + surface_safe**（每条 ~3-5 行），**不读 CSS / demo HTML**（worker 才读）。Plan 在 `**Motifs:**` 锚点 cite 选用的 motif id；散文第 6 条（持续 / 环境运动）可以按 motif 描述意图说"本场用 motif:<id> 标 hero"。

**不必读** `chunks/type-roles.md`（仅当 `index.json.type_roles_file != null`）→ 命名 text role 目录（preset 自己声明的 inline 文字 role 集合，可能十几个）。这是 **worker 自己挑 inline 文字样式时**的查表，plan 不要 cite role id，只在散文里按角色名描述（"hero display"、"body lede"）。

**不读**：组件 HTML 本体（`chunks/components/<id>.html`）—— 那是 Phase 4b worker 的事；plan 只引 component **id**。**不读** legacy `design.html`（已被 chunks 取代）。

**Plan 的工作是按角色 / 用途 / 意图引用，不是按字面值复述。** 见下方 §3 的指导原则：

| 你要点名                                            | 不要抄                           |
| --------------------------------------------------- | -------------------------------- |
| **角色**（canvas / surface / accent / ink）         | 具体 hex（`#e4ff97`）            |
| **用途**（display / body / mono）                   | 具体字体名（`Instrument Serif`） |
| **意图**（`EASE.entry` / `DUR.med`）                | 具体曲线（`power3.out`）         |
| **Component id**（`hero` / `chip` / `dot-grid-bg`） | 内部 HTML / `<style>` 块         |
| **Voice register**（"UPPERCASE 三段式"）            | 改写后的英文文案（worker 的活）  |

### 不读

- `research/`（Phase 2 领地；素材通过 `assetCandidates` 传递）
- `effects-catalog.md`（已嵌入 Dispatch 上下文）
- `blueprints-index.md`（已嵌入 Dispatch 上下文）
- blueprint 全文（`blueprints/<id>.md`，是 build agent 的事）
- `design-system/` 下的 sidecar JSON / fonts/ 目录
- `design-system/design.html`（旧契约；现在用 `chunks/` 替代）
- `chunks/components/<id>.html` 本体（plan 只引 id，组件 HTML 是 Phase 4b 的事）

---

## 2. 硬契约（machine-checked）

`section_plan.md` 每个场景一段，顺序与 `narrator_scripts.json` 一致：

```markdown
## Scene <N>: <sceneName>

**Effects:** [`<rule-id>`, `<rule-id>`, ...]
**Duration:** <X.XXs>
**Continuity:** break | continue
**Surface:** <preset-declared-surface> ← preset-conditional（surface-aware preset 必填；值见 chunks/index.json）
**Blueprint:** based-on `<id>` | extended `<id>` | composed ← 可选（soft），见下方
**Components:** [`<component-id>`, `<component-id>`, ...] ← 可选（soft），见下方
**Motifs:** [`<motif-id>`, `<motif-id>`, ...] ← preset-conditional（preset 声明 §M / motifs_file != null 时推荐），见下方
**PrimarySubjectTimeline:** <only for multi-act / dense multi-subject scenes>
**Handoff:** <only for multi-act / dense multi-subject scenes>

<散文正文 —— 见 §4>
```

`validate-section-plan.mjs` 强制（hard）：

- **Effects**：4-7 个反引号包裹的 rule id，逗号分隔在方括号内；每个 id 必须出现在 Dispatch 上下文的 `## Effects catalog` 里；顺序是 timeline-layering 顺序
- **Duration**：浮点秒数（来源见 §1）
- **Continuity**：`break` 或 `continue`；**Scene 1 永远是 `break`**
- 必选锚点各自独立成行，前后无其他文字；缺任一锚点 → 下游 fatal → 重派 Phase 3
- **Surface**（preset-conditional）：当 `chunks/index.json.components[]` 中**任一** component 声明 `surface` 字段（surface-aware preset），所有场景**必填** `**Surface:**` 锚点；值必须出现在该 preset 声明过的 surface 集合里（运行时由 chunks/index.json 决定）。其他 preset（无 surface 字段）此锚点可省。**同一 scene 内 cited 的 component 若有 `surface` 字段且与 Surface 不一致 → validator fatal**（视觉契约破坏，不同 surface 的元素不可同 scene）
- **PrimarySubjectTimeline + Handoff**：multi-act scene、或 action/payoff + proof/supporting subject 同屏的 scene 必写。缺任一 → validator fatal
- **avoids_same_scene 互斥**（Components 锚点存在时）：每对 cited component 检查 `chunks/index.json.components[].avoids_same_scene` 列表；命中任一对 → validator fatal（具体互斥关系由 preset 自己声明）
- **Motifs**（preset-conditional）：当 `chunks/index.json.motifs_file != null` 时，Motifs 锚点的每个 id 必须出现在 `chunks/motifs.md` 的 `## motif: <id>` 标题里；拼写错 / id 不存在 → validator fatal。Motifs 锚点本身仍是 soft（preset 没声明 §M 时整行可省）

**Blueprint 锚点（soft —— validator 不强制，但强烈建议写）**：

- `based-on <id>` —— 完整采纳某 blueprint（`Effects` 列表 = 该 blueprint `uses` 的全部 id，可能调换顺序）
- `extended <id>` —— 采纳某 blueprint 但补了 effect（`Effects` 包含该 blueprint `uses` 的全部 id + 1-3 个额外 effect）
- `composed` —— 不基于任何 blueprint，从 effects catalog 自由组合
- **省略整行 = 等同于 `composed`**

写 Blueprint 锚点的价值：(1) 强制 plan agent 对"用 / 不用 blueprint"做出明确承诺，避免"既不想用又模糊使用"；(2) 审视 plan 时一眼能看出整片对 blueprint 的依赖程度；(3) build agent 看到 `based-on` / `extended` 时**可以**去读对应 blueprint 全文（plan 不让读，build 让读）。

**Components 锚点（soft —— 强烈推荐写）**：

- 列出该场景在视觉上**真的会用到**的 component id（来自 `chunks/index.json.components[].id`），反引号包裹，方括号包围
- 例：`**Components:** [\`hero\`, \`dot-grid-bg\`, \`deco-pink-block\`]`
- 不用任何 component 时整行省略
- 列错 id（拼写错、组件不存在）→ 下游 fatal（重派 Phase 3）；validator 只校验语法

写 Components 锚点的价值：让 plan agent 提前承诺"这个场景的中间层 = 哪个 component"，避免散文里说 "use the manifesto component palette logic" 但下游无法定位你指的是哪个组件。和 Blueprint 锚点一样，是 plan agent 对自己决策的明确承诺，而不是对下游怎么用的描述。

**Motifs 锚点（soft / preset-conditional —— preset 声明 §M 时强烈推荐写）**：

- 列出该场景**真的会用到**的 motif id（来自 `chunks/motifs.md` 的 `## motif: <id>` 标题），反引号包裹，方括号包围
- 例：`**Motifs:** [\`signature-shadow\`, \`accent-flourish\`]`（id 来自 preset 的 `chunks/motifs.md`）
- 不用任何 motif 时整行省略；preset 没声明 §M（`motifs_file: null`）时锚点不存在也无所谓
- 列错 id（拼写错 / motif 不存在）→ validator fatal（chunks/index.json.motifs_file 存在时强制校验）

写 Motifs 锚点的价值：和 Components 同一逻辑 —— motif 是 component 之下、比 effect 更细的可复用 gesture（preset 的"招牌微动作"）。Plan 提前承诺"这个 hero 上的招牌动作是 motif A、accent 词是 motif B"，worker 拿到 brief 直接去 `chunks/motifs.md` 找 CSS + demo HTML 粘，跳过 reverse-engineering preset 视觉签名的过程。**没有 Motifs 锚点 ≠ 散文里不能 mention motif**，但 cite 进锚点后，validator 能保证拼写不爆。

### Primary / Supporting 防 overlap 契约

只记这条：**同一时间只有一个 primary subject；其他可见内容必须是 supporting。**

风险场景必须在散文前写两行：

```markdown
**PrimarySubjectTimeline:** 0-4.0s product panel primary; 4.0-7.0s proof cluster primary; 7.0-10.0s action headline primary, proof cluster supporting rail.
**Handoff:** Before the action headline enters, the proof cluster demotes to a small low-contrast rail. Camera push does not count as handoff. The new primary owns the center safe zone.
```

规则：

- 多个主体可以同屏，但只能一个是 primary；其他只能是 supporting rail / side rail / background texture / low-emphasis chrome。
- New primary 进场前，previous primary 必须 exit / hide / compact / demote；**camera pan / zoom / push 不算退场**。
- Action / payoff frame：primary headline / product / decision point 独占 center safe zone；proof、labels、logos、stats、cards 若保留，必须更小、更低对比、更少运动、离开 primary bbox。

**Continuity 怎么判**：根据散文第 8 条的 transition 词汇 ——

- `hard cut` / `jump cut` → `break`
- 同一素材上的 `cut-the-curve` / `morph` / `scale+fade` → `continue`

Scene 1 强制 `break`（无前序素材可续）。Continuity 是 plan 对"这一场和上一场是不是同一镜头延续"的判断，跨场景一致性见 §5 的"多样性"软指南。

> 需要的 effect 不在 catalog 里：先尝试组合现有 effects。仍不够 → **不要编造名字**，在 phase report 标 `needed effect missing: <description>`。

---

## 3. 设计原则（按需加载）

四个 rule 文件覆盖 plan 层的设计判断 —— 全部按**角色 / 意图 / 决策**组织，不含 hex / px / ms / 代码。具体数值是 build agent 在 `/hyperframes-core` + `/hyperframes-animation` + `design-system/chunks/` 里自己查的，**plan 不抄**。

<rules>
<typography path="rules/typography.md">字号 7 级角色阶梯（mega / hero / display / heading / body / eyebrow / data）、多维度层级叠加（size / weight / color / spacing / case / style mix）、字体搭配逻辑（单字体族 + 极端字重 vs 三声部系统）、禁用字体配对、CJK 提示。**Plan 按用途引用字体角色，不抄字体名 / px / em。**</typography>
<color-system path="rules/color-system.md">7 个调色板角色（canvas / surface / ink / accent / secondary / restrained-third / semantic）、60-30-10 视觉权重逻辑、跨场景一致性规则、危险组合（白底浅灰、紫蓝 AI 渐变、`#000` 上霓虹）、背景分层概念（基底 / 径向膨胀 / 环境纹理 / 网格 / 粒子）。**Plan 按角色引用 token，不抄 hex / opacity / saturation。**</color-system>
<composition path="rules/composition.md">画布四区概念（top chrome / safe margin / primary content / caption zone）、7 套 composition 模板（centered / thirds / split / layered / asymmetric / triptych / strip，整片至少 3 套）、密度规则（主视觉 ≥40%、3 层视觉层、充盈测试 / 海报暂停测试）、层级多维度叠加、深度技术（尺寸 / 模糊 / opacity / 重叠 / 阴影 / 视差 / 反向 scale）。**Plan 选模板 + 点名层数，不抄 px / scale 数 / shadow 配方。**</composition>
<motion-language path="rules/motion-language.md">5 个弹簧意图（entry / gentle / snappy / heavy / slam）、时长意图档（瞬时 / 状态 / 布局 / 入场）、退出 = 入场 75%、stagger 总上限 500ms、节拍结构（缓慢铺垫 → 蒙太奇 → 过程展示 → 收束）、停留时间表、**stillness-before-climax 招牌节拍**、持续运动 7 种模式、过渡词汇 5 种（cut-the-curve / scale+fade / slide / morph / hard cut，整片只用 2-3 种）。**Plan 按意图角色引用，不抄 GSAP ease 名 / ms / 公式 / 代码。**</motion-language>
</rules>

<blueprints>
13 个 multi-phase 场景骨架（role 覆盖：opening-hook / social-proof / brand-reveal / cta / demo / comparison / metric / messaging / takeover / workflow / concept-demo / problem）。每个 blueprint 给 role + triggers + phases + uses rules + ~2 句情感弧描述。

**用法**：扫 Dispatch 上下文里 `## Blueprints index` 段的 triggers / role 字段，匹配本场景 narrativeIntent 的 narrativeRole 与 keyMessage。命中后**仅用 index 里的信息**——`uses` 列表直接填 `**Effects:**` 锚点、phases 概述启发散文第 5 条（多阶段编排）、情感弧描述启发散文第 1 条（情感与节奏脚注）。**不要 Read blueprint 全文**（`blueprints/<id>.md`）—— 那含 GSAP 代码、DOM 拓扑、精确 timing 表，是 build agent 的事。

**采纳后必须标 `**Blueprint:**` 锚点**（见 §2）：用了就写 `based-on <id>` 或 `extended <id>`，没用就写 `composed` 或省略。这是 plan agent 对自己决策的明确承诺，避免"既不想用又模糊使用"。

**匹配硬阈值**：`role` + `triggers` + 情感弧三项必须**自然贴合**才采纳。任一项需要"创造性弯曲"才能匹配 → **拒绝该 blueprint，回退到 effects catalog 自由组合**。自由组合不是 fallback 次等选择 —— 非典型场景（痛点叙述 / 概念解释 / list reveal / quote / pricing / FAQ）的正确路径就是自由组合。Archive 最强方案 playground-launch 在 8 个节拍里跑 5+ 个视觉宇宙、全自由组合 + 共享 cut-the-curve 粘合。

**改良**：blueprint `uses` 通常 3-4 个 effect，少于 4-7 下限时按下方"补什么"清单补。Duration / palette / asset / phase 时长比例全部按本片实际情况调整，**不抄 blueprint 的具体 timing 数值**。

**补什么**（当 blueprint `uses` < 4 时）：

- 默认先补 `sine-wave-loop`（持续运动 / 环境层）—— 几乎每场都该加，多数 blueprint 没显式列
- 仍不够按情感节拍补：过渡衔接 `scale-swap-transition` / `card-morph-anchor`、SVG 生气 `svg-icon-enrichment` / `svg-path-draw`、数据节拍 `counting-dynamic-scale` / `asr-keyword-glow`、景深补强 `3d-text-depth-layers` / `split-tilt-cards`
- 最终 4-7 个 effect 顺序按 timeline 层叠语义排序：背景 → 主入场 → 持续 → 强调 → 过渡
  </blueprints>

---

## 4. 撰写散文（在三行 anchor 之后）

按以下 8 条顺序写一段自由散文。这段散文会**原样**传给下游的 build agent —— 把自己当成在向一位没见过本品牌的资深动画师做 brief。

1. **情感与节奏脚注** —— 一句话，点名本节拍的*感觉*和*节奏*（"frustrated, slightly-off comma"、"luminous launch-film slow build"）。**这是真 plan 与通用 AI 输出的分水岭。**
2. **空间关系** —— composition 模板（centered / thirds / split / layered / asymmetric / triptych / strip）、主素材的画布占比（≥40%）、留白意图
3. **Effect → asset 映射** —— 对 `**Effects:**` 中的每个 id，命名驱动它的素材（`public/<basename>`，来自本场景 `assetCandidates`）或文本标签，以及在场景 phase timeline 内*触发的时刻*
4. **品牌样式覆盖层（按角色，不按值）** —— Palette：点名 60% canvas / 30% surface（这份预设若无 surface token，用 hairline + canvas 重复并明确说出来）/ 10% accent，accent 绑定到哪个焦点元素；Type：display 用于什么、body 用于什么、是否有 mono eyebrow；Motion：引用 `EASE.entry` / `EASE.emphasis` 等**角色键名**（即使 `chunks/easings.js` 里的实际键名略不同，build agent 会做映射）。**完全不抄 hex / 字体名 / ease 曲线 / px / em / ms。** 如果 `chunks/tokens.css` 缺某 token（如 mono 字体未提取），点明并说预期 fallback
5. **多阶段编排** —— 阶段序列 `entry → ambient drift → major transition → stillness → emphasis → exit` 及粗略时长比例；明确点出 `stillness-before-climax` 节拍；每阶段命名弹簧意图（`entry` / `gentle` / `snappy` / `heavy` / `slam`）。若已通过 §3 选中某个 blueprint，phase 序列沿用该 blueprint index 描述里的 phase 骨架；本场景的情感节拍决定每阶段的时长比例与 ease 意图，**不必逐字复制 blueprint 的 timing 数值**（那是 build 的事）。若本场多 act 或 dense multi-subject，先写 `PrimarySubjectTimeline` + `Handoff`，再写散文。
6. **持续 / 环境运动** —— entry 落定后是什么让场景持续活着：hero 乘性 breathing（±2-5% scale）、卡片正弦 drift（±6-8px 反相）、icon orbit、halftone 密度形变、CTA glow pulse
7. **一条否定句** —— 本场景**不能**做什么，用 codex-plugin 的语气（"no halo behind the bell — Jake killed those"、"no neon glow, this is a workspace"）
8. **到下一场景的 transition** —— 命名 transition 词汇（cut-the-curve LEFT / scale+fade / slide-up / morph / hard cut）

**不要**写像素值、GSAP timeline 代码、composition HTML、具体 hex / 字体名 / ease 曲线 —— 那是 build agent 的活。但要给足约束让结果一眼识别为*本场景*而非通用解读：具体的意图角色、按比例的具体时长、按用途的字体引用、按角色的调色板分配、具体的 phase 顺序。

### 完整场景块样例（含 anchor）

```markdown
## Scene 4: the-spiral

**Effects:** [`discrete-text-sequence`, `cursor-click-ripple`, `context-sensitive-cursor`, `sine-wave-loop`]
**Duration:** 6.20s
**Continuity:** continue
**Blueprint:** composed

Beat 2b — the spiral (frustrated, slightly-off comma). Centered chat-app composition: ...
```

`**Blueprint:** composed` 表示本场景**没用任何 blueprint**（自由组合）。若改用 blueprint：

```markdown
**Effects:** [`counting-dynamic-scale`, `center-outward-expansion`, `multi-phase-camera`, `svg-icon-enrichment`, `sine-wave-loop`]
**Blueprint:** extended `hook-counter-burst`
```

—— `extended` 表示采纳了 `hook-counter-burst` 的全部 4 个 `uses`（前 4 个 effect），并额外补了 `sine-wave-loop` 加强持续运动。

### Components 锚点样例

```markdown
## Scene 2: brand-reveal

**Effects:** [`discrete-text-sequence`, `coordinate-target-zoom`, `3d-text-depth-layers`, `asr-keyword-glow`, `sine-wave-loop`]
**Duration:** 8.26s
**Continuity:** continue
**Blueprint:** extended `brand-reveal-assemble-zoom`
**Components:** [`hero`, `chip`, `dot-grid-bg`]
```

—— `Components` 锚点在散文之前。散文里继续按 component **角色**引用（"the chip outlines the keywords"），不抄组件 HTML。

### 散文样例（先读这个再动笔）

> "Beat 2b — the spiral (frustrated, slightly-off comma). Centered chat-app composition: message stack scrolls up at accelerating pace, cursor sits anchored at the bottom-right, never moves. ~5-7 follow-up prompts flash through, each punctuated by a button click + a late SFX tick — pace tightens, tension builds. Hold on a final frustrated beat: cursor still, chat full, SFX _slightly_ off. **Palette: canvas + ink default + single accent on the cursor only — no halo, no glow.** Type: display in chat bubbles, body for supporting text. **Multi-phase: setup hold ~0.5s → accelerating montage ~4.8s → final still beat ~0.9s (stillness-before-climax) → cut-the-curve LEFT into Act 3.** Hero cursor does multiplicative breathing on its glow only, not position. No neon."

**顺序**：情感语气 → composition → 按角色给调色板 → 按用途给字体 → 带按比例时长 + 意图角色的 phase 序列 → 否定句 → transition。**没有 hex / 字体名 / ease 曲线 / GSAP 代码；每个词都在做事。**

---

## 5. 软指南（taste-level，影响 plan 质量但不被 validator 强制）

### 场景质量底线 —— 三层运动模型

每个场景必须有：

1. **Macro Motion** —— 摄像机漂移：整帧缓慢 zoom + 位移（背景与相机的反向 scale 是 archive 招牌技巧；具体数值是 build 的事）
2. **Element Motion** —— 内容入场后持续 drift / rotate / scale（绝不静止 —— 在最终 scale 上做乘性 breathing，不是 yoyo）
3. **Micro Motion** —— 环境细节：流动 gradient、breathing glow、循环粒子、halftone 密度形变

### 场景质量底线 —— 环境层

每个场景在核心内容之外都要有：

1. **Camera drift** —— 整帧持续而微妙的 zoom + pan
2. **Background swell** —— 品牌相近色相 dual-radial overlay；或工作区场景用建筑感网格
3. **Ambient particles / scanline / halftone** —— 品牌色浮粒、低不透明度 scanline、或随节拍形变的 halftone field
4. **Emphasis moment** —— 至少一个 impact 节拍（ripple / glow burst / impact lines / screen-shatter）

### 多阶段编排

```
entry → ambient drift → major transition (morph / pivot / collapse) → stillness-before-climax (~0.3-0.75s) → result / emphasis → idle breathing → exit
```

元素 spring 进入后就坐在原地 = 幻灯片，不是视频。

### 禁用模式（最常翻车的清单）

- 连续运动覆盖场景时长 <50%
- 把 3px 微浮当作唯一"运动"（archive 最小振幅 ±6px 或 ±2-5% scale）
- 把逐字弹出文本当*主要*视觉（除非有编排好的视觉主导）
- 所有元素同时入场（必须 stagger；总 ≤500ms）
- 只有环境层而无主要内容（剩粒子 + 字幕）
- 每场景都同一种 composition（每片至少 3 套不同模板）
- 主视觉元素 <40% 画布
- 通用 AI 烂俗：纯 `#000` 上的霓虹满饱和、紫蓝 AI 渐变背景、装饰性悬浮 bokeh 球
- 纯色背景无 swell / grid / scanline / particle
- 从动作直接跳到 payoff，无 `stillness-before-climax` 的逗号
- 多个 primary subject 同时抢 center safe zone；任何 product / proof / logo / stat / headline / card cluster 同屏都必须有 primary/supporting 和 handoff
- 把 camera pan / zoom / push 当作旧内容退场；camera 只移动视角，不会自动降低旧 primary 的视觉权重
- **在散文里抄 `chunks/tokens.css` / `chunks/easings.js` 的具体 hex / 字体名 / ease 曲线** —— 那是 build agent 的事
- **强行套用不匹配的 blueprint** —— blueprint 是工具不是义务；`role` / `triggers` / 情感弧任一项需要"创造性弯曲"才能匹配 → 回退到 effects catalog 自由组合
- **Read blueprint 全文**（`blueprints/<id>.md`）—— 含 GSAP 代码与 DOM 拓扑，是 build agent 的事；Plan 只用 `## Blueprints index` 段的信息

### 多样性

跨所有场景至少 3 种不同 composition 安排。Archive 中最强的 plan（playground-launch）在 8 个节拍里跑 5+ 个视觉宇宙，用一套共享 transition 词汇（cut-the-curve）+ 一套共享调色板语法粘合。**视觉世界多样、接缝处理一致** —— 这就是原则。
