# Proposed Work Template

## Metadata

- Work Item: Unknowns Resolution Skill
- Owner: Product
- Date: 2026-06-10
- Status: completed
- Completion Report: `work/2_completed/unknowns-resolution-skill.md`

## Intent Reference

- `1_intent/features/001-convention-creation.md`

## Intent Delta (Optional)

Create a reusable agent skill that helps resolve unknowns in an intent or
feature document by asking focused questions, capturing the user's answers, and
updating the feature description so the resolved unknowns are incorporated into
the durable intent artifact.

## Relevant Context

- `2_context/idsd_methodology.md`: ICE separates Intent, Context, and
  Expectations, and agents must discover unknowns before proposing solutions.
- `1_intent/features/001-convention-creation.md`: current feature intent
  includes an `Unknowns` section that should be resolvable through this skill.
- No repository-local skills currently exist.

## Expectations

- `3_expectations/engineering.md`: maintain consistency with existing patterns
  and avoid unnecessary complexity.
- `3_expectations/testing.md`: validate the generated skill structure and
  behavior through file inspection because this is documentation/workflow
  content rather than executable product code.
- `3_expectations/security.md`: do not introduce secret handling or external
  integrations.

## Proposed Approach

1. Add a repository-local skill under a conventional skills directory, using a
   concise `SKILL.md` with clear trigger metadata.
2. Define a workflow for agents to inspect a target intent or feature document,
   identify unknowns, ask only necessary clarifying questions, and apply answers
   back into the feature description.
3. Require the skill to remove or replace resolved unknowns and avoid inventing
   business rules when user answers are incomplete.
4. Add minimal agent-facing metadata only if the local skill layout supports it.
5. Validate that the skill is discoverable by structure and that instructions
   are consistent with the ICE process.

## Risks

- The repository has no existing local skill convention, so the directory choice
  must use a standard Codex-compatible layout.
- If answers remain incomplete, the skill must preserve unresolved unknowns
  instead of pretending they are resolved.
- Updating intent artifacts can blur durable outcome descriptions with execution
  status, so the skill must prohibit proposal/completion lifecycle content from
  being added to `1_intent/`.

## Questions

- Does this proposal have approval to proceed with implementation?
