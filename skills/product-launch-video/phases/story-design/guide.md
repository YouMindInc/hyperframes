# 故事设计（Story Design）

宣传视频的故事层。选择一个 storytelling archetype，设计 scene sequence，定义每个 scene 的 narrative intent，为每个 seam 选择 transition，并编写 narrator scripts。输出：`narrator_scripts.json`。

## 核心原则

视频叙事独立于网页结构。网页是信息布局；视频是情绪旅程。

- Scene sequence 来自 narrative design，而不是原网页 section 的顺序。
- 网页可能按 `hero → features → pricing → CTA` 流动；视频则可能按 `hook → pain → hope → proof → action`，或 `vision → bridge → proof → action`，或 `question → demo → demo → trust → action` 流动，具体取决于 archetype。
- 根据需要重新排序、合并、省略或重构网页内容。
- Extraction data 是信息和素材来源，不是 story template。

计划的标准：**在 structural type 旁边写出 emotional beat**，**写出具体的 persuasion technique**（不要只写 “show benefits”），并且 **为每一个 seam 指定 transition**。什么把观众视线从 scene N 带到 scene N+1，本身就是故事的一部分，不是后续视觉阶段才处理的问题。

## 用 site_dna 定 register（开场读一次）

`design-system/inference.json` 的 `site_dna` 是 Phase 1 **确定性**产出的站点气质摘要。开场读一次，用它把叙事「调」到与最终视觉同一频道（**只读 `site_dna` 这一段，不读 `design.html` / `chunks/` —— 那是 design-system subagent 的并行产物，读它会破坏 1b∥2 并行**）。**`inference.json` 缺失时**（Phase 1 未跑 `build-design.mjs --no-emit`）先 `(cd "$PROJECT_DIR" && node <SKILL_DIR>/phases/design-system/scripts/build-design.mjs ./design-system --no-emit)` 再读；它是确定性产出，重跑不影响 1b∥2 并行。

| site_dna 字段                                  | 怎么用                                                                                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `voice_tone`（neutral / warm / formal / …）    | 定脚本语气：`formal` 收着写、远离玩笑；`warm` 放开用 disarming specificity（ZapBG「Grandma」那招）；`neutral` 走 sharp-but-plain            |
| `voice_heading_style` / `voice_heading_length` | hook 文案节奏：`UPPERCASE`/`tight` → 短三连（Vibe.co「Target. Deliver. Measure.」）；`loose` → 偏 anaphora 长句（HRS）                      |
| `material` / `imagery`                         | 偏向 archetype + hook：spectacle/glass 美学 → Visual-spectacle hook + Feature-Benefit Cascade；flat B2B → PAS / BAB                         |
| `page_intent` / `section_role_counts`          | `feature-grid` 计数高 = 走 Feature-Benefit Cascade inner rhythm（更长的连续 demo 序列）；pricing-heavy → 加 Price-anchoring persuasion beat |

site_dna 是**软输入**：它收窄选择、让叙事与视觉预先对齐，但 archetype 的最终判断仍以 `context_pack.md` 的内容为准。

## 叙事原型（Narrative archetypes）

在设计 scenes 之前，选择 **一个** storytelling archetype（或显式命名一个 hybrid，见下方 “Compound archetypes”）。阅读它的 overview 获取指导，并研究它的 golden samples；不要混用不同 archetype 的章节，因为每一个都是完整连贯的情绪旅程。

<archetypes>
<pain-agitate-solve path="archetypes/pain-agitate-solve/overview.md">
**Pain → Agitate → Solve (PAS)** — 先建立痛点识别，再揭示解决方案。最适合：解决已知挫败感的产品、B2B tools、已经感受到痛点的受众。较晚的 product reveal（全片 33-50% 处）能最大化 relief contrast。Samples: alpha（culture/identity-driven crypto PAS），madison（character-driven PAS + Feature-Benefit Cascade compound）。
</pain-agitate-solve>

<future-pacing path="archetypes/future-pacing/overview.md">
**Future Pacing — Vision → Proof** — 先描绘美好的未来，再证明它可以实现。最适合：具备新能力的 AI/tech products、新品类产品。Product 要很早被命名（4-10% 处），用来锚定 vision。Samples: agentgpt（BAB / Feature-Benefit Cascade compound，“Imagine” hook 让它带有 Future-Pacing 的味道）。Future Pacing 和 BAB 都有 visionary-opening DNA；当 proof 是 workflow walkthrough 而不是 capability demonstrations 时，选择 BAB。
</future-pacing>

<demo-loop path="archetypes/demo-loop/overview.md">
**Demo Loop — Question → Instant Answer** — 围绕重复 product demos 的极简叙事。最适合：UI-centric products、data tools、“seeing is believing”。常见形态是 “Problem-Solution-Benefit Cascade” 变体（跳过 agitation，直接从 problem 到 solution，再到 layered benefits）。Samples: gwi。
</demo-loop>

<before-after-bridge path="archetypes/before-after-bridge/overview.md">
**Before-After-Bridge (BAB)** — 展示 friction state，对比 desired state，再走过抵达那里的 bridge。最适合：headline 是 *process improvement* 的 workflow products（不是单独强调 pain 或 vision）。中段 product reveal（15-35%）。Samples: kyvos、desklog，以及 agentgpt（与 Future Pacing 的 hybrid）。
</before-after-bridge>

<feature-benefit-cascade path="archetypes/feature-benefit-cascade/overview.md">
**Feature-Benefit Cascade** — 快速连续展示 feature，推动 momentum 走向 CTA。没有 agitation phase。最适合：feature-rich SaaS、NFT collections / marketplaces，以及购买动机来自 desire-escalation（而不是 pain-relief）的产品。Product 要早出现（0-22%）或从 scene 1 就视觉露出。Samples: vibe-co、elemental-soul。它经常作为其他 archetype 内部的 *internal rhythm* 出现：Madison 是 PAS+Cascade，AgentGPT 是 BAB+Cascade。
</feature-benefit-cascade>
</archetypes>

### 复合叙事原型（Compound archetypes）

真实视频经常会 _layer_ 多个 archetype。Reverse-engineered samples 会明确写出 compound 名称，例如 `"PAS with Feature-Benefit progression"`（Madison）、`"Before-After-Bridge / Feature-Benefit Cascade"`（AgentGPT）、`"Problem-Solution-Benefit Cascade"`（GWI）。模式是：

- **Outer archetype** = 宏观情绪弧线（PAS / Future Pacing / BAB / Demo Loop）
- **Inner rhythm** = showcase phase 内部的战术节奏（Feature-Benefit Cascade 是最常见的 inner rhythm，会连续 6+ 个 scenes 交替 `feature_showcase` ↔ `benefit_highlight`）

在 `narrativeArchetype` 中写成 `"<outer> with <inner>"`。下游 visual-design phase 会读取它来规划 pacing；Cascade inner rhythm 意味着更紧的 `morph` / `slide` 衔接（`continuity: continue` 居多）和更短的 scenes。

## 叙事架构（Narrative architecture）

定义每个 scene 在故事里的作用。每个 scene 有五个 narrative fields（type · narrativeRole · keyMessage · persuasion · emotionalBeat），加上一个独立的 transition spec：

- **Type** — 以下之一：`hook` / `pain_point` / `product_intro` / `feature_showcase` / `benefit_highlight` / `social_proof` / `branding` / `cta`。`branding` 是一种 _philosophical_ 产品定位 scene（整合 value statement、tagline 或 category claim），不同于命名产品的 `product_intro`，也不同于要求行动的 `cta`。
- **Narrative Role** — 这个 scene 在故事里做什么（它的 _job_，例如 “Highlights the massive financial loss when linking data to decisions”，而不是 “Shows the dashboard”）。
- **Key Message** — 观众应该带走的信息（一句话）。
- **Persuasion** — _具名的_ persuasion mechanism（见下方 Persuasion catalog）。“Show benefits” 是失败模式；标准应是 “Visual Proof of automation mechanics” / “Authority by association with logos (AWS, GCP, Snowflake)” / “Anchoring bias via explicit pricing combined with premium card design”。
- **Emotional Beat** — 目标感受（见下方 Emotional beat vocabulary）。单个词或复合短语（如 “Intrigue and awe”）。避免泛泛的 “positive” / “interested”。
- **Transition** — `{ continuity, intent, description, sharedMotif? }`，定义这个 scene 如何从**前一个** scene 抵达。每个 scene 都必须有，包括 scene 1（用 `continuity: "break"` + `intent: "cut"`）。这是**叙事层判断**（这一缝隙连不连续、是哪种衔接），不是视觉实现细节（具体 ease / blur 量 / 方向由下游 visual-design 按 preset/palette 翻译）。见下方 Transition taxonomy。

### Hook strategy taxonomy（开场策略分类）

选择一个。Hook 是最高杠杆的 3-5 秒。Reverse-engineered samples 使用了这些策略：

| Strategy（策略）                      | 何时使用                                      | 示例（sample）                                                                                                |
| ------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Shocking statistic**                | 你有可信的数据点量化行业级痛点                | "50% of companies still rely on paper checks" (PayCloud), Fosfor opens with industry-trend validation         |
| **Imagine / future-pacing**           | 产品创造了新的 category 或 paradigm           | "Imagine next generation AI for the enterprise" (AgentGPT)                                                    |
| **Direct address / character hail**   | 受众定义清晰且带有 tribe 属性                 | "Hey, sales pro." (JustCall), "Sales teams, listen up!" (JustCall IQ)                                         |
| **Pain validation**                   | 受众已经知道痛点，要把它说回给他们            | "Tired of clueless conversations?" (JustCall), "Responding to all of your online reviews..." (ResponseScribe) |
| **Visceral metaphor**                 | 痛点很抽象，需要把它变得具象、有身体感        | "Goodbye to long airport queues, goodbye to dinosaurs of the past" (HRS)                                      |
| **Rhetorical question**               | 立刻制造 cognitive gap，驱动好奇心            | "Need answers about your audience, now?" (GWI)                                                                |
| **Category announcement**             | 产品本身就是 category，要让 category 变得好记 | "Cloud BI Acceleration" (Kyvos), "Vibe.co. All-in-one TV Ad Platform" (Vibe.co)                               |
| **Visual spectacle / world-building** | 美学本身就是 pitch（crypto、NFT、lifestyle）  | "Welcome to the Ultraverse" (NFT Marketplace), "Fire" (Elemental Soul)                                        |
| **Question / invitation**             | Creator-tool / democratization narrative      | "Got something to create?" (Artinals)                                                                         |
| **Trend positioning**                 | 借势文化浪潮；新鲜感本身就是 hook             | "Introducing the future of influencer marketing" (Skye)                                                       |

### Persuasion technique catalog（说服技巧目录）

每个 scene 的 `persuasion` 字段都应该是一个 _named technique_，而不是模糊的 benefit。请从这个 catalog 中选择（提取自 22 个 reverse-engineered samples）。如果同时有多种机制在起作用，可以组合写（如 “Social proof + Authority via logos”）。

| Family（类别）               | Techniques（技巧）                                                                                                                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Pain/Friction**            | Pain agitation • Cognitive overload representation • Negative framing & contrast • Agitation by visual clutter • Contrast (chaos vs clean)                                                       |
| **Authority**                | Authority bias • Authority by association with logos • Expert authority • Statistical proof / hard metrics • Brand authority                                                                     |
| **Social**                   | Social proof • Bandwagon effect • Social belonging • Status seeking • Gamification + social proof (counter ticks) • In-group signaling (insider terms)                                           |
| **Reduction**                | Friction reduction • Risk reversal (free trial / no risk) • Simplification • Cognitive ease • Frictionless adoption                                                                              |
| **Vision**                   | Aspiration / innovation bias • Future pacing • Pain removal (bold absolutes) • Trend exploitation                                                                                                |
| **Proof**                    | Demonstration of capability • Visual proof of mechanics • Demonstrated efficiency (real-time visible) • Show, don't tell • Live-action preview                                                   |
| **Value**                    | Value stacking • Value-centric positioning • Feature-to-benefit translation • Price anchoring • Empirical proof & concrete numbers • Economic benefit / cost-efficiency • Win-win mutual benefit |
| **Empowerment**              | Empowerment & control • Risk reduction • Ownership clarity • Creative empowerment                                                                                                                |
| **Scarcity** (crypto-native) | Scarcity & temporal urgency (drop dates) • Exclusivity (tier scarcity) • FOMO • Anchoring via explicit pricing                                                                                   |
| **Structure**                | Rule of three (triplet structure) • Direct address / audience segmentation • Audience filtering                                                                                                  |
| **Personality**              | Humor / personality injection • Cultural reference / insider beat • Familiar web2-style patterns applied to web3                                                                                 |

当某个 scene 的 persuasion 无法映射到 catalog 中任何一项时，可以 inline 命名一种新 technique，但必须解释其 _mechanism_（例如 “Subtractive proof: removing the chaos visually instead of explaining why the new UI is clean”）。不要写泛泛的 “show benefits”。

### Emotional beat vocabulary（受限情绪词表）

`emotionalBeat` 应该是一个词，或一个短复合词组（如 “Intrigue and awe”、“Relief and assurance”）。避免泛泛的 “positive” / “happy” / “interested”。Reverse-engineered samples 使用了这个 catalog：

**Negative valley**（hook / pain_point scenes）：anxiety • frustration • overwhelm • tension • urgency • skepticism • cognitive overload • FOMO

**Pivot**（product_intro / branding scenes）：relief • curiosity • intrigue • aspiration • clarity

**Build**（feature_showcase / benefit_highlight scenes）：trust • confidence • control • power • awe • empowerment • foresight • excitement • playfulness • ease • prestige • desire • belonging • reassurance

**Resolution**（cta / final beats）：triumph • motivation • urgency (to act) • peace of mind • inevitability

带有复合 beats 的 scene 往往最强，例如 “Excitement _and_ foresight”（DeskLog Vision AI）、“Intrigue _and_ awe”（JustCall IQ real-time AI）、“Relief _and_ assurance”（NFT Marketplace wallet）。当两个感受都在起作用时，要把它们都写出来。

### Transition taxonomy（转场分类）

每个 scene 的 `transition` 描述它**如何从前一场抵达**，由两个机器字段 + 一段散文 +（morph 时）一个共享元素名组成：

#### `continuity` — `"break"` | `"continue"`（**驱动下游分组；由 `intent` 决定**）

`continuity` 唯一的机器后果是分组：`prep.mjs` 把 `continue` 的相邻场景分到**同一个 scene worker**。而两场落同一 worker 的**唯一理由**，是让这个 worker 能**亲手写一个 harness 注入不了的跨场接缝** —— 也就是 Tier-A 的共享元素 morph。所以：

- **`continue` 只配 `intent: morph`** —— 共享元素跨场变形，worker 在出场 + 进场两场内部亲手写这个 morph，必须同 worker。
- **`break` 配其余所有 intent**（`cut` / `slide` / `dissolve` / `zoom`）—— 这些是**场景之间**的 Tier-B 过渡，由 harness 在拼装后注入到 clip 外壳上，跨不跨 worker 都能注入，所以各开各的 worker。
- **Scene 1 永远是 `break`**（无前序场景可承接）。

> 因此 `continuity` 不是自由叙事字段，而是**跟着 `intent` 走**：`morph` ⇒ `continue`，其余一律 `break`。`validate.mjs narrator` 强制这条（违反 → fatal）。这么收窄是为了不让一个"叙事上感觉连续"的 slide 白占 cap=2 的 worker 名额、把真正需要 `continue` 的 morph 对挤出分组窗口（那是下游头号 fatal）。
>
> **但这是排除"假"连续，不是劝你少用 morph。** 只要两场之间真有一个承重的贯穿元素（见下方 `sharedMotif` 的选择判据），就**应该**用 `morph` 把它穿起来——这是片子里读起来最高级的接缝。一支 60-90s 的片子里有 **2-3 对**这样的 morph 是健康的（各自是独立的一对，中间用 Tier-B 断开）。唯一的硬约束：cap=2 下一对 morph 只能横跨**正好 2 场**，连续 ≥3 场的 morph 链会被 `prep.mjs` 拒（拆成"一对 morph + 一个 Tier-B"，或提高 `--scenes-per-group`）。

#### `intent` — 5 种叙事衔接意图（**不是**视觉实现）

从这 5 个里选一个。这是"叙事级"词汇 —— 表达"这缝隙是哪种衔接"，**不碰** blur 量 / 方向 / 时长（那些是 visual-design 按 preset/palette 翻译的事）：

| Intent     | 叙事含义                                                                                | **强制** continuity | 下游翻译方向（visual-design 决定具体值）     |
| ---------- | --------------------------------------------------------------------------------------- | ------------------- | -------------------------------------------- |
| `morph`    | **一个共享元素跨场变形**（共享元素任选——卡片→头像 / 波形→搜索框只是举例，模型自由发挥） | **`continue`**      | Tier-A 共享元素桥接（worker 在两场写 morph） |
| `cut`      | 利落切换，两场不连续（类型/调性切换、高能瞬间）                                         | **`break`**         | hard cut / crossfade                         |
| `slide`    | 方向性滑动 / 推移（匹配叙事流向：前进、下一点）                                         | **`break`**         | push-slide（方向由 visual-design 定）        |
| `dissolve` | 柔性溶解 / 焦点拉移（进入氛围场、情绪过渡）                                             | **`break`**         | crossfade / blur-crossfade（撞色时）         |
| `zoom`     | 镜头推进 / 缩放穿越到下一焦点                                                           | **`break`**         | zoom-through                                 |

`continuity` **不是自由选项，跟着 `intent` 走**：`morph` ⇒ `continue`，其余四个 ⇒ `break`（见下方 `continuity` 小节的"为什么"）。

#### `sharedMotif` — 仅当 `intent: "morph"` 时必填

命名**跨这一缝隙贯穿的那个元素 / motif**（叙事层的"什么在 morph"），≤8 词。例：`"the product card"` / `"the audio waveform"` / `"the avatar circle"`。**只命名是什么，不写几何/实现** —— 下游 worker 据此在两场放同一个元素并设计 morph。`intent` 非 morph 时省略此字段。

**什么算好的共享元素（先过这三关，再决定用 `morph`）**：不是"为了一个共享元素而造一个共享元素"，而是想清楚"这两场本来就有的哪个元素，能被最好地穿起来"。

- **两场都承重**：它在出场和进场里**都**是画面主角或关键信息载体（logo、产品本体、hero 设备、正在操作的那张卡片），**不是**为了凑 morph 临时塞进去的装饰。
- **本来就该共存**：先问"这两场有没有一个本来就会同时出现的物体？"——有，才用 morph 把它穿起来；没有，老实用 Tier-B。
- **变形推动叙事**：这个元素的 morph 要**承载**叙事跳转（同一个产品从用途 A 变到用途 B、同一个 logo 从 splash 落进 UI、同一条数据从图表变成结论），而不是让叙事停下来等一个炫技动画。

三条都满足才设 `intent: "morph"`；只满足一两条就改 `dissolve` / `slide`（Tier-B）——视觉接缝照样干净，且不占 cap=2 的 worker 名额。

#### `description` — 10-30 词 visual direction（已有，保留）

给下游读的具体方向：什么在 morph/slide/dissolve、视线落点、由什么颜色/形状引导。`morph` 时尤其要写清交接点（什么形态交给下一场）。

> **为什么是 5 个意图而不是旧的 7 个视觉类型**：旧 taxonomy（ui_morphing / match_cut / kinetic_typography / camera_zoom_pan / fade_color_bleed / vector_shape_wipe / none_first_scene）把"叙事意图"和"视觉实现"混在一层，逼下游从散文反推连续性。新模型只让 story-design 表达**叙事意图 + 连续性**，把"具体用哪种过渡 + blur/方向/时长"留给有 preset/palette 上下文的 visual-design。`morph` 意图 = 旧的 ui_morphing/match_cut（共享元素类），其余按上表归并。

> ⚠️ **archetype samples 待迭代**：`archetypes/*/` 下的 reverse-engineered samples 里如果还引用旧的 `transition.type`（ui_morphing 等），那是旧 schema 的遗留，后续按 golden sample 视频逐个更新到新的 `{continuity, intent, sharedMotif}` 模型。当前以本节的新模型为准。

### Script voice quality bar（旁白文案质量标准）

强脚本具有这些特征。失败模式是 bullet-point prose。以下两个类别中的例子都来自 reverse-engineered archive：

**Strong（好记、锋利、有 voice）：**

- _Anaphora_: "It is time to say goodbye to long airport queues, goodbye to customer frustration, goodbye to chaos, goodbye to dinosaurs of the past." (HRS) — 从具象升级到抽象，再到 metaphor。
- _Specificity_: "Just ask for what you need, like moms who post about dog treats, and get instant recommendations." (Skye) — 具体 user story 让抽象 AI capability 落地。
- _Imperative verbs in triplet_: "Advertise on TV. Target. Deliver. Measure." (Vibe.co) — 使用单音节词形成 Rule of Three。
- _Humor / personality_: "It reads emotions, sentiments, buying patterns — everything but minds. Maybe in the next update?" (JustCall IQ) — 笑点是一种 confidence signal。
- _Cultural signaling_: "Presenting: the GM button." (Alpha) — "GM" 是 crypto-Twitter 早安问候；insider reference 证明品牌属于受众的 tribe。
- _Disarming specificity_: "For Non-Designers, Entrepreneurs, Designers, Agencies, Grandma." (ZapBG) — "Grandma" 打破正式感，传达极高 accessibility。

**Weak（需要避免的失败模式）：**

- _Noun-phrase bullet lists_: "For crew. Seamless experience. Real-time communication. Crews always informed." — 听起来像 slide bullets，不像 dialogue。
- _Generic single-word bridges_（除非刻意为之）: "Or...", "And..." — 可以作为更强 arc 内的 breath beats；但如果是一个 5 秒 scene 的唯一内容，就很弱。
- _Vague capability claims_: "Streamline your workflow." — 每个 SaaS 都会这么说，等于没说。
- _Marketing-speak without grounding_: "Unlock the power of next-generation AI." — 说清楚它为一个 _person_ 做了什么，而不是谈抽象 category。

### 允许 empty / silent scripts

当视觉本身承载信息时，设置 `script: ""`，让 scene 保持 silent。Reverse-engineered samples 有意这样做：

- ZapBG scenes 8-9（drag-and-drop demo）：empty script，因为 UI interaction _就是_ message
- JustCall IQ scene 7（leaderboard）：empty script，因为 visual gamification 承载 persuasion
- Skye scenes 4、7（feature pivots）：empty script，因为 narrator 在 dashboard 更新时暂停

如果你设置 empty script，`narrativeIntent` 必须尤其强，因为 `narrativeRole` 和 `persuasion` 要承载 script 没有说出的内容。

## UI demo 应该是 sequence，不是单个 scene

Phase 2 archive 绝大多数都把 UI demo 当作 **3-15 个连续 scenes 组成的 sequence**，每个 scene 聚焦一个 feature area，并用 `intent: "morph"`（`continuity: continue`）的衔接粘合：

| Sample（样例）  | UI demo span | Runtime 占比       | Pattern（模式）                                                                                                       |
| --------------- | ------------ | ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Madison         | scenes 6-14  | 53%                | 9 consecutive feature_showcase scenes (integrations → SEO → reviews → social → campaign → reporting → chat assistant) |
| GWI             | scenes 3-6   | 45%                | 3 feature_showcase queries (NBA fans, APAC fashion, US parents) + value cascade                                       |
| DeskLog         | scenes 3-6   | 57%                | Check-in → journey tracking → manager control → vision AI                                                             |
| JustCall        | scenes 4-13  | 60%                | Contact import → 3 dialer modes → analytics → team perf → AI insights → outcomes                                      |
| NFT Marketplace | scenes 13-27 | 38% (of 39 scenes) | 15-scene purchase + sell workflow walkthrough                                                                         |

这意味着 “at least one UI demo scene” 这个要求应该被重新理解为：**至少一个 UI demo sequence（3+ 个连续 feature/benefit scenes，位于同一 product surface 上，scenes 之间用 `intent: "morph"` 或 `intent: "zoom"` + `continuity: "continue"` 衔接）。** 单个孤立 demo scene 很少能真正打动人。`continue` 会让这串场景落到同一个 worker，正好支持共享元素跨场 morph。

Planner 识别 UI demo sequence 的方式：

- Scene type 是 `feature_showcase` 或 `benefit_highlight`
- `narrativeRole` 包含 “Demonstrates,” “Highlights,” “Shows,” “Illustrates,” “Walks through” 这类词
- `script` 引用了 dashboard、interface、modal、workflow、profile，或具体 UI element names
- Transition `intent` 是 `morph` 或 `zoom`，`continuity` 是 `continue`
- 前一个 scene 是 `product_intro`；后续 scenes 继续 showcase，或 pivot 到 `social_proof` / `cta`

## 每个 scene 的 asset candidates

Phase 3（visual-design）和 Phase 4b（scene workers）**绝不会读取 `capture/`**，它们只消费 `narrator_scripts.json` 和 `section_plan.md`。这意味着下游 scene 可能用到的每个视觉素材，都必须在 `narrator_scripts.json` 的对应 scene 上命名。

对每个 scene，列出一个或多个 `assetCandidates`，也就是适合该 scene narrative intent 的视觉素材。完整列表会逐字转发给 Phase 4b scene worker（通过 Phase 4a 的 `prep.mjs`）；visual-design 会在 prose brief 中引用这些 candidates，worker 则根据 brief 决定哪些作为 focal、哪些作为 supporting。

**覆盖率目标（本 pipeline 默认优先）**：Asset Inventory 里的**内容型素材**（真实产品截图 / UI / 照片 / 图表 / 信息图）要尽量铺开用到整片——没被任何 scene 命名的素材会**永久丢失**（Phase 3/4b 绝不读 `capture/`）。两条操作准则：(1) **跨场景分散不同素材**——默认 scene A 用这张、scene B 换那张，而不是全片复用同一张 hero（genuine hero 在一段连续 demo sequence 里贯穿是例外，见下方"同一 asset 跨场"）；(2) **宁可多列**——一个 scene 带 2-3 个 candidate 没问题，visual-design 会按角色都安排上（focal + supporting），取舍权交给有构图上下文的下游，别在这里提前砍。

```jsonc
"assetCandidates": [
  {
    "path": "public/dashboard-hero.png",
    "description": "展示 feature timeline 的主产品 UI，1920x1080，dark theme"
  },
  {
    "path": "public/dashboard-detail.svg",
    "description": "timeline component 的独立 icon，适合作为 supporting motif"
  }
]
```

规则：

- **`path`** — 必须精确为 `public/<basename>`。`<basename>` 直接从 Asset Inventory 条目中读取（格式为 `assets/001-xxx.png`），去掉 `assets/` 前缀，加 `public/` 前缀。例如 `assets/022-2f1c0ba7-1260x944.png` → `"public/022-2f1c0ba7-1260x944.png"`。Phase 4a 会把 `capture/assets/` 复制到视频项目根的 `public/`。
- **`description`** — 简短 prose（≤25 words），说明 asset 里有什么、已知的大致尺寸，以及视觉备注（dark/light、dominant color、photo vs. UI vs. icon）。visual-design 会用它判断每个 asset 如何适配 scene composition；worker 会用它在不打开文件的情况下安排 assets。
- **每个有 visual hero 的 scene 至少 1 个 candidate。** 纯标题 / pure-typography scenes 可以使用空数组 `[]`；visual-design 和 Phase 4b worker 会把它视为刻意的 text-only scene。
- **有歧义时顺序很重要** — 把最符合叙事的 asset 放在第一位。下游在 description 仍留有选择空间时，往往偏向第一项。
- **只从实际下载的内容中选择。** 资产以 context_pack 的 **Asset Inventory** 为准；需要复核 basename 时 `ls capture/assets/`（没有 `capture/extraction.json` 这个文件）。编造不存在的 basename 会导致 Phase 4a fatal error。
- **同一个 asset 可以出现在多个 scenes 中**，只要叙事上同一个 hero 贯穿即可（例如 scenes 3-7 都 showcase 同一个 dashboard）。
- **尽量铺开覆盖，别浪费。** 跨所有 scene 的 `assetCandidates` 合起来应覆盖 Inventory 里**大部分**内容型素材。有真实产品截图 / 照片 / 图表没被任何 scene 用到时，优先把它安排进语义最贴合的 scene，而不是默认把那场做成 text-only。（纯标题 / 转场 cue 该 `[]` 还是 `[]`——覆盖率不是逼每场硬塞图。）
- **只列内容型素材，自己判断跳过 chrome / 装饰垃圾。** Inventory 是全量未过滤的：里面混着字体文件、favicon（`.ico`）、社交 / 支付 / app-store 徽章、logo 锁定变体、sprite 图集、极小（<~100px）装饰图标。这些**默认不作为 candidate**（字体根本不是图），除非某 scene 叙事上确实要（如 social-proof 摆真实媒体 logo 墙）。靠你读 `description` + `[kind]` + 尺寸判断，`prep` 不会替你过滤。

## 验证清单

- 每个 scene 是否都有完整的 Narrative Intent（全部 5 个字段）？
- 每个 scene 是否都有 `transition`，并包含 `continuity`（break/continue）、`intent`（5 个意图之一）、`description`（10-30 words）？**`intent: morph` ⟺ `continuity: continue`（且带 `sharedMotif`）；`cut` / `slide` / `dissolve` / `zoom` 一律 `continuity: break`**？Scene 1 是否 `continuity: break`？
- 每个 scene 是否都有 `assetCandidates`（array；text-only scenes 可以为空）？对于视觉 scenes，每个 candidate 的 `path` 是否对应 `capture/assets/` 中的真实文件？
- **覆盖率**：Inventory 里的内容型素材（排除字体 / favicon / 图标 / logo 变体）是否**大部分**都进了某个 scene 的 `assetCandidates`？有没有有价值的产品截图 / 照片 / 图表被漏掉、白白丢弃？
- 情绪弧线是否有有意义的起伏（不是单调的）？它是否匹配 archetype 的 pattern（PAS = negative valley → relief；Cascade = steady positive climb）？
- Sequence 是否由 narrative 驱动，而不是按网页顺序？
- 是否至少有一个 UI demo _sequence_（3+ 个连续 feature/benefit scenes，用 `intent: morph`/`zoom` + `continuity: continue` 衔接）？
- Persuasion fields 是否是 catalog 中的具名 techniques，而不是模糊 benefits？
- Emotional beats 是否具体（单词或短复合词组），而不是泛泛的 “positive”？
- Hook 是否使用了 taxonomy 中的具名 strategy？
- 是否只使用了一个 outer archetype（没有混用顶层 frameworks）？如果明确命名，inner-rhythm compounds 是可以的。

## `narrator_scripts.json`：canonical schema

Frontend（以及下游 agents）期望这些 **精确** 字段名。错误命名（如用 `scene_id` 代替 `sceneNumber`、用 `narration` 代替 `script`、把 intent fields 平铺）会导致展示和解析问题。

```json
{
  "project": "项目名称",
  "narrativeArchetype": "选择的 archetype（或 compound：\"<outer> with <inner>\"）",
  "emotionalArc": "情绪旅程描述（例如：'Frustration with manual processes shifting to relief and excitement through smart calling automation.'）",
  "scenes": [
    {
      "sceneNumber": 1,
      "sceneName": "scene 名称",
      "transition": {
        "continuity": "break|continue",
        "intent": "morph|cut|slide|dissolve|zoom",
        "sharedMotif": "仅当 intent=morph：跨场贯穿的元素名（≤8 词，如 'the product card'）；其他 intent 省略此键",
        "description": "10-30 词的具体 visual direction，说明什么在 morph/slide/dissolve，以及视线落点在哪里"
      },
      "narrativeIntent": {
        "type": "hook|pain_point|product_intro|feature_showcase|benefit_highlight|social_proof|branding|cta",
        "narrativeRole": "这个 scene 在故事中的 job（不是屏幕上有什么）",
        "keyMessage": "观众应该记住的信息（一句话）",
        "persuasion": "catalog 中的具名 technique（如果多种机制同时起作用，可以组合）",
        "emotionalBeat": "vocabulary 中的单词或短复合词组"
      },
      "assetCandidates": [
        {
          "path": "public/<basename-from-capture-assets>",
          "description": "简短 prose：asset 里有什么 + 大致尺寸 + 视觉备注"
        }
      ],
      "script": "纯文本旁白。可以嵌入 <em>/<brand>/<emph>/<cta> 标签作为创作期的注释（TTS 会自动 strip，不会读出来）。当视觉承载信息时可以是空字符串。",
      "estimatedDuration": "5-6s"
    }
  ]
}
```

字段规则：

- 使用 `sceneNumber`（不是 `scene_id`）、`sceneName`（不是 `scene_name`）、`script`（不是 `narration`），并把 intent fields 嵌套在 `narrativeIntent` 内（不要平铺到 scene object 上）。
- 每个 scene 都必须有 `transition` 字段（`continuity` + `intent` + `description`，morph 时加 `sharedMotif`），包括 scene 1（`continuity: "break"` + `intent: "cut"`）。**scene 1 没有前序场景，它的 `transition` 不会生成任何过渡（下游忽略）—— `intent: "cut"` 只是占位，填它即可，不必为首场设计真过渡。**
- **`intent: "morph"` ⟺ `continuity: "continue"`**（且 `sharedMotif` 非空）；`cut` / `slide` / `dissolve` / `zoom` 一律 `continuity: "break"`。`validate.mjs narrator` 强制（违反 → fatal）。
- `assetCandidates` 是 **必需** 字段，且必须是 array。真正 text-only 的 scenes（title cards、pure typography）使用 `[]`。任何有 visual hero 的 scene，都要至少包含一个 `{path, description}` 条目。
- 每个 `assetCandidates[].path` 都必须是 `public/<basename>`，且 basename 存在于 `capture/assets/` 中。Phase 4a 的 `prep.mjs` 会在文件缺失时失败。

### 字幕（不归 story-design 管）

不写 `captions: string[]` 字段。`script` 里 `<em>/<brand>/<emph>/<cta>` 标签会被 TTS 端 strip，写不写都不驱动下游视觉。

## 另请参阅

- `phases/visual-design/guide.md` — 每个 scene 的 visual treatment（下游；只消费 `narrator_scripts.json` 中的 `transition`、`narrativeIntent` 和 `assetCandidates`，绝不读取 `capture/`）。
- `phases/capture/guide.md` — 上游 Phase 1。负责 capture script 并写入 `capture/`。
- `/product-launch-video`（本 skill 的 `SKILL.md`）— orchestrator，会在 product-launch-video pipeline 的 Phase 2 调用本指南。
