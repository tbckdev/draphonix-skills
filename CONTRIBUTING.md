# Creating Claude Code Skills

This guide covers the skill format, directory conventions, and how Claude Code discovers and loads skills.

## How Skills Work

Claude Code loads skills from `~/.claude/skills/*/SKILL.md`. Each skill's `description` field from the YAML frontmatter is injected into the system prompt. When a user's request matches a skill's trigger description, Claude invokes it via the `Skill` tool, which reads the full SKILL.md body as operational instructions.

## SKILL.md Structure

Every skill requires a `SKILL.md` file with YAML frontmatter and a markdown body:

```yaml
---
name: my-skill                      # kebab-case, matches folder name
description: >-                     # CRITICAL: this is the trigger text
  One paragraph explaining when to use this skill.
  Include concrete trigger phrases the user might say.
  Claude matches user intent against this description.
---

# My Skill

Operational instructions go here. This body is loaded when the skill is invoked.

## When to Use

- Specific scenarios where this skill applies
- Trigger phrases: "do X", "help with Y"

## Process

Step-by-step instructions Claude follows when executing this skill.

## Red Flags

Behaviors to watch for and correct during execution.
```

## Required Fields

| Field | Purpose |
|-------|---------|
| `name` | kebab-case identifier, must match the folder name |
| `description` | Trigger text for skill matching. Include use cases and trigger phrases |

## Optional Frontmatter Fields

| Field | Example | Purpose |
|-------|---------|---------|
| `metadata.version` | `'1.0'` | Skill version tracking |
| `metadata.ecosystem` | `khuym` | Group tag for related skills |
| `metadata.type` | `core \| support \| meta` | Role classification |
| `license` | `MIT` | License declaration |
| `compatibility` | `opencode` | Cross-platform flag |
| `allowed-tools` | `Read, Write, Bash` | Restrict available tools |
| `model` | `claude-sonnet-4-20250514` | Preferred model |
| `mode` | `ultrathink` | Thinking mode preference |
| `references` | `[workers, pages]` | Auto-load reference subdirectories |

## Directory Layout

```
skill-name/
├── SKILL.md              ← REQUIRED
├── references/           ← Supporting documents read at runtime
│   ├── templates.md      ← Templates the skill tells Claude to load
│   └── patterns.md       ← Reference patterns or examples
├── scripts/              ← Executable scripts the skill invokes
│   └── validate.sh
├── agents/               ← Subagent configuration files
│   └── reviewer.yaml
└── README.md             ← Human-facing documentation (not loaded by Claude)
```

### Key conventions

- **`references/`** — Files the skill explicitly tells Claude to read (e.g., "Load `references/template.md` now"). Claude does NOT auto-load these; the SKILL.md body must reference them.
- **`scripts/`** — Shell scripts, Python scripts, or other executables the skill invokes via Bash.
- **`agents/`** — YAML configs for subagent prompts the skill spawns.

## Writing Effective Descriptions

The `description` field is the most important part of a skill. Claude uses it to decide whether to invoke the skill.

**Good description:**
```yaml
description: >-
  Systematic debugging for blocked workers, test failures, build errors,
  runtime crashes, and integration issues. Use when a build fails, a test
  fails, a worker is stuck, or reviewing hands off with a failure.
```

**Bad description:**
```yaml
description: Helps with debugging things
```

Tips:
- List concrete scenarios and trigger phrases
- Include the verbs users would say ("debug", "fix", "diagnose")
- Mention what the skill produces ("writes CONTEXT.md", "creates beads")

## Adding a Skill to This Repo

1. Create the directory under `khuym/` (ecosystem skills) or `standalone/` (independent):
   ```bash
   mkdir -p standalone/my-skill/references
   ```

2. Write `SKILL.md` with frontmatter and body

3. Deploy to Claude Code:
   ```bash
   bash scripts/sync-skills.sh
   ```

4. Test by asking Claude something that matches your trigger description

## Testing a Skill

1. Deploy: `bash scripts/sync-skills.sh`
2. Start a new Claude Code session
3. Ask something that should trigger the skill
4. Verify Claude invokes it via the `Skill` tool
5. Check that the operational instructions produce the expected behavior

## Khuym-Specific Conventions

Khuym ecosystem skills follow additional conventions:

- **Chain position:** Each skill hands off to the next in the chain (exploring → planning → validating → ...)
- **HARD-GATE blocks:** Non-negotiable behavioral constraints wrapped in `<HARD-GATE>` tags
- **State updates:** Skills update `.khuym/STATE.md` at phase transitions
- **Red Flags section:** Every skill lists behaviors that should trigger immediate correction
- **Handoff message:** Every skill ends with an explicit handoff stating which skill to invoke next
