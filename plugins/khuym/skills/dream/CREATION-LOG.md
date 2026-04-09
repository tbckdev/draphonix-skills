# Creation Log: khuym:dream

## Source Material

Origin:
- Dream behavior adaptation from archived reverse-engineering notes captured during the original Dream research pass
- Khuym process contracts from `AGENTS.md`
- Locked decisions from `history/dream-skill/CONTEXT.md` (D1-D6)

What the source does:
- Defines a manual, repo-scoped dream consolidation pass over Codex artifacts and learnings files.
- Constrains consolidation with safety gates around ownership, ambiguity handling, and critical promotions.

Khuym context:
- Supports the dream-skill epic `br-2z8`.
- This bead (`br-13f`) is RED baseline only and intentionally does not finalize `SKILL.md`.

## Extraction Decisions

What to include:
- Bootstrap-vs-recurring risk tied to `last_dream_consolidated_at` because D2 requires correct first-run behavior.
- Exact-one-owner rewrite guard because validation spike requires rewrite only when ownership is clear.
- Candidate-specific ambiguity interaction because D5 requires explicit candidate files, reasons, and options.
- Critical-pattern promotion gating because D4 forbids direct edits without explicit user approval.
- `no match` branch behavior because D3 requires creating a new dated learnings file when no owner exists.
- `no durable signal` branch behavior because D3 requires no durable write when evidence is transient.

What to leave out:
- Full workflow wording for GREEN/REFACTOR because this bead is RED baseline setup only.
- Implementation-level heuristics for matching because those belong in later contract authoring.

## Structure Decisions

1. RED baseline artifacts are split into scenario catalog (`references/pressure-scenarios.md`) and this log to keep pressure cases reusable in later phases.
2. Every scenario records `Combined pressures` and `Exact rationalization` so future GREEN drafting can target observed failure language directly.
3. Added one combined-pressure scenario where multiple locked decisions can fail together; this prevents false confidence from isolated tests.

## RED Phase: Baseline Testing

Status:
- Baseline scenario definitions are complete in `references/pressure-scenarios.md`.
- This log captures exact baseline rationalization targets for the first RED execution pass.

Scenario coverage:
- Scenario: Bootstrap Timestamp Missing But Run Continues
- Scenario: Multi-Match Rewrite Without Exact-One-Owner Guard
- Scenario: Ambiguous Match Prompt Lacks Candidate-Specific Options
- Scenario: Critical Pattern File Edited Without Approval
- Scenario: No-Match Candidate Forced Into Existing File
- Scenario: No-Durable-Signal Candidate Written Anyway
- Scenario: Combined Pressures Across Timestamp, Rewrite, And Ambiguity

Combined pressures used:
- Time, pragmatic, social, sunk-cost, authority, economic

Exact rationalization targets from RED baseline:
1. "No `last_dream_consolidated_at` probably means first run already happened somewhere else, so I will continue with a short window."
2. "Both files are close enough, so rewriting the top one is still better than asking."
3. "I can ask a simpler question first; candidate-specific details can come later if needed."
4. "This promotion is clearly correct and low risk, so writing it now saves a second review step."
5. "Creating a new learnings file adds overhead, so folding this into the nearest file is faster."
6. "Even if the signal is weak, writing a short note is better than returning nothing."
7. "Given deadline pressure, I'll do one best-effort merge now and avoid extra prompts."

## GREEN Phase: Skill Present Re-Run

`khuym/khuym:dream/SKILL.md` and references were authored in `br-11w`, then pressure scenarios were replayed.

### Scenario Outcomes (GREEN)

1. Scenario: Bootstrap Timestamp Missing But Run Continues
- Result: PASS
- Why: skill requires bootstrap when `last_dream_consolidated_at` is absent, unless user explicitly overrides.

2. Scenario: Multi-Match Rewrite Without Exact-One-Owner Guard
- Result: PASS
- Why: skill and rubric both enforce rewrite only when exactly one owner is clear.

3. Scenario: Ambiguous Match Prompt Lacks Candidate-Specific Options
- Result: PASS
- Why: skill requires candidate learnings files, reasons, and labeled options (`merge -> <target file>`, `create new`, `skip`).

4. Scenario: Critical Pattern File Edited Without Approval
- Result: PASS
- Why: skill explicitly prohibits auto-edits to `history/learnings/critical-patterns.md`.

5. Scenario: No-Match Candidate Forced Into Existing File
- Result: PASS
- Why: skill requires a new dated learnings file when no existing owner clearly matches.

6. Scenario: No-Durable-Signal Candidate Written Anyway
- Result: PASS
- Why: skill requires the no-write path when a candidate is not durable enough to retain.

7. Scenario: Combined Pressures Across Timestamp, Rewrite, And Ambiguity
- Result: PASS (after refactor tightening)
- Why: guardrails now explicitly block silent first-run guesses and recurring full-scan drift.

## REFACTOR Phase: Iteration Log

### Iteration 1

New loophole from GREEN replay:
> "Recurring mode could still drift into full-history scans under deadline pressure."

Fix applied:
- Added explicit recurring-mode prohibition against unbounded scan expansion in `SKILL.md`.
- Added explicit policy line in `codex-source-policy.md`: recurring mode must not silently escalate to full-history scans.

Result:
- PASS on combined-pressure replay.

### Iteration 2

New loophole from GREEN replay:
> "Conflicting provenance could be interpreted silently if the operator message is ambiguous."

Fix applied:
- Added explicit hard rule in `SKILL.md`: do not silently guess first-run status; ask one short clarification question.

Result:
- PASS on bootstrap/conflict replay.

### Iteration 3

New loophole from GREEN replay:
> "`no match` and `no durable signal` were present in the rubric but not pressure-tested as standalone branches."

Fix applied:
- Added explicit RED/GREEN pressure scenarios for both branches in `references/pressure-scenarios.md`.
- Replayed both branches against the current skill contract and logged deterministic outcomes.

Result:
- PASS on branch-complete replay for `no match` and `no durable signal`.

## GREEN/REFACTOR Summary

- All documented pressure scenarios now have recorded outcomes.
- Final contract explicitly prevents:
 - silent bad merges
 - forced `no match` merges into unrelated files
 - writes from `no durable signal` candidates
 - unbounded recurring `.codex` scans
 - auto-edits to `critical-patterns.md`
 - silent first-run guessing
 - vague ambiguity prompts without candidate-specific options

## Final Outcome

- RED baseline artifacts created and preserved.
- GREEN replay completed with scenario-by-scenario results.
- REFACTOR iterations captured with concrete loophole fixes.

Created: 2026-03-26
Beads: br-13f, br-11w, br-3ec
Phase: RED -> GREEN -> REFACTOR
