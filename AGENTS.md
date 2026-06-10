# Agent Operating Model

This repository follows the Intent → Context → Expectations methodology.

Never begin with implementation.

Always perform work in this sequence:

1. Understand Intent
2. Gather Context
3. Identify Expectations
4. Propose Approach
5. Await approval if uncertainty exists
6. Implement
7. Validate against Expectations
8. Update Context if new knowledge was discovered

## Priority Order

When conflicts exist:

Expectations > Context > Intent

Reason:
Intent explains desired outcomes.
Context explains reality.
Expectations define acceptance.

## Work Artifacts

All work items are tracked as files under `work/`.

### Lifecycle

```
work/1_proposed/<item>.md   →   work/2_completed/<item>.md
```

**Step 1 — Propose** (`work/1_proposed/`)

Create a proposal file before any implementation begins. Use the template at `work/1_proposed/feature-x.md`. The file must capture:

- Intent reviewed (reference `1_intent/`)
- Relevant context (reference `2_context/`)
- Expectations that apply (reference `3_expectations/`)
- Proposed approach
- Risks and open questions

An agent must not begin implementation until a proposal file exists and has been approved.

**Step 2 — Complete** (`work/2_completed/`)

When implementation is finished, create a completion report in `work/2_completed/` using the template at `work/2_completed/feature-x.md`. The file must capture:

- Outcome delivered
- Expectations validation (pass/partial/fail per `3_expectations/` category)
- Discoveries made during implementation
- Recommended updates to `2_context/`
- Follow-up work identified

Recommended context updates must be applied to the relevant files in `2_context/` before the work item is considered closed.

## Required Deliverables

Before significant implementation:

- proposal file in `work/1_proposed/`
- problem summary
- discovered constraints
- implementation approach
- risks

After implementation:

- completion report in `work/2_completed/`
- expectation validation
- discovered knowledge
- recommended context updates applied to `2_context/`

## Agent Behavior

Do not:

- invent requirements
- invent business rules
- create architecture without checking context
- introduce frameworks without justification

Always:

- search existing patterns first
- reuse established approaches
- explain deviations
- document discoveries
