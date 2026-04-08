---
name: khuym:gkg
description: >-
  Codebase intelligence support skill using the gkg tool. Use when asked about codebase
  architecture, finding files related to a feature, dependency graphs, module relationships,
  code patterns, or when the khuym:planning skill needs an architecture snapshot during Phase 1
  Discovery. Trigger phrases include what is the architecture, find files related to,
  show dependency graph, what patterns does this codebase use, how is X wired.
metadata:
  version: '1.0'
  ecosystem: khuym
  type: support
  dependencies:
    - id: gkg
      kind: mcp_server
      server_names: [gkg]
      config_sources: [repo_codex_config, global_codex_config, skill_mcp_manifest:planning]
      missing_effect: unavailable
      reason: This skill's intelligence queries require the gkg MCP server.
---

# gkg — Codebase Intelligence

If `.khuym/onboarding.json` is missing or stale for the current repo, stop and invoke `khuym:using-khuym` before continuing.

## When to Use

- User asks: "What's the architecture of this project?"
- User asks: "Find all files related to authentication"
- User asks: "Show me the dependency graph for module X"
- User asks: "What patterns does this codebase use?"
- **planning** Phase 1 (Discovery) needs an architecture snapshot
- **planning** Phase 2 (Synthesis) needs to validate approach against codebase reality
- **exploring** Phase 2 (Gray Area) needs quick pattern confirmation

## Check MCP Availability First

This skill is **MCP-backed**, not CLI-backed.

Before using it, confirm the `gkg` MCP server is available from one of the declared sources:

- repo-local `.codex/config.toml`
- user-level `~/.codex/config.toml`
- packaged manifest `plugins/khuym/skills/planning/mcp.json`

The packaged planning manifest is the repo's built-in fallback for the expected `gkg` query tools. If none of those sources expose `gkg`, use the [Fallback Commands](#fallback-without-gkg) section below.

Before doing any discovery query, check the session scout output from `node .codex/khuym_status.mjs --json`:

- `supported_repo = false` means this repo is outside gkg's supported language set. Do not force it; use the fallback commands.
- `server_reachable = false` or `project_indexed = false` means `using-khuym` must finish readiness first. Do not pretend MCP discovery is ready when it is not.

Do **not** treat the local `gkg` binary as the normal discovery path for this skill. CLI commands are only for lifecycle/bootstrap readiness. Once ready, discovery work should go through MCP tools.

---

## MCP Tool Mapping

The supported MCP tool surface for `gkg` in this repo is declared in `plugins/khuym/skills/planning/mcp.json`.

Use these tools conceptually through the MCP server:

### `list_projects` — Index Presence Check

Use first when the scout says the repo should be gkg-backed. Confirms the current project exists in the index before any deeper query work.

When to call: planning Phase 1 at the start of discovery, or whenever an agent suspects the scout is stale.  
Output: note success inline, or stop and hand back to `using-khuym` readiness if the repo is missing.

### `index_project` — Rebuild an Existing Project Index

Use when the project is already indexed but obviously stale or incomplete.

When to call: planning or validating only after `list_projects` confirms the project already exists.  
Output: note the refresh inline, then re-run the query that needed fresh data.

### `repo_map` — Architecture Snapshot

Use at the **start** of any discovery phase. Produces a ranked overview of files and their relationships.

When to call: planning Phase 1, first time encountering an unfamiliar codebase.  
Output: Save to `history/<feature>/discovery.md` under the heading `## Architecture Snapshot`.

### `search_codebase_definitions` + `read_definitions` — Pattern Search

Search for relevant definitions, then read the strongest matches for concrete evidence.

Suggested queries:

- `authentication middleware`
- `database connection pooling`
- `error handling patterns`

When to call: planning Phase 1 Agent B (pattern search), exploring Phase 2 (existing patterns check).  
Output: Append results to `history/<feature>/discovery.md` under `## Existing Patterns`.

### `get_references` + direct file read — Dependency Graph

Use `get_references` to find inbound usage of a target definition, then read the file directly to confirm imports and nearby structure. The packaged MCP surface here does not expose a single `deps` command, so dependency graphs should be assembled from references plus local file inspection.

Suggested targets:

- `src/auth/middleware.ts`
- `lib/db/connection.go`

When to call: planning Phase 1 Agent A (constraints check), validating (verifying bead file scope isolation doesn't break deps).  
Output: Append to `history/<feature>/discovery.md` under `## Dependency Graph`.

### `get_definition` + `read_definitions` — Full File Context

Resolve a definition, then read its surrounding content when a bead's file scope needs clarification.

Suggested target:

- `src/api/routes.ts`

When to call: When a bead's file scope needs clarification, or khuym:executing skill needs to understand a file before modifying it.  
Output: Use inline (don't always save — only save if it changes the approach).

---

## Integration with Planning Skill

The khuym:planning skill calls gkg in **Phase 1 (Discovery)** via parallel task agents:

| Agent | gkg MCP tools | Output Section |
|-------|---------------|----------------|
| Agent A | `list_projects` -> `repo_map` | `## Architecture Snapshot` |
| Agent B | `search_codebase_definitions` + `read_definitions` | `## Existing Patterns` |
| Agent C | `get_references` + direct file read | `## Dependency Graph` |

In **Phase 2 (Synthesis)**, the khuym:planning skill may call:
`search_codebase_definitions` with proposed-approach keywords

to confirm the approach aligns with existing patterns — not to change the plan, but to catch contradictions early.

The **exploring** skill uses gkg lightly — one `search_codebase_definitions` pass at most, to check if a gray area already has an answer in code. Never deep analysis during exploring.

---

## Output Format

All gkg outputs saved to `history/<feature>/discovery.md`:

```markdown
## Architecture Snapshot
<!-- gkg repo_map MCP output -->
Generated: <timestamp>
Top files by usage: <list>
Key modules: <list>

## Existing Patterns
<!-- gkg MCP definition-search results -->
Query: "<search-term>"
Matches:
- <file>: <summary> (deps: N)

## Dependency Graph
<!-- gkg MCP references + local file-read summary -->
Target: <path or definition>
Imported by / referenced from: <list>
Local import scan: <list>
```

Always include:
- File paths (absolute from project root)
- Dependency counts where available
- A 1-line pattern summary per result

---

## Fallback Without gkg

If the `gkg` MCP server is not configured, the repo is unsupported, or readiness is still red, use these equivalents:

| gkg MCP need | Fallback |
|-------------|----------|
| `repo_map` | `find . -name "*.ts" -o -name "*.go" -o -name "*.py" \| head -60` + `cat package.json` or equivalent manifest |
| `search_codebase_definitions` | `grep -r "<query>" --include="*.ts" -l \| head -20` |
| `get_references` + local import graph | `grep -r "<filename or symbol>" --include="*.ts" -l` + manual import scan |
| `get_definition` / `read_definitions` | `head -50 <file>` + grep for exports |

Note fallback in discovery.md: `> gkg was unavailable for this repo/session, so discovery used grep/find fallback.`

---

## Red Flags

- **Do not skip readiness checks** — `MCP configured` is not the same as `server reachable` or `project indexed`.
- **Do not use `index_project` for first-time indexing** — it is for refreshing an existing indexed project, not replacing `gkg index <repo-root>`.
- **Do not use the local `gkg` CLI as the normal discovery path** — this skill is about the MCP query surface after readiness is green.
- **Do not use gkg as a replacement for reading files** — gkg gives structural overview; actually read key files before modifying them.
- **Do not run gkg during executing** — architecture queries belong in planning/validating. If an executing agent needs codebase context, it reads the already-generated `discovery.md`.
- **Do not skip saving to discovery.md** — downstream agents (synthesizer, plan-checker) depend on this file.
