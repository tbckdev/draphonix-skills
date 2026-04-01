# Khuym Architecture

Canonical architecture and vocabulary contract for the Khuym plugin shipped from this repo.

If a skill doc and this file disagree, update the skill doc to match this file.

## Canonical Layout

- The live canonical skill tree is [`plugins/khuym/skills/`](../../plugins/khuym/skills).
- Codex consumes the packaged plugin from [`plugins/khuym/.codex-plugin/plugin.json`](../../plugins/khuym/.codex-plugin/plugin.json).
- The repo marketplace is [`.agents/plugins/marketplace.json`](../../.agents/plugins/marketplace.json).
- Claude compatibility metadata is still shipped from [`.claude-plugin/plugin.json`](../../.claude-plugin/plugin.json).

Older references to `khuym/*` are historical or compatibility language only. The canonical authoring location in this repo is `plugins/khuym/skills/*`.

## Core Principles

Khuym keeps these invariants:

- `CONTEXT.md` is the source of truth for locked decisions.
- `validating` is a real execution gate, not an optional review step.
- beads + `bv` + Agent Mail are the coordination substrate.
- `swarming` is the orchestrator role and `executing` is the worker role.
- `reviewing` and `compounding` are first-class phases, not cleanup afterthoughts.

## Working Modes

Khuym presents three user-facing modes over the same core workflow:

- `small_change` — bounded, low-risk work with lightweight planning and validating
- `standard_feature` — the default full Khuym workflow
- `high_risk_feature` — the full workflow plus deeper planning scrutiny and stronger spike discipline

Modes change the amount of ceremony, not the core contract. `validating` still gates execution in every mode.

## Main Chain

```text
using-khuym
  -> exploring
  -> planning
  -> validating
  -> swarming
  -> executing
  -> reviewing
  -> compounding
```

Behavioral summary:

- `using-khuym` bootstraps, routes, explains modes, and handles resume/startup logic
- `exploring` extracts decisions and writes `history/<feature>/CONTEXT.md`
- `planning` turns those decisions into discovery, approach, phase planning, current-phase contracts, story maps, and beads
- `validating` proves the current phase is ready before execution starts
- `swarming` launches and tends workers through Agent Mail and the live bead graph
- `executing` is the per-worker loop: claim, reserve, implement, verify, close, report
- `reviewing` performs specialist review, artifact verification, and the merge gate
- `compounding` records durable learnings in `history/learnings/`

## Runtime Artifacts

Khuym uses paired human-readable and machine-readable runtime state:

```text
.khuym/
  onboarding.json   -> onboarding state for the plugin
  state.json        -> machine-readable routing/status mirror
  STATE.md          -> human-readable narrative state
  HANDOFF.json      -> pause/resume artifact
```

Rules:

- `state.json` is the routing mirror for tools and agents
- `STATE.md` remains the human-readable summary
- neither replaces `CONTEXT.md`, beads, or planning artifacts
- if a workflow transition updates one, it must update the other

## Session Scout

On onboarded repos, Khuym installs a read-only scout command:

```bash
node .codex/khuym_status.mjs --json
```

This is the preferred quick orientation step for both humans and agents. It summarizes:

- onboarding status
- `.khuym/state.json`
- `.khuym/STATE.md`
- `.khuym/HANDOFF.json`
- recommended next reads/actions

The scout command is a shortcut for orientation. It does not replace deeper reads of `CONTEXT.md`, planning artifacts, beads, or review outputs.

## Startup Contract

On normal Khuym sessions:

1. Read `AGENTS.md`
2. If present, run `node .codex/khuym_status.mjs --json`
3. Read `.khuym/HANDOFF.json` if resuming
4. Read `.khuym/state.json`
5. Read `.khuym/STATE.md`
6. Re-open the active feature `CONTEXT.md`
7. Read `history/learnings/critical-patterns.md` before planning or execution when it exists

## Verification Expectations

Public-doc changes in this repo should pass:

```bash
bash scripts/check-markdown-links.sh
bash scripts/sync-skills.sh --dry-run
claude plugin validate .
```
