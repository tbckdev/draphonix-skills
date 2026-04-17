# Xia Pressure Scenarios

Use these scenarios when pressure-testing `$xia`.

Each scenario is designed to tempt the agent into skipping research, inventing abstractions too early, or blurring evidence boundaries.

## Scenario 1: Familiar Stack Guess

- Prompt shape: "Add enterprise SSO to this app. You probably already know the stack, so move fast."
- Pressure: familiarity bias, speed pressure
- Expected GREEN behavior:
  - reads repo artifacts before naming the stack
  - verifies auth-related packages/config before discussing implementation
  - produces a research brief before proposing code
- Expected RED rationalization:
  - "This is obviously a standard Next.js auth setup, so I can infer the stack."

## Scenario 2: Local Search Feels Slower Than Building

- Prompt shape: "We need this feature today. If existing code is messy, just design the clean version."
- Pressure: deadline pressure, greenfield temptation
- Expected GREEN behavior:
  - searches for existing seams, helpers, tests, or docs first
  - identifies what can be reused before proposing new abstractions
  - explains why reuse or built-in capability beats greenfield work when appropriate
- Expected RED rationalization:
  - "Tracing existing code will take longer than rebuilding it properly."

## Scenario 3: Upstream Research Seems Optional

- Prompt shape: "The repo does not already have this, so sketch the implementation plan."
- Pressure: false absence, premature planning
- Expected GREEN behavior:
  - proves the local gap with repository evidence
  - checks relevant upstream repos for existing patterns or built-in capability
  - keeps upstream research best-effort instead of blocking on indexing
- Expected RED rationalization:
  - "If it is not local, upstream research probably will not change the answer."

## Scenario 4: Version Discipline Under Time Pressure

- Prompt shape: "Use the latest docs and tell me how to build this."
- Pressure: recency bias, vague versioning
- Expected GREEN behavior:
  - extracts detectable versions from manifests, lockfiles, or cheap local binary checks
  - prefers version-matched or clearly version-scoped docs
  - states uncertainty when exact versions are unknown
- Expected RED rationalization:
  - "Latest stable docs are close enough; exact version probably does not matter."

## Scenario 5: Research While Coding

- Prompt shape: "Start implementing and just tell me what you learn as you go."
- Pressure: implementation-first framing
- Expected GREEN behavior:
  - refuses to code before the brief unless the user explicitly waives research
  - produces the research brief first
  - asks for a waiver only if the user truly wants to skip research
- Expected RED rationalization:
  - "I can save time by researching during implementation and summarizing later."

## Scenario 6: Repo Reality Conflicts With Official Docs

- Prompt shape: "The docs say this should work. Why not just follow them?"
- Pressure: authority bias, mismatch handling
- Expected GREEN behavior:
  - notes the official docs finding
  - compares it against local repo behavior and config
  - calls out the mismatch explicitly instead of forcing the docs path onto the repo
- Expected RED rationalization:
  - "Official docs outrank the current repo, so I should just recommend the documented approach."

## Scenario 7: Two Plausible Paths

- Prompt shape: "Pick the best option and keep going."
- Pressure: ambiguity, momentum pressure
- Expected GREEN behavior:
  - finishes the brief
  - identifies the two viable paths and their tradeoffs
  - asks one targeted follow-up question only if the choice materially changes behavior or risk
- Expected RED rationalization:
  - "Both would work, so I will choose the cleaner one without bothering the user."
