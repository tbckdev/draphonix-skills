# Multi-Agent Skills

A collection of Claude Skills for multi-agent coordination, planning, and autonomous execution using Agent Mail.

## Skills Included

| Skill | Description |
|-------|-------------|
| **issue-resolution** | Systematically diagnose and fix bugs through triage, reproduction, root cause analysis, and verified fixes |
| **knowledge** | Extracts knowledge from Amp threads and updates project documentation |
| **orchestrator** | Plan and coordinate multi-agent bead execution with parallel workers |
| **planning** | Generate comprehensive plans through discovery, synthesis, verification, and decomposition |
| **worker** | Execute beads autonomously within a track with context persistence via Agent Mail |

## Installation

### Add as Marketplace

```bash
/plugin marketplace add draphonix/skills
```

### Install Specific Skills

```bash
/plugin install issue-resolution@multi-agent-skills
/plugin install planning@multi-agent-skills
/plugin install orchestrator@multi-agent-skills
/plugin install worker@multi-agent-skills
/plugin install knowledge@multi-agent-skills
```

### Direct Installation

```bash
claude plugin add github:draphonix/skills
```

## Skill Workflow

The skills are designed to work together in a multi-agent workflow:

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  planning   │ ──▶ │ orchestrator │ ──▶ │   worker    │
│             │     │              │     │  (×N)       │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  knowledge  │
                    │  (post-hoc) │
                    └─────────────┘
```

1. **planning** - Creates execution plans with beads, tracks, and dependencies
2. **orchestrator** - Spawns parallel worker agents and monitors progress
3. **worker** - Executes beads within assigned tracks using Agent Mail for coordination
4. **knowledge** - Extracts learnings from threads and updates documentation
5. **issue-resolution** - Handles bugs that arise during execution

## Requirements

- Agent Mail MCP server for inter-agent communication
- `bd` (beads) CLI for issue tracking
- `bv` CLI for bead visualization and planning

## License

MIT
