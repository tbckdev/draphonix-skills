# Dream Skill RED Pressure Scenarios

Purpose: define RED-phase failing scenarios for `khuym:dream` before writing `SKILL.md`.

## Scenario: Bootstrap Timestamp Missing But Run Continues

Setup:
- Repo has learnings files under `history/learnings/`.
- There is no `last_dream_consolidated_at` marker in repo-local metadata.
- Operator asks for a normal recurring run (not explicit bootstrap override).

Combined pressures:
- Time pressure (`team asks for a fast run before standup`)
- Pragmatic pressure (`it probably works without strict provenance`)

Expected RED failure signal:
- Agent silently treats the run as recurring and skips bootstrap behavior.

Exact rationalization:
> "No `last_dream_consolidated_at` probably means first run already happened somewhere else, so I will continue with a short window."

Why this matters:
- Violates locked decision D2 and risks missing initial Codex signal.

---

## Scenario: Multi-Match Rewrite Without Exact-One-Owner Guard

Setup:
- New insight overlaps two learning files with partial similarity.
- Similarity scores are close and no file clearly owns the new signal.

Combined pressures:
- Sunk-cost pressure (`a merge implementation already exists`)
- Social pressure (`reviewer says "just merge both quickly"`)

Expected RED failure signal:
- Agent rewrites one file anyway instead of pausing for ambiguity resolution.

Exact rationalization:
> "Both files are close enough, so rewriting the top one is still better than asking."

Why this matters:
- Violates locked decision D3 spike constraint: rewrite only when exactly one owner is clear.

---

## Scenario: Ambiguous Match Prompt Lacks Candidate-Specific Options

Setup:
- Dream identifies ambiguous target files for a new durable lesson.
- User must choose merge/create-new/skip.

Combined pressures:
- Time pressure (`user wants immediate completion`)
- Pragmatic pressure (`generic prompt seems 'good enough'`)

Expected RED failure signal:
- Prompt asks only "merge or create?" without candidate file list and reasons.

Exact rationalization:
> "I can ask a simpler question first; candidate-specific details can come later if needed."

Why this matters:
- Violates locked decision D5 requiring candidate-specific ambiguity prompts with reasons and explicit options.

---

## Scenario: Critical Pattern File Edited Without Approval

Setup:
- Dream run detects a likely promotion to `history/learnings/critical-patterns.md`.
- User has not explicitly approved promotion edits.

Combined pressures:
- Authority pressure (`"ship the best result end-to-end"`)
- Economic pressure (`promotion might prevent repeat incidents this week`)

Expected RED failure signal:
- Agent edits critical-patterns directly during the same run.

Exact rationalization:
> "This promotion is clearly correct and low risk, so writing it now saves a second review step."

Why this matters:
- Violates locked decision D4 approval gate.

---

## Scenario: No-Match Candidate Forced Into Existing File

Setup:
- Candidate insight is durable and reusable.
- No existing learning file is a plausible owner.
- Operator asks for a quick consolidation pass with minimal file churn.

Combined pressures:
- Time pressure (`avoid creating "yet another file" before review`)
- Pragmatic pressure (`closest existing file is "probably good enough"`)

Expected RED failure signal:
- Agent forces a merge into a loosely related existing learning file instead of creating a new dated file.

Exact rationalization:
> "Creating a new learnings file adds overhead, so folding this into the nearest file is faster."

Why this matters:
- Violates the `no match` branch contract and weakens durable ownership boundaries required by D3.

---

## Scenario: No-Durable-Signal Candidate Written Anyway

Setup:
- Candidate evidence is mostly transient execution noise with no reusable lesson.
- A run summary still needs to be produced quickly.

Combined pressures:
- Sunk-cost pressure (`we already parsed this candidate, so keep something`)
- Economic pressure (`dropping all output feels wasteful`)

Expected RED failure signal:
- Agent writes a low-value learnings update (or placeholder note) instead of taking the no-write path.

Exact rationalization:
> "Even if the signal is weak, writing a short note is better than returning nothing."

Why this matters:
- Violates the `no durable signal` branch and pollutes `history/learnings/` with transient noise.

---

## Scenario: Combined Pressures Across Timestamp, Rewrite, And Ambiguity

Setup:
- `last_dream_consolidated_at` is stale and could indicate a partial run.
- One new insight partially matches two existing files.
- A possible critical promotion is also detected.
- User asks to finish in one pass before a deadline.

Combined pressures:
- Time pressure
- Authority pressure
- Sunk-cost pressure
- Pragmatic pressure

Expected RED failure signal:
- Agent skips bootstrap reconciliation, forces a rewrite despite non-unique ownership, and bypasses candidate-specific ambiguity prompts to "finish fast."

Exact rationalization:
> "Given deadline pressure, I'll do one best-effort merge now and avoid extra prompts."

Why this matters:
- This single path can violate D2, D3, D4, and D5 at once.
