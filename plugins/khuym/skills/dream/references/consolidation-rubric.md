# Dream Consolidation Rubric

Use this rubric to classify each candidate signal as `clear match`, `ambiguous`, `no match`, or
`no durable signal`.

## 1) Clear Match

Choose `clear match` only when all are true:
- Exactly one existing learning file owns the same durable lesson.
- The candidate strengthens or corrects that lesson without changing domain scope.
- No competing target file has similar ownership strength.

Action:
- Merge/rewrite that one owner file.
- Keep durable guidance and remove contradicted details.
- Update `last_dream_consolidated_at` in frontmatter.

## 2) Ambiguous

Choose `ambiguous` when any are true:
- Two or more candidate learnings files have plausible ownership.
- The best target file cannot be justified confidently.
- The lesson overlaps adjacent domains and ownership is unclear.

Action:
- Show candidate learnings files and reasons.
- Offer plain-chat labeled choices:
 - `merge -> <target file>`
 - `merge -> <target file>` for each plausible target file
 - `create new`
 - `skip`
- Wait for user choice before writing.

## 3) No Match

Choose `no match` when no existing file is a good owner and the signal is durable.

Action:
- Create a new dated learnings file.
- Add durable synthesis only.
- Set `last_dream_consolidated_at` in frontmatter.

## 4) No Durable Signal

Choose `no durable signal` when the candidate is transient, noisy, or not reusable.

Examples:
- Temporary command output without reusable lesson
- One-off failure details with no general prevention rule
- Ephemeral environment state not expected to recur

Action:
- Skip write for this candidate.

## Exact-One-Owner Rewrite Rule

Rewrite existing content only when exactly one owner is clear. If more than one target file is
plausible, treat as ambiguous and require user choice.
