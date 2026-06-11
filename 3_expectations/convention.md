# Convention Expectations

## Required Convention Definition

- Convention creation must capture a start date, end date, free-text location,
  organizer-provided timezone, one continuous daily open-hours window, and
  maximum attendance capacity.
- Timezone selection must use standard IANA timezone identifiers and present
  them through a selectable UI rather than free-text entry.
- Convention editing must preserve the same core convention definition fields
  after creation.

## Schedule Boundaries

- Convention time boundaries must use the organizer-provided timezone as the
  scheduling reference.
- Scheduling must be constrained by the convention start date, end date, and
  daily open-hours window.

## Capacity

- Event-level attendance capacity must be available as a source constraint for
  downstream participation behavior.

## Scope

- Convention creation must remain within the anti-goals in
  `1_intent/features/001-convention-creation.md` and the domain constraints in
  `2_context/domain.md`.
