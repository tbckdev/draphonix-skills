---
name: khuym:planning
description: >-
  Research the codebase, turn locked decisions into a plain-English phase plan,
  and after approval prepare only the current phase for validating. Use after
  khuym:exploring completes. Reads CONTEXT.md, retrieves institutional
  learnings, runs discovery and synthesis, writes discovery.md, approach.md,
  phase-plan.md, and then writes current-phase contract/story artifacts plus
  beads for that phase only.
---

# Planning Skill

If `.khuym/onboarding.json` is missing or stale for the current repo, stop and invoke `khuym:using-khuym` before continuing.

Planning has two jobs:

1. Show the whole feature in a way a human can immediately understand.
2. Prepare only the next phase for execution after the human approves that shape.

If this skill cannot explain the work in plain language with practical examples, it is not done.

## Communication Standard

Planning explanations should sound like a teammate explaining the work at a whiteboard, not like a planner reciting internal categories.

When describing phases or stories:

- start with what becomes true in the product or system
- explain why the order makes sense using a realistic scenario
- use technical terms only after the practical meaning is clear
- avoid vague labels like "foundation", "polish", or "integration layer" unless they are immediately translated into concrete outcomes

Bad:

- `Phase 1 establishes the foundational ingestion abstraction.`

Good:

- `Phase 1 makes one inbound message arrive safely, get normalized, and become visible in the inbox. We do this first because nothing else matters until one real message can get through the system correctly.`

## Core Planning Model

Khuym now plans at five levels:

```text
Whole Feature
  -> Phase Plan
    -> Current Phase
      -> Stories
        -> Beads
```

- **Whole Feature**: the full thing the user asked for
- **Phase Plan**: the list of meaningful chunks that will get us there
- **Current Phase**: the chunk we are preparing right now
- **Story**: why the work inside the current phase happens in this order
- **Bead**: the worker-sized task

### Plain-language definitions

- **Phase** means: "what becomes true for real people or real systems after this chunk lands?"
- **Story** means: "what has to happen first, next, and last inside this phase so the result is believable?"
- **Bead** means: "what one worker can pick up and finish without guessing?"

If a phase sounds like a bucket of chores, or a story sounds like an implementation layer, revise it before moving on.

## Worked Example

Use this mental model while planning:

> Feature: add inbound email support for the agent inbox.

**Phase 1: Receive and normalize inbound email**

- What changes in real life: an incoming email can reach the system and become a normalized internal message record.
- Why this phase exists first: nothing else matters until inbound mail can be accepted safely.
- Demo: send one test email, see one normalized inbox record appear.

**Stories inside Phase 1**

- **Story 1: Accept the webhook safely**
  The system can verify the inbound request and reject invalid payloads.
- **Story 2: Normalize the message**
  The accepted payload becomes one predictable internal shape.
- **Story 3: Surface it in tooling**
  A human or agent can inspect the normalized message in the inbox flow.

Why this order makes sense:

- Story 1 comes first because unsafe input should not reach storage.
- Story 2 comes next because later code needs one consistent message shape.
- Story 3 comes last because there is nothing useful to show until normalization works.

**Phase 2: Route messages to the right agent and thread**

- What changes in real life: the email no longer just exists, it lands in the right conversation.

**Phase 3: Add reply polish, safety checks, and operational visibility**

- What changes in real life: the feature is dependable enough to run in normal use.

This is the standard to match. A good plan lets someone picture what would actually happen after each phase.

## Pipeline Overview

```text
CONTEXT.md (from exploring)
  ↓
Phase 0: Learnings Retrieval        -> institutional knowledge
Phase 1: Discovery                  -> history/<feature>/discovery.md
Phase 2: Synthesis                  -> history/<feature>/approach.md
Phase 3: Whole Feature Phase Plan   -> history/<feature>/phase-plan.md
HARD-GATE: user approves phase plan before current-phase prep
Phase 4: Current Phase Contract     -> history/<feature>/phase-<n>-contract.md
Phase 5: Current Phase Story Map    -> history/<feature>/phase-<n>-story-map.md
Phase 6: Multi-Perspective Check    -> refine current phase artifacts (HIGH-stakes only)
Phase 7: Current Phase Bead Creation -> .beads/* for this phase only
  ↓
Handoff: "Invoke khuym:validating skill for Phase <n>."
```

## Before You Start

If `.codex/khuym_status.mjs` exists, run `node .codex/khuym_status.mjs --json` first so you start from the latest onboarding/state/handoff snapshot instead of inferring it from memory.

**Read CONTEXT.md first.** It is the single source of truth. Every research decision, every phase, every story, and every bead must honor the locked decisions inside it.

```bash
cat history/<feature>/CONTEXT.md
```

If `CONTEXT.md` does not exist, stop. Tell the user: "Run the khuym:exploring skill first to lock decisions before planning."

If a larger roadmap or whole-feature document exists, read it too. The phase plan should show how the feature unfolds from first usable slice to finished capability.

---

## Phase 0: Learnings Retrieval

Institutional knowledge prevents re-solving solved problems. This phase is mandatory.

### Step 0.1: Always read critical patterns

```bash
cat history/learnings/critical-patterns.md
```

### Step 0.2: Search for domain-relevant learnings

Extract 3-5 keywords from the feature name and `CONTEXT.md`, then run focused searches:

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

## Phase 1: Discovery

Map the codebase, identify constraints, and research external patterns to the depth the feature requires.

### Discovery areas

Always explore:

1. **Architecture topology** — where this feature will live in the codebase
2. **Existing patterns** — what should be reused or modeled after
3. **Technical constraints** — runtime, dependencies, build/test requirements

Explore if relevant:

4. **External research** — only when the feature introduces a novel library, integration, or pattern

### Parallelization guidance

- **Standard feature**: 2-3 agents covering architecture, patterns, constraints
- **New integration/library**: 3-4 agents including external research
- **Pure refactor**: 1-2 agents focused on existing patterns and constraints
- **Architecture change**: go deep on topology and replacement risk

### Output

All discovery findings go to:

`history/<feature>/discovery.md`

Use `references/discovery-template.md`.

---

## Phase 2: Synthesis

Close the gap between codebase reality and the feature requirements.

Read:

- `history/<feature>/CONTEXT.md`
- `history/<feature>/discovery.md`

Write:

- `history/<feature>/approach.md`

The synthesis result must produce:

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

## Phase 3: Whole Feature Phase Plan

Now turn the feature into an understandable sequence of phases before preparing any execution work.

Write:

- `history/<feature>/phase-plan.md`

Use `references/phase-plan-template.md`.

### What phase planning must answer

For the whole feature:

1. What are the 2-4 meaningful phases?
2. What changes for real users or systems after each phase?
3. Why does Phase 1 come before Phase 2?
4. What is the simplest believable demo for each phase?
5. Which phase should be prepared first?

### Rules for a good phase plan

- Every phase must describe a real, observable capability slice
- A reader should understand the phase without reading implementation files
- Phase 1 must feel obviously first
- If a phase has 5+ stories, it is probably too large
- If a phase can only be described with architecture jargon, rewrite it in practical language

### HARD-GATE: approval before current-phase prep

After writing `phase-plan.md`, stop and present:

- feature summary in 2-4 sentences
- phases in order
- stories inside each phase
- which phase will be prepared next

Use handoff wording like:

> "Planning has broken the feature into phases and stories.
> Review `history/<feature>/phase-plan.md`.
> If you approve this shape, planning will prepare Phase <n> for validating.
> Do not create beads before this approval."

If the user asks for revisions, update `phase-plan.md` first. Do not move forward until the phase plan is approved.

---

## Phase 4: Current Phase Contract

Only after `phase-plan.md` is approved, prepare the current phase.

### Select the current phase

- Default to the first phase not yet prepared or completed in `.khuym/STATE.md`
- If no state exists, start with Phase 1
- If the user explicitly chooses a later phase, honor that and record it in `.khuym/STATE.md`

Write:

- `history/<feature>/phase-<n>-contract.md`

Use `references/phase-contract-template.md`.

The current phase contract must answer, in plain language:

1. What changes in real life when this phase lands
2. What the **entry state** is
3. What the **exit state** is
4. What the simplest **demo walkthrough** is
5. What this phase unlocks next
6. What is explicitly out of scope
7. What signals would force a pivot

### Rules for a good current-phase contract

- The exit state must be observable, not aspirational
- The phase must close a meaningful small loop by itself
- The demo walkthrough must prove the phase is real
- If the phase fails, the team should know whether to debug locally or rethink the larger plan

If you cannot explain the phase in 3-5 simple sentences, revise the phase plan or approach before moving on.

---

## Phase 5: Current Phase Story Map

Now break the current phase into stories.

Write:

- `history/<feature>/phase-<n>-story-map.md`

Use `references/story-map-template.md`.

### Story rules

Every story must state:

- what happens in this story
- why it happens now
- what part of the phase exit state it advances
- what it creates
- what it unlocks next
- what "done looks like"

### Story quality checks

- Story 1 must have an obvious reason to exist first
- Every story must unlock or de-risk a later story, or directly close part of the exit state
- If all stories complete, the phase exit state should hold
- If a story cannot answer "what becomes possible after this?" it is probably not a real story

### Story count guidance

- **Typical current phase**: 2-4 stories
- **Small current phase**: 1-2 stories
- **Large current phase**: split the phase before creating beads

Stories are the human-readable explanation. Beads come after.

---

## Phase 6: Multi-Perspective Check

**Only for HIGH-stakes current phases**: multiple HIGH-risk components, core architecture, auth flows, data model changes, or anything with a large blast radius.

For standard current phases, skip to Phase 7.

Review these artifacts together:

- `history/<feature>/phase-plan.md`
- `history/<feature>/phase-<n>-contract.md`
- `history/<feature>/phase-<n>-story-map.md`

Prompt the reviewer to look for:

1. Does this phase still fit the full feature plan?
2. Does the phase contract close a small believable loop?
3. Do the stories make sense in this order?
4. Which story is too large, vague, or poorly ordered?
5. What would make an executor regret this phase design later?

Iterate 1-2 rounds. Stop when changes become incremental.

---

## Phase 7: Current Phase Bead Creation

Only now convert the current phase story map into executable beads using `br create`.

When asking a model to perform the bead-creation pass, use this prompt:

```text
OK so please take ALL of that and elaborate on it more and then create a comprehensive and granular set of beads for all this with tasks, subtasks, and dependency structure overlaid, with detailed comments so that the whole thing is totally self-contained and self-documenting (including relevant background, reasoning/justification, considerations, etc.-- anything we'd want our "future self" to know about the goals and intentions and thought process and how it serves the over-arching goals of the project.) Use the `br` tool repeatedly to create the actual beads. Use /effort max.
```

### Non-negotiable rule

Never write pseudo-beads in Markdown. Create the real graph with `br`.

### Bead requirements

Every bead must include:

- clear title
- description with enough context for a fresh worker
- file scope
- dependencies
- verification criteria
- explicit phase association
- explicit story association

### Create epic first if missing, then current-phase task beads

```bash
br create "<Feature Name>" -t epic -p 1
# -> br-<epic-id>

br create "Phase <n> / Story <m>: <Action>" -t task --blocks br-<epic-id>
# -> br-<id>

br dep add br-<id2> br-<id1>
```

### Story-to-bead decomposition rules

- Use as many beads as the story genuinely needs; there is no fixed numeric cap
- A bead should not span multiple unrelated stories
- If a story breaks into many beads, confirm the decomposition still reflects one coherent story and each bead has a distinct purpose
- The story order should still be visible after decomposition
- Do not create beads for later phases yet

### Embed phase and story context in each bead

For every bead, include:

```markdown
## Phase Context

Phase: Phase <n> - <Phase Name>
What Changes: <what becomes true after this phase>
Unlocks Next: <next phase or capability>

## Story Context

Story: Story <m> - <Story Name>
What Happens: <what this story makes true>
Contributes To: <phase exit-state statement>
Unlocks: <what the next story can now do>

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

After bead creation, fill the `Story-To-Bead Mapping` section in `history/<feature>/phase-<n>-story-map.md`.

The validator must be able to trace:

`feature -> phase -> story -> bead`

---

## Update STATE.md

After major planning transitions, update `.khuym/STATE.md`:

```markdown
## Current State

Skill: planning
Feature: <feature-name>
Plan Gate: pending | approved
Approved Phase Plan: yes | no
Current Phase: Phase <n> - <phase name>

## Artifacts Written

- history/<feature>/discovery.md
- history/<feature>/approach.md
- history/<feature>/phase-plan.md
- history/<feature>/phase-<n>-contract.md
- history/<feature>/phase-<n>-story-map.md
- .beads/*.md

## Story Summary

Stories: <N>
Current Phase Beads: <br-id>, <br-id>

## Risk Summary

HIGH-risk components in current phase: [list] -> flagged for validating to spike
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
    "history/<feature>/phase-plan.md",
    "history/<feature>/phase-<n>-contract.md",
    "history/<feature>/phase-<n>-story-map.md"
  ],
  "current_phase": "Phase <n> - <phase name>",
  "stories_defined": ["Story 1", "Story 2"],
  "beads_created": ["br-101", "br-102"]
}
```

---

## Handoff

On successful completion:

> **Phase plan approved and current phase prepared.**
>
> - Discovery: `history/<feature>/discovery.md`
> - Approach: `history/<feature>/approach.md`
> - Phase Plan: `history/<feature>/phase-plan.md`
> - Current Phase Contract: `history/<feature>/phase-<n>-contract.md`
> - Current Phase Story Map: `history/<feature>/phase-<n>-story-map.md`
> - HIGH-risk components flagged for this phase: [list or "none"]
>
> **Invoke khuym:validating skill for Phase <n> before execution.**

HARD-GATE: do not hand off to swarming directly.

---

## Boundary Clarifications

**Planning READS** `CONTEXT.md` — it does not override locked decisions.

**Planning DEFINES** the whole feature phase plan before it prepares the current phase.

**Planning CREATES** beads only for the current approved phase.

**Planning does the research** that exploring deliberately avoided.

**Planning does NOT run spikes** — validating owns spike execution.

---

## Red Flags

- Skipping learnings retrieval
- Ignoring `CONTEXT.md`
- Creating current-phase beads before the user approves `phase-plan.md`
- Creating later-phase beads early
- Stories with no clear unlock or contribution
- Exit states that are vague or non-observable
- Writing pseudo-beads in Markdown
- HIGH-risk items with no risk flag in `approach.md`
- Missing dependencies between beads
