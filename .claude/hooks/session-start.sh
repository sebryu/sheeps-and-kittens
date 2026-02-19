#!/bin/bash
set -euo pipefail

# Only run in Claude Code remote (web) environment
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Install npm dependencies
cd "$CLAUDE_PROJECT_DIR"
npm install

# Export EXPO_TOKEN from GitHub secret into session environment
if [ -n "${EXPO_TOKEN:-}" ]; then
  echo "export EXPO_TOKEN=\"$EXPO_TOKEN\"" >> "$CLAUDE_ENV_FILE"
fi
