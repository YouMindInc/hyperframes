#!/usr/bin/env bash
# test-launch-video.sh
#
# One-shot test harness for the /launch-video Claude skill (sibling of the
# older /product-launch-video — same pipeline shape, leaner skill graph and
# 22 style presets baked in).
#
# Creates a self-contained project wired to the LOCAL hyperframes repo
# (CLI + skills), then either auto-launches Claude Code with the prompt
# pre-loaded, or prints the two commands to start it manually.
#
# Usage:
#   bash scripts/test-launch-video.sh                                          # default URL, auto-infer style
#   bash scripts/test-launch-video.sh https://www.heygen.com/                  # custom URL, auto-infer style
#   bash scripts/test-launch-video.sh --style capsule https://www.heygen.com/  # force style preset
#   bash scripts/test-launch-video.sh --no-launch <URL>                        # setup only, no auto-launch
#   bash scripts/test-launch-video.sh -h                                       # help
#
# What it does:
#   1. Verifies prerequisites (bun, npm, optionally Chrome + claude).
#   2. Builds the local CLI if dist/cli.js is missing.
#   3. Creates a fresh project under /tmp/launch-video-<timestamp>/, scaffolded
#      via the local CLI with --skip-skills.
#   4. Patches the project's package.json so npx hyperframes resolves to the
#      local CLI build (not the published npm version).
#   5. Installs the LOCAL skills tree into the project's .claude/skills/ via
#      `npx skills add`. The launch-video skill carries its own phases/ and
#      agents/ trees inside, so we don't need to copy phase guides separately.
#   6. Verifies the launch-video skill landed, plus the 5 sibling
#      hyperframes-* skills the phase 4 workers cross-link to.
#   7. Either execs claude with the prompt baked in, or prints the two
#      commands you need to start the test.
#
# Why each step matters (read once, then forget):
#   - Step 2 is needed because the setup uses `node $REPO/packages/cli/dist/cli.js init`
#     to scaffold — that file must exist.
#   - Step 4 uses `file:` deps so the project tracks live edits to the repo.
#     MUST be npm (not bun): bun follows the cli pkg's `workspace:*`
#     devDependencies and fails. npm only resolves the file: package's
#     `dependencies`.
#   - Step 5 passes `--agent claude-code` explicitly. `--all` defaults to
#     detected agents only and would skip Claude Code (only AGENTS.md is
#     written by init, which Codex/Cursor detect, but skills CLI doesn't
#     treat it as a Claude Code marker). Explicit --agent makes skills land
#     in .claude/skills/ which is what cc reads.
#
# Iterate after editing skills:
#   The skills are COPIED (not symlinked) into the test project. To pick up
#   edits in skills/launch-video/, either re-run this script (creates a
#   fresh dir) or run:
#     cd <test_dir> && rm -rf .claude/skills/launch-video && \
#       npx --yes skills add /Users/wenbozhu/Dev/work/hyperframes \
#         --skill launch-video --agent claude-code --yes

set -uo pipefail

# --------- defaults ---------
DEFAULT_URL="https://hyperframes.heygen.com/"

# --------- arg parse ---------
URL=""
STYLE=""
LAUNCH=1
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      sed -n '2,46p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    --no-launch)
      LAUNCH=0
      shift
      ;;
    --style)
      [[ $# -ge 2 ]] || { echo "--style requires a value" >&2; exit 1; }
      STYLE="$2"
      shift 2
      ;;
    --style=*)
      STYLE="${1#--style=}"
      shift
      ;;
    -*)
      echo "Unknown flag: $1" >&2
      echo "Run with --help for usage." >&2
      exit 1
      ;;
    *)
      URL="$1"
      shift
      ;;
  esac
done

[[ -z "$URL" ]] && URL="$DEFAULT_URL"

# --------- self-locate the hyperframes repo ---------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HF_REPO="$(cd "$SCRIPT_DIR/.." && pwd)"
HF_CLI_PKG="$HF_REPO/packages/cli"
HF_CLI_BIN="$HF_CLI_PKG/dist/cli.js"

# --------- pretty output helpers ---------
say()  { printf "\033[1;36m→ %s\033[0m\n" "$*"; }
ok()   { printf "  \033[0;32m✓\033[0m %s\n" "$*"; }
warn() { printf "  \033[0;33m! %s\033[0m\n" "$*"; }
fail() { printf "  \033[0;31m✗ %s\033[0m\n" "$*"; exit 1; }

# --------- step 1: prerequisites ---------
say "Checking prerequisites..."

command -v bun >/dev/null 2>&1 || fail "bun not installed. Install: curl -fsSL https://bun.sh/install | bash"
command -v npm >/dev/null 2>&1 || fail "npm not installed (need Node.js — install Node 22+)."

ok "bun: $(bun --version)"
ok "node: $(node --version)"
ok "npm: $(npm --version)"

if command -v claude >/dev/null 2>&1; then
  ok "claude (Claude Code) on PATH"
else
  warn "claude not on PATH — you'll need Claude Code installed (https://claude.ai/download)"
fi

CHROME_MAC="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
CHROME_LINUX="/usr/bin/chromium"
if [[ -x "$CHROME_MAC" ]] || [[ -x "$CHROME_LINUX" ]]; then
  ok "Chrome / Chromium found (Phase 1 web-research uses headless Chrome via Playwright)"
else
  warn "No Chrome at $CHROME_MAC or $CHROME_LINUX — Phase 1 (web-research) will fail without it"
fi

# Branch hint — launch-video currently lives on a feature branch
CURRENT_BRANCH="$(cd "$HF_REPO" && git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
if [[ "$CURRENT_BRANCH" != "launch-video" ]]; then
  warn "Current branch is '$CURRENT_BRANCH'. /launch-video lives on 'launch-video' — if you don't see it, switch branches."
fi

# --------- step 2: build local CLI if missing ---------
say "Checking local CLI build..."

if [[ ! -f "$HF_CLI_BIN" ]]; then
  warn "CLI not built at $HF_CLI_BIN — running bun install + bun run build (~30-60s)..."
  (cd "$HF_REPO" && bun install && bun run build) || fail "CLI build failed."
  [[ -f "$HF_CLI_BIN" ]] || fail "Build completed but $HF_CLI_BIN still missing."
fi
ok "local CLI: $(node "$HF_CLI_BIN" --version 2>/dev/null || echo unknown)"

# --------- step 3: scaffold a fresh test project ---------
TEST_PARENT="${TEST_PARENT:-/tmp}"
TEST_NAME="launch-video-$(date +%H%M%S)"
TEST_DIR="$TEST_PARENT/$TEST_NAME"

say "Creating test project at $TEST_DIR ..."

mkdir -p "$TEST_PARENT"
cd "$TEST_PARENT"

if [[ -e "$TEST_NAME" ]]; then
  fail "$TEST_DIR already exists. Pick another timestamp by waiting 1s and re-running."
fi

node "$HF_CLI_BIN" init "$TEST_NAME" \
  --non-interactive --skip-skills --example=blank \
  || fail "hyperframes init failed."

cd "$TEST_NAME"

# --------- step 4: patch package.json (use file: dep, strip npx pins) ---------
say "Patching package.json to use the local CLI..."

HF_CLI_PKG_FOR_NODE="$HF_CLI_PKG" node - <<'JS'
const fs = require('fs');
const j = JSON.parse(fs.readFileSync('package.json', 'utf8'));
j.dependencies = j.dependencies || {};
j.dependencies.hyperframes = 'file:' + process.env.HF_CLI_PKG_FOR_NODE;
for (const k of Object.keys(j.scripts || {})) {
  j.scripts[k] = j.scripts[k]
    .replace(/npx\s+(?:--yes\s+)?hyperframes(@[^\s]+)?/g, 'hyperframes');
}
fs.writeFileSync('package.json', JSON.stringify(j, null, 2) + '\n');
JS

ok "package.json points hyperframes → file:$HF_CLI_PKG"

# --------- step 5: npm install (NOT bun — see header notes) ---------
say "Running npm install (this is the one place we must use npm, not bun)..."

npm install --no-audit --no-fund --silent || fail "npm install failed."
[[ -x "node_modules/.bin/hyperframes" ]] || fail "node_modules/.bin/hyperframes missing after install."
ok "node_modules/.bin/hyperframes → local CLI"

# --------- step 6: install skills from the local repo ---------
say "Installing skills from the local repo into .claude/skills/ ..."

npx --yes skills add "$HF_REPO" --skill '*' --agent claude-code --yes \
  || fail "skills add failed."

# --------- step 7: verify skill graph landed ---------
say "Verifying skill installation..."

# Top-level skills the orchestrator + scene workers Skill-load.
# launch-video is the orchestrator; the 5 hyperframes-* skills are loaded by
# the Phase 4b scene workers (animation rules, blueprints, media, cli, core).
REQUIRED_SKILLS=(launch-video hyperframes-core hyperframes-animation hyperframes-creative hyperframes-cli hyperframes-media)
MISSING=()
for s in "${REQUIRED_SKILLS[@]}"; do
  if [[ -d ".claude/skills/$s" ]]; then
    ok ".claude/skills/$s/"
  else
    MISSING+=("$s")
  fi
done

# Phase guides nested inside launch-video. These don't load via Skill tool;
# the orchestrator passes their absolute paths to subagents via Dispatch
# context, so they must physically land on disk under .claude/skills/.
PHASE_GUIDES=(web-research design-system story-design audio visual-design)
for p in "${PHASE_GUIDES[@]}"; do
  guide=".claude/skills/launch-video/phases/$p/guide.md"
  if [[ -f "$guide" ]]; then
    ok "$guide"
  else
    MISSING+=("$guide")
  fi
done

if [[ ${#MISSING[@]} -gt 0 ]]; then
  warn "Missing: ${MISSING[*]}"
  warn "Subagent dispatches that rely on them will fail. Check skills/ in the repo and re-run."
fi

# Verify the orchestrator's subagent prompt wrappers came across.
# 5 expected: design-system, story-design, visual-design, hyperframes-scene, hyperframes-finalize
# (audio + prep are deterministic Bash scripts — no subagent prompt.)
AGENTS_DIR=".claude/skills/launch-video/agents"
if [[ -d "$AGENTS_DIR" ]]; then
  AGENT_COUNT=$(find "$AGENTS_DIR" -maxdepth 1 -name "*.md" -type f | wc -l | tr -d ' ')
  ok "$AGENTS_DIR/ has $AGENT_COUNT subagent prompt file(s) (expect 5)"
else
  warn "$AGENTS_DIR/ missing — the orchestrator's dispatch wrappers didn't come across."
fi

# Verify the 22 style presets came across.
PRESETS_DIR=".claude/skills/launch-video/phases/design-system/style-presets"
if [[ -d "$PRESETS_DIR" ]]; then
  PRESET_COUNT=$(find "$PRESETS_DIR" -maxdepth 1 -mindepth 1 -type d | wc -l | tr -d ' ')
  ok "$PRESETS_DIR/ has $PRESET_COUNT preset(s) (expect 22)"
  if [[ -n "$STYLE" ]] && [[ ! -d "$PRESETS_DIR/$STYLE" ]]; then
    fail "--style '$STYLE' not found under $PRESETS_DIR/. Available: $(find "$PRESETS_DIR" -maxdepth 1 -mindepth 1 -type d -exec basename {} \; | sort | tr '\n' ' ')"
  fi
else
  warn "$PRESETS_DIR/ missing — auto-infer / --style won't work."
fi

# --------- step 8: launch Claude (or print next steps) ---------
echo ""
printf "\033[1;32m========================================================\033[0m\n"
printf "\033[1;32m Setup complete.\033[0m\n"
printf "\033[1;32m========================================================\033[0m\n"
echo ""
echo "Project:  $TEST_DIR"
echo "Target:   $URL"
if [[ -n "$STYLE" ]]; then
  echo "Style:    $STYLE  (forced via --style)"
else
  echo "Style:    auto-infer  (set --style to force a preset)"
fi
echo ""

if [[ -n "$STYLE" ]]; then
  PROMPT="use the /launch-video skill to make a launch video for $URL. Force the design system style preset to '$STYLE' — when running build-design.mjs in Phase 1b, pass --style $STYLE."
else
  PROMPT="use the /launch-video skill to make a launch video for $URL"
fi

# Happy path: auto-launch Claude Code in this directory with the prompt baked in.
# Skip if --no-launch was passed, claude isn't on PATH, or the user declines.
if [[ "$LAUNCH" == "1" ]] && command -v claude >/dev/null 2>&1; then
  read -r -p "Launch Claude Code now with prompt pre-loaded? [Y/n] " ans
  case "${ans:-y}" in
    [Yy]*)
      printf "\033[1;36m→ exec claude --dangerously-skip-permissions \"%s\"\033[0m\n" "$PROMPT"
      exec claude --dangerously-skip-permissions "$PROMPT"
      ;;
  esac
  echo ""
fi

# Manual path (--no-launch, claude not on PATH, or user declined the prompt above).
echo "To start the test, run these two commands:"
echo ""
printf "  \033[1;37mcd %s\033[0m\n" "$TEST_DIR"
printf "  \033[1;37mclaude --dangerously-skip-permissions\033[0m\n"
echo ""
echo "Then paste this prompt into Claude:"
echo ""
printf "  \033[1;33m%s\033[0m\n" "$PROMPT"
echo ""
echo "What to watch for:"
echo "  • Claude should invoke the /launch-video skill"
echo "  • Step 1 fans out web-research (Bash) + design-system (subagent) in parallel"
echo "  • Phase 1  produces  ./research/context_pack.md"
echo "  • Phase 1b produces  ./design-system/design.html + chunks/"
echo "  • Phase 2  produces  ./narrator_scripts.json"
echo "  • Phase 2.5 produces ./audio_meta.json + assets/voice/*"
echo "  • Phase 3  produces  ./section_plan.md"
echo "  • Phase 4a produces  ./group_spec.json"
echo "  • Phase 4b produces  ./hyperframes/compositions/scene_*.html (N workers parallel)"
echo "  • Phase 4c produces  ./hyperframes/renders/video.mp4"
echo "  • Each phase appends a line to ./context.log (used by the Resume table)"
echo ""
echo "Baselines (from skills/launch-video/USAGE.md):"
echo "  • opus default      → ~25-50 min, 1-16 MB mp4"
echo "  • opus --effort low → ~18 min,    cleaner gates (recommended for first run)"
echo ""
echo "If the skill doesn't auto-trigger, force it with:"
printf "  \033[1;33muse the /launch-video skill to make a launch video for %s\033[0m\n" "$URL"
echo ""
