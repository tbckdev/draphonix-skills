---
name: validating
description: |
  The critical gate between planning and execution in the khuym ecosystem. Load this skill after planning has written phase-plan.md, the user has approved the phase plan, and the current phase has been decomposed into stories and beads. Verifies the current phase contract, story map, and bead graph across 8 structural dimensions, executes time-boxed spikes for HIGH-risk items, polishes current-phase beads with bv graph analytics, and requires explicit user approval before any code is written.
metadata:
  version: '1.2'
  position: 3
  chain: exploring -> planning -> validating -> swarming
  ecosystem: khuym
  dependencies:
    - id: beads-cli
      kind: command
      command: br
      missing_effect: unavailable
      reason: Validation creates and closes spike beads during gating.
    - id: beads-viewer
      kind: command
      command: bv
      missing_effect: unavailable
      reason: Validation depends on bv graph checks for polishing and risk review.
---

# Validating

If `.khuym/onboarding.json` is missing or stale for the current repo, stop and invoke `khuym:using-khuym` before continuing.

> "Don't jump off the wall without checking."
> — The khuym principle on verification

## Why This Skill Exists

The most expensive failure in agentic delivery is not a buggy bead. It is launching execution against a phase that was never clear enough to deserve execution.

Validating now works on **one phase at a time**.

That means the validator must be able to answer:

- Does the current phase close a believable small loop?
- If all current-phase stories finish, will the current phase exit state be true?
- If all current-phase beads finish, will those stories actually be complete?
- If this phase fails, will we know whether to debug locally or rethink the larger feature plan?

Skipping validating is still the fastest path to expensive rework.

## Communication Standard

Validation output must explain risk the way an implementer or user can picture it.

When reporting a failing dimension, spike result, or approval summary:

- state what the current phase is trying to make true
- describe what is wrong in the current plan or bead set
- explain why that would fail in a real scenario
- name the smallest credible repair

Do not stop at labels like `dependency issue`, `story order problem`, `context budget failure`, or `risk alignment problem` without translating them into plain language.

## Prerequisites

You need all of these:

- `history/<feature>/CONTEXT.md`
- `history/<feature>/discovery.md`
- `history/<feature>/approach.md`
- `history/<feature>/phase-plan.md`
- `history/<feature>/phase-<n>-contract.md`
- `history/<feature>/phase-<n>-story-map.md`
- `.beads/` for the current phase

If any are missing, stop and return to `khuym:planning`.

## Phase 0: Current Phase Orientation

Before structural verification, orient the validator.

Read from `.khuym/STATE.md` and the phase artifacts:

- current phase number and name
- whether `phase-plan.md` was approved
- current phase bead IDs

Present a short summary before continuing:

```text
Validating Phase <n> of <total>: <phase name>

Stories:
- Story 1: <name>
- Story 2: <name>
- Story 3: <name>

Goal of this phase:
- <one-line practical outcome>
```

If the phase plan has not been approved, stop immediately. Do not validate an unapproved phase plan.

---

## Phase 1: Structural Verification

**Maximum 3 iterations. Nothing advances until this passes.**

### Step 1.1 — Spawn plan-checker

Load `references/plan-checker-prompt.md`. Spawn an isolated subagent with:

```text
Inputs:
- current phase bead set
- history/<feature>/CONTEXT.md
- history/<feature>/discovery.md
- history/<feature>/approach.md
- history/<feature>/phase-plan.md
- history/<feature>/phase-<n>-contract.md
- history/<feature>/phase-<n>-story-map.md
Role: plan-checker
```

The plan-checker verifies 8 dimensions:

1. **Phase contract clarity** — clear entry state, exit state, demo, unlocks
2. **Story coverage and ordering** — each story has a job and the order makes sense
3. **Decision coverage** — locked decisions from `CONTEXT.md` map to stories and beads
4. **Dependency correctness** — graph is valid and acyclic
5. **File scope isolation** — parallel-ready beads do not silently collide
6. **Context budget** — each bead fits in one worker context
7. **Verification completeness** — stories and beads have explicit done/verify criteria
8. **Exit-state completeness and risk alignment** — if everything finishes, the current phase really reaches its exit state and HIGH-risk items are spiked

### Step 1.2 — Triage results

**If all 8 dimensions PASS:** proceed to Phase 2.

**If any dimension FAILS:**

1. Fix the specific issue in the relevant artifact
2. Re-run the checker
3. Count that as the next iteration

### Repair routing

- phase meaning unclear -> revise `phase-<n>-contract.md`
- story order or story scope unclear -> revise `phase-<n>-story-map.md`
- decision/gap issue -> revise current phase story map and/or beads
- dependency/scope/test issue -> revise current phase beads
- exit state not convincingly reachable -> revise current phase contract, story map, or phase plan

After 3 iterations with any FAIL still present:

- stop
- escalate to the user
- explain which dimension is still failing and why

Do not attempt iteration 4.

---

## Phase 2: Spike Execution

Run this for every HIGH-risk component that matters to the current phase.

If no HIGH-risk items exist for the current phase, skip to Phase 3.

### Step 2.1 — Create spike beads

```bash
br create "Spike: Phase <n> - <specific yes/no question>" -t task -p 0
```

### Step 2.2 — Execute spikes in isolation

For each spike:

1. Spawn an isolated subagent
2. Hard time-box: 30 minutes
3. Write findings to `.spikes/<feature>/<spike-id>/FINDINGS.md`
4. Close with a definitive YES or NO

```bash
br close <id> --reason "YES: <validated approach and constraints>"
# or
br close <id> --reason "NO: <blocker and why it breaks the approach>"
```

### Step 2.3 — Act on spike results

**If YES:**

- embed the spike findings into affected current-phase beads
- update `phase-<n>-story-map.md` if the story now has tighter constraints

**If NO:**

- full stop
- write blocker summary into `approach.md`
- return to `khuym:planning`
- re-run validating from Phase 0 after replanning

---

## Phase 3: Bead Polishing

Multiple rounds. Quality compounds here.

### Round 1: Dependency completeness

```bash
bv --robot-suggest
```

If real structural dependencies are missing, add them and re-run.

### Round 2: Graph health

```bash
bv --robot-insights
```

Fix cycles, bottlenecks, disconnected work, and orphaned beads. Re-run if critical findings remain.

### Round 3: Priority sanity

```bash
bv --robot-priority
```

Adjust priorities if the graph says foundational work is buried.

### Deduplication

Read all current-phase bead titles and descriptions:

- same story + same file scope + same goal -> likely duplicate
- same outcome expressed as two different beads -> merge or close redundant work

### Fresh-eyes review

Load `references/bead-reviewer-prompt.md` and review the current phase bead set.

When asking a model to perform the bead-refinement pass, use this prompt:

```text
Check over each bead super carefully-- are you sure it makes sense? Is it optimal? Could we change anything to make the system work better for users? If so, revise the beads. It's a lot easier and faster to operate in "plan space" before we start implementing these things! Use /effort max.
```

Fix all CRITICAL flags before moving on. MINOR flags are judgment calls but should be considered carefully.

### Story-to-bead coherence check

Before leaving Phase 3, inspect `history/<feature>/phase-<n>-story-map.md`:

- every story should map to at least one bead
- every bead should belong to a story
- if a story has many beads, confirm the decomposition is still coherent and each bead has a clear reason to exist
- if a bead spans multiple unrelated stories, the decomposition is muddy

---

## Phase 4: Exit-State Readiness Review

This is the human-readable readiness check before approval.

Ask these questions explicitly:

1. If all stories reach "Done Looks Like", does the current phase exit state hold?
2. If all current-phase beads close successfully, will all stories actually be done?
3. Is the phase demo now credible?
4. Does this phase still make sense in the larger `phase-plan.md`?

If any answer is "no" or "not sure", do not approve execution. Route back:

- phase meaning problem -> `phase-<n>-contract.md`
- story decomposition problem -> `phase-<n>-story-map.md`
- implementation granularity problem -> `.beads/`
- architecture or phase-boundary problem -> `approach.md` or `phase-plan.md`

---

## Phase 5: Final Approval Gate

**This gate is non-negotiable.**

Present a structured summary:

```text
VALIDATION COMPLETE — APPROVAL REQUIRED BEFORE EXECUTION

Current Phase Summary:
- Phase: Phase <n> - <name>
- Stories: <N>
- Beads: <N>
- Demo walkthrough: <one line>

Structural Verification:
- All 8 dimensions: PASS (after <N> iterations)

Spike Results:
- HIGH-risk items for this phase: <N>
- Result: <all passed / concerns listed>

Polishing Results:
- Dependencies added: <N>
- Graph issues fixed: <N>
- Priority adjustments: <N>
- Duplicates removed: <N>
- Fresh-eyes CRITICAL flags fixed: <N>

Exit-State Readiness:
- Entry state understood: YES
- Exit state observable: YES
- Story sequence coherent: YES
- Demo credible: YES

Unresolved concerns:
- <none | list>

Approve execution for Phase <n>? (yes/no)
```

### If user approves

Update `.khuym/STATE.md`:

```text
PHASE: validated
FEATURE: <feature-name>
CURRENT_PHASE: Phase <n> - <name>
VALIDATED_AT: <timestamp>
STORIES: <N>
BEADS: <N>
```

Handoff:

`Validation complete. Current phase passes. Invoke khuym:swarming skill.`

### If user rejects

Ask what concerns them specifically and route back:

1. phase meaning / exit state problem
2. story order or story size problem
3. risk / spike concern
4. bead quality problem
5. fundamental approach or phase-boundary problem

Do not guess.

---

## Lightweight Mode

For confirmed LOW-risk single-story, single-phase work:

1. abbreviated structural verification on the single story/bead
2. skip spikes
3. run `bv --robot-suggest`
4. still require the final approval gate

If uncertain, use full mode.

---

## What Happens After This Phase

Validating approves execution for the **current phase only**.

After swarming finishes:

- if more phases remain in `phase-plan.md`, return to `khuym:planning` to prepare the next phase
- if this was the final phase, proceed to `khuym:reviewing`

Do not assume later phases are ready just because the current phase passed.

---

## Red Flags

- executing any bead before approval
- validating a bead set that has no approved `phase-plan.md`
- validating a current phase that has no current-phase contract or story map
- validating a story map that cannot explain "why now" for Story 1
- a phase exit state that is not observable
- a spike returned NO and execution is still being considered
- iteration 4 of structural verification
- a bead's "done" does not clearly connect to any story
- a story that cannot answer "what does this unlock?"

---

## Reference Files

| File | When to Load |
|------|-------------|
| `references/plan-checker-prompt.md` | Phase 1 |
| `references/bead-reviewer-prompt.md` | Phase 3 fresh-eyes review |
