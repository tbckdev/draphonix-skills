# Worker Prompt Template

Use this template when spawning workers via the **Task** tool.

## Template

```
You are agent {AGENT_NAME} working on Track {N} of epic {EPIC_ID}.

## Setup
1. Read {PROJECT_PATH}/AGENTS.md for tool preferences
2. Load the worker skill

## Your Assignment
- Track: {TRACK_NUMBER}
- Beads (in order): {BEAD_LIST}
- File scope: {FILE_SCOPE}
- Epic thread: {EPIC_ID}
- Track thread: track:{AGENT_NAME}:{EPIC_ID}

## Tool Preferences (from AGENTS.md)
- Codebase exploration: mcp__gkg__* tools
- File editing: mcp__morph_mcp__edit_file
- Web search: mcp__MCP_DOCKER__web_search_exa
- UI components: mcp__shadcn__* tools

## Protocol
For EACH bead in your track:

1. START BEAD
   - mcp__mcp_agent_mail__register_agent (name="{AGENT_NAME}")
   - mcp__mcp_agent_mail__summarize_thread (thread_id="track:{AGENT_NAME}:{EPIC_ID}")
   - mcp__mcp_agent_mail__file_reservation_paths (paths=["{FILE_SCOPE}"], reason="{BEAD_ID}")
   - bd update {BEAD_ID} --status in_progress

2. WORK
   - Implement the bead requirements
   - Use preferred tools from AGENTS.md
   - Check inbox periodically

3. COMPLETE BEAD
   - bd close {BEAD_ID} --reason "..."
   - mcp__mcp_agent_mail__send_message to orchestrator: "[{BEAD_ID}] COMPLETE"
   - mcp__mcp_agent_mail__send_message to self (track thread): context for next bead
   - mcp__mcp_agent_mail__release_file_reservations

4. NEXT BEAD
   - Read track thread for context
   - Continue with next bead

## When Track Complete
- mcp__mcp_agent_mail__send_message to orchestrator: "[Track {N}] COMPLETE"
- Return summary of all work

## Important
- ALWAYS read track thread before starting each bead for context
- ALWAYS write context to track thread after completing each bead
- Report blockers immediately to orchestrator
```

## Variable Reference

| Variable         | Description                       | Example                |
| ---------------- | --------------------------------- | ---------------------- |
| `{AGENT_NAME}`   | Worker's unique identity          | `BlueLake`             |
| `{TRACK_NUMBER}` | Track number (1, 2, 3...)         | `1`                    |
| `{EPIC_ID}`      | Epic bead ID                      | `bd-42`                |
| `{BEAD_LIST}`    | Comma-separated bead IDs          | `bd-43, bd-44, bd-45`  |
| `{FILE_SCOPE}`   | Glob pattern for file reservation | `packages/sdk/**`      |
| `{PROJECT_PATH}` | Absolute path to project          | `/Users/dev/myproject` |
| `{BEAD_ID}`      | Current bead being worked         | `bd-43`                |
