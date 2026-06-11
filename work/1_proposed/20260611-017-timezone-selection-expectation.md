# Proposed Work

## Metadata

- Work Item: Timezone Selection Expectation
- Owner: Product
- Date: 2026-06-11
- Status: completed
- Approval Evidence: User said "approved" on 2026-06-11.
- Completion Report:
  `work/2_completed/20260611-018-timezone-selection-expectation.md`

## Intent Reference

- `1_intent/features/001-convention-creation.md`

## Intent Delta (Optional)

Convention timezone selection should be constrained to standard IANA timezone
identifiers and presented through a selectable UI rather than free-text entry.

## Relevant Context

- `2_context/idsd_methodology.md`: expectation changes should be proposed from
  intent and context before implementation.
- `work/2_completed/20260610-014-convention-creation.md`: convention creation
  already exists and identified IANA timezone identifiers as a context update
  recommendation.
- `3_expectations/convention.md`: currently requires an organizer-provided
  timezone but does not specify the allowed identifier standard or input
  interaction.
- `3_expectations/ux.md`: already requires accessible form fields, keyboard
  operation, and programmatically associated labels and errors.

## Expectations

- `3_expectations/convention.md`: should be updated to define timezone
  selection as standard IANA identifiers exposed through a selectable UI.
- `3_expectations/ux.md`: existing accessibility and form interaction
  expectations continue to apply to the selectable timezone control.

## Proposed Approach

1. Update `3_expectations/convention.md` so required convention definition
   explicitly says timezone selection must use standard IANA timezone
   identifiers and must be presented through a selectable UI instead of
   free-text entry.
2. Leave `3_expectations/ux.md` unchanged for this narrow expectation update,
   because its existing accessibility and form-control requirements already
   cover selectable controls.
3. Create a completion report documenting the expectation update.
4. Mark this proposal completed and link the completion report after the
   expectation change is applied.

## Risks

- "All possible time zones" can be interpreted as every IANA identifier,
  including aliases and legacy names. Future implementation should decide
  whether the UI lists canonical zones only or the full available IANA set, and
  document that choice.
- A very large dropdown can be cumbersome. Future implementation may need
  search/filter behavior while still satisfying the selectable UI expectation.

## Questions

- None.

## Approval Gate

Leave `Status: proposed` until the human explicitly approves implementation.
Agents must not self-approve proposals. Record the human approval evidence in
Metadata before changing status to `approved` or beginning implementation.
