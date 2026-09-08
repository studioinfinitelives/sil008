#!/usr/bin/env bash
# Shim → the shared kanban helper in sil_common (tool/kanban.py); board settings
# live in this project's .claude/kanban.json. Allowlisted as a single entry in
# .claude/settings.json so `bash tool/kanban.sh …` auto-approves.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# Sandboxed shells may run with a stripped PATH (/usr/bin:/bin:...) where gh
# doesn't resolve; prepend the usual install locations so callers never need
# an env prefix (which would break the allowlist match).
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
exec python3 "${SIL_COMMON_DIR:-$ROOT/../sil_common}/tool/kanban.py" "$@"
