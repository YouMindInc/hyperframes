#!/usr/bin/env bash
# test-faceless-explainer.sh
#
# One-shot test harness for the /faceless-explainer Claude skill.
# Creates a self-contained project wired to the LOCAL hyperframes repo
# (CLI + skills), then tells you the two commands to launch Claude Code.
#
# faceless-explainer is forked from product-launch-video. The ONLY structural
# difference for this harness: the input is ARBITRARY TEXT (a topic line, an
# article, or a brief) — there is NO website capture and NO headless Chrome
# needed for the input phase (Chrome is still used later for finalize/render).
#
# Usage:
#   bash scripts/test-faceless-explainer.sh                      # default topic
#   bash scripts/test-faceless-explainer.sh "How DNS resolution works"
#   bash scripts/test-faceless-explainer.sh ./notes/article.md   # a text file
#   bash scripts/test-faceless-explainer.sh -h                   # help
#
# What it does:
#   1. Verifies prerequisites (bun, npm, optionally claude). Chrome is only
#      WARNED about (needed later for finalize/render, not for text input).
#   2. Builds the local CLI if dist/cli.js is missing.
#   3. Creates a fresh WORKSPACE ROOT under /tmp/explainer-video-<timestamp>/
#      with only a package.json (`file:` CLI dep). It does NOT init a
#      hyperframes project here — the faceless-explainer skill's Step 0 runs
#      `npx hyperframes init` itself inside videos/<project-name>/.
#   4. If the input is a FILE, copies it into the workspace as ./source.md so
#      the agent can read it. If it's a topic string, just prints it.
#   5. Runs npm install so `npx hyperframes` resolves to the local CLI build.
#   6. Installs the full skills tree (faceless-explainer + hyperframes-*) from
#      the LOCAL repo into .claude/skills/ via `npx skills add`. The
#      scriptwriting / visual-design / scene / finalize agents ship inside
#      faceless-explainer/agents/ — they are not top-level skills.
#   7. Verifies faceless-explainer + hyperframes-animation landed and that the
#      orchestrator's agents/ subagent prompts came across.
#   8. Prints the two commands you need to start the test.
#
# Why each step matters (read once, then forget):
#   - Step 2 builds the CLI because step 5's npm install resolves the `file:`
#     dep (expects the package's dist/ to exist) and step 1 runs
#     `node dist/cli.js --version`.
#   - Step 3 writes NO hyperframes.json / meta.json / index.html: the root is an
#     agent workspace, not a video project. Putting a project there would make
#     the skill find a stray composition at the root instead of in videos/.
#   - Step 5 uses a `file:` dep so the project tracks live edits to the repo.
#     MUST be npm (not bun): bun follows the cli pkg's `workspace:*`
#     devDependencies and fails. npm only resolves the file: package's
#     `dependencies`.
#   - Step 6 passes `--agent claude-code` explicitly. `--all` defaults to
#     detected agents only and might skip Claude Code. The explicit --agent is
#     enough to land skills in .claude/skills/ (what cc reads) — no CLAUDE.md
#     marker file is required.
#
# Iterate after editing skills:
#   The skills are COPIED (not symlinked) into the test project. To pick up
#   edits in skills/, either re-run this script (creates a fresh dir) or run:
#     cd <test_dir> && rm -rf .claude/skills/faceless-explainer && \
#       npx --yes skills add <path-to-this-hyperframes-repo> \
#         --skill faceless-explainer --agent claude-code --yes

set -uo pipefail

# --------- defaults ---------
DEFAULT_TOPIC="How DNS turns a domain name into an IP address"

# --------- arg parse ---------
INPUT=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      sed -n '2,46p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    -*)
      echo "Unknown flag: $1" >&2
      echo "Run with --help for usage." >&2
      exit 1
      ;;
    *)
      INPUT="$1"
      shift
      ;;
  esac
done

[[ -z "$INPUT" ]] && INPUT="$DEFAULT_TOPIC"

# Decide whether INPUT is a path to a text file or a literal topic string.
INPUT_IS_FILE=0
if [[ -f "$INPUT" ]]; then
  INPUT_IS_FILE=1
  # Resolve to an absolute path before we change directories.
  INPUT="$(cd "$(dirname "$INPUT")" && pwd)/$(basename "$INPUT")"
fi

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

# Unlike product-launch-video, the INPUT phase needs no Chrome (text in, not a
# captured site). Chrome is still used later for finalize snapshots + render,
# so warn rather than block.
CHROME_MAC="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
CHROME_LINUX="/usr/bin/chromium"
if [[ -x "$CHROME_MAC" ]] || [[ -x "$CHROME_LINUX" ]]; then
  ok "Chrome / Chromium found (used later for finalize snapshots + render)"
else
  warn "No Chrome at $CHROME_MAC or $CHROME_LINUX — input phases work, but finalize/render will fail without it (npx hyperframes doctor downloads one)"
fi

# Branch hint — orchestrator + sub-skills currently live on a feature branch
EXPECTED_BRANCH="feat/product-launch-v2"
CURRENT_BRANCH="$(cd "$HF_REPO" && git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
if [[ "$CURRENT_BRANCH" != "$EXPECTED_BRANCH" ]]; then
  warn "Current branch is '$CURRENT_BRANCH'. /faceless-explainer lives on '$EXPECTED_BRANCH' — if you don't see it, switch branches."
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
TEST_NAME="explainer-video-$(date +%H%M%S)"
TEST_DIR="$TEST_PARENT/$TEST_NAME"

say "Creating test project at $TEST_DIR ..."

mkdir -p "$TEST_PARENT"
cd "$TEST_PARENT"

if [[ -e "$TEST_NAME" ]]; then
  fail "$TEST_DIR already exists. Pick another timestamp by waiting 1s and re-running."
fi

# This dir is the agent WORKSPACE ROOT, not a hyperframes project. The
# faceless-explainer skill's Step 0 runs `npx hyperframes init` itself inside
# videos/<project-name>/ — so we must NOT init (or scaffold hyperframes.json /
# meta.json / index.html) here, or the skill would find a stray project at the
# root. The only thing the harness needs is a package.json with the `file:` CLI
# dep, so `npx hyperframes` (and the skill's own init/render calls from subdirs)
# resolve to the local build. No CLAUDE.md marker is needed — passing
# `--agent claude-code` explicitly in step 6 lands skills in .claude/skills/.
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

# --------- step 4: stage the input text (if a file was given) ---------
SOURCE_REL=""
if [[ "$INPUT_IS_FILE" -eq 1 ]]; then
  cp "$INPUT" "./source.md" || fail "Could not copy input file $INPUT into workspace."
  SOURCE_REL="./source.md"
  ok "input text → $TEST_DIR/source.md ($(wc -l < ./source.md | tr -d ' ') lines)"
else
  ok "input is a topic string (no file to stage)"
fi

# --------- step 5: npm install (NOT bun — see header notes) ---------
say "Running npm install (this is the one place we must use npm, not bun)..."

npm install --no-audit --no-fund --silent || fail "npm install failed."
[[ -x "node_modules/.bin/hyperframes" ]] || fail "node_modules/.bin/hyperframes missing after install."
ok "node_modules/.bin/hyperframes → local CLI"

# --------- step 6: install skills from the local repo ---------
say "Installing skills from the local repo into .claude/skills/ ..."

npx --yes skills add "$HF_REPO" --skill '*' --agent claude-code --yes \
  || fail "skills add failed."

# `--skill '*'` is a recursive glob, so it also sweeps in authoring/internal
# skills under skills/_meta/ (e.g. hyperframes-skill-authoring) that are NOT
# part of the video-production flow. Prune anything that originated in _meta/
# so the test project only carries the skills the orchestrator actually uses.
if [[ -d "$HF_REPO/skills/_meta" ]]; then
  for meta_skill in "$HF_REPO"/skills/_meta/*/; do
    [[ -d "$meta_skill" ]] || continue
    name="$(basename "$meta_skill")"
    if [[ -d ".claude/skills/$name" ]]; then
      rm -rf ".claude/skills/$name"
      say "Pruned internal _meta skill: $name"
    fi
  done
fi

# --------- step 7: verify the faceless-explainer skills landed ---------
say "Verifying skill installation..."

# Top-level skills the orchestrator actually depends on. scriptwriting /
# visual-design / hyperframes-scene / hyperframes-finalize are NOT top-level
# skills — they ship as subagent prompts inside faceless-explainer/agents/
# (verified separately).
REQUIRED=(faceless-explainer hyperframes-animation)
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

# Verify the orchestrator's agents/ subagent prompts came across. Unlike
# product-launch-video, design-system is a deterministic Bash phase here (no
# agent), so it is NOT in this list.
AGENTS_DIR=".claude/skills/faceless-explainer/agents"
REQUIRED_AGENTS=(scriptwriting visual-design hyperframes-scene hyperframes-finalize)
if [[ -d "$AGENTS_DIR" ]]; then
  AGENT_COUNT=$(find "$AGENTS_DIR" -maxdepth 1 -name "*.md" -type f | wc -l | tr -d ' ')
  ok "$AGENTS_DIR/ has $AGENT_COUNT subagent prompt file(s)"
  for a in "${REQUIRED_AGENTS[@]}"; do
    [[ -f "$AGENTS_DIR/$a.md" ]] || warn "missing subagent prompt: $AGENTS_DIR/$a.md"
  done
else
  warn "$AGENTS_DIR/ missing — the orchestrator's dispatch wrappers didn't come across."
fi

# --------- step 8: print next steps ---------
echo ""
printf "\033[1;32m========================================================\033[0m\n"
printf "\033[1;32m Setup complete.\033[0m\n"
printf "\033[1;32m========================================================\033[0m\n"
echo ""
echo "Project:  $TEST_DIR"
if [[ "$INPUT_IS_FILE" -eq 1 ]]; then
  echo "Input:    text file → ./source.md"
else
  echo "Topic:    $INPUT"
fi
echo ""
echo "To start the test, run these two commands:"
echo ""
printf "  \033[1;37mcd %s\033[0m\n" "$TEST_DIR"
printf "  \033[1;37mclaude --dangerously-skip-permissions\033[0m\n"
echo ""
echo "Then paste this prompt into Claude:"
echo ""
if [[ "$INPUT_IS_FILE" -eq 1 ]]; then
  printf "  \033[1;33mmake a faceless explainer video from the text in %s\033[0m\n" "$SOURCE_REL"
else
  printf "  \033[1;33mmake a faceless explainer video about: %s\033[0m\n" "$INPUT"
fi
echo ""
echo "What to watch for:"
echo "  • Claude should invoke the /faceless-explainer skill (routed via /video-workflows)"
echo "  • It should dispatch subagents via the Agent tool (not run phases inline)"
echo "  • Step 1/1b (scaffold + design-system) run as direct Bash (no agent)"
echo "  • scriptwriting   produces  ./videos/<name>/narrator_scripts.json"
echo "  • audio (Bash)    produces  ./videos/<name>/audio_meta.json"
echo "  • visual-design   produces  ./videos/<name>/section_plan.md"
echo "  • prep (Bash)     produces  ./videos/<name>/group_spec.json"
echo "  • scene build     produces  ./videos/<name>/compositions/scene_*.html"
echo "  • finalize        produces  ./videos/<name>/renders/video.mp4"
echo "  • Each phase appends a line to ./videos/<name>/context.log"
echo ""
echo "If the skill doesn't auto-trigger, force it with:"
if [[ "$INPUT_IS_FILE" -eq 1 ]]; then
  printf "  \033[1;33muse the /faceless-explainer skill on the text in %s\033[0m\n" "$SOURCE_REL"
else
  printf "  \033[1;33muse the /faceless-explainer skill to explain: %s\033[0m\n" "$INPUT"
fi
echo ""
