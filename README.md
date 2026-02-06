# Multi-Agent Skills

A collection of Claude Skills for multi-agent coordination, planning, and autonomous execution using Agent Mail.

## Skills Included

| Skill | Description |
|-------|-------------|
| **book-sft-pipeline** | Convert books into SFT datasets for training style-transfer models. Covers ePub extraction, segmentation, instruction generation, and LoRA training on Tinker. *Credit: [Muratcan Koylan](https://muratcankoylan.com/projects/gertrude-stein-style-training/)* |
| **issue-resolution** | Systematically diagnose and fix bugs through triage, reproduction, root cause analysis, and verified fixes |
| **knowledge** | Extracts knowledge from Amp threads and updates project documentation |
| **orchestrator** | Plan and coordinate multi-agent bead execution with parallel workers |
| **planning** | Generate comprehensive plans through discovery, synthesis, verification, and decomposition |
| **worker** | Execute beads autonomously within a track with context persistence via Agent Mail |

## Installation

### Claude Code

#### Add as Marketplace

```bash
/plugin marketplace add draphonix/skills
```

#### Install Specific Skills

```bash
/plugin install book-sft-pipeline@kuckit
/plugin install issue-resolution@kuckit
/plugin install planning@kuckit
/plugin install orchestrator@kuckit
/plugin install worker@kuckit
/plugin install knowledge@kuckit
```

#### Direct Installation

```bash
claude plugin add github:draphonix/skills
```

### Amp

```bash
# Install all skills from the repo
amp skill add draphonix/skills

# Install a specific skill
amp skill add draphonix/skills/book-sft-pipeline
amp skill add draphonix/skills/issue-resolution
amp skill add draphonix/skills/planning
amp skill add draphonix/skills/orchestrator
amp skill add draphonix/skills/worker
amp skill add draphonix/skills/knowledge
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
