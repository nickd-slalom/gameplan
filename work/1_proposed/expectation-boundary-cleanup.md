# Proposed Work

## Metadata

- Work Item: expectation-boundary-cleanup
- Owner: Codex
- Date: 2026-06-10
- Status: completed
- Completion Report: `work/2_completed/expectation-boundary-cleanup.md`

## Intent Reference

- `1_intent/product.md`
- `1_intent/features/001-convention-creation.md`

## Intent Delta (Optional)

Clarify artifact ownership so measurable success criteria live in
`3_expectations/`, while Intent remains focused on outcomes and Context remains
focused on system/domain reality.

## Relevant Context

- `2_context/idsd_methodology.md`: Expectations define success and acceptance;
  Context describes reality; Intent describes desired outcomes.
- `2_context/architecture.md`: Existing patterns and architecture risks describe
  system reality and should remain context unless converted into objective
  quality gates.
- `2_context/domain.md`: Domain constraints describe product boundaries and
  should remain context.
- `3_expectations/_engineering-template.md`,
  `3_expectations/_testing-template.md`,
  `3_expectations/_security-template.md`, and
  `3_expectations/_ux-template.md`: expectation template pattern to use for
  active expectation documents.

## Expectations

- `3_expectations/product.md`: product success criteria should live in
  expectations rather than durable intent.
- `3_expectations/convention.md`: convention creation acceptance criteria should
  live in expectations rather than feature intent.
- `3_expectations/engineering.md`: expectation docs should reduce ambiguity and
  avoid redundant artifact ownership.
- `3_expectations/testing.md`: validate by inspection that moved content no
  longer remains duplicated in Intent or Context.
- `3_expectations/security.md`: no security-sensitive behavior is involved.
- `3_expectations/ux.md`: user-facing quality criteria should be explicit when
  derived from product intent.

## Proposed Approach

1. Identify statements in `1_intent/` and `2_context/` that are objective
   success or quality criteria rather than outcomes, reality, constraints, or
   patterns.
2. Move qualifying criteria into active files under `3_expectations/`, using
   the existing expectation templates as the structure pattern.
3. Leave domain rules, architecture boundaries, and established implementation
   patterns in Context.
4. Update source artifacts so they reference the applicable expectation instead
   of duplicating the moved criteria.
5. Add a completion report and mark this proposal completed.

## Risks

- Moving too aggressively could strip useful domain context from Intent or
  Context. Mitigation: only move objective success/quality criteria and preserve
  outcome and constraint descriptions where they belong.
- Creating active expectation files could be confused with templates.
  Mitigation: keep underscore-prefixed templates unchanged and place concrete
  expectations in non-template files.

## Questions

- None. The user explicitly requested moving any misplaced expectation content.
