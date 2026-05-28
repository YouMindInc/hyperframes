#!/usr/bin/env bash
# test-product-launch-video.sh
#
# One-shot test harness for the /launch-video-v2 Claude skill.
# Creates a self-contained workspace wired to the LOCAL hyperframes repo
# (CLI + skills). The workspace root is for agent state and .claude/ only;
# it deliberately does not write root AGENTS.md / CLAUDE.md files.
# launch-video-v2 creates the actual HyperFrames project under an agent-chosen
# videos/<semantic-name>/ directory after it understands the user's intent.
#
# Usage:
#   bash scripts/test-product-launch-video.sh                       # default URL
#   bash scripts/test-product-launch-video.sh https://example.com/  # custom URL
#   bash scripts/test-product-launch-video.sh --name heygen-promo https://heygen.com/
#   bash scripts/test-product-launch-video.sh --no-launch <URL>     # setup only, no auto-launch
#   bash scripts/test-product-launch-video.sh -h                    # help
#
# Without --name, the agent chooses the video directory name after it understands
# the target. If --name is provided, it must already be lowercase kebab-case.
#
# What it does:
#   1. Verifies prerequisites (bun, npm, optionally Chrome + claude).
#   2. Builds the local CLI if dist/cli.js is missing.
#   3. Creates a fresh workspace under /tmp/launch-video-<timestamp>/.
#   4. Writes a workspace package.json so npx hyperframes resolves to the
#      local CLI build (not the published npm version).
#   5. Installs the skills tree (launch-video-v2, hyperframes-*) from the
#      LOCAL repo into the workspace .claude/skills/ via `npx skills add`.
#   6. Verifies launch-video-v2 and its phase files landed correctly.
#   7. Prints the commands you need to start the test.
#
# Why each step matters (read once, then forget):
#   - Step 2 is needed because launch-video-v2 will use the local CLI to scaffold
#     videos/<semantic-name>/ as the actual HyperFrames project.
#   - Step 4 uses `file:` deps so npx tracks live edits to the repo.
#     MUST be npm (not bun): bun follows the cli pkg's `workspace:*`
#     devDependencies and fails. npm only resolves the file: package's
#     `dependencies`.
#   - Step 5 passes `--agent claude-code` explicitly so skills land in
#     .claude/skills/ even though this harness deliberately does not write
#     root AGENTS.md / CLAUDE.md files.
#
# Iterate after editing skills:
#   The skills are COPIED (not symlinked) into the test project. To pick up
#   edits in skills/, either re-run this script (creates a fresh dir) or run:
#     cd <test_dir> && rm -rf .claude/skills/launch-video-v2 && \
#       npx --yes skills add /path/to/hyperframes \
#         --skill launch-video-v2 --agent claude-code --yes

set -uo pipefail

# --------- defaults ---------
DEFAULT_URL="https://hyperframes.heygen.com/"
VIDEO_ROOT="${VIDEO_ROOT:-videos}"
VIDEO_NAME="${VIDEO_NAME:-}"

# --------- arg parse ---------
URL=""
LAUNCH=1
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      sed -n '2,41p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    --no-launch)
      LAUNCH=0
      shift
      ;;
    --name|--video-name)
      if [[ $# -lt 2 ]]; then
        echo "Missing value for $1" >&2
        exit 1
      fi
      VIDEO_NAME="$2"
      shift 2
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

if [[ -n "$VIDEO_NAME" && ! "$VIDEO_NAME" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  fail "--name must be explicit lowercase kebab-case, for example: heygen-promo"
fi

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
  ok "Chrome / Chromium found (web-research phase needs headless Chrome)"
else
  warn "No Chrome at $CHROME_MAC or $CHROME_LINUX — Phase 1 (web-research) will fail without it"
fi

# Branch hint — orchestrator + sub-skills currently live on a feature branch
CURRENT_BRANCH="$(cd "$HF_REPO" && git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
if [[ "$CURRENT_BRANCH" != "feat/product-launch-v2" ]]; then
  warn "Current branch is '$CURRENT_BRANCH'. /launch-video-v2 is expected on 'feat/product-launch-v2' — if you don't see it, switch branches."
fi

# --------- step 2: build local CLI if missing ---------
say "Checking local CLI build..."

if [[ ! -f "$HF_CLI_BIN" ]]; then
  warn "CLI not built at $HF_CLI_BIN — running bun install + bun run build (~30-60s)..."
  (cd "$HF_REPO" && bun install && bun run build) || fail "CLI build failed."
  [[ -f "$HF_CLI_BIN" ]] || fail "Build completed but $HF_CLI_BIN still missing."
fi
ok "local CLI: $(node "$HF_CLI_BIN" --version 2>/dev/null || echo unknown)"

# --------- step 3: create a fresh test workspace ---------
TEST_PARENT="${TEST_PARENT:-/tmp}"
TEST_NAME="launch-video-$(date +%H%M%S)"
TEST_DIR="$TEST_PARENT/$TEST_NAME"
if [[ -n "$VIDEO_NAME" ]]; then
  VIDEO_DIR="$VIDEO_ROOT/$VIDEO_NAME"
else
  VIDEO_DIR="$VIDEO_ROOT/<agent-chosen-name>"
fi

say "Creating test workspace at $TEST_DIR ..."

mkdir -p "$TEST_PARENT"
cd "$TEST_PARENT"

if [[ -e "$TEST_NAME" ]]; then
  fail "$TEST_DIR already exists. Pick another timestamp by waiting 1s and re-running."
fi

mkdir -p "$TEST_NAME" || fail "failed to create $TEST_DIR"

cd "$TEST_NAME"

# --------- step 4: write workspace package.json (use file: dep) ---------
say "Writing workspace package.json to use the local CLI..."

HF_CLI_PKG_FOR_NODE="$HF_CLI_PKG" WORKSPACE_NAME="$TEST_NAME" VIDEO_ROOT_FOR_NODE="$VIDEO_ROOT" VIDEO_NAME_FOR_NODE="$VIDEO_NAME" node - <<'JS'
const fs = require('fs');
const workspaceName = process.env.WORKSPACE_NAME;
const videoRoot = process.env.VIDEO_ROOT_FOR_NODE || 'videos';
const videoName = process.env.VIDEO_NAME_FOR_NODE || "";
const videoDir = videoName ? `${videoRoot}/${videoName}` : `${videoRoot}/<agent-chosen-name>`;
const detectVideoDir = `d=\${VIDEO_DIR:-$(find ${videoRoot} -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sort | head -n 1)}; [ -n "$d" ] || { echo "No video project found under ${videoRoot}/ yet."; exit 1; }`;
const j = {
  name: workspaceName,
  private: true,
  type: 'module',
  scripts: videoName
    ? {
        'video:init': `mkdir -p ${videoRoot} && hyperframes init ${videoDir} --non-interactive --skip-skills --example=blank && rm -f ${videoDir}/AGENTS.md ${videoDir}/CLAUDE.md`,
        dev: `cd ${videoDir} && hyperframes preview`,
        check: `cd ${videoDir} && hyperframes lint && hyperframes validate && hyperframes inspect`,
        render: `cd ${videoDir} && hyperframes render --output renders/video.mp4`,
      }
    : {
        'video:init': `[ -n "$VIDEO_NAME" ] || { echo "Set VIDEO_NAME=<semantic-name> for manual init, or let /launch-video-v2 choose and initialize ${videoRoot}/<name>."; exit 1; }; case "$VIDEO_NAME" in *[!a-z0-9-]* | "" | -*) echo "VIDEO_NAME must be lowercase kebab-case, for example: heygen-promo"; exit 1;; esac; mkdir -p ${videoRoot} && hyperframes init "${videoRoot}/$VIDEO_NAME" --non-interactive --skip-skills --example=blank && rm -f "${videoRoot}/$VIDEO_NAME/AGENTS.md" "${videoRoot}/$VIDEO_NAME/CLAUDE.md"`,
        dev: `${detectVideoDir}; cd "$d" && hyperframes preview`,
        check: `${detectVideoDir}; cd "$d" && hyperframes lint && hyperframes validate && hyperframes inspect`,
        render: `${detectVideoDir}; cd "$d" && hyperframes render --output renders/video.mp4`,
      },
  dependencies: {
    hyperframes: 'file:' + process.env.HF_CLI_PKG_FOR_NODE,
  },
};
fs.writeFileSync('package.json', JSON.stringify(j, null, 2) + '\n');
JS

ok "workspace package.json points hyperframes → file:$HF_CLI_PKG"
if [[ -n "$VIDEO_NAME" ]]; then
  ok "video project name: $VIDEO_NAME"
  ok "video project target: $VIDEO_DIR"
else
  ok "video project name: agent will choose after understanding the request"
  ok "video project target: $VIDEO_ROOT/<agent-chosen-name>"
fi

# --------- step 4.5: write .env.example at the workspace root ---------
# Dev convenience: one shared .env above videos/<name>/ — both the CLI's
# loadEnvFile and audio.mjs walk up ≤ 5 dirs, so this reaches both code paths.
say "Writing .env.example (cp to .env and fill what you have)..."

cat > .env.example <<'ENV'
# launch-video-v2 — optional API keys. All blank = local fallbacks (Kokoro
# TTS + MusicGen BGM + DOM-only captions). `cp .env.example .env` and fill
# in what you have. videos/<name>/.env (if present) wins over this file.

# Capture image captions + Lyria BGM (one key, two uses). GOOGLE_API_KEY is
# an alias. Free tier at https://ai.google.dev.
GEMINI_API_KEY=

# TTS — audio.mjs picks the first available. HeyGen returns word timestamps.
HEYGEN_API_KEY=
ELEVENLABS_API_KEY=
ENV
ok ".env.example → $TEST_DIR/.env.example"

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

# Top-level skills the orchestrator + subagents load via Skill tool.
REQUIRED_SKILLS=(launch-video-v2 hyperframes-core hyperframes-animation hyperframes-cli hyperframes-media)
MISSING=()
for s in "${REQUIRED_SKILLS[@]}"; do
  if [[ -d ".claude/skills/$s" ]]; then
    ok ".claude/skills/$s/"
  else
    MISSING+=("$s")
  fi
done

# Phase guides nested inside launch-video-v2. These don't load via Skill
# tool; the orchestrator passes their absolute paths to subagents via Dispatch
# context, so they must physically land on disk under .claude/skills/.
PHASE_GUIDES=(web-research design-system story-design visual-design audio)
for p in "${PHASE_GUIDES[@]}"; do
  guide=".claude/skills/launch-video-v2/phases/$p/guide.md"
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

# Verify the orchestrator's agents/ wrappers came across.
AGENTS_DIR=".claude/skills/launch-video-v2/agents"
if [[ -d "$AGENTS_DIR" ]]; then
  AGENT_COUNT=$(find "$AGENTS_DIR" -maxdepth 1 -name "*.md" -type f | wc -l | tr -d ' ')
  ok "$AGENTS_DIR/ has $AGENT_COUNT subagent prompt file(s) (expect 5)"
else
  warn "$AGENTS_DIR/ missing — the orchestrator's dispatch wrappers didn't come across."
fi

REQUIRED_SCRIPTS=(audio.mjs prep.mjs check-compositions.mjs validate-narrator-scripts.mjs validate-section-plan.mjs)
for s in "${REQUIRED_SCRIPTS[@]}"; do
  f=".claude/skills/launch-video-v2/scripts/$s"
  if [[ -f "$f" ]]; then
    ok "$f"
  else
    MISSING+=("$f")
    warn "$f missing"
  fi
done

# --------- step 8: launch Claude (or print next steps) ---------
echo ""
printf "\033[1;32m========================================================\033[0m\n"
printf "\033[1;32m Setup complete.\033[0m\n"
printf "\033[1;32m========================================================\033[0m\n"
echo ""
echo "Project:  $TEST_DIR"
if [[ -n "$VIDEO_NAME" ]]; then
  echo "Video:    $TEST_DIR/$VIDEO_DIR"
else
  echo "Video:    agent-chosen under $TEST_DIR/$VIDEO_ROOT/"
fi
echo "Target:   $URL"
echo "Env:      $TEST_DIR/.env.example  (cp .env.example .env and fill in any cloud keys you have; all optional)"
echo ""

if [[ -n "$VIDEO_NAME" ]]; then
  PROMPT="use the /launch-video-v2 skill to make a product launch video for $URL. Use ./$VIDEO_DIR as PROJECT_DIR."
else
  PROMPT="use the /launch-video-v2 skill to make a product launch video for $URL. Choose a short semantic PROJECT_DIR name under ./$VIDEO_ROOT/ after understanding the product (do not use the workspace timestamp)."
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
echo "  • Claude should invoke the /launch-video-v2 skill (not /product-launch-video or /website-to-hyperframes)"
if [[ -n "$VIDEO_NAME" ]]; then
  WATCH_DIR="$VIDEO_DIR"
else
  WATCH_DIR="$VIDEO_ROOT/<agent-chosen-name>"
fi
echo "  • It should choose a semantic video directory and create ./$WATCH_DIR/ as the HyperFrames project root"
echo "  • It should NOT create ./hyperframes/ or ./$WATCH_DIR/hyperframes/"
echo "  • It should NOT create ./AGENTS.md, ./CLAUDE.md, ./$WATCH_DIR/AGENTS.md, or ./$WATCH_DIR/CLAUDE.md"
echo "  • Phase 1 produces  ./$WATCH_DIR/research/"
echo "  • Phase 1b produces ./$WATCH_DIR/design-system/"
echo "  • Phase 2 produces  ./$WATCH_DIR/narrator_scripts.json"
echo "  • Phase 3 produces  ./$WATCH_DIR/section_plan.md"
echo "  • Phase 4 produces  ./$WATCH_DIR/compositions/ and ./$WATCH_DIR/renders/video.mp4"
echo "  • Each phase appends a line to ./$WATCH_DIR/context.log"
echo ""
echo "If the skill doesn't auto-trigger, force it with:"
if [[ -n "$VIDEO_NAME" ]]; then
  printf "  \033[1;33muse the /launch-video-v2 skill to make a launch video for %s in ./%s\033[0m\n" "$URL" "$VIDEO_DIR"
else
  printf "  \033[1;33muse the /launch-video-v2 skill to make a launch video for %s; choose the video project name after understanding the product and create it under ./%s/\033[0m\n" "$URL" "$VIDEO_ROOT"
fi
echo ""
