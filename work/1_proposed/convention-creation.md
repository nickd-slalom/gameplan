# Proposed Work

## Metadata

- Work Item: Convention Creation
- Owner: Product
- Date: 2026-06-10
- Status: approved
- Approval Evidence: User said "proposal is approved" on 2026-06-10 and
  directed implementation to begin with approach step 1.
- Completion Report: `work/2_completed/convention-creation.md` when status is completed

## Intent Reference

- `1_intent/features/001-convention-creation.md`

## Intent Delta (Optional)

None.

## Relevant Context

- `2_context/idsd_methodology.md`: work must proceed from Intent to Context to
  Expectations, with proposal approval before non-trivial implementation.
- `2_context/architecture.md`: the intended product architecture is React,
  Django, and PostgreSQL, with Django as the source of truth for domain rules
  and database access.
- `2_context/domain.md`: a convention is the event container that defines
  scheduling boundaries and attendance limits; initial convention modeling
  includes one free-text location and one continuous daily open-hours window.
- Repository inspection: no React, Django, PostgreSQL, backend, frontend, or
  application source tree exists yet. Implementing feature 001 therefore also
  requires creating the initial application scaffold.

## Expectations

- `3_expectations/convention.md`: convention creation must capture start date,
  end date, free-text location, organizer-provided timezone, one continuous
  daily open-hours window, and maximum attendance capacity; editing must
  preserve those fields.
- `3_expectations/engineering.md`: preserve server-authoritative validation in
  Django, reuse established patterns where present, apply migrations for schema
  evolution, and avoid unnecessary architecture complexity.
- `3_expectations/testing.md`: API contract changes require contract or
  integration coverage; schema changes require migration review and validation.
- `3_expectations/security.md`: do not add secrets, credentials, or tokens.
  Authentication and authorization requirements are not yet specified.
- `3_expectations/ux.md`: organizer setup must be clear, use consistent domain
  language, provide responsive client-side validation, and comply with WCAG 2.2
  Level AA expectations for form labels, errors, keyboard access, and accessible
  names.
- `3_expectations/product.md`: for this slice, persisting convention boundaries
  and making event-level capacity queryable downstream satisfies the
  scheduling-confidence and host-preparedness expectations. Enforcement of
  scheduling conflicts, double-booking prevention, and committed player count
  workflows belongs to later scheduling and participation features.

## Proposed Approach

1. Create a minimal repository application baseline aligned to
   `2_context/architecture.md`:
   - Django backend under `backend/`
   - React frontend under `frontend/`
   - local development configuration that does not require checked-in secrets
2. Add a Django `Convention` domain model with fields for:
   - name
   - start date
   - end date
   - location
   - timezone
   - daily open time
   - daily close time
   - maximum attendance capacity
3. Add database migration constraints for the core invariants:
   - end date is not before start date
   - daily close time is after daily open time
   - maximum attendance capacity is positive
4. Add Django API endpoints for listing, creating, retrieving, and updating
   conventions. Keep validation server-authoritative and return stable JSON
   error shapes suitable for the React client.
5. Add focused backend tests for model validation, API create/update behavior,
   and invalid boundary cases.
6. Add a React organizer UI for convention creation and editing:
   - convention list or entry screen
   - create form
   - edit form for existing records
   - accessible labels and programmatically associated validation errors
   - client-side validation that mirrors but does not replace backend rules
7. Add frontend tests for create/edit form behavior and validation feedback if
   the selected scaffold includes a test runner.
8. Validate by running backend tests, frontend tests, migration checks, and a
   local smoke test where feasible.
9. Create the completion report, update this proposal to `completed`, and
   apply any discovered context updates to `2_context/`.

## Risks

- The repository currently lacks executable application code, so this feature
  includes foundational scaffold work that is larger than a typical feature
  slice.
- Authentication and authorization are unspecified. The implementation should
  not invent organizer identity or permission rules; initial endpoints should
  be clearly scoped as pre-auth/product-foundation behavior until security
  expectations are defined.
- PostgreSQL is the target architecture, but local validation may use SQLite if
  no PostgreSQL service or dependency configuration exists yet. Any deviation
  must be documented in the completion report and context updates.
- Introducing React and Django dependency files may require package downloads in
  the local environment.
- Timezone selection should use standard IANA timezone identifiers; the exact
  allowed list can come from Django/Python `zoneinfo` rather than a custom
  business list.

## Questions

- None for approach step 1.
