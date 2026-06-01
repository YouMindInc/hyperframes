# Visual Design (Phase 3)

输入故事（Phase 2 — `narrator_scripts.json`）+ 品牌设计系统（Phase 1b — `design-system/chunks/`），为每个场景设计视觉处理与动画编排，输出 `section_plan.md`。

本指南讲**创意意图**，不写代码。下游 build agent（`/hyperframes-core` + `/hyperframes-animation`）会把它翻成 HTML composition + GSAP timeline。

## 流程一览

1. **输入已全部内联在 dispatch**（`## Effects catalog` / `## Blueprints index` / `## SFX library` / `## Design rules`〔4 个 rule 全文〕/ `## Design chunks`〔`index.json` + 实际存在的 hints/voice/tokens/easings〕/ `## Narrator scripts` / `## Audio meta`）—— **直接用，不从盘 Read**
2. 每个场景：从 `## Effects catalog` 选 effects（timeline 分层序，数量见 §2）、（按 preset）从 `## Design chunks` 的 `index.json.components[]` 挑 component、决定 Continuity、写锚点 block + 散文 8 条
3. 运行 validator 至 exit 0

---

## 1. 输入

### `narrator_scripts.json`

- 场景级：`sceneNumber`、`sceneName`、`narrativeIntent.{type, narrativeRole, keyMessage, persuasion, emotionalBeat}`、`transition.{continuity, intent, sharedMotif?, description}`（`continuity` 直接照抄到 `**Continuity:**`；`intent` 按 §"Transition：翻译"表译成 `**Transition:**` registry 类型；`intent: morph` 时 `sharedMotif` → `**Bridge:**` 锚点）、`assetCandidates[]`（每项含 `path` + `description`）、`estimatedDuration`（去掉末尾 `"s"` → float）
- 顶层：`narrativeArchetype` + `emotionalArc`，影响全片节奏

### `## Design chunks` —— 品牌输入（已内联，不读 `design.html`）

chunks 由 Phase 1b 的 `emit-chunks.mjs` 切好、**已内联在 dispatch 的 `## Design chunks` 块**：`index.json` 全文 + 实际存在的 `composition-hints.md` / `voice.md` / `tokens.css` / `easings.js`（preset 没声明的 chunk `*_file=null`，不会出现在块里）。

**下面凡说"Read `chunks/X`"一律改为"在 `## Design chunks` 里找 X"——不从盘读**；plan 仍不碰 `design.html`、不碰组件 HTML 本体。Plan 对 chunks 做这几件事：

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

单 surface preset 和 surface-aware preset 混在同一份 manifest 里：单 surface entry 只有 `{id, file}` 两键；surface-aware entry 多 5 个可选字段（具体 surface 名 / role 名 / 互斥关系全部由 preset 自己声明，例：peoples-platform 声明 `paper` / `blue` / `orange` 三个 surface，并把 `stamp-statement` ⊥ `framed-stamp` ⊥ `mega-stat` ⊥ `end-stamp` 列入 `avoids_same_scene`）。**只对带字段的 entry 启用下面的两级过滤；单 surface entry 退回纯按 id 选**。

> **现状（务必知悉）**：目前 19 个 preset 里**只有 `peoples-platform` 一个**给组件写了 surface/role/avoids frontmatter（它有 paper/blue/orange 三块组件必须分别摆放的互斥画布）。其余 18 个（含 neo-grid-bold / editorial-forest / emerald-editorial / pin-and-paper 等）都是**单 surface 设计** —— 组件随便摆在唯一画布上都成立、靠 `color:inherit` / fill 变体自适应底色、无跨组件互斥对。它们的 component entry 因此只有 `{id, file}`，下面的三级过滤对它们**自然 no-op，plan agent 纯按 id 语义选** —— **这是预期行为，不是元数据缺失或 bug**，不要因为某 preset 没有 surface 字段就认为它"漏了"。判断标准：只有当组件确实必须摆特定 surface、或确实有不能同场的视觉互斥对时，preset 才需要 frontmatter（绝大多数 preset 不需要）。

2. **挑 component 算法（component entry 带 `surface` 时强制走这套）**：
   - 第 1 级 surface 过滤：决定这个 scene 走哪种 surface（看 narrative beat / 节奏），从 `components[]` 里 `filter(c => c.surface === sceneSurface || !c.surface)`
   - 第 2 级 role 过滤：在剩下的里按 `role` 与 scene 意图匹配（statement / authority / stat / quote / list / timeline / closer / aside）
   - 第 3 级互斥校验：选出的多个 component 之间，**任一对**若有 `a.id ∈ b.avoids_same_scene` 或 `b.id ∈ a.avoids_same_scene` → 拒绝组合，重选
   - **同 scene 内不要混不同 surface 的 component**（即使 surface 字段未声明，也不要把"明显 paper 风格"和"明显 blue 风格"的混在一起 —— 视觉破坏）

3. Read `chunks/composition-hints.md`（必读 if `index.json.hints_file != null`，~1-3 KB）→ preset 自己宣告的硬规则（surface contract / material 互斥 / 60-30-10 colour 配比）。**这是 preset 视觉契约的真理源 —— 违反 = scene 渲染失败**。`hints_file` 为 null 时跳过。

4. （可选）Read `chunks/tokens.css`（~1-2 KB）→ 看 `:root` 里实际定义了哪些角色 token（`--canvas` / `--ink` / `--brand-*` / preset-internal 别名如 `--paper` / `--blue` / `--cream` / `--shadow-triple-*`）—— 决定 30% 中间层 / 痛点场景的调色描述

5. （可选）Read `chunks/easings.js`（~0.5 KB）→ 看 `EASE.entry / emphasis / exit / drift` 角色键名齐全度，决定散文引用哪些 ease 意图

6. **必读 `chunks/voice.md`**（~0.5 KB，仅当 `index.json.voice_file != null`）→ 本 preset 的 DOM 文字 register。散文第 4 条（品牌样式覆盖层）**必须**承诺该场可见文字走 voice.md 的 recipe（具体 recipe 由 preset 声明 —— strip / case / 断句 / inline `<em>` 等转换规则因 preset 而异）。具体英文改写是 Phase 4b worker 的事，**plan 不抄改写后的文案**。不承诺 = worker 接到的 brief 无引导 = DOM 文本走不到 preset 风格

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

- `capture/`（Phase 2 领地；素材通过 `assetCandidates` 传递）
- `effects-catalog.md` / `blueprints-index.md` / `rules/*.md`（已分别嵌入 Dispatch 的 `## Effects catalog` / `## Blueprints index` / `## Design rules`）
- `chunks/*`（已嵌入 Dispatch 的 `## Design chunks`；不从盘读）
- blueprint 全文（`blueprints/<id>.md`，是 build agent 的事）
- `design-system/` 下的 sidecar JSON / fonts/ 目录
- `design-system/design.html`（旧契约；现在用 `chunks/` 替代）
- `chunks/components/<id>.html` 本体（plan 只引 id，组件 HTML 是 Phase 4b 的事）

---

## 2. 硬契约（machine-checked）

**文件整体形状（强制）**：`section_plan.md` **只含**一行可选 H1 标题 + 一串 `## Scene N:` 块，**没有别的**。**不要写项目级前言 / "system commitments" / "项目级承诺" / 跨场景汇总段**——下游一律不读它：`prep.mjs` 只从第一个 `## Scene` 开始切，validator 只遍历 scene 块，worker 被禁止读 `section_plan.md`（拿的是 prep 切好的 per-scene `creative_brief`）。第一个 `## Scene` 之前的任何成段内容 = 纯写不读的死字节，且 validator 会报错（见下）。全局不变量靠**两条真实通道**到达 worker：① 与本场相关时写进该场散文；② 专用通道（`voice_file` / `Captions` flag / `tokens.css` / `easings.js`）。动笔前对契约的"复述"（§4 第 0 步）**只在脑中**，绝不落进文件。

`section_plan.md` 每个场景一段，顺序与 `narrator_scripts.json` 一致：

```markdown
## Scene <N>: <sceneName>

**Effects:** [`<rule-id>`, `<rule-id>`, ...]
**Duration:** <X.XXs>
**Continuity:** break | continue
**Surface:** <preset-declared-surface> ← preset-conditional（surface-aware preset 必填；值见 chunks/index.json）
**Blueprint:** based-on `<id>` | extended `<id>` | composed ← 可选（soft），见下方
**Components:** [`<component-id>`, `<component-id>`, ...] ← 可选（soft），见下方
**Transition:** <type> [DIRECTION] [<dur>s] ← 可选（soft）；这一场怎么被「进入」，见下方
**Bridge:** `<bridge-id>` ← 仅当 **Transition:** shared-element（Tier-A morph）；跨场元素逻辑名，见下方
**SFX:** ← 可选（soft）；不用音效就整段省略，多行 bullet list 见下方
**PrimarySubjectTimeline:** <only for multi-act / dense multi-subject scenes>
**Handoff:** <only for multi-act / dense multi-subject scenes>

<散文正文 —— 第一句即 §4 第 1 条情感脚注 —— 见 §4>
```

**块内顺序是强制的，且 PrimarySubjectTimeline / Handoff 必须排在所有锚点之后、散文之前**（紧跟在 SFX 块后面）。原因是机器性的：`prep.mjs` 的 `creative_brief = 最后一个被识别锚点之后的全部文本`，而它识别 `SFX` 但**不识别** `PrimarySubjectTimeline` / `Handoff`——所以这两条必须落在 SFX **之后**才会进入 worker 的 brief；放在 SFX 之前会被切掉、worker 收不到。规则：① 全部 `**锚点:**` 行（含 SFX bullet 块、PST、Handoff）集中在最前；② 之后才是自由散文，且散文**第一句**就是情感脚注（§4 第 1 条，"真 plan 与通用 AI 输出的分水岭"）；③ 散文一旦开始，**不得**再出现任何 `**锚点:**` 行（交错 = validator fatal）。多 act 场景的 brief 会以 `**PrimarySubjectTimeline:**` 开头、紧接情感脚注，这是预期形态。

`validate.mjs section` 强制（hard）：

- **Effects**：2-5 个反引号包裹的 rule id，逗号分隔在方括号内；每个 id 必须是 `hyperframes-animation/rules/` 下存在的 rule（这是 validator 实际校验项）—— 正常只从 Dispatch 的 `## Effects catalog` 引用；顺序是 timeline-layering 顺序
- **Duration**：浮点秒数（来源见 §1）
- **Continuity**：`break` 或 `continue`；**Scene 1 永远是 `break`**。照抄 story-design 的 `transition.continuity`（已跟着 `intent` 定死：`morph` ⇒ `continue`，其余 ⇒ `break`）。**`continue` ⟺ 本场 `**Transition:** shared-element`**（见下方 Transition 硬契约）
- 必选锚点各自独立成行，前后无其他文字；缺任一锚点 → 下游 fatal → 重派 Phase 3
- **Surface**（preset-conditional）：当 `chunks/index.json.components[]` 中**任一** component 声明 `surface` 字段（surface-aware preset），所有场景**必填** `**Surface:**` 锚点；值必须出现在该 preset 声明过的 surface 集合里（运行时由 chunks/index.json 决定）。其他 preset（无 surface 字段）此锚点可省。**同一 scene 内 cited 的 component 若有 `surface` 字段且与 Surface 不一致 → validator fatal**（视觉契约破坏，不同 surface 的元素不可同 scene）
- **PrimarySubjectTimeline + Handoff**：multi-act scene、或 action/payoff + proof/supporting subject 同屏的 scene 必写。缺任一 → validator fatal。**位置**：紧跟在 SFX 块之后、散文之前（机器原因见上方模板说明——它们要落进 `creative_brief` 给 worker）
- **块内顺序**：所有 `**锚点:**` 行（含 SFX bullets、PrimarySubjectTimeline、Handoff）必须排在自由散文之前；散文开始后再出现任何 `**Word:**` 锚点行 → validator fatal（交错会让 worker 的 brief 形态不可预测）
- **文件级**：第一个 `## Scene` 之前不得有项目级前言 / 承诺段（只允许一行 H1 标题）→ validator fatal（见本节开头"文件整体形状"）
- **avoids_same_scene 互斥**（Components 锚点存在时）：每对 cited component 检查 `chunks/index.json.components[].avoids_same_scene` 列表；命中任一对 → validator fatal（具体互斥关系由 preset 自己声明）
- **Transition**（soft / 出现才校验）：type 必须在 TRANSITION-REGISTRY 词汇内；方向只对 directional type（push-slide）合法；duration `0 < dur ≤ 2.0s`。**Continuity ⟺ Tier-A 双向强制**：`Continuity: break` 不可命名 Tier-A（`shared-element`）；反之 `Continuity: continue` **必须**命名 Tier-A `shared-element`（**省略 `**Transition:**` 走 Tier-B 默认也算违反**）→ 两向皆 validator fatal
- **Bridge**（soft / 仅 Tier-A）：仅当 `**Transition:** shared-element` 时出现，值为单个反引号包裹的 kebab-case 逻辑名；`shared-element` 必须配 `**Continuity:** continue`（否则下游 prep fatal —— 两场要落同一 worker 才能写共享元素）。非 shared-element 的 scene 写了 Bridge → validator 警告/忽略

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

写 Components 锚点的价值：让 plan agent 提前承诺"这个场景的中间层 = 哪个 component"，避免散文里说 "use the manifesto component palette logic" 但下游无法定位你指的是哪个组件。和 Blueprint 锚点一样，这是对自己决策的承诺，而不是对下游怎么用的描述。

**Transition 锚点（可选 / soft —— 命名「这一场怎么被进入」）**：

> **本小节 + 下方「Bridge 锚点」是过渡 / 桥接的权威撰写指南（单一真源）。** §3 后的「Transition：翻译」表只补 `intent → registry type` 的映射，不重述机器规则；validator 的硬契约清单（上方）只列"校验什么"。改规则只改这里。

- 形态：`**Transition:** <type> [DIRECTION] [<dur>s]`，例 `**Transition:** blur-crossfade` / `**Transition:** push-slide LEFT` / `**Transition:** zoom-through 0.3s`
- 可选 type（Tier-B，过渡发生在**场景之间**，由 harness 在拼装后注入到 clip 外壳上，**你不写任何 GSAP**）：`crossfade` / `blur-crossfade` / `push-slide`（带方向 LEFT/RIGHT/UP/DOWN）/ `zoom-through` / `squeeze`。完整词汇 + 选型见 `<SKILL_DIR>/../hyperframes-animation/transitions/TRANSITION-REGISTRY.md`
- **整片只挑 2-3 种反复用**（重复 = 专业整体感，见 motion-language.md "过渡词汇"）—— **此预算只数 Tier-B（场景间）那 5 种里挑 2-3；`shared-element`（morph）是 worker 写的桥接、不占名额**，按叙事需要随便用。Scene 1 的 Transition 是开场（无前序场景，被忽略），可省
- **省略整行 = 接受默认**：harness 按 surface 冲突 / energy 自动推导（背景可能撞色→`blur-crossfade`、高能→`zoom-through`、平静→`blur-crossfade`、否则 `crossfade`）。所以 Tier-B **不确定就别写**，默认通常够好
- **`shared-element`（Tier-A 共享元素桥接）= story-design `intent: morph` 翻译来的** —— 必须配 `**Continuity:** continue`（两场落同一 worker）+ `**Bridge:**` 锚点（见下）。Tier-A 的桥接 morph 由 **worker 在两场场景内部写**（不是 harness 注入），harness 只做接缝外壳 crossfade
- harness 做掉一切（Tier-B）：算 overlap、延长出场 clip、排 track、stamp GSAP、复核。你只命名意图，**绝不写过渡代码、不碰 timing、不碰 index.html**

**Bridge 锚点（仅 Tier-A `shared-element` 时写）**：

- 形态：`**Bridge:** \`<bridge-id>\``，一个反引号包裹的 kebab-case 逻辑名（如 `\`product-card\``/`\`avatar-circle\``）
- 来自 story-design 的 `transition.sharedMotif`（叙事层"什么元素跨场"）—— 你把那句话落成一个稳定的机器名
- worker 会在**出场 + 进场两场**都放 `data-bridge-id="<这个名>"` 的元素，并设计两场之间的 morph 交接。**你只命名,不画几何** —— 具体 morph 是 worker 的活
- **写 `**Bridge:**` 锚点的是 morph 目标场**（被 morph"进入"的那场，prep 用 `toScene.transition`），它 `Continuity: continue`；morph 源场 `Continuity: break`（见下方 cap=2 对齐）。两场 worker 都放 `data-bridge-id` 元素，但只有目标场写 `**Transition:** shared-element` + `**Bridge:**` 锚点。这对落进同一 cap 窗口 = 同一 worker，否则下游 prep fatal

**⚠️ cap=2 分组对齐（必须在写 plan 时就想清楚，否则 prep 必拒、强制重派）**：你写 `shared-element` 时**看不到** worker 分组——分组是 prep 事后按 `Continuity` 锚点确定性算的，规则是：**`break` 起一个新组、`continue` 续入当前组、组满 `cap`（默认 2）就强制断新组**。Tier-A 的两场必须落进**同一组**，所以一对 morph 场景 `(A → B)` 必须**正好是某个 cap 窗口的头两场**。可靠落法：

- **把 morph 源 A 设 `Continuity: break`**（让 A 起一个新组）、**morph 目标 B 设 `Continuity: continue`**（B 续入，这对正好填满 cap=2 的窗口）。这是最稳的模式。
- 反例（本类 fatal 的成因）：A、B 都 `continue`，但 A 前面已有一个 `continue` 场景占了窗口的第 1 格 → A 落第 2 格（组满）、B 被踢进**下一组** → A、B 跨 worker → prep fatal `Transition A→B: grouping splits the scenes across workers`。
- **连续 >2 场的 morph 链**（demo sequence 3 场连桥）在 cap=2 下**必然**跨 worker → 拆成"一对 morph（Tier-A）+ 一个 Tier-B 过渡"，或提高 `--scenes-per-group`。

> 一句话：**morph 对 = 一个 cap 窗口的前两场；最稳就是 morph 源 `break`、目标 `continue`。** 想不清就别用 Tier-A，改 Tier-B（`blur-crossfade`）——视觉接缝照样干净。

> 这是 plan agent 对"场景间怎么衔接"的明确承诺。和散文第 8 条（命名到下一场的 transition）一致 —— 第 8 条是给人读的创意方向，`**Transition:**`/`**Bridge:**` 锚点是给 harness/worker 读的机器指令；保持一致。

**SFX 锚点（可选 / soft —— 用音效才写，不用就整段省略）**：

多数场景没有 SFX —— 这时**直接省略整个 `**SFX:**` 行**即可，省略 = "本场不用音效"，validator 不报错。想加音效就写 `**SFX:**` 单独一行 + 一或多个 bullet：

```markdown
**SFX:**

- `impact-bass-1.mp3` at 0.2s, volume 0.35 — hero stamp lands
- `whoosh-short.mp3` at 4.1s — exit
```

（也接受显式 `**SFX:** none`；但既然可选，没音效时省略整行更省事。）

**不必担心 silent drop**：一旦 cite 了某个 `<file>.mp3`，validator 会当场对照 `## SFX library` 校验它存在——拼错文件名是 Phase 3 的 fatal error（当场能改），不再像以前那样被 prep.mjs 悄悄丢掉。所以"可选"是安全的：不写 = 明确不用，写了 = 保证有效。

- `<file>.mp3` 必须是 Dispatch 上下文 `## SFX library` 里登记过的文件（拼错 = validator fatal）
- `<T>s` 是 **scene-local 秒数**；prep.mjs 自动加 `start_s` offset
- `volume` 可选，缺省 `0.35`；narration 下垫 0.2-0.3，纯 SFX 可 0.4-0.6，0.5+ 会盖过人声
- ` — <note>` 是给人看的注解

**放置规则**：

- **Impact / hit**（`impact-bass-*` / `ping` / `pop` / `glitch-*` / `whoosh`）：触发于视觉点**当下**，让 decay 拖到下一镜（J-cut）
- **Riser / build-up**（`riser` 10s / `whoosh-cinematic` 5.5s）：峰值在结尾，N 秒处爆 → 在 `N − duration` 触发
- **Short accent**（`click` / `click-soft` / `chime` / `sparkle` / `ping` / `whoosh-short`）：与视觉点同步

**Less is more**：多数场景零 SFX，一场 1 条是典型。**不要**在场景转场处加 SFX（hard cut 本身就是 audio-visual event）。

**禁**：估算时间戳（`verify-output.mjs sfx` 卡 ±0.1s drift）/ 截短 `data-duration`（impact 在 decay 中段被砍 = 业余感）。

可用 mp3 清单见 Dispatch 上下文 `## SFX library`（每条含 file / duration / 用途）——按用途挑文件。

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

**Continuity 直接来自 story-design**（不再反推）：`narrator_scripts.json` 的每个 scene `transition.continuity`（`break` | `continue`）是叙事层已经定好的判断 —— **照抄到 `**Continuity:**` 锚点**。`continuity` 已跟着 `intent` 定死（`morph` ⇒ `continue`，其余 ⇒ `break`），所以照抄即可；**凡 `continue` 的场必然 `intent: morph`，下游要求它命名 `shared-element`**（见 §2 双向硬契约）。Scene 1 永远 `break`。跨场景一致性见 §5 的"多样性"软指南。

**Transition：把 story-design 的叙事 `intent` 翻译成具体 registry 类型**（这是 visual-design 的活 —— 你有 preset/palette/surface/energy 上下文，story-design 没有）。`narrator_scripts.json` 每个 scene 的 `transition.intent` 是 5 个叙事意图之一；按下表翻译成 `**Transition:**` 锚点的 registry 类型（完整词汇见 `<SKILL_DIR>/../hyperframes-animation/transitions/TRANSITION-REGISTRY.md`）：

| story-design `intent`               | → `**Transition:**` registry 类型                       | 备注                                                                                  |
| ----------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `morph`（+ `continuity: continue`） | `shared-element`（Tier-A）                              | **必须 `continue`**；同时写 `**Bridge:**` 锚点（见下）。worker 在两场写共享元素 morph |
| `cut`                               | `crossfade`                                             | 利落切；高能瞬间可省略 Transition 锚点走默认                                          |
| `slide`                             | `push-slide <方向>`                                     | 方向匹配叙事流向（前进=LEFT/RIGHT，向下展开=DOWN）                                    |
| `dissolve`                          | `blur-crossfade`（两场背景撞色时）/ `crossfade`（否则） | 看两场 `#root` 背景色：差异大→blur 掩盖硬切；接近→普通 crossfade                      |
| `zoom`                              | `zoom-through`                                          | 镜头推进 / 高能                                                                       |

- **你有视觉上下文，可以 override**：若某 `intent` 的默认翻译在本 preset 下不合适（如撞色该用 blur 而表里写 crossfade），按视觉判断改 —— 表是默认，不是死规则。
- **整片只挑 2-3 种反复用**（重复=专业整体感，见 motion-language.md）—— **只数 Tier-B（场景间）那 5 种；`shared-element` morph 不占名额**。`intent` 已经收窄了选择，你在它给的方向里定具体值。
- **不确定就省略 `**Transition:**` 锚点** —— 下游 prep 会按 energy/撞色自动默认（见 §2 Transition 锚点）。但 `intent: morph` 时**不能**省略 —— 必须显式 `shared-element` + `**Bridge:**`。

**`**Bridge:**`锚点（仅`intent: morph` 时写）**：把 story-design 的 `transition.sharedMotif`（叙事层的"什么元素跨场"，如 "the product card"）落成一个机器可读的桥接 id：

```markdown
**Transition:** shared-element
**Bridge:** `product-card` ← 逻辑名（kebab-case），下游 worker 用它做 data-bridge-id
```

机器规则（kebab-case、必须配 `Continuity: continue`、worker 在两场放 `data-bridge-id`、morph 链受 cap=2 限制）详见上方 §2 Transition / Bridge 锚点。

> 需要的 effect 不在 catalog 里：先尝试组合现有 effects。仍不够 → **不要编造名字**，在 phase report 标 `needed effect missing: <description>`。

---

## 3. 设计原则（已内联在 `## Design rules`）

四个 rule 文件覆盖 plan 层的设计判断 —— 全部按**角色 / 意图 / 决策**组织，不含 hex / px / ms / 代码。**已内联在 dispatch 的 `## Design rules`，直接看、不从盘 Read**；具体数值是 build agent 在 `/hyperframes-core` + `/hyperframes-animation` + chunks 里自己查的，**plan 不抄**（详见 §4 第 4 条与 §1 的"点名 vs 不要抄"表）。

四个 rule 文件：

- `rules/typography.md` — 字号 7 级角色阶梯 / 多维度层级 / 字体搭配 / 禁用配对 / CJK
- `rules/color-system.md` — 7 个调色板角色 / 60-30-10 / 跨场景一致性 / 危险组合 / 背景分层
- `rules/composition.md` — 画布四区 / 7 套模板（整片≥3 套）/ 密度规则 / 深度技术
- `rules/motion-language.md` — 5 弹簧意图 / 时长档 / 节拍结构 / stillness-before-climax / 持续运动 / 过渡词汇（整片 2-3 种）

<blueprints>
13 个 multi-phase 场景骨架（role 覆盖：opening-hook / social-proof / brand-reveal / cta / demo / comparison / metric / messaging / takeover / workflow / concept-demo / problem）。每个 blueprint 给 role + triggers + phases + uses rules + ~2 句情感弧描述。

**用法**：扫 Dispatch 上下文里 `## Blueprints index` 段的 triggers / role 字段，匹配本场景 narrativeIntent 的 narrativeRole 与 keyMessage。命中后**仅用 index 里的信息**——`uses` 列表直接填 `**Effects:**` 锚点、phases 概述启发散文第 5 条（多阶段编排）、情感弧描述启发散文第 1 条（情感与节奏脚注）。**不要 Read blueprint 全文**（`blueprints/<id>.md`）—— 那含 GSAP 代码、DOM 拓扑、精确 timing 表，是 build agent 的事。

**采纳后必须标 `**Blueprint:**` 锚点**（见 §2）：用了就写 `based-on <id>` 或 `extended <id>`，没用就写 `composed` 或省略。

**匹配硬阈值**：`role` + `triggers` + 情感弧三项必须**自然贴合**才采纳。任一项需要"创造性弯曲"才能匹配 → **拒绝该 blueprint，回退到 effects catalog 自由组合**。自由组合不是 fallback 次等选择 —— 非典型场景（痛点叙述 / 概念解释 / list reveal / quote / pricing / FAQ）的正确路径就是自由组合。Archive 最强方案 playground-launch 在 8 个节拍里跑 5+ 个视觉宇宙、全自由组合 + 共享 cut-the-curve 粘合。

**改良**：blueprint `uses` 通常 3-4 个 effect，uses 偏少时按下方"补什么"清单补到 2-5。Duration / palette / asset / phase 时长比例全部按本片实际情况调整，**不抄 blueprint 的具体 timing 数值**。

**补什么**（当 blueprint `uses` 偏少时）：

- 默认先补 `sine-wave-loop`（持续运动 / 环境层）—— 几乎每场都该加，多数 blueprint 没显式列
- 仍不够按情感节拍补：过渡衔接 `scale-swap-transition` / `card-morph-anchor`、SVG 生气 `svg-icon-enrichment` / `svg-path-draw`、数据节拍 `counting-dynamic-scale` / `asr-keyword-glow`、景深补强 `3d-text-depth-layers` / `split-tilt-cards`
- 最终 2-5 个 effect 顺序按 timeline 层叠语义排序：背景 → 主入场 → 持续 → 强调 → 过渡
  </blueprints>

---

## 4. 撰写散文（在三行 anchor 之后）

**第 0 步（动笔前，强制）**：先向自己复述本次硬契约（Surface 契约 / Voice register / 每场 Blueprint 决策）——完整三条见 **agent 提示词的「动笔前先复述契约」一节**（那是常驻提示词，单一真源，此处不重复）。关键约束：复述**只在脑中定调，绝不写进 `section_plan.md`**（写进去 = 项目级前言 = §2"文件整体形状"禁止项 = validator fatal）。

然后按以下 8 条顺序写一段自由散文。这段散文会**原样**传给下游的 build agent —— 把自己当成在向一位没见过本品牌的资深动画师做 brief。

1. **情感与节奏脚注** —— 一句话，点名本节拍的*感觉*和*节奏*（"frustrated, slightly-off comma"、"luminous launch-film slow build"）。**这是真 plan 与通用 AI 输出的分水岭。**
2. **空间关系** —— composition 模板（centered / thirds / split / layered / asymmetric / triptych / strip）、主素材的画布占比（≥40%）、留白意图。**本片 dispatch 顶部 `Captions: enabled` 时（编排器从 audio_meta 算出的规划提示；prep.mjs 在 Step 5 会重算权威闸 `group_spec.captions_enabled`）**：字幕占底部 ~17% 保留带，凡把内容压低的概念（full-bleed cards、oversized hero、large CTA、stat stamp）必须**显式告诉 worker 把所有内容留在上 ~83%、底部 ~17% 当字幕领地**，垂直居中锚 ~0.42×高。措辞例："centered in the upper ~83%, caption band reserved below"、"bottom edge of card sits just above the caption band"、"CTA vertically centered around 42% of canvas height"。背景 / ambient 层不受限、照常 full-bleed。
3. **Effect → asset 映射** —— 对 `**Effects:**` 中的每个 id，命名驱动它的素材（`public/<basename>`，来自本场景 `assetCandidates`）或文本标签，以及在场景 phase timeline 内*触发的时刻*。**默认把本场 `assetCandidates` 都用上**（story-design 已按覆盖率铺开过，这里别再砍）：焦点主体仍 ≥40% 画布、挑最贴叙事的那个，其余候选**降级共存**而非丢弃——supporting / ambient 层、triptych / strip / layered 模板让多素材并置（分主次，不是并列等大网格），或在不同 phase 先后出场。某候选确实塞不进本场 → 在第 7 条否定句里点名"本场不用 `public/X`、因为…"，**别静默忽略**（它若也没出现在别的 scene 就等于废掉）
4. **品牌样式覆盖层（按角色，不按值）** —— Palette：点名 60% canvas / 30% surface（这份预设若无 surface token，用 hairline + canvas 重复并明确说出来）/ 10% accent，accent 绑定到哪个焦点元素；Type：display 用于什么、body 用于什么、是否有 mono eyebrow；Motion：只引**规范角色键** `EASE.entry` / `EASE.emphasis` / `EASE.exit` / `EASE.drift` 与 `DUR.snap` / `DUR.med` / `DUR.slow`（§1 第 5 条；这些是 `easings.js` 保证暴露的角色键）——不要自造别名键名，worker 是按这套规范键直接用的，引了它没有的键会落空。**完全不抄 hex / 字体名 / ease 曲线 / px / em / ms。** 如果 `chunks/tokens.css` 缺某 token（如 mono 字体未提取），点明并说预期 fallback
5. **多阶段编排** —— 阶段序列 `entry → ambient drift → major transition → stillness → emphasis → exit` 及粗略时长比例；明确点出 `stillness-before-climax` 节拍；每阶段命名弹簧意图（`entry` / `gentle` / `snappy` / `heavy` / `slam`）。若已通过 §3 选中某个 blueprint，phase 序列沿用该 blueprint index 描述里的 phase 骨架；本场景的情感节拍决定每阶段的时长比例与 ease 意图，**不必逐字复制 blueprint 的 timing 数值**（那是 build 的事）。phase 用 **scene-local 相对秒数 / 比例**（如 "0-0.45s 入场"、"~0.5s setup hold"）即可；**不要在散文里复述场景总时长 / 结束秒数**（如 "持续到 2.82s 退出"）——总时长在 `**Duration:**` 锚点，且 worker 的 `data-duration` 以 `estimatedDuration_s` 钉死，散文里再写一个约数只会和它冲突。块顺序（PST/Handoff 在散文前）见 §2。
6. **持续 / 环境运动** —— entry 落定后是什么让场景持续活着：hero 乘性 breathing（±2-5% scale）、卡片正弦 drift（±6-8px 反相）、icon orbit、halftone 密度形变、CTA glow pulse
7. **一条否定句** —— 本场景**不能**做什么，用 codex-plugin 的语气（"no halo behind the bell — Jake killed those"、"no neon glow, this is a workspace"）
8. **到下一场景的 transition** —— 详略**取决于 Tier**：**Tier-A（`shared-element`/morph）出场是承重的**——worker 要在出场+进场两场内部亲手写这个 morph，所以要写清什么元素跨场、交什么形态给下一场（这段是 worker 的施工图）。**纯 Tier-B（crossfade/blur-crossfade/push-slide/zoom-through/squeeze）出场由 Step 7 harness 注入到 clip 外壳上，worker 不写任何出场 tween**——所以散文一句话带过视线落点即可，**不要详述 veil/dissolve/curtain 的机制**（写了也没人照着做，纯增 token）。机器指令始终在 `**Transition:**`/`**Bridge:**` 锚点

**不要**写像素值、GSAP timeline 代码、composition HTML、具体 hex / 字体名 / ease 曲线 —— 那是 build agent 的活。但要给足约束让结果一眼识别为*本场景*而非通用解读：具体的意图角色、按比例的具体时长、按用途的字体引用、按角色的调色板分配、具体的 phase 顺序。

**别重述 worker 已从专用通道拿到的全局规则（省 token、避免漂移）**：worker 每个都已收到 `voice_file`（DOM 文字 recipe 全文）、`Captions` flag + 自身 keep-out 契约（底部 ~17% 字幕带几何）、`tokens.css` / `easings.js`（全部 token 值与 ease 曲线）。所以散文里**不要逐场复述** voice recipe 的机械细节（strip/case/断句）、字幕带的几何数值、或任何 hex/字体名/曲线值——只写**本场特有的应用或风险**（例：voice 写"hero 落成单行 UPPERCASE 叠词、`<mark>` 绑 'videos'"，而非整套 recipe；caption 写"CTA 底边压在字幕带上沿之上"，而非"底部 17% 是字幕领地、锚 0.42×高"这类每场都一样的几何）。**没有专用通道的全局规则照常逐场承载**（如 "no neon / no italic / 60-30-10 调色分配 / hard cut / stillness-before-climax 节拍"——这些 worker 只能从本场散文得知，是该场 brief 的承重内容，不算重复）。

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

> 这是**质量底线视角**（"什么算够活")；**逐场怎么写**进散文见 §4 第 6 条（持续/环境运动）——同一件事的两个高度，"乘性 breathing 不是 yoyo"只在此处展开一次，别在散文里逐场复述这条方法论。

每个场景必须有：

1. **Macro Motion** —— 摄像机漂移：整帧缓慢 zoom + 位移（背景与相机的反向 scale 是 archive 招牌技巧；具体数值是 build 的事）
2. **Element Motion** —— 内容入场后持续 drift / rotate / scale（绝不静止 —— 在最终 scale 上做乘性 breathing，不是 yoyo）
3. **Micro Motion** —— 环境细节：流动 gradient、breathing glow、循环粒子、halftone 密度形变

### 场景质量底线 —— 环境层

每个场景在核心内容之外都要有：

1. **Background swell** —— 品牌相近色相 dual-radial overlay；或工作区场景用建筑感网格
2. **Ambient particles / scanline / halftone** —— 品牌色浮粒、低不透明度 scanline、或随节拍形变的 halftone field
3. **Emphasis moment** —— 至少一个 impact 节拍（ripple / glow burst / impact lines / screen-shatter）

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
- **captions enabled 时，关键内容（CTA / hero / stat stamp / headline）压进底部 ~17%（y>900）字幕带 = 被字幕盖住**（背景/ambient 层可下探，关键前景不行）
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
