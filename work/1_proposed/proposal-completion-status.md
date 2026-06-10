# Proposed Work

## Metadata

- Work Item: Proposal Completion Status
- Owner: Product
- Date: 2026-06-10
- Status: completed
- Completion Report: `work/2_completed/proposal-completion-status.md`

## Intent Reference

- `1_intent/product.md`

## Intent Delta (Optional)

Make completed work visible from its proposal file without duplicating the
completion report or moving the proposal out of `work/1_proposed/`.

## Relevant Context

- `AGENTS.md`: defines the repository workflow and required work artifacts.
- `2_context/idsd_methodology.md`: defines work proposals and completion
  reports as lifecycle records.
- `work/1_proposed/_proposed_feature-template.md`: defines proposal metadata
  and currently limits statuses to draft, proposed, and approved.
- `work/2_completed/_completed_feature-template.md`: completion reports already
  link back to the source proposal.

## Expectations

- `3_expectations/engineering.md`: maintain consistency with existing workflow
  patterns and avoid unnecessary structure.
- `3_expectations/testing.md`: validate documentation changes by inspection.
- `3_expectations/security.md`: no security-sensitive behavior is involved.

## Proposed Approach

1. Extend proposal metadata to allow `completed`.
2. Require completed proposal files to include a completion report reference.
3. Update repository workflow rules and methodology context so future agents
   preserve the convention.
4. Mark existing completed proposals accordingly.

## Risks

- Proposal files could start duplicating completion report content; the workflow
  should explicitly limit them to status and link metadata.
- Existing completed work needs a small metadata update to remain consistent.

## Questions

- None. The user selected option 1 and requested the workflow rules update.
