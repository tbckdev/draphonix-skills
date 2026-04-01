---
name: khuym:using-khuym
description: Bootstrap meta-skill for the khuym agentic development ecosystem. Load first on any khuym project. Lists all 9+2 skills with routing logic, session scout/bootstrap, small-change vs standard-feature vs high-risk mode selection, go mode (full-auto pipeline with 4 human gates), priority rules, and state resume. Invoke when starting a new session, choosing which skill to use, running the full pipeline end-to-end, or resuming after a handoff.
metadata:
  version: '2.2'
  ecosystem: khuym
---

# using-khuym

Bootstrap meta-skill. Load this first. It tells you which skill to invoke next and how the ecosystem chains together.

---

## Plugin Onboarding

Before any normal bootstrap, verify that the current machine has Node.js available and that the current repo is onboarded for the Khuym plugin.

Run `node --version` first.

- If `node` is missing or too old: stop immediately, tell the user Khuym requires Node.js 18+, and ask them to install or upgrade Node before continuing.

Then run `node scripts/onboard_khuym.mjs --repo-root <repo-root>` from this skill directory and inspect the JSON result.

- If `status = "up_to_date"`: proceed immediately.
- If onboarding is missing or stale:
  - summarize what the script wants to create or update
  - if `status = "missing_runtime"`: stop, tell the user Khuym requires Node.js 18+, and ask them to install or upgrade Node before continuing
  - if `requires_confirmation = true`, explain that an existing `compact_prompt` was found and Khuym will preserve it unless the user explicitly approves replacement
  - ask before making repo changes
  - after approval, run `node scripts/onboard_khuym.mjs --repo-root <repo-root> --apply`
  - only use `--allow-compact-prompt-replace` when the user explicitly approved replacing the repo's existing compaction prompt

Onboarding installs or updates:

- root `AGENTS.md` from the plugin's `AGENTS.template.md`
- repo-local `.codex/config.toml`
- repo-local `.codex/hooks.json`
- repo-local `.codex/hooks/khuym_*.mjs`
- repo-local `.codex/khuym_status.mjs`
- repo-local `.codex/khuym_state.mjs`
- `.khuym/onboarding.json`
- `.khuym/state.json`

If onboarding is not complete, do not continue into the rest of the Khuym workflow.

---

## Session Scout

After onboarding succeeds, use the repo-local scout command as the first quick orientation step whenever it is available:

```bash
node .codex/khuym_status.mjs --json
```

The scout is read-only. It summarizes:

- onboarding health
- `.khuym/state.json`
- `.khuym/STATE.md`
- `.khuym/HANDOFF.json`
- recommended next reads/actions

Use it to get the current truth quickly, then open the deeper files it points to.

---

## Skill Catalog

| # | Skill | One-line description | Load when... |
|---|-------|----------------------|--------------|
| 1 | `khuym:using-khuym` | This file. Routing, go mode, red flags. | Starting any session |
| 2 | `khuym:exploring` | Identify gray areas, lock decisions → CONTEXT.md | Feature request is vague or new; "what exactly should this do?" |
| 3 | `khuym:planning` | Research + synthesis → `phase-plan.md`, then current-phase contract/story map + beads | Decisions are locked (CONTEXT.md exists); ready to show the full phase/story breakdown and prepare the next phase |
| 4 | `khuym:validating` | Verify the current phase contract, story map, and bead graph before execution | The phase plan is approved and the current phase has stories and beads; need to prove this phase is actually execution-ready |
| 5 | `khuym:swarming` | Launch+tend worker pool via Agent Mail + bv | Beads are validated; ready to execute at scale |
| 6 | `khuym:executing` | Single worker loop: priority → reserve → implement bead → close → loop | Spawned by swarming; one agent, self-routing from the live graph |
| 7 | `khuym:reviewing` | 5 parallel review agents (P1/P2/P3) + artifact verification + UAT | Execution complete; need quality gate before merge |
| 8 | `khuym:compounding` | Capture learnings → history/learnings/ → critical-patterns.md | Feature shipped; extract patterns/decisions/failures for future runs |
| 9 | `khuym:writing-khuym-skills` | TDD-for-skills: RED-GREEN-REFACTOR + persuasion psychology | Improving or creating khuym skills themselves |
| 10 | `khuym:debugging` | Root-cause analysis for blocked beads and execution failures | Agent stuck, bead blocked, unexpected error |
| 11 | `khuym:gkg` | Codebase intelligence via gkg (repo map, dependency graph) | Need deep codebase understanding before planning |

---

## Routing Logic

Given a user request, determine the working mode first, then the first skill.

### Mode selection

| Mode | Use when... | Notes |
|---|---|---|
| `small_change` | ≤3 files, no new API/data model, LOW risk, no gray areas | Lightweight planning and validating, but still no skipping validating |
| `standard_feature` | Normal feature or refactor with clear value but moderate scope | Default mode for most Khuym work |
| `high_risk_feature` | Cross-cutting, high-blast-radius, or architecture-sensitive work | Use deeper planning review and explicit spikes for risky items |

### First-skill routing

Given a user request, determine which skill to invoke first:

| Request type | First skill | Notes |
|---|---|---|
| Vague/new feature ("build X") | `khuym:exploring` | Always start here if gray areas exist |
| Research task ("investigate Y") | `khuym:planning` | Skip exploring only if scope is fully clear |
| "Just fix this" / small change | `khuym:planning` | Route in `small_change` mode |
| "Review my code" | `khuym:reviewing` | Load directly |
| "What did we learn?" / "Capture learnings" | `khuym:compounding` | Load directly |
| "Improve khuym itself" | `khuym:writing-khuym-skills` | Load directly |
| Agent stuck / error | `khuym:debugging` | Load directly |
| "Run the full pipeline" / `/go` | Go Mode (below) | Chain all skills |
| Resuming a session | Resume Logic (below) | Check HANDOFF.json first |

**When in doubt: invoke `khuym:exploring` first.** The cost of over-exploring is low; the cost of executing a misunderstood feature is high.

---

## State Bootstrap

On every session start, before doing anything else:

```
0. Confirm Khuym onboarding is current via .khuym/onboarding.json
   → If missing or stale: return to Plugin Onboarding above

0.5. If .codex/khuym_status.mjs exists: run `node .codex/khuym_status.mjs --json`
   → Use the scout output to decide which files to open next

1. Check for .khuym/ directory in project root
   → If missing: mkdir -p .khuym/ and create defaults below
   
2. Check .khuym/state.json
   → If missing: create with defaults:
     {
       "schema_version": "1.0",
       "phase": "idle",
       "approved_gates": {
         "context": false,
         "phase_plan": false,
         "execution": false,
         "review": false
       }
     }

3. Check .khuym/STATE.md
   → If missing: create with template:
     # STATE
     focus: (none)
     phase: idle
     last_updated: <date>
   
4. Check .khuym/HANDOFF.json
   → If exists → go to Resume Logic below
   → If missing → proceed normally
   
5. Check .khuym/config.json
   → If missing: create {} (all features enabled by default — absent=enabled)

6. Check for history/learnings/critical-patterns.md
   → If exists: read it now. These are mandatory context for all subsequent skills.
```

---

## Resume Logic

If `.khuym/HANDOFF.json` exists:

```
1. Read HANDOFF.json (and .khuym/state.json if present)
2. Extract: { phase, skill, feature, context_pct, next_action, beads_in_flight }
3. Present to user:
   "Session paused at [phase] during [feature].
    Last action: [last_action]
    Suggested: [next_action]
    Resume? (yes / no / show state)"
4. If yes → load the skill named in HANDOFF.json and continue
5. If no  → ask what to work on instead
6. Do NOT auto-resume without user confirmation
```

---

## Go Mode (Full Pipeline)

Go mode chains all skills end-to-end with exactly 4 human gates. Load `references/go-mode-pipeline.md` for the complete step-by-step sequence.

**Trigger:** User says `/go [feature]`, "run the full pipeline", or "go mode".

**The 4 gates — never skip these:**

```
GATE 1 (after exploring):
  Present history/<feature>/CONTEXT.md to user.
  Ask: "Decisions locked. Approve CONTEXT.md before planning?"
  HARD-GATE: do not invoke planning until user approves.

GATE 2 (after whole-feature planning):
  Present: full phase list, stories inside each phase, and which phase will be prepared first.
  Ask: "Phase breakdown is ready. Approve phase-plan.md before current-phase preparation?"
  HARD-GATE: do not prepare the current phase or create beads until user approves.

GATE 3 (after validating the current phase):
  Present: phase exit state, story count, bead count, risk summary, spike results.
  Ask: "Current phase verified. Approve execution?"
  HARD-GATE: do not invoke swarming until user approves.

GATE 4 (after reviewing):
  Present: P1 count, P2 count, P3 count.
  If P1 > 0: "P1 findings block merge. Fix before proceeding?"
  If P1 = 0: "Review complete. Approve merge?"
  HARD-GATE: do not merge or close epic until user responds.
```

**Go mode sequence:**
```
exploring → [GATE 1] → planning (whole feature) → [GATE 2]
         → planning (current phase prep) → validating → [GATE 3]
         → swarming (+ executing ×N)
         → if more phases remain: planning (next phase prep) and repeat
         → if final phase complete: reviewing → [GATE 4] → compounding → DONE
```

---

## Mode Guidance

### `small_change`

For requests classified as `small_change`:

```
planning (lightweight: single bead, no multi-model refinement)
  → present one-phase plan and wait for approval
  → validating (lightweight: single-story phase, abbreviated verification + bv check)
  → swarming (single worker)
  → executing
  → reviewing (lightweight but still required)
  → compounding (only if a lesson was learned)
```

Choose `small_change` when ALL of these are true:
- Change touches ≤3 files
- No new API surface or data model changes
- Risk is clearly LOW
- No gray areas about intent
- The phase can honestly be expressed as one story

### `standard_feature`

Use this for the default Khuym chain. This is the normal case for most feature work:

```
exploring → planning → validating → swarming → executing → reviewing → compounding
```

### `high_risk_feature`

Use this when the work is cross-cutting, hard to reverse, or likely to fail if assumptions are wrong.

Additional expectations:
- more discovery depth during planning
- explicit second-opinion refinement during planning
- spike discipline for risky items during validating
- slower approval at GATE 3 before execution begins

---

## Priority Rules

These override everything else:

1. **P1 review findings always block.** Never merge, never close epic, never proceed to compounding while P1 findings are open.
2. **Context budget always applies.** After each bead completion or major phase, if context >65% used: write `.khuym/HANDOFF.json` and pause. Do not continue burning context.
3. **CONTEXT.md is the source of truth.** If implementation diverges from a locked decision in CONTEXT.md, stop and surface the conflict before proceeding.
4. **GATE 3 is the most critical gate.** Execution is irreversible. If there is any doubt about the current phase's soundness, do not approve. Loop back to validating.
5. **Spike failures halt the pipeline.** A failed spike means the approach is broken. Do not proceed to swarming; return to planning.
6. **Never skip validating.** Not for small features. Not for "obvious" plans. Skipping validating is the #1 cause of wasted execution work. (GSD: "Plans are not executed until they pass verification.")
7. **critical-patterns.md is mandatory context.** If it exists, read it before planning or executing anything. Teams report that ignoring past critical patterns is the #1 source of repeat failures.

---

## Communication Contract

This is the default way Codex and GPT models should communicate anywhere inside the Khuym workflow unless a narrower skill requires something stricter.

### The default tone

- practical first, abstract second
- scenario-first, not jargon-first
- explain what happens in real life or in the real system before naming the technical property
- translate decision IDs, invariants, and architecture terms into plain language
- prefer "here is what the code does today" over "here is the category of bug"

### What a good response sounds like

When presenting a plan, finding, blocker, or handoff, the model should usually answer in this order:

1. **Plain-language summary** — what is happening or what is proposed
2. **Current behavior or current state** — what the system does today
3. **Why it matters** — what requirement, decision, or goal this affects
4. **Concrete scenario** — one realistic example with values, timestamps, requests, user actions, or ordering
5. **Next step** — the smallest credible fix, revision, or decision needed

### What to avoid

- terse shorthand like "violates D5", "non-monotonic", "race condition", "coverage gap", or "architecture concern" without immediate explanation
- summaries that assume the reader remembers the diff or the planning session
- abstract labels with no example of what would actually happen
- explanations that begin with terminology and only later reveal the user-visible problem

### Translation rule

If you use technical language, immediately translate it.

Examples:

- Instead of: `This write is non-monotonic.`
  Say: `An older update can overwrite a newer timestamp, so the system can think the user was last active earlier than they really were.`

- Instead of: `Violates D5.`
  Say: `Decision D5 says the fallback should use the most recent inbound user message time. Right now the code uses webhook ingest time instead, which can drift from the real message time.`

### Scope

Apply this tone to:

- planning phase and story explanations
- validating failures and approval summaries
- reviewing findings and user-facing summaries
- swarming blocker reports and handoffs

If a skill gives a structured format, keep the structure but make the content follow this tone.

---

## Red Flags

Watch for these violations. Pause and surface them immediately when detected:

**Skipping phases:**
- Agent jumps from exploring → swarming (skipped planning + validating)
- Agent starts writing code before CONTEXT.md exists
- Agent skips validating because "the plan looks fine"

**Context violations:**
- Downstream agent ignores a locked decision in CONTEXT.md
- Bead description contradicts the approach in approach.md
- Implementation diverges from locked decisions without surfacing conflict

**Execution violations:**
- Files reserved but never released (Agent Mail reservation leak)
- Bead closed as "done" without the acceptance criteria actually verified
- Agent commits code without a bead ID in the commit message

**Quality violations:**
- P1 finding present but pipeline continues to merge
- `br close` called on a bead with placeholder/stub implementation
- Review skipped outside the approved lightweight `small_change` flow

**State violations:**
- Context >65% but no HANDOFF.json written
- Session resumed without reading HANDOFF.json
- `state.json` missing or stale after a phase transition
- STATE.md not updated after a phase transition

---

## File Quick Reference

```
.khuym/
  onboarding.json   ← Khuym plugin onboarding status + managed asset versions
  state.json        ← Machine-readable routing snapshot used by agents and tools
  STATE.md          ← Current phase, focus, blockers (update at every phase transition)
  config.json       ← Feature toggles (absent=enabled)
  HANDOFF.json      ← Session resume data (write when pausing)

.codex/
  khuym_status.mjs  ← Read-only scout command for onboarding, state, and handoff
  khuym_state.mjs   ← Shared state helpers used by the scout command

history/<feature>/
  CONTEXT.md        ← Locked decisions from exploring (source of truth)
  discovery.md      ← Research findings from planning
  approach.md       ← Synthesis + risk map from planning
  phase-plan.md     ← Full feature broken into phases and stories before execution
  phase-<n>-contract.md ← Current-phase entry state, exit state, demo, unlocks, pivot signals
  phase-<n>-story-map.md ← Story sequence inside the current phase; maps stories to beads

history/learnings/
  critical-patterns.md      ← Promoted critical learnings (read always)
  YYYYMMDD-<slug>.md        ← Individual learning entries

.beads/             ← Bead files (managed by br)
.spikes/            ← Spike verification results
.worktrees/         ← Git worktrees for parallel execution
```

---

## Chaining Contract

Each skill reads from upstream artifacts and writes for downstream:

| Skill | Reads | Writes |
|-------|-------|--------|
| exploring | (user conversation) | history/\<feature>/CONTEXT.md |
| planning | CONTEXT.md, critical-patterns.md | discovery.md, approach.md, phase-plan.md, current-phase contract/story map, current-phase beads |
| validating | phase-plan.md, current-phase contract/story map, current-phase beads, approach.md, CONTEXT.md | validated current phase, .spikes/ results |
| swarming | validated beads, state.json, STATE.md | Agent Mail threads, HANDOFF.json, updated state.json, updated STATE.md |
| executing | bead file, Agent Mail, CONTEXT.md | implementation commits, br close |
| reviewing | diff, CONTEXT.md, approach.md, beads | P1/P2/P3 findings |
| compounding | review findings, full feature history | history/learnings/YYYYMMDD-\<slug>.md, critical-patterns.md |

**Handoff phrase pattern:** Every skill ends with an explicit handoff:
`"[Outcome]. Invoke [next-skill] skill."`
