# Proposed Work

## Metadata

- Work Item: api-hardening-and-idiomatic-cleanup
- Owner: Codex
- Date: 2026-06-10
- Status: completed
- Approval Evidence: User said "make those 5 suggested changes" on 2026-06-10.
- Completion Report: `work/2_completed/api-hardening-and-idiomatic-cleanup.md`

## Intent Reference

- `1_intent/product.md`
- `1_intent/features/001-convention-creation.md`

## Intent Delta (Optional)

- Harden convention API request handling and production configuration.
- Improve API code idiomaticity and concision without reducing readability.

## Relevant Context

- `2_context/idsd_methodology.md`: proposal + approval before implementation.
- `2_context/architecture.md`: server-authoritative validation in Django and stable API contracts.
- `2_context/domain.md`: convention boundary and capacity fields are core domain constraints.

## Expectations

- `3_expectations/engineering.md`: maintain server-authoritative rules, avoid unnecessary complexity, preserve stable contracts.
- `3_expectations/testing.md`: add focused regression coverage for bug-fix behavior.
- `3_expectations/security.md`: avoid insecure defaults and avoid introducing repository secrets.

## Proposed Approach

1. Replace manual field parsing/validation in API write paths with Django `ModelForm` validation to reduce custom parsing logic while keeping error shape stable.
2. Harden JSON body parsing to return 400 for invalid UTF-8 and malformed JSON.
3. Tighten integer handling for capacity so non-integer numeric inputs (for example floats) are rejected.
4. Add offset/limit pagination to convention collection responses with bounds and safe defaults.
5. Require explicit `DJANGO_SECRET_KEY` when `DJANGO_DEBUG` is false, while retaining local dev fallback when debug is true.
6. Add tests for UTF-8 decoding failures, strict integer behavior, and pagination behavior.

## Risks

- Error message text may differ slightly under `ModelForm` validation.
- Pagination parameters add behavior surface; invalid values must fail clearly.

## Questions

- None.
