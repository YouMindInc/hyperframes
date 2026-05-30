#!/usr/bin/env bash
# test-product-launch-video.sh
#
# One-shot test harness for the /product-launch-video Claude skill.
# Creates a self-contained project wired to the LOCAL hyperframes repo
# (CLI + skills), then tells you the two commands to launch Claude Code.
#
# Usage:
#   bash scripts/test-product-launch-video.sh                       # default URL
#   bash scripts/test-product-launch-video.sh https://example.com/  # custom URL
#   bash scripts/test-product-launch-video.sh -h                    # help
#
# What it does:
#   1. Verifies prerequisites (bun, npm, optionally Chrome + claude).
#   2. Builds the local CLI if dist/cli.js is missing.
#   3. Creates a fresh WORKSPACE ROOT under /tmp/launch-video-<timestamp>/ with
#      only a package.json (`file:` CLI dep). It does NOT init a hyperframes
#      project here — the product-launch-video skill's Step 0 runs
#      `npx hyperframes init` itself inside videos/<project-name>/.
#   4. Runs npm install so `npx hyperframes` resolves to the local CLI build.
#   5. Installs the full skills tree (product-launch-video + hyperframes-*) from
#      the LOCAL repo into .claude/skills/ via `npx skills add`. The story-design
#      / visual-design / finalize / scene agents ship inside
#      product-launch-video/agents/ — they are not top-level skills.
#   6. Verifies product-launch-video + hyperframes-animation landed and that the
#      orchestrator's agents/ subagent prompts came across.
#   7. Prints the two commands you need to start the test.
#
# Why each step matters (read once, then forget):
#   - Step 2 builds the CLI because step 4's npm install resolves the `file:`
#     dep (expects the package's dist/ to exist) and step 1 runs
#     `node dist/cli.js --version`.
#   - Step 3 writes NO hyperframes.json / meta.json / index.html: the root is an
#     agent workspace, not a video project. Putting a project there would make
#     the skill find a stray composition at the root instead of in videos/.
#   - Step 4 uses a `file:` dep so the project tracks live edits to the repo.
#     MUST be npm (not bun): bun follows the cli pkg's `workspace:*`
#     devDependencies and fails. npm only resolves the file: package's
#     `dependencies`.
#   - Step 5 passes `--agent claude-code` explicitly. `--all` defaults to
#     detected agents only and might skip Claude Code. The explicit --agent is
#     enough to land skills in .claude/skills/ (what cc reads) — no CLAUDE.md
#     marker file is required.
#
# Iterate after editing skills:
#   The skills are COPIED (not symlinked) into the test project. To pick up
#   edits in skills/, either re-run this script (creates a fresh dir) or run:
#     cd <test_dir> && rm -rf .claude/skills/product-launch-video && \
#       npx --yes skills add <path-to-this-hyperframes-repo> \
#         --skill product-launch-video --agent claude-code --yes

set -uo pipefail

# --------- defaults ---------
DEFAULT_URL="https://hyperframes.heygen.com/"

# --------- arg parse ---------
URL=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      sed -n '2,40p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
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
  ok "Chrome / Chromium found (web-extraction phase needs headless Chrome)"
else
  warn "No Chrome at $CHROME_MAC or $CHROME_LINUX — Phase 1 (web-extraction) will fail without it"
fi

# Branch hint — orchestrator + sub-skills currently live on a feature branch
EXPECTED_BRANCH="feat/product-launch-v2"
CURRENT_BRANCH="$(cd "$HF_REPO" && git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
if [[ "$CURRENT_BRANCH" != "$EXPECTED_BRANCH" ]]; then
  warn "Current branch is '$CURRENT_BRANCH'. /product-launch-video lives on '$EXPECTED_BRANCH' — if you don't see it, switch branches."
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

# This dir is the agent WORKSPACE ROOT, not a hyperframes project. The
# product-launch-video skill's Step 0 runs `npx hyperframes init` itself inside
# videos/<project-name>/ — so we must NOT init (or scaffold hyperframes.json /
# meta.json / index.html) here, or the skill would find a stray project at the
# root. The only thing the harness needs is a package.json with the `file:` CLI
# dep, so `npx hyperframes` (and the skill's own init/render calls from subdirs)
# resolve to the local build. No CLAUDE.md marker is needed — passing
# `--agent claude-code` explicitly in step 5 lands skills in .claude/skills/.
mkdir -p "$TEST_NAME"
cd "$TEST_NAME"

cat > package.json <<JSON
{
  "name": "$TEST_NAME",
  "private": true,
  "type": "module",
  "dependencies": {
    "hyperframes": "file:$HF_CLI_PKG"
  }
}
JSON

ok "package.json points hyperframes → file:$HF_CLI_PKG"

# --------- step 4: npm install (NOT bun — see header notes) ---------
say "Running npm install (this is the one place we must use npm, not bun)..."

npm install --no-audit --no-fund --silent || fail "npm install failed."
[[ -x "node_modules/.bin/hyperframes" ]] || fail "node_modules/.bin/hyperframes missing after install."
ok "node_modules/.bin/hyperframes → local CLI"

# --------- step 5: install skills from the local repo ---------
say "Installing skills from the local repo into .claude/skills/ ..."

npx --yes skills add "$HF_REPO" --skill '*' --agent claude-code --yes \
  || fail "skills add failed."

# --------- step 6: verify the launch-video skills landed ---------
say "Verifying skill installation..."

# Top-level skills the orchestrator actually depends on. story-design /
# visual-design / finalize / scene are NOT top-level skills — they ship as
# subagent prompts inside product-launch-video/agents/ (verified separately).
REQUIRED=(product-launch-video hyperframes-animation)
MISSING=()
for s in "${REQUIRED[@]}"; do
  if [[ -d ".claude/skills/$s" ]]; then
    ok ".claude/skills/$s/"
  else
    MISSING+=("$s")
  fi
done

if [[ ${#MISSING[@]} -gt 0 ]]; then
  warn "Missing skill(s): ${MISSING[*]}"
  warn "Subagent dispatches that rely on them will fail. Check skills/ in the repo and re-run."
fi

# Verify the orchestrator's agents/ subagent prompts came across.
AGENTS_DIR=".claude/skills/product-launch-video/agents"
REQUIRED_AGENTS=(story-design visual-design hyperframes-scene hyperframes-finalize design-system)
if [[ -d "$AGENTS_DIR" ]]; then
  AGENT_COUNT=$(find "$AGENTS_DIR" -maxdepth 1 -name "*.md" -type f | wc -l | tr -d ' ')
  ok "$AGENTS_DIR/ has $AGENT_COUNT subagent prompt file(s)"
  for a in "${REQUIRED_AGENTS[@]}"; do
    [[ -f "$AGENTS_DIR/$a.md" ]] || warn "missing subagent prompt: $AGENTS_DIR/$a.md"
  done
else
  warn "$AGENTS_DIR/ missing — the orchestrator's dispatch wrappers didn't come across."
fi

# --------- step 7: print next steps ---------
echo ""
printf "\033[1;32m========================================================\033[0m\n"
printf "\033[1;32m Setup complete.\033[0m\n"
printf "\033[1;32m========================================================\033[0m\n"
echo ""
echo "Project:  $TEST_DIR"
echo "Target:   $URL"
echo ""
echo "To start the test, run these two commands:"
echo ""
printf "  \033[1;37mcd %s\033[0m\n" "$TEST_DIR"
printf "  \033[1;37mclaude --dangerously-skip-permissions\033[0m\n"
echo ""
echo "Then paste this prompt into Claude:"
echo ""
printf "  \033[1;33mmake a product launch video for %s\033[0m\n" "$URL"
echo ""
echo "What to watch for:"
echo "  • Claude should invoke the /product-launch-video skill (routed via /video-workflows)"
echo "  • It should dispatch subagents via the Agent tool (not run phases inline)"
echo "  • Phase 1 (capture)       produces  ./capture/extracted/  (tokens, design-styles, …)"
echo "  • Phase 2 (story-design)  produces  ./narrator_scripts.json  + ./section_plan.md"
echo "  • Phase 3 (visual-design) produces  ./group_spec.json"
echo "  • Phase 4 (scene build)   produces  ./compositions/scene_*.html"
echo "  • Each phase appends a line to ./context.log"
echo ""
echo "If the skill doesn't auto-trigger, force it with:"
printf "  \033[1;33muse the /product-launch-video skill to make a launch video for %s\033[0m\n" "$URL"
echo ""