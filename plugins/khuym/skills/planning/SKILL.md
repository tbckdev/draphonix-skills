---
name: khuym:planning
description: >-
  Research, synthesize, and decompose a phase into a clear phase contract,
  story map, and executable beads. Use after khuym:exploring completes. Reads
  CONTEXT.md, retrieves institutional learnings, runs discovery and synthesis,
  writes discovery.md, approach.md, phase-contract.md, story-map.md, and then
  creates .beads/ work that matches the story structure. Invoked when the user
  says plan this phase, map the stories, break this into beads, research and
  plan, or when exploring hands off to planning.
---

# Planning Skill

If `.khuym/onboarding.json` is missing or stale for the current repo, stop and invoke `khuym:using-khuym` before continuing.

Research the codebase, shape the phase as a small closed loop, map the stories inside that phase, and only then create beads.

> "Planning is the cheapest place to buy correctness. A bug caught in plan space costs 25× less to fix than one caught in code space." — Flywheel Complete Guide

## Core Planning Model

Khuym now plans at four levels:

```text
Whole Plan
  -> Phase
    -> Stories
      -> Beads
```

- **Whole Plan**: the larger arc, if one exists
- **Phase**: a small closed loop with a clear exit state
- **Story**: the internal narrative slice that moves the phase toward its exit state
- **Bead**: the executable worker unit

Do not jump from `approach.md` straight to beads. If the phase cannot be explained in simple terms with a clear exit state and story sequence, it is not ready for execution.

## Pipeline Overview

```text
CONTEXT.md (from exploring)
  ↓
Phase 0: Learnings Retrieval       -> institutional knowledge
Phase 1: Discovery (parallel)      -> history/<feature>/discovery.md
Phase 2: Synthesis                 -> history/<feature>/approach.md
Phase 3: Phase Contract            -> history/<feature>/phase-contract.md
Phase 4: Story Mapping             -> history/<feature>/story-map.md
Phase 5: Multi-Perspective Check   -> refine approach/contract/story map (HIGH-stakes only)
Phase 6: Bead Creation             -> .beads/*.md via br create
  ↓
Handoff: "Invoke khuym:validating skill"
```

## Before You Start

**Read CONTEXT.md first.** It is the single source of truth. Every research decision, every story, every bead must honor the locked decisions inside it.

```bash
cat history/<feature>/CONTEXT.md
```

If `CONTEXT.md` does not exist, stop. Tell the user: "Run the khuym:exploring skill first to lock decisions before planning."

If a larger roadmap or whole-plan document exists, read it too. The phase contract must explain how this phase contributes to the larger arc.

---

## Phase 0: Learnings Retrieval

Institutional knowledge prevents re-solving solved problems. This phase is mandatory.

### Step 0.1: Always read critical patterns

```bash
cat history/learnings/critical-patterns.md
```

### Step 0.2: Grep for domain-relevant learnings

Extract 3-5 domain keywords from the feature name and `CONTEXT.md`, then run focused searches:

```bash
grep -r "tags:.*<keyword1>" history/learnings/ -l -i
grep -r "tags:.*<keyword2>" history/learnings/ -l -i
grep -r "<ComponentName>" history/learnings/ -l -i
```

### Step 0.3: Score and include

- Strong match -> read full file, include its insight
- Weak match -> skip

### Step 0.4: Document what you found

At the top of `history/<feature>/discovery.md`, add an `Institutional Learnings` section. If nothing relevant exists, write: `No prior learnings for this domain.`

---

## Phase 1: Discovery (Goal-Oriented Exploration)

Map the codebase, identify constraints, and research external patterns to the depth the phase requires.

### Discovery areas

Always explore:

1. **Architecture topology** — where this phase fits in the codebase
2. **Existing patterns** — what should be reused or modeled after
3. **Technical constraints** — runtime, deps, build/test requirements

Explore if relevant:

4. **External research** — only when the phase introduces a novel library, integration, or pattern

### Parallelization guidance

- **Standard phase**: 2-3 agents covering architecture, patterns, constraints
- **New integration/library**: 3-4 agents including external research
- **Pure refactor**: 1-2 agents focused on existing patterns and constraints
- **Architecture change**: go deep on topology and pattern replacement risk

### Output

All discovery findings go to:

`history/<feature>/discovery.md`

Use `references/discovery-template.md`.

---

## Phase 2: Synthesis

Spawn a synthesis subagent to close the gap between codebase reality and the phase requirements.

Read:

- `history/<feature>/CONTEXT.md`
- `history/<feature>/discovery.md`

Write:

- `history/<feature>/approach.md`

The synthesis subagent must produce:

1. **Gap Analysis**
2. **Recommended Approach**
3. **Alternatives Considered**
4. **Risk Map**
5. **Proposed File Structure**
6. **Institutional Learnings Applied**

Use `references/approach-template.md`.

### Risk classification

| Level | Criteria | Action |
|-------|----------|--------|
| LOW | Pattern exists in codebase | Proceed |
| MEDIUM | Variation of existing pattern | Interface sketch optional |
| HIGH | Novel, external dep, blast radius >5 files | Flag for validating to spike |

---

## Phase 3: Phase Contract

Before creating beads, define the phase as a closed loop.

Write:

- `history/<feature>/phase-contract.md`

Use `references/phase-contract-template.md`.

The phase contract must answer, in plain language:

1. Why this phase exists now
2. What the **entry state** is
3. What the **exit state** is
4. What the simplest **demo story** is
5. What this phase unlocks next
6. What is explicitly out of scope
7. What signals would force a pivot

### Rules for a good phase contract

- The exit state must be observable, not aspirational
- The phase must close a meaningful small loop by itself
- The demo story must prove the phase is real
- If the phase fails, the team should know whether to debug locally or rethink the larger plan

If you cannot explain the phase in 3-5 simple sentences, the phase is not ready. Revise the approach before moving on.

---

## Phase 4: Story Mapping

Now break the phase into **Stories**, not "plans inside a phase."

Write:

- `history/<feature>/story-map.md`

Use `references/story-map-template.md`.

### Story rules

Every story must state:

- **Purpose**
- **Why now**
- **Contributes to**
- **Creates**
- **Unlocks**
- **Done looks like**

### Story quality checks

- Story 1 must have an obvious reason to exist first
- Every story must unlock or de-risk a later story, or directly close part of the exit state
- If all stories complete, the phase exit state should hold
- If a story cannot answer "what does this unlock?" it is probably not a real story

### Story count guidance

- **Typical phase**: 2-4 stories
- **Small phase**: 1-2 stories
- **Large phase**: split into multiple phases instead of creating 5+ stories

Stories are the human-readable narrative. Beads come after.

---

## Phase 5: Multi-Perspective Check

**Only for HIGH-stakes phases**: multiple HIGH-risk components, core architecture, auth flows, data model changes, or anything with a large blast radius.

For standard phases, skip to Phase 6.

Spawn a fresh subagent with:

- `history/<feature>/approach.md`
- `history/<feature>/phase-contract.md`
- `history/<feature>/story-map.md`

Prompt:

```text
Review this phase design for blind spots.

1. Does the phase contract really close a small loop?
2. Do the stories make sense in this order?
3. What is missing from the exit state?
4. Which story is too large, vague, or poorly ordered?
5. What would the team regret 6 months from now?
```

Iterate 1-2 rounds. Stop when changes become incremental.

---

## Phase 6: Bead Creation

Only now convert the story map into executable beads using `br create`.

### Non-negotiable rule

Never write pseudo-beads in Markdown. Create the real graph with `br`.

### Bead requirements

Every bead must include:

- clear title
- description with enough context for a fresh worker
- file scope
- dependencies
- verification criteria
- explicit story association

### Create epic first, then task beads

```bash
br create "<Feature Name>" -t epic -p 1
# -> br-<epic-id>

br create "<Action: Component>" -t task --blocks br-<epic-id>
# -> br-<id>

br dep add br-<id2> br-<id1>
```

### Story-to-bead decomposition rules

- One story usually becomes 1-3 beads
- A bead should not span multiple unrelated stories
- If a story needs 4+ substantial beads, re-check whether the story is too large
- The story order should still be visible after decomposition

### Embed story context in each bead

For every bead, include:

```markdown
## Story Context

Story: <Story Name>
Purpose: <what this story makes true>
Contributes To: <phase exit-state statement>
Unlocks: <what the next story or phase can now do>

## Planning Context

From approach.md: <specific decision that applies here>

## Institutional Learnings

From history/learnings/<file>:
- <key gotcha or pattern>
```

### Decomposition principles

- One bead = one agent, one context window, ~30-90 minutes
- Never create a bead that requires reading 10+ files
- Shared files require explicit dependencies
- Story closure matters more than layer purity

### Complete the story map

After bead creation, fill the `Story-To-Bead Mapping` section in `history/<feature>/story-map.md`.

The validator must be able to trace:

`phase exit state -> story -> bead`

---

## Update STATE.md

After major planning transitions, update `.khuym/STATE.md`:

```markdown
## Current State

Skill: planning
Phase: <phase name>
Feature: <feature-name>

## Artifacts Written

- history/<feature>/discovery.md
- history/<feature>/approach.md
- history/<feature>/phase-contract.md
- history/<feature>/story-map.md
- .beads/*.md

## Story Summary

Stories: <N>
Epic: br-<id>

## Risk Summary

HIGH-risk components: [list] -> flagged for validating to spike
```

---

## Context Budget

If context exceeds 65% at any phase transition, write `HANDOFF.json` and pause:

```json
{
  "skill": "planning",
  "feature": "<feature-name>",
  "completed_through": "Phase <N>",
  "next_phase": "Phase <N+1>",
  "artifacts": [
    "history/<feature>/discovery.md",
    "history/<feature>/approach.md",
    "history/<feature>/phase-contract.md",
    "history/<feature>/story-map.md"
  ],
  "stories_defined": ["Story 1", "Story 2"],
  "beads_created": ["br-101", "br-102"]
}
```

---

## Handoff

On successful completion:

> **Phase plan created and mapped into stories.**
>
> - Discovery: `history/<feature>/discovery.md`
> - Approach: `history/<feature>/approach.md`
> - Phase Contract: `history/<feature>/phase-contract.md`
> - Story Map: `history/<feature>/story-map.md`
> - HIGH-risk components flagged: [list or "none"]
>
> **Invoke khuym:validating skill before execution.**

HARD-GATE: do not hand off to swarming directly.

---

## Boundary Clarifications

**Planning READS** `CONTEXT.md` — it does not override locked decisions.

**Planning DEFINES** the phase contract and story map before it creates beads.

**Planning CREATES** draft beads — validating verifies and polishes them.

**Planning does the research** that exploring deliberately avoided.

**Planning does NOT run spikes** — validating owns spike execution.

---

## Red Flags

- Skipping learnings retrieval
- Ignoring `CONTEXT.md`
- Creating beads before a phase contract exists
- Creating beads before stories are clear
- Stories with no clear unlock or contribution
- Exit states that are vague or non-observable
- Writing pseudo-beads in Markdown
- HIGH-risk items with no risk flag in `approach.md`
- Missing dependencies between beads
