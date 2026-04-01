#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
plugin_json="$repo_root/.claude-plugin/plugin.json"
target_root="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
dry_run=0

if [[ "${1:-}" == "--dry-run" ]]; then
  dry_run=1
  shift
fi

if [[ $# -gt 0 ]]; then
  echo "Usage: bash scripts/sync-skills.sh [--dry-run]" >&2
  exit 1
fi

python3 - "$plugin_json" "$repo_root" "$target_root" "$dry_run" <<'PY'
from __future__ import annotations

import json
import os
import shutil
import sys
from pathlib import Path

plugin_json = Path(sys.argv[1]).resolve()
repo_root = Path(sys.argv[2]).resolve()
target_root = Path(sys.argv[3]).expanduser()
dry_run = sys.argv[4] == "1"

data = json.loads(plugin_json.read_text(encoding="utf8"))
skills = data.get("skills", [])

actions: list[tuple[str, Path, Path]] = []

for skill in skills:
    source = (plugin_json.parent / skill["path"]).resolve()
    if source.name != "SKILL.md":
      raise SystemExit(f"Unexpected skill entrypoint: {source}")
    source_dir = source.parent
    target_dir = target_root / skill["name"]
    actions.append((skill["name"], source_dir, target_dir))

if dry_run:
    for name, source_dir, target_dir in actions:
        print(f"would link {name}: {target_dir} -> {source_dir}")
    raise SystemExit(0)

target_root.mkdir(parents=True, exist_ok=True)

for name, source_dir, target_dir in actions:
    if target_dir.is_symlink() or target_dir.exists():
        if target_dir.is_dir() and not target_dir.is_symlink():
            shutil.rmtree(target_dir)
        else:
            target_dir.unlink()
    os.symlink(source_dir, target_dir, target_is_directory=True)
    print(f"linked {name}: {target_dir} -> {source_dir}")
PY
