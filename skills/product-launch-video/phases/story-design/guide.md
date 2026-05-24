# Story Design

The story layer of a promotional video. Pick a storytelling archetype, design the scene sequence, define each scene's narrative intent, choose a transition for each seam, and write narrator scripts. Output: `narrator_scripts.json`.

## Procedure at a glance

1. Read `research/context_pack.md` end-to-end + skim `screenshot_full.png` + `ls research/assets/`
2. Pick **one** archetype (5 options below) — read **only that one's** `archetypes/<name>/overview.md`. Optionally read 0-2 of its `<sample>.md` files for modeling, never all of them
3. Pick hook strategy + design scene sequence + assign 5 narrative fields + transition + assetCandidates + script + estimatedDuration per scene
4. Write `narrator_scripts.json` using the canonical schema (at the bottom of this guide)
5. Run `node <validator> ./narrator_scripts.json` until exit 0

## Core principle

Video narrative is independent from webpage structure. A webpage is an information layout; a video is an emotional journey.

- The scene sequence comes from narrative design, not the original order of webpage sections.
- A webpage flows `hero → features → pricing → CTA`; a video flows `hook → pain → hope → proof → action`, or `vision → bridge → proof → action`, or `question → demo → demo → trust → action` — depending on the archetype.
- Reorder, combine, omit, or reframe webpage content as needed.
- Extraction data is the source of information and assets, not the story template.

The bar for the plan: **name the emotional beat alongside the structural type**, **name the specific persuasion technique** (not "show benefits"), and **prescribe a transition for every seam** — what carries the eye from scene N to N+1 is part of the story, not a downstream visual concern.

## Narrative archetypes

Before designing scenes, pick **one** storytelling archetype (or a hybrid named explicitly — see "Compound archetypes" below). Read its overview for guidance and study its golden samples; don't mix sections from different archetypes — each is a coherent emotional journey.

<archetypes>
<pain-agitate-solve path="archetypes/pain-agitate-solve/overview.md">
**Pain → Agitate → Solve (PAS)** — Build painful recognition, then reveal the remedy. Best for: products solving a known frustration, B2B tools, audiences who already feel the pain. Late product reveal (33-50% through) maximizes relief contrast. Samples: alpha (culture/identity-driven crypto PAS), madison (character-driven PAS + Feature-Benefit Cascade compound).
</pain-agitate-solve>

<future-pacing path="archetypes/future-pacing/overview.md">
**Future Pacing — Vision → Proof** — Paint a beautiful future, then prove it's achievable. Best for: AI/tech products with novel capabilities, new category products. Product named very early (4-10%) to anchor the vision. Samples: agentgpt (BAB / Feature-Benefit Cascade compound — the "Imagine" hook makes it Future-Pacing-flavored). Future Pacing and BAB share the visionary-opening DNA; pick BAB when the proof is a workflow walkthrough rather than capability demonstrations.
</future-pacing>

<demo-loop path="archetypes/demo-loop/overview.md">
**Demo Loop — Question → Instant Answer** — Minimal narrative around repeated product demos. Best for: UI-centric products, data tools, "seeing is believing". Often realized as the "Problem-Solution-Benefit Cascade" variant (skip agitation, go straight from problem to solution to layered benefits). Samples: gwi.
</demo-loop>

<before-after-bridge path="archetypes/before-after-bridge/overview.md">
**Before-After-Bridge (BAB)** — Show the friction state, contrast with the desired state, walk the bridge that gets you there. Best for: workflow products where the *process improvement* is the headline (not the pain or the vision alone). Mid product reveal (15-35%). Samples: kyvos, desklog, plus agentgpt (hybrid with Future Pacing).
</before-after-bridge>

<feature-benefit-cascade path="archetypes/feature-benefit-cascade/overview.md">
**Feature-Benefit Cascade** — Rapid sequential feature reveals building momentum toward CTA. No agitation phase. Best for: feature-rich SaaS, NFT collections / marketplaces, products where desire-escalation (not pain-relief) drives the buy. Product named early (0-22%) or shown visually from scene 1. Samples: vibe-co, elemental-soul. Often appears as the *internal rhythm* inside other archetypes — Madison runs PAS+Cascade, AgentGPT runs BAB+Cascade.
</feature-benefit-cascade>
</archetypes>

### Compound archetypes

Real videos often _layer_ archetypes. The reverse-engineered samples explicitly compound names — `"PAS with Feature-Benefit progression"` (Madison), `"Before-After-Bridge / Feature-Benefit Cascade"` (AgentGPT), `"Problem-Solution-Benefit Cascade"` (GWI). The pattern is:

- **Outer archetype** = the macro emotional arc (PAS / Future Pacing / BAB / Demo Loop)
- **Inner rhythm** = the tactical pattern inside the showcase phase (Feature-Benefit Cascade is the most common inner rhythm — alternating `feature_showcase` ↔ `benefit_highlight` for 6+ consecutive scenes)

Write the compound as `"<outer> with <inner>"` in `narrativeArchetype`. The downstream visual-design phase reads this to plan pacing — a Cascade inner rhythm means tight `ui_morphing` transitions and shorter scenes.

## Narrative architecture

Define the role of each scene in the story. Each scene needs five narrative fields, plus a transition spec:

- **Type** — one of: `hook` / `pain_point` / `product_intro` / `feature_showcase` / `benefit_highlight` / `social_proof` / `branding` / `cta`. `branding` is a _philosophical_ product positioning scene (consolidates the value statement, tagline, or category claim — distinct from `product_intro` which names the product, and `cta` which asks for action).
- **Narrative Role** — what this scene does in the story (the _job_, e.g., "Highlights the massive financial loss when linking data to decisions" — not "Shows the dashboard").
- **Key Message** — what the viewer should take away (one sentence).
- **Persuasion** — the _named_ persuasion mechanism (see Persuasion catalog below). "Show benefits" is the failure mode; "Visual Proof of automation mechanics" / "Authority by association with logos (AWS, GCP, Snowflake)" / "Anchoring bias via explicit pricing combined with premium card design" are the bar.
- **Emotional Beat** — the target feeling (see Emotional beat vocabulary below). Single word or compound ("Intrigue and awe"). Avoid generic "positive" / "interested".
- **Transition** — `{ type, description }` defining how this scene arrives from the previous one. Required for every scene including scene 1 (which uses `none_first_scene`).

### Hook strategy taxonomy

Pick one. Hook is the highest-leverage 3-5 seconds. The reverse-engineered samples deploy these:

| Strategy                              | When to use                                                   | Example (sample)                                                                                              |
| ------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Shocking statistic**                | You have a credible data point quantifying industry-wide pain | "50% of companies still rely on paper checks" (PayCloud), Fosfor opens with industry-trend validation         |
| **Imagine / future-pacing**           | Product creates a new category or paradigm                    | "Imagine next generation AI for the enterprise" (AgentGPT)                                                    |
| **Direct address / character hail**   | Audience is well-defined and tribal                           | "Hey, sales pro." (JustCall), "Sales teams, listen up!" (JustCall IQ)                                         |
| **Pain validation**                   | Audience already knows the pain — name it back to them        | "Tired of clueless conversations?" (JustCall), "Responding to all of your online reviews..." (ResponseScribe) |
| **Visceral metaphor**                 | Pain is abstract — make it physical                           | "Goodbye to long airport queues, goodbye to dinosaurs of the past" (HRS)                                      |
| **Rhetorical question**               | Create instant cognitive gap → drive curiosity                | "Need answers about your audience, now?" (GWI)                                                                |
| **Category announcement**             | Product _is_ the category — make the category memorable       | "Cloud BI Acceleration" (Kyvos), "Vibe.co. All-in-one TV Ad Platform" (Vibe.co)                               |
| **Visual spectacle / world-building** | Aesthetic IS the pitch (crypto, NFT, lifestyle)               | "Welcome to the Ultraverse" (NFT Marketplace), "Fire" (Elemental Soul)                                        |
| **Question / invitation**             | Creator-tool / democratization narrative                      | "Got something to create?" (Artinals)                                                                         |
| **Trend positioning**                 | Ride a cultural wave; novelty alone is the hook               | "Introducing the future of influencer marketing" (Skye)                                                       |

### Persuasion technique catalog

Every scene's `persuasion` field should be a _named technique_, not a vague benefit. Pick from this catalog (extracted from the 22 reverse-engineered samples). Combine techniques if multiple are operating ("Social proof + Authority via logos").

| Family                       | Techniques                                                                                                                                                                                       |
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

When a scene's persuasion does not map to anything in the catalog, name a new technique inline — but explain the _mechanism_ ("Subtractive proof: removing the chaos visually instead of explaining why the new UI is clean"). Don't write generic "show benefits".

### Emotional beat vocabulary (constrained)

`emotionalBeat` should be one word, or a short compound ("Intrigue and awe", "Relief and assurance"). Avoid generic "positive" / "happy" / "interested". The reverse-engineered samples draw from this catalog:

**Negative valley** (hook / pain_point scenes): anxiety • frustration • overwhelm • tension • urgency • skepticism • cognitive overload • FOMO

**Pivot** (product_intro / branding scenes): relief • curiosity • intrigue • aspiration • clarity

**Build** (feature_showcase / benefit_highlight scenes): trust • confidence • control • power • awe • empowerment • foresight • excitement • playfulness • ease • prestige • desire • belonging • reassurance

**Resolution** (cta / final beats): triumph • motivation • urgency (to act) • peace of mind • inevitability

A scene with compound beats is often the strongest — "Excitement _and_ foresight" (DeskLog Vision AI), "Intrigue _and_ awe" (JustCall IQ real-time AI), "Relief _and_ assurance" (NFT Marketplace wallet) — name both feelings when both are operating.

### Transition taxonomy

Every scene needs a `transition` field. Pick from this taxonomy (the 7 types that appear across all 22 reverse-engineered samples). Each downstream scene-builder reads `transition.type` to decide _how_ one scene hands off to the next.

| Type                 | When to use                                                                                                                          | Example description                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `none_first_scene`   | Scene 1 only — video starts here, no prior scene to transition from                                                                  | "Minimalist opening frame with bold black typography on a clean white background."                                           |
| `kinetic_typography` | Text-led handoff — word reveals, type wipes, animated lettering punctuates the seam                                                  | "Bold text transitions into a rounded orange container to unveil the product name."                                          |
| `ui_morphing`        | UI element morphs into the next UI element (most common transition inside a UI demo sequence — appears 30+ times across the archive) | "The audio waveform panel shifts smoothly into an active search interface."                                                  |
| `camera_zoom_pan`    | Camera dollies / zooms into the next scene's focal area                                                                              | "Pan down and zoom into the actual app buy checkout screen."                                                                 |
| `fade_color_bleed`   | Color-led dissolve, often into ambient/atmospheric scenes                                                                            | "The UI transitions into an abstract space of floating purple balls before focusing in on a single interactive pill button." |
| `vector_shape_wipe`  | Geometric shape slides/wipes across the frame                                                                                        | "Triangle zooms into a simplified database search UI."                                                                       |
| `match_cut`          | Hard cut where the two scenes share a shape, color, or silhouette                                                                    | "Fades into a dramatic aerial view of a Porsche dealership with red computer-vision targeting rings."                        |

Both `transition.type` (enum) and `transition.description` (prose 10-30 words) are required. The description is _visual direction_ the downstream visual-design phase consumes — it should be concrete enough that a builder can choreograph it (name what's morphing, where the eye lands, what color/shape leads).

### Script voice quality bar

Strong scripts share these traits — failure mode is bullet-point prose. Both examples are from the reverse-engineered archive:

**Strong (memorable, sharp, in-voice):**

- _Anaphora_: "It is time to say goodbye to long airport queues, goodbye to customer frustration, goodbye to chaos, goodbye to dinosaurs of the past." (HRS) — escalates from concrete to abstract to metaphor.
- _Specificity_: "Just ask for what you need, like moms who post about dog treats, and get instant recommendations." (Skye) — concrete user story grounds abstract AI capability.
- _Imperative verbs in triplet_: "Advertise on TV. Target. Deliver. Measure." (Vibe.co) — Rule of Three with monosyllables.
- _Humor / personality_: "It reads emotions, sentiments, buying patterns — everything but minds. Maybe in the next update?" (JustCall IQ) — joke is a confidence signal.
- _Cultural signaling_: "Presenting: the GM button." (Alpha) — "GM" is crypto-Twitter morning greeting; insider reference proves the brand is in the audience's tribe.
- _Disarming specificity_: "For Non-Designers, Entrepreneurs, Designers, Agencies, Grandma." (ZapBG) — "Grandma" breaks formality, signals extreme accessibility.

**Weak (failure modes to avoid):**

- _Noun-phrase bullet lists_: "For crew. Seamless experience. Real-time communication. Crews always informed." — reads like slide bullets, not dialogue.
- _Generic single-word bridges_ (unless deliberate): "Or...", "And..." — fine as breath beats inside a stronger arc; bad as the only content of a 5-second scene.
- _Vague capability claims_: "Streamline your workflow." — every SaaS says this; means nothing.
- _Marketing-speak without grounding_: "Unlock the power of next-generation AI." — say what it does for a _person_, not the abstract category.

### Empty / silent scripts are allowed

When the visual carries the message, set `script: ""` and let the scene be silent. The reverse-engineered samples do this deliberately:

- ZapBG scenes 8-9 (drag-and-drop demo): empty script — the UI interaction _is_ the message
- JustCall IQ scene 7 (leaderboard): empty script — the visual gamification carries the persuasion
- Skye scenes 4, 7 (feature pivots): empty script — narrator pauses while the dashboard updates

If you set empty script, the `narrativeIntent` must be especially strong — `narrativeRole` and `persuasion` carry what the script doesn't.

## UI demo as a sequence, not a single scene

The phase 2 archive overwhelmingly treats the UI demo as a **sequence of 3-15 consecutive scenes**, each focusing on one feature area, glued together with `ui_morphing` transitions:

| Sample          | UI demo span | % of runtime       | Pattern                                                                                                               |
| --------------- | ------------ | ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Madison         | scenes 6-14  | 53%                | 9 consecutive feature_showcase scenes (integrations → SEO → reviews → social → campaign → reporting → chat assistant) |
| GWI             | scenes 3-6   | 45%                | 3 feature_showcase queries (NBA fans, APAC fashion, US parents) + value cascade                                       |
| DeskLog         | scenes 3-6   | 57%                | Check-in → journey tracking → manager control → vision AI                                                             |
| JustCall        | scenes 4-13  | 60%                | Contact import → 3 dialer modes → analytics → team perf → AI insights → outcomes                                      |
| NFT Marketplace | scenes 13-27 | 38% (of 39 scenes) | 15-scene purchase + sell workflow walkthrough                                                                         |

This means the requirement "at least one UI demo scene" should be re-read as: **at least one UI demo sequence (3+ consecutive feature/benefit scenes on the same product surface, with `ui_morphing` or `camera_zoom_pan` transitions between them).** A single demo scene in isolation rarely lands.

How a planner identifies a UI demo sequence:

- Scene type is `feature_showcase` or `benefit_highlight`
- `narrativeRole` contains words like "Demonstrates," "Highlights," "Shows," "Illustrates," "Walks through"
- `script` references dashboard, interface, modal, workflow, profile, or specific UI element names
- Transition type is `ui_morphing` or `camera_zoom_pan`
- Preceding scene is `product_intro`; following scenes continue the showcase or pivot to `social_proof` / `cta`

## Inputs from Phase 1 — web-research

Phase 1 writes `./research/`. You read: `context_pack.md` (read first — compact digest), `extraction.json` (drill-down for asset URLs / section rects / colors), `screenshot_full.png` (visual judgment), `research/assets/` (your asset pool — every `assetCandidates[].path` must be `public/<basename>` where `<basename>` is a file here; Phase 4a's `prep.mjs` copies these into `hyperframes/public/`).

## Workflow

1. **Review research data**: read `context_pack.md` end-to-end. Skim `screenshot_full.png`. Drill into `extraction.json` only when you need exact asset URLs or color tokens. List the downloaded assets under `research/assets/` so you know your asset pool.
2. **Choose an archetype** that fits the product and audience (read the relevant `archetypes/<name>/overview.md`). If two archetypes are operating, name the compound (e.g., `"PAS with Feature-Benefit Cascade"`).
3. **Pick the hook strategy** from the taxonomy above. Write the opening line in the _voice_ you'll use throughout.
4. **Design the scene sequence** — purely narrative, not webpage order. Plan for one UI demo _sequence_ (3+ scenes), not one demo scene.
5. **Define the Narrative Intent** for each scene (all 5 fields, drawing persuasion from the catalog and emotional beat from the constrained vocab).
6. **Pick a transition** for every scene from the taxonomy. Write a 10-30 word description per transition that names what's morphing/wiping/zooming and where the eye lands.
7. **List per-scene `assetCandidates`** — one or more `{path, description}` entries (see "Asset candidates per scene" below). This is the bridge from research → visual-design: downstream Phase 3 reads only `narrator_scripts.json`, never `research/`, so the asset pool for each scene must be named here.
8. **Write narrator scripts** for each scene (plain text, no markdown). Use the script voice quality bar — anaphora, specificity, imperative verbs, humor, cultural signaling. Set `script: ""` when the visual carries the message (and strengthen the `narrativeIntent` fields to compensate).
9. **Set a realistic `estimatedDuration`** per scene (e.g. `"5-6s"` or `"5.5"`). Downstream tooling treats this as the timing contract.
10. **Write `narrator_scripts.json`** using the canonical schema below.

## Asset candidates per scene

Phase 3 (visual-design) and Phase 4b (scene workers) **never read `research/`** — they consume `narrator_scripts.json` and `section_plan.md` only. That means every visual asset a downstream scene might use must be named on the scene in `narrator_scripts.json`.

For each scene, list one or more `assetCandidates` — visual assets that fit the scene's narrative intent. The full list is forwarded verbatim to the Phase 4b scene worker (via Phase 4a's `prep.mjs`); visual-design references the candidates in its prose brief, and the worker decides which to make focal vs. supporting based on that brief.

```jsonc
"assetCandidates": [
  {
    "path": "public/dashboard-hero.png",
    "description": "main product UI showing the feature timeline, 1920x1080, dark theme"
  },
  {
    "path": "public/dashboard-detail.svg",
    "description": "isolated icon of the timeline component, suitable as a supporting motif"
  }
]
```

Rules:

- **`path`** — exactly `public/<basename>`. The `<basename>` must correspond to a file in `research/assets/` (Phase 4a copies that union into `hyperframes/public/`).
- **`description`** — short prose (≤25 words) that names what's in the asset, rough dimensions if you know them, and any visual notes (dark/light, dominant color, photo vs. UI vs. icon). visual-design uses this to decide how each asset fits the scene's composition; the worker uses it to lay the assets out without opening the files.
- **At least 1 candidate per scene that has a visual hero.** Title-only / pure-typography scenes may use an empty array `[]` — visual-design and the Phase 4b worker treat that as a deliberately text-only scene.
- **Order matters when there's ambiguity** — put the most narratively-aligned asset first. Downstream picks tend to favor the first entry when the description otherwise leaves the choice open.
- **Pick from what was actually downloaded.** Cross-reference `research/extraction.json` → asset list or `ls research/assets/`. Inventing a basename that doesn't exist is a Phase 4a fatal error.
- **A single asset MAY appear across multiple scenes** when narratively the same hero carries through (e.g., scenes 3–7 all showcase the same dashboard).

## Validation checklist

- Does every scene have a complete Narrative Intent (all 5 fields)?
- Does every scene have a `transition` with `type` (from taxonomy) and `description` (10-30 words)?
- Does every scene have `assetCandidates` (array, may be empty for text-only scenes)? For visual scenes, does each candidate's `path` correspond to a real file in `research/assets/`?
- Does the emotional arc rise and fall meaningfully (not monotone)? Does it match the archetype's pattern (PAS = negative valley → relief; Cascade = steady positive climb)?
- Is the sequence narrative-driven, not webpage-ordered?
- Is there at least one UI demo _sequence_ (3+ consecutive feature/benefit scenes with ui_morphing or camera_zoom_pan transitions)?
- Are persuasion fields named techniques from the catalog, not vague benefits?
- Are emotional beats specific (single word or short compound), not generic ("positive")?
- Does the hook use a named strategy from the taxonomy?
- Only one outer archetype used (no mixing top-level frameworks)? Inner-rhythm compounds are fine if named explicitly.

## `narrator_scripts.json` — canonical schema

The frontend (and downstream agents) expect these **exact** field names. Wrong names (`scene_id` instead of `sceneNumber`, `narration` instead of `script`, flattened intent fields) will cause display + parsing issues.

```json
{
  "project": "project name",
  "narrativeArchetype": "selected archetype (or compound: \"<outer> with <inner>\")",
  "emotionalArc": "description of the emotional journey (e.g. 'Frustration with manual processes shifting to relief and excitement through smart calling automation.')",
  "scenes": [
    {
      "sceneNumber": 1,
      "sceneName": "scene name",
      "transition": {
        "type": "none_first_scene|kinetic_typography|ui_morphing|camera_zoom_pan|fade_color_bleed|vector_shape_wipe|match_cut",
        "description": "10-30 word concrete visual direction — name what's morphing/wiping/zooming and where the eye lands"
      },
      "narrativeIntent": {
        "type": "hook|pain_point|product_intro|feature_showcase|benefit_highlight|social_proof|branding|cta",
        "narrativeRole": "what job this scene does in the story (not what's on screen)",
        "keyMessage": "what the viewer should remember (one sentence)",
        "persuasion": "named technique from the catalog (combine if multiple operate)",
        "emotionalBeat": "single word or short compound from the vocabulary"
      },
      "assetCandidates": [
        {
          "path": "public/<basename-from-research-assets>",
          "description": "short prose: what's in the asset + rough dims + visual notes"
        }
      ],
      "script": "plain text narration, no markdown. May be empty string when the visual carries the message.",
      "estimatedDuration": "5-6s"
    }
  ]
}
```

Field rules:

- Use `sceneNumber` (not `scene_id`), `sceneName` (not `scene_name`), `script` (not `narration`), and nest intent fields inside `narrativeIntent` (not flat on the scene object).
- The `transition` field is required for every scene including scene 1 (use `none_first_scene`).
- `assetCandidates` is **required** and must be an array. Use `[]` for genuinely text-only scenes (title cards, pure typography). For any scene with a visual hero, include at least one `{path, description}` entry.
- Each `assetCandidates[].path` must be `public/<basename>` where the basename exists in `research/assets/`. Phase 4a's `prep.mjs` will fail on missing files.

## See also

- `phases/visual-design/guide.md` — visual treatment for each scene (downstream; consumes `narrator_scripts.json` only — `transition`, `narrativeIntent`, and `assetCandidates` — never reads `research/`).
- `phases/web-research/guide.md` — upstream Phase 1. Owns the capture script and writes `research/`.
- `/product-launch-video` (this skill's `SKILL.md`) — orchestrator that calls this guide as Phase 2 of the website-to-launch-video pipeline.
