# Skills Repository

A collection of Claude/Amp skills for multi-agent coordination and specialized workflows.

## Structure

```
skills/                    # All skills live here
├── book-sft-pipeline/     # Convert books → SFT datasets for style transfer (Credit: Muratcan Koylan)
├── issue-resolution/      # Bug diagnosis and fixing
├── knowledge/             # Extract learnings from threads → docs
├── orchestrator/          # Coordinate multi-agent bead execution
├── planning/              # Generate implementation plans
└── worker/                # Execute beads autonomously
tools/                     # Bundled tool scripts
```

## Adding Skills

Each skill needs a `SKILL.md` with frontmatter:

```yaml
---
name: skill-name
description: When to activate this skill (triggers)
version: 1.0.0
---
```

## Testing

No test commands configured yet.
