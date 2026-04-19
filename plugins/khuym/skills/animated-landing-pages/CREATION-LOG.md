# Creation Log: animated-landing-pages

## Source Material

Origin:

- user-provided deep-dive tutorial breakdown for building a premium animated landing page
- repo rules from `AGENTS.md`
- system skill guidance from `skill-creator`
- repo-local validation discipline from `writing-khuym-skills`
- existing repo examples from `plugins/khuym/skills/xia/CREATION-LOG.md`

What the source does:

- explains the end-to-end workflow for turning references into AI-generated landing-page assets and frontend code
- identifies concrete tools, prompts, ratios, and implementation tricks
- highlights durable techniques such as seamless looping, dark-mode inversion, scroll-tied playback, and split-video card composition

## Extraction Decisions

What to include:

- the workflow order from inspiration to implementation
- the durable prompts worth reusing
- rules for aspect ratio, dark video treatment, and asset hosting
- the split-video card trick as a repeatable performance pattern
- stack adaptation guidance so the skill does not force the tutorial's tech choices onto every repo

What to leave out:

- tutorial-specific brand names that are not part of the durable method
- claims about selling sites to clients
- filler narration and timestamps
- fragile UI details from third-party tools that are not needed to reproduce the workflow

## Structure Decisions

1. Keep `SKILL.md` short and procedural so trigger quality stays high.
2. Move the detailed walkthrough into `references/workflow.md`.
3. Split reusable prompt wording into `references/prompt-library.md`.
4. Add `references/pressure-scenarios.md` so the skill can be re-tested against its main failure modes.

## RED Phase: Manual Baseline

Fresh-thread subagent pressure testing was not authorized in this turn, so the failing baseline was documented manually from likely shortcut behavior.

Scenario coverage:

1. The agent blindly copies the tutorial stack into a repo with a different frontend system.
2. The agent hotlinks temporary generation URLs directly into production code because they already work.
3. The agent adds scroll-tied playback before the basic layout and autoplay loop are stable.
4. The agent reuses a wrong-ratio generated asset instead of regenerating media to fit the real layout slot.
5. The agent finishes the page with generic SaaS sections that do not match the motion language of the hero.

Exact rationalization targets:

1. "The tutorial already uses React and Tailwind, so I can just force that stack here."
2. "The CloudFront URL works now, so there is no need to re-host the asset."
3. "Scroll-tied playback is the interesting part, so I should implement that first."
4. "This video is close enough to the target ratio; CSS can hide the mismatch."
5. "The hero is what matters most, so the lower sections can just be standard marketing blocks."

## GREEN Phase

The skill was written to block those shortcuts by enforcing:

- repo-first stack detection
- aspect-ratio matching before animation
- stable asset hosting guidance
- scroll-tied playback as an enhancement, not the starting point
- layout inspiration that preserves the hero's visual language

Artifacts added:

- `SKILL.md`
- `references/workflow.md`
- `references/prompt-library.md`
- `references/pressure-scenarios.md`
- `agents/openai.yaml`

## REFACTOR Notes

Refinements applied while drafting:

1. Keep the frontmatter description trigger-only instead of turning it into a workflow summary.
2. Move prompt wording into a reference file to keep the main skill compact.
3. Make local-stack adaptation explicit so the skill does not accidentally teach stack replacement.
4. Promote production-hosting guidance into a hard rule because prototype shortcuts are too tempting otherwise.

## Validation Notes

Completed validation surface:

- `init_skill.py` scaffolded the folder and `agents/openai.yaml`
- `quick_validate.py` passed on the final folder
- repo-local Markdown link checks passed
- repo-local sync dry-run confirmed the new skill is linkable through the normal packaging flow

Residual follow-up:

- forward-testing in fresh threads remains desirable for this skill because it governs behavior under stylistic and implementation pressure
- that step was not executed in this turn because subagent delegation was not explicitly authorized
