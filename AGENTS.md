# Agent Operating Model

This repository follows the Intent → Context → Expectations (ICE)
methodology, as defined in
[`2_context/idsd_methodology.md`](2_context/idsd_methodology.md). Read that
document before beginning any work.

Never begin with implementation.

Always perform work in this sequence:

1. Understand Intent
2. Gather Context
3. Identify Expectations
4. Propose Approach
5. Await human approval
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

Intent documents under `1_intent/` are durable outcome references.
They are not execution lifecycle trackers and must not duplicate proposal or
completion status.

### Lifecycle

```text
work/1_proposed/<item>.md   →   work/2_completed/<item>.md
```

Completed work remains visible from its proposal file. When a work item is
completed, keep the proposal in `work/1_proposed/`, update its status to
`completed`, and add a link to the corresponding completion report. Do not
duplicate outcome, validation, discovery, or follow-up details in the proposal;
those belong in `work/2_completed/`.

**Step 1 — Propose** (`work/1_proposed/`)

Create a proposal file before any implementation begins. Use the template at
`work/1_proposed/_proposed_feature-template.md`. The file must capture:

- Intent reference (link to `1_intent/` source of truth)
- Intent delta (only what is specific to this work item, if needed)
- Relevant context (reference `2_context/`)
- Expectations that apply (reference `3_expectations/`)
- Proposed approach
- Risks and open questions

An agent must not begin implementation until a proposal file exists and has
been approved.

Approval is a mandatory human-in-the-loop gate for all non-trivial repository
changes. Agents may create or update a proposal file, but must stop after
proposal creation with `Status: proposed` until the human explicitly approves
implementation in the conversation or an existing approval record is present.

Agents must not self-approve proposals. Do not set `Status: approved`, begin
implementation, or create completion artifacts until human approval has been
received. When approval is received, record the approval evidence in the
proposal before implementing.

**Step 2 — Complete** (`work/2_completed/`)

When implementation is finished, create a completion report in
`work/2_completed/` using the template at
`work/2_completed/_completed_feature-template.md`. The file must capture:

- Outcome delivered
- Expectations validation (pass/partial/fail per `3_expectations/` category)
- Discoveries made during implementation
- Recommended updates to `2_context/`
- Follow-up work identified

Recommended context updates must be applied to the relevant files in
`2_context/` before the work item is considered closed. The corresponding
proposal in `work/1_proposed/` must also be marked `completed` and linked to
the completion report.

## Required Deliverables

Before significant implementation:

- proposal file in `work/1_proposed/`
- intent reference
- discovered constraints
- implementation approach
- risks

After implementation:

- completion report in `work/2_completed/`
- proposal status updated to `completed`
- completion report link added to the proposal file
- expectation validation
- discovered knowledge
- recommended context updates applied to `2_context/`

## Agent Behavior

## Template Retention Rule

Template files are durable reference artifacts and must remain in the
repository.

Do not:

- delete template files
- rename template files in a way that breaks discoverability

Always:

- keep existing templates available for reference
- supersede templates by adding a new version rather than removing prior ones
- mark older templates as deprecated when needed, but retain them in-repo

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
