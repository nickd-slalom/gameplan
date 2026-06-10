# Proposed Work

## Metadata

- Work Item: human-approval-gate-rule
- Owner: Codex
- Date: 2026-06-10
- Status: completed
- Approval Evidence: user replied "approved" after proposal creation
- Completion Report: `work/2_completed/human-approval-gate-rule.md`

## Intent Reference

- `1_intent/product.md`

## Intent Delta (Optional)

Ensure the repository workflow cannot skip the human approval gate between
proposal creation and implementation.

## Relevant Context

- `AGENTS.md`: states that an agent must not begin implementation until a
  proposal file exists and has been approved.
- `2_context/idsd_methodology.md`: requires agents to form a proposed approach,
  surface risks and assumptions, and only then begin implementation.
- `work/1_proposed/_proposed_feature-template.md`: currently allows statuses
  including `approved`, but does not explain who may set that status or what
  evidence is required.

## Expectations

- `3_expectations/engineering.md`: workflow rules should reduce ambiguity,
  preserve artifact ownership, and avoid unnecessary structure.
- `3_expectations/testing.md`: validate documentation changes by direct
  inspection.
- `3_expectations/security.md`: no security-sensitive behavior is involved.

## Proposed Approach

1. Update `AGENTS.md` to make the human approval gate mandatory for all
   non-trivial implementation work.
2. Clarify that agents may create or update the proposal file, but must stop
   after proposal creation with `Status: proposed` unless the human explicitly
   approves implementation.
3. Define that agents must not self-mark a proposal as `approved`; approval must
   be evidenced by a human response in the conversation or an existing explicit
   approval record.
4. Update `2_context/idsd_methodology.md` with the same approval-gate rule so
   the context primer matches the operating instructions.
5. Update the proposal template to distinguish `proposed` from `approved` and
   require an approval evidence line before implementation begins.
6. Create a completion report after the rule update and mark this proposal
   completed.

## Risks

- The rule could add friction for very small documentation or inspection tasks.
  Mitigation: scope the gate to implementation work and non-trivial repository
  changes, while allowing proposal creation itself.
- The rule could be missed if it exists in only one artifact. Mitigation: apply
  it to both `AGENTS.md` and the methodology context, and make the proposal
  template carry approval evidence explicitly.

## Questions

- Do you approve implementing this proposed rule update?
