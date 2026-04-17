# Creation Log: xia

## Source Material

Origin:

- User objective for a reusable research-first feature skill
- Repo rules from `AGENTS.md`, `README.md`, and `CONTRIBUTING.md`
- Skill creation rules from the system `skill-creator`
- Pressure-testing guidance from `plugins/khuym/skills/writing-khuym-skills/SKILL.md`
- Repo-scout and memory tooling guidance from the local repo contract
- Archived session snippets retrieved with `cass` for research-first briefs and official-doc emphasis

What the source does:

- Defines a repo-first workflow that inspects the real stack before implementation
- Prioritizes local reuse, upstream pattern adaptation, and official docs over reinvention
- Requires a research brief before coding

## Extraction Decisions

What to include:

- Repo-first stack detection from real artifacts, not guessed framework defaults
- Mandatory local search before proposing new code
- Best-effort upstream GitHub research through `deepwiki`, with explicit fallback when unavailable
- Official-doc research through `exa`, with a version-matching rule when versions are detectable
- A brief template that separates local findings, upstream findings, docs findings, and inference
- A recommendation ladder that prefers reuse over greenfield implementation

What to leave out:

- Implementation-specific tool syntax beyond what the current tool surface already guarantees
- Framework-specific examples that would bias the skill toward web apps
- Long theory about why research matters

## Structure Decisions

1. Kept `SKILL.md` short and procedural so the trigger stays strong and the runtime context stays lean.
2. Moved the report shape into `references/research-brief-template.md` so the output contract is reusable without bloating the main skill.
3. Kept `deepwiki` and `exa` guidance in the main skill because they are core workflow pivots, not optional details.

## RED Phase: Manual Baseline

Forward-testing with subagents was not authorized in this turn, so this baseline is a manual pressure pass derived from:

- the user’s explicit failure mode for this skill
- archived session patterns emphasizing research briefs and official documentation
- common agent shortcuts observed while creating or refining skills in this repo

Scenario coverage:

1. Repo looks like a familiar framework, so the agent guesses the stack from names alone.
2. Local search feels slower than writing new code, so the agent skips reuse discovery.
3. The feature seems absent locally, so the agent invents a design without checking upstream repos.
4. The agent uses general web results instead of current official docs.
5. The agent starts coding and promises to summarize research later.

Exact rationalization targets:

1. "This repo looks standard enough that I can infer the stack without reading the manifests first."
2. "Tracing existing code will take longer than just building the feature cleanly from scratch."
3. "If the repo does not already have it, upstream research probably will not change the implementation much."
4. "The latest general docs are close enough; exact versions probably do not matter here."
5. "I can start implementing now and fold the research into the explanation afterward."

## GREEN Phase

The skill was written to directly counter the baseline shortcuts by enforcing:

- repo-first artifact inspection
- mandatory local reuse search
- upstream pattern checks before invention
- official-doc preference with version matching when possible
- a hard gate that blocks implementation until the brief is complete

Fresh-thread validation was completed on 2026-04-17 with three isolated subagent passes using only `$xia` plus the skill path.

### Scenario Outcomes (GREEN)

1. Scenario: Web-app repo with enterprise auth request
- Target repo: `/Users/themrb/Documents/personal/ai20k/ai20k-demo`
- Prompt shape: add organization-level SSO to the app, but research first
- Result: PASS
- Why: the agent inspected the actual Next.js/Clerk stack, found existing local Clerk integration, checked upstream Clerk patterns, checked official Clerk/Next.js docs, and recommended built-in Organizations + Enterprise SSO instead of custom SAML/OIDC work.

2. Scenario: Plugin/skills repo with maintainer tooling request
- Target repo: `/Users/themrb/Documents/personal/skills`
- Prompt shape: add a visual dependency health report for Khuym skills
- Result: PASS
- Why: the agent treated the repo as a plugin/skills repo rather than a web app, reused the existing dependency-health engine, checked upstream summary/visualization patterns, checked official GitHub/Mermaid docs, and recommended reuse plus built-in rendering rather than a new system.

3. Scenario: Mixed CLI + infra monorepo with deploy-preview request
- Target repo: `/Users/themrb/Documents/personal/kuckit`
- Prompt shape: preview infra changes and rollout impact before deployment
- Result: PASS
- Why: the agent mapped the Bun/Turbo/CLI/Pulumi stack from real artifacts, found local preview/report seams, checked Pulumi upstream patterns plus official Pulumi/Cloud Run docs, and recommended composing existing capabilities instead of inventing a new deployment engine.

## REFACTOR Notes

Refinements applied during drafting:

1. Removed generic "when to use" narrative from the body and kept the trigger load in the frontmatter.
2. Tightened the hard gate so "research while coding" is explicitly disallowed.
3. Added a dedicated evidence-boundary section to the brief template so the output distinguishes local facts, upstream facts, docs facts, and inference.
4. Clarified that `deepwiki` is best-effort and must not block progress.

## Validation Notes

Completed validation surface:

- `quick_validate.py` for frontmatter and naming
- markdown link checks for the new files
- sync dry-runs for repo packaging
- fresh-thread forward-testing with three realistic prompts across different repo shapes

Observed result:

- No agent jumped into implementation before the brief.
- No agent guessed the repo shape from naming alone.
- All three agents produced recommendation paths that preferred reuse or built-in capability over greenfield design.

Residual follow-up:

- One pass returned a slightly process-aware phrase about being interrupted while wrapping up. This did not break the research-brief contract, but if that style shows up repeatedly in later tests, tighten the skill to prefer user-facing conclusions only.

## Second Pass: April 2026 Hardening

This follow-up pass focused on making the skill harder to misread and easier to validate under pressure.

Changes added in this pass:

1. Tightened the frontmatter description so it stays trigger-only instead of summarizing the workflow.
2. Added a "Start Here" sequence to make the required research order explicit before the phased workflow begins.
3. Promoted repo-shape classification and version verification into first-class requirements so agents do not guess the environment from memory or naming.
4. Added a tool-routing section that clarifies the role split between local repo evidence, `deepwiki`, `exa`, and synthesis.
5. Added an evidence-discipline contract that forces explicit `Local`, `Upstream`, `Docs`, and `Inference` boundaries in the output.
6. Added an escalation rule for the narrow case where two viable paths differ materially and one question is justified.
7. Added a durable `references/pressure-scenarios.md` file so future RED/GREEN runs can test the exact shortcuts this skill is supposed to prevent.
8. Expanded the research brief template to require an evidence ledger, source pack, confidence, and a rejected-alternatives explanation.

Why these were worth adding:

- The first version already established the right research order, but it still left too much room for agents to blur evidence sources or skip directly from "I searched" to "here is the plan."
- The tightened trigger line follows `khuym:writing-khuym-skills` more closely and reduces the risk that agents treat the description as a workflow substitute.
- The new pressure scenarios make the skill easier to re-test when it drifts, especially around stack-guessing, local-search skipping, docs mismatch handling, and research-while-coding shortcuts.
