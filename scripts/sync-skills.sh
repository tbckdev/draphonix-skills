#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
skills_root="$repo_root/plugins/khuym/skills"
agents_target_root="${AGENTS_SKILLS_DIR:-$HOME/.agents/skills}"
claude_target_root="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
targets="${SKILLS_SYNC_TARGETS:-agents}"
dry_run=0

usage() {
  echo "Usage: bash scripts/sync-skills.sh [--dry-run] [--target agents|claude|all]" >&2
}

while [[ $# -gt 0 ]]; do
  case "${1}" in
    --dry-run)
      dry_run=1
      shift
      ;;
    --target)
      if [[ $# -lt 2 ]]; then
        usage
        exit 1
      fi
      targets="${2}"
      shift 2
      ;;
    *)
      usage
      exit 1
      ;;
  esac
done

case "${targets}" in
  agents|claude|all)
    ;;
  *)
    usage
    exit 1
    ;;
esac

python3 - "$skills_root" "$agents_target_root" "$claude_target_root" "$targets" "$dry_run" <<'PY'
from __future__ import annotations

import os
import re
import shutil
import sys
from pathlib import Path

skills_root = Path(sys.argv[1]).resolve()
agents_target_root = Path(sys.argv[2]).expanduser()
claude_target_root = Path(sys.argv[3]).expanduser()
targets = sys.argv[4]
dry_run = sys.argv[5] == "1"

if not skills_root.is_dir():
    raise SystemExit(f"Missing canonical skills directory: {skills_root}")

name_pattern = re.compile(r"^name:\s*(.+?)\s*$")
skills: list[tuple[str, Path]] = []

for skill_md in sorted(skills_root.glob("*/SKILL.md")):
    lines = skill_md.read_text(encoding="utf8").splitlines()
    if not lines or lines[0].strip() != "---":
        raise SystemExit(f"Missing YAML frontmatter in {skill_md}")

    public_name: str | None = None
    for line in lines[1:]:
        if line.strip() == "---":
            break
        match = name_pattern.match(line)
        if match:
            public_name = match.group(1).strip().strip("'\"")
            break

    if not public_name:
        raise SystemExit(f"Missing frontmatter name in {skill_md}")

    skills.append((public_name, skill_md.parent))

target_roots: list[tuple[str, Path]] = []
if targets in {"agents", "all"}:
    target_roots.append(("agents", agents_target_root))
if targets in {"claude", "all"}:
    target_roots.append(("claude", claude_target_root))

actions: list[tuple[str, str, Path, Path]] = []

for name, source_dir in skills:
    for target_name, target_root in target_roots:
        target_dir = target_root / name
        actions.append((target_name, name, source_dir, target_dir))

if dry_run:
    for target_name, name, source_dir, target_dir in actions:
        print(f"would link [{target_name}] {name}: {target_dir} -> {source_dir}")
    raise SystemExit(0)

for _, target_root in target_roots:
    target_root.mkdir(parents=True, exist_ok=True)

for target_name, name, source_dir, target_dir in actions:
    if target_dir.is_symlink() or target_dir.exists():
        if target_dir.is_dir() and not target_dir.is_symlink():
            shutil.rmtree(target_dir)
        else:
            target_dir.unlink()
    os.symlink(source_dir, target_dir, target_is_directory=True)
    print(f"linked [{target_name}] {name}: {target_dir} -> {source_dir}")
PY
