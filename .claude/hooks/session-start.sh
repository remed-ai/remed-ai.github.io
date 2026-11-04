#!/usr/bin/env bash
# SessionStart: install dependencies and enable repo Git hooks.
set -euo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}"
git config core.hooksPath .githooks
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  npm ci --no-audit --no-fund >/dev/null 2>&1 || npm install --no-audit --no-fund >/dev/null 2>&1
fi
branch=$(git symbolic-ref --short HEAD 2>/dev/null || echo detached)
if [ "$branch" != "main" ]; then
  echo "WARNING: on '$branch'. Switch to main before changing anything (git checkout main)."
fi
echo "Remed-AI ready. Read docs/STATUS.md first."
