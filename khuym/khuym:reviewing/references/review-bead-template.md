# Review Bead Template

Use this template when the reviewing skill turns a review issue into a bead.

Per-finding markdown files are retired. The bead is now the primary review artifact.

---

## Bead Creation Rules

### Severity Mapping

| Review Severity | Bead Priority | Linkage | Blocking |
|-----------------|---------------|---------|----------|
| `P1` | `1` | Current review / epic-close path | Yes |
| `P2` | `2` | `external_ref=<source-epic-id>` + review labels | No |
| `P3` | `3` | `external_ref=<source-epic-id>` + review labels | No |

### Labels

Always include:

- `review`
- `review-p1` or `review-p2` or `review-p3`
- source reviewer label such as `code-quality`, `architecture`, `security`, `test-coverage`

Optional:

- `known-pattern`
- `breaking-change`
- `migration-risk`
- `needs-human-review`

### Title Pattern

```
Resolve Review P1: <problem title>
Resolve Review P2: <problem title>
Resolve Review P3: <problem title>
```

The title should describe the problem, not just the file name.

---

## Description Template

Put the full review detail directly in the bead description:

````markdown
## Problem Statement

[2-4 sentences. What is the issue, why does it matter, and what could go wrong if not fixed.]

## Evidence

**File:** `path/to/file`
**Line(s):** 10-20

```language
<relevant snippet>
```

**Why this is a problem:**
[one sentence connecting the evidence to the issue]

## Proposed Solutions

### Option A — [Recommended] <label>
**Pros:** ...
**Cons:** ...
**Effort:** Small | Medium | Large

### Option B — <label>
**Pros:** ...
**Cons:** ...
**Effort:** Small | Medium | Large

## Acceptance Criteria

- [ ] [specific, testable condition 1]
- [ ] [specific, testable condition 2]
````

If the learnings-synthesizer identifies a known pattern, append a note block to the bead:

```markdown
> KNOWN PATTERN: Matches YYYYMMDD-<slug>.md
> Previous occurrence: <path or short note>
> Past resolution: <one sentence>
```

---

## Example Commands

### P1 Blocking Review Bead

```bash
br create "Resolve Review P1: Missing auth check on route" \
  -t task \
  -p 1 \
  --parent <epic-id> \
  -l review,review-p1,security \
  -d "<full review bead body>"
```

### P2 / P3 Non-Blocking Follow-Up Bead

```bash
br create "Resolve Review P2: Tighten rate limit coverage" \
  -t task \
  -p 2 \
  --external-ref <epic-id> \
  -l review,review-p2,security \
  -d "<full review bead body>"
```

Do **not** use `--parent <epic-id>` for `P2` / `P3` review follow-up beads. That would make them part of the current epic-close path and violate the non-blocking contract.
