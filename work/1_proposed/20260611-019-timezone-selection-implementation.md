# Proposed Work

## Metadata

- Work Item: Timezone Selection Implementation
- Owner: Product
- Date: 2026-06-11
- Status: completed
- Approval Evidence: User said "approved" on 2026-06-11.
- Completion Report:
  `work/2_completed/20260611-020-timezone-selection-implementation.md`

## Intent Reference

- `1_intent/features/001-convention-creation.md`

## Intent Delta (Optional)

Implement the updated convention expectation that timezone selection must use
standard IANA timezone identifiers and present them through a selectable UI
rather than free-text entry.

## Relevant Context

- `2_context/idsd_methodology.md`: non-trivial implementation requires a
  proposal and human approval before implementation begins.
- `2_context/architecture.md`: React owns UI state and responsive client-side
  validation, while Django remains the source of truth for domain validation and
  API behavior.
- `2_context/domain.md`: convention timezone values must be valid IANA timezone
  identifiers.
- `work/2_completed/20260610-014-convention-creation.md`: convention creation
  and editing already exist across Django APIs and React UI.
- `work/2_completed/20260611-018-timezone-selection-expectation.md`: convention
  expectations were updated to require IANA timezone identifiers through a
  selectable UI.
- Current backend inspection: `backend/conventions/models.py` already validates
  `Convention.timezone` through Python `zoneinfo.ZoneInfo`.
- Current frontend inspection: `frontend/src/App.tsx` uses a text input with a
  `datalist`, which suggests values but still allows free-text entry.

## Expectations

- `3_expectations/convention.md`: timezone selection must use standard IANA
  timezone identifiers and present them through a selectable UI rather than
  free-text entry.
- `3_expectations/engineering.md`: preserve Django server-authoritative
  validation, stable API evolution, existing React/Django boundaries, and avoid
  unnecessary framework complexity.
- `3_expectations/testing.md`: API contract changes require contract or
  integration coverage; executable behavior changes require focused regression
  coverage.
- `3_expectations/security.md`: do not add secrets, credentials, or tokens.
- `3_expectations/ux.md`: selectable timezone control must remain accessible,
  keyboard-operable, labelled, and associated with validation errors.

## Proposed Approach

1. Add a Django API endpoint that returns the available IANA timezone
   identifiers from Python `zoneinfo.available_timezones()`, sorted
   deterministically.
2. Route the endpoint under the existing conventions API surface so the React
   client can use the same configured API base URL and fetch pattern.
3. Keep `Convention.timezone` persisted as the existing string field and keep
   model/form validation server-authoritative through `ZoneInfo`; no schema
   migration should be required.
4. Update the React app to fetch timezone options from the backend and render a
   true selectable control for timezone entry instead of the current text input
   plus `datalist`.
5. Preserve create and edit behavior:
   - New conventions should default to a valid IANA timezone.
   - Existing conventions should show their saved timezone selected.
   - Submitted payloads should continue to send the selected timezone string.
6. Add resilient client behavior for timezone option loading:
   - Provide a minimal local fallback list only if the options request fails,
     so the form remains usable during local/API failures.
   - Surface a non-blocking status message if timezone options cannot be loaded.
7. Update backend tests to cover the timezone-options endpoint and existing
   invalid timezone rejection.
8. Update frontend tests to verify timezone is selected through the selectable
   control, create payloads include the selected timezone, and edit mode
   preserves the saved timezone.
9. Validate with backend tests, frontend tests, and migration drift check.
10. Create the completion report, mark this proposal completed, and apply any
    context updates discovered during implementation.

## Risks

- `zoneinfo.available_timezones()` may include aliases or legacy names
  depending on the installed timezone data. This proposal treats the runtime
  available IANA set as the source of truth unless Product narrows the
  expectation to canonical identifiers only.
- A native `<select>` containing the full timezone list may be long. It
  satisfies the selectable UI expectation, but future UX work may choose a
  searchable combobox if the native control proves cumbersome.
- Frontend tests may need to mock `fetch` for both convention data and timezone
  options, increasing test setup complexity.
- Local backend validation may require `DJANGO_DEBUG=true` or
  `DJANGO_SECRET_KEY`, per existing architecture context.

## Questions

- None.

## Approval Gate

Leave `Status: proposed` until the human explicitly approves implementation.
Agents must not self-approve proposals. Record the human approval evidence in
Metadata before changing status to `approved` or beginning implementation.
