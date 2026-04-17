---
name: xia
description: Use when the user asks to add, change, integrate, design, or evaluate a feature and the work should begin with research before implementation. Forces a repo-first discovery pass that detects the real stack from local artifacts, finds existing local functionality and extension points, checks relevant upstream GitHub repositories for reusable patterns, reviews the latest official documentation for the libraries and services involved, and produces a concise research brief before any coding starts. Skip only when the user explicitly says to bypass research.
metadata:
  dependencies: []
---

# Xia

Start feature work by proving what already exists before proposing or writing new code.

`xia` is a research-first skill for requests that would otherwise tempt the agent to jump straight into implementation. Its job is to reduce duplicate work, surface built-in capabilities early, and keep recommendations grounded in the actual repository instead of generic advice.

## HARD-GATE

Do not write code, edit files, or propose an implementation plan until the research brief is complete.

The only exception is when the user explicitly says to skip research or clearly asks for immediate implementation.

## Activate With A Repo-First Mindset

Do not assume the repository is a standard web app.

It may be:

- a plugin repo
- a skill repo
- an infrastructure repo
- a CLI/tooling repo
- a mixed monorepo with several runtimes

Treat the repository itself as the source of truth for what the system is and how it is supposed to evolve.

## Phase 1: Detect The Real Stack

Read the repo contract first when it exists:

- `AGENTS.md`
- `README.md`
- repo-local docs that explain architecture, workflows, or packaging

Then infer the actual stack from real artifacts such as:

- `package.json`, lockfiles, `tsconfig*`, workspace manifests
- `pyproject.toml`, `requirements*.txt`, `poetry.lock`
- `Cargo.toml`, `go.mod`, `Dockerfile*`, compose files
- plugin manifests, MCP config files, `.codex/`, `.agents/`, workflow files
- framework config files and entrypoints
- scripts, tests, and build commands that reveal how the repo really works

Build a short internal stack summary before moving on:

- primary languages and runtimes
- framework or platform clues
- packaging/plugin shape if relevant
- major tools and external services
- obvious verification commands

If versions are detectable from manifests or lockfiles, capture them now because later documentation research should prefer version-matched sources.

If exact versions are not detectable, say so in the brief instead of pretending they are known.

## Phase 2: Search The Local Repo Before Inventing Anything

Inspect the local repository for:

- existing functionality related to the requested feature
- conventions, helper utilities, and extension points
- similar workflows, components, routes, commands, or jobs
- prior implementations, experiments, tests, and docs

Use local inspection first. Prefer repository evidence over assumptions.

Useful targets include:

- feature-adjacent directories and modules
- tests that reveal supported behavior
- scripts and workflow definitions
- prior docs or ADR-style notes
- config and env validation that constrain the implementation

When available, use repo intelligence tools as accelerators, but do not let them replace reading the actual files.

The local search output should answer:

- what already exists
- what can be reused
- what extension points are available
- what is missing

## Phase 3: Research Upstream Patterns

Look outward only after the local picture is clear.

Use `deepwiki` to inspect relevant public GitHub repositories when you need to understand:

- how a repository is organized
- where similar functionality already lives upstream
- whether a capability already appears to exist
- which files or areas are the best pattern anchors

Use `deepwiki` as best-effort guidance, not as a hard dependency. If a repo is unavailable or not indexed there:

- fall back to direct GitHub-oriented research paths
- continue the investigation instead of blocking

Prefer upstream repositories that are actually relevant to the detected stack:

- the framework repo
- the library repo
- official starter repos
- closely related integration repos

Do not turn upstream research into generic inspiration hunting. The goal is to find reusable patterns, constraints, or proof that the feature already exists elsewhere.

## Phase 4: Research The Latest Official Documentation

Use `exa` to find current official documentation, release guidance, and implementation notes for the libraries, frameworks, and services involved.

Prefer official sources over blog posts or community summaries whenever possible.

When searching docs:

- bias toward official docs domains
- prefer version-matched docs when the repo reveals an exact version
- if exact version matching is not possible, state that clearly
- distinguish stable docs from beta/canary docs when that matters

This phase should answer:

- whether the framework or library already supports the requested capability
- the recommended current API or workflow
- version-specific caveats that matter for this repo
- any major incompatibilities or migration risks

## Phase 5: Produce The Research Brief

Before any implementation work, return a concise research brief using `references/research-brief-template.md`.

The brief must separate:

- what was found locally
- what was found upstream
- what came from official documentation
- what is only an inference

The brief must include:

- current repo stack summary
- feature understanding and assumptions
- existing local functionality already found
- relevant upstream patterns found in GitHub repositories
- latest documentation findings
- a recommendation
- risks, unknowns, and follow-up questions if needed

## Recommendation Ladder

Choose the lightest credible path in this order:

1. Reuse existing local functionality.
2. Adapt an upstream pattern that fits the repo.
3. Use built-in framework or library capabilities.
4. Build from scratch only when the other options are not sufficient.

If you recommend building from scratch, explain why reuse, adaptation, and built-in capabilities were not enough.

## Guardrails

- Do not guess the stack from folder names alone.
- Do not stop at docs if manifests, configs, scripts, or tests would refine the picture.
- Do not claim something is missing until the local repo search says it is missing.
- Do not treat `deepwiki` availability as required for progress.
- Do not use stale or version-mismatched docs without saying so.
- Do not blur local findings, upstream findings, docs findings, and inference together.
- Do not give generic advice that is not anchored to the detected stack.
- Do not start coding before the research brief unless the user explicitly waives research.

## Anti-Patterns

**"This looks familiar, I already know the stack."**
Read the actual repo artifacts anyway. Familiar-looking repos often hide important packaging, runtime, or plugin constraints.

**"I can build it faster from scratch than tracing existing code."**
Search the local repo first. Speed without reuse often creates duplicate abstractions and misses house conventions.

**"The local repo does not obviously contain it, so upstream research is optional."**
Check upstream patterns when the feature touches framework or library behavior. The capability may already exist outside the repo.

**"General docs are good enough."**
Prefer official, current, version-matched documentation whenever you can detect versions.

**"I will research while coding and summarize later."**
That violates the purpose of this skill. Finish the brief first.

## References

- `references/research-brief-template.md` - required brief structure before implementation
