---
name: refresh-project-docs
description: Refresh README files and project documentation so they match the current repository state. Use when Codex needs to update stale docs after feature work, sync documentation to current commands, options, configuration, and workflows, rewrite changelog-style wording into evergreen current-state documentation, or turn a rough docs-update prompt into an execution-ready instruction set.
---

# Refresh Project Docs

Update documentation from the live repo state, not from outdated docs or feature-memory summaries.

Load [references/prompt-template.md](references/prompt-template.md) when the user wants a polished reusable prompt or when you need a starting template before editing docs directly.

## Modes

Choose the lightest mode that fits the request.

- `Prompt-only`: refine the user's raw docs-refresh prompt and return the upgraded prompt.
- `Docs execution`: inspect the repo and update the relevant docs directly.
- `Prompt + execution`: return the upgraded prompt and use the same standards while editing docs.

## Workflow

### 1. Inventory the documentation surface

Find the docs that may need to move together:

- `README.md`
- contributor or setup docs
- `docs/` pages
- examples, templates, or onboarding guides
- CLI or API docs generated from source-adjacent files

Do not assume the README is the only source that matters.

### 2. Rebuild the current product and workflow state

Treat the repository as the source of truth.

Check the most authoritative artifacts available, such as:

- command help text, scripts, task runners, and package manifests
- config files, environment examples, and migration files
- implementation code for user-facing features
- tests that document supported behavior
- existing docs only after comparing them to the code

When commands, flags, options, or workflows can be verified from source, verify them instead of inferring.

### 3. Identify documentation deltas

Capture what the docs need to describe in their current form:

- current commands, subcommands, flags, and options
- current setup, install, deploy, and development flows
- current features, integrations, and limitations
- renamed, removed, or superseded behavior that should disappear from the docs
- duplicated guidance that now needs to be synchronized across files

### 4. Rewrite in evergreen current-state language

Write as if the documented behavior has always been part of the project.

Use these rules without exception:

- describe the present state, not the history of how it changed
- remove stale wording instead of narrating the transition
- preserve the project's voice and structure unless a clearer structure is needed
- update every relevant doc file that carries the affected information

Avoid release-note phrasing such as:

- `we added`
- `now supports`
- `recently`
- `has been updated`
- `X is now Y`

### 5. Verify before finishing

Check that:

- commands and examples match the real interface
- options and configuration names match the current code
- duplicated docs agree with each other
- stale statements, placeholders, and contradictions are removed
- links still resolve if you touched public docs

## Prompt Upgrade Rules

When the user gives a rough prompt, keep the intent but add the missing execution structure:

- tell the agent to inspect the repo before editing docs
- tell the agent to treat code and config as canonical over stale docs
- require updating all relevant documentation, not only the README
- require evergreen phrasing with no change-log language
- require explicit coverage of commands, options, features, and workflows
- require a verification pass for consistency and outdated content

Prefer the template in [references/prompt-template.md](references/prompt-template.md) over improvising from scratch.

## Red Flags

Stop and correct the approach if any of these appear:

- trusting existing docs without checking source
- updating only `README.md` when the same information lives elsewhere
- documenting commands or flags that were not verified
- keeping historical phrasing like a mini changelog
- leaving contradictory old guidance in secondary docs

## Done Criteria

This skill is complete when the upgraded prompt or edited docs:

- describe only the current state of the project
- include the relevant commands, options, features, and workflows
- remove stale or transitional wording
- are internally consistent across the touched documentation set
