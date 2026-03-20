# Planning Workflow Examples

## Example 1: New Feature - Billing Module with Stripe

### User Request

"Add a billing module with Stripe integration for subscription management"

---

### Phase 1: Discovery

**Parallel Sub-agents launched:**

```
Task("Explore packages/domain and packages/application structure for entity/usecase patterns")
Task("Search for existing payment or subscription code")
Task("Check package.json for existing Stripe or payment deps")
```

**Librarian query:**

```
librarian("How does a typical TypeScript project structure Stripe integration with Clean Architecture?")
```

**Exa query:**

```
mcp__exa__get_code_context_exa("Stripe Node.js SDK subscription checkout session")
```

**Discovery Report Output:**

```markdown
# Discovery Report: Billing Module

## Architecture Snapshot

- Entity pattern: see `packages/domain/src/entities/user.ts`
- Port pattern: see `packages/domain/src/ports/user-repository.ts`
- Use case pattern: see `packages/application/src/usecases/create-user.ts`
- Router pattern: see `packages/api/src/routers/users.ts`

## Existing Patterns

- No existing billing/payment code
- User entity can be referenced for customer mapping
- Existing validation utilities in `packages/domain/src/validation/`

## Technical Constraints

- Node 20, Bun runtime
- Drizzle ORM
- oRPC for API
- No Stripe SDK currently installed

## External References

- Stripe SDK: `stripe` npm package
- Webhooks: Need raw body for signature verification
- Checkout Sessions: Server-side creation, client redirect
```

---

### Phase 2: Synthesis (Oracle)

```
oracle(
  task: "Analyze billing feature requirements against codebase",
  files: ["history/billing/discovery.md"]
)
```

**Oracle Output:**

```markdown
# Approach: Billing Module

## Gap Analysis

| Component       | Have           | Need                        | Gap             |
| --------------- | -------------- | --------------------------- | --------------- |
| Customer entity | None           | Subscription, Plan entities | New             |
| Stripe SDK      | None           | stripe package              | Install + spike |
| Webhooks        | Express exists | Raw body middleware         | Modify          |
| UI              | None           | Billing page, checkout      | New             |

## Risk Map

| Component          | Risk | Verification        |
| ------------------ | ---- | ------------------- |
| Stripe SDK import  | HIGH | Spike               |
| Webhook signatures | HIGH | Spike               |
| Entity modeling    | LOW  | Follow User pattern |
| oRPC router        | LOW  | Follow existing     |

## Spike Requirements

1. Spike: Stripe SDK import and typing
2. Spike: Webhook signature verification
3. Spike: Checkout session flow
```

---

### Phase 3: Verification (Spikes)

**Create Spike Beads:**

```bash
br create "Spike: Billing Integration" -t epic -p 0
# → br-50

br create "Spike: Test Stripe SDK import and typing" -t task --blocks br-50
# → br-51

br create "Spike: Verify webhook signature handling" -t task --blocks br-50
# → br-52

br create "Spike: Checkout session creation flow" -t task --blocks br-50
# → br-53
```

**Execute via MULTI_AGENT_WORKFLOW:**

```bash
bv --robot-plan  # Assigns spikes to parallel tracks
```

Workers execute, write to `.spikes/billing/`:

```
.spikes/billing/
├── stripe-sdk-test/
│   ├── index.ts        # Working import
│   └── learnings.md
├── webhook-test/
│   ├── handler.ts      # Signature verification
│   └── learnings.md
└── checkout-test/
    ├── session.ts      # Checkout session
    └── learnings.md
```

**Close spikes with learnings:**

```bash
br close br-51 --reason "YES: SDK imports cleanly. Use Stripe namespace for types."
br close br-52 --reason "YES: Need raw body. Use stripe.webhooks.constructEvent()"
br close br-53 --reason "YES: Create session server-side, redirect to session.url"
```

---

### Phase 4: Decomposition

**Load file-beads skill and create main plan:**

```bash
br create "Epic: Billing Module" -t epic -p 1
# → br-60

# Domain layer (no deps, can parallelize)
br create "Create Subscription entity and SubscriptionRepository port" -t task --blocks br-60
# → br-61

br create "Create Plan entity" -t task --blocks br-60
# → br-62

# Infrastructure (depends on domain)
br create "Implement SubscriptionRepository with Drizzle" -t task --blocks br-60 --deps br-61
# → br-63

br create "Create Drizzle schema for subscriptions and plans" -t task --blocks br-60 --deps br-61,br-62
# → br-64

# Application layer
br create "Implement CreateSubscription use case" -t task --blocks br-60 --deps br-63
# → br-65

br create "Implement CancelSubscription use case" -t task --blocks br-60 --deps br-63
# → br-66

# Stripe integration (HIGH risk - has spike learnings)
br create "Implement Stripe checkout session creation" -t task --blocks br-60 --deps br-65
# → br-67  ← Embed learnings from br-53

br create "Implement Stripe webhook handler" -t task --blocks br-60 --deps br-63
# → br-68  ← Embed learnings from br-52

# API layer
br create "Create billing oRPC router" -t task --blocks br-60 --deps br-65,br-66,br-67
# → br-69

# UI layer
br create "Create billing page with plan selection" -t task --blocks br-60 --deps br-69
# → br-70

br create "Implement checkout flow UI" -t task --blocks br-60 --deps br-69,br-70
# → br-71
```

**Example bead with embedded learnings (br-68):**

```markdown
# Implement Stripe webhook handler

## Context

Handles Stripe webhook events for subscription lifecycle.

## Learnings from Spike br-52

> - MUST use raw body (not parsed JSON) for signature verification
> - Use `stripe.webhooks.constructEvent(rawBody, sig, secret)`
> - Webhook secret from `STRIPE_WEBHOOK_SECRET` env var
> - Handle: checkout.session.completed, invoice.paid, customer.subscription.deleted
>
> Reference: `.spikes/billing/webhook-test/handler.ts`

## Requirements

- Webhook endpoint at `/api/webhooks/stripe`
- Signature verification before processing
- Idempotent event handling

## Acceptance Criteria

- [ ] Raw body middleware configured
- [ ] Signature verification implemented
- [ ] Events update subscription status correctly
- [ ] Passes `bun run check-types`
```

---

### Phase 5: Validation

```bash
bv --robot-suggest   # Check for missing deps
bv --robot-insights  # Find bottlenecks
bv --robot-priority  # Validate priorities
```

**Oracle final review:**

```
oracle(
  task: "Review billing plan for completeness",
  files: [".beads/br-60.md", ".beads/br-61.md", ...]
)
```

---

## Example 2: Simple Feature - Add User Avatar

### User Request

"Add avatar upload for user profiles"

---

### Phase 1: Discovery (Lightweight)

Single agent sufficient:

```
Task("Find existing user entity and profile update patterns")
```

**Findings:**

- User entity at `packages/domain/src/entities/user.ts`
- Update use case at `packages/application/src/usecases/update-user.ts`
- No existing file upload, but S3 utility exists

---

### Phase 2: Synthesis

**Risk Assessment:**

| Component                | Risk                           |
| ------------------------ | ------------------------------ |
| Add avatar field to User | LOW                            |
| File upload to S3        | MEDIUM (variation of existing) |
| Image resize             | MEDIUM (new but standard)      |

No HIGH risk → Skip spike phase.

---

### Phase 3: Verification (Skipped)

All MEDIUM or LOW → Proceed directly to decomposition.

---

### Phase 4: Decomposition

```bash
br create "Epic: User Avatar" -t epic -p 2
br create "Add avatarUrl field to User entity" -t task --blocks br-80
br create "Add avatar upload endpoint with S3" -t task --blocks br-80 --deps br-81
br create "Add avatar display to profile UI" -t task --blocks br-80 --deps br-82
```

Small, low-risk feature → 3 beads, no spikes, linear dependency.

---

## Decision Tree: When to Spike

```
Is this pattern in the codebase?
├── YES → LOW risk, no spike
└── NO →
    New external dependency?
    ├── YES → HIGH risk, SPIKE REQUIRED
    └── NO →
        Affects >5 files?
        ├── YES → HIGH risk, SPIKE REQUIRED
        └── NO → MEDIUM risk, interface sketch only
```
