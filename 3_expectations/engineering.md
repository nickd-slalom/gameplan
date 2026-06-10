# Engineering Expectations

## Maintainability

- Preserve the component boundaries defined in `2_context/architecture.md`,
  especially server-authoritative enforcement of business-critical rules in
  Django.
- Preserve stable API response contracts when evolving React-to-Django
  integration points. Use compatibility shims when needed to reduce client
  breakage.

## Simplicity

- Avoid adding architecture or framework complexity unless existing context
  shows a concrete need.

## Consistency

- Reuse the repository's established React, Django, PostgreSQL, migration, and
  repository-local skill patterns before introducing a new approach.
- Apply migrations for schema evolution; avoid manual database drift.

## Observability

- For latency-sensitive data paths, monitor query behavior closely enough to
  identify poor indexing before it becomes a user-facing regression.

## Performance

- Add targeted PostgreSQL indexes when query plans or expected growth indicate
  latency risk.
- Move expensive or long-running work out of synchronous Django request paths
  when it would degrade responsiveness.

## Operational Readiness

- Keep asynchronous work behind Django-managed background processing or another
  context-approved adapter boundary.
