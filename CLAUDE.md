# Hyperframes

Open-source video rendering framework: write HTML, render video.

```
packages/
  cli/       → hyperframes CLI (create, preview, lint, render)
  core/      → Types, parsers, generators, linter, runtime, frame adapters
  engine/    → Seekable page-to-video capture engine (Puppeteer + FFmpeg)
  player/    → Embeddable <hyperframes-player> web component
  producer/  → Full rendering pipeline (capture + encode + audio mix)
  studio/    → Browser-based composition editor UI
```

## Development

```bash
bun install     # Install dependencies
bun run build   # Build all packages
bun run test    # Run tests
```

**This repo uses bun**, not pnpm. Do NOT run `pnpm install` — it creates a `pnpm-lock.yaml` that should not exist. Workspace linking relies on bun's resolution from `"workspaces"` in root `package.json`.

### Linting & Formatting

This project uses **oxlint** and **oxfmt** (not biome, not eslint, not prettier).

```bash
bunx oxlint <files>        # Lint
bunx oxfmt <files>         # Format (write)
bunx oxfmt --check <files> # Format (check only, used by pre-commit hook)
```

Always run both on changed files before committing. The lefthook pre-commit hook runs `bunx oxlint` and `bunx oxfmt --check` automatically.

### Adding CLI Commands

When adding a new CLI command:

1. Define the command in `packages/cli/src/commands/<name>.ts` using `defineCommand` from citty
2. **Export `examples`** in the same file — `export const examples: Example[] = [...]` (import `Example` from `./_examples.js`). These are displayed by `--help`.
3. Register it in `packages/cli/src/cli.ts` under `subCommands` (lazy-loaded)
4. **Add to help groups** in `packages/cli/src/help.ts` — add the command name and description to the appropriate `GROUPS` entry. Without this, the command won't appear in `hyperframes --help` even though it works.
5. **Document it** in `docs/packages/cli.mdx` — add a section with usage examples and flags.
6. Validate by running `npx tsx packages/cli/src/cli.ts --help` (command appears in the list) and `npx tsx packages/cli/src/cli.ts <name> --help` (examples appear).

### Regression Test Golden Baselines (producer)

`packages/producer/tests/<name>/output/output.mp4` baselines MUST be generated
inside `Dockerfile.test`, not on your host. CI renders inside that Docker image
with a specific Chrome + ffmpeg build; pixel-level output drifts across
different host Chrome/ffmpeg versions and will fail PSNR at dozens of
checkpoints even when the code is correct.

```bash
# Build the test image once:
docker build -t hyperframes-producer:test -f Dockerfile.test .

# Generate or update a baseline (runs the harness with --update inside Docker):
bun run --cwd packages/producer docker:test:update <test-name>
```

Never run `bun run --cwd packages/producer test:update` directly from the
host to capture a baseline that will be committed — the resulting output.mp4
will not match CI. Use it only for local-only experimentation.

## Skills

Composition authoring (not repo development) is guided by skills installed via `npx skills add heygen-com/hyperframes`. See `skills/` for source. The active skills are:

- `/hyperframes-core` — HTML composition contract: data attributes, clips, tracks, sub-compositions, variables, media playback, deterministic render rules, and validation of minimal renderable projects.
- `/hyperframes-creative` — Non-animation creative direction: `design.md` handling, palettes, typography, narration, beat planning, audio-reactive, composition patterns. For atomic motion patterns and scene blueprints use `/hyperframes-animation`.
- `/hyperframes-animation` — Atomic animation rules (`rules-index.md`) + multi-phase scene blueprints (`blueprints-index.md`, loaded only when composing from a template). Also hosts `transitions/`, `techniques.md`, and `scripts/animation-map.mjs` for analyzing existing compositions.
- `/hyperframes-adapters` — All seven HyperFrames runtime adapters in one skill (GSAP, Lottie, Three.js, Anime.js, CSS keyframes, Web Animations API, TypeGPU). SKILL.md routes to `references/<runtime>.md`. GSAP is the default; others are loaded on demand.
- `/web-extraction` — Extract structured design data (assets, brand tokens, page structure) from a live website using Puppeteer headless Chrome. Standalone skill, also invoked as Phase 1 of `/product-launch-video`.
- `/story-design` — Design a video's story: pick a storytelling archetype, structure the scene sequence, define narrative intent per scene, write narrator scripts, output `narrator_scripts.json`. Standalone skill, also invoked as Phase 2 of `/product-launch-video`.
- `/visual-design` — Design the visual treatment + animation choreography for each scene: typography, color, composition, motion principles, and an animation effects catalog. Outputs `section_plan.md`. Standalone skill, also invoked as Phase 3 of `/product-launch-video`.
- `/product-launch-video` — End-to-end orchestrator that turns a URL into a 60-90s launch / SaaS explainer / promo video. Dispatches four subagent phases: `web-extraction` → `story-design` → `visual-design` → HyperFrames build (consumes `/hyperframes-animation` + `/hyperframes-core` + `/hyperframes-adapters` + friends), then renders. Skill ≠ subagent prompt: domain skills live at the top level; pipeline-specific subagent wrappers live in `skills/product-launch-video/agents/` and are injected into Agent dispatches.
- `/hyperframes-cli` — CLI dev loop: `init`, `lint`, `validate`, `inspect`, `preview`, `render`, `doctor`, `browser`, `info`, `upgrade`, `compositions`, `docs`, `benchmark`, and environment troubleshooting.
- `/hyperframes-registry` — Installing registry blocks and components via `hyperframes add`, wiring them into `index.html`, and working with `hyperframes.json`.
- `/hyperframes-tailwind` — Use for projects created with `hyperframes init --tailwind`. Pinned Tailwind v4 browser-runtime contract (distinct from Studio's Tailwind v3 setup).
- `/hyperframes-media` — Asset preprocessing (`tts` / `transcribe` / `remove-background`) plus caption authoring — subtitles, lyrics, karaoke, per-word styling, transcript JSON/SRT/VTT import, timing from audio. Captions live with the asset they consume.
