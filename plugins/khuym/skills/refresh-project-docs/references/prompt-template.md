# Refresh Project Docs Prompt Template

## Full Prompt

Use this when the goal is to update repository documentation so it matches the current implementation.

```text
Update the README and any other relevant documentation so they accurately describe the project as it exists today.

Start by inspecting the repository to determine the current product behavior, developer workflows, commands, flags, options, configuration, integrations, and user-facing features. Treat the codebase, config, scripts, tests, and command help output as the source of truth when available. Do not treat the existing documentation as authoritative if it conflicts with the implementation.

Then update the relevant documentation files to match that current state. Fold every change into the docs as evergreen documentation, not as release notes. Write as though the documented behavior has always been true for the project. Do not use historical or transitional phrasing such as "we added", "now supports", "recently", "has been updated", or "X is now Y".

Make sure the documentation covers:
- current commands, subcommands, flags, options, and configuration
- current features, integrations, and workflows
- setup, installation, usage, and development instructions affected by the implementation
- any stale, renamed, removed, or superseded behavior, with outdated wording removed rather than narrated historically

Preserve the existing voice and structure where it still works, but reorganize sections when that improves clarity. Update every relevant doc file, not just README.md, when the same information appears elsewhere in the repository.

Before finishing:
- verify that command examples and option names match the real interface
- remove outdated statements, placeholders, and contradictions
- make the touched documentation internally consistent
- ensure the final wording reflects only the current state of the project
```

## Compact Prompt

Use this when you want the same behavior with less scaffolding.

```text
Refresh the README and any related documentation so they match the current repository state. Inspect the code, config, scripts, tests, and command help before editing, and treat those as canonical over stale docs. Update the docs in evergreen present-state language only: no "we added", "now supports", "recently", or other change-log phrasing. Make sure all relevant commands, flags, options, features, workflows, and setup instructions are covered, and clean up outdated or contradictory guidance across every affected doc file.
```

## Adaptation Notes

- Add repo-specific doc paths when you already know them.
- Add testing or linting requirements when the repo has doc validation scripts.
- Add formatting constraints only when the target model needs them.
